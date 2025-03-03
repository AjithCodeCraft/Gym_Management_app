import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { User, Plus, ArrowLeft, Mail, Loader, AlertCircle } from 'lucide-react';
import api from "../../../api/axios";
import AdminSidebar from '../sidebar';
import Navbar from '../navbar';
import Cookies from 'js-cookie';

const AddMember = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone_number: '',
    gender: '',
    date_of_birth: '',
    subscription_plan_id: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [plans, setPlans] = useState([]);
  const [fetchingPlans, setFetchingPlans] = useState(true);
  const [authError, setAuthError] = useState('');

  // Fetch subscription plans from API with authentication
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setFetchingPlans(true);
        setAuthError('');

        // Get access token from cookies
        const accessToken = Cookies.get('access_token');

        if (!accessToken) {
          setAuthError('Access denied. No authentication token found.');
          setFetchingPlans(false);
          return;
        }

        // Set up request with authorization header
        const response = await api.get('subscriptions/', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        if (response.data) {
          // Check if the response is an array or if it has a specific property containing plans
          const plansData = Array.isArray(response.data) ? response.data :
                           response.data.plans ? response.data.plans : [];

          setPlans(plansData);

          // Set default plan to first plan if available
          if (plansData.length > 0) {
            setFormData(prev => ({ ...prev, subscription_plan_id: plansData[0].id }));
          }
        } else {
          setError('Failed to load subscription plans.');
        }
      } catch (err) {
        if (err.response && err.response.status === 401) {
          setAuthError('Access denied. Your session may have expired. Please log in again.');
        } else if (err.response && err.response.status === 403) {
          setAuthError('You do not have permission to access subscription data.');
        } else {
          setError('Error fetching subscription plans. Please try again.');
        }
        console.error('Failed to fetch plans:', err);
      } finally {
        setFetchingPlans(false);
      }
    };

    fetchPlans();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    // Check if the selected plan ID exists
    const selectedPlan = plans.find(plan => plan.id === formData.subscription_plan_id);
    if (!selectedPlan) {
      setError('Selected subscription plan not found.');
      setLoading(false);
      return;
    }

    // Ensure gender is set
    if (!formData.gender) {
      setError('Please select a gender.');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('register/', {
        ...formData,
        user_type: 'user',
      });

      if (response.data.success) {
        setSuccessMessage('Member added successfully! Login credentials sent to their email.');
        setTimeout(() => {
          router.push('dashboard');
        }, 3000);
      } else {
        setError(response.data.message || 'Failed to add member.');
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('An error occurred while registering the member.');
      }
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    router.push('/login');
  };

  // Format the price to Indian Rupees
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />

        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-2xl transform transition-all duration-300 hover:shadow-3xl">
            <div className="flex items-center mb-6">
              <button
                onClick={() => router.back()}
                className="flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back
              </button>
              <h1 className="text-2xl font-bold ml-4 text-gray-800">Add Member</h1>
            </div>

            {authError ? (
              <div className="bg-red-50 p-6 rounded-lg">
                <div className="flex items-center mb-3">
                  <AlertCircle className="h-6 w-6 text-red-500 mr-2" />
                  <h3 className="font-semibold text-red-700">Authentication Error</h3>
                </div>
                <p className="text-red-600 mb-4">{authError}</p>
                <button
                  onClick={handleLogin}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Go to Login
                </button>
              </div>
            ) : fetchingPlans ? (
              <div className="flex justify-center items-center py-10">
                <Loader className="h-8 w-8 animate-spin text-blue-500" />
                <p className="ml-3 text-gray-600">Loading subscription plans...</p>
              </div>
            ) : plans.length === 0 ? (
              <div className="bg-yellow-50 p-4 rounded-lg text-yellow-700 mb-6">
                No subscription plans found. Please check the subscription configuration.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="text"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      name="date_of_birth"
                      value={formData.date_of_birth}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="others">Others</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gym Plan</label>
                    <select
                      name="subscription_plan_id"
                      value={formData.subscription_plan_id}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      required
                    >
                      {plans.map((plan) => (
                        <option key={plan.id} value={plan.id}>
                          {plan.name} - {formatPrice(plan.price)}
                          {plan.duration ? ` (${plan.duration} months)` : ''}
                          {plan.personal_training ? ' with PT' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 p-3 rounded-lg flex items-center text-red-600 text-sm">
                    <span className="mr-2">⚠️</span>
                    {error}
                  </div>
                )}
                {successMessage && (
                  <div className="bg-green-50 p-3 rounded-lg flex items-center text-green-600 text-sm">
                    <Mail className="h-4 w-4 mr-2" />
                    {successMessage}
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105"
                  >
                    {loading ? (
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    {loading ? 'Adding...' : 'Add Member'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AddMember;
