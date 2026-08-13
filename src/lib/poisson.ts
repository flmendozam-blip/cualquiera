function factorial(n: number): number {
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

export function poissonPmf(lambda: number, k: number): number {
  return (Math.exp(-lambda) * Math.pow(lambda, k)) / factorial(k);
}

/** Distribución conjunta de marcadores 0..maxGoals x 0..maxGoals a partir de dos xG independientes. */
export function scoreMatrix(xgHome: number, xgAway: number, maxGoals = 8): number[][] {
  const homeProbs = Array.from({ length: maxGoals + 1 }, (_, k) => poissonPmf(xgHome, k));
  const awayProbs = Array.from({ length: maxGoals + 1 }, (_, k) => poissonPmf(xgAway, k));
  const matrix: number[][] = [];
  for (let h = 0; h <= maxGoals; h++) {
    const row: number[] = [];
    for (let a = 0; a <= maxGoals; a++) {
      row.push(homeProbs[h] * awayProbs[a]);
    }
    matrix.push(row);
  }
  return matrix;
}
