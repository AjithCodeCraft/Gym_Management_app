import { apiAuth } from "@/api/axios";
import { Dispatch, SetStateAction } from "react";
import { DailyWorkoutRecord } from "@/app/(tabs)/workout";

export const updateDailyWorkoutData = async (selectedDate: Date, dailyWorkout: DailyWorkoutRecord) => {
   const date = selectedDate.toLocaleDateString("en-ca");
   try {
      const data = {
         exercise_data: dailyWorkout[selectedDate.getTime()],
      };
      apiAuth.post(`daily-workout/${date}/`, data);
   } catch (error) {
      console.log(error);
   }
};

const useWorkoutUpdater = async (
   setDailyWorkout: Dispatch<SetStateAction<DailyWorkoutRecord>>,
   setCurrentStatus: Dispatch<SetStateAction<boolean>>,
   dailyWorkout: DailyWorkoutRecord,
   selectedDate: Date,
   index: number,
   currentStatus: boolean
) => {
   const timeStamp = selectedDate.getTime();
   if (!dailyWorkout || !dailyWorkout[timeStamp]) return;

   const updatedWorkout = {
      ...dailyWorkout,
      [timeStamp]: {
         ...dailyWorkout[timeStamp],
         workout: dailyWorkout[timeStamp].workout.map((w, i) => (i === index ? { ...w, status: !currentStatus } : w)),
      },
   };
   setCurrentStatus((prev) => !prev);
   setDailyWorkout(updatedWorkout);

   updateDailyWorkoutData(selectedDate, updatedWorkout);
};

export default useWorkoutUpdater;
