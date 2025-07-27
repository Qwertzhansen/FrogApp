
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import Dashboard from '../components/Dashboard';
import WeeklyProgress from '../components/WeeklyProgress';
import { AppState } from '../types';

interface DashboardScreenProps {
  appState: AppState;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ appState }) => {
  return (
    <ScrollView style={styles.container}>
      <Dashboard nutritionEntries={appState.nutritionEntries} workoutEntries={appState.workoutEntries} profile={appState.profile} />
      <WeeklyProgress nutritionEntries={appState.nutritionEntries} workoutEntries={appState.workoutEntries} profile={appState.profile} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});

export default DashboardScreen;
