import { useState } from 'react';
import type { H2HMatch, Team } from '../types';
import { fmtDate } from '../lib/format';

export function H2HEditor({
  home,
  away,
  records,
  onAdd,
  onRemove,
}: {
  home: Team;
  away: Team;
  records: H2HMatch[];
  onAdd: (record: Omit<H2HMatch, 'id'>) => void;
  onRemove: (id: string) => void;
}) {
  const [date, setDate] = useState('');
  const [homeIsHost, setHomeIsHost] = useState(true);
  const [scoreHost, setScoreHost] = useState(0);
  const [scoreGuest, setScoreGuest] = useState(0);
  const [competition, setCompetition] = useState('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!date) return;
    const hostTeam = homeIsHost ? home : away;
    onAdd({
      teamAId: home.id,
      teamBId: away.id,
      date,
      homeTeamId: hostTeam.id,
      scoreHome: scoreHost,
      scoreAway: scoreGuest,
      competition: competition || 'Amistoso',
    });
    setDate('');
    setScoreHost(0);
    setScoreGuest(0);
    setCompetition('');
  }

  return (
    <div className="flex flex-col gap-3">
      {records.length === 0 && (
        <p className="text-sm text-slate-400">Sin enfrentamientos cargados todavía. Agrega el historial real si lo conoces.</p>
      )}
      <ul className="flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-1">
        {records.map((r) => {
          const hostTeam = r.homeTeamId === home.id ? home : away;
          const guestTeam = r.homeTeamId === home.id ? away : home;
          return (
            <li key={r.id} className="flex items-center justify-between gap-2 text-sm bg-slate-800/60 rounded-lg px-3 py-1.5">
              <span className="text-slate-300">
                {fmtDate(r.date)} · <span className="text-slate-100 font-medium">{hostTeam.short}</span> {r.scoreHome}-{r.scoreAway} <span className="text-slate-100 font-medium">{guestTeam.short}</span>
                <span className="text-slate-500"> · {r.competition}</span>
              </span>
              <button onClick={() => onRemove(r.id)} className="text-slate-500 hover:text-rose-400 text-xs shrink-0" aria-label="Eliminar">
                ✕
              </button>
            </li>
          );
        })}
      </ul>
      <form onSubmit={submit} className="grid grid-cols-2 sm:grid-cols-6 gap-2 items-end bg-slate-800/40 rounded-lg p-3">
        <label className="flex flex-col gap-1 text-xs col-span-2 sm:col-span-2">
          <span className="text-slate-400">Fecha</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-100 text-sm" />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span className="text-slate-400">Local</span>
          <select value={homeIsHost ? 'home' : 'away'} onChange={(e) => setHomeIsHost(e.target.value === 'home')} className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-100 text-sm">
            <option value="home">{home.short}</option>
            <option value="away">{away.short}</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span className="text-slate-400">Marcador</span>
          <div className="flex gap-1">
            <input type="number" min={0} value={scoreHost} onChange={(e) => setScoreHost(Number(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-100 text-sm" />
            <input type="number" min={0} value={scoreGuest} onChange={(e) => setScoreGuest(Number(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-100 text-sm" />
          </div>
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span className="text-slate-400">Competición</span>
          <input type="text" placeholder="Liga…" value={competition} onChange={(e) => setCompetition(e.target.value)} className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-100 text-sm" />
        </label>
        <button type="submit" className="bg-pitch-600 hover:bg-pitch-500 text-white text-sm font-medium rounded px-3 py-1.5">
          Agregar
        </button>
      </form>
    </div>
  );
}
