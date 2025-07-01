import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PageTransition } from "@/components/ui/page-transition";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Shield,
  ArrowRight,
  ArrowLeft,
  Clock,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { format } from "date-fns";
import { BlotterCaseStatus, BlotterPriority } from "@/lib/enums";
import { getBlotterData } from "../actions";

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

export default async function BlotterListingPage({
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

  // Parse search parameters - safely access them by awaiting the values first
  const params = searchParams;
  const status = params.status === 'all' ? undefined : params.status as BlotterCaseStatus | undefined;
  const priority = params.priority === 'all' ? undefined : params.priority as BlotterPriority | undefined;
  const incidentType = params.incidentType as string | undefined;
  const searchTerm = params.q as string | undefined;
  const page = params.page ? parseInt(params.page.toString()) : 1;

  // Get blotter data with filters (only for blotter type)
  const blotterData = await getBlotterData({
    status,
    priority,
    incidentType,
    searchTerm,
    page,
    caseType: 'blotter'
  });

  return (
    <PageTransition>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start mb-8">
          <div className="flex items-center gap-2">
            <Link href="/dashboard/blotter">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <ArrowLeft size={18} />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Shield className="h-6 w-6 text-indigo-600" />
                Blotter Records
              </h1>
              <p className="text-gray-500 mt-1">
                View and manage all blotter entries
              </p>
            </div>
          </div>

          <Link href="/dashboard/blotter/new-blotter">
            <Button className="gap-1 bg-indigo-600 hover:bg-indigo-700">
              <Shield size={16} />
              Create New Blotter
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-indigo-50 border-indigo-100">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-indigo-700">Total Blotters</p>
                <p className="text-2xl font-bold text-indigo-900">{blotterData.totalCount}</p>
              </div>
              <Shield className="h-8 w-8 text-indigo-500" />
            </CardContent>
          </Card>

          <Card className="bg-yellow-50 border-yellow-100">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-700">Pending</p>
                <p className="text-2xl font-bold text-yellow-900">{blotterData.pendingCount}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-100">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Resolved</p>
                <p className="text-2xl font-bold text-green-900">{blotterData.resolvedCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </CardContent>
          </Card>

          <Card className="bg-red-50 border-red-100">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700">Escalated</p>
                <p className="text-2xl font-bold text-red-900">{blotterData.escalatedCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <form className="relative flex-1" action="/dashboard/blotter/blotters" method="get">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search case number, names, location..."
                className="pl-9"
                name="q"
                defaultValue={searchTerm}
              />

              {/* Hidden inputs to preserve other filters */}
              {status && <input type="hidden" name="status" value={status} />}
              {priority && <input type="hidden" name="priority" value={priority} />}
              {incidentType && <input type="hidden" name="incidentType" value={incidentType} />}

              <div className="flex flex-wrap gap-2 mt-4 md:hidden">
                <select
                  className="h-10 w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                  name="status"
                  defaultValue={status || "all"}
                >
                  <option value="all">All Statuses</option>
                  <option value={BlotterCaseStatus.PENDING}>Pending</option>
                  <option value={BlotterCaseStatus.ONGOING}>Ongoing</option>
                  <option value={BlotterCaseStatus.RESOLVED}>Resolved</option>
                  <option value={BlotterCaseStatus.ESCALATED}>Escalated</option>
                </select>

                <select
                  className="h-10 w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                  name="priority"
                  defaultValue={priority || "all"}
                >
                  <option value="all">All Priorities</option>
                  <option value={BlotterPriority.LOW}>Low</option>
                  <option value={BlotterPriority.MEDIUM}>Medium</option>
                  <option value={BlotterPriority.HIGH}>High</option>
                  <option value={BlotterPriority.URGENT}>Urgent</option>
                </select>

                <Button type="submit" className="w-full">
                  Filter Results
                </Button>
              </div>
            </form>

            <div className="hidden md:flex flex-wrap gap-2">
              <form action="/dashboard/blotter/blotters" method="get" className="flex gap-2">
                {/* Hidden input to preserve search term */}
                {searchTerm && <input type="hidden" name="q" value={searchTerm} />}

                <select
                  className="h-10 w-[180px] px-3 py-2 rounded-md border border-input bg-background text-sm"
                  name="status"
                  defaultValue={status || "all"}
                >
                  <option value="all">All Statuses</option>
                  <option value={BlotterCaseStatus.PENDING}>Pending</option>
                  <option value={BlotterCaseStatus.ONGOING}>Ongoing</option>
                  <option value={BlotterCaseStatus.RESOLVED}>Resolved</option>
                  <option value={BlotterCaseStatus.ESCALATED}>Escalated</option>
                </select>

                <select
                  className="h-10 w-[180px] px-3 py-2 rounded-md border border-input bg-background text-sm"
                  name="priority"
                  defaultValue={priority || "all"}
                >
                  <option value="all">All Priorities</option>
                  <option value={BlotterPriority.LOW}>Low</option>
                  <option value={BlotterPriority.MEDIUM}>Medium</option>
                  <option value={BlotterPriority.HIGH}>High</option>
                  <option value={BlotterPriority.URGENT}>Urgent</option>
                </select>

                <Button type="submit" size="icon" className="h-10 w-10">
                  <Filter size={16} />
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Blotters Table */}
        <Card className="mb-6">
          <CardHeader className="pb-0">
            <CardTitle>Blotter Entries</CardTitle>
            <CardDescription>
              {blotterData.totalCount} {blotterData.totalCount === 1 ? 'entry' : 'entries'} found
              {searchTerm ? ` matching "${searchTerm}"` : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {blotterData.cases.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <th className="px-4 py-3">Case #</th>
                      <th className="px-4 py-3">Reported</th>
                      <th className="px-4 py-3">Incident Type</th>
                      <th className="px-4 py-3">Complainant</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Priority</th>
                      <th className="px-4 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {blotterData.cases.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.caseNumber}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {format(new Date(item.reportDate), 'MMM d, yyyy')}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">{item.incidentType}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{item.complainant}</td>
                        <td className="px-4 py-3 text-sm">
                          <StatusBadge status={item.status as BlotterCaseStatus} />
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <PriorityBadge priority={item.priority as BlotterPriority} />
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <Link
                            href={`/dashboard/blotter/${item.id}`}
                            className="text-indigo-600 hover:text-indigo-800 flex items-center"
                          >
                            View <ArrowRight size={14} className="ml-1" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No blotter entries found matching your criteria.</p>
              </div>
            )}

            {/* Pagination */}
            {blotterData.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-500">
                  Showing <span className="font-medium">{(blotterData.currentPage - 1) * 10 + 1}</span> to{" "}
                  <span className="font-medium">
                    {Math.min(blotterData.currentPage * 10, blotterData.totalCount)}
                  </span>{" "}
                  of <span className="font-medium">{blotterData.totalCount}</span> results
                </div>
                <div className="flex space-x-2">
                  <Link
                    href={`/dashboard/blotter/blotters?${new URLSearchParams({
                      ...(status ? { status } : {}),
                      ...(priority ? { priority } : {}),
                      ...(incidentType ? { incidentType } : {}),
                      ...(searchTerm ? { q: searchTerm } : {}),
                      page: (blotterData.currentPage > 1 ? blotterData.currentPage - 1 : 1).toString()
                    }).toString()}`}
                    className={`inline-flex items-center px-3 py-1 rounded border ${blotterData.currentPage === 1
                      ? "border-gray-200 text-gray-300 cursor-not-allowed"
                      : "border-gray-300 text-gray-600 hover:bg-gray-50"
                      }`}
                    aria-disabled={blotterData.currentPage === 1}
                    tabIndex={blotterData.currentPage === 1 ? -1 : 0}
                  >
                    <ChevronLeft size={16} className="mr-1" />
                    Previous
                  </Link>
                  <Link
                    href={`/dashboard/blotter/blotters?${new URLSearchParams({
                      ...(status ? { status } : {}),
                      ...(priority ? { priority } : {}),
                      ...(incidentType ? { incidentType } : {}),
                      ...(searchTerm ? { q: searchTerm } : {}),
                      page: (blotterData.currentPage < blotterData.totalPages ? blotterData.currentPage + 1 : blotterData.totalPages).toString()
                    }).toString()}`}
                    className={`inline-flex items-center px-3 py-1 rounded border ${blotterData.currentPage === blotterData.totalPages
                      ? "border-gray-200 text-gray-300 cursor-not-allowed"
                      : "border-gray-300 text-gray-600 hover:bg-gray-50"
                      }`}
                    aria-disabled={blotterData.currentPage === blotterData.totalPages}
                    tabIndex={blotterData.currentPage === blotterData.totalPages ? -1 : 0}
                  >
                    Next
                    <ChevronRight size={16} className="ml-1" />
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
} 