import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
          source={{ uri: user?.profile_picture_url || 'https://via.placeholder.com/150' }}
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

        <View style={styles.detailItem}>
          <MaterialIcons name="shield" size={24} color="#f97316" />
          <Text style={styles.detailText}>User Type: {user?.user_type || 'User'}</Text>
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

      {/* Edit Profile Button */}
      <TouchableOpacity style={styles.editButton}>
        <Text style={styles.editButtonText}>Edit Profile</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
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
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  userEmail: {
    fontSize: 16,
    color: '#6b7280',
  },
  detailsContainer: {
    marginBottom: 32,
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
  },
  subscriptionsTitle: {
    fontSize: 20,
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
  editButton: {
    backgroundColor: '#f97316',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default UserProfile;