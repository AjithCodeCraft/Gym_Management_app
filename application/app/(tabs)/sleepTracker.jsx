import React, { useEffect, useState, useRef } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BarChart } from "react-native-gifted-charts";
import { LinearGradient } from "expo-linear-gradient";
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { apiAuth } from '@/api/axios';

export default function HomeScreen() {
  const [sleepData, setSleepData] = useState({
    lastSleepDuration: "",
    lastSleepQuality: "",
    lastSleepDate: "",
    sleepGoal: "8h",
    sleepHistory: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSleeping, setIsSleeping] = useState(false);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    fetchSleepData();
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    if (isSleeping) {
      timerRef.current = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isSleeping]);

  const fetchSleepData = async () => {
    try {
      const response = await apiAuth.get('/sleep-logs/');
      const uniqueSleepHistory = Array.from(new Map(response.data.map(log => [log.sleep_date, log])).values());
      if (uniqueSleepHistory.length > 0) {
        const latestSleepLog = uniqueSleepHistory[0];
        setSleepData({
          lastSleepDuration: latestSleepLog.sleep_duration_hours + 'h',
          lastSleepQuality: latestSleepLog.sleep_quality,
          lastSleepDate: latestSleepLog.sleep_date,
          sleepGoal: "8h",
          sleepHistory: uniqueSleepHistory.map(log => ({
            date: log.sleep_date,
            duration: log.sleep_duration_hours + 'h',
            quality: log.sleep_quality,
          })),
        });
      }
      setLoading(false);
    } catch (error) {
      setError('Failed to fetch sleep data');
      setLoading(false);
    }
  };

  const startSleeping = async () => {
    try {
      const sleepDate = new Date().toISOString().split('T')[0]; // Ensure the date format is correct
      const response = await apiAuth.post('/sleep-logs/', {
        sleep_date: sleepDate, // Ensure the date format is correct
        sleep_duration_hours: 0, // Initial duration
        sleep_quality: "Good", // Initial quality
      });
      setIsSleeping(true);
      fetchSleepData(); // Refresh the sleep data after posting
    } catch (error) {
      setError('Failed to start sleep tracking');
    }
  };

  const stopSleeping = async () => {
    try {
      const sleepDate = new Date().toISOString().split('T')[0]; // Ensure the date format is correct
      const sleepDurationHours = timer / 3600;
      await apiAuth.put('/sleep-logs/', {
        sleep_date: sleepDate,
        sleep_duration_hours: sleepDurationHours,
        sleep_quality: "Good", // Update quality as needed
      });
      setIsSleeping(false);
      setTimer(0);
      fetchSleepData(); // Refresh the sleep data after updating
    } catch (error) {
      setError('Failed to stop sleep tracking');
    }
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  const barData = sleepData.sleepHistory.map((sleep, index) => ({
    value: parseFloat(sleep.duration),
    label: sleep.date ? sleep.date.split("-")[2] : '00', // Default to '00' if date is undefined
    frontColor: sleep.quality === "Good" ? "#4ade80" : sleep.quality === "Fair" ? "#fbbf24" : "#ef4444",
  }));

  const getSleepQualityColor = (quality) => {
    switch (quality) {
      case "Good":
        return "#4ade80";
      case "Fair":
        return "#fbbf24";
      case "Poor":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sleep Tracking</Text>
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
          {isSleeping ? (
            <TouchableOpacity style={styles.stopSleepButton} onPress={stopSleeping}>
              <LinearGradient
                colors={["#ea580c", "#f97316"]}
                style={styles.gradientButton}
              >
                <Text style={styles.stopSleepButtonText}>Stop Sleeping</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.startSleepButton} onPress={startSleeping}>
              <LinearGradient
                colors={["#f97316", "#ea580c"]}
                style={styles.gradientButton}
              >
                <Text style={styles.startSleepButtonText}>Start Sleeping</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
          {isSleeping && (
            <View style={styles.timerContainer}>
              <Text style={styles.timerText}>{formatTime(timer)}</Text>
              <AnimatedCircularProgress
                size={120}
                width={10}
                fill={(timer / (8 * 3600)) * 100}
                tintColor="#f97316"
                backgroundColor="#e5e7eb"
              >
                {(fill) => <Text style={styles.progressText}>{Math.round(fill)}%</Text>}
              </AnimatedCircularProgress>
            </View>
          )}
        </View>
        <View style={styles.sleepGoalContainer}>
          <Text style={styles.sleepGoalTitle}>Weekly Sleep Goal</Text>
          <Text style={styles.sleepGoalText}>
            {sleepData.sleepGoal} per night
          </Text>
          <View style={styles.sleepGoalProgress}>
            <View
              style={[
                styles.sleepGoalProgressBar,
                { width: `${(7 / 7) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.sleepGoalSubtext}>7 out of 7 days met</Text>
        </View>
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
        <View style={styles.sleepHistoryContainer}>
          <Text style={styles.sleepHistoryTitle}>Sleep History</Text>
          {sleepData.sleepHistory.map((sleep, index) => (
            <View key={index} style={styles.sleepHistoryItem}>
              <Text style={styles.sleepHistoryDate}>{sleep.date || 'N/A'}</Text>
              <Text style={styles.sleepHistoryDuration}>{sleep.duration || 'N/A'}</Text>
              <View
                style={[
                  styles.sleepHistoryQuality,
                  { backgroundColor: getSleepQualityColor(sleep.quality || 'N/A') },
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
  stopSleepButton: {
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
  stopSleepButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
  },
  timerContainer: {
    alignItems: "center",
    marginTop: 16,
  },
  timerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
  },
  progressText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 18,
    color: "red",
  },
});
