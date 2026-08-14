export type ResultChar = 'W' | 'D' | 'L';

export type CompetitionType =
  | 'liga'
  | 'copa'
  | 'continental'
  | 'derbi'
  | 'amistoso';

export interface Absence {
  id: string;
  name: string;
  role: 'atacante' | 'defensor' | 'mediocampista' | 'portero' | 'otro';
  impact: 'alto' | 'medio' | 'bajo';
}

export interface Team {
  id: string;
  name: string;
  short: string;
  league: string;
  country: string;
  colorFrom: string;
  colorTo: string;
  rating: number; // 1-100 overall strength
  attack: number; // avg goals scored (recent)
  defense: number; // avg goals conceded (recent)
  form: ResultChar[]; // last 5, oldest -> newest
  homeAdvantage: number; // 0..0.25
  restDays: number; // days since last competitive match (editable)
  absences: Absence[];
  cornersFor: number; // avg córners a favor por partido
  cornersAgainst: number; // avg córners en contra por partido
  avgCardsFor: number; // avg tarjetas (amarillas + 2*rojas) recibidas por partido
  shotsOnTargetFor: number; // avg remates al arco a favor por partido
  shotsOnTargetAgainst: number; // avg remates al arco en contra por partido
  apiFootballTeamId?: number; // id resuelto en API-Football, para no tener que re-buscarlo
  venueSplit?: {
    home?: VenueStats;
    away?: VenueStats;
  };
}

export interface VenueStats {
  matches: number;
  cornersFor: number;
  cornersAgainst: number;
  shotsOnTargetFor: number;
}

export interface Referee {
  id: string;
  name: string;
  avgCardsPerMatch: number; // promedio de tarjetas totales (ambos equipos) que muestra por partido
  matchesSample: number; // partidos usados para calcular el promedio (confianza del dato)
  source: 'seed' | 'manual';
}

export interface H2HMatch {
  id: string;
  teamAId: string;
  teamBId: string;
  date: string; // ISO date
  homeTeamId: string;
  scoreHome: number;
  scoreAway: number;
  competition: string;
}

export type MarketKey =
  | '1'
  | 'X'
  | '2'
  | '1X'
  | 'X2'
  | '12'
  | 'OVER_2_5'
  | 'UNDER_2_5'
  | 'BTTS_YES'
  | 'BTTS_NO'
  | 'CORNERS_OVER'
  | 'CORNERS_UNDER'
  | 'CARDS_OVER'
  | 'CARDS_UNDER'
  | 'SHOTS_OT_OVER'
  | 'SHOTS_OT_UNDER';

export interface MarketResult {
  key: MarketKey;
  label: string;
  probability: number; // 0..1
  fairOdds: number;
  marketOdds: number;
  inTargetRange: boolean;
}

export interface MatchAnalysis {
  matchId: string;
  xgHome: number;
  xgAway: number;
  expectedCorners: number;
  expectedCards: number;
  expectedShotsOnTarget: number;
  markets: MarketResult[];
  recommended: MarketResult | null;
  confidence: 'Alta' | 'Media' | 'Baja';
  confidenceScore: number;
  narrative: string[];
  h2hSummary: { winsA: number; winsB: number; draws: number; total: number };
}

export interface RealOddsSnapshot {
  home: number;
  draw: number;
  away: number;
  bookmaker: string;
  isBetano: boolean;
  isLive: boolean;
  fetchedAt: string;
}

export interface MatchEntry {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  date: string; // ISO date chosen by user
  competition: CompetitionType;
  notes: string;
  realOdds?: RealOddsSnapshot;
  refereeId?: string;
}

export interface BetLeg {
  matchId: string;
  marketKey: MarketKey;
}
