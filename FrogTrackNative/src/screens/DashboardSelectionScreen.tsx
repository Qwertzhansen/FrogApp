
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { getDashboardConfigs } from '../services/supabaseService';

interface DashboardSelectionScreenProps {
  profileId: string;
  onSelectDashboard: (config: any) => void;
}

const DashboardSelectionScreen: React.FC<DashboardSelectionScreenProps> = ({ profileId, onSelectDashboard }) => {
  const [dashboards, setDashboards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboards = async () => {
      setLoading(true);
      setError(null);
      try {
        const configs = await getDashboardConfigs(profileId);
        setDashboards(configs);
      } catch (err) {
        console.error("Error fetching dashboards:", err);
        setError("Failed to load dashboards.");
      } finally {
        setLoading(false);
      }
    };

    if (profileId) {
      fetchDashboards();
    }
  }, [profileId]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text>Loading dashboards...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select a Dashboard</Text>
      <FlatList
        data={dashboards}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.dashboardItem} onPress={() => onSelectDashboard(item)}>
            <Text style={styles.dashboardName}>{item.name}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => (
          <Text style={styles.emptyText}>No dashboards available. Create one in your profile settings!</Text>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f0f0f0',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  dashboardItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  dashboardName: {
    fontSize: 18,
    fontWeight: '500',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
});

export default DashboardSelectionScreen;
