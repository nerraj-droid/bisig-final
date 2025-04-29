import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PageTransition } from "@/components/ui/page-transition";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  Plus, 
  Search, 
  Shield, 
  FileText, 
  AlertTriangle,
  Clock,
  CheckCircle,
  ArrowRight,
  Calendar
} from "lucide-react";
import { format } from "date-fns";
import { BlotterCaseStatus, BlotterPriority, BlotterPartyType } from "@/lib/enums";
import { getBlotterData, type FilterCriteria, type FormattedCase } from "./actions";
import BlotterList from "./components/blotter-list";
import BlotterFilters from "./components/blotter-filters";

// Status badge helper
const StatusBadge = ({ status }: { status: BlotterCaseStatus }) => {
  const statusConfig = {
    [BlotterCaseStatus.PENDING]: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
    [BlotterCaseStatus.ONGOING]: { color: "bg-blue-100 text-blue-800", label: "Ongoing" },
    [BlotterCaseStatus.RESOLVED]: { color: "bg-green-100 text-green-800", label: "Resolved" },
    [BlotterCaseStatus.ESCALATED]: { color: "bg-red-100 text-red-800", label: "Escalated" }
  };
  
  const config = statusConfig[status] || statusConfig[BlotterCaseStatus.PENDING];
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full ${config.color}`}>
      {config.label}
    </span>
  );
};

// Priority badge helper
const PriorityBadge = ({ priority }: { priority: BlotterPriority }) => {
  const priorityConfig = {
    [BlotterPriority.LOW]: { color: "bg-gray-100 text-gray-800", label: "Low" },
    [BlotterPriority.MEDIUM]: { color: "bg-blue-100 text-blue-800", label: "Medium" },
    [BlotterPriority.HIGH]: { color: "bg-orange-100 text-orange-800", label: "High" },
    [BlotterPriority.URGENT]: { color: "bg-red-100 text-red-800", label: "Urgent" }
  };
  
  const config = priorityConfig[priority] || priorityConfig[BlotterPriority.MEDIUM];
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full ${config.color}`}>
      {config.label}
    </span>
  );
};

export default async function BlotterManagementPage({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const session = await getServerSession(authOptions);
  
  // Check if the user is authenticated
  if (!session) {
    return (
      <div className="p-6">
        <h1 className="text-red-500">You must be logged in to access this page</h1>
      </div>
    );
  }
  
  // Parse search parameters
  const status = searchParams.status as BlotterCaseStatus | undefined;
  const priority = searchParams.priority as BlotterPriority | undefined;
  const incidentType = searchParams.incidentType as string | undefined;
  const searchTerm = searchParams.q as string | undefined;
  const page = searchParams.page ? parseInt(searchParams.page as string) : 1;
  
  // Get blotter data with filters
  const blotterData = await getBlotterData({
    status,
    priority,
    incidentType,
    searchTerm,
    page
  });
  
  return (
    <PageTransition>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header with Stats */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="h-6 w-6 text-blue-600" />
              Blotter Management
            </h1>
            <p className="text-gray-500 mt-1">
              Manage incident reports and case tracking
            </p>
          </div>
          
          <Link href="/dashboard/blotter/new">
            <Button className="gap-1 bg-[#006B5E] text-white hover:bg-[#005046]">
              <Plus size={16} />
              New Blotter Entry
            </Button>
          </Link>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Cases</p>
                <p className="text-2xl font-bold">{blotterData.totalCount}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-bold">{blotterData.pendingCount}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Ongoing</p>
                <p className="text-2xl font-bold">{blotterData.ongoingCount}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Resolved</p>
                <p className="text-2xl font-bold">{blotterData.resolvedCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Escalated</p>
                <p className="text-2xl font-bold">{blotterData.escalatedCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </CardContent>
          </Card>
        </div>
        
        {/* Filters */}
        <BlotterFilters 
          initialStatus={status}
          initialPriority={priority}
          initialSearchTerm={searchTerm}
        />
        
        {/* Cases Table */}
        <Card className="mb-6">
          <CardHeader className="pb-0">
            <CardTitle>Blotter Cases</CardTitle>
            <CardDescription>
              {blotterData.totalCount} {blotterData.totalCount === 1 ? 'case' : 'cases'} found
              {searchTerm ? ` matching "${searchTerm}"` : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BlotterList 
              cases={blotterData.cases} 
              totalCount={blotterData.totalCount}
              currentPage={blotterData.currentPage}
              totalPages={blotterData.totalPages}
              status={status}
              priority={priority}
              searchTerm={searchTerm}
            />
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
} 