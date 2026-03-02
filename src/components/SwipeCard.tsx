import {
  useState,
  useRef,
  useCallback,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import {
  MapPin,
  Timer,
  Dumbbell,
  Star,
  X,
  Heart,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Zap,
} from 'lucide-react';
import { UserProfile } from '../types';
import { rankingLabel } from '../utils/matching';

interface Props {
  user: UserProfile;
  mode: 'romantic' | 'competition';
  onSwipe: (action: 'like' | 'dislike' | 'super-like') => void;
  isTop: boolean;
}

const SWIPE_THRESHOLD = 90;
const ROTATION_FACTOR = 18;

export default function SwipeCard({ user, mode, onSwipe, isTop }: Props) {
  const [offsetX, setOffsetX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [showDetail, setShowDetail] = useState(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const isDragIntent = useRef(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const rotation = offsetX / ROTATION_FACTOR;
  const likeOpacity = Math.min(Math.max(offsetX / SWIPE_THRESHOLD, 0), 1);
  const nopeOpacity = Math.min(Math.max(-offsetX / SWIPE_THRESHOLD, 0), 1);

  const handlePointerDown = useCallback((e: ReactPointerEvent) => {
    if (!isTop) return;
    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
    isDragIntent.current = false;
    setIsDragging(true);
    cardRef.current?.setPointerCapture(e.pointerId);
  }, [isTop]);

  const handlePointerMove = useCallback(
    (e: ReactPointerEvent) => {
      if (!isDragging || !isTop) return;
      const dx = e.clientX - startXRef.current;
      const dy = e.clientY - startYRef.current;

      // Determine drag intent after 8px of movement
      if (!isDragIntent.current && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
        isDragIntent.current = Math.abs(dx) > Math.abs(dy);
      }

      if (isDragIntent.current) {
        e.preventDefault();
        setOffsetX(dx);
      }
    },
    [isDragging, isTop]
  );

  const handlePointerUp = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

    if (Math.abs(offsetX) > SWIPE_THRESHOLD) {
      onSwipe(offsetX > 0 ? 'like' : 'dislike');
    }
    setOffsetX(0);
  }, [isDragging, offsetX, onSwipe]);

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoIdx((i) => Math.min(i + 1, user.photos.length - 1));
  };

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoIdx((i) => Math.max(i - 1, 0));
  };

  const divisionColor: Record<string, string> = {
    beginner: 'bg-zinc-600',
    scaled: 'bg-blue-600',
    rx: 'bg-orange-600',
    elite: 'bg-yellow-500',
  };

  return (
    <div
      ref={cardRef}
      className="swipe-card absolute inset-0 rounded-2xl overflow-hidden shadow-2xl cursor-grab active:cursor-grabbing"
      style={{
        transform: `translateX(${offsetX}px) rotate(${rotation}deg)`,
        transition: isDragging ? 'none' : 'transform 0.35s cubic-bezier(.17,.67,.35,1.2)',
        zIndex: isTop ? 10 : 5,
        scale: isTop ? '1' : '0.96',
        filter: isTop ? 'none' : 'brightness(0.6)',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* ── Photo ─────────────────────────────── */}
      <div className="relative h-full">
        <img
          src={user.photos[photoIdx]}
          alt={user.name}
          className="w-full h-full object-cover pointer-events-none select-none"
          draggable={false}
        />

        {/* LIKE stamp */}
        <div
          className="absolute top-10 left-6 border-4 border-green-400 text-green-400
            text-2xl font-black tracking-widest px-3 py-1 rounded-md rotate-[-20deg]"
          style={{ opacity: likeOpacity }}
        >
          {mode === 'competition' ? 'TEAM' : 'LIKE'}
        </div>

        {/* NOPE stamp */}
        <div
          className="absolute top-10 right-6 border-4 border-red-400 text-red-400
            text-2xl font-black tracking-widest px-3 py-1 rounded-md rotate-[20deg]"
          style={{ opacity: nopeOpacity }}
        >
          NOPE
        </div>

        {/* Photo dots */}
        {user.photos.length > 1 && (
          <div className="absolute top-3 left-0 right-0 flex justify-center gap-1.5 px-4">
            {user.photos.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full flex-1 max-w-[60px] transition-colors ${
                  i === photoIdx ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        )}

        {/* Photo nav zones (tap areas) */}
        {photoIdx > 0 && (
          <button
            className="absolute left-0 top-8 bottom-32 w-1/3 flex items-center justify-start pl-2 opacity-0 hover:opacity-100 transition-opacity"
            onClick={prevPhoto}
          >
            <ChevronLeft className="text-white/60" size={28} />
          </button>
        )}
        {photoIdx < user.photos.length - 1 && (
          <button
            className="absolute right-0 top-8 bottom-32 w-1/3 flex items-center justify-end pr-2 opacity-0 hover:opacity-100 transition-opacity"
            onClick={nextPhoto}
          >
            <ChevronRight className="text-white/60" size={28} />
          </button>
        )}

        {/* Gradient overlay */}
        <div className="photo-gradient absolute inset-0 pointer-events-none" />

        {/* ── User info overlay ───────────────── */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 space-y-2">
          {/* Name row */}
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-black text-white leading-tight">
                {user.name}, {user.age}
              </h2>
              {user.homeGym && (
                <div className="flex items-center gap-1 text-zinc-300 text-sm mt-0.5">
                  <MapPin size={13} />
                  <span>{user.homeGym.name}</span>
                  <span className="text-zinc-500">
                    · {user.homeGym.city}, {user.homeGym.state}
                  </span>
                </div>
              )}
            </div>
            <span
              className={`badge text-white ${divisionColor[user.division]} capitalize`}
            >
              {user.division}
            </span>
          </div>

          {/* Stats row */}
          <div className="flex gap-2">
            {user.franTime && (
              <div className="stat-pill flex-1">
                <div className="flex items-center gap-1 text-orange-400 text-xs font-semibold">
                  <Timer size={11} /> Fran
                </div>
                <span className="text-white text-sm font-bold">{user.franTime}</span>
              </div>
            )}
            {user.backSquat1RM && (
              <div className="stat-pill flex-1">
                <div className="flex items-center gap-1 text-blue-400 text-xs font-semibold">
                  <Dumbbell size={11} /> BS
                </div>
                <span className="text-white text-sm font-bold">{user.backSquat1RM}#</span>
              </div>
            )}
            {user.deadlift1RM && (
              <div className="stat-pill flex-1">
                <div className="flex items-center gap-1 text-purple-400 text-xs font-semibold">
                  <Dumbbell size={11} /> DL
                </div>
                <span className="text-white text-sm font-bold">{user.deadlift1RM}#</span>
              </div>
            )}
            {user.crossfitRanking && (
              <div className="stat-pill flex-1">
                <div className="flex items-center gap-1 text-yellow-400 text-xs font-semibold">
                  <Trophy size={11} /> Rank
                </div>
                <span className="text-white text-xs font-bold">
                  #{user.crossfitRanking.toLocaleString()}
                </span>
              </div>
            )}
          </div>

          {/* Movements */}
          <div className="flex gap-2 text-xs">
            <span className="badge bg-green-900/50 text-green-300 border border-green-800">
              ❤️ {user.favoriteMovement}
            </span>
            <span className="badge bg-red-900/50 text-red-300 border border-red-800">
              😅 {user.leastFavoriteMovement}
            </span>
          </div>

          {/* Expand bio button */}
          <button
            className="text-xs text-zinc-400 hover:text-white transition-colors underline underline-offset-2"
            onClick={(e) => {
              e.stopPropagation();
              setShowDetail((v) => !v);
            }}
          >
            {showDetail ? 'Hide bio' : 'Read bio'}
          </button>

          {/* Bio (expandable) */}
          {showDetail && (
            <p className="text-zinc-300 text-sm leading-snug bg-black/40 rounded-lg p-2">
              {user.bio}
            </p>
          )}

          {/* Ranking label */}
          {user.crossfitRanking && (
            <div className="flex items-center gap-1 text-yellow-400 text-xs">
              <Zap size={11} />
              <span>{rankingLabel(user.crossfitRanking)}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Action buttons ─────────────────────── */}
      {isTop && (
        <div className="absolute -bottom-16 left-0 right-0 flex justify-center gap-5">
          <button
            onClick={(e) => { e.stopPropagation(); onSwipe('dislike'); }}
            className="w-14 h-14 rounded-full bg-zinc-800 border-2 border-red-500
              flex items-center justify-center shadow-lg active:scale-95 transition-transform"
          >
            <X size={24} className="text-red-400" />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); onSwipe('super-like'); }}
            className="w-12 h-12 rounded-full bg-zinc-800 border-2 border-yellow-500
              flex items-center justify-center shadow-lg active:scale-95 transition-transform"
          >
            <Star size={20} className="text-yellow-400" />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); onSwipe('like'); }}
            className="w-14 h-14 rounded-full bg-zinc-800 border-2 border-green-500
              flex items-center justify-center shadow-lg active:scale-95 transition-transform"
          >
            {mode === 'competition' ? (
              <Trophy size={24} className="text-green-400" />
            ) : (
              <Heart size={24} className="text-green-400" />
            )}
          </button>
        </div>
      )}
    </div>
  );
}
