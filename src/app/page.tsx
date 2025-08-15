import { Header } from '@/components/app/header';
import { SymptomAnalyzer } from '@/components/app/symptom-analyzer';
import { NearbyLocations } from '@/components/app/nearby-locations';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          <div className="lg:col-span-3">
            <SymptomAnalyzer />
          </div>
          <div className="lg:col-span-2 lg:sticky top-8">
            <NearbyLocations />
          </div>
        </div>
      </main>
      <footer className="text-center p-4 text-xs text-muted-foreground">
        <p>MedicAssist is for informational purposes only and does not constitute medical advice, diagnosis, or treatment.</p>
        <p>&copy; {new Date().getFullYear()} MedicAssist. All rights reserved.</p>
      </footer>
    </div>
  );
}
