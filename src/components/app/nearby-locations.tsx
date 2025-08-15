
"use client";

import { useState, useEffect } from 'react';
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Hospital, Pill, LoaderCircle } from 'lucide-react';
import { useTranslation } from '@/context/language-context';
import { getNearbyMedicalPlaces } from '@/app/actions';
import type { NearbyPlace } from '@/ai/tools/find-nearby-places';
import { useToast } from '@/hooks/use-toast';

const PlaceIcon = ({type}: {type: string}) => {
    if (type === 'hospital') {
        return <Hospital className="h-6 w-6 text-destructive" />;
    }
    return <Pill className="h-6 w-6 text-green-600" />;
}

export function NearbyLocations() {
  const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 34.0522, lng: -118.2437 }); // Default to LA
  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { t } = useTranslation();
  const { toast } = useToast();

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
        console.error("Google Maps API key is missing.");
        setError(t('nearbyLocations.apiKeyMissing'));
        setIsLoading(false);
        return;
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserPosition(pos);
          setMapCenter(pos);
          setError(null);
        },
        () => {
          setError(t('nearbyLocations.locationError'));
          setIsLoading(false);
        }
      );
    } else {
        setError(t('nearbyLocations.geolocationNotSupported'));
        setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (userPosition) {
      const fetchPlaces = async () => {
        setIsLoading(true);
        const result = await getNearbyMedicalPlaces(userPosition);
        if (result.error) {
            toast({
                variant: 'destructive',
                title: t('nearbyLocations.fetchErrorTitle'),
                description: result.error,
            });
        } else {
            setPlaces(result.data || []);
        }
        setIsLoading(false);
      };
      fetchPlaces();
    }
  }, [userPosition, t, toast]);

  return (
    <Card className="h-full w-full">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">{t('nearbyLocations.title')}</CardTitle>
        {error && <CardDescription className="text-destructive">{error}</CardDescription>}
      </CardHeader>
      <CardContent className="flex flex-col gap-4 h-[calc(100%-6rem)]">
        <div className="h-1/2 rounded-lg overflow-hidden border">
           <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}>
             <Map center={mapCenter} zoom={13} mapId="medic_assist_map" className="w-full h-full" gestureHandling={'greedy'}>
               {userPosition && <Marker position={userPosition} title={t('nearbyLocations.yourLocation')} />}
               {places.map(place => (
                  <Marker key={place.placeId} position={place} title={place.name} />
               ))}
             </Map>
           </APIProvider>
        </div>
        <div className="h-1/2 overflow-y-auto space-y-3 pr-2">
            {isLoading ? (
                <div className="flex items-center justify-center h-full">
                    <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : places.length > 0 ? (
                places.map(place => (
                    <div key={place.placeId} className="flex items-center gap-4 p-3 bg-card rounded-lg border">
                        <PlaceIcon type={place.type} />
                        <div>
                            <p className="font-bold">{place.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">{place.vicinity}</p>
                        </div>
                    </div>
                ))
            ) : (
                <p className="text-sm text-muted-foreground text-center pt-4">{t('nearbyLocations.noResults')}</p>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
