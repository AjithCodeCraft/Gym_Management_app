"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Image from "next/image";


const SpecialitiesSection = () => {
  return (
    <section className="relative w-full px-6 lg:px-16 py-16 bg-black text-white overflow-hidden">

      {/* Background Glow Effect (Behind Content) */}
      <div className="absolute -top-32 left-10 w-[700px] h-[500px] pointer-events-none -z-6">
          <div className="absolute w-full h-full bg-gradient-to-br from-[rgb(212,33,6)] via-[#ee7626] to-[#fef605] rounded-[60%] blur-[180px] opacity-60 animate-glowMove"></div>
          <div className="absolute inset-0 w-full h-full bg-[url('/noise.webp')] bg-cover opacity-15 mix-blend-overlay"></div>
      </div>

      {/* Section Heading */}
      <h2 className="text-6xl lg:text-6xl font-extrabold text-center mb-12">
        Our Specialities
      </h2>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto relative z-10">
        {/* Feature 1 */}
        <div className="col-span-1 bg-[#181818] p-6 rounded-3xl flex flex-col justify-between shadow-lg">
          <h3 className="text-2xl font-bold">Personalized Training Plans</h3>
          <p className="text-gray-200 mt-2">
          Customized workout routines tailored to individual fitness levels and goals.
          </p>
        </div>

        {/* Feature 2 */}
        <div className="col-span-1 bg-[#181818] p-6 rounded-3xl shadow-lg">
          <img src="/community-blog.jpg" alt="Community Blog" className="w-full h-40 object-cover rounded-xl" />
          <h3 className="text-2xl font-bold mt-4">Expert Trainers</h3>
          <p className="text-gray-400 mt-2">
          Certified professionals to guide you through proper techniques and progressions.
          </p>
        </div>

        {/* Feature 3 */}
        <div className="col-span-1 bg-[#282828] p-6 rounded-3xl flex flex-col justify-between shadow-lg">
          <h3 className="text-2xl font-bold">Group Fitness Classes</h3>
          <p className="text-gray-300 mt-2">
          Engaging and fun group workouts led by experienced instructors.
          </p>
        </div>

        {/* Feature 4 */}
        <div className="col-span-1 md:col-span-2 bg-[#141414] p-6 rounded-3xl shadow-lg flex items-center">
          <div>
            <h3 className="text-2xl font-bold">State-of-the-Art Equipment</h3>
            <p className="text-gray-400 mt-2">
            Access the latest and most effective gym equipment for optimal results.
            </p>
          </div>
        </div>

        {/* Feature 5 */}
        <div className="col-span-1 bg-gradient-to-br from-[#F96D00] via-orange-500 to-[#F2F2F2] p-6 rounded-3xl shadow-lg">
          <h3 className="text-2xl font-bold">24/7 Gym Access</h3>
          <p className="text-gray-300 mt-2">
          Train at any time that fits your schedule with round-the-clock access.
          </p>
        </div>
      </div>

    </section>
  );
};

export default SpecialitiesSection;
