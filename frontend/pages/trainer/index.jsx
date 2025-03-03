import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, Activity, MoreHorizontal } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import TrainerSidebar from './TrainerSidebar';
import Navbar from './Navbar';

const GymTrainerDashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // Default to today

  // Sample attendance data grouped by date
  const [attendanceData, setAttendanceData] = useState({
    '2025-03-01': [
      { id: 1, name: 'John Doe', email: 'john@example.com', gender: 'male', phone: '+1234567890', checkInStatus: 'checked-in', lastCheckIn: '08:30 AM' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', gender: 'female', phone: '+0987654321', checkInStatus: 'absent', lastCheckIn: 'N/A' },
    ],
    '2025-03-02': [
      { id: 1, name: 'John Doe', email: 'john@example.com', gender: 'male', phone: '+1234567890', checkInStatus: 'checked-in', lastCheckIn: '08:30 AM' },
      { id: 3, name: 'Mike Johnson', email: 'mike@example.com', gender: 'male', phone: '+1239874560', checkInStatus: 'checked-out', lastCheckIn: '10:15 AM' },
      { id: 4, name: 'Sara Williams', email: 'sara@example.com', gender: 'female', phone: '+3216549870', checkInStatus: 'checked-in', lastCheckIn: '09:45 AM' },
    ],
    '2025-03-03': [
      { id: 5, name: 'Robert Chen', email: 'robert@example.com', gender: 'male', phone: '+4567891230', checkInStatus: 'checked-in', lastCheckIn: '07:50 AM' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', gender: 'female', phone: '+0987654321', checkInStatus: 'absent', lastCheckIn: 'N/A' },
    ],
  });

  // Get attendance for the selected date
  const filteredMembers = attendanceData[selectedDate] || [];

  const schedule = [
    { id: 1, time: '06:00 - 07:00', client: 'Group Class: Morning HIIT', type: 'Group', status: 'completed' },
    { id: 2, time: '08:00 - 09:00', client: 'John Doe', type: 'Personal', status: 'completed' },
    { id: 3, time: '10:00 - 11:00', client: 'Sara Williams', type: 'Personal', status: 'in-progress' },
    { id: 4, time: '13:00 - 14:00', client: 'Group Class: Core Strength', type: 'Group', status: 'upcoming' },
    { id: 5, time: '15:00 - 16:00', client: 'Mike Johnson', type: 'Personal', status: 'upcoming' }
  ];

  const stats = {
    totalClients: 12,
    checkedIn: 8,
    checkedOut: 2,
    absent: 2
  };

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

  // Function to mark attendance
  const markAttendance = (id, status) => {
    const updatedMembers = filteredMembers.map(member => {
      if (member.id === id) {
        const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        return { ...member, checkInStatus: status, lastCheckIn: currentTime };
      }
      return member;
    });
    setAttendanceData((prevData) => ({
      ...prevData,
      [selectedDate]: updatedMembers,
    }));
  };

  // Function to handle date change
  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  // Get list of available dates
  const availableDates = Object.keys(attendanceData).sort((a, b) => new Date(b) - new Date(a));

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
                    JD
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Welcome, John Doe</h1>
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
                        {filteredMembers.map((member) => (
                          <tr key={member.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 font-medium">
                                  {member.name.charAt(0)}
                                </div>
                                <div className="ml-3">
                                  <div className="text-sm font-medium text-gray-900">{member.name}</div>
                                  <div className="text-xs text-gray-500">{member.gender.charAt(0).toUpperCase() + member.gender.slice(1)}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{member.email}</div>
                              <div className="text-xs text-gray-500">{member.phone}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(member.checkInStatus)}`}>
                                {member.checkInStatus === 'checked-in' ? 'Checked In' :
                                 member.checkInStatus === 'checked-out' ? 'Checked Out' : 'Absent'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {member.lastCheckIn}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="h-8 w-8 p-0"
                                  onClick={() => markAttendance(member.id, 'checked-in')}
                                >
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="h-8 w-8 p-0"
                                  onClick={() => markAttendance(member.id, 'checked-out')}
                                >
                                  <XCircle className="h-4 w-4 text-red-500" />
                                </Button>
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
                </TabsContent>

                {/* Schedule Tab */}
                <TabsContent value="schedule">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
                    <div className="md:col-span-2">
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <h3 className="text-lg font-semibold mb-4">Today's Schedule (March 2, 2025)</h3>
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