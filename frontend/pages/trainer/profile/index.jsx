import React, { useState } from 'react';
import { Calendar, Edit, Mail, Phone, MapPin, Award, Clock, Users, Save, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/router';

const TrainerProfile = () => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  
  // Dummy trainer data based on your User model
  const [trainerData, setTrainerData] = useState({
    user_id: "TR12345",
    email: "trainer@fitpro.com",
    name: "John Doe",
    user_type: "trainer",
    date_of_birth: "1990-05-15",
    gender: "male",
    phone_number: "+1 (555) 123-4567",
    profile_picture_url: null,
    specializations: ["Weight Training", "HIIT", "Nutrition"],
    experience_years: 5,
    certifications: ["ACE Certified Personal Trainer", "NASM Fitness Nutrition Specialist"],
    availability: "Mon-Fri: 6AM-8PM, Sat: 8AM-2PM",
    client_count: 12,
    hourly_rate: "$60/hour",
    biography: "Dedicated fitness professional with 5+ years of experience helping clients achieve their fitness goals through personalized training programs.",
    location: "Downtown Fitness Center, New York"
  });
  
  const [formData, setFormData] = useState({...trainerData});
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setTrainerData(formData);
    setIsEditing(false);
    // In a real app, this would include an API call to update the profile
  };
  
  const goBack = () => {
    router.back();
  };
  
  const initials = trainerData.name.split(' ').map(n => n[0]).join('').toUpperCase();
  
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <button 
        onClick={goBack}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back
      </button>
      
      <div className="bg-white shadow overflow-hidden rounded-lg">
        {/* Profile Header */}
        <div className="bg-orange-500 px-4 py-5 sm:px-6 flex justify-between">
          <div className="flex items-center">
            {trainerData.profile_picture_url ? (
              <img 
                src={trainerData.profile_picture_url} 
                alt="Profile" 
                className="h-16 w-16 rounded-full object-cover border-2 border-white" 
              />
            ) : (
              <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center text-orange-500 text-xl font-bold">
                {initials}
              </div>
            )}
            <div className="ml-4 text-white">
              <h3 className="text-2xl font-bold">{trainerData.name}</h3>
              <p className="text-orange-100">{trainerData.user_type.charAt(0).toUpperCase() + trainerData.user_type.slice(1)}</p>
            </div>
          </div>
          
          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              className="bg-white text-orange-500 px-4 py-2 rounded-md flex items-center"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </button>
          )}
        </div>
        
        {/* Profile Content */}
        {isEditing ? (
          <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input
                  type="text"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Hourly Rate</label>
                <input
                  type="text"
                  name="hourly_rate"
                  value={formData.hourly_rate}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Biography</label>
                <textarea
                  name="biography"
                  rows="4"
                  value={formData.biography}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                ></textarea>
              </div>
              
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Availability</label>
                <input
                  type="text"
                  name="availability"
                  value={formData.availability}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 mr-3"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-orange-500 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <h4 className="text-lg font-bold text-gray-900 mb-4">Trainer Information</h4>
              </div>
              
              <div>
                <div className="flex items-center text-gray-500 mb-2">
                  <Mail className="h-5 w-5 mr-2" />
                  <span className="text-sm">Email</span>
                </div>
                <p className="text-gray-900">{trainerData.email}</p>
              </div>
              
              <div>
                <div className="flex items-center text-gray-500 mb-2">
                  <Phone className="h-5 w-5 mr-2" />
                  <span className="text-sm">Phone</span>
                </div>
                <p className="text-gray-900">{trainerData.phone_number}</p>
              </div>
              
              <div>
                <div className="flex items-center text-gray-500 mb-2">
                  <Calendar className="h-5 w-5 mr-2" />
                  <span className="text-sm">Date of Birth</span>
                </div>
                <p className="text-gray-900">{trainerData.date_of_birth}</p>
              </div>
              
              <div>
                <div className="flex items-center text-gray-500 mb-2">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span className="text-sm">Location</span>
                </div>
                <p className="text-gray-900">{trainerData.location}</p>
              </div>
              
              <div className="sm:col-span-2">
                <div className="flex items-center text-gray-500 mb-2">
                  <Award className="h-5 w-5 mr-2" />
                  <span className="text-sm">Specializations</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {trainerData.specializations.map((spec, index) => (
                    <span key={index} className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="sm:col-span-2">
                <div className="flex items-center text-gray-500 mb-2">
                  <Users className="h-5 w-5 mr-2" />
                  <span className="text-sm">Clients</span>
                </div>
                <p className="text-gray-900">{trainerData.client_count} active clients</p>
              </div>
              
              <div>
                <div className="flex items-center text-gray-500 mb-2">
                  <Clock className="h-5 w-5 mr-2" />
                  <span className="text-sm">Availability</span>
                </div>
                <p className="text-gray-900">{trainerData.availability}</p>
              </div>
              
              <div>
                <div className="flex items-center text-gray-500 mb-2">
                  <span className="text-sm">Hourly Rate</span>
                </div>
                <p className="text-gray-900">{trainerData.hourly_rate}</p>
              </div>
              
              <div className="sm:col-span-2">
                <div className="flex items-center text-gray-500 mb-2">
                  <span className="text-sm">Biography</span>
                </div>
                <p className="text-gray-900">{trainerData.biography}</p>
              </div>
              
              <div className="sm:col-span-2">
                <div className="flex items-center text-gray-500 mb-2">
                  <span className="text-sm">Certifications</span>
                </div>
                <ul className="list-disc pl-5 text-gray-900">
                  {trainerData.certifications.map((cert, index) => (
                    <li key={index}>{cert}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainerProfile;