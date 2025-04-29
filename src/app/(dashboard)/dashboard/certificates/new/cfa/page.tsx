"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectLabel,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { toast } from "sonner";
import CertificationToFileAction from "../../components/certificate-templates/CertificationToFileAction";
import { FileText, Save, ArrowLeft, Printer } from "lucide-react";

// Define types for blotter case and party
interface BlotterParty {
  id: string;
  partyType: "COMPLAINANT" | "RESPONDENT" | "WITNESS";
  firstName: string;
  middleName?: string;
  lastName: string;
}

interface BlotterCase {
  id: string;
  caseNumber: string;
  incidentType: string;
  incidentDescription: string;
  incidentDate: string;
  parties: BlotterParty[];
  status: "ESCALATED" | "CERTIFIED" | string;
}

// Define form schema
const formSchema = z.object({
  caseNumber: z.string().min(1, "Case number is required"),
  caseTitle: z.string().min(1, "Case title is required"),
  complainantName: z.string().min(1, "Complainant name is required"),
  respondentName: z.string().min(1, "Respondent name is required"),
  incidentDescription: z.string().min(1, "Incident description is required"),
  incidentDate: z.string().min(1, "Incident date is required"),
  barangayName: z.string().min(1, "Barangay name is required"),
  punongBarangay: z.string().min(1, "Punong Barangay name is required"),
});

