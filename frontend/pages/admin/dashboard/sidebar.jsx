import React from 'react';
import { Dumbbell, BarChart, User, Users, Calendar, Settings, LogOut } from 'lucide-react';

const AdminSidebar = () => {
  return (
    <div className="hidden md:flex md:w-64 md:flex-col bg-white shadow-md">
      <div className="flex flex-col flex-grow pt-5">
        <div className="flex items-center flex-shrink-0 px-4 mb-8">
          <Dumbbell className="h-8 w-8 text-orange-500" />
          <h1 className="ml-2 text-xl font-bold">FitPro Gym</h1>
        </div>

        <div className="mt-5 flex-grow flex flex-col px-2">
          <div className="space-y-1">
            <button className="w-full flex items-center px-4 py-3 text-sm font-medium text-white bg-orange-500 rounded-md">
              <BarChart className="mr-3 h-5 w-5" />
              Dashboard
            </button>
            <button className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-100">
              <User className="mr-3 h-5 w-5" />
              Members
            </button>
            <button className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-100">
              <Users className="mr-3 h-5 w-5" />
              Trainers
            </button>
            <button className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-100">
              <Calendar className="mr-3 h-5 w-5" />
              Schedule
            </button>
            <button className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-100">
              <Settings className="mr-3 h-5 w-5" />
              Settings
            </button>
          </div>
        </div>

        <div className="px-4 py-4 mt-6 border-t border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-semibold">
              AD
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">Admin User</p>
              <button className="flex items-center text-xs text-red-500 mt-1">
                <LogOut className="h-3 w-3 mr-1" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
