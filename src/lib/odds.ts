/** Margen de casa de apuestas simulado (overround típico ~6%) para pasar de cuota justa a cuota de mercado. */
export const BOOKMAKER_MARGIN = 0.06;

export function probToFairOdds(p: number): number {
  if (p <= 0) return Infinity;
  return 1 / p;
}

export function fairOddsToMarketOdds(fairOdds: number): number {
  if (!isFinite(fairOdds)) return Infinity;
  return Math.round(fairOdds * (1 - BOOKMAKER_MARGIN) * 100) / 100;
}

export function probToMarketOdds(p: number): number {
  return fairOddsToMarketOdds(probToFairOdds(p));
}

export const TARGET_MIN = 1.5;
export const TARGET_MAX = 2.0;

export function isInTargetRange(odds: number): boolean {
  return odds >= TARGET_MIN && odds <= TARGET_MAX;
}

export function comboOdds(legOdds: number[]): number {
  return Math.round(legOdds.reduce((acc, o) => acc * o, 1) * 100) / 100;
}

export function comboProbability(legProbs: number[]): number {
  return legProbs.reduce((acc, p) => acc * p, 1);
}
