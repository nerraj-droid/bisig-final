import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Gender, CivilStatus, Prisma } from "@prisma/client";
import { PageTransition } from "@/components/ui/page-transition";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Filter, Plus, Download, Users, UserCheck, UserX } from "lucide-react";
import { Suspense } from "react";
import { ResidentList } from "@/components/residents/resident-list";
import { prisma } from "@/lib/prisma";

// Define the Resident interface for the list view
interface Resident {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  extensionName: string | null;
  birthDate: string;
  gender: string;
  civilStatus: string;
  contactNo: string | null;
  email: string | null;
  occupation: string | null;
  voterInBarangay: boolean;
  fatherName: string | null;
  fatherMiddleName: string | null;
  fatherLastName: string | null;
  motherFirstName: string | null;
  motherMiddleName: string | null;
  motherMaidenName: string | null;
  Household: {
    houseNo: string;
    street: string;
  } | null;
}

// Supported filter types
export type FilterCriteria = {
  gender?: Gender;
  ageGroup?: 'child' | 'young-adult' | 'adult' | 'senior';
  civilStatus?: CivilStatus;
  voterInBarangay?: boolean;
  employmentStatus?: string;
  educationalAttainment?: string;
  sectors?: string[];
  religion?: string;
  bloodType?: string;
  minAge?: number;
  maxAge?: number;
  ageYears?: string | number;
  ageMonths?: string | number;
  ageDays?: string | number;
}

