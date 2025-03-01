import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, FlatList } from 'react-native';

interface FoodSearchModalProps {
  visible: boolean;
  onClose: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: Array<{ id: string; name: string; calories: number; protein: number; carbs: number; fats: number }>;
  onAddFood: (food: { id: string; name: string; calories: number; protein: number; carbs: number; fats: number }) => void;
}

const FoodSearchModal: React.FC<FoodSearchModalProps> = ({ visible, onClose, searchQuery, setSearchQuery, searchResults, onAddFood }) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add Food</Text>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={(text) => setSearchQuery(text)}
            placeholder="Search foods..."
            autoFocus
          />
          <FlatList
            data={searchResults}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.searchResultItem} onPress={() => onAddFood(item)}>
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
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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

export default FoodSearchModal;
