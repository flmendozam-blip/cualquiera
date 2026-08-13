// Cliente para la API pública (no documentada oficialmente) de SofaScore. Se usa solo
// para leer datos deportivos abiertos (calendario, resultados recientes, estadísticas de
// partido, árbitro) — no involucra apuestas ni dinero. Al no ser una API oficial, puede
// cambiar de forma o dejar de responder en cualquier momento: cada función devuelve
// null/[] si algo no viene como se espera, en vez de romper la app.

const BASE = 'https://api.sofascore.com/api/v1';

export class SofaScoreError extends Error {}

async function getJson<T>(path: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, { headers: { Accept: 'application/json' } });
  } catch {
    throw new SofaScoreError('No se pudo contactar a SofaScore (red bloqueada o CORS).');
  }
  if (!res.ok) throw new SofaScoreError(`SofaScore respondió ${res.status}.`);
  return (await res.json()) as T;
}

export interface SofaTeamRef {
  id: number;
  name: string;
  shortName?: string;
}

export interface SofaEvent {
  id: number;
  startTimestamp: number;
  status?: { code?: number; description?: string; type?: string };
  homeTeam: SofaTeamRef;
  awayTeam: SofaTeamRef;
  homeScore?: { current?: number };
  awayScore?: { current?: number };
  tournament?: { name?: string; uniqueTournament?: { name?: string } };
}

export function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Todos los partidos de fútbol programados/en vivo/finalizados para una fecha (YYYY-MM-DD). */
export async function fetchScheduledEvents(date: string): Promise<SofaEvent[]> {
  const data = await getJson<{ events?: SofaEvent[] }>(`/sport/football/scheduled-events/${date}`);
  return data.events ?? [];
}

function resultChar(gf: number, ga: number): 'W' | 'D' | 'L' {
  if (gf > ga) return 'W';
  if (gf < ga) return 'L';
  return 'D';
}

export interface RecentFormResult {
  form: ('W' | 'D' | 'L')[];
  avgGoalsFor: number;
  avgGoalsAgainst: number;
  matchesUsed: number;
}

/** Últimos eventos (jugados y por jugar) de un equipo, sin procesar. */
export async function fetchTeamEvents(teamId: number): Promise<SofaEvent[]> {
  try {
    const data = await getJson<{ events?: SofaEvent[] }>(`/team/${teamId}/events/last/0`);
    return data.events ?? [];
  } catch {
    return [];
  }
}

/** Calcula forma reciente real (W/D/L y promedio de goles) a partir de eventos ya obtenidos. */
export function computeRecentForm(events: SofaEvent[], teamId: number, count = 5): RecentFormResult | null {
  const finished = events
    .filter((e) => e.status?.type === 'finished' && e.homeScore?.current != null && e.awayScore?.current != null)
    .sort((a, b) => b.startTimestamp - a.startTimestamp)
    .slice(0, count);
  if (finished.length === 0) return null;
  const chron = [...finished].reverse();
  const form: ('W' | 'D' | 'L')[] = [];
  let gf = 0;
  let ga = 0;
  for (const ev of chron) {
    const isHome = ev.homeTeam.id === teamId;
    const own = isHome ? ev.homeScore!.current! : ev.awayScore!.current!;
    const opp = isHome ? ev.awayScore!.current! : ev.homeScore!.current!;
    form.push(resultChar(own, opp));
    gf += own;
    ga += opp;
  }
  return {
    form,
    avgGoalsFor: gf / chron.length,
    avgGoalsAgainst: ga / chron.length,
    matchesUsed: chron.length,
  };
}

/** Días entre el partido finalizado más reciente (antes de asOfDate) y asOfDate — para descanso/fatiga. */
export function computeRestDays(events: SofaEvent[], asOfDate: string): number | null {
  const asOf = new Date(asOfDate + 'T12:00:00').getTime();
  const finished = events
    .filter((e) => e.status?.type === 'finished' && e.startTimestamp * 1000 < asOf)
    .sort((a, b) => b.startTimestamp - a.startTimestamp);
  if (finished.length === 0) return null;
  const diffMs = asOf - finished[0].startTimestamp * 1000;
  return Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));
}

/** Compat: forma reciente obteniendo los eventos internamente en una sola llamada. */
export async function fetchTeamRecentForm(teamId: number, count = 5): Promise<RecentFormResult | null> {
  const events = await fetchTeamEvents(teamId);
  return computeRecentForm(events, teamId, count);
}

export interface MatchStatsAggregate {
  avgCornersFor: number;
  avgCornersAgainst: number;
  avgCardsFor: number;
  matchesUsed: number;
}

