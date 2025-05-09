'use client';

import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import Map, { Marker, NavigationControl, FullscreenControl, MapRef } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapPin, Layers } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { MAP_STYLES } from './map/map-view'; // Import the improved map styles

// Define available map styles using our improved constants
type MapStyleType = 'streets' | 'satellite' | 'light' | 'dark' | 'terrain';

interface MapSelectorProps {
    initialCoordinates?: {
        latitude: number;
        longitude: number;
        zoom: number;
    };
    onMapClick?: (coords: { lat: number; lng: number }) => void;
    markerCoordinates?: {
        latitude: number;
        longitude: number;
    };
    readonly?: boolean;
}

// Export methods that can be called from parent components
export interface MapSelectorHandle {
    flyTo: (coordinates: { longitude: number; latitude: number; zoom?: number }) => void;
}

const MapSelector = forwardRef<MapSelectorHandle, MapSelectorProps>(({
    initialCoordinates = {
        latitude: 14.5995,
        longitude: 120.9842,
        zoom: 12,
    },
    onMapClick,
    markerCoordinates,
    readonly = false,
}, ref) => {
    // Safe check for browser environment to avoid hydration errors
    const [hasMounted, setHasMounted] = useState(false);
    const [currentStyle, setCurrentStyle] = useState<MapStyleType>('streets');
    const [isMarkerAnimating, setIsMarkerAnimating] = useState(false);
    const mapRef = useRef<MapRef>(null);
    const prevCoordinatesRef = useRef<{ longitude: number; latitude: number } | null>(null);

    // Ensure component only renders on client side
    useEffect(() => {
        setHasMounted(true);
    }, []);

    // Animate marker when coordinates change
    useEffect(() => {
        if (!hasMounted) return;

        if (markerCoordinates && prevCoordinatesRef.current) {
            const prevCoords = prevCoordinatesRef.current;

            // Only animate if coordinates actually changed by a meaningful amount
            const distance = Math.sqrt(
                Math.pow(prevCoords.latitude - markerCoordinates.latitude, 2) +
                Math.pow(prevCoords.longitude - markerCoordinates.longitude, 2)
            );

            if (distance > 0.0001) { // Only animate for significant changes
                setIsMarkerAnimating(true);
                setTimeout(() => setIsMarkerAnimating(false), 2000);
            }
        }

        // Save current coordinates for next comparison
        if (markerCoordinates) {
            prevCoordinatesRef.current = { ...markerCoordinates };
        }
    }, [markerCoordinates?.latitude, markerCoordinates?.longitude, hasMounted]);

    // Expose methods to parent component via ref
    useImperativeHandle(ref, () => ({
        flyTo: (coordinates: { longitude: number; latitude: number; zoom?: number }) => {
            if (mapRef.current) {
                mapRef.current.flyTo({
                    center: [coordinates.longitude, coordinates.latitude],
                    zoom: coordinates.zoom || 15,
                    duration: 1500,
                    essential: true
                });
            }
        }
    }), []);

    // Handle map click events
    const handleMapClick = (event: any) => {
        if (readonly || !onMapClick) return;

        const { lng, lat } = event.lngLat;
        onMapClick({ lng, lat });
    };

    // Toggle between map styles
    const toggleMapStyle = () => {
        const styles: MapStyleType[] = ['streets', 'satellite', 'light', 'dark', 'terrain'];
        const currentIndex = styles.indexOf(currentStyle);
        const nextIndex = (currentIndex + 1) % styles.length;
        setCurrentStyle(styles[nextIndex]);
    };

    // Get current map style
    const getMapStyle = () => {
        switch (currentStyle) {
            case 'streets':
                return MAP_STYLES.STREETS;
            case 'satellite':
                // Create an inline satellite style using ESRI ArcGIS World Imagery
                return {
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
                };
            case 'light':
                return MAP_STYLES.LIGHT;
            case 'dark':
                return MAP_STYLES.DARK;
            case 'terrain':
                return MAP_STYLES.TERRAIN;
            default:
                return MAP_STYLES.STREETS;
        }
    };

    // Return placeholder during SSR or before client hydration
    if (!hasMounted) {
        return (
            <div className="flex h-full w-full items-center justify-center bg-gray-100">
                <span className="text-gray-500">Loading map...</span>
            </div>
        );
    }

    return (
        <div className="relative h-full w-full">
            <Map
                ref={mapRef}
                initialViewState={{
                    longitude: initialCoordinates.longitude,
                    latitude: initialCoordinates.latitude,
                    zoom: initialCoordinates.zoom,
                }}
                mapStyle={getMapStyle()}
                onClick={handleMapClick}
                style={{ width: '100%', height: '100%' }}
                attributionControl={true as any}
                mapLib={import('maplibre-gl')}
                reuseMaps
            >
                {/* Navigation controls */}
                <NavigationControl position="top-right" />
                <FullscreenControl position="top-right" />

                {/* Map style toggle */}
                <div className="absolute top-2 left-2 z-10">
                    <Button
                        variant="secondary"
                        size="sm"
                        className="flex items-center gap-1 bg-white shadow-md hover:bg-gray-100"
                        onClick={toggleMapStyle}
                    >
                        <Layers size={14} />
                        <span className="text-xs capitalize">{currentStyle}</span>
                    </Button>
                </div>

                {/* Show marker if coordinates are provided */}
                {markerCoordinates && (
                    <Marker
                        longitude={markerCoordinates.longitude}
                        latitude={markerCoordinates.latitude}
                        anchor="bottom"
                    >
                        <div className="flex flex-col items-center">
                            <MapPin
                                className={`h-8 w-8 text-red-500 ${isMarkerAnimating ? 'animate-bounce scale-125' : ''}`}
                            />
                            {isMarkerAnimating && (
                                <div className="absolute -bottom-4 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded whitespace-nowrap">
                                    Location updated
                                </div>
                            )}
                        </div>
                    </Marker>
                )}
            </Map>
        </div>
    );
});

MapSelector.displayName = 'MapSelector';

export default MapSelector; 