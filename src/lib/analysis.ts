import type {
  Team,
  H2HMatch,
  MatchEntry,
  MatchAnalysis,
  MarketResult,
  MarketKey,
  Referee,
} from '../types';
import { scoreMatrix, overProbability } from './poisson';
import { probToFairOdds, fairOddsToMarketOdds, isInTargetRange, TARGET_MIN, TARGET_MAX } from './odds';
import { h2hForPair } from '../data/h2h';
import { LEAGUE_AVG_CARDS_PER_MATCH } from '../data/referees';

const LEAGUE_AVG_DEFENSE = 1.1;
const LEAGUE_AVG_CORNERS_AGAINST = 5.0;
const CORNERS_LINE = 9.5;
const CARDS_LINE = 4.5;
const SHOTS_OT_LINE = 8.5;
const MAX_GOALS = 8;

const MARKET_LABELS: Record<MarketKey, (home: Team, away: Team) => string> = {
  '1': (h) => `Gana ${h.name}`,
  X: () => 'Empate',
  '2': (_h, a) => `Gana ${a.name}`,
  '1X': (h) => `${h.short} o empate (doble oportunidad)`,
  X2: (_h, a) => `Empate o ${a.short} (doble oportunidad)`,
  '12': (h, a) => `Sin empate: ${h.short} o ${a.short}`,
  OVER_2_5: () => 'Más de 2.5 goles',
  UNDER_2_5: () => 'Menos de 2.5 goles',
  BTTS_YES: () => 'Ambos anotan: Sí',
  BTTS_NO: () => 'Ambos anotan: No',
  CORNERS_OVER: () => `Más de ${CORNERS_LINE} córners`,
  CORNERS_UNDER: () => `Menos de ${CORNERS_LINE} córners`,
  CARDS_OVER: () => `Más de ${CARDS_LINE} tarjetas`,
  CARDS_UNDER: () => `Menos de ${CARDS_LINE} tarjetas`,
  SHOTS_OT_OVER: () => `Más de ${SHOTS_OT_LINE} remates al arco`,
  SHOTS_OT_UNDER: () => `Menos de ${SHOTS_OT_LINE} remates al arco`,
};

function formScore(form: Team['form']): number {
  const weights = [0.1, 0.15, 0.2, 0.25, 0.3];
  const points = form.map((r) => (r === 'W' ? 1 : r === 'D' ? 0.5 : 0));
  let acc = 0;
  for (let i = 0; i < points.length; i++) acc += points[i] * weights[i];
  return acc; // 0..1
}

function formFactor(form: Team['form']): number {
  return 0.85 + formScore(form) * 0.3; // 0.85 .. 1.15
}

function fatigueFactors(restDays: number): { attack: number; concede: number } {
  if (restDays <= 2) return { attack: 0.92, concede: 1.1 };
  if (restDays === 3) return { attack: 0.97, concede: 1.04 };
  if (restDays >= 7) return { attack: 1.02, concede: 0.98 };
  return { attack: 1, concede: 1 };
}

function absenceFactors(team: Team): { attack: number; concede: number } {
  let attack = 1;
  let concede = 1;
  for (const a of team.absences) {
    const mult = a.impact === 'alto' ? 1 : a.impact === 'medio' ? 0.6 : 0.3;
    if (a.role === 'atacante') attack *= 1 - 0.12 * mult;
    else if (a.role === 'defensor' || a.role === 'portero') concede *= 1 + 0.12 * mult;
    else if (a.role === 'mediocampista') {
      attack *= 1 - 0.06 * mult;
      concede *= 1 + 0.04 * mult;
    } else {
      attack *= 1 - 0.05 * mult;
    }
  }
  return { attack, concede };
}

function competitionAdjust(
  competition: MatchEntry['competition']
): { blend: number; confidenceDelta: number; note: string | null } {
  switch (competition) {
    case 'derbi':
      return { blend: 0.12, confidenceDelta: -10, note: 'Es un derbi/clásico: la presión y la rivalidad suelen igualar el partido más de lo que reflejan las estadísticas puras.' };
    case 'amistoso':
      return { blend: 0.3, confidenceDelta: -20, note: 'Es un amistoso: es habitual la rotación de plantilla y menor intensidad, lo que reduce mucho la fiabilidad del pronóstico.' };
    case 'continental':
      return { blend: 0.05, confidenceDelta: -5, note: 'Competición continental: mayor exigencia física y táctica, ligera cautela extra.' };
    case 'copa':
      return { blend: 0.06, confidenceDelta: -3, note: 'Partido de copa: el formato de eliminación puede generar sorpresas frente al favorito.' };
    default:
      return { blend: 0, confidenceDelta: 0, note: null };
  }
}

