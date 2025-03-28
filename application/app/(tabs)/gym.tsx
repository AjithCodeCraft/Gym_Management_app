import React, { useState, useEffect } from "react";
import { ScrollView, Alert, View, Text, ActivityIndicator, StyleSheet } from "react-native";
import PlanCard from "@/components/gym/PlanCard";
import FeaturesCard from "@/components/gym/FeaturesCard";
import UpgradeOptionsModal from "@/components/gym/UpgradeOptionsModal";
import TrainerSelectionModal from "@/components/gym/TrainerSelectionModal";
import GymDetails from "@/components/gym/GymDetails";
import styles from "@/components/gym/styles"; // Ensure this import is correct
import { apiAuth } from "@/api/axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useTrainerData from "@/hooks/useTrainerData";

// Define Plan type
type Plan = {
   name: string;
   price: {
      monthly: number;
      quarterly: number;
      yearly: number;
   };
   features: string[];
   highlighted?: boolean;
};

// Define Trainer type
type Trainer = {
   id: number;
   name: string;
   specialization: string;
   experience: string;
   availability: string;
};

// Sample trainers data
const trainers = [
   { id: 1, name: "John Smith", specialization: "Weight Training", experience: "5 years", availability: "Morning" },
   { id: 2, name: "Sarah Johnson", specialization: "Cardio & HIIT", experience: "8 years", availability: "Evening" },
   { id: 3, name: "Mike Williams", specialization: "CrossFit", experience: "6 years", availability: "Afternoon" },
   { id: 4, name: "Emma Davis", specialization: "Yoga & Flexibility", experience: "7 years", availability: "Morning" },
   { id: 5, name: "David Chen", specialization: "Sports Conditioning", experience: "9 years", availability: "Evening" },
];

// Gym details
const gymDetails = {
   gymName: "Fitness Zone",
   address: "123 Fitness Street, Health City, IN",
   contactNumber: "+91-9876543210",
};

