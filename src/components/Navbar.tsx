"use client";

import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  return (
    <nav className="fixed w-full top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <a href="/" className="flex items-center">
            <div className="h-10 w-10 relative rounded-full overflow-hidden mr-2">
              <Image 
                src="/bisig-logo.jpg" 
                alt="BiSiG Logo"
                fill
                className="object-cover"
                priority
              />
            </div>
            <span className="text-xl font-bold text-blue-900">BiSiG</span>
          </a>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-blue-700 font-medium">Features</a>
            <a href="#testimonials" className="text-gray-600 hover:text-blue-700 font-medium">Testimonials</a>
            <a href="#ai-capabilities" className="text-gray-600 hover:text-blue-700 font-medium">AI Capabilities</a>
            <a href="/about" className="text-gray-600 hover:text-blue-700 font-medium">About</a>
            <a href="/request-demo" className="px-5 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition duration-300 font-medium">
              Request Demo
            </a>
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              type="button"
              className="text-gray-600 hover:text-blue-700 focus:outline-none"
              onClick={() => {
                const mobileMenu = document.getElementById('mobile-menu');
                if (mobileMenu) {
                  mobileMenu.classList.toggle('hidden');
                }
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu Dropdown */}
      <div id="mobile-menu" className="hidden md:hidden border-t border-gray-200 bg-white">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <a href="#features" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-700 hover:bg-blue-50">
            Features
          </a>
          <a href="#testimonials" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-700 hover:bg-blue-50">
            Testimonials
          </a>
          <a href="#ai-capabilities" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-700 hover:bg-blue-50">
            AI Capabilities
          </a>
          <a href="/about" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-700 hover:bg-blue-50">
            About
          </a>
          <a href="/request-demo" className="block px-3 py-2 rounded-md text-base font-medium text-white bg-blue-700 hover:bg-blue-800">
            Request Demo
          </a>
        </div>
      </div>
    </nav>
  );
} 