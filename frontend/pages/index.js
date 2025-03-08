import Navbar from "@/components/website/Navbar";
import Hero from "@/components/website/Hero";
import StatsSection from "@/components/website/StatsSection";
import Marquee from "@/components/website/Marquee";
import Specialities from "@/components/website/specialities";
import OurWebApplication from "@/components/website/WebApp";
import PricingSection from "@/components/website/PricingSection";
import Testimonials from "@/components/website/Testimonials";
import Footer from "@/components/website/Footer";
import Chatbot from "@/components/website/Chatbot";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#000000] text-white">
      <Navbar />
      <Hero />
      <StatsSection />
      <Marquee />
      <Specialities />
      <OurWebApplication />
      <Marquee/>
      <PricingSection />
      <Testimonials />
      <Footer />
      <Chatbot/>
    </div>
  );
}
