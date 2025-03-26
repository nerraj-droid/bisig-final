"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { MapRef } from 'react-map-gl/maplibre';

interface MapContextType {
    map: MapRef | null
    setMap: (map: MapRef | null) => void
}

const MapContext = createContext<MapContextType>({
    map: null,
    setMap: () => { }
});

export function MapProvider({ children }: { children: ReactNode }) {
    const [map, setMap] = useState<MapRef | null>(null)

    return (
        <MapContext.Provider value={{ map, setMap }}>
            {children}
        </MapContext.Provider>
    )
}

export function useMap() {
    return useContext(MapContext)
} 