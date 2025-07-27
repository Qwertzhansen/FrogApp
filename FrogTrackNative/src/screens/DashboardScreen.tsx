import React from 'react';
import { ScrollView, StyleSheet, View, Text } from 'react-native';
import Dashboard from '../components/Dashboard';
import WeeklyProgress from '../components/WeeklyProgress';
import LogEntryForm from '../components/LogEntryForm';
import ActivityFeed from '../components/ActivityFeed';
import AITips from '../components/AITips';
import ProfileCard from '../components/Profile';
import Community from '../components/Community';
import { AppState, Activity } from '../types';

interface DashboardScreenProps {
  appState: AppState;
  dashboardConfig: { components: string[] };
  onAddActivity: (activity: Activity) => void;
  onDeleteActivity: (id: number, type: 'meal' | 'workout') => void;
  onNaturalLanguageSubmit: (text: string) => void;
  onUpdateProfile: (profile: any) => void;
  fetchAITips: () => void;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ 
  appState,
  dashboardConfig,
  onAddActivity,
  onDeleteActivity,
  onNaturalLanguageSubmit,
  onUpdateProfile,
  fetchAITips
}) => {
  const renderComponent = (componentName: string) => {
    switch (componentName) {
      case 'Dashboard':
        return <Dashboard nutritionEntries={appState.nutritionEntries} workoutEntries={appState.workoutEntries} profile={appState.profile} />;
      case 'WeeklyProgress':
        return <WeeklyProgress nutritionEntries={appState.nutritionEntries} workoutEntries={appState.workoutEntries} profile={appState.profile} />;
      case 'LogEntryForm':
        return (
          <LogEntryForm 
            onAddActivity={onAddActivity} 
            onNaturalLanguageSubmit={onNaturalLanguageSubmit} 
            isLoading={appState.isLoadingAI}
            onOpenScanner={() => { /* Implement scanner logic later */ }}
          />
        );
      case 'ActivityFeedWorkouts':
        return (
          <View style={styles.feedContainer}>
            <Text style={styles.feedTitle}>Workout Feed</Text>
            <ActivityFeed 
              activities={appState.workoutEntries.map(entry => ({ type: 'workout', data: entry, timestamp: new Date(entry.created_at!) }))} 
              onDeleteActivity={(logEntry) => onDeleteActivity(logEntry.data.id!, 'workout')}
              emptyMessage="No workouts logged yet."
            />
          </View>
        );
      case 'ActivityFeedNutrition':
        return (
          <View style={styles.feedContainer}>
            <Text style={styles.feedTitle}>Nutrition Feed</Text>
            <ActivityFeed 
              activities={appState.nutritionEntries.map(entry => ({ type: 'meal', data: entry, timestamp: new Date(entry.created_at!) }))} 
              onDeleteActivity={(logEntry) => onDeleteActivity(logEntry.data.id!, 'meal')}
              emptyMessage="No meals logged yet."
            />
          </View>
        );
      case 'AITips':
        return <AITips tips={appState.aiTips} isLoading={appState.isLoadingAI} onRefresh={fetchAITips} />;
      case 'ProfileCard':
        return <ProfileCard profile={appState.profile} onUpdateProfile={onUpdateProfile} />;
      case 'Community':
        return <Community friends={appState.friends} />;
      default:
        return <Text>Unknown component: {componentName}</Text>;
    }
  };

  return (
    <ScrollView style={styles.container}>
      {dashboardConfig.components.map((componentName, index) => (
        <View key={index} style={styles.componentWrapper}>
          {renderComponent(componentName)}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  componentWrapper: {
    marginBottom: 16, // Add some spacing between components
  },
  feedContainer: {
    marginVertical: 16,
  },
  feedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});

export default DashboardScreen;