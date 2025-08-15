
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


export type MedicalAnalysis = {
  analysis: AnalyzeSymptomsOutput;
  advice: FirstAidAdviceOutput;
};

// This is a placeholder for a real email sending service
async function sendAnalysisByEmail(email: string, analysis: MedicalAnalysis) {
  console.log(`\n--- Pretend Email Sent ---`);
  console.log(`To: ${email}`);
  console.log(`Subject: Your MedicAssist Analysis Results`);
  console.log(`\nHi,\n\nHere are your recent analysis results:\n`);
  console.log(`Summary: ${analysis.analysis.summary}`);
  console.log(`\nFirst Aid Advice:\n${analysis.advice.advice}`);
  console.log(`\nDisclaimer: This is not a substitute for professional medical advice.`);
  console.log(`--- End of Pretend Email ---\n`);
  // In a real application, you would integrate a service like SendGrid, Resend, or Mailgun here.
  return Promise.resolve();
}

export async function getMedicalAnalysis(
  symptoms: string,
  language: 'en' | 'fr' | 'es' | 'de',
  imageDataUri?: string | null,
  patientEmail?: string | null,
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

    const medicalAnalysis = { analysis, advice };

    if (patientEmail) {
      await sendAnalysisByEmail(patientEmail, medicalAnalysis);
    }

    return { data: medicalAnalysis };
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

    