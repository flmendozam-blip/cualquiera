import type { H2HMatch } from '../types';

let counter = 0;
const id = () => `h2h-${counter++}`;

function pair(
  teamAId: string,
  teamBId: string,
  meetings: Array<{ date: string; home: string; scoreHome: number; scoreAway: number; competition: string }>
): H2HMatch[] {
  return meetings.map((m) => ({
    id: id(),
    teamAId,
    teamBId,
    date: m.date,
    homeTeamId: m.home,
    scoreHome: m.scoreHome,
    scoreAway: m.scoreAway,
    competition: m.competition,
  }));
}

// Historial de ejemplo para los grandes clásicos/rivalidades. Es un punto de partida
// editable: agrega, corrige o borra enfrentamientos desde la interfaz para reflejar
// el historial real y actualizado entre los dos equipos que quieras analizar.
export const H2H_SEED: H2HMatch[] = [
  ...pair('real-madrid', 'barcelona', [
    { date: '2025-10-26', home: 'real-madrid', scoreHome: 2, scoreAway: 1, competition: 'La Liga' },
    { date: '2025-04-13', home: 'barcelona', scoreHome: 3, scoreAway: 2, competition: 'La Liga' },
    { date: '2024-10-27', home: 'barcelona', scoreHome: 4, scoreAway: 0, competition: 'La Liga' },
    { date: '2024-04-21', home: 'real-madrid', scoreHome: 3, scoreAway: 2, competition: 'La Liga' },
    { date: '2024-01-14', home: 'real-madrid', scoreHome: 4, scoreAway: 1, competition: 'Supercopa' },
  ]),
  ...pair('man-city', 'liverpool', [
    { date: '2025-11-01', home: 'liverpool', scoreHome: 1, scoreAway: 1, competition: 'Premier League' },
    { date: '2025-03-02', home: 'man-city', scoreHome: 0, scoreAway: 2, competition: 'Premier League' },
    { date: '2024-09-22', home: 'liverpool', scoreHome: 2, scoreAway: 1, competition: 'Premier League' },
    { date: '2024-03-10', home: 'man-city', scoreHome: 1, scoreAway: 1, competition: 'Premier League' },
  ]),
  ...pair('inter', 'ac-milan', [
    { date: '2025-09-14', home: 'inter', scoreHome: 2, scoreAway: 1, competition: 'Serie A' },
    { date: '2025-02-02', home: 'ac-milan', scoreHome: 1, scoreAway: 2, competition: 'Serie A' },
    { date: '2024-04-22', home: 'inter', scoreHome: 2, scoreAway: 1, competition: 'Serie A' },
    { date: '2023-09-16', home: 'ac-milan', scoreHome: 1, scoreAway: 1, competition: 'Serie A' },
  ]),
  ...pair('bayern', 'dortmund', [
    { date: '2025-11-30', home: 'dortmund', scoreHome: 0, scoreAway: 2, competition: 'Bundesliga' },
    { date: '2025-04-05', home: 'bayern', scoreHome: 2, scoreAway: 2, competition: 'Bundesliga' },
    { date: '2024-10-26', home: 'dortmund', scoreHome: 1, scoreAway: 4, competition: 'Bundesliga' },
  ]),
  ...pair('boca-juniors', 'river-plate', [
    { date: '2025-09-28', home: 'river-plate', scoreHome: 1, scoreAway: 1, competition: 'Liga Profesional' },
    { date: '2025-04-06', home: 'boca-juniors', scoreHome: 0, scoreAway: 0, competition: 'Liga Profesional' },
    { date: '2024-08-25', home: 'river-plate', scoreHome: 2, scoreAway: 0, competition: 'Liga Profesional' },
  ]),
  ...pair('psg', 'marseille', [
    { date: '2025-10-25', home: 'psg', scoreHome: 3, scoreAway: 0, competition: 'Ligue 1' },
    { date: '2025-02-23', home: 'marseille', scoreHome: 0, scoreAway: 3, competition: 'Ligue 1' },
  ]),
  ...pair('arsenal', 'tottenham', [
    { date: '2025-09-14', home: 'tottenham', scoreHome: 1, scoreAway: 2, competition: 'Premier League' },
    { date: '2025-01-15', home: 'arsenal', scoreHome: 2, scoreAway: 1, competition: 'Premier League' },
  ]),
  ...pair('atletico-madrid', 'real-madrid', [
    { date: '2025-09-28', home: 'atletico-madrid', scoreHome: 1, scoreAway: 2, competition: 'La Liga' },
    { date: '2025-02-08', home: 'real-madrid', scoreHome: 1, scoreAway: 1, competition: 'La Liga' },
  ]),
];

export function h2hForPair(teamAId: string, teamBId: string, all: H2HMatch[]): H2HMatch[] {
  return all
    .filter(
      (m) =>
        (m.teamAId === teamAId && m.teamBId === teamBId) ||
        (m.teamAId === teamBId && m.teamBId === teamAId)
    )
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}
