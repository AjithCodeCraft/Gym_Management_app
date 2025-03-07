const OurWebApplication = () => {
    return (
      <section className="relative w-full px-6 lg:px-16 py-16 bg-black text-white overflow-hidden">

        {/* Background Glow Effect (Behind Content) */}
        <div className="absolute -bottom-32 right-10 w-[700px] h-[500px] pointer-events-none -z-2">
            <div className="absolute w-full h-full bg-gradient-to-br from-[rgb(212,33,6)] via-[#ee7626] to-[#fef605] rounded-[60%] blur-[180px] opacity-60 animate-glowMove"></div>
            <div className="absolute inset-0 w-full h-full bg-[url('/noise.webp')] bg-cover opacity-15 mix-blend-overlay"></div>
        </div>

        {/* Section Heading */}
        <h2 className="text-6xl lg:text-6xl font-extrabold text-center mb-12">
          Our Web Application
        </h2>
  
        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto relative z-10">
          {/* Feature 1 */}
          <div className="col-span-1 bg-gradient-to-br from-[#F96D00] via-orange-500 to-[#F2F2F2] p-6 rounded-3xl flex flex-col justify-between shadow-lg">
            <h3 className="text-2xl font-bold">AI-Powered Chatbot</h3>
            <p className="text-gray-200 mt-2">
              Get instant responses on gym inquiries, nutrition advice, and injury prevention.
            </p>
          </div>
  
          {/* Feature 2 */}
          <div className="col-span-1 bg-[#181818] p-6 rounded-3xl shadow-lg">
            <img src="/img1.jpg" alt="Community Blog" className="w-full h-40 object-cover rounded-xl" />
            <h3 className="text-2xl font-bold mt-4">Community Blog</h3>
            <p className="text-gray-400 mt-2">
              Trainers and members share updates, plans, and fitness tips.
            </p>
          </div>
  
          {/* Feature 3 */}
          <div className="col-span-1 bg-[#282828] p-6 rounded-3xl flex flex-col justify-between shadow-lg">
            <h3 className="text-2xl font-bold">Calorie Tracker</h3>
            <p className="text-gray-300 mt-2">
              Monitor your calories burned based on workouts, duration, and intensity.
            </p>
          </div>
  
          {/* Feature 4 */}
          <div className="col-span-1 md:col-span-2 bg-[#141414] p-6 rounded-3xl shadow-lg flex items-center">
            <div>
              <h3 className="text-2xl font-bold">Gamification & Badges</h3>
              <p className="text-gray-400 mt-2">
                Stay motivated with workout streak rewards and achievement badges.
              </p>
            </div>
          </div>
  
          {/* Feature 5 */}
          <div className="col-span-1 bg-[#232323] p-6 rounded-3xl shadow-lg">
            <h3 className="text-2xl font-bold">Automated Reminders</h3>
            <p className="text-gray-300 mt-2">
              Get notifications to keep you on track with fitness goals.
            </p>
          </div>
        </div>
      </section>
    );
};

export default OurWebApplication;
