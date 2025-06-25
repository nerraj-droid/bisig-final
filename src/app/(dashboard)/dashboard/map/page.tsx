"use client";

import { useEffect, useState, useRef } from "react";
import { MapProvider } from "@/components/map/map-context";
import dynamic from 'next/dynamic';
import { SearchBox } from "@/components/map/search-box";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home, Layers, MapPin, Plus, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Dynamically import the MapView component to prevent SSR issues
const MapView = dynamic(
    () => import('@/components/map/map-view').then(mod => ({ default: mod.MapView })),
    {
        ssr: false,
        loading: () => (
            <div className="flex h-full w-full items-center justify-center bg-gray-100">
                <span className="text-gray-500">Loading map...</span>
            </div>
        )
    }
);

export default function MapPage() {
    const [households, setHouseholds] = useState<any[]>([]);
    const [markers, setMarkers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedHousehold, setSelectedHousehold] = useState<any>(null);
    const [mapStyle, setMapStyle] = useState('streets');
    const [isMounted, setIsMounted] = useState(false);
    const [showReportPreview, setShowReportPreview] = useState(false);
    const [reportType, setReportType] = useState<'summary' | 'detailed'>('summary');
    const [showReliefDialog, setShowReliefDialog] = useState(false);
    const [reliefMode, setReliefMode] = useState(false);
    
    // Polygon drawing state
    const [isDrawing, setIsDrawing] = useState(false);
    const [polygonPoints, setPolygonPoints] = useState<[number, number][]>([]);
    const [tempPoint, setTempPoint] = useState<[number, number] | null>(null);
    const [affectedHouseholds, setAffectedHouseholds] = useState<any[]>([]);
    
    const mapRef = useRef<any>(null);

    // Ensure component only renders on client side
    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        async function fetchHouseholds() {
            try {
                setIsLoading(true);
                const response = await fetch('/api/households?limit=500');
                if (!response.ok) {
                    throw new Error('Failed to fetch households');
                }

                const data = await response.json();
                setHouseholds(data);

                // Create markers more efficiently
                const mappedMarkers = data
                    .filter((household: any) => household.latitude && household.longitude)
                    .map((household: any) => ({
                        id: household.id,
                        latitude: household.latitude,
                        longitude: household.longitude,
                        label: `${household.houseNo || ''} ${household.street || ''}`.trim() || 'Household',
                        color: getMarkerColor(household)
                    }));

                setMarkers(mappedMarkers);

                // If we have markers and a mapRef, fit the view to show all markers
                if (mappedMarkers.length > 0 && mapRef.current) {
                    setTimeout(() => {
                        fitMapToMarkers(mappedMarkers);
                    }, 500);
                }
            } catch (error) {
                console.error("Error fetching households:", error);
            } finally {
                setIsLoading(false);
            }
        }

        if (isMounted) {
            fetchHouseholds();
        }
    }, [isMounted]);

    // Assign different colors to markers based on household properties
    const getMarkerColor = (household: any) => {
        // You can customize the logic here to assign colors based on household properties
        const residentCount = household.Resident?.length || 0;

        if (residentCount === 0) return 'text-gray-500';
        if (residentCount > 5) return 'text-red-500';
        if (residentCount > 3) return 'text-amber-500';
        return 'text-primary';
    };

    // Fit map view to show all markers
    const fitMapToMarkers = (markersToFit = markers) => {
        if (!mapRef.current || markersToFit.length === 0) return;

        try {
            // Calculate bounds
            let minLat = Number.MAX_VALUE;
            let maxLat = Number.MIN_VALUE;
            let minLng = Number.MAX_VALUE;
            let maxLng = Number.MIN_VALUE;

            markersToFit.forEach(marker => {
                minLat = Math.min(minLat, marker.latitude);
                maxLat = Math.max(maxLat, marker.latitude);
                minLng = Math.min(minLng, marker.longitude);
                maxLng = Math.max(maxLng, marker.longitude);
            });

            // Add padding
            const padding = 50;

            mapRef.current.fitBounds(
                [
                    [minLng, minLat],
                    [maxLng, maxLat]
                ],
                {
                    padding: {
                        top: padding,
                        bottom: padding,
                        left: padding,
                        right: padding
                    },
                    duration: 1500
                }
            );
        } catch (error) {
            console.error("Error fitting map to markers:", error);
        }
    };

    // Handle location selection from search
    const handleSelectLocation = (coordinates: [number, number], address: string) => {
        // Fly to the selected location
        if (mapRef.current) {
            mapRef.current.flyTo({
                center: coordinates,
                zoom: 15,
                duration: 1500
            });
        }
        console.log("Selected location:", coordinates, address);
    };

    // Navigate to household detail when marker is clicked
    const handleMarkerClick = (markerId: string) => {
        const household = households.find(h => h.id === markerId);
        if (household) {
            setSelectedHousehold(household);
        }
    };

    // Handle map style change
    const handleMapStyleChange = (value: string) => {
        setMapStyle(value);
    };

    // Calculate age from birth date - with memoization
    const calculateAge = (birthDate: string | Date) => {
        if (!birthDate) return '';

        try {
            // Convert to date object whether the birthDate is a string or Date object
            const dob = birthDate instanceof Date ? birthDate : new Date(birthDate);

            // Check if date is valid
            if (isNaN(dob.getTime())) return '';

            const today = new Date();
            let age = today.getFullYear() - dob.getFullYear();
            const monthDiff = today.getMonth() - dob.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
                age--;
            }

            // Don't show negative ages
            return age >= 0 ? age : '';
        } catch (error) {
            console.error('Error calculating age:', error);
            return '';
        }
    };

    // Show report preview
    const showPreview = (type: 'summary' | 'detailed') => {
        setReportType(type);
        setShowReportPreview(true);
    };

    // Generate relief report
    const generateReliefReport = (includeResidents = false) => {
        if (affectedHouseholds.length === 0) {
            setShowReportPreview(false);
            return;
        }

        try {
            // Format date for filename
            const date = new Date();
            const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

            // Helper function to escape CSV field values
            const escapeCSV = (field: any) => {
                if (field === null || field === undefined) return '';
                const str = String(field);
                // If the field contains commas, quotes, or newlines, wrap in quotes and escape inner quotes
                if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                    return `"${str.replace(/"/g, '""')}"`;
                }
                return str;
            };

            let csvContent = '';
            let filename = '';

            if (includeResidents) {
                // Detailed report with resident information
                csvContent = "Household ID,House Number,Street,Barangay,City,Resident ID,First Name,Last Name,Birth Date,Age,Gender,Civil Status,Contact Number,Latitude,Longitude\n";

                affectedHouseholds.forEach(household => {
                    if (household.Resident && household.Resident.length > 0) {
                        household.Resident.forEach((resident: any) => {
                            const age = calculateAge(resident.birthDate);
                            const row = [
                                escapeCSV(household.id),
                                escapeCSV(household.houseNo),
                                escapeCSV(household.street),
                                escapeCSV(household.barangay),
                                escapeCSV(household.city),
                                escapeCSV(resident.id),
                                escapeCSV(resident.firstName),
                                escapeCSV(resident.lastName),
                                escapeCSV(resident.birthDate),
                                escapeCSV(age),
                                escapeCSV(resident.gender),
                                escapeCSV(resident.civilStatus),
                                escapeCSV(resident.contactNo),
                                escapeCSV(household.latitude),
                                escapeCSV(household.longitude)
                            ].join(',');
                            csvContent += row + '\n';
                        });
                    } else {
                        // Include household with no residents
                        const row = [
                            escapeCSV(household.id),
                            escapeCSV(household.houseNo),
                            escapeCSV(household.street),
                            escapeCSV(household.barangay),
                            escapeCSV(household.city),
                            '', '', '', '', '', '', '', '',
                            escapeCSV(household.latitude),
                            escapeCSV(household.longitude)
                        ].join(',');
                        csvContent += row + '\n';
                    }
                });

                filename = `disaster_relief_detailed_${formattedDate}.csv`;
            } else {
                // Simple household summary report
                csvContent = "Household ID,House Number,Street,Barangay,City,Residents Count,Latitude,Longitude\n";

                affectedHouseholds.forEach(household => {
                    const residentCount = household.Resident?.length || 0;
                    const row = [
                        escapeCSV(household.id),
                        escapeCSV(household.houseNo),
                        escapeCSV(household.street),
                        escapeCSV(household.barangay),
                        escapeCSV(household.city),
                        escapeCSV(residentCount),
                        escapeCSV(household.latitude),
                        escapeCSV(household.longitude)
                    ].join(',');
                    csvContent += row + '\n';
                });

                filename = `disaster_relief_summary_${formattedDate}.csv`;
            }

            // Create blob with BOM for Excel compatibility
            const BOM = "\uFEFF"; // UTF-8 BOM
            const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

            // Create download link
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();

            // Clean up
            setTimeout(() => {
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }, 100);

            setShowReportPreview(false);
        } catch (error) {
            console.error("Error generating report:", error);
            alert("An error occurred while generating the report. Please try again.");
        }
    };

    // Toggle relief mode
    const toggleReliefMode = () => {
        setReliefMode(!reliefMode);
        if (reliefMode) {
            // Exiting relief mode, reset all drawing state and clear the map
            setIsDrawing(false);
            setPolygonPoints([]);
            setTempPoint(null);
            setAffectedHouseholds([]);
        }
    };

    // Handle map click for drawing polygon
    const handleMapClick = (event: { lngLat: [number, number] }) => {
        if (!reliefMode) return;

        const [lng, lat] = event.lngLat;

        if (!isDrawing) {
            // Start drawing
            setIsDrawing(true);
            setPolygonPoints([[lng, lat]]);
        } else {
            // Continue drawing the polygon
            setPolygonPoints(prev => [...prev, [lng, lat]]);
            
            // Check if the polygon is being closed (clicking near the first point)
            if (polygonPoints.length >= 3) {
                const [firstLng, firstLat] = polygonPoints[0];
                const distance = Math.sqrt(Math.pow(lng - firstLng, 2) + Math.pow(lat - firstLat, 2));
                
                // If clicked close to the first point, complete the polygon
                if (distance < 0.0005) { // Small threshold for closing the polygon
                    completePolygon();
                }
            }
        }
    };

    // Complete the polygon drawing and calculate affected households
    const completePolygon = () => {
        if (polygonPoints.length < 3) {
            alert('Please draw a polygon with at least 3 points');
            return;
        }
        
        setIsDrawing(false);
        
        // Close the polygon if not already closed
        const firstPoint = polygonPoints[0];
        const lastPoint = polygonPoints[polygonPoints.length - 1];
        
        if (firstPoint[0] !== lastPoint[0] || firstPoint[1] !== lastPoint[1]) {
            setPolygonPoints(prev => [...prev, firstPoint]);
        }
        
        // Find affected households using point-in-polygon check
        const affected = households.filter((household) => {
            if (!household.latitude || !household.longitude) return false;
            
            return isPointInPolygon(household.longitude, household.latitude, polygonPoints);
        });
        
        setAffectedHouseholds(affected);
        setShowReliefDialog(true);
    };

    // Function to check if a point is inside a polygon
    const isPointInPolygon = (lng: number, lat: number, polygon: [number, number][]) => {
        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i][0], yi = polygon[i][1];
            const xj = polygon[j][0], yj = polygon[j][1];
            
            const intersect = ((yi > lat) !== (yj > lat)) && 
                (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi);
                
            if (intersect) inside = !inside;
        }
        
        return inside;
    };

    // Handle mouse move for preview point
    const handleMapMove = (event: { lngLat: [number, number] }) => {
        if (!reliefMode || !isDrawing) return;
        
        const [lng, lat] = event.lngLat;
        setTempPoint([lng, lat]);
    };

    // Handle map loading
    const handleMapLoad = (map: any) => {
        mapRef.current = map;
    };

    // Render the map with client-side only consideration
    const renderMap = () => {
        if (!isMounted || isLoading) return (
            <div className="flex h-full w-full items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#006B5E] mx-auto mb-4"></div>
                    <span className="text-gray-500">Loading map data...</span>
                </div>
            </div>
        );

        return (
            <MapView
                markers={markers}
                initialView={{
                    latitude: 14.5995, // Default to Philippines
                    longitude: 120.9842,
                    zoom: 12
                }}
                onMarkerClick={handleMarkerClick}
                mapStyle={mapStyle}
                onMapClick={reliefMode ? handleMapClick : undefined}
                onMapMove={reliefMode && isDrawing ? handleMapMove : undefined}
                isDrawingBox={isDrawing}
                onMapLoad={handleMapLoad}
                boxCoordinates={polygonPoints.length > 0 ? polygonPoints : undefined}
                tempDrawingPoint={tempPoint}
            />
        );
    };

    // Calculate polygon area in square kilometers
    const calculatePolygonArea = (polygon: [number, number][]) => {
        if (polygon.length < 3) return 0;
        
        // Make sure polygon is closed
        const coords = polygon[0][0] === polygon[polygon.length-1][0] && 
                      polygon[0][1] === polygon[polygon.length-1][1] ?
                      polygon : [...polygon, polygon[0]];
        
        // Use the Shoelace formula to calculate the area
        let area = 0;
        for (let i = 0; i < coords.length - 1; i++) {
            area += coords[i][0] * coords[i+1][1] - coords[i+1][0] * coords[i][1];
        }
        area = Math.abs(area) / 2;
        
        // Convert to square kilometers (approximate conversion at equator)
        // 1 degree of longitude at equator is approximately 111.32 km
        // Area needs to be multiplied by (111.32 km)² per square degree
        const areaInSquareKm = area * 111.32 * 111.32;
        
        // For more precision, we should take into account the latitude, but this is a good approximation
        return areaInSquareKm;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#006B5E]">Household Map</h1>
                    <p className="text-gray-500 mt-1">View and manage household locations</p>
                </div>
                <div className="flex space-x-2">
                    <Button
                        variant="outline"
                        onClick={() => fitMapToMarkers()}
                        disabled={markers.length === 0 || isLoading}
                        className="hidden sm:flex"
                    >
                        <Layers className="mr-2 h-4 w-4" />
                        Fit to Markers
                    </Button>
                    <Link href="/dashboard/households/new">
                        <Button className="bg-[#006B5E] hover:bg-[#005046]">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Household
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left sidebar */}
                <div className="lg:col-span-1 space-y-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Map Controls</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-1 block">Search Location</label>
                                <MapProvider>
                                    <SearchBox onSelectLocation={handleSelectLocation} />
                                </MapProvider>
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-1 block">Map Style</label>
                                <Select value={mapStyle} onValueChange={handleMapStyleChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select style" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="streets">Streets</SelectItem>
                                        <SelectItem value="satellite">Satellite</SelectItem>
                                        <SelectItem value="terrain">Terrain</SelectItem>
                                        <SelectItem value="light">Light</SelectItem>
                                        <SelectItem value="dark">Dark</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="lg:hidden flex justify-center">
                                <Button
                                    variant="outline"
                                    onClick={() => fitMapToMarkers()}
                                    disabled={markers.length === 0 || isLoading}
                                    className="w-full"
                                >
                                    <Layers className="mr-2 h-4 w-4" />
                                    Fit to Markers
                                </Button>
                            </div>

                            <div className="pt-2 border-t">
                                <div className="flex items-start">
                                    <AlertCircle className="text-amber-500 h-5 w-5 mr-2 mt-0.5" />
                                    <p className="text-xs text-gray-600">
                                        Satellite view provides the best detail for identifying specific buildings and house locations.
                                    </p>
                                </div>
                            </div>

                            <div className="pt-2 border-t">
                                <Button
                                    onClick={toggleReliefMode}
                                    variant={reliefMode ? "default" : "outline"}
                                    className={`w-full ${reliefMode ? "bg-red-600 hover:bg-red-700" : "bg-amber-600 hover:bg-amber-700 text-white"}`}
                                >
                                    {reliefMode ? "Exit Relief Mode" : "Relief Area Selection"}
                                </Button>
                                {reliefMode && (
                                    <div className="text-xs text-gray-600 mt-2 space-y-2">
                                        <p>
                                            Click on the map to create polygon points. Continue clicking to add more points and shape your area.
                                        </p>
                                        <p>
                                            To complete the polygon, either click near the starting point or use the button below.
                                        </p>
                                        {isDrawing && polygonPoints.length >= 3 && (
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="w-full mt-2"
                                                onClick={completePolygon}
                                            >
                                                Complete Polygon
                                            </Button>
                                        )}
                                        {isDrawing && (
                                            <p className="font-medium">
                                                Points: {polygonPoints.length}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {selectedHousehold && (
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg flex items-center">
                                    <Home className="mr-2 h-5 w-5" />
                                    Selected Household
                                </CardTitle>
                                <CardDescription>
                                    {selectedHousehold.houseNo} {selectedHousehold.street}, {selectedHousehold.barangay}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm font-medium">Residents:</p>
                                        {selectedHousehold.Resident && selectedHousehold.Resident.length > 0 ? (
                                            <ul className="list-disc list-inside text-sm pl-2 mt-1">
                                                {selectedHousehold.Resident.map((resident: any) => (
                                                    <li key={resident.id}>
                                                        {resident.firstName} {resident.lastName}
                                                    </li>
                                                ))}
                                                {selectedHousehold.Resident.length > 5 && (
                                                    <li className="text-gray-500">And more...</li>
                                                )}
                                            </ul>
                                        ) : (
                                            <p className="text-sm text-gray-500">No residents assigned</p>
                                        )}
                                    </div>
                                    <div className="pt-2">
                                        <Badge variant="outline" className="mr-1">
                                            Lat: {selectedHousehold.latitude.toFixed(6)}
                                        </Badge>
                                        <Badge variant="outline">
                                            Long: {selectedHousehold.longitude.toFixed(6)}
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-col gap-2">
                                <Link href={`/dashboard/households/${selectedHousehold.id}`} className="w-full">
                                    <Button variant="secondary" className="w-full">
                                        View Details
                                    </Button>
                                </Link>
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => {
                                        if (mapRef.current) {
                                            mapRef.current.flyTo({
                                                center: [selectedHousehold.longitude, selectedHousehold.latitude],
                                                zoom: 18,
                                                duration: 1000
                                            });
                                        }
                                    }}
                                >
                                    <MapPin className="mr-2 h-4 w-4" /> Zoom to Location
                                </Button>
                            </CardFooter>
                        </Card>
                    )}

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Statistics</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm">Total Households:</span>
                                    <Badge variant="secondary">{households.length}</Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm">Mapped Households:</span>
                                    <Badge variant="secondary">{markers.length}</Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm">Unmapped:</span>
                                    <Badge variant="secondary">{households.length - markers.length}</Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm">Total Residents:</span>
                                    <Badge variant="secondary">
                                        {households.reduce((total, h) => total + (h.Resident?.length || 0), 0)}
                                    </Badge>
                                </div>
                            </div>
                            <div className="pt-3 mt-3 border-t">
                                <p className="text-xs text-gray-500 mb-2">Marker Color Legend:</p>
                                <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                                    <div className="flex items-center">
                                        <MapPin className="h-4 w-4 text-primary mr-1" />
                                        <span className="text-xs">1-3 Residents</span>
                                    </div>
                                    <div className="flex items-center">
                                        <MapPin className="h-4 w-4 text-amber-500 mr-1" />
                                        <span className="text-xs">4-5 Residents</span>
                                    </div>
                                    <div className="flex items-center">
                                        <MapPin className="h-4 w-4 text-red-500 mr-1" />
                                        <span className="text-xs">6+ Residents</span>
                                    </div>
                                    <div className="flex items-center">
                                        <MapPin className="h-4 w-4 text-gray-500 mr-1" />
                                        <span className="text-xs">No Residents</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Map area */}
                <div className="lg:col-span-3">
                    <Card className="h-[calc(100vh-12rem)]">
                        <CardContent className="p-0 h-full">
                            <div className="rounded-lg h-full overflow-hidden">
                                <MapProvider>
                                    {renderMap()}
                                </MapProvider>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Report Preview Dialog */}
            <Dialog open={showReportPreview} onOpenChange={setShowReportPreview}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {reportType === 'detailed' ? 'Detailed Relief Report Preview' : 'Summary Relief Report Preview'}
                        </DialogTitle>
                        <DialogDescription>
                            Preview of the {reportType === 'detailed' ? 'detailed' : 'summary'} report data before download
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="border rounded-md p-2">
                            <p className="text-sm font-medium mb-2">Export will include {affectedHouseholds.length} households {
                                reportType === 'detailed' && affectedHouseholds.reduce((total, h) => total + (h.Resident?.length || 0), 0) > 0 ?
                                    `with ${affectedHouseholds.reduce((total, h) => total + (h.Resident?.length || 0), 0)} residents` : ''
                            }</p>

                            {reportType === 'summary' ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-xs border-collapse">
                                        <thead>
                                            <tr className="bg-gray-100">
                                                <th className="border px-2 py-1 text-left">House #</th>
                                                <th className="border px-2 py-1 text-left">Street</th>
                                                <th className="border px-2 py-1 text-left">Barangay</th>
                                                <th className="border px-2 py-1 text-left">City</th>
                                                <th className="border px-2 py-1 text-left">Residents Count</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {affectedHouseholds.slice(0, 5).map(household => (
                                                <tr key={household.id} className="hover:bg-gray-50">
                                                    <td className="border px-2 py-1">{household.houseNo || '-'}</td>
                                                    <td className="border px-2 py-1">{household.street || '-'}</td>
                                                    <td className="border px-2 py-1">{household.barangay || '-'}</td>
                                                    <td className="border px-2 py-1">{household.city || '-'}</td>
                                                    <td className="border px-2 py-1">{household.Resident?.length || 0}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {affectedHouseholds.length > 5 && (
                                        <p className="text-xs text-gray-500 mt-2">... and {affectedHouseholds.length - 5} more households</p>
                                    )}
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-xs border-collapse">
                                        <thead>
                                            <tr className="bg-gray-100">
                                                <th className="border px-2 py-1 text-left">House #</th>
                                                <th className="border px-2 py-1 text-left">Street</th>
                                                <th className="border px-2 py-1 text-left">Resident Name</th>
                                                <th className="border px-2 py-1 text-left">Age</th>
                                                <th className="border px-2 py-1 text-left">Gender</th>
                                                <th className="border px-2 py-1 text-left">Contact</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {affectedHouseholds.slice(0, 5).flatMap(household =>
                                                (household.Resident && household.Resident.length > 0)
                                                    ? household.Resident.slice(0, 3).map((resident: any) => (
                                                        <tr key={resident.id} className="hover:bg-gray-50">
                                                            <td className="border px-2 py-1">{household.houseNo || '-'}</td>
                                                            <td className="border px-2 py-1">{household.street || '-'}</td>
                                                            <td className="border px-2 py-1">{`${resident.firstName || ''} ${resident.lastName || ''}`}</td>
                                                            <td className="border px-2 py-1">{calculateAge(resident.birthDate) || '-'}</td>
                                                            <td className="border px-2 py-1">{resident.gender || '-'}</td>
                                                            <td className="border px-2 py-1">{resident.contactNo || '-'}</td>
                                                        </tr>
                                                    ))
                                                    : [(
                                                        <tr key={household.id} className="hover:bg-gray-50">
                                                            <td className="border px-2 py-1">{household.houseNo || '-'}</td>
                                                            <td className="border px-2 py-1">{household.street || '-'}</td>
                                                            <td className="border px-2 py-1 text-gray-400">No residents</td>
                                                            <td className="border px-2 py-1">-</td>
                                                            <td className="border px-2 py-1">-</td>
                                                            <td className="border px-2 py-1">-</td>
                                                        </tr>
                                                    )]
                                            )}
                                        </tbody>
                                    </table>
                                    <p className="text-xs text-gray-500 mt-2">Preview shows limited entries. Full report will include all data.</p>
                                </div>
                            )}
                        </div>
                    </div>
                    <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
                        <Button variant="outline" onClick={() => setShowReportPreview(false)}>
                            Close
                        </Button>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full sm:w-auto">
                            <Button
                                type="button"
                                className="bg-red-600 hover:bg-red-700"
                                onClick={() => generateReliefReport(reportType === 'detailed')}
                                size="sm"
                            >
                                <FileText className="mr-1 h-3 w-3" />
                                Download {reportType === 'detailed' ? 'Detailed' : 'Summary'}
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Relief Area Dialog */}
            <Dialog open={showReliefDialog} onOpenChange={setShowReliefDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Relief Area Selected</DialogTitle>
                        <DialogDescription>
                            You've selected an area on the map for disaster relief.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <h4 className="text-sm font-medium mb-1">Selected Area:</h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="col-span-2">
                                    <span className="text-gray-500">Polygon Points: </span>
                                    {polygonPoints.length}
                                </div>
                                <div className="col-span-2">
                                    <span className="text-gray-500">Area Size: </span>
                                    {calculatePolygonArea(polygonPoints).toFixed(2)} km²
                                </div>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium mb-1">Affected Area Statistics:</h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <span className="text-gray-500">Households: </span>
                                    {affectedHouseholds.length}
                                </div>
                                <div>
                                    <span className="text-gray-500">Residents: </span>
                                    {affectedHouseholds.reduce((total, household) => total + (household.Resident?.length || 0), 0)}
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowReliefDialog(false)}
                        >
                            Close
                        </Button>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full sm:w-auto">
                            <Button
                                type="button"
                                className="bg-red-600 hover:bg-red-700"
                                onClick={() => showPreview('summary')}
                                size="sm"
                                disabled={affectedHouseholds.length === 0}
                            >
                                <FileText className="mr-1 h-3 w-3" />
                                Summary Report
                            </Button>
                            <Button
                                type="button"
                                className="bg-red-600 hover:bg-red-700"
                                onClick={() => showPreview('detailed')}
                                size="sm"
                                disabled={affectedHouseholds.length === 0}
                            >
                                <FileText className="mr-1 h-3 w-3" />
                                Detailed Report
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
} 