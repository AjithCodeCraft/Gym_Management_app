import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, Activity, MoreHorizontal } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import TrainerSidebar from './TrainerSidebar';
import Navbar from './Navbar';
import Cookies from 'js-cookie';
import api from "@/pages/api/axios";

const GymTrainerDashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // Default to today
  const [trainerName, setTrainerName] = useState('');
  const [trainerId, setTrainerId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState({});
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);

  // Get attendance for the selected date
  const filteredMembers = attendanceData[selectedDate] || [];

  const schedule = [
    { id: 1, time: '06:00 - 07:00', client: 'Group Class: Morning HIIT', type: 'Group', status: 'completed' },
    { id: 2, time: '08:00 - 09:00', client: 'John Doe', type: 'Personal', status: 'completed' },
    { id: 3, time: '10:00 - 11:00', client: 'Sara Williams', type: 'Personal', status: 'in-progress' },
    { id: 4, time: '13:00 - 14:00', client: 'Group Class: Core Strength', type: 'Group', status: 'upcoming' },
    { id: 5, time: '15:00 - 16:00', client: 'Mike Johnson', type: 'Personal', status: 'upcoming' }
  ];

  const [stats, setStats] = useState({
    totalClients: 0,
    checkedIn: 0,
    checkedOut: 0,
    absent: 0
  });

  const salaryInfo = {
    base: 28000,
    commissions: 8500,
    bonuses: 4000,
    total: 40500,
    nextPayment: 'March 15, 2025',
    recentPayments: [
      { id: 1, date: 'Feb 15, 2025', amount: 39500 },
      { id: 2, date: 'Jan 15, 2025', amount: 41000 },
      { id: 3, date: 'Dec 15, 2024', amount: 42500 }
    ]
  };

  // Helper function for status colors
  const getStatusColor = (status) => {
    switch (status) {
      case 'checked-in': return 'bg-green-100 text-green-800';
      case 'checked-out': return 'bg-yellow-100 text-yellow-800';
      case 'absent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScheduleStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'in-progress': return 'bg-green-100 text-green-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSessionTypeColor = (type) => {
    return type === 'Personal' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800';
  };

  // Function to mark attendance (client-side only)
  const markAttendance = (id, status) => {
    const updatedMembers = filteredMembers.map(member => {
      if (member.id === id) {
        const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        return { ...member, checkInStatus: status, lastCheckIn: currentTime };
      }
      return member;
    });
    
    setAttendanceData(prevData => ({
      ...prevData,
      [selectedDate]: updatedMembers,
    }));
    
    // Update stats
    updateStats(selectedDate, updatedMembers);
  };

  // Function to handle date change
  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  // Function to update stats based on attendance data
  const updateStats = (date, members) => {
    const checkedIn = members.filter(m => m.checkInStatus === 'checked-in').length;
    const checkedOut = members.filter(m => m.checkInStatus === 'checked-out').length;
    const absent = members.filter(m => m.checkInStatus === 'absent').length;
    
    setStats({
      totalClients: users.length,
      checkedIn,
      checkedOut,
      absent
    });
  };

  // Fetch trainer details from API
  useEffect(() => {
    const firebaseId = Cookies.get('user_id'); // Read firebase_id from cookies
    if (firebaseId) {
      const fetchTrainerDetails = async () => {
        try {
          setLoading(true);
          const response = await api.get(`user/${firebaseId}/`, {
            firebase_id: firebaseId
          });
          setTrainerName(response.data.name);
          setTrainerId(response.data.id);
          
          // Now fetch assigned users with the trainer ID
          await fetchAssignedUsers(response.data.id);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching trainer details:', error);
          setLoading(false);
        }
      };
      fetchTrainerDetails();
    }
  }, []);

  // Fetch assigned users from API
  const fetchAssignedUsers = async (trainerId) => {
    if (!trainerId) return;
  
    try {
      const response = await api.get(`trainer/${trainerId}/assigned-users/`);
      const users = response.data.assigned_users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone_number,
        gender: user.gender || "Not Specified",
        isActive: user.is_active,
        subscription: user.subscriptions.length > 0 ? user.subscriptions[0].subscription.name : "No Subscription",
        startDate: user.subscriptions.length > 0 ? user.subscriptions[0].start_date : "N/A",
        endDate: user.subscriptions.length > 0 ? user.subscriptions[0].end_date : "N/A",
        status: user.subscriptions.length > 0 ? user.subscriptions[0].status : "Inactive"
      }));
  
      setAssignedUsers(users);
    } catch (error) {
      console.error('Error fetching assigned users:', error);
    }
  };
  

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-orange-500"></div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50">
      <TrainerSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col space-y-6">
              {/* Welcome Section */}
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 font-medium">
                    {trainerName.charAt(0)}{trainerName.split(' ')[1]?.charAt(0) || ''}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Welcome, {trainerName}</h1>
                    <p className="text-gray-500">Senior Fitness Trainer</p>
                  </div>
                </div>
                <div className="flex space-x-3 mt-4 md:mt-0">
                  <Button className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors">
                    <Clock className="h-4 w-4 mr-2" />
                    Check In
                  </Button>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-gray-500">Total Clients</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <h3 className="text-2xl font-bold text-gray-900">{stats.totalClients}</h3>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-gray-500">Checked In</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <h3 className="text-2xl font-bold text-gray-900">{stats.checkedIn}</h3>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-gray-500">Checked Out</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <h3 className="text-2xl font-bold text-gray-900">{stats.checkedOut}</h3>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-gray-500">Absent</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <h3 className="text-2xl font-bold text-gray-900">{stats.absent}</h3>
                  </CardContent>
                </Card>
              </div>

              {/* Date Selector */}
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-500">Select Date:</label>
                <select
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                >
                  {availableDates.map((date) => (
                    <option key={date} value={date}>
                      {new Date(date).toLocaleDateString('en-GB')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tabs Section */}
              <Tabs defaultValue="attendance" className="w-full">
                <TabsList className="grid grid-cols-3 w-full md:w-auto">
                  <TabsTrigger value="attendance">Attendance</TabsTrigger>
                  <TabsTrigger value="schedule">Schedule</TabsTrigger>
                  <TabsTrigger value="salary">Salary</TabsTrigger>
                </TabsList>

                {/* Attendance Tab */}
                <TabsContent value="attendance">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Check-in</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
  {assignedUsers.map((user) => (
    <tr key={user.id} className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 font-medium">
            {user.name.charAt(0)}
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900">{user.name}</div>
            <div className="text-xs text-gray-500">{user.gender}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{user.email}</div>
        <div className="text-xs text-gray-500">{user.phone}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 py-1 text-xs rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {user.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{user.subscription}</div>
        <div className="text-xs text-gray-500">Valid: {user.startDate} - {user.endDate}</div>
      </td>
    </tr>
  ))}
</tbody>
                    </table>
                  </div>
                </TabsContent>

                {/* Schedule Tab */}
                <TabsContent value="schedule">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
                    <div className="md:col-span-2">
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <h3 className="text-lg font-semibold mb-4">Today's Schedule ({new Date().toLocaleDateString('en-GB')})</h3>
                        <div className="space-y-4">
                          {schedule.map(session => (
                            <div key={session.id} className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-100">
                              <div className="flex items-center">
                                <div className="mr-4 text-gray-500">
                                  <Calendar className="h-5 w-5" />
                                </div>
                                <div>
                                  <p className="font-medium">{session.client}</p>
                                  <p className="text-sm text-gray-500">{session.time}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className={`px-2 py-1 text-xs rounded-md ${getSessionTypeColor(session.type)}`}>
                                  {session.type}
                                </span>
                                <span className={`px-2 py-1 text-xs rounded-md ${getScheduleStatusColor(session.status)}`}>
                                  {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                                </span>
                                <button className="text-gray-400 hover:text-gray-600">
                                  <MoreHorizontal className="h-5 w-5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Salary Tab */}
                <TabsContent value="salary">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
                    <div className="md:col-span-2">
                      <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="text-lg font-semibold mb-4">Earnings Breakdown</h3>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-500 mb-1">Base Salary</p>
                            <p className="text-2xl font-bold">₹{salaryInfo.base}</p>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-500 mb-1">Commissions</p>
                            <p className="text-2xl font-bold">₹{salaryInfo.commissions}</p>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-500 mb-1">Bonuses</p>
                            <p className="text-2xl font-bold">₹{salaryInfo.bonuses}</p>
                          </div>
                          <div className="bg-green-50 p-4 rounded-lg">
                            <p className="text-sm text-green-700 mb-1">Total Earnings</p>
                            <p className="text-2xl font-bold text-green-700">₹{salaryInfo.total}</p>
                          </div>
                        </div>
                        <div className="mt-8">
                          <h4 className="font-medium mb-3">Next Payment</h4>
                          <div className="bg-blue-50 p-4 rounded-lg flex items-center justify-between">
                            <div>
                              <span className="text-sm text-blue-800">Expected on {salaryInfo.nextPayment}</span>
                            </div>
                            <span className="font-bold text-blue-800">₹{salaryInfo.total}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default GymTrainerDashboard;