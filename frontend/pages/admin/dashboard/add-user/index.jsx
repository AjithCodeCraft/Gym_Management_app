import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { User, Plus, ArrowLeft, Mail, Loader, AlertCircle, Send } from "lucide-react";
import api from "../../../api/axios";
import AdminSidebar from "../sidebar";
import Navbar from "../navbar";
import Cookies from "js-cookie";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const AddMember = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_number: "",
    gender: "",
    date_of_birth: "",
    subscription_plan_id: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [plans, setPlans] = useState([]);
  const [fetchingPlans, setFetchingPlans] = useState(true);
  const [authError, setAuthError] = useState("");
  const [showPopup, setShowPopup] = useState(false); // State for popup visibility

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
  const [fieldErrors, setFieldErrors] = useState({});

  // Fetch subscription plans from API with authentication
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setFetchingPlans(true);
        setAuthError("");

        // Get access token from cookies
        const accessToken = Cookies.get("access_token");

        if (!accessToken) {
          setAuthError("Access denied. No authentication token found.");
          setFetchingPlans(false);
          return;
        }

        // Set up request with authorization header
        const response = await api.get("subscriptions/", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.data) {
          // Check if the response is an array or if it has a specific property containing plans
          const plansData = Array.isArray(response.data)
            ? response.data
            : response.data.plans
            ? response.data.plans
            : [];

          setPlans(plansData);

          // Set default plan to first plan if available
          if (plansData.length > 0) {
            setFormData((prev) => ({
              ...prev,
              subscription_plan_id: plansData[0].id,
            }));
          }
        } else {
          setError("Failed to load subscription plans.");
        }
      } catch (err) {
        if (err.response && err.response.status === 401) {
          setAuthError("Access denied. Your session may have expired. Please log in again.");
        } else if (err.response && err.response.status === 403) {
          setAuthError("You do not have permission to access subscription data.");
        } else {
          setError("Error fetching subscription plans. Please try again.");
        }
        console.error("Failed to fetch plans:", err);
      } finally {
        setFetchingPlans(false);
      }
    };

    fetchPlans();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");
    setFieldErrors({}); // Clear previous field-specific errors

    if (!otpVerified) {
      setError("Please verify your email with OTP.");
      setLoading(false);
      return;
    }

    // Check if the selected plan ID exists
    const selectedPlan = plans.find((plan) => plan.id === formData.subscription_plan_id);
    if (!selectedPlan) {
      setError("Selected subscription plan not found.");
      setLoading(false);
      return;
    }

    // Ensure gender is set
    if (!formData.gender) {
      setError("Please select a gender.");
      setLoading(false);
      return;
    }

    // Format the phone number to E.164 format
    const formattedPhoneNumber = `+91${formData.phone_number}`;

    try {
      const response = await api.post("register/", {
        ...formData,
        phone_number: formattedPhoneNumber, // Use the formatted phone number
        user_type: "user",
      });

      if (response.data.success) {
        setSuccessMessage("Member added successfully! Login credentials sent to their email.");
        setShowPopup(true); // Show the popup
      } else {
        setError(response.data.message || "Failed to add member.");
      }
    } catch (err) {
      if (err.response && err.response.data) {
        const { error } = err.response.data;

        // Handle specific errors and assign them to respective fields
        if (error.includes("Email already exists")) {
          setFieldErrors((prev) => ({ ...prev, email: "Email already exists" }));
        } else if (error.includes("Phone number already exists")) {
          setFieldErrors((prev) => ({ ...prev, phone_number: "Phone number already exists" }));
        } else {
          setError(error || "An error occurred while registering the member.");
        }
      } else {
        setError("An error occurred while registering the member.");
      }
      console.log("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    router.push("/login");
  };

  const handleRedirect = () => {
    router.push("/admin/dashboard");
  };

  // OTP Functions (API-based)
  const handleGetOtp = async () => {
    if (!formData.email) {
      setFieldErrors((prev) => ({ ...prev, email: "Please enter an email address first." }));
      return;
    }

    setSendingOtp(true);
    setOtpButtonText("Sending...");
    setFieldErrors({}); // Clear previous field-specific errors

    try {
      const response = await api.post("send-otp/", { email: formData.email });
      console.log("OTP Response:", response.data);

      if (
        response.data &&
        (response.data.success ||
          response.data.message === "OTP sent. Verify OTP to complete registration.")
      ) {
        setOtpSent(true);
        setCountdown(45); // Start the countdown
        setOtpButtonText("Resend OTP");

        // Force state update and then open dialog
        setTimeout(() => {
          setIsOtpDialogOpen(true);
        }, 100);
      } else {
        setFieldErrors((prev) => ({ ...prev, email: "Failed to send OTP. Please try again." }));
        setOtpButtonText("Get OTP");
      }
    } catch (err) {
      console.log("OTP Error:", err);

      if (err.response && err.response.data && err.response.data.error) {
        if (err.response.data.error.includes("Email already exists")) {
          setFieldErrors((prev) => ({ ...prev, email: "Email already exists." }));
        } else {
          setFieldErrors((prev) => ({ ...prev, email: err.response.data.error }));
        }
      } else {
        setFieldErrors((prev) => ({ ...prev, email: "An error occurred while sending OTP." }));
      }

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

  // Format the price to Indian Rupees
  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />

        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-2xl transform transition-all duration-300 hover:shadow-3xl">
            <div className="flex items-center mb-6">
              <button
                onClick={() => router.back()}
                className="flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back
              </button>
              <h1 className="text-2xl font-bold ml-4 text-gray-800">Add Member</h1>
            </div>

            {authError ? (
              <div className="bg-red-50 p-6 rounded-lg">
                <div className="flex items-center mb-3">
                  <AlertCircle className="h-6 w-6 text-red-500 mr-2" />
                  <h3 className="font-semibold text-red-700">Authentication Error</h3>
                </div>
                <p className="text-red-600 mb-4">{authError}</p>
                <button
                  onClick={handleLogin}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Go to Login
                </button>
              </div>
            ) : fetchingPlans ? (
              <div className="flex justify-center items-center py-10">
                <Loader className="h-8 w-8 animate-spin text-blue-500" />
                <p className="ml-3 text-gray-600">Loading Subscription Plans...</p>
              </div>
            ) : plans.length === 0 ? (
              <div className="bg-yellow-50 p-4 rounded-lg text-yellow-700 mb-6">
                No subscription plans found. Please check the subscription configuration.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        required
                      />
                      {fieldErrors.email && <p className="text-red-500">{fieldErrors.email}</p>}

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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <div className="flex items-center">
                      <span className="px-3 py-3 bg-gray-200 border border-gray-300 rounded-l-lg">+91</span>
                      <input
                        type="text"
                        name="phone_number"
                        value={formData.phone_number}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-r-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        placeholder="Enter phone number"
                        required
                        maxLength={10} // Ensure only 10 digits are entered
                        onInput={(e) => {
                          // Allow only numbers
                          e.target.value = e.target.value.replace(/[^0-9]/g, "");
                        }}
                      />
                      {fieldErrors.phone_number && <p className="text-red-500">{fieldErrors.phone_number}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      name="date_of_birth"
                      value={formData.date_of_birth}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="others">Others</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gym Plan</label>
                    <select
                      name="subscription_plan_id"
                      value={formData.subscription_plan_id}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      required
                    >
                      {plans.map((plan) => (
                        <option key={plan.id} value={plan.id}>
                          {plan.name} - {formatPrice(plan.price)}
                          {plan.duration ? ` (${plan.duration} months)` : ""}
                          {plan.personal_training ? " with PT" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 p-3 rounded-lg flex items-center text-red-600 text-sm">
                    <span className="mr-2">⚠️</span>
                    {error}
                  </div>
                )}
                {successMessage && (
                  <div className="bg-green-50 p-3 rounded-lg flex items-center text-green-600 text-sm">
                    <Mail className="h-4 w-4 mr-2" />
                    {successMessage}
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading || !otpVerified}
                    className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105"
                  >
                    {loading ? (
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    {loading ? "Adding..." : "Add Member"}
                  </button>
                </div>
              </form>
            )}
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
            <p className="text-sm text-gray-600">
              Enter the 6-digit OTP sent to: <strong>{formData.email}</strong>
            </p>
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

      {/* AlertDialog for Success Message */}
      <AlertDialog open={showPopup} onOpenChange={setShowPopup}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>User Created Successfully!</AlertDialogTitle>
            <AlertDialogDescription>
              The member has been added successfully. Login credentials have been sent to their email.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleRedirect}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AddMember;