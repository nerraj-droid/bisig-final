"use client";

import { useState } from "react";
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
  Award
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

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
  [key: string]: any; // For any other properties
}

type TabType = 'personal' | 'contact' | 'family' | 'household' | 'identity' | 'certificates';

export default function ResidentDetailClient({ resident }: { resident: ExtendedResident }) {
  const [activeTab, setActiveTab] = useState<TabType>('personal');
  const [selectedCertificate, setSelectedCertificate] = useState<string>('');
  const router = useRouter();

  const fullName = `${resident.lastName}, ${resident.firstName} ${resident.middleName || ''}`.trim();
  const birthDate = resident.birthDate ? new Date(resident.birthDate).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : 'N/A';

  const handleGenerateCertificate = () => {
    if (!selectedCertificate) return;
    
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
    
    // Navigate to the certificate generation page with the resident ID and certificate type
    router.push(`/dashboard/certificates/new?type=${certificateType}&residentId=${resident.id}`);
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
            <Link href={`/dashboard/residents/${resident.id}/delete`}>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            </Link>
          </div>
        </div>

        {/* Resident Details */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-[#006B5E] p-4 sm:p-6 text-white">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div className="w-20 h-20 rounded-full bg-white text-[#006B5E] flex items-center justify-center text-3xl font-bold">
                {resident.firstName.charAt(0)}
              </div>
              <div className="text-center sm:text-left">
                <h2 className="text-xl sm:text-2xl font-bold">{fullName}</h2>
                <p className="text-white/80">ID: {resident.id}</p>
                <div className="mt-2 inline-block bg-[#F39C12] text-white px-3 py-1 rounded-full text-sm">
                  {resident.gender}
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
                className={`px-4 py-3 font-medium text-sm flex items-center ${
                  activeTab === 'personal'
                    ? 'border-b-2 border-[#006B5E] text-[#006B5E]'
                    : 'text-gray-500 hover:text-[#006B5E]'
                }`}
                onClick={() => setActiveTab('personal')}
              >
                <User className="mr-2 h-4 w-4" />
                Personal Information
              </button>
              <button
                className={`px-4 py-3 font-medium text-sm flex items-center ${
                  activeTab === 'contact'
                    ? 'border-b-2 border-[#006B5E] text-[#006B5E]'
                    : 'text-gray-500 hover:text-[#006B5E]'
                }`}
                onClick={() => setActiveTab('contact')}
              >
                <Phone className="mr-2 h-4 w-4" />
                Contact Information
              </button>
              <button
                className={`px-4 py-3 font-medium text-sm flex items-center ${
                  activeTab === 'family'
                    ? 'border-b-2 border-[#006B5E] text-[#006B5E]'
                    : 'text-gray-500 hover:text-[#006B5E]'
                }`}
                onClick={() => setActiveTab('family')}
              >
                <Users className="mr-2 h-4 w-4" />
                Family Background
              </button>
              <button
                className={`px-4 py-3 font-medium text-sm flex items-center ${
                  activeTab === 'household'
                    ? 'border-b-2 border-[#006B5E] text-[#006B5E]'
                    : 'text-gray-500 hover:text-[#006B5E]'
                }`}
                onClick={() => setActiveTab('household')}
              >
                <Home className="mr-2 h-4 w-4" />
                Household Information
              </button>
              <button
                className={`px-4 py-3 font-medium text-sm flex items-center ${
                  activeTab === 'identity'
                    ? 'border-b-2 border-[#006B5E] text-[#006B5E]'
                    : 'text-gray-500 hover:text-[#006B5E]'
                }`}
                onClick={() => setActiveTab('identity')}
              >
                <FileCheck className="mr-2 h-4 w-4" />
                Identity & Documents
              </button>
              <button
                className={`px-4 py-3 font-medium text-sm flex items-center ${
                  activeTab === 'certificates'
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
                    <h4 className="font-medium text-[#006B5E] mb-3">Basic Details</h4>
                    <div className="space-y-3">
                      <div className="grid grid-cols-3">
                        <span className="text-gray-500">First Name:</span>
                        <span className="col-span-2 font-medium">{resident.firstName}</span>
                      </div>
                      <div className="grid grid-cols-3">
                        <span className="text-gray-500">Middle Name:</span>
                        <span className="col-span-2 font-medium">{resident.middleName || 'N/A'}</span>
                      </div>
                      <div className="grid grid-cols-3">
                        <span className="text-gray-500">Last Name:</span>
                        <span className="col-span-2 font-medium">{resident.lastName}</span>
                      </div>
                      <div className="grid grid-cols-3">
                        <span className="text-gray-500">Extension Name:</span>
                        <span className="col-span-2 font-medium">{resident.extensionName || 'N/A'}</span>
                      </div>
                      <div className="grid grid-cols-3">
                        <span className="text-gray-500">Birth Date:</span>
                        <span className="col-span-2 font-medium">{birthDate}</span>
                      </div>
                      <div className="grid grid-cols-3">
                        <span className="text-gray-500">Gender:</span>
                        <span className="col-span-2 font-medium">{resident.gender}</span>
                      </div>
                      <div className="grid grid-cols-3">
                        <span className="text-gray-500">Civil Status:</span>
                        <span className="col-span-2 font-medium">{resident.civilStatus}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-[#006B5E] mb-3">Additional Details</h4>
                    <div className="space-y-3">
                      <div className="grid grid-cols-3">
                        <span className="text-gray-500">Nationality:</span>
                        <span className="col-span-2 font-medium">{resident.nationality || 'N/A'}</span>
                      </div>
                      <div className="grid grid-cols-3">
                        <span className="text-gray-500">Educational Attainment:</span>
                        <span className="col-span-2 font-medium">{resident.educationalAttainment || 'N/A'}</span>
                      </div>
                      <div className="grid grid-cols-3">
                        <span className="text-gray-500">Sectors:</span>
                        <div className="col-span-2">
                          {resident.sectors && resident.sectors.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {resident.sectors.map((sector: string, index: number) => (
                                <span key={index} className="inline-block bg-[#006B5E]/10 text-[#006B5E] px-2 py-1 rounded-full text-xs font-medium">
                                  {sector}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="font-medium">None</span>
                          )}
                        </div>
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
                      <div className="grid grid-cols-3">
                        <span className="text-gray-500">Address:</span>
                        <span className="col-span-2 font-medium">{resident.address || 'N/A'}</span>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-[#006B5E] mb-3">Identity Information</h4>
                    <div className="space-y-3">
                      <div className="grid grid-cols-3">
                        <span className="text-gray-500">Identity Type:</span>
                        <span className="col-span-2 font-medium">{resident.identityType || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-[#006B5E] mb-3">Documents</h4>
                    <div className="space-y-3">
                      {resident.proofOfIdentity ? (
                        <div>
                          <span className="text-gray-500 block mb-2">Proof of Identity:</span>
                          <div className="mt-2">
                            <a 
                              href={resident.proofOfIdentity} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center text-blue-600 hover:text-blue-800"
                            >
                              {resident.proofOfIdentity.toLowerCase().endsWith('.pdf') ? (
                                <FileText className="mr-1 h-4 w-4" />
                              ) : (
                                <div className="relative w-32 h-32 mr-2 border rounded overflow-hidden">
                                  <Image 
                                    src={resident.proofOfIdentity} 
                                    alt="Proof of Identity" 
                                    fill 
                                    style={{ objectFit: 'cover' }} 
                                  />
                                </div>
                              )}
                              <div className="ml-2">
                                <span className="block underline">View Document</span>
                                <Button size="sm" variant="outline" className="mt-2 flex items-center">
                                  <Download className="mr-1 h-4 w-4" /> Download
                                </Button>
                              </div>
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-500">No documents available</div>
                      )}
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
                      
                      <Button 
                        onClick={handleGenerateCertificate} 
                        disabled={!selectedCertificate}
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
    </PageTransition>
  );
} 