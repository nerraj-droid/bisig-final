import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import { 
  Calendar, 
  Home, 
  Building, 
  FileText, 
  Users, 
  Vote, 
  AlertTriangle, 
  Clipboard 
} from "lucide-react";
import { format } from "date-fns";
import { PageTransition } from "@/components/ui/page-transition";

// Initialize Prisma client
const prisma = new PrismaClient();

async function getDashboardData() {
  // Get counts for residents
  const totalResidents = await prisma.resident.count();
  const maleResidents = await prisma.resident.count({
    where: { gender: "MALE" }
  });
  const femaleResidents = await prisma.resident.count({
    where: { gender: "FEMALE" }
  });

  // Get counts for households
  const totalHouseholds = await prisma.household.count();
  
  // Get counts for certificates
  const totalCertificates = await prisma.certificate.count();
  const releasedCertificates = await prisma.certificate.count({
    where: { status: "RELEASED" }
  });
  const pendingCertificates = await prisma.certificate.count({
    where: { status: "PENDING" }
  });

  // Get certificate types distribution
  const certificatesByType = await prisma.certificate.groupBy({
    by: ['type'],
    _count: {
      type: true
    }
  });

  // Get household types distribution
  const householdsByType = await prisma.household.groupBy({
    by: ['type'],
    _count: {
      type: true
    }
  });

  // Get officials
  const officials = await prisma.officials.findMany({
    take: 5,
    orderBy: {
      id: 'desc'
    }
  });

  return {
    residents: {
      total: totalResidents,
      male: maleResidents,
      female: femaleResidents
    },
    households: {
      total: totalHouseholds,
      byType: householdsByType
    },
    certificates: {
      total: totalCertificates,
      released: releasedCertificates,
      pending: pendingCertificates,
      byType: certificatesByType
    },
    officials: officials
  };
}

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  const data = await getDashboardData();
  
  const today = new Date();
  const formattedDate = format(today, "MMMM d yyyy");
  
  const nextDays = [
    format(new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000), "d"),
    format(new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000), "d"),
    format(new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000), "d")
  ];

  const mockEvents = [
    { title: "Barangay Meeting", time: new Date().setHours(8, 0, 0, 0) },
    { title: "Outreach Program", time: new Date().setHours(13, 0, 0, 0) }
  ];

  return (
    <PageTransition>
      <div className="w-full space-y-4 sm:space-y-6">
        {/* Welcome Section */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-[#F39C12]/30">
          <h1 className="text-xl sm:text-2xl font-bold text-[#006B5E]">
            Welcome back, {session?.user?.name || 'User'}!
          </h1>
          <p className="mt-2 text-gray-600">
            Here's what's happening in your barangay today.
          </p>
        </div>

        {/* Quick Stats - Mobile Only */}
        <div className="grid grid-cols-2 gap-3 sm:hidden">
          <div className="bg-white p-3 rounded-xl border border-[#F39C12]/30">
            <div className="flex items-center justify-between">
              <div className="text-[#006B5E] font-medium text-sm">RESIDENTS</div>
              <Users size={16} className="text-[#F39C12]" />
            </div>
            <div className="mt-2 text-2xl font-bold text-[#006B5E]">
              {data.residents.total.toLocaleString()}
            </div>
          </div>
          
          <div className="bg-white p-3 rounded-xl border border-[#F39C12]/30">
            <div className="flex items-center justify-between">
              <div className="text-[#006B5E] font-medium text-sm">CERTIFICATES</div>
              <FileText size={16} className="text-[#F39C12]" />
            </div>
            <div className="mt-2 text-2xl font-bold text-[#006B5E]">
              {data.certificates.total.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Communication Card */}
          <div className="bg-white rounded-xl border border-[#F39C12]/30 overflow-hidden">
            <div className="p-4">
              <h3 className="text-[#006B5E] font-medium">COMMUNICATION</h3>
              <div className="mt-2">
                <h4 className="text-[#006B5E]">Today, {formattedDate}</h4>
              </div>
              
              <div className="mt-4 bg-[#E8F5F3] rounded-lg p-3">
                {mockEvents.map((event, index) => (
                  <div key={index} className="flex items-center gap-3 mt-2 first:mt-0">
                    <div className="text-[#F39C12] font-bold whitespace-nowrap">
                      {format(new Date(event.time), "h a")}:
                    </div>
                    <div className="text-sm sm:text-base">{event.title}</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex border-t border-gray-100">
              <div className="flex-1 flex items-center justify-center py-4 bg-[#6B7280]/10">
                <div className="text-2xl sm:text-4xl font-bold text-[#006B5E]">{format(today, "d")}</div>
              </div>
              {nextDays.map((day, index) => (
                <div key={index} className={`flex-1 flex items-center justify-center py-4 bg-[#6B7280]/${(index + 2) * 10}`}>
                  <div className="text-2xl sm:text-4xl font-bold text-[#006B5E]">{day}</div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Document Issuance Card */}
          <div className="bg-white rounded-xl border border-[#F39C12]/30 overflow-hidden">
            <div className="p-4">
              <h3 className="text-[#006B5E] font-medium">DOCUMENT ISSUANCE</h3>
              
              <div className="mt-4 text-center">
                <div className="flex items-end justify-center">
                  <span className="text-3xl sm:text-5xl font-bold text-[#006B5E]">{data.certificates.released.toLocaleString()}</span>
                  <span className="text-xl sm:text-2xl text-[#F39C12] ml-1">/{data.certificates.total.toLocaleString()}</span>
                </div>
                <div className="mt-1 text-sm sm:text-base text-[#006B5E] font-medium">
                  BARANGAY DOCUMENTS
                </div>
              </div>
              
              <div className="mt-6 flex gap-4">
                <div className="flex-1 bg-gray-100 rounded-lg p-3 sm:p-4 text-center">
                  <div className="text-xl sm:text-2xl font-bold text-[#006B5E]">
                    {data.certificates.released.toLocaleString()}
                  </div>
                  <div className="text-xs sm:text-sm text-[#006B5E]">RELEASED</div>
                </div>
                <div className="flex-1 bg-gray-100 rounded-lg p-3 sm:p-4 text-center">
                  <div className="text-xl sm:text-2xl font-bold text-[#F39C12]">
                    {data.certificates.pending.toLocaleString()}
                  </div>
                  <div className="text-xs sm:text-sm text-[#F39C12]">PENDING</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Certificate Types Card */}
          <div className="bg-white rounded-xl border border-[#F39C12]/30 overflow-hidden">
            <div className="p-4">
              <h3 className="text-[#006B5E] font-medium">CERTIFICATE TYPES</h3>
              
              <div className="mt-4 space-y-3 sm:space-y-4">
                {data.certificates.byType.map((cert, index) => {
                  const maxCount = Math.max(...data.certificates.byType.map(c => c._count.type));
                  const width = Math.max(8, Math.round((cert._count.type / maxCount) * 32));
                  
                  return (
                    <div key={index} className="flex items-center gap-3">
                      <div className="flex-none w-24 sm:w-32">
                        <div className={`h-4 bg-[#00BFA5] rounded`} style={{ width: `${width * 8}px` }}></div>
                      </div>
                      <div className="flex-1 text-sm sm:text-base text-[#006B5E] truncate">
                        {cert.type}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Officials Card */}
          <div className="bg-white rounded-xl border border-[#F39C12]/30 overflow-hidden">
            <div className="p-4">
              <h3 className="text-[#006B5E] font-medium">BARANGAY OFFICIALS</h3>
              
              <div className="mt-4 space-y-3">
                {data.officials.map((official, index) => (
                  <div key={index} className="flex items-center p-2 sm:p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#006B5E] text-white flex items-center justify-center text-sm sm:text-base">
                      {official.punongBarangay.charAt(0)}
                    </div>
                    <div className="ml-3">
                      <div className="font-medium text-sm sm:text-base text-[#006B5E]">{official.punongBarangay}</div>
                      <div className="text-xs sm:text-sm text-gray-500">Punong Barangay</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Resident Profile Card */}
          <div className="bg-white rounded-xl border border-[#F39C12]/30 overflow-hidden">
            <div className="p-4">
              <h3 className="text-[#006B5E] font-medium">RESIDENT PROFILE</h3>
              
              <div className="mt-4 flex justify-center">
                <div className="relative w-32 h-32 sm:w-48 sm:h-48">
                  <div className="absolute inset-0 rounded-full border-8 border-[#F39C12]"></div>
                  <div className="absolute inset-0 rounded-full border-8 border-transparent border-t-[#006B5E] border-r-[#006B5E] border-b-[#006B5E]" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 0, 30% 50%, 70% 50%, 30% 50%, 0 0)' }}></div>
                  
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <div className="text-2xl sm:text-3xl font-bold text-[#006B5E]">{data.residents.total.toLocaleString()}</div>
                    <div className="text-xs sm:text-sm text-gray-500">TOTAL</div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-between">
                <div className="flex items-center">
                  <div className="text-[#006B5E] mr-2">
                    <Users size={20} className="sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-bold text-[#006B5E]">{data.residents.male.toLocaleString()}</div>
                    <div className="text-xs sm:text-sm text-[#006B5E]">MALE</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="text-[#F39C12] mr-2">
                    <Users size={20} className="sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-bold text-[#F39C12]">{data.residents.female.toLocaleString()}</div>
                    <div className="text-xs sm:text-sm text-[#F39C12]">FEMALE</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Household Types Card */}
          <div className="bg-white rounded-xl border border-[#F39C12]/30 overflow-hidden">
            <div className="p-4">
              <h3 className="text-[#006B5E] font-medium">HOUSEHOLD TYPES</h3>
              
              <div className="mt-4 space-y-3 sm:space-y-4">
                {data.households.byType.map((household, index) => {
                  const maxCount = Math.max(...data.households.byType.map(h => h._count.type));
                  const width = Math.max(8, Math.round((household._count.type / maxCount) * 32));
                  
                  return (
                    <div key={index} className="flex items-center gap-3">
                      <div className="flex-none w-24 sm:w-32">
                        <div className={`h-4 bg-[#00BFA5] rounded`} style={{ width: `${width * 8}px` }}></div>
                      </div>
                      <div className="flex-1 text-sm sm:text-base text-[#006B5E] truncate">
                        {household.type}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Disaster Risk Management Card */}
          <div className="bg-white rounded-xl border border-[#F39C12]/30 overflow-hidden col-span-1 sm:col-span-2 lg:col-span-3">
            <div className="p-4">
              <h3 className="text-[#006B5E] font-medium">DISASTER RISK MANAGEMENT</h3>
              
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-[#006B5E] text-white rounded-md flex items-center justify-center mb-2">
                    <Home size={24} className="sm:w-8 sm:h-8" />
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-[#F39C12]">{data.households.total.toLocaleString()}</div>
                  <div className="text-xs sm:text-sm text-[#006B5E]">RESIDENT HOUSES</div>
                </div>
                
                <div className="text-center">
                  <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-[#006B5E] text-white rounded-md flex items-center justify-center mb-2">
                    <FileText size={24} className="sm:w-8 sm:h-8" />
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-[#F39C12]">{data.certificates.total}</div>
                  <div className="text-xs sm:text-sm text-[#006B5E]">CERTIFICATES</div>
                </div>
                
                <div className="text-center">
                  <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-[#006B5E] text-white rounded-md flex items-center justify-center mb-2">
                    <Users size={24} className="sm:w-8 sm:h-8" />
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-[#F39C12]">{data.residents.total}</div>
                  <div className="text-xs sm:text-sm text-[#006B5E]">RESIDENTS</div>
                </div>
                
                <div className="text-center">
                  <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-[#006B5E] text-white rounded-md flex items-center justify-center mb-2">
                    <Building size={24} className="sm:w-8 sm:h-8" />
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-[#F39C12]">{data.officials.length}</div>
                  <div className="text-xs sm:text-sm text-[#006B5E]">OFFICIALS</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
