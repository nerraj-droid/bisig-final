"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Save, Loader2 } from "lucide-react"

type BarangayInfo = {
    id: string
    name: string
    district: string | null
    city: string
    province: string
    address: string | null
    contactNumber: string | null
    email: string | null
    website: string | null
    postalCode: string | null
    logo: string | null
    headerImage: string | null
    footerText: string | null
}

interface BarangayInfoFormProps {
    barangayInfo: BarangayInfo
}

export function BarangayInfoForm({ barangayInfo }: BarangayInfoFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        name: barangayInfo.name || "",
        district: barangayInfo.district || "",
        city: barangayInfo.city || "",
        province: barangayInfo.province || "",
        address: barangayInfo.address || "",
        contactNumber: barangayInfo.contactNumber || "",
        email: barangayInfo.email || "",
        website: barangayInfo.website || "",
        postalCode: barangayInfo.postalCode || "",
        logo: barangayInfo.logo || "",
        headerImage: barangayInfo.headerImage || "",
        footerText: barangayInfo.footerText || "",
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const res = await fetch("/api/certificates/barangay-info", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: barangayInfo.id,
                    ...formData
                }),
            })

            if (!res.ok) {
                const error = await res.text()
                throw new Error(error || "Failed to update barangay information")
            }

            toast.success("Barangay information updated successfully")
            router.refresh()
        } catch (error) {
            console.error("Error updating barangay info:", error)
            setError(error instanceof Error ? error.message : "An unexpected error occurred")
            toast.error("Failed to update barangay information")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-50 p-4 rounded-md text-red-500 text-sm">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="name">Barangay Name</Label>
                    <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter barangay name"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="district">District</Label>
                    <Input
                        id="district"
                        name="district"
                        value={formData.district}
                        onChange={handleChange}
                        placeholder="Enter district"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="city">City/Municipality</Label>
                    <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="Enter city or municipality"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="province">Province</Label>
                    <Input
                        id="province"
                        name="province"
                        value={formData.province}
                        onChange={handleChange}
                        placeholder="Enter province"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                        id="postalCode"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleChange}
                        placeholder="Enter postal code"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="contactNumber">Contact Number</Label>
                    <Input
                        id="contactNumber"
                        name="contactNumber"
                        value={formData.contactNumber}
                        onChange={handleChange}
                        placeholder="Enter contact number"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="address">Complete Address</Label>
                <Textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter complete address"
                    rows={2}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter email address"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                        id="website"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        placeholder="Enter website URL"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="logo">Logo URL</Label>
                    <Input
                        id="logo"
                        name="logo"
                        value={formData.logo}
                        onChange={handleChange}
                        placeholder="Enter URL for logo"
                    />
                    <p className="text-xs text-gray-500">URL to your barangay logo image</p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="headerImage">Header Image URL</Label>
                    <Input
                        id="headerImage"
                        name="headerImage"
                        value={formData.headerImage}
                        onChange={handleChange}
                        placeholder="Enter URL for header image"
                    />
                    <p className="text-xs text-gray-500">Optional image for certificate headers</p>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="footerText">Footer Text</Label>
                <Textarea
                    id="footerText"
                    name="footerText"
                    value={formData.footerText}
                    onChange={handleChange}
                    placeholder="Enter footer text for certificates"
                    rows={2}
                />
            </div>

            <div className="flex justify-end">
                <Button
                    type="submit"
                    disabled={loading}
                    className="bg-[#006B5E] hover:bg-[#005046]"
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                        </>
                    )}
                </Button>
            </div>
        </form>
    )
} 