import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import WorkoutItem from '@/components/gym/WorkoutItem';
import AIWorkoutChatbot from '@/components/gym/AIWorkoutChatbot';

export default function Gym() {
  interface Workout {
    id: string;
    day: string;
    parts: string[];
    exercise: string;
    sets: number;
    reps: number;
    rest: number;
    completed: boolean;
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

  const dummyWorkoutPlan: WorkoutPlan = {
    week: {
      Monday: {
        day: "Day 1: Back & Biceps",
        parts: ["Back", "Biceps"],
        workout: [
          { exercise: "Dumbbell Rows", sets: 3, reps: 12, rest: 90 },
          { exercise: "Dumbbell Deadlifts", sets: 4, reps: 10, rest: 90 },
          { exercise: "Single-Arm Dumbbell Pullover", sets: 3, reps: 12, rest: 90 },
          { exercise: "Concentration Curls", sets: 3, reps: 12, rest: 90 },
          { exercise: "Hammer Curls", sets: 3, reps: 10, rest: 90 },
          { exercise: "Reverse Flys", sets: 3, reps: 12, rest: 90 }
        ]
      },
      Tuesday: {
        day: "Day 2: Chest & Triceps",
        parts: ["Chest", "Triceps"],
        workout: [
          { exercise: "Dumbbell Bench Press", sets: 4, reps: 12, rest: 90 },
          { exercise: "Incline Dumbbell Press", sets: 3, reps: 10, rest: 90 },
          { exercise: "Dumbbell Flys", sets: 3, reps: 12, rest: 90 },
          { exercise: "Overhead Tricep Extension", sets: 3, reps: 12, rest: 90 },
          { exercise: "Dumbbell Kickbacks", sets: 3, reps: 12, rest: 90 }
        ]
      },
      Wednesday: {
        day: "Day 3: Shoulders & Abs",
        parts: ["Shoulders", "Abs"],
        workout: [
          { exercise: "Seated Dumbbell Shoulder Press", sets: 4, reps: 10, rest: 90 },
          { exercise: "Lateral Raises", sets: 3, reps: 12, rest: 90 },
          { exercise: "Front Raises", sets: 3, reps: 12, rest: 90 },
          { exercise: "Dumbbell Shrugs", sets: 3, reps: 15, rest: 90 },
          { exercise: "Russian Twists", sets: 3, reps: 20, rest: 90 },
          { exercise: "Dumbbell Sit-Ups", sets: 3, reps: 15, rest: 90 }
        ]
      },
      Thursday: {
        day: "Day 4: Legs & Glutes",
        parts: ["Legs", "Glutes"],
        workout: [
          { exercise: "Dumbbell Squats", sets: 4, reps: 12, rest: 90 },
          { exercise: "Dumbbell Lunges", sets: 3, reps: 12, rest: 90 },
          { exercise: "Romanian Deadlifts", sets: 3, reps: 10, rest: 90 },
          { exercise: "Goblet Squat", sets: 3, reps: 12, rest: 90 },
          { exercise: "Calf Raises", sets: 4, reps: 15, rest: 90 }
        ]
      },
      Friday: {
        day: "Day 5: Full Body & Conditioning",
        parts: ["Full Body"],
        workout: [
          { exercise: "Dumbbell Snatches", sets: 3, reps: 10, rest: 90 },
          { exercise: "Dumbbell Clean & Press", sets: 4, reps: 10, rest: 90 },
          { exercise: "Dumbbell Burpees", sets: 3, reps: 10, rest: 90 },
          { exercise: "Dumbbell Thrusters", sets: 3, reps: 12, rest: 90 },
          { exercise: "Mountain Climbers", sets: 3, reps: 30, rest: 90 }
        ]
      },
      Saturday: {
        day: "Day 6: Cardio & Core",
        parts: ["Cardio", "Core"],
        workout: [
          { exercise: "Dumbbell Russian Twists", sets: 3, reps: 20, rest: 90 },
          { exercise: "Weighted Sit-Ups", sets: 3, reps: 15, rest: 90 },
          { exercise: "Standing Dumbbell Side Bends", sets: 3, reps: 15, rest: 90 },
          { exercise: "Jump Rope", sets: 10, reps: 60, rest: 90 },
          { exercise: "Burpees", sets: 3, reps: 15, rest: 90 }
        ]
      }
    }
  };

  const addWorkoutPlan = (plan: WorkoutPlan) => {
    const formattedWorkouts = Object.entries(plan.week).flatMap(([day, dayDetails]) =>
      dayDetails.workout.map((exercise, index) => ({
        id: `${day}-${index}`,
        day: dayDetails.day,
        parts: dayDetails.parts,
        exercise: exercise.exercise,
        sets: exercise.sets,
        reps: exercise.reps,
        rest: exercise.rest,
        completed: false
      }))
    );

    setWorkouts(formattedWorkouts);
    setIsChatbotVisible(false);
  };

  const toggleComplete = (id: string) => {
    setWorkouts(workouts.map(workout =>
      workout.id === id ? { ...workout, completed: !workout.completed } : workout
    ));
  };

  const renderWorkoutItem = ({ item }: { item: Workout }) => (
    <TouchableOpacity onPress={() => toggleComplete(item.id)}>
      <WorkoutItem
        exercise={item.exercise}
        sets={item.sets}
        reps={item.reps}
        rest={item.rest}
        completed={item.completed}
        day={item.day}
        parts={item.parts}
      />
    </TouchableOpacity>
  );

  const changeDate = (offset: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + offset);
    setSelectedDate(newDate);

    // Filter workouts for the selected day
    const dayOfWeek = newDate.toLocaleDateString('en-US', { weekday: 'long' });
    const filteredWorkouts = dummyWorkoutPlan.week[dayOfWeek]?.workout.map((exercise, index) => ({
      id: `${dayOfWeek}-${index}`,
      day: dummyWorkoutPlan.week[dayOfWeek].day,
      parts: dummyWorkoutPlan.week[dayOfWeek].parts,
      exercise: exercise.exercise,
      sets: exercise.sets,
      reps: exercise.reps,
      rest: exercise.rest,
      completed: false
    })) || [];

    setWorkouts(filteredWorkouts);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* History Box */}
      <View style={styles.historyBox}>
        <TouchableOpacity onPress={() => changeDate(-1)}>
          <Text style={styles.historyText}>Prev</Text>
        </TouchableOpacity>
        <Text style={styles.historyText}>
          {selectedDate.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
          })}
        </Text>
        <TouchableOpacity onPress={() => changeDate(1)}>
          <Text style={styles.historyText}>Next</Text>
        </TouchableOpacity>
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
  historyBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  historyText: {
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
