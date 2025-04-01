import { useState, useEffect } from "react";
import { Search, MapPin, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface LocationPickerProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

// Predefined locations for the barangay (you can expand this as needed)
const commonLocations = [
  "Near Barangay Hall",
  "Public Market Area",
  "Elementary School Vicinity",
  "Basketball Court",
  "Covered Court",
  "Main Road Junction",
  "Health Center",
  "Daycare Center",
  "Park/Plaza Area",
  "Church/Chapel Area"
];

// Streets in the barangay (these would be actual streets in your jurisdiction)
const barangayStreets = [
  "Maple Street",
  "Oak Avenue", 
  "Pine Road",
  "Cedar Lane",
  "Acacia Street",
  "Mahogany Drive",
  "Main Street",
  "Rizal Street",
  "National Highway"
];

export default function LocationPicker({ value, onChange, required = false }: LocationPickerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentLocations, setRecentLocations] = useState<string[]>([]);
  const [customLocationModalOpen, setCustomLocationModalOpen] = useState(false);
  const [customStreet, setCustomStreet] = useState("");
  const [customDetails, setCustomDetails] = useState("");
  
  // Load recent locations from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem("recentIncidentLocations");
    if (saved) {
      try {
        setRecentLocations(JSON.parse(saved).slice(0, 5));
      } catch (e) {
        console.error("Failed to parse recent locations", e);
      }
    }
  }, []);
  
  // Save a location to recent list
  const saveToRecent = (location: string) => {
    const updated = [location, ...recentLocations.filter(loc => loc !== location)].slice(0, 5);
    setRecentLocations(updated);
    localStorage.setItem("recentIncidentLocations", JSON.stringify(updated));
  };
  
  // Filter suggestions based on search term
  const filteredLocations = !searchTerm 
    ? [] 
    : [...commonLocations, ...barangayStreets]
        .filter(loc => loc.toLowerCase().includes(searchTerm.toLowerCase()));
    
  // Handle selection of a location
  const handleSelectLocation = (location: string) => {
    onChange(location);
    saveToRecent(location);
    setSearchTerm("");
    setShowSuggestions(false);
  };
  
  // Handle creation of custom location
  const handleCreateCustomLocation = () => {
    if (customStreet || customDetails) {
      const location = [customStreet, customDetails].filter(Boolean).join(", ");
      onChange(location);
      saveToRecent(location);
      setCustomLocationModalOpen(false);
      setCustomStreet("");
      setCustomDetails("");
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Enter incident location"
              className="pr-10"
              onFocus={() => setShowSuggestions(true)}
              required={required}
            />
            {value && (
              <button 
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => onChange("")}
              >
                ×
              </button>
            )}
          </div>
          <Button 
            type="button" 
            variant="outline"
            size="icon"
            onClick={() => setCustomLocationModalOpen(true)}
          >
            <MapPin size={18} />
          </Button>
        </div>

        {/* Location suggestions dropdown */}
        {showSuggestions && (
          <Card className="absolute z-10 w-full mt-1 max-h-[300px] overflow-y-auto bg-white border rounded-md shadow-lg">
            <div className="p-2">
              <Input
                placeholder="Search locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-2"
              />
              
              {recentLocations.length > 0 && searchTerm.length === 0 && (
                <div className="mb-3">
                  <h3 className="text-sm font-medium text-gray-500 mb-1 px-2">Recent Locations</h3>
                  <div className="space-y-1">
                    {recentLocations.map((location, i) => (
                      <div
                        key={`recent-${i}`}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer rounded-md flex items-center"
                        onClick={() => handleSelectLocation(location)}
                      >
                        <MapPin size={16} className="mr-2 text-gray-400" />
                        <span>{location}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {searchTerm.length > 0 && (
                <>
                  <h3 className="text-sm font-medium text-gray-500 mb-1 px-2">Suggestions</h3>
                  {filteredLocations.length > 0 ? (
                    <div className="space-y-1">
                      {filteredLocations.map((location, i) => (
                        <div
                          key={`suggestion-${i}`}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer rounded-md"
                          onClick={() => handleSelectLocation(location)}
                        >
                          {location}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 px-3 py-2">
                      No matching locations found
                    </div>
                  )}
                </>
              )}
              
              {searchTerm.length === 0 && (
                <>
                  <h3 className="text-sm font-medium text-gray-500 mb-1 px-2">Common Places</h3>
                  <div className="space-y-1">
                    {commonLocations.slice(0, 5).map((location, i) => (
                      <div
                        key={`common-${i}`}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer rounded-md"
                        onClick={() => handleSelectLocation(location)}
                      >
                        {location}
                      </div>
                    ))}
                  </div>
                </>
              )}
              
              <div className="mt-3 border-t pt-2">
                <button
                  type="button"
                  className="w-full text-center text-sm text-blue-600 hover:text-blue-800 py-1"
                  onClick={() => {
                    setShowSuggestions(false);
                    setCustomLocationModalOpen(true);
                  }}
                >
                  + Add custom location
                </button>
              </div>
            </div>
          </Card>
        )}
      </div>
      
      {/* Custom Location Modal */}
      <Dialog open={customLocationModalOpen} onOpenChange={setCustomLocationModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Specify Location Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Street / Area</label>
              <select
                className="w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                value={customStreet}
                onChange={(e) => setCustomStreet(e.target.value)}
              >
                <option value="">Select street or area</option>
                {barangayStreets.map((street, i) => (
                  <option key={`street-${i}`} value={street}>
                    {street}
                  </option>
                ))}
                <option value="other">Other (specify in details)</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Additional Details</label>
              <Input
                placeholder="House number, landmark, etc."
                value={customDetails}
                onChange={(e) => setCustomDetails(e.target.value)}
              />
            </div>
            
            <div className="pt-4 flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCustomLocationModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleCreateCustomLocation}
                disabled={!customStreet && !customDetails}
              >
                <Check size={16} className="mr-2" />
                Confirm Location
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 