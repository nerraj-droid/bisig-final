"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface ResidentFormProps {
    households?: {
        id: string
        houseNo: string
        street: string
    }[]
}

export function ResidentForm({ households }: ResidentFormProps) {
    const router = useRouter()
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const data = {
            firstName: formData.get("firstName"),
            middleName: formData.get("middleName"),
            lastName: formData.get("lastName"),
            birthDate: formData.get("birthDate"),
            gender: formData.get("gender"),
            civilStatus: formData.get("civilStatus"),
            contactNo: formData.get("contactNo"),
            email: formData.get("email"),
            occupation: formData.get("occupation"),
            address: formData.get("address"),
            householdId: formData.get("householdId"),
        }

        try {
            const res = await fetch("/api/residents", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            })

            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.message)
            }

            router.push("/dashboard/residents")
            router.refresh()
        } catch (error) {
            setError(error.message)
        } finally {
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
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                        First Name
                    </label>
                    <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        required
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                    />
                </div>

                <div>
                    <label htmlFor="middleName" className="block text-sm font-medium text-gray-700">
                        Middle Name
                    </label>
                    <input
                        id="middleName"
                        name="middleName"
                        type="text"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                    />
                </div>

                <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                        Last Name
                    </label>
                    <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        required
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                    />
                </div>

                <div>
                    <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700">
                        Birth Date
                    </label>
                    <input
                        id="birthDate"
                        name="birthDate"
                        type="date"
                        required
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                    />
                </div>

                <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                        Gender
                    </label>
                    <select
                        id="gender"
                        name="gender"
                        required
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                    >
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="civilStatus" className="block text-sm font-medium text-gray-700">
                        Civil Status
                    </label>
                    <select
                        id="civilStatus"
                        name="civilStatus"
                        required
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                    >
                        <option value="SINGLE">Single</option>
                        <option value="MARRIED">Married</option>
                        <option value="WIDOWED">Widowed</option>
                        <option value="DIVORCED">Divorced</option>
                        <option value="SEPARATED">Separated</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="contactNo" className="block text-sm font-medium text-gray-700">
                        Contact Number
                    </label>
                    <input
                        id="contactNo"
                        name="contactNo"
                        type="tel"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                    />
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                    />
                </div>

                <div>
                    <label htmlFor="occupation" className="block text-sm font-medium text-gray-700">
                        Occupation
                    </label>
                    <input
                        id="occupation"
                        name="occupation"
                        type="text"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                    />
                </div>

                <div>
                    <label htmlFor="householdId" className="block text-sm font-medium text-gray-700">
                        Household
                    </label>
                    <select
                        id="householdId"
                        name="householdId"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                    >
                        <option value="">No Household</option>
                        {households?.map((household) => (
                            <option key={household.id} value={household.id}>
                                {household.houseNo} {household.street}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
            >
                {loading ? "Creating..." : "Create Resident"}
            </button>
        </form>
    )
} 