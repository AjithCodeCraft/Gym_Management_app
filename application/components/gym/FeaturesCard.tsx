import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface FeaturesCardProps {
  features: string[];
}

const FeaturesCard: React.FC<FeaturesCardProps> = ({ features }) => {
  return (
    <View style={styles.featuresCard}>
      <Text style={styles.featuresHeader}>Your Plan Features</Text>
      {features.map((feature, index) => (
        <View key={index} style={styles.featureItem}>
          <Text style={styles.bulletPoint}>•</Text>
          <Text style={styles.featureText}>{feature}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  featuresCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    margin: 16,
    marginTop: 0,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featuresHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center',
  },
  bulletPoint: {
    color: '#F96D00',
    fontSize: 18,
    marginRight: 8,
  },
  featureText: {
    fontSize: 16,
    color: '#666666',
  },
});

export default FeaturesCard;
