
import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NutritionEntry, WorkoutEntry, MacroNutrients, Profile } from '../types';
import SummaryTile from './SummaryTile'; 
import { calculateTDEE } from '../utils/fitnessCalculations';

interface DashboardProps {
  nutritionEntries: NutritionEntry[];
  workoutEntries: WorkoutEntry[];
  profile: Profile;
}

const Dashboard: React.FC<DashboardProps> = ({ nutritionEntries, workoutEntries, profile }) => {
  const today = new Date().toDateString();

  const todaysNutrition = useMemo(() => 
    nutritionEntries.filter(e => new Date(e.created_at!).toDateString() === today),
    [nutritionEntries, today]
  );

  const todaysWorkouts = useMemo(() => 
    workoutEntries.filter(e => new Date(e.created_at!).toDateString() === today),
    [workoutEntries, today]
  );

  const totalCalories = useMemo(() => {
    return todaysNutrition.reduce((sum, entry) => sum + (entry.calories || 0), 0);
  }, [todaysNutrition]);
  
  const totalCaloriesBurned = useMemo((): number => {
    return todaysWorkouts.reduce((sum, entry) => sum + (entry.calories || 0), 0);
  }, [todaysWorkouts]);

  const totalMacros = useMemo((): MacroNutrients => {
    return todaysNutrition.reduce((macros, entry) => {
        macros.protein += entry.protein || 0;
        macros.carbs += entry.carbs || 0;
        macros.fat += entry.fat || 0;
        return macros;
    }, { protein: 0, carbs: 0, fat: 0 });
  }, [todaysNutrition]);

  const workoutsCompleted = useMemo(() => {
    return todaysWorkouts.length;
  }, [todaysWorkouts]);

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
