import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type Resident = {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  address: string;
  contactNo: string | null;
  email: string | null;
};

type ResidentSearchModalProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (resident: Resident) => void;
  partyType: "complainant" | "respondent";
};

export default function ResidentSearchModal({
  open,
  onClose,
  onSelect,
  partyType
}: ResidentSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!searchQuery) return;
    
    setLoading(true);
    setError("");
    
    try {
      const response = await fetch(`/api/residents/search?query=${encodeURIComponent(searchQuery)}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to search residents");
      }
      
      const data = await response.json();
      setResults(data.residents);
      
      if (data.residents.length === 0) {
        setError("No residents found");
      }
    } catch (err) {
      setError((err as Error).message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectResident = (resident: Resident) => {
    onSelect(resident);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Search Resident Database</DialogTitle>
          <DialogDescription>
            Find and select a resident to populate the {partyType} details
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search by name or contact number"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} type="button" variant="secondary">
              <Search size={16} className="mr-2" />
              Search
            </Button>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
          
          <div className="max-h-[300px] overflow-y-auto">
            {loading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-3 border rounded-md">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {results.map((resident) => (
                  <div
                    key={resident.id}
                    className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleSelectResident(resident)}
                  >
                    <p className="font-medium">
                      {resident.firstName} {resident.middleName ? resident.middleName + " " : ""}
                      {resident.lastName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {resident.address}
                    </p>
                    {resident.contactNo && (
                      <p className="text-sm text-gray-500">
                        Contact: {resident.contactNo}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 