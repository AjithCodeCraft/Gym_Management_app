import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Calendar, Mail, Phone, Clock, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import api from "@/pages/api/axios";

const TrainerProfile = () => {
  const router = useRouter();
  const [trainerData, setTrainerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Main profile data fetch
  useEffect(() => {
    const fetchTrainerProfile = async () => {
      try {
        const accessToken = Cookies.get("access_token");
        const trainerId = Cookies.get("id");

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
          qualifications: trainer.qualifications || [],
        });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching trainer profile:", error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchTrainerProfile();
  }, []);

  // Background API calls
  useEffect(() => {
    const fetchBackgroundData = async () => {
      try {
        const accessToken = Cookies.get("access_token");
        const trainerId = Cookies.get("id");

        if (!trainerId) return;

        // Attendance data
        const attendancePromise = api.get(`attendance/${trainerId}/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        // Wait for background requests
        await Promise.all([attendancePromise]);
        
        console.log("Background data loaded");
      } catch (error) {
        console.error("Error in background data loading:", error);
      }
    };

    // Only start background loading after main data is loaded
    if (!loading && !error) {
      fetchBackgroundData();
    }
  }, [loading, error]);

  const goBack = () => {
    router.back();
  };

  const TrainerProfileContent = ({ trainerData }) => {
    const initials = trainerData.name.split(' ').map(n => n[0]).join('').toUpperCase();

    return (
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
        </div>

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
              <p className="text-gray-900">
                {trainerData.trainer_profile.availability.toLowerCase() === "both"
                  ? "Morning and Evening"
                  : trainerData.trainer_profile.availability}
              </p>
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
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <button
        onClick={goBack}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back
      </button>

      <Suspense fallback={
        <div className="bg-white shadow rounded-lg p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      }>
        <TrainerProfileContent trainerData={trainerData} />
      </Suspense>
    </div>
  );
};

export default TrainerProfile;