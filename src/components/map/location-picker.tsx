"use client"

import { useState, useRef, useEffect } from 'react'
import Map, { Marker, NavigationControl } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import { MapPin, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { MAP_STYLES } from './map-view'

// Define available map styles
const AVAILABLE_STYLES = ['streets', 'satellite', 'light', 'dark'] as const
type MapStyleType = typeof AVAILABLE_STYLES[number]

// Inline style definitions to prevent external fetching errors
const MAP_STYLE_OBJECTS = {
  satellite: {
    version: 8 as 8,
    sources: {
      satellite: {
        type: 'raster' as 'raster',
        tiles: [
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
        ],
        tileSize: 256,
        attribution: '© Esri, Maxar, Earthstar Geographics, and the GIS User Community',
        maxzoom: 19
      }
    },
    layers: [
      {
        id: 'satellite-layer',
        type: 'raster' as 'raster',
        source: 'satellite',
        minzoom: 0,
        maxzoom: 19
      }
    ]
  }
};

interface LocationPickerProps {
    label?: string
    description?: string
    value?: { latitude: number; longitude: number } | null
    onChange: (value: { latitude: number; longitude: number } | null) => void
    error?: string
}

export function LocationPicker({
    label,
    description,
    value,
    onChange,
    error,
}: LocationPickerProps) {
    // Default to Manila coordinates if no value provided
    const defaultCoords = {
        latitude: 14.5995,
        longitude: 120.9842,
        zoom: 10,
    }

    // Map state
    const [marker, setMarker] = useState(value || null)
    const [mapStyle, setMapStyle] = useState<MapStyleType>('streets')
    const [inputLat, setInputLat] = useState(value?.latitude?.toString() || '')
    const [inputLng, setInputLng] = useState(value?.longitude?.toString() || '')
    const [isMarkerAnimating, setIsMarkerAnimating] = useState(false)
    const [styleError, setStyleError] = useState<string | null>(null)

    // Update input fields when value changes
    useEffect(() => {
        if (value) {
            setInputLat(value.latitude.toString())
            setInputLng(value.longitude.toString())
            setMarker(value)
        } else {
            setInputLat('')
            setInputLng('')
            setMarker(null)
        }
    }, [value])

    // Handle map click
    const handleMapClick = (event: any) => {
        const { lng, lat } = event.lngLat
        const newCoords = { latitude: lat, longitude: lng }
        setMarker(newCoords)
        setInputLat(lat.toString())
        setInputLng(lng.toString())
        onChange(newCoords)
        
        // Animate marker
        setIsMarkerAnimating(true)
        setTimeout(() => setIsMarkerAnimating(false), 1000)
    }

    // Handle coordinate input changes
    const handleLatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputLat(e.target.value)
        if (e.target.value && inputLng) {
            try {
                const lat = parseFloat(e.target.value)
                const lng = parseFloat(inputLng)
                if (!isNaN(lat) && !isNaN(lng)) {
                    const newCoords = { latitude: lat, longitude: lng }
                    setMarker(newCoords)
                    onChange(newCoords)
                }
            } catch (error) {
                console.error('Invalid coordinates', error)
            }
        }
    }

    const handleLngChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputLng(e.target.value)
        if (inputLat && e.target.value) {
            try {
                const lat = parseFloat(inputLat)
                const lng = parseFloat(e.target.value)
                if (!isNaN(lat) && !isNaN(lng)) {
                    const newCoords = { latitude: lat, longitude: lng }
                    setMarker(newCoords)
                    onChange(newCoords)
                }
            } catch (error) {
                console.error('Invalid coordinates', error)
            }
        }
    }

    // Toggle map style - this does NOT trigger onChange
    const toggleMapStyle = (e: React.MouseEvent) => {
        // Prevent the event from propagating up to the parent form
        e.preventDefault();
        e.stopPropagation();
        
        setStyleError(null);
        const currentIndex = AVAILABLE_STYLES.indexOf(mapStyle);
        const nextIndex = (currentIndex + 1) % AVAILABLE_STYLES.length;
        setMapStyle(AVAILABLE_STYLES[nextIndex]);
    };

    // Get current map style - use inline objects to avoid HTTP errors
    const getMapStyle = () => {
        try {
            switch (mapStyle) {
                case 'streets':
                    return MAP_STYLES.STREETS
                case 'satellite':
                    return MAP_STYLE_OBJECTS.satellite
                case 'light':
                    return MAP_STYLES.LIGHT
                case 'dark':
                    return MAP_STYLES.DARK
                default:
                    return MAP_STYLES.STREETS
            }
        } catch (error) {
            console.error('Error loading map style:', error)
            setStyleError('Error loading map style')
            return MAP_STYLES.STREETS // Fallback to default
        }
    }

    return (
        <FormItem className="space-y-1">
            {label && <FormLabel>{label}</FormLabel>}
            {description && <FormDescription>{description}</FormDescription>}
            <FormControl>
                <div className="flex flex-col space-y-4">
                    <div style={{ height: '300px', width: '100%', position: 'relative' }}>
                        <Map
                            initialViewState={{
                                latitude: marker?.latitude || defaultCoords.latitude,
                                longitude: marker?.longitude || defaultCoords.longitude,
                                zoom: defaultCoords.zoom,
                            }}
                            mapStyle={getMapStyle()}
                            onClick={handleMapClick}
                            style={{ width: '100%', height: '100%' }}
                            attributionControl={true as any}
                            mapLib={import('maplibre-gl')}
                            reuseMaps
                        >
                            {/* Map Controls */}
                            <NavigationControl position="top-right" />

                            {/* Map style toggle */}
                            <div className="absolute top-2 left-2 z-10">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="flex items-center gap-1 bg-white shadow-md hover:bg-gray-100 map-style-toggle"
                                    onClick={toggleMapStyle}
                                    type="button"
                                >
                                    <Layers size={14} />
                                    <span className="text-xs capitalize">{mapStyle}</span>
                                </Button>
                            </div>

                            {/* Marker if coordinates are set */}
                            {marker && (
                                <Marker 
                                    longitude={marker.longitude} 
                                    latitude={marker.latitude}
                                    anchor="bottom"
                                >
                                    <MapPin 
                                        className={`h-8 w-8 text-red-500 ${isMarkerAnimating ? 'animate-bounce' : ''}`}
                                    />
                                </Marker>
                            )}
                        </Map>
                        {styleError && (
                            <div className="absolute bottom-2 left-2 z-10 bg-red-50 text-red-700 text-xs px-2 py-1 rounded-md">
                                {styleError}
                            </div>
                        )}
                    </div>

                    {/* Coordinates Input */}
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <Input
                                placeholder="Latitude"
                                value={inputLat}
                                onChange={handleLatChange}
                                className={error ? 'border-red-500' : ''}
                            />
                        </div>
                        <div>
                            <Input
                                placeholder="Longitude"
                                value={inputLng}
                                onChange={handleLngChange}
                                className={error ? 'border-red-500' : ''}
                            />
                        </div>
                    </div>
                </div>
            </FormControl>
            {error && <FormMessage>{error}</FormMessage>}
        </FormItem>
    )
}