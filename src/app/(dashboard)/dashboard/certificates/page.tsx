"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import CertificateTrackingPage from "./tracking/page";
import Link from "next/link";
import { FileText, PlusCircle, Award, FileCheck, ScrollText, ArrowRightCircle, HelpCircle, CheckCircle2 } from "lucide-react";

export default function CertificatesPage() {
  // Sample certificate types for quick access
  const certificateTypes = [
    {
      value: "clearance",
      label: "Barangay Clearance",
      icon: <FileCheck className="h-8 w-8 text-amber-500 mb-2" />,
      description: "General purpose clearance for residents"
    },
    {
      value: "residency",
      label: "Certificate of Residency",
      icon: <Award className="h-8 w-8 text-emerald-500 mb-2" />,
      description: "Proof of residency in the barangay"
    },
    {
      value: "business",
      label: "Business Permit",
      icon: <ScrollText className="h-8 w-8 text-blue-500 mb-2" />,
      description: "Permit for business operations"
    }
  ];

  // Tips for certificate generation
  const certificateTips = [
    "Verify resident information before generating certificates",
    "Clear purpose statements make certificates more effective",
    "Preview certificates before final generation",
    "Keep digital copies of all issued certificates"
  ];

  return (
    <div className="flex flex-col">
      <CertificateTrackingPage />
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#006B5E]">Certificates</h1>
          <p className="text-muted-foreground">
            Generate official barangay certificates for residents
          </p>
        </div>

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
                <Button asChild className="bg-[#006B5E] hover:bg-[#005046] text-white py-6 px-6 shadow-sm w-full sm:w-auto">
                  <Link href="/dashboard/certificates/new" className="flex items-center justify-center">
                    <PlusCircle className="mr-2 h-5 w-5" /> Create New Certificate
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tips Card instead of Statistics */}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {certificateTypes.map((cert) => (
              <Card key={cert.value} className="border border-muted hover:border-[#006B5E] hover:shadow-md transition-all cursor-pointer group">
                <Link href={`/dashboard/certificates/new?type=${cert.value}`}>
                  <CardHeader>
                    <div className="flex flex-col items-center">
                      {cert.icon}
                      <CardTitle className="text-lg group-hover:text-[#006B5E]">{cert.label}</CardTitle>
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
      </div>
    </div>
  );
}
