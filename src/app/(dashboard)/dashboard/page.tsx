import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Calendar,
  Home,
  Building,
  FileText,
  Users,
  Vote,
  AlertTriangle,
  Clipboard,
  CheckCircle,
  Clock,
  Award,
  TrendingUp,
  User,
  ChevronRight,
  ShieldAlert
} from "lucide-react";
import { format, subDays } from "date-fns";
import { PageTransition } from "@/components/ui/page-transition";

async function getDashboardData() {
  // Run all queries in parallel with Promise.all for better performance
  const [
    // Resident counts
    totalResidents,
    maleResidents,
    femaleResidents,
    seniorResidents,
    voterResidents,

    // Household counts
    totalHouseholds,
    householdsByType,

    // Certificate counts
    totalCertificates,
    releasedCertificates,
    pendingCertificates,
    certificatesByType,
    recentCertificates,

    // Officials
    officials,

    // Recent residents
    recentResidents
  ] = await Promise.all([
    // Resident queries
    prisma.resident.count(),
    prisma.resident.count({ where: { gender: "MALE" } }),
    prisma.resident.count({ where: { gender: "FEMALE" } }),
    prisma.resident.count({
      where: {
        birthDate: {
          lte: new Date(new Date().setFullYear(new Date().getFullYear() - 60))
        }
      }
    }),
    prisma.resident.count({ where: { voterInBarangay: true } }),

    // Household queries
    prisma.household.count(),
    prisma.household.groupBy({
      by: ['type'],
      _count: { type: true }
    }),

    // Certificate queries
    prisma.certificate.count(),
    prisma.certificate.count({ where: { status: "RELEASED" } }),
    prisma.certificate.count({ where: { status: "PENDING" } }),
    prisma.certificate.groupBy({
      by: ['type'],
      _count: { type: true }
    }),
    prisma.certificate.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { Resident: true }
    }),

    // Officials query - improved to fetch all needed fields
    prisma.councilMember.findMany({
      take: 5,
      orderBy: { order: 'asc' },
      select: {
        id: true,
        name: true,
        position: true,
        imageUrl: true
      }
    }),

    // Recent residents
    prisma.resident.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        birthDate: true,
        gender: true,
        userPhoto: true,
        createdAt: true
      }
    })
  ]);

  // Return data in the expected format without unnecessary transformations
  return {
    residents: {
      total: totalResidents,
      male: maleResidents,
      female: femaleResidents,
      senior: seniorResidents,
      voters: voterResidents,
      recent: recentResidents
    },
    households: {
      total: totalHouseholds,
      byType: householdsByType
    },
    certificates: {
      total: totalCertificates,
      released: releasedCertificates,
      pending: pendingCertificates,
      byType: certificatesByType,
      recent: recentCertificates
    },
    officials: officials
  };
}

