
'use server';

/**
 * @fileOverview A Genkit tool to find nearby medical facilities using Google Places API.
 *
 * - findNearbyPlaces - A function that searches for nearby hospitals or pharmacies.
 * - findNearbyPlacesTool - The Genkit tool definition for the function.
 * - FindNearbyPlacesInput - The input type for the function.
 * - NearbyPlace - The output type for a single place.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { Client, PlaceType1 } from '@googlemaps/google-maps-services-js';

const FindNearbyPlacesInputSchema = z.object({
  latitude: z.number().describe('The latitude of the search center.'),
  longitude: z.number().describe('The longitude of the search center.'),
  radius: z.number().describe('The search radius in meters.'),
  placeType: z.enum(['hospital', 'pharmacy']).describe('The type of place to search for.'),
});
export type FindNearbyPlacesInput = z.infer<typeof FindNearbyPlacesInputSchema>;

const NearbyPlaceSchema = z.object({
  placeId: z.string().describe('Google Maps Place ID.'),
  name: z.string().describe('Name of the place.'),
  type: z.enum(['hospital', 'pharmacy']).describe('The type of the place.'),
  lat: z.number().describe('Latitude of the place.'),
  lng: z.number().describe('Longitude of the place.'),
  rating: z.number().optional().describe('The rating of the place from 1 to 5.'),
  userRatingsTotal: z.number().optional().describe('Total number of user ratings.'),
  vicinity: z.string().optional().describe('The address or vicinity of the place.'),
  openingHours: z.object({ openNow: z.boolean() }).optional().describe('Opening hours information.'),
});
export type NearbyPlace = z.infer<typeof NearbyPlaceSchema>;

const mapsClient = new Client({});

export async function findNearbyPlaces(input: FindNearbyPlacesInput): Promise<NearbyPlace[]> {
    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
        throw new Error('Google Maps API key is not configured.');
    }

    try {
        const response = await mapsClient.placesNearby({
            params: {
                location: { lat: input.latitude, lng: input.longitude },
                radius: input.radius,
                type: input.placeType as PlaceType1,
                key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
            },
        });

        if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
            throw new Error(`Google Places API Error: ${response.data.status} - ${response.data.error_message || ''}`);
        }

        return response.data.results.map(place => ({
            placeId: place.place_id!,
            name: place.name!,
            type: input.placeType,
            lat: place.geometry!.location.lat,
            lng: place.geometry!.location.lng,
            rating: place.rating,
            userRatingsTotal: place.user_ratings_total,
            vicinity: place.vicinity,
            openingHours: place.opening_hours ? { openNow: place.opening_hours.open_now! } : undefined,
        }));

    } catch (error) {
        console.error('Error fetching from Google Places API:', error);
        if (error instanceof Error) {
            throw new Error(`Failed to fetch nearby places: ${error.message}`);
        }
        throw new Error('An unknown error occurred while fetching nearby places.');
    }
}

export const findNearbyPlacesTool = ai.defineTool(
    {
        name: 'findNearbyPlacesTool',
        description: 'Finds nearby hospitals or pharmacies based on geolocation.',
        inputSchema: FindNearbyPlacesInputSchema,
        outputSchema: z.array(NearbyPlaceSchema),
    },
    findNearbyPlaces
);
