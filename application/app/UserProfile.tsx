import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { apiAuth } from '@/api/axios';

const UserProfile = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch user profile data
  const fetchUserProfile = async () => {
    try {
      const response = await apiAuth.get('/user/profile/');
      if (!response.data) {
        throw new Error('Failed to fetch user profile.');
      }
      setUser(response.data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An error occurred while fetching the profile.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <Image
          source={{ uri: user?.profile_picture_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8dXNlciUyMHByb2ZpbGV8ZW58MHx8MHx8fDA%3D' }}
          style={styles.profileImage}
        />
        <Text style={styles.userName}>{user?.name || 'User Name'}</Text>
        <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
      </View>

      {/* Profile Details */}
      <View style={styles.detailsContainer}>
        <View style={styles.detailItem}>
          <MaterialIcons name="person" size={24} color="#f97316" />
          <Text style={styles.detailText}>Gender: {user?.gender || 'Not specified'}</Text>
        </View>

        <View style={styles.detailItem}>
          <MaterialIcons name="calendar-today" size={24} color="#f97316" />
          <Text style={styles.detailText}>Date of Birth: {user?.date_of_birth || 'Not specified'}</Text>
        </View>

        <View style={styles.detailItem}>
          <MaterialIcons name="phone" size={24} color="#f97316" />
          <Text style={styles.detailText}>Phone: {user?.phone_number || 'Not specified'}</Text>
        </View>
      </View>

      {/* Subscriptions */}
      {user?.subscriptions && user.subscriptions.length > 0 && (
        <View style={styles.subscriptionsContainer}>
          <Text style={styles.subscriptionsTitle}>Subscriptions</Text>
          {user.subscriptions.map((subscription: any) => (
            <View key={subscription.id} style={styles.subscriptionItem}>
              <Text style={styles.subscriptionName}>{subscription.subscription.name}</Text>
              <Text style={styles.subscriptionDetails}>
                {subscription.subscription.description} (${subscription.subscription.price})
              </Text>
              <Text style={styles.subscriptionDates}>
                {subscription.start_date} to {subscription.end_date}
              </Text>
              <Text style={styles.subscriptionStatus}>Status: {subscription.status}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f8f9fa',
    padding: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#f97316',
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  userEmail: {
    fontSize: 16,
    color: '#6b7280',
  },
  detailsContainer: {
    marginBottom: 32,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  detailText: {
    fontSize: 16,
    color: '#1f2937',
    marginLeft: 10,
  },
  subscriptionsContainer: {
    marginBottom: 32,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  subscriptionsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1f2937',
  },
  subscriptionItem: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  subscriptionName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  subscriptionDetails: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
  },
  subscriptionDates: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
  },
  subscriptionStatus: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
  },
});

export default UserProfile;