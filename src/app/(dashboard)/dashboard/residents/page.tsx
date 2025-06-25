import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Gender, CivilStatus, Prisma } from "@prisma/client";
import { PageTransition } from "@/components/ui/page-transition";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Filter, Plus, Download } from "lucide-react";
import Image from "next/image";
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
      <div className="w-full">
        {/* Back button and page title */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link href="/dashboard" className="text-[#006B5E] hover:text-[#F39C12] transition-colors mr-4">
              <ArrowLeft size={24} />
            </Link>
            <h1 className="text-2xl font-bold text-[#006B5E]">RESIDENT'S LIST</h1>
          </div>
          <div className="text-sm text-gray-500">
            Total Residents: <span className="font-bold text-[#006B5E]">{data.totalResidents.toLocaleString()}</span>
          </div>
        </div>

        {/* Filter description if filters are applied */}
        {filterDescription && (
          <div className="bg-[#E8F5F3] p-3 rounded-md mb-4 text-[#006B5E] flex justify-between items-center">
            <div>{filterDescription}</div>
            <div className="flex gap-2">
              <Link href={`/api/residents/export${Object.keys(filters).length ?
                `?${Object.entries(filters)
                  .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
                  .join('&')}`
                : ''
                }`} target="_blank">
                <Button variant="outline" size="sm" className="h-8">
                  <Download className="h-4 w-4 mr-1" /> Download Data
                </Button>
              </Link>
              <Link href="/dashboard/residents">
                <Button variant="outline" size="sm" className="h-8">Clear Filters</Button>
              </Link>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Male */}
          <div className="bg-white rounded-xl border border-[#F39C12]/30 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="p-4 flex flex-col items-center">
              <div className="mb-2">
                <Image src="/icons/male-icon.svg" alt="Male" width={40} height={40} />
              </div>
              <div className="text-3xl font-bold text-[#006B5E]">
                {data.maleResidents.toLocaleString()}
              </div>
              <div className="text-xs text-center border border-[#F39C12] rounded-full px-3 py-1 mt-1">
                MALE
              </div>
              <Link href={`/dashboard/residents?gender=MALE${filters.ageGroup ? `&ageGroup=${filters.ageGroup}` : ''}${filters.civilStatus ? `&civilStatus=${filters.civilStatus}` : ''}${filters.voterInBarangay !== undefined ? `&voter=${filters.voterInBarangay}` : ''}`} className="mt-2 text-xs text-[#006B5E] hover:underline">
                Filter Male Only
              </Link>
            </div>
          </div>

          {/* Female */}
          <div className="bg-white rounded-xl border border-[#F39C12]/30 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="p-4 flex flex-col items-center">
              <div className="mb-2">
                <Image src="/icons/female-icon.svg" alt="Female" width={40} height={40} />
              </div>
              <div className="text-3xl font-bold text-[#006B5E]">
                {data.femaleResidents.toLocaleString()}
              </div>
              <div className="text-xs text-center border border-[#F39C12] rounded-full px-3 py-1 mt-1">
                FEMALE
              </div>
              <Link href={`/dashboard/residents?gender=FEMALE${filters.ageGroup ? `&ageGroup=${filters.ageGroup}` : ''}${filters.civilStatus ? `&civilStatus=${filters.civilStatus}` : ''}${filters.voterInBarangay !== undefined ? `&voter=${filters.voterInBarangay}` : ''}`} className="mt-2 text-xs text-[#006B5E] hover:underline">
                Filter Female Only
              </Link>
            </div>
          </div>

          {/* Age Group Cards */}
          <div className="bg-white rounded-xl border border-[#F39C12]/30 overflow-hidden shadow-sm hover:shadow-md transition-shadow col-span-1 sm:col-span-2">
            <div className="p-4">
              <h3 className="text-[#006B5E] font-medium text-center mb-3">AGE GROUPS</h3>
              <div className="grid grid-cols-4 gap-2">
                <div className="text-center">
                  <div className="font-bold text-lg text-[#006B5E]">{data.childrenCount}</div>
                  <div className="text-xs text-gray-600">Children</div>
                  <Link href={`/dashboard/residents?ageGroup=child${filters.gender ? `&gender=${filters.gender}` : ''}${filters.civilStatus ? `&civilStatus=${filters.civilStatus}` : ''}${filters.voterInBarangay !== undefined ? `&voter=${filters.voterInBarangay}` : ''}`} className="mt-1 text-xs text-[#006B5E] hover:underline block">
                    Filter
                  </Link>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg text-[#006B5E]">{data.youngAdultsCount}</div>
                  <div className="text-xs text-gray-600">Young Adults</div>
                  <Link href={`/dashboard/residents?ageGroup=young-adult${filters.gender ? `&gender=${filters.gender}` : ''}${filters.civilStatus ? `&civilStatus=${filters.civilStatus}` : ''}${filters.voterInBarangay !== undefined ? `&voter=${filters.voterInBarangay}` : ''}`} className="mt-1 text-xs text-[#006B5E] hover:underline block">
                    Filter
                  </Link>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg text-[#006B5E]">{data.adultsCount}</div>
                  <div className="text-xs text-gray-600">Adults</div>
                  <Link href={`/dashboard/residents?ageGroup=adult${filters.gender ? `&gender=${filters.gender}` : ''}${filters.civilStatus ? `&civilStatus=${filters.civilStatus}` : ''}${filters.voterInBarangay !== undefined ? `&voter=${filters.voterInBarangay}` : ''}`} className="mt-1 text-xs text-[#006B5E] hover:underline block">
                    Filter
                  </Link>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg text-[#006B5E]">{data.seniorsCount}</div>
                  <div className="text-xs text-gray-600">Seniors</div>
                  <Link href={`/dashboard/residents?ageGroup=senior${filters.gender ? `&gender=${filters.gender}` : ''}${filters.civilStatus ? `&civilStatus=${filters.civilStatus}` : ''}${filters.voterInBarangay !== undefined ? `&voter=${filters.voterInBarangay}` : ''}`} className="mt-1 text-xs text-[#006B5E] hover:underline block">
                    Filter
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Resident List Component */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-[#006B5E] mb-4 md:mb-0">Residents</h2>
          <div className="flex gap-4">
            <Link href="/dashboard/residents/filter">
              <Button className="bg-white text-[#006B5E] border border-[#006B5E] hover:bg-[#006B5E] hover:text-white transition-colors">
                <Filter className="mr-2 h-4 w-4" /> ADVANCED FILTER
              </Button>
            </Link>
            <Link href="/dashboard/residents/add">
              <Button className="bg-[#006B5E] text-white hover:bg-[#005046]">
                <Plus className="mr-2 h-4 w-4" /> ADD RESIDENT
              </Button>
            </Link>
          </div>
        </div>

        <Suspense fallback={<p>Loading residents...</p>}>
          <ResidentList
            initialResidents={data.residentsList}
            currentFilters={filters}
          />
        </Suspense>
      </div>
    </PageTransition>
  );
}
