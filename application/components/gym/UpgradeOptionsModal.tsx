import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal } from 'react-native';

interface Plan {
  id: number;
  name: string;
  price: {
    monthly: number;
    quarterly: number;
    yearly: number;
  };
  features: string[];
  highlighted?: boolean;
}

interface UpgradeOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  plans: Plan[];
  billingCycle: 'monthly' | 'quarterly' | 'yearly';
  setBillingCycle: (cycle: 'monthly' | 'quarterly' | 'yearly') => void;
  onUpgradeRequest: (plan: Plan) => void;
  currentPlan: string;
  userBillingCycle: 'monthly' | 'quarterly' | 'yearly'; // Add this prop
}

const UpgradeOptionsModal: React.FC<UpgradeOptionsModalProps> = ({
  visible,
  onClose,
  plans,
  billingCycle,
  setBillingCycle,
  onUpgradeRequest,
  currentPlan,
  userBillingCycle, // Use this prop
}) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlayContainer}>
        <View style={styles.upgradeOptionsContainer}>
          <Text style={styles.upgradeHeader}>Upgrade Your Fitness Journey</Text>

          {/* Billing Cycle Selector */}
          <View style={styles.billingCycleContainer}>
            {["monthly", "quarterly", "yearly"].map((cycle) => (
              <TouchableOpacity
                key={cycle}
                style={[styles.cycleButton, billingCycle === cycle ? styles.cycleButtonActive : null]}
                onPress={() => setBillingCycle(cycle as 'monthly' | 'quarterly' | 'yearly')}
              >
                <Text style={[styles.cycleButtonText, billingCycle === cycle ? styles.cycleButtonTextActive : null]}>
                  {cycle.charAt(0).toUpperCase() + cycle.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Plan Options */}
          <ScrollView style={styles.plansScrollView} contentContainerStyle={styles.plansScrollViewContent}>
            {plans.map((plan, index) => (
              <View
                key={index}
                style={[
                  styles.planOption,
                  plan.highlighted ? styles.highlightedPlan : null,
                  plan.name === currentPlan && billingCycle === userBillingCycle ? styles.currentPlanOption : null, // Highlight current plan
                ]}
              >
                {plan.highlighted && (
                  <View style={styles.recommendedBadge}>
                    <Text style={styles.recommendedText}>RECOMMENDED</Text>
                  </View>
                )}

                <Text style={styles.planOptionName}>{plan.name}</Text>
                <Text style={styles.planOptionPrice}>
                  ₹{plan.price[billingCycle]}
                  <Text style={styles.planPricePeriod}>/{billingCycle}</Text>
                </Text>

                <View style={styles.planFeaturesList}>
                  {plan.features.map((feature, idx) => (
                    <View key={idx} style={styles.planFeatureItem}>
                      <Text style={styles.planFeatureBullet}>✓</Text>
                      <Text style={styles.planFeatureText}>{feature}</Text>
                    </View>
                  ))}
                </View>

                {plan.name !== currentPlan || billingCycle !== userBillingCycle ? (
                  <TouchableOpacity
                    style={styles.buyNowButton}
                    onPress={() => onUpgradeRequest(plan)}
                  >
                    <Text style={styles.buyNowButtonText}>Buy Now</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.currentPlanLabel}>
                    <Text style={styles.currentPlanLabelText}>Current Plan</Text>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>Close</Text>
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
  upgradeOptionsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '90%',
  },
  upgradeHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
    textAlign: 'center',
  },
  billingCycleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    backgroundColor: '#F5F5F5',
    borderRadius: 24,
    padding: 4,
  },
  cycleButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 24,
  },
  cycleButtonActive: {
    backgroundColor: '#F96D00',
  },
  cycleButtonText: {
    color: '#666666',
    fontWeight: '500',
  },
  cycleButtonTextActive: {
    color: '#FFFFFF',
  },
  plansScrollView: {
    maxHeight: 500,
  },
  plansScrollViewContent: {
    paddingBottom: 20,
  },
  planOption: {
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
    position: 'relative',
  },
  highlightedPlan: {
    borderColor: '#F96D00',
    borderWidth: 2,
  },
  currentPlanOption: {
    opacity: 0.7,
  },
  recommendedBadge: {
    position: 'absolute',
    top: -10,
    right: 10,
    backgroundColor: '#F96D00',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recommendedText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  planOptionName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  planOptionPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F96D00',
    marginBottom: 16,
  },
  planPricePeriod: {
    fontSize: 14,
    color: '#666666',
    fontWeight: 'normal',
  },
  planFeaturesList: {
    marginBottom: 16,
  },
  planFeatureItem: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center',
  },
  planFeatureBullet: {
    color: '#F96D00',
    fontSize: 16,
    marginRight: 8,
    fontWeight: 'bold',
  },
  planFeatureText: {
    fontSize: 14,
    color: '#666666',
  },
  buyNowButton: {
    backgroundColor: '#F96D00',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buyNowButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  currentPlanLabel: {
    backgroundColor: '#E0E0E0',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  currentPlanLabelText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default UpgradeOptionsModal;
