import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Button, TextInput, ScrollView } from 'react-native';
import { Profile, ActivityLevel } from '../types';
import { calculateBMR, calculateTDEE, activityLevelLabels, bodyFatEstimates } from '../utils/fitnessCalculations';

interface ProfileProps {
    profile: Profile;
    onUpdateProfile: (profile: Profile) => void;
}

const goalsOptions = [
    "Lose Fat",
    "Gain Muscle",
    "Improve Endurance",
    "Maintain Weight",
    "Improve General Health",
    "Other"
];

const ProfileCard: React.FC<ProfileProps> = ({ profile, onUpdateProfile }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [formData, setFormData] = useState<Profile>(profile);
    const [customGoal, setCustomGoal] = useState('');

    useEffect(() => {
        setFormData(profile);
        if (profile.goal && !goalsOptions.includes(profile.goal)) {
            setCustomGoal(profile.goal);
        } else {
            setCustomGoal('');
        }
    }, [profile]);

    const bmr = useMemo(() => Math.round(calculateBMR(formData)), [formData]);
    const tdee = useMemo(() => calculateTDEE(formData), [formData]);

    const handleChange = (name: keyof Profile, value: string | number) => {
        if (name === 'goal' && value === 'Other') {
            setFormData(prev => ({ ...prev, goal: customGoal || '' }));
        } else if (name === 'goal') {
            setFormData(prev => ({ ...prev, goal: value as string }));
            setCustomGoal('');
        }
        else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleCustomGoalChange = (value: string) => {
        setCustomGoal(value);
        setFormData(prev => ({...prev, goal: value}));
    };

    const handleBodyFatEstimateChange = (value: string) => {
        if(value) {
            setFormData(prev => ({...prev, bodyFatPercentage: Number(value) }));
        }
    };

    const handleSave = () => {
        onUpdateProfile(formData);
        setIsEditing(false);
    };
    
    const handleCancelEdit = () => {
        setIsEditing(false);
        setFormData(profile);
    };
    
    const toggleExpansion = () => {
      setIsExpanded(prev => !prev);
      if (isEditing) {
        setIsEditing(false);
      }
    };

    if (!profile) {
        return null;
    }
    
    const displayedGoal = profile.goal || "Not set";

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                 <Text style={styles.title}>
                        {isEditing ? 'Edit Profile' : profile.name}
                    </Text>
                 <Button
                    title={isExpanded ? 'Hide Details' : 'Show Details'}
                    onPress={toggleExpansion}
                />
            </View>
            
            {!isExpanded && (
                <View style={styles.summarySection}>
                     <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>My Goal:</Text>
                        <Text style={styles.summaryValue}>{displayedGoal}</Text>
                    </View>
                    <View style={styles.tdeeContainer}>
                        <Text style={styles.tdeeLabel}>Daily Maintenance Calories (TDEE)</Text>
                        <Text style={styles.tdeeValue}>{tdee.toLocaleString()} <Text style={styles.unit}>kcal</Text></Text>
                    </View>
                </View>
            )}

            {isExpanded && !isEditing && (
                 <View style={styles.detailsSection}>
                    <View style={styles.detailsGrid}>
                        <Text style={styles.detailLabel}>Email:</Text>
                        <Text style={styles.detailValue}>{profile.email}</Text>
                        <Text style={styles.detailLabel}>Username:</Text>
                        <Text style={styles.detailValue}>{profile.username}</Text>
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
                        <Text style={styles.tdeeValue}>{tdee.toLocaleString()} <Text style={styles.unit}>kcal</Text></Text>
                        <Text style={styles.bmrText}>BMR: {bmr.toLocaleString()} kcal</Text>
                    </View>
                    <Button title="Edit Profile" onPress={() => setIsEditing(true)} />
                </View>
            )}
            
            {isExpanded && isEditing && (
                 <ScrollView style={styles.editForm}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Name</Text>
                        <TextInput value={formData.name} onChangeText={(text) => handleChange('name', text)} style={styles.input}/>
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput value={formData.email} onChangeText={(text) => handleChange('email', text)} style={styles.input} keyboardType="email-address"/>
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Username</Text>
                        <TextInput value={formData.username} onChangeText={(text) => handleChange('username', text)} style={styles.input}/>
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Gender</Text>
                        <TextInput value={formData.gender} onChangeText={(text) => handleChange('gender', text)} style={styles.input}/>
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Age</Text>
                        <TextInput value={String(formData.age)} onChangeText={(text) => handleChange('age', Number(text))} style={styles.input} keyboardType="numeric"/>
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Height (cm)</Text>
                        <TextInput value={String(formData.height)} onChangeText={(text) => handleChange('height', Number(text))} style={styles.input} keyboardType="numeric"/>
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Weight (kg)</Text>
                        <TextInput value={String(formData.weight)} onChangeText={(text) => handleChange('weight', Number(text))} style={styles.input} keyboardType="numeric"/>
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Primary Goal</Text>
                        <TextInput value={formData.goal} onChangeText={(text) => handleChange('goal', text)} style={styles.input}/>
                        {formData.goal === 'Other' && (
                            <TextInput value={customGoal} onChangeText={handleCustomGoalChange} placeholder="Describe your goal" style={styles.input} />
                        )}
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Activity Level</Text>
                        <TextInput value={formData.activityLevel} onChangeText={(text) => handleChange('activityLevel', text as ActivityLevel)} style={styles.input}/>
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Body Fat % (Optional)</Text>
                        <TextInput value={String(formData.bodyFatPercentage || '')} onChangeText={(text) => handleChange('bodyFatPercentage', Number(text))} style={styles.input} keyboardType="numeric"/>
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>BMR Mode</Text>
                        <View style={styles.radioGroup}>
                            <Button title="Calculated" onPress={() => handleChange('bmrMode', 'calculated')} color={formData.bmrMode === 'calculated' ? '#3b82f6' : '#9ca3af'} />
                            <Button title="Manual" onPress={() => handleChange('bmrMode', 'manual')} color={formData.bmrMode === 'manual' ? '#3b82f6' : '#9ca3af'} />
                        </View>
                    </View>
                    {formData.bmrMode === 'manual' && (
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Manual BMR (kcal)</Text>
                            <TextInput value={String(formData.manualBmr || '')} onChangeText={(text) => handleChange('manualBmr', Number(text))} style={styles.input} keyboardType="numeric"/>
                        </View>
                    )}
                    
                    <View style={styles.buttonRow}>
                        <Button title="Cancel" onPress={handleCancelEdit} color="#ef4444" />
                        <Button title="Save Changes" onPress={handleSave} />
                    </View>
                </ScrollView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginVertical: 16 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    title: { fontSize: 22, fontWeight: 'bold' },
    summarySection: { marginBottom: 16 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 },
    summaryLabel: { fontSize: 16, fontWeight: '500', color: '#4b5563' },
    summaryValue: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    tdeeContainer: { backgroundColor: '#f3f4f6', padding: 12, borderRadius: 8, alignItems: 'center', marginVertical: 8 },
    tdeeLabel: { fontSize: 14, fontWeight: '600', color: '#4b5563' },
    tdeeValue: { fontSize: 24, fontWeight: 'bold', color: '#3b82f6' },
    unit: { fontSize: 16, fontWeight: 'normal' },
    bmrText: { fontSize: 12, color: '#6b7280' },
    detailsSection: { marginBottom: 16 },
    detailsGrid: { marginBottom: 16 },
    detailLabel: { fontWeight: '600', color: '#4b5563', marginBottom: 4 },
    detailValue: { marginBottom: 8 },
    editForm: { paddingVertical: 16 },
    inputGroup: { marginBottom: 12 },
    label: { fontSize: 14, fontWeight: '500', marginBottom: 4, color: '#4b5563' },
    input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 10, fontSize: 16, backgroundColor: '#f9fafb' },
    radioGroup: { flexDirection: 'row', gap: 10, marginTop: 8 },
    buttonRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 },
});

export default ProfileCard;