"use client"

import React, { useState, useEffect, useRef } from 'react';
import Map, { Marker, NavigationControl, MapRef, Popup, Source, Layer, MapLayerMouseEvent } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapPin } from 'lucide-react';
import { useMap } from "./map-context"

// Map styles constants
// export const MAP_STYLES = {
//     STREETS: 'https://demotiles.maplibre.org/style.json',
//     SATELLITE: 'https://tiles.stadiamaps.com/styles/alidade_satellite.json',
//     TERRAIN: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
// };
export const MAP_STYLES = {
    STREETS: 'https://tiles.stadiamaps.com/styles/osm_bright.json', // Stadia Streets (requires API key)
    SATELLITE: 'https://tiles.stadiamaps.com/styles/alidade_satellite.json', // Stadia Satellite
    TERRAIN: 'https://tiles.stadiamaps.com/styles/outdoors.json', // Stadia Outdoors (terrain-focused)
    LIGHT: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json', // CARTO Light
    DARK: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json' // CARTO Dark
};
// Interfaces
export interface MapMarker {
    id: string;
    latitude: number;
    longitude: number;
    label?: string;
    color?: string;
}

export interface MapViewSettings {
    latitude: number;
    longitude: number;
    zoom: number;
}

export interface MapViewProps {
    initialView: MapViewSettings;
    markers?: MapMarker[];
    onMarkerClick?: (markerId: string) => void;
    mapStyle?: string;
    onMapClick?: (event: { lngLat: [number, number] }) => void;
    onMapMove?: (event: { lngLat: [number, number] }) => void;
    isDrawingBox?: boolean;
    boxCoordinates?: {
        north: number;
        south: number;
        east: number;
        west: number;
    };
    onMapLoad?: (mapRef: MapRef) => void;
}

export function MapView({
    initialView,
    markers = [],
    onMarkerClick,
    mapStyle = 'streets',
    onMapClick,
    onMapMove,
    isDrawingBox = false,
    boxCoordinates,
    onMapLoad
}: MapViewProps) {
    const [isMounted, setIsMounted] = useState(false);
    const mapRef = useRef<MapRef>(null);
    const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
    const { setMap } = useMap()

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Provide map reference to parent component
    useEffect(() => {
        if (mapRef.current && onMapLoad) {
            onMapLoad(mapRef.current);
        }
    }, [mapRef, onMapLoad, isMounted]);

    // Determine the map style based on the prop
    const getMapStyle = () => {
        switch (mapStyle.toLowerCase()) {
            case 'streets':
                return MAP_STYLES.STREETS;
            case 'satellite':
                return MAP_STYLES.SATELLITE;
            case 'terrain':
                return MAP_STYLES.TERRAIN;
            case 'light':
                return MAP_STYLES.LIGHT;
            case 'dark':
                return MAP_STYLES.DARK;
            default:
                return MAP_STYLES.STREETS;
        }
    };

    // Generate GeoJSON for the bounding box
    const generateBoxGeoJSON = () => {
        if (!boxCoordinates) return null;

        const { north, south, east, west } = boxCoordinates;

        return {
            type: 'Feature',
            geometry: {
                type: 'Polygon',
                coordinates: [
                    [
                        [west, north],
                        [east, north],
                        [east, south],
                        [west, south],
                        [west, north]
                    ]
                ]
            },
            properties: {}
        };
    };

    // Drawing box style
    const boxFillLayer = {
        id: 'box-fill',
        type: 'fill',
        paint: {
            'fill-color': '#ef4444',
            'fill-opacity': 0.2
        }
    };

    const boxOutlineLayer = {
        id: 'box-outline',
        type: 'line',
        paint: {
            'line-color': '#dc2626',
            'line-width': 2,
            'line-dasharray': [2, 1]
        }
    };

    // Handle Map Click and convert to the expected format
    const handleMapClick = (e: MapLayerMouseEvent) => {
        if (onMapClick) {
            const { lng, lat } = e.lngLat;
            onMapClick({
                lngLat: [lng, lat]
            });
        }
    };

    // Handle Mouse Move for live preview
    const handleMouseMove = (e: MapLayerMouseEvent) => {
        if (onMapMove) {
            const { lng, lat } = e.lngLat;
            onMapMove({
                lngLat: [lng, lat]
            });
        }
    };

    if (!isMounted) {
        return (
            <div className="flex h-full w-full items-center justify-center bg-gray-100">
                <span className="text-gray-500">Loading map...</span>
            </div>
        );
    }

    return (
        <Map
            ref={mapRef}
            mapLib={import('maplibre-gl')}
            initialViewState={{
                latitude: initialView.latitude,
                longitude: initialView.longitude,
                zoom: initialView.zoom
            }}
            style={{ width: '100%', height: '100%' }}
            mapStyle={getMapStyle()}
            onClick={onMapClick ? handleMapClick : undefined}
            onMouseMove={onMapMove ? handleMouseMove : undefined}
            cursor={isDrawingBox ? 'crosshair' : 'grab'}
        >
            <NavigationControl position="top-right" />

            {/* Render custom markers */}
            {markers.map((marker) => (
                <Marker
                    key={marker.id}
                    latitude={marker.latitude}
                    longitude={marker.longitude}
                    onClick={(e) => {
                        e.originalEvent.stopPropagation();
                        setSelectedMarker(marker);
                        if (onMarkerClick) {
                            onMarkerClick(marker.id);
                        }
                    }}
                >
                    <div className="cursor-pointer flex flex-col items-center">
                        <MapPin className={`h-6 w-6 ${marker.color || 'text-red-500'}`} />
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                            <div className="bg-white shadow-md rounded px-1 py-0.5 text-xs whitespace-nowrap">
                                {marker.label || 'Location'}
                            </div>
                        </div>
                    </div>
                </Marker>
            ))}

            {/* Bounding box for disaster relief area */}
            {boxCoordinates && (
                <Source id="box-source" type="geojson" data={generateBoxGeoJSON() as any}>
                    <Layer {...boxFillLayer as any} />
                    <Layer {...boxOutlineLayer as any} />
                </Source>
            )}
        </Map>
    );
} 