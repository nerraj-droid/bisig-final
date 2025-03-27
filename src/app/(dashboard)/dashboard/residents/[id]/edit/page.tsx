'use client';

import { PageTransition } from "@/components/ui/page-transition";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Save, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect, use } from "react";

// Define available sectors
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
  { value: "TIN", label: "TIN" },
  { value: "SSS", label: "SSS" },
  { value: "GSIS", label: "GSIS" },
  { value: "Unified Multi-Purpose ID", label: "Unified Multi-Purpose ID" },
  { value: "NBI Clearance", label: "NBI Clearance" },
  { value: "Driver's License", label: "Driver's License" },
  { value: "Professional Regulations Commission ID", label: "Professional Regulations Commission ID" },
  { value: "Police Clearance", label: "Police Clearance" },
  { value: "Postal ID", label: "Postal ID" },
  { value: "Voter's ID", label: "Voter's ID" },
  { value: "Photo-Bearing Barangay ID/Certificate", label: "Photo-Bearing Barangay ID/Certificate" },
  { value: "Philhealth Card", label: "Philhealth Card" },
  { value: "Senior Citizen's ID", label: "Senior Citizen's ID" },
  { value: "Overseas Workers Welfare Admin ID", label: "Overseas Workers Welfare Admin ID" },
  { value: "OFW ID", label: "OFW ID" },
  { value: "Seaman's Book", label: "Seaman's Book" },
  { value: "Alien Cert. / Immigration Cert.", label: "Alien Cert. / Immigration Cert." },
  { value: "Government Office ID", label: "Government Office ID" },
  { value: "NCWDP ID/Certificate", label: "NCWDP ID/Certificate" },
  { value: "Dept. of Social Welfare & Dev ID/Cert", label: "Dept. of Social Welfare & Dev ID/Cert" },
  { value: "Firearms License", label: "Firearms License" },
  { value: "Photo-Bearing Credit Card", label: "Photo-Bearing Credit Card" },
  { value: "Photo-Bearing Health Card", label: "Photo-Bearing Health Card" },
  { value: "School ID", label: "School ID" },
  { value: "Birth Certificate issued by PSA", label: "Birth Certificate issued by PSA" },
  { value: "Certificate of Registration for DNFBP", label: "Certificate of Registration for DNFBP" },
];

// Define employment status options to match Prisma enum
const EMPLOYMENT_STATUS = [
  "EMPLOYED",
  "UNEMPLOYED",
  "STUDENT",
  "RETIRED"
];

