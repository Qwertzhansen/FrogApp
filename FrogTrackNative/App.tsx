
import React, { useState, useCallback, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashboardScreen from './src/screens/DashboardScreen';
import LogScreen from './src/screens/LogScreen';
import CommunityScreen from './src/screens/CommunityScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import DashboardSelectionScreen from './src/screens/DashboardSelectionScreen';
import { LogEntry, Activity, Meal, Workout, AppState, Profile } from './src/types';
import { getProfile, getActivities, addActivity, ensureDefaultDashboards, supabase } from './src/services/supabaseService';
import { parseNaturalLanguageLog, generatePersonalizedTips } from './src/services/geminiService';

const Tab = createBottomTabNavigator();

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({
    profile: {
        email: '',
        username: '',
        name: 'Alex Doe',
        age: 30,
        height: 175,
        weight: 70,
        gender: 'male',
        activityLevel: 'moderate',
        goal: 'Gain Muscle',
        bodyFatPercentage: 15,
        bmrMode: 'calculated',
        manualBmr: 2000
    },
    nutritionEntries: [],
    workoutEntries: [],
    friends: [],
    aiTips: '',
    isLoadingAI: false,
    error: null
  });

  const [selectedDashboardConfig, setSelectedDashboardConfig] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const profile = await getProfile();
      const activities = await getActivities(); // This now returns combined LogEntry[]

      const nutritionEntries = activities.filter(a => a.type === 'meal') as NutritionEntry[];
      const workoutEntries = activities.filter(a => a.type === 'workout') as WorkoutEntry[];

      if (profile) {
        setAppState(prevState => ({ ...prevState, profile, nutritionEntries, workoutEntries }));
        await ensureDefaultDashboards(profile.id!); // Ensure default dashboards are set up
      } else {
        setAppState(prevState => ({ ...prevState, nutritionEntries, workoutEntries }));
      }
    };
    fetchData();
  }, []);

  const handleAddActivity = async (activity: Activity) => {
    if (!appState.profile.id) {
      console.error("Profile ID is missing. Cannot add activity.");
      return;
    }
    const newActivity = await addActivity(activity, appState.profile.id);
    if (newActivity) {
      setAppState(prevState => ({
        ...prevState,
        nutritionEntries: newActivity.type === 'meal' ? [newActivity.data, ...prevState.nutritionEntries] : prevState.nutritionEntries,
        workoutEntries: newActivity.type === 'workout' ? [newActivity.data, ...prevState.workoutEntries] : prevState.workoutEntries,
      }));
    }
  };

  const handleDeleteActivity = async (id: number, type: 'meal' | 'workout') => {
    try {
      if (type === 'meal') {
        await supabase.from('nutrition').delete().eq('id', id);
        setAppState(prevState => ({ ...prevState, nutritionEntries: prevState.nutritionEntries.filter(entry => entry.id !== id) }));
      } else if (type === 'workout') {
        await supabase.from('workouts').delete().eq('id', id);
        setAppState(prevState => ({ ...prevState, workoutEntries: prevState.workoutEntries.filter(entry => entry.id !== id) }));
      }
    } catch (error) {
      console.error("Failed to delete activity:", error);
    }
  };

  const handleUpdateProfile = async (profile: Profile) => {
    const updatedProfile = await updateProfile(profile);
    if (updatedProfile) {
      setAppState(prevState => ({ ...prevState, profile: updatedProfile }));
    }
  };

  const handleNaturalLanguageSubmit = async (text: string) => {
    setAppState(prevState => ({ ...prevState, isLoadingAI: true, error: null }));
    try {
      const parsedData = await parseNaturalLanguageLog(text, appState.profile);
      
      if(parsedData.workouts) {
        for (const workout of parsedData.workouts) {
          const newEntry = await addActivity({ type: 'workout', data: workout }, appState.profile.id!); // Pass profile.id
          if (newEntry) {
            newEntries.push(newEntry);
          }
        }
      }
      if (parsedData.meals) {
        for (const meal of parsedData.meals) {
          const newEntry = await addActivity({ type: 'meal', data: meal }, appState.profile.id!); // Pass profile.id
          if (newEntry) {
            newEntries.push(newEntry);
          }
        }
      }

      if(newEntries.length > 0) {
        setAppState(prevState => ({
          ...prevState,
          nutritionEntries: [...newEntries.filter(e => e.type === 'meal') as NutritionEntry[], ...prevState.nutritionEntries],
          workoutEntries: [...newEntries.filter(e => e.type === 'workout') as WorkoutEntry[], ...prevState.workoutEntries],
          isLoadingAI: false,
        }));
      } else {
         setAppState(prevState => ({...prevState, isLoadingAI: false, error: "AI couldn't identify any specific workout or meal. Try being more specific." }));
      }
      
    } catch (error) {
      console.error("Error parsing natural language log:", error);
      setAppState(prevState => ({ ...prevState, isLoadingAI: false, error: 'Failed to process your entry. Please try again.' }));
    }
  };

  const fetchAITips = useCallback(async () => {
    const allActivities: LogEntry[] = [
      ...appState.nutritionEntries.map(entry => ({ type: 'meal', data: entry, timestamp: new Date(entry.created_at!) })),
      ...appState.workoutEntries.map(entry => ({ type: 'workout', data: entry, timestamp: new Date(entry.created_at!) })),
    ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    if (allActivities.length === 0) return;
    setAppState(prevState => ({ ...prevState, isLoadingAI: true, error: null }));
    try {
      const tips = await generatePersonalizedTips(allActivities.slice(0, 10), appState.profile);
      setAppState(prevState => ({ ...prevState, aiTips: tips, isLoadingAI: false }));
    } catch (error) {
      console.error("Error generating AI tips:", error);
      setAppState(prevState => ({ ...prevState, isLoadingAI: false, error: 'Could not fetch AI tips. Please try again later.' }));
    }
  }, [appState.nutritionEntries, appState.workoutEntries, appState.profile]);

  useEffect(() => {
    const allActivitiesLength = appState.nutritionEntries.length + appState.workoutEntries.length;
    if (allActivitiesLength > 4 && allActivitiesLength % 2 === 1) {
        fetchAITips();
    }
  }, [appState.nutritionEntries.length, appState.workoutEntries.length, fetchAITips]);

  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Dashboard">
          {() => selectedDashboardConfig ? (
            <DashboardScreen 
              appState={appState} 
              dashboardConfig={selectedDashboardConfig} 
              onAddActivity={handleAddActivity}
              onDeleteActivity={handleDeleteActivity}
              onNaturalLanguageSubmit={handleNaturalLanguageSubmit}
              onUpdateProfile={handleUpdateProfile}
              fetchAITips={fetchAITips}
            />
          ) : (
            <DashboardSelectionScreen profileId={appState.profile.id!} onSelectDashboard={setSelectedDashboardConfig} />
          )}
        </Tab.Screen>
        <Tab.Screen name="Log">
          {() => <LogScreen appState={appState} onAddActivity={handleAddActivity} onDeleteActivity={handleDeleteActivity} onNaturalLanguageSubmit={handleNaturalLanguageSubmit} />}
        </Tab.Screen>
        <Tab.Screen name="Community">
          {() => <CommunityScreen appState={appState} />}
        </Tab.Screen>
        <Tab.Screen name="Profile">
          {() => <ProfileScreen appState={appState} onUpdateProfile={handleUpdateProfile} fetchAITips={fetchAITips} />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;
