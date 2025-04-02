import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal } from 'react-native';

interface Trainer {
  id: number;
   name: string;
   specialization: string;
   experience: string;
   availability: string;
   email: string;
   gender: string;
   phone_number: string;
   profile_picture_url: string | null;
   trainer_profile: {
      availability: string;
      experience_years: string;
      qualifications: string;
      salary: string;
      specialization: string;
   };
   user_id: string;
};

interface TrainerSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  trainers: Trainer[];
  onTrainerSelect: (trainer: Trainer) => void;
}

const TrainerSelectionModal: React.FC<TrainerSelectionModalProps> = ({
  visible,
  onClose,
  trainers,
  onTrainerSelect,
}) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlayContainer}>
        <View style={styles.trainerSelectionContainer}>
          <Text style={styles.trainerHeader}>Choose Your Personal Trainer</Text>
          <Text style={styles.trainerSubheader}>Your Elite plan includes a personal trainer. Select one to continue.</Text>

          <ScrollView style={styles.trainersScrollView} contentContainerStyle={styles.trainersScrollViewContent}>
            {trainers.map((trainer) => (
              <TouchableOpacity
                key={trainer.id}
                style={styles.trainerCard}
                onPress={() => onTrainerSelect(trainer)}
              >
                <View style={styles.trainerImagePlaceholder}>
                  <Text style={styles.trainerInitials}>{trainer.name.split(' ').map(n => n[0]).join('')}</Text>
                </View>
                <View style={styles.trainerInfo}>
                  <Text style={styles.trainerName}>{trainer.name}</Text>
                  <Text style={styles.trainerSpecialization}>{trainer.trainer_profile.specialization}</Text>
                  <View style={styles.trainerDetails}>
                    <Text style={styles.trainerExperience}>Exp: {trainer.trainer_profile.experience_years} years </Text>
                    <Text style={styles.trainerAvailability}>Availability: {trainer.trainer_profile.availability.toLowerCase() === "both"
                        ? "Morning and Evening"
                        : trainer.trainer_profile.availability}</Text>
                  </View>
                  <Text style={styles.selectTrainerText}>Tap to select</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={styles.backButton}
            onPress={onClose}
          >
            <Text style={styles.backButtonText}>Back to Plans</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trainerSelectionContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '90%',
  },
  trainerHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
    textAlign: 'center',
  },
  trainerSubheader: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 20,
    textAlign: 'center',
  },
  trainersScrollView: {
    maxHeight: 400,
  },
  trainersScrollViewContent: {
    paddingBottom: 20,
  },
  trainerCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trainerImagePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  trainerInitials: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F96D00',
  },
  trainerInfo: {
    flex: 1,
  },
  trainerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  trainerSpecialization: {
    fontSize: 16,
    color: '#F96D00',
    marginBottom: 8,
    fontWeight: '500',
  },
  trainerDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  trainerExperience: {
    fontSize: 14,
    color: '#666666',
  },
  trainerAvailability: {
    fontSize: 14,
    color: '#666666',
  },
  selectTrainerText: {
    fontSize: 14,
    color: '#F96D00',
    fontWeight: '500',
    textAlign: 'right',
    fontStyle: 'italic',
  },
  backButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#F96D00',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default TrainerSelectionModal;
