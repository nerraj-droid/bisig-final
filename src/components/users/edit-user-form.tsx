"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Role, Status } from "@prisma/client"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

interface User {
    id: string
    name: string | null
    email: string
    role: Role
    status: Status
}

interface EditUserFormProps {
    user: User
}

export function EditUserForm({ user }: EditUserFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        name: user.name || "",
        email: user.email,
        role: user.role,
        status: user.status,
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        console.log("Submitting update for user ID:", user.id)

        try {
            // Use our new dedicated API endpoint
            const res = await fetch(`/api/user-management/update`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: user.id,
                    ...formData
                }),
            })

            // Check if the response has content and is JSON
            const text = await res.text()
            console.log("Response status:", res.status)
            console.log("Response URL:", res.url)
            console.log("Response text:", text.substring(0, 200)) // Log just the beginning to avoid huge logs

            // Try to parse JSON, but handle HTML responses
            let data: { message?: string } = {}
            try {
                if (text && !text.startsWith('<!DOCTYPE')) {
                    data = JSON.parse(text)
                } else {
                    throw new Error(`Received HTML instead of JSON - URL may be incorrect: ${res.url}`)
                }
            } catch (jsonError) {
                console.error("Failed to parse response as JSON:", jsonError)
                throw new Error(`API returned invalid JSON. Status: ${res.status}, URL: ${res.url}`)
            }

            if (!res.ok) {
                throw new Error(data.message || `Failed to update user (${res.status})`)
            }

            toast.success("User updated successfully")
            router.refresh()
            router.push("/dashboard/users")
        } catch (error) {
            console.error("Error updating user:", error)
            const errorMessage = error instanceof Error
                ? error.message
                : "An unexpected error occurred while updating the user"
            setError(errorMessage)
            toast.error(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="rounded-md bg-red-50 p-4 text-sm text-red-500">
                    {error}
                </div>
            )}

            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Name
                </label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    required
                />
            </div>

            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                </label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    required
                />
            </div>

            <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                    Role
                </label>
                <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    required
                >
                    <option value={Role.SUPER_ADMIN}>Super Admin</option>
                    <option value={Role.CAPTAIN}>Captain</option>
                    <option value={Role.SECRETARY}>Secretary</option>
                    <option value={Role.TREASURER}>Treasurer</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                    Be careful when changing roles. This affects what the user can do in the system.
                </p>
            </div>

            <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                    Status
                </label>
                <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    required
                >
                    <option value={Status.ACTIVE}>Active</option>
                    <option value={Status.INACTIVE}>Inactive</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                    Inactive users cannot log in to the system.
                </p>
            </div>

            <div className="flex justify-end space-x-3">
                <button
                    type="button"
                    onClick={() => router.push("/dashboard/users")}
                    className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Updating...
                        </>
                    ) : (
                        "Update User"
                    )}
                </button>
            </div>
        </form>
    )
} 