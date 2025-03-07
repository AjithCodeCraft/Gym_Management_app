import { Dispatch, SetStateAction, useEffect } from 'react';
import { apiAuth } from '@/api/axios';
import { AxiosError, isAxiosError } from "axios";

interface useNutritionPropType {
    loading: boolean;
    setLoading: Dispatch<SetStateAction<boolean>>;
}

const useNutritionData = ({ loading, setLoading }: useNutritionPropType): void => {
    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            try {
                if (isMounted) {
                    const response = await apiAuth.get('nutrition-goals');
                    console.log(response.data);
                    setLoading(false);
                }
            } catch (error: unknown) {
                setLoading(false);
                if (isAxiosError(error)) {
                    console.log(error.response?.data);
                } else {
                    console.log("An expected error occured: ", error);
                }
            }
        }

        fetchData();

        return () => {
            isMounted = false;
        };
    }, []);
};

export default useNutritionData;