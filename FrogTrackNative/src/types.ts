

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

export type ActivityData = Workout | Meal;

export interface Activity {
  type: 'workout' | 'meal';
  data: ActivityData;
}

export interface LogEntry extends Activity {
  timestamp: Date;
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
  activities: LogEntry[];
  friends: Friend[];
  aiTips: string;
  isLoadingAI: boolean;
  error: string | null;
}
