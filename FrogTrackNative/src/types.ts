export interface Exercise {
  name: string;
  sets?: number;
  reps?: number;
  weight?: number; // in kg
}

export interface Workout {
  name:string;
  duration?: number; // in minutes
  distance?: number; // in km
  calories?: number; // in kcal
  exercises?: Exercise[];
}

export interface Meal {
  name: string;
  calories: number;
  protein?: number; // in grams
  carbs?: number; // in grams
  fat?: number; // in grams
}

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

export interface Profile {
  id?: string; // Supabase UUID
  created_at?: string; // Supabase timestamp
  email: string;
  username: string;
  name: string;
  age: number;
  height: number; // in cm
  weight: number; // in kg
  gender: 'male' | 'female';
  activityLevel: ActivityLevel;
  goal?: string;
  bodyFatPercentage?: number; // in %
  bmrMode: 'calculated' | 'manual';
  manualBmr?: number; // in kcal
}

export interface NutritionEntry {
  id?: number; // Supabase bigint
  created_at?: string; // Supabase timestamp
  profile_id: string; // Foreign key to profiles.id
  name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export interface WorkoutEntry {
  id?: number; // Supabase bigint
  created_at?: string; // Supabase timestamp
  profile_id: string; // Foreign key to profiles.id
  name: string;
  duration: number;
  calories: number;
  distance?: number;
  exercises?: Exercise[];
}

// These types are still useful for AI parsing and general activity handling
export type ActivityData = Workout | Meal;

export interface Activity {
  type: 'workout' | 'meal';
  data: ActivityData;
}

export interface MacroNutrients {
    protein: number;
    carbs: number;
    fat: number;
}

export interface ParsedLog {
  workouts?: Workout[];
  meals?: Meal[];
}

export interface Friend {
  name: string;
  avatar: string;
  lastActivity: string;
  weeklyScore?: number;
}

export interface AppState {
  profile: Profile;
  nutritionEntries: NutritionEntry[];
  workoutEntries: WorkoutEntry[];
  friends: Friend[];
  aiTips: string;
  isLoadingAI: boolean;
  error: string | null;
}