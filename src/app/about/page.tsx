"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Navbar from "@/components/Navbar";

export default function AboutPage() {
    return (
        <div className="min-h-screen">
            {/* Using the client component Navbar */}
            <Navbar />

            {/* Header Section */}
            <section className="relative pt-32 pb-16 overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-grid-blue-5"></div>

                {/* Floating Elements */}
                <div className="absolute top-40 right-10 w-64 h-64 rounded-full bg-blue-400 blur-3xl opacity-20 animate-float"></div>
                <div className="absolute bottom-20 left-10 w-48 h-48 rounded-full bg-indigo-500 blur-3xl opacity-10 animate-float-delay"></div>

                <div className="container mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <div className="inline-block px-4 py-1 rounded-full bg-blue-100 text-blue-800 font-medium mb-4">
                            About BiSiG
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gradient">
                            Empowering Barangay Governance
                        </h1>
                        <p className="text-lg md:text-xl text-gray-600 mb-8">
                            Learn more about our mission, our team, and how BiSiG is transforming digital governance across the Philippines.
                        </p>
                    </div>
                </div>
            </section>

            {/* About Description */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold mb-6 text-gray-900">Our Mission</h2>
                            <p className="text-lg text-gray-700 mb-6">
                                BiSiG (Barangay Information System in Governance) was created with a clear mission: to digitize and streamline barangay operations across the Philippines, making governance more efficient, transparent, and accessible to all citizens.
                            </p>
                            <p className="text-lg text-gray-700 mb-6">
                                We believe that technology should serve communities by reducing administrative burdens, eliminating paperwork, and enabling officials to focus on what matters most - serving their constituents effectively.
                            </p>
                            <p className="text-lg text-gray-700">
                                Our platform integrates all aspects of barangay management into one cohesive system, from resident information management to financial transparency, case handling, and emergency response coordination.
                            </p>
                        </div>
                        <div className="relative">
                            <div className="rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
                                <Image
                                    src="/barangay-meeting.jpg"
                                    alt="Barangay officials using BiSiG"
                                    width={600}
                                    height={400}
                                    className="w-full h-auto object-cover"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = "https://placehold.co/600x400/2563eb/ffffff?text=Barangay+Officials";
                                    }}
                                />
                            </div>
                            <div className="absolute -bottom-4 -right-4 bg-white p-3 rounded-xl shadow-lg">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    <span className="text-sm font-medium">Serving 100+ Barangays</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Key Values Section */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold mb-6 text-gray-900">Our Core Values</h2>
                        <p className="text-lg text-gray-700">
                            These principles guide our development and shape our commitment to communities across the Philippines.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Value 1 */}
                        <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 border border-gray-100">
                            <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-gray-800">Transparency</h3>
                            <p className="text-gray-600">
                                We believe in complete transparency in governance. Our system makes information accessible to citizens while maintaining appropriate privacy and security controls.
                            </p>
                        </div>

                        {/* Value 2 */}
                        <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 border border-gray-100">
                            <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-gray-800">Security</h3>
                            <p className="text-gray-600">
                                We prioritize the security of sensitive community data, implementing industry-standard protocols and regularly updating our security measures to protect information.
                            </p>
                        </div>

                        {/* Value 3 */}
                        <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 border border-gray-100">
                            <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-gray-800">Inclusivity</h3>
                            <p className="text-gray-600">
                                We design our solutions to be inclusive and accessible to all community members, regardless of technical expertise, ensuring no one is left behind in digital governance.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Technology Stack Section */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold mb-6 text-gray-900">Our Technology</h2>
                        <p className="text-lg text-gray-700">
                            BiSiG is built using modern, reliable technologies that ensure performance, security, and scalability.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-6">
                        <div className="bg-gray-50 p-6 rounded-xl text-center hover:shadow-md transition-all">
                            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                <Image
                                    src="/logos/next-js.svg"
                                    alt="Next.js"
                                    width={64}
                                    height={64}
                                    className="object-contain"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = "https://placehold.co/64x64/2563eb/ffffff?text=Next.js";
                                    }}
                                />
                            </div>
                            <h3 className="font-bold text-gray-900">Next.js</h3>
                            <p className="text-sm text-gray-600">Modern React Framework</p>
                        </div>

                        <div className="bg-gray-50 p-6 rounded-xl text-center hover:shadow-md transition-all">
                            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                <Image
                                    src="/logos/prisma.svg"
                                    alt="Prisma"
                                    width={64}
                                    height={64}
                                    className="object-contain"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = "https://placehold.co/64x64/2563eb/ffffff?text=Prisma";
                                    }}
                                />
                            </div>
                            <h3 className="font-bold text-gray-900">Prisma</h3>
                            <p className="text-sm text-gray-600">Type-safe Database Access</p>
                        </div>

                        <div className="bg-gray-50 p-6 rounded-xl text-center hover:shadow-md transition-all">
                            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                <Image
                                    src="/logos/postgresql.svg"
                                    alt="PostgreSQL"
                                    width={64}
                                    height={64}
                                    className="object-contain"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = "https://placehold.co/64x64/2563eb/ffffff?text=PostgreSQL";
                                    }}
                                />
                            </div>
                            <h3 className="font-bold text-gray-900">PostgreSQL</h3>
                            <p className="text-sm text-gray-600">Reliable Database</p>
                        </div>

                        <div className="bg-gray-50 p-6 rounded-xl text-center hover:shadow-md transition-all">
                            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                <Image
                                    src="/logos/tailwind.svg"
                                    alt="Tailwind CSS"
                                    width={64}
                                    height={64}
                                    className="object-contain"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = "https://placehold.co/64x64/2563eb/ffffff?text=Tailwind";
                                    }}
                                />
                            </div>
                            <h3 className="font-bold text-gray-900">Tailwind CSS</h3>
                            <p className="text-sm text-gray-600">Utility-first Styling</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold mb-6 text-gray-900">Our Team</h2>
                        <p className="text-lg text-gray-700">
                            BiSiG is developed by a passionate team of Filipino developers, governance experts, and community advocates.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Team Member 1 */}
                        <div className="bg-white rounded-xl shadow-md overflow-hidden">
                            <div className="h-64 relative">
                                <Image
                                    src="/team/developer1.jpg"
                                    alt="Team Member"
                                    fill
                                    className="object-cover"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = "https://placehold.co/400x400/2563eb/ffffff?text=Team+Member";
                                    }}
                                />
                            </div>
                            <div className="p-6">
                                <h3 className="font-bold text-xl mb-1">Juan Dela Cruz</h3>
                                <p className="text-blue-600 mb-3">Lead Developer</p>
                                <p className="text-gray-600 text-sm">
                                    With over 10 years of experience in developing government systems, Juan leads our technical development.
                                </p>
                            </div>
                        </div>

                        {/* Team Member 2 */}
                        <div className="bg-white rounded-xl shadow-md overflow-hidden">
                            <div className="h-64 relative">
                                <Image
                                    src="/team/governance1.jpg"
                                    alt="Team Member"
                                    fill
                                    className="object-cover"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = "https://placehold.co/400x400/2563eb/ffffff?text=Team+Member";
                                    }}
                                />
                            </div>
                            <div className="p-6">
                                <h3 className="font-bold text-xl mb-1">Maria Santos</h3>
                                <p className="text-blue-600 mb-3">Governance Specialist</p>
                                <p className="text-gray-600 text-sm">
                                    A former barangay captain, Maria brings practical experience to ensure our platform meets real governance needs.
                                </p>
                            </div>
                        </div>

                        {/* Team Member 3 */}
                        <div className="bg-white rounded-xl shadow-md overflow-hidden">
                            <div className="h-64 relative">
                                <Image
                                    src="/team/support1.jpg"
                                    alt="Team Member"
                                    fill
                                    className="object-cover"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = "https://placehold.co/400x400/2563eb/ffffff?text=Team+Member";
                                    }}
                                />
                            </div>
                            <div className="p-6">
                                <h3 className="font-bold text-xl mb-1">Paolo Reyes</h3>
                                <p className="text-blue-600 mb-3">Support Manager</p>
                                <p className="text-gray-600 text-sm">
                                    Paolo ensures that every barangay using BiSiG receives timely support and comprehensive training.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="py-16 bg-blue-900 text-white">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-12">
                        <h2 className="text-3xl font-bold mb-6">Get in Touch</h2>
                        <p className="text-lg text-blue-100">
                            Have questions about BiSiG? Our team is ready to assist you.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="bg-blue-800 rounded-xl p-8">
                                <h3 className="text-xl font-bold mb-4">Contact Information</h3>
                                <div className="space-y-4">
                                    <div className="flex items-start">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 mt-1 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        <div>
                                            <p className="font-medium">Phone</p>
                                            <p className="text-blue-300">+63 (2) 8123 4567</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 mt-1 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        <div>
                                            <p className="font-medium">Email</p>
                                            <p className="text-blue-300">info@bisig.gov.ph</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 mt-1 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <div>
                                            <p className="font-medium">Address</p>
                                            <p className="text-blue-300">DICT Building, C.P. Garcia Avenue, Diliman, Quezon City, Philippines</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-8 text-gray-900">
                            <h3 className="text-xl font-bold mb-6">Send us a Message</h3>
                            <form>
                                <div className="grid gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                        <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                        <input type="email" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                        <textarea rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                                    </div>
                                    <Button className="bg-blue-700 hover:bg-blue-800 text-white py-3 rounded-md font-medium">
                                        Send Message
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center mb-4">
                                <div className="h-10 w-10 relative rounded-full overflow-hidden mr-2">
                                    <Image
                                        src="/bisig-logo.jpg"
                                        alt="BiSiG Logo"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <span className="text-xl font-bold">BiSiG</span>
                            </div>
                            <p className="text-gray-400">
                                Barangay Information System in Governance - modernizing barangay management across the Philippines.
                            </p>
                        </div>

                        <div>
                            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
                            <ul className="space-y-2">
                                <li><a href="/" className="text-gray-400 hover:text-white transition-colors">Home</a></li>
                                <li><a href="/about" className="text-gray-400 hover:text-white transition-colors">About</a></li>
                                <li><a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                                <li><a href="#contact" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-bold text-lg mb-4">Legal</h3>
                            <ul className="space-y-2">
                                <li><a href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
                                <li><a href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                                <li><a href="/data-security" className="text-gray-400 hover:text-white transition-colors">Data Security</a></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-bold text-lg mb-4">Connect</h3>
                            <div className="flex space-x-4">
                                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                                    <span className="sr-only">Facebook</span>
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path>
                                    </svg>
                                </a>
                                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-400 transition-colors">
                                    <span className="sr-only">Twitter</span>
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                                    </svg>
                                </a>
                                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors">
                                    <span className="sr-only">YouTube</span>
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 mt-8 pt-8 text-center">
                        <p className="text-gray-400 text-sm">
                            © {new Date().getFullYear()} BiSiG - Barangay Information System in Governance. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
} 