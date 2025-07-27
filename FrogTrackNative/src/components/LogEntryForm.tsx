
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { Activity, Meal, Workout, Exercise } from '../types';

interface LogEntryFormProps {
  onAddActivity: (activity: Activity) => void;
  onNaturalLanguageSubmit: (text: string) => void;
  isLoading: boolean;
  onOpenScanner: () => void;
}

type FormMode = 'natural' | 'structured';

const LogEntryForm: React.FC<LogEntryFormProps> = ({ onAddActivity, onNaturalLanguageSubmit, isLoading, onOpenScanner }) => {
  const [mode, setMode] = useState<FormMode>('natural');
  const [naturalInput, setNaturalInput] = useState('');
  const [structuredType, setStructuredType] = useState<'meal' | 'workout'>('meal');
  
  // Meal state
  const [mealName, setMealName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  // Workout state
  const [workoutName, setWorkoutName] = useState('');
  const [duration, setDuration] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [exerciseName, setExerciseName] = useState('');
  const [exerciseSets, setExerciseSets] = useState('');
  const [exerciseReps, setExerciseReps] = useState('');
  const [exerciseWeight, setExerciseWeight] = useState('');

  const resetMealForm = () => {
    setMealName('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
  };

  const resetWorkoutForm = () => {
    setWorkoutName('');
    setDuration('');
    setExercises([]);
  };

  const handleAddExercise = () => {
    if (!exerciseName.trim()) return;
    const newExercise: Exercise = {
        name: exerciseName.trim(),
        sets: exerciseSets ? parseInt(exerciseSets, 10) : undefined,
        reps: exerciseReps ? parseInt(exerciseReps, 10) : undefined,
        weight: exerciseWeight ? parseInt(exerciseWeight, 10) : undefined,
    };
    setExercises(prev => [...prev, newExercise]);
    setExerciseName('');
    setExerciseSets('');
    setExerciseReps('');
    setExerciseWeight('');
  };

  const handleRemoveExercise = (indexToRemove: number) => {
    setExercises(prev => prev.filter((_, index) => index !== indexToRemove));
  };


  const handleStructuredSubmit = () => {
    if (structuredType === 'meal') {
      const meal: Meal = {
        name: mealName,
        calories: parseInt(calories, 10) || 0,
        protein: parseInt(protein, 10) || undefined,
        carbs: parseInt(carbs, 10) || undefined,
        fat: parseInt(fat, 10) || undefined,
      };
      onAddActivity({ type: 'meal', data: meal });
      resetMealForm();
    } else {
      const workout: Workout = {
        name: workoutName,
        duration: parseInt(duration, 10) || 0,
        exercises: exercises.length > 0 ? exercises : undefined,
      };
      onAddActivity({ type: 'workout', data: workout });
      resetWorkoutForm();
    }
  };

  const handleNaturalSubmit = () => {
    if (!naturalInput.trim()) return;
    onNaturalLanguageSubmit(naturalInput);
    setNaturalInput('');
  };

  const renderNaturalForm = () => (
    <View>
      <Text style={styles.label}>Describe your workout or meal</Text>
      <TextInput
        value={naturalInput}
        onChangeText={setNaturalInput}
        placeholder="Log your activities with AI..."
        style={styles.textArea}
        multiline
        numberOfLines={3}
        editable={!isLoading}
      />
      <Button title={isLoading ? "Processing..." : "Submit"} onPress={handleNaturalSubmit} disabled={isLoading || !naturalInput.trim()} />
    </View>
  );

  const renderStructuredForm = () => (
    <View>
      <View style={styles.buttonGroup}>
        <Button title="Meal" onPress={() => setStructuredType('meal')} color={structuredType === 'meal' ? '#3b82f6' : '#9ca3af'} />
        <Button title="Workout" onPress={() => setStructuredType('workout')} color={structuredType === 'workout' ? '#3b82f6' : '#9ca3af'} />
      </View>
      
      {structuredType === 'meal' && (
        <View>
          <TextInput placeholder="Meal Name" value={mealName} onChangeText={setMealName} style={styles.input}/>
          <TextInput placeholder="Calories" value={calories} onChangeText={setCalories} style={styles.input} keyboardType="numeric"/>
          <TextInput placeholder="Protein (g)" value={protein} onChangeText={setProtein} style={styles.input} keyboardType="numeric"/>
          <TextInput placeholder="Carbs (g)" value={carbs} onChangeText={setCarbs} style={styles.input} keyboardType="numeric"/>
          <TextInput placeholder="Fat (g)" value={fat} onChangeText={setFat} style={styles.input} keyboardType="numeric"/>
        </View>
      )}

      {structuredType === 'workout' && (
        <View>
            <TextInput placeholder="Workout Name" value={workoutName} onChangeText={setWorkoutName} style={styles.input}/>
            <TextInput placeholder="Duration (min)" value={duration} onChangeText={setDuration} style={styles.input} keyboardType="numeric"/>
            <Text style={styles.subheading}>Exercises</Text>
            {exercises.map((ex, index) => (
                <View key={index} style={styles.exerciseItem}>
                    <Text>{ex.name} - {ex.sets}x{ex.reps} @ {ex.weight}kg</Text>
                    <Button title="X" onPress={() => handleRemoveExercise(index)} color="#ef4444" />
                </View>
            ))}
            <TextInput placeholder="Exercise Name" value={exerciseName} onChangeText={setExerciseName} style={styles.input} />
            <TextInput placeholder="Sets" value={exerciseSets} onChangeText={setExerciseSets} style={styles.input} keyboardType="numeric"/>
            <TextInput placeholder="Reps" value={exerciseReps} onChangeText={setExerciseReps} style={styles.input} keyboardType="numeric"/>
            <TextInput placeholder="Weight (kg)" value={exerciseWeight} onChangeText={setExerciseWeight} style={styles.input} keyboardType="numeric"/>
            <Button title="Add Exercise" onPress={handleAddExercise} />
        </View>
      )}

      <View style={{marginTop: 16}}>
        <Button title="Add Log" onPress={handleStructuredSubmit} />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Log Activity</Text>
        <View style={styles.buttonGroup}>
          <Button title="AI Text" onPress={() => setMode('natural')} color={mode === 'natural' ? '#3b82f6' : '#9ca3af'} />
          <Button title="Manual" onPress={() => setMode('structured')} color={mode === 'structured' ? '#3b82f6' : '#9ca3af'} />
        </View>
      </View>
      <TouchableOpacity onPress={onOpenScanner} style={styles.scannerButton}>
        <Text style={styles.scannerButtonText}>Scan Meal with Camera</Text>
      </TouchableOpacity>
      {mode === 'natural' ? renderNaturalForm() : renderStructuredForm()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginVertical: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 20, fontWeight: 'bold' },
  buttonGroup: { flexDirection: 'row', gap: 8 },
  scannerButton: { backgroundColor: '#e0f2fe', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 16 },
  scannerButtonText: { color: '#0ea5e9', fontWeight: '600' },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 8, color: '#4b5563' },
  input: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, marginBottom: 12 },
  textArea: { height: 100, textAlignVertical: 'top', backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, marginBottom: 12 },
  subheading: { fontSize: 16, fontWeight: '600', marginTop: 16, marginBottom: 8 },
  exerciseItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f3f4f6', padding: 8, borderRadius: 6, marginBottom: 8 },
});

export default LogEntryForm;
