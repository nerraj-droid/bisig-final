"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Save, MapPin, AlertCircle, Check, ArrowLeft } from "lucide-react"

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

    // Load the map component only on the client side
    useEffect(() => {
        setIsMounted(true)
        import("@/components/map/location-picker").then((module) => {
            setMapComponent(() => module.LocationPicker)
        })
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
        e.preventDefault()
        setError(null)
        setLoading(true)

        try {
            const res = await fetch(`/api/households/${household.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...formData,
                    latitude: location?.latitude || null,
                    longitude: location?.longitude || null,
                }),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.message || "Failed to update household")
            }

            toast("Household updated", {
                description: "The household information has been saved successfully.",
                icon: <Check className="h-4 w-4 text-green-500" />
            })

            router.push(`/dashboard/households/${household.id}`)
            router.refresh()
        } catch (err) {
            console.error("Error updating household:", err)
            setError(err instanceof Error ? err.message : "An unknown error occurred")
            toast("Update failed", {
                description: err instanceof Error ? err.message : "Failed to update household",
                icon: <AlertCircle className="h-4 w-4 text-red-500" />,
                style: { backgroundColor: 'rgba(254, 226, 226, 0.9)', color: 'rgb(153, 27, 27)' }
            })
        } finally {
            setLoading(false)
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
                                    Use the map below to select the exact location of this household. Click anywhere on the map or use the search box to find an address.
                                </p>
                            </div>

                            <div className="h-[450px] rounded-md border border-gray-300 overflow-hidden">
                                {isMounted && MapComponent ? (
                                    <MapComponent
                                        initialLocation={location}
                                        onLocationChange={handleLocationChange}
                                    />
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