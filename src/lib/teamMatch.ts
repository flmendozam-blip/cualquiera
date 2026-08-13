import type { Team } from '../types';

function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\b(fc|cf|afc|sad|club|the|de)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Empareja el nombre de un equipo tal como lo devuelve la API de cuotas con nuestra base local. */
export function matchTeam(apiName: string, teams: Team[]): Team | undefined {
  const n = normalize(apiName);
  if (!n) return undefined;
  let found = teams.find((t) => normalize(t.name) === n || normalize(t.short) === n);
  if (found) return found;
  found = teams.find((t) => {
    const tn = normalize(t.name);
    return tn.length > 3 && (tn.includes(n) || n.includes(tn));
  });
  return found;
}
