"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";
import { toast } from "sonner";

interface Certificate {
  controlNumber: string;
  type: 'clearance' | 'residency' | 'business' | 'indigency';
  residentName: string;
  purpose: string;
  issuedDate: string;
  status: 'valid' | 'expired' | 'revoked';
}

export default function CertificateTrackingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<Certificate | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // This would normally come from a database, but for demo we'll use localStorage
  const searchCertificate = (controlNumber: string) => {
    setIsSearching(true);
    
    // Simulate API call
    setTimeout(() => {
      const storedCertificates = localStorage.getItem("issuedCertificates");
      const certificates: Certificate[] = storedCertificates ? JSON.parse(storedCertificates) : [];
      
      const certificate = certificates.find(cert => cert.controlNumber === controlNumber);
      
      if (certificate) {
        setSearchResult(certificate);
      } else {
        setSearchResult(null);
        toast.error("Certificate not found", {
          description: "No certificate found with the provided control number."
        });
      }
      
      setIsSearching(false);
    }, 500);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast.error("Please enter a control number");
      return;
    }
    searchCertificate(searchQuery.trim());
  };

  const getStatusColor = (status: Certificate['status']) => {
    switch (status) {
      case 'valid':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'expired':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'revoked':
        return 'text-red-600 bg-red-50 border-red-200';
    }
  };

  const formatCertificateType = (type: Certificate['type']) => {
    switch (type) {
      case 'clearance':
        return 'Barangay Clearance';
      case 'residency':
        return 'Certificate of Residency';
      case 'business':
        return 'Business Permit';
      case 'indigency':
        return 'Certificate of Indigency';
    }
  };

  return (
    <div className="bg-[#f9f9f0] border-b">
      <div className="container mx-auto py-6 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-[#006B5E] mb-2">Certificate Verification</h2>
          <p className="text-muted-foreground mb-6">
            Enter the control number to verify a certificate's authenticity and view its details.
          </p>

          <form onSubmit={handleSearch} className="flex gap-2 mb-6">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter control number (e.g., BRGY-2024-0001)"
              className="flex-1"
            />
            <Button 
              type="submit" 
              disabled={isSearching}
              className="bg-[#006B5E] hover:bg-[#005046]"
            >
              {isSearching ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Verify
                </>
              )}
            </Button>
          </form>

          {searchResult && (
            <Card>
              <CardHeader>
                <CardTitle>Certificate Details</CardTitle>
                <CardDescription>
                  Verification result for control number: {searchResult.controlNumber}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Certificate Type</p>
                    <p className="text-lg">{formatCertificateType(searchResult.type)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <p className={`inline-block px-2 py-1 rounded-md text-sm font-medium border ${getStatusColor(searchResult.status)}`}>
                      {searchResult.status.charAt(0).toUpperCase() + searchResult.status.slice(1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Resident Name</p>
                    <p className="text-lg">{searchResult.residentName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Date Issued</p>
                    <p className="text-lg">{new Date(searchResult.issuedDate).toLocaleDateString()}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-muted-foreground">Purpose</p>
                    <p className="text-lg">{searchResult.purpose}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
