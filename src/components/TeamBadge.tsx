import type { Team } from '../types';
import { cn } from '../lib/format';

export function TeamBadge({ team, size = 'md' }: { team: Team; size?: 'sm' | 'md' | 'lg' }) {
  const dims = size === 'sm' ? 'w-7 h-7 text-[10px]' : size === 'lg' ? 'w-14 h-14 text-lg' : 'w-9 h-9 text-xs';
  return (
    <div
      className={cn(dims, 'rounded-full flex items-center justify-center font-bold text-white shrink-0 shadow-inner ring-1 ring-white/10')}
      style={{ background: `linear-gradient(135deg, ${team.colorFrom}, ${team.colorTo})` }}
      title={team.name}
    >
      <span className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]">{team.short}</span>
    </div>
  );
}
