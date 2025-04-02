import React, { useState, useEffect } from "react";
import { ScrollView, Alert, View, ActivityIndicator, StyleSheet, Modal, Text, TouchableOpacity, Linking } from "react-native";
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
   id: number; // Assuming each plan has a unique identifier
   name: string; // The name of the plan, e.g., "Basic Plan", "Pro Plan", "Elite Plan"
   price: {
      monthly: number; // The monthly price of the plan
      quarterly: number; // The quarterly price of the plan
      yearly: number; // The yearly price of the plan
   };
   features: string[]; // An array of features included in the plan
   highlighted?: boolean; // Optional: Whether the plan is highlighted or not
};

// Define Trainer type
type Trainer = {
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
   const [filteredPlans, setFilteredPlans] = useState<Plan[]>([]);
   const [loading, setLoading] = useState(true); // State for loading indicator
   const [trainerDetails, setTrainerDetails] = useState<Trainer | null>(null); // State for trainer details
   const [allTrainers, setAllTrainers] = useState<Trainer[]>([]);
   const [paymentLink, setPaymentLink] = useState<string | null>(null);
   const [showPaymentModal, setShowPaymentModal] = useState(false);
   const [confirmingPayment, setConfirmingPayment] = useState(false); // State for confirming payment
   const [paymentSuccess, setPaymentSuccess] = useState(false); // State for payment success
   const [paymentLinkId, setPaymentLinkId] = useState<string | null>(null); // Store payment link ID
   const [paymentTimeout, setPaymentTimeout] = useState<NodeJS.Timeout | null>(null); // Store timeout ID
   const [showBillModal, setShowBillModal] = useState(false); // State for bill modal visibility
   const [paymentNotConfirmed, setPaymentNotConfirmed] = useState(false); // State for payment not confirmed

   useTrainerData(setAllTrainers);

   useEffect(() => {
      const fetchData = async () => {
         try {
            // Fetch user subscription details
            const userSubscriptionResponse = await apiAuth.get("subscriptions/user/");
            const userSubscriptionData = userSubscriptionResponse.data;

            if (!Array.isArray(userSubscriptionData)) {
               console.error("Expected user subscriptions to be an array but got:", userSubscriptionData);
               return;
            }

            // Extract user plan details from the first subscription object
            const userPlanData = userSubscriptionData[0];

            // Set user plan
            setUserPlan({
               currentPlan: userPlanData.name, // Ensure this matches the plan name
               startDate: userPlanData.start_date,
               expiryDate: userPlanData.end_date,
               isActive: userPlanData.status === "active",
               billingCycle: userPlanData.billing_cycle, // Add billing cycle to user plan
            });

            // Calculate days until expiry
            const calculateDaysUntilExpiry = () => {
               const today = new Date();
               const expiry = new Date(userPlanData.end_date);
               const timeDiff = expiry.getTime() - today.getTime();
               const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
               return daysDiff;
            };

            setDaysUntilExpiry(calculateDaysUntilExpiry());

            // Fetch all available plans
            const plansResponse = await apiAuth.get("subscriptions/");
            const plansData = plansResponse.data;

            if (!Array.isArray(plansData)) {
               console.error("Expected plans to be an array but got:", plansData);
               return;
            }

            // Arrange plans based on duration and include features
            const arrangedPlans: Plan[] = plansData.map((subscription: any) => {
               const price = { monthly: 0, quarterly: 0, yearly: 0 };
               if (subscription.duration === 1) price.monthly = subscription.price;
               if (subscription.duration === 3) price.quarterly = subscription.price; // Assuming 3 months for quarterly
               if (subscription.duration === 12) price.yearly = subscription.price;

               // Define features based on plan name and personal_training field
               let features :string[] = [];
               if (subscription.name === "Basic Plan") {
                  features = ["Access to gym facilities", "Basic equipment usage"];
               } else if (subscription.name === "Pro Plan") {
                  features = ["Access to all gym facilities", "Advanced equipment usage", "Group classes"];
               } else if (subscription.name === "Elite Plan") {
                  features = ["Access to all gym facilities", "Advanced equipment usage", "Group classes", "Priority booking"];
               }

               if (subscription.personal_training) {
                  features.push("Personal Training Available");
               }

               return {
                  id: subscription.id,
                  name: subscription.name,
                  price,
                  features,
                  highlighted: subscription.highlighted || false,
               };
            });

            setPlans(arrangedPlans);
            setFilteredPlans(arrangedPlans);

            // Fetch trainer details
            const trainerResponse = await apiAuth.get("assigned-trainer/user/");
            const trainerData = trainerResponse.data;

            setTrainerDetails({
               id: trainerData.trainer_id,
               name: trainerData.trainer_name,
               specialization: trainerData.specialization,
               experience: `${trainerData.experience} years`,
               availability: trainerData.availability,
               email: trainerData.email, // Ensure this is included in the response
               gender: trainerData.gender, // Ensure this is included in the response
               phone_number: trainerData.phone_number, // Ensure this is included in the response
               profile_picture_url: trainerData.profile_picture_url, // Ensure this is included in the response
               trainer_profile: {
                  availability: trainerData.availability,
                  experience_years: trainerData.experience_years,
                  qualifications: trainerData.qualifications,
                  salary: trainerData.salary,
                  specialization: trainerData.specialization,
               },
               user_id: trainerData.user_id, // Ensure this is included in the response
            });

            // Store trainer_id in AsyncStorage
            await AsyncStorage.setItem("trainer_id", trainerData.trainer_id.toString());
            await AsyncStorage.setItem("trainer_name", trainerData.trainer_name);
         } catch (error) {
            console.error("Error fetching data:", error);
         } finally {
            setLoading(false); // Stop loading indicator
         }
      };

      fetchData();
   }, []);

   useEffect(() => {
      // Filter and sort plans based on the selected billing cycle and exclude plans with price 0
      const filtered = plans
         .filter((plan) => plan.price[billingCycle] > 0)
         .sort((a, b) => a.price[billingCycle] - b.price[billingCycle]);
      setFilteredPlans(filtered);
   }, [billingCycle, plans]);

   const handleUpgradeRequest = (plan: Plan) => {
      setSelectedPlan(plan);
      // Show trainer selection only for "Pro Plan" and "Elite Plan"
      if (plan.name === "Pro Plan" || plan.name === "Elite Plan") {
         const filteredTrainers = allTrainers.filter((trainer) => {
            const experienceYears = parseInt(trainer.trainer_profile.experience_years, 10);
            if (plan.name === "Pro Plan") {
               return experienceYears < 3;
            } else if (plan.name === "Elite Plan") {
               return experienceYears >= 3;
            }
            return false;
         });
         setAllTrainers(filteredTrainers);
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

   const proceedToPayment = async (plan: Plan, trainer: Trainer | null) => {
      try {
         const response = await apiAuth.post("payment/generate/", {
            plan_id: plan.id, // Assuming plan has an id field
            trainer_id: trainer?.id || null,
            amount: plan.price[billingCycle],
            payment_method: "fortifit",
         });

         if (response.data.success) {
            setPaymentLink(response.data.payment_url);
            setPaymentLinkId(response.data.razorpay_payment_link_id); // Store payment link ID
            setShowPaymentModal(true);
         } else {
            Alert.alert("Error", response.data.message || "Failed to generate payment link.");
         }
      } catch (error) {
         console.error("Error generating payment link:", error);
         Alert.alert("Error", "Failed to generate payment link.");
      }
   };

   const handlePaymentConfirm = () => {
      if (paymentLink) {
         Linking.openURL(paymentLink);
         setConfirmingPayment(true);

         // Set a timeout to check payment status after 1 minute
         const timeout = setTimeout(async () => {
            try {
               const response = await apiAuth.post("payment/confirm/", {
                  payment_link_id: paymentLinkId,
               });

               if (response.status === 200 && response.data.payment_status === "confirmed") {
                  setPaymentSuccess(true);
                  setShowBillModal(true); // Show bill modal

                  // Send payment confirmation email
                  await apiAuth.post("send-payment-email/", {
                     selected_plan_name: selectedPlan?.name,
                     selected_plan_price: selectedPlan?.price[billingCycle],
                     billing_cycle: billingCycle,
                     selected_trainer_name: selectedTrainer?.name || null,
                     selected_trainer_specialization: selectedTrainer?.trainer_profile?.specialization || null,
                     selected_trainer_experience_years: selectedTrainer?.trainer_profile?.experience_years || null,
                     start_date: new Date().toLocaleDateString(),
                     end_date: new Date(new Date().setMonth(new Date().getMonth() +
                        (billingCycle === "monthly" ? 1 : billingCycle === "quarterly" ? 3 : billingCycle === "yearly" ? 12 : 0))
                     ).toLocaleDateString(),
                     purchase_date: new Date().toLocaleDateString(),
                  });

               } else if (response.status === 200 && response.data.message === "Payment not confirmed yet") {
                  
                  setShowPaymentModal(false);
               } else {

                  setShowPaymentModal(false);
               }
            } catch (error) {
               setShowPaymentModal(false);
            } finally {
               setConfirmingPayment(false);
            }
         }, 60000); // 1-minute delay

         setPaymentTimeout(timeout);
      }
   };

   const fetchUpdatedData = async () => {
      try {
         // Fetch updated user subscription details
         const userSubscriptionResponse = await apiAuth.get("subscriptions/user/");
         const userSubscriptionData = userSubscriptionResponse.data;

         if (!Array.isArray(userSubscriptionData)) {
            console.error("Expected user subscriptions to be an array but got:", userSubscriptionData);
            return;
         }

         // Extract user plan details from the first subscription object
         const userPlanData = userSubscriptionData[0];

         // Set user plan
         setUserPlan({
            currentPlan: userPlanData.name, // Ensure this matches the plan name
            startDate: userPlanData.start_date,
            expiryDate: userPlanData.end_date,
            isActive: userPlanData.status === "active",
            billingCycle: userPlanData.billing_cycle, // Add billing cycle to user plan
         });

         // Calculate days until expiry
         const calculateDaysUntilExpiry = () => {
            const today = new Date();
            const expiry = new Date(userPlanData.end_date);
            const timeDiff = expiry.getTime() - today.getTime();
            const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
            return daysDiff;
         };

         setDaysUntilExpiry(calculateDaysUntilExpiry());

         // Fetch updated trainer details
         const trainerResponse = await apiAuth.get("assigned-trainer/user/");
         const trainerData = trainerResponse.data;

         setTrainerDetails({
            id: trainerData.trainer_id,
            name: trainerData.trainer_name,
            specialization: trainerData.specialization,
            experience: `${trainerData.experience} years`,
            availability: trainerData.availability,
            email: trainerData.email, // Ensure this is included in the response
            gender: trainerData.gender, // Ensure this is included in the response
            phone_number: trainerData.phone_number, // Ensure this is included in the response
            profile_picture_url: trainerData.profile_picture_url, // Ensure this is included in the response
            trainer_profile: {
               availability: trainerData.availability,
               experience_years: trainerData.experience_years,
               qualifications: trainerData.qualifications,
               salary: trainerData.salary,
               specialization: trainerData.specialization,
            },
            user_id: trainerData.user_id, // Ensure this is included in the response
         });

         // Store trainer_id in AsyncStorage
         await AsyncStorage.setItem("trainer_id", trainerData.trainer_id.toString());
         await AsyncStorage.setItem("trainer_name", trainerData.trainer_name);

         // Fetch all available trainers
         const allTrainersResponse = await apiAuth.get("trainers/");
         const allTrainersData = allTrainersResponse.data;

         setAllTrainers(allTrainersData);
      } catch (error) {
         console.error("Error fetching updated data:", error);
      }
   };

   useEffect(() => {
      return () => {
         if (paymentTimeout) {
            clearTimeout(paymentTimeout);
            if (!paymentSuccess) {
               setPaymentNotConfirmed(true);
            }
         }
      };
   }, [paymentTimeout, paymentSuccess]);

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
            plans={filteredPlans}
            billingCycle={billingCycle}
            setBillingCycle={setBillingCycle}
            onUpgradeRequest={handleUpgradeRequest}
            currentPlan={userPlan?.currentPlan}
            userBillingCycle={userPlan?.billingCycle} // Pass the user's billing cycle
         />

         <TrainerSelectionModal
            visible={showTrainerSelection}
            onClose={() => setShowTrainerSelection(false)}
            trainers={allTrainers}
            onTrainerSelect={handleTrainerSelect}
         />

         <Modal visible={showPaymentModal} transparent={true} animationType="slide">
            <View style={localStyles.modalContainer}>
               <View style={localStyles.modalContent}>
                  {confirmingPayment ? (
                     <View style={localStyles.loadingContainer}>
                        <ActivityIndicator size="large" color="orange" />
                        <Text>Confirming Payment...</Text>
                     </View>
                  ) : paymentSuccess ? (
                     <View>
                        <Text style={localStyles.modalTitle}>Payment Successful</Text>
                        <Text>Plan: {selectedPlan?.name}</Text>
                        <Text>Amount: ₹{selectedPlan?.price[billingCycle]}</Text>
                        {selectedTrainer && (
                           <View>
                              <Text>Trainer: {selectedTrainer.name}</Text>
                              <Text>Specialization: {selectedTrainer.trainer_profile.specialization}</Text>
                              <Text>Experience: {selectedTrainer.trainer_profile.experience_years}</Text>
                           </View>
                        )}
                        <Text>Start Date: {new Date().toLocaleDateString()}</Text>
                        <Text>End Date: {new Date(new Date().setMonth(new Date().getMonth() + (billingCycle === 'monthly' ? 1 : billingCycle === 'quarterly' ? 3 : 12))).toLocaleDateString()}</Text>
                        <Text>Purchase Date: {new Date().toLocaleDateString()}</Text>
                        <TouchableOpacity style={localStyles.confirmButton} onPress={() => { setShowPaymentModal(false); fetchUpdatedData(); }}>
                           <Text style={localStyles.buttonText}>Close</Text>
                        </TouchableOpacity>
                     </View>
                  ) : (
                     <View>
                        <Text style={localStyles.modalTitle}>Confirm Payment</Text>
                        <Text>Plan: {selectedPlan?.name}</Text>
                        <Text>Amount: ₹{selectedPlan?.price[billingCycle]}</Text>
                        {selectedTrainer && (
                           <View>
                              <Text>Trainer: {selectedTrainer.name}</Text>
                              <Text>Specialization: {selectedTrainer.trainer_profile.specialization}</Text>
                              <Text>Experience: {selectedTrainer.trainer_profile.experience_years}</Text>
                           </View>
                        )}
                        <TouchableOpacity style={localStyles.confirmButton} onPress={handlePaymentConfirm}>
                           <Text style={localStyles.buttonText}>Confirm Payment</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={localStyles.cancelButton} onPress={() => setShowPaymentModal(false)}>
                           <Text style={localStyles.buttonText}>Cancel</Text>
                        </TouchableOpacity>
                     </View>
                  )}
               </View>
            </View>
         </Modal>

         {paymentNotConfirmed && (
            <Modal visible={paymentNotConfirmed} transparent={true} animationType="slide">
               <View style={localStyles.modalContainer}>
                  <View style={localStyles.modalContent}>
                     <Text style={localStyles.modalTitle}>Payment Not Confirmed</Text>
                     <Text>We were unable to confirm your payment. Please try again later.</Text>
                     <TouchableOpacity style={localStyles.confirmButton} onPress={() => setPaymentNotConfirmed(false)}>
                        <Text style={localStyles.buttonText}>Close</Text>
                     </TouchableOpacity>
                  </View>
               </View>
            </Modal>
         )}
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
   modalContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
   },
   modalContent: {
      width: "80%",
      backgroundColor: "white",
      padding: 20,
      borderRadius: 10,
      alignItems: "center",
   },
   modalTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 10,
   },
   confirmButton: {
      backgroundColor: "green",
      padding: 10,
      borderRadius: 5,
      marginTop: 20,
   },
   cancelButton: {
      backgroundColor: "red",
      padding: 10,
      borderRadius: 5,
      marginTop: 10,
   },
   buttonText: {
      color: "white",
      fontSize: 16,
   },
});

export type TrainerType = Trainer;

export default Gym;
