import React from 'react';
import { useMarketData } from '../../hooks/useMarketData';
import './SectorTable.css';

export default function SectorTable() {
  const { marketData, loading } = useMarketData();

  if (loading) {
    return <div className="sector-table loading">Loading sector data...</div>;
  }

  if (!marketData || !marketData.sectors) {
    return <div className="sector-table">No sector data available</div>;
  }

  const formatPercent = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  const getColorClass = (value: number) => {
    if (value > 0) return 'positive';
    if (value < 0) return 'negative';
    return 'neutral';
  };

  return (
    <div className="sector-table">
      <h2>Sector Performance</h2>
      <table>
        <thead>
          <tr>
            <th>Sector</th>
            <th>1 Day</th>
            <th>5 Days</th>
            <th>10 Days</th>
            <th>30 Days</th>
          </tr>
        </thead>
        <tbody>
          {marketData.sectors.map((sector) => (
            <tr key={sector.symbol}>
              <td className="sector-name">
                <span className="sector-symbol">{sector.symbol}</span>
                <span className="sector-full-name">{sector.name}</span>
              </td>
              <td className={getColorClass(sector.day1)}>{formatPercent(sector.day1)}</td>
              <td className={getColorClass(sector.day5)}>{formatPercent(sector.day5)}</td>
              <td className={getColorClass(sector.day10)}>{formatPercent(sector.day10)}</td>
              <td className={getColorClass(sector.day30)}>{formatPercent(sector.day30)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
