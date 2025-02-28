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
            firstName: formData.get("firstName") as string,
            middleName: formData.get("middleName") as string | null,
            lastName: formData.get("lastName") as string,
            extensionName: formData.get("extensionName") as string | null,
            alias: formData.get("alias") as string | null,
            birthDate: formData.get("birthDate") as string,
            gender: formData.get("gender") as string,
            civilStatus: formData.get("civilStatus") as string,
            contactNo: formData.get("contactNo") as string | null,
            email: formData.get("email") as string | null,
            occupation: formData.get("occupation") as string | null,
            educationalAttainment: formData.get("educationalAttainment") as string | null,
            bloodType: formData.get("bloodType") as string | null,
            religion: formData.get("religion") as string | null,
            ethnicGroup: formData.get("ethnicGroup") as string | null,
            nationality: formData.get("nationality") as string,
            address: formData.get("address") as string,
            householdId: formData.get("householdId") as string | null,
            userPhoto: formData.get("userPhoto") as string | null,
            motherMaidenName: formData.get("motherMaidenName") as string | null,
            motherMiddleName: formData.get("motherMiddleName") as string | null,
            motherFirstName: formData.get("motherFirstName") as string | null,
            fatherName: formData.get("fatherName") as string | null,
            fatherLastName: formData.get("fatherLastName") as string | null,
            fatherMiddleName: formData.get("fatherMiddleName") as string | null,
            familySerialNumber: formData.get("familySerialNumber") as string | null,
            headOfHousehold: formData.get("headOfHousehold") === "true",
            familyRole: formData.get("familyRole") as string | null,
            voterInBarangay: formData.get("voterInBarangay") === "true",
            votersIdNumber: formData.get("votersIdNumber") as string | null,
            lastVotingParticipationDate: formData.get("lastVotingParticipationDate") as string | null,
        }

        // Validation rules
        try {
            // Required fields check
            const requiredFields = ['firstName', 'lastName', 'birthDate', 'gender', 'civilStatus', 'address'] as const
            for (const field of requiredFields) {
                if (!data[field]) {
                    throw new Error(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`)
                }
            }

            // Email format check
            if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
                throw new Error('Invalid email format')
            }

            // Contact number format check (if provided)
            if (data.contactNo && !/^(\+63|0)[0-9]{10}$/.test(data.contactNo)) {
                throw new Error('Invalid contact number format. Use +63 or 0 followed by 10 digits')
            }

            // Birth date validation (must be in the past)
            if (data.birthDate) {
                const birthDate = new Date(data.birthDate)
                if (birthDate > new Date()) {
                    throw new Error('Birth date cannot be in the future')
                }
            }

            // Gender validation
            if (!['MALE', 'FEMALE', 'OTHER'].includes(data.gender)) {
                throw new Error('Invalid gender value')
            }

            // Civil status validation
            if (!['SINGLE', 'MARRIED', 'WIDOWED', 'DIVORCED', 'SEPARATED'].includes(data.civilStatus)) {
                throw new Error('Invalid civil status')
            }

            // Continue with the API call
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
            if (error instanceof Error) {
                setError(error.message)
            } else {
                setError("An unknown error occurred")
            }
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

            <div className="text-sm text-gray-500 mb-4">
                Fields marked with <span className="text-red-500">*</span> are required
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                        First Name <span className="text-red-500">*</span>
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
                        Last Name <span className="text-red-500">*</span>
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
                    <label htmlFor="extensionName" className="block text-sm font-medium text-gray-700">
                        Extension Name
                    </label>
                    <input
                        id="extensionName"
                        name="extensionName"
                        type="text"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                    />
                </div>

                <div>
                    <label htmlFor="alias" className="block text-sm font-medium text-gray-700">
                        Alias
                    </label>
                    <input
                        id="alias"
                        name="alias"
                        type="text"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                    />
                </div>

                <div>
                    <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700">
                        Birth Date <span className="text-red-500">*</span>
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
                        Gender <span className="text-red-500">*</span>
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
                        Civil Status <span className="text-red-500">*</span>
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
                    <label htmlFor="educationalAttainment" className="block text-sm font-medium text-gray-700">
                        Educational Attainment
                    </label>
                    <input
                        id="educationalAttainment"
                        name="educationalAttainment"
                        type="text"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                    />
                </div>

                <div>
                    <label htmlFor="bloodType" className="block text-sm font-medium text-gray-700">
                        Blood Type
                    </label>
                    <input
                        id="bloodType"
                        name="bloodType"
                        type="text"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                    />
                </div>

                <div>
                    <label htmlFor="religion" className="block text-sm font-medium text-gray-700">
                        Religion
                    </label>
                    <input
                        id="religion"
                        name="religion"
                        type="text"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                    />
                </div>

                <div>
                    <label htmlFor="ethnicGroup" className="block text-sm font-medium text-gray-700">
                        Ethnic Group
                    </label>
                    <input
                        id="ethnicGroup"
                        name="ethnicGroup"
                        type="text"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                    />
                </div>

                <div>
                    <label htmlFor="nationality" className="block text-sm font-medium text-gray-700">
                        Nationality
                    </label>
                    <input
                        id="nationality"
                        name="nationality"
                        type="text"
                        defaultValue="Filipino"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                    />
                </div>

                <div className="col-span-2">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                        Address <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="address"
                        name="address"
                        type="text"
                        required
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                    />
                </div>

                <div className="col-span-2">
                    <label htmlFor="userPhoto" className="block text-sm font-medium text-gray-700">
                        Photo URL
                    </label>
                    <input
                        id="userPhoto"
                        name="userPhoto"
                        type="text"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                    />
                </div>

                <div>
                    <label htmlFor="motherMaidenName" className="block text-sm font-medium text-gray-700">
                        Mother's Maiden Name
                    </label>
                    <input
                        id="motherMaidenName"
                        name="motherMaidenName"
                        type="text"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                    />
                </div>

                <div>
                    <label htmlFor="motherMiddleName" className="block text-sm font-medium text-gray-700">
                        Mother's Middle Name
                    </label>
                    <input
                        id="motherMiddleName"
                        name="motherMiddleName"
                        type="text"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                    />
                </div>

                <div>
                    <label htmlFor="motherFirstName" className="block text-sm font-medium text-gray-700">
                        Mother's First Name
                    </label>
                    <input
                        id="motherFirstName"
                        name="motherFirstName"
                        type="text"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                    />
                </div>

                <div>
                    <label htmlFor="fatherName" className="block text-sm font-medium text-gray-700">
                        Father's Name
                    </label>
                    <input
                        id="fatherName"
                        name="fatherName"
                        type="text"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                    />
                </div>

                <div>
                    <label htmlFor="fatherLastName" className="block text-sm font-medium text-gray-700">
                        Father's Last Name
                    </label>
                    <input
                        id="fatherLastName"
                        name="fatherLastName"
                        type="text"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                    />
                </div>

                <div>
                    <label htmlFor="fatherMiddleName" className="block text-sm font-medium text-gray-700">
                        Father's Middle Name
                    </label>
                    <input
                        id="fatherMiddleName"
                        name="fatherMiddleName"
                        type="text"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                    />
                </div>

                <div>
                    <label htmlFor="familySerialNumber" className="block text-sm font-medium text-gray-700">
                        Family Serial Number
                    </label>
                    <input
                        id="familySerialNumber"
                        name="familySerialNumber"
                        type="text"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                    />
                </div>

                <div>
                    <label htmlFor="familyRole" className="block text-sm font-medium text-gray-700">
                        Family Role
                    </label>
                    <input
                        id="familyRole"
                        name="familyRole"
                        type="text"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                    />
                </div>

                <div>
                    <label htmlFor="headOfHousehold" className="block text-sm font-medium text-gray-700">
                        Head of Household
                    </label>
                    <select
                        id="headOfHousehold"
                        name="headOfHousehold"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                    >
                        <option value="false">No</option>
                        <option value="true">Yes</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="voterInBarangay" className="block text-sm font-medium text-gray-700">
                        Voter in Barangay
                    </label>
                    <select
                        id="voterInBarangay"
                        name="voterInBarangay"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                    >
                        <option value="false">No</option>
                        <option value="true">Yes</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="votersIdNumber" className="block text-sm font-medium text-gray-700">
                        Voter's ID Number
                    </label>
                    <input
                        id="votersIdNumber"
                        name="votersIdNumber"
                        type="text"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                    />
                </div>

                <div>
                    <label htmlFor="lastVotingParticipationDate" className="block text-sm font-medium text-gray-700">
                        Last Voting Participation Date
                    </label>
                    <input
                        id="lastVotingParticipationDate"
                        name="lastVotingParticipationDate"
                        type="date"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                    />
                </div>

                <div className="col-span-2">
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