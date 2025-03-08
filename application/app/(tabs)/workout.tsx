import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// import AIWorkoutChatbot from './AIWorkoutChatbot';
import WorkoutItem from '@/components/workout/WorkoutItem';
import AIWorkoutChatbot from '@/components/workout/AIWorkoutChatbot';

export default function Gym() {
  interface Workout {
    id: string;
    day: string;
    parts: string[];
    exercise: string;
    sets: number;
    reps: number;
    rest: number;
  }

  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isChatbotVisible, setIsChatbotVisible] = useState(false);

  interface WorkoutPlan {
    week: {
      [key: string]: {
        day: string;
        parts: string[];
        workout: {
          exercise: string;
          sets: number;
          reps: number;
          rest: number;
        }[];
      };
    };
  }

  const addWorkoutPlan = (plan: WorkoutPlan) => {
    // Convert the workout plan to a format suitable for the workout list
    const formattedWorkouts = Object.entries(plan.week).flatMap(([day, dayDetails]) => 
      dayDetails.workout.map((exercise, index) => ({
        id: `${day}-${index}`,
        day: dayDetails.day,
        parts: dayDetails.parts,
        exercise: exercise.exercise,
        sets: exercise.sets,
        reps: exercise.reps,
        rest: exercise.rest
      }))
    );

    setWorkouts(formattedWorkouts);
    setIsChatbotVisible(false);
  };

  const renderWorkoutItem = ({ item }: { item: Workout }) => (
    <WorkoutItem 
      exercise={item.exercise} 
      sets={item.sets} 
      reps={item.reps} 
      rest={item.rest}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Date Section */}
      <View style={styles.dateContainer}>
        <Text style={styles.dateText}>
          {selectedDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Text>
      </View>

      {/* Workout List */}
      <FlatList
        data={workouts}
        renderItem={renderWorkoutItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No workouts planned</Text>
          </View>
        }
      />

      {/* AI Chatbot Button */}
      <TouchableOpacity 
        style={styles.chatbotButton}
        onPress={() => setIsChatbotVisible(true)}
      >
        <Text style={styles.chatbotButtonText}>Generate Workout Plan</Text>
      </TouchableOpacity>

      {/* Chatbot Modal */}
      <Modal
        visible={isChatbotVisible}
        animationType="slide"
        transparent={true}
      >
        <AIWorkoutChatbot 
          onClose={() => setIsChatbotVisible(false)}
          onAddWorkout={addWorkoutPlan}
        />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  dateContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50
  },
  emptyText: {
    fontSize: 16,
    color: '#888'
  },
  chatbotButton: {
    backgroundColor: '#007bff',
    padding: 15,
    alignItems: 'center'
  },
  chatbotButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  }
});