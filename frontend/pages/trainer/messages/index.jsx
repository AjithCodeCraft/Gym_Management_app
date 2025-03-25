import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Navbar from '../Navbar';
import TrainerSidebar from '../TrainerSidebar';
import api from "@/pages/api/axios";
import Cookies from 'js-cookie';

const MessagesPage = () => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const lastPollTimeRef = useRef(new Date().toISOString());
  const hasInitialSelection = useRef(false);

  const trainerId = Cookies.get("id");

  const fetchUserDetails = useCallback(async (userId) => {
    try {
      const accessToken = Cookies.get("access_token");
      const response = await api.get(`/user/sender/${userId}/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user details:', error);
      return null;
    }
  }, []);

  const fetchMessages = useCallback(async () => {
    if (!trainerId) return;

    try {
      const accessToken = Cookies.get("access_token");
      const response = await api.get(
        `/trainer/${trainerId}/messages/?since=${lastPollTimeRef.current}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (response.data.length > 0) {
        setMessages(prevMessages => {
          const existingIds = new Set(prevMessages.map(msg => msg.id));
          const newMessages = response.data.filter(msg => !existingIds.has(msg.id));
          
          if (newMessages.length > 0) {
            const newestMessage = newMessages.reduce((newest, current) => 
              new Date(current.timestamp) > new Date(newest.timestamp) ? current : newest
            );
            lastPollTimeRef.current = newestMessage.timestamp;
            
            // Remove any temporary messages that have been confirmed
            const confirmedTempIds = new Set(newMessages.map(msg => msg.temp_id).filter(Boolean));
            const filteredPrev = prevMessages.filter(msg => 
              !msg.temp_id || !confirmedTempIds.has(msg.temp_id)
            );
            
            return [...filteredPrev, ...newMessages];
          }
          return prevMessages;
        });

        const newSenderIds = Array.from(
          new Set(
            response.data
              .filter(msg => msg.sender !== parseInt(trainerId))
              .map(msg => msg.sender)
          )
        );

        if (newSenderIds.length > 0) {
          const usersData = await Promise.all(
            newSenderIds.map(id => fetchUserDetails(id))
          );
          
          setUsers(prevUsers => {
            const existingUserIds = new Set(prevUsers.map(user => user.id));
            const usersToAdd = usersData.filter(
              user => user && !existingUserIds.has(user.id)
            );

            if (!hasInitialSelection.current && usersToAdd.length > 0) {
              setSelectedUser(usersToAdd[0].id);
              hasInitialSelection.current = true;
            }

            return usersToAdd.length > 0 ? [...prevUsers, ...usersToAdd] : prevUsers;
          });
        }
      }
    } catch (error) {
      console.error('Failed to load messages', error);
    } finally {
      setLoading(false);
    }
  }, [trainerId, fetchUserDetails]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser || !trainerId) return;

    // Create temporary message with unique temp_id
    const temp_id = `temp-${Date.now()}`;
    const tempMessage = {
      id: temp_id, // Temporary ID that will help us replace this message later
      temp_id, // Additional field to identify temporary messages
      sender: parseInt(trainerId),
      receiver: selectedUser,
      message: newMessage,
      timestamp: new Date().toISOString(),
      is_read: true,
      isSending: true
    };

    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');
    setSending(true);
    scrollToBottom();

    try {
      const accessToken = Cookies.get("access_token");
      const response = await api.post(
        `/messages/send/`,
        {
          sender_id: parseInt(trainerId),
          receiver_id: selectedUser,
          message: newMessage
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      // Update the temporary message with the actual one from server
      setMessages(prev => prev.map(msg => 
        msg.temp_id === temp_id ? {
          ...response.data,
          // Keep the isSending state briefly for smooth transition
          isSending: true 
        } : msg
      ));

      // After a brief delay, remove the sending state for smooth UI transition
      setTimeout(() => {
        setMessages(prev => prev.map(msg => 
          msg.temp_id === temp_id ? response.data : msg
        ));
      }, 300);

      lastPollTimeRef.current = response.data.timestamp;
    } catch (error) {
      console.error('Failed to send message', error);
      setMessages(prev => prev.map(msg =>
        msg.temp_id === temp_id ? {
          ...msg, 
          isSending: false, 
          failed: true,
          error: 'Failed to send message'
        } : msg
      ));
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getMessagesForUser = (userId) => {
    return messages.filter(msg =>
      (msg.sender === userId && msg.receiver === parseInt(trainerId)) ||
      (msg.receiver === userId && msg.sender === parseInt(trainerId))
    ).sort((a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  };

  const getLastMessage = (userId) => {
    const userMessages = getMessagesForUser(userId);
    const lastMsg = userMessages[userMessages.length - 1];
    if (!lastMsg) return 'No messages yet';
    return lastMsg.sender === parseInt(trainerId) ? `You: ${lastMsg.message}` : lastMsg.message;
  };

  const getUnreadCount = (userId) => {
    return messages.filter(msg =>
      msg.sender === userId &&
      msg.receiver === parseInt(trainerId) &&
      !msg.is_read
    ).length;
  };

  const getInitials = (name) => {
    if (!name) return '';
    const names = name.split(' ');
    return names.map(n => n[0]).join('').toUpperCase();
  };

  useEffect(() => {
    if (trainerId) {
      fetchMessages();
    }
  }, [trainerId, fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedUser]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (trainerId) {
        fetchMessages();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [trainerId, fetchMessages]);

  if (loading) {
    return (
      <div className="flex flex-col md:flex-row h-screen bg-gray-50">
        <TrainerSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar />
          <main className="flex-1 overflow-y-auto bg-gray-50 p-6 flex items-center justify-center">
            <div>Loading messages...</div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50">
      <TrainerSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-1/3 bg-white rounded-lg shadow-sm">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold">Clients</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {users.map(user => (
                    <div
                      key={user.id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer ${selectedUser === user.id ? 'bg-blue-50' : ''}`}
                      onClick={() => {
                        setSelectedUser(user.id);
                        hasInitialSelection.current = true;
                      }}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 font-medium">
                          {getInitials(user.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium truncate">
                              {user.name}
                            </span>
                            {getUnreadCount(user.id) > 0 && (
                              <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1 truncate">
                            {getLastMessage(user.id)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-full md:w-2/3 bg-white rounded-lg shadow-sm flex flex-col">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold">
                    {selectedUser ? (
                      users.find(u => u.id === selectedUser)?.name
                    ) : 'Messages'}
                  </h3>
                </div>
                <div className="flex-1 h-[calc(100vh-300px)] overflow-y-auto p-4">
                  {selectedUser ? (
                    <div className="space-y-4">
                      {getMessagesForUser(selectedUser).map(message => {
                        const isTrainer = message.sender === parseInt(trainerId);
                        const sender = isTrainer
                          ? { name: 'You' }
                          : users.find(u => u.id === message.sender) || { name: 'Client' };

                        return (
                          <div
                            key={message.id}
                            className={`flex ${isTrainer ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-xs md:max-w-md rounded-lg p-3 transition-opacity duration-300 ${
                                isTrainer
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-gray-200 text-gray-800'
                              } ${message.isSending ? 'opacity-80' : ''} ${
                                message.failed ? 'bg-red-100 text-red-800' : ''
                              }`}
                            >
                              <div className="flex items-center space-x-2">
                                {!isTrainer && (
                                  <div className="h-6 w-6 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 font-medium text-xs">
                                    {getInitials(sender.name)}
                                  </div>
                                )}
                                <div>
                                  {!isTrainer && (
                                    <div className="font-medium text-xs mb-1">
                                      {sender.name}
                                    </div>
                                  )}
                                  <p className="text-sm">{message.message}</p>
                                  <div className={`text-xs mt-1 flex justify-end ${isTrainer ? 'text-blue-100' : 'text-gray-500'}`}>
                                    {new Date(message.timestamp).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                    {message.isSending && (
                                      <span className="ml-1">Sending...</span>
                                    )}
                                    {message.failed && (
                                      <span className="ml-1">Failed</span>
                                    )}
                                  </div>
                                </div>
                                {isTrainer && (
                                  <div className="h-6 w-6 rounded-full bg-blue-200 flex items-center justify-center text-blue-500 font-medium text-xs">
                                    {getInitials('You')}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <MessageCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No chat selected</h3>
                        <p className="mt-1 text-sm text-gray-500">Select a chat from the list to view messages</p>
                      </div>
                    </div>
                  )}
                </div>
                {selectedUser && (
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type a new message..."
                        className="flex-1"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={sending || !newMessage.trim()}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        {sending ? 'Sending...' : 'Send'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MessagesPage;