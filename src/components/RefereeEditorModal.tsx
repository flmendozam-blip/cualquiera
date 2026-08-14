import { useAppState } from '../store/AppState';
import { LEAGUE_AVG_CARDS_PER_MATCH } from '../data/referees';

export function RefereeEditorModal({ refereeId, onClose }: { refereeId: string; onClose: () => void }) {
  const { getReferee, updateReferee } = useAppState();
  const referee = getReferee(refereeId);
  if (!referee) return null;

  const strictness =
    referee.avgCardsPerMatch >= LEAGUE_AVG_CARDS_PER_MATCH * 1.2
      ? 'Riguroso'
      : referee.avgCardsPerMatch <= LEAGUE_AVG_CARDS_PER_MATCH * 0.8
      ? 'Permisivo'
      : 'Promedio';

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-end" onClick={onClose}>
      <div
        className="w-full sm:w-[380px] h-full bg-slate-900 border-l border-slate-800 p-5 overflow-y-auto flex flex-col gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">🟨 {referee.name}</h3>
            <p className="text-xs text-slate-400">
              {strictness} · {referee.source === 'seed' ? 'ejemplo' : 'manual'}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl leading-none">✕</button>
        </div>

        <p className="text-xs text-slate-400 -mt-2">
          El promedio de tarjetas del árbitro ajusta el mercado de tarjetas del partido. Si conoces sus estadísticas reales
          de la temporada, actualízalas aquí.
        </p>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-slate-300 font-medium">Nombre</span>
          <input
            type="text"
            value={referee.name}
            onChange={(e) => updateReferee(referee.id, { name: e.target.value })}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-xs">
            <span className="text-slate-400">Promedio de tarjetas / partido (ambos equipos)</span>
            <input
              type="number"
              step={0.1}
              min={0}
              value={referee.avgCardsPerMatch}
              onChange={(e) => updateReferee(referee.id, { avgCardsPerMatch: Number(e.target.value) })}
              className="bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-slate-100"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs">
            <span className="text-slate-400">Partidos usados para el promedio</span>
            <input
              type="number"
              min={0}
              value={referee.matchesSample}
              onChange={(e) => updateReferee(referee.id, { matchesSample: Number(e.target.value) })}
              className="bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-slate-100"
            />
          </label>
        </div>

        <p className="text-xs text-slate-500">
          Referencia: el promedio típico en las ligas seguidas por esta app ronda {LEAGUE_AVG_CARDS_PER_MATCH.toFixed(1)}{' '}
          tarjetas por partido.
        </p>
      </div>
    </div>
  );
}
