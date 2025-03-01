import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TextInput, TouchableOpacity, ScrollView, Modal, FlatList } from 'react-native';

export default function Nutrition() {
  // State for user metrics and calculated targets
  const [userMetrics, setUserMetrics] = useState({
    height: '',
    weight: '',
    age: '',
    gender: 'male',
    activityLevel: 'moderate'
  });
  
  // Calculated nutrition targets
  const [nutritionTargets, setNutritionTargets] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0
  });
  
  // State for tracking if user has set up their metrics
  const [setupComplete, setSetupComplete] = useState(false);
  
  // State for meal tracking
  type FoodItem = {
    id: string;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };

  const [meals, setMeals] = useState<{
    breakfast: FoodItem[];
    morningSnack: FoodItem[];
    lunch: FoodItem[];
    eveningSnack: FoodItem[];
    dinner: FoodItem[];
  }>({
    breakfast: [],
    morningSnack: [],
    lunch: [],
    eveningSnack: [],
    dinner: []
  });
  
  // State for modals
  const [metricsModalVisible, setMetricsModalVisible] = useState(false);
  const [foodSearchModalVisible, setFoodSearchModalVisible] = useState(false);
  type MealType = 'breakfast' | 'morningSnack' | 'lunch' | 'eveningSnack' | 'dinner';
  const [currentMealType, setCurrentMealType] = useState<MealType>('breakfast');
  
  // Dummy food data (replace with API call later)
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const dummyFoods = [
    { id: '1', name: 'Oatmeal', calories: 150, protein: 6, carbs: 27, fats: 2.5 },
    { id: '2', name: 'Scrambled Eggs', calories: 140, protein: 12, carbs: 1, fats: 10 },
    { id: '3', name: 'Whole Wheat Toast', calories: 80, protein: 3, carbs: 15, fats: 1 },
    { id: '4', name: 'Banana', calories: 105, protein: 1.3, carbs: 27, fats: 0.4 },
    { id: '5', name: 'Greek Yogurt', calories: 100, protein: 17, carbs: 6, fats: 0.5 },
    { id: '6', name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fats: 3.6 },
    { id: '7', name: 'Brown Rice', calories: 215, protein: 5, carbs: 45, fats: 1.8 },
    { id: '8', name: 'Salmon', calories: 206, protein: 22, carbs: 0, fats: 13 },
    { id: '9', name: 'Avocado', calories: 240, protein: 3, carbs: 12, fats: 22 },
    { id: '10', name: 'Apple', calories: 95, protein: 0.5, carbs: 25, fats: 0.3 },
  ];
  
  // Calculate daily totals
  const [dailyTotals, setDailyTotals] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0
  });
  
  // Calculate daily totals when meals change
  useEffect(() => {
    let calories = 0, protein = 0, carbs = 0, fats = 0;
    
    Object.values(meals).forEach(mealArray => {
      mealArray.forEach(food => {
        calories += food.calories;
        protein += food.protein;
        carbs += food.carbs;
        fats += food.fats;
      });
    });
    
    setDailyTotals({
      calories,
      protein,
      carbs,
      fats
    });
  }, [meals]);
  
  // Calculate nutrition targets based on metrics
  const calculateNutritionTargets = () => {
    const { height, weight, age, gender, activityLevel } = userMetrics;
    
    // Basic BMR calculation using Mifflin-St Jeor Equation
    let bmr;
    if (gender === 'male') {
      bmr = 10 * parseFloat(weight) + 6.25 * parseFloat(height) - 5 * parseFloat(age) + 5;
    } else {
      bmr = 10 * parseFloat(weight) + 6.25 * parseFloat(height) - 5 * parseFloat(age) - 161;
    }
    
    // Activity multiplier
    let activityMultiplier;
    switch (activityLevel) {
      case 'sedentary': activityMultiplier = 1.2; break;
      case 'light': activityMultiplier = 1.375; break;
      case 'moderate': activityMultiplier = 1.55; break;
      case 'active': activityMultiplier = 1.725; break;
      case 'veryActive': activityMultiplier = 1.9; break;
      default: activityMultiplier = 1.55;
    }
    
    const calories = Math.round(bmr * activityMultiplier);
    const protein = Math.round(parseFloat(weight) * 1.6); // 1.6g per kg of bodyweight
    const fats = Math.round((calories * 0.25) / 9); // 25% of calories from fat
    const carbs = Math.round((calories - (protein * 4) - (fats * 9)) / 4); // Remaining calories from carbs
    
    setNutritionTargets({
      calories,
      protein,
      carbs,
      fats
    });
    
    setSetupComplete(true);
    setMetricsModalVisible(false);
  };
  
  // Search food function (will connect to API later)
  const searchFood = (query: string) => {
    if (query.trim() === '') {
      setSearchResults([]);
      return;
    }
    
    const results = dummyFoods.filter(food => 
      food.name.toLowerCase().includes(query.toLowerCase())
    );
    
    setSearchResults(results);
  };
  
  // Add food to meal
  const addFoodToMeal = (food: FoodItem) => {
    setMeals(prevMeals => ({
      ...prevMeals,
      [currentMealType]: [...prevMeals[currentMealType], food]
    }));
    
    setFoodSearchModalVisible(false);
    setSearchQuery('');
    setSearchResults([]);
  };
  
  // Open food search for specific meal
  const openFoodSearch = (mealType: MealType) => {
    setCurrentMealType(mealType);
    setFoodSearchModalVisible(true);
  };
  
  // Render meal section
  const renderMealSection = (title: string, mealType: MealType) => {
    const mealItems = meals[mealType];
    
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
        
        <TouchableOpacity 
          style={styles.addFoodButton}
          onPress={() => openFoodSearch(mealType)}
        >
          <Text style={styles.addFoodButtonText}>+ Add Food</Text>
        </TouchableOpacity>
      </View>
    );
  };
  
  // Current date
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  return (
    <View style={styles.container}>
      {/* Date header */}
      <View style={styles.header}>
        <Text style={styles.dateText}>{formattedDate}</Text>
        
        {setupComplete ? (
          <TouchableOpacity 
            style={styles.editMetricsButton}
            onPress={() => setMetricsModalVisible(true)}
          >
            <Text style={styles.editMetricsButtonText}>Edit Goals</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.setupButton}
            onPress={() => setMetricsModalVisible(true)}
          >
            <Text style={styles.setupButtonText}>Set Nutrition Goals</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* Nutrition summary */}
      {setupComplete && (
        <View style={styles.nutritionSummary}>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionLabel}>Calories</Text>
            <Text style={styles.nutritionValue}>{dailyTotals.calories} / {nutritionTargets.calories}</Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${Math.min(100, (dailyTotals.calories / nutritionTargets.calories) * 100)}%`,
                    backgroundColor: dailyTotals.calories > nutritionTargets.calories ? '#FF6B6B' : '#4CAF50'
                  }
                ]} 
              />
            </View>
          </View>
          
          <View style={styles.macroRow}>
            <View style={styles.macroItem}>
              <Text style={styles.macroLabel}>Protein</Text>
              <Text style={styles.macroValue}>{dailyTotals.protein}g / {nutritionTargets.protein}g</Text>
            </View>
            
            <View style={styles.macroItem}>
              <Text style={styles.macroLabel}>Carbs</Text>
              <Text style={styles.macroValue}>{dailyTotals.carbs}g / {nutritionTargets.carbs}g</Text>
            </View>
            
            <View style={styles.macroItem}>
              <Text style={styles.macroLabel}>Fats</Text>
              <Text style={styles.macroValue}>{dailyTotals.fats}g / {nutritionTargets.fats}g</Text>
            </View>
          </View>
        </View>
      )}
      
      {/* Meals tracking */}
      <ScrollView style={styles.mealsContainer}>
        {renderMealSection('Breakfast', 'breakfast')}
        {renderMealSection('Morning Snack', 'morningSnack')}
        {renderMealSection('Lunch', 'lunch')}
        {renderMealSection('Evening Snack', 'eveningSnack')}
        {renderMealSection('Dinner', 'dinner')}
      </ScrollView>
      
      {/* Metrics Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={metricsModalVisible}
        onRequestClose={() => setMetricsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set Your Nutrition Goals</Text>
            
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Height (cm):</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={userMetrics.height}
                onChangeText={(text) => setUserMetrics({...userMetrics, height: text})}
                placeholder="e.g. 175"
              />
            </View>
            
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Weight (kg):</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={userMetrics.weight}
                onChangeText={(text) => setUserMetrics({...userMetrics, weight: text})}
                placeholder="e.g. 70"
              />
            </View>
            
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Age:</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={userMetrics.age}
                onChangeText={(text) => setUserMetrics({...userMetrics, age: text})}
                placeholder="e.g. 30"
              />
            </View>
            
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Gender:</Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={[
                    styles.radioButton,
                    userMetrics.gender === 'male' && styles.radioButtonSelected
                  ]}
                  onPress={() => setUserMetrics({...userMetrics, gender: 'male'})}
                >
                  <Text
                    style={[
                      styles.radioButtonText,
                      userMetrics.gender === 'male' && styles.radioButtonTextSelected
                    ]}
                  >
                    Male
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.radioButton,
                    userMetrics.gender === 'female' && styles.radioButtonSelected
                  ]}
                  onPress={() => setUserMetrics({...userMetrics, gender: 'female'})}
                >
                  <Text
                    style={[
                      styles.radioButtonText,
                      userMetrics.gender === 'female' && styles.radioButtonTextSelected
                    ]}
                  >
                    Female
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Activity Level:</Text>
              <View style={styles.pickerContainer}>
                <TouchableOpacity
                  style={[
                    styles.pickerButton,
                    userMetrics.activityLevel === 'sedentary' && styles.pickerButtonSelected
                  ]}
                  onPress={() => setUserMetrics({...userMetrics, activityLevel: 'sedentary'})}
                >
                  <Text style={styles.pickerButtonText}>Sedentary</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.pickerButton,
                    userMetrics.activityLevel === 'light' && styles.pickerButtonSelected
                  ]}
                  onPress={() => setUserMetrics({...userMetrics, activityLevel: 'light'})}
                >
                  <Text style={styles.pickerButtonText}>Light</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.pickerButton,
                    userMetrics.activityLevel === 'moderate' && styles.pickerButtonSelected
                  ]}
                  onPress={() => setUserMetrics({...userMetrics, activityLevel: 'moderate'})}
                >
                  <Text style={styles.pickerButtonText}>Moderate</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.pickerButton,
                    userMetrics.activityLevel === 'active' && styles.pickerButtonSelected
                  ]}
                  onPress={() => setUserMetrics({...userMetrics, activityLevel: 'active'})}
                >
                  <Text style={styles.pickerButtonText}>Active</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.pickerButton,
                    userMetrics.activityLevel === 'veryActive' && styles.pickerButtonSelected
                  ]}
                  onPress={() => setUserMetrics({...userMetrics, activityLevel: 'veryActive'})}
                >
                  <Text style={styles.pickerButtonText}>Very Active</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setMetricsModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.saveButton}
                onPress={calculateNutritionTargets}
              >
                <Text style={styles.saveButtonText}>Calculate & Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Food Search Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={foodSearchModalVisible}
        onRequestClose={() => setFoodSearchModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Food to {currentMealType}</Text>
            
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                searchFood(text);
              }}
              placeholder="Search foods..."
              autoFocus
            />
            
            <FlatList
              data={searchResults}
              keyExtractor={item => item.id}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={styles.searchResultItem}
                  onPress={() => addFoodToMeal(item)}
                >
                  <View style={styles.searchResultContent}>
                    <Text style={styles.searchResultName}>{item.name}</Text>
                    <Text style={styles.searchResultDetails}>
                      {item.calories} cal · {item.protein}g protein · {item.carbs}g carbs · {item.fats}g fat
                    </Text>
                  </View>
                  <Text style={styles.searchResultAdd}>+</Text>
                </TouchableOpacity>
              )}
              style={styles.searchResultsList}
              ListEmptyComponent={
                searchQuery.trim() !== '' ? (
                  <Text style={styles.noResults}>No foods found</Text>
                ) : null
              }
            />
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setFoodSearchModalVisible(false);
                setSearchQuery('');
                setSearchResults([]);
              }}
            >
              <Text style={styles.closeButtonText}>Close</Text>
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
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  setupButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  setupButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  editMetricsButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  editMetricsButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  nutritionSummary: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  nutritionItem: {
    marginBottom: 10,
  },
  nutritionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  nutritionValue: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#ecf0f1',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  macroItem: {
    flex: 1,
    alignItems: 'center',
  },
  macroLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  macroValue: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  mealsContainer: {
    flex: 1,
  },
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
    textAlign: 'center',
  },
  inputRow: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#dcdde1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  radioGroup: {
    flexDirection: 'row',
  },
  radioButton: {
    borderWidth: 1,
    borderColor: '#dcdde1',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  radioButtonSelected: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  radioButtonText: {
    color: '#2c3e50',
  },
  radioButtonTextSelected: {
    color: 'white',
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  pickerButton: {
    borderWidth: 1,
    borderColor: '#dcdde1',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginRight: 6,
    marginBottom: 6,
  },
  pickerButtonSelected: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  pickerButtonText: {
    fontSize: 12,
    color: '#2c3e50',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  cancelButton: {
    backgroundColor: '#ecf0f1',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#7f8c8d',
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#dcdde1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 16,
  },
  searchResultsList: {
    maxHeight: 300,
  },
  searchResultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  searchResultContent: {
    flex: 1,
  },
  searchResultName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
  },
  searchResultDetails: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  searchResultAdd: {
    fontSize: 20,
    color: '#3498db',
    fontWeight: 'bold',
    paddingHorizontal: 10,
  },
  noResults: {
    textAlign: 'center',
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 20,
    fontStyle: 'italic',
  },
  closeButton: {
    backgroundColor: '#ecf0f1',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  closeButtonText: {
    color: '#7f8c8d',
    fontWeight: '500',
  },
});