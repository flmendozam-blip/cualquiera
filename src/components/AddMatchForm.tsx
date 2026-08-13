import { useState } from 'react';
import { useAppState } from '../store/AppState';
import { TeamSelect } from './TeamSelect';
import type { CompetitionType } from '../types';
import { COMPETITION_LABEL } from '../lib/format';

const TODAY = new Date().toISOString().slice(0, 10);

export function AddMatchForm() {
  const { teams, addMatch } = useAppState();
  const [home, setHome] = useState('');
  const [away, setAway] = useState('');
  const [date, setDate] = useState(TODAY);
  const [competition, setCompetition] = useState<CompetitionType>('liga');
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!home || !away) {
      setError('Elige el equipo local y el visitante.');
      return;
    }
    if (home === away) {
      setError('El local y el visitante no pueden ser el mismo equipo.');
      return;
    }
    setError('');
    addMatch(home, away, date, competition);
    setHome('');
    setAway('');
  }

  return (
    <form onSubmit={handleSubmit} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold text-white">1. Indica un partido</h2>
        <p className="text-sm text-slate-400">Elige local, visitante, fecha y tipo de competición. El análisis se genera al instante.</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <TeamSelect teams={teams} value={home} onChange={setHome} excludeId={away} label="Equipo local" />
        <TeamSelect teams={teams} value={away} onChange={setAway} excludeId={home} label="Equipo visitante" />
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-slate-300 font-medium">Fecha del partido</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-pitch-500"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-slate-300 font-medium">Competición</span>
          <select
            value={competition}
            onChange={(e) => setCompetition(e.target.value as CompetitionType)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-pitch-500"
          >
            {Object.entries(COMPETITION_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>
      </div>
      {error && <p className="text-sm text-rose-400">{error}</p>}
      <button
        type="submit"
        className="self-start bg-pitch-600 hover:bg-pitch-500 transition-colors text-white font-semibold px-5 py-2.5 rounded-lg shadow-lg shadow-pitch-900/30"
      >
        + Analizar partido
      </button>
    </form>
  );
}