// Define interface for council member
interface CouncilMember {
  id: string;
  name: string;
  position: string;
  imageUrl: string | null;
}

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  const data = await getDashboardData();

  const today = new Date();
  const formattedDate = format(today, "MMMM d yyyy");
  const dayOfWeek = format(today, "EEEE");

  const nextDays = [
    format(new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000), "d"),
    format(new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000), "d"),
    format(new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000), "d")
  ];

  const mockEvents = [
    { title: "Barangay Meeting", time: new Date().setHours(8, 0, 0, 0) },
    { title: "Outreach Program", time: new Date().setHours(13, 0, 0, 0) }
  ];

  // Calculate certificate issuance rate
  const issuanceRate = data.certificates.total > 0
    ? Math.round((data.certificates.released / data.certificates.total) * 100)
    : 0;

  // Fix getOfficialsList function
  const getOfficialsList = (officials: CouncilMember[]): CouncilMember[] => {
    if (!officials || officials.length === 0) return [];
    return officials;
  };

  const officialsList = getOfficialsList(data.officials);

  return (
    <PageTransition>
      <div className="w-full space-y-6 sm:space-y-8">
        {/* Welcome Section */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-[#F39C12]/30">
          <h1 className="text-xl sm:text-2xl font-bold text-[#006B5E]">
            Welcome back, {session?.user?.name || 'User'}!
          </h1>
          <p className="mt-2 text-gray-600">
            Today is {dayOfWeek}, {formattedDate}. Here's your barangay summary.
          </p>
        </div>

        {/* Action Cards - Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link href="/dashboard/residents/add" className="bg-white rounded-xl border border-[#F39C12]/30 p-4 hover:border-[#006B5E] transition-colors">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#006B5E] text-white rounded-full flex items-center justify-center mb-2">
                <User size={24} className="sm:w-8 sm:h-8" />
              </div>
              <div className="font-medium text-[#006B5E]">Add New Resident</div>
              <div className="text-xs text-gray-500 mt-1">Register a new barangay resident</div>
            </div>
          </Link>

          <Link href="/dashboard/households/new" className="bg-white rounded-xl border border-[#F39C12]/30 p-4 hover:border-[#006B5E] transition-colors">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#006B5E] text-white rounded-full flex items-center justify-center mb-2">
                <Home size={24} className="sm:w-8 sm:h-8" />
              </div>
              <div className="font-medium text-[#006B5E]">Add Household</div>
              <div className="text-xs text-gray-500 mt-1">Register a new household</div>
            </div>
          </Link>

          <Link href="/dashboard/certificates/issue" className="bg-white rounded-xl border border-[#F39C12]/30 p-4 hover:border-[#006B5E] transition-colors">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#006B5E] text-white rounded-full flex items-center justify-center mb-2">
                <FileText size={24} className="sm:w-8 sm:h-8" />
              </div>
              <div className="font-medium text-[#006B5E]">Issue Certificate</div>
              <div className="text-xs text-gray-500 mt-1">Create a new certificate</div>
            </div>
          </Link>

          <Link href="/dashboard/certificates" className="bg-white rounded-xl border border-[#F39C12]/30 p-4 hover:border-[#006B5E] transition-colors">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#006B5E] text-white rounded-full flex items-center justify-center mb-2">
                <Clipboard size={24} className="sm:w-8 sm:h-8" />
              </div>
              <div className="font-medium text-[#006B5E]">Manage Certificates</div>
              <div className="text-xs text-gray-500 mt-1">View and update certificates</div>
            </div>
          </Link>
        </div>

        {/* Key Statistics Cards - Simple, clean overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Total Residents Stat */}
          <div className="bg-white rounded-xl border border-[#F39C12]/30 p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[#006B5E] font-medium">RESIDENTS</h3>
              <Users className="text-[#F39C12] h-5 w-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[#006B5E]">
              {data.residents.total.toLocaleString()}
            </div>
            <div className="mt-3 flex justify-between items-center">
              <div className="flex gap-3">
                <div className="text-center">
                  <div className="text-sm font-semibold text-[#006B5E]">{data.residents.male.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">Male</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-semibold text-[#006B5E]">{data.residents.female.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">Female</div>
                </div>
              </div>
              <Link href="/dashboard/residents" className="text-xs text-[#006B5E] hover:text-[#F39C12] flex items-center">
                View
                <ChevronRight size={14} className="ml-0.5" />
              </Link>
            </div>
          </div>

          {/* Households Stat */}
          <div className="bg-white rounded-xl border border-[#F39C12]/30 p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[#006B5E] font-medium">HOUSEHOLDS</h3>
              <Home className="text-[#F39C12] h-5 w-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[#006B5E]">
              {data.households.total.toLocaleString()}
            </div>
            <div className="mt-3 flex justify-between items-center">
              <div className="text-xs text-gray-500">
                {data.households.byType.length} household types registered
              </div>
              <Link href="/dashboard/households" className="text-xs text-[#006B5E] hover:text-[#F39C12] flex items-center">
                View
                <ChevronRight size={14} className="ml-0.5" />
              </Link>
            </div>
          </div>

          {/* Certificates Stat */}
          <div className="bg-white rounded-xl border border-[#F39C12]/30 p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[#006B5E] font-medium">CERTIFICATES</h3>
              <FileText className="text-[#F39C12] h-5 w-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[#006B5E]">
              {data.certificates.total.toLocaleString()}
            </div>
            <div className="mt-3 flex justify-between items-center">
              <div className="flex gap-3">
                <div className="text-center">
                  <div className="text-sm font-semibold text-green-600">{data.certificates.released.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">Released</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-semibold text-amber-500">{data.certificates.pending.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">Pending</div>
                </div>
              </div>
              <Link href="/dashboard/certificates" className="text-xs text-[#006B5E] hover:text-[#F39C12] flex items-center">
                View
                <ChevronRight size={14} className="ml-0.5" />
              </Link>
            </div>
          </div>

          {/* Voter Stat */}
          <div className="bg-white rounded-xl border border-[#F39C12]/30 p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[#006B5E] font-medium">REGISTERED VOTERS</h3>
              <Vote className="text-[#F39C12] h-5 w-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[#006B5E]">
              {data.residents.voters.toLocaleString()}
            </div>
            <div className="mt-3 flex justify-between items-center">
              <div className="text-xs text-gray-500">
                {Math.round((data.residents.voters / data.residents.total) * 100)}% of total residents
              </div>
              <Link href="/dashboard/residents?voter=true" className="text-xs text-[#006B5E] hover:text-[#F39C12] flex items-center">
                View
                <ChevronRight size={14} className="ml-0.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Content Area - Main dashboard content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity - Takes 2/3 of space on large screens */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-[#F39C12]/30 overflow-hidden">
            <div className="p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-[#006B5E] flex items-center gap-2 mb-4">
                <TrendingUp size={20} className="text-[#F39C12]" />
                RECENT ACTIVITY
              </h3>

              <div className="divide-y">
                {data.residents.recent.length > 0 ? (
                  <div className="py-3">
                    <h4 className="text-[#006B5E] font-medium text-sm mb-3">Recently Added Residents</h4>
                    <div className="space-y-3">
                      {data.residents.recent.slice(0, 3).map((resident, index) => (
                        <div key={index} className="flex items-center bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="w-10 h-10 rounded-full bg-[#E8F5F3] text-[#006B5E] flex items-center justify-center mr-3 overflow-hidden">
                            {resident.userPhoto ? (
                              <img
                                src={resident.userPhoto}
                                alt={`${resident.firstName} ${resident.lastName}`}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <User size={18} />
                            )}
                          </div>
                          <div className="flex-1">
                            <Link href={`/dashboard/residents/${resident.id}`} className="font-medium hover:text-[#F39C12]">
                              {resident.firstName} {resident.lastName}
                            </Link>
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <span>Added {format(new Date(resident.createdAt), "MMM d, yyyy")}</span>
                              <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                              <span>{resident.gender}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {data.certificates.recent.length > 0 ? (
                  <div className="py-3">
                    <h4 className="text-[#006B5E] font-medium text-sm mb-3 mt-2">Recent Certificates</h4>
                    <div className="space-y-3">
                      {data.certificates.recent.slice(0, 3).map((cert, index) => (
                        <div key={index} className="flex items-center bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${cert.status === "RELEASED"
                            ? "bg-green-100 text-green-600"
                            : "bg-amber-100 text-amber-600"
                            }`}>
                            {cert.status === "RELEASED" ? (
                              <CheckCircle size={18} />
                            ) : (
                              <Clock size={18} />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{cert.type}</div>
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <span>For {cert.Resident?.firstName} {cert.Resident?.lastName}</span>
                              <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                              <span>{cert.status}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="mt-4 flex justify-between pt-3">
                <Link href="/dashboard/residents" className="text-sm text-[#006B5E] hover:text-[#F39C12] inline-flex items-center">
                  View all residents
                  <ChevronRight size={16} className="ml-1" />
                </Link>
                <Link href="/dashboard/certificates" className="text-sm text-[#006B5E] hover:text-[#F39C12] inline-flex items-center">
                  View all certificates
                  <ChevronRight size={16} className="ml-1" />
                </Link>
              </div>
            </div>
          </div>

          {/* Certificate Types - Takes 1/3 of space on large screens */}
          <div className="bg-white rounded-xl border border-[#F39C12]/30 overflow-hidden">
            <div className="p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-[#006B5E] flex items-center gap-2 mb-4">
                <Clipboard size={20} className="text-[#F39C12]" />
                DOCUMENTS ISSUED
              </h3>

              <div className="space-y-4">
                {(() => {
                  const maxCount = Math.max(...data.certificates.byType.map(c => c._count.type), 1);

                  return data.certificates.byType.slice(0, 5).map((cert, index) => {
                    const percentage = Math.round((cert._count.type / data.certificates.total) * 100) || 0;
                    const width = Math.max(8, Math.round((cert._count.type / maxCount) * 100));

                    return (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <div className="text-[#006B5E] truncate flex-1">{cert.type}</div>
                          <div className="text-gray-500">{cert._count.type} ({percentage}%)</div>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5">
                          <div className="bg-[#00BFA5] h-2.5 rounded-full" style={{ width: `${width}%` }}></div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>

              {data.certificates.byType.length === 0 && (
                <div className="py-8 text-center text-gray-500">
                  No certificate data available
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Officials Carousel - Full Width at Bottom */}
        <div className="bg-white rounded-xl border border-[#F39C12]/30 overflow-hidden w-full">
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg sm:text-xl font-semibold text-[#006B5E] flex items-center gap-2">
                <Award size={24} className="text-[#F39C12]" />
                BARANGAY OFFICIALS
              </h3>
              
              <Link href="/dashboard/certificates/settings/council-members" className="text-sm text-[#006B5E] hover:text-[#F39C12] inline-flex items-center">
                View all officials
                <ChevronRight size={16} className="ml-1" />
              </Link>
            </div>

            {officialsList.length > 0 ? (
              <div className="overflow-hidden">
                <div className="overflow-x-auto py-4 no-scrollbar">
                  <div className="flex space-x-10 animate-marquee px-4">
                    {[...officialsList, ...officialsList].map((official: CouncilMember, index: number) => (
                      <div key={index} className="flex flex-col items-center text-center w-32 flex-shrink-0 group">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#006B5E] text-white flex items-center justify-center text-2xl mb-3 shadow-md overflow-hidden border-2 border-[#F39C12] transition-all duration-300 group-hover:border-4 group-hover:scale-105">
                          {official.imageUrl ? (
                            <img 
                              src={official.imageUrl} 
                              alt={official.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span>{official.name.charAt(0)}</span>
                          )}
                        </div>
                        <div className="font-semibold text-sm sm:text-base text-[#006B5E] truncate w-full group-hover:text-[#F39C12]">
                          {official.name}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500 truncate w-full">
                          {official.position}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500">
                No officials data available
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
