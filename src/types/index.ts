export type Gender = 'male' | 'female' | 'non-binary' | 'other';
export type Division = 'beginner' | 'scaled' | 'rx' | 'elite';
export type LookingFor = 'romantic' | 'competition' | 'both';

export const CROSSFIT_MOVEMENTS = [
  'Back Squat',
  'Clean & Jerk',
  'Snatch',
  'Clean',
  'Jerk',
  'Power Snatch',
  'Power Clean',
  'Deadlift',
  'Front Squat',
  'Overhead Squat',
  'Thruster',
  'Wall Ball',
  'Muscle-Up (Ring)',
  'Muscle-Up (Bar)',
  'Handstand Push-Up',
  'Handstand Walk',
  'Pull-Up',
  'Chest-to-Bar Pull-Up',
  'Toes-to-Bar',
  'Pistol Squat',
  'Double-Under',
  'Box Jump',
  'Burpee',
  'Kettlebell Swing',
  'Rope Climb',
  'GHD Sit-Up',
  'Dumbbell Snatch',
  'Rowing',
  'Assault Bike',
  'Running',
] as const;

export type Movement = (typeof CROSSFIT_MOVEMENTS)[number];

export interface CrossfitGym {
  id: string;
  name: string;
  city: string;
  state: string;
  country: string;
}

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  interestedIn: Gender[];
  bio: string;
  photos: string[];
  homeGym: CrossfitGym | null;
  franTime: string | null;       // "mm:ss"
  backSquat1RM: number | null;   // lbs
  deadlift1RM: number | null;    // lbs
  crossfitRanking: number | null; // worldwide Open ranking
  favoriteMovement: string;
  leastFavoriteMovement: string;
  lookingFor: LookingFor;
  division: Division;
}

export interface SwipeRecord {
  userId: string;
  action: 'like' | 'dislike' | 'super-like';
  type: 'romantic' | 'competition';
  timestamp: number;
}

export interface Match {
  userId: string;
  type: 'romantic' | 'competition';
  matchedAt: number;
}

export interface AppState {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  isOnboarded: boolean;
  swipes: SwipeRecord[];
  matches: Match[];
  excludeHomeGym: boolean;
}
