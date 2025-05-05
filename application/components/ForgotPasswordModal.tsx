import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Alert
} from "react-native";
import api from '../api/axios';

interface ForgotPasswordModalProps {
  visible: boolean;
  onClose: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ visible, onClose }) => {
  const [email, setEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  
  const handleResetPassword = async (): Promise<void> => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }
    
    setIsLoading(true);
    setSuccessMessage("");
    
    try {
      // Using the correct path with the configured API
      const response = await api.post("password-reset/", { email });
      setSuccessMessage("Password reset link has been sent to your email");
    } catch (error: any) {
      console.log("Password reset error:", error);
      let errorMessage = "Failed to send reset link";
      
      if (error.response) {
        if (error.response.data && error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.status === 404) {
          errorMessage = "No user found with this email";
        } else if (error.response.status === 400) {
          errorMessage = "Invalid email format";
        }
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = "Network error - server not reachable";
      }
      
      Alert.alert("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleClose = () => {
    setEmail("");
    setSuccessMessage("");
    onClose();
  };
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Forgot Password</Text>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          {successMessage ? (
            <View style={styles.successContainer}>
              <Text style={styles.successMessage}>{successMessage}</Text>
              <TouchableOpacity 
                style={styles.modalButton}
                onPress={handleClose}
              >
                <Text style={styles.modalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={styles.modalSubtitle}>
                Enter your email address and we'll send you a link to reset your password.
              </Text>
              
              <TextInput
                style={styles.modalInput}
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              
              <TouchableOpacity 
                style={styles.modalButton}
                onPress={handleResetPassword}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.modalButtonText}>Send Reset Link</Text>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity onPress={handleClose}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 24,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  closeButton: {
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 18,
    color: "#666",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "gray",
    marginBottom: 16,
  },
  modalInput: {
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  modalButton: {
    width: "100%",
    height: 40,
    backgroundColor: "#f97316",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  modalButtonText: {
    color: "white",
    fontWeight: "500",
  },
  modalCancelText: {
    fontSize: 14,
    color: "orange",
    textAlign: "center",
    textDecorationLine: "underline",
  },
  successContainer: {
    alignItems: "center",
  },
  successMessage: {
    fontSize: 16,
    color: "#22c55e",
    textAlign: "center",
    marginBottom: 24,
  },
});

export default ForgotPasswordModal;