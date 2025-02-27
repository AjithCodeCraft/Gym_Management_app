import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, Alert } from "react-native";
import { Redirect } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons"; // For icons

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    // Dummy login logic
    if (email === "ajith@gmail.com" && password === "ajith") {
      setIsLoggedIn(true); // Set login state to true
    } else {
      Alert.alert("Invalid Credentials", "Please check your email and password.");
    }
  };

  // Redirect to home tab if logged in
  if (isLoggedIn) {
    return <Redirect href="/(tabs)/home" />;
  }

  return (
    <View className="h-screen flex flex-col lg:flex-row">
      {/* Left Side - Login Form */}
      <View className="flex-1 p-6 md:p-10 justify-center">
        {/* Logo and Brand Name */}
        <View className="flex-row justify-center md:justify-start items-center mb-8">
          <View className="w-6 h-6 rounded-md bg-orange-500 justify-center items-center mr-2">
            <MaterialIcons name="dashboard" size={16} color="white" />
          </View>
          <Text className="text-lg font-medium">Acme Inc.</Text>
        </View>

        {/* Login Form */}
        <View className="w-full max-w-xs mx-auto">
          <View className="items-center mb-6">
            <Text className="text-2xl font-bold mb-2">Login to your account</Text>
            <Text className="text-sm text-gray-500 text-center">
              Enter your email below to login to your account
            </Text>
          </View>

          {/* Email Input */}
          <View className="mb-4">
            <Text className="text-sm font-medium mb-1">Email</Text>
            <TextInput
              className="h-10 border border-gray-300 rounded-md px-3"
              placeholder="m@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Password Input */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-1">
              <Text className="text-sm font-medium">Password</Text>
              <TouchableOpacity>
                <Text className="text-sm text-orange-500 underline">Forgot your password?</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              className="h-10 border border-gray-300 rounded-md px-3"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {/* Login Button */}
          <TouchableOpacity
            className="w-full h-10 bg-orange-500 rounded-md justify-center items-center"
            onPress={handleLogin}
          >
            <Text className="text-white font-medium">Login</Text>
          </TouchableOpacity>

          {/* Sign Up Link */}
          <View className="flex-row justify-center mt-6">
            <Text className="text-sm text-gray-500">Don't have an account? </Text>
            <TouchableOpacity>
              <Text className="text-sm text-orange-500 underline">Sign up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Right Side - Image (Hidden on small screens) */}
      <View className="hidden lg:flex flex-1">
        <Image
          source={{ uri: "https://via.placeholder.com/1920x1080" }} // Replace with your image URL
          className="w-full h-full"
        />
      </View>
    </View>
  );
}