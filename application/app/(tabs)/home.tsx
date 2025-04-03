import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from "react-native";
import { PieChart } from "react-native-gifted-charts";
import { LinearGradient } from "expo-linear-gradient";
import { gymQuotes } from "../quotes";
import useStreakData from "@/hooks/useStreakData"; // Restored the original import
import LoadingSpinner from "@/components/LoadingSpinner"; // Restored the original import

// Types
type StreakDataType = {
  currentStreak: number;
  lastUpdated: string;
};

type QuoteType = {
  text: string;
  author: string;
};

type BMILevelType = "Underweight" | "Normal" | "Overweight" | "Obesity" | "";

// Component for the streak tracker section
const StreakTracker = ({ streakData, loading }: { streakData: StreakDataType; loading: boolean }) => {
  // Chart data for weekly attendance
  const chartData = [
    { value: 4, color: "#f97316", label: "Present" }, // Orange for present
    { value: 2, color: "#e5e7eb", label: "Absent" }, // Gray for absent
  ];

  const showStreakData = () => {
    return (
      <View style={styles.chartCenterText}>
        <Text style={styles.streakNumber}>
          {streakData.currentStreak}
          {streakData.currentStreak > 3 ? "🔥" : ""}
        </Text>
        <Text style={styles.streakLabel}>day streak</Text>
      </View>
    );
  };

  return (
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
          centerLabelComponent={loading ? () => <LoadingSpinner /> : showStreakData}
        />
      </View>
      <Text style={styles.lastUpdated}>Last updated: {streakData.lastUpdated}</Text>
    </View>
  );
};

// Component for the quote of the day section
const QuoteOfTheDay = ({ quote }: { quote: QuoteType }) => (
  <View style={styles.quoteSection}>
    <Text style={styles.quoteText}>"{quote.text}"</Text>
    <Text style={styles.quoteAuthor}>— {quote.author}</Text>
  </View>
);

// Component for BMI Calculator
const BMICalculator = () => {
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Male");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bmi, setBmi] = useState("");
  const [bmiLevel, setBmiLevel] = useState<BMILevelType>("");

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

  const getBmiLevelStyle = (level: BMILevelType): object => {
    switch (level) {
      case "Underweight": return styles.underweight;
      case "Normal": return styles.normal;
      case "Overweight": return styles.overweight;
      case "Obesity": return styles.obesity;
      default: return {};
    }
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>BMI Calculator</Text>
      
      <InputField 
        label="Age" 
        placeholder="25" 
        value={age}
        onChangeText={setAge}
        note="Ages: 2 - 120"
      />
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Gender</Text>
        <View style={styles.genderContainer}>
          <GenderButton 
            label="Male" 
            selected={gender === "Male"} 
            onPress={() => setGender("Male")} 
          />
          <GenderButton 
            label="Female" 
            selected={gender === "Female"} 
            onPress={() => setGender("Female")} 
          />
        </View>
      </View>
      
      <InputField 
        label="Height (cm)" 
        placeholder="180" 
        value={height}
        onChangeText={setHeight}
      />
      
      <InputField 
        label="Weight (kg)" 
        placeholder="65" 
        value={weight}
        onChangeText={setWeight}
      />
      
      <GradientButton label="Calculate" onPress={calculateBMI} />
      
      {bmi && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>Your BMI: {bmi}</Text>
          <Text style={[styles.resultLevel, getBmiLevelStyle(bmiLevel)]}>
            Level: {bmiLevel}
          </Text>
        </View>
      )}
    </View>
  );
};

// Helper components
const InputField = ({ label, placeholder, value, onChangeText, note }: { label: string; placeholder: string; value: string; onChangeText: (text: string) => void; note?: string }) => (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      keyboardType="numeric"
      value={value}
      onChangeText={onChangeText}
    />
    {note && <Text style={styles.note}>{note}</Text>}
  </View>
);

const GenderButton = ({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) => (
  <TouchableOpacity
    style={[styles.genderButton, selected && styles.selectedGender]}
    onPress={onPress}
  >
    <Text style={styles.genderText}>{label}</Text>
  </TouchableOpacity>
);

const GradientButton = ({ label, onPress }: { label: string; onPress: () => void }) => (
  <TouchableOpacity style={styles.calculateButton} onPress={onPress}>
    <LinearGradient colors={["#f97316", "#ea580c"]} style={styles.gradientButton}>
      <Text style={styles.calculateButtonText}>{label}</Text>
    </LinearGradient>
  </TouchableOpacity>
);

// Main component
export default function HomeScreen() {
  // Get the quote of the day
  const getQuoteOfTheDay = (): QuoteType => {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 0);
    const dayOfYear = Math.floor(
      (today.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)
    );
    const quoteIndex = dayOfYear % gymQuotes.length;
    return gymQuotes[quoteIndex];
  };

  // State for Streak Tracker - using the original hook
  const [streakData, setStreakData] = useState<StreakDataType>({
    currentStreak: 1,
    lastUpdated: new Date().toLocaleDateString(),
  });
  const [loading, setLoading] = useState<boolean>(true);

  // Use the original hook for streak data
  useStreakData(setStreakData, setLoading);

  const quoteOfDay = getQuoteOfTheDay();

  return (
    <ScrollView style={styles.container}>
      <StreakTracker streakData={streakData} loading={loading} />
      <QuoteOfTheDay quote={quoteOfDay} />
      <BMICalculator />
    </ScrollView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
    padding: 16,
  },
  section: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
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
    height: 48,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: "#ffffff",
    fontSize: 16,
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
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
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
    fontWeight: "500",
  },
  calculateButton: {
    width: "100%",
    marginTop: 16,
  },
  gradientButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: "center",
  },
  calculateButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
  resultContainer: {
    marginTop: 24,
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f8fafc",
    borderRadius: 10,
  },
  resultText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1f2937",
  },
  resultLevel: {
    fontSize: 18,
    fontWeight: "500",
    marginTop: 8,
  },
  underweight: {
    color: "#ef4444", // Red
  },
  normal: {
    color: "#10b981", // Green
  },
  overweight: {
    color: "#f97316", // Orange
  },
  obesity: {
    color: "#ef4444", // Red
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
    fontSize: 36,
    fontWeight: "700",
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
    padding: 20,
    backgroundColor: "#fff7ed",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quoteText: {
    fontSize: 18,
    fontStyle: "italic",
    color: "#1f2937",
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 26,
  },
  quoteAuthor: {
    fontSize: 16,
    fontWeight: "500",
    color: "#f97316",
    textAlign: "center",
  },
});