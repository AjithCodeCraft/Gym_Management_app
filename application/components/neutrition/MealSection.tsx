import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface MealSectionProps {
  title: string;
  mealItems: { name: string; calories: number }[];
  onAddFood: () => void;
}

const MealSection: React.FC<MealSectionProps> = ({ title, mealItems, onAddFood }) => {
  return (
    <View style={styles.mealSection}>
      <Text style={styles.mealTitle}>{title}</Text>
      {mealItems.length > 0 ? (
        <View style={styles.foodList}>
          {mealItems.map((food, index) => (
            <View key={index} style={styles.foodItem}>
              <Text style={styles.foodName}>{food.name}</Text>
              <Text style={styles.foodCalories}>{food.calories} cal</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.emptyMeal}>No foods added</Text>
      )}
      <TouchableOpacity style={styles.addFoodButton} onPress={onAddFood}>
        <Text style={styles.addFoodButtonText}>+ Add Food</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  mealSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  mealTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  emptyMeal: {
    fontSize: 14,
    color: '#95a5a6',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  foodList: {
    marginBottom: 8,
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  foodName: {
    fontSize: 14,
    color: '#34495e',
  },
  foodCalories: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  addFoodButton: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  addFoodButtonText: {
    color: '#3498db',
    fontWeight: '500',
  },
});

export default MealSection;
