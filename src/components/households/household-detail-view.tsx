"use client"

import Link from "next/link"
import { DeleteHouseholdButton } from "@/components/households/delete-household-button"
import { HouseholdType, HouseholdStatus, Gender, CivilStatus } from "@prisma/client"
import { useState, useEffect } from "react"
import {
    MapPin,
    Home,
    Users,
    FileText,
    Edit,
    ExternalLink,
    ChevronRight,
    UserPlus,
    X,
    AlertCircle,
    Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog"
import { useRouter } from "next/navigation"

interface Resident {
    id: string
    firstName: string
    lastName: string
    contactNo?: string | null
    isVerified?: boolean
    createdAt?: string | Date
}

interface Household {
    id: string
    houseNo: string
    street: string
    barangay: string
    city: string
    province: string
    zipCode: string
    latitude: number | null
    longitude: number | null
    type: HouseholdType
    status: HouseholdStatus
    notes?: string | null
    Resident: Resident[]
}

interface Marker {
    id: string
    latitude: number
    longitude: number
    description: string
}

interface HouseholdDetailViewProps {
    household?: Household
    markers?: Marker[]
    error?: boolean
}

export default function HouseholdDetailView({ household, markers = [], error = false }: HouseholdDetailViewProps) {
    const [isMounted, setIsMounted] = useState(false);
    const [MapComponent, setMapComponent] = useState<any>(null);
    const [isAddingResident, setIsAddingResident] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [addMethod, setAddMethod] = useState<'new' | 'existing'>('new');
    const [existingResidents, setExistingResidents] = useState<Resident[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const router = useRouter();

    // Load the map component only on the client side
    useEffect(() => {
        setIsMounted(true);
        // Dynamically import the map component
        import("@/components/map/map-view").then((module) => {
            setMapComponent(() => module.MapView);
        });
    }, []);

    // Format enum values for display
    const formatEnumValue = (value: string) => {
        return value.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l: string) => l.toUpperCase());
    };

    // Get color based on household status
    const getStatusColor = (status: HouseholdStatus) => {
        switch (status) {
            case 'ACTIVE':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'INACTIVE':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'RELOCATED':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'MERGED':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    // Get color based on household type
    const getTypeColor = (type: HouseholdType) => {
        switch (type) {
            case 'SINGLE_FAMILY':
                return 'bg-indigo-50 text-indigo-700 border-indigo-100';
            case 'MULTI_FAMILY':
                return 'bg-purple-50 text-purple-700 border-purple-100';
            case 'EXTENDED_FAMILY':
                return 'bg-blue-50 text-blue-700 border-blue-100';
            case 'SINGLE_PERSON':
                return 'bg-teal-50 text-teal-700 border-teal-100';
            case 'NON_FAMILY':
                return 'bg-orange-50 text-orange-700 border-orange-100';
            default:
                return 'bg-gray-50 text-gray-700 border-gray-100';
        }
    };

    // Render map component with client-side only rendering
    const renderMap = () => {
        if (!isMounted || !household || !MapComponent) {
            return (
                <div className="h-[300px] bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">Loading map...</p>
                </div>
            );
        }

        return (
            <div className="relative h-[300px] rounded-lg shadow-sm overflow-hidden border border-border">
                <MapComponent
                    markers={markers}
                    initialView={{
                        latitude: household.latitude || 14.5995,
                        longitude: household.longitude || 120.9842,
                        zoom: 18
                    }}
                />
            </div>
        );
    };

    // Handle form submission for adding a resident
    const handleAddResident = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Check if household exists
        if (!household) {
            setFormError("Household information is missing");
            return;
        }

        setIsSubmitting(true);
        setFormError(null);

        const formData = new FormData(e.currentTarget);

        try {
            const residentData = {
                firstName: formData.get("firstName") as string,
                lastName: formData.get("lastName") as string,
                middleName: formData.get("middleName") as string || null,
                birthDate: formData.get("birthDate") as string,
                gender: formData.get("gender") as Gender,
                civilStatus: formData.get("civilStatus") as CivilStatus,
                contactNo: formData.get("contactNo") as string || null,
                email: formData.get("email") as string || null,
                address: `${household.houseNo} ${household.street}, ${household.barangay}, ${household.city}, ${household.province} ${household.zipCode}`,
                nationality: "Filipino",
                householdId: household.id,
                isVerified: false
            };

            const response = await fetch("/api/residents", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(residentData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to add resident");
            }

            // Close dialog and reset form
            setIsAddingResident(false);
            alert("Resident added successfully!");

            // Force a hard refresh to ensure data is updated
            window.location.reload();
        } catch (error) {
            console.error("Error adding resident:", error);
            setFormError(error instanceof Error ? error.message : "An unexpected error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle search for existing residents
    const searchResidents = async () => {
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        setFormError(null);

        try {
            const response = await fetch(`/api/residents?search=${encodeURIComponent(searchQuery)}&limit=5`);

            if (!response.ok) {
                throw new Error("Failed to fetch residents");
            }

            const data = await response.json();
            setExistingResidents(data);
        } catch (error) {
            console.error("Error searching residents:", error);
            setFormError(error instanceof Error ? error.message : "An unexpected error occurred");
        } finally {
            setIsSearching(false);
        }
    };

    // Handle adding existing resident to household
    const handleAddExistingResident = async (residentId: string) => {
        if (!household) {
            setFormError("Household information is missing");
            return;
        }

        setIsSubmitting(true);
        setFormError(null);

        try {
            const response = await fetch(`/api/households/${household.id}/residents`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    residentId: residentId,
                    isHeadOfHousehold: false
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to add resident to household");
            }

            // Close dialog and refresh data
            setIsAddingResident(false);
            setExistingResidents([]); // Clear search results
            setSearchQuery(''); // Clear search query
            alert("Resident added to household successfully!");

            // Force a hard refresh to ensure data is updated
            window.location.reload();
        } catch (error) {
            console.error("Error adding existing resident:", error);
            setFormError(error instanceof Error ? error.message : "An unexpected error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    // If there's an error, show error view
    if (error) {
        return (
            <div className="p-6 bg-white rounded-lg shadow-sm">
                <h1 className="text-2xl font-bold mb-4">Error</h1>
                <p className="text-red-600">Failed to load household data. Please try again later.</p>
                <Link href="/dashboard/households" className="mt-4 inline-block text-blue-600 hover:text-blue-500">
                    Return to Households
                </Link>
            </div>
        );
    }

    // If no household data, show loading placeholder
    if (!household) {
        return (
            <div className="p-6 bg-white rounded-lg shadow-sm animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="h-60 bg-gray-200 rounded"></div>
                    <div className="h-60 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    // Format full address for display
    const fullAddress = [
        household.houseNo,
        household.street,
        household.barangay,
        household.city,
        household.province,
        household.zipCode
    ].filter(Boolean).join(', ');

    return (
        <div>
            {/* Breadcrumb navigation */}
            <nav className="mb-4 flex text-sm text-gray-500">
                <ol className="flex items-center space-x-1">
                    <li>
                        <Link href="/dashboard" className="hover:text-blue-600">
                            Dashboard
                        </Link>
                    </li>
                    <li><ChevronRight className="h-4 w-4" /></li>
                    <li>
                        <Link href="/dashboard/households" className="hover:text-blue-600">
                            Households
                        </Link>
                    </li>
                    <li><ChevronRight className="h-4 w-4" /></li>
                    <li className="font-medium text-gray-900 truncate max-w-[200px]">
                        {household.houseNo} {household.street}
                    </li>
                </ol>
            </nav>

            {/* Header with badges and actions */}
            <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <h1 className="text-2xl font-bold flex items-center">
                        <Home className="mr-2 h-6 w-6 text-blue-600" />
                        Household Details
                    </h1>

                    <div className="flex flex-wrap gap-2">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getTypeColor(household.type)}`}>
                            {formatEnumValue(household.type)}
                        </span>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(household.status)}`}>
                            {formatEnumValue(household.status)}
                        </span>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-end">
                    <Link
                        href={`/dashboard/households/${household.id}/edit`}
                        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 flex items-center justify-center"
                    >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Household
                    </Link>
                    <DeleteHouseholdButton householdId={household.id} />
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-12">
                {/* Main content - left column */}
                <div className="md:col-span-7 space-y-6">
                    {/* Address card */}
                    <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center mb-4">
                            <MapPin className="h-5 w-5 text-blue-600 mr-2" />
                            <h2 className="text-lg font-semibold">Address Information</h2>
                        </div>

                        <div className="text-sm text-gray-500 mb-4">
                            <p className="text-base font-medium text-gray-900 mb-1">{fullAddress}</p>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-xs font-medium uppercase text-gray-500 mb-1">House Number</h3>
                                <p className="text-gray-900">{household.houseNo}</p>
                            </div>
                            <div>
                                <h3 className="text-xs font-medium uppercase text-gray-500 mb-1">Street</h3>
                                <p className="text-gray-900">{household.street}</p>
                            </div>
                            <div>
                                <h3 className="text-xs font-medium uppercase text-gray-500 mb-1">Barangay</h3>
                                <p className="text-gray-900">{household.barangay}</p>
                            </div>
                            <div>
                                <h3 className="text-xs font-medium uppercase text-gray-500 mb-1">City</h3>
                                <p className="text-gray-900">{household.city}</p>
                            </div>
                            <div>
                                <h3 className="text-xs font-medium uppercase text-gray-500 mb-1">Province</h3>
                                <p className="text-gray-900">{household.province}</p>
                            </div>
                            <div>
                                <h3 className="text-xs font-medium uppercase text-gray-500 mb-1">ZIP Code</h3>
                                <p className="text-gray-900">{household.zipCode}</p>
                            </div>
                        </div>
                    </div>

                    {/* Location map */}
                    <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                                <MapPin className="h-5 w-5 text-blue-600 mr-2" />
                                <h2 className="text-lg font-semibold">Location</h2>
                            </div>
                            {(!household.latitude || !household.longitude) && (
                                <Link
                                    href={`/dashboard/households/${household.id}/edit`}
                                    className="text-sm text-blue-600 hover:text-blue-500 flex items-center"
                                >
                                    <Edit className="h-3 w-3 mr-1" />
                                    Set Location
                                </Link>
                            )}
                        </div>

                        {household.latitude && household.longitude ? (
                            <>
                                {renderMap()}
                                <div className="mt-3 text-sm text-gray-500">
                                    <span className="font-medium">Coordinates:</span> {household.latitude.toFixed(6)}, {household.longitude.toFixed(6)}
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center justify-center rounded-lg bg-gray-50 p-6 text-center">
                                <div>
                                    <MapPin className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                                    <p className="text-gray-500 mb-2">No location set for this household</p>
                                    <Link
                                        href={`/dashboard/households/${household.id}/edit`}
                                        className="text-sm text-blue-600 hover:underline inline-flex items-center"
                                    >
                                        <Edit className="h-3 w-3 mr-1" />
                                        Set location
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Notes */}
                    {household.notes && (
                        <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center mb-4">
                                <FileText className="h-5 w-5 text-blue-600 mr-2" />
                                <h2 className="text-lg font-semibold">Notes</h2>
                            </div>
                            <p className="text-gray-700 whitespace-pre-wrap">{household.notes}</p>
                        </div>
                    )}
                </div>

                {/* Residents - right column */}
                <div className="md:col-span-5">
                    <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-100 sticky top-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                                <Users className="h-5 w-5 text-blue-600 mr-2" />
                                <h2 className="text-lg font-semibold">Residents</h2>
                            </div>
                            <Button
                                onClick={() => setIsAddingResident(true)}
                                className="rounded-md bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-100"
                                variant="ghost"
                                size="sm"
                            >
                                <UserPlus className="mr-1 h-3 w-3" />
                                Add Resident
                            </Button>
                        </div>

                        {household.Resident.length > 0 ? (
                            <ul className="divide-y divide-gray-100">
                                {household.Resident.map((resident) => (
                                    <li key={resident.id} className="py-3">
                                        <Link
                                            href={`/dashboard/residents/${resident.id}`}
                                            className="block hover:bg-gray-50 -mx-3 px-3 py-2 rounded-md transition-colors"
                                        >
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-gray-900">
                                                            {resident.lastName}, {resident.firstName}
                                                        </span>
                                                        {resident.isVerified === false && (
                                                            <span className="inline-flex items-center rounded-full bg-yellow-50 px-2 py-0.5 text-xs font-medium text-yellow-800 border border-yellow-200">
                                                                <AlertCircle className="mr-1 h-3 w-3" />
                                                                Not Verified
                                                            </span>
                                                        )}
                                                        {resident.createdAt && new Date(resident.createdAt).getTime() > Date.now() - 604800000 && (
                                                            <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-800 border border-blue-200">
                                                                New
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {resident.contactNo || "No contact number"}
                                                    </div>
                                                </div>
                                                <ExternalLink className="h-4 w-4 text-gray-400" />
                                            </div>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-center py-8 bg-gray-50 rounded-md">
                                <Users className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                                <p className="text-gray-500 mb-2">No residents in this household</p>
                                <Link
                                    href={`/dashboard/residents/new?householdId=${household.id}`}
                                    className="rounded-md bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-100 inline-flex items-center"
                                >
                                    Add the first resident
                                </Link>
                            </div>
                        )}

                        {household.Resident.length > 0 && (
                            <div className="mt-4 pt-3 border-t border-gray-100">
                                <Link
                                    href={`/dashboard/residents?householdId=${household.id}`}
                                    className="text-sm text-blue-600 hover:text-blue-500 flex items-center justify-center"
                                >
                                    View all residents
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Add Resident Dialog */}
            <Dialog open={isAddingResident} onOpenChange={setIsAddingResident}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center">
                            <UserPlus className="mr-2 h-5 w-5 text-blue-600" />
                            Add Resident to Household
                        </DialogTitle>
                        <DialogDescription>
                            Add a resident to this household by creating a new record or selecting from existing residents.
                        </DialogDescription>
                    </DialogHeader>

                    {formError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-4">
                            <div className="flex">
                                <AlertCircle className="h-5 w-5 mr-2" />
                                {formError}
                            </div>
                        </div>
                    )}

                    <div className="mb-4">
                        <div className="flex border-b border-gray-200">
                            <button
                                type="button"
                                className={`px-4 py-2 text-sm font-medium ${addMethod === 'new'
                                    ? 'text-blue-600 border-b-2 border-blue-500'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                onClick={() => setAddMethod('new')}
                            >
                                Create New Resident
                            </button>
                            <button
                                type="button"
                                className={`px-4 py-2 text-sm font-medium ${addMethod === 'existing'
                                    ? 'text-blue-600 border-b-2 border-blue-500'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                onClick={() => setAddMethod('existing')}
                            >
                                Select Existing Resident
                            </button>
                        </div>
                    </div>

                    {addMethod === 'new' ? (
                        <form onSubmit={handleAddResident} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                                        First Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="firstName"
                                        name="firstName"
                                        type="text"
                                        required
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                                        Last Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="lastName"
                                        name="lastName"
                                        type="text"
                                        required
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="middleName" className="block text-sm font-medium text-gray-700 mb-1">
                                        Middle Name
                                    </label>
                                    <input
                                        id="middleName"
                                        name="middleName"
                                        type="text"
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">
                                        Birth Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="birthDate"
                                        name="birthDate"
                                        type="date"
                                        required
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                                        Gender <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="gender"
                                        name="gender"
                                        required
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                                    >
                                        <option value="MALE">Male</option>
                                        <option value="FEMALE">Female</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="civilStatus" className="block text-sm font-medium text-gray-700 mb-1">
                                        Civil Status <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="civilStatus"
                                        name="civilStatus"
                                        required
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                                    >
                                        <option value="SINGLE">Single</option>
                                        <option value="MARRIED">Married</option>
                                        <option value="WIDOWED">Widowed</option>
                                        <option value="DIVORCED">Divorced</option>
                                        <option value="SEPARATED">Separated</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="contactNo" className="block text-sm font-medium text-gray-700 mb-1">
                                        Contact Number
                                    </label>
                                    <input
                                        id="contactNo"
                                        name="contactNo"
                                        type="tel"
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                        Email
                                    </label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="pt-2 text-xs text-gray-500">
                                <p>The household address will be automatically assigned to this resident.</p>
                                <p className="font-medium">{fullAddress}</p>
                                <p className="mt-2 text-amber-600 flex items-center">
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    Residents added via this quick form will be marked as unverified until complete details are provided.
                                </p>
                            </div>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsAddingResident(false)}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-blue-600 hover:bg-blue-500"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Adding...
                                        </>
                                    ) : (
                                        'Add Resident'
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Search by name..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && searchResidents()}
                                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                                />
                                <Button
                                    type="button"
                                    onClick={searchResidents}
                                    disabled={isSearching || !searchQuery.trim()}
                                    className="bg-blue-600 hover:bg-blue-500"
                                >
                                    {isSearching ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        'Search'
                                    )}
                                </Button>
                            </div>

                            {existingResidents.length > 0 ? (
                                <div className="max-h-[250px] overflow-y-auto border rounded-md">
                                    <ul className="divide-y divide-gray-100">
                                        {existingResidents.map((resident) => (
                                            <li key={resident.id} className="p-3 hover:bg-gray-50">
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <div className="font-medium">
                                                            {resident.lastName}, {resident.firstName}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {resident.contactNo || "No contact number"}
                                                        </div>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleAddExistingResident(resident.id)}
                                                        disabled={isSubmitting}
                                                    >
                                                        {isSubmitting ? (
                                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                        ) : (
                                                            'Add'
                                                        )}
                                                    </Button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ) : searchQuery && !isSearching ? (
                                <div className="text-center py-8 bg-gray-50 rounded-md">
                                    <p className="text-gray-500">No residents found matching your search.</p>
                                </div>
                            ) : null}

                            {!searchQuery && (
                                <div className="text-center py-8 bg-gray-50 rounded-md">
                                    <p className="text-gray-500">Search for existing residents by name.</p>
                                </div>
                            )}

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsAddingResident(false)}
                                >
                                    Cancel
                                </Button>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
} 