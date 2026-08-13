export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function pct(p: number): string {
  return `${Math.round(p * 100)}%`;
}

export function fmtOdds(o: number): string {
  if (!isFinite(o)) return '—';
  return o.toFixed(2);
}

export function fmtDate(iso: string): string {
  try {
    const d = new Date(iso + 'T12:00:00');
    return d.toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit', month: 'short' });
  } catch {
    return iso;
  }
}

export function fmtDateTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString('es-ES', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
}

export const COMPETITION_LABEL: Record<string, string> = {
  liga: 'Liga',
  copa: 'Copa',
  continental: 'Continental',
  derbi: 'Derbi / Clásico',
  amistoso: 'Amistoso',
};
