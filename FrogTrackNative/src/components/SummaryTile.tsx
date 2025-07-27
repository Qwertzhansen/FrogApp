
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface SummaryTileProps {
  title: string;
  value: string;
  unit: string;
  icon?: React.ReactNode; // Icons will be handled later
  goal?: number;
}

const SummaryTile: React.FC<SummaryTileProps> = ({ title, value, unit, icon, goal }) => {
  return (
    <View style={styles.container}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.value}>
          {value}
          {goal && goal > 0 && <Text style={styles.goal}> / {goal.toLocaleString()}</Text>}
        </Text>
        <Text style={styles.unit}>{unit}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '48%', // To fit two tiles in a row
  },
  iconContainer: {
    marginRight: 16,
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
  },
  title: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  value: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  goal: {
    fontSize: 16,
    fontWeight: 'normal',
    color: '#666',
  },
  unit: {
    fontSize: 12,
    color: '#999',
  },
});

export default SummaryTile;
