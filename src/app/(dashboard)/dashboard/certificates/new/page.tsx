"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CertificateGenerator } from "../components/CertificateGenerator";
import { CertificateEditor } from "../components/CertificateEditor";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Resident {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  address: string;
  civilStatus: string;
  // Add other fields as needed
}

// Default template data for each certificate type
const getDefaultTemplateData = (type: string) => {
  const baseTemplate = {
    title: "",
    content: "",
    footer: "This certificate is issued upon the request of the above-named person for whatever legal purpose it may serve.",
    paperSize: "letter",
    orientation: "portrait",
    margins: { top: 20, right: 20, bottom: 20, left: 20 },
    showBorder: true,
    borderWidth: 1,
    showLogo: true,
    logoUrl: "",
    showWatermark: false,
    watermarkUrl: "",
    watermarkOpacity: 0.1,
    showSignatures: true,
    showQRCode: true,
    signatures: {
      punongBarangay: "",
      secretary: ""
    }
  };

  switch (type) {
    case "clearance":
      return {
        ...baseTemplate,
        title: "BARANGAY CLEARANCE",
        content: "This is to certify that {residentName}, of legal age, {civilStatus}, Filipino, and a resident of {address} is a person of good moral character and has no derogatory record on file in this Barangay."
      };
    case "residency":
      return {
        ...baseTemplate,
        title: "CERTIFICATE OF RESIDENCY",
        content: "This is to certify that {residentName}, of legal age, {civilStatus}, Filipino, is a bonafide resident of {address} for more than six (6) months."
      };
    case "indigency":
      return {
        ...baseTemplate,
        title: "CERTIFICATE OF INDIGENCY",
        content: "This is to certify that {residentName}, of legal age, {civilStatus}, Filipino, and a resident of {address} is an INDIGENT member of this Barangay."
      };
    case "business":
      return {
        ...baseTemplate,
        title: "BUSINESS PERMIT",
        content: "This is to certify that {businessName} owned and operated by {ownerName}, located at {address} is hereby granted permission to operate within the jurisdiction of this Barangay."
      };
    default:
      return baseTemplate;
  }
};

export default function NewCertificatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  const residentId = searchParams.get("residentId");
  const editMode = searchParams.get("edit") === "true";
  
  const [resident, setResident] = useState<Resident | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(editMode ? "edit" : "preview");
  const [templateData, setTemplateData] = useState<any>(null);
  
  useEffect(() => {
    // Load saved template data from localStorage if available
    const loadTemplateData = () => {
      if (!type) return;
      
      try {
        const savedTemplate = localStorage.getItem(`certificate-template-${type}`);
        if (savedTemplate) {
          setTemplateData(JSON.parse(savedTemplate));
        } else {
          setTemplateData(getDefaultTemplateData(type));
        }
      } catch (err) {
        console.error('Error loading template data:', err);
        setTemplateData(getDefaultTemplateData(type));
      }
    };
    
    loadTemplateData();
  }, [type]);
  
  useEffect(() => {
    const fetchResident = async () => {
      if (!residentId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/residents/${residentId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch resident data');
        }
        
        const data = await response.json();
        setResident(data);
      } catch (err) {
        console.error('Error fetching resident:', err);
        setError('Failed to load resident data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchResident();
  }, [residentId]);

  const handleSaveTemplate = (data: any) => {
    if (!type) return;
    
    try {
      // Save template to localStorage
      localStorage.setItem(`certificate-template-${type}`, JSON.stringify(data));
      setTemplateData(data);
      setActiveTab("preview");
      
      // Show success message or toast notification
      alert("Template saved successfully!");
    } catch (err) {
      console.error('Error saving template:', err);
      alert("Failed to save template. Please try again.");
    }
  };

  // Generate a unique control number
  const controlNumber = `BC-${new Date().getTime()}`;
  
  // This would typically come from your database
  const officials = templateData?.officials || {
    punongBarangay: "Hon. Sample Name",
    secretary: "John Doe",
    treasurer: "Jane Doe",
  };

  if (!type) {
    return <div className="p-6">Invalid certificate type</div>;
  }
  
  if (!templateData) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
        <div className="mt-8 space-y-4">
          <Skeleton className="h-96 w-full" />
          <div className="flex justify-end gap-4">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Prepare certificate data
  const certificateData = {
    residentName: resident 
      ? `${resident.firstName} ${resident.middleName ? resident.middleName + ' ' : ''}${resident.lastName}`
      : "Juan Dela Cruz",
    address: resident?.address || "123 Sample St., Barangay Sample",
    purpose: templateData.purpose || "Local Employment",
    controlNumber,
    officials,
    businessName: "Sample Business", // This would be relevant only for business permits
    ownerName: resident 
      ? `${resident.firstName} ${resident.lastName}`
      : "Sample Owner",
    civilStatus: resident?.civilStatus || "Single",
    // Add template customization properties
    templateSettings: {
      ...templateData,
      barangayName: "SAN VICENTE",
      district: "District 4",
      city: "Quezon City",
      barangayAddress: "11-O Maayusin Extn., Brgy. San Vicente, Diliman, Quezon City 1101",
      contactNumber: "02-4415644",
      // Add council members for the left sidebar
      councilMembers: [
        "RAUL NARCA",
        "MARIETTA PANABI",
        "WILFREDO REAL",
        "AURORA NOCOM",
        "FLORENCIO BONDOC, JR.",
        "JAMES NOEL ROJO",
        "ROGELIO DE LEON, JR.",
        "JOEL SALAMERO"
      ]
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Generate Certificate</h1>
        <p className="text-muted-foreground">
          {resident 
            ? `Creating certificate for ${resident.firstName} ${resident.lastName}`
            : "Preview and generate the certificate"
          }
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="preview">Preview Certificate</TabsTrigger>
          <TabsTrigger value="edit">Edit Template</TabsTrigger>
        </TabsList>
        
        <TabsContent value="preview" className="mt-0">
          <CertificateGenerator type={type as "clearance" | "residency" | "business" | "indigency"} data={certificateData} />
        </TabsContent>
        
        <TabsContent value="edit" className="mt-0">
          <CertificateEditor 
            initialData={templateData} 
            onSave={handleSaveTemplate} 
            onPreview={() => setActiveTab("preview")}
            certificateType={type}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
