import { useState, useMemo } from 'react';
import { Flame, SlidersHorizontal, X, RefreshCw } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { getDiscoverQueue, getSwipedUserIds } from '../utils/matching';
import SwipeCard from '../components/SwipeCard';
import MatchModal from '../components/MatchModal';
import { UserProfile } from '../types';

export default function DiscoverPage() {
  const { state, allUsers, handleSwipe } = useApp();
  const currentUser = state.currentUser!;

  const [matchedUser, setMatchedUser] = useState<UserProfile | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const swipedIds = useMemo(
    () => getSwipedUserIds(state.swipes, 'romantic'),
    [state.swipes]
  );

  const queue = useMemo(
    () =>
      getDiscoverQueue(
        currentUser,
        allUsers,
        swipedIds,
        state.excludeHomeGym,
        'romantic'
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentUser, allUsers, swipedIds, state.excludeHomeGym, refreshKey]
  );

  function onSwipe(action: 'like' | 'dislike' | 'super-like') {
    if (!queue[0]) return;
    const { isMatch, matchedUser: mu } = handleSwipe(
      queue[0].id,
      action,
      'romantic'
    );
    if (isMatch && mu) {
      setMatchedUser(mu);
    }
  }

  return (
    <div className="flex flex-col h-screen max-h-screen bg-zinc-950">
      {/* ── Header ─────────────────────────────── */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4 shrink-0">
        <div className="flex items-center gap-2">
          <Flame size={22} className="text-orange-500" />
          <h1 className="text-xl font-black text-white">Discover</h1>
        </div>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={`p-2 rounded-xl transition-colors ${
            showFilters || state.excludeHomeGym
              ? 'bg-orange-500/20 text-orange-400'
              : 'bg-zinc-800 text-zinc-400 hover:text-white'
          }`}
        >
          <SlidersHorizontal size={18} />
        </button>
      </div>

      {/* ── Filters ────────────────────────────── */}
      {showFilters && (
        <div className="mx-5 mb-3 p-4 bg-zinc-900 rounded-2xl border border-zinc-800 space-y-3 shrink-0">
          <h3 className="text-sm font-semibold text-white">Filters</h3>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-zinc-300 font-medium">
                Exclude my home gym
              </p>
              <p className="text-xs text-zinc-500">
                Don't show matches from {currentUser.homeGym?.name ?? 'your gym'}
              </p>
            </div>
            <ExcludeToggle />
          </div>
        </div>
      )}

      {/* ── Card stack ─────────────────────────── */}
      <div className="flex-1 relative px-5 min-h-0">
        {queue.length === 0 ? (
          <EmptyState onRefresh={() => setRefreshKey((k) => k + 1)} />
        ) : (
          <div className="relative h-full" style={{ maxHeight: 'calc(100vh - 200px)' }}>
            {/* Next card (behind) */}
            {queue[1] && (
              <SwipeCard
                key={`next-${queue[1].id}`}
                user={queue[1]}
                mode="romantic"
                onSwipe={() => {}}
                isTop={false}
              />
            )}
            {/* Current card */}
            <SwipeCard
              key={`top-${queue[0].id}`}
              user={queue[0]}
              mode="romantic"
              onSwipe={onSwipe}
              isTop={true}
            />

            {/* Action buttons sit below card (fixed spacing) */}
            <div className="absolute -bottom-14 left-0 right-0 flex justify-center gap-5 pointer-events-none" />
          </div>
        )}
      </div>

      {/* Match modal */}
      {matchedUser && (
        <MatchModal
          matchedUser={matchedUser}
          mode="romantic"
          onClose={() => setMatchedUser(null)}
        />
      )}
    </div>
  );
}

function ExcludeToggle() {
  const { state, dispatch } = useApp();
  return (
    <button
      onClick={() => dispatch({ type: 'TOGGLE_EXCLUDE_HOME_GYM' })}
      className={`relative w-11 h-6 rounded-full transition-colors ${
        state.excludeHomeGym ? 'bg-orange-500' : 'bg-zinc-700'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
          state.excludeHomeGym ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

function EmptyState({ onRefresh }: { onRefresh: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center pb-20 gap-5">
      <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center">
        <X size={36} className="text-zinc-600" />
      </div>
      <div>
        <h3 className="text-xl font-bold text-white">No more profiles</h3>
        <p className="text-zinc-400 text-sm mt-1">
          You've seen everyone! Check back later or adjust your filters.
        </p>
      </div>
      <button
        onClick={onRefresh}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors text-sm font-medium"
      >
        <RefreshCw size={15} /> Reset queue
      </button>
    </div>
  );
}
