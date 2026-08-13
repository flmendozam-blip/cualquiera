import type { Team } from '../types';

// Datos "semilla" de equipos conocidos. La identidad (nombre, liga, país) es real.
// La forma reciente, el rating, córners/tarjetas y las bajas son valores de ejemplo
// editables desde la propia interfaz: actualízalos con los datos actuales antes de
// analizar un partido para obtener la máxima precisión posible. Los partidos que
// traigas desde "Explorar partidos reales" generan y ajustan estos datos automáticamente
// para cualquier equipo, no solo los de esta lista.
export const TEAMS: Team[] = [
  {
    id: 'real-madrid', name: 'Real Madrid', short: 'RMA', league: 'La Liga', country: 'España',
    colorFrom: '#ffffff', colorTo: '#7a7fd6', rating: 92, attack: 2.3, defense: 0.9,
    form: ['W', 'W', 'D', 'W', 'W'], homeAdvantage: 0.16, restDays: 5, absences: [],
    cornersFor: 6.4, cornersAgainst: 3.8, avgCardsFor: 1.9,
  },
  {
    id: 'barcelona', name: 'FC Barcelona', short: 'BAR', league: 'La Liga', country: 'España',
    colorFrom: '#a50044', colorTo: '#004d98', rating: 90, attack: 2.4, defense: 1.0,
    form: ['W', 'D', 'W', 'W', 'L'], homeAdvantage: 0.15, restDays: 4, absences: [],
    cornersFor: 6.6, cornersAgainst: 4.0, avgCardsFor: 2.1,
  },
  {
    id: 'atletico-madrid', name: 'Atlético de Madrid', short: 'ATM', league: 'La Liga', country: 'España',
    colorFrom: '#c8102e', colorTo: '#1c2c5b', rating: 84, attack: 1.7, defense: 0.9,
    form: ['W', 'D', 'D', 'W', 'W'], homeAdvantage: 0.14, restDays: 6, absences: [],
    cornersFor: 5.3, cornersAgainst: 4.2, avgCardsFor: 2.6,
  },
  {
    id: 'real-sociedad', name: 'Real Sociedad', short: 'RSO', league: 'La Liga', country: 'España',
    colorFrom: '#0067b1', colorTo: '#ffffff', rating: 76, attack: 1.4, defense: 1.2,
    form: ['D', 'L', 'W', 'D', 'L'], homeAdvantage: 0.12, restDays: 5, absences: [],
    cornersFor: 4.8, cornersAgainst: 4.6, avgCardsFor: 2.2,
  },
  {
    id: 'man-city', name: 'Manchester City', short: 'MCI', league: 'Premier League', country: 'Inglaterra',
    colorFrom: '#6cabdd', colorTo: '#1c2c5b', rating: 93, attack: 2.5, defense: 0.8,
    form: ['W', 'W', 'W', 'D', 'W'], homeAdvantage: 0.16, restDays: 4, absences: [],
    cornersFor: 6.8, cornersAgainst: 3.6, avgCardsFor: 1.7,
  },
  {
    id: 'liverpool', name: 'Liverpool', short: 'LIV', league: 'Premier League', country: 'Inglaterra',
    colorFrom: '#c8102e', colorTo: '#00b2a9', rating: 89, attack: 2.2, defense: 0.9,
    form: ['W', 'W', 'D', 'W', 'W'], homeAdvantage: 0.16, restDays: 4, absences: [],
    cornersFor: 6.5, cornersAgainst: 4.0, avgCardsFor: 1.8,
  },
  {
    id: 'arsenal', name: 'Arsenal', short: 'ARS', league: 'Premier League', country: 'Inglaterra',
    colorFrom: '#ef0107', colorTo: '#023474', rating: 87, attack: 2.0, defense: 0.8,
    form: ['W', 'D', 'W', 'W', 'D'], homeAdvantage: 0.15, restDays: 6, absences: [],
    cornersFor: 6.1, cornersAgainst: 3.9, avgCardsFor: 1.9,
  },
  {
    id: 'man-united', name: 'Manchester United', short: 'MUN', league: 'Premier League', country: 'Inglaterra',
    colorFrom: '#da291c', colorTo: '#fbe122', rating: 80, attack: 1.7, defense: 1.2,
    form: ['L', 'W', 'D', 'L', 'W'], homeAdvantage: 0.14, restDays: 5, absences: [],
    cornersFor: 5.2, cornersAgainst: 4.7, avgCardsFor: 2.2,
  },
  {
    id: 'chelsea', name: 'Chelsea', short: 'CHE', league: 'Premier League', country: 'Inglaterra',
    colorFrom: '#034694', colorTo: '#ffffff', rating: 81, attack: 1.8, defense: 1.1,
    form: ['D', 'W', 'W', 'L', 'D'], homeAdvantage: 0.13, restDays: 4, absences: [],
    cornersFor: 5.4, cornersAgainst: 4.4, avgCardsFor: 2.3,
  },
  {
    id: 'tottenham', name: 'Tottenham Hotspur', short: 'TOT', league: 'Premier League', country: 'Inglaterra',
    colorFrom: '#132257', colorTo: '#ffffff', rating: 79, attack: 1.8, defense: 1.3,
    form: ['W', 'L', 'W', 'D', 'L'], homeAdvantage: 0.13, restDays: 6, absences: [],
    cornersFor: 5.5, cornersAgainst: 4.8, avgCardsFor: 2.1,
  },
  {
    id: 'inter', name: 'Inter de Milán', short: 'INT', league: 'Serie A', country: 'Italia',
    colorFrom: '#0068a8', colorTo: '#000000', rating: 86, attack: 2.0, defense: 0.8,
    form: ['W', 'W', 'D', 'W', 'D'], homeAdvantage: 0.14, restDays: 5, absences: [],
    cornersFor: 5.9, cornersAgainst: 3.9, avgCardsFor: 2.2,
  },
  {
    id: 'ac-milan', name: 'AC Milan', short: 'MIL', league: 'Serie A', country: 'Italia',
    colorFrom: '#fb090b', colorTo: '#000000', rating: 81, attack: 1.7, defense: 1.0,
    form: ['D', 'W', 'L', 'W', 'D'], homeAdvantage: 0.13, restDays: 5, absences: [],
    cornersFor: 5.3, cornersAgainst: 4.3, avgCardsFor: 2.4,
  },
  {
    id: 'juventus', name: 'Juventus', short: 'JUV', league: 'Serie A', country: 'Italia',
    colorFrom: '#000000', colorTo: '#ffffff', rating: 82, attack: 1.6, defense: 0.9,
    form: ['D', 'D', 'W', 'W', 'L'], homeAdvantage: 0.13, restDays: 4, absences: [],
    cornersFor: 5.1, cornersAgainst: 4.0, avgCardsFor: 2.3,
  },
  {
    id: 'napoli', name: 'Napoli', short: 'NAP', league: 'Serie A', country: 'Italia',
    colorFrom: '#087bc4', colorTo: '#ffffff', rating: 80, attack: 1.8, defense: 1.1,
    form: ['W', 'L', 'D', 'W', 'W'], homeAdvantage: 0.14, restDays: 6, absences: [],
    cornersFor: 5.4, cornersAgainst: 4.5, avgCardsFor: 2.3,
  },
  {
    id: 'bayern', name: 'Bayern Múnich', short: 'BAY', league: 'Bundesliga', country: 'Alemania',
    colorFrom: '#dc052d', colorTo: '#0066b2', rating: 91, attack: 2.6, defense: 0.9,
    form: ['W', 'W', 'W', 'D', 'W'], homeAdvantage: 0.16, restDays: 5, absences: [],
    cornersFor: 7.0, cornersAgainst: 3.7, avgCardsFor: 1.8,
  },
  {
    id: 'dortmund', name: 'Borussia Dortmund', short: 'BVB', league: 'Bundesliga', country: 'Alemania',
    colorFrom: '#fde100', colorTo: '#000000', rating: 83, attack: 2.0, defense: 1.2,
    form: ['L', 'W', 'D', 'W', 'D'], homeAdvantage: 0.15, restDays: 4, absences: [],
    cornersFor: 6.0, cornersAgainst: 4.6, avgCardsFor: 2.0,
  },
  {
    id: 'leverkusen', name: 'Bayer Leverkusen', short: 'B04', league: 'Bundesliga', country: 'Alemania',
    colorFrom: '#e32221', colorTo: '#000000', rating: 82, attack: 2.0, defense: 1.0,
    form: ['W', 'D', 'W', 'W', 'D'], homeAdvantage: 0.13, restDays: 6, absences: [],
    cornersFor: 5.8, cornersAgainst: 4.1, avgCardsFor: 2.0,
  },
  {
    id: 'psg', name: 'Paris Saint-Germain', short: 'PSG', league: 'Ligue 1', country: 'Francia',
    colorFrom: '#004170', colorTo: '#da291c', rating: 88, attack: 2.3, defense: 1.0,
    form: ['W', 'W', 'D', 'W', 'W'], homeAdvantage: 0.15, restDays: 5, absences: [],
    cornersFor: 6.7, cornersAgainst: 3.8, avgCardsFor: 2.0,
  },
  {
    id: 'marseille', name: 'Olympique de Marsella', short: 'OM', league: 'Ligue 1', country: 'Francia',
    colorFrom: '#2fafe4', colorTo: '#ffffff', rating: 76, attack: 1.5, defense: 1.2,
    form: ['D', 'L', 'W', 'D', 'W'], homeAdvantage: 0.13, restDays: 5, absences: [],
    cornersFor: 4.9, cornersAgainst: 4.9, avgCardsFor: 2.5,
  },
  {
    id: 'monaco', name: 'AS Mónaco', short: 'ASM', league: 'Ligue 1', country: 'Francia',
    colorFrom: '#e8262c', colorTo: '#ffffff', rating: 75, attack: 1.6, defense: 1.3,
    form: ['W', 'D', 'L', 'W', 'D'], homeAdvantage: 0.12, restDays: 4, absences: [],
    cornersFor: 4.9, cornersAgainst: 4.8, avgCardsFor: 2.1,
  },
  {
    id: 'benfica', name: 'Benfica', short: 'SLB', league: 'Primeira Liga', country: 'Portugal',
    colorFrom: '#e30613', colorTo: '#ffffff', rating: 78, attack: 1.8, defense: 1.1,
    form: ['W', 'W', 'D', 'L', 'W'], homeAdvantage: 0.14, restDays: 6, absences: [],
    cornersFor: 5.6, cornersAgainst: 4.3, avgCardsFor: 2.3,
  },
  {
    id: 'porto', name: 'FC Porto', short: 'POR', league: 'Primeira Liga', country: 'Portugal',
    colorFrom: '#0055a4', colorTo: '#ffffff', rating: 77, attack: 1.7, defense: 1.1,
    form: ['D', 'W', 'W', 'D', 'L'], homeAdvantage: 0.14, restDays: 5, absences: [],
    cornersFor: 5.4, cornersAgainst: 4.4, avgCardsFor: 2.4,
  },
  {
    id: 'ajax', name: 'Ajax', short: 'AJA', league: 'Eredivisie', country: 'Países Bajos',
    colorFrom: '#d2122e', colorTo: '#ffffff', rating: 74, attack: 1.7, defense: 1.3,
    form: ['L', 'D', 'W', 'L', 'D'], homeAdvantage: 0.13, restDays: 5, absences: [],
    cornersFor: 5.5, cornersAgainst: 4.9, avgCardsFor: 2.0,
  },
  {
    id: 'boca-juniors', name: 'Boca Juniors', short: 'BOC', league: 'Liga Profesional', country: 'Argentina',
    colorFrom: '#0a1a5c', colorTo: '#f2c116', rating: 73, attack: 1.4, defense: 1.0,
    form: ['D', 'W', 'D', 'L', 'W'], homeAdvantage: 0.17, restDays: 6, absences: [],
    cornersFor: 4.9, cornersAgainst: 4.5, avgCardsFor: 3.0,
  },
  {
    id: 'river-plate', name: 'River Plate', short: 'RIV', league: 'Liga Profesional', country: 'Argentina',
    colorFrom: '#e5001c', colorTo: '#ffffff', rating: 75, attack: 1.6, defense: 1.0,
    form: ['W', 'W', 'D', 'W', 'L'], homeAdvantage: 0.17, restDays: 5, absences: [],
    cornersFor: 5.2, cornersAgainst: 4.2, avgCardsFor: 2.9,
  },
  {
    id: 'flamengo', name: 'Flamengo', short: 'FLA', league: 'Brasileirão', country: 'Brasil',
    colorFrom: '#e40613', colorTo: '#000000', rating: 76, attack: 1.8, defense: 1.1,
    form: ['W', 'D', 'W', 'W', 'D'], homeAdvantage: 0.17, restDays: 4, absences: [],
    cornersFor: 5.4, cornersAgainst: 4.4, avgCardsFor: 2.8,
  },
];

export const TEAM_MAP: Record<string, Team> = Object.fromEntries(
  TEAMS.map((t) => [t.id, t])
);

let dynamicCounter = 1;

/** Crea un equipo con valores promedio neutros para partidos reales fuera de la lista curada. */
export function createNeutralTeam(
  id: string,
  name: string,
  short: string,
  league: string,
  country: string,
  sofascoreTeamId?: number
): Team {
  return {
    id: id || `team-${dynamicCounter++}`,
    name,
    short: short.slice(0, 3).toUpperCase(),
    league,
    country,
    colorFrom: '#64748b',
    colorTo: '#334155',
    rating: 68,
    attack: 1.3,
    defense: 1.3,
    form: ['D', 'D', 'D', 'D', 'D'],
    homeAdvantage: 0.13,
    restDays: 5,
    absences: [],
    cornersFor: 5.0,
    cornersAgainst: 5.0,
    avgCardsFor: 2.2,
    formSource: 'seed',
    sofascoreTeamId,
  };
}
