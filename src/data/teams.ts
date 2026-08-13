import type { Team } from '../types';

// Datos "semilla" de equipos conocidos. La identidad (nombre, liga, país) es real.
// La forma reciente, el rating y las bajas son valores de ejemplo editables desde
// la propia interfaz: actualízalos con los datos actuales antes de analizar un
// partido para obtener la máxima precisión posible.
export const TEAMS: Team[] = [
  {
    id: 'real-madrid', name: 'Real Madrid', short: 'RMA', league: 'La Liga', country: 'España',
    colorFrom: '#ffffff', colorTo: '#7a7fd6', rating: 92, attack: 2.3, defense: 0.9,
    form: ['W', 'W', 'D', 'W', 'W'], homeAdvantage: 0.16, restDays: 5, absences: [],
  },
  {
    id: 'barcelona', name: 'FC Barcelona', short: 'BAR', league: 'La Liga', country: 'España',
    colorFrom: '#a50044', colorTo: '#004d98', rating: 90, attack: 2.4, defense: 1.0,
    form: ['W', 'D', 'W', 'W', 'L'], homeAdvantage: 0.15, restDays: 4, absences: [],
  },
  {
    id: 'atletico-madrid', name: 'Atlético de Madrid', short: 'ATM', league: 'La Liga', country: 'España',
    colorFrom: '#c8102e', colorTo: '#1c2c5b', rating: 84, attack: 1.7, defense: 0.9,
    form: ['W', 'D', 'D', 'W', 'W'], homeAdvantage: 0.14, restDays: 6, absences: [],
  },
  {
    id: 'real-sociedad', name: 'Real Sociedad', short: 'RSO', league: 'La Liga', country: 'España',
    colorFrom: '#0067b1', colorTo: '#ffffff', rating: 76, attack: 1.4, defense: 1.2,
    form: ['D', 'L', 'W', 'D', 'L'], homeAdvantage: 0.12, restDays: 5, absences: [],
  },
  {
    id: 'man-city', name: 'Manchester City', short: 'MCI', league: 'Premier League', country: 'Inglaterra',
    colorFrom: '#6cabdd', colorTo: '#1c2c5b', rating: 93, attack: 2.5, defense: 0.8,
    form: ['W', 'W', 'W', 'D', 'W'], homeAdvantage: 0.16, restDays: 4, absences: [],
  },
  {
    id: 'liverpool', name: 'Liverpool', short: 'LIV', league: 'Premier League', country: 'Inglaterra',
    colorFrom: '#c8102e', colorTo: '#00b2a9', rating: 89, attack: 2.2, defense: 0.9,
    form: ['W', 'W', 'D', 'W', 'W'], homeAdvantage: 0.16, restDays: 4, absences: [],
  },
  {
    id: 'arsenal', name: 'Arsenal', short: 'ARS', league: 'Premier League', country: 'Inglaterra',
    colorFrom: '#ef0107', colorTo: '#023474', rating: 87, attack: 2.0, defense: 0.8,
    form: ['W', 'D', 'W', 'W', 'D'], homeAdvantage: 0.15, restDays: 6, absences: [],
  },
  {
    id: 'man-united', name: 'Manchester United', short: 'MUN', league: 'Premier League', country: 'Inglaterra',
    colorFrom: '#da291c', colorTo: '#fbe122', rating: 80, attack: 1.7, defense: 1.2,
    form: ['L', 'W', 'D', 'L', 'W'], homeAdvantage: 0.14, restDays: 5, absences: [],
  },
  {
    id: 'chelsea', name: 'Chelsea', short: 'CHE', league: 'Premier League', country: 'Inglaterra',
    colorFrom: '#034694', colorTo: '#ffffff', rating: 81, attack: 1.8, defense: 1.1,
    form: ['D', 'W', 'W', 'L', 'D'], homeAdvantage: 0.13, restDays: 4, absences: [],
  },
  {
    id: 'tottenham', name: 'Tottenham Hotspur', short: 'TOT', league: 'Premier League', country: 'Inglaterra',
    colorFrom: '#132257', colorTo: '#ffffff', rating: 79, attack: 1.8, defense: 1.3,
    form: ['W', 'L', 'W', 'D', 'L'], homeAdvantage: 0.13, restDays: 6, absences: [],
  },
  {
    id: 'inter', name: 'Inter de Milán', short: 'INT', league: 'Serie A', country: 'Italia',
    colorFrom: '#0068a8', colorTo: '#000000', rating: 86, attack: 2.0, defense: 0.8,
    form: ['W', 'W', 'D', 'W', 'D'], homeAdvantage: 0.14, restDays: 5, absences: [],
  },
  {
    id: 'ac-milan', name: 'AC Milan', short: 'MIL', league: 'Serie A', country: 'Italia',
    colorFrom: '#fb090b', colorTo: '#000000', rating: 81, attack: 1.7, defense: 1.0,
    form: ['D', 'W', 'L', 'W', 'D'], homeAdvantage: 0.13, restDays: 5, absences: [],
  },
  {
    id: 'juventus', name: 'Juventus', short: 'JUV', league: 'Serie A', country: 'Italia',
    colorFrom: '#000000', colorTo: '#ffffff', rating: 82, attack: 1.6, defense: 0.9,
    form: ['D', 'D', 'W', 'W', 'L'], homeAdvantage: 0.13, restDays: 4, absences: [],
  },
  {
    id: 'napoli', name: 'Napoli', short: 'NAP', league: 'Serie A', country: 'Italia',
    colorFrom: '#087bc4', colorTo: '#ffffff', rating: 80, attack: 1.8, defense: 1.1,
    form: ['W', 'L', 'D', 'W', 'W'], homeAdvantage: 0.14, restDays: 6, absences: [],
  },
  {
    id: 'bayern', name: 'Bayern Múnich', short: 'BAY', league: 'Bundesliga', country: 'Alemania',
    colorFrom: '#dc052d', colorTo: '#0066b2', rating: 91, attack: 2.6, defense: 0.9,
    form: ['W', 'W', 'W', 'D', 'W'], homeAdvantage: 0.16, restDays: 5, absences: [],
  },
  {
    id: 'dortmund', name: 'Borussia Dortmund', short: 'BVB', league: 'Bundesliga', country: 'Alemania',
    colorFrom: '#fde100', colorTo: '#000000', rating: 83, attack: 2.0, defense: 1.2,
    form: ['L', 'W', 'D', 'W', 'D'], homeAdvantage: 0.15, restDays: 4, absences: [],
  },
  {
    id: 'leverkusen', name: 'Bayer Leverkusen', short: 'B04', league: 'Bundesliga', country: 'Alemania',
    colorFrom: '#e32221', colorTo: '#000000', rating: 82, attack: 2.0, defense: 1.0,
    form: ['W', 'D', 'W', 'W', 'D'], homeAdvantage: 0.13, restDays: 6, absences: [],
  },
  {
    id: 'psg', name: 'Paris Saint-Germain', short: 'PSG', league: 'Ligue 1', country: 'Francia',
    colorFrom: '#004170', colorTo: '#da291c', rating: 88, attack: 2.3, defense: 1.0,
    form: ['W', 'W', 'D', 'W', 'W'], homeAdvantage: 0.15, restDays: 5, absences: [],
  },
  {
    id: 'marseille', name: 'Olympique de Marsella', short: 'OM', league: 'Ligue 1', country: 'Francia',
    colorFrom: '#2fafe4', colorTo: '#ffffff', rating: 76, attack: 1.5, defense: 1.2,
    form: ['D', 'L', 'W', 'D', 'W'], homeAdvantage: 0.13, restDays: 5, absences: [],
  },
  {
    id: 'monaco', name: 'AS Mónaco', short: 'ASM', league: 'Ligue 1', country: 'Francia',
    colorFrom: '#e8262c', colorTo: '#ffffff', rating: 75, attack: 1.6, defense: 1.3,
    form: ['W', 'D', 'L', 'W', 'D'], homeAdvantage: 0.12, restDays: 4, absences: [],
  },
  {
    id: 'benfica', name: 'Benfica', short: 'SLB', league: 'Primeira Liga', country: 'Portugal',
    colorFrom: '#e30613', colorTo: '#ffffff', rating: 78, attack: 1.8, defense: 1.1,
    form: ['W', 'W', 'D', 'L', 'W'], homeAdvantage: 0.14, restDays: 6, absences: [],
  },
  {
    id: 'porto', name: 'FC Porto', short: 'POR', league: 'Primeira Liga', country: 'Portugal',
    colorFrom: '#0055a4', colorTo: '#ffffff', rating: 77, attack: 1.7, defense: 1.1,
    form: ['D', 'W', 'W', 'D', 'L'], homeAdvantage: 0.14, restDays: 5, absences: [],
  },
  {
    id: 'ajax', name: 'Ajax', short: 'AJA', league: 'Eredivisie', country: 'Países Bajos',
    colorFrom: '#d2122e', colorTo: '#ffffff', rating: 74, attack: 1.7, defense: 1.3,
    form: ['L', 'D', 'W', 'L', 'D'], homeAdvantage: 0.13, restDays: 5, absences: [],
  },
  {
    id: 'boca-juniors', name: 'Boca Juniors', short: 'BOC', league: 'Liga Profesional', country: 'Argentina',
    colorFrom: '#0a1a5c', colorTo: '#f2c116', rating: 73, attack: 1.4, defense: 1.0,
    form: ['D', 'W', 'D', 'L', 'W'], homeAdvantage: 0.17, restDays: 6, absences: [],
  },
  {
    id: 'river-plate', name: 'River Plate', short: 'RIV', league: 'Liga Profesional', country: 'Argentina',
    colorFrom: '#e5001c', colorTo: '#ffffff', rating: 75, attack: 1.6, defense: 1.0,
    form: ['W', 'W', 'D', 'W', 'L'], homeAdvantage: 0.17, restDays: 5, absences: [],
  },
  {
    id: 'flamengo', name: 'Flamengo', short: 'FLA', league: 'Brasileirão', country: 'Brasil',
    colorFrom: '#e40613', colorTo: '#000000', rating: 76, attack: 1.8, defense: 1.1,
    form: ['W', 'D', 'W', 'W', 'D'], homeAdvantage: 0.17, restDays: 4, absences: [],
  },
];

export const TEAM_MAP: Record<string, Team> = Object.fromEntries(
  TEAMS.map((t) => [t.id, t])
);