export default function ResidentEditPage({
  params,
  searchParams
}: {
  params: { id: string }
  searchParams?: { [key: string]: string | string[] | undefined }
}) {
  // Get the resident ID from params
  const residentId = params.id;
  const router = useRouter();
  const [resident, setResident] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
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
    identityNumber: '',
    proofOfIdentity: '',
    userPhoto: '',
    // Parent details
    fatherName: '',
    fatherMiddleName: '',
    fatherLastName: '',
    motherFirstName: '',
    motherMiddleName: '',
    motherMaidenName: '',
    identityDocumentPath: '',
    // Additional fields
    nationality: '',
    religion: '',
    ethnicGroup: '',
    bloodType: '',
    alias: ''
  });

  useEffect(() => {
    async function fetchResident() {
      try {
        const response = await fetch(`/api/residents/${residentId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch resident');
        }
        const data = await response.json();
        setResident(data);

        // Format date for input field
        const birthDate = data.birthDate ? new Date(data.birthDate).toISOString().split('T')[0] : '';

        // Log the data for debugging
        console.log("Raw resident data:", {
          identityType: data.identityType,
          sectors: data.sectors,
          identityDocumentPath: data.identityDocumentPath,
          proofOfIdentity: data.proofOfIdentity
        });

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
          sectors: Array.isArray(data.sectors) ? data.sectors : [],
          identityType: data.identityType || '',
          identityNumber: data.identityNumber || '',
          proofOfIdentity: data.proofOfIdentity || '',
          userPhoto: data.userPhoto || '',
          // Parent details
          fatherName: data.fatherName || '',
          fatherMiddleName: data.fatherMiddleName || '',
          fatherLastName: data.fatherLastName || '',
          motherFirstName: data.motherFirstName || '',
          motherMiddleName: data.motherMiddleName || '',
          motherMaidenName: data.motherMaidenName || '',
          identityDocumentPath: data.identityDocumentPath || '',
          // Additional fields
          nationality: data.nationality || 'Filipino',
          religion: data.religion || '',
          ethnicGroup: data.ethnicGroup || '',
          bloodType: data.bloodType || '',
          alias: data.alias || ''
        });

        // Set up photo preview if available
        if (data.userPhoto) {
          setProfileImagePreview(data.userPhoto);
        }

        // Set up document preview if available
        if (data.identityDocumentPath || data.proofOfIdentity) {
          const documentPath = data.identityDocumentPath || data.proofOfIdentity;
          console.log("Document path for preview:", documentPath);

          // You might want to set a state for document preview here if needed
        }
      } catch (err) {
        setError('Failed to load resident information');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchResident();
  }, [residentId]);

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

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      // Handle file uploads
      let proofOfIdentityUrl = formData.proofOfIdentity;
      let userPhotoUrl = formData.userPhoto;

      // Upload profile image if selected
      if (profileImageFile) {
        try {
          const profileUploadFormData = new FormData();
          profileUploadFormData.append('file', profileImageFile);
          profileUploadFormData.append('type', 'profile-photo');

          console.log('Uploading profile photo...');
          const profileUploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: profileUploadFormData,
          });

          if (!profileUploadResponse.ok) {
            const errorText = await profileUploadResponse.text();
            console.error('Profile upload error response:', errorText);
            throw new Error(`Failed to upload profile image: ${profileUploadResponse.status} ${profileUploadResponse.statusText}`);
          }

          const profileUploadData = await profileUploadResponse.json();
          console.log('Profile upload response:', profileUploadData);

          if (!profileUploadData.url) {
            throw new Error('Invalid response from upload endpoint - missing URL');
          }
          userPhotoUrl = profileUploadData.url;
          console.log('New user photo URL:', userPhotoUrl);
        } catch (error) {
          console.error("Profile image upload error:", error);
          throw new Error(error instanceof Error ? error.message : 'Failed to upload profile image');
        }
      }

      // Upload identity proof if selected
      if (selectedFile) {
        try {
          const uploadFormData = new FormData();
          uploadFormData.append('file', selectedFile);
          uploadFormData.append('type', 'proof-of-identity');

          console.log('Uploading proof of identity...');
          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: uploadFormData,
          });

          if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            console.error('Document upload error response:', errorText);
            throw new Error(`Failed to upload document: ${uploadResponse.status} ${uploadResponse.statusText}`);
          }

          const uploadData = await uploadResponse.json();
          console.log('Document upload response:', uploadData);

          if (!uploadData.url) {
            throw new Error('Invalid response from upload endpoint - missing URL');
          }

          // Get the document path
          const documentPath = uploadData.url;
          console.log('Document path:', documentPath);

          // Store the document path in identityDocumentPath field
          formData.identityDocumentPath = `DOCUMENT:${documentPath}`;
          console.log('Updated identityDocumentPath:', formData.identityDocumentPath);
        } catch (error) {
          console.error("Document upload error:", error);
          throw new Error(error instanceof Error ? error.message : 'Failed to upload document');
        }
      }

      // Prepare the data for submission - exclude fields not in the model
      const updatedData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        birthDate: new Date(formData.birthDate).toISOString(),
        gender: formData.gender,
        civilStatus: formData.civilStatus,
        address: formData.address.trim(),
        sectors: formData.sectors,
        voterInBarangay: formData.voterInBarangay,
        // headOfHousehold is removed as it's not in the Resident model
        // Optional fields - only include if they have values
        ...(formData.middleName?.trim() ? { middleName: formData.middleName.trim() } : {}),
        ...(formData.extensionName?.trim() ? { extensionName: formData.extensionName.trim() } : {}),
        ...(formData.contactNo?.trim() ? { contactNo: formData.contactNo.trim() } : {}),
        ...(formData.email?.trim() ? { email: formData.email.trim() } : {}),
        ...(formData.occupation?.trim() ? { occupation: formData.occupation.trim() } : {}),
        ...(formData.employmentStatus ? { employmentStatus: formData.employmentStatus } : {}),
        ...(formData.identityType ? { identityType: formData.identityType } : {}),
        ...(formData.identityNumber?.trim() ? { identityNumber: formData.identityNumber.trim() } : {}),
        // proofOfIdentity is removed as it's not in the Resident model
        ...(userPhotoUrl ? { userPhoto: userPhotoUrl } : {}),
        // Parent information - only include if they have values
        ...(formData.fatherName?.trim() ? { fatherName: formData.fatherName.trim() } : {}),
        ...(formData.fatherMiddleName?.trim() ? { fatherMiddleName: formData.fatherMiddleName.trim() } : {}),
        ...(formData.fatherLastName?.trim() ? { fatherLastName: formData.fatherLastName.trim() } : {}),
        ...(formData.motherFirstName?.trim() ? { motherFirstName: formData.motherFirstName.trim() } : {}),
        ...(formData.motherMiddleName?.trim() ? { motherMiddleName: formData.motherMiddleName.trim() } : {}),
        ...(formData.motherMaidenName?.trim() ? { motherMaidenName: formData.motherMaidenName.trim() } : {}),
        ...(formData.identityDocumentPath ? { identityDocumentPath: formData.identityDocumentPath } : {}),
        // Additional fields
        ...(formData.nationality?.trim() ? { nationality: formData.nationality.trim() } : {}),
        ...(formData.religion?.trim() ? { religion: formData.religion.trim() } : {}),
        ...(formData.ethnicGroup?.trim() ? { ethnicGroup: formData.ethnicGroup.trim() } : {}),
        ...(formData.bloodType?.trim() ? { bloodType: formData.bloodType.trim() } : {}),
        ...(formData.alias?.trim() ? { alias: formData.alias.trim() } : {})
      };

      // Log the data being sent
      console.log('Sending update data:', Object.keys(updatedData).join(', '));

      // Send the update request
      const response = await fetch(`/api/residents/${residentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      // Handle response
      let responseData;
      try {
        // First try to get the text
        const responseText = await response.text();
        console.log('Update response:', responseText);

        // Try to parse as JSON if there's content
        if (responseText) {
          try {
            responseData = JSON.parse(responseText);
          } catch (e) {
            console.error('Failed to parse response as JSON:', responseText);
            // If it's not JSON, just use the text
            responseData = { message: responseText };
          }
        } else {
          // Empty response
          responseData = { message: response.statusText || 'No response from server' };
        }
      } catch (error) {
        console.error('Error reading response:', error);
        throw new Error('Failed to read server response');
      }

      if (!response.ok) {
        throw new Error(responseData?.message || `Failed to update resident: ${response.statusText}`);
      }

      // Success - redirect to resident details page
      router.push(`/dashboard/residents/${residentId}`);
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while saving');
    } finally {
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
            <Link href={`/dashboard/residents/${residentId}`} className="text-[#006B5E] hover:text-[#F39C12] transition-colors mr-4">
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

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Profile Photo */}
            <div className="flex justify-center mb-2">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-[#006B5E] text-center">Profile Photo</h3>
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-300">
                    {profileImagePreview ? (
                      <img
                        src={profileImagePreview}
                        alt="Profile preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-4xl font-bold text-gray-300">
                        {formData.firstName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <label className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                    <Upload className="mr-2 h-4 w-4" />
                    {profileImageFile ? 'Change Photo' : 'Upload Photo'}
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleProfileImageChange}
                    />
                  </label>
                  {profileImageFile && (
                    <div className="text-sm text-gray-500">
                      <p>Selected file: {profileImageFile.name}</p>
                      <p className="text-xs text-blue-600">Click Save Changes button to upload</p>
                    </div>
                  )}
                  {formData.userPhoto && !profileImageFile && (
                    <div className="text-xs text-gray-500">
                      <p>Current photo: {formData.userPhoto.split('/').pop()}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {/* Personal Information */}
              <div className="space-y-6">
                <div className="border-b pb-2">
                  <h3 className="text-lg font-semibold text-[#006B5E]">Personal Information</h3>
                </div>

                <div className="space-y-4">
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
                      placeholder="Default: Filipino"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006B5E]"
                    />
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

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Blood Type</label>
                    <select
                      name="bloodType"
                      value={formData.bloodType}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006B5E]"
                    >
                      <option value="">Select Blood Type</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Contact and Additional Information */}
              <div className="space-y-6">
                <div className="border-b pb-2">
                  <h3 className="text-lg font-semibold text-[#006B5E]">Contact & Additional Information</h3>
                </div>

                <div className="space-y-4">
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
            </div>

            {/* Parent Information */}
            <div className="border-t pt-6">
              <div className="border-b pb-2 mb-6">
                <h3 className="text-lg font-semibold text-[#006B5E]">Parent Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {/* Father's Information */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-700">Father's Name</h4>

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

                {/* Mother's Information */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-700">Mother's Maiden Name</h4>

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
                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
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

            {/* Sectors and Status */}
            <div className="border-t pt-6">
              <div className="border-b pb-2 mb-6">
                <h3 className="text-lg font-semibold text-[#006B5E]">Sectors & Status</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sectors</label>
                    <div className="space-y-3 bg-gray-50 p-4 rounded-md">
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
                    {/* Debug info */}
                    <div className="text-xs text-gray-400 mt-1">
                      Selected sectors: {formData.sectors.join(', ')}
                    </div>
                  </div>

                  <div className="space-y-3 bg-gray-50 p-4 rounded-md">
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
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700">Proof of Identity Type</label>
                    <select
                      name="identityType"
                      value={formData.identityType}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006B5E]"
                    >
                      <option value="">Select Identity Type</option>
                      {IDENTITY_TYPES.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                    {/* Debug info */}
                    <div className="text-xs text-gray-400">
                      Current identity type: {formData.identityType}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Identity Number</label>
                    <input
                      type="text"
                      name="identityNumber"
                      value={formData.identityNumber}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006B5E]"
                      placeholder="Enter ID number if applicable"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">Upload Proof of Identity</label>
                    <div className="bg-gray-50 p-4 rounded-md">
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

                      {/* Show document preview */}
                      {(formData.proofOfIdentity || formData.identityDocumentPath) && !selectedFile && (
                        <div className="mt-3">
                          <span className="text-sm text-gray-500">Current file: </span>
                          <a
                            href={formData.proofOfIdentity || formData.identityDocumentPath?.replace('DOCUMENT:', '')}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            View current document
                          </a>

                          {/* Document preview for images */}
                          {(() => {
                            const docPath = formData.proofOfIdentity ||
                              (formData.identityDocumentPath?.replace('DOCUMENT:', ''));

                            if (!docPath) return null;

                            // Only show preview for image types
                            const isImage =
                              /\.(jpg|jpeg|png|gif|webp)$/i.test(docPath);

                            if (isImage) {
                              return (
                                <div className="mt-3 border rounded-lg overflow-hidden bg-gray-100 p-1">
                                  <img
                                    src={docPath.startsWith('/') ? docPath : `/${docPath}`}
                                    alt="Identity document"
                                    className="max-h-40 mx-auto object-contain"
                                  />
                                </div>
                              );
                            }

                            // For PDFs, show an icon
                            if (docPath.toLowerCase().endsWith('.pdf')) {
                              return (
                                <div className="mt-3 p-3 border rounded-lg bg-gray-50 flex items-center">
                                  <span className="text-red-500 mr-2">PDF Document</span>
                                </div>
                              );
                            }

                            return null;
                          })()}
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        Accepted file types: Images (JPG, PNG) and PDF documents
                      </p>
                      <p className="text-xs text-amber-600 mt-2">
                        Note: Documents are uploaded for verification purposes and will be displayed on the Identity & Documents tab of the resident profile. Only authorized personnel can view these documents.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 mt-4 border-t">
              <Link href={`/dashboard/residents/${residentId}`}>
                <Button variant="outline" type="button" disabled={isSaving}>
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                className="bg-[#006B5E] hover:bg-[#005046]"
                disabled={isSaving}
              >
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </PageTransition>
  );
} 