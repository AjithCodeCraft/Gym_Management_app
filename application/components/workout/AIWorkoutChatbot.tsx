import React, { SetStateAction, useState, Dispatch } from "react";
import {
   View,
   Text,
   TextInput,
   TouchableOpacity,
   StyleSheet,
   ScrollView,
   KeyboardAvoidingView,
   Platform,
} from "react-native";
import { apiAuth } from "@/api/axios";
import { processData } from "@/hooks/useExerciseData";
import { WorkoutPlan } from "@/app/(tabs)/workout";
import { DailyWorkoutRecord } from "@/app/(tabs)/workout";
import { updateDailyWorkoutData } from "@/hooks/useWorkoutUpdater";

interface AIWorkoutChatbotProps {
   onClose: () => void;
   onAddWorkout: () => void;
   setLoading: Dispatch<SetStateAction<boolean>>;
   setDefaultWorkouts: Dispatch<SetStateAction<WorkoutPlan>>;
   setDailyWorkouts: Dispatch<SetStateAction<DailyWorkoutRecord>>;
   selectedDate: Date;
}

export default function AIWorkoutChatbot({
   onClose,
   onAddWorkout,
   setLoading,
   setDefaultWorkouts,
   setDailyWorkouts,
   selectedDate,
}: AIWorkoutChatbotProps) {
   const [weight, setWeight] = useState<string>("");
   const [height, setHeight] = useState<string>("");
   const [age, setAge] = useState<string>("");
   const [target, setTarget] = useState<string>("");
   const [message, setMessage] = useState<string>("");

   const dummyWorkoutPlan = {
      week: {
         Monday: {
            day: "Monday",
            part: "Upper Body",
            workout: [
               {
                  exercise: "Barbell Bench Press",
                  sets: 4,
                  reps: 8,
                  rest: 90,
               },
               { exercise: "Cable Flyes", sets: 3, reps: 12, rest: 90 },
            ],
         },
         Tuesday: {
            day: "Tuesday",
            part: "Lower Body",
            workout: [
               { exercise: "Barbell Squat", sets: 4, reps: 8, rest: 90 },
               { exercise: "Lunges", sets: 3, reps: 12, rest: 90 },
               { exercise: "Leg Press", sets: 3, reps: 12, rest: 90 },
            ],
         },
         // ... rest of the workout plan (as you provided)
      },
   };

   const handleGeneratePlan = async () => {
      const weekDay = selectedDate.toLocaleDateString("en-ca", {
         weekday: "long",
      });
      try {
         if (weight && height && age && target) {
            setLoading(true);
            const response = await apiAuth.post("workout-plan/", {
               weight: String(weight),
               height: String(height),
               age: String(age),
               target: String(target).toLowerCase(),
            });
            setDefaultWorkouts(response.data.week);
            const newData = processData(response.data.week[weekDay], selectedDate);
            setDailyWorkouts(newData);
            onAddWorkout();
            updateDailyWorkoutData(selectedDate, newData);
         } else {
            alert("Please fill in all fields");
         }
      } catch (error) {
         console.log(error);
      } finally {
         setLoading(false);
      }
   };

   return (
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalContainer}>
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

                  <TouchableOpacity style={styles.generateButton} onPress={handleGeneratePlan}>
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
      justifyContent: "flex-end",
      backgroundColor: "rgba(0,0,0,0.5)",
   },
   chatbotContainer: {
      backgroundColor: "white",
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 20,
      maxHeight: "90%",
   },
   closeButton: {
      position: "absolute",
      top: 10,
      right: 10,
      zIndex: 1,
   },
   closeButtonText: {
      fontSize: 30,
      color: "#888",
   },
   title: {
      fontSize: 20,
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: 20,
   },
   inputContainer: {
      paddingVertical: 10,
   },
   input: {
      borderWidth: 1,
      borderColor: "#e0e0e0",
      borderRadius: 8,
      padding: 12,
      marginBottom: 15,
      fontSize: 16,
   },
   messageInput: {
      minHeight: 100,
   },
   generateButton: {
      backgroundColor: "#007bff",
      padding: 15,
      borderRadius: 10,
      alignItems: "center",
   },
   generateButtonText: {
      color: "white",
      fontSize: 16,
      fontWeight: "bold",
   },
});
