
import React, { useState, useCallback, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashboardScreen from './src/screens/DashboardScreen';
import LogScreen from './src/screens/LogScreen';
import CommunityScreen from './src/screens/CommunityScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import { LogEntry, Activity, Meal, Workout, AppState, Profile } from './src/types';
import { parseNaturalLanguageLog, generatePersonalizedTips } from './src/services/geminiService';

const Tab = createBottomTabNavigator();

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({
    profile: {
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
    activities: [],
    friends: [],
    aiTips: '',
    isLoadingAI: false,
    error: null
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileResponse = await fetch('http://localhost:3000/api/profile');
        const profileData = await profileResponse.json();
        const activitiesResponse = await fetch('http://localhost:3000/api/activities');
        const activitiesData = await activitiesResponse.json();
        setAppState(prevState => ({ ...prevState, profile: profileData, activities: activitiesData }));
      } catch (error) {
        console.error("Failed to fetch data from server:", error);
      }
    };
    fetchData();
  }, []);

  const handleAddActivity = async (activity: Activity) => {
    try {
      const response = await fetch('http://localhost:3000/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(activity),
      });
      const newActivity = await response.json();
      setAppState(prevState => ({ ...prevState, activities: [newActivity.data, ...prevState.activities] }));
    } catch (error) {
      console.error("Failed to add activity:", error);
    }
  };

  const handleDeleteActivity = (timestamp: Date) => {
    setAppState(prevState => ({
      ...prevState,
      activities: prevState.activities.filter(a => a.timestamp.getTime() !== timestamp.getTime()),
    }));
  };

  const handleUpdateProfile = (profile: Profile) => {
    setAppState(prevState => ({
      ...prevState,
      profile,
    }));
  };

  const handleNaturalLanguageSubmit = async (text: string) => {
    setAppState(prevState => ({ ...prevState, isLoadingAI: true, error: null }));
    try {
      const parsedData = await parseNaturalLanguageLog(text, appState.profile);
      
      const newEntries: LogEntry[] = [];
      if (parsedData.workouts) {
        parsedData.workouts.forEach((workout: Workout) => {
          newEntries.push({ type: 'workout', data: workout, timestamp: new Date() });
        });
      }
      if (parsedData.meals) {
        parsedData.meals.forEach((meal: Meal) => {
          newEntries.push({ type: 'meal', data: meal, timestamp: new Date() });
        });
      }

      if(newEntries.length > 0) {
        setAppState(prevState => ({
          ...prevState,
          activities: [...newEntries.reverse(), ...prevState.activities],
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
    if (appState.activities.length === 0) return;
    setAppState(prevState => ({ ...prevState, isLoadingAI: true, error: null }));
    try {
      const tips = await generatePersonalizedTips(appState.activities.slice(0, 10), appState.profile);
      setAppState(prevState => ({ ...prevState, aiTips: tips, isLoadingAI: false }));
    } catch (error) {
      console.error("Error generating AI tips:", error);
      setAppState(prevState => ({ ...prevState, isLoadingAI: false, error: 'Could not fetch AI tips. Please try again later.' }));
    }
  }, [appState.activities, appState.profile]);

  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Dashboard">
          {() => <DashboardScreen appState={appState} />}
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
