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
  ShieldAlert,
  Plus,
  BarChart3,
  Activity
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
  const formattedDate = format(today, "MMMM d, yyyy");
  const dayOfWeek = format(today, "EEEE");

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
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Section */}
        <div className="py-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Welcome back, {session?.user?.name || 'User'}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {dayOfWeek}, {formattedDate} • Barangay Management Dashboard
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <div className="text-sm text-gray-500">
                System Status: <span className="text-green-600 font-medium">Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <Link
            href="/dashboard/residents/add"
            className="group bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-md transition-all duration-200"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                <Plus className="h-8 w-8" />
              </div>
              <div className="font-semibold text-gray-900 text-base">Add Resident</div>
              <div className="text-sm text-gray-500 mt-2">Register new resident</div>
            </div>
          </Link>

          <Link
            href="/dashboard/households/new"
            className="group bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-md transition-all duration-200"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-100 transition-colors">
                <Home className="h-8 w-8" />
              </div>
              <div className="font-semibold text-gray-900 text-base">Add Household</div>
              <div className="text-sm text-gray-500 mt-2">Register household</div>
            </div>
          </Link>

          <Link
            href="/dashboard/certificates/new"
            className="group bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-md transition-all duration-200"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-100 transition-colors">
                <FileText className="h-8 w-8" />
              </div>
              <div className="font-semibold text-gray-900 text-base">Issue Certificate</div>
              <div className="text-sm text-gray-500 mt-2">Create certificate</div>
            </div>
          </Link>

          <Link
            href="/dashboard/certificates"
            className="group bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-md transition-all duration-200"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-orange-100 transition-colors">
                <Clipboard className="h-8 w-8" />
              </div>
              <div className="font-semibold text-gray-900 text-base">Manage Docs</div>
              <div className="text-sm text-gray-500 mt-2">View certificates</div>
            </div>
          </Link>
        </div>

        {/* Key Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Residents */}
          <div className="bg-white border border-gray-200 rounded-xl p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <div className="ml-5">
                  <p className="text-base font-medium text-gray-500">Total Residents</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {data.residents.total.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between">
              <div className="flex space-x-6">
                <div className="text-center">
                  <div className="text-base font-semibold text-gray-900">{data.residents.male.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">Male</div>
                </div>
                <div className="text-center">
                  <div className="text-base font-semibold text-gray-900">{data.residents.female.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">Female</div>
                </div>
              </div>
              <Link
                href="/dashboard/residents"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
              >
                View all
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>

          {/* Households */}
          <div className="bg-white border border-gray-200 rounded-xl p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                    <Home className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <div className="ml-5">
                  <p className="text-base font-medium text-gray-500">Households</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {data.households.total.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                {data.households.byType.length} types registered
              </div>
              <Link
                href="/dashboard/households"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
              >
                View all
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>

          {/* Certificates */}
          <div className="bg-white border border-gray-200 rounded-xl p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
                    <FileText className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
                <div className="ml-5">
                  <p className="text-base font-medium text-gray-500">Certificates</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {data.certificates.total.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between">
              <div className="flex space-x-6">
                <div className="text-center">
                  <div className="text-base font-semibold text-green-600">{data.certificates.released.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">Released</div>
                </div>
                <div className="text-center">
                  <div className="text-base font-semibold text-amber-600">{data.certificates.pending.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">Pending</div>
                </div>
              </div>
              <Link
                href="/dashboard/certificates"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
              >
                View all
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>

          {/* Registered Voters */}
          <div className="bg-white border border-gray-200 rounded-xl p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <Vote className="h-8 w-8 text-indigo-600" />
                  </div>
                </div>
                <div className="ml-5">
                  <p className="text-base font-medium text-gray-500">Registered Voters</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {data.residents.voters.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                {Math.round((data.residents.voters / data.residents.total) * 100)}% of residents
              </div>
              <Link
                href="/dashboard/residents?voter=true"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
              >
                View all
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl">
            <div className="px-8 py-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                <Activity className="h-6 w-6 text-gray-600 mr-3" />
                Recent Activity
              </h3>
            </div>
            <div className="p-8">
              <div className="space-y-6">
                {data.residents.recent.length > 0 && (
                  <div>
                    <h4 className="text-base font-semibold text-gray-900 mb-4">New Residents</h4>
                    <div className="space-y-4">
                      {data.residents.recent.slice(0, 3).map((resident, index) => (
                        <div key={index} className="flex items-center p-4 bg-gray-50 rounded-xl">
                          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-4 overflow-hidden">
                            {resident.userPhoto ? (
                              <img
                                src={resident.userPhoto}
                                alt={`${resident.firstName} ${resident.lastName}`}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <User className="h-6 w-6" />
                            )}
                          </div>
                          <div className="flex-1">
                            <Link
                              href={`/dashboard/residents/${resident.id}`}
                              className="font-semibold text-gray-900 hover:text-blue-600 text-base"
                            >
                              {resident.firstName} {resident.lastName}
                            </Link>
                            <div className="text-sm text-gray-500 flex items-center space-x-1 mt-1">
                              <span>Added {format(new Date(resident.createdAt), "MMM d, yyyy")}</span>
                              <span>•</span>
                              <span>{resident.gender}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {data.certificates.recent.length > 0 && (
                  <div>
                    <h4 className="text-base font-semibold text-gray-900 mb-4">Recent Certificates</h4>
                    <div className="space-y-4">
                      {data.certificates.recent.slice(0, 3).map((cert, index) => (
                        <div key={index} className="flex items-center p-4 bg-gray-50 rounded-xl">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${cert.status === "RELEASED"
                            ? "bg-green-100 text-green-600"
                            : "bg-amber-100 text-amber-600"
                            }`}>
                            {cert.status === "RELEASED" ? (
                              <CheckCircle className="h-6 w-6" />
                            ) : (
                              <Clock className="h-6 w-6" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900 text-base">{cert.type}</div>
                            <div className="text-sm text-gray-500 flex items-center space-x-1 mt-1">
                              <span>For {cert.Resident?.firstName} {cert.Resident?.lastName}</span>
                              <span>•</span>
                              <span>{cert.status}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between">
                <Link
                  href="/dashboard/residents"
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium inline-flex items-center"
                >
                  View all residents
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
                <Link
                  href="/dashboard/certificates"
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium inline-flex items-center"
                >
                  View all certificates
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>
          </div>

          {/* Certificate Analytics */}
          <div className="bg-white border border-gray-200 rounded-xl">
            <div className="px-8 py-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                <BarChart3 className="h-6 w-6 text-gray-600 mr-3" />
                Document Types
              </h3>
            </div>
            <div className="p-8">
              <div className="space-y-6">
                {(() => {
                  const maxCount = Math.max(...data.certificates.byType.map(c => c._count.type), 1);

                  return data.certificates.byType.slice(0, 5).map((cert, index) => {
                    const percentage = Math.round((cert._count.type / data.certificates.total) * 100) || 0;
                    const width = Math.max(8, Math.round((cert._count.type / maxCount) * 100));

                    return (
                      <div key={index} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="text-gray-900 font-semibold truncate flex-1 text-base">{cert.type}</div>
                          <div className="text-gray-500 text-sm font-medium">{cert._count.type}</div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${width}%` }}
                          ></div>
                        </div>
                        <div className="text-sm text-gray-500">{percentage}% of total</div>
                      </div>
                    );
                  });
                })()}
              </div>

              {data.certificates.byType.length === 0 && (
                <div className="py-12 text-center text-gray-500">
                  <FileText className="h-16 w-16 mx-auto text-gray-300 mb-3" />
                  <p className="text-base">No certificate data available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Barangay Officials */}
        <div className="bg-white border border-gray-200 rounded-xl">
          <div className="px-8 py-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                <Award className="h-6 w-6 text-gray-600 mr-3" />
                Barangay Officials
              </h3>
              <Link
                href="/dashboard/certificates/settings/council-members"
                className="text-base text-blue-600 hover:text-blue-800 font-medium inline-flex items-center"
              >
                Manage officials
                <ChevronRight className="h-5 w-5 ml-1" />
              </Link>
            </div>
          </div>
          <div className="p-8">
            {officialsList.length > 0 ? (
              <div className="relative overflow-hidden">
                <div className="flex animate-marquee hover:pause-marquee">
                  {/* First set of officials */}
                  {officialsList.map((official: CouncilMember, index: number) => (
                    <div key={index} className="flex-shrink-0 text-center group mx-6">
                      <div className="w-20 h-20 mx-auto rounded-full bg-gray-100 flex items-center justify-center text-xl mb-4 overflow-hidden border-2 border-gray-200 group-hover:border-blue-300 transition-colors">
                        {official.imageUrl ? (
                          <img
                            src={official.imageUrl}
                            alt={official.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-gray-600 font-semibold">{official.name.charAt(0)}</span>
                        )}
                      </div>
                      <div className="font-semibold text-base text-gray-900 truncate min-w-[120px]">
                        {official.name}
                      </div>
                      <div className="text-sm text-gray-500 truncate mt-1">
                        {official.position}
                      </div>
                    </div>
                  ))}
                  {/* Duplicate set for seamless loop */}
                  {officialsList.map((official: CouncilMember, index: number) => (
                    <div key={`duplicate-${index}`} className="flex-shrink-0 text-center group mx-6">
                      <div className="w-20 h-20 mx-auto rounded-full bg-gray-100 flex items-center justify-center text-xl mb-4 overflow-hidden border-2 border-gray-200 group-hover:border-blue-300 transition-colors">
                        {official.imageUrl ? (
                          <img
                            src={official.imageUrl}
                            alt={official.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-gray-600 font-semibold">{official.name.charAt(0)}</span>
                        )}
                      </div>
                      <div className="font-semibold text-base text-gray-900 truncate min-w-[120px]">
                        {official.name}
                      </div>
                      <div className="text-sm text-gray-500 truncate mt-1">
                        {official.position}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-gray-500">
                <Award className="h-16 w-16 mx-auto text-gray-300 mb-3" />
                <p className="text-base">No officials data available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
