"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, RefreshCw, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface Official {
  name: string;
  position: string;
  signatureUrl?: string;
}

export default function CouncilMembersPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [officials, setOfficials] = useState<{
    punongBarangay: string;
    secretary: string;
    treasurer: string;
    councilMembers: string[];
    signatureUrls: {
      punongBarangay?: string;
      secretary?: string;
      treasurer?: string;
    }
  }>({
    punongBarangay: "KRISTHINE DEL \"KRIS\" ADRANEDA-ADVINCULA",
    secretary: "AMALIA LIWANAG",
    treasurer: "JOCELYN JIMENEZ",
    councilMembers: [
      "RAUL NARCA",
      "MARIETTA PANABI",
      "WILFREDO REAL",
      "AURORA NOCOM",
      "FLORENCIO BONDOC, JR.",
      "JAMES NOEL ROJO",
      "ROGELIO DE LEON, JR.",
      "JOEL SALAMERO"
    ],
    signatureUrls: {
      punongBarangay: "",
      secretary: "",
      treasurer: ""
    }
  });

  // Load saved data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem("barangayOfficials");
    if (savedData) {
      setOfficials(JSON.parse(savedData));
    }
  }, []);

  const handleChange = (field: string, value: string) => {
    setOfficials(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSignatureChange = (field: string, value: string) => {
    setOfficials(prev => ({
      ...prev,
      signatureUrls: {
        ...prev.signatureUrls,
        [field]: value
      }
    }));
  };

  const handleCouncilMemberChange = (index: number, value: string) => {
    const updatedMembers = [...officials.councilMembers];
    updatedMembers[index] = value;
    setOfficials(prev => ({
      ...prev,
      councilMembers: updatedMembers
    }));
  };

  const addCouncilMember = () => {
    setOfficials(prev => ({
      ...prev,
      councilMembers: [...prev.councilMembers, ""]
    }));
  };

  const removeCouncilMember = (index: number) => {
    const updatedMembers = [...officials.councilMembers];
    updatedMembers.splice(index, 1);
    setOfficials(prev => ({
      ...prev,
      councilMembers: updatedMembers
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Save to localStorage
    localStorage.setItem("barangayOfficials", JSON.stringify(officials));
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Settings saved", {
        description: "Barangay officials have been updated successfully.",
      });
    }, 1000);
  };

  const handleReset = () => {
    const defaultData = {
      punongBarangay: "KRISTHINE DEL \"KRIS\" ADRANEDA-ADVINCULA",
      secretary: "AMALIA LIWANAG",
      treasurer: "JOCELYN JIMENEZ",
      councilMembers: [
        "RAUL NARCA",
        "MARIETTA PANABI",
        "WILFREDO REAL",
        "AURORA NOCOM",
        "FLORENCIO BONDOC, JR.",
        "JAMES NOEL ROJO",
        "ROGELIO DE LEON, JR.",
        "JOEL SALAMERO"
      ],
      signatureUrls: {
        punongBarangay: "",
        secretary: "",
        treasurer: ""
      }
    };
    
    setOfficials(defaultData);
    localStorage.setItem("barangayOfficials", JSON.stringify(defaultData));
    
    toast.success("Settings reset", {
      description: "Barangay officials have been reset to default values.",
    });
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center mb-6">
        <Link href="/dashboard/certificates" className="mr-4">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-[#006B5E]">Barangay Officials</h1>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Main Officials</CardTitle>
          <CardDescription>
            Update information about the main barangay officials that will appear on certificates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="punongBarangay">Punong Barangay</Label>
                  <Input
                    id="punongBarangay"
                    value={officials.punongBarangay}
                    onChange={(e) => handleChange("punongBarangay", e.target.value)}
                    placeholder="Enter name of Punong Barangay"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="punongBarangaySignature">Signature URL</Label>
                  <Input
                    id="punongBarangaySignature"
                    value={officials.signatureUrls.punongBarangay || ""}
                    onChange={(e) => handleSignatureChange("punongBarangay", e.target.value)}
                    placeholder="Enter URL for signature image"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="secretary">Barangay Secretary</Label>
                  <Input
                    id="secretary"
                    value={officials.secretary}
                    onChange={(e) => handleChange("secretary", e.target.value)}
                    placeholder="Enter name of Secretary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secretarySignature">Signature URL</Label>
                  <Input
                    id="secretarySignature"
                    value={officials.signatureUrls.secretary || ""}
                    onChange={(e) => handleSignatureChange("secretary", e.target.value)}
                    placeholder="Enter URL for signature image"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="treasurer">Barangay Treasurer</Label>
                  <Input
                    id="treasurer"
                    value={officials.treasurer}
                    onChange={(e) => handleChange("treasurer", e.target.value)}
                    placeholder="Enter name of Treasurer"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="treasurerSignature">Signature URL</Label>
                  <Input
                    id="treasurerSignature"
                    value={officials.signatureUrls.treasurer || ""}
                    onChange={(e) => handleSignatureChange("treasurer", e.target.value)}
                    placeholder="Enter URL for signature image"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="councilMembers">Council Members</Label>
                <Button 
                  type="button" 
                  onClick={addCouncilMember} 
                  variant="outline" 
                  size="sm"
                  className="flex items-center"
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Add Member
                </Button>
              </div>
              
              {officials.councilMembers.map((member, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={member}
                    onChange={(e) => handleCouncilMemberChange(index, e.target.value)}
                    placeholder={`Council Member ${index + 1}`}
                  />
                  <Button 
                    type="button" 
                    onClick={() => removeCouncilMember(index)} 
                    variant="ghost" 
                    size="icon"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleReset}
                className="flex items-center"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset to Default
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-[#006B5E] hover:bg-[#005046] flex items-center"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>
            This is how your barangay officials will appear on certificates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border p-4 rounded-md">
            <div className="flex justify-between">
              <div className="w-1/3 bg-[#f9f9e0] p-4 rounded-sm border-t-4 border-[#5c6d41]">
                <h3 className="font-bold text-[#5c6d41] mb-2 text-center">Council Members:</h3>
                <ul className="text-sm space-y-2">
                  {officials.councilMembers.map((member, index) => (
                    <li key={index} className="text-[#5c6d41]">{member}</li>
                  ))}
                  <li className="text-[#5c6d41] font-semibold mt-4">
                    {officials.secretary}
                    <div className="text-xs">Secretary</div>
                  </li>
                  <li className="text-[#5c6d41] font-semibold">
                    {officials.treasurer}
                    <div className="text-xs">Treasurer</div>
                  </li>
                </ul>
              </div>
              
              <div className="w-1/2 flex flex-col items-center justify-end">
                <div className="w-64 text-center">
                  <div className="border-b border-black mb-1 h-8"></div>
                  <p className="font-bold text-[#5c6d41]">{officials.punongBarangay}</p>
                  <p className="text-sm">Punong Barangay</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 