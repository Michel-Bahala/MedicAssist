
// /src/app/api/analyze/route.ts
import {
  analyzeSymptoms,
  AnalyzeSymptomsInput,
  AnalyzeSymptomsOutput,
} from '@/ai/flows/analyze-symptoms';
import {
  getFirstAidAdvice,
  FirstAidAdviceInput,
  FirstAidAdviceOutput,
} from '@/ai/flows/first-aid-advice';
import { NextRequest, NextResponse } from 'next/server';


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


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { symptoms, language, imageDataUri, patientEmail } = body;

    if (!symptoms || !language) {
      return NextResponse.json({ error: 'Missing required fields: symptoms, language' }, { status: 400 });
    }

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
      return NextResponse.json({
        error: 'Could not analyze symptoms. The model returned an empty result. Please try rephrasing.',
      }, { status: 500 });
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
    
    return NextResponse.json(medicalAnalysis);
  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred.';
    return NextResponse.json({ error: `An unexpected error occurred. Please try again later. Details: ${errorMessage}` }, { status: 500 });
  }
}
