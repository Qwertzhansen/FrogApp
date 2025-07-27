
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { NutritionEntry, WorkoutEntry, Profile } from '../types';
import { calculateTDEE } from '../utils/fitnessCalculations';
import { BarChart } from 'react-native-chart-kit';

interface WeeklyProgressProps {
  nutritionEntries: NutritionEntry[];
  workoutEntries: WorkoutEntry[];
  profile: Profile;
}

const getPast7DaysData = (nutritionEntries: NutritionEntry[]) => {
    const data: { date: Date; caloriesConsumed: number }[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        
        const dailyNutrition = nutritionEntries.filter(e => {
            const entryDate = new Date(e.created_at!);
            entryDate.setHours(0, 0, 0, 0);
            return entryDate.getTime() === date.getTime();
        });
        
        const caloriesConsumed = dailyNutrition.reduce((sum, entry) => sum + (entry.calories || 0), 0);

        data.push({
            date: date,
            caloriesConsumed,
        });
    }
    return data;
};

const WeeklyProgress: React.FC<WeeklyProgressProps> = ({ nutritionEntries, workoutEntries, profile }) => {
    const weeklyData = useMemo(() => getPast7DaysData(nutritionEntries), [nutritionEntries]);
    const tdee = useMemo(() => calculateTDEE(profile), [profile]);
    
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const chartData = {
        labels: weeklyData.map(d => dayLabels[d.date.getDay()]),
        datasets: [
            {
                data: weeklyData.map(d => d.caloriesConsumed)
            }
        ]
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Weekly Progress</Text>
            <BarChart
                data={chartData}
                width={Dimensions.get('window').width - 32} // from react-native
                height={220}
                yAxisLabel=""
                yAxisSuffix=" kcal"
                chartConfig={{
                    backgroundColor: '#ffffff',
                    backgroundGradientFrom: '#ffffff',
                    backgroundGradientTo: '#ffffff',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
                    style: {
                        borderRadius: 16
                    },
                    propsForDots: {
                        r: "6",
                        strokeWidth: "2",
                        stroke: "#ffa726"
                    }
                }}
                style={{
                    marginVertical: 8,
                    borderRadius: 16
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginVertical: 16, alignItems: 'center' },
    title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, alignSelf: 'flex-start' },
});

export default WeeklyProgress;
