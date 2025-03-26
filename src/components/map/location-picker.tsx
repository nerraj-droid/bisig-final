"use client"

import { useState, useEffect } from 'react'
import Map, { Marker } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import { MapPin, Layers } from 'lucide-react'
import { SearchBox } from './search-box'
import { Button } from '@/components/ui/button'

// Map styles
const MAP_STYLES = {
    REGULAR: 'https://tiles.stadiamaps.com/styles/alidade_smooth.json',
    SATELLITE: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json'
}

interface LocationPickerProps {
    initialLocation?: {
        latitude: number
        longitude: number
    }
    onLocationChange: (location: { latitude: number; longitude: number; address?: string }) => void
    address?: string
}

export function LocationPicker({
    initialLocation = { latitude: 14.599512, longitude: 120.984222 },
    onLocationChange,
    address
}: LocationPickerProps) {
    const [marker, setMarker] = useState({
        latitude: initialLocation.latitude,
        longitude: initialLocation.longitude
    })
    const [viewport, setViewport] = useState({
        latitude: initialLocation.latitude,
        longitude: initialLocation.longitude,
        zoom: 12
    })
    const [isMounted, setIsMounted] = useState(false)
    const [mapStyle, setMapStyle] = useState(MAP_STYLES.REGULAR)

    // Set initial location when component mounts
    useEffect(() => {
        setIsMounted(true)
        if (initialLocation) {
            setMarker({
                latitude: initialLocation.latitude,
                longitude: initialLocation.longitude
            })
            setViewport({
                latitude: initialLocation.latitude,
                longitude: initialLocation.longitude,
                zoom: 15
            })
        }
    }, [initialLocation])

    // Handle map click to set marker
    const handleMapClick = (event: any) => {
        const { lat, lng } = event.lngLat
        setMarker({
            latitude: lat,
            longitude: lng
        })
        onLocationChange({
            latitude: lat,
            longitude: lng
        })
    }

    // Handle search selection
    const handleSelectLocation = (coordinates: [number, number], addressText: string) => {
        const [longitude, latitude] = coordinates
        setMarker({ latitude, longitude })
        setViewport({
            latitude,
            longitude,
            zoom: 15
        })
        onLocationChange({
            latitude,
            longitude,
            address: addressText
        })
    }

    // Toggle map style between satellite and regular
    const toggleMapStyle = () => {
        setMapStyle(mapStyle === MAP_STYLES.SATELLITE
            ? MAP_STYLES.REGULAR
            : MAP_STYLES.SATELLITE
        )
    }

    if (!isMounted) {
        return (
            <div className="h-64 w-full flex items-center justify-center bg-muted rounded-md">
                Loading map...
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="flex-1">
                    <SearchBox onSelectLocation={handleSelectLocation} />
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="ml-2 flex items-center gap-1"
                    onClick={toggleMapStyle}
                >
                    <Layers size={14} />
                    {mapStyle === MAP_STYLES.SATELLITE ? 'Basic View' : 'Detailed View'}
                </Button>
            </div>

            <div className="h-[350px] rounded-md overflow-hidden">
                <Map
                    initialViewState={viewport}
                    style={{ width: '100%', height: '100%' }}
                    mapStyle={mapStyle}
                    onClick={handleMapClick}
                >
                    <Marker
                        latitude={marker.latitude}
                        longitude={marker.longitude}
                        draggable
                        onDragEnd={(event) => {
                            const { lat, lng } = event.lngLat
                            setMarker({
                                latitude: lat,
                                longitude: lng
                            })
                            onLocationChange({
                                latitude: lat,
                                longitude: lng
                            })
                        }}
                    >
                        <div className="flex flex-col items-center">
                            <MapPin
                                className="h-8 w-8 text-red-500"
                                strokeWidth={3}
                            />
                            <div className="bg-white text-xs px-2 py-1 rounded shadow-md -mt-1">
                                Drag to position
                            </div>
                        </div>
                    </Marker>
                </Map>
            </div>

            <div className="bg-gray-50 p-2 rounded-md text-xs text-gray-600">
                <p className="font-medium">Tip: Click on the map or search for an address to set the location.</p>
                {marker && (
                    <p className="mt-1">
                        <span className="font-medium">Selected coordinates:</span> {marker.latitude.toFixed(6)}, {marker.longitude.toFixed(6)}
                    </p>
                )}
            </div>
        </div>
    )
}