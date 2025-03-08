import React, { useState, useEffect } from "react";
import {
    Text,
    View,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from "react-native";
import MealSection from "../../components/neutrition/MealSection";
import MetricsModal from "../../components/neutrition/MetricsModal";
import FoodSearchModal from "../../components/neutrition/FoodSearchModal";
import { FoodItem, dummyFoods } from "@/components/neutrition/foodItems";
import useNutritionData from "@/hooks/useNutritionData";
import { mealsType, updateNutrisionGoal, userMetricsType, useUpdateUserMetrics } from "@/utils/nutrirtionUtils";

export default function Nutrition() {
    const [userMetrics, setUserMetrics] = useState<userMetricsType>({
        height: "",
        weight: "",
        age: "",
        gender: "male",
        activityLevel: "moderate",
    });

    const [nutritionTargets, setNutritionTargets] = useState({
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
    });

    const [setupComplete, setSetupComplete] = useState(false);
    
    const [meals, setMeals] = useState<mealsType>({
        breakfast: [],
        morningSnack: [],
        lunch: [],
        eveningSnack: [],
        dinner: [],
    });

    const [metricsModalVisible, setMetricsModalVisible] = useState(false);
    const [foodSearchModalVisible, setFoodSearchModalVisible] = useState(false);
    type MealType =
        | "breakfast"
        | "morningSnack"
        | "lunch"
        | "eveningSnack"
        | "dinner";
    const [currentMealType, setCurrentMealType] =
        useState<MealType>("breakfast");

    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<FoodItem[]>([]);

    const [dailyTotals, setDailyTotals] = useState({
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
    });
    const [loading, setLoading] = useState<boolean>(true);

    useNutritionData({ setLoading, setUserMetrics, setMeals });
    useUpdateUserMetrics(loading, metricsModalVisible, userMetrics);

    useEffect(() => {
        let calories = 0,
            protein = 0,
            carbs = 0,
            fats = 0;

        Object.values(meals).forEach((mealArray) => {
            mealArray.forEach((food: FoodItem) => {
                calories += food.calories;
                protein += food.protein;
                carbs += food.carbs;
                fats += food.fats;
            });
        });
        calories = parseFloat(calories.toPrecision(4));
        protein = parseFloat(protein.toPrecision(4));
        carbs = parseFloat(carbs.toPrecision(4));
        fats = parseFloat(fats.toPrecision(4));
        setDailyTotals({
            calories,
            protein,
            carbs,
            fats,
        });
    }, [meals]);

    useEffect(() => {
        if (metricsModalVisible || loading) return;
        calculateNutritionTargets();
    }, [userMetrics, metricsModalVisible]);

    const calculateNutritionTargets = async () => {
        const { height, weight, age, gender, activityLevel } = userMetrics;
        let bmr;
        if (gender === "male") {
            bmr =
                10 * parseFloat(weight) +
                6.25 * parseFloat(height) -
                5 * parseFloat(age) +
                5;
        } else {
            bmr =
                10 * parseFloat(weight) +
                6.25 * parseFloat(height) -
                5 * parseFloat(age) -
                161;
        }

        let activityMultiplier;
        switch (activityLevel) {
            case "sedentary":
                activityMultiplier = 1.2;
                break;
            case "light":
                activityMultiplier = 1.375;
                break;
            case "moderate":
                activityMultiplier = 1.55;
                break;
            case "active":
                activityMultiplier = 1.725;
                break;
            case "veryActive":
                activityMultiplier = 1.9;
                break;
            default:
                activityMultiplier = 1.55;
        }

        const calories = Math.round(bmr * activityMultiplier);
        const protein = Math.round(parseFloat(weight) * 1.6);
        const fats = Math.round((calories * 0.25) / 9);
        const carbs = Math.round((calories - protein * 4 - fats * 9) / 4);

        setNutritionTargets({
            calories,
            protein,
            carbs,
            fats,
        });

        setSetupComplete(true);
        setMetricsModalVisible(false);
    };

    const searchFood = (query: string) => {
        if (query.trim() === "") {
            setSearchResults([]);
            return;
        }

        const results = dummyFoods.filter((food) =>
            food.name.toLowerCase().includes(query.toLowerCase())
        );

        setSearchResults(results);
    };

    const addFoodToMeal = (food: FoodItem) => {
        const newMealsData = {
            ...meals,
            [currentMealType]: [...meals[currentMealType], food],
        };
        setMeals(newMealsData);

        setFoodSearchModalVisible(false);
        setSearchQuery("");
        setSearchResults([]);
        updateNutrisionGoal(userMetrics, newMealsData, loading);
    };

    const openFoodSearch = (mealType: MealType) => {
        setCurrentMealType(mealType);
        setFoodSearchModalVisible(true);
    };

    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.dateText}>{formattedDate}</Text>
                {setupComplete ? (
                    <TouchableOpacity
                        style={styles.editMetricsButton}
                        onPress={() => setMetricsModalVisible(true)}
                    >
                        <Text style={styles.editMetricsButtonText}>
                            Edit Goals
                        </Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={styles.setupButton}
                        onPress={() => setMetricsModalVisible(true)}
                    >
                        <Text style={styles.setupButtonText}>
                            Set Nutrition Goals
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
            {setupComplete && (
                <View style={styles.nutritionSummary}>
                    <View style={styles.nutritionItem}>
                        <Text style={styles.nutritionLabel}>Calories</Text>
                        <Text style={styles.nutritionValue}>
                            {dailyTotals.calories} / {nutritionTargets.calories}
                        </Text>
                        <View style={styles.progressBar}>
                            <View
                                style={[
                                    styles.progressFill,
                                    {
                                        width: `${Math.min(
                                            100,
                                            (dailyTotals.calories /
                                                nutritionTargets.calories) *
                                                100
                                        )}%`,
                                        backgroundColor:
                                            dailyTotals.calories >
                                            nutritionTargets.calories
                                                ? "#FF6B6B"
                                                : "#4CAF50",
                                    },
                                ]}
                            />
                        </View>
                    </View>
                    <View style={styles.macroRow}>
                        <View style={styles.macroItem}>
                            <Text style={styles.macroLabel}>Protein</Text>
                            <Text style={styles.macroValue}>
                                {dailyTotals.protein}g /{" "}
                                {nutritionTargets.protein}g
                            </Text>
                        </View>
                        <View style={styles.macroItem}>
                            <Text style={styles.macroLabel}>Carbs</Text>
                            <Text style={styles.macroValue}>
                                {dailyTotals.carbs}g / {nutritionTargets.carbs}g
                            </Text>
                        </View>
                        <View style={styles.macroItem}>
                            <Text style={styles.macroLabel}>Fats</Text>
                            <Text style={styles.macroValue}>
                                {dailyTotals.fats}g / {nutritionTargets.fats}g
                            </Text>
                        </View>
                    </View>
                </View>
            )}

            <ScrollView style={styles.mealsContainer}>
                <MealSection
                    title="Breakfast"
                    mealItems={meals.breakfast}
                    onAddFood={() => openFoodSearch("breakfast")}
                />
                <MealSection
                    title="Morning Snack"
                    mealItems={meals.morningSnack}
                    onAddFood={() => openFoodSearch("morningSnack")}
                />
                <MealSection
                    title="Lunch"
                    mealItems={meals.lunch}
                    onAddFood={() => openFoodSearch("lunch")}
                />
                <MealSection
                    title="Evening Snack"
                    mealItems={meals.eveningSnack}
                    onAddFood={() => openFoodSearch("eveningSnack")}
                />
                <MealSection
                    title="Dinner"
                    mealItems={meals.dinner}
                    onAddFood={() => openFoodSearch("dinner")}
                />
            </ScrollView>

            <MetricsModal
                visible={metricsModalVisible}
                onClose={() => setMetricsModalVisible(false)}
                userMetrics={userMetrics}
                setUserMetrics={setUserMetrics}
                onSave={calculateNutritionTargets}
            />

            <FoodSearchModal
                visible={foodSearchModalVisible}
                onClose={() => {
                    setFoodSearchModalVisible(false);
                    setSearchQuery("");
                    setSearchResults([]);
                }}
                searchQuery={searchQuery}
                setSearchQuery={(text) => {
                    setSearchQuery(text);
                    searchFood(text);
                }}
                searchResults={searchResults}
                onAddFood={addFoodToMeal}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fa",
        padding: 16,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    dateDisplay: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "white",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    dateText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#2c3e50",
        marginRight: 5,
    },
    dateDropdownIndicator: {
        fontSize: 12,
        color: "#7f8c8d",
    },
    dateSelector: {
        backgroundColor: "white",
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    weekNavigator: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    navButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: "#f0f0f0",
    },
    navButtonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#555",
    },
    weekTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#2c3e50",
    },
    weekView: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    dayButton: {
        alignItems: "center",
        padding: 8,
        borderRadius: 12,
    },
    dayButtonToday: {
        backgroundColor: "#3498db",
    },
    dayAbbreviation: {
        fontSize: 14,
        color: "#7f8c8d",
    },
    dayNumber: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#2c3e50",
    },
    setupButton: {
        backgroundColor: "#4CAF50",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
    },
    setupButtonText: {
        color: "white",
        fontWeight: "bold",
    },
    editMetricsButton: {
        backgroundColor: "#3498db",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    editMetricsButtonText: {
        color: "white",
        fontWeight: "500",
    },
    nutritionSummary: {
        backgroundColor: "white",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    nutritionItem: {
        marginBottom: 10,
    },
    nutritionLabel: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#2c3e50",
    },
    nutritionValue: {
        fontSize: 14,
        color: "#7f8c8d",
        marginBottom: 4,
    },
    progressBar: {
        height: 8,
        backgroundColor: "#ecf0f1",
        borderRadius: 4,
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        borderRadius: 4,
    },
    macroRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 8,
    },
    macroItem: {
        flex: 1,
        alignItems: "center",
    },
    macroLabel: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#2c3e50",
    },
    macroValue: {
        fontSize: 12,
        color: "#7f8c8d",
    },
    mealsContainer: {
        flex: 1,
    },
});
