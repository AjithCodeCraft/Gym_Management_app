import { apiAuth } from "@/api/axios";
import { TrainerType } from "@/app/(tabs)/gym";
import { useEffect, Dispatch, SetStateAction } from "react";

const useTrainerData = (setAllTrainers: Dispatch<SetStateAction<TrainerType[]>>) => {
   const fetchTrainerData = async () => {
      apiAuth
         .get("trainers/")
         .then((res) => setAllTrainers(res.data))
         .catch((error) => console.log(error));
   };

   useEffect(() => {
      fetchTrainerData();
   }, []);
};

export default useTrainerData;
