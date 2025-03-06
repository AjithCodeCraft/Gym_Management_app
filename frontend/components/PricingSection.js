"use client";
import { useState } from "react";

const plans = [
  {
    name: "Basic",
    price: { monthly: 999, quarterly: 2499, yearly: 8999 },
    features: [
      "Access to gym floor",
      "Locker facility",
      "Cardio & strength training",
      "No personal trainer",
    ],
  },
  {
    name: "Pro",
    price: { monthly: 1999, quarterly: 5499, yearly: 17999 },
    features: [
      "All Basic plan benefits",
      "Personalized workout plan",
      "Group training sessions",
      "Priority locker access",
    ],
    highlighted: true, // Center card lights up by default
  },
  {
    name: "Elite",
    price: { monthly: 2999, quarterly: 7999, yearly: 24999 },
    features: [
      "All Pro plan benefits",
      "1-on-1 Personal Trainer",
      "Diet consultation",
      "Unlimited guest passes",
    ],
  },
];

const PricingSection = () => {
  const [billingCycle, setBillingCycle] = useState("monthly");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#000000] p-6">
      {/* Section Heading */}
      <h2 className="text-6xl font-extrabold text-[#F2F2F2] text-center mb-4">
        Choose Your Gym Membership
      </h2>
      <p className="text-[#F2F2F2]/70 text-xl text-center mb-6">
        Flexible plans for every fitness goal. Pick what suits you best!
      </p>

      {/* Billing Cycle Toggle */}
      <div className="flex space-x-3 bg-[#242424] p-2 rounded-full mb-8">
        {["monthly", "quarterly", "yearly"].map((cycle) => (
          <button
            key={cycle}
            onClick={() => setBillingCycle(cycle)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              billingCycle === cycle
                ? "bg-[#F96D00] text-white"
                : "text-[#F2F2F2]/60 hover:text-white"
            }`}
          >
            {cycle.charAt(0).toUpperCase() + cycle.slice(1)}
          </button>
        ))}
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        {plans.map((plan, index) => (
          <div
            key={plan.name}
            className={`relative p-6 rounded-xl border border-[#F2F2F2]/20 text-[#F2F2F2] bg-[#242424] transition-all duration-300 group
              ${plan.highlighted ? "shadow-[0_0_40px_rgba(249,109,0,0.5)]" : ""}
            `}
          >
            {/* Glow Effect on Hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#F96D00]/20 to-[#F96D00]/5 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-xl"></div>

            <h3 className="text-2xl font-bold mb-3">{plan.name}</h3>
            <p className="text-3xl font-semibold text-[#F96D00]">
              ₹{plan.price[billingCycle]}
              <span className="text-sm text-[#F2F2F2]/70"> / {billingCycle}</span>
            </p>

            <ul className="mt-4 space-y-2 text-[#F2F2F2]/80">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center">
                  - <span className="ml-2">{feature}</span>
                </li>
              ))}
            </ul>

            <button className="mt-6 w-full bg-[#F96D00] text-white py-2 rounded-lg font-semibold hover:bg-[#ff7f32] transition">
              Join Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PricingSection;
