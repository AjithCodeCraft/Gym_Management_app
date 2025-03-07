"use client";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const Navbar = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="fixed top-0 left-0 w-full px-6 lg:px-16 py-4 flex justify-between items-center backdrop-blur-md bg-opacity-90 bg-black text-white z-50">
      {/* Logo and Title */}
      <div className="flex items-center gap-3">
        <Image src="/fortifit-logo.png" alt="FortiFit Logo" width={40} height={40} />
        <h1 className="text-3xl font-extrabold tracking-wide">
        <span className="text-white">Forti</span>
        <span className="text-[#F96D00]">Fit</span>
        </h1>
      </div>

      {/* Navigation Links */}
      <div className="hidden md:flex gap-6">
        <Link href="/" className="hover:text-[#F96D00] transition">Our Specialities</Link>
        <Link href="/" className="hover:text-[#F96D00] transition">Membership Plans</Link>
        <Link href="/" className="hover:text-[#F96D00] transition">Testimonials</Link>
        <Link href="/" className="hover:text-[#F96D00] transition">Contact</Link>
      </div>

      {/* Theme Toggle and Button */}
      <div className="flex items-center gap-4">
        {mounted && (
          <button 
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")} 
            className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition"
          >
            {theme === "dark" ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-100" />}
          </button>
        )}
       <Link href="/login">
  <button className="px-4 py-2 bg-[#F96D00] text-white font-semibold rounded-md hover:bg-opacity-80 transition">
   Login 
  </button>
</Link>

      </div>
    </nav>
  );
};

export default Navbar;
