import { Dispatch, SetStateAction, useEffect } from 'react';
import { apiAuth } from '@/api/axios';
import { AxiosError, isAxiosError } from "axios";
import { mealsType, userMetricsType } from '@/utils/nutrirtionUtils';
import { dummyFoods, FoodItem } from '@/components/neutrition/foodItems';

interface useNutritionPropType {
    setLoading: Dispatch<SetStateAction<boolean>>;
    setUserMetrics: Dispatch<SetStateAction<userMetricsType>>;
    setMeals: Dispatch<SetStateAction<mealsType>>;
}

const filterFood = (foodItems: string[]): FoodItem[] => {
    let resultFoodItems: FoodItem[] = [];
    foodItems.forEach(foodItem => {
        const item = dummyFoods.find(food => food.name == foodItem);
        if (item) resultFoodItems.push(item);
    });
    return resultFoodItems;
}
const useNutritionData = ({ setLoading, setUserMetrics, setMeals }: useNutritionPropType): void => {
    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            try {
                if (isMounted) {
                    const response = await apiAuth.get('nutrition-goals');
                    console.log(response.data);
                    const convertedUserMetricsData: userMetricsType = {
                        height: `${response.data.height}`,
                        weight: `${response.data.weight}`,
                        age: `${response.data.age}`,
                        gender: response.data.sex,
                        activityLevel: response.data.activity_level
                    };
                    const convertedMealsData:mealsType = {
                        breakfast: filterFood(response.data.breakfast),
                        morningSnack: filterFood(response.data.morning_snack),
                        lunch: filterFood(response.data.lunch),
                        eveningSnack: filterFood(response.data.evening_snack),
                        dinner: filterFood(response.data.dinner)
                    };
                    console.log(convertedMealsData);
                    setUserMetrics(convertedUserMetricsData);
                    setMeals(convertedMealsData);
                }
            } catch (error: unknown) {
                if (isAxiosError(error)) {
                    console.log(error.response?.data);
                    return;
                } else {
                    console.log("An expected error occured: ", error);
                }
            } finally {
                setLoading(false);
            }
        }

        fetchData();

        return () => {
            isMounted = false;
        };
    }, []);
};

export default useNutritionData;