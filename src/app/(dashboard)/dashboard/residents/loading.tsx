import { Skeleton } from "@/components/ui/skeleton";

export default function ResidentsLoading() {
  return (
    <div className="w-full">
      {/* Back button and page title */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Skeleton className="h-6 w-6 mr-4" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-5 w-40" />
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-[#F39C12]/30 overflow-hidden shadow-sm">
            <div className="p-4 flex flex-col items-center">
              <Skeleton className="h-10 w-10 rounded-full mb-2" />
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
          </div>
        ))}
      </div>
      
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-28" />
        <Skeleton className="h-10 w-10" />
        <Skeleton className="h-10 w-36" />
      </div>
      
      {/* Residents Table */}
      <div className="bg-white rounded-md shadow overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-5 p-4 border-b bg-gray-50">
          {["NAME", "SEX", "BIRTH DATE", "ADDRESS", "ACTION"].map((header, i) => (
            <Skeleton key={i} className="h-6 w-full max-w-[200px]" />
          ))}
        </div>
        
        {/* Table Rows */}
        {[...Array(10)].map((_, i) => (
          <div key={i} className="grid grid-cols-5 p-4 border-b">
            <div className="flex items-center">
              <Skeleton className="w-10 h-10 rounded-full mr-3" />
              <div>
                <Skeleton className="h-5 w-40 mb-1" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <Skeleton className="h-6 w-16 self-center" />
            <Skeleton className="h-6 w-32 self-center" />
            <Skeleton className="h-6 w-40 self-center" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        ))}
      </div>
      
      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <Skeleton className="h-5 w-40" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    </div>
  );
} 