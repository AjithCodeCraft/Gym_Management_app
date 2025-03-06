import React from 'react';
import { Search, Bell } from 'lucide-react';
import Image from 'next/image'; // Import the Image component from Next.js

const Navbar = ({ searchQuery, setSearchQuery }) => {
  return (
    <div className="bg-white shadow z-10">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Mobile Logo */}
          <div className="flex items-center md:hidden">
            <Image
              src="/g308.png" // Path to your logo in the public folder
              alt="FitPro Gym Logo"
              width={70} // Adjust the width as needed
              height={40} // Adjust the height as needed
              className="object-contain" // Ensures the image scales correctly
            />
            <h1 className="ml-2 text-xl font-bold">FortiFit Gym</h1>
          </div>

          <div className="flex-1 px-2 flex justify-end sm:justify-between">
            {/* Search Bar */}
            <div className="hidden sm:flex max-w-lg w-full">
              <div className="w-full relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search members or trainers..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Notification and Profile */}
            <div className="flex items-center">
              <button className="p-1 text-gray-400 rounded-full hover:bg-gray-100 focus:outline-none mr-4">
                <Bell className="h-6 w-6" />
              </button>
              <div className="md:hidden w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white">
                AD
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;