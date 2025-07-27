import { createClient } from '@supabase/supabase-js';
import { Activity, Profile, NutritionEntry, WorkoutEntry, LogEntry } from '../types';

const supabaseUrl = 'https://ugmgculhvzfzynpcxxdc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnbWdjdWxodnpmenlucGN4eGRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2NTI1MDAsImV4cCI6MjA2OTIyODUwMH0.vnSLYvsZajqm7Qxem4BLvPeDoSySsKaFO6Q-sHiAR58';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const getProfile = async (): Promise<Profile | null> => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .single();
    if (error && error.code === 'PGRST116') { // No rows found
        // Insert a default profile if none exists
        const defaultProfile: Profile = {
            email: 'user@example.com',
            username: 'default_user',
            name: 'Default User',
            age: 25,
            height: 170,
            weight: 65,
            gender: 'female',
            activityLevel: 'moderate',
            bmrMode: 'calculated',
        };
        const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert([defaultProfile])
            .select()
            .single();
        if (insertError) {
            console.error('Error inserting default profile:', insertError);
            return null;
        }
        return newProfile;
    } else if (error) {
        console.error('Error fetching profile:', error);
        return null;
    }
    return data;
};

export const updateProfile = async (profile: Profile): Promise<Profile | null> => {
    const { data, error } = await supabase
        .from('profiles')
        .update(profile)
        .eq('id', profile.id)
        .select()
        .single();
    if (error) {
        console.error('Error updating profile:', error);
        return null;
    }
    return data;
};

export const getActivities = async (): Promise<LogEntry[]> => {
    const { data: nutritionData, error: nutritionError } = await supabase
        .from('nutrition')
        .select('*')
        .order('created_at', { ascending: false });
    if (nutritionError) {
        console.error('Error fetching nutrition entries:', nutritionError);
        return [];
    }

    const { data: workoutData, error: workoutError } = await supabase
        .from('workouts')
        .select('*')
        .order('created_at', { ascending: false });
    if (workoutError) {
        console.error('Error fetching workout entries:', workoutError);
        return [];
    }

    const combinedActivities: LogEntry[] = [];

    nutritionData.forEach((entry: NutritionEntry) => {
        combinedActivities.push({
            type: 'meal',
            data: { name: entry.name, calories: entry.calories, protein: entry.protein, carbs: entry.carbs, fat: entry.fat },
            timestamp: new Date(entry.created_at!),
        });
    });

    workoutData.forEach((entry: WorkoutEntry) => {
        combinedActivities.push({
            type: 'workout',
            data: { name: entry.name, duration: entry.duration, calories: entry.calories, distance: entry.distance, exercises: entry.exercises },
            timestamp: new Date(entry.created_at!),
        });
    });

    // Sort by timestamp to ensure correct order
    combinedActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return combinedActivities;
};

export const addActivity = async (activity: Activity, profileId: string): Promise<LogEntry | null> => {
    if (activity.type === 'meal') {
        const mealData = activity.data as Meal;
        const nutritionEntry: NutritionEntry = {
            profile_id: profileId,
            name: mealData.name,
            calories: mealData.calories,
            protein: mealData.protein,
            carbs: mealData.carbs,
            fat: mealData.fat,
        };
        const { data, error } = await supabase
            .from('nutrition')
            .insert([nutritionEntry])
            .select()
            .single();
        if (error) {
            console.error('Error adding nutrition entry:', error);
            return null;
        }
        return { type: 'meal', data: mealData, timestamp: new Date(data.created_at!) };
    } else if (activity.type === 'workout') {
        const workoutData = activity.data as WorkoutEntry;
        const workoutEntry: WorkoutEntry = {
            profile_id: profileId,
            name: workoutData.name,
            duration: workoutData.duration,
            calories: workoutData.calories,
            distance: workoutData.distance,
            exercises: workoutData.exercises,
        };
        const { data, error } = await supabase
            .from('workouts')
            .insert([workoutEntry])
            .select()
            .single();
        if (error) {
            console.error('Error adding workout entry:', error);
            return null;
        }
        return { type: 'workout', data: workoutData, timestamp: new Date(data.created_at!) };
    }
    return null;
};

export const getDashboardConfigs = async (profileId: string): Promise<any[]> => {
    const { data, error } = await supabase
        .from('dashboard_configs')
        .select('*')
        .or(`profile_id.eq.${profileId},profile_id.is.null`)
        .order('order_index', { ascending: true });
    if (error) {
        console.error('Error fetching dashboard configs:', error);
        return [];
    }
    return data;
};

export const ensureDefaultDashboards = async (profileId: string) => {
    const { data: existingConfigs, error: fetchError } = await supabase
        .from('dashboard_configs')
        .select('id')
        .eq('profile_id', profileId);

    if (fetchError) {
        console.error('Error checking existing dashboard configs:', fetchError);
        return;
    }

    if (existingConfigs && existingConfigs.length === 0) {
        const defaultDashboards = [
            {
                profile_id: profileId,
                name: 'Overview',
                is_default: true,
                config_data: { components: ['Dashboard', 'WeeklyProgress', 'AITips'] },
                order_index: 1,
            },
            {
                profile_id: profileId,
                name: 'Log & Feeds',
                is_default: true,
                config_data: { components: ['LogEntryForm', 'ActivityFeedWorkouts', 'ActivityFeedNutrition'] },
                order_index: 2,
            },
            {
                profile_id: profileId,
                name: 'Community',
                is_default: true,
                config_data: { components: ['Community'] },
                order_index: 3,
            },
            {
                profile_id: profileId,
                name: 'My Profile',
                is_default: true,
                config_data: { components: ['ProfileCard'] },
                order_index: 4,
            },
        ];

        const { error: insertError } = await supabase
            .from('dashboard_configs')
            .insert(defaultDashboards);

        if (insertError) {
            console.error('Error inserting default dashboards:', insertError);
        }
    }
};