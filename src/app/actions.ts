'use server';

import {
  analyzeSymptoms,
  AnalyzeSymptomsOutput,
} from '@/ai/flows/analyze-symptoms';
import {
  getFirstAidAdvice,
  FirstAidAdviceOutput,
} from '@/ai/flows/first-aid-advice';
import { generateAudio, GenerateAudioInput } from '@/ai/flows/text-to-speech';


export type MedicalAnalysis = {
  analysis: AnalyzeSymptomsOutput;
  advice: FirstAidAdviceOutput;
};

export async function getMedicalAnalysis(
  symptoms: string,
  imageDataUri?: string | null
): Promise<{ data?: MedicalAnalysis; error?: string }> {
  try {
    const analysis = await analyzeSymptoms({ symptoms, photoDataUri: imageDataUri });
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
      
    const advice = await getFirstAidAdvice({ symptoms: symptoms, suggestedConditions });

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
