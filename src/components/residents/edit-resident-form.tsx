"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"

interface Household {
    id: string
    houseNo: string
    street: string
}

interface Resident {
    id: string
    firstName: string
    middleName: string | null
    lastName: string
    extensionName: string | null
    alias: string | null
    birthDate: Date
    gender: string
    civilStatus: string
    contactNo: string | null
    email: string | null
    occupation: string | null
    educationalAttainment: string | null
    bloodType: string | null
    religion: string | null
    ethnicGroup: string | null
    nationality: string
    address: string
    householdId: string | null
    userPhoto: string | null
    motherMaidenName: string | null
    motherMiddleName: string | null
    motherFirstName: string | null
    fatherName: string | null
    fatherLastName: string | null
    fatherMiddleName: string | null
    familySerialNumber: string | null
    headOfHousehold: boolean
    familyRole: string | null
    voterInBarangay: boolean
    votersIdNumber: string | null
    lastVotingParticipationDate: Date | null
}

interface EditResidentFormProps {
    resident: Resident
    households: Household[]
}

export function EditResidentForm({ resident, households }: EditResidentFormProps) {
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

            const res = await fetch(`/api/residents/${resident.id}`, {
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

            router.push(`/dashboard/residents/${resident.id}`)
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
                        defaultValue={resident.firstName}
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
                        defaultValue={resident.middleName || ""}
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
                        defaultValue={resident.lastName}
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
                        defaultValue={resident.extensionName || ""}
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
                        defaultValue={resident.alias || ""}
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
                        defaultValue={format(new Date(resident.birthDate), "yyyy-MM-dd")}
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
                        defaultValue={resident.gender}
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
                        defaultValue={resident.civilStatus}
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
                        defaultValue={resident.contactNo || ""}
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
                        defaultValue={resident.email || ""}
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
                        defaultValue={resident.occupation || ""}
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
                        defaultValue={resident.educationalAttainment || ""}
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
                        defaultValue={resident.bloodType || ""}
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
                        defaultValue={resident.religion || ""}
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
                        defaultValue={resident.ethnicGroup || ""}
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
                        defaultValue={resident.nationality}
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
                        defaultValue={resident.address}
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
                        defaultValue={resident.userPhoto || ""}
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
                        defaultValue={resident.motherMaidenName || ""}
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
                        defaultValue={resident.motherMiddleName || ""}
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
                        defaultValue={resident.motherFirstName || ""}
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
                        defaultValue={resident.fatherName || ""}
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
                        defaultValue={resident.fatherLastName || ""}
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
                        defaultValue={resident.fatherMiddleName || ""}
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
                        defaultValue={resident.familySerialNumber || ""}
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
                        defaultValue={resident.familyRole || ""}
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
                        defaultValue={resident.headOfHousehold ? "true" : "false"}
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
                        defaultValue={resident.voterInBarangay ? "true" : "false"}
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
                        defaultValue={resident.votersIdNumber || ""}
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
                        defaultValue={resident.lastVotingParticipationDate ? format(new Date(resident.lastVotingParticipationDate), "yyyy-MM-dd") : ""}
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
                        defaultValue={resident.householdId || ""}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                    >
                        <option value="">No Household</option>
                        {households.map((household) => (
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
                {loading ? "Saving..." : "Save Changes"}
            </button>
        </form>
    )
} 