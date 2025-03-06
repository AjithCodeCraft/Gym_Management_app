import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import StatsSection from "@/components/StatsSection";
import Marquee from "@/components/Marquee";
import Specialities from "@/components/specialities";
import OurWebApplication from "@/components/WebApp";
import PricingSection from "@/components/PricingSection";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";

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
    </div>
  );
}
