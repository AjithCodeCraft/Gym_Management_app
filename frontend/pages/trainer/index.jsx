import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, Activity, MoreHorizontal } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import TrainerSidebar from './TrainerSidebar';
import Navbar from './Navbar';
import Cookies from 'js-cookie';
import api from "@/pages/api/axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const GymTrainerDashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }); // Default to today
  const [trainerName, setTrainerName] = useState('');
  const [trainerId, setTrainerId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState({});
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showCheckOutModal, setShowCheckOutModal] = useState(false);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [checkOutLoading, setCheckOutLoading] = useState(false);
  const [trainerCheckInStatus, setTrainerCheckInStatus] = useState(null);

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
    updateStatsForDate(date);
  };

  // Function to update stats based on attendance data for a specific date
  const updateStatsForDate = (date) => {
    const membersForDate = assignedUsers.map(user => {
      const attendanceForDate = user.attendance.find(att => att.created_at.split('T')[0] === date);
      return {
        ...user,
        checkInTime: attendanceForDate ? attendanceForDate.check_in_time : null,
        checkOutTime: attendanceForDate ? attendanceForDate.check_out_time : null,
      };
    });

    const checkedIn = membersForDate.filter(m => m.checkInTime).length;
    const checkedOut = membersForDate.filter(m => m.checkOutTime).length;
    const absent = membersForDate.length - checkedIn;

    setStats({
      totalClients: membersForDate.length,
      checkedIn,
      checkedOut,
      absent
    });
  };

  // Function to update stats based on attendance data
  const updateStats = (date, members) => {
    const checkedIn = members.filter(m => m.checkInStatus === 'checked-in').length;
    const checkedOut = members.filter(m => m.checkInStatus === 'checked-out').length;
    const absent = members.filter(m => m.checkInStatus === 'absent').length;

    setStats({
      totalClients: members.length,
      checkedIn,
      checkedOut,
      absent
    });
  };

  // Fetch trainer details from API
  useEffect(() => {
    const firebaseId = Cookies.get('trainer_id'); // Read firebase_id from cookies
    if (firebaseId) {
      const fetchTrainerDetails = async () => {
        try {
          setLoading(true);
          const response = await api.get(`user/${firebaseId}/`, {
            headers: {
              Authorization: `Bearer ${Cookies.get('access_token')}`
            }
          });
          setTrainerName(response.data.name);
          setTrainerId(response.data.id);
          Cookies.set('id', response.data.id);

          // Fetch assigned users initially
          await fetchAssignedUsers(response.data.id);

          // Fetch trainer's check-in status
          await fetchTrainerCheckInStatus();

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
      const response = await api.get(`trainer/${trainerId}/assigned-users/`, {
        headers: {
          Authorization: `Bearer ${Cookies.get('access_token')}`
        }
      });
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
        status: user.subscriptions.length > 0 ? user.subscriptions[0].status : "Inactive",
        attendance: user.attendance
      }));

      setAssignedUsers(users);
      sessionStorage.setItem("assignedUsers", JSON.stringify(users));

      // Extract unique dates from attendance records
      const dates = [...new Set(users.flatMap(user => user.attendance.map(att => att.created_at.split('T')[0])))];
      setAvailableDates(dates);

      // Update stats for the selected date
      updateStatsForDate(selectedDate);
    } catch (error) {
      console.log('Error fetching assigned users:', error);
    }
  };

  // Fetch trainer's check-in status
  const fetchTrainerCheckInStatus = async () => {
    const trainer_id = Cookies.get('id')
    const token = Cookies.get('access_token');
    if (!token) {
      console.error("Access token is missing.");
      return;
    }

    try {
      const response = await api.get(`trainer/${trainer_id}/`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const attendance = response.data.attendance;
      const today = new Date().toISOString().split('T')[0];
      const todayAttendance = attendance.find(att => att.created_at.split('T')[0] === today);

      if (todayAttendance) {
        if (todayAttendance.check_out_time) {
          setTrainerCheckInStatus('checked-out');
        } else {
          setTrainerCheckInStatus('checked-in');
        }
      } else {
        setTrainerCheckInStatus(null);
      }
    } catch (error) {
      console.log('Error fetching trainer check-in status:', error);
    }
  };

  // Function to format time to hh:mm
  const formatTime = (time) => {
    if (!time) return 'N/A';
    const timeParts = time.split(':');
    return `${timeParts[0]}:${timeParts[1]}`;
  };

  // Function to handle check-in
  const handleCheckIn = async () => {
    if (!selectedUser || !selectedTimeSlot) {
      toast.error('Please select a user and a time slot.');
      return;
    }

    const token = Cookies.get('access_token');
    if (!token) {
      console.error("Access token is missing.");
      return;
    }

    // Format the selected time slot to "HH:MM:SS"
    const formattedTimeSlot = `${selectedTimeSlot}:00`;

    setCheckInLoading(true);

    try {
      const response = await api.post('attendance/check-in/', {
        user_id: selectedUser.id,
        check_in_time: formattedTimeSlot
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 201) {
        toast.success('Check-in successful!');
        setShowCheckInModal(false);
        // Update the attendance data locally
        const updatedMembers = assignedUsers.map(user => {
          if (user.id === selectedUser.id) {
            return { ...user, attendance: [{ check_in_time: formattedTimeSlot, check_out_time: null, created_at: new Date().toISOString() }] };
          }
          return user;
        });
        setAssignedUsers(updatedMembers);
        updateStatsForDate(selectedDate);
      } else if (response.status === 400 && response.data.message === 'User has already checked in today') {
        toast.error('User has already checked in today');
      } else {
        toast.error('Check-in failed. Please try again.');
      }
    } catch (error) {
      console.log('Error checking in:', error);
      toast.error('Check-in failed. Please try again.');
    } finally {
      setCheckInLoading(false);
    }
  };

  // Function to handle check-out
  const handleCheckOut = async () => {
    if (!selectedUser || !selectedTimeSlot) {
      toast.error('Please select a user and a time slot.');
      return;
    }

    const token = Cookies.get('access_token');
    if (!token) {
      console.error("Access token is missing.");
      return;
    }

    // Format the selected time slot to "HH:MM:SS"
    const formattedTimeSlot = `${selectedTimeSlot}:00`;

    setCheckOutLoading(true);

    try {
      const response = await api.post('attendance/check-out/', {
        user_id: selectedUser.id,
        check_out_time: formattedTimeSlot
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        toast.success('Check-out successful!');
        setShowCheckOutModal(false);
        // Update the attendance data locally
        const updatedMembers = assignedUsers.map(user => {
          if (user.id === selectedUser.id) {
            return { ...user, attendance: [{ check_in_time: user.attendance[0]?.check_in_time, check_out_time: formattedTimeSlot, created_at: new Date().toISOString() }] };
          }
          return user;
        });
        setAssignedUsers(updatedMembers);
        updateStatsForDate(selectedDate);
      } else if (response.status === 400 && response.data.message === 'User has already checked out today') {
        toast.error('User has already checked out today');
      } else {
        toast.error('Check-out failed. Please try again.');
      }
    } catch (error) {
      console.log('Error checking out:', error);
      toast.error('Check-out failed. Please try again.');
    } finally {
      setCheckOutLoading(false);
    }
  };

  // Function to handle trainer check-in
  const handleTrainerCheckIn = async () => {
    const token = Cookies.get('access_token');
    if (!token) {
      console.error("Access token is missing.");
      return;
    }

    const currentTime = new Date().toISOString().split('T')[1].substring(0, 8);

    setCheckInLoading(true);

    try {
      const response = await api.post('trainer/checkin/', {
        trainer_id: trainerId,
        check_in_time: currentTime
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 201) {
        toast.success('Trainer check-in successful!');
        setTrainerCheckInStatus('checked-in');
        updateStatsForDate(selectedDate); // Update stats immediately
      } else if (response.status === 400 && response.data.message === 'Trainer has already checked in today') {
        toast.error('Trainer has already checked in today');
      } else {
        toast.error('Trainer check-in failed. Please try again.');
      }
    } catch (error) {
      console.log('Error checking in trainer:', error);
      toast.error('Trainer check-in failed. Please try again.');
    } finally {
      setCheckInLoading(false);
    }
  };

  // Function to handle trainer check-out
  const handleTrainerCheckOut = async () => {
    const token = Cookies.get('access_token');
    if (!token) {
      console.error("Access token is missing.");
      return;
    }

    const currentTime = new Date().toISOString().split('T')[1].substring(0, 8);

    setCheckOutLoading(true);

    try {
      const response = await api.post('trainer/checkout/', {
        trainer_id: trainerId,
        check_out_time: currentTime
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        toast.success('Trainer check-out successful!');
        setTrainerCheckInStatus('checked-out');
        updateStatsForDate(selectedDate); // Update stats immediately
      } else if (response.status === 400 && response.data.message === 'Trainer has already checked out today') {
        toast.error('Trainer has already checked out today');
      } else {
        toast.error('Trainer check-out failed. Please try again.');
      }
    } catch (error) {
      console.log('Error checking out trainer:', error);
      toast.error('Trainer check-out failed. Please try again.');
    } finally {
      setCheckOutLoading(false);
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
                  <Button onClick={handleTrainerCheckIn} className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors">
                    <Clock className="h-4 w-4 mr-2" />
                    <span className={`${checkInLoading ? 'animate-pulse' : ''}`}>Trainer Check In</span>
                  </Button>
                  <Button onClick={handleTrainerCheckOut} className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
                    <Clock className="h-4 w-4 mr-2" />
                    <span className={`${checkOutLoading ? 'animate-pulse' : ''}`}>Trainer Check Out</span>
                  </Button>
                </div>
              </div>

              {/* Trainer Check-In Status */}
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-500">Trainer Check-In Status:</label>
                <div className={`px-2 py-1 text-xs rounded-full ${trainerCheckInStatus === 'checked-in' ? 'bg-green-100 text-green-800' : trainerCheckInStatus === 'checked-out' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                  {trainerCheckInStatus === 'checked-in' ? 'Checked In' : trainerCheckInStatus === 'checked-out' ? 'Checked Out' : 'Not Checked In'}
                </div>
              </div>

              {/* Buttons for User Check-In and Check-Out */}
              <div className="flex space-x-3">
                <Button
                  onClick={() => setShowCheckInModal(true)}
                  className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                  disabled={trainerCheckInStatus !== 'checked-in'}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  User Check In
                </Button>
                <Button
                  onClick={() => setShowCheckOutModal(true)}
                  className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  disabled={trainerCheckInStatus !== 'checked-in'}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  User Check Out
                </Button>
              </div>

              {/* Check-In Modal */}
              {showCheckInModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                  <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h2 className="text-lg font-semibold mb-4">Check In</h2>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">Select User</label>
                      <select
                        value={selectedUser?.id || ''}
                        onChange={(e) => setSelectedUser(assignedUsers.find(user => user.id === parseInt(e.target.value)))}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      >
                        <option value="">Select a user</option>
                        {assignedUsers.map(user => (
                          <option key={user.id} value={user.id}>{user.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">Select Time Slot</label>
                      <input
                        type="time"
                        value={selectedTimeSlot}
                        onChange={(e) => setSelectedTimeSlot(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button onClick={handleCheckIn} className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors" disabled={trainerCheckInStatus !== 'checked-in'}>
                        {checkInLoading ? 'Checking In...' : 'Check In'}
                      </Button>
                      <Button onClick={() => setShowCheckInModal(false)} className="ml-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors">
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Check-Out Modal */}
              {showCheckOutModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                  <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h2 className="text-lg font-semibold mb-4">Check Out</h2>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">Select User</label>
                      <select
                        value={selectedUser?.id || ''}
                        onChange={(e) => setSelectedUser(assignedUsers.find(user => user.id === parseInt(e.target.value)))}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      >
                        <option value="">Select a user</option>
                        {assignedUsers.map(user => (
                          <option key={user.id} value={user.id}>{user.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">Select Time Slot</label>
                      <input
                        type="time"
                        value={selectedTimeSlot}
                        onChange={(e) => setSelectedTimeSlot(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button onClick={handleCheckOut} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors" disabled={trainerCheckInStatus !== 'checked-in'}>
                        {checkOutLoading ? 'Checking Out...' : 'Check Out'}
                      </Button>
                      <Button onClick={() => setShowCheckOutModal(false)} className="ml-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors">
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}

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
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-in Time</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-out Time</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {assignedUsers.map((user) => {
                          const attendanceForDate = user.attendance.find(att => att.created_at.split('T')[0] === selectedDate);
                          return (
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
                                <div className="text-sm text-gray-900">
                                  {attendanceForDate ? formatTime(attendanceForDate.check_in_time) : 'N/A'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {attendanceForDate ? formatTime(attendanceForDate.check_out_time) : 'N/A'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  onClick={() => markAttendance(user.id, 'checked-in')}
                                  className="text-green-600 hover:text-green-900"
                                  disabled={trainerCheckInStatus !== 'checked-in'}
                                >
                                  <CheckCircle className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => markAttendance(user.id, 'checked-out')}
                                  className="text-yellow-600 hover:text-yellow-900 ml-2"
                                  disabled={trainerCheckInStatus !== 'checked-in'}
                                >
                                  <XCircle className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => markAttendance(user.id, 'absent')}
                                  className="text-red-600 hover:text-red-900 ml-2"
                                  disabled={trainerCheckInStatus !== 'checked-in'}
                                >
                                  <Activity className="h-5 w-5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
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
          <ToastContainer />
        </main>
      </div>
    </div>
  );
};

export default GymTrainerDashboard;
