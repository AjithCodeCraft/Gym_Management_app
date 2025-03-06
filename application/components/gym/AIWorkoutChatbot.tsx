import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';

interface AIWorkoutChatbotProps {
  onClose: () => void;
  onAddWorkout: (workoutPlan: any) => void;
}

export default function AIWorkoutChatbot({ onClose, onAddWorkout }: AIWorkoutChatbotProps) {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [target, setTarget] = useState('');
  const [message, setMessage] = useState('');

  const dummyWorkoutPlan = {
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

  const handleGeneratePlan = () => {
    if (weight && height && age && target) {
      onAddWorkout(dummyWorkoutPlan);
    } else {
      alert('Please fill in all fields');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.modalContainer}
    >
      <View style={styles.chatbotContainer}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>×</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Generate Workout Plan</Text>

        <ScrollView>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Weight (kg)"
              keyboardType="numeric"
              value={weight}
              onChangeText={setWeight}
            />
            <TextInput
              style={styles.input}
              placeholder="Height (cm)"
              keyboardType="numeric"
              value={height}
              onChangeText={setHeight}
            />
            <TextInput
              style={styles.input}
              placeholder="Age"
              keyboardType="numeric"
              value={age}
              onChangeText={setAge}
            />
            <TextInput
              style={styles.input}
              placeholder="Fitness Target (e.g., muscle gain)"
              value={target}
              onChangeText={setTarget}
            />
            <TextInput
              style={[styles.input, styles.messageInput]}
              placeholder="Additional instructions (optional)"
              multiline
              value={message}
              onChangeText={setMessage}
            />

            <TouchableOpacity
              style={styles.generateButton}
              onPress={handleGeneratePlan}
            >
              <Text style={styles.generateButtonText}>Generate Plan</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  chatbotContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%'
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1
  },
  closeButtonText: {
    fontSize: 30,
    color: '#888'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20
  },
  inputContainer: {
    paddingVertical: 10
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16
  },
  messageInput: {
    minHeight: 100
  },
  generateButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center'
  },
  generateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  }
});
