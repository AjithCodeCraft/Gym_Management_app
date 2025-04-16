"use client";
import { motion } from "framer-motion";
import { FaInstagram, FaTwitter, FaFacebook } from "react-icons/fa";
import { Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative bg-black text-white px-10 py-16 rounded-t-3xl scroll-mt-28 " id="contact">
      {/* Top Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Subscribe Section */}
        <div>
          <h3 className="font-semibold text-lg">Stay Connected</h3>
          <div className="flex mt-4">
            <input
              type="email"
              placeholder="your@email.com"
              className="p-2 rounded-l-md text-black focus:outline-none"
            />
            <button className="bg-[#F96D00] hover:bg-[#ee7626] text-white px-4 rounded-r-md transition">
              Subscribe
            </button>
          </div>
          {/* Social Media Icons */}
          <div className="flex space-x-4 mt-4 text-lg">
            <a href="#" className="hover:text-[#F96D00] transition"><FaInstagram /></a>
            <a href="#" className="hover:text-[#F96D00] transition"><FaTwitter /></a>
            <a href="#" className="hover:text-[#F96D00] transition"><FaFacebook /></a>
          </div>
        </div>

        {/* Explore */}
        <div>
          <h3 className="font-semibold text-lg">Explore</h3>
          <ul className="mt-4 space-y-2">
            <li><a href="#" className="hover:text-[#F96D00] transition">Our Programs</a></li>
            <li><a href="#" className="hover:text-[#F96D00] transition">Membership Plans</a></li>
            <li><a href="#" className="hover:text-[#F96D00] transition">Trainers</a></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="font-semibold text-lg">Contact Us</h3>
          <div className="flex items-center mt-4">
            <MapPin className="text-[#F96D00] mr-2" />
            <p>123 Fitness Street, Mumbai, India</p>
          </div>
          <a
            href="https://goo.gl/maps/example"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#F96D00] hover:underline flex items-center mt-2"
          >
            <MapPin className="mr-2" /> View on Google Maps
          </a>
          <div className="flex items-center mt-2">
            <Phone className="text-[#F96D00] mr-2" />
            <p>+91 98765 43210</p>
          </div>
          <div className="flex items-center mt-2">
            <Mail className="text-[#F96D00] mr-2" />
            <p>support@fortifit.com</p>
          </div>
        </div>

        {/* Company Info */}
        <div>
          <h3 className="font-semibold text-lg">Company</h3>
          <ul className="mt-4 space-y-2">
            <li><a href="#" className="hover:text-[#F96D00] transition">About Us</a></li>
            <li><a href="#" className="hover:text-[#F96D00] transition">Careers</a></li>
            <li><a href="#" className="hover:text-[#F96D00] transition">Contact</a></li>
          </ul>
        </div>
      </div>

      {/* Large Brand Name */}
      <motion.h1
        className="absolute bottom-0 left-0 w-full text-center text-[100px] md:text-[140px] font-extrabold opacity-10"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.1 }}
        transition={{ duration: 1 }}
      >
        FortiFit Gym
      </motion.h1>
    </footer>
  );
}
