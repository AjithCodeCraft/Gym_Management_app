import { Dispatch, SetStateAction, useEffect } from "react";
import { apiAuth } from "@/api/axios";
import { StreakDataType } from "@/app/(tabs)/home";

const useStreakData = (
   setStreakData: Dispatch<SetStateAction<StreakDataType>>,
   setLoading: Dispatch<SetStateAction<boolean>>
) => {
   const fetchAttendanceData = async () => {
      setLoading(true);
      try {
         const response = await apiAuth.get("user_attendance/");
         processData(response.data);
      } catch (error) {
         console.log(error);
      } finally {
         setLoading(false);
      }
   };

   const isPreviousDay = (date1: Date, date2: Date) => {
      const d1 = new Date(date1);
      const d2 = new Date(date2);

      d1.setHours(0, 0, 0);
      d2.setHours(0, 0, 0);

      const oneDay = 24 * 60 * 60 * 1000;
      return d2.getTime() - d1.getTime() === oneDay;
   };

   const processData = (data: responseDataType[]) => {
      if (data.length === 0) return;

      console.log(data);
      let count = 1;
      let prevDate: Date = new Date(data[0].created_at);
      for (let i = 1; i < data.length; i++) {
         const currentDate = new Date(data[i].created_at);
         if (isPreviousDay(currentDate, prevDate)) {
            count++;
         } else { break; }
         prevDate = currentDate;
      }
      setStreakData({
         currentStreak: count,
         lastUpdated: new Date(data[0].created_at).toLocaleDateString(),
      });
   };

   useEffect(() => {
      fetchAttendanceData();
   }, []);
};

type responseDataType = {
   id: string;
   status: string;
   check_in_time: string;
   check_out_time: string;
   created_at: string;
   updated_at: string;
   user: number;
};

export default useStreakData;
