import YahooFinance from 'yahoo-finance2';
import { SectorData, ETFConstituent, SectorConstituentsData, WorldMarketIndex } from '../renderer/types/market';
import { EconomicEvent } from '../renderer/types/events';
import { NewsArticle } from '../renderer/types/news';
import { WatchlistItem } from '../renderer/types/watchlist';
import { subDays } from 'date-fns';
import { getMultipleStockRSI } from './tradingview-mcp';

const yahooFinance = new YahooFinance();

const SECTOR_ETFS = [
  { symbol: 'SPY', name: 'S&P 500' },
  { symbol: 'QQQ', name: 'Nasdaq 100' },
  { symbol: 'DIA', name: 'Dow Jones' },
  { symbol: 'IWM', name: 'Russell 2000' },
  { symbol: 'XLF', name: 'Financials' },
  { symbol: 'XLE', name: 'Energy' },
  { symbol: 'XLV', name: 'Healthcare' },
  { symbol: 'XLK', name: 'Technology' },
  { symbol: 'XLY', name: 'Consumer Discretionary' },
  { symbol: 'XLP', name: 'Consumer Staples' },
  { symbol: 'XLI', name: 'Industrials' }
];

const WORLD_INDICES = [
  { symbol: '^N225', name: 'Nikkei 225' },
  { symbol: '^NSEI', name: 'Nifty 50' },
  { symbol: '^SSEC', name: 'Shanghai' },
  { symbol: '^FTSE', name: 'FTSE 100' },
  { symbol: '^GDAXI', name: 'DAX' },
  { symbol: '^STOXX', name: 'STOXX 600' }
];

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function getSectorPerformance(): Promise<SectorData[]> {
  const results: SectorData[] = [];
  const now = new Date();

  for (const sector of SECTOR_ETFS) {
    try {
      // Get current quote
      const quote: any = await yahooFinance.quote(sector.symbol);
      await delay(500);

      // Get historical data for 30 days
      const endDate = now;
      const startDate = subDays(now, 35); // Get a bit more data to ensure we have enough trading days

      const historical: any = await yahooFinance.historical(sector.symbol, {
        period1: startDate,
        period2: endDate,
        interval: '1d'
      });
      await delay(500);

      if (historical && historical.length > 0 && quote.regularMarketPrice) {
        const currentPrice = quote.regularMarketPrice;
        const sortedData = historical.sort((a: any, b: any) => a.date.getTime() - b.date.getTime());

        const getReturn = (daysAgo: number): number => {
          if (sortedData.length < daysAgo + 1) return 0;
          const idx = Math.max(0, sortedData.length - 1 - daysAgo);
          const pastPrice = sortedData[idx].close;
          return ((currentPrice - pastPrice) / pastPrice) * 100;
        };

        results.push({
          symbol: sector.symbol,
          name: sector.name,
          day1: getReturn(1),
          day5: getReturn(5),
          day10: getReturn(10),
          day30: getReturn(30),
          marketCap: quote.marketCap || 0
        });
      }
    } catch (error) {
      console.error(`Error fetching data for ${sector.symbol}:`, error);
      results.push({
        symbol: sector.symbol,
        name: sector.name,
        day1: 0,
        day5: 0,
        day10: 0,
        day30: 0,
        marketCap: 0
      });
    }
  }

  return results;
}

export async function getStockQuotes(symbols: string[]): Promise<WatchlistItem[]> {
  const results: WatchlistItem[] = [];

  // Fetch RSI data for all symbols in parallel
  console.log('Fetching RSI data for watchlist...');
  const rsiData = await getMultipleStockRSI(symbols);
  console.log('RSI data fetched:', rsiData);

  for (const symbol of symbols) {
    try {
      const quote: any = await yahooFinance.quote(symbol);
      await delay(500);

      // Fetch last 5 days of volume data
      const startDate = subDays(new Date(), 7); // Get 7 days to ensure we have at least 5 trading days
      const endDate = new Date();

      let volumeHistory: number[] = [];
      let priceHistory: number[] = [];
      try {
        const historical: any = await yahooFinance.historical(symbol, {
          period1: startDate,
          period2: endDate,
          interval: '1d'
        });
        await delay(500);

        if (historical && historical.length > 0) {
          // Sort by date
          const sortedHistory = historical.sort((a: any, b: any) => a.date.getTime() - b.date.getTime());

          // Get last 5 days of volume
          volumeHistory = sortedHistory
            .slice(-5)
            .map((day: any) => day.volume || 0);

          // Get last 5 days of closing prices
          priceHistory = sortedHistory
            .slice(-5)
            .map((day: any) => day.close || 0);

          console.log(`Price history for ${symbol}:`, priceHistory);
        }
      } catch (histError) {
        console.error(`Error fetching history for ${symbol}:`, histError);
      }

      results.push({
        symbol,
        currentPrice: quote.regularMarketPrice || 0,
        previousClose: quote.regularMarketPreviousClose || 0,
        volume: quote.regularMarketVolume || 0,
        change: quote.regularMarketChange || 0,
        changePercent: quote.regularMarketChangePercent || 0,
        rsi: rsiData.get(symbol),
        volumeHistory,
        priceHistory
      });
    } catch (error) {
      console.error(`Error fetching quote for ${symbol}:`, error);
      results.push({
        symbol,
        currentPrice: 0,
        previousClose: 0,
        volume: 0,
        change: 0,
        changePercent: 0,
        rsi: rsiData.get(symbol),
        volumeHistory: [],
        priceHistory: []
      });
    }
  }

  return results;
}

