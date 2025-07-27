
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Community from '../components/Community';
import { AppState } from '../types';

interface CommunityScreenProps {
  appState: AppState;
}

const CommunityScreen: React.FC<CommunityScreenProps> = ({ appState }) => {
  return (
    <View style={styles.container}>
      <Community friends={appState.friends} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});

export default CommunityScreen;
