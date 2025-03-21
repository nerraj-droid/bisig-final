'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Plus, X, MapPin, Search, Home } from 'lucide-react';
import { PageTransition } from "@/components/ui/page-transition";
import { Button } from "@/components/ui/button";
import dynamic from 'next/dynamic';
import type { MapSelectorHandle } from '@/components/MapSelector';
import { toast } from "sonner";

// Dynamically import the Map component to avoid SSR issues
// This ensures the component is only loaded on the client side
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

export default function NewHouseholdPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // Step 1: Map selection, Step 2: Form details
  const [addressSearch, setAddressSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const [formData, setFormData] = useState({
    address: '',
    notes: '',
    headOfHousehold: '',
    residentIds: [''], // Initialize with one empty resident ID field
    latitude: 14.5995, // Default to Philippines location
    longitude: 120.9842
  });

  const [residents, setResidents] = useState<any[]>([]);
  const [residentSearchQuery, setResidentSearchQuery] = useState('');
  const [filteredResidents, setFilteredResidents] = useState<any[]>([]);
  const [showResidentDropdown, setShowResidentDropdown] = useState(false);

  const houseTypes = ['Concrete', 'Wood', 'Mixed', 'Light Materials', 'Makeshift', 'Other'];
  const riskLevels = ['Low', 'Medium', 'High', 'Very High'];

  const mapRef = useRef<MapSelectorHandle>(null);

  // Fetch all residents when component mounts
  useEffect(() => {
    async function fetchResidents() {
      try {
        const response = await fetch('/api/residents?limit=100');
        if (!response.ok) {
          throw new Error('Failed to fetch residents');
        }
        const data = await response.json();
        setResidents(data);
      } catch (error) {
        console.error('Error fetching residents:', error);
      }
    }

    fetchResidents();
  }, []);

  // Filter residents based on search query
  useEffect(() => {
    if (residentSearchQuery.trim() === '') {
      setFilteredResidents([]);
      return;
    }

    const query = residentSearchQuery.toLowerCase();
    const filtered = residents.filter(resident =>
      resident.firstName.toLowerCase().includes(query) ||
      resident.lastName.toLowerCase().includes(query) ||
      `${resident.firstName} ${resident.lastName}`.toLowerCase().includes(query)
    );

    setFilteredResidents(filtered);
  }, [residentSearchQuery, residents]);

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle resident selection
  const handleResidentSelect = (resident: any, index: number) => {
    const newResidentIds = [...formData.residentIds];
    newResidentIds[index] = resident.id;
    setFormData(prev => ({ ...prev, residentIds: newResidentIds }));
    setResidentSearchQuery('');
    setShowResidentDropdown(false);
  };

  // Handle resident search change
  const handleResidentSearchChange = (value: string) => {
    setResidentSearchQuery(value);
    setShowResidentDropdown(true);
  };

  // Set as head of household
  const setAsHeadOfHousehold = (residentId: string) => {
    setFormData(prev => ({ ...prev, headOfHousehold: residentId }));
  };

  // Add another resident field
  const addResidentField = () => {
    setFormData(prev => ({
      ...prev,
      residentIds: [...prev.residentIds, '']
    }));
  };

  // Remove a resident field
  const removeResidentField = (index: number) => {
    const newResidentIds = formData.residentIds.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, residentIds: newResidentIds }));

    // If the head of household was removed, clear it
    if (formData.residentIds[index] === formData.headOfHousehold) {
      setFormData(prev => ({ ...prev, headOfHousehold: '' }));
    }
  };

  // Update marker position on map click
  const handleMapClick = (coords: { lng: number, lat: number }) => {
    const { lng, lat } = coords;
    setFormData(prev => ({
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

    setIsLoading(true);

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
      setIsLoading(false);
    }
  };

  // Select location from search results
  const selectLocation = (result: any) => {
    const lng = parseFloat(result.lon);
    const lat = parseFloat(result.lat);

    // Update form data
    setFormData(prev => ({
      ...prev,
      longitude: lng,
      latitude: lat,
      address: result.display_name
    }));

    // Show success message
    setError(null);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);

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
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;

          // Update form data with new coordinates
          setFormData(prev => ({
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
                const successMessage = "Location found! We recommend using satellite view for better building identification.";
                setSuccess(true);
                setTimeout(() => setSuccess(false), 5000);
              }
            }, 100);
          });

          setIsLoading(false);
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
          setIsLoading(false);
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
        setFormData(prev => ({
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

  // Continue to the next step
  const goToNextStep = () => {
    if (formData.address.trim() === '') {
      setError("Please select a location on the map first");
      return;
    }
    setError(null);
    setCurrentStep(2);
  };

  // Go back to map step
  const goBackToMap = () => {
    setCurrentStep(1);
  };

  // Submit form to create household
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Filter out empty resident IDs
      const filteredResidentIds = formData.residentIds.filter(id => id.trim() !== '');

      // Validate form data
      if (!formData.address.trim()) {
        throw new Error('Address is required');
      }

      const response = await fetch('/api/households', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: formData.address,
          notes: formData.notes,
          headOfHousehold: formData.headOfHousehold,
          residentIds: filteredResidentIds,
          latitude: formData.latitude,
          longitude: formData.longitude
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create household');
      }

      const data = await response.json();
      toast("Household created successfully", {
        description: data.message || "The household has been added to the system",
      });

      // Navigate to the newly created household
      router.push(`/dashboard/households/${data.household.id}`);
    } catch (error) {
      console.error('Household creation error:', error);
      toast("Error creating household", {
        description: error instanceof Error ? error.message : "Please try again",
        style: { backgroundColor: 'red', color: 'white' }
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Map Component JSX - Update to prevent hydration issues
  // When rendering the map component, use this pattern:
  const renderMap = () => {
    if (typeof window === 'undefined') return null;

    return (
      <MapWithNoSSR
        ref={mapRef}
        initialCoordinates={{
          longitude: formData.longitude,
          latitude: formData.latitude,
          zoom: 10
        }}
        onMapClick={handleMapClick}
        markerCoordinates={{
          longitude: formData.longitude,
          latitude: formData.latitude
        }}
      />
    );
  };

  // Get resident name by ID
  const getResidentNameById = (id: string) => {
    if (!id) return '';
    const resident = residents.find(r => r.id === id);
    return resident ? `${resident.firstName} ${resident.lastName}` : '';
  };

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link href="/dashboard/households" className="text-[#006B5E] hover:text-[#F39C12] transition-colors mr-4">
              <ArrowLeft size={24} />
            </Link>
            <h1 className="text-2xl font-bold text-[#006B5E]">ADD NEW HOUSEHOLD</h1>
          </div>

          {currentStep === 2 && (
            <Button
              className="bg-[#006B5E] hover:bg-[#005046]"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? 'Saving...' : 'Save Household'}
            </Button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6">
            Location found! We recommend using satellite view for better building identification.
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Progress Steps */}
          <div className="flex border-b">
            <div
              className={`flex-1 py-3 text-center font-medium ${currentStep === 1 ? 'bg-[#006B5E] text-white' : 'bg-gray-100 text-gray-500'
                }`}
            >
              <span className="flex items-center justify-center">
                <MapPin className="mr-2 h-4 w-4" />
                Step 1: Select Location
              </span>
            </div>
            <div
              className={`flex-1 py-3 text-center font-medium ${currentStep === 2 ? 'bg-[#006B5E] text-white' : 'bg-gray-100 text-gray-500'
                }`}
            >
              <span className="flex items-center justify-center">
                <Home className="mr-2 h-4 w-4" />
                Step 2: Household Details
              </span>
            </div>
          </div>

          {/* Step 1: Map Selection */}
          {currentStep === 1 && (
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-[#006B5E] mb-4">Select Household Location on Map</h2>
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
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={searchAddress}
                      className="bg-[#006B5E] text-white px-4 py-2 rounded-r-md hover:bg-[#005046] disabled:opacity-50"
                      disabled={isLoading}
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
                  disabled={isLoading}
                >
                  <MapPin size={18} className="mr-1" />
                  {isLoading ? 'Finding your location...' : 'Use My Current Location'}
                </button>
              </div>

              {/* Map Component */}
              <div className="h-[500px] w-full rounded-md overflow-hidden border border-gray-300 mb-6 relative">
                {renderMap()}
                <div className="absolute bottom-3 left-3 z-10 bg-black/70 text-white text-xs px-2 py-1 rounded-md">
                  <p>Tip: Use the layer button in the top left to switch to satellite view for better location selection</p>
                </div>
              </div>

              {/* Selected Location Info */}
              <div className="bg-gray-50 p-4 rounded-md mb-6">
                <h3 className="font-medium text-gray-700 mb-2">Selected Location</h3>
                {formData.address ? (
                  <>
                    <p className="text-gray-800 mb-2">{formData.address}</p>
                    <div className="flex text-sm text-gray-500">
                      <span className="mr-4">Lat: {formData.latitude.toFixed(6)}</span>
                      <span>Long: {formData.longitude.toFixed(6)}</span>
                    </div>
                  </>
                ) : (
                  <p className="text-amber-600">No location selected. Click on the map to select a location.</p>
                )}
              </div>

              <div className="flex justify-end">
                <Button
                  className="bg-[#006B5E] hover:bg-[#005046]"
                  onClick={goToNextStep}
                >
                  Continue to Household Details
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Household Details Form */}
          {currentStep === 2 && (
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-[#006B5E] mb-2">Household Details</h2>
                <p className="text-gray-600">Enter the details for the household at: <span className="font-medium">{formData.address}</span></p>
                <button
                  className="text-sm text-[#006B5E] hover:text-[#F39C12] mt-1 flex items-center transition-colors"
                  onClick={goBackToMap}
                >
                  <MapPin size={14} className="mr-1" />
                  Change Location
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Complete Address <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006B5E]"
                        placeholder="Full address details"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Notes
                      </label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006B5E]"
                        placeholder="Any additional information about this household"
                      ></textarea>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Residents in this Household
                      </label>

                      <div className="space-y-2 bg-gray-50 p-4 rounded-md">
                        {formData.residentIds.map((id, index) => (
                          <div key={index} className="relative">
                            <div className="flex items-center mb-1">
                              <div className="flex-1 relative">
                                <input
                                  type="text"
                                  value={getResidentNameById(id) || residentSearchQuery}
                                  onChange={(e) => handleResidentSearchChange(e.target.value)}
                                  placeholder="Search for resident"
                                  onFocus={() => setShowResidentDropdown(true)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006B5E]"
                                />

                                {showResidentDropdown && filteredResidents.length > 0 && (
                                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                                    {filteredResidents.map((resident) => (
                                      <div
                                        key={resident.id}
                                        className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleResidentSelect(resident, index)}
                                      >
                                        {resident.firstName} {resident.lastName}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {formData.residentIds.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeResidentField(index)}
                                  className="ml-2 p-2 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50"
                                >
                                  <X size={18} />
                                </button>
                              )}
                            </div>

                            {id && (
                              <div className="flex text-xs">
                                <button
                                  type="button"
                                  onClick={() => setAsHeadOfHousehold(id)}
                                  className={`mr-2 px-2 py-1 rounded-full ${id === formData.headOfHousehold
                                    ? 'bg-[#006B5E] text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                >
                                  {id === formData.headOfHousehold ? 'Head of Household' : 'Set as Head'}
                                </button>
                              </div>
                            )}
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={addResidentField}
                          className="mt-2 flex items-center text-[#006B5E] hover:text-[#F39C12] transition-colors"
                        >
                          <Plus size={18} className="mr-1" />
                          Add Another Resident
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={goBackToMap}
                  >
                    Back to Map
                  </Button>
                  <Button
                    type="submit"
                    className="bg-[#006B5E] hover:bg-[#005046]"
                    disabled={isLoading}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {isLoading ? 'Saving...' : 'Save Household'}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
} 