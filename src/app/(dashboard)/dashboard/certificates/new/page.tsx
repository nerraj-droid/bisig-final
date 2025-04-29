"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CertificateGenerator } from "../components/CertificateGenerator";
import { CertificateEditor } from "../components/CertificateEditor";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FileText, ChevronLeft, Search, Printer, Check, Pencil, Save } from "lucide-react";
import Link from "next/link";

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
    },
    purpose: ""
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
        content: "This is to certify that {residentName}, of legal age, {civilStatus}, Filipino, is a bonafide resident of {address} for at least six (6) months.",
        validityMonths: 6
      };
    // case "indigency":
    //   return {
    //     ...baseTemplate,
    //     title: "CERTIFICATE OF INDIGENCY",
    //     content: "This is to certify that {residentName}, of legal age, {civilStatus}, Filipino, and a resident of {address} is an INDIGENT member of this Barangay."
    //   };
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
  const purposeFromUrl = searchParams.get("purpose");
  const editMode = searchParams.get("edit") === "true";

  const [resident, setResident] = useState<Resident | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(editMode ? "edit" : "preview");
  const [templateData, setTemplateData] = useState<any>(null);
  const [selectedType, setSelectedType] = useState<string>(type || "");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [purposeText, setPurposeText] = useState<string>(purposeFromUrl || "");
  const [additionalInfo, setAdditionalInfo] = useState<string>("");
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<Resident[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [manualEntryMode, setManualEntryMode] = useState(false);
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [manualResidentData, setManualResidentData] = useState<{
    firstName: string;
    middleName: string;
    lastName: string;
    address: string;
    civilStatus: string;
  }>({
    firstName: "",
    middleName: "",
    lastName: "",
    address: "",
    civilStatus: "Single"
  });

  const certificateTypes = [
    {
      value: "clearance",
      label: "Barangay Clearance",
      description: "General purpose clearance for residents",
    },
    {
      value: "residency",
      label: "Certificate of Residency",
      description: "Proof of residency in the barangay",
    },
    {
      value: "business",
      label: "Business Permit",
      description: "Permit for business operations",
    },
    // {
    //   value: "indigency",
    //   label: "Indigency Certificate",
    //   description: "Certification for indigent residents",
    // },
    {
      value: "cfa",
      label: "Certification to File Action",
      description: "Legal certification for court filing",
    },
  ];

  useEffect(() => {
    // Load saved template data from localStorage if available
    const loadTemplateData = () => {
      if (!selectedType) {
        setTemplateData(null);
        return;
      }

      try {
        const savedTemplate = localStorage.getItem(`certificate-template-${selectedType}`);
        if (savedTemplate) {
          setTemplateData(JSON.parse(savedTemplate));
        } else {
          setTemplateData(getDefaultTemplateData(selectedType));
        }
      } catch (err) {
        console.error('Error loading template data:', err);
        setTemplateData(getDefaultTemplateData(selectedType));
      }
    };

    loadTemplateData();
  }, [selectedType]);

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
    if (!selectedType) return;

    try {
      // Save template to localStorage
      localStorage.setItem(`certificate-template-${selectedType}`, JSON.stringify(data));
      setTemplateData(data);
      setShowTemplateEditor(false);

      // Show success message or toast notification
      alert("Template saved successfully!");
    } catch (err) {
      console.error('Error saving template:', err);
      alert("Failed to save template. Please try again.");
    }
  };

  const handleUpdateTemplate = (field: string, value: any) => {
    if (!templateData) return;
    
    setTemplateData({
      ...templateData,
      [field]: value
    });
  };

  // Generate a unique control number
  const controlNumber = `BC-${new Date().getTime()}`;

  // This would typically come from your database
  const officials = templateData?.officials || {
    punongBarangay: "Hon. Sample Name",
    secretary: "John Doe",
    treasurer: "Jane Doe",
  };

  // Add residency validation
  const validateResidency = async (residentId: string) => {
    try {
      const response = await fetch(`/api/residents/${residentId}/residency-duration`);
      if (!response.ok) {
        throw new Error('Failed to validate residency duration');
      }

      const data = await response.json();
      const residencyMonths = data.residencyMonths;

      if (selectedType === 'residency' && residencyMonths < 6) {
        setError('Resident must have lived in the barangay for at least 6 months to be eligible for a Certificate of Residency.');
        return false;
      }

      return true;
    } catch (err) {
      console.error('Error validating residency:', err);
      setError('Failed to validate residency duration. Please try again.');
      return false;
    }
  };

  // Format the purpose text for professional display in the certificate
  const formatPurpose = (purpose: string) => {
    if (!purpose) return "";

    // Trim whitespace and ensure proper form
    let formattedPurpose = purpose.trim();

    // Remove unnecessary prefixes like "for" or "for the purpose of"
    formattedPurpose = formattedPurpose
      .replace(/^for\s+the\s+purpose\s+of\s+/i, '')
      .replace(/^for\s+/i, '')
      .replace(/^to\s+be\s+used\s+for\s+/i, '')
      .replace(/^to\s+be\s+used\s+in\s+/i, '')
      .replace(/^to\s+/i, '');

    // Ensure the purpose starts with a capital letter
    if (formattedPurpose.length > 0) {
      formattedPurpose = formattedPurpose.charAt(0).toUpperCase() + formattedPurpose.slice(1);
    }

    // If the purpose doesn't end with punctuation, add a period
    const lastChar = formattedPurpose.slice(-1);
    if (!/[.!?]/.test(lastChar) && formattedPurpose.length > 0) {
      formattedPurpose += ".";
    }

    return formattedPurpose;
  };

  const handleCertificateTypeChange = (value: string) => {
    setSelectedType(value);
    router.push(`/dashboard/certificates/new?type=${value}${residentId ? `&residentId=${residentId}` : ''}${purposeText ? `&purpose=${encodeURIComponent(purposeText)}` : ''}`);
  };

  const handleResidentSearch = async () => {
    if (searchQuery.trim().length < 2) {
      setError("Please enter at least 2 characters to search");
      return;
    }
    
    setError(null);
    setSearchLoading(true);
    setShowResults(false);
    
    console.log("Searching for residents with query:", searchQuery);
    
    try {
      // Actual API call to search for residents
      const apiUrl = `/api/residents/search?query=${encodeURIComponent(searchQuery)}`;
      console.log("Calling API endpoint:", apiUrl);
      
      const response = await fetch(apiUrl);
      console.log("API response status:", response.status);
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("API returned data:", data);
      
      if (Array.isArray(data) && data.length > 0) {
        setSearchResults(data);
        setShowResults(true);
      } else {
        console.log("No results from API, using fallback mock data");
        // Fallback to mock data since API returned no results
        useMockData();
      }
    } catch (err) {
      console.error("Error searching residents:", err);
      console.log("Using fallback mock data due to API error");
      // Fallback to mock data due to API error
      useMockData();
    } finally {
      setSearchLoading(false);
    }
  };

  // Replace the snake case function with proper name formatting
  const formatName = (str: string): string => {
    if (!str) return '';
    
    // Handle empty string
    str = str.trim();
    if (str === '') return '';
    
    // Special case for names with prefixes like "de", "van", "von", "la", etc.
    const prefixes = ['de', 'van', 'von', 'der', 'den', 'la', 'le', 'du', 'da', 'del', 'dos', 'el', 'st', 'mc', 'mac'];
    
    return str.split(' ').map((part, index) => {
      // Handle hyphenated names like "Mary-Jane"
      if (part.includes('-')) {
        return part.split('-')
          .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase())
          .join('-');
      }
      
      // Convert to lowercase first to ensure consistent capitalization
      const lower = part.toLowerCase();
      
      // Check if this part is a prefix and not the first word
      if (index > 0 && prefixes.includes(lower)) {
        return lower;
      }
      
      // Special case for "Mc" and "Mac" prefixes (e.g., "McDonald" should be "McDonald")
      if (lower.startsWith('mc') && lower.length > 2) {
        return 'Mc' + lower.charAt(2).toUpperCase() + lower.slice(3);
      }
      
      if (lower.startsWith('mac') && lower.length > 3) {
        return 'Mac' + lower.charAt(3).toUpperCase() + lower.slice(4);
      }
      
      // Standard capitalization (first letter uppercase, rest lowercase)
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    }).join(' ');
  };

  // Function to generate and use mock data as fallback
  const useMockData = () => {
    const names = searchQuery.split(' ');
    const firstName = names[0] || "Juan";
    const lastName = names.length > 1 ? names[names.length - 1] : "Dela Cruz";
    const middleName = names.length > 2 ? names[1] : null;
    
    // Create properly formatted versions of the names
    const firstNameFormatted = formatName(firstName);
    const lastNameFormatted = formatName(lastName);
    const middleNameFormatted = middleName ? formatName(middleName) : null;
    
    // Create mock results
    const mockResults: Resident[] = [
      {
        id: `RES-001`,
        firstName: firstNameFormatted,
        middleName: middleNameFormatted,
        lastName: lastNameFormatted,
        address: "123 Sample St., Barangay Sample",
        civilStatus: "Single"
      },
      {
        id: `RES-002`,
        firstName: firstNameFormatted,
        middleName: null,
        lastName: `${lastNameFormatted} Jr.`,
        address: "456 Another St., Barangay Sample",
        civilStatus: "Married"
      }
    ];
    
    console.log("Generated mock data with properly formatted names:", mockResults);
    setSearchResults(mockResults);
    setShowResults(true);
  };

  // Update the handleSelectResident function to display properly formatted names
  const handleSelectResident = (selectedResident: Resident) => {
    // Format the resident with properly formatted names
    const formattedResident: Resident = {
      ...selectedResident,
      firstName: formatName(selectedResident.firstName),
      middleName: selectedResident.middleName ? formatName(selectedResident.middleName) : null,
      lastName: formatName(selectedResident.lastName)
    };
    
    setResident(formattedResident);
    setShowResults(false);
  };

  const fetchResident = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/residents/${id}`);
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

  useEffect(() => {
    if (residentId) {
      fetchResident(residentId);
    }
  }, [residentId]);

  const handleGenerateCertificate = async () => {
    if (!selectedType) {
      setError("Please select a certificate type");
      return;
    }

    if (!resident) {
      setError("Please search and select a resident");
      return;
    }

    if (!purposeText) {
      setError("Please specify a purpose for the certificate");
      return;
    }

    setLoading(true);
    
    try {
      // In a real implementation, this would create the certificate in your database
      // and potentially redirect to a preview or download page
      
      // For now, we'll just show the preview
      setShowPreview(true);
      setLoading(false);
      
      // In a real app, you might do something like:
      // const response = await fetch('/api/certificates', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     type: selectedType,
      //     residentId: resident.id,
      //     purpose: formatPurpose(purposeText),
      //     additionalInfo
      //   }),
      // });
      
      // if (!response.ok) throw new Error('Failed to create certificate');
      // const data = await response.json();
      // router.push(`/dashboard/certificates/preview/${data.id}`);
    } catch (err) {
      console.error('Error generating certificate:', err);
      setError('Failed to generate certificate. Please try again.');
      setLoading(false);
    }
  };

  const handleManualResidentDataChange = (field: string, value: string) => {
    setManualResidentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUseManualData = () => {
    const manualResident: Resident = {
      id: `MANUAL-${new Date().getTime()}`,
      firstName: formatName(manualResidentData.firstName),
      middleName: manualResidentData.middleName ? formatName(manualResidentData.middleName) : null,
      lastName: formatName(manualResidentData.lastName),
      address: manualResidentData.address,
      civilStatus: manualResidentData.civilStatus
    };
    
    setResident(manualResident);
    setManualEntryMode(false);
  };

  if (!templateData && selectedType) {
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

  // Certificate data for rendering the preview
  const certificateData = selectedType ? {
    residentName: resident
      ? `${resident.firstName} ${resident.middleName ? resident.middleName + ' ' : ''}${resident.lastName}`
      : "Juan Dela Cruz",
    address: resident?.address || "123 Sample St., Barangay Sample",
    purpose: formatPurpose(purposeText),
    controlNumber,
    officials,
    businessName: "Sample Business",
    ownerName: resident
      ? `${resident.firstName} ${resident.lastName}`
      : "Sample Owner",
    civilStatus: resident?.civilStatus || "Single",
    templateSettings: templateData ? {
      ...templateData,
      barangayName: "SAN VICENTE",
      district: "District 4",
      city: "Quezon City",
      barangayAddress: "11-O Maayusin Extn., Brgy. San Vicente, Diliman, Quezon City 1101",
      contactNumber: "02-4415644",
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
    } : {}
  } : null;

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Button asChild variant="ghost" className="mb-2">
          <Link href="/dashboard/certificates" className="flex items-center text-[#006B5E]">
            <ChevronLeft className="mr-1 h-4 w-4" /> Back to Certificates
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-[#006B5E]">Generate Certificate</h1>
        <p className="text-muted-foreground">Create a new certificate for a resident</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <FileText className="mr-2 h-5 w-5" /> Certificate Information
              </CardTitle>
              <CardDescription>
                Fill in the details for the certificate
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="certificateType">Certificate Type</Label>
                  <div className="flex gap-2">
                    <Select value={selectedType} onValueChange={handleCertificateTypeChange}>
                      <SelectTrigger id="certificateType" className="w-full">
                        <SelectValue placeholder="Select certificate type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Certificate Types</SelectLabel>
                          {certificateTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    
                    {selectedType && (
                      <Button 
                        variant="outline" 
                        className="flex items-center gap-1" 
                        onClick={() => setShowTemplateEditor(!showTemplateEditor)}
                      >
                        {showTemplateEditor ? <Save className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
                        {showTemplateEditor ? "Hide Editor" : "Edit Template"}
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Choose the type of certificate to generate
                  </p>
                </div>

                {showTemplateEditor && templateData && (
                  <Card className="border-2 border-blue-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Template Editor</CardTitle>
                      <CardDescription>Customize template settings for this certificate</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="templateTitle">Certificate Title</Label>
                        <Input 
                          id="templateTitle"
                          value={templateData.title}
                          onChange={(e) => handleUpdateTemplate('title', e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="templateContent">Certificate Content</Label>
                        <Textarea 
                          id="templateContent"
                          value={templateData.content}
                          onChange={(e) => handleUpdateTemplate('content', e.target.value)}
                          className="min-h-[100px]"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Use {'{residentName}'}, {'{address}'}, {'{civilStatus}'} as placeholders
                        </p>
                      </div>
                      
                      <div>
                        <Label htmlFor="templateFooter">Certificate Footer</Label>
                        <Textarea 
                          id="templateFooter"
                          value={templateData.footer}
                          onChange={(e) => handleUpdateTemplate('footer', e.target.value)}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="showQRCode">QR Code</Label>
                          <Select 
                            value={templateData.showQRCode ? "yes" : "no"} 
                            onValueChange={(v) => handleUpdateTemplate('showQRCode', v === "yes")}
                          >
                            <SelectTrigger id="showQRCode">
                              <SelectValue placeholder="Show QR Code" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="yes">Show</SelectItem>
                              <SelectItem value="no">Hide</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="showSignatures">Signatures</Label>
                          <Select 
                            value={templateData.showSignatures ? "yes" : "no"} 
                            onValueChange={(v) => handleUpdateTemplate('showSignatures', v === "yes")}
                          >
                            <SelectTrigger id="showSignatures">
                              <SelectValue placeholder="Show Signatures" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="yes">Show</SelectItem>
                              <SelectItem value="no">Hide</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setShowTemplateEditor(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={() => handleSaveTemplate(templateData)}
                        className="bg-[#006B5E] hover:bg-[#005046]"
                      >
                        Save Template
                      </Button>
                    </CardFooter>
                  </Card>
                )}

                <div>
                  <Label htmlFor="residentSearch">Search Resident</Label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="residentSearch"
                      placeholder="Search by name, ID, or address..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleResidentSearch()}
                      disabled={searchLoading || manualEntryMode}
                    />
                  </div>
                  <div className="flex justify-between mt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setManualEntryMode(!manualEntryMode)}
                    >
                      {manualEntryMode ? "Back to Search" : "Manual Entry"}
                    </Button>
                    
                    {!manualEntryMode && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleResidentSearch}
                        disabled={searchQuery.trim().length < 2 || searchLoading}
                      >
                        {searchLoading ? (
                          <>
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent" />
                            Searching...
                          </>
                        ) : (
                          'Search'
                        )}
                      </Button>
                    )}
                  </div>
                  
                  {/* Manual entry form */}
                  {manualEntryMode && (
                    <div className="mt-4 border rounded-md p-4 space-y-3">
                      <h3 className="font-medium text-sm">Enter Resident Details</h3>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            placeholder="First Name"
                            value={manualResidentData.firstName}
                            onChange={(e) => handleManualResidentDataChange('firstName', e.target.value)}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            placeholder="Last Name"
                            value={manualResidentData.lastName}
                            onChange={(e) => handleManualResidentDataChange('lastName', e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="middleName">Middle Name</Label>
                        <Input
                          id="middleName"
                          placeholder="Middle Name (Optional)"
                          value={manualResidentData.middleName}
                          onChange={(e) => handleManualResidentDataChange('middleName', e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="address">Address</Label>
                        <Textarea
                          id="address"
                          placeholder="Complete Address"
                          value={manualResidentData.address}
                          onChange={(e) => handleManualResidentDataChange('address', e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="civilStatus">Civil Status</Label>
                        <Select 
                          value={manualResidentData.civilStatus} 
                          onValueChange={(value) => handleManualResidentDataChange('civilStatus', value)}
                        >
                          <SelectTrigger id="civilStatus">
                            <SelectValue placeholder="Select civil status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Single">Single</SelectItem>
                            <SelectItem value="Married">Married</SelectItem>
                            <SelectItem value="Widowed">Widowed</SelectItem>
                            <SelectItem value="Separated">Separated</SelectItem>
                            <SelectItem value="Divorced">Divorced</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button 
                          onClick={handleUseManualData}
                          disabled={!manualResidentData.firstName || !manualResidentData.lastName || !manualResidentData.address}
                          size="sm"
                          className="bg-[#006B5E] hover:bg-[#005046]"
                        >
                          Use These Details
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {/* Show search results (only when not in manual mode) */}
                  {!manualEntryMode && showResults && searchResults.length > 0 && (
                    <div className="mt-2 border rounded-md shadow-sm max-h-60 overflow-y-auto">
                      <ul className="divide-y">
                        {searchResults.map((result) => (
                          <li 
                            key={result.id}
                            className="p-2 hover:bg-muted cursor-pointer"
                            onClick={() => handleSelectResident(result)}
                          >
                            <div className="font-medium">
                              {result.firstName} {result.middleName ? result.middleName + ' ' : ''}{result.lastName}
                            </div>
                            <div className="text-xs text-muted-foreground">{result.address}</div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <p className="text-sm text-muted-foreground mt-1">
                    {manualEntryMode 
                      ? "Enter the resident's details manually"
                      : "Enter resident's name, ID, or address to search"
                    }
                  </p>
                </div>

                <div>
                  <Label htmlFor="purpose">Purpose</Label>
                  <Textarea
                    id="purpose"
                    placeholder="Enter the purpose for this certificate request..."
                    className="min-h-[100px]"
                    value={purposeText}
                    onChange={(e) => setPurposeText(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Specify why the resident is requesting this certificate
                  </p>
                </div>

                <div>
                  <Label htmlFor="additionalInfo">Additional Information</Label>
                  <Textarea
                    id="additionalInfo"
                    placeholder="Enter any additional information or special instructions..."
                    className="min-h-[100px]"
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Optional: Add any additional details relevant to this certificate
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowPreview(true)}
                  disabled={!selectedType || !resident || !purposeText}
                >
                  Preview
                </Button>
                <Button 
                  className="bg-[#006B5E] hover:bg-[#005046]"
                  onClick={handleGenerateCertificate}
                  disabled={!selectedType || !resident || !purposeText}
                >
                  <Printer className="mr-2 h-4 w-4" /> Generate Certificate
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Resident Information</CardTitle>
              <CardDescription>
                Selected resident's details will appear here
              </CardDescription>
            </CardHeader>
            <CardContent>
              {resident ? (
                <div className="space-y-2 border-2 border-green-500 rounded-md p-4 relative">
                  <div className="absolute top-0 right-0 bg-green-500 text-white px-2 py-1 text-xs rounded-bl-md flex items-center">
                    <Check className="h-3 w-3 mr-1" /> Resident Selected
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-4">
                    <div>
                      <p className="text-sm font-medium">Name:</p>
                      <p>{resident.firstName} {resident.middleName ? resident.middleName + ' ' : ''}{resident.lastName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Civil Status:</p>
                      <p>{resident.civilStatus}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Address:</p>
                    <p>{resident.address}</p>
                  </div>
                  {resident.id.startsWith('MANUAL-') && (
                    <div className="text-xs text-amber-600 italic mt-2">
                      Note: This is manually entered resident information.
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center p-6 border-2 border-dashed rounded-md">
                  <p className="text-muted-foreground">
                    Search and select a resident to view their information
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-xl">Certificate Preview</CardTitle>
              <CardDescription>
                Preview of the certificate will appear here
              </CardDescription>
            </CardHeader>
            <CardContent>
              {showPreview && selectedType && resident ? (
                <div className="border p-4 rounded-md text-sm">
                  <h3 className="text-center font-bold mb-2">
                    {certificateTypes.find(t => t.value === selectedType)?.label.toUpperCase()}
                  </h3>
                  <p className="mb-4">This is to certify that <strong>{resident.firstName} {resident.middleName ? resident.middleName + ' ' : ''}{resident.lastName}</strong>, 
                  of legal age, {resident.civilStatus}, Filipino, and a resident of <strong>{resident.address}</strong> 
                  {selectedType === "clearance" && " is a person of good moral character and has no derogatory record on file in this Barangay"}
                  {selectedType === "residency" && " is a bonafide resident of this Barangay for at least six (6) months"}
                  {selectedType === "indigency" && " is an INDIGENT member of this Barangay"}
                  .</p>
                  <p>Purpose: {formatPurpose(purposeText)}</p>
                </div>
              ) : (
                <div className="text-center p-6 border-2 border-dashed rounded-md">
                  <p className="text-muted-foreground">
                    Fill in all required information and click Preview to see the certificate
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {showPreview && selectedType && resident && templateData && (
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Full Certificate Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {certificateData && (
                <CertificateGenerator
                  type={selectedType}
                  data={certificateData}
                />
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
