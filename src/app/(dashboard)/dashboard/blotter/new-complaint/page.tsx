"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { PageTransition } from "@/components/ui/page-transition";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Save, Trash, Search, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { BlotterCaseStatus, BlotterPriority, BlotterPartyType } from "@/lib/enums";
import { createComplaint } from "./actions";
import ResidentSearchModal from "../components/resident-search-modal";
import LocationPicker from "../components/location-picker";

type Resident = {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  address: string;
  contactNo: string | null;
  email: string | null;
};

// Add type for officials
type Official = {
  id: string;
  name: string;
  position?: string;
};

type FormValues = {
  reportDate: string;
  complainantFirstName: string;
  complainantMiddleName?: string;
  complainantLastName: string;
  complainantAddress: string;
  complainantContactNumber?: string;
  complainantEmail?: string;
  isResident: boolean;
  complaintType: string;
  complaintDescription: string;
  preferredResolution: string;
  status: BlotterCaseStatus;
  priority: BlotterPriority;
  entertainedBy: string;
  hasRespondent: boolean;
  respondentFirstName?: string;
  respondentMiddleName?: string;
  respondentLastName?: string;
  respondentAddress?: string;
  respondentContactNumber?: string;
  respondentEmail?: string;
  respondentIsResident?: boolean;
};

