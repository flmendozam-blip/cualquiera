import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { Team, H2HMatch, MatchEntry, BetLeg, Absence, MarketKey, CompetitionType, RealOddsSnapshot, Referee } from '../types';
import { TEAMS, createNeutralTeam } from '../data/teams';
import { H2H_SEED } from '../data/h2h';
import { REFEREES, LEAGUE_AVG_CARDS_PER_MATCH } from '../data/referees';
import { matchTeam } from '../lib/teamMatch';

let uid = 1000;
const nextId = (prefix: string) => `${prefix}-${uid++}`;

const ODDS_API_KEY_STORAGE = 'oddsApiKey';
const API_FOOTBALL_KEY_STORAGE = 'apiFootballKey';

interface AppStateValue {
  teams: Team[];
  h2h: H2HMatch[];
  matches: MatchEntry[];
  betSlip: BetLeg[];
  referees: Referee[];
  oddsApiKey: string;
  setOddsApiKey: (key: string) => void;
  apiFootballKey: string;
  setApiFootballKey: (key: string) => void;
  getTeam: (id: string) => Team | undefined;
  getReferee: (id?: string) => Referee | undefined;
  addMatch: (
    homeTeamId: string,
    awayTeamId: string,
    date: string,
    competition: CompetitionType,
    extra?: { realOdds?: RealOddsSnapshot; refereeId?: string }
  ) => void;
  removeMatch: (matchId: string) => void;
  setMatchReferee: (matchId: string, refereeId: string | undefined) => void;
  updateTeam: (teamId: string, patch: Partial<Team>) => void;
  ensureTeam: (name: string, short: string, league: string, country: string) => string;
  addAbsence: (teamId: string, absence: Omit<Absence, 'id'>) => void;
  removeAbsence: (teamId: string, absenceId: string) => void;
  addH2HMatch: (record: Omit<H2HMatch, 'id'>) => void;
  removeH2HMatch: (recordId: string) => void;
  addReferee: (r: Omit<Referee, 'id'>) => string;
  updateReferee: (id: string, patch: Partial<Referee>) => void;
  ensureReferee: (name: string) => string;
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
  const [referees, setReferees] = useState<Referee[]>(() => [...REFEREES]);
  const [oddsApiKey, setOddsApiKeyState] = useState<string>(
    () => localStorage.getItem(ODDS_API_KEY_STORAGE) ?? ''
  );
  const [apiFootballKey, setApiFootballKeyState] = useState<string>(
    () => localStorage.getItem(API_FOOTBALL_KEY_STORAGE) ?? ''
  );

  const setOddsApiKey = useCallback((key: string) => {
    setOddsApiKeyState(key);
    if (key) localStorage.setItem(ODDS_API_KEY_STORAGE, key);
    else localStorage.removeItem(ODDS_API_KEY_STORAGE);
  }, []);

  const setApiFootballKey = useCallback((key: string) => {
    setApiFootballKeyState(key);
    if (key) localStorage.setItem(API_FOOTBALL_KEY_STORAGE, key);
    else localStorage.removeItem(API_FOOTBALL_KEY_STORAGE);
  }, []);

  const getTeam = useCallback((id: string) => teams.find((t) => t.id === id), [teams]);
  const getReferee = useCallback((id?: string) => (id ? referees.find((r) => r.id === id) : undefined), [referees]);

  const addMatch = useCallback(
    (
      homeTeamId: string,
      awayTeamId: string,
      date: string,
      competition: CompetitionType,
      extra?: { realOdds?: RealOddsSnapshot; refereeId?: string }
    ) => {
      setMatches((prev) => [
        ...prev,
        {
          id: nextId('match'),
          homeTeamId,
          awayTeamId,
          date,
          competition,
          notes: '',
          realOdds: extra?.realOdds,
          refereeId: extra?.refereeId,
        },
      ]);
    },
    []
  );

  const removeMatch = useCallback((matchId: string) => {
    setMatches((prev) => prev.filter((m) => m.id !== matchId));
    setBetSlip((prev) => prev.filter((l) => l.matchId !== matchId));
  }, []);

  const setMatchReferee = useCallback((matchId: string, refereeId: string | undefined) => {
    setMatches((prev) => prev.map((m) => (m.id === matchId ? { ...m, refereeId } : m)));
  }, []);

  const updateTeam = useCallback((teamId: string, patch: Partial<Team>) => {
    setTeams((prev) => prev.map((t) => (t.id === teamId ? { ...t, ...patch } : t)));
  }, []);

  const ensureTeam = useCallback(
    (name: string, short: string, league: string, country: string): string => {
      const existing = matchTeam(name, teams);
      if (existing) return existing.id;
      const slug = name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      const created = createNeutralTeam(`ext-${slug}`, name, short, league, country);
      setTeams((prev) => [...prev, created]);
      return created.id;
    },
    [teams]
  );

  const addReferee = useCallback((r: Omit<Referee, 'id'>): string => {
    const id = nextId('ref');
    setReferees((prev) => [...prev, { ...r, id }]);
    return id;
  }, []);

  const updateReferee = useCallback((id: string, patch: Partial<Referee>) => {
    setReferees((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }, []);

  const ensureReferee = useCallback(
    (name: string): string => {
      const existing = referees.find((r) => r.name.toLowerCase() === name.toLowerCase());
      if (existing) return existing.id;
      const id = nextId('ref');
      setReferees((prev) => [
        ...prev,
        { id, name, avgCardsPerMatch: LEAGUE_AVG_CARDS_PER_MATCH, matchesSample: 0, source: 'manual' },
      ]);
      return id;
    },
    [referees]
  );

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
      referees,
      oddsApiKey,
      setOddsApiKey,
      apiFootballKey,
      setApiFootballKey,
      getTeam,
      getReferee,
      addMatch,
      removeMatch,
      setMatchReferee,
      updateTeam,
      ensureTeam,
      addAbsence,
      removeAbsence,
      addH2HMatch,
      removeH2HMatch,
      addReferee,
      updateReferee,
      ensureReferee,
      addLeg,
      removeLeg,
      clearSlip,
    }),
    [
      teams,
      h2h,
      matches,
      betSlip,
      referees,
      oddsApiKey,
      setOddsApiKey,
      apiFootballKey,
      setApiFootballKey,
      getTeam,
      getReferee,
      addMatch,
      removeMatch,
      setMatchReferee,
      updateTeam,
      ensureTeam,
      addAbsence,
      removeAbsence,
      addH2HMatch,
      removeH2HMatch,
      addReferee,
      updateReferee,
      ensureReferee,
      addLeg,
      removeLeg,
      clearSlip,
    ]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppStateValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState debe usarse dentro de AppStateProvider');
  return ctx;
}
