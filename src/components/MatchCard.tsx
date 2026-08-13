import { useMemo, useState } from 'react';
import { useAppState } from '../store/AppState';
import type { MatchEntry, MarketKey } from '../types';
import { analyzeMatch } from '../lib/analysis';
import { h2hForPair } from '../data/h2h';
import { TeamBadge } from './TeamBadge';
import { OddsGauge } from './OddsGauge';
import { H2HEditor } from './H2HEditor';
import { RefereePicker } from './RefereePicker';
import { cn, fmtDate, fmtOdds, pct, COMPETITION_LABEL } from '../lib/format';

const CONFIDENCE_STYLE: Record<string, string> = {
  Alta: 'bg-pitch-900/50 text-pitch-400 border-pitch-600',
  Media: 'bg-amber-900/30 text-amber-400 border-amber-600',
  Baja: 'bg-rose-900/30 text-rose-400 border-rose-600',
};

export function MatchCard({
  match,
  onEditTeam,
  onEditReferee,
}: {
  match: MatchEntry;
  onEditTeam: (teamId: string) => void;
  onEditReferee: (refereeId: string) => void;
}) {
  const { getTeam, getReferee, h2h, removeMatch, addH2HMatch, removeH2HMatch, betSlip, addLeg, removeLeg } = useAppState();
  const home = getTeam(match.homeTeamId);
  const away = getTeam(match.awayTeamId);
  const referee = getReferee(match.refereeId);
  const [showDetails, setShowDetails] = useState(false);
  const [showH2H, setShowH2H] = useState(false);
  const [showAllMarkets, setShowAllMarkets] = useState(false);

  const analysis = useMemo(() => {
    if (!home || !away) return null;
    return analyzeMatch(match, home, away, h2h, referee);
  }, [match, home, away, h2h, referee]);

  const pairH2H = useMemo(() => (home && away ? h2hForPair(home.id, away.id, h2h) : []), [home, away, h2h]);

  const currentLeg = betSlip.find((l) => l.matchId === match.id);

  if (!home || !away || !analysis) return null;

  const totalXg = analysis.xgHome + analysis.xgAway;
  const homeXgPct = totalXg > 0 ? (analysis.xgHome / totalXg) * 100 : 50;

  const marketsToShow = showAllMarkets ? analysis.markets : analysis.markets.slice().sort((a, b) => b.probability - a.probability).slice(0, 4);

  function pickMarket(key: MarketKey) {
    if (currentLeg?.marketKey === key) {
      removeLeg(match.id);
    } else {
      addLeg(match.id, key);
    }
  }

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
      <div className="p-5 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <button onClick={() => onEditTeam(home.id)} className="flex items-center gap-2 group">
              <TeamBadge team={home} />
              <span className="font-semibold text-white group-hover:text-pitch-400 transition-colors">{home.name}</span>
            </button>
            <span className="text-slate-500 text-sm">vs</span>
            <button onClick={() => onEditTeam(away.id)} className="flex items-center gap-2 group">
              <span className="font-semibold text-white group-hover:text-pitch-400 transition-colors">{away.name}</span>
              <TeamBadge team={away} />
            </button>
          </div>
          <button onClick={() => removeMatch(match.id)} className="text-slate-500 hover:text-rose-400 text-sm" aria-label="Eliminar partido">
            ✕
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <span className="bg-slate-800 rounded-full px-2.5 py-1">{fmtDate(match.date)}</span>
          <span className="bg-slate-800 rounded-full px-2.5 py-1">{COMPETITION_LABEL[match.competition]}</span>
          <span className={cn('rounded-full px-2.5 py-1 border font-medium', CONFIDENCE_STYLE[analysis.confidence])}>
            Confianza {analysis.confidence} ({analysis.confidenceScore})
          </span>
        </div>

        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>xG {home.short}: <span className="text-slate-200 font-semibold">{analysis.xgHome.toFixed(2)}</span></span>
            <span>xG {away.short}: <span className="text-slate-200 font-semibold">{analysis.xgAway.toFixed(2)}</span></span>
          </div>
          <div className="h-2 rounded-full bg-slate-800 overflow-hidden flex">
            <div className="h-full" style={{ width: `${homeXgPct}%`, background: home.colorFrom }} />
            <div className="h-full flex-1" style={{ background: away.colorTo }} />
          </div>
        </div>

        <div className="flex gap-3 text-xs text-slate-400">
          <span className="bg-slate-800/60 rounded-lg px-2.5 py-1.5 flex-1 text-center">
            🚩 Córners esp. <span className="text-slate-200 font-semibold">{analysis.expectedCorners.toFixed(1)}</span>
          </span>
          <span className="bg-slate-800/60 rounded-lg px-2.5 py-1.5 flex-1 text-center">
            🟨 Tarjetas esp. <span className="text-slate-200 font-semibold">{analysis.expectedCards.toFixed(1)}</span>
          </span>
        </div>

        {referee ? (
          <button
            onClick={() => onEditReferee(referee.id)}
            className="flex items-center justify-between gap-2 bg-slate-800/40 border border-slate-700 rounded-xl px-3 py-2 text-left hover:border-slate-500"
          >
            <span className="text-sm text-slate-200">🟨 Árbitro: <span className="font-medium">{referee.name}</span></span>
            <span className="text-xs text-slate-400">{referee.avgCardsPerMatch.toFixed(1)} tarjetas/partido</span>
          </button>
        ) : (
          <RefereePicker matchId={match.id} />
        )}

        {analysis.recommended && (
          <div className="bg-slate-800/60 border border-pitch-700/40 rounded-xl p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <p className="text-xs text-slate-400">Pronóstico recomendado</p>
                <p className="text-white font-semibold">{analysis.recommended.label}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">Probabilidad · Cuota est.</p>
                <p className="text-pitch-400 font-bold text-lg">
                  {pct(analysis.recommended.probability)} <span className="text-white">· {fmtOdds(analysis.recommended.marketOdds)}</span>
                </p>
              </div>
            </div>
            <OddsGauge odds={analysis.recommended.marketOdds} />
            <button
              onClick={() => pickMarket(analysis.recommended!.key)}
              className={cn(
                'mt-1 rounded-lg py-2 text-sm font-semibold transition-colors',
                currentLeg?.marketKey === analysis.recommended.key
                  ? 'bg-pitch-600 text-white'
                  : 'bg-slate-700 hover:bg-slate-600 text-slate-100'
              )}
            >
              {currentLeg?.marketKey === analysis.recommended.key ? '✓ En tu boleto' : '+ Agregar al boleto'}
            </button>
          </div>
        )}

        {match.realOdds && (
          <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-3 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">
                Cuota real {match.realOdds.isLive ? '🔴 en vivo' : 'pre-partido'} vía{' '}
                <span className="text-slate-200 font-medium">{match.realOdds.bookmaker}</span>
              </span>
              <span className={cn('rounded-full px-2 py-0.5', match.realOdds.isBetano ? 'bg-pitch-900/50 text-pitch-400' : 'bg-slate-700 text-slate-400')}>
                {match.realOdds.isBetano ? 'Betano' : 'Betano no disponible aquí'}
              </span>
            </div>
            <div className="flex gap-4 text-sm">
              <span className={cn(analysis.recommended?.key === '1' && 'text-pitch-400 font-bold')}>1: {fmtOdds(match.realOdds.home)}</span>
              <span className={cn(analysis.recommended?.key === 'X' && 'text-pitch-400 font-bold')}>X: {fmtOdds(match.realOdds.draw)}</span>
              <span className={cn(analysis.recommended?.key === '2' && 'text-pitch-400 font-bold')}>2: {fmtOdds(match.realOdds.away)}</span>
            </div>
          </div>
        )}

        <div>
          <button onClick={() => setShowAllMarkets((v) => !v)} className="text-xs text-slate-400 hover:text-slate-200 mb-2">
            {showAllMarkets ? 'Ver menos mercados' : `Ver todos los mercados (${analysis.markets.length})`}
          </button>
          <div className="flex flex-col gap-1.5">
            {marketsToShow.map((m) => (
              <button
                key={m.key}
                onClick={() => pickMarket(m.key)}
                className={cn(
                  'flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm border transition-colors text-left',
                  currentLeg?.marketKey === m.key
                    ? 'bg-pitch-900/40 border-pitch-600'
                    : 'bg-slate-800/40 border-slate-800 hover:border-slate-600'
                )}
              >
                <span className="text-slate-200">{m.label}</span>
                <span className="flex items-center gap-2 shrink-0">
                  <span className="text-slate-400">{pct(m.probability)}</span>
                  <span className={cn('font-semibold', m.inTargetRange ? 'text-pitch-400' : 'text-slate-300')}>{fmtOdds(m.marketOdds)}</span>
                  {m.inTargetRange && <span className="text-[10px] bg-pitch-900/60 text-pitch-400 rounded-full px-1.5 py-0.5">🎯</span>}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-3 text-xs">
          <button onClick={() => setShowDetails((v) => !v)} className="text-slate-400 hover:text-slate-200 underline decoration-dotted">
            {showDetails ? 'Ocultar análisis' : '¿Por qué esta recomendación?'}
          </button>
          <button onClick={() => setShowH2H((v) => !v)} className="text-slate-400 hover:text-slate-200 underline decoration-dotted">
            Historial H2H ({analysis.h2hSummary.total})
          </button>
        </div>

        {showDetails && (
          <ul className="text-sm text-slate-300 flex flex-col gap-1.5 bg-slate-950/40 rounded-xl p-4 list-disc list-inside">
            {analysis.narrative.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        )}

        {showH2H && (
          <div className="bg-slate-950/40 rounded-xl p-4">
            <H2HEditor
              home={home}
              away={away}
              records={pairH2H}
              onAdd={addH2HMatch}
              onRemove={removeH2HMatch}
            />
          </div>
        )}
      </div>
    </div>
  );
}
