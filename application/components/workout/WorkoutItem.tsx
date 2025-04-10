import React, { SetStateAction, useState, Dispatch, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { isSame, isBefore, isAfter } from "@/hooks/useExerciseData";
import { DailyWorkoutRecord } from "@/app/(tabs)/workout";
import useWorkoutUpdater from "@/hooks/useWorkoutUpdater";

interface WorkoutRecord {
  status: boolean;
  exercise?: string;
  sets?: number;
  reps?: number;
  rest?: number;
}

interface DailyWorkout {
  workout: WorkoutRecord[];
}

interface WorkoutItemProps {
  index: number;
  exercise: string;
  sets: number;
  reps: number;
  rest: number;
  status: boolean;
  selectedDate: Date;
  dailyWorkout: DailyWorkoutRecord;
  setDailyWorkout: Dispatch<SetStateAction<DailyWorkoutRecord>>;
}

export default function WorkoutItem({
  index,
  exercise,
  sets,
  reps,
  rest,
  status,
  selectedDate,
  dailyWorkout,
  setDailyWorkout,
}: WorkoutItemProps) {
  const [buttonText, setButtonText] = useState<string>("Mark as Done");
  const [backgroundColor, setBackgroundColor] = useState(itemStyles.undone);
  const [buttonStyle, setButtonStyle] = useState(itemStyles.activeButton);
  
  const getCurrentStatus = () => {
    const dateKey = selectedDate.getTime();
    if (!dailyWorkout || !dailyWorkout[dateKey] || !Array.isArray(dailyWorkout[dateKey].workout)) {
      return false;
    }
    return dailyWorkout[dateKey].workout[index]?.status ?? false;
  };

  const [currentStatus, setCurrentStatus] = useState(getCurrentStatus());

  useEffect(() => {
    setCurrentStatus(getCurrentStatus());
  }, [selectedDate, dailyWorkout]);

  useEffect(() => {
    // Normalize dates (set time to 00:00:00)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0);

    setBackgroundColor(currentStatus ? itemStyles.done : itemStyles.undone);
    setButtonText(currentStatus ? "Mark as undone" : "Mark as done");
    setButtonStyle(currentStatus ? itemStyles.activeWhiteButton : itemStyles.activeButton);

    if (isBefore(selected, today) || isAfter(selected, today)) {
      setButtonStyle(itemStyles.inActiveButton);
    }

    if (!currentStatus && isBefore(selected, today)) {
      setButtonText("Missed!");
      setBackgroundColor(itemStyles.missed);
    }
  }, [selectedDate, currentStatus]);

  const handleStatusUpdate = async () => {
    await useWorkoutUpdater(setDailyWorkout, setCurrentStatus, dailyWorkout, selectedDate, index, currentStatus);
  };

  // Fallback UI if data structure is invalid
  if (!dailyWorkout || !dailyWorkout[selectedDate.getTime()] || !Array.isArray(dailyWorkout[selectedDate.getTime()].workout)) {
    return (
      <View style={[itemStyles.container, itemStyles.undone]}>
        <Text>Workout data not available</Text>
      </View>
    );
  }

  return (
    <View style={[itemStyles.container, backgroundColor]}>
      <View style={itemStyles.exerciseHeader}>
        <Text style={itemStyles.exerciseName}>{exercise}</Text>
      </View>
      <View style={itemStyles.detailsContainer}>
        <View style={itemStyles.detailItem}>
          <Text style={itemStyles.detailLabel}>Sets:</Text>
          <Text style={itemStyles.detailValue}>{sets}</Text>
        </View>
        <View style={itemStyles.detailItem}>
          <Text style={itemStyles.detailLabel}>Reps:</Text>
          <Text style={itemStyles.detailValue}>{reps}</Text>
        </View>
        <View style={itemStyles.detailItem}>
          <Text style={itemStyles.detailLabel}>Rest:</Text>
          <Text style={itemStyles.detailValue}>{rest} sec</Text>
        </View>
      </View>
      <TouchableOpacity
        style={[itemStyles.buttonArea, buttonStyle]}
        onPress={handleStatusUpdate}
        disabled={!isSame(selectedDate, new Date())}
      >
        <Text style={[itemStyles.buttonText, buttonStyle]}>{buttonText}</Text>
      </TouchableOpacity>
    </View>
  );
}

export const itemStyles = StyleSheet.create({
  container: {
    borderRadius: 8,
    marginVertical: 8,
    marginHorizontal: 16,
    padding: 15,
    backgroundColor: "#fff",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  undone: {
    backgroundColor: "white",
  },
  done: {
    backgroundColor: "#b5ffc9",
  },
  missed: {
    backgroundColor: "#FFB3B3",
  },
  exerciseHeader: {
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    paddingBottom: 10,
    marginBottom: 10,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  detailsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailItem: {
    alignItems: "center",
  },
  detailLabel: {
    color: "#666",
    fontSize: 14,
    marginBottom: 5,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: "600",
  },
  buttonArea: {
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  activeButton: {
    color: "#fff",
    backgroundColor: "#4CAF50",
  },
  activeWhiteButton: {
    backgroundColor: "white",
    color: "#000",
  },
  inActiveButton: {
    color: "#fff",
    backgroundColor: "#d1d1d1",
  },
  buttonText: {
    fontWeight: "bold",
  },
});