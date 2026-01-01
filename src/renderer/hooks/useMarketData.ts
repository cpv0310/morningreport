import { useState, useEffect } from 'react';
import { MarketData } from '../types/market';
import { EconomicCalendar } from '../types/events';
import { StockNewsData } from '../types/news';
import { WatchlistData } from '../types/watchlist';

export function useMarketData() {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = window.marketAPI.onMarketDataUpdated((data) => {
      setMarketData(data);
      setLoading(false);
    });

    const unsubscribeError = window.marketAPI.onFetchError((err) => {
      setError(err);
      setLoading(false);
    });

    window.marketAPI.fetchAllData();

    return () => {
      unsubscribe();
      unsubscribeError();
    };
  }, []);

  const refresh = () => {
    setLoading(true);
    setError(null);
    window.marketAPI.fetchAllData();
  };

  return { marketData, loading, error, refresh };
}

export function useEconomicEvents() {
  const [eventData, setEventData] = useState<EconomicCalendar | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = window.marketAPI.onEconomicEventsUpdated((data) => {
      setEventData(data);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { eventData, loading };
}

export function useStockNews() {
  const [newsData, setNewsData] = useState<StockNewsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = window.marketAPI.onStockNewsUpdated((data) => {
      setNewsData(data);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { newsData, loading };
}

export function useWatchlist() {
  const [watchlistData, setWatchlistData] = useState<WatchlistData | null>(null);
  const [tickers, setTickers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('morningreport_watchlist');
    const initialTickers = stored ? JSON.parse(stored) : ['AAPL', 'GOOGL', 'MSFT', 'TSLA'];
    setTickers(initialTickers);

    const unsubscribe = window.marketAPI.onWatchlistDataUpdated((data) => {
      setWatchlistData(data);
      setLoading(false);
    });

    window.marketAPI.fetchWatchlistData(initialTickers);

    return unsubscribe;
  }, []);

  const addStock = (ticker: string) => {
    const newTickers = [...tickers, ticker.toUpperCase()];
    setTickers(newTickers);
    localStorage.setItem('morningreport_watchlist', JSON.stringify(newTickers));
    window.marketAPI.addWatchlistStock(ticker);
    window.marketAPI.fetchWatchlistData(newTickers);
  };

  const removeStock = (ticker: string) => {
    const newTickers = tickers.filter(t => t !== ticker);
    setTickers(newTickers);
    localStorage.setItem('morningreport_watchlist', JSON.stringify(newTickers));
    window.marketAPI.removeWatchlistStock(ticker);
    window.marketAPI.fetchWatchlistData(newTickers);
  };

  return { watchlistData, tickers, loading, addStock, removeStock };
}
