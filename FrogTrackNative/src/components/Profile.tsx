
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { Profile } from '../types';
import { calculateBMR, calculateTDEE } from '../utils/fitnessCalculations';

interface ProfileProps {
    profile: Profile;
    onUpdateProfile: (profile: Profile) => void;
}

const ProfileCard: React.FC<ProfileProps> = ({ profile, onUpdateProfile }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const bmr = useMemo(() => Math.round(calculateBMR(profile)), [profile]);
    const tdee = useMemo(() => calculateTDEE(profile), [profile]);
    
    const displayedGoal = profile.goal || "Not set";

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{profile.name}</Text>
                <Button title={isExpanded ? 'Hide' : 'Show'} onPress={() => setIsExpanded(!isExpanded)} />
            </View>
            
            {!isExpanded ? (
                <View>
                    <Text style={styles.goalText}>My Goal: {displayedGoal}</Text>
                    <View style={styles.tdeeContainer}>
                        <Text style={styles.tdeeLabel}>Daily Maintenance Calories (TDEE)</Text>
                        <Text style={styles.tdeeValue}>{tdee.toLocaleString()} kcal</Text>
                    </View>
                </View>
            ) : (
                 <View>
                    <View style={styles.detailsGrid}>
                        <Text style={styles.detailLabel}>Goal:</Text>
                        <Text style={styles.detailValue}>{displayedGoal}</Text>
                        <Text style={styles.detailLabel}>Age:</Text>
                        <Text style={styles.detailValue}>{profile.age} years</Text>
                        <Text style={styles.detailLabel}>Height:</Text>
                        <Text style={styles.detailValue}>{profile.height} cm</Text>
                        <Text style={styles.detailLabel}>Weight:</Text>
                        <Text style={styles.detailValue}>{profile.weight} kg</Text>
                         <Text style={styles.detailLabel}>Activity Level:</Text>
                        <Text style={styles.detailValue}>{profile.activityLevel.replace('_', ' ')}</Text>
                    </View>
                     <View style={styles.tdeeContainer}>
                        <Text style={styles.tdeeLabel}>Daily Maintenance Calories (TDEE)</Text>
                        <Text style={styles.tdeeValue}>{tdee.toLocaleString()} kcal</Text>
                        <Text style={styles.bmrText}>BMR: {bmr.toLocaleString()} kcal</Text>
                    </View>
                    {/* We can add the edit button here later */}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginVertical: 16 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    title: { fontSize: 22, fontWeight: 'bold' },
    goalText: { fontSize: 16, fontWeight: '500', color: '#4b5563', marginBottom: 12 },
    tdeeContainer: { backgroundColor: '#f3f4f6', padding: 12, borderRadius: 8, alignItems: 'center', marginVertical: 8 },
    tdeeLabel: { fontSize: 14, fontWeight: '600', color: '#4b5563' },
    tdeeValue: { fontSize: 24, fontWeight: 'bold', color: '#3b82f6' },
    bmrText: { fontSize: 12, color: '#6b7280' },
    detailsGrid: { marginBottom: 16 },
    detailLabel: { fontWeight: '600', color: '#4b5563' },
    detailValue: { marginBottom: 8 },
});

export default ProfileCard;
