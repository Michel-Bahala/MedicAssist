"use client";

import { useState } from 'react';
import { Phone, MapPin, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

type Geolocation = {
  latitude: number;
  longitude: number;
};

export function EmergencyButton() {
  const [location, setLocation] = useState<Geolocation | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setError(null);
        },
        (err) => {
          setError(`Error getting location: ${err.message}`);
          setLocation(null);
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
    }
  };

  const handleEmergencyCall = () => {
    window.location.href = 'tel:911';
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="flex items-center gap-2" onClick={handleGetLocation}>
          <AlertTriangle className="h-5 w-5" />
          <span className="font-bold">EMERGENCY</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
             <AlertTriangle className="h-6 w-6 text-destructive" />
             Are you sure this is an emergency?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This will attempt to call emergency services. Only proceed if you are in a genuine emergency situation. Your current location is displayed below to share with the operator.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="my-4 p-4 bg-muted rounded-lg">
          <h4 className="font-bold mb-2 flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" /> Your Location</h4>
          {error && <p className="text-destructive text-sm">{error}</p>}
          {location ? (
             <p className="font-mono text-sm">
              Lat: {location.latitude.toFixed(6)}, Lon: {location.longitude.toFixed(6)}
            </p>
          ) : (
            <p className="text-muted-foreground text-sm">Getting your location...</p>
          )}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleEmergencyCall} className="bg-destructive hover:bg-destructive/90 flex items-center gap-2">
            <Phone className="h-5 w-5" /> Call Now
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
