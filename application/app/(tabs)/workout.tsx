import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// import AIWorkoutChatbot from './AIWorkoutChatbot';
import WorkoutItem from "@/components/workout/WorkoutItem";
import AIWorkoutChatbot from "@/components/workout/AIWorkoutChatbot";
import { itemStyles } from "@/components/workout/WorkoutItem";
import LoadingSpinner from "@/components/LoadingSpinner";
import { DaySeletion } from "@/components/neutrition/DateSelection";
import useExerciseData from "@/hooks/useExerciseData";
import { isEmpty } from "@/hooks/useExerciseData";

export type Workout = {
   id: string;
   part: string;
   exercise: string;
   sets: number;
   reps: number;
   rest: number;
   status?: boolean;
};

export type DailyWorkoutType = {
   day: string;
   body_part: string;
   workout: {
      exercise: string;
      sets: number;
      reps: number;
      rest: number;
      status?: boolean;
   }[];
};

export type WorkoutPlan = Record<string, DailyWorkoutType>;

export type dailyWorkoutType = Record<number, DailyWorkoutType>; // TimeStamp and Workout for the day

export default function Gym() {
   const [defaultWorkouts, setWorkouts] = useState<WorkoutPlan>({});
   const [dailyWorkouts, setDailyWorkouts] = useState<dailyWorkoutType>({});
   const [selectedDate, setSelectedDate] = useState(new Date());
   const [isChatbotVisible, setIsChatbotVisible] = useState(false);
   const [loading, setLoading] = useState<boolean>(true);
   const [workoutErrorMessage, setWorkoutErrorMessage] = useState<string>("No workout found!");
   const [selectedDateExercises, setSelectedDateExercises] = useState<Workout[]>([]);

   const addWorkoutPlan = () => {
      // Convert the workout plan to a format suitable for the workout list
      const timeStamp = selectedDate.getTime();

      const weekDay = selectedDate.toLocaleDateString("en-ca", {
         weekday: "long",
      });

      if (weekDay === "Sunday") {
         setSelectedDateExercises([]);
      }

      if (isEmpty(dailyWorkouts)) {
         setSelectedDateExercises([]);
         return;
      }

      const activeWorkout = dailyWorkouts[timeStamp];
      const formattedWorkouts = activeWorkout
         ? activeWorkout.workout.map((exercise, index) => ({
              id: `${index}`,
              part: activeWorkout.body_part,
              exercise: exercise.exercise,
              sets: exercise.sets,
              reps: exercise.reps,
              rest: exercise.rest,
              status: exercise?.status || false,
           }))
         : [];
      setSelectedDateExercises(formattedWorkouts);
      setIsChatbotVisible(false);
      setLoading(false);
   };

   useExerciseData(
      selectedDate,
      defaultWorkouts,
      dailyWorkouts,
      setWorkouts,
      setWorkoutErrorMessage,
      setDailyWorkouts,
      setLoading,
      addWorkoutPlan
   );

   useEffect(() => {
      addWorkoutPlan();
   }, [dailyWorkouts]);

   const renderWorkoutItem = ({ item }: { item: Workout }) => (
      <WorkoutItem
         index={Number(item.id)}
         exercise={item.exercise}
         sets={item.sets}
         reps={item.reps}
         rest={item.rest}
         status={item.status || false}
         selectedDate={selectedDate}
         dailyWorkout={dailyWorkouts}
         setDailyWorkout={setDailyWorkouts}
      />
   );

   if (loading) {
      return <LoadingSpinner />;
   }

   return (
      <SafeAreaView style={workoutStyles.container}>
         {/* Date Section */}
         <DaySeletion selectedDate={selectedDate} setSelectedDate={setSelectedDate} />

         {dailyWorkouts?.[selectedDate.getTime()] && (
            <View style={itemStyles.container}>
               <View style={itemStyles.exerciseHeader}>
                  <Text style={itemStyles.exerciseName}>Focus</Text>
               </View>
               <Text style={workoutStyles.dateText}>{dailyWorkouts[selectedDate.getTime()].body_part}</Text>
            </View>
         )}

         {/* Workout List */}
         <FlatList
            data={selectedDateExercises}
            renderItem={renderWorkoutItem}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
               <View style={workoutStyles.emptyContainer}>
                  <Text style={workoutStyles.emptyText}>{workoutErrorMessage}</Text>
               </View>
            }
         />

         {/* AI Workout Genertor Button */}
         <TouchableOpacity style={workoutStyles.chatbotButton} onPress={() => setIsChatbotVisible(true)}>
            <Text style={workoutStyles.chatbotButtonText}>Generate Workout Plan</Text>
         </TouchableOpacity>

         {/* AI Workout Generator Modal */}
         <Modal visible={isChatbotVisible} animationType="slide" transparent={true}>
            <AIWorkoutChatbot
               onClose={() => setIsChatbotVisible(false)}
               onAddWorkout={addWorkoutPlan}
               setLoading={setLoading}
            />
         </Modal>
      </SafeAreaView>
   );
}

export const workoutStyles = StyleSheet.create({
   container: {
      flex: 1,
      backgroundColor: "#f5f5f5",
   },
   dateContainer: {
      padding: 15,
      backgroundColor: "#fff",
      borderBottomWidth: 1,
      borderBottomColor: "#e0e0e0",
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
   },
   dateText: {
      fontSize: 18,
      fontWeight: "bold",
      textAlign: "center",
   },
   emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 50,
   },
   emptyText: {
      fontSize: 16,
      color: "#888",
   },
   chatbotButton: {
      backgroundColor: "#007bff",
      padding: 15,
      alignItems: "center",
   },
   chatbotButtonText: {
      color: "white",
      fontSize: 16,
      fontWeight: "bold",
   },
});
