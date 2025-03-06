import React, { useState, useEffect, useMemo } from "react";
import { Search, Plus, MoreHorizontal, Filter, User, Users, Activity, DollarSign, Edit, XCircle, Check, X, Trash2, ArrowUp } from "lucide-react";
import Link from "next/link";
import Navbar from "./navbar";
import AdminSidebar from "./sidebar";
import api from "../../api/axios";
import Cookies from "js-cookie";
import debounce from "lodash.debounce";

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("members");
  const [members, setMembers] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editedValues, setEditedValues] = useState({});
  const [availablePlans, setAvailablePlans] = useState([]);
  const [showPlansModal, setShowPlansModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedPlanId, setSelectedPlanId] = useState(null); // Track selected plan ID
  const [isUpdating, setIsUpdating] = useState(false); // Track update state
  const [updateSuccess, setUpdateSuccess] = useState(false); // Track update success
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [userToCancel, setUserToCancel] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Fetch both members and trainers data when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const accessToken = Cookies.get("access_token");

        if (!accessToken) {
          throw new Error("Access token not found");
        }

        const [membersResponse, trainersResponse] = await Promise.all([
          api.get("list_users_and_trainers/?type=user", {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
          api.get("list_users_and_trainers/?type=trainer", {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
        ]);

        setMembers(membersResponse.data);
        setTrainers(trainersResponse.data);
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

  // Determine which dataset to use based on the active tab
  const users = activeTab === "members" ? members : trainers;

  // Memoize filtered users to avoid unnecessary re-renders
  const filteredUsers = useMemo(() => {
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  const parseDate = (dateString) => {
    return new Date(dateString);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const stats = {
    totalMembers: members.length,
    totalTrainers: trainers.length,
    activeMembers: members.filter((u) => u.is_active).length,
    totalRevenue: users.reduce((total, user) => {
      const subscriptions = Array.isArray(user.subscriptions) ? user.subscriptions : [];
      return (
        total +
        subscriptions.reduce(
          (subTotal, sub) => subTotal + parseFloat(sub.price || 0),
          0
        )
      );
    }, 0),
  };

  const openCancelModal = (user) => {
    setUserToCancel(user);
    setShowCancelModal(true);
  };

  const closeCancelModal = () => {
    setShowCancelModal(false);
    setUserToCancel(null);
  };

  const handleEdit = (user) => {
    setEditingUser(user.id);
    if (activeTab === "trainers") {
      setEditedValues({
        phone_number: user.phone_number || "",
        specialization: user.trainer_profile?.specialization || "",
        experience: user.trainer_profile?.experience || "",
        is_active: user.is_active
      });
    } else {
      setEditedValues({
        phone_number: user.phone_number || "",
        is_active: user.is_active
      });
    }
  };

  const handleSave = async (user) => {
    try {
      const accessToken = Cookies.get("access_token");
      let updatedUserData = { ...user }; // Clone user data for immediate update

      if (activeTab === "trainers") {
        await api.put(
          "update-trainer-details/",
          {
            email: user.email,
            phone_number: editedValues.phone_number,
            specialization: editedValues.specialization,
            experience: editedValues.experience,
            is_active: editedValues.is_active,
          },
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        updatedUserData = {
          ...user,
          phone_number: editedValues.phone_number,
          is_active: editedValues.is_active,
          trainer_profile: {
            ...user.trainer_profile,
            specialization: editedValues.specialization,
            experience: editedValues.experience
          }
        };

        setTrainers((prevTrainers) =>
          prevTrainers.map((trainer) =>
            trainer.id === user.id ? updatedUserData : trainer
          )
        );
      } else {
        await api.put(
          "update_user_details/",
          {
            email: user.email,
            phone_number: editedValues.phone_number,
            is_active: editedValues.is_active,
          },
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        updatedUserData = {
          ...user,
          phone_number: editedValues.phone_number,
          is_active: editedValues.is_active
        };

        setMembers((prevMembers) =>
          prevMembers.map((member) =>
            member.id === user.id ? updatedUserData : member
          )
        );
      }

      setEditingUser(null);
      setError(""); // Clear error if successful
    } catch (error) {
      console.log("Error updating user:", error);

      // Extract message from Axios error
      let errorMessage = "Unexpected error occurred.";
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }

      // Handle duplicate key error specifically
      if (errorMessage.includes("duplicate key value violates unique constraint")) {
        errorMessage = "This phone number  is already in use.";
      }

      setError(errorMessage); // Set error message to be displayed in UI
    }
  };



  const handleCancelUpgrade = async () => {
    if (!userToCancel) return;

    setIsCancelling(true); // Show "Cancelling..."

    try {
      const accessToken = Cookies.get("access_token");

      await api.put(
        "update_user_details/",
        {
          email: userToCancel.email,
          action: "cancel",
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

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
      console.error("Error cancelling subscription:", error);
    } finally {
      setIsCancelling(false); // Reset button state
    }
  };



  const handleUpgradePlan = async (user) => {
    try {
      const accessToken = Cookies.get("access_token");
      const response = await api.get("subscriptions/", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setAvailablePlans(response.data);
      setSelectedUser(user);
      setSelectedPlanId(null); // Reset selected plan when opening modal
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

    setIsUpdating(true); // Start updating animation
    setUpdateSuccess(false); // Reset success state

    try {
      const accessToken = Cookies.get("access_token");
      await api.put(
        "update_user_details/",
        {
          email: selectedUser.email,
          action: 'upgrade',
          new_plan_id: selectedPlanId,
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50 py-6">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar searchQuery={searchQuery} setSearchQuery={handleSearch} />

        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col space-y-6">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                <div className="flex space-x-3 mt-4 md:mt-0">
                  <Link href="/admin/dashboard/add-user">
                    <button className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Member
                    </button>
                  </Link>
                  <Link href="/admin/dashboard/add-trainer">
                    <button className="flex items-center px-4 py-2 border border-orange-500 text-orange-500 rounded-md hover:bg-orange-50 transition-colors">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Trainer
                    </button>
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-white overflow-hidden shadow rounded-lg border-0">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="p-3 rounded-full bg-orange-100 text-orange-500">
                        <User className="h-6 w-6" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">
                          {activeTab === 'members' ? 'Total Members' : 'Total Trainers'}
                        </p>
                        <h3 className="text-2xl font-bold text-gray-900">
                          {activeTab === 'members' ? stats.totalMembers : stats.totalTrainers}
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg border-0">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="p-3 rounded-full bg-blue-100 text-blue-500">
                        <Users className="h-6 w-6" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Total Trainers</p>
                        <h3 className="text-2xl font-bold text-gray-900">{stats.totalTrainers}</h3>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg border-0">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="p-3 rounded-full bg-green-100 text-green-500">
                        <Activity className="h-6 w-6" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Active Members</p>
                        <h3 className="text-2xl font-bold text-gray-900">{stats.activeMembers}</h3>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg border-0">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="p-3 rounded-full bg-purple-100 text-purple-500">
                        <DollarSign className="h-6 w-6" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                        <h3 className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue.toFixed(2)}</h3>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="border-b border-gray-200">
                  <div className="flex flex-col md:flex-row p-4">
                    <button
                      onClick={() => setActiveTab("members")}
                      className={`mr-4 py-2 px-4 font-medium text-sm rounded-md mb-2 md:mb-0 ${activeTab === "members"
                        ? "bg-orange-500 text-white"
                        : "text-gray-500 hover:text-gray-700"
                        }`}
                    >
                      Members
                    </button>
                    <button
                      onClick={() => setActiveTab("trainers")}
                      className={`py-2 px-4 font-medium text-sm rounded-md mb-2 md:mb-0 ${activeTab === "trainers"
                        ? "bg-orange-500 text-white"
                        : "text-gray-500 hover:text-gray-700"
                        }`}
                    >
                      Trainers
                    </button>

                    <div className="ml-auto flex space-x-2 mt-2 md:mt-0">
                      <button className="flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm">
                        <Filter className="h-4 w-4 mr-2 text-gray-500" />
                        Filter
                      </button>
                      <div className="relative">
                        <Search className="h-4 w-4 absolute left-3 top-2 text-gray-400" />
                        <input
                          className="pl-9 pr-4 py-1 border border-gray-300 rounded-md text-sm w-full md:w-64"
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
                        {activeTab === "members" ? (
                          <>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </>
                        ) : (
                          <>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trainer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialization</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Experience</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 font-medium">
                                {user.name.charAt(0)}
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {editingUser === user.id ? (
                              <>
                                <div className="text-sm text-gray-900">{user.email}</div>
                                <input
                                  type="text"
                                  className="text-xs text-gray-500 border border-gray-300 rounded-md px-2 py-1 mt-1"
                                  value={editedValues.phone_number}
                                  onChange={(e) => setEditedValues({ ...editedValues, phone_number: e.target.value })}
                                />
                                {error && <p className="text-red-500 text-sm">{error}</p>}
                              </>
                            ) : (
                              <>
                                <div className="text-sm text-gray-900">{user.email}</div>
                                <div className="text-xs text-gray-500">{user.phone_number}</div>
                              </>
                            )}
                          </td>

                          {activeTab === "members" ? (
                            <>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 py-1 text-xs rounded-md bg-blue-100 text-blue-800">
                                  {user.subscriptions && typeof user.subscriptions === "object"
                                    ? user.subscriptions.name
                                    : "N/A"}
                                </span>
                              </td>


                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 py-1 text-xs rounded-md bg-blue-100 text-blue-800">
                                  {user.subscriptions && typeof user.subscriptions === "object"
                                    ? user.subscriptions.end_date
                                    : "N/A"}
                                </span>
                              </td>


                              <td className="px-6 py-4 whitespace-nowrap">
                                {editingUser === user.id ? (
                                  <select
                                    className="text-xs rounded-full bg-green-100 text-green-800 px-2 py-1"
                                    value={editedValues.is_active}
                                    onChange={(e) => setEditedValues({ ...editedValues, is_active: e.target.value === "true" })}
                                  >
                                    <option value="true">Active</option>
                                    <option value="false">Inactive</option>
                                  </select>
                                ) : (
                                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                                    {user.is_active ? "Active" : "Inactive"}
                                  </span>
                                )}
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {editingUser === user.id ? (
                                  <input
                                    type="text"
                                    className="text-xs text-gray-900 border border-gray-300 rounded-md px-2 py-1"
                                    value={editedValues.specialization}
                                    onChange={(e) => setEditedValues({ ...editedValues, specialization: e.target.value })}
                                  />
                                ) : (
                                  <span className="px-2 py-1 text-xs rounded-md bg-gray-100 text-gray-800">
                                    {user.trainer_profile ? user.trainer_profile.specialization : "N/A"}
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {editingUser === user.id ? (
                                  <input
                                    type="text"
                                    className="text-xs text-gray-900 border border-gray-300 rounded-md px-2 py-1"
                                    value={editedValues.experience}
                                    onChange={(e) => setEditedValues({ ...editedValues, experience: e.target.value })}
                                  />
                                ) : (
                                  <span className="px-2 py-1 text-xs rounded-md bg-gray-100 text-gray-800">
                                    {user.trainer_profile ? user.trainer_profile.experience : "N/A"}
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {editingUser === user.id ? (
                                  <select
                                    className="text-xs rounded-full bg-green-100 text-green-800 px-2 py-1"
                                    value={editedValues.is_active}
                                    onChange={(e) => setEditedValues({ ...editedValues, is_active: e.target.value === "true" })}
                                  >
                                    <option value="true">Active</option>
                                    <option value="false">Inactive</option>
                                  </select>
                                ) : (
                                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                                    {user.is_active ? "Active" : "Inactive"}
                                  </span>
                                )}
                              </td>
                            </>
                          )}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(parseDate(user.created_at))}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex space-x-2">
                              {editingUser === user.id ? (
                                <>
                                  <button
                                    onClick={() => handleSave(user)}
                                    className="text-green-500 hover:text-green-700"
                                    title="Save"
                                  >
                                    <Check className="h-5 w-5" />
                                  </button>
                                  <button
                                    onClick={handleCancel}
                                    className="text-red-500 hover:text-red-700"
                                    title="Cancel"
                                  >
                                    <X className="h-5 w-5" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleEdit(user)}
                                    className="text-blue-500 hover:text-blue-700"
                                    title="Edit"
                                  >
                                    <Edit className="h-5 w-5" />
                                  </button>
                                  {activeTab === "members" && (
                                    <>
                                      <button
                                        onClick={() => openCancelModal(user)}
                                        className="text-yellow-500 hover:text-yellow-700"
                                        title="Cancel Upgrade"
                                      >
                                        <Trash2 className="h-5 w-5" />
                                      </button>
                                      <button
                                        onClick={() => handleUpgradePlan(user)}
                                        className="text-green-500 hover:text-green-700"
                                        title="Upgrade Plan"
                                      >
                                        <ArrowUp className="h-5 w-5" />
                                      </button>
                                    </>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {showCancelModal && (
                  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                      <h2 className="text-xl font-semibold mb-4">Confirm Cancellation</h2>
                      <p>Are you sure you want to cancel the plan for <strong>{userToCancel?.email}</strong>?</p>

                      <div className="mt-4 flex justify-end">
                        <button
                          className="px-4 py-2 bg-gray-300 text-gray-700 rounded mr-2"
                          onClick={closeCancelModal}
                          disabled={isCancelling} // Disable if cancelling
                        >
                          No, Keep Plan
                        </button>
                        <button
                          className="px-4 py-2 bg-red-600 text-white rounded"
                          onClick={handleCancelUpgrade}
                          disabled={isCancelling} // Disable if cancelling
                        >
                          {isCancelling ? "Cancelling..." : "Yes, Cancel Plan"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}


                <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6 flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Showing <span className="font-medium">{filteredUsers.length}</span> of{" "}
                    <span className="font-medium">{users.length}</span> {activeTab}
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-500">
                      Previous
                    </button>
                    <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-500">
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
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Select a Plan for {selectedUser?.name}</h2>

            {selectedUser && selectedUser.subscriptions && selectedUser.subscriptions.length > 0 && (
              <div className="mb-4 p-3 bg-gray-100 rounded-lg">
                <h3 className="font-medium text-gray-700">Current Plan</h3>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">{selectedUser.subscriptions[0].name}</span>
                  {selectedUser.subscriptions[0].duration &&
                    <span> • {selectedUser.subscriptions[0].duration} months</span>}
                  <span> • {selectedUser.subscriptions[0].personal_training ? 'Includes' : 'No'} personal training</span>
                </p>
              </div>
            )}

            <div className="max-h-60 overflow-y-auto">
              <ul className="space-y-3">
                {availablePlans.map((plan) => (
                  <li
                    key={plan.id}
                    className={`border rounded-lg p-3 flex justify-between items-center ${selectedPlanId === plan.id ? "border-green-500 bg-green-50" : "border-gray-200"
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
                    <div className={`h-5 w-5 rounded-full ${selectedPlanId === plan.id
                      ? "bg-green-500 border-green-500"
                      : "border border-gray-300"
                      }`}>
                      {selectedPlanId === plan.id && (
                        <Check className="h-5 w-5 text-white" />
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                onClick={() => setShowPlansModal(false)}
              >
                Cancel
              </button>
              <button
                className={`px-4 py-2 rounded-md ${!selectedPlanId
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-orange-500 hover:bg-orange-600 text-white"
                  }`}
                onClick={handlePlanSelection}
                disabled={!selectedPlanId || isUpdating}
              >
                {isUpdating ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white mr-2"></div>
                    Updating...
                  </div>
                ) : updateSuccess ? (
                  <div className="flex items-center">
                    <Check className="h-4 w-4 mr-2" />
                    Updated!
                  </div>
                ) : (
                  "Confirm Upgrade"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;