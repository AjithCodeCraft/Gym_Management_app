import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal } from 'react-native';

interface MetricsModalProps {
  visible: boolean;
  onClose: () => void;
  userMetrics: {
    height: string;
    weight: string;
    age: string;
    gender: string;
    activityLevel: string;
  };
  setUserMetrics: (metrics: {
    height: string;
    weight: string;
    age: string;
    gender: string;
    activityLevel: string;
  }) => void;
  onSave: () => void;
}

const MetricsModal: React.FC<MetricsModalProps> = ({ visible, onClose, userMetrics, setUserMetrics, onSave }) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
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
                  userMetrics.activityLevel === 'very_active' && styles.pickerButtonSelected
                ]}
                onPress={() => setUserMetrics({...userMetrics, activityLevel: 'very_active'})}
              >
                <Text style={styles.pickerButtonText}>Very Active</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={onSave}>
              <Text style={styles.saveButtonText}>Calculate & Save</Text>
            </TouchableOpacity>
          </View>
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
});

export default MetricsModal;
