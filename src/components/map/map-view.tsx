"use client"

import { useEffect, useRef } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { useMap } from "./map-context"

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!

interface MapViewProps {
    initialView?: {
        longitude: number
        latitude: number
        zoom: number
    }
    markers?: Array<{
        id: string
        longitude: number
        latitude: number
        description: string
    }>
    onMarkerClick?: (id: string) => void
}

export function MapView({
    initialView = {
        longitude: 120.984222,
        latitude: 14.599512,
        zoom: 15
    },
    markers = [],
    onMarkerClick
}: MapViewProps) {
    const mapContainer = useRef<HTMLDivElement>(null)
    const map = useRef<mapboxgl.Map | null>(null)
    const markerRefs = useRef<{ [key: string]: mapboxgl.Marker }>({})
    const { setMap } = useMap()

    useEffect(() => {
        if (!mapContainer.current || map.current) return

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: "mapbox://styles/mapbox/satellite-streets-v12",
            center: [initialView.longitude, initialView.latitude],
            zoom: initialView.zoom
        })

        map.current.addControl(new mapboxgl.NavigationControl())
        map.current.addControl(new mapboxgl.FullscreenControl())

        // Add markers
        markers.forEach((marker) => {
            const el = document.createElement('div')
            el.className = 'marker'
            el.style.width = '24px'
            el.style.height = '24px'
            el.style.backgroundImage = 'url(/marker.svg)'
            el.style.backgroundSize = 'cover'
            el.style.filter = 'invert(14%) sepia(89%) saturate(6453%) hue-rotate(358deg) brightness(97%) contrast(113%)'
            el.style.cursor = 'pointer'

            const mapMarker = new mapboxgl.Marker(el)
                .setLngLat([marker.longitude, marker.latitude])
                .setPopup(new mapboxgl.Popup().setHTML(marker.description))
                .addTo(map.current!)

            if (onMarkerClick) {
                el.addEventListener('click', () => onMarkerClick(marker.id))
            }

            markerRefs.current[marker.id] = mapMarker
        })

        setMap(map.current)

        return () => {
            // Clean up markers
            Object.values(markerRefs.current).forEach(marker => marker.remove())
            markerRefs.current = {}
            map.current?.remove()
            map.current = null
            setMap(null)
        }
    }, [initialView.latitude, initialView.longitude, initialView.zoom, markers, onMarkerClick])

    return <div ref={mapContainer} className="h-[600px] w-full" />
} 