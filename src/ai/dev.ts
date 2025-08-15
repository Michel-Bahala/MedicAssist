import { config } from 'dotenv';
config();

import '@/ai/flows/first-aid-advice.ts';
import '@/ai/flows/analyze-symptoms.ts';
import '@/ai/flows/text-to-speech.ts';
import '@/ai/tools/find-nearby-places.ts';
