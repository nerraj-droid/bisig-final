"use client";

import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import './styles.css'
import Navbar from "@/components/Navbar"

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Using the client component Navbar */}
      <Navbar />

      {/* Enhanced Hero Section with Modern Elements */}
      <section className="relative pt-20 pb-24 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-blue-5"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-40 right-10 w-64 h-64 rounded-full bg-blue-400 blur-3xl opacity-20 animate-float"></div>
        <div className="absolute bottom-20 left-10 w-48 h-48 rounded-full bg-indigo-500 blur-3xl opacity-10 animate-float-delay"></div>
        
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 z-10">
              <div className="inline-block px-4 py-1 rounded-full bg-blue-100 text-blue-800 font-medium mb-6 animate-fade-in">
                Digitizing Local Governance in the Philippines
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight animate-fade-in-up-1">
                Barangay <span className="text-gradient">Information</span> <br className="hidden md:block" />
                System in <span className="text-gradient">Governance</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-xl animate-fade-in-up-2">
                Empowering Barangays across the Philippines with modern digital tools for efficient governance, 
                transparent operations, and enhanced community services.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up-3">
                <a 
                  href="/request-demo" 
                  className="px-8 py-4 bg-gradient-to-r from-blue-700 to-blue-900 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition duration-300 hover-lift text-center"
                >
                  Request a Demo
                </a>
                <a 
                  href="#features" 
                  className="px-8 py-4 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold shadow-sm hover:shadow-md transition duration-300 hover-lift text-center"
                >
                  Explore Features
                </a>
              </div>
              
              <div className="mt-8 flex items-center gap-4 text-gray-600 animate-fade-in-up-4">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-xs text-blue-800">P1</div>
                  <div className="w-8 h-8 rounded-full bg-green-200 flex items-center justify-center text-xs text-green-800">P2</div>
                  <div className="w-8 h-8 rounded-full bg-yellow-200 flex items-center justify-center text-xs text-yellow-800">P3</div>
                  <div className="w-8 h-8 rounded-full bg-red-200 flex items-center justify-center text-xs text-red-800">P4</div>
                </div>
                <span className="text-sm">Trusted by 100+ Barangays Nationwide</span>
              </div>
            </div>
            
            <div className="lg:w-1/2 relative animate-fade-in-up-2">
              <div className="relative z-10">
                <div className="w-full h-full rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
                  <img 
                    src="/bisig-logo.jpg" 
                    alt="Modern Barangay Operations" 
                    className="w-full h-auto object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://placehold.co/600x400/2563eb/ffffff?text=Barangay+Hall";
                    }}
                  />
                </div>
                <div className="absolute -bottom-4 -right-4 bg-white p-3 rounded-xl shadow-lg animate-bounce-slow">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">Live Updates</span>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 p-4 glass-card rounded-xl animate-bounce-slow-alt">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-700" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Compliance Status</p>
                    <p className="font-medium text-blue-800">DILG Approved</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partner Logos Section - Enhanced with more modern design */}
      <section className="py-12 bg-white border-y border-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Trusted by Government Agencies</h3>
            <p className="text-gray-500 max-w-md mx-auto">Empowering digital transformation across Philippine government institutions</p>
          </div>
          
          <div className="relative overflow-hidden py-6">
            {/* Background elements */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-transparent to-blue-50 z-10 pointer-events-none"></div>
            
            <div className="flex justify-around items-center gap-8 flex-wrap md:flex-nowrap animate-marquee">
              {/* DILG Logo */}
              <div className="relative w-32 h-32 grayscale hover:grayscale-0 transition-all duration-500 flex-shrink-0 hover:scale-110 transform cursor-pointer group">
                <div className="w-full h-full flex items-center justify-center bg-white rounded-lg shadow-md group-hover:shadow-lg border border-gray-100 transition-all">
                  <div className="relative w-24 h-24">
                    <Image
                      src="/logos/dilg-logo.png" 
                      alt="DILG Logo"
                      fill
                      className="object-contain p-2"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://placehold.co/200/0047AB/white?text=DILG";
                      }}
                    />
                  </div>
                </div>
              </div>
              
              {/* Bagong Pilipinas Logo */}
              <div className="relative w-40 h-32 grayscale hover:grayscale-0 transition-all duration-500 flex-shrink-0 hover:scale-110 transform cursor-pointer group animate-bounce-slow">
                <div className="w-full h-full flex items-center justify-center rounded-lg bg-white shadow-md group-hover:shadow-lg border border-gray-100 transition-all">
                  <div className="relative w-32 h-24">
                    <Image
                      src="/bagong-pilipinas.png"
                      alt="Bagong Pilipinas Logo"
                      fill
                      className="object-contain p-2"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://placehold.co/200/FFA500/white?text=Bagong+Pilipinas";
                      }}
                    />
                  </div>
                </div>
              </div>
              
              {/* DICT Logo */}
              <div className="relative w-32 h-32 grayscale hover:grayscale-0 transition-all duration-500 flex-shrink-0 hover:scale-110 transform cursor-pointer group animate-bounce-slow-alt">
                <div className="w-full h-full flex items-center justify-center rounded-lg bg-white shadow-md group-hover:shadow-lg border border-gray-100 transition-all">
                  <div className="relative w-24 h-24">
                    <Image
                      src="/logos/dict-logo.jpg"
                      alt="DICT Logo"
                      fill
                      className="object-contain p-2"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://placehold.co/200/1E40AF/white?text=DICT";
                      }}
                    />
                  </div>
                </div>
              </div>
              
              {/* BISIG Logo */}
              <div className="relative w-32 h-32 grayscale hover:grayscale-0 transition-all duration-500 flex-shrink-0 hover:scale-110 transform cursor-pointer group animate-bounce-slow-alt">
                <div className="w-full h-full flex items-center justify-center rounded-lg bg-white shadow-md group-hover:shadow-lg border border-gray-100 transition-all">
                  <div className="relative w-24 h-24">
                    <Image
                      src="/bisig-logo.jpg"
                      alt="BISIG Logo"
                      fill
                      className="object-contain p-2"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://placehold.co/200/22C55E/white?text=LGU";
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Partnership benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            <div className="flex items-center gap-3 p-4 rounded-lg hover:bg-blue-50 transition-colors">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Nationwide Adoption</h4>
                <p className="text-sm text-gray-600">Deployed across multiple regions</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 rounded-lg hover:bg-blue-50 transition-colors">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Government Verified</h4>
                <p className="text-sm text-gray-600">Follows DICT security protocols</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 rounded-lg hover:bg-blue-50 transition-colors">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">LGU Integrated</h4>
                <p className="text-sm text-gray-600">Seamlessly works with local systems</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section with Enhanced Cards and Descriptions */}
      <section id="features" className="py-20 relative">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-grid-blue-5"></div>
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-blue-400 blur-3xl opacity-10"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-indigo-500 blur-3xl opacity-10"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-block px-4 py-1 rounded-full bg-blue-100 text-blue-800 font-medium mb-4">
              Comprehensive Features
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-5 text-gradient">Everything Your Barangay Needs</h2>
            <p className="text-lg text-gray-600">
              BiSiG provides a complete suite of digital tools designed specifically for Philippine Barangay operations,
              compliance, and community service.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Card 1 - Resident Information Management */}
            <div className="bg-white rounded-2xl shadow-lg p-8 hover-lift hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Resident Information Management</h3>
              <p className="text-gray-600 mb-5">
                Comprehensive digital registry of all barangay residents with secure profile management and household mapping.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-700">Digital Resident Profiles</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-700">Household Mapping</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-700">Demographics Analytics</span>
                </li>
              </ul>
            </div>
            
            {/* Feature Card 2 - Document Management */}
            <div className="bg-white rounded-2xl shadow-lg p-8 hover-lift hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="w-14 h-14 bg-indigo-100 rounded-lg flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Document Management</h3>
              <p className="text-gray-600 mb-5">
                Streamline the creation, issuance, and tracking of all barangay certificates, clearances, and permits.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-700">Barangay Certificate Templates</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-700">Digital Signatures</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-700">Document Tracking System</span>
                </li>
              </ul>
            </div>
            
            {/* Feature Card 3 - Case Management */}
            <div className="bg-white rounded-2xl shadow-lg p-8 hover-lift hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Case Management</h3>
              <p className="text-gray-600 mb-5">
                Digital case filing, hearing scheduling, and resolution management for barangay justice system.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-700">Digital Blotter System</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-700">Hearing Scheduler</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-700">Resolution Templates</span>
                </li>
              </ul>
            </div>
            
            {/* Feature Card 4 - Disaster Management */}
            <div className="bg-white rounded-2xl shadow-lg p-8 hover-lift hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="w-14 h-14 bg-red-100 rounded-lg flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-red-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Disaster Management</h3>
              <p className="text-gray-600 mb-5">
                Emergency response coordination and relief operations management for natural disasters and crisis situations.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-700">Emergency Alert System</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-700">Relief Distribution Tracking</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-700">Evacuation Center Management</span>
                </li>
              </ul>
            </div>
            
            {/* Feature Card 5 - Financial Management */}
            <div className="bg-white rounded-2xl shadow-lg p-8 hover-lift hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Financial Management</h3>
              <p className="text-gray-600 mb-5">
                Budget planning, expense tracking, and financial reporting system for transparent barangay fund management.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="text-gray-700 text-sm">E-Governance Standards</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="text-gray-700 text-sm">Data Privacy Compliant</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 mr-2 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="text-gray-700 text-sm">DICT Security Certified</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="flex justify-center mt-12">
            <Link href="/request-demo">
              <Button className="bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white px-6 py-3 rounded-full text-lg font-semibold shadow-md hover:shadow-lg transition-all">
                Request Full Feature Demo
                <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* New Statistics Section */}
      <section className="py-16 px-4 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/hero-pattern.svg')] opacity-5"></div>
        
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1e3a8a] mb-4">Making an Impact Across the Philippines</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our digital solutions are transforming barangay operations throughout the country
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Stat 1 */}
            <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl shadow-lg border border-blue-100 transform transition-transform hover:-translate-y-1 hover:shadow-xl text-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#1e3a8a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="relative">
                <span className="text-5xl font-bold text-[#1e3a8a] mb-2 block">100+</span>
                <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                  Growing
                </div>
              </div>
              <p className="text-gray-600 font-medium">Barangays Using BISIG</p>
              <p className="text-sm text-gray-500 mt-2">Across multiple provinces</p>
            </div>
            
            {/* Stat 2 */}
            <div className="bg-gradient-to-br from-orange-50 to-white p-8 rounded-2xl shadow-lg border border-orange-100 transform transition-transform hover:-translate-y-1 hover:shadow-xl text-center">
              <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#c2410c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="relative">
                <span className="text-5xl font-bold text-[#c2410c] mb-2 block">15K+</span>
                <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                  Monthly
                </div>
              </div>
              <p className="text-gray-600 font-medium">Certificates Generated</p>
              <p className="text-sm text-gray-500 mt-2">Digital & verifiable</p>
            </div>
            
            {/* Stat 3 */}
            <div className="bg-gradient-to-br from-green-50 to-white p-8 rounded-2xl shadow-lg border border-green-100 transform transition-transform hover:-translate-y-1 hover:shadow-xl text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <div className="relative">
                <span className="text-5xl font-bold text-green-600 mb-2 block">98%</span>
                <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  Accuracy
                </div>
              </div>
              <p className="text-gray-600 font-medium">Data Integrity</p>
              <p className="text-sm text-gray-500 mt-2">Reliable resident records</p>
            </div>
            
            {/* Stat 4 */}
            <div className="bg-gradient-to-br from-purple-50 to-white p-8 rounded-2xl shadow-lg border border-purple-100 transform transition-transform hover:-translate-y-1 hover:shadow-xl text-center">
              <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="relative">
                <span className="text-5xl font-bold text-purple-600 mb-2 block">70%</span>
                <div className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                  Average
                </div>
              </div>
              <p className="text-gray-600 font-medium">Time Saved</p>
              <p className="text-sm text-gray-500 mt-2">More efficient processes</p>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <Link href="/request-demo">
              <Button className="bg-gradient-to-r from-[#1e3a8a] to-[#1e40af] text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all">
                See How BISIG Can Transform Your Barangay
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action Section with Enhanced Design */}
      <section className="relative mt-16 py-20 px-4 overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-white-5 opacity-30"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-24 h-24 rounded-full bg-blue-500 opacity-20 animate-float"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 rounded-full bg-indigo-500 opacity-20 animate-float-delay"></div>
        <div className="absolute top-40 right-1/4 w-16 h-16 rounded-full bg-purple-500 opacity-10 animate-bounce-slow"></div>
        
        <div className="container mx-auto max-w-5xl relative z-10">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white text-shadow animate-fade-in-up-1">
              Transform Your Barangay's Digital Experience Today
            </h2>
            <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto mb-8 animate-fade-in-up-2">
              Join hundreds of Barangays across the Philippines already using BiSiG to streamline operations,
              improve community engagement, and deliver better services.
            </p>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-12 animate-fade-in-up-3">
              <a 
                href="/request-demo" 
                className="px-8 py-4 bg-white text-blue-900 rounded-xl font-bold shadow-lg hover:shadow-xl transition duration-300 hover-lift text-lg"
              >
                Request a Demo
              </a>
              <a 
                href="#contact" 
                className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-bold hover:bg-white/10 transition duration-300 text-lg"
              >
                Contact Us
              </a>
            </div>
            
            <div className="flex items-center justify-center gap-8 animate-fade-in-up-4">
              <div className="flex flex-col items-center">
                <div className="text-white text-4xl font-bold mb-1">100+</div>
                <div className="text-blue-200 text-sm">Barangays</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-white text-4xl font-bold mb-1">24/7</div>
                <div className="text-blue-200 text-sm">Support</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-white text-4xl font-bold mb-1">98%</div>
                <div className="text-blue-200 text-sm">Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Call to Action with modern design elements */}
      <section className="py-24 px-4 relative overflow-hidden">
        {/* Background with modern gradient and pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a8a] via-[#1e40af] to-[#1e3a8a] z-0"></div>
        <div className="absolute inset-0 bg-[url('/cta-pattern.svg')] opacity-10 z-0"></div>
        
        {/* Floating elements */}
        <div className="absolute top-1/4 left-10 w-32 h-32 bg-white/5 rounded-full blur-3xl z-0"></div>
        <div className="absolute bottom-1/4 right-10 w-40 h-40 bg-blue-400/10 rounded-full blur-3xl z-0"></div>
        
        {/* Content */}
        <div className="container mx-auto text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            {/* Badge */}
            <div className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white font-medium text-sm mb-6 border border-white/20">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Digital Transformation Initiative
              </span>
            </div>
            
            {/* Heading with highlight */}
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Ready to Transform Your <span className="relative inline-block px-2">
                <span className="absolute inset-0 bg-orange-500/20 rounded-lg transform -skew-x-12"></span>
                <span className="relative">Barangay</span>
              </span>?
            </h2>
            
            {/* Subheading */}
            <p className="text-xl mb-10 text-blue-100">
              Join the growing network of digital-first barangays across the Philippines.
              Streamline operations, enhance resident services, and build a more connected community.
            </p>
            
            {/* CTA Buttons with modern design */}
            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <Link href="/login">
                <Button className="bg-gradient-to-r from-[#eab308] to-[#d97706] text-[#1e3a8a] hover:from-[#facc15] hover:to-[#eab308] px-10 py-7 h-auto rounded-xl text-lg font-bold transition-all duration-300 hover:shadow-lg w-full sm:w-auto group">
                  <span>Access the System</span>
                  <svg className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Button>
              </Link>
              <Link href="/request-demo">
                <Button variant="outline" className="bg-transparent border-2 border-white text-white hover:bg-white/10 px-10 py-7 h-auto rounded-xl text-lg font-semibold transition-all duration-300 w-full sm:w-auto group">
                  <span>Request a Demo</span>
                  <svg className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Button>
              </Link>
            </div>
            
            {/* Compliance badges */}
            <div className="mt-16 flex flex-col items-center justify-center">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 max-w-lg mx-auto">
                <p className="text-white/80 mb-4 text-sm font-medium">Government Compliance & Certifications</p>
                <div className="flex flex-wrap justify-center gap-4">
                  <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
                    <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span className="text-white text-sm">E-Governance Standards</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
                    <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span className="text-white text-sm">Data Privacy Compliant</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
                    <svg className="h-5 w-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-white text-sm">DICT Security Certified</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex items-center justify-center">
                <p className="text-sm text-white/60">© 2024 BISIG - Barangay Information System Integration Gateway</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-block px-4 py-1 rounded-full bg-blue-100 text-blue-800 font-medium mb-4">
              Success Stories
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-5 text-gradient">Trusted by Barangays Nationwide</h2>
            <p className="text-lg text-gray-600">
              See what our users are saying about how BiSiG has transformed their barangay operations and community services.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white rounded-2xl shadow-lg p-8 hover-lift hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-blue-700 font-bold">MN</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">Maria Natividad</h4>
                  <p className="text-sm text-gray-600">Barangay Captain, Mabini</p>
                </div>
              </div>
              <div className="mb-6">
                <div className="flex text-yellow-400 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <p className="text-gray-600 mb-4">
                  "BiSiG has been a game-changer for our barangay. It has streamlined our operations and made our community services more efficient. The system is user-friendly and the support team is always responsive. We highly recommend BiSiG to any barangay looking to improve their digital governance."
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center text-xs text-blue-800">MN</div>
                  <div>
                    <p className="text-sm font-medium">Maria Natividad</p>
                    <p className="text-xs text-gray-500">Barangay Captain, Mabini</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Testimonial 2 */}
            <div className="bg-white rounded-2xl shadow-lg p-8 hover-lift hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-green-700 font-bold">JS</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">John Smith</h4>
                  <p className="text-sm text-gray-600">Barangay Secretary, San Jose</p>
                </div>
              </div>
              <div className="mb-6">
                <div className="flex text-yellow-400 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <p className="text-gray-600 mb-4">
                  "BiSiG has made our barangay operations more transparent and efficient. The system's reporting features have helped us monitor our finances better, and the digital signatures have made our document management process much smoother. We've seen a significant improvement in our community services since implementing BiSiG."
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center text-xs text-green-800">JS</div>
                  <div>
                    <p className="text-sm font-medium">John Smith</p>
                    <p className="text-xs text-gray-500">Barangay Secretary, San Jose</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Testimonial 3 */}
            <div className="bg-white rounded-2xl shadow-lg p-8 hover-lift hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-purple-700 font-bold">AK</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">Ava Kline</h4>
                  <p className="text-sm text-gray-600">Barangay Treasurer, Caloocan</p>
                </div>
              </div>
              <div className="mb-6">
                <div className="flex text-yellow-400 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <p className="text-gray-600 mb-4">
                  "BiSiG has been a game-changer for our barangay. It has streamlined our operations and made our community services more efficient. The system is user-friendly and the support team is always responsive. We highly recommend BiSiG to any barangay looking to improve their digital governance."
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center text-xs text-purple-800">AK</div>
                  <div>
                    <p className="text-sm font-medium">Ava Kline</p>
                    <p className="text-xs text-gray-500">Barangay Treasurer, Caloocan</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <a 
              href="/testimonials" 
              className="inline-flex items-center text-blue-700 font-medium hover:text-blue-800"
            >
              View all success stories
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          {/* Footer content */}
        </div>
      </footer>
    </div>
  );
}