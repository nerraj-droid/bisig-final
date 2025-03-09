import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import { PageTransition } from "@/components/ui/page-transition";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Filter, Plus } from "lucide-react";
import Image from "next/image";
import { Suspense } from "react";
import { ResidentList } from "@/components/residents/resident-list";

const prisma = new PrismaClient();

async function getResidentsData() {
  // Get total residents
  const totalResidents = await prisma.resident.count();
  
  // Get residents by gender
  const maleResidents = await prisma.resident.count({
    where: { gender: "MALE" }
  });
  const femaleResidents = await prisma.resident.count({
    where: { gender: "FEMALE" }
  });
  
  // Get residents by age group - adjusted for Philippine context
  const childrenResidents = await prisma.resident.count({
    where: {
      birthDate: {
        gte: new Date(new Date().setFullYear(new Date().getFullYear() - 17))
      }
    }
  });
  
  const youngAdultResidents = await prisma.resident.count({
    where: {
      birthDate: {
        gte: new Date(new Date().setFullYear(new Date().getFullYear() - 24)),
        lte: new Date(new Date().setFullYear(new Date().getFullYear() - 18))
      }
    }
  });
  
  const adultResidents = await prisma.resident.count({
    where: {
      birthDate: {
        gte: new Date(new Date().setFullYear(new Date().getFullYear() - 59)),
        lte: new Date(new Date().setFullYear(new Date().getFullYear() - 25))
      }
    }
  });
  
  const seniorResidents = await prisma.resident.count({
    where: {
      birthDate: {
        lte: new Date(new Date().setFullYear(new Date().getFullYear() - 60))
      }
    }
  });
  
  // Get all residents with pagination
  const residentsData = await prisma.resident.findMany({
    take: 10,
    orderBy: {
      lastName: 'asc'
    },
    include: {
      Household: true
    }
  });
  
  // Format the data to match the expected format
  const residents = residentsData.map(resident => ({
    id: resident.id,
    firstName: resident.firstName,
    middleName: resident.middleName,
    lastName: resident.lastName,
    extensionName: resident.extensionName,
    birthDate: resident.birthDate ? resident.birthDate.toISOString() : '',
    gender: resident.gender,
    civilStatus: resident.civilStatus,
    contactNo: resident.contactNo,
    email: resident.email,
    occupation: resident.occupation,
    voterInBarangay: resident.voterInBarangay,
    headOfHousehold: resident.headOfHousehold,
    Household: resident.Household ? {
      houseNo: resident.Household.houseNo,
      street: resident.Household.street
    } : null
  }));
  
  return {
    stats: {
      total: totalResidents,
      byGender: {
        male: maleResidents,
        female: femaleResidents
      },
      byAge: {
        children: childrenResidents,
        youngAdult: youngAdultResidents,
        adult: adultResidents,
        senior: seniorResidents
      }
    },
    residents
  };
}

export default async function ResidentsPage() {
  const data = await getResidentsData();
  
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
            Total Residents: <span className="font-bold text-[#006B5E]">{data.stats.total.toLocaleString()}</span>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {/* 0-17 Years Old */}
          <div className="bg-white rounded-xl border border-[#F39C12]/30 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="p-4 flex flex-col items-center">
              <div className="mb-2">
                <Image src="/icons/child-icon.svg" alt="Children" width={40} height={40} />
              </div>
              <div className="text-3xl font-bold text-[#006B5E]">
                {data.stats.byAge.children.toLocaleString()}
              </div>
              <div className="text-xs text-center border border-[#F39C12] rounded-full px-3 py-1 mt-1">
                0-17 YEARS OLD
              </div>
            </div>
          </div>
          
          {/* 18-24 Years Old */}
          <div className="bg-white rounded-xl border border-[#F39C12]/30 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="p-4 flex flex-col items-center">
              <div className="mb-2">
                <Image src="/icons/young-adult-icon.svg" alt="Young Adults" width={40} height={40} />
              </div>
              <div className="text-3xl font-bold text-[#006B5E]">
                {data.stats.byAge.youngAdult.toLocaleString()}
              </div>
              <div className="text-xs text-center border border-[#F39C12] rounded-full px-3 py-1 mt-1">
                18-24 YEARS OLD
              </div>
            </div>
          </div>
          
          {/* 25-59 Years Old */}
          <div className="bg-white rounded-xl border border-[#F39C12]/30 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="p-4 flex flex-col items-center">
              <div className="mb-2">
                <Image src="/icons/adult-icon.svg" alt="Adults" width={40} height={40} />
              </div>
              <div className="text-3xl font-bold text-[#006B5E]">
                {data.stats.byAge.adult.toLocaleString()}
              </div>
              <div className="text-xs text-center border border-[#F39C12] rounded-full px-3 py-1 mt-1">
                25-59 YEARS OLD
              </div>
            </div>
          </div>
          
          {/* 60+ Years Old (Senior Citizens) */}
          <div className="bg-white rounded-xl border border-[#F39C12]/30 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="p-4 flex flex-col items-center">
              <div className="mb-2">
                <Image src="/icons/senior-icon.svg" alt="Senior Citizens" width={40} height={40} />
              </div>
              <div className="text-3xl font-bold text-[#006B5E]">
                {data.stats.byAge.senior.toLocaleString()}
              </div>
              <div className="text-xs text-center border border-[#F39C12] rounded-full px-3 py-1 mt-1">
                60+ YEARS OLD
              </div>
            </div>
          </div>
          
          {/* Male */}
          <div className="bg-white rounded-xl border border-[#F39C12]/30 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="p-4 flex flex-col items-center">
              <div className="mb-2">
                <Image src="/icons/male-icon.svg" alt="Male" width={40} height={40} />
              </div>
              <div className="text-3xl font-bold text-[#006B5E]">
                {data.stats.byGender.male.toLocaleString()}
              </div>
              <div className="text-xs text-center border border-[#F39C12] rounded-full px-3 py-1 mt-1">
                MALE
              </div>
            </div>
          </div>
          
          {/* Female */}
          <div className="bg-white rounded-xl border border-[#F39C12]/30 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="p-4 flex flex-col items-center">
              <div className="mb-2">
                <Image src="/icons/female-icon.svg" alt="Female" width={40} height={40} />
              </div>
              <div className="text-3xl font-bold text-[#006B5E]">
                {data.stats.byGender.female.toLocaleString()}
              </div>
              <div className="text-xs text-center border border-[#F39C12] rounded-full px-3 py-1 mt-1">
                FEMALE
              </div>
            </div>
          </div>
        </div>
        
        {/* Resident List Component */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-[#006B5E] mb-4 md:mb-0">Residents</h2>
            <div className="flex gap-4">
              <Button className="bg-white text-[#006B5E] border border-[#006B5E] hover:bg-[#006B5E] hover:text-white transition-colors">
                <Filter className="mr-2 h-4 w-4" /> FILTER
              </Button>
              <Link href="/dashboard/residents/add">
                <Button className="bg-[#006B5E] text-white hover:bg-[#005046]">
                  <Plus className="mr-2 h-4 w-4" /> ADD RESIDENT
                </Button>
              </Link>
            </div>
          </div>
          
          <Suspense fallback={<p>Loading residents...</p>}>
            <ResidentList initialResidents={data.residents} />
          </Suspense>
        </div>
      </div>
    </PageTransition>
  );
}
