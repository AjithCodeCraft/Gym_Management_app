import React, { useState, useEffect } from 'react';
import { Plus, X, Check, Edit, Trash } from 'lucide-react';
import Cookies from 'js-cookie';
import api from '../../../api/axios';
import AdminSidebar from '../sidebar';
import Navbar from '../navbar';

const SubscriptionPlans = () => {
  const [plans, setPlans] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: '',
    personal_training: false,
    price: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const token = Cookies.get("access_token");

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    if (!token) {
      setError("No access token found. Please log in.");
      return;
    }

    try {
      const response = await api.get('subscriptions/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlans(response.data);
    } catch (err) {
      console.error('Error fetching plans:', err);
      setError("Failed to fetch plans.");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: name === "duration" ? parseInt(value, 10) : type === "checkbox" ? checked : value,
    });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setError('');
    setSuccessMessage('');
    setFormData({
      name: '',
      description: '',
      duration: '',
      personal_training: false,
      price: '',
    });
  };

  const handleEdit = (plan) => {
    setSelectedPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description,
      duration: plan.duration,
      personal_training: plan.personal_training,
      price: plan.price,
    });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDelete = (plan) => {
    setSelectedPlan(plan);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!token) {
      setError("No access token found. Please log in.");
      return;
    }

    try {
      await api.delete(`subscriptions/delete/${selectedPlan.id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setPlans(plans.filter(plan => plan.id !== selectedPlan.id));
      setIsDeleteModalOpen(false);
      setSelectedPlan(null);
    } catch (err) {
      console.error('Error deleting plan:', err);
      setError("Failed to delete plan.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    if (!token) {
      setError("No access token found. Please log in.");
      setLoading(false);
      return;
    }

    try {
      let response;

      if (isEditMode) {
        // Update existing plan
        response = await api.put(
          `subscriptions/edit/${selectedPlan.id}/`,
          formData,
          { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
        );

        // Update the plan in the state
        setPlans(plans.map(plan => plan.id === selectedPlan.id ? response.data : plan));
        setSuccessMessage('Plan updated successfully!');
      } else {
        // Add new plan
        response = await api.post(
          'subscriptions/add/',
          formData,
          { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
        );

        setPlans([...plans, response.data]);
        setSuccessMessage('Plan added successfully!');
      }
      
      // Close modal and reset form after success
      setTimeout(() => {
        closeModal();
        // Refresh the plans list
        fetchPlans();
      }, 1000);
    } catch (err) {
      console.error('Error saving plan:', err);
      setError(isEditMode ? "Failed to update plan." : "Failed to add plan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />

        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header and Add Plan Button */}
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Subscription Plans</h1>
              <button
                onClick={() => {
                  setIsEditMode(false);
                  setIsModalOpen(true);
                }}
                className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition duration-300"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Plan
              </button>
            </div>

            {/* Plans Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Personal Training
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {plans.map((plan) => (
                    <tr key={plan.id} className="hover:bg-gray-50 transition duration-200">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {plan.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {plan.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {plan.duration}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {plan.personal_training ? (
                          <Check className="h-5 w-5 text-green-500" />
                        ) : (
                          <X className="h-5 w-5 text-red-500" />
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ₹{plan.price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => handleEdit(plan)} 
                          className="text-orange-500 hover:text-orange-700 mr-4"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(plan)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add/Edit Plan Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
                <div className="flex justify-between items-center p-6 border-b">
                  <h2 className="text-xl font-bold text-gray-800">
                    {isEditMode ? 'Edit Subscription Plan' : 'Add Subscription Plan'}
                  </h2>
                  <button
                    onClick={closeModal}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                      rows="3"
                      required
                    />
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Duration</label>
                    <select
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                      required
                    >
                      <option value={1}>1 Month</option>
                      <option value={3}>3 Months</option>
                      <option value={6}>6 Months</option>
                      <option value={12}>12 Months</option>
                    </select>
                  </div>

                  {/* Personal Training */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="personal_training"
                      checked={formData.personal_training}
                      onChange={handleChange}
                      className="h-4 w-4 text-orange-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">Includes Personal Training</label>
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Price (₹)</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                      required
                    />
                  </div>

                  {/* Error and Success Messages */}
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                  {successMessage && (
                    <p className="text-green-500 text-sm">{successMessage}</p>
                  )}

                  {/* Submit and Cancel Buttons */}
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition duration-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition duration-300"
                    >
                      {loading ? (isEditMode ? 'Updating...' : 'Adding...') : (isEditMode ? 'Update Plan' : 'Add Plan')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {isDeleteModalOpen && selectedPlan && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Confirm Deletion</h2>
                  <p className="mb-6 text-gray-600">
                    Are you sure you want to delete the plan "{selectedPlan.name}"? This action cannot be undone.
                  </p>
                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={() => setIsDeleteModalOpen(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition duration-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmDelete}
                      className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SubscriptionPlans;