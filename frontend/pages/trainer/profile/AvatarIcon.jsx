import React from 'react';
import { User } from 'lucide-react';
import { useRouter } from 'next/router';
import Link from 'next/link';

const AvatarIcon = ({ user }) => {
  const router = useRouter();
  
  // Default values in case user data is incomplete
  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
  const profilePicture = user?.profile_picture_url || null;
  
  const navigateToProfile = () => {
    router.push('/trainer/profile');
  };
  
  return (
    <div className="relative">
      <button 
        onClick={navigateToProfile}
        className="flex items-center focus:outline-none"
        aria-label="Open profile menu"
      >
        {profilePicture ? (
          <img 
            src={profilePicture} 
            alt="Profile picture" 
            className="w-8 h-8 rounded-full object-cover border-2 border-orange-500"
          />
        ) : (
          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white">
            {initials}
          </div>
        )}
      </button>
    </div>
  );
};

export default AvatarIcon;