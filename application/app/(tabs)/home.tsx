import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from "react-native";
import { PieChart } from "react-native-gifted-charts";
import { LinearGradient } from "expo-linear-gradient";
import { gymQuotes } from "../quotes"; // Import the quotes

export default function HomeScreen() {
  // State for BMI Calculator
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Male");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bmi, setBmi] = useState("");
  const [bmiLevel, setBmiLevel] = useState("");

  // State for Streak Tracker
  const [streakData, setStreakData] = useState({
    currentStreak: 12, // Infinite streak counter
    daysThisWeek: [true, true, true, true, false, false, null], // Attendance for the week
    lastUpdated: "Today at 8:30 AM",
  });

  // State for Sleep Tracking
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

  // Function to get the quote of the day
  const getQuoteOfTheDay = () => {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 0); // Start of the year
    const dayOfYear = Math.floor(
      (today.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24) // Calculate day of the year
    );
    const quoteIndex = dayOfYear % gymQuotes.length; // Ensure it stays within the array bounds
    return gymQuotes[quoteIndex];
  };

  const quoteOfDay = getQuoteOfTheDay(); // Get today's quote

  // Function to calculate BMI
  const calculateBMI = () => {
    if (!age || !height || !weight) {
      alert("Please fill in all fields.");
      return;
    }

    const heightInMeters = parseFloat(height) / 100;
    const bmiValue = (parseFloat(weight) / (heightInMeters * heightInMeters)).toFixed(2);
    setBmi(bmiValue);

    // Determine BMI level
    const bmiNumber = parseFloat(bmiValue);
    if (bmiNumber < 18.5) {
      setBmiLevel("Underweight");
    } else if (bmiNumber >= 18.5 && bmiNumber < 25) {
      setBmiLevel("Normal");
    } else if (bmiNumber >= 25 && bmiNumber < 30) {
      setBmiLevel("Overweight");
    } else {
      setBmiLevel("Obesity");
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* BMI Calculator Section */}
      

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
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>BMI Calculator</Text>
        {/* Age Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Age</Text>
          <TextInput
            style={styles.input}
            placeholder="25"
            keyboardType="numeric"
            value={age}
            onChangeText={setAge}
          />
          <Text style={styles.note}>Ages: 2 - 120</Text>
        </View>
        {/* Gender Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Gender</Text>
          <View style={styles.genderContainer}>
            <TouchableOpacity
              style={[
                styles.genderButton,
                gender === "Male" && styles.selectedGender,
              ]}
              onPress={() => setGender("Male")}
            >
              <Text style={styles.genderText}>Male</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.genderButton,
                gender === "Female" && styles.selectedGender,
              ]}
              onPress={() => setGender("Female")}
            >
              <Text style={styles.genderText}>Female</Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* Height Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Height (cm)</Text>
          <TextInput
            style={styles.input}
            placeholder="180"
            keyboardType="numeric"
            value={height}
            onChangeText={setHeight}
          />
        </View>
        {/* Weight Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Weight (kg)</Text>
          <TextInput
            style={styles.input}
            placeholder="65"
            keyboardType="numeric"
            value={weight}
            onChangeText={setWeight}
          />
        </View>
        {/* Calculate Button */}
        <TouchableOpacity style={styles.calculateButton} onPress={calculateBMI}>
          <LinearGradient
            colors={["#f97316", "#ea580c"]}
            style={styles.gradientButton}
          >
            <Text style={styles.calculateButtonText}>Calculate</Text>
          </LinearGradient>
        </TouchableOpacity>
        {/* BMI Result */}
        {bmi && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultText}>Your BMI: {bmi}</Text>
            <Text style={[styles.resultLevel, getBmiLevelStyle(bmiLevel)]}>
              Level: {bmiLevel}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

interface StreakData {
  currentStreak: number;
  daysThisWeek: (boolean | null)[];
  lastUpdated: string;
}

interface SleepHistory {
  date: string;
  duration: string;
}

interface SleepData {
  lastSleepDuration: string;
  lastSleepDate: string;
  sleepHistory: SleepHistory[];
}

interface Quote {
  text: string;
  author: string;
}

const getBmiLevelStyle = (level: string): object => {
  switch (level) {
    case "Underweight":
      return styles.underweight;
    case "Normal":
      return styles.normal;
    case "Overweight":
      return styles.overweight;
    case "Obesity":
      return styles.obesity;
    default:
      return {};
  }
};

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
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1f2937",
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#ffffff",
  },
  note: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  genderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  genderButton: {
    flex: 1,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    marginHorizontal: 4,
    backgroundColor: "#ffffff",
  },
  selectedGender: {
    borderColor: "#f97316",
    backgroundColor: "#fff7ed",
  },
  genderText: {
    fontSize: 16,
    color: "#1f2937",
  },
  calculateButton: {
    width: "100%",
    marginTop: 16,
  },
  gradientButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
  },
  calculateButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
  },
  resultContainer: {
    marginTop: 24,
    alignItems: "center",
  },
  resultText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
  },
  resultLevel: {
    fontSize: 16,
    color: "#6b7280",
    marginTop: 8,
  },
  underweight: {
    color: "red",
  },
  normal: {
    color: "green",
  },
  overweight: {
    color: "orange",
  },
  obesity: {
    color: "red",
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
