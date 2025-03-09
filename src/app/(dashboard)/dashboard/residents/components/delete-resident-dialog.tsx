'use client';

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Resident } from "@prisma/client";
import { AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface DeleteResidentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  resident: Resident;
}

export function DeleteResidentDialog({ isOpen, onClose, resident }: DeleteResidentDialogProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fullName = `${resident.lastName}, ${resident.firstName} ${resident.middleName || ''}`.trim();

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/residents/${resident.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete resident');
      }

      // Close dialog and refresh the page
      onClose();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center text-red-600">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Confirm Deletion
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the resident record for <span className="font-semibold">{fullName}</span>? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete Resident'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 