export default function GenerateCFAPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const caseId = searchParams.get('caseId');
  const [showPreview, setShowPreview] = useState(false);
  const [controlNumber, setControlNumber] = useState("");
  const [blotterCases, setBlotterCases] = useState<BlotterCase[]>([]);
  const [selectedCase, setSelectedCase] = useState<BlotterCase | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      caseNumber: "",
      caseTitle: "",
      complainantName: "",
      respondentName: "",
      incidentDescription: "",
      incidentDate: new Date().toISOString().split("T")[0],
      barangayName: "",
      punongBarangay: "",
    },
  });

  // Generate control number
  useEffect(() => {
    const generateControlNumber = () => {
      const prefix = "CFA";
      const year = new Date().getFullYear();
      const randomDigits = Math.floor(1000 + Math.random() * 9000);
      return `${prefix}-${year}-${randomDigits}`;
    };

    setControlNumber(generateControlNumber());
  }, []);

  // Fetch unresolved blotter cases
  useEffect(() => {
    const fetchCases = async () => {
      try {
        const response = await fetch("/api/blotter?status=ESCALATED,CERTIFIED");
        if (response.ok) {
          const data = await response.json();
          setBlotterCases(data);
        }
      } catch (error) {
        console.error("Error fetching blotter cases:", error);
        toast.error("Failed to load blotter cases");
      }
    };

    fetchCases();
  }, []);

  // Fetch barangay info
  useEffect(() => {
    const fetchBarangayInfo = async () => {
      try {
        const response = await fetch("/api/certificates/barangay-info");
        if (response.ok) {
          const data = await response.json();
          form.setValue("barangayName", data.name || "");
          
          // Fetch council members to get Punong Barangay
          const councilResponse = await fetch("/api/certificates/council-members");
          if (councilResponse.ok) {
            const councilData = await councilResponse.json();
            const captain = councilData.find((member: any) => 
              member.position.toLowerCase().includes("captain") || 
              member.position.toLowerCase().includes("punong")
            );
            if (captain) {
              form.setValue("punongBarangay", captain.name);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching barangay info:", error);
      }
    };

    fetchBarangayInfo();
  }, [form]);

  // Load case data if caseId is provided in URL
  useEffect(() => {
    if (caseId) {
      handleCaseSelect(caseId);
    }
  }, [caseId, blotterCases]);

  // Handle case selection
  const handleCaseSelect = async (caseId: string) => {
    if (!caseId) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/blotter/${caseId}`);
      if (response.ok) {
        const caseData = await response.json() as BlotterCase;
        setSelectedCase(caseData);
        
        // Find complainant and respondent
        const complainant = caseData.parties.find(party => party.partyType === "COMPLAINANT");
        const respondent = caseData.parties.find(party => party.partyType === "RESPONDENT");
        
        if (!complainant || !respondent) {
          toast.warning("Case is missing complainant or respondent data");
        }
        
        form.setValue("caseNumber", caseData.caseNumber);
        form.setValue("caseTitle", `${complainant?.lastName || ""} vs. ${respondent?.lastName || ""}`);
        form.setValue("complainantName", `${complainant?.firstName || ""} ${complainant?.middleName ? complainant.middleName[0] + '. ' : ''}${complainant?.lastName || ""}`);
        form.setValue("respondentName", `${respondent?.firstName || ""} ${respondent?.middleName ? respondent.middleName[0] + '. ' : ''}${respondent?.lastName || ""}`);
        form.setValue("incidentDescription", caseData.incidentDescription);
        
        // Format incident date 
        if (caseData.incidentDate) {
          const formattedDate = caseData.incidentDate.split("T")[0];
          form.setValue("incidentDate", formattedDate);
        }
        
        toast.success("Case information loaded successfully");
      } else {
        toast.error("Failed to load case details. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching case details:", error);
      toast.error("Failed to load case details. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      
      // Create certificate record
      const certificateData = {
        ...values,
        certificationDate: new Date().toISOString(),
        controlNumber,
        status: "valid",
        type: "CFA",
      };
      
      console.log("Submitting certificate data:", certificateData);
      
      try {
        // Save certificate to database
        const response = await fetch("/api/certificates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(certificateData),
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          console.error("API error response:", response.status, errorData);
          throw new Error(`Failed to save certificate: ${response.status} ${response.statusText}`);
        }
        
        // If associated with a case, update the case status
        if (selectedCase) {
          const statusResponse = await fetch(`/api/blotter/${selectedCase.id}/status`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              status: "CERTIFIED",
              certificationDate: new Date().toISOString() 
            }),
          });
          
          if (!statusResponse.ok) {
            console.warn("Failed to update case status, but certificate was created");
          }
        }
        
        toast.success("Certificate has been generated successfully");
      } catch (saveError) {
        console.error("Error saving to database:", saveError);
        toast.error("Failed to save to database, but you can still preview the certificate");
        // Even if saving to DB fails, we'll still show the preview
      }
      
      // Always show preview even if saving failed
      setShowPreview(true);
    } catch (error) {
      console.error("Error generating certificate:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate certificate");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };
  
  const handleSaveAndDownload = async () => {
    try {
      setIsLoading(true);
      // Trigger print dialog
      window.print();
      
      // Simulate PDF download completion
      setTimeout(() => {
        toast.success("Certificate saved and ready for printing");
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error saving certificate:", error);
      toast.error("Failed to save certificate");
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.back()}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#006B5E]">
          <FileText className="inline mr-2 mb-1" size={28} />
          Generate Certification to File Action
        </h1>
        <p className="text-muted-foreground">
          Create a certification allowing a complainant to file an action in court
        </p>
      </div>

      {showPreview ? (
        <div className="space-y-4">
          <div className="flex justify-end space-x-4 print:hidden">
            <Button 
              onClick={handleSaveAndDownload} 
              className="bg-[#006B5E] hover:bg-[#005046]"
              disabled={isLoading}
            >
              <Printer className="mr-2 h-4 w-4" /> {isLoading ? "Processing..." : "Save & Print"}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowPreview(false)}
            >
              Edit Information
            </Button>
          </div>
          
          <div className="certificate-preview bg-white rounded-md shadow-md p-2 min-h-[29.7cm]">
            <CertificationToFileAction
              caseNumber={form.getValues("caseNumber")}
              caseTitle={form.getValues("caseTitle")}
              complainantName={form.getValues("complainantName")}
              respondentName={form.getValues("respondentName")}
              incidentDescription={form.getValues("incidentDescription")}
              incidentDate={form.getValues("incidentDate")}
              certificationDate={new Date().toISOString()}
              barangayName={form.getValues("barangayName")}
              punongBarangay={form.getValues("punongBarangay")}
              controlNumber={controlNumber}
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Certification Details</CardTitle>
              <CardDescription>
                Enter the information needed for the certification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="barangayName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Barangay Name</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={isLoading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="punongBarangay"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Punong Barangay</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={isLoading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="border-t pt-4">
                    <FormLabel className="block mb-2">Select Blotter Case</FormLabel>
                    <Select onValueChange={handleCaseSelect} disabled={isLoading}>
                      <SelectTrigger>
                        <SelectValue placeholder={isLoading ? "Loading cases..." : "Select a case"} />
                      </SelectTrigger>
                      <SelectContent>
                        {blotterCases.length === 0 ? (
                          <SelectItem value="no-cases" disabled>No eligible cases found</SelectItem>
                        ) : (
                          <>
                            <SelectLabel>Escalated Cases</SelectLabel>
                            {blotterCases
                              .filter(c => c.status === "ESCALATED")
                              .map((blotterCase) => (
                                <SelectItem key={blotterCase.id} value={blotterCase.id}>
                                  {blotterCase.caseNumber} - {blotterCase.incidentType} 
                                  ({blotterCase.parties.find(p => p.partyType === "COMPLAINANT")?.lastName || ""} vs. {blotterCase.parties.find(p => p.partyType === "RESPONDENT")?.lastName || ""})
                                </SelectItem>
                              ))}
                            
                            <SelectLabel>Certified Cases</SelectLabel>
                            {blotterCases
                              .filter(c => c.status === "CERTIFIED")
                              .map((blotterCase) => (
                                <SelectItem key={blotterCase.id} value={blotterCase.id}>
                                  {blotterCase.caseNumber} - {blotterCase.incidentType}
                                </SelectItem>
                              ))}
                          </>
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select an existing blotter case to auto-fill the form, or manually enter the details below
                    </FormDescription>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="caseNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Case Number</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={isLoading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="caseTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Case Title</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., Santos vs. Reyes" disabled={isLoading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="complainantName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Complainant Name</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={isLoading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="respondentName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Respondent Name</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={isLoading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="incidentDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Incident Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} disabled={isLoading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="incidentDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Incident Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            rows={4}
                            placeholder="Describe the incident or dispute"
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      className="bg-[#006B5E] hover:bg-[#005046]"
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" /> Generate Certificate
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Certificate Information</CardTitle>
              <CardDescription>Details about this certificate</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium">Control Number</h3>
                <p className="text-lg font-mono">{controlNumber}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium">Certificate Type</h3>
                <p>Certification to File Action (CFA)</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium">Issue Date</h3>
                <p>{format(new Date(), "MMMM d, yyyy")}</p>
              </div>
              
              <div className="bg-amber-50 p-3 rounded-md border border-amber-200">
                <h3 className="text-sm font-medium text-amber-800">Purpose</h3>
                <p className="text-sm text-amber-700">
                  This certification enables complainants to file their case in the appropriate court 
                  after the barangay conciliation process has been completed without resolution.
                </p>
              </div>
              
              {selectedCase && (
                <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                  <h3 className="text-sm font-medium text-blue-800">Case Status</h3>
                  <p className="text-sm text-blue-700">
                    This blotter case (#{selectedCase.caseNumber}) will be marked as "CERTIFIED" 
                    once the CFA is generated.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 