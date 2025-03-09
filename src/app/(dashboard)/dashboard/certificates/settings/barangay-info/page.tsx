"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, RefreshCw } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function BarangayInfoPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    barangayName: "SAN VICENTE",
    district: "District 4",
    city: "Quezon City",
    province: "Metro Manila",
    barangayAddress: "11-O Maayusin Extn., Brgy. San Vicente, Diliman, Quezon City 1101",
    contactNumber: "02-4415644",
    email: "barangaysanvicente@gmail.com",
    website: "https://sanvicente.gov.ph",
    logoLeft: "/bisig-logo.jpg",
    logoRight: "/bagong-pilipinas.png"
  });

  // Load saved data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem("barangayInfo");
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Save to localStorage
    localStorage.setItem("barangayInfo", JSON.stringify(formData));
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Settings saved", {
        description: "Barangay information has been updated successfully.",
      });
    }, 1000);
  };

  const handleReset = () => {
    const defaultData = {
      barangayName: "SAN VICENTE",
      district: "District 4",
      city: "Quezon City",
      province: "Metro Manila",
      barangayAddress: "11-O Maayusin Extn., Brgy. San Vicente, Diliman, Quezon City 1101",
      contactNumber: "02-4415644",
      email: "barangaysanvicente@gmail.com",
      website: "https://sanvicente.gov.ph",
      logoLeft: "/bisig-logo.jpg",
      logoRight: "/bagong-pilipinas.png"
    };
    
    setFormData(defaultData);
    localStorage.setItem("barangayInfo", JSON.stringify(defaultData));
    
    toast.success("Settings reset", {
      description: "Barangay information has been reset to default values.",
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
        <h1 className="text-2xl font-bold text-[#006B5E]">Barangay Information</h1>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>General Information</CardTitle>
          <CardDescription>
            Update your barangay's basic information that will appear on all certificates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="barangayName">Barangay Name</Label>
                <Input
                  id="barangayName"
                  name="barangayName"
                  value={formData.barangayName}
                  onChange={handleChange}
                  placeholder="Enter barangay name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="district">District</Label>
                <Input
                  id="district"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  placeholder="Enter district"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City/Municipality</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Enter city or municipality"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="province">Province</Label>
                <Input
                  id="province"
                  name="province"
                  value={formData.province}
                  onChange={handleChange}
                  placeholder="Enter province"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="barangayAddress">Complete Address</Label>
              <Textarea
                id="barangayAddress"
                name="barangayAddress"
                value={formData.barangayAddress}
                onChange={handleChange}
                placeholder="Enter complete address"
                rows={2}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="contactNumber">Contact Number</Label>
                <Input
                  id="contactNumber"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  placeholder="Enter contact number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="Enter website URL"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="logoLeft">Left Logo URL</Label>
                <Input
                  id="logoLeft"
                  name="logoLeft"
                  value={formData.logoLeft}
                  onChange={handleChange}
                  placeholder="Enter URL for left logo"
                />
                <p className="text-xs text-gray-500">Default: /bisig-logo.jpg</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="logoRight">Right Logo URL</Label>
                <Input
                  id="logoRight"
                  name="logoRight"
                  value={formData.logoRight}
                  onChange={handleChange}
                  placeholder="Enter URL for right logo"
                />
                <p className="text-xs text-gray-500">Default: /bagong-pilipinas.png</p>
              </div>
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
            This is how your barangay information will appear on certificates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border p-4 rounded-md">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-bold text-[#5c6d41]">BARANGAY {formData.barangayName}</h2>
              <p className="text-[#5c6d41]">{formData.district}, {formData.city}</p>
              <p className="text-sm text-[#5c6d41]">{formData.barangayAddress}</p>
              <p className="text-sm text-[#5c6d41]">☎ {formData.contactNumber}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 