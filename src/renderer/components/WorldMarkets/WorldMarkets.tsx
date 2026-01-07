import React from 'react';
import { useWorldMarkets } from '../../hooks/useMarketData';
import BackgroundSparkLine from '../BackgroundSparkLine/BackgroundSparkLine';
import { Card } from '@/components/ui/card';

export default function WorldMarkets() {
  const { worldMarketsData, loading } = useWorldMarkets();

  if (loading) {
    return (
      <Card className="p-5 mb-5">
        <div className="flex items-center justify-center text-muted-foreground italic">
          Loading world markets...
        </div>
      </Card>
    );
  }

  if (!worldMarketsData || !worldMarketsData.indices) {
    return (
      <Card className="p-5 mb-5">
        <div className="text-muted-foreground">No data available</div>
      </Card>
    );
  }

  return (
    <Card className="p-5 mb-5">
      <h2 className="text-lg font-semibold mb-4">World Markets</h2>
      <div className="flex flex-col gap-3">
        {worldMarketsData.indices.map((index) => (
          <div key={index.symbol} className="border rounded-md p-3 transition-shadow hover:shadow-md">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-sm">{index.name}</span>
              <span
                className={`text-xs font-semibold flex items-center gap-1 ${
                  index.change >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                }`}
              >
                {index.change >= 0 ? '▲' : '▼'} {Math.abs(index.changePercent).toFixed(2)}%
              </span>
            </div>
            <div className="relative min-h-[20px] flex items-center">
              {index.priceHistory && index.priceHistory.length > 0 && (
                <BackgroundSparkLine
                  data={index.priceHistory}
                  color={index.change >= 0 ? '#10b981' : '#ef4444'}
                  opacity={0.8}
                />
              )}
              <span className="relative z-10 text-sm font-bold">
                {index.currentPrice.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
