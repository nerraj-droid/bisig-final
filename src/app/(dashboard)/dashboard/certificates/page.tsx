"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CertificateTrackingPage from "./tracking/page";
import Link from "next/link";
import {
  FileText,
  PlusCircle,
  Award,
  FileCheck,
  ScrollText,
  ArrowRightCircle,
  HelpCircle,
  CheckCircle2,
  Clock,
  Calendar,
  TrendingUp,
  Users,
  Settings
} from "lucide-react";
import { CertificateType } from "@prisma/client";

interface CertificateStats {
  total: number;
  pending: number;
  released: number;
  byType: Array<{
    type: CertificateType;
    count: number;
  }>;
}

export default function CertificatesPage() {
  const [stats, setStats] = useState<CertificateStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Load certificate statistics
  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch('/api/certificates?stats=true');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading certificate stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sample certificate types for quick access
  const certificateTypes = [
    {
      value: "clearance",
      label: "Barangay Clearance",
      icon: <FileCheck className="h-8 w-8 text-amber-500 mb-2" />,
      description: "General purpose clearance for residents",
      type: "CLEARANCE" as CertificateType
    },
    {
      value: "residency",
      label: "Certificate of Residency",
      icon: <Award className="h-8 w-8 text-emerald-500 mb-2" />,
      description: "Proof of residency in the barangay",
      type: "RESIDENCY" as CertificateType
    },
    {
      value: "business",
      label: "Business Permit",
      icon: <ScrollText className="h-8 w-8 text-blue-500 mb-2" />,
      description: "Permit for business operations",
      type: "BUSINESS_PERMIT" as CertificateType
    },
    {
      value: "indigency",
      label: "Certificate of Indigency",
      icon: <FileText className="h-8 w-8 text-purple-500 mb-2" />,
      description: "Certification for indigent residents",
      type: "INDIGENCY" as CertificateType
    }
  ];

  // Tips for certificate generation
  const certificateTips = [
    "Verify resident information before generating certificates",
    "Clear purpose statements make certificates more effective",
    "Preview certificates before final generation",
    "Keep digital copies of all issued certificates",
    "Use proper templates for official documents",
    "Ensure all required signatures are included"
  ];

  // Format certificate type name
  const formatCertificateType = (type: CertificateType) => {
    const typeMap = {
      CLEARANCE: 'Barangay Clearance',
      RESIDENCY: 'Certificate of Residency',
      BUSINESS_PERMIT: 'Business Permit',
      INDIGENCY: 'Certificate of Indigency',
      CFA: 'Certification to File Action',
    };
    return typeMap[type] || type;
  };

  return (
    <div className="flex flex-col">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="verification">Verification</TabsTrigger>
          <TabsTrigger value="management">Management</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="p-6">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-[#006B5E]">Certificate System</h1>
              <p className="text-muted-foreground">
                Generate and manage official barangay certificates for residents
              </p>
            </div>

            {/* Statistics Cards */}
            {stats && !loading && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <Card className="border-l-4 border-l-[#006B5E]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Certificates</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-[#006B5E]">{stats.total}</div>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-yellow-500">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-green-500">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Released</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{stats.released}</div>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Success Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {stats.total > 0 ? Math.round((stats.released / stats.total) * 100) : 0}%
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Certificate Generation Card */}
              <Card className="lg:col-span-2 border-t-4 border-t-[#006B5E] shadow-md hover:shadow-lg transition-all">
                <CardHeader className="bg-gradient-to-r from-[#e9f7f5] to-white pb-6">
                  <CardTitle className="text-2xl flex items-center text-[#006B5E]">
                    <FileText className="mr-3 h-7 w-7" /> Generate Certificate
                  </CardTitle>
                  <CardDescription className="text-base">
                    Create a new official certificate for a resident
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-6 pt-3 pb-6">
                  <div className="p-6 bg-muted/30 rounded-lg border border-muted">
                    <h3 className="text-lg font-medium mb-3 text-[#006B5E]">Creating a new certificate</h3>
                    <p className="text-muted-foreground mb-4">
                      Follow these steps to generate a new certificate for a resident:
                    </p>
                    <ol className="list-decimal pl-5 space-y-2 mb-6">
                      <li>Select the type of certificate from the dropdown</li>
                      <li>Search for and select the resident</li>
                      <li>Specify the purpose of the certificate</li>
                      <li>Preview and generate the final document</li>
                      <li>Save or print the certificate</li>
                    </ol>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button asChild className="bg-[#006B5E] hover:bg-[#005046] text-white py-6 px-6 shadow-sm flex-1">
                        <Link href="/dashboard/certificates/new" className="flex items-center justify-center">
                          <PlusCircle className="mr-2 h-5 w-5" /> Create New Certificate
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="py-6 px-6">
                        <Link href="/dashboard/certificates/manage" className="flex items-center justify-center">
                          <Settings className="mr-2 h-5 w-5" /> Manage Certificates
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tips Card */}
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <HelpCircle className="mr-2 h-5 w-5 text-[#006B5E]" /> Certificate Tips
                  </CardTitle>
                  <CardDescription>
                    Best practices for certificate generation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ul className="space-y-3">
                    {certificateTips.map((tip, index) => (
                      <li key={index} className="flex items-start p-2 rounded-lg border-b last:border-b-0">
                        <CheckCircle2 className="h-5 w-5 mr-2 text-[#006B5E] flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Quick Access Certificate Types */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4 text-[#006B5E] flex items-center">
                Quick Access Certificates
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {certificateTypes.map((cert) => (
                  <Card key={cert.value} className="border border-muted hover:border-[#006B5E] hover:shadow-md transition-all cursor-pointer group">
                    <Link href={`/dashboard/certificates/new?type=${cert.value}`}>
                      <CardHeader>
                        <div className="flex flex-col items-center">
                          {cert.icon}
                          <CardTitle className="text-lg group-hover:text-[#006B5E] text-center">{cert.label}</CardTitle>
                        </div>
                        <CardDescription className="text-center">{cert.description}</CardDescription>
                      </CardHeader>
                      <CardFooter className="pt-0 pb-4 flex justify-center">
                        <Button variant="ghost" className="text-[#006B5E] group-hover:bg-[#e9f7f5]">
                          <ArrowRightCircle className="h-4 w-4 mr-2" /> Create
                        </Button>
                      </CardFooter>
                    </Link>
                  </Card>
                ))}
              </div>
            </div>

            {/* Certificate Type Statistics */}
            {stats && stats.byType.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4 text-[#006B5E] flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Certificate Distribution
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stats.byType.map((typeStats) => (
                    <Card key={typeStats.type} className="border border-muted">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          {formatCertificateType(typeStats.type)}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="text-2xl font-bold text-[#006B5E]">{typeStats.count}</div>
                          <Badge variant="secondary">
                            {stats.total > 0 ? Math.round((typeStats.count / stats.total) * 100) : 0}%
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="verification" className="space-y-6">
          <CertificateTrackingPage />
        </TabsContent>

        <TabsContent value="management" className="space-y-6">
          <div className="p-6">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-[#006B5E]">Certificate Management</h2>
              <p className="text-muted-foreground">
                Access the full certificate management system to view, edit, and manage all certificates.
              </p>
              <Button asChild className="bg-[#006B5E] hover:bg-[#005046]">
                <Link href="/dashboard/certificates/manage">
                  <Settings className="mr-2 h-4 w-4" />
                  Open Certificate Management
                </Link>
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
