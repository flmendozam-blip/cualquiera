import { useState } from 'react';
import { useAppState } from '../store/AppState';
import { resolveTeamId, findFixture, fetchVenueStats, ApiFootballError } from '../lib/apiFootball';
import type { MatchEntry, Team } from '../types';

export function MatchStatsFetcher({ match, home, away }: { match: MatchEntry; home: Team; away: Team }) {
  const { apiFootballKey, setApiFootballKey, updateTeam, ensureReferee, setMatchReferee } = useAppState();
  const [keyInput, setKeyInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  async function run() {
    setLoading(true);
    setError('');
    try {
      const homeApiId = home.apiFootballTeamId ?? (await resolveTeamId(apiFootballKey, home.name));
      const awayApiId = away.apiFootballTeamId ?? (await resolveTeamId(apiFootballKey, away.name));
      if (!homeApiId || !awayApiId) {
        throw new ApiFootballError('No se encontró alguno de los dos equipos en API-Football.');
      }
      if (!home.apiFootballTeamId) updateTeam(home.id, { apiFootballTeamId: homeApiId });
      if (!away.apiFootballTeamId) updateTeam(away.id, { apiFootballTeamId: awayApiId });

      const [fixture, homeVenue, awayVenue] = await Promise.all([
        findFixture(apiFootballKey, homeApiId, match.date).catch(() => null),
        fetchVenueStats(apiFootballKey, homeApiId, 'home').catch(() => null),
        fetchVenueStats(apiFootballKey, awayApiId, 'away').catch(() => null),
      ]);

      if (homeVenue) {
        updateTeam(home.id, {
          venueSplit: { ...home.venueSplit, home: { matches: homeVenue.matches, cornersFor: homeVenue.cornersFor, cornersAgainst: home.cornersAgainst, shotsOnTargetFor: homeVenue.shotsOnTargetFor } },
        });
      }
      if (awayVenue) {
        updateTeam(away.id, {
          venueSplit: { ...away.venueSplit, away: { matches: awayVenue.matches, cornersFor: awayVenue.cornersFor, cornersAgainst: away.cornersAgainst, shotsOnTargetFor: awayVenue.shotsOnTargetFor } },
        });
      }
      if (fixture?.referee) {
        const refId = ensureReferee(fixture.referee);
        setMatchReferee(match.id, refId);
      }
      if (!homeVenue && !awayVenue && !fixture?.referee) {
        throw new ApiFootballError('No se encontraron datos para este partido en API-Football (puede que el fixture no esté cargado todavía).');
      }
      setDone(true);
    } catch (e) {
      setError(e instanceof ApiFootballError ? e.message : 'No se pudo completar la consulta a API-Football.');
    } finally {
      setLoading(false);
    }
  }

  if (!apiFootballKey) {
    return (
      <div className="bg-slate-800/40 border border-dashed border-slate-700 rounded-xl p-3 flex flex-col gap-2">
        <p className="text-xs text-slate-400">
          🔎 Para traer córners/remates reales por local-visitante y el árbitro asignado de este partido, conectá tu API key
          gratuita de <span className="text-slate-200 font-medium">API-Football</span> (RapidAPI, plan free: 100
          solicitudes/día).
        </p>
        <div className="flex gap-2">
          <input
            type="password"
            placeholder="Tu API key de API-Football (RapidAPI)"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-100"
          />
          <button
            disabled={!keyInput.trim()}
            onClick={() => setApiFootballKey(keyInput.trim())}
            className="bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white text-xs font-medium rounded-lg px-3 py-1.5"
          >
            Guardar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <button
        onClick={run}
        disabled={loading}
        className="self-start bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white text-xs font-medium rounded-lg px-3 py-1.5"
      >
        {loading ? 'Consultando API-Football…' : done ? '🔎 Actualizar datos reales del partido' : '🔎 Traer datos reales del partido (córners, remates, árbitro)'}
      </button>
      {error && <p className="text-xs text-rose-400">{error}</p>}
      {done && !error && <p className="text-xs text-pitch-400">Datos actualizados desde API-Football.</p>}
    </div>
  );
}
