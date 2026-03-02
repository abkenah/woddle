import { useState, useMemo } from 'react';
import { Trophy, SlidersHorizontal, X, RefreshCw, Info } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { getDiscoverQueue, getSwipedUserIds } from '../utils/matching';
import SwipeCard from '../components/SwipeCard';
import MatchModal from '../components/MatchModal';
import { UserProfile } from '../types';

export default function CompetitionPage() {
  const { state, allUsers, handleSwipe } = useApp();
  const currentUser = state.currentUser!;

  const [matchedUser, setMatchedUser] = useState<UserProfile | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const swipedIds = useMemo(
    () => getSwipedUserIds(state.swipes, 'competition'),
    [state.swipes]
  );

  const queue = useMemo(
    () =>
      getDiscoverQueue(
        currentUser,
        allUsers,
        swipedIds,
        state.excludeHomeGym,
        'competition'
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentUser, allUsers, swipedIds, state.excludeHomeGym, refreshKey]
  );

  function onSwipe(action: 'like' | 'dislike' | 'super-like') {
    if (!queue[0]) return;
    const { isMatch, matchedUser: mu } = handleSwipe(
      queue[0].id,
      action,
      'competition'
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
          <Trophy size={22} className="text-yellow-500" />
          <h1 className="text-xl font-black text-white">Find a Partner</h1>
        </div>
        <button
          onClick={() => setShowInfo((v) => !v)}
          className="p-2 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
        >
          <Info size={18} />
        </button>
      </div>

      {/* ── Info panel ─────────────────────────── */}
      {showInfo && (
        <div className="mx-5 mb-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl shrink-0">
          <h3 className="text-sm font-semibold text-yellow-400 mb-1.5">
            🏆 Competition Partner Matching
          </h3>
          <p className="text-xs text-zinc-300 leading-relaxed">
            This mode finds training and competition partners — no romance required!
            We match based on <strong>complementary strengths</strong>: your best
            movements balance their weak spots and vice versa. Similar competitive
            ranking means a fair, push-each-other dynamic.
          </p>
        </div>
      )}

      {/* ── Card stack ─────────────────────────── */}
      <div className="flex-1 relative px-5 min-h-0">
        {queue.length === 0 ? (
          <EmptyState onRefresh={() => setRefreshKey((k) => k + 1)} />
        ) : (
          <div className="relative h-full" style={{ maxHeight: 'calc(100vh - 200px)' }}>
            {queue[1] && (
              <SwipeCard
                key={`next-${queue[1].id}`}
                user={queue[1]}
                mode="competition"
                onSwipe={() => {}}
                isTop={false}
              />
            )}
            <SwipeCard
              key={`top-${queue[0].id}`}
              user={queue[0]}
              mode="competition"
              onSwipe={onSwipe}
              isTop={true}
            />
          </div>
        )}
      </div>

      {matchedUser && (
        <MatchModal
          matchedUser={matchedUser}
          mode="competition"
          onClose={() => setMatchedUser(null)}
        />
      )}
    </div>
  );
}

function EmptyState({ onRefresh }: { onRefresh: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center pb-20 gap-5">
      <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center">
        <X size={36} className="text-zinc-600" />
      </div>
      <div>
        <h3 className="text-xl font-bold text-white">No partners found</h3>
        <p className="text-zinc-400 text-sm mt-1">
          Check back later or browse gyms to find your competition teammate.
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
