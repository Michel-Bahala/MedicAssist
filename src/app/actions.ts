
'use server';

import {
  analyzeSymptoms,
  AnalyzeSymptomsOutput,
  AnalyzeSymptomsInput,
} from '@/ai/flows/analyze-symptoms';
import {
  getFirstAidAdvice,
  FirstAidAdviceOutput,
  FirstAidAdviceInput,
} from '@/ai/flows/first-aid-advice';
import { generateAudio, GenerateAudioInput } from '@/ai/flows/text-to-speech';
import { findNearbyPlaces, NearbyPlace, FindNearbyPlacesInput, findNearbyPlacesTool } from '@/ai/tools/find-nearby-places';


export type MedicalAnalysis = {
  analysis: AnalyzeSymptomsOutput;
  advice: FirstAidAdviceOutput;
};

export async function getMedicalAnalysis(
  symptoms: string,
  language: 'en' | 'fr',
  imageDataUri?: string | null
): Promise<{ data?: MedicalAnalysis; error?: string }> {
  try {
    const analysisInput: AnalyzeSymptomsInput = { 
      symptoms, 
      photoDataUri: imageDataUri,
      language,
    };
    const analysis = await analyzeSymptoms(analysisInput);
    if (
      !analysis ||
      !analysis.possibleConditions ||
      analysis.possibleConditions.length === 0
    ) {
      return {
        error:
          'Could not analyze symptoms. The model returned an empty result. Please try rephrasing.',
      };
    }

    const suggestedConditions = analysis.possibleConditions
      .map((c) => c.condition)
      .join(', ');
      
    const adviceInput: FirstAidAdviceInput = { 
      symptoms: symptoms, 
      suggestedConditions,
      language,
    };
    const advice = await getFirstAidAdvice(adviceInput);

    return { data: { analysis, advice } };
  } catch (e) {
    console.error(e);
    return { error: 'An unexpected error occurred. Please try again later.' };
  }
}

export async function getAudioForText(
  text: string
): Promise<{ data?: string; error?: string }> {
  try {
    const input: GenerateAudioInput = { textToSpeak: text };
    const result = await generateAudio(input);
    if (!result || !result.audioDataUri) {
      return { error: 'Failed to generate audio.' };
    }
    return { data: result.audioDataUri };
  } catch (e) {
    console.error(e);
    return { error: 'An unexpected error occurred while generating audio.' };
  }
}

export async function getNearbyMedicalPlaces(
  location: { lat: number; lng: number }
): Promise<{ data?: NearbyPlace[]; error?: string }> {
  try {
    const input: FindNearbyPlacesInput = {
      latitude: location.lat,
      longitude: location.lng,
      radius: 5000,
    };
    const hospitals = await findNearbyPlaces({ ...input, placeType: 'hospital' });
    const pharmacies = await findNearbyPlaces({ ...input, placeType: 'pharmacy' });
    
    const combinedPlaces = [...hospitals, ...pharmacies];

    // Sort by rating descending and remove duplicates
    const uniquePlaces = Array.from(new Map(combinedPlaces.map(p => [p.placeId, p])).values());
    uniquePlaces.sort((a, b) => (b.rating || 0) - (a.rating || 0));

    return { data: uniquePlaces };
  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred.';
    return { error: `Failed to find nearby places: ${errorMessage}` };
  }
}
    
