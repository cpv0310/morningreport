import React from 'react';
import { useEconomicEvents } from '../../hooks/useMarketData';
import { Card } from '@/components/ui/card';

export default function EconomicEvents() {
  const { eventData, loading } = useEconomicEvents();

  if (loading) {
    return (
      <Card className="p-5 mb-5">
        <div className="flex items-center justify-center text-muted-foreground italic">
          Loading events...
        </div>
      </Card>
    );
  }

  if (!eventData || eventData.events.length === 0) {
    return (
      <Card className="p-5 mb-5">
        <div className="text-muted-foreground">No economic events this month</div>
      </Card>
    );
  }

  const getImpactStyles = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'border-l-red-600 bg-red-50 dark:bg-red-950';
      case 'medium':
        return 'border-l-amber-500 bg-amber-50 dark:bg-amber-950';
      case 'low':
        return 'border-l-slate-500 bg-slate-50 dark:bg-slate-950';
      default:
        return 'border-l-slate-500 bg-slate-50 dark:bg-slate-950';
    }
  };

  return (
    <Card className="p-5 mb-5">
      <h2 className="text-xl font-semibold mb-4">Economic Events This Month</h2>
      <div className="flex flex-col gap-2.5">
        {eventData.events.map((event, index) => (
          <div key={index} className={`p-3 rounded-md border-l-4 ${getImpactStyles(event.impact)}`}>
            <div className="text-xs text-muted-foreground mb-1">
              {new Date(event.date).toLocaleDateString()}
            </div>
            <div className="font-semibold mb-1">{event.event}</div>
            <div className="text-xs text-muted-foreground/80 mb-1">{event.country}</div>
            {event.previous && (
              <div className="text-xs text-muted-foreground">Previous: {event.previous}</div>
            )}
            {event.estimate && (
              <div className="text-xs text-muted-foreground">Estimate: {event.estimate}</div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
