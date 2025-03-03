import React, { useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Navbar from '../Navbar';
import TrainerSidebar from '../TrainerSidebar';

const MessagesPage = () => {
  // Sample list of users
  const users = [
    { id: 1, name: 'John Doe', lastMessage: 'Will you be available for an extra session this weekend?', unread: true },
    { id: 2, name: 'Sara Williams', lastMessage: 'I need to reschedule tomorrow\'s session.', unread: true },
    { id: 3, name: 'Mike Johnson', lastMessage: 'Thanks for today\'s session!', unread: false },
    { id: 4, name: 'Jane Smith', lastMessage: 'Can we switch to morning sessions next week?', unread: false }
  ];

  // Sample messages for each user
  const userMessages = {
    1: [
      { id: 1, name: 'John Doe', message: 'Will you be available for an extra session this weekend?', time: '09:15 AM', unread: true },
      { id: 2, name: 'You', message: 'Yes, I can do Saturday morning.', time: '09:20 AM', unread: false }
    ],
    2: [
      { id: 1, name: 'Sara Williams', message: 'I need to reschedule tomorrow\'s session.', time: '10:30 AM', unread: true }
    ],
    3: [
      { id: 1, name: 'Mike Johnson', message: 'Thanks for today\'s session!', time: '12:45 PM', unread: false }
    ],
    4: [
      { id: 1, name: 'Jane Smith', message: 'Can we switch to morning sessions next week?', time: '02:20 PM', unread: false }
    ]
  };

  const [selectedUser, setSelectedUser] = useState(users[0].id); // Default to the first user
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: userMessages[selectedUser].length + 1,
        name: 'You',
        message: newMessage,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
        unread: false
      };
      const updatedMessages = [...userMessages[selectedUser], message];
      userMessages[selectedUser] = updatedMessages; // Update messages for the selected user
      setNewMessage('');
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50">
      <TrainerSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Left Side: User List */}
              <div className="w-full md:w-1/3 bg-white rounded-lg shadow-sm">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold">Clients</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {users.map(user => (
                    <div
                      key={user.id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer ${selectedUser === user.id ? 'bg-blue-50' : ''}`}
                      onClick={() => setSelectedUser(user.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 font-medium">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{user.name}</span>
                            {user.unread && <span className="h-2 w-2 rounded-full bg-blue-500"></span>}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{user.lastMessage}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Side: Messages Section */}
              <div className="w-full md:w-2/3 bg-white rounded-lg shadow-sm">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold">Messages</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {userMessages[selectedUser].map(message => (
                    <div key={message.id} className={`p-4 hover:bg-gray-50 ${message.unread ? 'bg-blue-50' : ''}`}>
                      <div className="flex justify-between items-start">
                        <div className="flex items-start space-x-3">
                          <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 font-medium">
                            {message.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{message.name}</span>
                              {message.unread && <span className="h-2 w-2 rounded-full bg-blue-500"></span>}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{message.message}</p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">{message.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-gray-200">
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Type a new message..." 
                      className="flex-1" 
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <Button onClick={handleSendMessage}>
                      <Send className="h-4 w-4 mr-2" />
                      Send
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MessagesPage;