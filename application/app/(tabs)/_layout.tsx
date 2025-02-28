import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar, View } from 'react-native';
import AppBar from '@/components/app-bar';
const statusBarHeight = StatusBar.currentHeight || 0;  // fallback to 0 for iOS

export default function TabLayout() {
  return (
    <View style={{ flex: 1 }}>
      {/* Gradient Top Bar / Status Bar area */}

<LinearGradient
  colors={['#f97316', '#ea580c', '#c2410c']}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 0 }}
  style={{
    // paddingTop: statusBarHeight,
    // height: statusBarHeight +12,  // adjust to fit your AppBar height
  }}
>
  <StatusBar backgroundColor="#f97316" barStyle="light-content" />
  <AppBar />
</LinearGradient>



      {/* Tabs Below */}
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#f97316',
          tabBarInactiveTintColor: 'gray',
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: 'Home',
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="workout"
          options={{
            title: 'Workout',
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="barbell" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="nutrition"
          options={{
            title: 'Nutrition',
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="nutrition" size={size} color={color} />
            ),
          }}
        />
         <Tabs.Screen
          name="sleepTracker"
          options={{
            title: 'Sleep',
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="bed-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="gym"
          options={{
            title: 'Gym',
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="location" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}
