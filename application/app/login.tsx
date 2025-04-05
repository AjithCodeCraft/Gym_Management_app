import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  Alert
} from "react-native";
import { Redirect } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from 'expo-constants';
import api from '../api/axios';
import ForgotPasswordModal from "@/components/ForgotPasswordModal";

const API_URL = Constants.expoConfig?.extra?.API_URL;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isForgotPasswordModalVisible, setIsForgotPasswordModalVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password!");
      return;
    }

    setIsLoading(true);
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
      await AsyncStorage.setItem("id", response.data.id.toString());
      setIsLoggedIn(true);
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert(
        "Invalid Credentials",
        "Please check your email and password!"
      );
    } finally {
      setIsLoading(false);
    }
  };

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
            source={require("../assets/images/g308.png")}
            style={styles.logo}
            resizeMode="contain"
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
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <View style={styles.passwordHeader}>
              <Text style={styles.inputLabel}>Password</Text>
              <TouchableOpacity
                onPress={() => setIsForgotPasswordModalVisible(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter your password"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                activeOpacity={0.7}
              >
                <MaterialIcons
                  name={showPassword ? "visibility-off" : "visibility"}
                  size={24}
                  color="#ccc"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[
              styles.loginButton,
              isLoading && styles.loginButtonDisabled
            ]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.7}
          >
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
          source={{ uri: "https://via.placeholder.com/1920x1080" }}
          style={styles.image}
          resizeMode="cover"
        />
      </View>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        visible={isForgotPasswordModalVisible}
        onClose={() => setIsForgotPasswordModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#fff",
  },
  loginForm: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  brandName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#f97316",
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
    color: "#333",
  },
  formSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f9f9f9",
    color: "#333",
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
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f9f9f9",
  },
  passwordInput: {
    flex: 1,
    height: 48,
    color: "#333",
  },
  forgotPasswordText: {
    fontSize: 14,
    color: "#f97316",
    textDecorationLine: "underline",
  },
  loginButton: {
    width: "100%",
    height: 48,
    backgroundColor: "#f97316",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    elevation: 2,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: "white",
    fontWeight: "500",
    fontSize: 16,
  },
  imageContainer: {
    flex: 1,
    display: "none", // Hidden on small screens
    backgroundColor: "#f5f5f5",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
