import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  // Simulate authentication check (e.g., checking AsyncStorage or an API)
  useEffect(() => {
    const checkAuth = async () => {
      // Replace this with your actual authentication logic
      const userIsLoggedIn = false; // Example: replace with real check
      setIsLoggedIn(userIsLoggedIn);
    };

    checkAuth();
  }, []);

  if (isLoggedIn === null) {
    // Show a loading indicator while checking auth status
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Redirect to the appropriate screen based on auth status
  return <Redirect href={isLoggedIn ? "/(tabs)/home" : "/login"} />;
}