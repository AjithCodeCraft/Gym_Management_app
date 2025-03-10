import React, { useState, useEffect } from 'react';
import { ScrollView, Alert } from 'react-native';
// import PlanCard from './PlanCard';
// import FeaturesCard from './FeaturesCard';
// import UpgradeOptionsModal from './UpgradeOptionsModal';
// import TrainerSelectionModal from './TrainerSelectionModal';
// import GymDetails from './GymDetails';
// import styles from './styles';
import PlanCard from '@/components/gym/PlanCard';
import FeaturesCard from '@/components/gym/FeaturesCard';
import UpgradeOptionsModal from '@/components/gym/UpgradeOptionsModal';
import TrainerSelectionModal from '@/components/gym/TrainerSelectionModal';
import styles from '@/components/gym/styles';
import GymDetails from '@/components/gym/GymDetails';

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

// Sample user plan data (would come from your backend in a real app)
const userPlan = {
  currentPlan: "Basic",
  startDate: "2025-01-15",
  expiryDate: "2025-03-10", // Set close to current date to show expiry warning
  isActive: true,
};

// Plans data
const plans = [
  {
    name: "Basic",
    price: { monthly: 999, quarterly: 2499, yearly: 8999 },
    features: [
      "Access to gym floor",
      "Locker facility",
      "Cardio & strength training",
      "No personal trainer",
    ],
  },
  {
    name: "Pro",
    price: { monthly: 1999, quarterly: 5499, yearly: 17999 },
    features: [
      "All Basic plan benefits",
      "Personalized workout plan",
      "Group training sessions",
      "Priority locker access",
    ],
    highlighted: true,
  },
  {
    name: "Elite",
    price: { monthly: 2999, quarterly: 7999, yearly: 24999 },
    features: [
      "All Pro plan benefits",
      "1-on-1 Personal Trainer",
      "Diet consultation",
      "Unlimited guest passes",
    ],
  },
];

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

  useEffect(() => {
    // Calculate days until expiry
    const calculateDaysUntilExpiry = () => {
      const today = new Date();
      const expiry = new Date(userPlan.expiryDate);
      const timeDiff = expiry.getTime() - today.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      return daysDiff;
    };

    setDaysUntilExpiry(calculateDaysUntilExpiry());
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
        trainer ? `\n\nYou have selected ${trainer.name} as your trainer.` : ''
      }\n\nClick OK to proceed to payment.`,
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => {
            setShowTrainerSelection(false);
            setSelectedTrainer(null);
          }
        },
        {
          text: "OK",
          onPress: () => {
            // Here you would integrate with Razorpay
            Alert.alert("Success", "Payment successful! Your plan has been upgraded.");
            setShowTrainerSelection(false);
            setShowUpgradeOptions(false);
            setSelectedTrainer(null);
          }
        }
      ]
    );
  };

  // Find current plan details
  const currentPlanDetails = plans.find(plan => plan.name === userPlan.currentPlan);

  return (
    <ScrollView style={styles.container}>
      <PlanCard
        userPlan={userPlan}
        daysUntilExpiry={daysUntilExpiry}
        onUpgradePress={() => setShowUpgradeOptions(true)}
      />

      {currentPlanDetails && <FeaturesCard features={currentPlanDetails.features} />}

      <GymDetails
        gymName={gymDetails.gymName}
        address={gymDetails.address}
        contactNumber={gymDetails.contactNumber}
        trainers={trainers}
      />

      <UpgradeOptionsModal
        visible={showUpgradeOptions}
        onClose={() => setShowUpgradeOptions(false)}
        plans={plans}
        billingCycle={billingCycle}
        setBillingCycle={setBillingCycle}
        onUpgradeRequest={handleUpgradeRequest}
        currentPlan={userPlan.currentPlan}
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

export default Gym;
