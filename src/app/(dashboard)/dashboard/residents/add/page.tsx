'use client';

import { PageTransition } from "@/components/ui/page-transition";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form"; 
import { useForm } from "react-hook-form";
import Link from "next/link";
import { ArrowLeft, Save, Upload, ChevronDown, X, Camera, Home, Search, Check, ChevronRight, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { toast } from "sonner";
import dynamic from 'next/dynamic';
import type { MapSelectorHandle } from '@/components/MapSelector';

// Dynamically import the Map component to avoid SSR issues
const MapWithNoSSR = dynamic(
  () => import('@/components/MapSelector'),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-gray-100">
        <span className="text-gray-500">Loading map...</span>
      </div>
    )
  }
);

// Define available sectors based on requirements
const AVAILABLE_SECTORS = [
  "4Ps",
  "PREGNANT",
  "SENIOR",
  "SOLO_PARENT",
  "PWD",
  "INDIGENT"
];

// Define available identity types
const IDENTITY_TYPES = [
  // Primary Government IDs (Widely Accepted)
  { value: "Philippine Passport", label: "Philippine Passport" },
  { value: "Driver's License", label: "Driver's License (LTO)" },
  { value: "Unified Multi-Purpose ID", label: "Unified Multi-Purpose ID (UMID)" },
  { value: "SSS", label: "Social Security System (SSS) Card" },
  { value: "GSIS", label: "Government Service Insurance System (GSIS) eCard" },
  { value: "PhilSys ID", label: "Philippine Identification System ID (PhilSys ID or National ID)" },
  { value: "PRC ID", label: "Professional Regulation Commission (PRC) ID" },
  { value: "Voter's ID", label: "Commission on Elections (COMELEC) Voter's ID / Voter's Certification" },
  { value: "Postal ID", label: "Postal ID (Issued by PHLPost)" },
  { value: "OWWA ID", label: "Overseas Workers Welfare Administration (OWWA) ID" },
  { value: "OFW ID", label: "OFW ID (iDOLE Card)" },
  { value: "Seaman's Book", label: "Seaman's Book (MARINA)" },

  // Secondary Government IDs (Accepted in Some Transactions)
  { value: "Barangay Clearance", label: "Barangay Clearance with Photo" },
  { value: "Police Clearance", label: "Police Clearance with Photo" },
  { value: "NBI Clearance", label: "NBI Clearance" },
  { value: "PhilHealth ID", label: "PhilHealth ID" },
  { value: "Pag-IBIG Card", label: "Pag-IBIG Loyalty Card Plus" },
  { value: "Senior Citizen ID", label: "Senior Citizen ID" },
  { value: "PWD ID", label: "PWD (Persons with Disabilities) ID" },
  { value: "IP ID", label: "Indigenous Peoples (IP) ID" },
  { value: "Firearms License", label: "Firearms License (PNP-issued)" },
  { value: "Government Company ID", label: "Company ID (For Government Employees)" },
  { value: "Student ID", label: "Student ID (For Minors and Students)" },
];

// Define employment status options
const EMPLOYMENT_STATUS = [
  { value: "Employed", label: "Employed" },
  { value: "Unemployed", label: "Unemployed" },
  { value: "Self-employed", label: "Self-employed" },
  { value: "Student", label: "Student" },
  { value: "Retired", label: "Retired" },
];

// Define unemployment reason options
const UNEMPLOYMENT_REASONS = [
  "Child",
  "Housewife",
  "Infant",
  "Student",
  "Unemployed"
];

// Define educational attainment options
const EDUCATIONAL_ATTAINMENT = [
  "No Formal Education",
  "Elementary Undergraduate",
  "Elementary Graduate",
  "High School Undergraduate",
  "High School Graduate",
  "Vocational/Technical Course",
  "College Undergraduate",
  "College Graduate",
  "Post Graduate"
];

// Define blood types
const BLOOD_TYPES = [
  "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"
];