function sumRegion(matrix: number[][], predicate: (h: number, a: number) => boolean): number {
  let sum = 0;
  for (let h = 0; h <= MAX_GOALS; h++) {
    for (let a = 0; a <= MAX_GOALS; a++) {
      if (predicate(h, a)) sum += matrix[h][a];
    }
  }
  return sum;
}

function buildMarket(key: MarketKey, home: Team, away: Team, probability: number): MarketResult {
  const p = Math.min(Math.max(probability, 0.001), 0.999);
  const fairOdds = probToFairOdds(p);
  const marketOdds = fairOddsToMarketOdds(fairOdds);
  return {
    key,
    label: MARKET_LABELS[key](home, away),
    probability: p,
    fairOdds: Math.round(fairOdds * 100) / 100,
    marketOdds,
    inTargetRange: isInTargetRange(marketOdds),
  };
}

export function analyzeMatch(
  match: MatchEntry,
  home: Team,
  away: Team,
  allH2H: H2HMatch[],
  referee?: Referee
): MatchAnalysis {
  const h2h = h2hForPair(home.id, away.id, allH2H).slice(0, 5);
  const winsA = h2h.filter(
    (m) =>
      (m.homeTeamId === home.id && m.scoreHome > m.scoreAway) ||
      (m.homeTeamId === away.id && m.scoreAway > m.scoreHome)
  ).length;
  const winsB = h2h.filter(
    (m) =>
      (m.homeTeamId === away.id && m.scoreHome > m.scoreAway) ||
      (m.homeTeamId === home.id && m.scoreAway > m.scoreHome)
  ).length;
  const draws = h2h.length - winsA - winsB;

  // 1) Goles esperados base a partir del ataque propio y la defensa rival.
  let xgHome = home.attack * (away.defense / LEAGUE_AVG_DEFENSE);
  let xgAway = away.attack * (home.defense / LEAGUE_AVG_DEFENSE);

  // 2) Ventaja de localía.
  xgHome *= 1 + home.homeAdvantage;
  xgAway *= 1 - home.homeAdvantage * 0.4;

  // 3) Forma reciente.
  xgHome *= formFactor(home.form);
  xgAway *= formFactor(away.form);

  // 4) Descanso / fatiga (contexto de fecha respecto al último partido).
  const fatigueHome = fatigueFactors(home.restDays);
  const fatigueAway = fatigueFactors(away.restDays);
  xgHome *= fatigueHome.attack * fatigueAway.concede;
  xgAway *= fatigueAway.attack * fatigueHome.concede;

  // 5) Bajas relevantes.
  const absHome = absenceFactors(home);
  const absAway = absenceFactors(away);
  xgHome *= absHome.attack * absAway.concede;
  xgAway *= absAway.attack * absHome.concede;

  // 6) Historial directo (H2H): pequeño ajuste según quién domina los enfrentamientos.
  if (h2h.length >= 2) {
    const h2hScoreHome = (winsA + 0.5 * draws) / h2h.length;
    const weight = Math.min(h2h.length / 5, 1) * 0.2;
    const tilt = (h2hScoreHome - 0.5) * weight;
    xgHome *= 1 + tilt;
    xgAway *= 1 - tilt;
  }

  // 7) Contexto de competición (derbis/amistosos aportan más incertidumbre).
  const compAdjust = competitionAdjust(match.competition);
  if (compAdjust.blend > 0) {
    const mean = (xgHome + xgAway) / 2;
    xgHome = xgHome * (1 - compAdjust.blend) + mean * compAdjust.blend;
    xgAway = xgAway * (1 - compAdjust.blend) + mean * compAdjust.blend;
  }

  xgHome = Math.min(Math.max(xgHome, 0.25), 4.5);
  xgAway = Math.min(Math.max(xgAway, 0.25), 4.5);

  const matrix = scoreMatrix(xgHome, xgAway, MAX_GOALS);
  const pHome = sumRegion(matrix, (h, a) => h > a);
  const pDraw = sumRegion(matrix, (h, a) => h === a);
  const pAway = sumRegion(matrix, (h, a) => h < a);
  const pOver = sumRegion(matrix, (h, a) => h + a >= 3);
  const pBttsYes = sumRegion(matrix, (h, a) => h >= 1 && a >= 1);

  // Córners esperados: mismo enfoque que los goles (a favor propio vs. en contra rival),
  // con un pequeño extra de localía. Si hay datos reales de córners separados por
  // local/visitante (traídos de API-Football), se usan en vez del promedio general.
  const homeCornersForBase = home.venueSplit?.home?.cornersFor ?? home.cornersFor;
  const awayCornersForBase = away.venueSplit?.away?.cornersFor ?? away.cornersFor;
  const cornersHome =
    homeCornersForBase * (away.cornersAgainst / LEAGUE_AVG_CORNERS_AGAINST) * (1 + home.homeAdvantage * 0.3);
  const cornersAway =
    awayCornersForBase * (home.cornersAgainst / LEAGUE_AVG_CORNERS_AGAINST) * (1 - home.homeAdvantage * 0.15);
  const expectedCorners = cornersHome + cornersAway;
  const pCornersOver = overProbability(expectedCorners, CORNERS_LINE);

  // Remates al arco esperados: promedio propio (real por local/visitante si está disponible)
  // ajustado por la fortaleza defensiva del rival.
  const homeShotsForBase = home.venueSplit?.home?.shotsOnTargetFor ?? home.shotsOnTargetFor;
  const awayShotsForBase = away.venueSplit?.away?.shotsOnTargetFor ?? away.shotsOnTargetFor;
  const shotsHome = homeShotsForBase * (away.defense / LEAGUE_AVG_DEFENSE) * (1 + home.homeAdvantage * 0.2);
  const shotsAway = awayShotsForBase * (home.defense / LEAGUE_AVG_DEFENSE) * (1 - home.homeAdvantage * 0.1);
  const expectedShotsOnTarget = shotsHome + shotsAway;
  const pShotsOTOver = overProbability(expectedShotsOnTarget, SHOTS_OT_LINE);

  // Tarjetas esperadas: promedio de cada equipo, ajustado por el árbitro asignado y el
  // extra de tensión de un derbi/clásico.
  const refereeMultiplier = referee ? referee.avgCardsPerMatch / LEAGUE_AVG_CARDS_PER_MATCH : 1;
  const derbiMultiplier = match.competition === 'derbi' ? 1.15 : 1;
  const cardsHome = home.avgCardsFor * refereeMultiplier * derbiMultiplier;
  const cardsAway = away.avgCardsFor * refereeMultiplier * derbiMultiplier;
  const expectedCards = cardsHome + cardsAway;
  const pCardsOver = overProbability(expectedCards, CARDS_LINE);

  const markets: MarketResult[] = [
    buildMarket('1', home, away, pHome),
    buildMarket('X', home, away, pDraw),
    buildMarket('2', home, away, pAway),
    buildMarket('1X', home, away, pHome + pDraw),
    buildMarket('X2', home, away, pDraw + pAway),
    buildMarket('12', home, away, pHome + pAway),
    buildMarket('OVER_2_5', home, away, pOver),
    buildMarket('UNDER_2_5', home, away, 1 - pOver),
    buildMarket('BTTS_YES', home, away, pBttsYes),
    buildMarket('BTTS_NO', home, away, 1 - pBttsYes),
    buildMarket('CORNERS_OVER', home, away, pCornersOver),
    buildMarket('CORNERS_UNDER', home, away, 1 - pCornersOver),
    buildMarket('CARDS_OVER', home, away, pCardsOver),
    buildMarket('CARDS_UNDER', home, away, 1 - pCardsOver),
    buildMarket('SHOTS_OT_OVER', home, away, pShotsOTOver),
    buildMarket('SHOTS_OT_UNDER', home, away, 1 - pShotsOTOver),
  ];

  const inRange = markets.filter((m) => m.inTargetRange).sort((a, b) => b.probability - a.probability);
  let recommended: MarketResult | null = inRange[0] ?? null;
  if (!recommended) {
    const dist = (o: number) => (o < TARGET_MIN ? TARGET_MIN - o : o > TARGET_MAX ? o - TARGET_MAX : 0);
    recommended = [...markets].sort((a, b) => dist(a.marketOdds) - dist(b.marketOdds) || b.probability - a.probability)[0] ?? null;
  }

  // Confianza del análisis según cantidad/calidad de datos disponibles.
  let confidenceScore = 60;
  if (h2h.length === 0) confidenceScore -= 15;
  else if (h2h.length >= 3) confidenceScore += 15;
  if (home.absences.length > 0 || away.absences.length > 0) confidenceScore += 5;
  confidenceScore += compAdjust.confidenceDelta;
  const ratingGap = Math.abs(home.rating - away.rating);
  if (ratingGap > 10) confidenceScore += 10;
  confidenceScore = Math.min(Math.max(confidenceScore, 5), 95);
  const confidence: MatchAnalysis['confidence'] =
    confidenceScore >= 70 ? 'Alta' : confidenceScore >= 45 ? 'Media' : 'Baja';

  const narrative: string[] = [];
  narrative.push(
    `Forma reciente: ${home.name} (${home.form.join('')}) vs ${away.name} (${away.form.join('')}) — el modelo pondera más los últimos partidos.`
  );
  if (h2h.length > 0) {
    narrative.push(
      `Historial directo (últimos ${h2h.length}): ${home.name} ganó ${winsA}, ${away.name} ganó ${winsB}, empates ${draws}.`
    );
  } else {
    narrative.push('No hay historial directo (H2H) cargado entre estos equipos — agrégalo para mejorar la precisión.');
  }
  narrative.push(
    `${home.name} juega como local, lo que añade cerca de ${(home.homeAdvantage * 100).toFixed(0)}% de ventaja estimada.`
  );
  if (home.restDays <= 2) narrative.push(`${home.name} llega con poco descanso (${home.restDays} días desde su último partido).`);
  if (away.restDays <= 2) narrative.push(`${away.name} llega con poco descanso (${away.restDays} días desde su último partido).`);
  if (home.absences.length > 0) {
    narrative.push(`Bajas en ${home.name}: ${home.absences.map((a) => `${a.name} (${a.impact})`).join(', ')}.`);
  }
  if (away.absences.length > 0) {
    narrative.push(`Bajas en ${away.name}: ${away.absences.map((a) => `${a.name} (${a.impact})`).join(', ')}.`);
  }
  if (compAdjust.note) narrative.push(compAdjust.note);
  narrative.push(
    `Goles esperados (modelo Poisson): ${xgHome.toFixed(2)} para ${home.short} — ${xgAway.toFixed(2)} para ${away.short}.`
  );
  narrative.push(
    `Córners esperados: ${expectedCorners.toFixed(1)} en total (${cornersHome.toFixed(1)} de ${home.short}${home.venueSplit?.home ? ' — real como local' : ''}, ${cornersAway.toFixed(1)} de ${away.short}${away.venueSplit?.away ? ' — real como visitante' : ''}).`
  );
  narrative.push(
    `Remates al arco esperados: ${expectedShotsOnTarget.toFixed(1)} en total (${shotsHome.toFixed(1)} de ${home.short}, ${shotsAway.toFixed(1)} de ${away.short}).`
  );
  if (referee) {
    narrative.push(
      `Árbitro: ${referee.name}, con un promedio de ${referee.avgCardsPerMatch.toFixed(1)} tarjetas por partido${
        referee.matchesSample > 0 ? ` (muestra de ${referee.matchesSample} partidos)` : ''
      } — ${refereeMultiplier > 1.1 ? 'es más riguroso que el promedio, lo que sube la expectativa de tarjetas.' : refereeMultiplier < 0.9 ? 'es más permisivo que el promedio, lo que baja la expectativa de tarjetas.' : 'está en la media de rigurosidad.'}`
    );
  } else {
    narrative.push('No se asignó árbitro a este partido — el mercado de tarjetas usa solo el promedio de ambos equipos, sin ajuste de rigurosidad arbitral.');
  }
  narrative.push(
    `Tarjetas esperadas: ${expectedCards.toFixed(1)} en total (${cardsHome.toFixed(1)} de ${home.short}, ${cardsAway.toFixed(1)} de ${away.short})${match.competition === 'derbi' ? ', con un extra por tratarse de un derbi/clásico' : ''}.`
  );
  if (recommended) {
    narrative.push(
      `Recomendación: "${recommended.label}" con probabilidad estimada ${(recommended.probability * 100).toFixed(0)}% y cuota de mercado aproximada ${recommended.marketOdds.toFixed(2)}${recommended.inTargetRange ? ' (dentro del rango objetivo 1.5–2.0)' : ' (fuera del rango 1.5–2.0, es la opción más cercana disponible)'}.`
    );
  }

  return {
    matchId: match.id,
    xgHome,
    xgAway,
    expectedCorners,
    expectedCards,
    expectedShotsOnTarget,
    markets,
    recommended,
    confidence,
    confidenceScore,
    narrative,
    h2hSummary: { winsA, winsB, draws, total: h2h.length },
  };
}
