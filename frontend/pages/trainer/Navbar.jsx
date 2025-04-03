import React from 'react';
import { Dumbbell, Search, Bell, MessageCircle } from 'lucide-react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import AvatarIcon from './profile/AvatarIcon';

const Navbar = ({ searchQuery, setSearchQuery }) => {
  const router = useRouter();
  
  // Dummy user data - in a real app, this would come from authentication context
  const currentUser = {
    name: "John Doe",
    user_type: "trainer",
    profile_picture_url: null
  };

  return (
    <div className="bg-white shadow z-10">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center md:hidden">
            <Dumbbell className="h-8 w-8 text-orange-500" />
            <h1 className="ml-2 text-xl font-bold">FitPro</h1>
          </div>
          
          <div className="flex-1 px-2 flex justify-end sm:justify-between">
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
            
            <div className="flex items-center">
             
              <Link href="/trainer/messages" className="inline-block">
                <button
                  className="p-1 text-gray-400 rounded-full hover:bg-gray-100 focus:outline-none mr-4 flex items-center gap-1"
                >
                  Messages
                  <MessageCircle className="h-6 w-6" />
                </button>
              </Link>
              
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;