export default function AddResidentPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [age, setAge] = useState<number | null>(null);
  const [step, setStep] = useState(1); // 1: Resident Info, 2: Household Selection/Creation
  const [createdResidentId, setCreatedResidentId] = useState<string | null>(null);
  const [households, setHouseholds] = useState<any[]>([]);
  const [filteredHouseholds, setFilteredHouseholds] = useState<any[]>([]);
  const [selectedHouseholdId, setSelectedHouseholdId] = useState<string | null>(null);
  const [householdSearchQuery, setHouseholdSearchQuery] = useState('');
  const [createNewHousehold, setCreateNewHousehold] = useState(false);
  const [householdFormData, setHouseholdFormData] = useState({
    houseNo: '',
    street: '',
    barangay: '',
    city: '',
    province: '',
    address: '',
    notes: '',
    latitude: 14.5995, // Default to Philippines location
    longitude: 120.9842
  });

  // Add form context for the map component
  const mapForm = useForm();

  // Map related states
  const [addressSearch, setAddressSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [mapSuccess, setMapSuccess] = useState(false);
  const [isLoadingMap, setIsLoadingMap] = useState(false);
  const mapRef = useRef<MapSelectorHandle>(null);

  // Address dropdown states
  const [provinces, setProvinces] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [barangays, setBarangays] = useState<any[]>([]);
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [isLoadingBarangays, setIsLoadingBarangays] = useState(false);

  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    middleName: '',
    lastName: '',
    extensionName: '',
    alias: '',
    birthDate: '',
    gender: '',
    civilStatus: '',
    nationality: 'Filipino',

    // Contact Information
    contactNo: '',
    email: '',

    // Address Information
    address: '',
    houseNo: '',
    street: '',
    barangay: '',
    city: '',
    province: '',
    zipCode: '',

    // Employment & Education
    occupation: '',
    employmentStatus: '',
    unemploymentReason: '',
    educationalAttainment: '',

    // Additional Information
    bloodType: '',
    religion: '',
    ethnicGroup: '',

    // Parent Information
    fatherName: '',
    fatherMiddleName: '',
    fatherLastName: '',
    motherFirstName: '',
    motherMiddleName: '',
    motherMaidenName: '',

    // Status
    voterInBarangay: false,
    headOfHousehold: false,
    sectors: [] as string[],

    // Identity
    identityType: '',
    identityNumber: '',
    proofOfIdentity: '',
    userPhoto: ''
  });

  // Add state for photo upload
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isWebcamOpen, setIsWebcamOpen] = useState(false);

  // Fetch provinces on component mount and also fetch households
  useEffect(() => {
    fetchProvinces();
    fetchHouseholds();
  }, []);

  // Fetch cities when province changes
  useEffect(() => {
    if (formData.province) {
      fetchCities(formData.province);
    } else {
      setCities([]);
      setFormData(prev => ({ ...prev, city: '', barangay: '' }));
    }
  }, [formData.province]);

  // Fetch barangays when city changes
  useEffect(() => {
    if (formData.city) {
      fetchBarangays(formData.city);
    } else {
      setBarangays([]);
      setFormData(prev => ({ ...prev, barangay: '' }));
    }
  }, [formData.city]);

  // Fetch provinces from PSGC API
  const fetchProvinces = async () => {
    setIsLoadingProvinces(true);
    try {
      const response = await fetch('https://psgc.gitlab.io/api/provinces.json');
      if (!response.ok) {
        throw new Error('Failed to fetch provinces');
      }
      const data = await response.json();
      setProvinces(data.sort((a: any, b: any) => a.name.localeCompare(b.name)));
    } catch (error) {
      console.error('Error fetching provinces:', error);
    } finally {
      setIsLoadingProvinces(false);
    }
  };

  // Fetch cities/municipalities for a province
  const fetchCities = async (provinceName: string) => {
    setIsLoadingCities(true);
    try {
      // Find province code from name
      const province = provinces.find(p => p.name === provinceName);
      if (!province) return;

      const response = await fetch(`https://psgc.gitlab.io/api/provinces/${province.code}/cities-municipalities.json`);
      if (!response.ok) {
        throw new Error('Failed to fetch cities');
      }
      const data = await response.json();
      setCities(data.sort((a: any, b: any) => a.name.localeCompare(b.name)));
    } catch (error) {
      console.error('Error fetching cities:', error);
    } finally {
      setIsLoadingCities(false);
    }
  };

  // Fetch barangays for a city/municipality
  const fetchBarangays = async (cityName: string) => {
    setIsLoadingBarangays(true);
    try {
      // Find city code from name
      const city = cities.find(c => c.name === cityName);
      if (!city) return;

      const response = await fetch(`https://psgc.gitlab.io/api/cities-municipalities/${city.code}/barangays.json`);
      if (!response.ok) {
        throw new Error('Failed to fetch barangays');
      }
      const data = await response.json();
      setBarangays(data.sort((a: any, b: any) => a.name.localeCompare(b.name)));
    } catch (error) {
      console.error('Error fetching barangays:', error);
    } finally {
      setIsLoadingBarangays(false);
    }
  };

  // Add calculateAge function
  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));

      // Calculate age when birth date changes
      if (name === 'birthDate' && value) {
        setAge(calculateAge(value));
      }
    }
  };

  const handleSectorChange = (sector: string) => {
    setFormData(prev => {
      const updatedSectors = prev.sectors.includes(sector)
        ? prev.sectors.filter(s => s !== sector)
        : [...prev.sectors, sector];

      console.log("Sectors updated:", updatedSectors);
      return { ...prev, sectors: updatedSectors };
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      console.log("Identity document selected:", file.name);
    }
  };

  // Handle photo file change
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle webcam capture
  const handleWebcamCapture = (imageSrc: string) => {
    setPhotoPreview(imageSrc);
    setIsWebcamOpen(false);
    // Convert base64 to file
    fetch(imageSrc)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], "webcam-photo.jpg", { type: "image/jpeg" });
        setPhotoFile(file);
      });
  };

  // Add function to fetch households
  const fetchHouseholds = async () => {
    try {
      const response = await fetch('/api/households?limit=100');
      if (!response.ok) {
        throw new Error('Failed to fetch households');
      }
      const data = await response.json();
      setHouseholds(data);
      setFilteredHouseholds(data);
    } catch (error) {
      console.error('Error fetching households:', error);
    }
  };

  // Add useEffect for filtering households based on search
  useEffect(() => {
    if (!householdSearchQuery.trim()) {
      setFilteredHouseholds(households);
      return;
    }

    const query = householdSearchQuery.toLowerCase();
    const filtered = households.filter(household =>
      household.address?.toLowerCase().includes(query) ||
      household.barangay?.toLowerCase().includes(query) ||
      household.street?.toLowerCase().includes(query) ||
      household.houseNo?.toLowerCase().includes(query)
    );
    setFilteredHouseholds(filtered);
  }, [householdSearchQuery, households]);

  // Modify the handleSubmit function to move to step 2 after successful creation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.firstName || !formData.lastName || !formData.birthDate || !formData.gender || !formData.civilStatus) {
        setError('Please fill in all required fields');
        setIsSaving(false);
        return;
      }

      // Validate gender and civilStatus
      const validGenders = ['MALE', 'FEMALE', 'OTHER'];
      const validCivilStatus = ['SINGLE', 'MARRIED', 'WIDOWED', 'DIVORCED', 'SEPARATED'];

      if (!validGenders.includes(formData.gender)) {
        setError('Please select a valid gender');
        setIsSaving(false);
        return;
      }

      if (!validCivilStatus.includes(formData.civilStatus)) {
        setError('Please select a valid civil status');
        setIsSaving(false);
        return;
      }

      // Validate employment status and occupation
      if ((formData.employmentStatus === 'Employed' || formData.employmentStatus === 'Self-employed') && !formData.occupation) {
        setError('Occupation is required based on your employment status');
        setIsSaving(false);
        return;
      }

      // Validate unemployment reason
      if (formData.employmentStatus === 'Unemployed' && !formData.unemploymentReason) {
        setError('Please select an unemployment reason');
        setIsSaving(false);
        return;
      }

      // Validate ID type and number
      if (formData.identityType && !formData.identityNumber) {
        setError('ID number is required when ID type is selected');
        setIsSaving(false);
        return;
      }

      // Ensure identity type is a valid enum value
      const validIdentityTypes = IDENTITY_TYPES.map(type => type.value);
      if (formData.identityType && !validIdentityTypes.includes(formData.identityType)) {
        setError(`Invalid identity type: ${formData.identityType}`);
        setIsSaving(false);
        return;
      }

      // Format the address from individual fields
      const formattedAddress = [
        formData.houseNo,
        formData.street,
        formData.barangay,
        formData.city,
        formData.province,
        formData.zipCode,
        formData.address // Additional address details
      ]
        .filter(Boolean)
        .join(', ');

      // Upload photo if exists
      let userPhotoUrl = '';
      if (photoFile) {
        try {
          const photoFormData = new FormData();
          photoFormData.append('file', photoFile);
          photoFormData.append('type', 'profile-photo');

          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: photoFormData,
          });

          if (!uploadResponse.ok) {
            throw new Error('Photo upload failed');
          }
          const uploadData = await uploadResponse.json();
          if (!uploadData?.url) {
            throw new Error('Invalid photo upload response');
          }
          userPhotoUrl = uploadData.url;
        } catch (uploadError) {
          console.error('Photo upload error:', uploadError);
          setError('Failed to upload photo. Please try again.');
          setIsSaving(false);
          return;
        }
      }

      // Upload proof of identity if exists
      let proofOfIdentityUrl = '';
      if (selectedFile) {
        try {
          const uploadFormData = new FormData();
          uploadFormData.append('file', selectedFile);
          uploadFormData.append('type', 'proof-of-identity');

          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: uploadFormData,
          });

          if (!uploadResponse.ok) {
            throw new Error('File upload failed');
          }
          const uploadData = await uploadResponse.json();
          if (!uploadData?.url) {
            throw new Error('Invalid file upload response');
          }
          proofOfIdentityUrl = uploadData.url;

          // Store the document path but don't modify the displayed identity number

        } catch (uploadError) {
          console.error('File upload error:', uploadError);
          setError('Failed to upload proof of identity. Please try again.');
          setIsSaving(false);
          return;
        }
      }

      // Create resident data object with required fields
      const residentData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        middleName: formData.middleName || '',
        extensionName: formData.extensionName || '',
        alias: formData.alias || '',
        birthDate: formData.birthDate,
        gender: formData.gender,
        civilStatus: formData.civilStatus,
        address: formattedAddress,
        email: formData.email || '',
        contactNo: formData.contactNo || '',
        occupation: formData.occupation || '',
        employmentStatus: formData.employmentStatus || '',
        unemploymentReason: formData.unemploymentReason || '',
        educationalAttainment: formData.educationalAttainment || '',
        bloodType: formData.bloodType || '',
        religion: formData.religion || '',
        ethnicGroup: formData.ethnicGroup || '',
        nationality: formData.nationality || '',
        userPhoto: userPhotoUrl,
        motherMaidenName: formData.motherMaidenName || '',
        motherMiddleName: formData.motherMiddleName || '',
        motherFirstName: formData.motherFirstName || '',
        fatherName: formData.fatherName || '',
        fatherLastName: formData.fatherLastName || '',
        fatherMiddleName: formData.fatherMiddleName || '',
        headOfHousehold: Boolean(formData.headOfHousehold),
        voterInBarangay: Boolean(formData.voterInBarangay),
        sectors: Array.isArray(formData.sectors) ? formData.sectors : [],
        identityType: formData.identityType || '',
        // Only include the actual ID number in the identityNumber field
        identityNumber: formData.identityNumber || '',
        // Store document path in a hidden field that won't be displayed in the UI
        ...(proofOfIdentityUrl ? { identityDocumentPath: `DOCUMENT:${proofOfIdentityUrl}` } : {}),
      };

      // Send data to API
      const response = await fetch('/api/residents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(residentData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        if (errorData?.errors) {
          const errorMessages = errorData.errors.map((err: any) =>
            `${err.path.join('.')}: ${err.message}`
          ).join(', ');
          throw new Error(`Validation error: ${errorMessages}`);
        }
        throw new Error(errorData?.message || 'Failed to create resident');
      }

      const responseData = await response.json();
      if (!responseData?.id) {
        throw new Error('Invalid response from server');
      }

      // Store the created resident ID
      setCreatedResidentId(responseData.id);

      // Pre-fill household form with resident's address information
      setHouseholdFormData({
        houseNo: formData.houseNo,
        street: formData.street,
        barangay: formData.barangay,
        city: formData.city,
        province: formData.province,
        address: formattedAddress,
        notes: '',
        latitude: 14.5995, // Default to Philippines location
        longitude: 120.9842
      });

      // Move to step 2 (household selection)
      setStep(2);
      toast.success("Resident created successfully! Now select a household or create a new one.");
    } catch (error) {
      console.error('Error creating resident:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  // Add function to handle selecting an existing household
  const handleSelectHousehold = async () => {
    if (!selectedHouseholdId || !createdResidentId) {
      setError('Please select a household');
      return;
    }

    setIsSaving(true);
    try {
      // Add resident to household
      const response = await fetch(`/api/households/${selectedHouseholdId}/residents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          residentId: createdResidentId,
          isHeadOfHousehold: false // Assuming not head of household for existing household
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add resident to household');
      }

      // Success! Redirect to resident details
      toast.success("Resident added to household successfully!");
      router.push(`/dashboard/residents/${createdResidentId}`);
    } catch (error: any) {
      console.error('Error adding to household:', error);
      setError(error.message || 'Failed to add resident to household');
    } finally {
      setIsSaving(false);
    }
  };

  // Map related functions
  // Update marker position on map click
  const handleMapClick = (coords: { lng: number, lat: number }) => {
    const { lng, lat } = coords;
    setHouseholdFormData(prev => ({
      ...prev,
      longitude: lng,
      latitude: lat
    }));

    // Fetch address from coordinates
    fetchAddressFromCoordinates(lng, lat);
  };

  // Search for location by address
  const searchAddress = async () => {
    if (!addressSearch.trim()) return;

    setIsLoadingMap(true);

    try {
      // Using Nominatim API (OpenStreetMap's free geocoding service)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(addressSearch)}&format=json&countrycodes=ph&limit=5`,
        {
          headers: {
            // Important to set a user agent with contact details as per Nominatim usage policy
            'User-Agent': 'BarangayManagementSystem/1.0'
          }
        }
      );

      if (!response.ok) throw new Error('Location search failed');

      const data = await response.json();
      if (data && data.length > 0) {
        setSearchResults(data);
        setShowSearchResults(true);
        setError(null);
      } else {
        setError("No locations found. Please try a different search term or select a location on the map.");
      }
    } catch (err) {
      console.error('Error searching location:', err);
      setError("Error searching for location. Please try again.");
    } finally {
      setIsLoadingMap(false);
    }
  };

  // Select location from search results
  const selectLocation = (result: any) => {
    const lng = parseFloat(result.lon);
    const lat = parseFloat(result.lat);

    // Update form data
    setHouseholdFormData(prev => ({
      ...prev,
      longitude: lng,
      latitude: lat,
      address: result.display_name
    }));

    // Show success message
    setError(null);
    setMapSuccess(true);
    setTimeout(() => setMapSuccess(false), 3000);

    // Fly to the selected location on the map
    if (mapRef.current) {
      mapRef.current.flyTo({
        longitude: lng,
        latitude: lat,
        zoom: 17 // Higher zoom for better building visibility
      });
    }

    setShowSearchResults(false);
  };

  // Get user's current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLoadingMap(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;

          // Update form data with new coordinates
          setHouseholdFormData(prev => ({
            ...prev,
            longitude,
            latitude
          }));

          // Fetch address first so it's ready when the map finishes flying
          fetchAddressFromCoordinates(longitude, latitude).then(() => {
            // Try to fly to the location on the map after the address is fetched
            setTimeout(() => {
              if (mapRef.current) {
                // Fly to the location with a closer zoom for better precision
                mapRef.current.flyTo({
                  longitude,
                  latitude,
                  zoom: 18 // Use a higher zoom level to see buildings clearly
                });

                // Show success message
                setError(null);
                setMapSuccess(true);
                setTimeout(() => setMapSuccess(false), 5000);
              }
            }, 100);
          });

          setIsLoadingMap(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          let errorMessage = "Could not get your current location. Please select manually.";

          // More user-friendly error messages
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location access was denied. Please grant permission or select location manually.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information is unavailable. Please try again or select manually.";
              break;
            case error.TIMEOUT:
              errorMessage = "Request for location timed out. Please try again or select manually.";
              break;
          }

          setError(errorMessage);
          setIsLoadingMap(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      setError("Geolocation is not supported by your browser");
    }
  };

  // Fetch address from coordinates (reverse geocoding)
  const fetchAddressFromCoordinates = async (lng: number, lat: number) => {
    try {
      // Using Nominatim API (OpenStreetMap's free geocoding service)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        {
          headers: {
            // Important to set a user agent with contact details as per Nominatim usage policy
            'User-Agent': 'BarangayManagementSystem/1.0'
          }
        }
      );

      if (!response.ok) throw new Error('Reverse geocoding failed');

      const data = await response.json();
      if (data) {
        setHouseholdFormData(prev => ({
          ...prev,
          address: data.display_name
        }));
        return data.display_name;
      }
      return null;
    } catch (err) {
      console.error('Error getting address:', err);
      return null;
    }
  };

  // Map Component JSX - Update to prevent hydration issues
  const renderMap = () => {
    if (typeof window === 'undefined') return null;

    return (
      <>
        <MapWithNoSSR
          ref={mapRef}
          initialCoordinates={{
            longitude: householdFormData.longitude,
            latitude: householdFormData.latitude,
            zoom: 10
          }}
          onMapClick={handleMapClick}
          markerCoordinates={{
            longitude: householdFormData.longitude,
            latitude: householdFormData.latitude
          }}
        />
        <div className="absolute bottom-3 left-3 z-10 bg-black/70 text-white text-xs px-2 py-1 rounded-md">
          <p>Tip: Use the layer button in the top left to switch to satellite view for better location selection</p>
        </div>
      </>
    );
  };

  // Modify the handleCreateHousehold function to include map data
  const handleCreateHousehold = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createdResidentId) {
      setError('Resident information missing');
      return;
    }

    if (!householdFormData.houseNo || !householdFormData.street || !householdFormData.barangay) {
      setError('Please provide house number, street, and barangay');
      return;
    }

    setIsSaving(true);
    try {
      // Format address
      const formattedAddress = [
        householdFormData.houseNo,
        householdFormData.street,
        householdFormData.barangay,
        householdFormData.city,
        householdFormData.province
      ].filter(Boolean).join(', ');

      // Create household data
      const householdData = {
        address: formattedAddress,
        notes: householdFormData.notes || '',
        headOfHousehold: createdResidentId, // Make the new resident head of household
        residentIds: [createdResidentId],
        houseNo: householdFormData.houseNo || '',
        street: householdFormData.street || '',
        barangay: householdFormData.barangay || '',
        city: householdFormData.city || '',
        province: householdFormData.province || '',
        latitude: householdFormData.latitude,
        longitude: householdFormData.longitude
      };

      // Send data to API
      const response = await fetch('/api/households', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(householdData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to create household');
      }

      // Success! Redirect to resident details
      toast.success("Household created and resident assigned successfully!");
      router.push(`/dashboard/residents/${createdResidentId}`);
    } catch (error: any) {
      console.error('Error creating household:', error);
      setError(error.message || 'Failed to create household');
    } finally {
      setIsSaving(false);
    }
  };

  const WebcamDialog = () => {
    const webcamRef = useRef<Webcam>(null);

    const capture = useCallback(() => {
      const imageSrc = webcamRef.current?.getScreenshot();
      if (imageSrc) {
        handleWebcamCapture(imageSrc);
      }
    }, []);

    return (
      <div className="flex flex-col items-center gap-4">
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          className="rounded-lg"
        />
        <div className="flex gap-2">
          <Button onClick={capture} className="bg-[#006B5E] hover:bg-[#005046]">
            Capture Photo
          </Button>
          <Button variant="outline" onClick={() => setIsWebcamOpen(false)}>
            Cancel
          </Button>
        </div>
      </div>
    );
  };

  return (
    <PageTransition>
      <div className="w-full max-w-[1200px] mx-auto">
        {/* Back button and page title */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center">
            <Link href="/dashboard/residents" className="text-[#006B5E] hover:text-[#F39C12] transition-colors mr-4">
              <ArrowLeft size={24} />
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold text-[#006B5E]">
              {step === 1 ? "ADD NEW RESIDENT" :
                createNewHousehold ? "CREATE NEW HOUSEHOLD" : "SELECT HOUSEHOLD"}
            </h1>
          </div>

          {step === 1 && (
            <Button
              className="bg-[#006B5E] hover:bg-[#005046] w-full sm:w-auto"
              onClick={handleSubmit}
              disabled={isSaving}
            >
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Resident'}
            </Button>
          )}
        </div>

        {/* Progress Indicator */}
        <div className="mb-6">
          <Tabs value={`step-${step}`} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="step-1" disabled={step !== 1}>
                1. Resident Information
              </TabsTrigger>
              <TabsTrigger value="step-2" disabled={step !== 2}>
                2. Household Assignment
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Add Form */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden p-4 sm:p-6 mb-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
              {error}
            </div>
          )}

          {/* Step 1: Resident Information Form */}
          {step === 1 && (
            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
              {/* Personal Information Section */}
              <div>
                <h3 className="text-lg font-semibold text-[#006B5E] mb-4 pb-2 border-b">Personal Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">First Name *</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006B5E]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Middle Name</label>
                    <input
                      type="text"
                      name="middleName"
                      value={formData.middleName}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006B5E]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Last Name *</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006B5E]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Extension Name</label>
                    <input
                      type="text"
                      name="extensionName"
                      value={formData.extensionName}
                      onChange={handleChange}
                      placeholder="Jr., Sr., III, etc."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006B5E]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Alias/Nickname</label>
                    <input
                      type="text"
                      name="alias"
                      value={formData.alias}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006B5E]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Birth Date *</label>
                    <div className="relative">
                      <input
                        type="date"
                        name="birthDate"
                        value={formData.birthDate}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006B5E]"
                      />
                      {age !== null && (
                        <div className="absolute right-0 top-0 h-full flex items-center pr-3">
                          <span className="text-sm text-gray-500 bg-white px-2">Age: {age}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Gender *</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006B5E]"
                    >
                      <option value="">Select Gender</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Civil Status *</label>
                    <select
                      name="civilStatus"
                      value={formData.civilStatus}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006B5E]"
                    >
                      <option value="">Select Civil Status</option>
                      <option value="SINGLE">Single</option>
                      <option value="MARRIED">Married</option>
                      <option value="WIDOWED">Widowed</option>
                      <option value="SEPARATED">Separated</option>
                      <option value="DIVORCED">Divorced</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Nationality</label>
                    <input
                      type="text"
                      name="nationality"
                      value={formData.nationality}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006B5E]"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information Section */}
              <div>
                <h3 className="text-lg font-semibold text-[#006B5E] mb-4 pb-2 border-b">Contact Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                    <input
                      type="tel"
                      name="contactNo"
                      value={formData.contactNo}
                      onChange={handleChange}
                      placeholder="+63 or 09 followed by 10 digits"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006B5E]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006B5E]"
                    />
                  </div>
                </div>
              </div>

              {/* Address Information Section */}
              <div>
                <h3 className="text-lg font-semibold text-[#006B5E] mb-4 pb-2 border-b">Address Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">House No. *</label>
                    <input
                      type="text"
                      name="houseNo"
                      value={formData.houseNo}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006B5E]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Street *</label>
                    <input
                      type="text"
                      name="street"
                      value={formData.street}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006B5E]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Province *</label>
                    <div className="relative">
                      <select
                        name="province"
                        value={formData.province}
                        onChange={handleChange}
                        required
                        disabled={isLoadingProvinces}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006B5E] appearance-none"
                      >
                        <option value="">Select Province</option>
                        {provinces.map((province) => (
                          <option key={province.code} value={province.name}>
                            {province.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        {isLoadingProvinces ? (
                          <div className="animate-spin h-4 w-4 border-2 border-[#006B5E] border-t-transparent rounded-full"></div>
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">City/Municipality *</label>
                    <div className="relative">
                      <select
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                        disabled={isLoadingCities || !formData.province}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006B5E] appearance-none"
                      >
                        <option value="">Select City/Municipality</option>
                        {cities.map((city) => (
                          <option key={city.code} value={city.name}>
                            {city.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        {isLoadingCities ? (
                          <div className="animate-spin h-4 w-4 border-2 border-[#006B5E] border-t-transparent rounded-full"></div>
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Barangay *</label>
                    <div className="relative">
                      <select
                        name="barangay"
                        value={formData.barangay}
                        onChange={handleChange}
                        required
                        disabled={isLoadingBarangays || !formData.city}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006B5E] appearance-none"
                      >
                        <option value="">Select Barangay</option>
                        {barangays.map((barangay) => (
                          <option key={barangay.code} value={barangay.name}>
                            {barangay.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        {isLoadingBarangays ? (
                          <div className="animate-spin h-4 w-4 border-2 border-[#006B5E] border-t-transparent rounded-full"></div>
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Zip Code</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006B5E]"
                    />
                  </div>
                  <div className="space-y-2 col-span-full">
                    <label className="block text-sm font-medium text-gray-700">Additional Address Details</label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Apartment, suite, unit, building, floor, etc."
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006B5E]"
                    />
                  </div>
                </div>
              </div>

              {/* Employment & Education Section */}
              <div>
                <h3 className="text-lg font-semibold text-[#006B5E] mb-4 pb-2 border-b">Employment & Education</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Employment Status</label>
                    <select
                      name="employmentStatus"
                      value={formData.employmentStatus}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006B5E]"
                    >
                      <option value="">Select Employment Status</option>
                      {EMPLOYMENT_STATUS.map(status => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {(formData.employmentStatus === "Employed" || formData.employmentStatus === "Self-employed") && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Occupation</label>
                      <input
                        type="text"
                        name="occupation"
                        value={formData.occupation}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006B5E]"
                      />
                    </div>
                  )}

                  {formData.employmentStatus === "Unemployed" && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Unemployment Reason</label>
                      <select
                        name="unemploymentReason"
                        value={formData.unemploymentReason}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006B5E]"
                      >
                        <option value="">Select Reason</option>
                        {UNEMPLOYMENT_REASONS.map(reason => (
                          <option key={reason} value={reason}>{reason}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Educational Attainment</label>
                    <select
                      name="educationalAttainment"
                      value={formData.educationalAttainment}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006B5E]"
                    >
                      <option value="">Select Educational Attainment</option>
                      {EDUCATIONAL_ATTAINMENT.map(education => (
                        <option key={education} value={education}>{education}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Additional Information Section */}
              <div>
                <h3 className="text-lg font-semibold text-[#006B5E] mb-4 pb-2 border-b">Additional Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Blood Type</label>
                    <select
                      name="bloodType"
                      value={formData.bloodType}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006B5E]"
                    >
                      <option value="">Select Blood Type</option>
                      {BLOOD_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Religion</label>
                    <input
                      type="text"
                      name="religion"
                      value={formData.religion}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006B5E]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Ethnic Group</label>
                    <input
                      type="text"
                      name="ethnicGroup"
                      value={formData.ethnicGroup}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006B5E]"
                    />
                  </div>
                </div>
              </div>

              {/* Parent Information Section */}
              <div>
                <h3 className="text-lg font-semibold text-[#006B5E] mb-4 pb-2 border-b">Parent Information</h3>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-md font-medium text-gray-700 mb-3">Father's Name</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">First Name</label>
                        <input
                          type="text"
                          name="fatherName"
                          value={formData.fatherName}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006B5E]"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Middle Name</label>
                        <input
                          type="text"
                          name="fatherMiddleName"
                          value={formData.fatherMiddleName}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006B5E]"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Last Name</label>
                        <input
                          type="text"
                          name="fatherLastName"
                          value={formData.fatherLastName}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006B5E]"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-md font-medium text-gray-700 mb-3">Mother's Maiden Name</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">First Name</label>
                        <input
                          type="text"
                          name="motherFirstName"
                          value={formData.motherFirstName}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006B5E]"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Middle Name</label>
                        <input
                          type="text"
                          name="motherMiddleName"
                          value={formData.motherMiddleName}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006B5E]"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Maiden Name</label>
                        <input
                          type="text"
                          name="motherMaidenName"
                          value={formData.motherMaidenName}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006B5E]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sectors and Status Section */}
              <div>
                <h3 className="text-lg font-semibold text-[#006B5E] mb-4 pb-2 border-b">Sectors & Status</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Sectors</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {AVAILABLE_SECTORS.map(sector => (
                          <div key={sector} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`sector-${sector}`}
                              checked={formData.sectors.includes(sector)}
                              onChange={() => handleSectorChange(sector)}
                              className="h-4 w-4 text-[#006B5E] focus:ring-[#006B5E] border-gray-300 rounded"
                            />
                            <label htmlFor={`sector-${sector}`} className="ml-2 block text-sm text-gray-700">
                              {sector.replace('_', ' ')}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Proof of Identity Type</label>
                      <select
                        name="identityType"
                        value={formData.identityType}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006B5E]"
                      >
                        <option value="">Select Identity Type</option>
                        {IDENTITY_TYPES.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">ID Number</label>
                      <input
                        type="text"
                        name="identityNumber"
                        value={formData.identityNumber}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006B5E]"
                        required={!!formData.identityType}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Upload Proof of Identity</label>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <label className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                          <Upload className="mr-2 h-4 w-4" />
                          {selectedFile ? 'Change File' : 'Upload File'}
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*,.pdf"
                            onChange={handleFileChange}
                          />
                        </label>
                        {selectedFile && (
                          <span className="text-sm text-gray-500">
                            {selectedFile.name}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Accepted file types: Images (JPG, PNG) and PDF documents
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Photo Section */}
              <div>
                <h3 className="text-lg font-semibold text-[#006B5E] mb-4 pb-2 border-b">Photo</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Resident Photo</label>
                      <div className="flex flex-col items-center gap-4">
                        {photoPreview && (
                          <div className="relative w-32 h-32">
                            <img
                              src={photoPreview}
                              alt="Preview"
                              className="w-full h-full object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setPhotoFile(null);
                                setPhotoPreview(null);
                              }}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <label className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Photo
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={handlePhotoChange}
                            />
                          </label>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsWebcamOpen(true)}
                          >
                            <Camera className="mr-2 h-4 w-4" />
                            Take Photo
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t">
                <Link href="/dashboard/residents" className="w-full sm:w-auto">
                  <Button variant="outline" type="button" disabled={isSaving} className="w-full sm:w-auto">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  className="w-full sm:w-auto bg-[#006B5E] hover:bg-[#005046]"
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Resident'}
                </Button>
              </div>
            </form>
          )}

          {/* Step 2: Household Selection/Creation */}
          {step === 2 && !createNewHousehold && (
            <div className="space-y-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-[#006B5E] mb-4 pb-2 border-b">Select Existing Household</h3>
                <div className="relative mb-4">
                  <input
                    type="text"
                    placeholder="Search households by address..."
                    className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006B5E]"
                    value={householdSearchQuery}
                    onChange={(e) => setHouseholdSearchQuery(e.target.value)}
                  />
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                </div>

                <div className="space-y-4 max-h-72 overflow-y-auto">
                  {filteredHouseholds.length > 0 ? (
                    filteredHouseholds.map(household => (
                      <div
                        key={household.id}
                        className={`p-4 border rounded-md cursor-pointer transition-colors ${selectedHouseholdId === household.id ? 'border-[#006B5E] bg-[#E8F5F3]' : 'hover:bg-gray-50'}`}
                        onClick={() => setSelectedHouseholdId(household.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{household.address || `${household.houseNo} ${household.street}, ${household.barangay}`}</div>
                            <div className="text-sm text-gray-600">
                              {household.residents?.length || 0} residents
                            </div>
                          </div>
                          {selectedHouseholdId === household.id && (
                            <Check className="h-5 w-5 text-[#006B5E]" />
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No households found
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4 border-t">
                <div>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setCreateNewHousehold(true)}
                    className="mr-2"
                  >
                    <Home className="mr-2 h-4 w-4" />
                    Create New Household
                  </Button>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => router.push(`/dashboard/residents/${createdResidentId}`)}
                  >
                    Skip for Now
                  </Button>
                </div>
                <Button
                  className="bg-[#006B5E] hover:bg-[#005046]"
                  disabled={!selectedHouseholdId || isSaving}
                  onClick={handleSelectHousehold}
                >
                  {isSaving ? 'Adding...' : 'Add to Selected Household'}
                </Button>
              </div>
            </div>
          )}

          {/* Step 2b: Create New Household */}
          {step === 2 && createNewHousehold && (
            <form onSubmit={handleCreateHousehold} className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-[#006B5E] mb-4 pb-2 border-b">Create New Household</h3>

                {/* Map Selection Section */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-700 mb-3">Select Household Location on Map</h4>
                  <p className="text-gray-600 mb-4">Click on the map to set the household location or search for an address below.</p>

                  {/* Search Bar */}
                  <div className="relative mb-4">
                    <div className="flex">
                      <input
                        type="text"
                        placeholder="Search address..."
                        value={addressSearch}
                        onChange={(e) => setAddressSearch(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#006B5E]"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            searchAddress();
                          }
                        }}
                        disabled={isLoadingMap}
                      />
                      <button
                        type="button"
                        onClick={searchAddress}
                        className="bg-[#006B5E] text-white px-4 py-2 rounded-r-md hover:bg-[#005046] disabled:opacity-50"
                        disabled={isLoadingMap}
                      >
                        <Search size={18} />
                      </button>
                    </div>

                    {/* Search Results Dropdown */}
                    {showSearchResults && searchResults.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                        <div className="p-2 bg-gray-50 border-b text-xs text-gray-500">
                          Select a location to move the map
                        </div>
                        {searchResults.map((result, index) => (
                          <div
                            key={index}
                            className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                            onClick={() => selectLocation(result)}
                          >
                            {result.display_name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Current Location Button */}
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    className="mb-4 text-[#006B5E] hover:text-[#F39C12] flex items-center transition-colors"
                    disabled={isLoadingMap}
                  >
                    <MapPin size={18} className="mr-1" />
                    {isLoadingMap ? 'Finding your location...' : 'Use My Current Location'}
                  </button>

                  {/* Map Component */}
                  <div className="h-[400px] w-full rounded-md overflow-hidden border border-gray-300 mb-6 relative">
                    <Form {...mapForm}>
                      {renderMap()}
                    </Form>
                  </div>

                  {/* Selected Location Info */}
                  <div className="bg-gray-50 p-4 rounded-md mb-6">
                    <h3 className="font-medium text-gray-700 mb-2">Selected Location</h3>
                    {householdFormData.address ? (
                      <>
                        <p className="text-gray-800 mb-2">{householdFormData.address}</p>
                        <div className="flex text-sm text-gray-500">
                          <span className="mr-4">Lat: {householdFormData.latitude.toFixed(6)}</span>
                          <span>Long: {householdFormData.longitude.toFixed(6)}</span>
                        </div>
                      </>
                    ) : (
                      <p className="text-amber-600">No location selected. Click on the map to select a location.</p>
                    )}
                  </div>
                </div>

                {/* Household Details Form */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">House No. *</label>
                    <input
                      type="text"
                      value={householdFormData.houseNo}
                      onChange={(e) => setHouseholdFormData({ ...householdFormData, houseNo: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006B5E]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Street *</label>
                    <input
                      type="text"
                      value={householdFormData.street}
                      onChange={(e) => setHouseholdFormData({ ...householdFormData, street: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006B5E]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Barangay *</label>
                    <input
                      type="text"
                      value={householdFormData.barangay}
                      onChange={(e) => setHouseholdFormData({ ...householdFormData, barangay: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006B5E]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">City/Municipality</label>
                    <input
                      type="text"
                      value={householdFormData.city}
                      onChange={(e) => setHouseholdFormData({ ...householdFormData, city: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006B5E]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Province</label>
                    <input
                      type="text"
                      value={householdFormData.province}
                      onChange={(e) => setHouseholdFormData({ ...householdFormData, province: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006B5E]"
                    />
                  </div>
                  <div className="space-y-2 col-span-full">
                    <label className="block text-sm font-medium text-gray-700">Additional Notes</label>
                    <textarea
                      value={householdFormData.notes}
                      onChange={(e) => setHouseholdFormData({ ...householdFormData, notes: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006B5E]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setCreateNewHousehold(false)}
                >
                  Back to Household Selection
                </Button>
                <Button
                  type="submit"
                  className="bg-[#006B5E] hover:bg-[#005046]"
                  disabled={isSaving}
                >
                  {isSaving ? 'Creating...' : 'Create Household & Add Resident'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>

      {isWebcamOpen && (
        <Dialog open={isWebcamOpen} onOpenChange={setIsWebcamOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Take Photo</DialogTitle>
            </DialogHeader>
            <WebcamDialog />
          </DialogContent>
        </Dialog>
      )}
    </PageTransition>
  );
} 