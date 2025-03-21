'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Plus, X, MapPin, Search } from 'lucide-react';
import { Map, MapRef } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Replace with your actual Mapbox token
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export default function NewHouseholdPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const mapRef = useRef<MapRef>(null);
  const [addressSearch, setAddressSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  const [formData, setFormData] = useState({
    address: '',
    houseType: 'Concrete',
    floorCount: 1,
    disasterRiskLevel: 'Low',
    notes: '',
    headOfHousehold: '',
    residentIds: [''], // Initialize with one empty resident ID field
    latitude: 14.5995, // Default to Philippines location
    longitude: 120.9842
  });

  const houseTypes = ['Concrete', 'Wood', 'Mixed', 'Light Materials', 'Makeshift', 'Other'];
  const riskLevels = ['Low', 'Medium', 'High', 'Very High'];

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle resident ID changes
  const handleResidentIdChange = (index: number, value: string) => {
    const newResidentIds = [...formData.residentIds];
    newResidentIds[index] = value;
    setFormData(prev => ({ ...prev, residentIds: newResidentIds }));
  };

  // Add another resident ID field
  const addResidentField = () => {
    setFormData(prev => ({
      ...prev,
      residentIds: [...prev.residentIds, '']
    }));
  };

  // Remove a resident ID field
  const removeResidentField = (index: number) => {
    const newResidentIds = formData.residentIds.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, residentIds: newResidentIds }));
  };

  // Update marker position on map click
  const handleMapClick = (event: any) => {
    const { lng, lat } = event.lngLat;
    setFormData(prev => ({
      ...prev,
      longitude: lng,
      latitude: lat
    }));
    
    // Optionally fetch address from coordinates
    fetchAddressFromCoordinates(lng, lat);
  };

  // Search for location by address
  const searchAddress = async () => {
    if (!addressSearch.trim()) return;
    
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(addressSearch)}.json?access_token=${MAPBOX_TOKEN}&country=ph&limit=5`
      );
      
      if (!response.ok) throw new Error('Location search failed');
      
      const data = await response.json();
      setSearchResults(data.features || []);
      setShowSearchResults(true);
    } catch (err) {
      console.error('Error searching location:', err);
    }
  };

  // Select location from search results
  const selectLocation = (result: any) => {
    const [lng, lat] = result.center;
    
    // Update form data
    setFormData(prev => ({
      ...prev,
      longitude: lng,
      latitude: lat,
      address: result.place_name
    }));
    
    // Update map view
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [lng, lat],
        zoom: 15
      });
    }
    
    setShowSearchResults(false);
  };

  // Fetch address from coordinates (reverse geocoding)
  const fetchAddressFromCoordinates = async (lng: number, lat: number) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}`
      );
      
      if (!response.ok) throw new Error('Reverse geocoding failed');
      
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        setFormData(prev => ({
          ...prev,
          address: data.features[0].place_name
        }));
      }
    } catch (err) {
      console.error('Error getting address:', err);
    }
  };

  // Get user's current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          
          setFormData(prev => ({
            ...prev,
            longitude,
            latitude
          }));
          
          if (mapRef.current) {
            mapRef.current.flyTo({
              center: [longitude, latitude],
              zoom: 15
            });
          }
          
          fetchAddressFromCoordinates(longitude, latitude);
        },
        (error) => {
          console.error("Error getting location:", error);
          setError("Could not get your current location. Please select manually.");
        }
      );
    } else {
      setError("Geolocation is not supported by your browser");
    }
  };

  // Submit form to create household
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // Filter out empty resident IDs
      const filteredResidentIds = formData.residentIds.filter(id => id.trim() !== '');
      
      const response = await fetch('/api/households', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          residentIds: filteredResidentIds,
          floorCount: Number(formData.floorCount)
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to create household');
      }

      setSuccess(true);
      // Redirect to households list after a short delay
      setTimeout(() => {
        router.push('/dashboard/households');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Load map when component mounts
  useEffect(() => {
    // Optionally get user's location when component mounts
    // getCurrentLocation();
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="flex items-center mb-6">
        <Link href="/dashboard/households" className="text-blue-600 hover:text-blue-800 mr-4">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold">Add New Household</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-4">
          Household created successfully!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Map Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Location Information</h2>
          
          {/* Search Bar */}
          <div className="relative mb-4">
            <div className="flex">
              <input
                type="text"
                placeholder="Search address..."
                value={addressSearch}
                onChange={(e) => setAddressSearch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    searchAddress();
                  }
                }}
              />
              <button
                type="button"
                onClick={searchAddress}
                className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700"
              >
                <Search size={18} />
              </button>
            </div>
            
            {/* Search Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                {searchResults.map((result, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                    onClick={() => selectLocation(result)}
                  >
                    {result.place_name}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Current Location Button */}
          <button
            type="button"
            onClick={getCurrentLocation}
            className="mb-4 text-blue-600 hover:text-blue-800 flex items-center"
          >
            <MapPin size={18} className="mr-1" />
            Use My Current Location
          </button>
          
          {/* Map Component */}
          <div className="h-[400px] w-full rounded-md overflow-hidden border border-gray-300">
            <Map
              ref={mapRef}
              mapboxAccessToken={MAPBOX_TOKEN}
              initialViewState={{
                longitude: formData.longitude,
                latitude: formData.latitude,
                zoom: 10
              }}
              mapStyle="mapbox://styles/mapbox/streets-v11"
              onClick={handleMapClick}
            >
              {/* Marker at selected location */}
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -100%)',
                }}
              >
                <MapPin size={36} color="#FF0000" />
              </div>
            </Map>
          </div>
          
          {/* Coordinates Display */}
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Latitude</label>
              <input
                type="text"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                readOnly
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Longitude</label>
              <input
                type="text"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                readOnly
              />
            </div>
          </div>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Household Information</h2>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Complete Address *
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Full address details"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  House Type
                </label>
                <select
                  name="houseType"
                  value={formData.houseType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {houseTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Number of Floors
                </label>
                <input
                  type="number"
                  name="floorCount"
                  value={formData.floorCount}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Disaster Risk Level
              </label>
              <select
                name="disasterRiskLevel"
                value={formData.disasterRiskLevel}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                {riskLevels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Head of Household ID
              </label>
              <input
                type="text"
                name="headOfHousehold"
                value={formData.headOfHousehold}
                onChange={handleChange}
                placeholder="Enter resident ID of household head"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <p className="text-xs text-gray-500">
                The resident ID of the person who is the head of this household
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Residents in this Household
              </label>
              
              {formData.residentIds.map((id, index) => (
                <div key={index} className="flex items-center mb-2">
                  <input
                    type="text"
                    value={id}
                    onChange={(e) => handleResidentIdChange(index, e.target.value)}
                    placeholder="Enter resident ID"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => removeResidentField(index)}
                    className="ml-2 p-2 text-red-600 hover:text-red-800"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
              
              <button
                type="button"
                onClick={addResidentField}
                className="mt-2 flex items-center text-blue-600 hover:text-blue-800"
              >
                <Plus size={18} className="mr-1" />
                Add Another Resident
              </button>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Any additional information about this household"
              ></textarea>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Link 
                href="/dashboard/households"
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
              >
                {isLoading ? 'Saving...' : (
                  <>
                    <Save size={18} className="mr-2" />
                    Save Household
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 