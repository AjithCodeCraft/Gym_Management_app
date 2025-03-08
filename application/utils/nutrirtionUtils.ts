import { FoodItem } from "@/components/neutrition/foodItems";
import { apiAuth } from "@/api/axios";
import { isAxiosError } from "axios";
import { Dispatch, SetStateAction, useEffect } from "react";
export interface nutritionalGoalType {
    height: number | undefined;
    weight: number | undefined;
    age: number | undefined;
    sex: string | undefined;
    activity_level: string | undefined;
    breakfast: string[] | undefined;
    morning_snack: string[] | undefined;
    lunch: string[] | undefined;
    evening_snack: string[] | undefined;
    dinner: string[] | undefined;
}

export interface userMetricsType {
    height: string;
    weight: string;
    age: string;
    gender: string;
    activityLevel: string;
}

export interface mealsType {
    breakfast: FoodItem[];
    morningSnack: FoodItem[];
    lunch: FoodItem[];
    eveningSnack: FoodItem[];
    dinner: FoodItem[];
}

const convertToNumber = (value: string): number | undefined => {
    return value?.trim() ? Number(value) : undefined;
};

const convertMeal = (meal: FoodItem[]): string[] | undefined => {
    return meal.length > 0 ? meal.map(item => item.name) : [];
};

const convertString = (value: string): string | undefined => {
    return value?.trim() ? value : undefined;
};

export const updateNutrisionGoal = async (userMetric: userMetricsType, meals:mealsType, loading: boolean) => {
    if (loading) return;
    const data: nutritionalGoalType = {
        height: convertToNumber(userMetric.height),
        weight: convertToNumber(userMetric.weight),
        age: convertToNumber(userMetric.age),
        sex: convertString(userMetric.gender),
        activity_level: convertString(userMetric.activityLevel),
        breakfast: convertMeal(meals.breakfast),
        morning_snack: convertMeal(meals.morningSnack),
        lunch: convertMeal(meals.lunch),
        evening_snack: convertMeal(meals.eveningSnack),
        dinner: convertMeal(meals.dinner),
    };
    const mealKeys = ['breakfast', 'morning_snack', 'lunch', 'evening_snack', 'dinner'] as const;
    for (const key of Object.keys(data) as (keyof nutritionalGoalType)[]) {
        if (mealKeys.includes(key as typeof mealKeys[number])) continue;
        if (data[key] === undefined) return;
    }
    try {
        apiAuth.put("nutrition-goals/", data);
    } catch (error) {
        if (isAxiosError(error)) {
            console.log("API ERROR: ", error?.response?.data);
        }
    }
};

export const useUpdateUserMetrics = (loading: boolean, metricsModalVisible: boolean, userMetric: userMetricsType) => {
    const updateUserMetrics = async () => {
        const userMetricData = {
            height: convertToNumber(userMetric.height),
            weight: convertToNumber(userMetric.weight),
            age: convertToNumber(userMetric.age),
            sex: convertString(userMetric.gender),
            activity_level: convertString(userMetric.activityLevel),
        };
        apiAuth.put("nutrition-goals/", userMetricData);
    }
    useEffect(() => {
        if (loading || metricsModalVisible) return;
        updateUserMetrics();
    }, [userMetric, metricsModalVisible]);
};