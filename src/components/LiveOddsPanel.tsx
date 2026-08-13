import { useState } from 'react';
import { useAppState } from '../store/AppState';
import {
  fetchSports,
  fetchOdds,
  pickBookmaker,
  h2hPrices,
  guessCompetition,
  OddsApiError,
  type OddsSport,
  type OddsEvent,
} from '../lib/oddsApi';
import { matchTeam } from '../lib/teamMatch';
import { cn, fmtOdds, fmtDateTime } from '../lib/format';

const REGIONS = [
  { key: 'eu', label: 'Europa (incluye Betano)' },
  { key: 'uk', label: 'Reino Unido' },
  { key: 'us', label: 'Estados Unidos' },
  { key: 'au', label: 'Australia' },
];

export function LiveOddsPanel() {
  const { teams, oddsApiKey, setOddsApiKey, addMatch, matches } = useAppState();
  const [open, setOpen] = useState(!oddsApiKey);
  const [keyInput, setKeyInput] = useState('');

  const [sports, setSports] = useState<OddsSport[]>([]);
  const [loadingSports, setLoadingSports] = useState(false);
  const [sportsError, setSportsError] = useState('');

  const [selectedSport, setSelectedSport] = useState('');
  const [regions, setRegions] = useState<string[]>(['eu']);

  const [events, setEvents] = useState<OddsEvent[]>([]);
  const [loadingOdds, setLoadingOdds] = useState(false);
  const [oddsError, setOddsError] = useState('');
  const [remaining, setRemaining] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const alreadyInMatches = new Set(matches.map((m) => `${m.homeTeamId}|${m.awayTeamId}|${m.date}`));

  async function loadSports() {
    setLoadingSports(true);
    setSportsError('');
    try {
      const { data } = await fetchSports(oddsApiKey);
      setSports(data.filter((s) => s.group === 'Soccer' && s.active));
    } catch (e) {
      setSportsError(e instanceof OddsApiError ? e.message : 'No se pudieron cargar las ligas.');
    } finally {
      setLoadingSports(false);
    }
  }

  async function loadFixtures() {
    if (!selectedSport || regions.length === 0) return;
    setLoadingOdds(true);
    setOddsError('');
    try {
      const { data, remaining: rem } = await fetchOdds(oddsApiKey, selectedSport, regions.join(','));
      setEvents(data);
      setRemaining(rem);
    } catch (e) {
      setOddsError(e instanceof OddsApiError ? e.message : 'No se pudieron cargar los partidos.');
      setEvents([]);
    } finally {
      setLoadingOdds(false);
    }
  }

  function toggleRegion(key: string) {
    setRegions((prev) => (prev.includes(key) ? prev.filter((r) => r !== key) : [...prev, key]));
  }

  function handleAnalyze(ev: OddsEvent) {
    const home = matchTeam(ev.home_team, teams);
    const away = matchTeam(ev.away_team, teams);
    if (!home || !away) return;
    const { bm, isBetano } = pickBookmaker(ev.bookmakers);
    const prices = h2hPrices(bm, ev.home_team, ev.away_team);
    const isLive = new Date(ev.commence_time).getTime() <= Date.now();
    const competition = guessCompetition(ev.sport_title);
    const date = ev.commence_time.slice(0, 10);
    addMatch(
      home.id,
      away.id,
      date,
      competition,
      prices && bm
        ? { ...prices, bookmaker: bm.title, isBetano, isLive, fetchedAt: new Date().toISOString() }
        : undefined
    );
    setAddedIds((prev) => new Set(prev).add(ev.id));
  }

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden">
      <button onClick={() => setOpen((v) => !v)} className="w-full flex items-center justify-between px-5 py-4 text-left">
        <span className="text-white font-semibold">
          🔌 Cuotas reales (Betano y otras casas) — opcional {oddsApiKey && <span className="text-pitch-400 text-xs">· conectado</span>}
        </span>
        <span className="text-slate-400 text-sm">{open ? 'Ocultar' : 'Mostrar'}</span>
      </button>

      {open && (
        <div className="px-5 pb-5 flex flex-col gap-4">
          {!oddsApiKey ? (
            <div className="bg-slate-800/50 rounded-xl p-4 flex flex-col gap-3 text-sm">
              <p className="text-slate-300">
                No hacemos scraping de Betano: conectamos con <span className="text-slate-100 font-medium">The Odds API</span>,
                un proveedor independiente que agrega cuotas reales de casas de apuestas (incluida Betano cuando está
                disponible en tu región) por un canal oficial. Crea una cuenta gratuita en{' '}
                <span className="text-slate-100 font-medium">the-odds-api.com</span> (plan free: 500 solicitudes/mes),
                copia tu API key y pégala aquí. Se guarda solo en este navegador.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="password"
                  placeholder="Tu API key de The Odds API"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-pitch-500"
                />
                <button
                  disabled={!keyInput.trim()}
                  onClick={() => setOddsApiKey(keyInput.trim())}
                  className="bg-pitch-600 hover:bg-pitch-500 disabled:opacity-40 disabled:hover:bg-pitch-600 text-white font-semibold px-4 py-2 rounded-lg"
                >
                  Guardar API key
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="text-pitch-400">API key conectada ✓</span>
                <div className="flex items-center gap-3">
                  {remaining && <span className="text-slate-500 text-xs">Solicitudes restantes: {remaining}</span>}
                  <button onClick={() => setOddsApiKey('')} className="text-slate-400 hover:text-rose-400 text-xs">
                    Cambiar API key
                  </button>
                </div>
              </div>

              {sports.length === 0 ? (
                <div>
                  <button
                    onClick={loadSports}
                    disabled={loadingSports}
                    className="bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg"
                  >
                    {loadingSports ? 'Cargando ligas…' : 'Cargar ligas disponibles'}
                  </button>
                  {sportsError && <p className="text-rose-400 text-sm mt-2">{sportsError}</p>}
                </div>
              ) : (
                <>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <label className="flex flex-col gap-1 text-sm">
                      <span className="text-slate-300 font-medium">Liga / competición</span>
                      <select
                        value={selectedSport}
                        onChange={(e) => setSelectedSport(e.target.value)}
                        className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
                      >
                        <option value="">Selecciona…</option>
                        {sports.map((s) => (
                          <option key={s.key} value={s.key}>
                            {s.title}
                          </option>
                        ))}
                      </select>
                    </label>
                    <div className="flex flex-col gap-1 text-sm">
                      <span className="text-slate-300 font-medium">Regiones de casas de apuestas</span>
                      <div className="flex flex-wrap gap-2">
                        {REGIONS.map((r) => (
                          <button
                            key={r.key}
                            type="button"
                            onClick={() => toggleRegion(r.key)}
                            className={cn(
                              'text-xs rounded-full px-3 py-1.5 border',
                              regions.includes(r.key)
                                ? 'bg-pitch-900/50 border-pitch-600 text-pitch-400'
                                : 'bg-slate-800 border-slate-700 text-slate-400'
                            )}
                          >
                            {r.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={loadFixtures}
                    disabled={!selectedSport || loadingOdds}
                    className="self-start bg-pitch-600 hover:bg-pitch-500 disabled:opacity-40 text-white font-semibold px-4 py-2 rounded-lg text-sm"
                  >
                    {loadingOdds ? 'Buscando…' : 'Buscar partidos (consume 1 solicitud)'}
                  </button>
                  {oddsError && <p className="text-rose-400 text-sm">{oddsError}</p>}

                  {events.length > 0 && (
                    <ul className="flex flex-col gap-2">
                      {events.map((ev) => {
                        const { bm, isBetano } = pickBookmaker(ev.bookmakers);
                        const prices = h2hPrices(bm, ev.home_team, ev.away_team);
                        const isLive = new Date(ev.commence_time).getTime() <= Date.now();
                        const home = matchTeam(ev.home_team, teams);
                        const away = matchTeam(ev.away_team, teams);
                        const canAnalyze = Boolean(home && away);
                        const dupKey = home && away ? `${home.id}|${away.id}|${ev.commence_time.slice(0, 10)}` : '';
                        const already = addedIds.has(ev.id) || (dupKey && alreadyInMatches.has(dupKey));

                        return (
                          <li key={ev.id} className="bg-slate-800/40 border border-slate-800 rounded-xl p-3 flex flex-col gap-2">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <div>
                                <span className={cn('text-[10px] rounded-full px-2 py-0.5 mr-2', isLive ? 'bg-rose-900/50 text-rose-400' : 'bg-slate-700 text-slate-300')}>
                                  {isLive ? '🔴 En vivo' : '📅 Próximo'}
                                </span>
                                <span className="text-xs text-slate-500">{fmtDateTime(ev.commence_time)}</span>
                              </div>
                              <span className="text-sm text-white font-medium">
                                {ev.home_team} vs {ev.away_team}
                              </span>
                            </div>
                            {prices && bm ? (
                              <div className="flex items-center justify-between gap-3 text-sm">
                                <div className="flex gap-3">
                                  <span className="text-slate-400">1: <span className="text-slate-100 font-semibold">{fmtOdds(prices.home)}</span></span>
                                  <span className="text-slate-400">X: <span className="text-slate-100 font-semibold">{fmtOdds(prices.draw)}</span></span>
                                  <span className="text-slate-400">2: <span className="text-slate-100 font-semibold">{fmtOdds(prices.away)}</span></span>
                                </div>
                                <span className={cn('text-[10px] rounded-full px-2 py-0.5', isBetano ? 'bg-pitch-900/50 text-pitch-400' : 'bg-slate-700 text-slate-400')}>
                                  {isBetano ? 'Betano' : `${bm.title} (Betano no disponible aquí)`}
                                </span>
                              </div>
                            ) : (
                              <p className="text-xs text-slate-500">Sin cuotas 1X2 disponibles para este partido todavía.</p>
                            )}
                            <button
                              onClick={() => handleAnalyze(ev)}
                              disabled={!canAnalyze || Boolean(already)}
                              title={!canAnalyze ? 'Alguno de los equipos no está en nuestra base de datos todavía' : undefined}
                              className={cn(
                                'self-start text-sm font-medium rounded-lg px-3 py-1.5',
                                already
                                  ? 'bg-slate-700 text-slate-400'
                                  : canAnalyze
                                  ? 'bg-slate-100 text-slate-900 hover:bg-white'
                                  : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                              )}
                            >
                              {already ? '✓ Agregado' : canAnalyze ? '+ Analizar este partido' : 'Equipo no disponible en nuestra base'}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
