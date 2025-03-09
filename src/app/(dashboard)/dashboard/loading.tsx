import { Skeleton } from "@/components/ui/skeleton";
import { Users, FileText, Home, Building, BarChart3 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="w-full space-y-4 sm:space-y-6">
      {/* Welcome Section Skeleton */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-[#F39C12]/30">
        <Skeleton className="h-8 w-3/4 sm:w-1/2 mb-3" />
        <Skeleton className="h-4 w-full sm:w-2/3" />
      </div>

      {/* Quick Stats - Mobile Only */}
      <div className="grid grid-cols-2 gap-3 sm:hidden">
        <div className="bg-white p-3 rounded-xl border border-[#F39C12]/30">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-20" />
            <Users size={16} className="text-gray-300" />
          </div>
          <Skeleton className="h-8 w-16 mt-2" />
        </div>
        
        <div className="bg-white p-3 rounded-xl border border-[#F39C12]/30">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-20" />
            <FileText size={16} className="text-gray-300" />
          </div>
          <Skeleton className="h-8 w-16 mt-2" />
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Communication Card Skeleton */}
        <div className="bg-white rounded-xl border border-[#F39C12]/30 overflow-hidden">
          <div className="p-4">
            <Skeleton className="h-5 w-32 mb-3" />
            <Skeleton className="h-4 w-40 mb-4" />
            
            <div className="mt-4 bg-gray-100 rounded-lg p-3">
              <div className="flex items-center gap-3 mb-2">
                <Skeleton className="h-4 w-10" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-10" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
          </div>
          
          <div className="flex border-t border-gray-100">
            {[1, 2, 3, 4].map((_, index) => (
              <div key={index} className="flex-1 flex items-center justify-center py-4 bg-gray-100">
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>
            ))}
          </div>
        </div>
        
        {/* Document Issuance Card Skeleton */}
        <div className="bg-white rounded-xl border border-[#F39C12]/30 overflow-hidden">
          <div className="p-4">
            <Skeleton className="h-5 w-40 mb-4" />
            
            <div className="mt-4 text-center">
              <div className="flex items-end justify-center">
                <Skeleton className="h-12 w-20 sm:h-16 sm:w-28" />
                <Skeleton className="h-6 w-12 sm:h-8 sm:w-16 ml-1" />
              </div>
              <Skeleton className="h-4 w-40 mx-auto mt-1" />
            </div>
            
            <div className="mt-6 flex gap-4">
              <div className="flex-1 bg-gray-100 rounded-lg p-3 sm:p-4 text-center">
                <Skeleton className="h-8 w-16 mx-auto mb-1" />
                <Skeleton className="h-3 w-14 mx-auto" />
              </div>
              <div className="flex-1 bg-gray-100 rounded-lg p-3 sm:p-4 text-center">
                <Skeleton className="h-8 w-16 mx-auto mb-1" />
                <Skeleton className="h-3 w-14 mx-auto" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Certificate Types Card Skeleton */}
        <div className="bg-white rounded-xl border border-[#F39C12]/30 overflow-hidden">
          <div className="p-4">
            <Skeleton className="h-5 w-36 mb-4" />
            
            <div className="mt-4 space-y-3 sm:space-y-4">
              {[1, 2, 3].map((_, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex-none w-24 sm:w-32">
                    <div 
                      className="h-4 bg-gray-200 animate-pulse rounded" 
                      style={{ width: `${Math.random() * 80 + 20}%` }}
                    />
                  </div>
                  <Skeleton className="h-4 flex-1" />
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Officials Card Skeleton */}
        <div className="bg-white rounded-xl border border-[#F39C12]/30 overflow-hidden">
          <div className="p-4">
            <Skeleton className="h-5 w-40 mb-4" />
            
            <div className="mt-4 space-y-3">
              {[1, 2].map((_, index) => (
                <div key={index} className="flex items-center p-2 sm:p-3 bg-gray-50 rounded-lg">
                  <Skeleton className="w-8 h-8 sm:w-10 sm:h-10 rounded-full" />
                  <div className="ml-3 flex-1">
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Resident Profile Card Skeleton */}
        <div className="bg-white rounded-xl border border-[#F39C12]/30 overflow-hidden">
          <div className="p-4">
            <Skeleton className="h-5 w-36 mb-4" />
            
            <div className="mt-4 flex justify-center">
              <div className="relative w-32 h-32 sm:w-48 sm:h-48">
                <Skeleton className="w-full h-full rounded-full" />
              </div>
            </div>
            
            <div className="mt-6 flex justify-between">
              <div className="flex items-center">
                <div className="text-gray-300 mr-2">
                  <Users size={20} className="sm:w-6 sm:h-6" />
                </div>
                <div>
                  <Skeleton className="h-6 w-12 mb-1" />
                  <Skeleton className="h-3 w-8" />
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="text-gray-300 mr-2">
                  <Users size={20} className="sm:w-6 sm:h-6" />
                </div>
                <div>
                  <Skeleton className="h-6 w-12 mb-1" />
                  <Skeleton className="h-3 w-8" />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Household Types Card Skeleton */}
        <div className="bg-white rounded-xl border border-[#F39C12]/30 overflow-hidden">
          <div className="p-4">
            <Skeleton className="h-5 w-36 mb-4" />
            
            <div className="mt-4 space-y-3 sm:space-y-4">
              {[1, 2, 3].map((_, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex-none w-24 sm:w-32">
                    <div 
                      className="h-4 bg-gray-200 animate-pulse rounded" 
                      style={{ width: `${Math.random() * 80 + 20}%` }}
                    />
                  </div>
                  <Skeleton className="h-4 flex-1" />
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Disaster Risk Management Card Skeleton */}
        <div className="bg-white rounded-xl border border-[#F39C12]/30 overflow-hidden col-span-1 sm:col-span-2 lg:col-span-3">
          <div className="p-4">
            <Skeleton className="h-5 w-48 mb-4" />
            
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: <Home size={24} /> },
                { icon: <FileText size={24} /> },
                { icon: <Users size={24} /> },
                { icon: <Building size={24} /> }
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 text-gray-300 rounded-md flex items-center justify-center mb-2">
                    {item.icon}
                  </div>
                  <Skeleton className="h-6 w-12 mx-auto mb-1" />
                  <Skeleton className="h-3 w-20 mx-auto" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 