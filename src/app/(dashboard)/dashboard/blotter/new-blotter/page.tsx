"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { PageTransition } from "@/components/ui/page-transition";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Save, Trash, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { BlotterCaseStatus, BlotterPriority, BlotterPartyType } from "@/lib/enums";
import { createBlotterCase } from "./actions";
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
  incidentDate: string;
  incidentTime: string;
  status: BlotterCaseStatus;
  incidentType: string;
  priority: BlotterPriority;
  incidentLocation: string;
  incidentDescription: string;
  entertainedBy: string; // Add field for official who entertained the report
  complainantFirstName: string;
  complainantMiddleName?: string;
  complainantLastName: string;
  complainantAddress: string;
  complainantContactNumber?: string;
  complainantEmail?: string;
  isResident: boolean;
  hasRespondent: boolean;
  respondentFirstName?: string;
  respondentMiddleName?: string;
  respondentLastName?: string;
  respondentAddress?: string;
  respondentContactNumber?: string;
  respondentEmail?: string;
  respondentIsResident?: boolean;
};

export default function NewBlotterPage() {
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
      incidentDate: new Date().toISOString().split('T')[0],
      status: BlotterCaseStatus.PENDING,
      hasRespondent: false
    },
    mode: "onSubmit"
  });

  const incidentLocation = watch("incidentLocation");
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

      const result = await createBlotterCase(formData);

      if (result.success) {
        toast.success("Blotter case created successfully");
        router.push(`/dashboard/blotter/${result.caseId}`);
      } else {
        toast.error(result.error || "Failed to create blotter case");
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
          <h1 className="text-2xl font-bold">Create New Blotter Entry</h1>
        </div>

        {/* Form Container */}
        <form onSubmit={validateAndSubmit} className="space-y-8">
          {/* Case Information */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
              <h2 className="text-lg font-medium">Case Information</h2>
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
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="reportDate">Date Reported</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="date"
                    id="reportDate"
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    {...register("reportDate", { required: "Report date is required" })}
                  />
                </div>
                {errors.reportDate && (
                  <p className="mt-1 text-xs text-red-500">{errors.reportDate.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="entertainedBy">Entertained By</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <select
                    id="entertainedBy"
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    {...register("entertainedBy", { required: "Official who entertained the report is required" })}
                  >
                    <option value="">Select Official</option>
                    {loadingOfficials ? (
                      <option value="" disabled>Loading officials...</option>
                    ) : (
                      officials.map((official) => (
                        <option key={official.id} value={official.id}>
                          {official.name} {official.position ? `(${official.position})` : ''}
                        </option>
                      ))
                    )}
                    <option value="other">Other (specify in description)</option>
                  </select>
                </div>
                {errors.entertainedBy && (
                  <p className="mt-1 text-xs text-red-500">{errors.entertainedBy.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="incidentType">Incident Type</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <select
                    id="incidentType"
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    {...register("incidentType", { required: "Incident type is required" })}
                  >
                    <option value="">Select Incident Type</option>
                    <option value="Noise Complaint">Noise Complaint</option>
                    <option value="Property Dispute">Property Dispute</option>
                    <option value="Physical Injury">Physical Injury</option>
                    <option value="Verbal Abuse">Verbal Abuse</option>
                    <option value="Threat">Threat</option>
                    <option value="Theft">Theft</option>
                    <option value="Damage to Property">Damage to Property</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                {errors.incidentType && (
                  <p className="mt-1 text-xs text-red-500">{errors.incidentType.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="priority">Priority Level</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <select
                    id="priority"
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    {...register("priority", { required: "Priority is required" })}
                  >
                    <option value="">Select Priority</option>
                    <option value={BlotterPriority.LOW}>Low</option>
                    <option value={BlotterPriority.MEDIUM}>Medium</option>
                    <option value={BlotterPriority.HIGH}>High</option>
                    <option value={BlotterPriority.URGENT}>Urgent</option>
                  </select>
                </div>
                {errors.priority && (
                  <p className="mt-1 text-xs text-red-500">{errors.priority.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="status">Initial Status</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <select
                    id="status"
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    defaultValue={BlotterCaseStatus.PENDING}
                    {...register("status")}
                  >
                    <option value={BlotterCaseStatus.PENDING}>Pending</option>
                    <option value={BlotterCaseStatus.ONGOING}>Ongoing</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Incident Details */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
              <h2 className="text-lg font-medium">Incident Details</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="incidentDate">Incident Date</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="date"
                    id="incidentDate"
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    {...register("incidentDate", { required: "Incident date is required" })}
                  />
                </div>
                {errors.incidentDate && (
                  <p className="mt-1 text-xs text-red-500">{errors.incidentDate.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="incidentTime">Incident Time</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="time"
                    id="incidentTime"
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    {...register("incidentTime")}
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="incidentLocation">Incident Location</label>
                <LocationPicker
                  value={incidentLocation || ""}
                  onChange={(value) => setValue("incidentLocation", value, {
                    shouldValidate: true,
                    shouldDirty: true
                  })}
                  required={true}
                />
                {errors.incidentLocation && (
                  <p className="mt-1 text-xs text-red-500">{errors.incidentLocation.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="incidentDescription">Incident Description</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <textarea
                    id="incidentDescription"
                    rows={5}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Provide a detailed description of the incident"
                    {...register("incidentDescription", { required: "Description is required" })}
                  ></textarea>
                </div>
                {errors.incidentDescription && (
                  <p className="mt-1 text-xs text-red-500">{errors.incidentDescription.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Complainant Details */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
              <h2 className="text-lg font-medium">Complainant Details</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="complainantFirstName">First Name</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="text"
                    id="complainantFirstName"
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Enter first name"
                    {...register("complainantFirstName", { required: "First name is required" })}
                  />
                </div>
                {errors.complainantFirstName && (
                  <p className="mt-1 text-xs text-red-500">{errors.complainantFirstName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="complainantMiddleName">Middle Name</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="text"
                    id="complainantMiddleName"
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Enter middle name (optional)"
                    {...register("complainantMiddleName")}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="complainantLastName">Last Name</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="text"
                    id="complainantLastName"
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Enter last name"
                    {...register("complainantLastName", { required: "Last name is required" })}
                  />
                </div>
                {errors.complainantLastName && (
                  <p className="mt-1 text-xs text-red-500">{errors.complainantLastName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="complainantContactNumber">Contact Number</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="text"
                    id="complainantContactNumber"
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Enter contact number"
                    {...register("complainantContactNumber")}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="complainantEmail">Email</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="email"
                    id="complainantEmail"
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Enter email (optional)"
                    {...register("complainantEmail")}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="complainantAddress">Address</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="text"
                    id="complainantAddress"
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Enter address"
                    {...register("complainantAddress", { required: "Address is required" })}
                  />
                </div>
                {errors.complainantAddress && (
                  <p className="mt-1 text-xs text-red-500">{errors.complainantAddress.message}</p>
                )}
              </div>

              <div className="md:col-span-3 flex items-center">
                <input
                  id="isResident"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  {...register("isResident")}
                />
                <label htmlFor="isResident" className="ml-2 block text-sm text-gray-900">
                  Complainant is a registered resident
                </label>
              </div>

              <div className="md:col-span-3">
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={() => searchResident('complainant')}
                >
                  <Search size={16} className="mr-2" />
                  Search from Resident Database
                </button>
              </div>
            </div>
          </div>

          {/* Respondent Details */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
              <h2 className="text-lg font-medium">Respondent Details</h2>
            </div>
            <div className="p-6">
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="hasRespondent"
                  {...register("hasRespondent")}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="hasRespondent" className="ml-2 block text-sm font-medium text-gray-700">
                  This incident involves a specific respondent
                </label>
              </div>

              {hasRespondent && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="respondentFirstName">First Name</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <input
                        type="text"
                        id="respondentFirstName"
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="Enter first name"
                        {...register("respondentFirstName", { required: hasRespondent ? "First name is required" : false })}
                      />
                    </div>
                    {errors.respondentFirstName && (
                      <p className="mt-1 text-xs text-red-500">{errors.respondentFirstName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="respondentMiddleName">Middle Name</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <input
                        type="text"
                        id="respondentMiddleName"
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="Enter middle name (optional)"
                        {...register("respondentMiddleName")}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="respondentLastName">Last Name</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <input
                        type="text"
                        id="respondentLastName"
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="Enter last name"
                        {...register("respondentLastName", { required: hasRespondent ? "Last name is required" : false })}
                      />
                    </div>
                    {errors.respondentLastName && (
                      <p className="mt-1 text-xs text-red-500">{errors.respondentLastName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="respondentContactNumber">Contact Number</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <input
                        type="text"
                        id="respondentContactNumber"
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="Enter contact number (if available)"
                        {...register("respondentContactNumber")}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="respondentEmail">Email</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <input
                        type="email"
                        id="respondentEmail"
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="Enter email (optional)"
                        {...register("respondentEmail")}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="respondentAddress">Address</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <input
                        type="text"
                        id="respondentAddress"
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="Enter address (if available)"
                        {...register("respondentAddress", { required: hasRespondent ? "Address is required" : false })}
                      />
                    </div>
                    {errors.respondentAddress && (
                      <p className="mt-1 text-xs text-red-500">{errors.respondentAddress.message}</p>
                    )}
                  </div>

                  <div className="md:col-span-3 flex items-center">
                    <input
                      id="respondentIsResident"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      {...register("respondentIsResident")}
                    />
                    <label htmlFor="respondentIsResident" className="ml-2 block text-sm text-gray-900">
                      Respondent is a registered resident
                    </label>
                  </div>

                  <div className="md:col-span-3">
                    <button
                      type="button"
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      onClick={() => searchResident('respondent')}
                    >
                      <Search size={16} className="mr-2" />
                      Search from Resident Database
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <Link href="/dashboard/blotter">
              <Button variant="outline" className="gap-1" type="button">
                <Trash size={16} />
                Cancel
              </Button>
            </Link>
            <Button type="submit" className="gap-1" disabled={submitting}>
              <Save size={16} />
              {submitting ? "Saving..." : "Save Blotter Entry"}
            </Button>
          </div>
        </form>

        {/* Resident Search Modal */}
        <ResidentSearchModal
          open={searchModalOpen}
          onClose={() => setSearchModalOpen(false)}
          onSelect={handleResidentSelect}
          partyType={searchPartyType}
        />
      </div>
    </PageTransition >
  );
} 