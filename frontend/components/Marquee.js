"use client";
import React from "react";

const Marquee = () => {
  return (
    <div className="w-full bg-[#F96D00] py-3 overflow-hidden whitespace-nowrap">
      <div className="animate-marquee flex space-x-10 text-white font-bold text-lg uppercase tracking-wide">
        {[
          "Fitness and Gym",
          "Yoga Service Gym",
          "Health and Wellness",
          "Pure Gym Space",
          "Cardio Training",
          "Strength Training",
          "Personal Coaching",
          "24/7 Access",
          "Bodybuilding Programs",
          "Weight Loss Plans",
          "Group Training",
          "HIIT Workouts",
          "Functional Fitness",
          "CrossFit Training",
          "Sports Performance",
          "Rehabilitation Training",
        ].map((item, index) => (
          <span key={index} className="flex items-center">
            {index !== 0 && <span className="mx-3">•</span>}
            {item}
          </span>
        ))}
      </div>
    </div>
  );
};

export default Marquee;
