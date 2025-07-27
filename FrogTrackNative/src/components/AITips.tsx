
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, LayoutAnimation, UIManager, Platform } from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface AITipsProps {
  tips: string;
  isLoading: boolean;
  onRefresh: () => void;
}

const AITips: React.FC<AITipsProps> = ({ tips, isLoading, onRefresh }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsCollapsed(!isCollapsed);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Personalized Tips</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={onRefresh} disabled={isLoading} style={styles.button}>
            <Text style={styles.buttonText}>{isLoading ? '🔄' : 'Refresh'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleCollapse} style={styles.button}>
            <Text style={styles.buttonText}>{isCollapsed ? '▼' : '▲'}</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {!isCollapsed && (
        <View style={styles.content}>
          {isLoading && !tips ? (
            <Text style={styles.loadingText}>Loading tips...</Text>
          ) : (
            <Text style={styles.tipsText}>{tips}</Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: '#4f46e5', padding: 16, borderRadius: 12, marginVertical: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  headerButtons: { flexDirection: 'row' },
  button: { padding: 8 },
  buttonText: { color: '#fff', fontSize: 16 },
  content: { marginTop: 16 },
  loadingText: { color: '#e0e7ff', fontStyle: 'italic' },
  tipsText: { color: '#e0e7ff', fontSize: 14, lineHeight: 20 },
});

export default AITips;
