import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
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
  ChevronRight
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
  const getOfficialsList = (officials: CouncilMember[]): { title: string; name: string }[] => {
    if (!officials || officials.length === 0) return [];
    return officials.map((official: CouncilMember) => ({
      title: official.position,
      name: official.name
    }));
  };

  const officialsList = getOfficialsList(data.officials);

  return (
    <PageTransition>
      <div className="w-full space-y-4 sm:space-y-6">
        {/* Welcome Section */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-[#F39C12]/30">
          <h1 className="text-xl sm:text-2xl font-bold text-[#006B5E]">
            Welcome back, {session?.user?.name || 'User'}!
          </h1>
          <p className="mt-2 text-gray-600">
            Today is {dayOfWeek}, {formattedDate}. Here's your barangay summary.
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
              {data.certificates.released.toLocaleString()}
              <span className="text-sm text-[#F39C12] ml-1">issued</span>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Recent Activity Card (replaced Communication Card) */}
          <div className="bg-white rounded-xl border border-[#F39C12]/30 overflow-hidden">
            <div className="p-4">
              <h3 className="text-[#006B5E] font-medium flex items-center gap-2">
                <TrendingUp size={18} />
                RECENT ACTIVITY
              </h3>

              <div className="mt-4 divide-y">
                {data.residents.recent.length > 0 ? (
                  <div className="py-2">
                    <h4 className="text-[#006B5E] font-medium text-sm">Recently Added Residents</h4>
                    {data.residents.recent.slice(0, 3).map((resident, index) => (
                      <div key={index} className="flex items-center mt-2 text-sm">
                        <div className="w-8 h-8 rounded-full bg-[#E8F5F3] text-[#006B5E] flex items-center justify-center mr-2">
                          {resident.userPhoto ? (
                            <img
                              src={resident.userPhoto}
                              alt={`${resident.firstName} ${resident.lastName}`}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <User size={16} />
                          )}
                        </div>
                        <div className="flex-1">
                          <Link href={`/dashboard/residents/${resident.id}`} className="font-medium hover:text-[#F39C12]">
                            {resident.firstName} {resident.lastName}
                          </Link>
                          <div className="text-xs text-gray-500">
                            Added {format(new Date(resident.createdAt), "MMM d, yyyy")}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}

                {data.certificates.recent.length > 0 ? (
                  <div className="py-2">
                    <h4 className="text-[#006B5E] font-medium text-sm mt-2">Recent Certificates</h4>
                    {data.certificates.recent.slice(0, 3).map((cert, index) => (
                      <div key={index} className="flex items-center mt-2 text-sm">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${cert.status === "RELEASED"
                          ? "bg-green-100 text-green-600"
                          : "bg-amber-100 text-amber-600"
                          }`}>
                          {cert.status === "RELEASED" ? (
                            <CheckCircle size={16} />
                          ) : (
                            <Clock size={16} />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{cert.type}</div>
                          <div className="text-xs text-gray-500">
                            For {cert.Resident?.firstName} {cert.Resident?.lastName}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="mt-4">
                <Link href="/dashboard/residents" className="text-sm text-[#006B5E] hover:text-[#F39C12] inline-flex items-center">
                  View all residents
                  <ChevronRight size={16} className="ml-1" />
                </Link>
              </div>
            </div>
          </div>

          {/* Document Issuance Card */}
          <div className="bg-white rounded-xl border border-[#F39C12]/30 overflow-hidden">
            <div className="p-4">
              <h3 className="text-[#006B5E] font-medium flex items-center gap-2">
                <FileText size={18} />
                DOCUMENT ISSUANCE
              </h3>

              <div className="mt-4 text-center">
                <div className="relative h-24 w-24 sm:h-32 sm:w-32 mx-auto">
                  <svg viewBox="0 0 36 36" className="h-full w-full">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#E8F5F3"
                      strokeWidth="3"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#00BFA5"
                      strokeWidth="3"
                      strokeDasharray={`${issuanceRate}, 100`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <div className="text-2xl sm:text-3xl font-bold text-[#006B5E]">{issuanceRate}%</div>
                    <div className="text-xs text-gray-500">Issued</div>
                  </div>
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

              <div className="mt-4 text-center">
                <Link href="/dashboard/certificates" className="text-sm text-[#006B5E] hover:text-[#F39C12] inline-flex items-center justify-center">
                  Manage certificates
                  <ChevronRight size={16} className="ml-1" />
                </Link>
              </div>
            </div>
          </div>

          {/* Certificate Types Card - Memoize calculations outside JSX */}
          <div className="bg-white rounded-xl border border-[#F39C12]/30 overflow-hidden">
            <div className="p-4">
              <h3 className="text-[#006B5E] font-medium flex items-center gap-2">
                <Clipboard size={18} />
                CERTIFICATE TYPES
              </h3>

              <div className="mt-4 space-y-3 sm:space-y-4">
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
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div className="bg-[#00BFA5] h-2 rounded-full" style={{ width: `${width}%` }}></div>
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

          {/* Officials Card */}
          <div className="bg-white rounded-xl border border-[#F39C12]/30 overflow-hidden">
            <div className="p-4">
              <h3 className="text-[#006B5E] font-medium flex items-center gap-2">
                <Award size={18} />
                BARANGAY OFFICIALS
              </h3>

              {officialsList.length > 0 ? (
                <div className="mt-4 divide-y">
                  {officialsList.slice(0, 5).map((official: { title: string; name: string }, index: number) => (
                    <div key={index} className="flex items-center py-2">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#006B5E] text-white flex items-center justify-center text-sm sm:text-base">
                        {official.name.charAt(0)}
                      </div>
                      <div className="ml-3">
                        <div className="font-medium text-sm sm:text-base text-[#006B5E]">{official.name}</div>
                        <div className="text-xs sm:text-sm text-gray-500">{official.title}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-gray-500">
                  No officials data available
                </div>
              )}

              <div className="mt-4">
                <Link href="/dashboard/certificates/settings/council-members" className="text-sm text-[#006B5E] hover:text-[#F39C12] inline-flex items-center">
                  View all officials
                  <ChevronRight size={16} className="ml-1" />
                </Link>
              </div>
            </div>
          </div>

          {/* Resident Profile Card */}
          <div className="bg-white rounded-xl border border-[#F39C12]/30 overflow-hidden">
            <div className="p-4">
              <h3 className="text-[#006B5E] font-medium flex items-center gap-2">
                <Users size={18} />
                RESIDENT PROFILE
              </h3>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="bg-[#E8F5F3] rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-[#006B5E]">{data.residents.total.toLocaleString()}</div>
                  <div className="text-xs text-[#006B5E]">TOTAL RESIDENTS</div>
                </div>

                <div className="bg-[#E8F5F3] rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-[#006B5E]">{data.residents.voters.toLocaleString()}</div>
                  <div className="text-xs text-[#006B5E]">REGISTERED VOTERS</div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="p-2 text-center">
                  <div className="text-xl font-bold text-[#006B5E]">{data.residents.male.toLocaleString()}</div>
                  <div className="text-xs text-[#006B5E]">MALE</div>
                </div>

                <div className="p-2 text-center">
                  <div className="text-xl font-bold text-[#F39C12]">{data.residents.female.toLocaleString()}</div>
                  <div className="text-xs text-[#F39C12]">FEMALE</div>
                </div>

                <div className="p-2 text-center">
                  <div className="text-xl font-bold text-teal-600">{data.residents.senior.toLocaleString()}</div>
                  <div className="text-xs text-teal-600">SENIOR</div>
                </div>
              </div>

              <div className="mt-4 text-center">
                <Link href="/dashboard/residents" className="text-sm text-[#006B5E] hover:text-[#F39C12] inline-flex items-center justify-center">
                  View all residents
                  <ChevronRight size={16} className="ml-1" />
                </Link>
              </div>
            </div>
          </div>

          {/* Household Types Card - Memoize calculations outside JSX */}
          <div className="bg-white rounded-xl border border-[#F39C12]/30 overflow-hidden">
            <div className="p-4">
              <h3 className="text-[#006B5E] font-medium flex items-center gap-2">
                <Home size={18} />
                HOUSEHOLD TYPES
              </h3>

              <div className="mt-4 space-y-3 sm:space-y-4">
                {(() => {
                  if (data.households.byType.length === 0) {
                    return (
                      <div className="py-4 text-center text-gray-500">
                        No household type data available
                      </div>
                    );
                  }

                  const maxCount = Math.max(...data.households.byType.map(h => h._count.type), 1);

                  return data.households.byType.slice(0, 5).map((household, index) => {
                    const percentage = Math.round((household._count.type / data.households.total) * 100) || 0;
                    const width = Math.max(8, Math.round((household._count.type / maxCount) * 100));

                    return (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <div className="text-[#006B5E] truncate flex-1">
                            {household.type || "Unspecified"}
                          </div>
                          <div className="text-gray-500">
                            {household._count.type} ({percentage}%)
                          </div>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div className="bg-[#00BFA5] h-2 rounded-full" style={{ width: `${width}%` }}></div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-lg font-bold text-[#006B5E]">
                  {data.households.total.toLocaleString()}
                  <span className="text-sm font-normal ml-2">Total Households</span>
                </div>

                <Link href="/dashboard/households" className="text-sm text-[#006B5E] hover:text-[#F39C12] inline-flex items-center">
                  View all
                  <ChevronRight size={16} className="ml-1" />
                </Link>
              </div>
            </div>
          </div>

          {/* Action Cards - replace Disaster Risk Management card with something more useful */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-3">
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
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
