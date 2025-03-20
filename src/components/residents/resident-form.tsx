"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { EmploymentStatus, IdentityType } from "@prisma/client";
import { differenceInYears } from "date-fns";
import Webcam from "react-webcam";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Upload, Camera, X } from "lucide-react";
import Image from "next/image";
import { ResidentFormData, residentSchema } from "@/lib/schema";

interface ResidentFormProps {
    households?: {
        id: string
        houseNo: string
        street: string
    }[]
    defaultValues?: ResidentFormData
    onSubmit: (data: ResidentFormData) => void
}

export default function ResidentForm({ households, defaultValues, onSubmit }: ResidentFormProps) {
    const router = useRouter()
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [showWebcam, setShowWebcam] = useState(false);
    const [photoPreview, setPhotoPreview] = useState<string | null>(defaultValues?.userPhoto || null);
    const webcamRef = useRef<Webcam>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const calculateAge = useCallback((birthDate: Date) => {
        return differenceInYears(new Date(), birthDate);
    }, []);

    const [age, setAge] = useState<number | null>(
        defaultValues?.birthDate ? calculateAge(new Date(defaultValues.birthDate)) : null
    );

    const form = useForm<ResidentFormData>({
        resolver: zodResolver(residentSchema),
        defaultValues,
    });

    const { watch } = form;
    const employmentStatus = watch("employmentStatus");
    const birthDate = watch("birthDate");
    const identityType = watch("identityType");

    useEffect(() => {
        if (birthDate) {
            setAge(calculateAge(new Date(birthDate)));
        }
    }, [birthDate, calculateAge]);

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
            employmentStatus: formData.get("employmentStatus") as EmploymentStatus,
            identityType: formData.get("identityType") as IdentityType,
            identityNumber: formData.get("identityNumber") as string | null,
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

    const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
                form.setValue("userPhoto", reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCapturePhoto = useCallback(() => {
        const photo = webcamRef.current?.getScreenshot();
        if (photo) {
            setPhotoPreview(photo);
            form.setValue("userPhoto", photo);
            setShowWebcam(false);
        }
    }, [form]);

    const handleRemovePhoto = () => {
        setPhotoPreview(null);
        form.setValue("userPhoto", undefined);
    };

    return (
        <Form {...form}>
            <form onSubmit={handleSubmit} className="space-y-8">
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

                    <FormField
                        control={form.control}
                        name="birthDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Birth Date <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
                                </FormControl>
                                {age !== null && (
                                    <FormDescription>Age: {age} years old</FormDescription>
                                )}
                                <FormMessage />
                            </FormItem>
                        )}
                    />

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

                    <FormField
                        control={form.control}
                        name="employmentStatus"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Employment Status <span className="text-red-500">*</span></FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select employment status" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {Object.values(EmploymentStatus).map((status) => (
                                            <SelectItem key={status} value={status}>
                                                {status.charAt(0) + status.slice(1).toLowerCase()}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {employmentStatus === "EMPLOYED" && (
                        <FormField
                            control={form.control}
                            name="occupation"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Occupation <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Enter occupation" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}

                    <FormField
                        control={form.control}
                        name="fatherName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Father's First Name</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Enter father's first name" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="fatherMiddleName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Father's Middle Name</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Enter father's middle name" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="fatherLastName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Father's Last Name</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Enter father's last name" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="motherFirstName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Mother's First Name</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Enter mother's first name" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="motherMiddleName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Mother's Middle Name</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Enter mother's middle name" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="motherMaidenName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Mother's Maiden Name</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Enter mother's maiden name" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="identityType"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>ID Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select ID type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {Object.values(IdentityType).map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {type.split("_").map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(" ")}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {identityType && (
                        <FormField
                            control={form.control}
                            name="identityNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>ID Number <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Enter ID number" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}
                </div>

                <div className="space-y-4">
                    <FormLabel>Resident Photo</FormLabel>
                    <div className="flex flex-col items-center gap-4">
                        {photoPreview && (
                            <div className="relative">
                                <Image
                                    src={photoPreview}
                                    alt="Resident photo"
                                    width={200}
                                    height={200}
                                    className="rounded-lg object-cover"
                                />
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    className="absolute top-2 right-2"
                                    onClick={handleRemovePhoto}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        )}

                        {!photoPreview && !showWebcam && (
                            <div className="flex gap-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Upload className="h-4 w-4 mr-2" />
                                    Upload Photo
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowWebcam(true)}
                                >
                                    <Camera className="h-4 w-4 mr-2" />
                                    Take Photo
                                </Button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handlePhotoUpload}
                                />
                            </div>
                        )}

                        {showWebcam && (
                            <div className="relative">
                                <Webcam
                                    ref={webcamRef}
                                    audio={false}
                                    screenshotFormat="image/jpeg"
                                    className="rounded-lg"
                                />
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4">
                                    <Button
                                        type="button"
                                        onClick={handleCapturePhoto}
                                    >
                                        <Camera className="h-4 w-4 mr-2" />
                                        Capture
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => setShowWebcam(false)}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        )}
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
        </Form>
    )
} 