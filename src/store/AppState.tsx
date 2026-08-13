import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { Team, H2HMatch, MatchEntry, BetLeg, Absence, MarketKey, CompetitionType } from '../types';
import { TEAMS } from '../data/teams';
import { H2H_SEED } from '../data/h2h';

let uid = 1000;
const nextId = (prefix: string) => `${prefix}-${uid++}`;

interface AppStateValue {
  teams: Team[];
  h2h: H2HMatch[];
  matches: MatchEntry[];
  betSlip: BetLeg[];
  getTeam: (id: string) => Team | undefined;
  addMatch: (homeTeamId: string, awayTeamId: string, date: string, competition: CompetitionType) => void;
  removeMatch: (matchId: string) => void;
  updateTeam: (teamId: string, patch: Partial<Team>) => void;
  addAbsence: (teamId: string, absence: Omit<Absence, 'id'>) => void;
  removeAbsence: (teamId: string, absenceId: string) => void;
  addH2HMatch: (record: Omit<H2HMatch, 'id'>) => void;
  removeH2HMatch: (recordId: string) => void;
  addLeg: (matchId: string, marketKey: MarketKey) => void;
  removeLeg: (matchId: string) => void;
  clearSlip: () => void;
}

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [teams, setTeams] = useState<Team[]>(() => TEAMS.map((t) => ({ ...t, absences: [...t.absences], form: [...t.form] })));
  const [h2h, setH2h] = useState<H2HMatch[]>(() => [...H2H_SEED]);
  const [matches, setMatches] = useState<MatchEntry[]>([]);
  const [betSlip, setBetSlip] = useState<BetLeg[]>([]);

  const getTeam = useCallback((id: string) => teams.find((t) => t.id === id), [teams]);

  const addMatch = useCallback((homeTeamId: string, awayTeamId: string, date: string, competition: CompetitionType) => {
    setMatches((prev) => [
      ...prev,
      { id: nextId('match'), homeTeamId, awayTeamId, date, competition, notes: '' },
    ]);
  }, []);

  const removeMatch = useCallback((matchId: string) => {
    setMatches((prev) => prev.filter((m) => m.id !== matchId));
    setBetSlip((prev) => prev.filter((l) => l.matchId !== matchId));
  }, []);

  const updateTeam = useCallback((teamId: string, patch: Partial<Team>) => {
    setTeams((prev) => prev.map((t) => (t.id === teamId ? { ...t, ...patch } : t)));
  }, []);

  const addAbsence = useCallback((teamId: string, absence: Omit<Absence, 'id'>) => {
    setTeams((prev) =>
      prev.map((t) =>
        t.id === teamId ? { ...t, absences: [...t.absences, { ...absence, id: nextId('abs') }] } : t
      )
    );
  }, []);

  const removeAbsence = useCallback((teamId: string, absenceId: string) => {
    setTeams((prev) =>
      prev.map((t) => (t.id === teamId ? { ...t, absences: t.absences.filter((a) => a.id !== absenceId) } : t))
    );
  }, []);

  const addH2HMatch = useCallback((record: Omit<H2HMatch, 'id'>) => {
    setH2h((prev) => [...prev, { ...record, id: nextId('h2h') }]);
  }, []);

  const removeH2HMatch = useCallback((recordId: string) => {
    setH2h((prev) => prev.filter((r) => r.id !== recordId));
  }, []);

  const addLeg = useCallback((matchId: string, marketKey: MarketKey) => {
    setBetSlip((prev) => {
      const withoutMatch = prev.filter((l) => l.matchId !== matchId);
      return [...withoutMatch, { matchId, marketKey }];
    });
  }, []);

  const removeLeg = useCallback((matchId: string) => {
    setBetSlip((prev) => prev.filter((l) => l.matchId !== matchId));
  }, []);

  const clearSlip = useCallback(() => setBetSlip([]), []);

  const value = useMemo(
    () => ({
      teams,
      h2h,
      matches,
      betSlip,
      getTeam,
      addMatch,
      removeMatch,
      updateTeam,
      addAbsence,
      removeAbsence,
      addH2HMatch,
      removeH2HMatch,
      addLeg,
      removeLeg,
      clearSlip,
    }),
    [teams, h2h, matches, betSlip, getTeam, addMatch, removeMatch, updateTeam, addAbsence, removeAbsence, addH2HMatch, removeH2HMatch, addLeg, removeLeg, clearSlip]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppStateValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState debe usarse dentro de AppStateProvider');
  return ctx;
}
