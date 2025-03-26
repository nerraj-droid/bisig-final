'use client';

import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import React, { useState, ChangeEvent, FormEvent } from 'react';
import '../styles.css'

export default function RequestDemo() {
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    email: '',
    phone: '',
    barangay: '',
    city: '',
    province: '',
    preferred_date: '',
    interests: {
      resident_management: false,
      certificate_system: false,
      gis_integration: false,
      disaster_management: false,
      ai_integration: false
    },
    message: ''
  });

  const [formStatus, setFormStatus] = useState({
    submitted: false,
    error: false,
    message: ''
  });

  const [validation, setValidation] = useState({
    name: true,
    email: true,
    phone: true,
    barangay: true,
    city: true,
    province: true
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const target = e.target as HTMLInputElement;
    const type = target.type;
    const checked = target.checked;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        interests: {
          ...prev.interests,
          [name]: checked
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validateForm = () => {
    const newValidation = {
      name: !!formData.name.trim(),
      email: /^\S+@\S+\.\S+$/.test(formData.email),
      phone: /^(\+?\d{1,4}[\s-])?(?!0+\s+,?$)\d{10}$/.test(formData.phone.replace(/[^0-9]/g, '')),
      barangay: !!formData.barangay.trim(),
      city: !!formData.city.trim(),
      province: !!formData.province.trim()
    };
    
    setValidation(newValidation);
    
    return Object.values(newValidation).every(isValid => isValid);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setFormStatus({
        submitted: false,
        error: true,
        message: 'Please fill in all required fields correctly.'
      });
      return;
    }
    
    setFormStatus({
      submitted: false,
      error: false,
      message: 'Submitting your request...'
    });
    
    // In a real application, you would send this data to your backend API
    // For demonstration purposes, we'll simulate a successful API call
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Log the data (for demonstration)
      console.log('Form submitted with data:', formData);
      
      // Normally you would send this to your backend:
      /*
      const response = await fetch('/api/demo-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit request');
      }
      */
      
      // If successful:
      setFormStatus({
        submitted: true,
        error: false,
        message: 'Your demo request has been submitted successfully! Our team will contact you within 2-3 business days to confirm your preferred date and time.'
      });
      
      // Optional: Reset form
      setFormData({
        name: '',
        position: '',
        email: '',
        phone: '',
        barangay: '',
        city: '',
        province: '',
        preferred_date: '',
        interests: {
          resident_management: false,
          certificate_system: false,
          gis_integration: false,
          disaster_management: false,
          ai_integration: false
        },
        message: ''
      });
      
    } catch (error) {
      console.error('Error submitting form:', error);
      setFormStatus({
        submitted: false,
        error: true,
        message: 'There was an error submitting your request. Please try again or contact us directly.'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 border-b shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 animate-fade-in">
            <Image
              src="/bisig-logo.jpg"
              alt="BISIG Logo"
              width={45}
              height={45}
              className="rounded-full border-2 border-[#1e3a8a]/20"
            />
            <h1 className="text-xl font-bold text-[#1e3a8a]">BISIG</h1>
          </Link>
          <div className="animate-fade-in">
            <Link href="/login">
              <Button variant="default" className="bg-[#c2410c] hover:bg-[#9a3412] text-white font-medium px-6 py-2 rounded-full transition-all duration-300 hover:shadow-lg">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 pt-28 pb-20">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <div className="mb-8 animate-fade-in">
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2 text-sm text-gray-500">
                <li>
                  <Link href="/" className="hover:text-[#1e3a8a]">Home</Link>
                </li>
                <li>
                  <span className="mx-2">/</span>
                </li>
                <li className="font-medium text-[#1e3a8a]">
                  Request a Demo
                </li>
              </ol>
            </nav>
          </div>

          {/* Page Header */}
          <div className="mb-12 text-center animate-slide-up">
            <h1 className="text-4xl font-bold text-[#1e3a8a] mb-4">Request a Demo</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Experience the power of BISIG's digital transformation tools for your barangay. 
              Fill out the form below or contact us directly to schedule a personalized demo.
            </p>
          </div>

          {formStatus.submitted ? (
            <div className="bg-green-50 border border-green-200 p-8 rounded-2xl animate-fade-in">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-green-800 mb-2">Thank You!</h2>
                <p className="text-green-700 mb-6">{formStatus.message}</p>
                <div className="flex gap-4">
                  <Link href="/">
                    <Button className="bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white">
                      Return to Home
                    </Button>
                  </Link>
                  <Button 
                    onClick={() => setFormStatus({submitted: false, error: false, message: ''})} 
                    variant="outline" 
                    className="border-[#1e3a8a] text-[#1e3a8a]"
                  >
                    Submit Another Request
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-12">
              {/* Demo Request Form */}
              <div className="bg-white p-8 rounded-2xl shadow-lg animate-fade-in-up-1">
                <h2 className="text-2xl font-bold text-[#1e3a8a] mb-6">Demo Request Form</h2>
                
                {formStatus.message && (
                  <div className={`p-4 mb-6 rounded-lg ${formStatus.error ? 'bg-red-50 text-red-800' : 'bg-blue-50 text-blue-800'}`}>
                    {formStatus.message}
                  </div>
                )}
                
                <form onSubmit={handleSubmit}>
                  {/* Personal Information */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name*</label>
                        <input 
                          type="text" 
                          id="name" 
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className={`w-full px-4 py-2 border ${!validation.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] outline-none transition-all`} 
                          placeholder="Juan Dela Cruz"
                          required
                        />
                        {!validation.name && <p className="text-red-500 text-xs mt-1">Please enter your name</p>}
                      </div>
                      <div>
                        <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                        <input 
                          type="text" 
                          id="position" 
                          name="position"
                          value={formData.position}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] outline-none transition-all" 
                          placeholder="Barangay Captain"
                        />
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address*</label>
                        <input 
                          type="email" 
                          id="email" 
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className={`w-full px-4 py-2 border ${!validation.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] outline-none transition-all`} 
                          placeholder="juandelacruz@example.com"
                          required
                        />
                        {!validation.email && <p className="text-red-500 text-xs mt-1">Please enter a valid email address</p>}
                      </div>
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number*</label>
                        <input 
                          type="tel" 
                          id="phone" 
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className={`w-full px-4 py-2 border ${!validation.phone ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] outline-none transition-all`} 
                          placeholder="09XX-XXX-XXXX"
                          required
                        />
                        {!validation.phone && <p className="text-red-500 text-xs mt-1">Please enter a valid phone number</p>}
                      </div>
                    </div>
                  </div>

                  {/* Barangay Information */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Barangay Information</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label htmlFor="barangay" className="block text-sm font-medium text-gray-700 mb-1">Barangay Name*</label>
                        <input 
                          type="text" 
                          id="barangay" 
                          name="barangay"
                          value={formData.barangay}
                          onChange={handleChange}
                          className={`w-full px-4 py-2 border ${!validation.barangay ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] outline-none transition-all`} 
                          placeholder="Barangay Name"
                          required
                        />
                        {!validation.barangay && <p className="text-red-500 text-xs mt-1">Please enter your barangay name</p>}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City/Municipality*</label>
                          <input 
                            type="text" 
                            id="city" 
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border ${!validation.city ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] outline-none transition-all`} 
                            placeholder="City or Municipality"
                            required
                          />
                          {!validation.city && <p className="text-red-500 text-xs mt-1">Please enter your city/municipality</p>}
                        </div>
                        <div>
                          <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-1">Province*</label>
                          <input 
                            type="text" 
                            id="province" 
                            name="province"
                            value={formData.province}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border ${!validation.province ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] outline-none transition-all`} 
                            placeholder="Province"
                            required
                          />
                          {!validation.province && <p className="text-red-500 text-xs mt-1">Please enter your province</p>}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Demo Preferences */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Demo Preferences</h3>
                    <div>
                      <label htmlFor="preferred_date" className="block text-sm font-medium text-gray-700 mb-1">Preferred Date</label>
                      <input 
                        type="date" 
                        id="preferred_date" 
                        name="preferred_date"
                        value={formData.preferred_date}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] outline-none transition-all" 
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Interested Features</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div className="flex items-center">
                          <input 
                            type="checkbox" 
                            id="resident_management" 
                            name="resident_management"
                            checked={formData.interests.resident_management}
                            onChange={handleChange}
                            className="mr-2" 
                          />
                          <label htmlFor="resident_management">Resident Management</label>
                        </div>
                        <div className="flex items-center">
                          <input 
                            type="checkbox" 
                            id="certificate_system" 
                            name="certificate_system"
                            checked={formData.interests.certificate_system}
                            onChange={handleChange}
                            className="mr-2" 
                          />
                          <label htmlFor="certificate_system">Certificate System</label>
                        </div>
                        <div className="flex items-center">
                          <input 
                            type="checkbox" 
                            id="gis_integration" 
                            name="gis_integration"
                            checked={formData.interests.gis_integration}
                            onChange={handleChange}
                            className="mr-2" 
                          />
                          <label htmlFor="gis_integration">GIS Integration</label>
                        </div>
                        <div className="flex items-center">
                          <input 
                            type="checkbox" 
                            id="disaster_management" 
                            name="disaster_management"
                            checked={formData.interests.disaster_management}
                            onChange={handleChange}
                            className="mr-2" 
                          />
                          <label htmlFor="disaster_management">Disaster Management</label>
                        </div>
                        <div className="flex items-center">
                          <input 
                            type="checkbox" 
                            id="ai_integration" 
                            name="ai_integration"
                            checked={formData.interests.ai_integration}
                            onChange={handleChange}
                            className="mr-2" 
                          />
                          <label htmlFor="ai_integration">AI Integration</label>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Additional Information</label>
                      <textarea 
                        id="message" 
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] outline-none transition-all" 
                        placeholder="Let us know any specific questions or requirements you have..."
                      ></textarea>
                    </div>
                  </div>

                  <Button 
                    type="submit"
                    className="w-full bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white px-6 py-3 h-auto rounded-lg text-lg font-semibold transition-all duration-300 hover:shadow-lg"
                  >
                    Submit Request
                  </Button>
                  
                  <p className="mt-4 text-sm text-gray-500 text-center">
                    By submitting this form, you agree to our privacy policy and terms of service.
                  </p>
                </form>
              </div>

              {/* Contact Information */}
              <div className="animate-fade-in-up-2">
                <div className="bg-[#1e3a8a] p-8 rounded-2xl shadow-lg text-white mb-8">
                  <h2 className="text-2xl font-bold mb-6">Contact Us Directly</h2>
                  <p className="mb-6">
                    Prefer to speak with someone directly? Our team is ready to assist you with any questions.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-1">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-white/90">Phone Numbers</h3>
                        <p className="text-white/80">Main Office: (+63) 2-8876-5432</p>
                        <p className="text-white/80">Support Hotline: (+63) 2-8888-7777</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-1">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-white/90">Email Addresses</h3>
                        <p className="text-white/80">General Inquiries: info@bisig.gov.ph</p>
                        <p className="text-white/80">Support: support@bisig.gov.ph</p>
                        <p className="text-white/80">Demo Requests: demo@bisig.gov.ph</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-1">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-white/90">Office Address</h3>
                        <p className="text-white/80">DILG-BISIG Office</p>
                        <p className="text-white/80">5th Floor, DILG-NAPOLCOM Center</p>
                        <p className="text-white/80">EDSA corner Quezon Avenue, Quezon City</p>
                        <p className="text-white/80">Metro Manila, Philippines</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-8 rounded-2xl shadow-lg">
                  <h2 className="text-2xl font-bold text-[#1e3a8a] mb-6">Office Hours</h2>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Monday - Friday</span>
                      <span>8:00 AM - 5:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Saturday</span>
                      <span>8:00 AM - 12:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Sunday & Holidays</span>
                      <span>Closed</span>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-[#1e3a8a] text-sm">
                      <strong>Note:</strong> Demo requests are typically scheduled within 2-3 business days from submission.
                      Our team will reach out to confirm your preferred date and time.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-100 py-8 border-t">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600 text-sm">
            © 2024 BISIG - Barangay Information System Integration Gateway. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
} 