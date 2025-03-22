import React, { useState, useEffect } from 'react';
import { Calendar, Edit, Mail, Phone, Award, Clock, Save, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import api from "@/pages/api/axios";

const TrainerProfile = () => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [trainerData, setTrainerData] = useState(null);
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    const fetchTrainerProfile = async () => {
      try {
        const accessToken = Cookies.get("access_token");
        const trainerId = Cookies.get("id"); // Assuming trainer ID is stored in cookies

        if (!trainerId) {
          throw new Error("Trainer ID not found in cookies.");
        }

        const response = await api.get(
          `trainers/${trainerId}/`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        const trainer = response.data;
        setTrainerData({
          ...trainer,
          qualifications: trainer.qualifications || [], // Ensure qualifications is an array
        });
        setFormData({
          ...trainer,
          specialization: trainer.trainer_profile.specialization,
          experience_years: trainer.trainer_profile.experience,
          salary: trainer.trainer_profile.salary.toString(),
          qualifications: trainer.qualifications || [], // Ensure qualifications is an array
          availability: trainer.trainer_profile.availability || 'Morning', // Ensure availability is set
          gender: trainer.gender || '', // Ensure gender is set
          name: trainer.name || '', // Ensure name is set
          date_of_birth: trainer.date_of_birth || '', // Ensure date_of_birth is set
          email: trainer.email || '', // Ensure email is set
        });
      } catch (error) {
        console.error("Error fetching trainer profile:", error);
      }
    };

    fetchTrainerProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleGenderChange = (gender) => {
    setFormData((prevData) => ({
      ...prevData,
      gender,
    }));
  };

  const handleAvailabilityChange = (availability) => {
    setFormData((prevData) => ({
      ...prevData,
      availability,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const phoneNumberPattern = /^\+91\d{10}$/; // Ensure valid phone number
    const specializationPattern = /^[A-Za-z\s]+$/;
    let newErrors = {}; // Object to store field errors

    if (!phoneNumberPattern.test(formData.phone_number)) {
      newErrors.phone_number = "Phone number must be in the format +91xxxxxxxxxx.";
    }

    if (!formData.specialization || formData.specialization.length < 3) {
      newErrors.specialization = "Specialization must be at least 3 characters long.";
    } else if (!specializationPattern.test(formData.specialization)) {
      newErrors.specialization = "Specialization must contain only alphabets.";
    }

    if (!formData.experience_years || isNaN(formData.experience_years)) {
      newErrors.experience_years = "Experience must be a valid number.";
    }

    if (!formData.salary || parseFloat(formData.salary) <= 0) {
      newErrors.salary = "Salary must be greater than zero.";
    }

    // Ensure all required fields are filled
    if (!formData.phone_number || !formData.specialization || !formData.experience_years || !formData.salary) {
      newErrors.general = "All fields are required.";
    }

    // If there are errors, update state and stop execution
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);  // Set the new error object
      return;
    }

    try {
      const accessToken = Cookies.get("access_token");
      await api.put(
        "update-trainer-details/",
        {
          email: formData.email,
          phone_number: formData.phone_number,
          specialization: formData.specialization,
          experience: formData.experience_years,
          salary: formData.salary,
          is_active: true, // Assuming is_active is always true for trainers
          availability: formData.availability, // Include availability in the update
          gender: formData.gender, // Include gender in the update
          name: formData.name, // Include name in the update
          date_of_birth: formData.date_of_birth, // Include date_of_birth in the update
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      // Update the trainerData state immediately to reflect changes in the UI
      setTrainerData((prevData) => ({
        ...prevData,
        ...formData,
        trainer_profile: {
          ...prevData.trainer_profile,
          specialization: formData.specialization,
          experience: formData.experience_years,
          salary: formData.salary,
          availability: formData.availability,
        },
        gender: formData.gender,
        name: formData.name,
        date_of_birth: formData.date_of_birth,
        email: formData.email,
      }));

      setIsEditing(false);
      setErrors({}); // Clear all errors on successful save
    } catch (error) {
      console.log("Error updating trainer:", error);

      let errorMessage = "Unexpected error occurred.";
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }

      // Preserve duplicate phone number error
      if (errorMessage.includes("duplicate key value violates unique constraint")) {
        setErrors({ phone_number: "This phone number is already in use." });
      } else if (errorMessage.includes("duplicate key value violates unique constraint")) {
        setErrors({ email: "This email is already in use." });
      } else {
        setErrors({ general: errorMessage });
      }
    }
  };

  const goBack = () => {
    router.back();
  };

  if (!trainerData) {
    return <div>Loading...</div>; // Show a loading state while fetching data
  }

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
                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
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
                {errors.phone_number && <p className="text-red-500 text-sm">{errors.phone_number}</p>}
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
                  value={formData.specialization}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  placeholder="E.g. Weight Training, HIIT, Nutrition"
                />
                {errors.specialization && <p className="text-red-500 text-sm">{errors.specialization}</p>}
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
                {errors.experience_years && <p className="text-red-500 text-sm">{errors.experience_years}</p>}
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
                {errors.salary && <p className="text-red-500 text-sm">{errors.salary}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Qualifications</label>
                <textarea
                  name="qualifications"
                  rows="3"
                  value={formData.qualifications && Array.isArray(formData.qualifications) ? formData.qualifications.join('\n') : ''}
                  onChange={(e) => setFormData((prevData) => ({
                    ...prevData,
                    qualifications: e.target.value.split('\n'),
                  }))}
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
            {errors.general && <p className="text-red-500 text-sm mt-4">{errors.general}</p>}
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
                  <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                    {trainerData.trainer_profile.specialization}
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-center text-gray-500 mb-2">
                  <Clock className="h-5 w-5 mr-2" />
                  <span className="text-sm font-medium">Availability</span>
                </div>
                <p className="text-gray-900">{trainerData.trainer_profile.availability}</p>
              </div>

              <div>
                <div className="flex items-center text-gray-500 mb-2">
                  <span className="text-sm font-medium">Experience (Years)</span>
                </div>
                <p className="text-gray-900">{trainerData.trainer_profile.experience} years</p>
              </div>

              <div>
                <div className="flex items-center text-gray-500 mb-2">
                  <span className="text-sm font-medium">Salary</span>
                </div>
                <p className="text-gray-900">{trainerData.trainer_profile.salary}</p>
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
                  {trainerData.qualifications && Array.isArray(trainerData.qualifications) ? (
                    trainerData.qualifications.map((qual, index) => (
                      <li key={index}>{qual}</li>
                    ))
                  ) : (
                    <li>No qualifications available</li>
                  )}
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
