import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { LogEntry, Meal, Workout, Exercise, NutritionEntry, WorkoutEntry } from '../types';

const ExerciseDetail: React.FC<{ exercise: Exercise }> = ({ exercise }) => (
  <View style={styles.exerciseDetail}>
    <Text style={styles.exerciseText}>{exercise.name}: </Text>
    {exercise.sets && <Text style={styles.exerciseText}>{exercise.sets} sets</Text>}
    {exercise.reps && <Text style={styles.exerciseText}> &times; {exercise.reps} reps</Text>}
    {exercise.weight && <Text style={styles.exerciseText}> @ {exercise.weight}kg</Text>}
  </View>
);

interface ActivityCardProps {
    log: LogEntry;
    onDelete: (logEntry: LogEntry) => void;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ log, onDelete }) => {
  const isMeal = log.type === 'meal';
  const data = log.data as (NutritionEntry | WorkoutEntry);

  return (
    <View style={styles.cardContainer}>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{data.name}</Text>
        
        {isMeal ? (
          <View style={styles.detailsRow}>
            <Text style={styles.detailText}>🔥 {(data as NutritionEntry).calories} kcal</Text>
            {(data as NutritionEntry).protein !== undefined && <Text style={styles.detailText}>P: {(data as NutritionEntry).protein}g</Text>}
            {(data as NutritionEntry).carbs !== undefined && <Text style={styles.detailText}>C: {(data as NutritionEntry).carbs}g</Text>}
            {(data as NutritionEntry).fat !== undefined && <Text style={styles.detailText}>F: {(data as NutritionEntry).fat}g</Text>}
          </View>
        ) : (
          <View>
             <View style={styles.detailsRow}>
                {(data as WorkoutEntry).duration && <Text style={styles.detailText}>🕒 {(data as WorkoutEntry).duration} min</Text>}
                {(data as WorkoutEntry).distance && <Text style={styles.detailText}>📏 {(data as WorkoutEntry).distance} km</Text>}
                {(data as WorkoutEntry).calories && <Text style={styles.detailText}>🔥 {(data as WorkoutEntry).calories} kcal</Text>}
             </View>
             {(data as WorkoutEntry).exercises && (
                <View style={styles.exercisesContainer}>
                    {(data as WorkoutEntry).exercises.map((ex, index) => <ExerciseDetail key={index} exercise={ex} />)}
                </View>
             )}
          </View>
        )}
      </View>
      <TouchableOpacity onPress={() => onDelete(log)} style={styles.deleteButton}>
        <Text style={styles.deleteButtonText}>X</Text>
      </TouchableOpacity>
    </View>
  );
};

interface ActivityFeedProps {
  activities: LogEntry[];
  onDeleteActivity: (logEntry: LogEntry) => void;
  emptyMessage?: string;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities, onDeleteActivity, emptyMessage }) => {
  return (
    <FlatList
      data={activities}
      renderItem={({ item }) => (
        <ActivityCard 
            log={item} 
            onDelete={onDeleteActivity}
        />
      )}
      keyExtractor={(item) => `${item.type}-${item.data.id}`}
      ListEmptyComponent={() => (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{emptyMessage || "No activities logged yet."}</Text>
        </View>
      )}
      contentContainerStyle={styles.listContentContainer}
    />
  );
};

const styles = StyleSheet.create({
  cardContainer: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginVertical: 8, flexDirection: 'row', alignItems: 'center' },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  detailsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  detailText: { fontSize: 14, color: '#4b5563' },
  exercisesContainer: { marginTop: 8 },
  exerciseDetail: { marginLeft: 8 },
  exerciseText: { fontSize: 12, color: '#6b7280' },
  deleteButton: { padding: 8 },
  deleteButtonText: { color: '#ef4444', fontSize: 16 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', padding: 32, backgroundColor: '#f9fafb', borderRadius: 12 },
  emptyText: { color: '#6b7280' },
  listContentContainer: { paddingBottom: 16 },
});

export default ActivityFeed;