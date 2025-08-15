
import type { FirstAidAdviceOutput } from '@/ai/flows/first-aid-advice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LifeBuoy, Volume2, LoaderCircle } from 'lucide-react';
import { useTranslation } from '@/context/language-context';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '../ui/button';

interface FirstAidAdviceProps {
  advice: FirstAidAdviceOutput;
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


export function FirstAidAdvice({ advice }: FirstAidAdviceProps) {
  const { t } = useTranslation();
  const adviceList = advice.advice
    .split('\n')
    .map(item => item.trim().replace(/^\d+\.\s*/, ''))
    .filter(item => item.length > 0);

  return (
    <Card className="bg-secondary border-primary">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LifeBuoy className="h-7 w-7 text-primary" />
              {t('firstAid.title')}
            </div>
            <AudioPlayer textToSpeak={advice.advice} />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3 list-decimal list-outside ml-5">
          {adviceList.map((item, index) => (
            <li key={index} className="pl-2">{item}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
