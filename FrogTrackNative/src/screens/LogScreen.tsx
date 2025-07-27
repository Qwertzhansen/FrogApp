
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import LogEntryForm from '../components/LogEntryForm';
import ActivityFeed from '../components/ActivityFeed';
import { AppState, Activity } from '../types';

import { AppState, Activity, NutritionEntry, WorkoutEntry } from '../types';

interface LogScreenProps {
  appState: AppState;
  onAddActivity: (activity: Activity) => void;
  onDeleteActivity: (id: number, type: 'meal' | 'workout') => void;
  onNaturalLanguageSubmit: (text: string) => void;
}

const LogScreen: React.FC<LogScreenProps> = ({ appState, onAddActivity, onDeleteActivity, onNaturalLanguageSubmit }) => {
  return (
    <ScrollView style={styles.container}>
      <LogEntryForm 
        onAddActivity={onAddActivity} 
        onNaturalLanguageSubmit={onNaturalLanguageSubmit} 
        isLoading={appState.isLoadingAI}
        onOpenScanner={() => {}}
      />
      <View style={styles.feedContainer}>
        <Text style={styles.feedTitle}>Workout Feed</Text>
        <ActivityFeed 
          activities={appState.workoutEntries.map(entry => ({ type: 'workout', data: entry, timestamp: new Date(entry.created_at!) }))} 
          onDeleteActivity={(logEntry) => onDeleteActivity(logEntry.data.id!, 'workout')}
          emptyMessage="No workouts logged yet."
        />
      </View>
      <View style={styles.feedContainer}>
        <Text style={styles.feedTitle}>Nutrition Feed</Text>
        <ActivityFeed 
          activities={appState.nutritionEntries.map(entry => ({ type: 'meal', data: entry, timestamp: new Date(entry.created_at!) }))} 
          onDeleteActivity={(logEntry) => onDeleteActivity(logEntry.data.id!, 'meal')}
          emptyMessage="No meals logged yet."
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
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

export default LogScreen;
