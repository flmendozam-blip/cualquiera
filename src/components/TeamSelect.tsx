import type { Team } from '../types';

export function TeamSelect({
  teams,
  value,
  onChange,
  excludeId,
  label,
}: {
  teams: Team[];
  value: string;
  onChange: (id: string) => void;
  excludeId?: string;
  label: string;
}) {
  const byLeague = new Map<string, Team[]>();
  for (const t of teams) {
    if (t.id === excludeId) continue;
    if (!byLeague.has(t.league)) byLeague.set(t.league, []);
    byLeague.get(t.league)!.push(t);
  }

  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-slate-300 font-medium">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-pitch-500"
      >
        <option value="">Selecciona un equipo…</option>
        {[...byLeague.entries()].map(([league, list]) => (
          <optgroup key={league} label={league}>
            {list.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.country})
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </label>
  );
}
