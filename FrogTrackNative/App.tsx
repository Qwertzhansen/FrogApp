import React, { useState, useCallback, useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, View, StatusBar, ScrollView } from 'react-native';
import Dashboard from './src/components/Dashboard';
import LogEntryForm from './src/components/LogEntryForm';
import ActivityFeed from './src/components/ActivityFeed';
import AITips from './src/components/AITips';
import ProfileCard from './src/components/Profile';
import Community from './src/components/Community';
import WeeklyProgress from './src/components/WeeklyProgress';
import FoodScanner from './src/components/FoodScanner';
import { LogEntry, Activity, Meal, Workout, AppState, Profile } from './src/types';
import { parseNaturalLanguageLog, generatePersonalizedTips } from './src/services/geminiService';

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
    activities: [
        { type: 'workout', data: { name: 'Morning Run', duration: 30, distance: 5, calories: 350 }, timestamp: new Date('2024-07-29T08:00:00') },
        { type: 'meal', data: { name: 'Breakfast', calories: 450, protein: 30, carbs: 50, fat: 15 }, timestamp: new Date('2024-07-29T09:00:00') },
    ],
    friends: [
      { name: 'Mike Johnson', avatar: '👨‍🦳', lastActivity: 'Logged a new deadlift PR: 180kg!', weeklyScore: 1500 },
      { name: 'Jane Smith', avatar: '👩‍🦰', lastActivity: 'Completed a 45-min HIIT session.', weeklyScore: 1250},
    ],
    aiTips: 'Remember to stay hydrated throughout the day and aim for 8 hours of sleep to maximize recovery.',
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

  useEffect(() => {
    if (appState.activities.length > 4 && appState.activities.length % 2 === 1) {
        fetchAITips();
    }
  }, [appState.activities.length, fetchAITips]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.title}>FrogTrack AI</Text>
      </View>
      <ScrollView style={styles.content}>
        <Dashboard activities={appState.activities} profile={appState.profile} />
        <LogEntryForm 
          onAddActivity={handleAddActivity} 
          onNaturalLanguageSubmit={handleNaturalLanguageSubmit} 
          isLoading={appState.isLoadingAI}
          onOpenScanner={() => {}}
        />
        <WeeklyProgress activities={appState.activities} profile={appState.profile} />
        <ActivityFeed 
          activities={appState.activities.filter(a => a.type === 'workout')} 
          onDeleteActivity={handleDeleteActivity}
          emptyMessage="No workouts logged yet."
        />
        <ActivityFeed 
          activities={appState.activities.filter(a => a.type === 'meal')} 
          onDeleteActivity={handleDeleteActivity}
          emptyMessage="No meals logged yet."
        />
        <ProfileCard profile={appState.profile} onUpdateProfile={handleUpdateProfile} />
        <AITips tips={appState.aiTips} isLoading={appState.isLoadingAI} onRefresh={fetchAITips} />
        <Community friends={appState.friends} />
        {appState.error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{appState.error}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  header: {
    padding: 20,
    backgroundColor: '#16a34a', // Green background
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#fff', // White text
  },
  content: {
    flex: 1,
    padding: 20,
  },
  errorContainer: {
    backgroundColor: '#fecaca',
    padding: 16,
    borderRadius: 8,
    marginVertical: 16,
  },
  errorText: {
    color: '#b91c1c',
    textAlign: 'center',
  },
});

export default App;