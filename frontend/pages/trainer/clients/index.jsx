import React, { useState } from 'react';
import { CheckCircle, XCircle, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TrainerSidebar from '../TrainerSidebar';
import Navbar from '../Navbar';

const ClientPage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // Sample client data
  const [clients, setClients] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', gender: 'male', phone: '+1234567890', status: 'active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', gender: 'female', phone: '+0987654321', status: 'inactive' },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', gender: 'male', phone: '+1239874560', status: 'active' },
    { id: 4, name: 'Sara Williams', email: 'sara@example.com', gender: 'female', phone: '+3216549870', status: 'active' },
    { id: 5, name: 'Robert Chen', email: 'robert@example.com', gender: 'male', phone: '+4567891230', status: 'inactive' },
  ]);

  // Helper function for status colors
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Function to update client status
  const updateClientStatus = (id, status) => {
    const updatedClients = clients.map(client => {
      if (client.id === id) {
        return { ...client, status };
      }
      return client;
    });
    setClients(updatedClients);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50">
      <TrainerSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col space-y-6">
              {/* Welcome Section */}
          

              {/* Clients Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {clients.map((client) => (
                      <tr key={client.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 font-medium">
                              {client.name.charAt(0)}
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">{client.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{client.email}</div>
                          <div className="text-xs text-gray-500">{client.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{client.gender.charAt(0).toUpperCase() + client.gender.slice(1)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(client.status)}`}>
                            {client.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0"
                              onClick={() => updateClientStatus(client.id, 'active')}
                            >
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0"
                              onClick={() => updateClientStatus(client.id, 'inactive')}
                            >
                              <XCircle className="h-4 w-4 text-red-500" />
                            </Button>
                            <button className="text-gray-400 hover:text-gray-600">
                              <MoreHorizontal className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ClientPage;
