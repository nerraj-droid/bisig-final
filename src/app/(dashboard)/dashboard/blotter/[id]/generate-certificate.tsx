"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { FileText, Download, Loader2 } from "lucide-react";
import { BlotterCaseStatus } from "@/lib/enums";

interface GenerateCertificateProps {
  caseId: string;
  caseNumber: string;
  currentStatus: BlotterCaseStatus;
  certificationDate?: Date | null;
}

export default function GenerateCertificate({
  caseId,
  caseNumber,
  currentStatus,
  certificationDate,
}: GenerateCertificateProps) {
  const [open, setOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Check if the certificate can be generated (only for CERTIFIED or EXTENDED status)
  const canGenerateCertificate = 
    currentStatus === BlotterCaseStatus.CERTIFIED || 
    currentStatus === BlotterCaseStatus.EXTENDED;
  
  const handleGenerateCertificate = async () => {
    setIsGenerating(true);
    
    try {
      const response = await fetch(`/api/blotter/${caseId}/certificate`, {
        method: "POST",
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate certificate");
      }
      
      // Handle the PDF download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `${caseNumber}-certification.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success("Certificate generated successfully");
      setOpen(false);
    } catch (error) {
      console.error("Error generating certificate:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate certificate");
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
        disabled={!canGenerateCertificate}
        onClick={() => setOpen(true)}
      >
        <FileText className="h-4 w-4" />
        {currentStatus === BlotterCaseStatus.CERTIFIED ? "Download CFA" : "Issue CFA"}
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentStatus === BlotterCaseStatus.CERTIFIED
                ? "Download Certification to File Action"
                : "Issue Certification to File Action"}
            </DialogTitle>
            <DialogDescription>
              {currentStatus === BlotterCaseStatus.CERTIFIED ? (
                <>
                  This Certification to File Action (CFA) was issued on{" "}
                  {certificationDate
                    ? new Date(certificationDate).toLocaleDateString()
                    : "an unspecified date"}.
                </>
              ) : (
                <>
                  This action will issue a Certification to File Action (CFA) and update the case status.
                  This document certifies that the parties failed to reach a settlement after the 
                  prescribed period for amicable resolution.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="rounded-md bg-amber-50 p-4 border border-amber-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FileText className="h-5 w-5 text-amber-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-amber-800">What is a CFA?</h3>
                  <div className="mt-2 text-sm text-amber-700">
                    <p>
                      A Certification to File Action (CFA) is issued when:
                    </p>
                    <ul className="list-disc space-y-1 pl-5 mt-2">
                      <li>The parties failed to settle the case after mediation and conciliation</li>
                      <li>The prescribed 15-day extension period has been exhausted</li>
                      <li>This certificate allows the complainant to file a case in court</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleGenerateCertificate} 
              disabled={isGenerating}
              className="gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  {currentStatus === BlotterCaseStatus.CERTIFIED ? "Download" : "Generate"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 