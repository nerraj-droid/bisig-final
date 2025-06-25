"use client";

import { useState, useEffect } from "react";
import { PageTransition } from "@/components/ui/page-transition";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ArrowLeft,
  Edit,
  Trash2,
  FileText,
  Download,
  User,
  Phone,
  Home,
  Users,
  FileCheck,
  UserCircle,
  FileOutput,
  Award,
  X
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

// Function to calculate age from birthdate
function calculateAge(birthDate: Date | string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

interface ExtendedResident {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  birthDate: Date;
  gender: string;
  civilStatus: string;
  contactNo: string | null;
  email: string | null;
  occupation: string | null;
  employmentStatus: string | null;
  unemploymentReason: string | null;
  educationalAttainment: string | null;
  address: string;
  headOfHousehold: boolean;
  voterInBarangay: boolean;
  sectors: string[];
  identityType: string | null;
  proofOfIdentity: string | null;
  extensionName: string | null;
  motherMaidenName: string | null;
  motherMiddleName: string | null;
  motherFirstName: string | null;
  fatherName: string | null;
  fatherLastName: string | null;
  fatherMiddleName: string | null;
  Household: {
    id: string;
    houseNo: string;
    street: string;
  } | null;
  identityNumber: string | null;
  userPhoto: string | null;
  identityIssueDate: string | null;
  identityExpiry: string | null;
  identityDocumentPath: string | null;
  nationality: string | null;
  religion: string | null;
  ethnicGroup: string | null;
  bloodType: string | null;
  alias: string | null;
  isDeceased: boolean | null;
  dateOfDeath: string | null;
  [key: string]: any; // For any other properties
}

type TabType = 'personal' | 'contact' | 'family' | 'household' | 'identity' | 'certificates';

export default function ResidentDetailClient({ resident }: { resident: ExtendedResident }) {
  const [activeTab, setActiveTab] = useState<TabType>('personal');
  const [selectedCertificate, setSelectedCertificate] = useState<string>('');
  const [purpose, setPurpose] = useState<string>('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeceasedModalOpen, setIsDeceasedModalOpen] = useState(false);
  const [deceasedDate, setDeceasedDate] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();

  // Debug info about the resident data
  useEffect(() => {
    console.log("Client-page resident data:", {
      identityType: resident.identityType,
      proofOfIdentity: resident.proofOfIdentity,
      identityDocumentPath: resident.identityDocumentPath,
      sectors: resident.sectors,
      sectorType: typeof resident.sectors,
      sectorIsArray: Array.isArray(resident.sectors),
      sectorLength: resident.sectors ? resident.sectors.length : 0
    });
  }, [resident]);

  const fullName = `${resident.lastName}, ${resident.firstName} ${resident.middleName || ''}`.trim();
  const birthDate = new Date(resident.birthDate).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const handleGenerateCertificate = () => {
    if (!selectedCertificate || !purpose.trim()) return;

    // Map the selected certificate to the correct type parameter
    let certificateType;
    switch (selectedCertificate) {
      case 'barangay-clearance':
        certificateType = 'clearance';
        break;
      case 'certificate-of-residency':
        certificateType = 'residency';
        break;
      case 'certificate-of-indigency':
        certificateType = 'indigency';
        break;
      case 'business-permit':
        certificateType = 'business';
        break;
      default:
        certificateType = selectedCertificate;
    }

    // Navigate to the certificate generation page with the resident ID, certificate type, and purpose
    router.push(`/dashboard/certificates/new?type=${certificateType}&residentId=${resident.id}&purpose=${encodeURIComponent(purpose.trim())}`);
  };

  // Function to mark resident as deceased
  const handleMarkDeceased = async () => {
    if (!deceasedDate) {
      setError("Please select a date of death");
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/residents/${resident.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isDeceased: true,
          dateOfDeath: deceasedDate
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update resident status');
      }

      setSuccessMessage("Resident has been marked as deceased");
      // Close the modal
      setIsDeceasedModalOpen(false);
      // Refresh the page after 1 second to show updated data
      setTimeout(() => {
        router.refresh();
      }, 1000);
    } catch (error) {
      console.error('Error updating resident:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
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
            <h1 className="text-xl sm:text-2xl font-bold text-[#006B5E]">RESIDENT DETAILS</h1>
          </div>
          <div className="flex gap-2">
            <Link href={`/dashboard/residents/${resident.id}/edit`}>
              <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                <Edit className="mr-2 h-4 w-4" /> Edit
              </Button>
            </Link>
            <Button 
              variant="outline" 
              className={`border-red-500 text-red-500 hover:bg-red-50 ${resident.isDeceased === true ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => setIsDeceasedModalOpen(true)}
              disabled={resident.isDeceased === true}
            >
              <span className="mr-2">⚰️</span> Mark as Deceased
            </Button>
            <Link href={`/dashboard/residents/${resident.id}/delete`}>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            </Link>
          </div>
        </div>

        {/* Success message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6 flex justify-between items-center">
            <span>{successMessage}</span>
            <button 
              onClick={() => setSuccessMessage(null)} 
              className="text-green-700 hover:text-green-900"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Resident Details */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-[#006B5E] p-4 sm:p-6 text-white">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              {resident.userPhoto ? (
                <div className="w-20 h-20 rounded-full bg-white overflow-hidden border-2 border-white">
                  {(() => {
                    // Handle photo path normalization
                    let photoPath = resident.userPhoto;

                    // Ensure it starts with a slash
                    if (!photoPath.startsWith('/')) {
                      photoPath = `/${photoPath}`;
                    }

                    // Make sure uploads directory is included
                    if (!photoPath.includes('/uploads/')) {
                      photoPath = `/uploads/profile-photos/${photoPath.split('/').pop()}`;
                    }

                    return (
                      <Image
                        src={photoPath}
                        alt={resident.firstName}
                        width={80}
                        height={80}
                        className="object-cover w-full h-full"
                        unoptimized
                      />
                    );
                  })()}
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-white text-[#006B5E] flex items-center justify-center text-3xl font-bold">
                  {resident.firstName.charAt(0)}
                </div>
              )}
              <div className="text-center sm:text-left">
                <h2 className="text-xl sm:text-2xl font-bold">{fullName}</h2>
                <p className="text-white/80">ID: {resident.id}</p>
                <div className="mt-2 flex flex-wrap justify-center sm:justify-start gap-2">
                  <span className="inline-block bg-[#F39C12] text-white px-3 py-1 rounded-full text-sm">
                    {resident.gender}
                  </span>
                  
                  {resident.isDeceased === true && (
                    <span className="inline-block bg-red-600 text-white px-3 py-1 rounded-full text-sm">
                      Deceased
                      {resident.dateOfDeath && (
                        <span className="ml-1 text-xs">
                          ({new Date(resident.dateOfDeath).toLocaleDateString()})
                        </span>
                      )}
                    </span>
                  )}
                </div>
                {resident.sectors && resident.sectors.length > 0 && (
                  <div className="mt-2 flex flex-wrap justify-center sm:justify-start gap-2">
                    {resident.sectors.map((sector: string, index: number) => (
                      <span key={index} className="inline-block bg-white/20 text-white px-3 py-1 rounded-full text-xs">
                        {sector}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              <button
                className={`px-4 py-3 font-medium text-sm flex items-center ${activeTab === 'personal'
                  ? 'border-b-2 border-[#006B5E] text-[#006B5E]'
                  : 'text-gray-500 hover:text-[#006B5E]'
                  }`}
                onClick={() => setActiveTab('personal')}
              >
                <User className="mr-2 h-4 w-4" />
                Personal Information
              </button>
              <button
                className={`px-4 py-3 font-medium text-sm flex items-center ${activeTab === 'contact'
                  ? 'border-b-2 border-[#006B5E] text-[#006B5E]'
                  : 'text-gray-500 hover:text-[#006B5E]'
                  }`}
                onClick={() => setActiveTab('contact')}
              >
                <Phone className="mr-2 h-4 w-4" />
                Contact Information
              </button>
              <button
                className={`px-4 py-3 font-medium text-sm flex items-center ${activeTab === 'family'
                  ? 'border-b-2 border-[#006B5E] text-[#006B5E]'
                  : 'text-gray-500 hover:text-[#006B5E]'
                  }`}
                onClick={() => setActiveTab('family')}
              >
                <Users className="mr-2 h-4 w-4" />
                Family Background
              </button>
              <button
                className={`px-4 py-3 font-medium text-sm flex items-center ${activeTab === 'household'
                  ? 'border-b-2 border-[#006B5E] text-[#006B5E]'
                  : 'text-gray-500 hover:text-[#006B5E]'
                  }`}
                onClick={() => setActiveTab('household')}
              >
                <Home className="mr-2 h-4 w-4" />
                Household Information
              </button>
              <button
                className={`px-4 py-3 font-medium text-sm flex items-center ${activeTab === 'identity'
                  ? 'border-b-2 border-[#006B5E] text-[#006B5E]'
                  : 'text-gray-500 hover:text-[#006B5E]'
                  }`}
                onClick={() => setActiveTab('identity')}
              >
                <FileCheck className="mr-2 h-4 w-4" />
                Identity & Documents
              </button>
              <button
                className={`px-4 py-3 font-medium text-sm flex items-center ${activeTab === 'certificates'
                  ? 'border-b-2 border-[#006B5E] text-[#006B5E]'
                  : 'text-gray-500 hover:text-[#006B5E]'
                  }`}
                onClick={() => setActiveTab('certificates')}
              >
                <Award className="mr-2 h-4 w-4" />
                Certificates
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Personal Information Tab */}
            {activeTab === 'personal' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-[#006B5E] mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-[#006B5E] mb-3">Basic Information</h4>
                    <div className="space-y-3">
                      <div className="grid grid-cols-3">
                        <span className="text-gray-500">Full Name:</span>
                        <span className="col-span-2 font-medium">{fullName}</span>
                      </div>
                      {resident.alias && (
                        <div className="grid grid-cols-3">
                          <span className="text-gray-500">Alias/Nickname:</span>
                          <span className="col-span-2 font-medium">{resident.alias}</span>
                        </div>
                      )}
                      <div className="grid grid-cols-3">
                        <span className="text-gray-500">Birthdate:</span>
                        <span className="col-span-2 font-medium">{birthDate}</span>
                      </div>
                      <div className="grid grid-cols-3">
                        <span className="text-gray-500">Age:</span>
                        <span className="col-span-2 font-medium">{calculateAge(resident.birthDate)}</span>
                      </div>
                      <div className="grid grid-cols-3">
                        <span className="text-gray-500">Gender:</span>
                        <span className="col-span-2 font-medium">{resident.gender}</span>
                      </div>
                      <div className="grid grid-cols-3">
                        <span className="text-gray-500">Civil Status:</span>
                        <span className="col-span-2 font-medium">{resident.civilStatus}</span>
                      </div>
                      <div className="grid grid-cols-3">
                        <span className="text-gray-500">Nationality:</span>
                        <span className="col-span-2 font-medium">{resident.nationality || 'Filipino'}</span>
                      </div>
                      {resident.bloodType && (
                        <div className="grid grid-cols-3">
                          <span className="text-gray-500">Blood Type:</span>
                          <span className="col-span-2 font-medium">{resident.bloodType}</span>
                        </div>
                      )}
                      {resident.religion && (
                        <div className="grid grid-cols-3">
                          <span className="text-gray-500">Religion:</span>
                          <span className="col-span-2 font-medium">{resident.religion}</span>
                        </div>
                      )}
                      {resident.ethnicGroup && (
                        <div className="grid grid-cols-3">
                          <span className="text-gray-500">Ethnic Group:</span>
                          <span className="col-span-2 font-medium">{resident.ethnicGroup}</span>
                        </div>
                      )}
                      <div className="grid grid-cols-3">
                        <span className="text-gray-500">Educational Attainment:</span>
                        <span className="col-span-2 font-medium">{resident.educationalAttainment || 'N/A'}</span>
                      </div>
                      <div className="grid grid-cols-3">
                        <span className="text-gray-500">Sectors:</span>
                        <div className="col-span-2">
                          {Array.isArray(resident.sectors) && resident.sectors.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {resident.sectors.map((sector: string, index: number) => (
                                <span key={index} className="inline-block bg-[#006B5E]/10 text-[#006B5E] px-2 py-1 rounded-full text-xs font-medium">
                                  {sector.replace(/_/g, ' ')}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="font-medium">None</span>
                          )}
                        </div>
                      </div>
                      
                      {/* Deceased status */}
                      {resident.isDeceased === true && (
                        <div className="grid grid-cols-3 mt-3 border-t pt-3">
                          <span className="text-gray-500">Vital Status:</span>
                          <div className="col-span-2">
                            <span className="inline-flex items-center bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">
                              Deceased
                              {resident.dateOfDeath && (
                                <span className="ml-1">
                                  on {new Date(resident.dateOfDeath).toLocaleDateString('en-US', {
                                    month: 'long',
                                    day: 'numeric', 
                                    year: 'numeric'
                                  })}
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-[#006B5E] mb-3">Additional Details</h4>
                    <div className="space-y-3">
                      <div className="grid grid-cols-3">
                        <span className="text-gray-500">Extension Name:</span>
                        <span className="col-span-2 font-medium">{resident.extensionName || 'N/A'}</span>
                      </div>
                      <div className="grid grid-cols-3">
                        <span className="text-gray-500">Address:</span>
                        <span className="col-span-2 font-medium">{resident.address || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Contact Information Tab */}
            {activeTab === 'contact' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-[#006B5E] mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-[#006B5E] mb-3">Contact Details</h4>
                    <div className="space-y-3">
                      <div className="grid grid-cols-3">
                        <span className="text-gray-500">Contact Number:</span>
                        <span className="col-span-2 font-medium">{resident.contactNo || 'N/A'}</span>
                      </div>
                      <div className="grid grid-cols-3">
                        <span className="text-gray-500">Email:</span>
                        <span className="col-span-2 font-medium">{resident.email || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-[#006B5E] mb-3">Employment Details</h4>
                    <div className="space-y-3">
                      <div className="grid grid-cols-3">
                        <span className="text-gray-500">Occupation:</span>
                        <span className="col-span-2 font-medium">{resident.occupation || 'N/A'}</span>
                      </div>
                      <div className="grid grid-cols-3">
                        <span className="text-gray-500">Employment Status:</span>
                        <span className="col-span-2 font-medium">{resident.employmentStatus || 'N/A'}</span>
                      </div>
                      {resident.employmentStatus === 'Unemployed' && resident.unemploymentReason && (
                        <div className="grid grid-cols-3">
                          <span className="text-gray-500">Unemployment Reason:</span>
                          <span className="col-span-2 font-medium">{resident.unemploymentReason}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Family Background Tab */}
            {activeTab === 'family' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-[#006B5E] mb-4">Family Background</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-[#006B5E] mb-3">Mother's Information</h4>
                    <div className="space-y-3">
                      <div className="grid grid-cols-3">
                        <span className="text-gray-500">First Name:</span>
                        <span className="col-span-2 font-medium">{resident.motherFirstName || 'N/A'}</span>
                      </div>
                      <div className="grid grid-cols-3">
                        <span className="text-gray-500">Middle Name:</span>
                        <span className="col-span-2 font-medium">{resident.motherMiddleName || 'N/A'}</span>
                      </div>
                      <div className="grid grid-cols-3">
                        <span className="text-gray-500">Maiden Name:</span>
                        <span className="col-span-2 font-medium">{resident.motherMaidenName || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-[#006B5E] mb-3">Father's Information</h4>
                    <div className="space-y-3">
                      <div className="grid grid-cols-3">
                        <span className="text-gray-500">First Name:</span>
                        <span className="col-span-2 font-medium">{resident.fatherName || 'N/A'}</span>
                      </div>
                      <div className="grid grid-cols-3">
                        <span className="text-gray-500">Middle Name:</span>
                        <span className="col-span-2 font-medium">{resident.fatherMiddleName || 'N/A'}</span>
                      </div>
                      <div className="grid grid-cols-3">
                        <span className="text-gray-500">Last Name:</span>
                        <span className="col-span-2 font-medium">{resident.fatherLastName || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Household Information Tab */}
            {activeTab === 'household' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-[#006B5E] mb-4">Household Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-[#006B5E] mb-3">Household Status</h4>
                    <div className="space-y-3">
                      <div className="grid grid-cols-3">
                        <span className="text-gray-500">Head of Household:</span>
                        <span className="col-span-2 font-medium">{resident.headOfHousehold ? 'Yes' : 'No'}</span>
                      </div>
                      <div className="grid grid-cols-3">
                        <span className="text-gray-500">Voter in Barangay:</span>
                        <span className="col-span-2 font-medium">{resident.voterInBarangay ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-[#006B5E] mb-3">Household Details</h4>
                    <div className="space-y-3">
                      {resident.Household ? (
                        <>
                          <div className="grid grid-cols-3">
                            <span className="text-gray-500">Household ID:</span>
                            <span className="col-span-2 font-medium">{resident.Household.id}</span>
                          </div>
                          <div className="grid grid-cols-3">
                            <span className="text-gray-500">House Number:</span>
                            <span className="col-span-2 font-medium">{resident.Household.houseNo}</span>
                          </div>
                          <div className="grid grid-cols-3">
                            <span className="text-gray-500">Street:</span>
                            <span className="col-span-2 font-medium">{resident.Household.street}</span>
                          </div>
                        </>
                      ) : (
                        <div className="text-gray-500">No household information available</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Identity & Documents Tab */}
            {activeTab === 'identity' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-[#006B5E] mb-4">Identity & Documents</h3>

                {/* Debug Information (for development) */}
                <div className="text-xs text-gray-400 mt-2 hidden">
                  <p>id: {resident.id}</p>
                  <p>identityType: {resident.identityType}</p>
                  <p>identityNumber: {resident.identityNumber}</p>
                  <p>identityDocumentPath: {resident.identityDocumentPath}</p>
                  <p>proofOfIdentity: {resident.proofOfIdentity}</p>
                  <p>occupation: {resident.occupation}</p>
                  <p>employmentStatus: {resident.employmentStatus}</p>
                  <p>sectors: {resident.sectors?.join(', ')}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-[#006B5E] mb-3">Identity Information</h4>
                    {resident.identityType ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-3">
                          <span className="text-gray-500">Identity Type:</span>
                          <span className="col-span-2 font-semibold">
                            {(() => {
                              const type = resident.identityType;
                              if (!type) return 'N/A';
                              return type.replace(/_/g, ' ')
                                .split(' ')
                                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toUpperCase())
                                .join(' ');
                            })()}
                          </span>
                        </div>
                        <div className="grid grid-cols-3">
                          <span className="text-gray-500">Identity Number:</span>
                          <span className="col-span-2 font-semibold">
                            {(() => {
                              if (!resident.identityNumber) return 'N/A';

                              // Handle case where document path is stored in identityNumber
                              if (resident.identityNumber.includes('DOCUMENT:')) {
                                const parts = resident.identityNumber.split('|');
                                // Filter out the document parts
                                const idParts = parts.filter(part => !part.startsWith('DOCUMENT:'));
                                return idParts.length > 0 ? idParts.join('|') : 'N/A';
                              }

                              return resident.identityNumber;
                            })()}
                          </span>
                        </div>
                        <div className="grid grid-cols-3">
                          <span className="text-gray-500">Full Name:</span>
                          <span className="col-span-2 font-semibold">{fullName}</span>
                        </div>
                        <div className="grid grid-cols-3">
                          <span className="text-gray-500">Issue Date:</span>
                          <span className="col-span-2 font-semibold">{resident.identityIssueDate || 'Not specified'}</span>
                        </div>
                        {resident.identityExpiry && (
                          <div className="grid grid-cols-3">
                            <span className="text-gray-500">Expiry Date:</span>
                            <span className="col-span-2 font-semibold">{resident.identityExpiry}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-4 rounded-lg bg-gray-100 border border-dashed border-gray-300 text-center">
                        <UserCircle className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">No identity information provided</p>
                      </div>
                    )}
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-[#006B5E] mb-3">Documents</h4>
                    {resident.proofOfIdentity || resident.identityDocumentPath || (resident.identityNumber?.includes('DOCUMENT:')) ? (
                      <div>
                        <span className="text-gray-500 block mb-2">Proof of Identity:</span>
                        <div className="mt-2">
                          {(() => {
                            // Get document path from any available source
                            let documentPath = resident.proofOfIdentity || resident.identityDocumentPath;

                            // Check identityNumber as a fallback
                            if (!documentPath && resident.identityNumber?.includes('DOCUMENT:')) {
                              if (resident.identityNumber.startsWith('DOCUMENT:')) {
                                documentPath = resident.identityNumber.substring(9);
                              } else {
                                // Handle case where DOCUMENT: is after a pipe character (ID|DOCUMENT:path)
                                const parts = resident.identityNumber.split('|');
                                for (const part of parts) {
                                  if (part.startsWith('DOCUMENT:')) {
                                    documentPath = part.substring(9);
                                    break;
                                  }
                                }
                              }
                            }

                            // Extract from DOCUMENT: prefix if needed
                            if (documentPath && documentPath.startsWith('DOCUMENT:')) {
                              documentPath = documentPath.substring(9);
                            }

                            console.log("Original document path:", documentPath);

                            if (!documentPath) {
                              return (
                                <div className="p-4 rounded-lg bg-gray-100 border border-dashed border-gray-300 text-center">
                                  <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                  <p className="text-gray-500">Document path is invalid</p>
                                </div>
                              );
                            }

                            // Ensure the path starts with a slash if it's a relative path
                            let normalizedPath = documentPath.startsWith('/') ? documentPath : `/${documentPath}`;

                            // If the path doesn't include 'uploads' but should, fix it
                            if (!normalizedPath.includes('/uploads/') && !normalizedPath.startsWith('/uploads/')) {
                              normalizedPath = `/uploads/proof-of-identity/${normalizedPath.split('/').pop()}`;
                              console.log("Fixed path to include uploads directory:", normalizedPath);
                            }

                            console.log("Final normalized path:", normalizedPath);

                            if (documentPath.toLowerCase().endsWith('.pdf')) {
                              return (
                                <a
                                  href={normalizedPath}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center text-blue-600 hover:text-blue-800"
                                >
                                  <FileText className="h-12 w-12 mr-2" />
                                  <div>
                                    <span className="block underline">View PDF Document</span>
                                    <Button size="sm" variant="outline" className="mt-2 flex items-center">
                                      <Download className="mr-1 h-4 w-4" /> Download
                                    </Button>
                                  </div>
                                </a>
                              );
                            } else {
                              return (
                                <div className="space-y-4">
                                  <div className="relative w-full aspect-video border rounded-lg overflow-hidden bg-gray-100">
                                    <Image
                                      src={normalizedPath}
                                      alt="Proof of Identity"
                                      fill
                                      style={{ objectFit: 'contain' }}
                                      unoptimized
                                    />
                                  </div>
                                  <div className="flex space-x-2">
                                    <a
                                      href={normalizedPath}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex-1"
                                    >
                                      <Button size="sm" variant="outline" className="w-full flex items-center justify-center">
                                        <FileText className="mr-1 h-4 w-4" /> View Full Size
                                      </Button>
                                    </a>
                                    <a
                                      href={normalizedPath}
                                      download
                                      className="flex-1"
                                    >
                                      <Button size="sm" variant="outline" className="w-full flex items-center justify-center">
                                        <Download className="mr-1 h-4 w-4" /> Download
                                      </Button>
                                    </a>
                                  </div>
                                </div>
                              );
                            }
                          })()}
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-lg bg-gray-100 border border-dashed border-gray-300 text-center">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">No documents available</p>
                      </div>
                    )}
                  </div>
                </div>

                {resident.userPhoto && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-[#006B5E] mb-3">User Photo</h4>
                    <div className="flex flex-col items-center md:flex-row md:items-start gap-4">
                      <div className="relative w-48 h-48 border rounded-lg overflow-hidden bg-gray-100">
                        {(() => {
                          // Handle photo path normalization
                          let photoPath = resident.userPhoto;

                          // Ensure it starts with a slash
                          if (!photoPath.startsWith('/')) {
                            photoPath = `/${photoPath}`;
                          }

                          // Make sure uploads directory is included
                          if (!photoPath.includes('/uploads/')) {
                            photoPath = `/uploads/profile-photos/${photoPath.split('/').pop()}`;
                          }

                          console.log("User photo path:", photoPath);

                          return (
                            <Image
                              src={photoPath}
                              alt="User Photo"
                              fill
                              style={{ objectFit: 'cover' }}
                              unoptimized
                            />
                          );
                        })()}
                      </div>
                      <div className="flex flex-col space-y-2">
                        {(() => {
                          // Use the same normalized path for links
                          let photoPath = resident.userPhoto;

                          // Ensure it starts with a slash
                          if (!photoPath.startsWith('/')) {
                            photoPath = `/${photoPath}`;
                          }

                          // Make sure uploads directory is included
                          if (!photoPath.includes('/uploads/')) {
                            photoPath = `/uploads/profile-photos/${photoPath.split('/').pop()}`;
                          }

                          return (
                            <>
                              <a
                                href={photoPath}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Button size="sm" variant="outline" className="w-full flex items-center justify-center">
                                  <FileText className="mr-1 h-4 w-4" /> View Full Size
                                </Button>
                              </a>
                              <a
                                href={photoPath}
                                download
                              >
                                <Button size="sm" variant="outline" className="w-full flex items-center justify-center">
                                  <Download className="mr-1 h-4 w-4" /> Download
                                </Button>
                              </a>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        Identity documents and photos are displayed here for verification purposes. These documents were uploaded during registration or profile updates and are available only to authorized personnel.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Certificates Tab */}
            {activeTab === 'certificates' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-[#006B5E] mb-4">Generate Certificate</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-[#006B5E] mb-3">Available Certificates</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Select Certificate Type
                        </label>
                        <select
                          value={selectedCertificate}
                          onChange={(e) => setSelectedCertificate(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006B5E]"
                        >
                          <option value="">Select a certificate type</option>
                          <option value="barangay-clearance">Barangay Clearance</option>
                          <option value="certificate-of-residency">Certificate of Residency</option>
                          <option value="certificate-of-indigency">Certificate of Indigency</option>
                          <option value="business-permit">Business Permit</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Purpose of Certificate <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={purpose}
                          onChange={(e) => setPurpose(e.target.value)}
                          placeholder="e.g., applying for employment, school enrollment, loan application"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006B5E] min-h-[80px] resize-y"
                          maxLength={250}
                        />
                        <div className="flex justify-between mt-1">
                          <p className="text-xs text-gray-500">
                            Enter purpose in plain form (e.g., "employment application" not "for employment application").
                          </p>
                          <p className="text-xs text-gray-500">
                            {purpose.length}/250
                          </p>
                        </div>
                      </div>

                      <Button
                        onClick={handleGenerateCertificate}
                        disabled={!selectedCertificate || !purpose.trim()}
                        className="bg-[#006B5E] hover:bg-[#005046] w-full"
                      >
                        <FileOutput className="mr-2 h-4 w-4" />
                        Generate Certificate
                      </Button>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-[#006B5E] mb-3">Certificate Information</h4>
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">
                        The certificate will include the following information:
                      </p>
                      <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                        <li>Full Name: <span className="font-medium">{fullName}</span></li>
                        <li>Address: <span className="font-medium">{resident.address}</span></li>
                        <li>Gender: <span className="font-medium">{resident.gender}</span></li>
                        <li>Civil Status: <span className="font-medium">{resident.civilStatus}</span></li>
                        <li>Birth Date: <span className="font-medium">{birthDate}</span></li>
                      </ul>

                      {purpose && (
                        <div className="mt-4 p-3 bg-[#006B5E]/10 rounded-lg border border-[#006B5E]/20">
                          <h5 className="text-sm font-semibold text-[#006B5E] mb-1">Certificate Purpose:</h5>
                          <p className="text-sm">"{purpose.trim()}"</p>
                          <p className="text-xs text-gray-500 mt-2">
                            Your purpose will be professionally formatted in the certificate as:
                            <span className="font-medium"> "for the purpose of {purpose.trim().charAt(0).toUpperCase() + purpose.trim().slice(1)}"</span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        Generating a certificate will create an official document for this resident. The certificate will be pre-filled with the resident's information and include a QR code for verification.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Deceased Modal */}
      <DeceasedModal
        isOpen={isDeceasedModalOpen}
        onClose={() => setIsDeceasedModalOpen(false)}
        onConfirm={handleMarkDeceased}
        deceasedDate={deceasedDate}
        setDeceasedDate={setDeceasedDate}
        isLoading={isLoading}
        error={error}
      />
    </PageTransition>
  );
}

// Add Modal component at the end of the file
function DeceasedModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  deceasedDate, 
  setDeceasedDate, 
  isLoading, 
  error 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void; 
  deceasedDate: string; 
  setDeceasedDate: (date: string) => void; 
  isLoading: boolean;
  error: string | null;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Mark Resident as Deceased</h3>
        
        <p className="text-gray-700 mb-4">
          You are about to mark this resident as deceased. This action will update their status in the system.
        </p>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date of Death <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={deceasedDate}
            onChange={(e) => setDeceasedDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            max={new Date().toISOString().split('T')[0]} // Prevent future dates
            required
          />
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
            {error}
          </div>
        )}
        
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!deceasedDate || isLoading}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              "Confirm"
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 