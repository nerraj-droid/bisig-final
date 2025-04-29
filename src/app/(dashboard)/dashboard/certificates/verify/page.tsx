"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, Scale, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface Certificate {
  id: string;
  controlNumber: string;
  type: 'RESIDENCY' | 'INDIGENCY' | 'CLEARANCE' | 'BUSINESS_PERMIT' | 'CFA';
  residentName?: string;
  residentId?: string;
  complainantName?: string;
  respondentName?: string;
  caseNumber?: string;
  purpose: string;
  issuedDate: string;
  status: 'valid' | 'expired' | 'revoked';
  certificationDate?: string;
}

export default function VerifyCertificatePage() {
  const [controlNumber, setControlNumber] = useState("");
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async () => {
    if (!controlNumber.trim()) {
      toast.error("Please enter a control number");
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/certificates?controlNumber=${controlNumber}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch certificate");
      }
      
      const data = await response.json();
      
      if (!data || data.error) {
        toast.error("Certificate not found", {
          description: "No certificate found with the provided control number."
        });
        setCertificate(null);
        return;
      }
      
      setCertificate(data);
      toast.success("Certificate verified successfully");
    } catch (error) {
      console.error("Error verifying certificate:", error);
      toast.error("Verification failed", {
        description: "There was an error verifying this certificate."
      });
      setCertificate(null);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCertificateType = (type: Certificate['type']) => {
    switch (type) {
      case 'CLEARANCE':
        return 'Barangay Clearance';
      case 'RESIDENCY':
        return 'Certificate of Residency';
      case 'BUSINESS_PERMIT':
        return 'Business Permit';
      case 'INDIGENCY':
        return 'Certificate of Indigency';
      case 'CFA':
        return 'Certification to File Action';
      default:
        return type;
    }
  };

  const getStatusIcon = (status: Certificate['status']) => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'expired':
        return <AlertCircle className="h-6 w-6 text-yellow-500" />;
      case 'revoked':
        return <XCircle className="h-6 w-6 text-red-500" />;
      default:
        return null;
    }
  };

  const getCertificateTypeIcon = (type: Certificate['type']) => {
    switch (type) {
      case 'CFA':
        return <Scale className="h-6 w-6 text-[#006B5E]" />;
      default:
        return <FileText className="h-6 w-6 text-[#006B5E]" />;
    }
  };
  
  const getStatusColor = (status: Certificate['status']) => {
    switch (status) {
      case 'valid':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'expired':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'revoked':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return '';
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#006B5E]">Verify Certificate</h1>
        <p className="text-muted-foreground">
          Enter a certificate control number to verify its authenticity
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Certificate Verification</CardTitle>
          <CardDescription>
            Enter the control number found on the certificate
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              value={controlNumber}
              onChange={(e) => setControlNumber(e.target.value)}
              placeholder="e.g., BRGY-2024-1234 or CFA-2024-5678"
              className="flex-1"
            />
            <Button
              onClick={handleVerify}
              disabled={isLoading}
              className="bg-[#006B5E] hover:bg-[#005046]"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Verify Certificate
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {certificate && (
        <Card>
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                {getCertificateTypeIcon(certificate.type)}
                <CardTitle>{formatCertificateType(certificate.type)}</CardTitle>
              </div>
              <CardDescription>
                Control Number: {certificate.controlNumber}
              </CardDescription>
            </div>
            <Badge
              className={`px-3 py-1 ${getStatusColor(certificate.status)}`}
            >
              {getStatusIcon(certificate.status)}
              <span className="ml-1 capitalize">{certificate.status}</span>
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {certificate.type === 'CFA' ? (
              // CFA-specific details
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Case Details</h3>
                    <p className="text-lg">{certificate.caseNumber}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Parties</h3>
                    <div className="space-y-1">
                      <p><span className="font-medium">Complainant:</span> {certificate.complainantName}</p>
                      <p><span className="font-medium">Respondent:</span> {certificate.respondentName}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Purpose</h3>
                    <p>{certificate.purpose}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Certification Date</h3>
                    <p>{certificate.certificationDate ? format(new Date(certificate.certificationDate), "MMMM d, yyyy") : "N/A"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Issue Date</h3>
                    <p>{certificate.issuedDate ? format(new Date(certificate.issuedDate), "MMMM d, yyyy") : "N/A"}</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded border border-blue-200 mt-4">
                    <p className="text-sm text-blue-800">
                      This certification is issued pursuant to Section 412 of the Local Government Code of 1991 
                      to enable the complainant to file the appropriate action in court.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              // Regular certificate details
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Resident Name</h3>
                    <p className="text-lg">{certificate.residentName}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Purpose</h3>
                    <p>{certificate.purpose}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Issue Date</h3>
                  <p>{certificate.issuedDate ? format(new Date(certificate.issuedDate), "MMMM d, yyyy") : "N/A"}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
