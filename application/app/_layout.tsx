// app/_layout.tsx
import { Stack } from "expo-router";
import { Redirect } from "expo-router";
import "./globals.css";

export default function RootLayout() {
  const isLoggedIn = true; // Replace with your actual authentication logic

  if (!isLoggedIn) {
    return <Redirect href="/login" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false, // Hide header for all screens
      }}
    >
      {/* Ensure this name matches the actual file in app/UserProfile.tsx */}
      <Stack.Screen name="UserProfile" options={{ title: "Profile" }} />
      <Stack.Screen name="Chat" />

     

      {/* Main Tab Screens */}
      <Stack.Screen name="(tabs)" />

    </Stack>
  );
}
