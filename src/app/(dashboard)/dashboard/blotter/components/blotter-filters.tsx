"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, Search } from "lucide-react";
import { BlotterCaseStatus, BlotterPriority } from "@/lib/enums";

export default function BlotterFilters({
  initialStatus,
  initialPriority,
  initialSearchTerm,
  caseType,
}: {
  initialStatus?: string,
  initialPriority?: string,
  initialSearchTerm?: string,
  caseType?: string,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [status, setStatus] = useState(initialStatus || "all");
  const [priority, setPriority] = useState(initialPriority || "all");
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm || "");
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };
  
  const applyFilters = () => {
    const params = new URLSearchParams();
    
    if (status && status !== "all") params.set("status", status);
    if (priority && priority !== "all") params.set("priority", priority);
    if (searchTerm) params.set("q", searchTerm);
    if (caseType) params.set("caseType", caseType);
    
    router.push(`/dashboard/blotter?${params.toString()}`);
  };
  
  const resetFilters = () => {
    setStatus("all");
    setPriority("all");
    setSearchTerm("");
    
    // Keep caseType when resetting other filters
    const params = new URLSearchParams();
    if (caseType) params.set("caseType", caseType);
    
    router.push(`/dashboard/blotter${params.toString() ? `?${params.toString()}` : ""}`);
  };
  
  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search case number, names, location..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </form>
        
        <div className="flex flex-wrap gap-2">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value={BlotterCaseStatus.PENDING}>Pending</SelectItem>
              <SelectItem value={BlotterCaseStatus.ONGOING}>Ongoing</SelectItem>
              <SelectItem value={BlotterCaseStatus.RESOLVED}>Resolved</SelectItem>
              <SelectItem value={BlotterCaseStatus.ESCALATED}>Escalated</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value={BlotterPriority.LOW}>Low</SelectItem>
              <SelectItem value={BlotterPriority.MEDIUM}>Medium</SelectItem>
              <SelectItem value={BlotterPriority.HIGH}>High</SelectItem>
              <SelectItem value={BlotterPriority.URGENT}>Urgent</SelectItem>
            </SelectContent>
          </Select>
          
          <Button type="button" variant="outline" size="icon" className="h-10 w-10" onClick={applyFilters}>
            <Filter size={16} />
          </Button>
          
          {(status !== "all" || priority !== "all" || searchTerm) && (
            <Button type="button" variant="outline" size="sm" onClick={resetFilters}>
              Reset
            </Button>
          )}
        </div>
      </div>
    </div>
  );
} 