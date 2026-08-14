import { useState } from 'react';
import { AppStateProvider, useAppState } from './store/AppState';
import { Header } from './components/Header';
import { HowItWorks } from './components/HowItWorks';
import { AddMatchForm } from './components/AddMatchForm';
import { FixtureBrowser } from './components/FixtureBrowser';
import { LiveOddsPanel } from './components/LiveOddsPanel';
import { MatchCard } from './components/MatchCard';
import { BetSlip } from './components/BetSlip';
import { TeamEditorModal } from './components/TeamEditorModal';
import { RefereeEditorModal } from './components/RefereeEditorModal';
import { Disclaimer } from './components/Disclaimer';

function AppContent() {
  const { matches } = useAppState();
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editingRefereeId, setEditingRefereeId] = useState<string | null>(null);

  const [showManualForm, setShowManualForm] = useState(false);

  return (
    <div className="min-h-screen max-w-6xl mx-auto px-4 py-6 flex flex-col gap-6">
      <Header />
      <HowItWorks />
      <FixtureBrowser />

      <div className="grid lg:grid-cols-[1fr_360px] gap-6 items-start">
        <div className="flex flex-col gap-5">
          <div>
            <button
              onClick={() => setShowManualForm((v) => !v)}
              className="text-sm text-slate-400 hover:text-slate-200 underline decoration-dotted"
            >
              {showManualForm ? 'Ocultar' : '¿No encontrás el partido arriba?'} Agregarlo manualmente
            </button>
            {showManualForm && (
              <div className="mt-3">
                <AddMatchForm />
              </div>
            )}
          </div>

          <LiveOddsPanel />

          <div>
            <h2 className="text-lg font-semibold text-white mb-1">Partidos analizados</h2>
            <p className="text-sm text-slate-400 mb-3">
              {matches.length === 0
                ? 'Todavía no agregaste ningún partido — elegí uno de la lista de arriba.'
                : `${matches.length} partido${matches.length === 1 ? '' : 's'} en análisis.`}
            </p>
            <div className="flex flex-col gap-4">
              {matches.map((m) => (
                <MatchCard key={m.id} match={m} onEditTeam={setEditingTeamId} onEditReferee={setEditingRefereeId} />
              ))}
              {matches.length === 0 && (
                <div className="text-sm text-slate-500 border border-dashed border-slate-700 rounded-2xl p-8 text-center">
                  Elegí un partido de "Explorar partidos reales" arriba para empezar.
                </div>
              )}
            </div>
          </div>
        </div>

        <BetSlip />
      </div>

      <Disclaimer />

      {editingTeamId && <TeamEditorModal teamId={editingTeamId} onClose={() => setEditingTeamId(null)} />}
      {editingRefereeId && <RefereeEditorModal refereeId={editingRefereeId} onClose={() => setEditingRefereeId(null)} />}
    </div>
  );
}

export default function App() {
  return (
    <AppStateProvider>
      <AppContent />
    </AppStateProvider>
  );
}
