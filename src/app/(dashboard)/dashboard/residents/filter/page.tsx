"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save, X, Filter, RotateCcw, Tag, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { PageTransition } from "@/components/ui/page-transition"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Define the type for a filter preset
type FilterPreset = {
    name: string;
    filters: Record<string, any>;
};

// Define available identity types
const IDENTITY_TYPES = [
    "Philippine Passport",
    "Driver's License",
    "Unified Multi-Purpose ID",
    "SSS",
    "GSIS",
    "PhilSys ID",
    "PRC ID",
    "Voter's ID",
    "Postal ID",
    "OWWA ID",
    "OFW ID",
    "Seaman's Book",
    "Barangay Clearance",
    "Police Clearance",
    "NBI Clearance",
    "PhilHealth ID",
    "Pag-IBIG Card",
    "Senior Citizen ID",
    "PWD ID",
    "IP ID",
    "Firearms License",
    "Government Company ID",
    "Student ID"
];

export default function ResidentFilterPage() {
    const router = useRouter()
    const searchParams = useSearchParams()

    // State for basic filters
    const [gender, setGender] = useState<string>(searchParams.get('gender') || '')
    const [civilStatus, setCivilStatus] = useState<string>(searchParams.get('civilStatus') || '')
    const [isVoter, setIsVoter] = useState<boolean>(searchParams.get('voter') === 'true')
    const [minAge, setMinAge] = useState<string>(searchParams.get('minAge') || '')
    const [maxAge, setMaxAge] = useState<string>(searchParams.get('maxAge') || '')

    // State for precise age filtering
    const [ageYears, setAgeYears] = useState<string>(searchParams.get('ageYears') || '')
    const [ageMonths, setAgeMonths] = useState<string>(searchParams.get('ageMonths') || '')
    const [ageDays, setAgeDays] = useState<string>(searchParams.get('ageDays') || '')

    // State for advanced filters
    const [employmentStatus, setEmploymentStatus] = useState<string>(searchParams.get('employmentStatus') || 'ALL')
    const [educationalAttainment, setEducationalAttainment] = useState<string>(searchParams.get('educationalAttainment') || 'ALL')
    const [sectors, setSectors] = useState<string[]>(() => {
        const sectorParam = searchParams.get('sectors');
        return sectorParam ? sectorParam.split(',') : [];
    })
    const [religion, setReligion] = useState<string>(searchParams.get('religion') || '')
    const [bloodType, setBloodType] = useState<string>(searchParams.get('bloodType') || 'ALL')

    // Location filters
    const [barangay, setBarangay] = useState<string>(searchParams.get('barangay') || '')
    const [street, setStreet] = useState<string>(searchParams.get('street') || '')
    const [houseNo, setHouseNo] = useState<string>(searchParams.get('houseNo') || '')
    const [city, setCity] = useState<string>(searchParams.get('city') || '')
    const [province, setProvince] = useState<string>(searchParams.get('province') || '')
    const [purokSitio, setPurokSitio] = useState<string>(searchParams.get('purokSitio') || '')

    // Additional filters
    const [nationality, setNationality] = useState<string>(searchParams.get('nationality') || '')
    const [ethnicGroup, setEthnicGroup] = useState<string>(searchParams.get('ethnicGroup') || '')
    const [hasId, setHasId] = useState<boolean>(searchParams.get('hasId') === 'true')
    const [identityType, setIdentityType] = useState<string>(searchParams.get('identityType') || 'ALL')
    const [isHeadOfHousehold, setIsHeadOfHousehold] = useState<boolean>(searchParams.get('isHeadOfHousehold') === 'true')

    // For saved presets
    const [presetName, setPresetName] = useState<string>('')
    const [savedPresets, setSavedPresets] = useState<FilterPreset[]>([])
    const [showSaveDialog, setShowSaveDialog] = useState<boolean>(false)

    // Load saved presets from localStorage on component mount
    useEffect(() => {
        const storedPresets = localStorage.getItem('residentFilterPresets')
        if (storedPresets) {
            setSavedPresets(JSON.parse(storedPresets))
        }
    }, [])

    // Options for dropdowns
    const employmentOptions = ["ALL", "EMPLOYED", "SELF_EMPLOYED", "UNEMPLOYED", "STUDENT", "RETIRED"]
    const educationOptions = ["ALL", "NO_EDUCATION", "ELEMENTARY", "HIGH_SCHOOL", "VOCATIONAL", "COLLEGE", "POST_GRADUATE"]
    const sectorOptions = ["PWD", "SENIOR_CITIZEN", "SOLO_PARENT", "LGBTQ+", "YOUTH", "WOMEN", "INDIGENOUS"]
    const bloodTypeOptions = ["ALL", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

    // Handle form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        // Build query parameters
        const params = new URLSearchParams()

        if (gender) params.append('gender', gender)
        if (civilStatus) params.append('civilStatus', civilStatus)
        if (isVoter) params.append('voter', 'true')

        // Make sure age parameters are added properly
        if (minAge && minAge.trim() !== '') params.append('minAge', minAge)
        if (maxAge && maxAge.trim() !== '') params.append('maxAge', maxAge)

        // Add precise age parameters
        if (ageYears && ageYears.trim() !== '') params.append('ageYears', ageYears)
        if (ageMonths && ageMonths.trim() !== '') params.append('ageMonths', ageMonths)
        if (ageDays && ageDays.trim() !== '') params.append('ageDays', ageDays)

        // Add new filter parameters with "ALL" checking
        if (employmentStatus && employmentStatus !== 'ALL') params.append('employmentStatus', employmentStatus)
        if (educationalAttainment && educationalAttainment !== 'ALL') params.append('educationalAttainment', educationalAttainment)
        if (sectors.length > 0) params.append('sectors', sectors.join(','))
        if (religion) params.append('religion', religion)
        if (bloodType && bloodType !== 'ALL') params.append('bloodType', bloodType)

        // Add location filters
        if (barangay) params.append('barangay', barangay)
        if (street) params.append('street', street)
        if (houseNo) params.append('houseNo', houseNo)
        if (city) params.append('city', city)
        if (province) params.append('province', province)
        if (purokSitio) params.append('purokSitio', purokSitio)

        // Add additional filters
        if (nationality) params.append('nationality', nationality)
        if (ethnicGroup) params.append('ethnicGroup', ethnicGroup)
        if (hasId) params.append('hasId', 'true')
        if (identityType && identityType !== 'ALL') params.append('identityType', identityType)
        if (isHeadOfHousehold) params.append('isHeadOfHousehold', 'true')

        // Log parameters for debugging
        console.log('Filter params:', Object.fromEntries(params.entries()))

        // Navigate to residents page with filters
        router.push(`/dashboard/residents?${params.toString()}`)
    }

    // Save current filter as preset
    const savePreset = () => {
        if (!presetName.trim()) return

        const newPreset: FilterPreset = {
            name: presetName,
            filters: {
                gender,
                civilStatus,
                isVoter,
                minAge,
                maxAge,
                ageYears,
                ageMonths,
                ageDays,
                employmentStatus,
                educationalAttainment,
                sectors,
                religion,
                bloodType
            }
        }

        const updatedPresets = [...savedPresets, newPreset]
        setSavedPresets(updatedPresets)

        // Save to localStorage
        localStorage.setItem('residentFilterPresets', JSON.stringify(updatedPresets))

        // Reset and close dialog
        setPresetName('')
        setShowSaveDialog(false)
    }

    // Load a saved preset
    const loadPreset = (preset: FilterPreset) => {
        const { filters } = preset

        setGender(filters.gender || '')
        setCivilStatus(filters.civilStatus || '')
        setIsVoter(filters.isVoter || false)
        setMinAge(filters.minAge || '')
        setMaxAge(filters.maxAge || '')
        setAgeYears(filters.ageYears || '')
        setAgeMonths(filters.ageMonths || '')
        setAgeDays(filters.ageDays || '')
        setEmploymentStatus(filters.employmentStatus || 'ALL')
        setEducationalAttainment(filters.educationalAttainment || 'ALL')
        setSectors(filters.sectors || [])
        setReligion(filters.religion || '')
        setBloodType(filters.bloodType || 'ALL')

        // Load location filters
        setBarangay(filters.barangay || '')
        setStreet(filters.street || '')
        setHouseNo(filters.houseNo || '')
        setCity(filters.city || '')
        setProvince(filters.province || '')
        setPurokSitio(filters.purokSitio || '')

        // Load additional filters
        setNationality(filters.nationality || '')
        setEthnicGroup(filters.ethnicGroup || '')
        setHasId(filters.hasId || false)
        setIdentityType(filters.identityType || 'ALL')
        setIsHeadOfHousehold(filters.isHeadOfHousehold || false)
    }

    // Delete a saved preset
    const deletePreset = (index: number) => {
        const updatedPresets = savedPresets.filter((_, i) => i !== index)
        setSavedPresets(updatedPresets)
        localStorage.setItem('residentFilterPresets', JSON.stringify(updatedPresets))
    }

    // Reset all filters
    const resetFilters = () => {
        setGender('')
        setCivilStatus('')
        setIsVoter(false)
        setMinAge('')
        setMaxAge('')
        setAgeYears('')
        setAgeMonths('')
        setAgeDays('')
        setEmploymentStatus('ALL')
        setEducationalAttainment('ALL')
        setSectors([])
        setReligion('')
        setBloodType('ALL')

        // Reset location filters
        setBarangay('')
        setStreet('')
        setHouseNo('')
        setCity('')
        setProvince('')
        setPurokSitio('')

        // Reset additional filters
        setNationality('')
        setEthnicGroup('')
        setHasId(false)
        setIdentityType('ALL')
        setIsHeadOfHousehold(false)
    }

    // Toggle a sector in the sectors array
    const toggleSector = (sector: string) => {
        setSectors(prev =>
            prev.includes(sector)
                ? prev.filter(s => s !== sector)
                : [...prev, sector]
        )
    }

    // Count active filters to show in the UI
    const getActiveFilterCount = () => {
        let count = 0
        if (gender) count++
        if (civilStatus) count++
        if (isVoter) count++
        if (minAge || maxAge) count++
        if (ageYears || ageMonths || ageDays) count++
        if (employmentStatus && employmentStatus !== 'ALL') count++
        if (educationalAttainment && educationalAttainment !== 'ALL') count++
        if (sectors.length) count++
        if (religion) count++
        if (bloodType && bloodType !== 'ALL') count++

        // Count location filters
        if (barangay) count++
        if (street) count++
        if (houseNo) count++
        if (city) count++
        if (province) count++
        if (purokSitio) count++

        // Count additional filters
        if (nationality) count++
        if (ethnicGroup) count++
        if (hasId) count++
        if (identityType && identityType !== 'ALL') count++
        if (isHeadOfHousehold) count++

        return count
    }

    return (
        <PageTransition>
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="flex items-center justify-between py-6 border-b border-gray-200">
                    <div className="flex items-center space-x-4">
                        <Link
                            href="/dashboard/residents"
                            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5 mr-1" />
                            Back
                        </Link>
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">Advanced Filter</h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Create custom filters to find specific residents
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <Button
                            variant="outline"
                            onClick={resetFilters}
                            className="border-gray-300"
                        >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Reset All
                        </Button>

                        <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="border-gray-300">
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Preset
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Save Filter Preset</DialogTitle>
                                    <DialogDescription>
                                        Give your filter preset a name to save it for future use.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="py-4">
                                    <Label htmlFor="preset-name">Preset Name</Label>
                                    <Input
                                        id="preset-name"
                                        value={presetName}
                                        onChange={(e) => setPresetName(e.target.value)}
                                        placeholder="e.g., Senior Female Voters"
                                        className="mt-2"
                                    />
                                </div>
                                <DialogFooter>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowSaveDialog(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={savePreset}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        Save Preset
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Active Filters Summary */}
                {getActiveFilterCount() > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 my-6">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center">
                                <Filter className="h-4 w-4 text-blue-600 mr-2" />
                                <span className="text-sm font-medium text-blue-900">
                                    Active Filters ({getActiveFilterCount()})
                                </span>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={resetFilters}
                                className="text-blue-600 hover:text-blue-800"
                            >
                                Clear All
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {/* Gender Badge */}
                            {gender && (
                                <Badge variant="secondary" className="flex items-center gap-1">
                                    Gender: {gender}
                                    <button
                                        onClick={() => setGender('')}
                                        className="ml-1 text-gray-400 hover:text-red-500"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            )}

                            {/* Civil Status Badge */}
                            {civilStatus && (
                                <Badge variant="secondary" className="flex items-center gap-1">
                                    Civil Status: {civilStatus}
                                    <button
                                        onClick={() => setCivilStatus('')}
                                        className="ml-1 text-gray-400 hover:text-red-500"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            )}

                            {/* Voter Badge */}
                            {isVoter && (
                                <Badge variant="secondary" className="flex items-center gap-1">
                                    Registered Voter
                                    <button
                                        onClick={() => setIsVoter(false)}
                                        className="ml-1 text-gray-400 hover:text-red-500"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            )}

                            {/* Age Range Badge */}
                            {(minAge || maxAge) && (
                                <Badge variant="secondary" className="flex items-center gap-1">
                                    Age: {minAge || '0'} - {maxAge || '∞'}
                                    <button
                                        onClick={() => { setMinAge(''); setMaxAge(''); }}
                                        className="ml-1 text-gray-400 hover:text-red-500"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            )}

                            {/* Employment Badge */}
                            {employmentStatus && employmentStatus !== 'ALL' && (
                                <Badge variant="secondary" className="flex items-center gap-1">
                                    Employment: {employmentStatus.replace('_', ' ')}
                                    <button
                                        onClick={() => setEmploymentStatus('ALL')}
                                        className="ml-1 text-gray-400 hover:text-red-500"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            )}

                            {/* Education Badge */}
                            {educationalAttainment && educationalAttainment !== 'ALL' && (
                                <Badge variant="secondary" className="flex items-center gap-1">
                                    Education: {educationalAttainment.replace('_', ' ')}
                                    <button
                                        onClick={() => setEducationalAttainment('ALL')}
                                        className="ml-1 text-gray-400 hover:text-red-500"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            )}

                            {/* Sectors Badges */}
                            {sectors.map(sector => (
                                <Badge key={sector} variant="secondary" className="flex items-center gap-1">
                                    {sector.replace('_', ' ')}
                                    <button
                                        onClick={() => toggleSector(sector)}
                                        className="ml-1 text-gray-400 hover:text-red-500"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            ))}

                            {/* Show only first few badges and "X more" if there are many */}
                            {getActiveFilterCount() > 8 && (
                                <Badge variant="outline">
                                    +{getActiveFilterCount() - 8} more
                                </Badge>
                            )}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 my-8">
                    {/* Saved Presets Sidebar */}
                    {savedPresets.length > 0 && (
                        <div className="lg:col-span-1">
                            <Card className="border-gray-200">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg font-medium text-gray-900">Saved Presets</CardTitle>
                                    <CardDescription className="text-sm text-gray-500">
                                        Load your saved filter configurations
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {savedPresets.map((preset, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                                            <Button
                                                variant="ghost"
                                                className="text-left w-full justify-start p-0 h-auto font-normal"
                                                onClick={() => loadPreset(preset)}
                                            >
                                                <Tag className="h-4 w-4 mr-2 text-blue-600" />
                                                <span className="text-sm">{preset.name}</span>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => deletePreset(index)}
                                                className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Main Filter Form */}
                    <div className={savedPresets.length > 0 ? "lg:col-span-3" : "lg:col-span-4"}>
                        <Card className="border-gray-200">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg font-medium text-gray-900">Filter Options</CardTitle>
                                <CardDescription className="text-sm text-gray-500">
                                    Configure your search criteria to find specific residents
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit}>
                                    <Accordion type="multiple" defaultValue={["basic"]} className="space-y-4">
                                        {/* Basic Filters */}
                                        <AccordionItem value="basic" className="border border-gray-200 rounded-lg">
                                            <AccordionTrigger className="px-4 py-3 text-gray-900 font-medium hover:no-underline">
                                                Basic Information
                                            </AccordionTrigger>
                                            <AccordionContent className="px-4 pb-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {/* Gender Filter */}
                                                    <div className="space-y-3">
                                                        <Label className="text-sm font-medium text-gray-700">Gender</Label>
                                                        <RadioGroup value={gender} onValueChange={setGender} className="space-y-2">
                                                            <div className="flex items-center space-x-2">
                                                                <RadioGroupItem value="" id="gender-all" />
                                                                <Label htmlFor="gender-all" className="text-sm">All</Label>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <RadioGroupItem value="MALE" id="gender-male" />
                                                                <Label htmlFor="gender-male" className="text-sm">Male</Label>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <RadioGroupItem value="FEMALE" id="gender-female" />
                                                                <Label htmlFor="gender-female" className="text-sm">Female</Label>
                                                            </div>
                                                        </RadioGroup>
                                                    </div>

                                                    {/* Civil Status Filter */}
                                                    <div className="space-y-3">
                                                        <Label className="text-sm font-medium text-gray-700">Civil Status</Label>
                                                        <RadioGroup value={civilStatus} onValueChange={setCivilStatus} className="space-y-2">
                                                            <div className="flex items-center space-x-2">
                                                                <RadioGroupItem value="" id="civil-all" />
                                                                <Label htmlFor="civil-all" className="text-sm">All</Label>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <RadioGroupItem value="SINGLE" id="civil-single" />
                                                                <Label htmlFor="civil-single" className="text-sm">Single</Label>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <RadioGroupItem value="MARRIED" id="civil-married" />
                                                                <Label htmlFor="civil-married" className="text-sm">Married</Label>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <RadioGroupItem value="WIDOWED" id="civil-widowed" />
                                                                <Label htmlFor="civil-widowed" className="text-sm">Widowed</Label>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <RadioGroupItem value="SEPARATED" id="civil-separated" />
                                                                <Label htmlFor="civil-separated" className="text-sm">Separated</Label>
                                                            </div>
                                                        </RadioGroup>
                                                    </div>

                                                    {/* Age Range Filter */}
                                                    <div className="space-y-3">
                                                        <Label className="text-sm font-medium text-gray-700">Age Range</Label>
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div>
                                                                <Label htmlFor="min-age" className="text-xs text-gray-500">Minimum Age</Label>
                                                                <Input
                                                                    id="min-age"
                                                                    type="number"
                                                                    min="0"
                                                                    max="150"
                                                                    placeholder="0"
                                                                    value={minAge}
                                                                    onChange={(e) => setMinAge(e.target.value)}
                                                                    className="mt-1"
                                                                />
                                                            </div>
                                                            <div>
                                                                <Label htmlFor="max-age" className="text-xs text-gray-500">Maximum Age</Label>
                                                                <Input
                                                                    id="max-age"
                                                                    type="number"
                                                                    min="0"
                                                                    max="150"
                                                                    placeholder="100"
                                                                    value={maxAge}
                                                                    onChange={(e) => setMaxAge(e.target.value)}
                                                                    className="mt-1"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Voter Status */}
                                                    <div className="space-y-3">
                                                        <Label className="text-sm font-medium text-gray-700">Voter Status</Label>
                                                        <div className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id="voter"
                                                                checked={isVoter}
                                                                onCheckedChange={(checked) => setIsVoter(checked as boolean)}
                                                            />
                                                            <Label htmlFor="voter" className="text-sm">Registered voters only</Label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>

                                        {/* Professional Information */}
                                        <AccordionItem value="professional" className="border border-gray-200 rounded-lg">
                                            <AccordionTrigger className="px-4 py-3 text-gray-900 font-medium hover:no-underline">
                                                Professional & Education
                                            </AccordionTrigger>
                                            <AccordionContent className="px-4 pb-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {/* Employment Status */}
                                                    <div className="space-y-3">
                                                        <Label className="text-sm font-medium text-gray-700">Employment Status</Label>
                                                        <Select value={employmentStatus} onValueChange={setEmploymentStatus}>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select status" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="ALL">All</SelectItem>
                                                                {employmentOptions.slice(1).map(option => (
                                                                    <SelectItem key={option} value={option}>
                                                                        {option.replace('_', ' ')}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    {/* Educational Attainment */}
                                                    <div className="space-y-3">
                                                        <Label className="text-sm font-medium text-gray-700">Educational Attainment</Label>
                                                        <Select value={educationalAttainment} onValueChange={setEducationalAttainment}>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select education level" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="ALL">All</SelectItem>
                                                                {educationOptions.slice(1).map(option => (
                                                                    <SelectItem key={option} value={option}>
                                                                        {option.replace('_', ' ')}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>

                                        {/* Location Filters */}
                                        <AccordionItem value="location" className="border border-gray-200 rounded-lg">
                                            <AccordionTrigger className="px-4 py-3 text-gray-900 font-medium hover:no-underline">
                                                Location Information
                                            </AccordionTrigger>
                                            <AccordionContent className="px-4 pb-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="province-filter" className="text-sm font-medium text-gray-700">Province</Label>
                                                        <Input
                                                            id="province-filter"
                                                            type="text"
                                                            placeholder="Enter province"
                                                            value={province}
                                                            onChange={(e) => setProvince(e.target.value)}
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="city-filter" className="text-sm font-medium text-gray-700">City/Municipality</Label>
                                                        <Input
                                                            id="city-filter"
                                                            type="text"
                                                            placeholder="Enter city/municipality"
                                                            value={city}
                                                            onChange={(e) => setCity(e.target.value)}
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="barangay-filter" className="text-sm font-medium text-gray-700">Barangay</Label>
                                                        <Input
                                                            id="barangay-filter"
                                                            type="text"
                                                            placeholder="Enter barangay"
                                                            value={barangay}
                                                            onChange={(e) => setBarangay(e.target.value)}
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="street-filter" className="text-sm font-medium text-gray-700">Street</Label>
                                                        <Input
                                                            id="street-filter"
                                                            type="text"
                                                            placeholder="Enter street"
                                                            value={street}
                                                            onChange={(e) => setStreet(e.target.value)}
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="house-no-filter" className="text-sm font-medium text-gray-700">House No.</Label>
                                                        <Input
                                                            id="house-no-filter"
                                                            type="text"
                                                            placeholder="Enter house number"
                                                            value={houseNo}
                                                            onChange={(e) => setHouseNo(e.target.value)}
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="purok-sitio-filter" className="text-sm font-medium text-gray-700">Purok/Sitio</Label>
                                                        <Input
                                                            id="purok-sitio-filter"
                                                            type="text"
                                                            placeholder="Enter purok or sitio"
                                                            value={purokSitio}
                                                            onChange={(e) => setPurokSitio(e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>

                                        {/* Additional Filters */}
                                        <AccordionItem value="additional" className="border border-gray-200 rounded-lg">
                                            <AccordionTrigger className="px-4 py-3 text-gray-900 font-medium hover:no-underline">
                                                Additional Information
                                            </AccordionTrigger>
                                            <AccordionContent className="px-4 pb-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {/* Religion */}
                                                    <div className="space-y-3">
                                                        <Label className="text-sm font-medium text-gray-700">Religion</Label>
                                                        <Input
                                                            type="text"
                                                            placeholder="Enter religion"
                                                            value={religion}
                                                            onChange={(e) => setReligion(e.target.value)}
                                                        />
                                                    </div>

                                                    {/* Blood Type */}
                                                    <div className="space-y-3">
                                                        <Label className="text-sm font-medium text-gray-700">Blood Type</Label>
                                                        <Select value={bloodType} onValueChange={setBloodType}>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select blood type" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="ALL">All</SelectItem>
                                                                {bloodTypeOptions.slice(1).map(option => (
                                                                    <SelectItem key={option} value={option}>{option}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    {/* Nationality */}
                                                    <div className="space-y-3">
                                                        <Label className="text-sm font-medium text-gray-700">Nationality</Label>
                                                        <Input
                                                            type="text"
                                                            placeholder="Enter nationality"
                                                            value={nationality}
                                                            onChange={(e) => setNationality(e.target.value)}
                                                        />
                                                    </div>

                                                    {/* Ethnic Group */}
                                                    <div className="space-y-3">
                                                        <Label className="text-sm font-medium text-gray-700">Ethnic Group</Label>
                                                        <Input
                                                            type="text"
                                                            placeholder="Enter ethnic group"
                                                            value={ethnicGroup}
                                                            onChange={(e) => setEthnicGroup(e.target.value)}
                                                        />
                                                    </div>

                                                    {/* Special Categories */}
                                                    <div className="space-y-3 md:col-span-2">
                                                        <Label className="text-sm font-medium text-gray-700">Special Categories</Label>
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                            {sectorOptions.map(sector => (
                                                                <div key={sector} className="flex items-center space-x-2">
                                                                    <Checkbox
                                                                        id={`sector-${sector}`}
                                                                        checked={sectors.includes(sector)}
                                                                        onCheckedChange={() => toggleSector(sector)}
                                                                    />
                                                                    <Label htmlFor={`sector-${sector}`} className="text-sm">
                                                                        {sector.replace('_', ' ')}
                                                                    </Label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>

                                    {/* Action Buttons */}
                                    <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                                        <Link href="/dashboard/residents">
                                            <Button variant="outline" type="button" className="border-gray-300">
                                                Cancel
                                            </Button>
                                        </Link>
                                        <Button
                                            type="submit"
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            <Search className="h-4 w-4 mr-2" />
                                            Apply Filters
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </PageTransition>
    )
} 