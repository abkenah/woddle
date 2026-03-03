import { useMemo, useState } from 'react';
import { Heart, Trophy, MessageCircle, Dumbbell, Timer, Zap } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { UserProfile } from '../types';
import { MOCK_USERS } from '../data/mockData';
import { rankingLabel } from '../utils/matching';

type Tab = 'romantic' | 'competition';

export default function MatchesPage() {
  const { state } = useApp();
  const [tab, setTab] = useState<Tab>('romantic');
  const [selected, setSelected] = useState<UserProfile | null>(null);

  const matches = useMemo(() => {
    return state.matches
      .filter((m) => m.type === tab)
      .map((m) => ({
        match: m,
        user: MOCK_USERS.find((u) => u.id === m.userId),
      }))
      .filter((x): x is { match: (typeof state.matches)[0]; user: UserProfile } =>
        x.user !== undefined
      )
      .sort((a, b) => b.match.matchedAt - a.match.matchedAt);
  }, [state.matches, tab]);

  const romanticCount = state.matches.filter((m) => m.type === 'romantic').length;
  const competitionCount = state.matches.filter((m) => m.type === 'competition').length;

  if (selected) {
    return <MatchDetail user={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <div className="min-h-screen bg-zinc-950 pt-12">
      {/* Header */}
      <div className="px-5 mb-5">
        <div className="flex items-center gap-2 mb-1">
          <Heart size={22} className="text-orange-500" />
          <h1 className="text-xl font-black text-white">Your Matches</h1>
        </div>
        <p className="text-zinc-400 text-sm">
          {romanticCount + competitionCount === 0
            ? 'Start swiping to get matches!'
            : `${romanticCount + competitionCount} total matches`}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex bg-zinc-900 border-b border-zinc-800 shrink-0">
        <TabButton
          active={tab === 'romantic'}
          onClick={() => setTab('romantic')}
          icon={<Heart size={14} />}
          label="Romantic"
          count={romanticCount}
        />
        <TabButton
          active={tab === 'competition'}
          onClick={() => setTab('competition')}
          icon={<Trophy size={14} />}
          label="Partners"
          count={competitionCount}
        />
      </div>

      {/* Match list */}
      <div className="px-5 py-4 space-y-3 pb-8">
        {matches.length === 0 ? (
          <EmptyMatches tab={tab} />
        ) : (
          matches.map(({ user, match }) => (
            <button
              key={`${match.userId}-${match.type}`}
              onClick={() => setSelected(user)}
              className="w-full flex items-center gap-4 p-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors text-left"
            >
              {/* Photo */}
              <div className="relative shrink-0">
                <img
                  src={user.photos[0]}
                  alt={user.name}
                  className="w-16 h-16 rounded-xl object-cover"
                />
                {tab === 'competition' ? (
                  <span className="absolute -bottom-1 -right-1 bg-yellow-500 rounded-full w-5 h-5 flex items-center justify-center text-[10px]">
                    🏆
                  </span>
                ) : (
                  <span className="absolute -bottom-1 -right-1 bg-orange-500 rounded-full w-5 h-5 flex items-center justify-center text-[10px]">
                    ❤️
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <p className="font-bold text-white text-base">
                    {user.name}
                  </p>
                  <span className="text-zinc-500 text-sm">{user.age}</span>
                </div>
                <p className="text-zinc-400 text-xs mt-0.5 truncate">
                  {user.homeGym?.name ?? 'No gym listed'}
                </p>
                <div className="flex gap-2 mt-1.5 text-xs text-zinc-500">
                  {user.franTime && <span>⏱ {user.franTime}</span>}
                  {user.backSquat1RM && <span>🏋️ {user.backSquat1RM}#</span>}
                </div>
              </div>

              {/* Message CTA */}
              <div className="shrink-0">
                <div className="w-9 h-9 bg-orange-500/20 rounded-xl flex items-center justify-center">
                  <MessageCircle size={16} className="text-orange-400" />
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-semibold border-b-2 transition-colors ${
        active
          ? 'border-orange-500 text-orange-400'
          : 'border-transparent text-zinc-500 hover:text-zinc-300'
      }`}
    >
      {icon}
      {label}
      {count > 0 && (
        <span
          className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
            active ? 'bg-orange-500/20 text-orange-400' : 'bg-zinc-800 text-zinc-400'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function EmptyMatches({ tab }: { tab: Tab }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
      <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center">
        {tab === 'romantic' ? (
          <Heart size={28} className="text-zinc-600" />
        ) : (
          <Trophy size={28} className="text-zinc-600" />
        )}
      </div>
      <div>
        <h3 className="text-lg font-bold text-white">No {tab === 'romantic' ? 'matches' : 'partners'} yet</h3>
        <p className="text-zinc-400 text-sm mt-1">
          {tab === 'romantic'
            ? 'Head to Discover and start swiping!'
            : 'Check the Partners tab to find competition teammates.'}
        </p>
      </div>
    </div>
  );
}

function MatchDetail({ user, onBack }: { user: UserProfile; onBack: () => void }) {
  const [photoIdx, setPhotoIdx] = useState(0);

  const divisionColor: Record<string, string> = {
    beginner: 'bg-zinc-600',
    scaled: 'bg-blue-600',
    rx: 'bg-orange-600',
    elite: 'bg-yellow-500',
  };

  return (
    <div className="min-h-screen bg-zinc-950 pt-12">
      <div className="px-5 mb-4">
        <button
          onClick={onBack}
          className="text-zinc-400 hover:text-white transition-colors text-sm flex items-center gap-1"
        >
          ← Back to matches
        </button>
      </div>

      {/* Photo gallery */}
      <div className="relative mx-5 mb-5 rounded-2xl overflow-hidden aspect-[3/4]">
        <img
          src={user.photos[photoIdx]}
          alt={user.name}
          className="w-full h-full object-cover"
        />
        {user.photos.length > 1 && (
          <div className="absolute top-3 left-0 right-0 flex justify-center gap-1.5 px-4">
            {user.photos.map((_, i) => (
              <button
                key={i}
                onClick={() => setPhotoIdx(i)}
                className="flex-1 max-w-[60px] py-3 flex items-center"
              >
                <div
                  className={`h-1 rounded-full w-full transition-colors ${
                    i === photoIdx ? 'bg-white' : 'bg-white/30'
                  }`}
                />
              </button>
            ))}
          </div>
        )}
        <div className="photo-gradient absolute inset-0 pointer-events-none" />
        <div className="absolute bottom-4 left-4">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-white">
              {user.name}, {user.age}
            </h2>
            <span className={`badge text-white capitalize ${divisionColor[user.division]}`}>
              {user.division}
            </span>
          </div>
          {user.homeGym && (
            <p className="text-zinc-300 text-sm mt-0.5">📍 {user.homeGym.name}</p>
          )}
        </div>
      </div>

      <div className="px-5 space-y-5 pb-8">
        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          {user.franTime && (
            <div className="stat-pill flex-row justify-start gap-3">
              <Timer size={18} className="text-orange-400" />
              <div>
                <p className="text-xs text-zinc-500">Fran</p>
                <p className="text-white font-bold">{user.franTime}</p>
              </div>
            </div>
          )}
          {user.backSquat1RM && (
            <div className="stat-pill flex-row justify-start gap-3">
              <Dumbbell size={18} className="text-blue-400" />
              <div>
                <p className="text-xs text-zinc-500">Back Squat</p>
                <p className="text-white font-bold">{user.backSquat1RM} lbs</p>
              </div>
            </div>
          )}
          {user.deadlift1RM && (
            <div className="stat-pill flex-row justify-start gap-3">
              <Dumbbell size={18} className="text-purple-400" />
              <div>
                <p className="text-xs text-zinc-500">Deadlift</p>
                <p className="text-white font-bold">{user.deadlift1RM} lbs</p>
              </div>
            </div>
          )}
          {user.crossfitRanking && (
            <div className="stat-pill flex-row justify-start gap-3">
              <Zap size={18} className="text-yellow-400" />
              <div>
                <p className="text-xs text-zinc-500">CF Ranking</p>
                <p className="text-white font-bold text-xs">
                  {rankingLabel(user.crossfitRanking)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Movements */}
        <div className="card p-4 space-y-2">
          <h3 className="text-sm font-semibold text-zinc-400">Movements</h3>
          <div className="flex flex-wrap gap-2">
            <span className="badge bg-green-900/50 text-green-300 border border-green-800">
              ❤️ {user.favoriteMovement}
            </span>
            <span className="badge bg-red-900/50 text-red-300 border border-red-800">
              😅 {user.leastFavoriteMovement}
            </span>
          </div>
        </div>

        {/* Bio */}
        {user.bio && (
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-zinc-400 mb-2">About</h3>
            <p className="text-zinc-300 text-sm leading-relaxed">{user.bio}</p>
          </div>
        )}

        {/* Message placeholder */}
        <div className="card p-4 text-center space-y-3">
          <MessageCircle size={28} className="mx-auto text-orange-500" />
          <p className="text-zinc-400 text-sm">
            Messaging is coming soon! For now, find them at{' '}
            <span className="text-white font-medium">{user.homeGym?.name}</span> 💪
          </p>
        </div>
      </div>
    </div>
  );
}
