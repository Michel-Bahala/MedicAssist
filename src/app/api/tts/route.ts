
// /src/app/api/tts/route.ts
import { generateAudio, GenerateAudioInput } from '@/ai/flows/text-to-speech';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { textToSpeak } = body;

    if (!textToSpeak) {
      return NextResponse.json({ error: 'Missing required field: textToSpeak' }, { status: 400 });
    }

    const input: GenerateAudioInput = { textToSpeak };
    const result = await generateAudio(input);

    if (!result || !result.audioDataUri) {
      return NextResponse.json({ error: 'Failed to generate audio.' }, { status: 500 });
    }
    
    return NextResponse.json({ audioDataUri: result.audioDataUri });
  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred.';
    return NextResponse.json({ error: `An unexpected error occurred while generating audio. Details: ${errorMessage}` }, { status: 500 });
  }
}
