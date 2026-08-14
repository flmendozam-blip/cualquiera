// Cliente para API-Football vía RapidAPI (https://rapidapi.com/api-sports/api/api-football).
// A diferencia de SofaScore, está pensada para que apps de terceros la llamen directo con
// una API key propia (header x-rapidapi-key), por eso no choca con CORS. El plan gratuito
// tiene una cuota diaria chica (100 solicitudes/día): un análisis completo de un partido
// (árbitro + córners/remates de ambos equipos separados por local/visitante) consume entre
// 10 y 15 solicitudes, así que alcanza para varios partidos por día, no para uso ilimitado.

const BASE = 'https://api-football-v1.p.rapidapi.com/v3';

export class ApiFootballError extends Error {}

async function getJson<T>(apiKey: string, path: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${BASE}${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  let res: Response;
  try {
    res = await fetch(url.toString(), {
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': 'api-football-v1.p.rapidapi.com',
      },
    });
  } catch {
    throw new ApiFootballError('No se pudo contactar a API-Football (red bloqueada o CORS).');
  }
  if (res.status === 429) throw new ApiFootballError('Se agotó la cuota diaria de tu API key de API-Football.');
  if (!res.ok) throw new ApiFootballError(`API-Football respondió ${res.status}.`);
  const body = (await res.json()) as { errors?: unknown; response?: unknown };
  if (body.errors && Array.isArray(body.errors) ? body.errors.length > 0 : body.errors && Object.keys(body.errors).length > 0) {
    throw new ApiFootballError('API-Football devolvió un error (revisa tu API key o la cuota).');
  }
  return body as T;
}

interface RawTeamSearchItem {
  team: { id: number; name: string };
}

/** Busca el id de equipo de API-Football más parecido a un nombre dado. */
export async function resolveTeamId(apiKey: string, name: string): Promise<number | null> {
  const data = await getJson<{ response: RawTeamSearchItem[] }>(apiKey, '/teams', { search: name });
  const items = data.response ?? [];
  if (items.length === 0) return null;
  const lower = name.toLowerCase();
  const exact = items.find((i) => i.team.name.toLowerCase() === lower);
  return (exact ?? items[0]).team.id;
}

interface RawFixture {
  fixture: { id: number; date: string; referee: string | null };
  teams: { home: { id: number }; away: { id: number } };
}

/** Busca el fixture programado de un equipo en una fecha (YYYY-MM-DD) para sacar id + árbitro. */
export async function findFixture(apiKey: string, teamId: number, date: string): Promise<{ fixtureId: number; referee: string | null } | null> {
  const data = await getJson<{ response: RawFixture[] }>(apiKey, '/fixtures', { team: String(teamId), date });
  const items = data.response ?? [];
  if (items.length === 0) return null;
  const f = items[0];
  const referee = f.fixture.referee ? f.fixture.referee.split(',')[0].trim() : null;
  return { fixtureId: f.fixture.id, referee };
}

interface RawFixtureListItem {
  fixture: { id: number; date: string };
  teams: { home: { id: number }; away: { id: number } };
}

/** Últimos N fixtures FINALIZADOS de un equipo jugando como local o visitante. */
async function fetchLastFixtures(apiKey: string, teamId: number, venue: 'home' | 'away', count: number): Promise<number[]> {
  const data = await getJson<{ response: RawFixtureListItem[] }>(apiKey, '/fixtures', {
    team: String(teamId),
    last: '20',
  });
  const items = data.response ?? [];
  const filtered = items.filter((f) =>
    venue === 'home' ? f.teams.home.id === teamId : f.teams.away.id === teamId
  );
  return filtered.slice(0, count).map((f) => f.fixture.id);
}

interface RawStatItem {
  type: string;
  value: number | string | null;
}

interface RawFixtureStatistics {
  response: Array<{ team: { id: number }; statistics: RawStatItem[] }>;
}

function findStat(items: RawStatItem[], pattern: RegExp): number | null {
  const item = items.find((i) => pattern.test(i.type));
  if (!item || item.value == null) return null;
  const n = typeof item.value === 'number' ? item.value : parseFloat(String(item.value).replace(/[^0-9.]/g, ''));
  return isNaN(n) ? null : n;
}

/** Córners y remates al arco de un equipo específico en un fixture ya jugado. */
async function fetchFixtureTeamStats(apiKey: string, fixtureId: number, teamId: number): Promise<{ corners: number; shotsOnTarget: number } | null> {
  const data = await getJson<RawFixtureStatistics>(apiKey, '/fixtures/statistics', { fixture: String(fixtureId) });
  const teamBlock = data.response?.find((r) => r.team.id === teamId);
  if (!teamBlock) return null;
  const corners = findStat(teamBlock.statistics, /corner/i);
  const shotsOnTarget = findStat(teamBlock.statistics, /shots on goal/i);
  if (corners == null && shotsOnTarget == null) return null;
  return { corners: corners ?? 0, shotsOnTarget: shotsOnTarget ?? 0 };
}

export interface VenueAggregate {
  matches: number;
  cornersFor: number;
  shotsOnTargetFor: number;
}

/** Promedia córners/remates al arco reales de los últimos partidos de un equipo en una localía dada. */
export async function fetchVenueStats(apiKey: string, teamId: number, venue: 'home' | 'away', count = 4): Promise<VenueAggregate | null> {
  const fixtureIds = await fetchLastFixtures(apiKey, teamId, venue, count);
  if (fixtureIds.length === 0) return null;
  const results = await Promise.all(fixtureIds.map((id) => fetchFixtureTeamStats(apiKey, id, teamId)));
  const valid = results.filter((r): r is NonNullable<typeof r> => r !== null);
  if (valid.length === 0) return null;
  return {
    matches: valid.length,
    cornersFor: valid.reduce((a, r) => a + r.corners, 0) / valid.length,
    shotsOnTargetFor: valid.reduce((a, r) => a + r.shotsOnTarget, 0) / valid.length,
  };
}
