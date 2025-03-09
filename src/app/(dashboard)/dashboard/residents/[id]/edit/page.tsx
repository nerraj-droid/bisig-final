'use client';

import { PageTransition } from "@/components/ui/page-transition";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Save, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

// Define available sectors
const AVAILABLE_SECTORS = [
  "SENIOR",
  "PWD",
  "INDIGENT",
  "SOLO_PARENT",
  "OTHER"
];

// Define available identity types
const IDENTITY_TYPES = [
  "Government ID",
  "SSS",
  "PhilHealth",
  "Voter's ID",
  "Passport",
  "Driver's License",
  "Other"
];

// Define employment status options
const EMPLOYMENT_STATUS = [
  "Employed",
  "Unemployed",
  "Self-employed",
  "Student",
  "Retired",
  "Other"
];

export default function ResidentEditPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [resident, setResident] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    extensionName: '',
    birthDate: '',
    gender: '',
    civilStatus: '',
    contactNo: '',
    email: '',
    occupation: '',
    employmentStatus: '',
    address: '',
    voterInBarangay: false,
    headOfHousehold: false,
    sectors: [] as string[],
    identityType: '',
    proofOfIdentity: ''
  });

  useEffect(() => {
    async function fetchResident() {
      try {
        const response = await fetch(`/api/residents/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch resident');
        }
        const data = await response.json();
        setResident(data);
        
        // Format date for input field
        const birthDate = data.birthDate ? new Date(data.birthDate).toISOString().split('T')[0] : '';
        
        setFormData({
          firstName: data.firstName || '',
          middleName: data.middleName || '',
          lastName: data.lastName || '',
          extensionName: data.extensionName || '',
          birthDate,
          gender: data.gender || '',
          civilStatus: data.civilStatus || '',
          contactNo: data.contactNo || '',
          email: data.email || '',
          occupation: data.occupation || '',
          employmentStatus: data.employmentStatus || '',
          address: data.address || '',
          voterInBarangay: data.voterInBarangay || false,
          headOfHousehold: data.headOfHousehold || false,
          sectors: data.sectors || [],
          identityType: data.identityType || '',
          proofOfIdentity: data.proofOfIdentity || ''
        });
      } catch (err) {
        setError('Failed to load resident information');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchResident();
  }, [params.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSectorChange = (sector: string) => {
    setFormData(prev => {
      const updatedSectors = prev.sectors.includes(sector)
        ? prev.sectors.filter(s => s !== sector)
        : [...prev.sectors, sector];
      
      return { ...prev, sectors: updatedSectors };
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      // If there's a file, upload it first
      let proofOfIdentityUrl = formData.proofOfIdentity;
      if (selectedFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', selectedFile);
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData,
        });
        
        if (!uploadResponse.ok) {
          throw new Error('Failed to upload file');
        }
        
        const uploadData = await uploadResponse.json();
        proofOfIdentityUrl = uploadData.url;
      }

      // Then update the resident with the file URL
      const residentData = {
        ...formData,
        proofOfIdentity: proofOfIdentityUrl
      };

      const response = await fetch(`/api/residents/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(residentData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update resident');
      }

      // Redirect to resident detail page
      router.push(`/dashboard/residents/${params.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <PageTransition>
        <div className="w-full flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#006B5E]"></div>
        </div>
      </PageTransition>
    );
  }

  if (error && !resident) {
    return (
      <PageTransition>
        <div className="w-full">
          <div className="flex items-center mb-6">
            <Link href="/dashboard/residents" className="text-[#006B5E] hover:text-[#F39C12] transition-colors mr-4">
              <ArrowLeft size={24} />
            </Link>
            <h1 className="text-2xl font-bold text-[#006B5E]">ERROR</h1>
          </div>
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="w-full">
        {/* Back button and page title */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link href={`/dashboard/residents/${params.id}`} className="text-[#006B5E] hover:text-[#F39C12] transition-colors mr-4">
              <ArrowLeft size={24} />
            </Link>
            <h1 className="text-2xl font-bold text-[#006B5E]">EDIT RESIDENT</h1>
          </div>
          <Button 
            className="bg-[#006B5E] hover:bg-[#005046]"
            onClick={handleSubmit}
            disabled={isSaving}
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        {/* Edit Form */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#006B5E]">Personal Information</h3>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006B5E]"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Middle Name</label>
                  <input
                    type="text"
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006B5E]"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006B5E]"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Extension Name</label>
                  <input
                    type="text"
                    name="extensionName"
                    value={formData.extensionName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006B5E]"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Birth Date *</label>
                  <input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006B5E]"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Gender *</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006B5E]"
                  >
                    <option value="">Select Gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Civil Status *</label>
                  <select
                    name="civilStatus"
                    value={formData.civilStatus}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006B5E]"
                  >
                    <option value="">Select Civil Status</option>
                    <option value="SINGLE">Single</option>
                    <option value="MARRIED">Married</option>
                    <option value="WIDOWED">Widowed</option>
                    <option value="SEPARATED">Separated</option>
                    <option value="DIVORCED">Divorced</option>
                  </select>
                </div>
              </div>

              {/* Contact and Additional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#006B5E]">Contact & Additional Information</h3>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                  <input
                    type="tel"
                    name="contactNo"
                    value={formData.contactNo}
                    onChange={handleChange}
                    placeholder="+63 or 09 followed by 10 digits"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006B5E]"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006B5E]"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Occupation</label>
                  <input
                    type="text"
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006B5E]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Employment Status</label>
                  <select
                    name="employmentStatus"
                    value={formData.employmentStatus}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006B5E]"
                  >
                    <option value="">Select Employment Status</option>
                    {EMPLOYMENT_STATUS.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Address *</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006B5E]"
                  />
                </div>
              </div>
            </div>

            {/* Sectors and Status */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-[#006B5E] mb-4">Sectors & Status</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Sectors</label>
                    <div className="space-y-2">
                      {AVAILABLE_SECTORS.map(sector => (
                        <div key={sector} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`sector-${sector}`}
                            checked={formData.sectors.includes(sector)}
                            onChange={() => handleSectorChange(sector)}
                            className="h-4 w-4 text-[#006B5E] focus:ring-[#006B5E] border-gray-300 rounded"
                          />
                          <label htmlFor={`sector-${sector}`} className="ml-2 block text-sm text-gray-700">
                            {sector.replace('_', ' ')}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="voterInBarangay"
                      name="voterInBarangay"
                      checked={formData.voterInBarangay}
                      onChange={handleChange}
                      className="h-4 w-4 text-[#006B5E] focus:ring-[#006B5E] border-gray-300 rounded"
                    />
                    <label htmlFor="voterInBarangay" className="ml-2 block text-sm text-gray-700">
                      Voter in Barangay
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="headOfHousehold"
                      name="headOfHousehold"
                      checked={formData.headOfHousehold}
                      onChange={handleChange}
                      className="h-4 w-4 text-[#006B5E] focus:ring-[#006B5E] border-gray-300 rounded"
                    />
                    <label htmlFor="headOfHousehold" className="ml-2 block text-sm text-gray-700">
                      Head of Household
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Proof of Identity Type</label>
                    <select
                      name="identityType"
                      value={formData.identityType}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006B5E]"
                    >
                      <option value="">Select Identity Type</option>
                      {IDENTITY_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Upload Proof of Identity</label>
                    <div className="flex items-center">
                      <label className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                        <Upload className="mr-2 h-4 w-4" />
                        {selectedFile ? 'Change File' : 'Upload File'}
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*,.pdf"
                          onChange={handleFileChange}
                        />
                      </label>
                      {selectedFile && (
                        <span className="ml-3 text-sm text-gray-500">
                          {selectedFile.name}
                        </span>
                      )}
                    </div>
                    {formData.proofOfIdentity && !selectedFile && (
                      <div className="mt-2">
                        <span className="text-sm text-gray-500">Current file: </span>
                        <a 
                          href={formData.proofOfIdentity} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          View current document
                        </a>
                      </div>
                    )}
                    <p className="text-xs text-gray-500">
                      Accepted file types: Images (JPG, PNG) and PDF documents
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Link href={`/dashboard/residents/${params.id}`}>
                <Button variant="outline" type="button" disabled={isSaving}>
                  Cancel
                </Button>
              </Link>
              <Button 
                type="submit" 
                className="bg-[#006B5E] hover:bg-[#005046]"
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </PageTransition>
  );
} 