export async function getEconomicEvents(): Promise<EconomicEvent[]> {
  // Yahoo Finance doesn't provide economic calendar
  // Return empty array for now
  console.log('Economic calendar not available with Yahoo Finance');
  return [];
}

export async function getMarketNews(): Promise<NewsArticle[]> {
  try {
    // Get news for major market index
    const newsItems: any = await yahooFinance.search('SPY', { newsCount: 10 });

    if (newsItems.news && Array.isArray(newsItems.news)) {
      return newsItems.news.slice(0, 10).map((article: any, index: number) => ({
        id: index,
        headline: article.title || '',
        summary: article.summary || article.title || '',
        source: article.publisher || 'Yahoo Finance',
        url: article.link || '',
        datetime: Math.floor(new Date(article.providerPublishTime * 1000).getTime() / 1000),
        image: article.thumbnail?.resolutions?.[0]?.url,
        related: article.relatedTickers?.join(', ')
      }));
    }

    return [];
  } catch (error) {
    console.error('Error fetching market news:', error);
    return [];
  }
}

export async function getETFConstituents(etfSymbol: string): Promise<SectorConstituentsData> {
  try {
    console.log(`Fetching constituents for ${etfSymbol}...`);

    // Step 1: Get ETF holdings using quoteSummary
    const summary: any = await yahooFinance.quoteSummary(etfSymbol, {
      modules: ['topHoldings']
    });

    if (!summary.topHoldings || !summary.topHoldings.holdings) {
      throw new Error(`No holdings data available for ${etfSymbol}`);
    }

    // Step 2: Extract top 10 holdings (or all if less than 10)
    const holdings = summary.topHoldings.holdings.slice(0, 10);
    const constituents: ETFConstituent[] = [];

    // Step 3: Fetch current quotes for all holdings
    for (const holding of holdings) {
      try {
        const quote: any = await yahooFinance.quote(holding.symbol);
        await delay(300); // Rate limiting

        constituents.push({
          symbol: holding.symbol,
          holdingName: holding.holdingName,
          holdingPercent: holding.holdingPercent * 100, // Convert to percentage
          currentPrice: quote.regularMarketPrice || 0,
          change: quote.regularMarketChange || 0,
          changePercent: quote.regularMarketChangePercent || 0
        });
      } catch (err) {
        console.error(`Error fetching quote for ${holding.symbol}:`, err);
        // Still add the holding with basic info
        constituents.push({
          symbol: holding.symbol,
          holdingName: holding.holdingName,
          holdingPercent: holding.holdingPercent * 100
        });
      }
    }

    // Step 4: Find top and bottom performers
    const validConstituents = constituents.filter(c => c.changePercent !== undefined);
    let topPerformer: ETFConstituent | undefined;
    let bottomPerformer: ETFConstituent | undefined;

    if (validConstituents.length > 0) {
      topPerformer = validConstituents.reduce((prev, current) =>
        (current.changePercent || 0) > (prev.changePercent || 0) ? current : prev
      );
      bottomPerformer = validConstituents.reduce((prev, current) =>
        (current.changePercent || 0) < (prev.changePercent || 0) ? current : prev
      );
    }

    return {
      sectorSymbol: etfSymbol,
      sectorName: SECTOR_ETFS.find(s => s.symbol === etfSymbol)?.name || etfSymbol,
      holdings: constituents,
      topPerformer,
      bottomPerformer,
      lastUpdated: new Date()
    };

  } catch (error) {
    console.error(`Error fetching constituents for ${etfSymbol}:`, error);
    throw error;
  }
}

export async function getWorldMarkets(): Promise<WorldMarketIndex[]> {
  const results: WorldMarketIndex[] = [];
  const startDate = subDays(new Date(), 7);
  const endDate = new Date();

  for (const index of WORLD_INDICES) {
    try {
      // Get current quote
      const quote: any = await yahooFinance.quote(index.symbol);
      await delay(500);

      // Get historical data for sparkline
      let priceHistory: number[] = [];
      try {
        const historical: any = await yahooFinance.historical(index.symbol, {
          period1: startDate,
          period2: endDate,
          interval: '1d'
        });
        await delay(500);

        if (historical && historical.length > 0) {
          const sortedHistory = historical.sort((a: any, b: any) =>
            a.date.getTime() - b.date.getTime()
          );
          priceHistory = sortedHistory.slice(-5).map((day: any) => day.close || 0);
        }
      } catch (histError) {
        console.error(`Error fetching history for ${index.symbol}:`, histError);
      }

      results.push({
        symbol: index.symbol,
        name: index.name,
        currentPrice: quote.regularMarketPrice || 0,
        change: quote.regularMarketChange || 0,
        changePercent: quote.regularMarketChangePercent || 0,
        priceHistory
      });

    } catch (error) {
      console.error(`Error fetching data for ${index.symbol}:`, error);
      results.push({
        symbol: index.symbol,
        name: index.name,
        currentPrice: 0,
        change: 0,
        changePercent: 0,
        priceHistory: []
      });
    }
  }

  return results;
}
