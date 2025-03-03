import React, { useState } from 'react';
import { Dumbbell, BarChart, Calendar, Users, MessageSquare, Settings, LogOut, Menu } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const TrainerSidebar = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path) => {
    return router.pathname === path;
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button onClick={toggleMenu} className="md:hidden p-2 text-gray-600 focus:outline-none">
        <Menu className="h-6 w-6" />
      </button>

      {/* Sidebar */}
      <div className={`fixed md:static inset-y-0 left-0 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out z-30 md:z-0 w-64 bg-white shadow-md md:h-auto`}>
        <div className="flex flex-col h-full">
          {/* Logo and Brand */}
          <div className="flex items-center flex-shrink-0 px-4 py-5 md:py-4">
            <Dumbbell className="h-8 w-8 text-orange-500" />
            <h1 className="ml-2 text-xl font-bold">FitPro Gym</h1>
          </div>

          {/* Navigation Links */}
          <div className="flex-grow flex flex-col px-2 mt-2 md:mt-4">
            <div className="space-y-1">
              <Link href="/trainer" className="w-full">
                <button
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                    isActive('/trainer/dashboard')
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <BarChart className="mr-3 h-5 w-5" />
                  Dashboard
                </button>
              </Link>

              <div className="my-4 border-t border-gray-200 w-full"></div>

              <Link href="/trainer/schedule" className="w-full">
                <button
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                    isActive('/trainer/schedule')
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Calendar className="mr-3 h-5 w-5" />
                  Schedule
                </button>
              </Link>

              <Link href="/trainer/clients" className="w-full">
                <button
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                    isActive('/trainer/clients')
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Users className="mr-3 h-5 w-5" />
                  Clients
                </button>
              </Link>

              

              <Link href="/trainer/settings" className="w-full">
                <button
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                    isActive('/trainer/settings')
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Settings className="mr-3 h-5 w-5" />
                  Settings
                </button>
              </Link>
            </div>
          </div>

          {/* Footer - User Profile and Logout */}
          <div className="px-4 py-4 mt-auto border-t border-gray-200">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-semibold">
                JD
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">John Doe</p>
                <button className="flex items-center text-xs text-red-500 mt-1">
                  <LogOut className="h-3 w-3 mr-1" />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for Mobile */}
      {isOpen && <div onClick={toggleMenu} className="fixed inset-0 bg-black opacity-50 md:hidden"></div>}
    </>
  );
};

export default TrainerSidebar;