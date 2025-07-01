import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PageTransition } from "@/components/ui/page-transition";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Shield, FileText, Clock, LayoutDashboard, ArrowRight } from "lucide-react";
import { BlotterCaseStatus, BlotterPriority } from "@/lib/enums";
import { getBlotterData } from "./actions";

export default async function BlotterDashboardPage() {
  const session = await getServerSession(authOptions);

  // Check if the user is authenticated
  if (!session) {
    return (
      <div className="p-6">
        <h1 className="text-red-500">You must be logged in to access this page</h1>
      </div>
    );
  }

  // Get summary data
  const data = await getBlotterData();

  // Calculate stats for each type
  const blotterCount = data.cases.filter(c => !c.caseNumber.startsWith('CMP-')).length;
  const complaintCount = data.cases.filter(c => c.caseNumber.startsWith('CMP-')).length;

  return (
    <PageTransition>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-blue-600" />
            Case Management Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            Manage blotter entries and complaints for the barangay
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Cases</p>
                <p className="text-2xl font-bold">{data.totalCount}</p>
              </div>
              <LayoutDashboard className="h-8 w-8 text-blue-500" />
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Complaints</p>
                <p className="text-2xl font-bold">{complaintCount}</p>
              </div>
              <FileText className="h-8 w-8 text-purple-500" />
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-indigo-500">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Blotters</p>
                <p className="text-2xl font-bold">{blotterCount}</p>
              </div>
              <Shield className="h-8 w-8 text-indigo-500" />
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-bold">{data.pendingCount}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </CardContent>
          </Card>
        </div>

        {/* Main Option Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Blotter Card */}
          <Card className="overflow-hidden border-2 border-indigo-100">
            <CardHeader className="bg-indigo-50 border-b border-indigo-100">
              <CardTitle className="flex items-center gap-2 text-indigo-800">
                <Shield className="h-5 w-5" />
                Blotter Management
              </CardTitle>
              <CardDescription>
                Record and manage incident reports
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <p className="text-gray-500">
                Blotter entries are used to document incidents, crimes, disputes that occur in the barangay, and other matters that require official records. These entries serve as official records of reported incidents.
              </p>

              <div className="flex items-center justify-between bg-indigo-50 p-3 rounded-md">
                <div>
                  <p className="font-medium text-indigo-900">Active Blotters</p>
                  <p className="text-xl font-bold text-indigo-800">{blotterCount}</p>
                </div>
                <Shield className="h-8 w-8 text-indigo-500" />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link href="/dashboard/blotter/blotters" className="flex-1">
                  <Button variant="outline" className="w-full gap-1 border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800">
                    View All Blotters
                    <ArrowRight size={16} />
                  </Button>
                </Link>
                <Link href="/dashboard/blotter/new-blotter" className="flex-1">
                  <Button className="w-full gap-1 bg-indigo-600 hover:bg-indigo-700">
                    Create New Blotter
                    <Shield size={16} />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Complaint Card */}
          <Card className="overflow-hidden border-2 border-purple-100">
            <CardHeader className="bg-purple-50 border-b border-purple-100">
              <CardTitle className="flex items-center gap-2 text-purple-800">
                <FileText className="h-5 w-5" />
                Complaint Management
              </CardTitle>
              <CardDescription>
                Record and process resident complaints
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <p className="text-gray-500">
                Complaints allow residents to formally report issues or grievances to the barangay officials. These may include noise complaints, property disputes, and other matters that require official records.
              </p>

              <div className="flex items-center justify-between bg-purple-50 p-3 rounded-md">
                <div>
                  <p className="font-medium text-purple-900">Active Complaints</p>
                  <p className="text-xl font-bold text-purple-800">{complaintCount}</p>
                </div>
                <FileText className="h-8 w-8 text-purple-500" />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link href="/dashboard/blotter/complaints" className="flex-1">
                  <Button variant="outline" className="w-full gap-1 border-purple-200 text-purple-700 hover:bg-purple-50 hover:text-purple-800">
                    View All Complaints
                    <ArrowRight size={16} />
                  </Button>
                </Link>
                <Link href="/dashboard/blotter/new-complaint" className="flex-1">
                  <Button className="w-full gap-1 bg-purple-600 hover:bg-purple-700">
                    Create New Complaint
                    <FileText size={16} />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest cases added to the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.cases.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-3 border rounded-md hover:bg-gray-50">
                  {item.caseNumber.startsWith('CMP-') ? (
                    <FileText className="h-8 w-8 text-purple-500" />
                  ) : (
                    <Shield className="h-8 w-8 text-indigo-500" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">
                      {item.caseNumber} - {item.incidentType}
                    </p>
                    <p className="text-sm text-gray-500">
                      Reported on {new Date(item.reportDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Link href={`/dashboard/blotter/${item.id}`}>
                    <Button variant="ghost" size="sm" className="gap-1">
                      View <ArrowRight size={14} />
                    </Button>
                  </Link>
                </div>
              ))}

              {data.cases.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No recent cases found
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
} 