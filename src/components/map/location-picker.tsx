"use client"

import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'

interface LocationPickerProps {
    initialLocation: { latitude: number; longitude: number } | null
    onLocationChange: (location: { latitude: number; longitude: number } | null) => void
}

export function LocationPicker({ initialLocation, onLocationChange }: LocationPickerProps) {
    const mapContainer = useRef<HTMLDivElement>(null)
    const map = useRef<mapboxgl.Map | null>(null)
    const marker = useRef<mapboxgl.Marker | null>(null)

    useEffect(() => {
        if (!mapContainer.current) return

        if (!map.current) {
            map.current = new mapboxgl.Map({
                container: mapContainer.current,
                style: 'mapbox://styles/mapbox/streets-v12',
                center: initialLocation
                    ? [initialLocation.longitude, initialLocation.latitude]
                    : [120.984222, 14.599512],
                zoom: 15
            })

            map.current.addControl(new mapboxgl.NavigationControl())

            marker.current = new mapboxgl.Marker({ draggable: true })
                .setLngLat(initialLocation
                    ? [initialLocation.longitude, initialLocation.latitude]
                    : [120.984222, 14.599512])
                .addTo(map.current)

            marker.current.on('dragend', () => {
                const lngLat = marker.current?.getLngLat()
                if (lngLat) {
                    onLocationChange({
                        latitude: lngLat.lat,
                        longitude: lngLat.lng
                    })
                }
            })
        }

        return () => {
            if (map.current) {
                map.current.remove()
                map.current = null
            }
        }
    }, []) // Only run on mount/unmount

    return <div ref={mapContainer} className="h-[400px] w-full rounded-lg" />
}