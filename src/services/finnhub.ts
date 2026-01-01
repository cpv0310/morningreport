import https from 'https';
import { SectorData } from '../renderer/types/market';
import { EconomicEvent } from '../renderer/types/events';
import { NewsArticle } from '../renderer/types/news';
import { WatchlistItem } from '../renderer/types/watchlist';

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || 'YOUR_API_KEY_HERE';
const BASE_URL = 'https://finnhub.io/api/v1';

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

function makeRequest(endpoint: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}token=${FINNHUB_API_KEY}`;

    https.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            reject(new Error(parsed.error));
          } else {
            resolve(parsed);
          }
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function getSectorPerformance(): Promise<SectorData[]> {
  const now = Math.floor(Date.now() / 1000);
  const day30Ago = now - (30 * 24 * 60 * 60);

  const results: SectorData[] = [];

  for (const sector of SECTOR_ETFS) {
    try {
      const currentQuote: any = await makeRequest(`/quote?symbol=${sector.symbol}`);
      await delay(1000);

      const candles: any = await makeRequest(
        `/stock/candle?symbol=${sector.symbol}&resolution=D&from=${day30Ago}&to=${now}`
      );
      await delay(1000);

      if (candles.c && candles.c.length > 0) {
        const currentPrice = currentQuote.c || candles.c[candles.c.length - 1];
        const closePrices = candles.c;

        const getReturn = (daysAgo: number): number => {
          if (closePrices.length < daysAgo) return 0;
          const pastPrice = closePrices[closePrices.length - 1 - daysAgo];
          return ((currentPrice - pastPrice) / pastPrice) * 100;
        };

        results.push({
          symbol: sector.symbol,
          name: sector.name,
          day1: getReturn(1),
          day5: getReturn(5),
          day10: getReturn(10),
          day30: getReturn(30)
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
        day30: 0
      });
    }
  }

  return results;
}

export async function getStockQuotes(symbols: string[]): Promise<WatchlistItem[]> {
  const results: WatchlistItem[] = [];

  for (const symbol of symbols) {
    try {
      const quote: any = await makeRequest(`/quote?symbol=${symbol}`);
      await delay(1000);

      results.push({
        symbol,
        currentPrice: quote.c || 0,
        previousClose: quote.pc || 0,
        volume: quote.v || 0,
        change: quote.d || 0,
        changePercent: quote.dp || 0
      });
    } catch (error) {
      console.error(`Error fetching quote for ${symbol}:`, error);
      results.push({
        symbol,
        currentPrice: 0,
        previousClose: 0,
        volume: 0,
        change: 0,
        changePercent: 0
      });
    }
  }

  return results;
}

export async function getEconomicEvents(): Promise<EconomicEvent[]> {
  try {
    const now = new Date();
    const endOfWeek = new Date(now);
    endOfWeek.setDate(now.getDate() + (7 - now.getDay()));

    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    const data: any = await makeRequest(
      `/calendar/economic?from=${formatDate(now)}&to=${formatDate(endOfWeek)}`
    );

    if (data.economicCalendar && Array.isArray(data.economicCalendar)) {
      return data.economicCalendar.map((event: any) => ({
        date: event.time,
        country: event.country || 'US',
        event: event.event,
        impact: event.impact || 'medium',
        actual: event.actual,
        estimate: event.estimate,
        previous: event.previous
      }));
    }

    return [];
  } catch (error) {
    console.error('Error fetching economic events:', error);
    return [];
  }
}

export async function getMarketNews(): Promise<NewsArticle[]> {
  try {
    const data: any = await makeRequest('/news?category=general');

    if (Array.isArray(data)) {
      return data.slice(0, 10).map((article: any) => ({
        id: article.id,
        headline: article.headline,
        summary: article.summary,
        source: article.source,
        url: article.url,
        datetime: article.datetime,
        image: article.image,
        related: article.related
      }));
    }

    return [];
  } catch (error) {
    console.error('Error fetching market news:', error);
    return [];
  }
}
