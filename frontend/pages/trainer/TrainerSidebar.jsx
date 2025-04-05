import React, { useEffect, useState } from 'react';
import { Dumbbell, BarChart, Calendar, Users, Settings, LogOut, Menu } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import api from "@/pages/api/axios";
import AvatarIcon from './profile/AvatarIcon';

const TrainerSidebar = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [trainerName, setTrainerName] = useState("");

  useEffect(() => {
    const firebaseId = Cookies.get('trainer_id'); 

    if (firebaseId) {
      const fetchTrainerDetails = async () => {
        try {
          const response = await api.get(`user/${firebaseId}/`, {
            headers: {
              Authorization: `Bearer ${Cookies.get('access_token')}`
            }
          });

          setTrainerName(response.data.name);
        } catch (error) {
          console.error('Error fetching trainer details:', error);
          setTrainerName("Unknown Trainer");
        }
      };

      fetchTrainerDetails();
    }
  }, []);

  const isActive = (path) => router.pathname === path;

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    Cookies.remove('trainer_id');
    Cookies.remove('access_token');
    Cookies.remove('id');
    router.push('/login'); // Redirect to login page after logout
  };

  // Extract initials from the trainer name
  const getInitials = (name) => {
    const words = name.split(" ");
    return words.length > 1
      ? words[0][0] + words[1][0]
      : words[0][0];
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
            <h1 className="ml-2 text-xl font-bold">FortiFit</h1>
          </div>

          {/* Navigation Links */}
          <div className="flex-grow flex flex-col px-2 mt-2 md:mt-4">
            <div className="space-y-1">
              <Link href="/trainer">
                <button
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                    isActive('/trainer/dashboard') ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <BarChart className="mr-3 h-5 w-5" />
                  Dashboard
                </button>
              </Link>

              <div className="my-4 border-t border-gray-200 w-full"></div>

            

              <Link href="/trainer/clients">
                <button
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                    isActive('/trainer/clients') ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Users className="mr-3 h-5 w-5" />
                  Clients
                </button>
              </Link>

              
            </div>
          </div>

          {/* Footer - User Profile and Logout */}
          <div className="px-4 py-4 mt-auto border-t border-gray-200">
            <div className="flex items-center">
              {/* Profile Icon with Initials */}
              <AvatarIcon user={{ name: getInitials(trainerName) }} />

              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{trainerName}</p>
                <button onClick={handleLogout} className="flex items-center text-xs text-red-500 mt-1">
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
