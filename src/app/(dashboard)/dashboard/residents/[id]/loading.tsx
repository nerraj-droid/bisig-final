import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ResidentDetailLoading() {
  return (
    <div className="w-full">
      {/* Back button and page title */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link href="/dashboard/residents" className="text-[#006B5E] hover:text-[#F39C12] transition-colors mr-4">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold text-[#006B5E]">RESIDENT DETAILS</h1>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      {/* Resident Details */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-[#006B5E] p-6 text-white">
          <div className="flex items-center">
            <Skeleton className="w-20 h-20 rounded-full bg-white/20" />
            <div className="ml-6">
              <Skeleton className="h-8 w-64 bg-white/20" />
              <Skeleton className="h-4 w-32 bg-white/20 mt-2" />
              <Skeleton className="h-6 w-20 bg-white/20 mt-2 rounded-full" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-[#006B5E] mb-4">Personal Information</h3>
              <div className="space-y-3">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="grid grid-cols-3">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-40 col-span-2" />
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-[#006B5E] mb-4">Contact Information</h3>
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="grid grid-cols-3">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-40 col-span-2" />
                  </div>
                ))}
              </div>
            </div>

            {/* Household Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-[#006B5E] mb-4">Household Information</h3>
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="grid grid-cols-3">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-40 col-span-2" />
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-[#006B5E] mb-4">Additional Information</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-3">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-40 col-span-2" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 