export default function NewComplaintPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchPartyType, setSearchPartyType] = useState<'complainant' | 'respondent'>('complainant');
  const [officials, setOfficials] = useState<Official[]>([]);
  const [loadingOfficials, setLoadingOfficials] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<FormValues>({
    defaultValues: {
      reportDate: new Date().toISOString().split('T')[0],
      status: BlotterCaseStatus.PENDING,
      priority: BlotterPriority.MEDIUM,
      hasRespondent: false
    },
    mode: "onSubmit"
  });
  
  const hasRespondent = watch("hasRespondent");
  
  // Fetch officials on component mount
  useEffect(() => {
    const fetchOfficials = async () => {
      try {
        setLoadingOfficials(true);
        const response = await fetch('/api/officials');
        if (response.ok) {
          const data = await response.json();
          setOfficials(data.officials || []);
        } else {
          console.error('Failed to fetch officials');
        }
      } catch (error) {
        console.error('Error fetching officials:', error);
      } finally {
        setLoadingOfficials(false);
      }
    };
    
    fetchOfficials();
  }, []);
  
  // Check for auth
  if (status === "loading") {
    return <div className="p-6">Loading...</div>;
  }
  
  if (!session) {
    return (
      <div className="p-6">
        <h1 className="text-red-500">You must be logged in to access this page</h1>
      </div>
    );
  }
  
  const onSubmit = async (formData: FormData) => {
    try {
      setSubmitting(true);
      
      // Add the form values that are managed by react-hook-form
      // to ensure they're included in the FormData object
      const formValues = watch();
      Object.entries(formValues).forEach(([key, value]) => {
        // Skip undefined, null values, but include empty strings and false values
        if (value !== undefined && value !== null) {
          // Check if the form already has this field (might be added by browser)
          if (!formData.has(key)) {
            if (typeof value === 'boolean') {
              formData.set(key, value ? 'on' : 'off');
            } else {
              formData.set(key, value.toString());
            }
          }
        }
      });
      
      const result = await createComplaint(formData);
      
      if (result.success) {
        toast.success("Complaint created successfully");
        router.push(`/dashboard/blotter/${result.caseId}`);
      } else {
        toast.error(result.error || "Failed to create complaint");
        // Scroll to the error message
        const firstErrorField = document.querySelector('.text-red-500');
        if (firstErrorField) {
          firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    } catch (error) {
      toast.error((error as Error).message);
      // Scroll to the error message
      const firstErrorField = document.querySelector('.text-red-500');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } finally {
      setSubmitting(false);
    }
  };
  
  // This function will run client-side validation first before submitting
  const validateAndSubmit = handleSubmit((data) => {
    // The form has been validated successfully by react-hook-form
    // Now we can submit the form
    const formData = new FormData(document.querySelector('form') as HTMLFormElement);
    onSubmit(formData);
  }, (errors) => {
    // There are validation errors
    console.log('Validation errors:', errors);
    toast.error("Please fix the highlighted fields");
    
    // Scroll to the first error field
    const firstErrorField = document.querySelector('.text-red-500');
    if (firstErrorField) {
      firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return false;
  });
  
  const searchResident = (type: 'complainant' | 'respondent') => {
    setSearchPartyType(type);
    setSearchModalOpen(true);
  };
  
  const handleResidentSelect = (resident: Resident) => {
    if (searchPartyType === 'complainant') {
      setValue('complainantFirstName', resident.firstName);
      setValue('complainantMiddleName', resident.middleName || '');
      setValue('complainantLastName', resident.lastName);
      setValue('complainantAddress', resident.address);
      setValue('complainantContactNumber', resident.contactNo || '');
      setValue('complainantEmail', resident.email || '');
      setValue('isResident', true);
    } else {
      setValue('respondentFirstName', resident.firstName);
      setValue('respondentMiddleName', resident.middleName || '');
      setValue('respondentLastName', resident.lastName);
      setValue('respondentAddress', resident.address);
      setValue('respondentContactNumber', resident.contactNo || '');
      setValue('respondentEmail', resident.email || '');
      setValue('respondentIsResident', true);
    }
    toast.success(`${searchPartyType === 'complainant' ? 'Complainant' : 'Respondent'} details populated from resident database`);
  };
  
  return (
    <PageTransition>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <Link href="/dashboard/blotter">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft size={18} />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-gray-600" />
            Create New Complaint
          </h1>
        </div>
        
        {/* Form Container */}
        <form onSubmit={validateAndSubmit} className="space-y-8">
          {/* Complaint Information */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
              <h2 className="text-lg font-medium">Complaint Information</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Case Number</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="text"
                    name="caseNumber"
                    id="caseNumber"
                    disabled
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md bg-gray-100"
                    placeholder="Auto-generated"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">This will be automatically generated</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="reportDate">Date Filed</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="date"
                    id="reportDate"
                    {...register("reportDate", { required: "Filing date is required" })}
                    className={`focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${errors.reportDate ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.reportDate && <p className="mt-1 text-xs text-red-500">{errors.reportDate.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="complaintType">Complaint Type</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <select
                    id="complaintType"
                    {...register("complaintType", { required: "Complaint type is required" })}
                    className={`focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${errors.complaintType ? 'border-red-500' : ''}`}
                  >
                    <option value="">Select Complaint Type</option>
                    <option value="Noise Complaint">Noise Complaint</option>
                    <option value="Unsanitary Conditions">Unsanitary Conditions</option>
                    <option value="Property Dispute">Property Dispute</option>
                    <option value="Pet/Animal Issue">Pet/Animal Issue</option>
                    <option value="Water Supply">Water Supply</option>
                    <option value="Electrical Issue">Electrical Issue</option>
                    <option value="Road Condition">Road Condition</option>
                    <option value="Public Disturbance">Public Disturbance</option>
                    <option value="Vandalism">Vandalism</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                {errors.complaintType && <p className="mt-1 text-xs text-red-500">{errors.complaintType.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="status">Status</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <select
                    id="status"
                    {...register("status", { required: "Status is required" })}
                    className={`focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${errors.status ? 'border-red-500' : ''}`}
                  >
                    <option value={BlotterCaseStatus.PENDING}>Pending</option>
                    <option value={BlotterCaseStatus.ONGOING}>Ongoing</option>
                    <option value={BlotterCaseStatus.RESOLVED}>Resolved</option>
                    <option value={BlotterCaseStatus.ESCALATED}>Escalated</option>
                  </select>
                </div>
                {errors.status && <p className="mt-1 text-xs text-red-500">{errors.status.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="priority">Priority</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <select
                    id="priority"
                    {...register("priority", { required: "Priority is required" })}
                    className={`focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${errors.priority ? 'border-red-500' : ''}`}
                  >
                    <option value={BlotterPriority.LOW}>Low</option>
                    <option value={BlotterPriority.MEDIUM}>Medium</option>
                    <option value={BlotterPriority.HIGH}>High</option>
                    <option value={BlotterPriority.URGENT}>Urgent</option>
                  </select>
                </div>
                {errors.priority && <p className="mt-1 text-xs text-red-500">{errors.priority.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="entertainedBy">Entertained By</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <select
                    id="entertainedBy"
                    {...register("entertainedBy", { required: "Official who entertained the complaint is required" })}
                    className={`focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${errors.entertainedBy ? 'border-red-500' : ''}`}
                  >
                    <option value="">Select Official</option>
                    {officials.map(official => (
                      <option key={official.id} value={official.id}>
                        {official.name} {official.position ? `(${official.position})` : ''}
                      </option>
                    ))}
                    <option value="other">Other</option>
                  </select>
                </div>
                {errors.entertainedBy && <p className="mt-1 text-xs text-red-500">{errors.entertainedBy.message}</p>}
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="complaintDescription">Complaint Description</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <textarea
                    id="complaintDescription"
                    {...register("complaintDescription", { required: "Complaint description is required" })}
                    rows={4}
                    className={`focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${errors.complaintDescription ? 'border-red-500' : ''}`}
                    placeholder="Provide a detailed description of the complaint"
                  />
                </div>
                {errors.complaintDescription && <p className="mt-1 text-xs text-red-500">{errors.complaintDescription.message}</p>}
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="preferredResolution">Preferred Resolution</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <textarea
                    id="preferredResolution"
                    {...register("preferredResolution")}
                    rows={2}
                    className={`focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${errors.preferredResolution ? 'border-red-500' : ''}`}
                    placeholder="What resolution is the complainant seeking?"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Complainant Information */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-medium">Complainant Information</h2>
              <Button 
                type="button"
                variant="outline" 
                size="sm" 
                onClick={() => searchResident('complainant')}
                className="flex items-center gap-1"
              >
                <Search size={14} />
                Search Resident
              </Button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="complainantFirstName">First Name</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="text"
                    id="complainantFirstName"
                    {...register("complainantFirstName", { required: "First name is required" })}
                    className={`focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${errors.complainantFirstName ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.complainantFirstName && <p className="mt-1 text-xs text-red-500">{errors.complainantFirstName.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="complainantMiddleName">Middle Name</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="text"
                    id="complainantMiddleName"
                    {...register("complainantMiddleName")}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="complainantLastName">Last Name</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="text"
                    id="complainantLastName"
                    {...register("complainantLastName", { required: "Last name is required" })}
                    className={`focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${errors.complainantLastName ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.complainantLastName && <p className="mt-1 text-xs text-red-500">{errors.complainantLastName.message}</p>}
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="complainantAddress">Address</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="text"
                    id="complainantAddress"
                    {...register("complainantAddress", { required: "Address is required" })}
                    className={`focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${errors.complainantAddress ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.complainantAddress && <p className="mt-1 text-xs text-red-500">{errors.complainantAddress.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="complainantContactNumber">Contact Number</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="text"
                    id="complainantContactNumber"
                    {...register("complainantContactNumber")}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="complainantEmail">Email Address</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="email"
                    id="complainantEmail"
                    {...register("complainantEmail")}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isResident"
                  {...register("isResident")}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isResident" className="ml-2 block text-sm text-gray-700">
                  Complainant is a Resident
                </label>
              </div>
            </div>
          </div>
          
          {/* Is there a respondent? */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="hasRespondent"
                  {...register("hasRespondent")}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="hasRespondent" className="ml-2 block text-sm font-medium text-gray-700">
                  This complaint is against a specific person or entity
                </label>
              </div>
              
              {hasRespondent && (
                <div className="mt-4">
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-medium">Respondent Information</h2>
                      <Button 
                        type="button"
                        variant="outline" 
                        size="sm" 
                        onClick={() => searchResident('respondent')}
                        className="flex items-center gap-1"
                      >
                        <Search size={14} />
                        Search Resident
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="respondentFirstName">First Name</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <input
                            type="text"
                            id="respondentFirstName"
                            {...register("respondentFirstName", { 
                              required: hasRespondent ? "First name is required" : false 
                            })}
                            className={`focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${errors.respondentFirstName ? 'border-red-500' : ''}`}
                          />
                        </div>
                        {errors.respondentFirstName && <p className="mt-1 text-xs text-red-500">{errors.respondentFirstName.message}</p>}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="respondentMiddleName">Middle Name</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <input
                            type="text"
                            id="respondentMiddleName"
                            {...register("respondentMiddleName")}
                            className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="respondentLastName">Last Name</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <input
                            type="text"
                            id="respondentLastName"
                            {...register("respondentLastName", { 
                              required: hasRespondent ? "Last name is required" : false 
                            })}
                            className={`focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${errors.respondentLastName ? 'border-red-500' : ''}`}
                          />
                        </div>
                        {errors.respondentLastName && <p className="mt-1 text-xs text-red-500">{errors.respondentLastName.message}</p>}
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="respondentAddress">Address</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <input
                            type="text"
                            id="respondentAddress"
                            {...register("respondentAddress", { 
                              required: hasRespondent ? "Address is required" : false 
                            })}
                            className={`focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${errors.respondentAddress ? 'border-red-500' : ''}`}
                          />
                        </div>
                        {errors.respondentAddress && <p className="mt-1 text-xs text-red-500">{errors.respondentAddress.message}</p>}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="respondentContactNumber">Contact Number</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <input
                            type="text"
                            id="respondentContactNumber"
                            {...register("respondentContactNumber")}
                            className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="respondentEmail">Email Address</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <input
                            type="email"
                            id="respondentEmail"
                            {...register("respondentEmail")}
                            className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="respondentIsResident"
                          {...register("respondentIsResident")}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="respondentIsResident" className="ml-2 block text-sm text-gray-700">
                          Respondent is a Resident
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Form Actions */}
          <div className="flex justify-end gap-3">
            <Link href="/dashboard/blotter">
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </Link>
            <Button 
              type="submit" 
              className="bg-[#4a5568] hover:bg-[#2d3748]"
              disabled={submitting}
            >
              {submitting ? "Saving..." : "Submit Complaint"}
            </Button>
          </div>
        </form>
        
        {/* Resident Search Modal */}
        {/* <ResidentSearchModal
          isOpen={searchModalOpen}
          onClose={() => setSearchModalOpen(false)}
          onSelect={handleResidentSelect}
        /> */}
        <ResidentSearchModal
          open={searchModalOpen}
          onClose={() => setSearchModalOpen(false)}
          onSelect={handleResidentSelect}
          partyType={searchPartyType}
        />
      </div>
    </PageTransition>
  );
} 