const Gym: React.FC = () => {
   const [daysUntilExpiry, setDaysUntilExpiry] = useState(0);
   const [showUpgradeOptions, setShowUpgradeOptions] = useState(false);
   const [showTrainerSelection, setShowTrainerSelection] = useState(false);
   const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
   const [billingCycle, setBillingCycle] = useState<"monthly" | "quarterly" | "yearly">("monthly");
   const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
   const [userPlan, setUserPlan] = useState<any>(null);
   const [plans, setPlans] = useState<Plan[]>([]);
   const [loading, setLoading] = useState(true); // State for loading indicator
   const [trainerDetails, setTrainerDetails] = useState<Trainer | null>(null); // State for trainer details
   const [allTrainers, setAllTrainers] = useState<TrainerType[]>([]);

   useTrainerData(setAllTrainers);

   useEffect(() => {
      const fetchSubscriptions = async () => {
         try {
            const response = await apiAuth.get("subscriptions/user/");
            const data = response.data;

            // Assuming the API response is an array of subscription objects
            const subscriptions = data;

            if (!Array.isArray(subscriptions)) {
               console.error("Expected subscriptions to be an array but got:", subscriptions);
               return;
            }

            // Extract user plan details from the first subscription object
            const userPlanData = subscriptions[0];

            // Set user plan
            setUserPlan({
               currentPlan: userPlanData.name, // Ensure this matches the plan name
               startDate: userPlanData.start_date,
               expiryDate: userPlanData.end_date,
               isActive: userPlanData.status === "active",
            });

            // Arrange plans based on duration
            const arrangedPlans: Plan[] = subscriptions.map((subscription: any) => {
               const price = { monthly: 0, quarterly: 0, yearly: 0 };
               if (subscription.duration === 1) price.monthly = subscription.price;
               if (subscription.duration === 3) price.quarterly = subscription.price; // Assuming 3 months for quarterly
               if (subscription.duration === 12) price.yearly = subscription.price;

               return {
                  name: subscription.name,
                  price,
                  features: subscription.features || [], // Assuming features might be missing
                  highlighted: subscription.highlighted || false,
               };
            });

            setPlans(arrangedPlans);

            // Calculate days until expiry
            const calculateDaysUntilExpiry = () => {
               const today = new Date();
               const expiry = new Date(userPlanData.end_date);
               const timeDiff = expiry.getTime() - today.getTime();
               const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
               return daysDiff;
            };

            setDaysUntilExpiry(calculateDaysUntilExpiry());

            // Fetch trainer details
            const trainerResponse = await apiAuth.get("assigned-trainer/user/");
            const trainerData = trainerResponse.data;

            setTrainerDetails({
               id: trainerData.trainer_id,
               name: trainerData.trainer_name,
               specialization: trainerData.specialization,
               experience: `${trainerData.experience} years`,
               availability: trainerData.availability,
            });

            // Store trainer_id in AsyncStorage
            await AsyncStorage.setItem("trainer_id", trainerData.trainer_id.toString());
            await AsyncStorage.setItem("trainer_name", trainerData.trainer_name);
         } catch (error) {
            console.error("Error fetching subscriptions or trainer details:", error);
         } finally {
            setLoading(false); // Stop loading indicator
         }
      };

      fetchSubscriptions();
   }, []);

   const handleUpgradeRequest = (plan: Plan) => {
      setSelectedPlan(plan);

      // If Elite plan is selected, show trainer selection
      if (plan.name === "Elite") {
         setShowTrainerSelection(true);
      } else {
         proceedToPayment(plan, null);
      }
   };

   const handleTrainerSelect = (trainer: Trainer) => {
      setSelectedTrainer(trainer);
      if (selectedPlan) {
         proceedToPayment(selectedPlan, trainer);
      }
   };

   const proceedToPayment = (plan: Plan, trainer: Trainer | null) => {
      // In a real app, this would initiate Razorpay integration
      Alert.alert(
         "Proceed to Payment",
         `You are about to upgrade to ${plan.name} plan for ₹${plan.price[billingCycle]} (${billingCycle}). ${
            trainer ? `\n\nYou have selected ${trainer.name} as your trainer.` : ""
         }\n\nClick OK to proceed to payment.`,
         [
            {
               text: "Cancel",
               style: "cancel",
               onPress: () => {
                  setShowTrainerSelection(false);
                  setSelectedTrainer(null);
               },
            },
            {
               text: "OK",
               onPress: () => {
                  // Here you would integrate with Razorpay
                  Alert.alert("Success", "Payment successful! Your plan has been upgraded.");
                  setShowTrainerSelection(false);
                  setShowUpgradeOptions(false);
                  setSelectedTrainer(null);
               },
            },
         ]
      );
   };

   if (loading) {
      return (
         <View style={localStyles.loadingContainer}>
            <ActivityIndicator size="large" color="orange" />
         </View>
      );
   }

   return (
      <ScrollView style={styles.container}>
         {userPlan && (
            <PlanCard
               userPlan={userPlan}
               daysUntilExpiry={daysUntilExpiry}
               onUpgradePress={() => setShowUpgradeOptions(true)}
            />
         )}

         {trainerDetails && (
            <FeaturesCard
               features={[
                  `Name: ${trainerDetails.name}`,
                  `Specialization: ${trainerDetails.specialization}`,
                  `Experience: ${trainerDetails.experience}`,
                  `Availability: ${
                     trainerDetails.availability.toLowerCase() === "both"
                        ? "Morning and Evening"
                        : trainerDetails.availability
                  }`,
               ]}
            />
         )}

         <GymDetails
            gymName={gymDetails.gymName}
            address={gymDetails.address}
            contactNumber={gymDetails.contactNumber}
            trainers={allTrainers}
         />

         <UpgradeOptionsModal
            visible={showUpgradeOptions}
            onClose={() => setShowUpgradeOptions(false)}
            plans={plans}
            billingCycle={billingCycle}
            setBillingCycle={setBillingCycle}
            onUpgradeRequest={handleUpgradeRequest}
            currentPlan={userPlan?.currentPlan}
         />

         <TrainerSelectionModal
            visible={showTrainerSelection}
            onClose={() => setShowTrainerSelection(false)}
            trainers={trainers}
            onTrainerSelect={handleTrainerSelect}
         />
      </ScrollView>
   );
};

const localStyles = StyleSheet.create({
   loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#fff", // Ensure the background color matches your app's theme
   },
});

export type TrainerType = {
   email: string;
   gender: string;
   id: number;
   name: string;
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

export default Gym;
