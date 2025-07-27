
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Friend } from '../types';

interface CommunityProps {
  friends: Friend[];
}

const Community: React.FC<CommunityProps> = ({ friends }) => {

  const sortedFriends = useMemo(() => {
    return [...friends].sort((a, b) => (b.weeklyScore || 0) - (a.weeklyScore || 0));
  }, [friends]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Community Standings</Text>
      <FlatList
        data={sortedFriends}
        renderItem={({ item, index }) => (
          <View style={styles.friendItem}>
            <Text style={styles.rank}>{index === 0 ? '🏆' : index + 1}</Text>
            <Text style={styles.avatar}>{item.avatar}</Text>
            <View style={styles.friendInfo}>
              <Text style={styles.friendName}>{item.name}</Text>
              <Text style={styles.friendActivity}>{item.lastActivity}</Text>
            </View>
            <View style={styles.scoreContainer}>
              <Text style={styles.score}>{item.weeklyScore?.toLocaleString()}</Text>
              <Text style={styles.scoreLabel}>Score</Text>
            </View>
          </View>
        )}
        keyExtractor={(item, index) => `${item.name}-${index}`}
        ListEmptyComponent={() => (
          <Text style={styles.emptyText}>No friends added yet.</Text>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginVertical: 16 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  friendItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  rank: { fontSize: 18, fontWeight: 'bold', width: 30, textAlign: 'center', color: '#6b7280' },
  avatar: { fontSize: 24, marginHorizontal: 12 },
  friendInfo: { flex: 1 },
  friendName: { fontSize: 16, fontWeight: '600' },
  friendActivity: { fontSize: 12, color: '#6b7280' },
  scoreContainer: { alignItems: 'flex-end' },
  score: { fontSize: 16, fontWeight: 'bold' },
  scoreLabel: { fontSize: 12, color: '#6b7280' },
  emptyText: { textAlign: 'center', color: '#6b7280', paddingVertical: 24 },
});

export default Community;
