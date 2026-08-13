import { useState } from 'react';
import { useAppState } from '../store/AppState';

export function RefereePicker({ matchId }: { matchId: string }) {
  const { referees, ensureReferee, setMatchReferee } = useAppState();
  const [selected, setSelected] = useState('');
  const [newName, setNewName] = useState('');

  function assign() {
    if (selected === '__new__') {
      if (!newName.trim()) return;
      const id = ensureReferee(newName.trim());
      setMatchReferee(matchId, id);
      setNewName('');
    } else if (selected) {
      setMatchReferee(matchId, selected);
    }
  }

  return (
    <div className="bg-slate-800/40 border border-dashed border-slate-700 rounded-xl p-3 flex flex-col gap-2">
      <p className="text-xs text-slate-400">
        🟨 Sin árbitro asignado — el mercado de tarjetas usará solo el promedio de ambos equipos. Asigna uno para afinar el análisis.
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-sm text-slate-100"
        >
          <option value="">Elegir árbitro…</option>
          {referees.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name} ({r.avgCardsPerMatch.toFixed(1)} tarjetas/partido)
            </option>
          ))}
          <option value="__new__">+ Nuevo árbitro…</option>
        </select>
        {selected === '__new__' && (
          <input
            type="text"
            placeholder="Nombre del árbitro"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-sm text-slate-100"
          />
        )}
        <button
          onClick={assign}
          disabled={!selected || (selected === '__new__' && !newName.trim())}
          className="bg-slate-100 hover:bg-white disabled:opacity-40 text-slate-900 text-sm font-medium rounded-lg px-3 py-1.5"
        >
          Asignar
        </button>
      </div>
    </div>
  );
}
