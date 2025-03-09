import { Skeleton } from "@/components/ui/skeleton";

export default function CertificatesLoading() {
  return (
    <div className="w-full">
      <div className="mb-6">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-5 w-96" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border p-6">
            <Skeleton className="h-8 w-40 mb-4" />
            <Skeleton className="h-24 w-full mb-4" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
} 