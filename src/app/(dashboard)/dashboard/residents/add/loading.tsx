import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AddResidentLoading() {
  return (
    <div className="w-full">
      {/* Back button and page title */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link href="/dashboard/residents" className="text-[#006B5E] hover:text-[#F39C12] transition-colors mr-4">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold text-[#006B5E]">ADD NEW RESIDENT</h1>
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Form Skeleton */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <Skeleton className="h-7 w-48" />
            
            {[...Array(7)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>

          {/* Contact and Additional Information */}
          <div className="space-y-4">
            <Skeleton className="h-7 w-64" />
            
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
            
            <div className="space-y-4 mt-4">
              <Skeleton className="h-7 w-24" />
              
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex items-center">
                  <Skeleton className="h-4 w-4 mr-2" />
                  <Skeleton className="h-5 w-40" />
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 pt-4 mt-6 border-t">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    </div>
  );
} 