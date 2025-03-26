"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Save, MapPin, AlertCircle, Check, ArrowLeft } from "lucide-react"
import { Form } from "@/components/ui/form"
import { useForm } from "react-hook-form"

interface Resident {
    id: string
    firstName: string
    lastName: string
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
    notes?: string | null
    Resident?: Resident[]
    type?: string
    status?: string
}

interface EditHouseholdFormProps {
    household: Household
}

export function EditHouseholdForm({ household }: EditHouseholdFormProps) {
    const router = useRouter()
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [activeTab, setActiveTab] = useState("address")
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(
        household.latitude && household.longitude
            ? { latitude: household.latitude, longitude: household.longitude }
            : null
    )
    const [formData, setFormData] = useState({
        houseNo: household.houseNo || "",
        street: household.street || "",
        barangay: household.barangay || "",
        city: household.city || "",
        province: household.province || "",
        zipCode: household.zipCode || "",
        notes: household.notes || "",
        type: household.type || "SINGLE_FAMILY",
        status: household.status || "ACTIVE"
    })
    const [hasChanges, setHasChanges] = useState(false)
    const [MapComponent, setMapComponent] = useState<any>(null)
    const [isMounted, setIsMounted] = useState(false)
    
    // Add form hook for the location map
    const mapForm = useForm();

    // Load the map component only on the client side
    useEffect(() => {
        setIsMounted(true)
        
        // Use dynamic import with a try/catch to safely load the component
        const loadMapComponent = async () => {
            try {
                // Use a more explicit import approach
                const module = await import("@/components/map/location-picker");
                
                // Add a wrapper around the original component to prevent form interactions
                const SafeMapComponent = (props: any) => {
                    // Create a wrapper component that prevents form submission
                    const handleMapButtonClick = (e: React.MouseEvent) => {
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                    };
                    
                    return (
                        <div 
                            className="safe-map-wrapper"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Add invisible buttons to intercept clicks/events */}
                            <button 
                                type="button" 
                                onClick={handleMapButtonClick}
                                style={{ display: 'none' }}
                            />
                            <module.LocationPicker {...props} />
                        </div>
                    );
                };
                
                setMapComponent(() => SafeMapComponent);
            } catch (error) {
                console.error("Error loading map component:", error);
            }
        };
        
        loadMapComponent();
    }, [])

    // Check for changes to enable the save button
    useEffect(() => {
        const originalData = {
            houseNo: household.houseNo || "",
            street: household.street || "",
            barangay: household.barangay || "",
            city: household.city || "",
            province: household.province || "",
            zipCode: household.zipCode || "",
            notes: household.notes || "",
            type: household.type || "SINGLE_FAMILY",
            status: household.status || "ACTIVE"
        }

        const locationChanged =
            (location?.latitude !== household.latitude) ||
            (location?.longitude !== household.longitude)

        const formChanged = Object.keys(formData).some(key => {
            return formData[key as keyof typeof formData] !== originalData[key as keyof typeof originalData]
        })

        setHasChanges(formChanged || locationChanged)
    }, [formData, location, household])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleLocationChange = (newLocation: { latitude: number; longitude: number } | null) => {
        setLocation(newLocation)
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        console.log("Submitting form...", { household });

        // Confirm we're not in the map style toggle process
        const target = e.target as HTMLFormElement;
        const isMapStyleButton = target.classList.contains("map-style-toggle") || 
                               target.closest(".map-style-toggle");
        
        if (isMapStyleButton) {
            console.log("Map style toggle detected, preventing form submission");
            setLoading(false);
            return false;
        }

        try {
            // Create a clean data object with only the properties we need
            const cleanData = {
                houseNo: formData.houseNo,
                street: formData.street,
                barangay: formData.barangay,
                city: formData.city,
                province: formData.province,
                zipCode: formData.zipCode,
                notes: formData.notes || "",
                type: formData.type,
                status: formData.status,
                latitude: location?.latitude || null,
                longitude: location?.longitude || null,
            };
            
            // Serialize to JSON string
            const payload = JSON.stringify(cleanData);
            
            // Validate the API endpoint path
            const apiUrl = `/api/households/${household.id}`;
            console.log(`Submitting to API: ${apiUrl}`, cleanData);
            
            const res = await fetch(apiUrl, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: payload,
            });

            console.log("Response status:", res.status);
            
            // Log headers in a way that's compatible with all TypeScript targets
            const headers: Record<string, string> = {};
            res.headers.forEach((value, key) => {
                headers[key] = value;
            });
            console.log("Response headers:", headers);

            // Check if the response is OK (status in 200-299 range)
            if (!res.ok) {
                // Try to parse the error response
                try {
                    // Check if response is JSON
                    const contentType = res.headers.get("content-type");
                    console.log("Response content type:", contentType);
                    
                    if (contentType && contentType.includes("application/json")) {
                        const errorData = await res.json();
                        console.log("Error data:", errorData);
                        throw new Error(errorData.message || `Error ${res.status}: ${res.statusText}`);
                    } else {
                        // Handle non-JSON response
                        const errorText = await res.text();
                        console.error("Non-JSON error response:", errorText.substring(0, 500) + "...");
                        throw new Error(`API returned a non-JSON response with status ${res.status}. Please check server logs.`);
                    }
                } catch (parseError) {
                    // If parsing the error fails, just use the status
                    console.error("Parse error:", parseError);
                    throw new Error(`Error ${res.status}: ${res.statusText}. Check network tab for details.`);
                }
            }

            // Try to parse the success response
            try {
                const contentType = res.headers.get("content-type");
                if (!contentType || !contentType.includes("application/json")) {
                    console.warn("API returned non-JSON success response");
                    const text = await res.text();
                    console.log("Response text preview:", text.substring(0, 100));
                } else {
                    const data = await res.json();
                    console.log("Success response:", data);
                }
            } catch (parseError) {
                console.warn("Could not parse success response", parseError);
            }

            toast("Household updated", {
                description: "The household information has been saved successfully.",
                icon: <Check className="h-4 w-4 text-green-500" />
            });

            router.push(`/dashboard/households/${household.id}`);
            router.refresh();
        } catch (err) {
            console.error("Error updating household:", err);
            setError(err instanceof Error ? err.message : "An unexpected error occurred");
            toast("Update failed", {
                description: err instanceof Error ? err.message : "Failed to update household",
                icon: <AlertCircle className="h-4 w-4 text-red-500" />,
                style: { backgroundColor: 'rgba(254, 226, 226, 0.9)', color: 'rgb(153, 27, 27)' }
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-8 grid w-full grid-cols-2">
                    <TabsTrigger value="address" className="text-center">
                        Address Information
                    </TabsTrigger>
                    <TabsTrigger value="location" className="text-center">
                        Map Location
                    </TabsTrigger>
                </TabsList>

                <form onSubmit={handleSubmit}>
                    <TabsContent value="address">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left Column */}
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="houseNo" className="block text-sm font-medium text-gray-700 mb-1">
                                        House Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="houseNo"
                                        name="houseNo"
                                        type="text"
                                        required
                                        value={formData.houseNo}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
                                        Street <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="street"
                                        name="street"
                                        type="text"
                                        required
                                        value={formData.street}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="barangay" className="block text-sm font-medium text-gray-700 mb-1">
                                        Barangay <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="barangay"
                                        name="barangay"
                                        type="text"
                                        required
                                        value={formData.barangay}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                                        Household Type
                                    </label>
                                    <select
                                        id="type"
                                        name="type"
                                        value={formData.type}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="SINGLE_FAMILY">Single Family</option>
                                        <option value="MULTI_FAMILY">Multi Family</option>
                                        <option value="EXTENDED_FAMILY">Extended Family</option>
                                        <option value="SINGLE_PERSON">Single Person</option>
                                        <option value="NON_FAMILY">Non Family</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                                        City <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="city"
                                        name="city"
                                        type="text"
                                        required
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-1">
                                        Province <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="province"
                                        name="province"
                                        type="text"
                                        required
                                        value={formData.province}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                                        ZIP Code <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="zipCode"
                                        name="zipCode"
                                        type="text"
                                        required
                                        value={formData.zipCode}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                                        Household Status
                                    </label>
                                    <select
                                        id="status"
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="ACTIVE">Active</option>
                                        <option value="INACTIVE">Inactive</option>
                                        <option value="RELOCATED">Relocated</option>
                                        <option value="MERGED">Merged</option>
                                        <option value="ARCHIVED">Archived</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6">
                            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                                Notes
                            </label>
                            <textarea
                                id="notes"
                                name="notes"
                                rows={4}
                                value={formData.notes}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Add any additional information about this household"
                            ></textarea>
                        </div>

                        <div className="mt-4 flex justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setActiveTab("location")}
                                className="text-blue-600 border-blue-200 hover:bg-blue-50"
                            >
                                Set Location on Map
                            </Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="location">
                        <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-md mb-4">
                                <div className="flex items-center text-gray-700 mb-2">
                                    <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                                    <h3 className="font-medium">Household Location</h3>
                                </div>
                                <p className="text-sm text-gray-600">
                                    Use the map below to select the exact location of this household. Click anywhere on the map.
                                </p>
                            </div>

                            <div className="h-[450px] rounded-md border border-gray-300 overflow-hidden">
                                {isMounted && MapComponent ? (
                                    // Add an extra wrapper div to prevent form interaction
                                    <div className="map-wrapper" style={{ height: '100%' }} onClick={(e) => e.stopPropagation()}>
                                        {/* Add a button that explicitly stops event propagation */}
                                        <button 
                                            type="button" 
                                            style={{ 
                                                position: 'absolute', 
                                                right: 10, 
                                                top: 10, 
                                                zIndex: 1000, 
                                                padding: '2px 8px',
                                                fontSize: '10px',
                                                background: 'rgba(255,255,255,0.8)',
                                                border: '1px solid #eee',
                                                borderRadius: '4px',
                                                display: 'none' // Hidden visually but still intercepts events
                                            }}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                return false;
                                            }}
                                        >
                                            Prevent Submit
                                        </button>
                                        
                                        <Form {...mapForm}>
                                            <div className="map-container p-2" onClick={(e) => e.stopPropagation()}>
                                                <MapComponent
                                                    value={location}
                                                    onChange={handleLocationChange}
                                                    label="Household Location"
                                                    description="Click on the map to set the location or enter coordinates manually"
                                                />
                                            </div>
                                        </Form>
                                    </div>
                                ) : (
                                    <div className="h-full bg-gray-100 flex items-center justify-center">
                                        <p className="text-gray-500">Loading map...</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center mt-4">
                                <div className="flex-1">
                                    {location ? (
                                        <div className="text-sm text-gray-600">
                                            <span className="font-medium text-gray-700">Selected coordinates:</span>{" "}
                                            {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                                        </div>
                                    ) : (
                                        <div className="text-sm text-yellow-600">
                                            <AlertCircle className="inline-block w-4 h-4 mr-1" />
                                            No location selected
                                        </div>
                                    )}
                                </div>

                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setActiveTab("address")}
                                    className="flex items-center gap-1"
                                >
                                    <ArrowLeft size={14} />
                                    Return to Address
                                </Button>
                            </div>
                        </div>
                    </TabsContent>

                    {error && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-red-700 text-sm flex items-center">
                                <AlertCircle className="w-4 h-4 mr-2" />
                                {error}
                            </p>
                        </div>
                    )}

                    <div className="mt-8 flex justify-end space-x-4 border-t pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push(`/dashboard/households/${household.id}`)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700"
                            disabled={loading || !hasChanges}
                        >
                            <Save className="mr-2 h-4 w-4" />
                            {loading ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </form>
            </Tabs>
        </div>
    )
} 