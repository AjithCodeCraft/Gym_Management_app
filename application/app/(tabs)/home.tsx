import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PieChart } from "react-native-gifted-charts";
import { LinearGradient } from "expo-linear-gradient";

export default function HomeScreen() {
  // Sample data for infinite streak
  const [streakData, setStreakData] = useState({
    currentStreak: 12, // Infinite streak counter
    daysThisWeek: [true, true, true, true, false, false, null], // Attendance for the week
    lastUpdated: "Today at 8:30 AM",
  });

  // Sample data for sleep tracking
  const [sleepData, setSleepData] = useState({
    lastSleepDuration: "7h 30m",
    lastSleepDate: "Last Night",
    sleepHistory: [
      { date: "2024-05-01", duration: "7h 45m" },
      { date: "2024-04-30", duration: "6h 50m" },
      { date: "2024-04-29", duration: "8h 10m" },
    ],
  });

  // Chart data for weekly attendance
  const chartData = [
    { value: 4, color: "#f97316", label: "Present" }, // Orange for present
    { value: 2, color: "#e5e7eb", label: "Absent" }, // Gray for absent
  ];

  // Quote of the day
  const quoteOfDay = {
    text: "The only bad workout is the one you didn't do.",
    author: "Unknown",
  };

  return (
    <ScrollView style={styles.container}>
      {/* Streak Tracker Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Streak 🔥</Text>
        <View style={styles.chartContainer}>
          <PieChart
            data={chartData}
            donut
            showGradient
            sectionAutoFocus
            radius={90}
            innerRadius={60}
            innerCircleColor="#ffffff"
            centerLabelComponent={() => (
              <View style={styles.chartCenterText}>
                <Text style={styles.streakNumber}>
                  {streakData.currentStreak} 🔥
                </Text>
                <Text style={styles.streakLabel}>day streak</Text>
              </View>
            )}
          />
        </View>
        <Text style={styles.lastUpdated}>
          Last updated: {streakData.lastUpdated}
        </Text>
      </View>

      {/* Quote of the Day Section */}
      <View style={styles.quoteSection}>
        <Text style={styles.quoteText}>"{quoteOfDay.text}"</Text>
        <Text style={styles.quoteAuthor}>— {quoteOfDay.author}</Text>
      </View>

      {/* Sleep Tracking Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sleep Tracking</Text>
        <View style={styles.sleepContainer}>
          <Text style={styles.sleepTitle}>Last Sleep</Text>
          <Text style={styles.sleepDuration}>{sleepData.lastSleepDuration}</Text>
          <Text style={styles.sleepDate}>{sleepData.lastSleepDate}</Text>
          <TouchableOpacity style={styles.startSleepButton}>
            <LinearGradient
              colors={["#f97316", "#ea580c"]}
              style={styles.gradientButton}
            >
              <Text style={styles.startSleepButtonText}>Start Sleeping</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Sleep History */}
        <View style={styles.sleepHistoryContainer}>
          <Text style={styles.sleepHistoryTitle}>Sleep History</Text>
          {sleepData.sleepHistory.map((sleep, index) => (
            <View key={index} style={styles.sleepHistoryItem}>
              <Text style={styles.sleepHistoryDate}>{sleep.date}</Text>
              <Text style={styles.sleepHistoryDuration}>{sleep.duration}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
    padding: 16,
  },
  section: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 16,
  },
  chartContainer: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    height: 250,
  },
  chartCenterText: {
    position: "absolute",
    top: "60%",
    left: "10%",
    transform: [{ translateX: -50 }, { translateY: -30 }],
    alignItems: "center",
    justifyContent: "center",
},

  streakNumber: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1f2937",
    textAlign: "center",
  },
  streakLabel: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
  },
  lastUpdated: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 8,
  },
  quoteSection: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  quoteText: {
    fontSize: 16,
    fontStyle: "italic",
    color: "#1f2937",
    textAlign: "center",
    marginBottom: 8,
  },
  quoteAuthor: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  sleepContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  sleepTitle: {
    fontSize: 16,
    color: "#6b7280",
  },
  sleepDuration: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1f2937",
    marginVertical: 8,
  },
  sleepDate: {
    fontSize: 14,
    color: "#6b7280",
  },
  startSleepButton: {
    width: "100%",
    marginTop: 16,
  },
  gradientButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
  },
  startSleepButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
  },
  sleepHistoryContainer: {
    marginTop: 16,
  },
  sleepHistoryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
  },
  sleepHistoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  sleepHistoryDate: {
    fontSize: 14,
    color: "#6b7280",
  },
  sleepHistoryDuration: {
    fontSize: 14,
    color: "#1f2937",
  },
});