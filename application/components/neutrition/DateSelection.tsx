import { View, TouchableOpacity, Text } from "react-native";
import { styles } from "@/app/(tabs)/nutrition";
import { Dispatch, SetStateAction, useState } from "react";
import { mealsType } from "@/utils/nutrirtionUtils";
import { workoutStyles } from "@/app/(tabs)/workout";

type DateSelectionType = {
    showDateSelector: boolean;
    setCurrentDate: Dispatch<SetStateAction<Date>>;
    setWeekStartDate: Dispatch<SetStateAction<Date>>;
    setMeals: Dispatch<SetStateAction<mealsType>>;
    setShowDateSelector: Dispatch<SetStateAction<boolean>>;
    currentDate: Date;
    weekStartDate: Date;
};

const DateSelection = ({ setCurrentDate, setMeals, setShowDateSelector, setWeekStartDate, currentDate, weekStartDate, showDateSelector, }: DateSelectionType) => {
    // Function to load data for a specific date
    const loadDateData = (date: Date) => {
        const today = new Date();
        if (date > today) {
            // If the selected date is in the future, do not update the current date
            return;
        }
        setWeekStartDate(date);
    };

    // Navigate to previous week
    const goToPreviousWeek = () => {
        const prevWeek = new Date(weekStartDate);
        prevWeek.setDate(prevWeek.getDate() - 7);
        loadDateData(prevWeek);
    };

    // Navigate to next week
    const goToNextWeek = () => {
        const nextWeek = new Date(weekStartDate);
        let incrementDays: number = Math.floor(new Date().getTime() - weekStartDate.getTime()) / (1000 * 60 * 60 * 24);
        if (incrementDays > 7) incrementDays = 7;
        nextWeek.setDate(nextWeek.getDate() + incrementDays);
        loadDateData(nextWeek);
    };

    // Set to today
    const goToToday = () => {
        setCurrentDate(new Date());
        setShowDateSelector(false);
    };

    // Get the current week's dates
    const getWeekDates = () => {
        const startOfWeek = new Date(weekStartDate);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        const weekDates = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(date.getDate() + i);
            if (date <= new Date()) {
                weekDates.push(date);
            }
        }
        return weekDates;
    };

    // Check if a date is today
    const isToday = (date: Date) => {
        const today = new Date();
        return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        );
    };

    return (
        <>
            {showDateSelector && (
                <View style={styles.dateSelector}>
                    <View style={styles.weekNavigator}>
                        <TouchableOpacity
                            style={styles.navButton}
                            onPress={goToPreviousWeek}
                        >
                            <Text style={styles.navButtonText}>◀</Text>
                        </TouchableOpacity>

                        <Text style={styles.weekTitle}>
                            {currentDate.toLocaleDateString("en-US", {
                                month: "long",
                                year: "numeric",
                            })}
                        </Text>

                        <TouchableOpacity
                            style={styles.navButton}
                            onPress={goToNextWeek}
                        >
                            <Text style={styles.navButtonText}>▶</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.weekView}>
                        {getWeekDates().map((date: Date, index: number) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.dayButton,
                                    isToday(date) && styles.dayButtonToday,
                                    date.getTime() === currentDate.getTime() && styles.daySelected,
                                ]}
                                onPress={() => setCurrentDate(date)}
                            >
                                <Text style={styles.dayAbbreviation}>
                                    {date.toLocaleDateString("en-US", {
                                        weekday: "narrow",
                                    })}
                                </Text>
                                <Text style={styles.dayNumber}>
                                    {date.getDate()}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}
        </>
    );
}

type DaySelectionProps = {
    selectedDate: Date;
    setSelectedDate: Dispatch<SetStateAction<Date>>;
}

export const DaySeletion = ({ selectedDate, setSelectedDate }: DaySelectionProps) => {
    const goToNextDay = () => {
        setSelectedDate(prev => {
            const newDate = new Date(prev);
            newDate.setDate(newDate.getDate() + 1);
            return newDate;
        });
    };
    const goToPrevDay = () => {
        setSelectedDate(prev => {
            const newDate = new Date(prev);
            newDate.setDate(newDate.getDate() - 1);
            return newDate;
        });
    };
    return (
    <View style={workoutStyles.dateContainer}>
        <TouchableOpacity onPress={goToPrevDay}>
            <Text style={styles.navButtonText}>◀</Text>
        </TouchableOpacity>
        <Text style={styles.dateText}>
            {selectedDate.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
            })}
        </Text>
        <TouchableOpacity onPress={goToNextDay}>
            <Text style={styles.navButtonText}>▶</Text>
        </TouchableOpacity>
    </View>
    )
}

export default DateSelection;