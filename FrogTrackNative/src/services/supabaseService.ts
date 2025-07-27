
import { createClient } from '@supabase/supabase-js';
import { AppState, Activity, Profile } from '../types';

const supabaseUrl = 'https://ugmgculhvzfzynpcxxdc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnbWdjdWxodnpmenlucGN4eGRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2NTI1MDAsImV4cCI6MjA2OTIyODUwMH0.vnSLYvsZajqm7Qxem4BLmPeDoSySsKaFO6Q-sHiAR58';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const getProfile = async (): Promise<Profile | null> => {
    const { data, error } = await supabase
        .from('profile')
        .select('*')
        .single();
    if (error) {
        console.error('Error fetching profile:', error);
        return null;
    }
    return data;
};

export const getActivities = async (): Promise<Activity[]> => {
    const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('timestamp', { ascending: false });
    if (error) {
        console.error('Error fetching activities:', error);
        return [];
    }
    return data;
};

export const addActivity = async (activity: Activity): Promise<Activity | null> => {
    const { data, error } = await supabase
        .from('activities')
        .insert([activity])
        .single();
    if (error) {
        console.error('Error adding activity:', error);
        return null;
    }
    return data;
};
