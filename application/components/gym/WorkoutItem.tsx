import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface WorkoutItemProps {
  exercise: string;
  sets: number;
  reps: number;
  rest: number;
}

export default function WorkoutItem({ exercise, sets, reps, rest }: WorkoutItemProps) {
  return (
    <View style={styles.container}>
      <View style={styles.exerciseHeader}>
        <Text style={styles.exerciseName}>{exercise}</Text>
      </View>
      <View style={styles.detailsContainer}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Sets:</Text>
          <Text style={styles.detailValue}>{sets}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Reps:</Text>
          <Text style={styles.detailValue}>{reps}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Rest:</Text>
          <Text style={styles.detailValue}>{rest} sec</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginVertical: 8,
    marginHorizontal: 16,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  exerciseHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 10,
    marginBottom: 10
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  detailItem: {
    alignItems: 'center'
  },
  detailLabel: {
    color: '#666',
    fontSize: 14,
    marginBottom: 5
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600'
  }
});