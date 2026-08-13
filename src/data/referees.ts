import type { Referee } from '../types';

// Árbitros de ejemplo con un promedio de tarjetas típico según su fama de "rigurosos" o
// "permisivos". Es una semilla editable: crea o corrige árbitros desde la interfaz con
// los datos reales del colegiado que dirigirá tu partido.
export const REFEREES: Referee[] = [
  { id: 'ref-strict-1', name: 'Árbitro riguroso (ejemplo)', avgCardsPerMatch: 5.8, matchesSample: 20, source: 'seed' },
  { id: 'ref-balanced-1', name: 'Árbitro promedio (ejemplo)', avgCardsPerMatch: 4.2, matchesSample: 20, source: 'seed' },
  { id: 'ref-lenient-1', name: 'Árbitro permisivo (ejemplo)', avgCardsPerMatch: 2.9, matchesSample: 20, source: 'seed' },
];

export const LEAGUE_AVG_CARDS_PER_MATCH = 4.2;

export const REFEREE_MAP: Record<string, Referee> = Object.fromEntries(REFEREES.map((r) => [r.id, r]));
