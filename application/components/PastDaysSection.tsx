import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

const PastDaysSection = () => {
  const pastDays = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (i + 1));
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Past Days</Text>
      <FlatList
        data={pastDays}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.dayItem}>
            <Text style={styles.dayText}>{item}</Text>
            <Text style={styles.mealText}>No meals recorded</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  dayItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
  },
  mealText: {
    fontSize: 12,
    color: '#7f8c8d',
  },
});

export default PastDaysSection;