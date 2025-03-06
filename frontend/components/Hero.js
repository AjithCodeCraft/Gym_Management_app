import { Sparkles } from "lucide-react"; // Import sparkle icon

const Hero = () => {
  return (

    <section className="relative w-full flex flex-col items-center text-center px-6 lg:px-16 bg-black py-16">

      {/* Blur effect */}

      <div className="absolute -top-50 right-10 w-[700px] h-[500px] pointer-events-none">
        {/* Background Glow Effect */}
        <div className="absolute w-full h-full bg-gradient-to-br from-[rgb(212,33,6)] via-[#ee7626] to-[#fef605] rounded-[60%] blur-[180px] opacity-60 animate-glowMove"></div>

        {/* Noise Overlay */}
        <div className="absolute inset-0 w-full h-full bg-[url('/noise.webp')] bg-cover opacity-15 mix-blend-overlay"></div>
      </div>
      
      {/* Main Heading Above the Image */}
      <h1 className="mt-20 text-7xl lg:text-8xl font-extrabold leading-tight text-white mb-6">
        FIND YOUR <br /> <span className="text-[#F96D00]">STRENGTH</span>
      </h1>

      {/* Image Container */}
      <div className="relative mt-6 w-[90%] max-w-5xl">
        <img
          src="/background.jpg"
          alt="Hero Background"
          className="w-full h-[450px] object-cover rounded-3xl" // Increased width, slightly cropped, more rounded
        />

        {/* Text Inside the Image */}
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center">
          <p className="text-7xl lg:text-9xl font-extrabold text-white">INSIDE</p>
          <p className="text-7xl lg:text-9xl font-extrabold text-[#F2F2F2]">AND OUT.</p>
        </div>
      </div>

      {/* Sparkle Icon */}
      <div className="mt-16">
        {/* Sparkle Icon */}
        <span className="text-white text-7xl">✦</span>
      </div>

      {/* Space Between Sparkle and Next Text Section */}
      <div className="mt-8 text-center">
        {/* Fitness Heading */}
        <p className="text-3xl lg:text-4xl font-extrabold text-[#F2F2F2]">
          FITNESS SHOULD BE 
        </p>
        <p className="text-3xl lg:text-4xl font-extrabold text-[#F2F2F2]">
          ACCESSIBLE TO EVERYONE.
        </p>
        </div>
    
      <p className="mt-5 text-[#F2F2F2] max-w-2xl text-lg">
        Strength starts from within. Join a community that pushes you beyond limits, 
          supports your goals, and fuels your transformation.  
          <br /><br />
          Join us today and take the first step towards a stronger, healthier you.
      </p>

      {/* CTA Button */}
      <button className="mt-7 px-6 py-3 bg-[#F96D00] text-white font-semibold rounded-md hover:bg-opacity-80 transition">
        Join Today
      </button>
    </section>
  );
};

export default Hero;
