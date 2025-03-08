"use client"; // Ensure this is a client-side component
import { useState } from "react";
import axios from "axios";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false); // State to toggle chat window
  const [messages, setMessages] = useState([]); // State to store chat messages
  const [input, setInput] = useState(""); // State to store user input

  // Function to send a message to the backend
  const sendMessage = async () => {
    if (!input.trim()) return; // Ignore empty messages

    // Add user message to the chat
    setMessages((prev) => [...prev, { text: input, sender: "user" }]);
    setInput(""); // Clear the input field

    try {
      // Send the message to the backend
      const response = await axios.post("http://localhost:8000/api/homechat/", {
        message: input,
      });

      // Add the bot's response to the chat
      setMessages((prev) => [
        ...prev,
        { text: response.data.response, sender: "bot" },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        { text: "Sorry, something went wrong. Please try again.", sender: "bot" },
      ]);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chatbot Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#F96D00] text-white p-4 rounded-full shadow-lg hover:bg-[#ee7626] transition"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 bg-[#1E1E1E] rounded-lg shadow-lg border border-[#F96D00]/20">
          {/* Chat Header */}
          <div className="p-4 bg-[#F96D00] rounded-t-lg text-white font-semibold">
            Gym Assistant
          </div>

          {/* Chat Messages */}
          <div className="p-4 h-60 overflow-y-auto">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-4 ${
                  msg.sender === "user" ? "text-right" : "text-left"
                }`}
              >
                <div
                  className={`inline-block p-2 rounded-lg ${
                    msg.sender === "user"
                      ? "bg-[#F96D00] text-white"
                      : "bg-[#2E2E2E] text-gray-200"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-[#F96D00]/20">
            <div className="flex">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Ask something about the gym..."
                className="flex-1 p-2 bg-[#2E2E2E] text-white rounded-l-lg focus:outline-none"
              />
              <button
                onClick={sendMessage}
                className="bg-[#F96D00] text-white p-2 rounded-r-lg hover:bg-[#ee7626] transition"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
