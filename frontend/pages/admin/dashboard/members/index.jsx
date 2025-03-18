import React, { useState, useEffect, useMemo } from "react";
import { Search, Plus, MoreHorizontal, Filter, User, Users, Activity, DollarSign, Edit, XCircle, Check, X, Trash2, ArrowUp } from "lucide-react";
import Link from "next/link";
import Navbar from "../navbar";
import AdminSidebar from "../sidebar";
import api from "@/pages/api/axios";
import Cookies from "js-cookie";
import debounce from "lodash.debounce";

const Members = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [showPlansModal, setShowPlansModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [availableTrainers, setAvailableTrainers] = useState([]);
  const [showTrainersModal, setShowTrainersModal] = useState(false);
  const [selectedTrainerId, setSelectedTrainerId] = useState(null);
  const [showTrainerDetailsModal, setShowTrainerDetailsModal] = useState(false);
  const [trainerDetails, setTrainerDetails] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [userToCancel, setUserToCancel] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  // Fetch members data when the component mounts
  useEffect(() => {
    document.body.style.zoom = "95%";
    const fetchData = async () => {
      try {
        const accessToken = Cookies.get("access_token");
        if (!accessToken) {
          throw new Error("Access token not found");
        }

        const membersResponse = await api.get("list_users_and_trainers/?type=user", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        const membersWithPayments = await Promise.all(
          membersResponse.data.map(async (member) => {
            const paymentsResponse = await api.get(`user-payments/${member.id}/`, {
              headers: { Authorization: `Bearer ${accessToken}` },
            });
            return { ...member, payments: paymentsResponse.data.payments };
          })
        );

        setMembers(membersWithPayments);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Debounced search handler
  const handleSearch = debounce((query) => {
    setSearchQuery(query);
  }, 300);

  // Filter members based on search query
  const filteredMembers = useMemo(() => {
    return members.filter(
      (member) =>
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [members, searchQuery]);

  const openCancelModal = (user) => {
    setUserToCancel(user);
    setCancelError(null);
    setShowCancelModal(true);
  };

  const closeCancelModal = () => {
    setShowCancelModal(false);
    setCancelError(null);
    setUserToCancel(null);
  };

  const handleCancelUpgrade = async () => {
    if (!userToCancel) return;

    setIsCancelling(true); // Show "Cancelling..."
    setCancelError(null);  // Clear previous errors before making API call

    try {
      const accessToken = Cookies.get("access_token");

      const response = await api.put(
        "update_user_details/",
        {
          email: userToCancel.email,
          action: "cancel",
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      // Check if API response contains the error message
      if (response.data?.error?.includes("No active subscription found")) {
        setCancelError("No active subscription found.");
        setIsCancelling(false);
        return;
      }

      // Update members list
      setMembers((prevMembers) =>
        prevMembers.map((member) =>
          member.id === userToCancel.id
            ? {
              ...member,
              subscriptions: member.subscriptions
                ? {
                  ...member.subscriptions,
                  name: "N/A",
                  end_date: "N/A",
                  status: "cancelled",
                }
                : null,
            }
            : member
        )
      );

      closeCancelModal(); // Close modal after success
    } catch (error) {
      console.log("Error cancelling subscription:", error);

      if (error.response?.data?.error) {
        setCancelError(error.response.data.error);
      } else {
        setCancelError("Something went wrong. Please try again.");
      }
    } finally {
      setIsCancelling(false); // Reset button state
    }
  };

  // Function to upgrade a member's plan
  const handleUpgradePlan = async (user) => {
    try {
      const accessToken = Cookies.get("access_token");
      const response = await api.get("subscriptions/", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setAvailablePlans(response.data);
      setSelectedUser(user);
      setSelectedPlanId(null); // Reset selected plan when opening modal
      setSelectedPaymentMethod(""); // Reset selected payment method
      setShowPlansModal(true);
    } catch (error) {
      console.error("Error fetching plans:", error);
      setError(error.message);
    }
  };

  const handlePlanSelection = async () => {
    if (!selectedPlanId) {
      alert("Please select a plan first.");
      return;
    }

    if (!selectedPaymentMethod) {
      alert("Please select a payment method first.");
      return;
    }

    setIsUpdating(true); // Start updating animation

    try {
      const accessToken = Cookies.get("access_token");
      await api.put(
        "update_user_details/",
        {
          email: selectedUser.email,
          action: 'upgrade',
          new_plan_id: selectedPlanId,
          payment_method: selectedPaymentMethod,
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      // Find the selected plan details for immediate UI update
      const selectedPlan = availablePlans.find(plan => plan.id === selectedPlanId);

      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(startDate.getMonth() + (selectedPlan.duration || 1));
      // Update the user's subscriptions in the UI
      setMembers(prevMembers =>
        prevMembers.map(member =>
          member.id === selectedUser.id
            ? {
              ...member,
              subscriptions: {
                id: selectedPlanId,
                name: selectedPlan.name,
                status: "active",
                duration: selectedPlan.duration,
                price: selectedPlan.price,
                has_personal_training: selectedPlan.personal_training,
                end_date: selectedPlan.end_date || endDate.toISOString().split("T")[0], // Ensure end date is updated
              },
              payment_method: selectedPaymentMethod,
            }
            : member
        )
      );

      // Update selected user in UI
      setSelectedUser(prev => ({
        ...prev,
        subscriptions: {
          id: selectedPlanId,
          name: selectedPlan.name,
          status: "active",
          duration: selectedPlan.duration,
          price: selectedPlan.price,
          has_personal_training: selectedPlan.personal_training,
          end_date: selectedPlan.end_date || endDate.toISOString().split("T")[0], // Ensure end date is updated
        },
        payment_method: selectedPaymentMethod,
      }));

      setTimeout(() => {
        setIsUpdating(false); // Stop updating animation
        // Keep the modal open for a moment so user can see success message
        setTimeout(() => {
          setShowPlansModal(false); // Close modal after success
        }, 1000);
      }, 1000);
    } catch (error) {
      console.error("Error upgrading plan:", error);
      setError(error.message);
      setIsUpdating(false); // Stop updating animation
    }
  };

  // Function to open trainer selection modal
  const handleAssignTrainer = async (user) => {
    try {
      const accessToken = Cookies.get("access_token");
      const response = await api.get("list_users_and_trainers/?type=trainer", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setAvailableTrainers(response.data);
      setSelectedUser(user);
      setSelectedTrainerId(null); // Reset selected trainer when opening modal
      setShowTrainersModal(true);
    } catch (error) {
      console.error("Error fetching trainers:", error);
      setError(error.message);
    }
  };

  const handleTrainerSelection = async () => {
    if (!selectedTrainerId) {
      alert("Please select a trainer first.");
      return;
    }

    setIsUpdating(true); // Start updating animation

    try {
      const accessToken = Cookies.get("access_token");
      await api.post(
        "assign-trainer/",
        {
          user_id: selectedUser.id,
          trainer_id: selectedTrainerId,
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      // Update the user's trainer in the UI
      setMembers(prevMembers =>
        prevMembers.map(member =>
          member.id === selectedUser.id
            ? {
              ...member,
              trainer: {
                id: selectedTrainerId,
                name: availableTrainers.find(trainer => trainer.id === selectedTrainerId).name,
              },
            }
            : member
        )
      );

      // Update selected user in UI
      setSelectedUser(prev => ({
        ...prev,
        trainer: {
          id: selectedTrainerId,
          name: availableTrainers.find(trainer => trainer.id === selectedTrainerId).name,
        },
      }));

      setTimeout(() => {
        setIsUpdating(false); // Stop updating animation
        // Keep the modal open for a moment so user can see success message
        setTimeout(() => {
          setShowTrainersModal(false); // Close modal after success
        }, 1000);
      }, 1000);
    } catch (error) {
      console.error("Error assigning trainer:", error);
      setError(error.message);
      setIsUpdating(false); // Stop updating animation
    }
  };

  // Function to view assigned trainer details
  const handleViewAssignedTrainer = async (user) => {
    try {
      const accessToken = Cookies.get("access_token");
      const response = await api.get(`assigned-trainer/${user.id}/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setTrainerDetails(response.data);
      setShowTrainerDetailsModal(true);
    } catch (error) {
      if (error.response && error.response.data && error.response.data.detail === "No trainer assigned for this user.") {
        setTrainerDetails(null);
        setShowTrainerDetailsModal(true);
      } else {
        console.log("Error fetching assigned trainer:", error);
        setError(error.message);
      }
    }
  };

  const openPaymentModal = (payment) => {
    setSelectedPayment(payment);
    setShowPaymentModal(true);
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedPayment(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50 py-4">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar searchQuery={searchQuery} setSearchQuery={handleSearch} />

        <main className="flex-1 overflow-y-auto bg-gray-50 p-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="flex space-x-2 mt-2 md:mt-0">
                  <Link href="/admin/dashboard/add-user">
                    <button className="flex items-center px-3 py-1.5 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors">
                      <Plus className="h-3 w-3 mr-1.5" />
                      Add Member
                    </button>
                  </Link>
                </div>
              </div>

              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="border-b border-gray-200">
                  <div className="flex flex-col md:flex-row p-3">
                    <div className="ml-auto flex space-x-1.5 mt-2 md:mt-0">
                      <div className="relative">
                        <Search className="h-3 w-3 absolute left-2.5 top-1.5 text-gray-400" />
                        <input
                          className="pl-8 pr-3 py-1 border border-gray-300 rounded-md text-sm w-full md:w-56"
                          placeholder="Search by name, email..."
                          value={searchQuery}
                          onChange={(e) => handleSearch(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredMembers.map((member) => (
                        <tr key={member.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 font-medium">
                                {member.name.charAt(0)}
                              </div>
                              <div className="ml-2">
                                <div className="text-sm font-medium text-gray-900">{member.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{member.email}</div>
                            <div className="text-xs text-gray-500">{member.phone_number}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{member.gender}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="px-1.5 py-0.5 text-xs rounded-md bg-blue-100 text-blue-800">
                              {member.subscriptions && typeof member.subscriptions === "object"
                                ? member.subscriptions.name
                                : "N/A"}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="px-1.5 py-0.5 text-xs rounded-md bg-blue-100 text-blue-800">
                              {member.subscriptions && typeof member.subscriptions === "object"
                                ? member.subscriptions.end_date
                                : "N/A"}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="px-1.5 py-0.5 text-xs rounded-full bg-green-100 text-green-800">
                              {member.is_active ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {new Date(member.created_at).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 flex items-center">
                            {member.payments && member.payments.length > 0 ? (
                              <>
                                {member.payments[0].payment_method || "N/A"}
                                {member.payments[0].payment_method && ["offline", "online"].includes(member.payments[0].payment_method) && (
                                  <img src="/invoice.svg" alt="Invoice Icon" width="20" height="20" onClick={() => openPaymentModal(member.payments[0])} className="cursor-pointer ml-1" />
                                )}
                              </>
                            ) : (
                              "N/A"
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex space-x-1.5">
                              <button
                                className="text-green-500 hover:text-green-700"
                                title="Upgrade Plan"
                                onClick={() => handleUpgradePlan(member)}
                              >
                                <ArrowUp className="h-4 w-4" />
                              </button>
                              <button
                                className="text-gray-500 hover:text-gray-700"
                                title="Assign Trainer"
                                onClick={() => handleAssignTrainer(member)}
                              >
                                <img src="/Trainer.svg" alt="Trainer Icon" width="20" height="20" />
                              </button>
                              <button
                                onClick={() => openCancelModal(member)}
                                className="text-yellow-500 hover:text-yellow-700"
                                title="Cancel Upgrade"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                              <button
                                className="text-blue-500 hover:text-blue-700"
                                title="View Assigned Trainer"
                                onClick={() => handleViewAssignedTrainer(member)}
                              >
                                <img src="/view-eye.svg" alt="View Icon" width="20" height="20" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-white px-3 py-2 border-t border-gray-200 sm:px-4 flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Showing <span className="font-medium">{filteredMembers.length}</span> of{" "}
                    <span className="font-medium">{members.length}</span> members
                  </div>
                  <div className="flex space-x-1.5">
                    <button className="px-2 py-0.5 border border-gray-300 rounded-md text-sm text-gray-500">
                      Previous
                    </button>
                    <button className="px-2 py-0.5 border border-gray-300 rounded-md text-sm text-gray-500">
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {showPlansModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-4 w-full max-w-md">
            <h2 className="text-lg font-bold mb-3">Select a Plan for {selectedUser?.name}</h2>

            {selectedUser && selectedUser.subscriptions && selectedUser.subscriptions.length > 0 && (
              <div className="mb-3 p-2 bg-gray-100 rounded-lg">
                <h3 className="font-medium text-gray-700">Current Plan</h3>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">{selectedUser.subscriptions[0].name}</span>
                  {selectedUser.subscriptions[0].duration &&
                    <span> • {selectedUser.subscriptions[0].duration} months</span>}
                  <span> • {selectedUser.subscriptions[0].personal_training ? 'Includes' : 'No'} personal training</span>
                </p>
              </div>
            )}

            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700">Payment Method</label>
              <select
                className="mt-1 block w-full py-1.5 px-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                value={selectedPaymentMethod}
                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              >
                <option value="">Select Payment Method</option>
                <option value="online">UPI</option>
                <option value="offline">Offline</option>
              </select>
            </div>

            <div className="max-h-48 overflow-y-auto">
              <ul className="space-y-2">
                {availablePlans.map((plan) => (
                  <li
                    key={plan.id}
                    className={`border rounded-lg p-2 flex justify-between items-center ${selectedPlanId === plan.id ? "border-green-500 bg-green-50" : "border-gray-200"
                      }`}
                    onClick={() => setSelectedPlanId(plan.id)}
                  >
                    <div className="flex-1">
                      <div className="font-medium">{plan.name}</div>
                      <div className="text-sm text-gray-600">
                        {plan.duration && <span>{plan.duration} months • </span>}
                        <span>{plan.personal_training ? 'Includes' : 'No'} personal training</span>
                        {plan.price && <span> • ₹{plan.price}</span>}
                      </div>
                    </div>
                    <div className={`h-4 w-4 rounded-full ${selectedPlanId === plan.id
                      ? "bg-green-500 border-green-500"
                      : "border border-gray-300"
                      }`}>
                      {selectedPlanId === plan.id && (
                        <Check className="h-4 w-4 text-white" />
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 flex justify-end space-x-2">
              <button
                className="px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50"
                onClick={() => setShowPlansModal(false)}
              >
                Cancel
              </button>
              <button
                className={`px-3 py-1.5 rounded-md ${!selectedPlanId || !selectedPaymentMethod
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-orange-500 hover:bg-orange-600 text-white"
                  }`}
                onClick={handlePlanSelection}
                disabled={!selectedPlanId || !selectedPaymentMethod || isUpdating}
              >
                {isUpdating ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-white mr-1.5"></div>
                    Updating...
                  </div>
                ) : (
                  "Confirm Upgrade"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showTrainersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-4 w-full max-w-md">
            <h2 className="text-lg font-bold mb-3">Select a Trainer for {selectedUser?.name}</h2>

            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700">Available Trainers</label>
              <ul className="max-h-48 overflow-y-auto space-y-2">
                {availableTrainers.map((trainer) => (
                  <li
                    key={trainer.id}
                    className={`border rounded-lg p-2 flex justify-between items-center ${selectedTrainerId === trainer.id ? "border-green-500 bg-green-50" : "border-gray-200"
                      }`}
                    onClick={() => setSelectedTrainerId(trainer.id)}
                  >
                    <div className="flex-1">
                      <div className="font-medium">{trainer.name}</div>
                      <div className="text-sm text-gray-600">
                        <span>Availability: {trainer.trainer_profile.availability}</span>
                        <span> • Experience: {trainer.experience} years</span>
                        <span> • Specialization: {trainer.specialization}</span>
                      </div>
                    </div>
                    <div className={`h-4 w-4 rounded-full ${selectedTrainerId === trainer.id
                      ? "bg-green-500 border-green-500"
                      : "border border-gray-300"
                      }`}>
                      {selectedTrainerId === trainer.id && (
                        <Check className="h-4 w-4 text-white" />
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 flex justify-end space-x-2">
              <button
                className="px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50"
                onClick={() => setShowTrainersModal(false)}
              >
                Cancel
              </button>
              <button
                className={`px-3 py-1.5 rounded-md ${!selectedTrainerId
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-orange-500 hover:bg-orange-600 text-white"
                  }`}
                onClick={handleTrainerSelection}
                disabled={!selectedTrainerId || isUpdating}
              >
                {isUpdating ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-white mr-1.5"></div>
                    Assigning...
                  </div>
                ) : (
                  "Confirm Assignment"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showTrainerDetailsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-4 w-full max-w-md shadow-lg">
            <h2 className="text-lg font-bold mb-3 text-gray-900 border-b border-gray-200 pb-1.5">Assigned Trainer Details</h2>
            {trainerDetails && trainerDetails.assigned_trainers && trainerDetails.assigned_trainers.length > 0 ? (
              <div className="overflow-x-auto mt-3">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr>
                      <th className="px-3 py-1.5 text-left text-gray-600">Name</th>
                      <th className="px-3 py-1.5 text-left text-gray-600">Experience</th>
                      <th className="px-3 py-1.5 text-left text-gray-600">Specialization</th>
                      <th className="px-3 py-1.5 text-left text-gray-600">Availability</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trainerDetails.assigned_trainers.map((trainer, index) => (
                      <tr key={index} className="border-b border-gray-200">
                        <td className="px-3 py-1.5 text-gray-800">{trainer.trainer_name}</td>
                        <td className="px-3 py-1.5 text-gray-800">{trainer.experience} years</td>
                        <td className="px-3 py-1.5 text-gray-800">{trainer.specialization}</td>
                        <td className="px-3 py-1.5 text-gray-800">
                          {trainer.availability === "both" ? "Morning and Evening" : trainer.availability}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-600 text-center py-3">No trainer details available.</p>
            )}
            <div className="mt-4 flex justify-end">
              <button
                className="px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700"
                onClick={() => setShowTrainerDetailsModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-4 w-full max-w-md">
            <h2 className="text-lg font-bold mb-3">Confirm Cancellation</h2>
            <p className="text-gray-700">Are you sure you want to cancel the subscription for {userToCancel?.name}?</p>
            {cancelError && <p className="text-red-500 mt-1.5">{cancelError}</p>}
            <div className="mt-4 flex justify-end space-x-2">
              <button
                className="px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50"
                onClick={closeCancelModal}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600"
                onClick={handleCancelUpgrade}
                disabled={isCancelling}
              >
                {isCancelling ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-white mr-1.5"></div>
                    Cancelling...
                  </div>
                ) : (
                  "Confirm"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-4 w-full max-w-md shadow-lg">
            <h2 className="text-lg font-bold mb-3 text-gray-900 border-b border-gray-200 pb-1.5">Payment Details</h2>
            {selectedPayment && (
              <div className="mt-4">
                <p><strong>User:</strong> {selectedPayment.user_name}</p>
                <p><strong>Amount:</strong> {selectedPayment.amount}</p>
                <p><strong>Payment Date:</strong> {new Date(selectedPayment.payment_date).toLocaleDateString("en-GB")}</p>
                <p><strong>Payment Method:</strong> {selectedPayment.payment_method}</p>
                <p><strong>Status:</strong> {selectedPayment.status}</p>
              </div>
            )}
            <div className="mt-4 flex justify-end space-x-2">
              <button
                className="px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700"
                onClick={closePaymentModal}
              >
                Close
              </button>
              <button
                className="px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                onClick={() => window.print()}
              >
                Print
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Members;
