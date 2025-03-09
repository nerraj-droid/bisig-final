'use client';

import { PrismaClient } from "@prisma/client";
import { PageTransition } from "@/components/ui/page-transition";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function ResidentDeletePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [resident, setResident] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResident() {
      try {
        const response = await fetch(`/api/residents/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch resident');
        }
        const data = await response.json();
        setResident(data);
      } catch (err) {
        setError('Failed to load resident information');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchResident();
  }, [params.id]);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/residents/${params.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete resident');
      }

      // Redirect to residents list
      router.push('/dashboard/residents');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <PageTransition>
        <div className="w-full flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#006B5E]"></div>
        </div>
      </PageTransition>
    );
  }

  if (error && !resident) {
    return (
      <PageTransition>
        <div className="w-full">
          <div className="flex items-center mb-6">
            <Link href="/dashboard/residents" className="text-[#006B5E] hover:text-[#F39C12] transition-colors mr-4">
              <ArrowLeft size={24} />
            </Link>
            <h1 className="text-2xl font-bold text-[#006B5E]">ERROR</h1>
          </div>
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        </div>
      </PageTransition>
    );
  }

  const fullName = resident ? `${resident.lastName}, ${resident.firstName} ${resident.middleName || ''}`.trim() : '';

  return (
    <PageTransition>
      <div className="w-full">
        {/* Back button and page title */}
        <div className="flex items-center mb-6">
          <Link href={`/dashboard/residents/${params.id}`} className="text-[#006B5E] hover:text-[#F39C12] transition-colors mr-4">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold text-[#006B5E]">DELETE RESIDENT</h1>
        </div>

        {/* Delete Confirmation */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden p-6">
          <div className="flex items-center text-red-600 mb-4">
            <AlertTriangle className="h-8 w-8 mr-3" />
            <h2 className="text-xl font-bold">Confirm Deletion</h2>
          </div>

          <p className="text-gray-700 mb-6">
            Are you sure you want to delete the resident record for <span className="font-semibold">{fullName}</span>? This action cannot be undone.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
              {error}
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <Link href={`/dashboard/residents/${params.id}`}>
              <Button variant="outline" disabled={isDeleting}>
                Cancel
              </Button>
            </Link>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Resident'}
            </Button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
} 