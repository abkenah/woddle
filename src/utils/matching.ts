import { UserProfile, SwipeRecord } from '../types';

function parseFranSeconds(timeStr: string | null): number | null {
  if (!timeStr) return null;
  const parts = timeStr.split(':');
  if (parts.length !== 2) return null;
  const mins = parseInt(parts[0], 10);
  const secs = parseInt(parts[1], 10);
  if (isNaN(mins) || isNaN(secs)) return null;
  return mins * 60 + secs;
}

function franScore(a: UserProfile, b: UserProfile): number {
  const aF = parseFranSeconds(a.franTime);
  const bF = parseFranSeconds(b.franTime);
  if (aF === null || bF === null) return 0.5;
  const diff = Math.abs(aF - bF);
  return Math.max(0, 1 - diff / 120); // 2-min spread = 0
}

function strengthScore(a: UserProfile, b: UserProfile): number {
  let total = 0;
  let count = 0;
  if (a.backSquat1RM && b.backSquat1RM) {
    total += Math.max(0, 1 - Math.abs(a.backSquat1RM - b.backSquat1RM) / 150);
    count++;
  }
  if (a.deadlift1RM && b.deadlift1RM) {
    total += Math.max(0, 1 - Math.abs(a.deadlift1RM - b.deadlift1RM) / 175);
    count++;
  }
  return count > 0 ? total / count : 0.5;
}

function rankingScore(a: UserProfile, b: UserProfile): number {
  if (!a.crossfitRanking || !b.crossfitRanking) return 0.5;
  const aLog = Math.log10(a.crossfitRanking);
  const bLog = Math.log10(b.crossfitRanking);
  return Math.max(0, 1 - Math.abs(aLog - bLog) / 2);
}

function movementRomanticScore(a: UserProfile, b: UserProfile): number {
  let score = 0;
  if (a.favoriteMovement === b.favoriteMovement) score += 0.5;
  if (a.leastFavoriteMovement !== b.leastFavoriteMovement) score += 0.2;
  // Your favorite is their weakness — great for teaching each other
  if (
    a.favoriteMovement === b.leastFavoriteMovement ||
    b.favoriteMovement === a.leastFavoriteMovement
  )
    score += 0.3;
  return Math.min(1, score);
}

function movementCompScore(a: UserProfile, b: UserProfile): number {
  // Complementary strengths = strong competition team
  if (
    a.favoriteMovement === b.leastFavoriteMovement ||
    b.favoriteMovement === a.leastFavoriteMovement
  )
    return 1;
  if (a.favoriteMovement !== b.favoriteMovement) return 0.5;
  return 0.3;
}

export function calculateRomanticScore(user: UserProfile, candidate: UserProfile): number {
  return (
    franScore(user, candidate) * 0.2 +
    strengthScore(user, candidate) * 0.2 +
    rankingScore(user, candidate) * 0.25 +
    movementRomanticScore(user, candidate) * 0.35
  );
}

export function calculateCompetitionScore(user: UserProfile, candidate: UserProfile): number {
  return (
    franScore(user, candidate) * 0.2 +
    strengthScore(user, candidate) * 0.15 +
    rankingScore(user, candidate) * 0.3 +
    movementCompScore(user, candidate) * 0.35
  );
}

export function getDiscoverQueue(
  currentUser: UserProfile,
  allUsers: UserProfile[],
  swipedUserIds: string[],
  excludeHomeGym: boolean,
  mode: 'romantic' | 'competition'
): UserProfile[] {
  return allUsers
    .filter((u) => {
      if (u.id === currentUser.id) return false;
      if (swipedUserIds.includes(u.id)) return false;

      if (mode === 'romantic') {
        if (!currentUser.interestedIn.includes(u.gender)) return false;
        if (!u.interestedIn.includes(currentUser.gender)) return false;
        if (u.lookingFor === 'competition') return false;
      }

      if (mode === 'competition') {
        if (u.lookingFor === 'romantic') return false;
      }

      if (
        excludeHomeGym &&
        currentUser.homeGym &&
        u.homeGym?.id === currentUser.homeGym.id
      )
        return false;

      return true;
    })
    .sort((a, b) => {
      const scoreA =
        mode === 'romantic'
          ? calculateRomanticScore(currentUser, a)
          : calculateCompetitionScore(currentUser, a);
      const scoreB =
        mode === 'romantic'
          ? calculateRomanticScore(currentUser, b)
          : calculateCompetitionScore(currentUser, b);
      // Add small random noise so same-scored users vary
      return scoreB - scoreA + (Math.random() - 0.5) * 0.05;
    });
}

export function getMatchProbability(action: 'like' | 'super-like'): number {
  return action === 'super-like' ? 0.7 : 0.4;
}

export function formatFranTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function franTimeLabel(timeStr: string | null): string {
  if (!timeStr) return 'N/A';
  const secs = parseFranSeconds(timeStr);
  if (!secs) return timeStr;
  if (secs < 120) return `${timeStr} 🔥 Elite`;
  if (secs < 240) return `${timeStr} ⚡ Advanced`;
  if (secs < 420) return `${timeStr} 💪 Intermediate`;
  return `${timeStr} Beginner`;
}

export function rankingLabel(ranking: number | null): string {
  if (!ranking) return 'Unranked';
  if (ranking <= 1000) return `#${ranking.toLocaleString()} — Games`;
  if (ranking <= 5000) return `#${ranking.toLocaleString()} — Semifinals`;
  if (ranking <= 50000) return `#${ranking.toLocaleString()} — Quarterfinals`;
  return `#${ranking.toLocaleString()} — Open`;
}

export function getSwipedUserIds(
  swipes: SwipeRecord[],
  type: 'romantic' | 'competition'
): string[] {
  return swipes.filter((s) => s.type === type).map((s) => s.userId);
}
