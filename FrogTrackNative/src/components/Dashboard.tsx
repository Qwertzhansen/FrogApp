
import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LogEntry, MacroNutrients, Workout, Profile } from '../types';
// We will create this component in the next step
import SummaryTile from './SummaryTile'; 
import { calculateTDEE } from '../utils/fitnessCalculations';

interface DashboardProps {
  activities: LogEntry[];
  profile: Profile;
}

const Dashboard: React.FC<DashboardProps> = ({ activities, profile }) => {
  const today = new Date().toDateString();

  const todaysActivities = useMemo(() => 
    activities.filter(a => a.timestamp.toDateString() === today),
    [activities, today]
  );

  const totalCalories = useMemo(() => {
    return todaysActivities
      .filter(a => a.type === 'meal')
      .reduce((sum, activity) => {
        const meal = activity.data as any; // Cast to access meal properties
        return sum + (meal.calories || 0);
      }, 0);
  }, [todaysActivities]);
  
  const totalCaloriesBurned = useMemo((): number => {
    return todaysActivities
      .filter(a => a.type === 'workout')
      .reduce((sum, activity) => {
        const workout = activity.data as Workout;
        return sum + (workout.calories || 0);
      }, 0);
  }, [todaysActivities]);

  const totalMacros = useMemo((): MacroNutrients => {
    return todaysActivities
      .filter(a => a.type === 'meal')
      .reduce((macros, activity) => {
        const meal = activity.data as any;
        macros.protein += meal.protein || 0;
        macros.carbs += meal.carbs || 0;
        macros.fat += meal.fat || 0;
        return macros;
      }, { protein: 0, carbs: 0, fat: 0 });
  }, [todaysActivities]);

  const workoutsCompleted = useMemo(() => {
    return todaysActivities.filter(a => a.type === 'workout').length;
  }, [todaysActivities]);

  const calorieGoal = useMemo(() => calculateTDEE(profile), [profile]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Today's Summary</Text>
      <View style={styles.tilesContainer}>
        <SummaryTile
          title="Calories Consumed"
          value={totalCalories.toLocaleString()}
          unit="kcal"
          goal={calorieGoal}
        />
        <SummaryTile
          title="Calories Burned"
          value={totalCaloriesBurned.toLocaleString()}
          unit="kcal"
        />
        <SummaryTile
          title="Workouts"
          value={workoutsCompleted.toString()}
          unit="completed"
        />
        <SummaryTile
          title="Macros"
          value={`${Math.round(totalMacros.protein)}p / ${Math.round(totalMacros.carbs)}c / ${Math.round(totalMacros.fat)}f`}
          unit="grams"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  tilesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  tile: {
    width: '48%',
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
});

export default Dashboard;