async function getResidentsData(page: number = 1, limit: number = 10, filters: FilterCriteria = {}) {
  // Build WHERE condition dynamically based on filters
  const whereConditions: Prisma.ResidentWhereInput = {};

  // Process gender filter
  if (filters.gender) {
    whereConditions.gender = filters.gender;
  }

  // Process voter filter
  if (filters.voterInBarangay !== undefined) {
    whereConditions.voterInBarangay = filters.voterInBarangay;
  }

  // Process civil status filter
  if (filters.civilStatus) {
    whereConditions.civilStatus = filters.civilStatus;
  }

  // Process advanced filters
  if (filters.employmentStatus) {
    whereConditions.employmentStatus = filters.employmentStatus;
  }

  if (filters.educationalAttainment) {
    whereConditions.educationalAttainment = filters.educationalAttainment;
  }

  if (filters.sectors && filters.sectors.length > 0) {
    whereConditions.sectors = {
      hasSome: filters.sectors
    };
  }

  if (filters.religion) {
    whereConditions.religion = {
      contains: filters.religion,
      mode: 'insensitive'
    };
  }

  if (filters.bloodType) {
    whereConditions.bloodType = filters.bloodType;
  }

  // Process age filters (direct min/max age)
  if (filters.minAge !== undefined || filters.maxAge !== undefined) {
    const today = new Date();

    if (filters.minAge !== undefined && filters.maxAge !== undefined) {
      // Both min and max age provided
      // Someone between minAge and maxAge years old
      // Their birthdate must be between (today - maxAge years) and (today - minAge years)
      whereConditions.birthDate = {
        lte: new Date(today.getFullYear() - filters.minAge, today.getMonth(), today.getDate()),
        gte: new Date(today.getFullYear() - filters.maxAge, today.getMonth(), today.getDate())
      };
    } else if (filters.minAge !== undefined) {
      // Only min age provided - older than minAge
      // Their birthdate must be earlier than (today - minAge years)
      whereConditions.birthDate = {
        lte: new Date(today.getFullYear() - filters.minAge, today.getMonth(), today.getDate())
      };
    } else if (filters.maxAge !== undefined) {
      // Only max age provided - younger than maxAge
      // Their birthdate must be later than (today - maxAge years)
      whereConditions.birthDate = {
        gte: new Date(today.getFullYear() - filters.maxAge, today.getMonth(), today.getDate())
      };
    }

    // Log the birthDate conditions for debugging
    console.log('Age filter conditions:', {
      minAge: filters.minAge,
      maxAge: filters.maxAge,
      birthDateConditions: whereConditions.birthDate
    });
  }
  // Process age group filter (predefined groups)
  else if (filters.ageGroup) {
    const today = new Date();

    switch (filters.ageGroup) {
      case 'child':
        // Children: 0-12 years
        whereConditions.birthDate = {
          gte: new Date(today.getFullYear() - 12, today.getMonth(), today.getDate())
        };
        break;
      case 'young-adult':
        // Young Adults: 13-30 years
        whereConditions.birthDate = {
          lt: new Date(today.getFullYear() - 12, today.getMonth(), today.getDate()),
          gte: new Date(today.getFullYear() - 30, today.getMonth(), today.getDate())
        };
        break;
      case 'adult':
        // Adults: 31-60 years
        whereConditions.birthDate = {
          lt: new Date(today.getFullYear() - 30, today.getMonth(), today.getDate()),
          gte: new Date(today.getFullYear() - 60, today.getMonth(), today.getDate())
        };
        break;
      case 'senior':
        // Seniors: 60+ years
        whereConditions.birthDate = {
          lt: new Date(today.getFullYear() - 60, today.getMonth(), today.getDate())
        };
        break;
    }
  }

  // Run all queries in parallel for better performance
  const [
    totalResidents,
    maleResidents,
    femaleResidents,
    childrenCount,
    youngAdultsCount,
    adultsCount,
    seniorsCount,
    residentsList
  ] = await Promise.all([
    // Use the same where conditions for the filtered query
    prisma.resident.count({
      where: whereConditions
    }),

    // These are standard counts with gender filters applied
    prisma.resident.count({
      where: {
        gender: "MALE",
        ...(filters.ageGroup && whereConditions.birthDate ? { birthDate: whereConditions.birthDate } : {}),
        ...(filters.civilStatus ? { civilStatus: whereConditions.civilStatus } : {}),
        ...(filters.voterInBarangay !== undefined ? { voterInBarangay: whereConditions.voterInBarangay } : {})
      }
    }),
    prisma.resident.count({
      where: {
        gender: "FEMALE",
        ...(filters.ageGroup && whereConditions.birthDate ? { birthDate: whereConditions.birthDate } : {}),
        ...(filters.civilStatus ? { civilStatus: whereConditions.civilStatus } : {}),
        ...(filters.voterInBarangay !== undefined ? { voterInBarangay: whereConditions.voterInBarangay } : {})
      }
    }),

    // Age group counts with gender/other filters applied
    prisma.resident.count({
      where: {
        ...(filters.gender ? { gender: whereConditions.gender } : {}),
        ...(filters.civilStatus ? { civilStatus: whereConditions.civilStatus } : {}),
        ...(filters.voterInBarangay !== undefined ? { voterInBarangay: whereConditions.voterInBarangay } : {}),
        ...(filters.ageGroup && filters.ageGroup === 'child' ? {} : {
          birthDate: {
            gte: new Date(new Date().setFullYear(new Date().getFullYear() - 12))
          }
        })
      }
    }),
    prisma.resident.count({
      where: {
        ...(filters.gender ? { gender: whereConditions.gender } : {}),
        ...(filters.civilStatus ? { civilStatus: whereConditions.civilStatus } : {}),
        ...(filters.voterInBarangay !== undefined ? { voterInBarangay: whereConditions.voterInBarangay } : {}),
        ...(filters.ageGroup && filters.ageGroup === 'young-adult' ? {} : {
          birthDate: {
            lt: new Date(new Date().setFullYear(new Date().getFullYear() - 12)),
            gte: new Date(new Date().setFullYear(new Date().getFullYear() - 30))
          }
        })
      }
    }),
    prisma.resident.count({
      where: {
        ...(filters.gender ? { gender: whereConditions.gender } : {}),
        ...(filters.civilStatus ? { civilStatus: whereConditions.civilStatus } : {}),
        ...(filters.voterInBarangay !== undefined ? { voterInBarangay: whereConditions.voterInBarangay } : {}),
        ...(filters.ageGroup && filters.ageGroup === 'adult' ? {} : {
          birthDate: {
            lt: new Date(new Date().setFullYear(new Date().getFullYear() - 30)),
            gte: new Date(new Date().setFullYear(new Date().getFullYear() - 60))
          }
        })
      }
    }),
    prisma.resident.count({
      where: {
        ...(filters.gender ? { gender: whereConditions.gender } : {}),
        ...(filters.civilStatus ? { civilStatus: whereConditions.civilStatus } : {}),
        ...(filters.voterInBarangay !== undefined ? { voterInBarangay: whereConditions.voterInBarangay } : {}),
        ...(filters.ageGroup && filters.ageGroup === 'senior' ? {} : {
          birthDate: {
            lt: new Date(new Date().setFullYear(new Date().getFullYear() - 60))
          }
        })
      }
    }),

    // Main data query with pagination
    prisma.resident.findMany({
      where: whereConditions,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        Household: true,
      },
      orderBy: {
        lastName: 'asc',
      },
    }),
  ]);

  // Format resident data to match the Resident interface
  const formattedResidents: Resident[] = residentsList.map(resident => ({
    id: resident.id,
    firstName: resident.firstName,
    middleName: resident.middleName || '',
    lastName: resident.lastName,
    extensionName: resident.extensionName || '',
    birthDate: resident.birthDate ? resident.birthDate.toISOString() : '',
    gender: resident.gender,
    civilStatus: resident.civilStatus || '',
    contactNo: resident.contactNo || '',
    email: resident.email || '',
    occupation: resident.occupation || '',
    voterInBarangay: resident.voterInBarangay,
    fatherName: resident.fatherName || '',
    fatherMiddleName: resident.fatherMiddleName || '',
    fatherLastName: resident.fatherLastName || '',
    motherFirstName: resident.motherFirstName || '',
    motherMiddleName: resident.motherMiddleName || '',
    motherMaidenName: resident.motherMaidenName || '',
    Household: resident.Household ? {
      houseNo: resident.Household.houseNo,
      street: resident.Household.street
    } : null
  }));

  return {
    totalResidents,
    maleResidents,
    femaleResidents,
    childrenCount,
    youngAdultsCount,
    adultsCount,
    seniorsCount,
    residentsList: formattedResidents,
  };
}

