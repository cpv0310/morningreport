import React from 'react';
import { useMarketData } from '../../hooks/useMarketData';
import './SectorHeatMap.css';

export default function SectorHeatMap() {
  const { marketData, loading } = useMarketData();

  if (loading) {
    return <div className="sector-heatmap loading">Loading sector data...</div>;
  }

  if (!marketData || !marketData.sectors) {
    return <div className="sector-heatmap">No sector data available</div>;
  }

  const getColor = (performance: number): string => {
    // Normalize performance to a 0-1 scale (assuming -5% to +5% range)
    const normalized = Math.max(-5, Math.min(5, performance));
    const ratio = (normalized + 5) / 10; // Convert -5 to +5 range to 0 to 1

    if (performance >= 0) {
      // Green shades for positive
      const intensity = Math.min(ratio * 2 - 1, 1) * 100;
      return `hsl(120, 70%, ${50 - intensity * 20}%)`;
    } else {
      // Red shades for negative
      const intensity = (1 - ratio * 2) * 100;
      return `hsl(0, 70%, ${50 - intensity * 20}%)`;
    }
  };

  const getSize = (marketCap: number, allMarketCaps: number[]): number => {
    const maxCap = Math.max(...allMarketCaps);
    const minCap = Math.min(...allMarketCaps);
    const range = maxCap - minCap;

    if (range === 0) return 100;

    // Size between 80 and 200 (relative units)
    const normalizedSize = ((marketCap - minCap) / range);
    return 80 + normalizedSize * 120;
  };

  const formatPercent = (value: number): string => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  const allMarketCaps = marketData.sectors.map(s => s.marketCap || 0).filter(cap => cap > 0);
  const sectors = marketData.sectors.filter(s => !['SPY', 'QQQ', 'DIA', 'IWM'].includes(s.symbol));

  return (
    <div className="sector-heatmap">
      <h2>Sector Performance Heat Map</h2>
      <div className="heatmap-container">
        {sectors.map((sector) => {
          const size = getSize(sector.marketCap || 0, allMarketCaps);
          const color = getColor(sector.day1);

          return (
            <div
              key={sector.symbol}
              className="heatmap-cell"
              style={{
                backgroundColor: color,
                width: `${size}px`,
                height: `${size}px`,
                flexGrow: sector.marketCap || 1
              }}
              title={`${sector.name}: ${formatPercent(sector.day1)}`}
            >
              <div className="cell-content">
                <span className="cell-symbol">{sector.symbol}</span>
                <span className="cell-performance">{formatPercent(sector.day1)}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="heatmap-legend">
        <span className="legend-label">Daily Performance:</span>
        <div className="legend-gradient">
          <span className="legend-min">-5%</span>
          <span className="legend-zero">0%</span>
          <span className="legend-max">+5%</span>
        </div>
      </div>
    </div>
  );
}
