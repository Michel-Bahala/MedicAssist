import type { AnalyzeSymptomsOutput } from '@/ai/flows/analyze-symptoms';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useTranslation } from '@/context/language-context';

interface AnalysisResultsProps {
  analysis: AnalyzeSymptomsOutput;
}

export function AnalysisResults({ analysis }: AnalysisResultsProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">{t('analysisResults.summaryTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground">{analysis.summary}</p>
        </CardContent>
      </Card>
      
      <div className="space-y-4">
        <h3 className="font-headline text-2xl text-primary">{t('analysisResults.possibleConditionsTitle')}</h3>
        {analysis.possibleConditions.map((condition, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>{condition.condition}</CardTitle>
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
