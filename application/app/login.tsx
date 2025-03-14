import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, Alert, Modal, StyleSheet, ActivityIndicator } from "react-native";
import { Redirect } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons"; // For icons
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from 'expo-constants';
import api from '../api/axios';
const API_URL = Constants.expoConfig?.extra?.API_URL;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isForgotPasswordModalVisible, setIsForgotPasswordModalVisible] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false); // State for password visibility
  const [isLoading, setIsLoading] = useState(false); // State for loading animation

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password!");
      return;
    }
    setIsLoading(true); // Start loading animation
    const credentials = {
      email: email,
      password: password
    };
    try {
        const response = await api.post(`/login/`, credentials, {
          headers: {
            "Content-Type": "application/json"
          }
        });
        await AsyncStorage.setItem("access_token", response.data.access);
        setIsLoggedIn(true);
    } catch (error) {
        Alert.alert(
            "Invalid Credentials",
            `Please check your email and password!`
        );
    } finally {
        setIsLoading(false); // Stop loading animation
    }
  };

  const handleForgotPassword = () => {
    // Dummy logic to send reset link
    if (forgotPasswordEmail) {
      Alert.alert("Reset Link Sent", `A reset link has been sent to ${forgotPasswordEmail}`);
      setIsForgotPasswordModalVisible(false);
    } else {
      Alert.alert("Error", "Please enter your email address.");
    }
  };

  // Redirect to home tab if logged in
  if (isLoggedIn) {
    return <Redirect href="/(tabs)/home" />;
  }

  return (
    <View style={styles.container}>
      {/* Left Side - Login Form */}
      <View style={styles.loginForm}>
        {/* Logo and Brand Name */}
        <View style={styles.logoContainer}>
          <Image
            source={require("../assets/images/g308.png")} // Replace with your image path
            style={styles.logo}
          />
          <Text style={styles.brandName}>FORTiFit.</Text>
        </View>

        {/* Login Form */}
        <View style={styles.formContainer}>
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>Login to your account</Text>
            <Text style={styles.formSubtitle}>
              Enter your email below to login to your account
            </Text>
          </View>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="m@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <View style={styles.passwordHeader}>
              <Text style={styles.inputLabel}>Password</Text>
              <TouchableOpacity onPress={() => setIsForgotPasswordModalVisible(true)}>
                <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <MaterialIcons
                  name={showPassword ? "visibility-off" : "visibility"}
                  size={24}
                  color="#ccc"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Login Button */}
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>

        </View>
      </View>

      {/* Right Side - Image (Hidden on small screens) */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: "https://via.placeholder.com/1920x1080" }} // Replace with your image URL
          style={styles.image}
        />
      </View>

      {/* Forgot Password Modal */}
      <Modal
        visible={isForgotPasswordModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsForgotPasswordModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Forgot Password</Text>
            <Text style={styles.modalSubtitle}>
              Enter your email address and we'll send you a link to reset your password.
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter your email"
              value={forgotPasswordEmail}
              onChangeText={setForgotPasswordEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.modalButton} onPress={handleForgotPassword}>
              <Text style={styles.modalButtonText}>Send Reset Link</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsForgotPasswordModalVisible(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
  },
  loginForm: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center", // Center the logo and brand name
    marginBottom: 32,
  },
  logo: {
    width: 80, // Adjust the width of the logo
    height: 80, // Adjust the height of the logo
    marginBottom: 16, // Space between logo and brand name
  },
  brandName: {
    fontSize: 24, // Increase font size for brand name
    fontWeight: "bold", // Make it bold
    color: "#f97316", // Brand color
  },
  formContainer: {
    width: "100%",
    maxWidth: 320,
    alignSelf: "center",
  },
  formHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 14,
    color: "gray",
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  passwordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  passwordInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  passwordInput: {
    flex: 1,
    height: 40,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: "#f97316",
    textDecorationLine: "underline",
  },
  loginButton: {
    width: "100%",
    height: 40,
    backgroundColor: "#f97316",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  loginButtonText: {
    color: "white",
    fontWeight: "500",
  },
  imageContainer: {
    flex: 1,
    display: "none", // Hidden on small screens
  },
  image: {
    width: "100%",
    height: "100%",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Dimmed background
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "gray",
    marginBottom: 16,
  },
  modalInput: {
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  modalButton: {
    width: "100%",
    height: 40,
    backgroundColor: "#f97316",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  modalButtonText: {
    color: "white",
    fontWeight: "500",
  },
  modalCancelText: {
    fontSize: 14,
    color: "orange",
    textAlign: "center",
    textDecorationLine: "underline",
  },
});