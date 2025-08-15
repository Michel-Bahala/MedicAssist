"use client";

import { useState, useEffect } from 'react';
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Hospital, Pill } from 'lucide-react';

const MOCK_PLACES = [
  { id: 1, type: 'hospital', name: 'City General Hospital', lat: 34.055, lng: -118.245 },
  { id: 2, type: 'pharmacy', name: 'Community Pharmacy', lat: 34.060, lng: -118.250 },
  { id: 3, type: 'hospital', name: 'St. Jude Medical Center', lat: 34.050, lng: -118.235 },
  { id: 4, type: 'pharmacy', name: 'Wellness Drug Store', lat: 34.048, lng: -118.255 },
];

const PlaceIcon = ({type}: {type: string}) => {
    if (type === 'hospital') {
        return <Hospital className="h-6 w-6 text-destructive" />;
    }
    return <Pill className="h-6 w-6 text-green-600" />;
}

export function NearbyLocations() {
  const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 34.0522, lng: -118.2437 }); // Default to LA

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserPosition(pos);
          setMapCenter(pos);
        },
        () => {
          // Handle location error or permission denied
          console.warn("User did not grant location permissions.");
        }
      );
    }
  }, []);

  return (
    <Card className="h-full w-full">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Nearby Medical Facilities</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 h-[calc(100%-4rem)]">
        <div className="h-1/2 rounded-lg overflow-hidden border">
           <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}>
             <Map center={mapCenter} zoom={13} mapId="medic_assist_map" className="w-full h-full">
               {userPosition && <Marker position={userPosition} title="Your Location" />}
               {MOCK_PLACES.map(place => (
                  <Marker key={place.id} position={place} title={place.name} />
               ))}
             </Map>
           </APIProvider>
        </div>
        <div className="h-1/2 overflow-y-auto space-y-3 pr-2">
            <p className="text-sm text-muted-foreground">Note: Location data is for demonstration purposes only. A Google Maps API key is required for full functionality.</p>
            {MOCK_PLACES.map(place => (
                <div key={place.id} className="flex items-center gap-4 p-3 bg-card rounded-lg border">
                    <PlaceIcon type={place.type} />
                    <div>
                        <p className="font-bold">{place.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{place.type}</p>
                    </div>
                </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
