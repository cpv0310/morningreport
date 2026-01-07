import React from 'react';
import { useWorldMarkets } from '../../hooks/useMarketData';
import BackgroundSparkLine from '../BackgroundSparkLine/BackgroundSparkLine';
import './WorldMarkets.css';

export default function WorldMarkets() {
  const { worldMarketsData, loading } = useWorldMarkets();

  if (loading) {
    return <div className="world-markets loading">Loading world markets...</div>;
  }

  if (!worldMarketsData || !worldMarketsData.indices) {
    return <div className="world-markets">No data available</div>;
  }

  return (
    <div className="world-markets">
      <h2>World Markets</h2>
      <div className="indices-list">
        {worldMarketsData.indices.map((index) => (
          <div key={index.symbol} className="market-index">
            <div className="index-header">
              <span className="index-name">{index.name}</span>
              <span className={`index-change ${index.change >= 0 ? 'positive' : 'negative'}`}>
                {index.change >= 0 ? '▲' : '▼'} {Math.abs(index.changePercent).toFixed(2)}%
              </span>
            </div>
            <div className="index-price-row">
              {index.priceHistory && index.priceHistory.length > 0 && (
                <BackgroundSparkLine
                  data={index.priceHistory}
                  color={index.change >= 0 ? '#28a745' : '#dc3545'}
                  opacity={0.8}
                />
              )}
              <span className="index-price">
                {index.currentPrice.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
