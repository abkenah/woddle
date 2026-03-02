import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, X } from 'lucide-react';
import { UserProfile } from '../types';
import { useApp } from '../store/AppContext';

interface Props {
  matchedUser: UserProfile;
  mode: 'romantic' | 'competition';
  onClose: () => void;
}

export default function MatchModal({ matchedUser, mode, onClose }: Props) {
  const { state } = useApp();
  const navigate = useNavigate();
  const currentUser = state.currentUser!;

  const isRomantic = mode === 'romantic';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-xs text-center space-y-6 animate-fade-in">
        {/* Headline */}
        <div>
          {isRomantic ? (
            <>
              <Heart
                size={48}
                className="mx-auto text-orange-500 mb-2"
                fill="currentColor"
              />
              <h2 className="text-3xl font-black text-white">It's a Match!</h2>
              <p className="text-zinc-400 mt-1">
                You and {matchedUser.name} both swiped right
              </p>
            </>
          ) : (
            <>
              <div className="text-5xl mb-2">🏆</div>
              <h2 className="text-3xl font-black text-white">
                Partner Found!
              </h2>
              <p className="text-zinc-400 mt-1">
                {matchedUser.name} is ready to compete together
              </p>
            </>
          )}
        </div>

        {/* Photos */}
        <div className="flex justify-center items-center gap-4">
          <div className="relative">
            <img
              src={currentUser.photos[0] || 'https://randomuser.me/api/portraits/lego/1.jpg'}
              alt={currentUser.name}
              className="w-28 h-28 rounded-full object-cover border-4 border-orange-500"
            />
          </div>
          <div className="text-orange-500 font-black text-2xl">
            {isRomantic ? '❤️' : '🤝'}
          </div>
          <div className="relative">
            <img
              src={matchedUser.photos[0]}
              alt={matchedUser.name}
              className="w-28 h-28 rounded-full object-cover border-4 border-orange-500"
            />
          </div>
        </div>

        {/* Compatibility note */}
        {matchedUser.favoriteMovement === state.currentUser?.leastFavoriteMovement ||
        matchedUser.leastFavoriteMovement === state.currentUser?.favoriteMovement ? (
          <div className="bg-zinc-800 rounded-xl p-3 text-sm text-zinc-300">
            <span className="text-orange-400 font-semibold">
              Great complement!
            </span>{' '}
            {isRomantic
              ? `Your strengths balance each other perfectly.`
              : `You cover each other's weaknesses — perfect team.`}
          </div>
        ) : null}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => {
              onClose();
              navigate('/app/matches');
            }}
            className="btn-primary flex items-center justify-center gap-2 w-full"
          >
            <MessageCircle size={18} />
            View Matches
          </button>
          <button
            onClick={onClose}
            className="flex items-center justify-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm"
          >
            <X size={16} />
            Keep Swiping
          </button>
        </div>
      </div>
    </div>
  );
}
