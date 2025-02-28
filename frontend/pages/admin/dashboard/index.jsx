import React, { useState } from 'react';
import { Search, Plus, MoreHorizontal, Filter, User, Users, Activity, DollarSign } from 'lucide-react';
import Link from "next/link";
import Navbar from './navbar';
import AdminSidebar from './sidebar';

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("members");

  const parseDate = (dateString) => {
    const [day, month, year] = dateString.split('/');
    return new Date(`${year}-${month}-${day}`);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const users = [
    { id: 1, name: "John Doe", email: "john@example.com", userType: "member", gender: "male", phone: "+1234567890", plan: "3 Months", endDate: parseDate("2025-05-15"), isActive: true, joinDate: parseDate("2024-01-15") },
    { id: 2, name: "Jane Smith", email: "jane@example.com", userType: "member", gender: "female", phone: "+0987654321", plan: "1 Month", endDate: parseDate("2025-03-20"), isActive: true, joinDate: parseDate("2024-01-20") },
    { id: 3, name: "Mike Johnson", email: "mike@example.com", userType: "trainer", gender: "male", phone: "+1239874560", specialization: "Strength Training", isActive: true, joinDate: parseDate("2024-01-05") },
    { id: 4, name: "Sara Williams", email: "sara@example.com", userType: "trainer", gender: "female", phone: "+3216549870", specialization: "Yoga & Flexibility", isActive: true, joinDate: parseDate("2023-12-10") },
    { id: 5, name: "Robert Chen", email: "robert@example.com", userType: "member", gender: "male", phone: "+4567891230", plan: "Personal Training", endDate: parseDate("2025-04-12"), isActive: true, joinDate: parseDate("2024-02-12") }
  ];

  const members = users.filter(user => user.userType === "member");
  const trainers = users.filter(user => user.userType === "trainer");

  const filteredUsers = activeTab === "members"
    ? members.filter(user => user.name.toLowerCase().includes(searchQuery.toLowerCase()) || user.email.toLowerCase().includes(searchQuery.toLowerCase()))
    : trainers.filter(user => user.name.toLowerCase().includes(searchQuery.toLowerCase()) || user.email.toLowerCase().includes(searchQuery.toLowerCase()));

  const stats = {
    totalMembers: members.length,
    totalTrainers: trainers.length,
    activeMembers: members.filter(u => u.isActive).length,
    totalRevenue: 74800
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50 py-6">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

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
                        <p className="text-sm font-medium text-gray-500">Total Members</p>
                        <h3 className="text-2xl font-bold text-gray-900">{stats.totalMembers}</h3>
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
                        <h3 className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue}</h3>
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
                      className={`mr-4 py-2 px-4 font-medium text-sm rounded-md mb-2 md:mb-0 ${
                        activeTab === "members"
                          ? "bg-orange-500 text-white"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      Members
                    </button>
                    <button
                      onClick={() => setActiveTab("trainers")}
                      className={`py-2 px-4 font-medium text-sm rounded-md mb-2 md:mb-0 ${
                        activeTab === "trainers"
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
                          onChange={(e) => setSearchQuery(e.target.value)}
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
                            <div className="text-xs text-gray-500">{user.phone}</div>
                          </td>

                          {activeTab === "members" ? (
                            <>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs rounded-md ${
                                  user.plan === "Personal Training"
                                    ? "bg-purple-100 text-purple-800"
                                    : user.plan === "1 Year"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-blue-100 text-blue-800"
                                }`}>
                                  {user.plan}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(user.endDate)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                                  Active
                                </span>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 py-1 text-xs rounded-md bg-gray-100 text-gray-800">
                                  {user.specialization}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                                  Active
                                </span>
                              </td>
                            </>
                          )}

                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(user.joinDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="relative inline-block text-left">
                              <button className="text-gray-400 hover:text-gray-600">
                                <MoreHorizontal className="h-5 w-5" />
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
                    <span className="font-medium">{activeTab === "members" ? members.length : trainers.length}</span> {activeTab}
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
