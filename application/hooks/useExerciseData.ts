import { apiAuth } from "@/api/axios";
import { Dispatch, SetStateAction, useEffect } from "react";
import { dailyWorkoutType, Workout, WorkoutPlan } from "@/app/(tabs)/workout";
import axios from "axios";

export const processData = (data: any, selectedDate: Date): dailyWorkoutType => {
   if (!data) return data;

   if ("exercise_data" in data) {
      const exercise_data = data.exercise_data;
      return { [selectedDate.getTime()]: { ...exercise_data } };
   }

   return { [selectedDate.getTime()]: { ...data } };
};

export const isEmpty = (obj: object) => Object.keys(obj).length === 0;

export const isBefore = (d1: Date, d2: Date): boolean => {
   return (
      d1.getFullYear() < d2.getFullYear() ||
      (d1.getFullYear() === d2.getFullYear() && d1.getMonth() < d2.getMonth()) ||
      (d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() < d2.getDate())
   );
};

export const isAfter = (d1: Date, d2: Date): boolean => {
   return (
      d1.getFullYear() > d2.getFullYear() ||
      (d1.getFullYear() === d2.getFullYear() && d1.getMonth() > d2.getMonth()) ||
      (d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() > d2.getDate())
   );
};

export const isSame = (d1: Date, d2: Date): boolean =>
   d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDay() === d2.getDay();

const useExerciseData = async (
   selectedDate: Date,
   defaultWorkouts: WorkoutPlan,
   dailyWorkout: dailyWorkoutType,
   setDefaultWorkouts: Dispatch<SetStateAction<WorkoutPlan>>,
   setWorkoutErrorMessage: Dispatch<SetStateAction<string>>,
   setDailyWorkouts: Dispatch<SetStateAction<dailyWorkoutType>>,
   setLoading: Dispatch<SetStateAction<boolean>>,
   addWorkoutPlan: () => void
) => {
   const fetchDefaultData = async () => {
      try {
         const response = await apiAuth.get("get-workout-plan/");
         setDefaultWorkouts(response.data?.exercise_data?.week);
         return response.data?.exercise_data?.week;
      } catch (error) {
         if (axios.isAxiosError(error) && error.response?.status === 404) {
            return false;
         }
         console.log(error);
      }
   };

   const useDefaultData = (weekDay: string) => {
      const processedData = processData(defaultWorkouts[weekDay], selectedDate);
      setDailyWorkouts((prev) => ({ ...prev, ...processedData }));
   };

   const fetchSelectedDayData = async () => {
      setLoading(true);
      const date = selectedDate.toLocaleDateString("en-ca");
      const weekDay = selectedDate.toLocaleDateString("en-ca", {
         weekday: "long",
      });
      const timeStamp = selectedDate.getTime();

      if (weekDay === "Sunday") {
         setWorkoutErrorMessage("It is sunday get some rest!");
         addWorkoutPlan();
         return;
      }

      if (timeStamp in dailyWorkout) {
         addWorkoutPlan();
         return;
      }

      if (isAfter(selectedDate, new Date()) && defaultWorkouts && weekDay in defaultWorkouts) {
         useDefaultData(weekDay);
         return;
      }

      try {
         const response = await apiAuth.get(`daily-workout/${date}/`);
         const processedData = processData(response.data, selectedDate);
         setDailyWorkouts((prev) => ({ ...prev, ...processedData }));
      } catch (error) {
         if (axios.isAxiosError(error) && error.response?.status === 404) {
            if (isBefore(selectedDate, new Date())) {
               setWorkoutErrorMessage("No date found.");
               addWorkoutPlan();
               return;
            }
            if (defaultWorkouts && weekDay in defaultWorkouts) {
               useDefaultData(weekDay);
               return;
            }
            const default_data = await fetchDefaultData();
            if (!default_data) {
               setWorkoutErrorMessage("No default workout found! Please generate one.");
               addWorkoutPlan();
               return;
            }
            const processedData = processData(default_data[weekDay], selectedDate);
            setDailyWorkouts((prev) => ({ ...prev, ...processedData }));
         } else {
            console.log(error);
         }
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchSelectedDayData();
   }, [selectedDate]);
};

export default useExerciseData;
