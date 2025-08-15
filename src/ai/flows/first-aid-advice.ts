
'use server';

/**
 * @fileOverview An AI agent that provides first aid advice based on symptoms.
 *
 * - getFirstAidAdvice - A function that generates first aid advice based on provided symptoms.
 * - FirstAidAdviceInput - The input type for the getFirstAidAdvice function.
 * - FirstAidAdviceOutput - The return type for the getFirstAidAdvice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FirstAidAdviceInputSchema = z.object({
  symptoms: z
    .string()
    .describe('A detailed description of the symptoms experienced by the user.'),
  suggestedConditions: z.string().describe('List of suggested conditions based on symptoms.'),
  language: z.enum(['en', 'fr']).describe('The language for the output.'),
});
export type FirstAidAdviceInput = z.infer<typeof FirstAidAdviceInputSchema>;

const FirstAidAdviceOutputSchema = z.object({
  advice: z
    .string()
    .describe('Actionable first aid advice tailored to the symptoms.'),
});
export type FirstAidAdviceOutput = z.infer<typeof FirstAidAdviceOutputSchema>;

export async function getFirstAidAdvice(input: FirstAidAdviceInput): Promise<FirstAidAdviceOutput> {
  return firstAidAdviceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'firstAidAdvicePrompt',
  input: {schema: FirstAidAdviceInputSchema},
  output: {schema: FirstAidAdviceOutputSchema},
  prompt: `You are a trained medical professional providing first aid advice.

  Based on the following symptoms and suggested conditions, provide immediate, actionable first aid advice. Be clear, concise, and focus on what the user can do before seeking professional medical help. Format advice as a numbered list.

  ALL RESPONSES MUST BE IN THIS LANGUAGE: {{{language}}}.

Symptoms: {{{symptoms}}}
Suggested Conditions: {{{suggestedConditions}}}`,
});

const firstAidAdviceFlow = ai.defineFlow(
  {
    name: 'firstAidAdviceFlow',
    inputSchema: FirstAidAdviceInputSchema,
    outputSchema: FirstAidAdviceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
