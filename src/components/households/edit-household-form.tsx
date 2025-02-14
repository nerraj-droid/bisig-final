"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LocationPicker } from "../map/location-picker"

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
}

interface EditHouseholdFormProps {
    household: Household
}

export function EditHouseholdForm({ household }: EditHouseholdFormProps) {
    const router = useRouter()
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(
        household.latitude && household.longitude
            ? { latitude: household.latitude, longitude: household.longitude }
            : null
    )

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const data = {
            houseNo: formData.get("houseNo"),
            street: formData.get("street"),
            barangay: formData.get("barangay"),
            city: formData.get("city"),
            province: formData.get("province"),
            zipCode: formData.get("zipCode"),
            latitude: location?.latitude || null,
            longitude: location?.longitude || null,
        }

        try {
            const res = await fetch(`/api/households/${household.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            })

            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.message)
            }

            router.push(`/dashboard/households/${household.id}`)
            router.refresh()
        } catch (error) {
            setError(error instanceof Error ? error.message : "An unknown error occurred")
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="rounded-md bg-red-50 p-4 text-red-500">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                    <label htmlFor="houseNo" className="block text-sm font-medium text-gray-700">
                        House Number
                    </label>
                    <input
                        id="houseNo"
                        name="houseNo"
                        type="text"
                        required
                        defaultValue={household.houseNo}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                    />
                </div>

                <div>
                    <label htmlFor="street" className="block text-sm font-medium text-gray-700">
                        Street
                    </label>
                    <input
                        id="street"
                        name="street"
                        type="text"
                        required
                        defaultValue={household.street}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                    />
                </div>

                <div>
                    <label htmlFor="barangay" className="block text-sm font-medium text-gray-700">
                        Barangay
                    </label>
                    <input
                        id="barangay"
                        name="barangay"
                        type="text"
                        required
                        defaultValue={household.barangay}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                    />
                </div>

                <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                        City
                    </label>
                    <input
                        id="city"
                        name="city"
                        type="text"
                        required
                        defaultValue={household.city}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                    />
                </div>

                <div>
                    <label htmlFor="province" className="block text-sm font-medium text-gray-700">
                        Province
                    </label>
                    <input
                        id="province"
                        name="province"
                        type="text"
                        required
                        defaultValue={household.province}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                    />
                </div>

                <div>
                    <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
                        ZIP Code
                    </label>
                    <input
                        id="zipCode"
                        name="zipCode"
                        type="text"
                        required
                        defaultValue={household.zipCode}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                    Location
                </label>
                <LocationPicker
                    initialLocation={location}
                    onLocationChange={setLocation}
                />
                <p className="text-sm text-gray-500">
                    Click on the map to update the household location
                </p>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
            >
                {loading ? "Saving..." : "Save Changes"}
            </button>
        </form>
    )
} 