"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { PageTransition } from "@/components/ui/page-transition"

export default function ResidentFilterPage() {
    const router = useRouter()
    const searchParams = useSearchParams()

    // Initialize with current URL params if any
    const [gender, setGender] = useState<string>(searchParams.get('gender') || '')
    const [ageGroup, setAgeGroup] = useState<string>(searchParams.get('ageGroup') || '')
    const [civilStatus, setCivilStatus] = useState<string>(searchParams.get('civilStatus') || '')
    const [isVoter, setIsVoter] = useState<boolean>(searchParams.get('voter') === 'true')

    // Handle form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        // Build query parameters
        const params = new URLSearchParams()

        if (gender) params.append('gender', gender)
        if (ageGroup) params.append('ageGroup', ageGroup)
        if (civilStatus) params.append('civilStatus', civilStatus)
        if (isVoter) params.append('voter', 'true')

        // Navigate to residents page with filters
        router.push(`/dashboard/residents?${params.toString()}`)
    }

    return (
        <PageTransition>
            <div className="w-full max-w-4xl mx-auto">
                {/* Back button and page title */}
                <div className="flex items-center mb-6">
                    <Link href="/dashboard/residents" className="text-[#006B5E] hover:text-[#F39C12] transition-colors mr-4">
                        <ArrowLeft size={24} />
                    </Link>
                    <h1 className="text-2xl font-bold text-[#006B5E]">ADVANCED FILTER</h1>
                </div>

                <div className="bg-white p-6 rounded-xl shadow border border-[#F39C12]/30">
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Gender Filter */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-[#006B5E]">Gender</h3>
                                <RadioGroup value={gender} onValueChange={setGender}>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="" id="gender-all" />
                                        <Label htmlFor="gender-all">All</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="MALE" id="gender-male" />
                                        <Label htmlFor="gender-male">Male</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="FEMALE" id="gender-female" />
                                        <Label htmlFor="gender-female">Female</Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            {/* Age Group Filter */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-[#006B5E]">Age Group</h3>
                                <RadioGroup value={ageGroup} onValueChange={setAgeGroup}>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="" id="age-all" />
                                        <Label htmlFor="age-all">All Ages</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="child" id="age-child" />
                                        <Label htmlFor="age-child">Children (0-12 years)</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="young-adult" id="age-young-adult" />
                                        <Label htmlFor="age-young-adult">Young Adults (13-30 years)</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="adult" id="age-adult" />
                                        <Label htmlFor="age-adult">Adults (31-60 years)</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="senior" id="age-senior" />
                                        <Label htmlFor="age-senior">Senior Citizens (60+ years)</Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            {/* Civil Status Filter */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-[#006B5E]">Civil Status</h3>
                                <RadioGroup value={civilStatus} onValueChange={setCivilStatus}>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="" id="civil-all" />
                                        <Label htmlFor="civil-all">All</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="SINGLE" id="civil-single" />
                                        <Label htmlFor="civil-single">Single</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="MARRIED" id="civil-married" />
                                        <Label htmlFor="civil-married">Married</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="WIDOWED" id="civil-widowed" />
                                        <Label htmlFor="civil-widowed">Widowed</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="SEPARATED" id="civil-separated" />
                                        <Label htmlFor="civil-separated">Separated</Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            {/* Voter Filter */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-[#006B5E]">Voter Status</h3>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="voter"
                                        checked={isVoter}
                                        onCheckedChange={(checked) => setIsVoter(checked as boolean)}
                                    />
                                    <Label htmlFor="voter">Registered Voters Only</Label>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-8 flex justify-end gap-4">
                            <Link href="/dashboard/residents">
                                <Button variant="outline" type="button">Cancel</Button>
                            </Link>
                            <Button className="bg-[#006B5E] hover:bg-[#005046]" type="submit">
                                Apply Filters
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </PageTransition>
    )
} 