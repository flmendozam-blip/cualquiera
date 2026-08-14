import { useEffect, useMemo, useState } from 'react';
import { useAppState } from '../store/AppState';
import {
  fetchScheduledEvents,
  fetchTeamEvents,
  fetchTeamCornersCardsAverage,
  fetchH2H,
  fetchEventReferee,
  computeRecentForm,
  computeRestDays,
  tournamentLabel,
  isLiveStatus,
  dateKey,
  SofaScoreError,
  type SofaEvent,
} from '../lib/sofascore';
import { guessCompetition } from '../lib/oddsApi';
import { cn, fmtDateTime } from '../lib/format';
import type { Team } from '../types';

const round1 = (n: number) => Math.round(n * 10) / 10;

function quickDates(): { label: string; date: string }[] {
  const today = new Date();
  return [0, 1, 2].map((offset) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offset);
    return { label: offset === 0 ? 'Hoy' : offset === 1 ? 'Mañana' : dateKey(d).slice(5), date: dateKey(d) };
  });
}

export function FixtureBrowser() {
  const { teams, h2h, ensureTeam, updateTeam, addH2HMatch, ensureReferee, addMatch, matches } = useAppState();
  const [open, setOpen] = useState(true);
  const [date, setDate] = useState(() => dateKey(new Date()));
  const [query, setQuery] = useState('');
  const [events, setEvents] = useState<SofaEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState<Set<number>>(new Set());
  const [added, setAdded] = useState<Set<number>>(new Set());

  const alreadyAdded = new Set(matches.map((m) => m.sofascoreEventId).filter((x): x is number => x != null));

  async function load(d: string) {
    setDate(d);
    setLoading(true);
    setError('');
    try {
      const evs = await fetchScheduledEvents(d);
      setEvents(evs.filter((e) => e.status?.type !== 'finished'));
    } catch (e) {
      setError(e instanceof SofaScoreError ? e.message : 'No se pudieron cargar los partidos de SofaScore.');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }

  // Al abrir la app, carga automáticamente los partidos de hoy — sin que el usuario tenga que elegir nada primero.
  useEffect(() => {
    load(dateKey(new Date()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? events.filter(
          (e) =>
            e.homeTeam.name.toLowerCase().includes(q) ||
            e.awayTeam.name.toLowerCase().includes(q) ||
            tournamentLabel(e).toLowerCase().includes(q)
        )
      : events;
    const map = new Map<string, SofaEvent[]>();
    for (const ev of filtered) {
      const key = tournamentLabel(ev);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(ev);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [events, query]);

  async function handleAnalyze(ev: SofaEvent) {
    setProcessing((prev) => new Set(prev).add(ev.id));
    try {
      const matchDate = new Date(ev.startTimestamp * 1000).toISOString().slice(0, 10);
      const league = tournamentLabel(ev);
      const homeId = ensureTeam(ev.homeTeam.id, ev.homeTeam.name, ev.homeTeam.shortName ?? ev.homeTeam.name, league, '');
      const awayId = ensureTeam(ev.awayTeam.id, ev.awayTeam.name, ev.awayTeam.shortName ?? ev.awayTeam.name, league, '');

      const [homeEvents, awayEvents, h2hMeetings, refInfo] = await Promise.all([
        fetchTeamEvents(ev.homeTeam.id),
        fetchTeamEvents(ev.awayTeam.id),
        fetchH2H(ev.id),
        fetchEventReferee(ev.id),
      ]);

      const homeForm = computeRecentForm(homeEvents, ev.homeTeam.id, 5);
      const awayForm = computeRecentForm(awayEvents, ev.awayTeam.id, 5);
      const homeRest = computeRestDays(homeEvents, matchDate);
      const awayRest = computeRestDays(awayEvents, matchDate);
      const [homeStats, awayStats] = await Promise.all([
        fetchTeamCornersCardsAverage(ev.homeTeam.id, homeEvents, 5),
        fetchTeamCornersCardsAverage(ev.awayTeam.id, awayEvents, 5),
      ]);

      const homePatch: Partial<Team> = {};
      const awayPatch: Partial<Team> = {};
      if (homeForm) Object.assign(homePatch, { form: homeForm.form, attack: round1(homeForm.avgGoalsFor), defense: round1(homeForm.avgGoalsAgainst), formSource: 'sofascore' });
      if (awayForm) Object.assign(awayPatch, { form: awayForm.form, attack: round1(awayForm.avgGoalsFor), defense: round1(awayForm.avgGoalsAgainst), formSource: 'sofascore' });
      if (homeRest != null) homePatch.restDays = homeRest;
      if (awayRest != null) awayPatch.restDays = awayRest;
      if (homeStats) Object.assign(homePatch, { cornersFor: round1(homeStats.avgCornersFor), cornersAgainst: round1(homeStats.avgCornersAgainst), avgCardsFor: round1(homeStats.avgCardsFor) });
      if (awayStats) Object.assign(awayPatch, { cornersFor: round1(awayStats.avgCornersFor), cornersAgainst: round1(awayStats.avgCornersAgainst), avgCardsFor: round1(awayStats.avgCardsFor) });
      if (Object.keys(homePatch).length > 0) updateTeam(homeId, homePatch);
      if (Object.keys(awayPatch).length > 0) updateTeam(awayId, awayPatch);

      for (const meeting of h2hMeetings) {
        const already = h2h.some(
          (r) => r.date === meeting.date && ((r.teamAId === homeId && r.teamBId === awayId) || (r.teamAId === awayId && r.teamBId === homeId))
        );
        if (already) continue;
        addH2HMatch({
          teamAId: homeId,
          teamBId: awayId,
          date: meeting.date,
          homeTeamId: meeting.homeTeamId === ev.homeTeam.id ? homeId : awayId,
          scoreHome: meeting.scoreHome,
          scoreAway: meeting.scoreAway,
          competition: meeting.competition,
        });
      }

      const refereeId = refInfo?.name ? ensureReferee(refInfo.name) : undefined;
      const competition = guessCompetition(league);

      addMatch(homeId, awayId, matchDate, competition, { refereeId, sofascoreEventId: ev.id });
      setAdded((prev) => new Set(prev).add(ev.id));
    } catch {
      // best-effort: si algo falla a mitad de camino, no bloqueamos el resto de la lista.
    } finally {
      setProcessing((prev) => {
        const next = new Set(prev);
        next.delete(ev.id);
        return next;
      });
    }
  }

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden">
      <button onClick={() => setOpen((v) => !v)} className="w-full flex items-center justify-between px-5 py-4 text-left">
        <span className="text-white font-semibold">🌍 Explorar partidos reales (SofaScore)</span>
        <span className="text-slate-400 text-sm">{open ? 'Ocultar' : 'Mostrar'}</span>
      </button>

      {open && (
        <div className="px-5 pb-5 flex flex-col gap-4">
          <p className="text-sm text-slate-300">
            Lista partidos reales de cualquier competición y equipo (no solo los conocidos) para la fecha elegida, usando
            datos abiertos de SofaScore. Al pulsar "Analizar" se trae la forma reciente real, descanso, córners, tarjetas,
            historial H2H y el árbitro asignado cuando están disponibles — es una API no oficial, así que algunos datos
            pueden faltar; en ese caso el análisis usa promedios neutros que puedes editar a mano.
          </p>

          <div className="flex flex-wrap items-center gap-2">
            {quickDates().map((q) => (
              <button
                key={q.date}
                onClick={() => load(q.date)}
                className={cn(
                  'text-xs rounded-full px-3 py-1.5 border',
                  date === q.date ? 'bg-pitch-900/50 border-pitch-600 text-pitch-400' : 'bg-slate-800 border-slate-700 text-slate-400'
                )}
              >
                {q.label}
              </button>
            ))}
            <input
              type="date"
              value={date}
              onChange={(e) => load(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-sm text-slate-100"
            />
            <input
              type="text"
              placeholder="Filtrar por equipo o competición…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 min-w-[180px] bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-100"
            />
            {!loading && (
              <button onClick={() => load(date)} className="bg-pitch-600 hover:bg-pitch-500 text-white text-sm font-semibold px-4 py-1.5 rounded-lg">
                {error ? 'Reintentar' : 'Actualizar'}
              </button>
            )}
          </div>

          {loading && <p className="text-sm text-slate-400">Cargando partidos…</p>}
          {error && <p className="text-sm text-rose-400">{error}</p>}

          {grouped.length > 0 && (
            <div className="flex flex-col gap-4 max-h-[520px] overflow-y-auto pr-1">
              {grouped.map(([league, evs]) => (
                <div key={league}>
                  <p className="text-xs font-semibold text-slate-400 mb-1.5">{league}</p>
                  <ul className="flex flex-col gap-1.5">
                    {evs.map((ev) => {
                      const live = isLiveStatus(ev);
                      const isProcessing = processing.has(ev.id);
                      const isAdded = added.has(ev.id) || alreadyAdded.has(ev.id);
                      return (
                        <li key={ev.id} className="bg-slate-800/40 border border-slate-800 rounded-xl px-3 py-2 flex items-center justify-between gap-3 flex-wrap">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={cn('text-[10px] rounded-full px-2 py-0.5 shrink-0', live ? 'bg-rose-900/50 text-rose-400' : 'bg-slate-700 text-slate-300')}>
                              {live ? '🔴 En vivo' : fmtDateTime(new Date(ev.startTimestamp * 1000).toISOString())}
                            </span>
                            <span className="text-sm text-slate-100 truncate">
                              {ev.homeTeam.name} {live && ev.homeScore?.current != null ? `${ev.homeScore.current}-${ev.awayScore?.current}` : 'vs'} {ev.awayTeam.name}
                            </span>
                          </div>
                          <button
                            onClick={() => handleAnalyze(ev)}
                            disabled={isProcessing || isAdded}
                            className={cn(
                              'text-xs font-medium rounded-lg px-3 py-1.5 shrink-0',
                              isAdded ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 hover:bg-white text-slate-900 disabled:opacity-50'
                            )}
                          >
                            {isAdded ? '✓ Agregado' : isProcessing ? 'Analizando…' : '+ Analizar'}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {!loading && !error && events.length > 0 && grouped.length === 0 && (
            <p className="text-sm text-slate-500">Ningún partido coincide con el filtro.</p>
          )}

          {teams.length > 0 && (
            <p className="text-[11px] text-slate-600">
              {teams.filter((t) => t.formSource === 'sofascore').length} equipo(s) con datos reales de SofaScore cargados esta sesión.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