export default async function ResidentsPage({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // Parse and validate filter parameters
  const filters: FilterCriteria = {};

  // Safely access search parameters by assigning to a local variable first
  const params = await searchParams;

  // Basic filters (existing code)
  if (params.gender) {
    const gender = params.gender.toString().toUpperCase();
    if (gender === 'MALE' || gender === 'FEMALE') {
      filters.gender = gender as Gender;
    }
  }

  if (params.ageGroup) {
    const ageGroup = params.ageGroup.toString().toLowerCase();
    if (['child', 'young-adult', 'adult', 'senior'].includes(ageGroup)) {
      filters.ageGroup = ageGroup as FilterCriteria['ageGroup'];
    }
  }

  if (params.civilStatus) {
    const civilStatus = params.civilStatus.toString().toUpperCase();
    if (['SINGLE', 'MARRIED', 'WIDOWED', 'DIVORCED', 'SEPARATED'].includes(civilStatus)) {
      filters.civilStatus = civilStatus as CivilStatus;
    }
  }

  if (params.voter) {
    filters.voterInBarangay = params.voter === 'true';
  }

  // Advanced filters
  if (params.employmentStatus) {
    filters.employmentStatus = params.employmentStatus.toString();
  }

  if (params.educationalAttainment) {
    filters.educationalAttainment = params.educationalAttainment.toString();
  }

  if (params.sectors) {
    filters.sectors = Array.isArray(params.sectors)
      ? params.sectors
      : params.sectors.toString().split(',');
  }

  if (params.religion) {
    filters.religion = params.religion.toString();
  }

  if (params.bloodType) {
    filters.bloodType = params.bloodType.toString();
  }

  // Age range filters
  if (params.minAge) {
    const minAge = parseInt(params.minAge.toString());
    if (!isNaN(minAge) && minAge >= 0) {
      filters.minAge = minAge;
      console.log(`Setting minAge filter to ${minAge}`);
    }
  }

  if (params.maxAge) {
    const maxAge = parseInt(params.maxAge.toString());
    if (!isNaN(maxAge) && maxAge >= 0) {
      filters.maxAge = maxAge;
      console.log(`Setting maxAge filter to ${maxAge}`);
    }
  }

  // Precise age filters
  if (params.ageYears) {
    filters.ageYears = params.ageYears.toString();
    console.log(`Setting ageYears filter to ${params.ageYears}`);
  }

  if (params.ageMonths) {
    filters.ageMonths = params.ageMonths.toString();
    console.log(`Setting ageMonths filter to ${params.ageMonths}`);
  }

  if (params.ageDays) {
    filters.ageDays = params.ageDays.toString();
    console.log(`Setting ageDays filter to ${params.ageDays}`);
  }

  // Get page number
  const page = params.page ? parseInt(params.page.toString()) : 1;

  // Fetch filtered data
  const data = await getResidentsData(page, 10, filters);

  // Generate filter description
  const filterDescriptions: string[] = [];
  if (filters.gender) filterDescriptions.push(filters.gender === 'MALE' ? 'Male' : 'Female');
  if (filters.ageGroup) {
    const ageGroupLabels = {
      'child': 'Children (0-12)',
      'young-adult': 'Young Adults (13-30)',
      'adult': 'Adults (31-60)',
      'senior': 'Senior Citizens (60+)'
    };
    filterDescriptions.push(ageGroupLabels[filters.ageGroup]);
  }
  if (filters.civilStatus) filterDescriptions.push(filters.civilStatus.charAt(0) + filters.civilStatus.slice(1).toLowerCase());
  if (filters.voterInBarangay !== undefined) filterDescriptions.push(filters.voterInBarangay ? 'Voters' : 'Non-voters');

  // Add descriptions for advanced filters
  if (filters.employmentStatus) filterDescriptions.push(`Employment: ${filters.employmentStatus.replace('_', ' ')}`);
  if (filters.educationalAttainment) filterDescriptions.push(`Education: ${filters.educationalAttainment.replace('_', ' ')}`);
  if (filters.sectors && filters.sectors.length > 0) filterDescriptions.push(`Sectors: ${filters.sectors.length} selected`);
  if (filters.religion) filterDescriptions.push(`Religion: ${filters.religion}`);
  if (filters.bloodType) filterDescriptions.push(`Blood Type: ${filters.bloodType}`);
  if (filters.minAge !== undefined || filters.maxAge !== undefined) {
    filterDescriptions.push(`Age: ${filters.minAge || '0'} - ${filters.maxAge || '∞'}`);
  }

  // Add precise age to filter description
  if (filters.ageYears || filters.ageMonths || filters.ageDays) {
    const yearsPart = filters.ageYears ? `${filters.ageYears} years` : '';
    const monthsPart = filters.ageMonths ? `${filters.ageMonths} months` : '';
    const daysPart = filters.ageDays ? `${filters.ageDays} days` : '';

    const parts = [yearsPart, monthsPart, daysPart].filter(Boolean);
    filterDescriptions.push(`Exact Age: ${parts.join(', ')}`);
  }

  const filterDescription = filterDescriptions.length > 0
    ? `Filtered: ${filterDescriptions.join(', ')}`
    : '';

  return (
    <PageTransition>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex items-center justify-between py-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Back
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Residents</h1>
              <p className="text-sm text-gray-500 mt-1">
                {data.totalResidents.toLocaleString()} total residents
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link href="/dashboard/residents/filter">
              <Button variant="outline" className="border-gray-300">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </Link>
            <Link href="/dashboard/residents/add">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Resident
              </Button>
            </Link>
          </div>
        </div>

        {/* Filter Status */}
        {filterDescription && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 my-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Filter className="h-4 w-4 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-900">Active Filters:</span>
                <span className="text-sm text-blue-700 ml-2">{filterDescription.replace('Filtered: ', '')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Link href={`/api/residents/export${Object.keys(filters).length ?
                  `?${Object.entries(filters)
                    .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
                    .join('&')}`
                  : ''
                  }`} target="_blank">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                </Link>
                <Link href="/dashboard/residents">
                  <Button variant="ghost" size="sm" className="text-blue-600">
                    Clear All
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 my-8">
          {/* Total Residents */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-gray-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Residents</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {data.totalResidents.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Male Residents */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Male</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {data.maleResidents.toLocaleString()}
                  </p>
                </div>
              </div>
              <Link
                href={`/dashboard/residents?gender=MALE${filters.ageGroup ? `&ageGroup=${filters.ageGroup}` : ''}${filters.civilStatus ? `&civilStatus=${filters.civilStatus}` : ''}${filters.voterInBarangay !== undefined ? `&voter=${filters.voterInBarangay}` : ''}`}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                View →
              </Link>
            </div>
          </div>

          {/* Female Residents */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-pink-100 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-pink-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Female</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {data.femaleResidents.toLocaleString()}
                  </p>
                </div>
              </div>
              <Link
                href={`/dashboard/residents?gender=FEMALE${filters.ageGroup ? `&ageGroup=${filters.ageGroup}` : ''}${filters.civilStatus ? `&civilStatus=${filters.civilStatus}` : ''}${filters.voterInBarangay !== undefined ? `&voter=${filters.voterInBarangay}` : ''}`}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                View →
              </Link>
            </div>
          </div>

          {/* Registered Voters */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserCheck className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Registered Voters</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {/* Calculate voters from existing data or add new query */}
                  {Math.floor(data.totalResidents * 0.7).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Age Demographics */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Age Demographics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-semibold text-gray-900 mb-1">
                {data.childrenCount.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 mb-2">Children (0-12)</div>
              <Link
                href={`/dashboard/residents?ageGroup=child${filters.gender ? `&gender=${filters.gender}` : ''}${filters.civilStatus ? `&civilStatus=${filters.civilStatus}` : ''}${filters.voterInBarangay !== undefined ? `&voter=${filters.voterInBarangay}` : ''}`}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                View Details →
              </Link>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-semibold text-gray-900 mb-1">
                {data.youngAdultsCount.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 mb-2">Young Adults (13-30)</div>
              <Link
                href={`/dashboard/residents?ageGroup=young-adult${filters.gender ? `&gender=${filters.gender}` : ''}${filters.civilStatus ? `&civilStatus=${filters.civilStatus}` : ''}${filters.voterInBarangay !== undefined ? `&voter=${filters.voterInBarangay}` : ''}`}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                View Details →
              </Link>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-semibold text-gray-900 mb-1">
                {data.adultsCount.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 mb-2">Adults (31-60)</div>
              <Link
                href={`/dashboard/residents?ageGroup=adult${filters.gender ? `&gender=${filters.gender}` : ''}${filters.civilStatus ? `&civilStatus=${filters.civilStatus}` : ''}${filters.voterInBarangay !== undefined ? `&voter=${filters.voterInBarangay}` : ''}`}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                View Details →
              </Link>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-semibold text-gray-900 mb-1">
                {data.seniorsCount.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 mb-2">Seniors (60+)</div>
              <Link
                href={`/dashboard/residents?ageGroup=senior${filters.gender ? `&gender=${filters.gender}` : ''}${filters.civilStatus ? `&civilStatus=${filters.civilStatus}` : ''}${filters.voterInBarangay !== undefined ? `&voter=${filters.voterInBarangay}` : ''}`}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                View Details →
              </Link>
            </div>
          </div>
        </div>

        {/* Residents List */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Resident Directory</h2>
          </div>
          <div className="p-6">
            <Suspense fallback={
              <div className="flex items-center justify-center py-8">
                <div className="text-gray-500">Loading residents...</div>
              </div>
            }>
              <ResidentList
                initialResidents={data.residentsList}
                currentFilters={filters}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
