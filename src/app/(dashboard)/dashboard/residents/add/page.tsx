'use client';

import { PageTransition } from "@/components/ui/page-transition";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Save, Upload, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

// Define available sectors based on requirements
const AVAILABLE_SECTORS = [
  "4Ps",
  "PREGNANT",
  "SENIOR",
  "SOLO_PARENT",
  "PWD",
  "INDIGENT"
];

// Define available identity types
const IDENTITY_TYPES = [
  "TIN",
  "SSS",
  "GSIS",
  "Unified Multi-Purpose ID",
  "NBI Clearance",
  "Driver's License",
  "Professional Regulations Commission ID",
  "Police Clearance",
  "Postal ID",
  "Voter's ID",
  "Photo-Bearing Barangay ID/Certificate",
  "Philhealth Card",
  "Senior Citizen's ID",
  "Overseas Workers Welfare Admin ID",
  "OFW ID",
  "Seaman's Book",
  "Alien Cert. / Immigration Cert.",
  "Government Office ID",
  "NCWDP ID/Certificate",
  "Dept. of Social Welfare & Dev ID/Cert",
  "Firearms License",
  "Photo-Bearing Credit Card",
  "Photo-Bearing Health Card",
  "School ID",
  "Birth Certificate issued by PSA",
  "Certificate of Registration for DNFBP",
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

// Define unemployment reason options
const UNEMPLOYMENT_REASONS = [
  "Child",
  "Housewife",
  "Infant",
  "Student",
  "Unemployed"
];

// Define educational attainment options
const EDUCATIONAL_ATTAINMENT = [
  "No Formal Education",
  "Elementary Undergraduate",
  "Elementary Graduate",
  "High School Undergraduate",
  "High School Graduate",
  "Vocational/Technical Course",
  "College Undergraduate",
  "College Graduate",
  "Post Graduate"
];

// Define blood types
const BLOOD_TYPES = [
  "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"
];

export default function AddResidentPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Address dropdown states
  const [provinces, setProvinces] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [barangays, setBarangays] = useState<any[]>([]);
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [isLoadingBarangays, setIsLoadingBarangays] = useState(false);
  
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    middleName: '',
    lastName: '',
    extensionName: '',
    alias: '',
    birthDate: '',
    gender: '',
    civilStatus: '',
    nationality: 'Filipino',
    
    // Contact Information
    contactNo: '',
    email: '',
    
    // Address Information
    address: '',
    houseNo: '',
    street: '',
    barangay: '',
    city: '',
    province: '',
    zipCode: '',
    
    // Employment & Education
    occupation: '',
    employmentStatus: '',
    unemploymentReason: '',
    educationalAttainment: '',
    
    // Additional Information
    bloodType: '',
    religion: '',
    ethnicGroup: '',
    
    // Parent Information
    fatherName: '',
    fatherMiddleName: '',
    fatherLastName: '',
    motherFirstName: '',
    motherMiddleName: '',
    motherMaidenName: '',
    
    // Status
    voterInBarangay: false,
    headOfHousehold: false,
    sectors: [] as string[],
    
    // Identity
    identityType: '',
    proofOfIdentity: ''
  });

  // Fetch provinces on component mount
  useEffect(() => {
    fetchProvinces();
  }, []);

  // Fetch cities when province changes
  useEffect(() => {
    if (formData.province) {
      fetchCities(formData.province);
    } else {
      setCities([]);
      setFormData(prev => ({ ...prev, city: '', barangay: '' }));
    }
  }, [formData.province]);

  // Fetch barangays when city changes
  useEffect(() => {
    if (formData.city) {
      fetchBarangays(formData.city);
    } else {
      setBarangays([]);
      setFormData(prev => ({ ...prev, barangay: '' }));
    }
  }, [formData.city]);

  // Fetch provinces from PSGC API
  const fetchProvinces = async () => {
    setIsLoadingProvinces(true);
    try {
      const response = await fetch('https://psgc.gitlab.io/api/provinces.json');
      if (!response.ok) {
        throw new Error('Failed to fetch provinces');
      }
      const data = await response.json();
      setProvinces(data.sort((a: any, b: any) => a.name.localeCompare(b.name)));
    } catch (error) {
      console.error('Error fetching provinces:', error);
    } finally {
      setIsLoadingProvinces(false);
    }
  };

  // Fetch cities/municipalities for a province
  const fetchCities = async (provinceName: string) => {
    setIsLoadingCities(true);
    try {
      // Find province code from name
      const province = provinces.find(p => p.name === provinceName);
      if (!province) return;

      const response = await fetch(`https://psgc.gitlab.io/api/provinces/${province.code}/cities-municipalities.json`);
      if (!response.ok) {
        throw new Error('Failed to fetch cities');
      }
      const data = await response.json();
      setCities(data.sort((a: any, b: any) => a.name.localeCompare(b.name)));
    } catch (error) {
      console.error('Error fetching cities:', error);
    } finally {
      setIsLoadingCities(false);
    }
  };

  // Fetch barangays for a city/municipality
  const fetchBarangays = async (cityName: string) => {
    setIsLoadingBarangays(true);
    try {
      // Find city code from name
      const city = cities.find(c => c.name === cityName);
      if (!city) return;

      const response = await fetch(`https://psgc.gitlab.io/api/cities-municipalities/${city.code}/barangays.json`);
      if (!response.ok) {
        throw new Error('Failed to fetch barangays');
      }
      const data = await response.json();
      setBarangays(data.sort((a: any, b: any) => a.name.localeCompare(b.name)));
    } catch (error) {
      console.error('Error fetching barangays:', error);
    } finally {
      setIsLoadingBarangays(false);
    }
  };

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
      // Validate required fields
      if (!formData.firstName || !formData.lastName || !formData.birthDate || !formData.gender || !formData.civilStatus) {
        setError('Please fill in all required fields');
        setIsSaving(false);
        return;
      }
      
      // Validate gender and civilStatus
      const validGenders = ['MALE', 'FEMALE', 'OTHER'];
      const validCivilStatus = ['SINGLE', 'MARRIED', 'WIDOWED', 'DIVORCED', 'SEPARATED'];
      
      if (!validGenders.includes(formData.gender)) {
        setError('Please select a valid gender');
        setIsSaving(false);
        return;
      }
      
      if (!validCivilStatus.includes(formData.civilStatus)) {
        setError('Please select a valid civil status');
        setIsSaving(false);
        return;
      }
      
      // If there's a file, upload it first
      let proofOfIdentityUrl = '';
      if (selectedFile) {
        try {
          const formData = new FormData();
          formData.append('file', selectedFile);
          
          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });
          
          if (!uploadResponse.ok) {
            console.warn('File upload failed, continuing without file');
          } else {
            const uploadData = await uploadResponse.json();
            proofOfIdentityUrl = uploadData.url;
          }
        } catch (uploadError) {
          console.warn('File upload error, continuing without file:', uploadError);
        }
      }
      
      // Format the address from individual fields
      const formattedAddress = [
        formData.houseNo,
        formData.street,
        formData.barangay,
        formData.city,
        formData.province,
        formData.zipCode,
        formData.address // Additional address details
      ]
        .filter(Boolean)
        .join(', ');
      
      // Create resident data object with required fields
      const residentData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        middleName: formData.middleName || '',
        extensionName: formData.extensionName || '',
        alias: formData.alias || '',
        birthDate: formData.birthDate,
        gender: formData.gender,
        civilStatus: formData.civilStatus,
        address: formattedAddress,
        email: formData.email || '',
        contactNo: formData.contactNo || '',
        occupation: formData.occupation || '',
        employmentStatus: formData.employmentStatus || '',
        unemploymentReason: formData.unemploymentReason || '',
        educationalAttainment: formData.educationalAttainment || '',
        bloodType: formData.bloodType || '',
        religion: formData.religion || '',
        ethnicGroup: formData.ethnicGroup || '',
        nationality: formData.nationality || '',
        userPhoto: '',
        motherMaidenName: formData.motherMaidenName || '',
        motherMiddleName: formData.motherMiddleName || '',
        motherFirstName: formData.motherFirstName || '',
        fatherName: formData.fatherName || '',
        fatherLastName: formData.fatherLastName || '',
        fatherMiddleName: formData.fatherMiddleName || '',
        headOfHousehold: Boolean(formData.headOfHousehold),
        voterInBarangay: Boolean(formData.voterInBarangay),
        sectors: Array.isArray(formData.sectors) ? formData.sectors : [],
        proofOfIdentity: proofOfIdentityUrl || '',
        identityType: formData.identityType || '',
      };
      
      // Send data to API
      const response = await fetch('/api/residents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(residentData),
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        if (responseData.errors) {
          // Format validation errors
          const errorMessages = responseData.errors.map((err: any) => 
            `${err.path.join('.')}: ${err.message}`
          ).join(', ');
          throw new Error(`Validation error: ${errorMessages}`);
        }
        throw new Error(responseData.message || 'Failed to create resident');
      }
      
      // Redirect to the new resident's detail page
      router.push(`/dashboard/residents/${responseData.id}`);
    } catch (error) {
      console.error('Error creating resident:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageTransition>
      <div className="w-full max-w-[1200px] mx-auto">
        {/* Back button and page title */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center">
            <Link href="/dashboard/residents" className="text-[#006B5E] hover:text-[#F39C12] transition-colors mr-4">
              <ArrowLeft size={24} />
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold text-[#006B5E]">ADD NEW RESIDENT</h1>
          </div>
          <Button 
            className="bg-[#006B5E] hover:bg-[#005046] w-full sm:w-auto"
            onClick={handleSubmit}
            disabled={isSaving}
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Resident'}
          </Button>
        </div>

        {/* Add Form */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden p-4 sm:p-6 mb-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            {/* Personal Information Section */}
            <div>
              <h3 className="text-lg font-semibold text-[#006B5E] mb-4 pb-2 border-b">Personal Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                    placeholder="Jr., Sr., III, etc."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006B5E]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Alias/Nickname</label>
                  <input
                    type="text"
                    name="alias"
                    value={formData.alias}
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
                    <option value="OTHER">Other</option>
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

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Nationality</label>
                  <input
                    type="text"
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006B5E]"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div>
              <h3 className="text-lg font-semibold text-[#006B5E] mb-4 pb-2 border-b">Contact Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              </div>
            </div>

            {/* Address Information Section */}
            <div>
              <h3 className="text-lg font-semibold text-[#006B5E] mb-4 pb-2 border-b">Address Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">House No. *</label>
                  <input
                    type="text"
                    name="houseNo"
                    value={formData.houseNo}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006B5E]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Street *</label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006B5E]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Province *</label>
                  <div className="relative">
                    <select
                      name="province"
                      value={formData.province}
                      onChange={handleChange}
                      required
                      disabled={isLoadingProvinces}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006B5E] appearance-none"
                    >
                      <option value="">Select Province</option>
                      {provinces.map((province) => (
                        <option key={province.code} value={province.name}>
                          {province.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      {isLoadingProvinces ? (
                        <div className="animate-spin h-4 w-4 border-2 border-[#006B5E] border-t-transparent rounded-full"></div>
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      )}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">City/Municipality *</label>
                  <div className="relative">
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      disabled={isLoadingCities || !formData.province}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006B5E] appearance-none"
                    >
                      <option value="">Select City/Municipality</option>
                      {cities.map((city) => (
                        <option key={city.code} value={city.name}>
                          {city.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      {isLoadingCities ? (
                        <div className="animate-spin h-4 w-4 border-2 border-[#006B5E] border-t-transparent rounded-full"></div>
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      )}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Barangay *</label>
                  <div className="relative">
                    <select
                      name="barangay"
                      value={formData.barangay}
                      onChange={handleChange}
                      required
                      disabled={isLoadingBarangays || !formData.city}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006B5E] appearance-none"
                    >
                      <option value="">Select Barangay</option>
                      {barangays.map((barangay) => (
                        <option key={barangay.code} value={barangay.name}>
                          {barangay.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      {isLoadingBarangays ? (
                        <div className="animate-spin h-4 w-4 border-2 border-[#006B5E] border-t-transparent rounded-full"></div>
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      )}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Zip Code</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006B5E]"
                  />
                </div>
                <div className="space-y-2 col-span-full">
                  <label className="block text-sm font-medium text-gray-700">Additional Address Details</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Apartment, suite, unit, building, floor, etc."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006B5E]"
                  />
                </div>
              </div>
            </div>

            {/* Employment & Education Section */}
            <div>
              <h3 className="text-lg font-semibold text-[#006B5E] mb-4 pb-2 border-b">Employment & Education</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

                {formData.employmentStatus === "Unemployed" && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Unemployment Reason</label>
                    <select
                      name="unemploymentReason"
                      value={formData.unemploymentReason}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006B5E]"
                    >
                      <option value="">Select Reason</option>
                      {UNEMPLOYMENT_REASONS.map(reason => (
                        <option key={reason} value={reason}>{reason}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Educational Attainment</label>
                  <select
                    name="educationalAttainment"
                    value={formData.educationalAttainment}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006B5E]"
                  >
                    <option value="">Select Educational Attainment</option>
                    {EDUCATIONAL_ATTAINMENT.map(education => (
                      <option key={education} value={education}>{education}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Additional Information Section */}
            <div>
              <h3 className="text-lg font-semibold text-[#006B5E] mb-4 pb-2 border-b">Additional Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Blood Type</label>
                  <select
                    name="bloodType"
                    value={formData.bloodType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006B5E]"
                  >
                    <option value="">Select Blood Type</option>
                    {BLOOD_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Religion</label>
                  <input
                    type="text"
                    name="religion"
                    value={formData.religion}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006B5E]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Ethnic Group</label>
                  <input
                    type="text"
                    name="ethnicGroup"
                    value={formData.ethnicGroup}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006B5E]"
                  />
                </div>
              </div>
            </div>

            {/* Parent Information Section */}
            <div>
              <h3 className="text-lg font-semibold text-[#006B5E] mb-4 pb-2 border-b">Parent Information</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-md font-medium text-gray-700 mb-3">Father's Information</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">First Name</label>
                      <input
                        type="text"
                        name="fatherName"
                        value={formData.fatherName}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006B5E]"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Middle Name</label>
                      <input
                        type="text"
                        name="fatherMiddleName"
                        value={formData.fatherMiddleName}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006B5E]"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Last Name</label>
                      <input
                        type="text"
                        name="fatherLastName"
                        value={formData.fatherLastName}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006B5E]"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-md font-medium text-gray-700 mb-3">Mother's Information</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">First Name</label>
                      <input
                        type="text"
                        name="motherFirstName"
                        value={formData.motherFirstName}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006B5E]"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Middle Name</label>
                      <input
                        type="text"
                        name="motherMiddleName"
                        value={formData.motherMiddleName}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006B5E]"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Maiden Name</label>
                      <input
                        type="text"
                        name="motherMaidenName"
                        value={formData.motherMaidenName}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006B5E]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sectors and Status Section */}
            <div>
              <h3 className="text-lg font-semibold text-[#006B5E] mb-4 pb-2 border-b">Sectors & Status</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Sectors</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
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
                        <span className="text-sm text-gray-500">
                          {selectedFile.name}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Accepted file types: Images (JPG, PNG) and PDF documents
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t">
              <Link href="/dashboard/residents" className="w-full sm:w-auto">
                <Button variant="outline" type="button" disabled={isSaving} className="w-full sm:w-auto">
                  Cancel
                </Button>
              </Link>
              <Button 
                type="submit" 
                className="w-full sm:w-auto bg-[#006B5E] hover:bg-[#005046]"
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Resident'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </PageTransition>
  );
} 