"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const testimonials = [
  {
    name: "Rohan Sharma",
    date: "Feb 2024",
    feedback:
      "Joining this gym has been a life-changing experience! The trainers are highly professional, and the group classes keep me motivated. The equipment is top-notch, and the nutrition plan has helped me stay on track!",
  },
  {
    name: "Priya Desai",
    date: "Jan 2024",
    feedback:
      "I absolutely love the personal training sessions. My coach designed a custom workout plan for me, and I can already see results! The ambiance is energetic, and the gamification features keep me engaged.",
  },
  {
    name: "Amit Verma",
    date: "March 2024",
    feedback:
      "The AI-powered chatbot helps me with workout suggestions, and the community blog keeps me connected with fellow fitness enthusiasts. Highly recommend this gym for anyone serious about fitness!",
  },
  {
    name: "Neha Iyer",
    date: "April 2024",
    feedback:
      "The fee structure is transparent, and the membership options are flexible. The gym's calorie tracker helps me maintain a balanced diet while staying on top of my workouts. Love the tech integration!",
  },
  {
    name: "Siddharth Rao",
    date: "May 2024",
    feedback:
      "The gym has an amazing environment! The music, lighting, and community vibe make every session exciting. Plus, the trainers push you to achieve your best results.",
  },
  {
    name: "Anjali Mehta",
    date: "June 2024",
    feedback:
      "This gym has changed my perspective on fitness. The automated reminders and gamification system keep me consistent, and I actually enjoy working out now!",
  },
  {
    name: "Vikas Nair",
    date: "July 2024",
    feedback:
      "Great facilities, excellent trainers, and an overall welcoming atmosphere. The injury management tips from the AI chatbot have helped me recover faster from muscle strains.",
  },
  {
    name: "Tanisha Kapoor",
    date: "Aug 2024",
    feedback:
      "The gym's community blog is a game-changer! I love reading success stories and workout tips from other members. It keeps me motivated every single day!",
  },
];

export default function Testimonials() {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <motion.div
      className="relative bg-[#131313] text-white px-6 py-16 rounded-3xl"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
    >
      {/* Heading */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-[#F96D00]">Member Feedback</h3>
        <h1 className="text-5xl font-extrabold mt-2">What Our Members Say</h1>
      </div>

      {/* Testimonials Scrolling */}
      <div className="relative overflow-hidden mt-10">
        <motion.div
          className="flex space-x-6"
          animate={{ x: isPaused ? 0 : ["0%", "-100%"] }}
          transition={{ ease: "linear", duration: 15, repeat: Infinity }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white shadow-md p-6 rounded-xl w-[300px] min-w-[300px]"
            >
              <p className="text-sm text-gray-600 italic">"{testimonial.feedback}"</p>
              <div className="mt-4">
                <p className="font-semibold text-[#F96D00]">{testimonial.name}</p>
                <p className="text-xs text-gray-500">{testimonial.date}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
