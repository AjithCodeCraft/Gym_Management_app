import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface PlanCardProps {
  userPlan: {
    currentPlan: string;
    startDate: string;
    expiryDate: string;
    isActive: boolean;
  };
  daysUntilExpiry: number;
  onUpgradePress: () => void;
}

const PlanCard: React.FC<PlanCardProps> = ({
  userPlan,
  daysUntilExpiry,
  onUpgradePress,
}) => {
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <View style={styles.planCard}>
      <View style={styles.planHeaderContainer}>
        <Text style={styles.planHeader}>Your Current Plan</Text>
        <View
          style={[
            styles.statusBadge,
            userPlan.isActive ? styles.activeBadge : styles.inactiveBadge,
          ]}
        >
          <Text style={styles.statusText}>
            {userPlan.isActive ? "ACTIVE" : "INACTIVE"}
          </Text>
        </View>
      </View>

      <Text style={styles.planName}>{userPlan.currentPlan}</Text>

      <View style={styles.dateContainer}>
        <View style={styles.dateItem}>
          <Text style={styles.dateLabel}>Started On</Text>
          <Text style={styles.dateValue}>{formatDate(userPlan.startDate)}</Text>
        </View>
        <View style={styles.dateItem}>
          <Text style={styles.dateLabel}>Expires On</Text>
          <Text
            style={[
              styles.dateValue,
              daysUntilExpiry <= 3 ? styles.expiryRedText : null,
            ]}
          >
            {formatDate(userPlan.expiryDate)}
          </Text>
        </View>
      </View>

      <View style={styles.expiryInfoContainer}>
        {daysUntilExpiry <= 3 ? (
          daysUntilExpiry <= 0 ? (
            <View style={styles.expiryAlertBox}>
              <Text style={styles.expiryWarning}>
                ⚠️ Your plan has expired!
              </Text>
              <Text style={styles.expirySubtext}>
                Please renew or upgrade your plan!
              </Text>
            </View>
          ) : (
            <View style={styles.expiryAlertBox}>
              <Text style={styles.expiryWarning}>
                ⚠️ Your plan expires in {daysUntilExpiry} days!
              </Text>
              <Text style={styles.expirySubtext}>
                Upgrade now to avoid interruption in service
              </Text>
            </View>
          )
        ) : (
          <Text style={styles.expiryInfo}>
            {daysUntilExpiry} days remaining in your plan
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={[
          styles.upgradeButton,
          daysUntilExpiry <= 3 ? styles.urgentUpgradeButton : null,
        ]}
        onPress={onUpgradePress}
      >
        <Text style={styles.upgradeButtonText}>
          {daysUntilExpiry <= 3 ? "Upgrade Now" : "View Upgrade Options"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  planCard: {
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
  planHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  planHeader: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadge: {
    backgroundColor: "#E8F5E9",
  },
  inactiveBadge: {
    backgroundColor: "#FFEBEE",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#333333",
  },
  planName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#F96D00",
    marginBottom: 16,
  },
  dateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  dateItem: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333333",
  },
  expiryRedText: {
    color: "#E53935",
    fontWeight: "bold",
  },
  expiryInfoContainer: {
    marginBottom: 16,
  },
  expiryAlertBox: {
    backgroundColor: "#FFEBEE",
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#E53935",
  },
  expiryWarning: {
    fontSize: 16,
    color: "#E53935",
    fontWeight: "600",
  },
  expirySubtext: {
    fontSize: 14,
    color: "#E53935",
    marginTop: 4,
  },
  expiryInfo: {
    fontSize: 16,
    color: "#666666",
  },
  upgradeButton: {
    backgroundColor: "#F96D00",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  urgentUpgradeButton: {
    backgroundColor: "#E53935",
  },
  upgradeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default PlanCard;
