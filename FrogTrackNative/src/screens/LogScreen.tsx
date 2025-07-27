
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import LogEntryForm from '../components/LogEntryForm';
import ActivityFeed from '../components/ActivityFeed';
import { AppState, Activity } from '../types';

interface LogScreenProps {
  appState: AppState;
  onAddActivity: (activity: Activity) => void;
  onDeleteActivity: (timestamp: Date) => void;
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
          activities={appState.activities.filter(a => a.type === 'workout')} 
          onDeleteActivity={onDeleteActivity}
          emptyMessage="No workouts logged yet."
        />
      </View>
      <View style={styles.feedContainer}>
        <Text style={styles.feedTitle}>Nutrition Feed</Text>
        <ActivityFeed 
          activities={appState.activities.filter(a => a.type === 'meal')} 
          onDeleteActivity={onDeleteActivity}
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
