import type { FirstAidAdviceOutput } from '@/ai/flows/first-aid-advice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LifeBuoy } from 'lucide-react';

interface FirstAidAdviceProps {
  advice: FirstAidAdviceOutput;
}

export function FirstAidAdvice({ advice }: FirstAidAdviceProps) {
  const adviceList = advice.advice
    .split('\n')
    .map(item => item.trim().replace(/^\d+\.\s*/, ''))
    .filter(item => item.length > 0);

  return (
    <Card className="bg-secondary border-primary">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-3">
          <LifeBuoy className="h-7 w-7 text-primary" />
          Immediate First Aid Advice
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
