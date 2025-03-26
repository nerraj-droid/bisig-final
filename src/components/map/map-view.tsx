"use client"

import React, { useState, useEffect, useRef } from 'react';
import Map, { Marker, NavigationControl, MapRef, Popup, Source, Layer, MapLayerMouseEvent } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapPin } from 'lucide-react';
import { useMap } from "./map-context"

// Map styles constants
export const MAP_STYLES = {
    // CARTO free tiles - no API key needed, reliable and stable
    STREETS: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
    LIGHT: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    DARK: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    
    // MapLibre demo tiles - free for testing, minimal but works everywhere
    MAPLIBRE: 'https://demotiles.maplibre.org/style.json',
    
    // Free satellite option using ArcGIS World Imagery (defined as inline style below)
    SATELLITE: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json', // Fallback to CARTO voyager
    
    // Updated terrain style with better visualization
    TERRAIN: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json' // Using CARTO's positron as base
};

// Direct style object for satellite that can be used in place of URL
export const SATELLITE_STYLE = {
    version: 8 as 8,
    sources: {
        'arcgis-satellite': {
            type: 'raster',
            tiles: [
                'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
            ],
            tileSize: 256,
            attribution: '© Esri, Maxar, Earthstar Geographics, and the GIS User Community',
            maxzoom: 25
        }
    },
    layers: [
        {
            id: 'arcgis-satellite-layer',
            type: 'raster',
            source: 'arcgis-satellite',
            minzoom: 0,
            maxzoom: 19
        }
    ]
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

    // Configure 3D terrain when terrain style is selected
    useEffect(() => {
        if (mapRef.current && mapStyle.toLowerCase() === 'terrain') {
            const map = mapRef.current;
            
            map.on('load', () => {
                // Access the underlying mapbox map object which has all the methods we need
                const mapboxMap = map.getMap();
                
                // Add terrain source with improved terrain tiles
                if (!mapboxMap.getSource('terrainSource')) {
                    mapboxMap.addSource('terrainSource', {
                        type: 'raster-dem',
                        // Using freely available OpenMapTiles DEM source
                        url: 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png',
                        tileSize: 256,
                        encoding: 'terrarium' // Specify encoding format for better elevation data
                    });
                    
                    // Set the terrain property with improved configuration
                    mapboxMap.setTerrain({
                        source: 'terrainSource',
                        exaggeration: 1.8 // Increase exaggeration for better visibility
                    });
                    
                    // Add improved hillshading for better visual effect
                    if (!mapboxMap.getLayer('hillshade')) {
                        mapboxMap.addLayer({
                            id: 'hillshade',
                            type: 'hillshade',
                            source: 'terrainSource',
                            layout: { visibility: 'visible' },
                            paint: { 
                                'hillshade-shadow-color': '#404040',
                                'hillshade-highlight-color': '#FFFFFF',
                                'hillshade-illumination-direction': 315,
                                'hillshade-exaggeration': 0.7
                            }
                        });
                    }
                    
                    // Enhance the map with natural earth-toned colors
                    try {
                        // Enhance water features
                        const waterLayers = mapboxMap.getStyle().layers.filter(layer => 
                            layer.id.includes('water') || layer.id.includes('lake') || layer.id.includes('river')
                        );
                        
                        waterLayers.forEach(layer => {
                            if (layer.type === 'fill' && mapboxMap.getLayer(layer.id)) {
                                mapboxMap.setPaintProperty(layer.id, 'fill-color', '#b3d1ff');
                            }
                        });
                        
                        // Enhance land features
                        const landLayers = mapboxMap.getStyle().layers.filter(layer => 
                            layer.id.includes('land') || layer.id.includes('earth')
                        );
                        
                        landLayers.forEach(layer => {
                            if (layer.type === 'fill' && mapboxMap.getLayer(layer.id)) {
                                mapboxMap.setPaintProperty(layer.id, 'fill-color', '#e8e0d8');
                            }
                        });
                    } catch (e) {
                        console.log('Error enhancing map colors:', e);
                    }
                    
                    // Adjust to a better pitch for terrain viewing
                    mapboxMap.setPitch(60);
                    mapboxMap.setBearing(15); // Add slight rotation for better 3D perspective
                }
            });
        }
    }, [mapRef, mapStyle]);

    // Determine the map style based on the prop
    const getMapStyle = () => {
        switch (mapStyle.toLowerCase()) {
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
            case 'terrain':
                return MAP_STYLES.TERRAIN;
            case 'light':
                return MAP_STYLES.LIGHT;
            case 'dark':
                return MAP_STYLES.DARK;
            case 'maplibre':
                return MAP_STYLES.MAPLIBRE;
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