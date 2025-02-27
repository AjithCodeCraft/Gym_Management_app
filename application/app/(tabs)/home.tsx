import React from 'react';
import { View, Text, ScrollView } from 'react-native';

export default function HomeScreen() {
  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        <Text className="text-2xl font-bold text-gray-800">Welcome to FitTrack</Text>
        {/* Your home screen content here */}
      </View>
    </ScrollView>
  );
}