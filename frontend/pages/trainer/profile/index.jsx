import React, { useState } from 'react';
import { Calendar, Edit, Mail, Phone, Award, Clock, Save, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/router';

const TrainerProfile = () => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  
  // Dummy trainer data with only the requested fields
  const [trainerData, setTrainerData] = useState({
    name: "John Doe",
    email: "trainer@fitpro.com",
    phone_number: "+91 9876543210",
    gender: "male",
    specialization: ["Weight Training", "HIIT", "Nutrition"],
    availability: "Both",
    experience_years: 5,
    qualifications: ["ACE Certified Personal Trainer", "NASM Fitness Nutrition Specialist"],
    salary: "₹50,000/month",
    date_of_birth: "1990-05-15",
    profile_picture_url: null
  });
  
  const [formData, setFormData] = useState({...trainerData});
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleGenderChange = (gender) => {
    setFormData({
      ...formData,
      gender
    });
  };
  
  const handleAvailabilityChange = (availability) => {
    setFormData({
      ...formData,
      availability
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
              <p className="text-orange-100">Trainer</p>
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
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                    +91
                  </span>
                  <input
                    type="text"
                    name="phone_number"
                    value={formData.phone_number.replace('+91 ', '')}
                    onChange={handleInputChange}
                    className="flex-1 block w-full rounded-none rounded-r-md border-gray-300 focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  />
                </div>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <div className="flex space-x-4">
                  <div className="flex items-center">
                    <input
                      id="male"
                      name="gender"
                      type="radio"
                      checked={formData.gender === 'male'}
                      onChange={() => handleGenderChange('male')}
                      className="focus:ring-orange-500 h-4 w-4 text-orange-600 border-gray-300"
                    />
                    <label htmlFor="male" className="ml-2 block text-sm text-gray-700">
                      Male
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="female"
                      name="gender"
                      type="radio"
                      checked={formData.gender === 'female'}
                      onChange={() => handleGenderChange('female')}
                      className="focus:ring-orange-500 h-4 w-4 text-orange-600 border-gray-300"
                    />
                    <label htmlFor="female" className="ml-2 block text-sm text-gray-700">
                      Female
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="others"
                      name="gender"
                      type="radio"
                      checked={formData.gender === 'others'}
                      onChange={() => handleGenderChange('others')}
                      className="focus:ring-orange-500 h-4 w-4 text-orange-600 border-gray-300"
                    />
                    <label htmlFor="others" className="ml-2 block text-sm text-gray-700">
                      Others
                    </label>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Specialization</label>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization.join(', ')}
                  onChange={(e) => setFormData({...formData, specialization: e.target.value.split(', ')})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  placeholder="E.g. Weight Training, HIIT, Nutrition"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                <div className="flex space-x-4">
                  <div className="flex items-center">
                    <input
                      id="morning"
                      name="availability"
                      type="radio"
                      checked={formData.availability === 'Morning'}
                      onChange={() => handleAvailabilityChange('Morning')}
                      className="focus:ring-orange-500 h-4 w-4 text-orange-600 border-gray-300"
                    />
                    <label htmlFor="morning" className="ml-2 block text-sm text-gray-700">
                      Morning
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="evening"
                      name="availability"
                      type="radio"
                      checked={formData.availability === 'Evening'}
                      onChange={() => handleAvailabilityChange('Evening')}
                      className="focus:ring-orange-500 h-4 w-4 text-orange-600 border-gray-300"
                    />
                    <label htmlFor="evening" className="ml-2 block text-sm text-gray-700">
                      Evening
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="both"
                      name="availability"
                      type="radio"
                      checked={formData.availability === 'Both'}
                      onChange={() => handleAvailabilityChange('Both')}
                      className="focus:ring-orange-500 h-4 w-4 text-orange-600 border-gray-300"
                    />
                    <label htmlFor="both" className="ml-2 block text-sm text-gray-700">
                      Both
                    </label>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Experience (Years)</label>
                <input
                  type="number"
                  name="experience_years"
                  value={formData.experience_years}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  min="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Salary</label>
                <input
                  type="text"
                  name="salary"
                  value={formData.salary}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Qualifications</label>
                <textarea
                  name="qualifications"
                  rows="3"
                  value={formData.qualifications.join('\n')}
                  onChange={(e) => setFormData({...formData, qualifications: e.target.value.split('\n')})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter each qualification on a new line"
                ></textarea>
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
              <div>
                <div className="flex items-center text-gray-500 mb-2">
                  <span className="text-sm font-medium">Name</span>
                </div>
                <p className="text-gray-900">{trainerData.name}</p>
              </div>
              
              <div>
                <div className="flex items-center text-gray-500 mb-2">
                  <Mail className="h-5 w-5 mr-2" />
                  <span className="text-sm font-medium">Email</span>
                </div>
                <p className="text-gray-900">{trainerData.email}</p>
              </div>
              
              <div>
                <div className="flex items-center text-gray-500 mb-2">
                  <Phone className="h-5 w-5 mr-2" />
                  <span className="text-sm font-medium">Phone</span>
                </div>
                <p className="text-gray-900">{trainerData.phone_number}</p>
              </div>
              
              <div>
                <div className="flex items-center text-gray-500 mb-2">
                  <span className="text-sm font-medium">Gender</span>
                </div>
                <p className="text-gray-900 capitalize">{trainerData.gender}</p>
              </div>
              
              <div>
                <div className="flex items-center text-gray-500 mb-2">
                  <span className="text-sm font-medium">Specialization</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {trainerData.specialization.map((spec, index) => (
                    <span key={index} className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <div className="flex items-center text-gray-500 mb-2">
                  <Clock className="h-5 w-5 mr-2" />
                  <span className="text-sm font-medium">Availability</span>
                </div>
                <p className="text-gray-900">{trainerData.availability}</p>
              </div>
              
              <div>
                <div className="flex items-center text-gray-500 mb-2">
                  <span className="text-sm font-medium">Experience (Years)</span>
                </div>
                <p className="text-gray-900">{trainerData.experience_years} years</p>
              </div>
              
              <div>
                <div className="flex items-center text-gray-500 mb-2">
                  <span className="text-sm font-medium">Salary</span>
                </div>
                <p className="text-gray-900">{trainerData.salary}</p>
              </div>
              
              <div>
                <div className="flex items-center text-gray-500 mb-2">
                  <Calendar className="h-5 w-5 mr-2" />
                  <span className="text-sm font-medium">Date of Birth</span>
                </div>
                <p className="text-gray-900">{trainerData.date_of_birth}</p>
              </div>
              
              <div className="sm:col-span-2">
                <div className="flex items-center text-gray-500 mb-2">
                  <Award className="h-5 w-5 mr-2" />
                  <span className="text-sm font-medium">Qualifications</span>
                </div>
                <ul className="list-disc pl-5 text-gray-900">
                  {trainerData.qualifications.map((qual, index) => (
                    <li key={index}>{qual}</li>
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