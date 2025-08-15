'use server';

import {
  analyzeSymptoms,
  AnalyzeSymptomsOutput,
} from '@/ai/flows/analyze-symptoms';
import {
  getFirstAidAdvice,
  FirstAidAdviceOutput,
} from '@/ai/flows/first-aid-advice';

export type MedicalAnalysis = {
  analysis: AnalyzeSymptomsOutput;
  advice: FirstAidAdviceOutput;
};

export async function getMedicalAnalysis(
  symptoms: string
): Promise<{ data?: MedicalAnalysis; error?: string }> {
  try {
    const analysis = await analyzeSymptoms({ symptoms });
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
      
    // The original symptoms string should be passed here.
    const advice = await getFirstAidAdvice({ symptoms: symptoms, suggestedConditions });

    return { data: { analysis, advice } };
  } catch (e) {
    console.error(e);
    return { error: 'An unexpected error occurred. Please try again later.' };
  }
}
