"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { User, Plus, ArrowLeft, Mail, Send } from "lucide-react";
import api from "../../../api/axios";
import AdminSidebar from "../sidebar";
import Navbar from "../navbar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";

const AddTrainer = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_number: "",
    gender: "male",
    specialization: "",
    availability: "both",
    experience_years: "",
    qualifications: "",
    salary: "",
    date_of_birth: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // OTP-related states
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [isOtpDialogOpen, setIsOtpDialogOpen] = useState(false);
  const [otpButtonText, setOtpButtonText] = useState("Get OTP");
  const [otpButtonColor, setOtpButtonColor] = useState("bg-[#ea580c]");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle availability selection
  const handleAvailabilityChange = (value) => {
    setFormData({ ...formData, availability: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    if (!otpVerified) {
      setError("Please verify your email with OTP.");
      setLoading(false);
      return;
    }

    // Format the phone number to E.164 format
    const formattedPhoneNumber = `+91${formData.phone_number}`;

    try {
      const response = await api.post("register/", {
        ...formData,
        phone_number: formattedPhoneNumber, // Use the formatted phone number
        user_type: "trainer",
      });

      if (response.data.success) {
        setSuccessMessage("Trainer added successfully! Login credentials sent to their email.");
        setTimeout(() => {
          router.push("/trainers");
        }, 3000);
      } else {
        setError(response.data.message || "Failed to add trainer.");
      }
    } catch (err) {
      console.log("Add Trainer Error:", err);
      setError(err.response?.data?.message || "phone number Already exist .");
    } finally {
      setLoading(false);
    }
  };

  // OTP Functions (API-based)
  const handleGetOtp = async () => {
    if (!formData.email) {
      setOtpError("Please enter an email address first.");
      return;
    }

    setSendingOtp(true);
    setOtpButtonText("Sending...");

    try {
      const response = await api.post("send-otp/", { email: formData.email });
      console.log("OTP Response:", response.data);

      if (
        response.data &&
        (response.data.success ||
          response.data.message === "OTP sent. Verify OTP to complete registration.")
      ) {
        setOtpSent(true);
        setOtpError("");
        setCountdown(45); // Start the countdown
        setOtpButtonText("Resend OTP");

        // Force state update and then open dialog
        setTimeout(() => {
          setIsOtpDialogOpen(true);
        }, 100);
      } else {
        setOtpError("Failed to send OTP. Please try again.");
        setOtpButtonText("Get OTP");
      }
    } catch (err) {
      console.log("OTP Error:", err);
      setOtpError("An error occurred while sending OTP.");
      setOtpButtonText("Get OTP");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 6) {
      setOtpError("Please enter a valid 6-digit OTP.");
      return;
    }

    setVerifyingOtp(true);

    try {
      const response = await api.post("verify-otp/", {
        email: formData.email,
        otp: otp,
      });

      if (response.data && response.data.message === "OTP verified successfully") {
        setOtpVerified(true);
        setIsOtpDialogOpen(false);
        setOtpError("");
        setOtpButtonText("Verified ✓");
        setOtpButtonColor("bg-green-500");
      } else {
        setOtpError("Invalid OTP. Please try again.");
      }
    } catch (err) {
      console.error("Verify OTP Error:", err);
      const errorMessage = err.response?.data?.error || "An error occurred while verifying OTP.";
      setOtpError(errorMessage);
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) {
      return; // Prevent spamming the resend button
    }

    setSendingOtp(true);

    try {
      const response = await api.post("send-otp/", { email: formData.email });
      if (
        response.data.success ||
        response.data.message === "OTP sent. Verify OTP to complete registration."
      ) {
        setCountdown(45); // Reset the countdown
        setOtpError("");
        setOtp("");
      } else {
        setOtpError("Failed to resend OTP. Please try again.");
      }
    } catch (err) {
      console.error("Resend OTP Error:", err);
      setOtpError("An error occurred while resending OTP.");
    } finally {
      setSendingOtp(false);
    }
  };

  // Handle dialog close manually
  const handleDialogClose = () => {
    setIsOtpDialogOpen(false);
  };

  // Handle dialog open manually
  const handleDialogOpen = () => {
    setIsOtpDialogOpen(true);
  };

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
            <div className="flex items-center mb-6">
              <button
                onClick={() => router.back()}
                className="flex items-center text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back
              </button>
              <h1 className="text-2xl font-bold ml-4">Add Trainer</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                      required
                    />
                    <Button
                      type="button"
                      onClick={handleGetOtp}
                      className={`px-4 py-2 ${otpButtonColor} text-white rounded-md hover:${
                        otpVerified ? "bg-green-600" : "bg-[#d94a0a]"
                      } transition-colors flex items-center`}
                      disabled={otpVerified || sendingOtp}
                    >
                      {sendingOtp ? (
                        <>
                          <Send className="h-4 w-4 mr-2 animate-pulse" />
                          Sending...
                        </>
                      ) : (
                        otpButtonText
                      )}
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <div className="flex items-center">
                    <span className="px-3 py-2 bg-gray-200 border border-gray-300 rounded-l-md">+91</span>
                    <input
                      type="text"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-r-md p-2"
                      placeholder="Enter phone number"
                      required
                      maxLength={10} // Ensure only 10 digits are entered
                      onInput={(e) => {
                        // Allow only numbers
                        e.target.value = e.target.value.replace(/[^0-9]/g, "");
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="others">Others</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Specialization</label>
                  <input
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Availability</label>
                  <div className="mt-1 flex space-x-2">
                    <button
                      type="button"
                      onClick={() => handleAvailabilityChange("morning")}
                      className={`px-4 py-2 rounded-md ${
                        formData.availability === "morning"
                          ? "bg-orange-500 text-white"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      Morning
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAvailabilityChange("evening")}
                      className={`px-4 py-2 rounded-md ${
                        formData.availability === "evening"
                          ? "bg-orange-500 text-white"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      Evening
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAvailabilityChange("both")}
                      className={`px-4 py-2 rounded-md ${
                        formData.availability === "both"
                          ? "bg-orange-500 text-white"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      Both
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Experience (Years)</label>
                  <input
                    type="number"
                    name="experience_years"
                    value={formData.experience_years}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Qualifications</label>
                  <input
                    type="text"
                    name="qualifications"
                    value={formData.qualifications}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Salary</label>
                  <input
                    type="number"
                    name="salary"
                    value={formData.salary}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    required
                  />
                </div>
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}
              {successMessage && (
                <p className="text-green-500 text-sm flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  {successMessage}
                </p>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading || !otpVerified}
                  className={`flex items-center px-4 py-2 ${
                    !otpVerified ? "bg-gray-400 cursor-not-allowed" : "bg-orange-500 hover:bg-orange-600"
                  } text-white rounded-md`}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {loading ? "Adding..." : "Add Trainer"}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>

      {/* OTP Dialog component */}
      <Dialog open={isOtpDialogOpen} onOpenChange={setIsOtpDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>Verify Email with OTP</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <p className="text-sm text-gray-600">Enter the 6-digit OTP sent to: <strong>{formData.email}</strong></p>
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={(value) => {
                setOtp(value);
                setOtpError("");
              }}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            {otpError && <span className="text-red-600 text-sm">{otpError}</span>}
            <div className="flex justify-between w-full mt-4">
              <Button
                type="button"
                onClick={handleResendOtp}
                disabled={countdown > 0 || sendingOtp}
                variant="outline"
                className="flex items-center"
              >
                {sendingOtp ? (
                  <>
                    <Send className="h-4 w-4 mr-2 animate-pulse" />
                    Sending...
                  </>
                ) : (
                  <>Resend OTP {countdown > 0 ? `(${countdown}s)` : ""}</>
                )}
              </Button>
              <Button
                type="button"
                onClick={handleVerifyOtp}
                disabled={verifyingOtp || otp.length < 6}
                className="bg-orange-500 hover:bg-orange-600"
              >
                {verifyingOtp ? "Verifying..." : "Verify OTP"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Fallback Button to manually open dialog if automatic doesn't work */}
      {otpSent && !isOtpDialogOpen && !otpVerified && (
        <div className="fixed bottom-4 right-4 z-50">
          <Button
            onClick={handleDialogOpen}
            className="bg-orange-500 hover:bg-orange-600"
          >
            Enter OTP
          </Button>
        </div>
      )}
    </div>
  );
};

export default AddTrainer;

