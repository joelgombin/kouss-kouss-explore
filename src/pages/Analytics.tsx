import { AnalyticsPanel } from '@/components/AnalyticsPanel';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const Analytics = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="flex items-center gap-2 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
        </div>

        {/* Panel Analytics */}
        <AnalyticsPanel />
      </div>
    </div>
  );
};

export default Analytics;
