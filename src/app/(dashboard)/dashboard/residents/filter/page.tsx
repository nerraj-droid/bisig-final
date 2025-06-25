"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save, X, ChevronDown, Filter, RotateCcw, Tag } from "lucide-react"
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
    CardFooter,
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
            <div className="w-full max-w-7xl mx-auto px-4">
                {/* Back button and page title */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                    <div className="flex items-center">
                        <Link href="/dashboard/residents" className="text-[#006B5E] hover:text-[#F39C12] transition-colors mr-4">
                            <ArrowLeft size={24} />
                        </Link>
                        <h1 className="text-2xl font-bold text-[#006B5E]">ADVANCED FILTER</h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            className="flex items-center gap-2"
                            onClick={resetFilters}
                        >
                            <RotateCcw size={16} />
                            Reset
                        </Button>

                        <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="flex items-center gap-2">
                                    <Save size={16} />
                                    Save Preset
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
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
                                        className="mt-1"
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
                                        className="bg-[#006B5E] hover:bg-[#005046]"
                                    >
                                        Save
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Saved Presets Panel */}
                    {savedPresets.length > 0 && (
                        <Card className="lg:col-span-1">
                            <CardHeader>
                                <CardTitle className="text-[#006B5E]">Saved Presets</CardTitle>
                                <CardDescription>Load your saved filter configurations</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {savedPresets.map((preset, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                                        <Button
                                            variant="ghost"
                                            className="text-left w-full justify-start"
                                            onClick={() => loadPreset(preset)}
                                        >
                                            <Tag size={16} className="mr-2 text-[#006B5E]" />
                                            {preset.name}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => deletePreset(index)}
                                        >
                                            <X size={16} className="text-red-500" />
                                        </Button>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* Main Filter Form */}
                    <div className={savedPresets.length > 0 ? "lg:col-span-3" : "lg:col-span-4"}>
                        <div className="bg-white p-6 rounded-xl shadow border border-[#F39C12]/30">
                            {/* Active Filters Summary */}
                            <div className="mb-6">
                                <h3 className="text-md font-medium text-gray-700 mb-2">Active Filters: {getActiveFilterCount()}</h3>
                                <div className="flex flex-wrap gap-2">
                                    {gender && (
                                        <Badge variant="outline" className="flex items-center gap-1">
                                            Gender: {gender}
                                            <button onClick={() => setGender('')} className="ml-1 text-gray-400 hover:text-red-500">
                                                <X size={14} />
                                            </button>
                                        </Badge>
                                    )}
                                    {civilStatus && (
                                        <Badge variant="outline" className="flex items-center gap-1">
                                            Civil Status: {civilStatus}
                                            <button onClick={() => setCivilStatus('')} className="ml-1 text-gray-400 hover:text-red-500">
                                                <X size={14} />
                                            </button>
                                        </Badge>
                                    )}
                                    {isVoter && (
                                        <Badge variant="outline" className="flex items-center gap-1">
                                            Registered Voter
                                            <button onClick={() => setIsVoter(false)} className="ml-1 text-gray-400 hover:text-red-500">
                                                <X size={14} />
                                            </button>
                                        </Badge>
                                    )}
                                    {(minAge || maxAge) && (
                                        <Badge variant="outline" className="flex items-center gap-1">
                                            Age: {minAge || '0'} - {maxAge || '∞'}
                                            <button onClick={() => { setMinAge(''); setMaxAge(''); }} className="ml-1 text-gray-400 hover:text-red-500">
                                                <X size={14} />
                                            </button>
                                        </Badge>
                                    )}
                                    {(ageYears || ageMonths || ageDays) && (
                                        <Badge variant="outline" className="flex items-center gap-1">
                                            Precise Age: {ageYears || '0'} years, {ageMonths || '0'} months, {ageDays || '0'} days
                                            <button onClick={() => { setAgeYears(''); setAgeMonths(''); setAgeDays(''); }} className="ml-1 text-gray-400 hover:text-red-500">
                                                <X size={14} />
                                            </button>
                                        </Badge>
                                    )}
                                    {employmentStatus && employmentStatus !== 'ALL' && (
                                        <Badge variant="outline" className="flex items-center gap-1">
                                            Employment: {employmentStatus.replace('_', ' ').toLowerCase()}
                                            <button onClick={() => setEmploymentStatus('ALL')} className="ml-1 text-gray-400 hover:text-red-500">
                                                <X size={14} />
                                            </button>
                                        </Badge>
                                    )}
                                    {educationalAttainment && educationalAttainment !== 'ALL' && (
                                        <Badge variant="outline" className="flex items-center gap-1">
                                            Education: {educationalAttainment.replace('_', ' ').toLowerCase()}
                                            <button onClick={() => setEducationalAttainment('ALL')} className="ml-1 text-gray-400 hover:text-red-500">
                                                <X size={14} />
                                            </button>
                                        </Badge>
                                    )}
                                    {sectors.map(sector => (
                                        <Badge key={sector} variant="outline" className="flex items-center gap-1">
                                            {sector.replace('_', ' ')}
                                            <button onClick={() => toggleSector(sector)} className="ml-1 text-gray-400 hover:text-red-500">
                                                <X size={14} />
                                            </button>
                                        </Badge>
                                    ))}
                                    {religion && (
                                        <Badge variant="outline" className="flex items-center gap-1">
                                            Religion: {religion}
                                            <button onClick={() => setReligion('')} className="ml-1 text-gray-400 hover:text-red-500">
                                                <X size={14} />
                                            </button>
                                        </Badge>
                                    )}
                                    {bloodType && bloodType !== 'ALL' && (
                                        <Badge variant="outline" className="flex items-center gap-1">
                                            Blood Type: {bloodType}
                                            <button onClick={() => setBloodType('ALL')} className="ml-1 text-gray-400 hover:text-red-500">
                                                <X size={14} />
                                            </button>
                                        </Badge>
                                    )}
                                    
                                    {/* Location Filters */}
                                    {barangay && (
                                        <Badge variant="outline" className="flex items-center gap-1">
                                            Barangay: {barangay}
                                            <button onClick={() => setBarangay('')} className="ml-1 text-gray-400 hover:text-red-500">
                                                <X size={14} />
                                            </button>
                                        </Badge>
                                    )}
                                    {street && (
                                        <Badge variant="outline" className="flex items-center gap-1">
                                            Street: {street}
                                            <button onClick={() => setStreet('')} className="ml-1 text-gray-400 hover:text-red-500">
                                                <X size={14} />
                                            </button>
                                        </Badge>
                                    )}
                                    {houseNo && (
                                        <Badge variant="outline" className="flex items-center gap-1">
                                            House No: {houseNo}
                                            <button onClick={() => setHouseNo('')} className="ml-1 text-gray-400 hover:text-red-500">
                                                <X size={14} />
                                            </button>
                                        </Badge>
                                    )}
                                    {city && (
                                        <Badge variant="outline" className="flex items-center gap-1">
                                            City: {city}
                                            <button onClick={() => setCity('')} className="ml-1 text-gray-400 hover:text-red-500">
                                                <X size={14} />
                                            </button>
                                        </Badge>
                                    )}
                                    {province && (
                                        <Badge variant="outline" className="flex items-center gap-1">
                                            Province: {province}
                                            <button onClick={() => setProvince('')} className="ml-1 text-gray-400 hover:text-red-500">
                                                <X size={14} />
                                            </button>
                                        </Badge>
                                    )}
                                    {purokSitio && (
                                        <Badge variant="outline" className="flex items-center gap-1">
                                            Purok/Sitio: {purokSitio}
                                            <button onClick={() => setPurokSitio('')} className="ml-1 text-gray-400 hover:text-red-500">
                                                <X size={14} />
                                            </button>
                                        </Badge>
                                    )}
                                    
                                    {/* Additional Filters */}
                                    {nationality && (
                                        <Badge variant="outline" className="flex items-center gap-1">
                                            Nationality: {nationality}
                                            <button onClick={() => setNationality('')} className="ml-1 text-gray-400 hover:text-red-500">
                                                <X size={14} />
                                            </button>
                                        </Badge>
                                    )}
                                    {ethnicGroup && (
                                        <Badge variant="outline" className="flex items-center gap-1">
                                            Ethnic Group: {ethnicGroup}
                                            <button onClick={() => setEthnicGroup('')} className="ml-1 text-gray-400 hover:text-red-500">
                                                <X size={14} />
                                            </button>
                                        </Badge>
                                    )}
                                    {hasId && (
                                        <Badge variant="outline" className="flex items-center gap-1">
                                            Has ID
                                            <button onClick={() => setHasId(false)} className="ml-1 text-gray-400 hover:text-red-500">
                                                <X size={14} />
                                            </button>
                                        </Badge>
                                    )}
                                    {identityType && identityType !== 'ALL' && (
                                        <Badge variant="outline" className="flex items-center gap-1">
                                            ID Type: {identityType}
                                            <button onClick={() => setIdentityType('ALL')} className="ml-1 text-gray-400 hover:text-red-500">
                                                <X size={14} />
                                            </button>
                                        </Badge>
                                    )}
                                    {isHeadOfHousehold && (
                                        <Badge variant="outline" className="flex items-center gap-1">
                                            Head of Household
                                            <button onClick={() => setIsHeadOfHousehold(false)} className="ml-1 text-gray-400 hover:text-red-500">
                                                <X size={14} />
                                            </button>
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <Accordion type="multiple" defaultValue={["basic"]}>
                                    {/* Basic Filters */}
                                    <AccordionItem value="basic">
                                        <AccordionTrigger className="text-[#006B5E] font-medium">Basic Filters</AccordionTrigger>
                                        <AccordionContent>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                                                {/* Gender Filter */}
                                                <div className="space-y-4">
                                                    <h3 className="text-md font-medium text-gray-700">Gender</h3>
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

                                                {/* Age Range Filter */}
                                                <div className="space-y-4">
                                                    <h3 className="text-md font-medium text-gray-700">Age Range</h3>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <Label htmlFor="min-age">Minimum Age</Label>
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
                                                            <Label htmlFor="max-age">Maximum Age</Label>
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
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        Leave empty to include all ages, or set only minimum or maximum
                                                    </div>
                                                </div>

                                                {/* Civil Status Filter */}
                                                <div className="space-y-4">
                                                    <h3 className="text-md font-medium text-gray-700">Civil Status</h3>
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
                                                    <h3 className="text-md font-medium text-gray-700">Voter Status</h3>
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
                                        </AccordionContent>
                                    </AccordionItem>

                                    {/* Location Filters */}
                                    <AccordionItem value="location">
                                        <AccordionTrigger className="text-[#006B5E] font-medium">Location Filters</AccordionTrigger>
                                        <AccordionContent>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="province-filter">Province</Label>
                                                    <Input
                                                        id="province-filter"
                                                        type="text"
                                                        placeholder="Enter province"
                                                        value={province}
                                                        onChange={(e) => setProvince(e.target.value)}
                                                    />
                                                </div>
                                                
                                                <div className="space-y-2">
                                                    <Label htmlFor="city-filter">City/Municipality</Label>
                                                    <Input
                                                        id="city-filter"
                                                        type="text"
                                                        placeholder="Enter city/municipality"
                                                        value={city}
                                                        onChange={(e) => setCity(e.target.value)}
                                                    />
                                                </div>
                                                
                                                <div className="space-y-2">
                                                    <Label htmlFor="barangay-filter">Barangay</Label>
                                                    <Input
                                                        id="barangay-filter"
                                                        type="text"
                                                        placeholder="Enter barangay"
                                                        value={barangay}
                                                        onChange={(e) => setBarangay(e.target.value)}
                                                    />
                                                </div>
                                                
                                                <div className="space-y-2">
                                                    <Label htmlFor="purok-sitio-filter">Purok/Sitio</Label>
                                                    <Input
                                                        id="purok-sitio-filter"
                                                        type="text"
                                                        placeholder="Enter purok or sitio"
                                                        value={purokSitio}
                                                        onChange={(e) => setPurokSitio(e.target.value)}
                                                    />
                                                </div>
                                                
                                                <div className="space-y-2">
                                                    <Label htmlFor="street-filter">Street</Label>
                                                    <Input
                                                        id="street-filter"
                                                        type="text"
                                                        placeholder="Enter street"
                                                        value={street}
                                                        onChange={(e) => setStreet(e.target.value)}
                                                    />
                                                </div>
                                                
                                                <div className="space-y-2">
                                                    <Label htmlFor="house-no-filter">House No.</Label>
                                                    <Input
                                                        id="house-no-filter"
                                                        type="text"
                                                        placeholder="Enter house number"
                                                        value={houseNo}
                                                        onChange={(e) => setHouseNo(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>

                                    {/* Additional Filters */}
                                    <AccordionItem value="additional">
                                        <AccordionTrigger className="text-[#006B5E] font-medium">Additional Filters</AccordionTrigger>
                                        <AccordionContent>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                                                {/* Employment Status */}
                                                <div className="space-y-4">
                                                    <h3 className="text-md font-medium text-gray-700">Employment Status</h3>
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
                                                <div className="space-y-4">
                                                    <h3 className="text-md font-medium text-gray-700">Educational Attainment</h3>
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

                                                {/* Religion Filter */}
                                                <div className="space-y-4">
                                                    <h3 className="text-md font-medium text-gray-700">Religion</h3>
                                                    <Input
                                                        type="text"
                                                        placeholder="Enter religion"
                                                        value={religion}
                                                        onChange={(e) => setReligion(e.target.value)}
                                                    />
                                                </div>

                                                {/* Blood Type */}
                                                <div className="space-y-4">
                                                    <h3 className="text-md font-medium text-gray-700">Blood Type</h3>
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
                                                <div className="space-y-4">
                                                    <h3 className="text-md font-medium text-gray-700">Nationality</h3>
                                                    <Input
                                                        type="text"
                                                        placeholder="Enter nationality"
                                                        value={nationality}
                                                        onChange={(e) => setNationality(e.target.value)}
                                                    />
                                                </div>

                                                {/* Ethnic Group */}
                                                <div className="space-y-4">
                                                    <h3 className="text-md font-medium text-gray-700">Ethnic Group</h3>
                                                    <Input
                                                        type="text"
                                                        placeholder="Enter ethnic group"
                                                        value={ethnicGroup}
                                                        onChange={(e) => setEthnicGroup(e.target.value)}
                                                    />
                                                </div>

                                                {/* Identity Type */}
                                                <div className="space-y-4">
                                                    <h3 className="text-md font-medium text-gray-700">Identity Type</h3>
                                                    <Select value={identityType} onValueChange={setIdentityType}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select ID type" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="ALL">All</SelectItem>
                                                            {IDENTITY_TYPES.map(type => (
                                                                <SelectItem key={type} value={type}>{type}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                {/* Has ID */}
                                                <div className="space-y-4">
                                                    <h3 className="text-md font-medium text-gray-700">Identity Document</h3>
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id="hasId"
                                                            checked={hasId}
                                                            onCheckedChange={(checked) => setHasId(checked as boolean)}
                                                        />
                                                        <Label htmlFor="hasId">Has ID Document</Label>
                                                    </div>
                                                </div>

                                                {/* Head of Household */}
                                                <div className="space-y-4">
                                                    <h3 className="text-md font-medium text-gray-700">Household Role</h3>
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id="isHeadOfHousehold"
                                                            checked={isHeadOfHousehold}
                                                            onCheckedChange={(checked) => setIsHeadOfHousehold(checked as boolean)}
                                                        />
                                                        <Label htmlFor="isHeadOfHousehold">Head of Household Only</Label>
                                                    </div>
                                                </div>

                                                {/* Sectors */}
                                                <div className="space-y-4 md:col-span-2">
                                                    <h3 className="text-md font-medium text-gray-700">Sectors</h3>
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                        {sectorOptions.map(sector => (
                                                            <div key={sector} className="flex items-center space-x-2">
                                                                <Checkbox
                                                                    id={`sector-${sector}`}
                                                                    checked={sectors.includes(sector)}
                                                                    onCheckedChange={() => toggleSector(sector)}
                                                                />
                                                                <Label htmlFor={`sector-${sector}`}>
                                                                    {sector.replace('_', ' ')}
                                                                </Label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Precise Age Filter */}
                                                <div className="space-y-4">
                                                    <h3 className="text-md font-medium text-gray-700">Precise Age</h3>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        <div>
                                                            <Label htmlFor="age-years">Years</Label>
                                                            <Input
                                                                id="age-years"
                                                                type="number"
                                                                min="0"
                                                                max="150"
                                                                placeholder="0"
                                                                value={ageYears}
                                                                onChange={(e) => setAgeYears(e.target.value)}
                                                                className="mt-1"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label htmlFor="age-months">Months</Label>
                                                            <Input
                                                                id="age-months"
                                                                type="number"
                                                                min="0"
                                                                max="11"
                                                                placeholder="0"
                                                                value={ageMonths}
                                                                onChange={(e) => setAgeMonths(e.target.value)}
                                                                className="mt-1"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label htmlFor="age-days">Days</Label>
                                                            <Input
                                                                id="age-days"
                                                                type="number"
                                                                min="0"
                                                                max="30"
                                                                placeholder="0"
                                                                value={ageDays}
                                                                onChange={(e) => setAgeDays(e.target.value)}
                                                                className="mt-1"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        Specify exact age (e.g., 8 years, 3 months, 10 days)
                                                    </div>
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>

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
                </div>
            </div>
        </PageTransition>
    )
} 