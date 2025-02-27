import { Stack } from 'expo-router';
import { Redirect } from 'expo-router';
import "./globals.css";

export default function RootLayout() {
  const isLoggedIn = true; // Replace with your authentication logic

  if (!isLoggedIn) {
    return <Redirect href="/login" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false, // Hide header for all screens
      }}
    >
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}