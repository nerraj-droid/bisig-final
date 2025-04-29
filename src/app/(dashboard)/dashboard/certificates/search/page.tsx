"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Search, FileText, Download, Eye } from "lucide-react";
import { format } from "date-fns";

export default function CertificateSearchPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [certificateType, setCertificateType] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // Mock data for certificates
  const mockCertificates = [
    {
      id: "CERT-001",
      residentName: "Juan Dela Cruz",
      type: "Barangay Clearance",
      purpose: "Employment",
      issuedDate: new Date(2023, 10, 15),
      status: "Completed"
    },
    {
      id: "CERT-002",
      residentName: "Maria Santos",
      type: "Certificate of Residency",
      purpose: "School Enrollment",
      issuedDate: new Date(2023, 10, 10),
      status: "Completed"
    },
    {
      id: "CERT-003",
      residentName: "Pedro Reyes",
      type: "Indigency Certificate",
      purpose: "Medical Assistance",
      issuedDate: new Date(2023, 10, 5),
      status: "Completed"
    },
    {
      id: "CERT-004",
      residentName: "Ana Magtanggol",
      type: "Business Permit",
      purpose: "Business Registration",
      issuedDate: new Date(2023, 9, 28),
      status: "Completed"
    },
    {
      id: "CERT-005",
      residentName: "Roberto Lim",
      type: "Certification to File Action",
      purpose: "Legal Proceedings",
      issuedDate: new Date(2023, 9, 20),
      status: "Completed"
    }
  ];

  // Filter the certificates based on search query and filters
  const filteredCertificates = mockCertificates.filter(cert => {
    // Filter by search query (name or ID)
    const matchesSearch = searchQuery === "" || 
      cert.residentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by certificate type
    const matchesType = certificateType === "" || cert.type === certificateType;
    
    // Filter by date (this is simplified - would need more logic for real date filtering)
    const matchesDate = dateFilter === "" || true; // Placeholder for date filtering
    
    return matchesSearch && matchesType && matchesDate;
  });

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          className="mr-2 p-0 h-8 w-8" 
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold text-[#006B5E]">Certificate Search</h1>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <Search className="mr-2 h-5 w-5" /> Find Certificates
          </CardTitle>
          <CardDescription>
            Search for certificates by resident name, certificate ID, type, or date
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <Input
                placeholder="Search by name or certificate ID"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <Select value={certificateType} onValueChange={setCertificateType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Certificate Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Certificate Types</SelectItem>
                  <SelectItem value="Barangay Clearance">Barangay Clearance</SelectItem>
                  <SelectItem value="Certificate of Residency">Certificate of Residency</SelectItem>
                  <SelectItem value="Business Permit">Business Permit</SelectItem>
                  <SelectItem value="Indigency Certificate">Indigency Certificate</SelectItem>
                  <SelectItem value="Certification to File Action">Certification to File Action</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Any Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any Date</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Certificate Records
          </CardTitle>
          <CardDescription>
            {filteredCertificates.length} certificates found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Certificate ID</TableHead>
                <TableHead>Resident Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Issued Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCertificates.map((cert) => (
                <TableRow key={cert.id}>
                  <TableCell className="font-medium">{cert.id}</TableCell>
                  <TableCell>{cert.residentName}</TableCell>
                  <TableCell>{cert.type}</TableCell>
                  <TableCell>{cert.purpose}</TableCell>
                  <TableCell>{format(cert.issuedDate, 'MMM dd, yyyy')}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      {cert.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 