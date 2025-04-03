import { TrainerType } from "@/app/(tabs)/gym";
import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface GymDetailsProps {
   gymName: string;
   address: string;
   contactNumber: string;
   trainers: TrainerType[];
}

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

const GymDetails: React.FC<GymDetailsProps> = ({ gymName, address, contactNumber, trainers }) => {
   return (
      <View style={styles.gymDetailsContainer}>
         <Text style={styles.sectionHeader}>Gym Details</Text>
         <Text style={styles.gymName}>{gymName}</Text>
         <Text style={styles.address}>{address}</Text>
         <Text style={styles.contactNumber}>Contact Number: {contactNumber}</Text>
         <Text style={styles.sectionHeader}>Trainer Details</Text>
         {trainers.map((trainer) => (
            <View key={trainer.id} style={styles.trainerDetailsContainer}>
               <Text style={styles.trainerName}>{trainer.name}</Text>
               <Text style={styles.trainerSpecialization}>
                  Specialization: {capitalize(trainer.trainer_profile.specialization)}
               </Text>
               <Text style={styles.trainerExperience}>
                  Experience: {trainer.trainer_profile.experience_years} years
               </Text>
               <Text style={styles.trainerAvailability}>Availability: {trainer.trainer_profile.availability.toLowerCase() === "both"
                                       ? "Morning and Evening"
                                       : trainer.trainer_profile.availability}</Text>
            </View>
         ))}
      </View>
   );
};

const styles = StyleSheet.create({
   gymDetailsContainer: {
      backgroundColor: "#FFFFFF",
      borderRadius: 12,
      padding: 20,
      margin: 16,
      borderWidth: 1,
      borderColor: "#EEEEEE",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
   },
   sectionHeader: {
      fontSize: 18,
      fontWeight: "600",
      color: "#333333",
      marginBottom: 12,
   },
   gymName: {
      fontSize: 24,
      fontWeight: "bold",
      color: "#F96D00",
      marginBottom: 8,
   },
   address: {
      fontSize: 16,
      color: "#666666",
      marginBottom: 8,
   },
   contactNumber: {
      fontSize: 16,
      color: "#666666",
      marginBottom: 16,
   },
   trainerDetailsContainer: {
      marginBottom: 16,
      padding: 10,
      backgroundColor: "#fff",
      borderRadius: 8,
      // iOS Shadow
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      // Android Shadow
      elevation: 5,
   },
   trainerName: {
      fontSize: 18,
      fontWeight: "bold",
      color: "#333333",
      marginBottom: 4,
   },
   trainerSpecialization: {
      fontSize: 16,
      color: "#F96D00",
      marginBottom: 4,
   },
   trainerExperience: {
      fontSize: 16,
      color: "#666666",
      marginBottom: 4,
   },
   trainerAvailability: {
      fontSize: 16,
      color: "#666666",
   },
});

export default GymDetails;
