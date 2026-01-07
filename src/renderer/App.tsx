import React from 'react';
import SectorHeatMap from './components/SectorHeatMap/SectorHeatMap';
import StockNews from './components/StockNews/StockNews';
import Watchlist from './components/Watchlist/Watchlist';
import WorldMarkets from './components/WorldMarkets/WorldMarkets';
import { useMarketData } from './hooks/useMarketData';
import { ThemeProvider } from './components/ThemeProvider';
import { ThemeToggle } from './components/ThemeToggle';
import { Button } from '@/components/ui/button';
import './styles/global.css';

export default function App() {
  const { marketData, loading, error, refresh } = useMarketData();

  const formatLastUpdated = () => {
    if (!marketData?.lastUpdated) return 'Never';
    return new Date(marketData.lastUpdated).toLocaleString();
  };

  return (
    <ThemeProvider defaultTheme="light" storageKey="morningreport-ui-theme">
      <div className="flex flex-col h-screen bg-background">
        <header className="bg-slate-900 dark:bg-slate-950 text-white px-8 py-5 flex justify-between items-center shadow-md">
          <h1 className="text-2xl font-semibold m-0">Morning Stock Market Report</h1>
          <div className="flex items-center gap-5">
            <span className="text-sm text-slate-300">Last updated: {formatLastUpdated()}</span>
            <ThemeToggle />
            <Button onClick={refresh} disabled={loading} variant="default">
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
          </div>
        </header>

        {error && (
          <div className="bg-destructive text-destructive-foreground py-4 px-8 text-center">
            Error: {error}
          </div>
        )}

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-5 p-5 overflow-y-auto">
          <div className="flex flex-col">
            <Watchlist />
            <WorldMarkets />
          </div>
          <div className="flex flex-col">
            <SectorHeatMap />
            <StockNews />
          </div>
        </div>

        <footer className="bg-slate-900 dark:bg-slate-950 text-slate-400 py-4 px-8 text-center">
          <p className="text-xs m-0">Data provided by Finnhub</p>
        </footer>
      </div>
    </ThemeProvider>
  );
}
