import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from 'react';
import { AppState, UserProfile, SwipeRecord, Match } from '../types';
import { getMatchProbability } from '../utils/matching';
import { MOCK_USERS } from '../data/mockData';

// ─── State ──────────────────────────────────────────────────────────────────

const initialState: AppState = {
  currentUser: null,
  isAuthenticated: false,
  isOnboarded: false,
  swipes: [],
  matches: [],
  excludeHomeGym: false,
};

// ─── Actions ─────────────────────────────────────────────────────────────────

type AppAction =
  | { type: 'LOGIN'; user: UserProfile }
  | { type: 'LOGOUT' }
  | { type: 'COMPLETE_ONBOARDING'; user: UserProfile }
  | { type: 'UPDATE_PROFILE'; updates: Partial<UserProfile> }
  | { type: 'SWIPE'; record: SwipeRecord }
  | { type: 'ADD_MATCH'; match: Match }
  | { type: 'TOGGLE_EXCLUDE_HOME_GYM' }
  | { type: 'HYDRATE'; state: AppState };

// ─── Reducer ─────────────────────────────────────────────────────────────────

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'HYDRATE':
      return action.state;

    case 'LOGIN':
      return {
        ...state,
        currentUser: action.user,
        isAuthenticated: true,
        isOnboarded: true,
      };

    case 'LOGOUT':
      return { ...initialState };

    case 'COMPLETE_ONBOARDING':
      return {
        ...state,
        currentUser: action.user,
        isAuthenticated: true,
        isOnboarded: true,
      };

    case 'UPDATE_PROFILE':
      if (!state.currentUser) return state;
      return {
        ...state,
        currentUser: { ...state.currentUser, ...action.updates },
      };

    case 'SWIPE':
      return {
        ...state,
        swipes: [...state.swipes, action.record],
      };

    case 'ADD_MATCH':
      return {
        ...state,
        matches: [...state.matches, action.match],
      };

    case 'TOGGLE_EXCLUDE_HOME_GYM':
      return { ...state, excludeHomeGym: !state.excludeHomeGym };

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  allUsers: UserProfile[];
  handleSwipe: (
    targetUserId: string,
    action: 'like' | 'dislike' | 'super-like',
    mode: 'romantic' | 'competition'
  ) => { isMatch: boolean; matchedUser: UserProfile | null };
}

const AppContext = createContext<AppContextValue | null>(null);

const STORAGE_KEY = 'rx-match-state';

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Hydrate from localStorage
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const saved = JSON.parse(raw) as AppState;
        dispatch({ type: 'HYDRATE', state: saved });
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  // Persist to localStorage whenever state changes
  useEffect(() => {
    if (state.isAuthenticated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state]);

  function handleSwipe(
    targetUserId: string,
    action: 'like' | 'dislike' | 'super-like',
    mode: 'romantic' | 'competition'
  ): { isMatch: boolean; matchedUser: UserProfile | null } {
    const record: SwipeRecord = {
      userId: targetUserId,
      action,
      type: mode,
      timestamp: Date.now(),
    };

    dispatch({ type: 'SWIPE', record });

    if (action === 'dislike') {
      return { isMatch: false, matchedUser: null };
    }

    const alreadyMatched = state.matches.some(
      (m) => m.userId === targetUserId && m.type === mode
    );

    if (!alreadyMatched && Math.random() < getMatchProbability(action)) {
      const match: Match = {
        userId: targetUserId,
        type: mode,
        matchedAt: Date.now(),
      };
      dispatch({ type: 'ADD_MATCH', match });
      const matchedUser = MOCK_USERS.find((u) => u.id === targetUserId) ?? null;
      return { isMatch: true, matchedUser };
    }

    return { isMatch: false, matchedUser: null };
  }

  return (
    <AppContext.Provider
      value={{ state, dispatch, allUsers: MOCK_USERS, handleSwipe }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