function findStatValue(items: Array<{ name?: string; home?: string; away?: string }>, pattern: RegExp, side: 'home' | 'away'): number | null {
  const item = items.find((i) => i.name && pattern.test(i.name));
  const raw = item ? item[side] : undefined;
  if (raw == null) return null;
  const n = parseFloat(String(raw).replace(/[^0-9.]/g, ''));
  return isNaN(n) ? null : n;
}

async function fetchEventCornersCards(eventId: number, isHome: boolean): Promise<{ cornersFor: number; cornersAgainst: number; cardsFor: number } | null> {
  try {
    const data = await getJson<{ statistics?: Array<{ period?: string; groups?: Array<{ statisticsItems?: Array<{ name?: string; home?: string; away?: string }> }> }> }>(
      `/event/${eventId}/statistics`
    );
    const all = data.statistics?.find((s) => s.period === 'ALL') ?? data.statistics?.[0];
    const items = (all?.groups ?? []).flatMap((g) => g.statisticsItems ?? []);
    const side = isHome ? 'home' : 'away';
    const oppSide = isHome ? 'away' : 'home';
    const cornersFor = findStatValue(items, /corner/i, side);
    const cornersAgainst = findStatValue(items, /corner/i, oppSide);
    const yellowFor = findStatValue(items, /yellow card/i, side) ?? 0;
    const redFor = findStatValue(items, /red card/i, side) ?? 0;
    if (cornersFor == null || cornersAgainst == null) return null;
    return { cornersFor, cornersAgainst, cardsFor: yellowFor + redFor * 2 };
  } catch {
    return null;
  }
}

/** Promedia córners/tarjetas reales de los últimos partidos finalizados de un equipo (best-effort, 1 llamada por partido). */
export async function fetchTeamCornersCardsAverage(teamId: number, recentEvents: SofaEvent[], maxMatches = 5): Promise<MatchStatsAggregate | null> {
  const finished = recentEvents
    .filter((e) => e.status?.type === 'finished')
    .sort((a, b) => b.startTimestamp - a.startTimestamp)
    .slice(0, maxMatches);
  if (finished.length === 0) return null;

  const results = await Promise.all(
    finished.map((ev) => fetchEventCornersCards(ev.id, ev.homeTeam.id === teamId))
  );
  const valid = results.filter((r): r is NonNullable<typeof r> => r !== null);
  if (valid.length === 0) return null;

  return {
    avgCornersFor: valid.reduce((a, r) => a + r.cornersFor, 0) / valid.length,
    avgCornersAgainst: valid.reduce((a, r) => a + r.cornersAgainst, 0) / valid.length,
    avgCardsFor: valid.reduce((a, r) => a + r.cardsFor, 0) / valid.length,
    matchesUsed: valid.length,
  };
}

export interface SofaRefereeInfo {
  id: number;
  name: string;
}

/** Nombre del árbitro asignado a un partido, si SofaScore lo tiene cargado. */
export async function fetchEventReferee(eventId: number): Promise<SofaRefereeInfo | null> {
  try {
    const data = await getJson<{ event?: { referee?: { id?: number; name?: string } } }>(`/event/${eventId}`);
    const ref = data.event?.referee;
    if (!ref?.name) return null;
    return { id: ref.id ?? 0, name: ref.name };
  } catch {
    return null;
  }
}

export interface SofaH2HMeeting {
  date: string;
  homeTeamId: number;
  awayTeamId: number;
  homeTeamName: string;
  awayTeamName: string;
  scoreHome: number;
  scoreAway: number;
  competition: string;
}

/** Historial de enfrentamientos directos entre los dos equipos de un evento (best-effort). */
export async function fetchH2H(eventId: number): Promise<SofaH2HMeeting[]> {
  try {
    const data = await getJson<{ events?: SofaEvent[] }>(`/event/${eventId}/h2h/events`);
    const events = data.events ?? [];
    return events
      .filter((e) => e.status?.type === 'finished' && e.homeScore?.current != null && e.awayScore?.current != null)
      .map((e) => ({
        date: new Date(e.startTimestamp * 1000).toISOString().slice(0, 10),
        homeTeamId: e.homeTeam.id,
        awayTeamId: e.awayTeam.id,
        homeTeamName: e.homeTeam.name,
        awayTeamName: e.awayTeam.name,
        scoreHome: e.homeScore!.current!,
        scoreAway: e.awayScore!.current!,
        competition: e.tournament?.name ?? e.tournament?.uniqueTournament?.name ?? 'SofaScore',
      }));
  } catch {
    return [];
  }
}

export function tournamentLabel(ev: SofaEvent): string {
  return ev.tournament?.uniqueTournament?.name ?? ev.tournament?.name ?? 'Fútbol';
}

export function isLiveStatus(ev: SofaEvent): boolean {
  return ev.status?.type === 'inprogress';
}
