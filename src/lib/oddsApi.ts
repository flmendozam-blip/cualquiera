// Cliente para The Odds API (https://the-odds-api.com/): un agregador independiente que
// entrega cuotas reales de casas de apuestas (Betano entre otras, según región/mercado)
// por un canal oficial con API key propia del usuario. No se hace scraping de Betano.

export interface OddsSport {
  key: string;
  group: string;
  title: string;
  description: string;
  active: boolean;
  has_outrights: boolean;
}

export interface OddsOutcome {
  name: string;
  price: number;
  point?: number;
}

export interface OddsMarket {
  key: string;
  last_update: string;
  outcomes: OddsOutcome[];
}

export interface OddsBookmaker {
  key: string;
  title: string;
  last_update: string;
  link?: string;
  markets: OddsMarket[];
}

export interface OddsEvent {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: OddsBookmaker[];
}

const BASE = 'https://api.the-odds-api.com/v4';

export class OddsApiError extends Error {
  status?: number;
}

async function request<T>(
  path: string,
  apiKey: string,
  params: Record<string, string> = {}
): Promise<{ data: T; remaining: string | null }> {
  const url = new URL(`${BASE}${path}`);
  url.searchParams.set('apiKey', apiKey);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

  let res: Response;
  try {
    res = await fetch(url.toString());
  } catch {
    throw new OddsApiError(
      'No se pudo contactar a The Odds API (revisa tu conexión o si el navegador bloqueó la petición).'
    );
  }

  const remaining = res.headers.get('x-requests-remaining');

  if (!res.ok) {
    let message = `Error ${res.status} consultando The Odds API.`;
    try {
      const body = await res.json();
      if (body?.message) message = body.message;
    } catch {
      /* respuesta sin cuerpo JSON */
    }
    const err = new OddsApiError(message);
    err.status = res.status;
    throw err;
  }

  const data = (await res.json()) as T;
  return { data, remaining };
}

export function fetchSports(apiKey: string) {
  return request<OddsSport[]>('/sports', apiKey);
}

export function fetchOdds(apiKey: string, sportKey: string, regions: string, markets = 'h2h') {
  return request<OddsEvent[]>(`/sports/${sportKey}/odds`, apiKey, {
    regions,
    markets,
    oddsFormat: 'decimal',
    dateFormat: 'iso',
  });
}

export function pickBookmaker(bookmakers: OddsBookmaker[]): { bm: OddsBookmaker | null; isBetano: boolean } {
  const betano = bookmakers.find((b) => /betano/i.test(b.key) || /betano/i.test(b.title));
  if (betano) return { bm: betano, isBetano: true };
  return { bm: bookmakers[0] ?? null, isBetano: false };
}

export function h2hPrices(
  bm: OddsBookmaker | null,
  homeTeam: string,
  awayTeam: string
): { home: number; draw: number; away: number } | null {
  const market = bm?.markets.find((m) => m.key === 'h2h');
  if (!market) return null;
  const home = market.outcomes.find((o) => o.name === homeTeam)?.price;
  const away = market.outcomes.find((o) => o.name === awayTeam)?.price;
  const draw = market.outcomes.find((o) => o.name === 'Draw')?.price;
  if (home == null || away == null || draw == null) return null;
  return { home, draw, away };
}

export function guessCompetition(sportTitle: string): 'liga' | 'copa' | 'continental' {
  const t = sportTitle.toLowerCase();
  if (t.includes('champions') || t.includes('europa') || t.includes('libertadores') || t.includes('conference')) {
    return 'continental';
  }
  if (t.includes('cup') || t.includes('copa') || t.includes('fa cup')) return 'copa';
  return 'liga';
}
