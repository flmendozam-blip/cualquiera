import { TARGET_MAX, TARGET_MIN } from '../lib/odds';
import { fmtOdds } from '../lib/format';

const SCALE_MIN = 1.0;
const SCALE_MAX = 4.0;

function toPct(v: number): number {
  const clamped = Math.min(Math.max(v, SCALE_MIN), SCALE_MAX);
  return ((clamped - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100;
}

export function OddsGauge({ odds, compact = false }: { odds: number; compact?: boolean }) {
  const bandStart = toPct(TARGET_MIN);
  const bandEnd = toPct(TARGET_MAX);
  const markerPos = toPct(odds);
  const inRange = odds >= TARGET_MIN && odds <= TARGET_MAX;

  return (
    <div className={compact ? 'w-full' : 'w-full max-w-xs'}>
      <div className="relative h-2.5 rounded-full bg-slate-800 overflow-visible">
        <div
          className="absolute inset-y-0 bg-pitch-900/60 border-x border-pitch-500/50"
          style={{ left: `${bandStart}%`, width: `${bandEnd - bandStart}%` }}
        />
        <div
          className="absolute -top-1 w-4 h-4 rounded-full border-2 border-white shadow"
          style={{
            left: `calc(${markerPos}% - 8px)`,
            background: inRange ? '#22c55e' : '#f59e0b',
          }}
        />
      </div>
      {!compact && (
        <div className="flex justify-between text-[10px] text-slate-500 mt-1">
          <span>{SCALE_MIN.toFixed(1)}</span>
          <span className="text-pitch-500 font-semibold">Rango objetivo 1.5–2.0</span>
          <span>{SCALE_MAX.toFixed(1)}+</span>
        </div>
      )}
      {compact && <div className="text-[11px] text-slate-400 mt-1">Cuota: <span className="text-white font-semibold">{fmtOdds(odds)}</span></div>}
    </div>
  );
}
