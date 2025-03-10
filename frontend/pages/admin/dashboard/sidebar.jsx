import React, { useState } from 'react';
import { Dumbbell, BarChart, User, Users, Calendar, Settings, LogOut, Menu } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Image from 'next/image'; // Import the Image component from Next.js

const AdminSidebar = () => {
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
      <button onClick={toggleMenu} className="md:hidden p-2 text-gray-600 focus:outline-none">
        <Menu className="h-6 w-6" />
      </button>
      <div className={`fixed md:static inset-y-0 left-0 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out z-30 md:z-0 w-64 bg-white shadow-md md:h-auto`}>
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="flex items-center flex-shrink-0 px-6 py-5 md:py-4">
            <Image
              src="/g308.png" // Path to your logo in the public folder
              alt="FitPro Gym Logo"
              width={60} // Adjust the width as needed
              height={40} // Adjust the height as needed
              className="object-contain" // Ensures the image scales correctly
            />
             <h1 className="ml-2 text-xl font-bold">FortiFit Gym</h1>
          </div>

          <div className="flex-grow flex flex-col px-2 mt-2 md:mt-4">
            <div className="space-y-1">
              <Link href="/admin/dashboard" className="w-full">
                <button
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                    isActive('/admin/dashboard')
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <BarChart className="mr-3 h-5 w-5" />
                  Dashboard
                </button>
              </Link>

              {/* Adding a gap between Dashboard and Members */}
              <div className="my-4 border-t border-gray-200 w-full"></div>

       <Link href="/admin/dashboard/members" className="w-full">
              <button
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                  isActive('/admin/dashboard/members')
                    ? 'bg-orange-500 text-white'// Change background to gray and text to orange
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <User className="mr-3 h-5 w-5" />
                Members
              </button>
            </Link>


              <Link href="/admin/dashboard/addplan" className="w-full">
                <button
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                    isActive('/admin/dashboard/addplan')
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Calendar className="mr-3 h-5 w-5" />
                  Add Plan
                </button>
              </Link>

              <Link href="/admin/settings" className="w-full">
                <button
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                    isActive('/admin/settings')
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

          <div className="px-4 py-4 mt-auto border-t border-gray-200">
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
      {isOpen && <div onClick={toggleMenu} className="fixed inset-0 bg-black opacity-50 md:hidden"></div>}
    </>
  );
};

export default AdminSidebar;