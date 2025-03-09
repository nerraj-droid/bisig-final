'use client';

import { Button } from "@/components/ui/button";
import { Resident } from "@prisma/client";
import { Eye, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { DeleteResidentDialog } from "./delete-resident-dialog";

interface ResidentSearchResultsProps {
  residents: Resident[];
}

export function ResidentSearchResults({ residents }: ResidentSearchResultsProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [residentToDelete, setResidentToDelete] = useState<Resident | null>(null);

  const handleDeleteClick = (resident: Resident) => {
    setResidentToDelete(resident);
    setIsDeleteDialogOpen(true);
  };

  return (
    <>
      <div className="bg-white rounded-md shadow overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-5 p-4 border-b bg-gray-50">
          <div className="font-semibold text-[#006B5E]">NAME</div>
          <div className="font-semibold text-[#006B5E]">SEX</div>
          <div className="font-semibold text-[#006B5E]">BIRTH DATE</div>
          <div className="font-semibold text-[#006B5E]">ADDRESS</div>
          <div className="font-semibold text-[#006B5E]">ACTION</div>
        </div>
        
        {/* Table Rows */}
        {residents.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No residents found. Try adjusting your search criteria.
          </div>
        ) : (
          residents.map((resident) => {
            const fullName = `${resident.lastName}, ${resident.firstName} ${resident.middleName || ''}`.trim();
            const birthDate = resident.birthDate ? new Date(resident.birthDate).toLocaleDateString('en-PH', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }) : 'N/A';
            
            return (
              <div key={resident.id} className="grid grid-cols-5 p-4 border-b hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-[#006B5E] text-white flex items-center justify-center mr-3">
                    {resident.firstName.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">{fullName}</div>
                    <div className="text-xs text-gray-500">ID: {resident.id}</div>
                  </div>
                </div>
                <div className="flex items-center text-gray-700">
                  {resident.gender}
                </div>
                <div className="flex items-center text-gray-700">
                  {birthDate}
                </div>
                <div className="flex items-center text-gray-700">
                  {resident.address || 'N/A'}
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/dashboard/residents/${resident.id}`}>
                    <Button variant="ghost" size="icon" className="text-amber-500 hover:text-amber-600 hover:bg-amber-50" title="View Details">
                      <Eye size={20} />
                    </Button>
                  </Link>
                  <Link href={`/dashboard/residents/${resident.id}/edit`}>
                    <Button variant="ghost" size="icon" className="text-blue-500 hover:text-blue-600 hover:bg-blue-50" title="Edit Resident">
                      <Edit size={20} />
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-red-500 hover:text-red-600 hover:bg-red-50" 
                    title="Delete Resident"
                    onClick={() => handleDeleteClick(resident)}
                  >
                    <Trash2 size={20} />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
      
      {/* Pagination */}
      {residents.length > 0 && (
        <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
          <div>
            Showing {residents.length} entries
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" className="bg-[#006B5E] text-white">
              1
            </Button>
            <Button variant="outline" size="sm">
              2
            </Button>
            <Button variant="outline" size="sm">
              3
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      {residentToDelete && (
        <DeleteResidentDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          resident={residentToDelete}
        />
      )}
    </>
  );
} 