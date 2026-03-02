import { useState, useMemo } from 'react';
import { MapPin, Search, Users, ChevronRight, Home } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { CrossfitGym, UserProfile } from '../types';
import { GYMS, MOCK_USERS } from '../data/mockData';
import { rankingLabel } from '../utils/matching';

export default function GymSearchPage() {
  const { state } = useApp();
  const currentUser = state.currentUser!;
  const [query, setQuery] = useState('');
  const [selectedGym, setSelectedGym] = useState<CrossfitGym | null>(null);

  const filteredGyms = useMemo(() => {
    const q = query.toLowerCase();
    return GYMS.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.city.toLowerCase().includes(q) ||
        g.state.toLowerCase().includes(q)
    ).sort((a, b) => {
      // Home gym first
      if (a.id === currentUser.homeGym?.id) return -1;
      if (b.id === currentUser.homeGym?.id) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [query, currentUser.homeGym?.id]);

  const gymMembers = useMemo((): UserProfile[] => {
    if (!selectedGym) return [];
    return MOCK_USERS.filter((u) => u.homeGym?.id === selectedGym.id);
  }, [selectedGym]);

  return (
    <div className="min-h-screen bg-zinc-950 pt-12">
      {/* Header */}
      <div className="px-5 mb-5">
        <div className="flex items-center gap-2 mb-1">
          <MapPin size={22} className="text-orange-500" />
          <h1 className="text-xl font-black text-white">Browse by Gym</h1>
        </div>
        <p className="text-zinc-400 text-sm">
          Find singles at any CrossFit affiliate
        </p>
      </div>

      {/* Search bar */}
      <div className="px-5 mb-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            className="input-field pl-9"
            placeholder="Search gym name, city, state..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Gym list or detail view */}
      {selectedGym ? (
        <GymDetail
          gym={selectedGym}
          members={gymMembers}
          currentUser={currentUser}
          onBack={() => setSelectedGym(null)}
        />
      ) : (
        <div className="px-5 space-y-2 pb-8">
          {filteredGyms.map((gym) => {
            const memberCount = MOCK_USERS.filter((u) => u.homeGym?.id === gym.id).length;
            const isHome = gym.id === currentUser.homeGym?.id;
            return (
              <button
                key={gym.id}
                onClick={() => setSelectedGym(gym)}
                className={`w-full text-left p-4 rounded-2xl border flex items-center gap-4 transition-colors ${
                  isHome
                    ? 'border-orange-500/50 bg-orange-500/5'
                    : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'
                }`}
              >
                {/* Icon */}
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                    isHome ? 'bg-orange-500/20' : 'bg-zinc-800'
                  }`}
                >
                  {isHome ? (
                    <Home size={20} className="text-orange-400" />
                  ) : (
                    <MapPin size={20} className="text-zinc-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-white text-sm truncate">
                      {gym.name}
                    </p>
                    {isHome && (
                      <span className="badge bg-orange-500/20 text-orange-400 border border-orange-500/30 shrink-0">
                        Your gym
                      </span>
                    )}
                  </div>
                  <p className="text-zinc-500 text-xs mt-0.5">
                    {gym.city}, {gym.state}
                  </p>
                </div>

                <div className="flex flex-col items-end shrink-0">
                  <div className="flex items-center gap-1 text-zinc-400 text-xs">
                    <Users size={12} />
                    <span>{memberCount} {memberCount === 1 ? 'member' : 'members'}</span>
                  </div>
                  <ChevronRight size={14} className="text-zinc-600 mt-1" />
                </div>
              </button>
            );
          })}

          {filteredGyms.length === 0 && (
            <div className="text-center py-12 text-zinc-500">
              <MapPin size={36} className="mx-auto mb-3 opacity-50" />
              <p>No gyms found for "{query}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function GymDetail({
  gym,
  members,
  currentUser,
  onBack,
}: {
  gym: CrossfitGym;
  members: UserProfile[];
  currentUser: UserProfile;
  onBack: () => void;
}) {
  const isHome = gym.id === currentUser.homeGym?.id;

  return (
    <div className="px-5 pb-8">
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors text-sm mb-4"
      >
        <ChevronRight size={14} className="rotate-180" />
        All gyms
      </button>

      {/* Gym header */}
      <div className={`p-5 rounded-2xl border mb-5 ${isHome ? 'border-orange-500/40 bg-orange-500/5' : 'border-zinc-800 bg-zinc-900'}`}>
        <div className="flex items-start gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isHome ? 'bg-orange-500/20' : 'bg-zinc-800'}`}>
            <MapPin size={22} className={isHome ? 'text-orange-400' : 'text-zinc-400'} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{gym.name}</h2>
            <p className="text-zinc-400 text-sm">
              {gym.city}, {gym.state} · {gym.country}
            </p>
            {isHome && (
              <span className="badge bg-orange-500/20 text-orange-400 border border-orange-500/30 mt-1.5">
                Your home gym
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-4 mt-4 pt-4 border-t border-zinc-800">
          <div className="text-center">
            <p className="text-2xl font-black text-white">{members.length}</p>
            <p className="text-xs text-zinc-500">Members</p>
          </div>
          {members.length > 0 && (
            <>
              <div className="text-center">
                <p className="text-2xl font-black text-white">
                  {members.filter((m) => m.franTime).length}
                </p>
                <p className="text-xs text-zinc-500">Have Fran PR</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-white">
                  {members.filter((m) => m.crossfitRanking).length}
                </p>
                <p className="text-xs text-zinc-500">Ranked</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Members */}
      <h3 className="text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wide">
        Members ({members.length})
      </h3>

      {members.length === 0 ? (
        <div className="text-center py-12 text-zinc-500">
          <Users size={36} className="mx-auto mb-3 opacity-50" />
          <p>No members at this gym yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {members.map((member) => (
            <MemberCard key={member.id} member={member} isSelf={member.id === currentUser.id} />
          ))}
        </div>
      )}
    </div>
  );
}

function MemberCard({ member, isSelf }: { member: UserProfile; isSelf: boolean }) {
  const divisionColors: Record<string, string> = {
    beginner: 'bg-zinc-600',
    scaled: 'bg-blue-600',
    rx: 'bg-orange-600',
    elite: 'bg-yellow-500',
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900 border border-zinc-800">
      <img
        src={member.photos[0] ?? 'https://randomuser.me/api/portraits/lego/1.jpg'}
        alt={member.name}
        className="w-14 h-14 rounded-xl object-cover shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-white text-sm">
            {member.name}, {member.age}
          </p>
          {isSelf && (
            <span className="badge bg-orange-500/20 text-orange-400 border border-orange-500/30">
              You
            </span>
          )}
          <span className={`badge text-white text-[10px] capitalize ${divisionColors[member.division]}`}>
            {member.division}
          </span>
        </div>
        <div className="flex flex-wrap gap-2 mt-1.5 text-xs text-zinc-400">
          {member.franTime && (
            <span className="flex items-center gap-0.5">
              ⏱ {member.franTime}
            </span>
          )}
          {member.backSquat1RM && (
            <span>🏋️ {member.backSquat1RM}#</span>
          )}
          {member.crossfitRanking && (
            <span className="text-yellow-400">
              {rankingLabel(member.crossfitRanking)}
            </span>
          )}
        </div>
        <p className="text-xs text-zinc-500 mt-0.5 truncate">
          ❤️ {member.favoriteMovement} · 😅 {member.leastFavoriteMovement}
        </p>
      </div>
    </div>
  );
}
