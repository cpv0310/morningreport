import React from 'react';
import SectorHeatMap from './components/SectorHeatMap/SectorHeatMap';
import StockNews from './components/StockNews/StockNews';
import Watchlist from './components/Watchlist/Watchlist';
import { useMarketData } from './hooks/useMarketData';
import './styles/App.css';

export default function App() {
  const { marketData, loading, error, refresh } = useMarketData();

  const formatLastUpdated = () => {
    if (!marketData?.lastUpdated) return 'Never';
    return new Date(marketData.lastUpdated).toLocaleString();
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Morning Stock Market Report</h1>
        <div className="header-controls">
          <span className="last-updated">Last updated: {formatLastUpdated()}</span>
          <button className="refresh-button" onClick={refresh} disabled={loading}>
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </header>

      {error && (
        <div className="error-banner">
          Error: {error}
        </div>
      )}

      <div className="app-content">
        <div className="left-column">
          <StockNews />
        </div>
        <div className="right-column">
          <SectorHeatMap />
          <Watchlist />
        </div>
      </div>

      <footer className="app-footer">
        <p>Data provided by Finnhub</p>
      </footer>
    </div>
  );
}
