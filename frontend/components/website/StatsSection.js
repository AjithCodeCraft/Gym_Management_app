"use client";
import CountUp from "react-countup";
import { motion } from "framer-motion";

const StatsSection = () => {
  const stats = [
    { number: 150, suffix: "+", label: "State-of-the-Art Equipment" },
    { number: 20, suffix: "+", label: "Certified Expert Trainers" },
    { number: 12, suffix: "+", label: "Years of Fitness Excellence" },
    { number: 10000, suffix: "k", label: "Satisfied Customers" },
  ];

  return (
    <section className="w-full py-16 bg-black text-white flex justify-center">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full max-w-6xl px-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: index * 0.2 }}
            viewport={{ once: true }}
            className="bg-white/10 rounded-2xl p-6 text-center shadow-lg"
          >
            {/* Animated Number */}
            <h2 className="text-5xl font-extrabold text-[#F96D00]">
              <CountUp start={0} end={stat.number} duration={4} />{stat.suffix}
            </h2>
            {/* Description */}
            <p className="mt-2 text-lg text-[#F2F2F2]">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default StatsSection;
