import React, { useEffect, useState, useRef } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, SafeAreaView } from "react-native";
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
        const sortedHistory = [...uniqueSleepHistory].sort((a, b) => 
          new Date(b.sleep_date) - new Date(a.sleep_date)
        );
        
        const latestSleepLog = sortedHistory[0];
        setSleepData({
          lastSleepDuration: latestSleepLog.sleep_duration_hours + 'h',
          lastSleepQuality: latestSleepLog.sleep_quality,
          lastSleepDate: latestSleepLog.sleep_date,
          sleepGoal: "8h",
          sleepHistory: sortedHistory.map(log => ({
            date: log.sleep_date,
            duration: log.sleep_duration_hours,
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
      const sleepDate = new Date().toISOString().split('T')[0];
      await apiAuth.post('/sleep-logs/', {
        sleep_date: sleepDate,
        sleep_duration_hours: 0,
        sleep_quality: "Good",
      });
      setIsSleeping(true);
      fetchSleepData();
    } catch (error) {
      setError('Failed to start sleep tracking');
    }
  };

  const stopSleeping = async () => {
    try {
      const sleepDate = new Date().toISOString().split('T')[0];
      const sleepDurationHours = parseFloat((timer / 3600).toFixed(1));
      await apiAuth.put('/sleep-logs/', {
        sleep_date: sleepDate,
        sleep_duration_hours: sleepDurationHours,
        sleep_quality: "Good",
      });
      setIsSleeping(false);
      setTimer(0);
      fetchSleepData();
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

  // Display only the last 7 days for the bar chart
  const recentSleepData = sleepData.sleepHistory.slice(0, 7).reverse();
  
  const barData = recentSleepData.map((sleep) => ({
    value: parseFloat(sleep.duration),
    label: sleep.date ? new Date(sleep.date).toLocaleDateString('en-US', { day: '2-digit' }) : '00',
    frontColor: sleep.quality === "Good" ? "#4ade80" : sleep.quality === "Fair" ? "#fbbf24" : "#ef4444",
  }));

  const getSleepQualityColor = (quality) => {
    switch (quality) {
      case "Good": return "#4ade80";
      case "Fair": return "#fbbf24";
      case "Poor": return "#ef4444";
      default: return "#6b7280";
    }
  };

  // Calculate weekly average
  const weeklyAverage = recentSleepData.length > 0 
    ? (recentSleepData.reduce((sum, day) => sum + parseFloat(day.duration), 0) / recentSleepData.length).toFixed(1)
    : "0.0";
  
  // Calculate goal progress percentage
  const goalHours = 8;
  const weeklyGoalPercentage = Math.min(100, Math.round((weeklyAverage / goalHours) * 100));

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={fetchSleepData}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Sleep Tracker</Text>
          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={24} color="#6366f1" />
          </TouchableOpacity>
        </View>

        {/* Sleep Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Sleep Summary</Text>
            <Text style={styles.summarySubtitle}>Last 7 days</Text>
          </View>
          
          <View style={styles.metricsContainer}>
            <View style={styles.metricCard}>
              <AnimatedCircularProgress
                size={100}
                width={8}
                fill={weeklyGoalPercentage}
                tintColor="#6366f1"
                backgroundColor="#e5e7eb"
                rotation={0}
              >
                {() => (
                  <View style={styles.progressTextContainer}>
                    <Text style={styles.progressValue}>{weeklyAverage}h</Text>
                    <Text style={styles.progressLabel}>Average</Text>
                  </View>
                )}
              </AnimatedCircularProgress>
            </View>
            
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Goal</Text>
              <Text style={styles.metricValue}>{sleepData.sleepGoal}</Text>
              <View style={styles.sleepGoalProgress}>
                <View
                  style={[
                    styles.sleepGoalProgressBar,
                    { width: `${weeklyGoalPercentage}%` },
                  ]}
                />
              </View>
              <Text style={styles.metricSubtext}>{weeklyGoalPercentage}% achieved</Text>
            </View>
          </View>
        </View>

        {/* Sleep Tracking Card */}
        <View style={styles.trackingCard}>
          {isSleeping ? (
            <>
              <View style={styles.sleepStatusContainer}>
                <Ionicons name="moon" size={28} color="#6366f1" />
                <Text style={styles.sleepStatusText}>Sleep in progress</Text>
              </View>
              <View style={styles.timerContainer}>
                <Text style={styles.timerText}>{formatTime(timer)}</Text>
                <AnimatedCircularProgress
                  size={160}
                  width={15}
                  fill={(timer / (8 * 3600)) * 100}
                  tintColor="#6366f1"
                  backgroundColor="#e5e7eb"
                  children={() => (
                    <View style={styles.progressTextContainer}>
                      <Text style={styles.timerPercentage}>{Math.round((timer / (8 * 3600)) * 100)}%</Text>
                      <Text style={styles.timerGoal}>of 8h goal</Text>
                    </View>
                  )}
                />
              </View>
              <TouchableOpacity style={styles.stopSleepButton} onPress={stopSleeping}>
                <LinearGradient
                  colors={["#ef4444", "#dc2626"]}
                  style={styles.gradientButton}
                >
                  <Text style={styles.buttonText}>Stop Tracking</Text>
                  <Ionicons name="stop-circle-outline" size={20} color="#ffffff" />
                </LinearGradient>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.lastSleepContainer}>
                <Text style={styles.lastSleepTitle}>Last Sleep</Text>
                <View style={styles.lastSleepDataContainer}>
                  <View style={styles.lastSleepData}>
                    <Text style={styles.lastSleepDuration}>{sleepData.lastSleepDuration}</Text>
                    <Text style={styles.lastSleepDate}>{sleepData.lastSleepDate || 'No data'}</Text>
                  </View>
                  <View style={styles.qualityContainer}>
                    <Text style={styles.qualityLabel}>Quality</Text>
                    <View style={styles.qualityIndicatorContainer}>
                      <View
                        style={[
                          styles.qualityIndicator,
                          { backgroundColor: getSleepQualityColor(sleepData.lastSleepQuality) },
                        ]}
                      />
                      <Text style={styles.qualityText}>{sleepData.lastSleepQuality || 'N/A'}</Text>
                    </View>
                  </View>
                </View>
              </View>
              <TouchableOpacity style={styles.startSleepButton} onPress={startSleeping}>
                <LinearGradient
                  colors={["#6366f1", "#4f46e5"]}
                  style={styles.gradientButton}
                >
                  <Text style={styles.buttonText}>Start Tracking Sleep</Text>
                  <Ionicons name="bed-outline" size={20} color="#ffffff" />
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Sleep Trends Card */}
        <View style={styles.trendsCard}>
          <Text style={styles.trendsTitle}>Sleep Trends</Text>
          
          {barData.length > 0 ? (
            <View style={styles.chartContainer}>
              <BarChart
                data={barData}
                barWidth={28}
                spacing={20}
                roundedTop
                roundedBottom
                hideRules
                showReferenceLine1
                referenceLine1Position={8}
                referenceLine1Config={{
                  color: "#6b7280",
                  dashWidth: 2,
                  dashGap: 3,
                }}
                yAxisThickness={0}
                xAxisThickness={1}
                xAxisColor="#e5e7eb"
                noOfSections={4}
                maxValue={10}
                height={180}
                width={barData.length * 48 + 40}
                yAxisTextStyle={{ color: "#6b7280" }}
                xAxisLabelTextStyle={{ color: "#6b7280", fontSize: 10 }}
              />
              <View style={styles.chartLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: "#4ade80" }]} />
                  <Text style={styles.legendText}>Good</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: "#fbbf24" }]} />
                  <Text style={styles.legendText}>Fair</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: "#ef4444" }]} />
                  <Text style={styles.legendText}>Poor</Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.noDataContainer}>
              <Ionicons name="bar-chart-outline" size={48} color="#d1d5db" />
              <Text style={styles.noDataText}>No sleep data available</Text>
            </View>
          )}
        </View>

        {/* Sleep History Card */}
        <View style={styles.historyCard}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>Sleep History</Text>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>View All</Text>
              <Ionicons name="chevron-forward" size={16} color="#6366f1" />
            </TouchableOpacity>
          </View>
          
          {sleepData.sleepHistory.length > 0 ? (
            sleepData.sleepHistory.slice(0, 5).map((sleep, index) => (
              <View key={index} style={styles.historyItem}>
                <View style={styles.historyItemLeft}>
                  <Text style={styles.historyDate}>
                    {sleep.date ? new Date(sleep.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    }) : 'N/A'}
                  </Text>
                </View>
                <View style={styles.historyItemRight}>
                  <Text style={styles.historyDuration}>{sleep.duration}h</Text>
                  <View style={styles.historyQualityContainer}>
                    <View
                      style={[
                        styles.historyQualityIndicator,
                        { backgroundColor: getSleepQualityColor(sleep.quality) },
                      ]}
                    />
                    <Text style={styles.historyQualityText}>{sleep.quality}</Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>No sleep history available</Text>
            </View>
          )}
        </View>

        {/* Tips Card */}
        <View style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Ionicons name="bulb-outline" size={24} color="#6366f1" />
            <Text style={styles.tipsTitle}>Sleep Tip</Text>
          </View>
          <Text style={styles.tipText}>
            Consistency is key for healthy sleep. Try to go to bed and wake up at the same time every day, even on weekends.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
  },
  settingsButton: {
    padding: 8,
  },
  summaryCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryHeader: {
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
  },
  summarySubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
  },
  metricsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metricCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  progressTextContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  progressValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1f2937",
  },
  progressLabel: {
    fontSize: 12,
    color: "#6b7280",
  },
  metricLabel: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
  },
  metricSubtext: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  sleepGoalProgress: {
    width: "100%",
    height: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    overflow: "hidden",
  },
  sleepGoalProgressBar: {
    height: "100%",
    backgroundColor: "#6366f1",
  },
  trackingCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sleepStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  sleepStatusText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1f2937",
    marginLeft: 8,
  },
  timerContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  timerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 12,
  },
  timerPercentage: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
  },
  timerGoal: {
    fontSize: 12,
    color: "#6b7280",
  },
  lastSleepContainer: {
    marginBottom: 20,
  },
  lastSleepTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 12,
  },
  lastSleepDataContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lastSleepData: {
    flex: 1,
  },
  lastSleepDuration: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1f2937",
  },
  lastSleepDate: {
    fontSize: 14,
    color: "#6b7280",
  },
  qualityContainer: {
    alignItems: "flex-end",
  },
  qualityLabel: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  qualityIndicatorContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  qualityIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  qualityText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1f2937",
  },
  startSleepButton: {
    width: "100%",
  },
  stopSleepButton: {
    width: "100%",
  },
  gradientButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
    marginRight: 8,
  },
  trendsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  trendsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 16,
  },
  chartContainer: {
    alignItems: "center",
  },
  chartLegend: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
    color: "#6b7280",
  },
  historyCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewAllText: {
    fontSize: 14,
    color: "#6366f1",
    fontWeight: "500",
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  historyItemLeft: {
    flex: 1,
  },
  historyDate: {
    fontSize: 14,
    color: "#1f2937",
    fontWeight: "500",
  },
  historyItemRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  historyDuration: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
    marginRight: 12,
  },
  historyQualityContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  historyQualityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  historyQualityText: {
    fontSize: 12,
    color: "#4b5563",
  },
  tipsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tipsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginLeft: 8,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#4b5563",
  },
  noDataContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  noDataText: {
    fontSize: 14,
    color: "#9ca3af",
    marginTop: 8,
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
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: "#ef4444",
    marginBottom: 16,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#6366f1",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
});