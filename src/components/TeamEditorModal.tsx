import { useState } from 'react';
import { useAppState } from '../store/AppState';
import type { Absence, ResultChar } from '../types';
import { TeamBadge } from './TeamBadge';

const RESULT_OPTIONS: ResultChar[] = ['L', 'D', 'W'];

export function TeamEditorModal({ teamId, onClose }: { teamId: string; onClose: () => void }) {
  const { getTeam, updateTeam, addAbsence, removeAbsence } = useAppState();
  const team = getTeam(teamId);
  const [absName, setAbsName] = useState('');
  const [absRole, setAbsRole] = useState<Absence['role']>('atacante');
  const [absImpact, setAbsImpact] = useState<Absence['impact']>('alto');

  if (!team) return null;

  function setFormAt(idx: number, value: ResultChar) {
    const next = [...team!.form];
    next[idx] = value;
    updateTeam(team!.id, { form: next });
  }

  function submitAbsence(e: React.FormEvent) {
    e.preventDefault();
    if (!absName.trim()) return;
    addAbsence(team!.id, { name: absName.trim(), role: absRole, impact: absImpact });
    setAbsName('');
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-end" onClick={onClose}>
      <div
        className="w-full sm:w-[420px] h-full bg-slate-900 border-l border-slate-800 p-5 overflow-y-auto flex flex-col gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TeamBadge team={team} size="lg" />
            <div>
              <h3 className="text-lg font-semibold text-white">{team.name}</h3>
              <p className="text-xs text-slate-400">{team.league} · {team.country}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl leading-none">✕</button>
        </div>

        <p className="text-xs text-slate-400 -mt-2">
          Estos datos alimentan el modelo de análisis. Actualízalos con la información real y actual del equipo para obtener recomendaciones más precisas.
        </p>

        <section className="flex flex-col gap-3">
          <h4 className="text-sm font-semibold text-slate-200">Forma reciente (más antiguo → más reciente)</h4>
          <div className="flex gap-1.5">
            {team.form.map((r, i) => (
              <select
                key={i}
                value={r}
                onChange={(e) => setFormAt(i, e.target.value as ResultChar)}
                className={`flex-1 text-center font-bold rounded-lg py-2 border ${
                  r === 'W' ? 'bg-pitch-900/50 border-pitch-600 text-pitch-400' : r === 'D' ? 'bg-amber-900/30 border-amber-600 text-amber-400' : 'bg-rose-900/30 border-rose-600 text-rose-400'
                }`}
              >
                {RESULT_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-xs">
            <span className="text-slate-400">Rating general (1-100)</span>
            <input type="number" min={1} max={100} value={team.rating} onChange={(e) => updateTeam(team.id, { rating: Number(e.target.value) })} className="bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-slate-100" />
          </label>
          <label className="flex flex-col gap-1 text-xs">
            <span className="text-slate-400">Días de descanso</span>
            <input type="number" min={0} max={20} value={team.restDays} onChange={(e) => updateTeam(team.id, { restDays: Number(e.target.value) })} className="bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-slate-100" />
          </label>
          <label className="flex flex-col gap-1 text-xs">
            <span className="text-slate-400">Goles a favor (prom.)</span>
            <input type="number" step={0.1} min={0} value={team.attack} onChange={(e) => updateTeam(team.id, { attack: Number(e.target.value) })} className="bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-slate-100" />
          </label>
          <label className="flex flex-col gap-1 text-xs">
            <span className="text-slate-400">Goles en contra (prom.)</span>
            <input type="number" step={0.1} min={0} value={team.defense} onChange={(e) => updateTeam(team.id, { defense: Number(e.target.value) })} className="bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-slate-100" />
          </label>
          <label className="flex flex-col gap-1 text-xs col-span-2">
            <span className="text-slate-400">Ventaja de localía ({Math.round(team.homeAdvantage * 100)}%)</span>
            <input type="range" min={0} max={25} value={Math.round(team.homeAdvantage * 100)} onChange={(e) => updateTeam(team.id, { homeAdvantage: Number(e.target.value) / 100 })} />
          </label>
        </section>

        <section className="flex flex-col gap-2">
          <h4 className="text-sm font-semibold text-slate-200">Bajas / lesionados / suspendidos</h4>
          <ul className="flex flex-col gap-1.5">
            {team.absences.map((a) => (
              <li key={a.id} className="flex items-center justify-between text-sm bg-slate-800/60 rounded-lg px-3 py-1.5">
                <span>
                  <span className="text-slate-100 font-medium">{a.name}</span>{' '}
                  <span className="text-slate-500 text-xs">({a.role}, impacto {a.impact})</span>
                </span>
                <button onClick={() => removeAbsence(team.id, a.id)} className="text-slate-500 hover:text-rose-400 text-xs">✕</button>
              </li>
            ))}
            {team.absences.length === 0 && <li className="text-xs text-slate-500">Sin bajas registradas.</li>}
          </ul>
          <form onSubmit={submitAbsence} className="grid grid-cols-2 gap-2 bg-slate-800/40 rounded-lg p-3">
            <input placeholder="Nombre del jugador" value={absName} onChange={(e) => setAbsName(e.target.value)} className="col-span-2 bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-sm text-slate-100" />
            <select value={absRole} onChange={(e) => setAbsRole(e.target.value as Absence['role'])} className="bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-sm text-slate-100">
              <option value="atacante">Atacante</option>
              <option value="mediocampista">Mediocampista</option>
              <option value="defensor">Defensor</option>
              <option value="portero">Portero</option>
              <option value="otro">Otro</option>
            </select>
            <select value={absImpact} onChange={(e) => setAbsImpact(e.target.value as Absence['impact'])} className="bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-sm text-slate-100">
              <option value="alto">Impacto alto</option>
              <option value="medio">Impacto medio</option>
              <option value="bajo">Impacto bajo</option>
            </select>
            <button type="submit" className="col-span-2 bg-pitch-600 hover:bg-pitch-500 text-white text-sm font-medium rounded py-1.5">
              + Añadir baja
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
