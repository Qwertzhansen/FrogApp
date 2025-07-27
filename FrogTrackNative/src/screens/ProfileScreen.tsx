
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import ProfileCard from '../components/Profile';
import AITips from '../components/AITips';
import { AppState, Profile } from '../types';

interface ProfileScreenProps {
  appState: AppState;
  onUpdateProfile: (profile: Profile) => void;
  fetchAITips: () => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ appState, onUpdateProfile, fetchAITips }) => {
  return (
    <ScrollView style={styles.container}>
      <ProfileCard profile={appState.profile} onUpdateProfile={onUpdateProfile} />
      <AITips tips={appState.aiTips} isLoading={appState.isLoadingAI} onRefresh={fetchAITips} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});

export default ProfileScreen;
