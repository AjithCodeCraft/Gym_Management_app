import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface WorkoutItemProps {
  exercise: string;
  sets: number;
  reps: number;
  rest: number;
  completed: boolean;
  day: string;
  parts: string[];
}

export default function WorkoutItem({ exercise, sets, reps, rest, completed, day, parts }: WorkoutItemProps) {
  return (
    <View style={[styles.container, completed && styles.completed]}>
      <View style={styles.exerciseHeader}>
        <Text style={styles.exerciseName}>{exercise}</Text>
        <Text style={styles.partsText}>{parts.join(', ')}</Text>
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
      <Text style={styles.dayText}>{day}</Text>
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
  completed: {
    backgroundColor: '#d4edda',
    borderColor: '#c3e6cb',
    borderWidth: 1
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
  partsText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5
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
  },
  dayText: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
    textAlign: 'center'
  }
});
