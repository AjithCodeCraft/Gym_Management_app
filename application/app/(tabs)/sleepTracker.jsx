import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BarChart } from "react-native-gifted-charts";
import { LinearGradient } from "expo-linear-gradient";

export default function HomeScreen() {
  // Sample data for sleep tracking
  const [sleepData, setSleepData] = useState({
    lastSleepDuration: "7h 30m",
    lastSleepQuality: "Good", // Can be "Good", "Fair", or "Poor"
    lastSleepDate: "Last Night",
    sleepGoal: "8h", // Weekly sleep goal
    sleepHistory: [
      { date: "2024-05-01", duration: "7h 45m", quality: "Good" },
      { date: "2024-04-30", duration: "6h 50m", quality: "Fair" },
      { date: "2024-04-29", duration: "8h 10m", quality: "Good" },
      { date: "2024-04-28", duration: "5h 30m", quality: "Poor" },
      { date: "2024-04-27", duration: "7h 00m", quality: "Fair" },
      { date: "2024-04-26", duration: "8h 20m", quality: "Good" },
      { date: "2024-04-25", duration: "6h 45m", quality: "Fair" },
    ],
  });

  // Bar chart data for sleep trends
  const barData = sleepData.sleepHistory.map((sleep, index) => ({
    value: parseFloat(sleep.duration),
    label: sleep.date.split("-")[2], // Display only the day
    frontColor: sleep.quality === "Good" ? "#4ade80" : sleep.quality === "Fair" ? "#fbbf24" : "#ef4444",
  }));

  // Sleep quality indicator color
  const getSleepQualityColor = (quality) => {
    switch (quality) {
      case "Good":
        return "#4ade80"; // Green
      case "Fair":
        return "#fbbf24"; // Yellow
      case "Poor":
        return "#ef4444"; // Red
      default:
        return "#6b7280"; // Gray
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Sleep Tracking Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sleep Tracking</Text>

        {/* Last Sleep Summary */}
        <View style={styles.sleepContainer}>
          <Text style={styles.sleepTitle}>Last Sleep</Text>
          <Text style={styles.sleepDuration}>{sleepData.lastSleepDuration}</Text>
          <View style={styles.sleepQualityContainer}>
            <Text style={styles.sleepQualityLabel}>Quality:</Text>
            <View
              style={[
                styles.sleepQualityIndicator,
                { backgroundColor: getSleepQualityColor(sleepData.lastSleepQuality) },
              ]}
            />
            <Text style={styles.sleepQualityText}>{sleepData.lastSleepQuality}</Text>
          </View>
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

        {/* Sleep Goal Tracker */}
        <View style={styles.sleepGoalContainer}>
          <Text style={styles.sleepGoalTitle}>Weekly Sleep Goal</Text>
          <Text style={styles.sleepGoalText}>
            {sleepData.sleepGoal} per night
          </Text>
          <View style={styles.sleepGoalProgress}>
            <View
              style={[
                styles.sleepGoalProgressBar,
                { width: `${(7 / 7) * 100}%` }, // Example: 7 out of 7 days met
              ]}
            />
          </View>
          <Text style={styles.sleepGoalSubtext}>7 out of 7 days met</Text>
        </View>

        {/* Sleep Trends Chart */}
        <View style={styles.sleepTrendsContainer}>
          <Text style={styles.sleepTrendsTitle}>Sleep Trends</Text>
          <BarChart
            data={barData}
            barWidth={22}
            spacing={24}
            roundedTop
            showReferenceLine1
            referenceLine1Position={8}
            referenceLine1Config={{
              color: "#6b7280",
              dashWidth: 2,
              dashGap: 3,
            }}
            yAxisThickness={0}
            xAxisThickness={0}
            noOfSections={4}
            maxValue={10}
            initialSpacing={10}
            yAxisTextStyle={{ color: "#6b7280" }}
            xAxisLabelTextStyle={{ color: "#6b7280" }}
          />
        </View>

        {/* Sleep History */}
        <View style={styles.sleepHistoryContainer}>
          <Text style={styles.sleepHistoryTitle}>Sleep History</Text>
          {sleepData.sleepHistory.map((sleep, index) => (
            <View key={index} style={styles.sleepHistoryItem}>
              <Text style={styles.sleepHistoryDate}>{sleep.date}</Text>
              <Text style={styles.sleepHistoryDuration}>{sleep.duration}</Text>
              <View
                style={[
                  styles.sleepHistoryQuality,
                  { backgroundColor: getSleepQualityColor(sleep.quality) },
                ]}
              />
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
  sleepQualityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  sleepQualityLabel: {
    fontSize: 14,
    color: "#6b7280",
    marginRight: 8,
  },
  sleepQualityIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  sleepQualityText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1f2937",
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
  sleepGoalContainer: {
    marginBottom: 16,
  },
  sleepGoalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
  },
  sleepGoalText: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 8,
  },
  sleepGoalProgress: {
    height: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    overflow: "hidden",
  },
  sleepGoalProgressBar: {
    height: "100%",
    backgroundColor: "#4ade80",
  },
  sleepGoalSubtext: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  sleepTrendsContainer: {
    marginBottom: 16,
  },
  sleepTrendsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
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
    alignItems: "center",
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
  sleepHistoryQuality: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});