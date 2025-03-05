import React, { useState, useEffect, useMemo } from "react";
import { Search, Plus, MoreHorizontal, Filter, User, Users, Activity, DollarSign, Edit, XCircle } from "lucide-react";
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
    totalMembers: activeTab === 'members' ? members.length : 0,
    totalTrainers: activeTab === 'trainers' ? trainers.length : 0,
    activeMembers: members.filter((u) => u.is_active).length,
    totalRevenue: members.reduce((total, member) => {
      if (member.subscriptions && Array.isArray(member.subscriptions)) {
        const activeSubscriptions = member.subscriptions.filter(
          (sub) => sub.status === "active"
        );
        return (
          total +
          activeSubscriptions.reduce(
            (subTotal, sub) => subTotal + parseFloat(sub.subscription.price),
            0
          )
        );
      }
      return total;
    }, 0),
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
                                <div className="text-xs text-gray-500">{user.gender.charAt(0).toUpperCase() + user.gender.slice(1)}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{user.email}</div>
                            <div className="text-xs text-gray-500">{user.phone_number}</div>
                          </td>

                          {activeTab === "members" ? (
                            <>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 py-1 text-xs rounded-md bg-blue-100 text-blue-800">
                                  {user.subscriptions && Array.isArray(user.subscriptions)
                                    ? user.subscriptions.map((sub) => sub.subscription.name).join(", ")
                                    : "N/A"}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {user.subscriptions && Array.isArray(user.subscriptions)
                                  ? user.subscriptions.map((sub) => formatDate(parseDate(sub.end_date))).join(", ")
                                  : "N/A"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                                  {user.is_active ? "Active" : "Inactive"}
                                </span>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 py-1 text-xs rounded-md bg-gray-100 text-gray-800">
                                  {user.trainer_profile ? user.trainer_profile.specialization : "N/A"}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                                  {user.is_active ? "Active" : "Inactive"}
                                </span>
                              </td>
                            </>
                          )}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(parseDate(user.created_at))}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex space-x-2">
                              <Link href={`/admin/dashboard/edit-${activeTab}/${user.id}`}>
                                <button className="text-blue-500 hover:text-blue-700">
                                  <Edit className="h-5 w-5" />
                                </button>
                              </Link>
                              <button
                                onClick={() => handleDisable(user.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <XCircle className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

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
    </div>
  );
};

export default Dashboard;

// Dummy function for handleDisable
const handleDisable = (id) => {
  console.log("Disable user with ID:", id);
};
