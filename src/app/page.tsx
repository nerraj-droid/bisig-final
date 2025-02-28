import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-sm z-50 border-b">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Image
              src="/bisig-logo.jpg"
              alt="BISIG Logo"
              width={40}
              height={40}
              className="rounded-full"
            />
            <h1 className="text-xl font-semibold text-[#1e3a8a]">BISIG</h1>
          </div>
          <Link href="/login">
            <Button variant="default" className="bg-[#c2410c] hover:bg-[#9a3412] text-white">
              Login
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4 md:pt-32 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-pattern.svg"
            alt="Background Pattern"
            fill
            className="opacity-5 object-cover"
          />
        </div>
        <div className="container mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="max-w-3xl">
              <h2 className="text-4xl md:text-5xl font-bold text-[#1e3a8a] mb-6">
                Empowering Communities through Digital Transformation
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                A comprehensive data management solution designed to streamline barangay operations,
                enhance resident services, and foster sustainable community development.
              </p>
              <div className="flex gap-4">
                <Link href="/login">
                  <Button className="bg-[#c2410c] hover:bg-[#9a3412] text-white">
                    Get Started
                  </Button>
                </Link>
                <Button variant="outline" className="border-[#1e3a8a] text-[#1e3a8a] hover:bg-blue-50">
                  Learn More
                </Button>
              </div>
            </div>
            <div className="relative h-[400px] hidden md:block">
              <Image
                src="/hero-illustration.svg"
                alt="Digital Transformation Illustration"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-12 px-4 bg-gradient-to-b from-blue-50 to-white relative">
        <div className="absolute inset-0 z-0">
          <Image
            src="/features-pattern.svg"
            alt="Features Pattern"
            fill
            className="opacity-5 object-cover"
          />
        </div>
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1e3a8a] mb-4">Key Features</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our integrated system provides powerful tools to manage your barangay efficiently
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-[#eab308]/20 hover:border-[#eab308]/50 transition-colors group">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-[#eab308]/10 flex items-center justify-center group-hover:bg-[#eab308]/20 transition-colors">
                  <svg className="w-5 h-5 text-[#eab308]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-[#1e3a8a]">Resident Management</h3>
              </div>
              <div className="relative h-40 mb-4">
                <Image
                  src="/resident-management.svg"
                  alt="Resident Management"
                  fill
                  className="object-contain"
                />
              </div>
              <p className="text-gray-600">
                Comprehensive resident profiling, household management, and demographic tracking
                for better community service delivery.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-[#c2410c]/20 hover:border-[#c2410c]/50 transition-colors group">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-[#c2410c]/10 flex items-center justify-center group-hover:bg-[#c2410c]/20 transition-colors">
                  <svg className="w-5 h-5 text-[#c2410c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-[#1e3a8a]">Certificate System</h3>
              </div>
              <div className="relative h-40 mb-4">
                <Image
                  src="/certificate-system.svg"
                  alt="Certificate System"
                  fill
                  className="object-contain"
                />
              </div>
              <p className="text-gray-600">
                Efficient processing of barangay clearances, certificates, and permits with
                digital verification and tracking.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-[#1e3a8a]/20 hover:border-[#1e3a8a]/50 transition-colors group">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-[#1e3a8a]/10 flex items-center justify-center group-hover:bg-[#1e3a8a]/20 transition-colors">
                  <svg className="w-5 h-5 text-[#1e3a8a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-[#1e3a8a]">GIS Integration</h3>
              </div>
              <div className="relative h-40 mb-4">
                <Image
                  src="/gis-integration.svg"
                  alt="GIS Integration"
                  fill
                  className="object-contain"
                />
              </div>
              <p className="text-gray-600">
                Interactive mapping system for better spatial planning and household location
                management within the barangay.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 bg-gradient-to-br from-[#1e3a8a] to-[#1e40af] text-white relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/cta-pattern.svg"
            alt="CTA Pattern"
            fill
            className="opacity-10 object-cover"
          />
        </div>
        <div className="container mx-auto text-center relative z-10">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Barangay?</h2>
            <p className="text-lg mb-8 text-blue-100">
              Join us in building a more efficient and connected community through digital innovation.
            </p>
            <Link href="/login">
              <Button className="bg-[#eab308] text-[#1e3a8a] hover:bg-[#facc15]">
                Access the System
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}