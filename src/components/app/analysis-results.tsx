
import type { AnalyzeSymptomsOutput } from '@/ai/flows/analyze-symptoms';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useTranslation } from '@/context/language-context';
import { Button } from '../ui/button';
import { Volume2, LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface AnalysisResultsProps {
  analysis: AnalyzeSymptomsOutput;
}

const AudioPlayer = ({ textToSpeak }: { textToSpeak: string }) => {
    const [audioSrc, setAudioSrc] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const { t } = useTranslation();

    const handlePlayAudio = async () => {
        if (audioSrc) {
            const audio = new Audio(audioSrc);
            audio.play();
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('/api/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ textToSpeak }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate audio');
            }

            const result = await response.json();
            setAudioSrc(result.audioDataUri);
            const audio = new Audio(result.audioDataUri);
            audio.play();

        } catch (error: any) {
             toast({
                variant: 'destructive',
                title: t('audio.generationFailed'),
                description: error.message,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button onClick={handlePlayAudio} disabled={isLoading} size="icon" variant="ghost" className="h-7 w-7">
            {isLoading ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <Volume2 className="h-5 w-5" />}
            <span className="sr-only">{t('audio.readAloud')}</span>
        </Button>
    );
};

export function AnalysisResults({ analysis }: AnalysisResultsProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center justify-between">
            {t('analysisResults.summaryTitle')}
            <AudioPlayer textToSpeak={analysis.summary} />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground">{analysis.summary}</p>
        </CardContent>
      </Card>
      
      {analysis.imageAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl flex items-center justify-between">
              {t('analysisResults.imageAnalysisTitle')}
               <AudioPlayer textToSpeak={analysis.imageAnalysis} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground">{analysis.imageAnalysis}</p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <h3 className="font-headline text-2xl text-primary">{t('analysisResults.possibleConditionsTitle')}</h3>
        {analysis.possibleConditions.map((condition, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                 {condition.condition}
                 <AudioPlayer textToSpeak={`${condition.condition}. Confidence: ${Math.round(condition.confidenceScore * 100)}%. Explanation: ${condition.explanation}`} />
              </CardTitle>
              <CardDescription>{t('analysisResults.confidence')}: {Math.round(condition.confidenceScore * 100)}%</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Progress value={condition.confidenceScore * 100} className="h-2" />
              <p className="text-sm text-muted-foreground pt-2">{condition.explanation}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
