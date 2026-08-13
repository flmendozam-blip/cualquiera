import { useMemo } from 'react';
import { useAppState } from '../store/AppState';
import { analyzeMatch } from '../lib/analysis';
import { comboOdds, comboProbability, isInTargetRange, TARGET_MIN } from '../lib/odds';
import { fmtOdds, pct, fmtDate } from '../lib/format';
import { OddsGauge } from './OddsGauge';

export function BetSlip() {
  const { matches, h2h, betSlip, getTeam, getReferee, removeLeg, clearSlip } = useAppState();

  const legs = useMemo(() => {
    return betSlip
      .map((leg) => {
        const match = matches.find((m) => m.id === leg.matchId);
        if (!match) return null;
        const home = getTeam(match.homeTeamId);
        const away = getTeam(match.awayTeamId);
        if (!home || !away) return null;
        const referee = getReferee(match.refereeId);
        const analysis = analyzeMatch(match, home, away, h2h, referee);
        const market = analysis.markets.find((mk) => mk.key === leg.marketKey);
        if (!market) return null;
        return { match, home, away, market };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
  }, [betSlip, matches, h2h, getTeam, getReferee]);

  const combo = comboOdds(legs.map((l) => l.market.marketOdds));
  const comboProb = comboProbability(legs.map((l) => l.market.probability));
  const inRange = legs.length > 0 && isInTargetRange(combo);

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4 sticky top-4">
      <div>
        <h2 className="text-lg font-semibold text-white">3. Tu boleto</h2>
        <p className="text-sm text-slate-400">
          {legs.length === 0
            ? 'Agrega selecciones desde los partidos analizados. Una sola = apuesta simple. Dos o más = combinada.'
            : legs.length === 1
            ? 'Apuesta simple.'
            : `Apuesta combinada de ${legs.length} selecciones.`}
        </p>
      </div>

      {legs.length === 0 && (
        <div className="text-sm text-slate-500 border border-dashed border-slate-700 rounded-xl p-6 text-center">
          Aún no has añadido ninguna selección.
        </div>
      )}

      <ul className="flex flex-col gap-2">
        {legs.map(({ match, home, away, market }) => (
          <li key={match.id} className="bg-slate-800/50 rounded-xl p-3 flex flex-col gap-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs text-slate-400">
                  {home.short} vs {away.short} · {fmtDate(match.date)}
                </p>
                <p className="text-sm text-white font-medium">{market.label}</p>
              </div>
              <button onClick={() => removeLeg(match.id)} className="text-slate-500 hover:text-rose-400 text-xs shrink-0">
                ✕
              </button>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Prob. {pct(market.probability)}</span>
              <span className="font-semibold text-slate-100">{fmtOdds(market.marketOdds)}</span>
            </div>
          </li>
        ))}
      </ul>

      {legs.length > 0 && (
        <>
          <div className="border-t border-slate-800 pt-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 text-sm">Cuota combinada</span>
              <span className="text-2xl font-bold text-white">{fmtOdds(combo)}</span>
            </div>
            <OddsGauge odds={combo} />
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Probabilidad combinada estimada</span>
              <span className="font-semibold text-slate-100">{pct(comboProb)}</span>
            </div>
            <div
              className={`text-sm rounded-lg px-3 py-2 border ${
                inRange
                  ? 'bg-pitch-900/40 border-pitch-600 text-pitch-300'
                  : combo < TARGET_MIN
                  ? 'bg-slate-800 border-slate-700 text-slate-300'
                  : 'bg-amber-900/30 border-amber-600 text-amber-300'
              }`}
            >
              {inRange
                ? '🎯 Dentro del rango objetivo (1.5–2.0): buen equilibrio entre riesgo y recompensa.'
                : combo < TARGET_MIN
                ? 'Cuota por debajo de 1.5: es muy segura pero paga poco. Puedes añadir otra selección para subirla.'
                : 'Cuota por encima de 2.0: quita alguna selección o cambia a mercados más probables para bajar el riesgo.'}
            </div>
            {legs.length >= 4 && (
              <p className="text-xs text-amber-400">
                ⚠️ Con {legs.length} selecciones combinadas, un solo fallo revienta todo el boleto. La probabilidad real de acertarlas todas es de solo {pct(comboProb)}.
              </p>
            )}
          </div>
          <button onClick={clearSlip} className="text-sm text-slate-400 hover:text-rose-400 self-start">
            Vaciar boleto
          </button>
        </>
      )}
    </div>
  );
}
