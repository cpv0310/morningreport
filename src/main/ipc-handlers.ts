import { ipcMain, BrowserWindow } from 'electron';
import { getSectorPerformance, getStockQuotes, getMarketNews, getETFConstituents, getWorldMarkets } from '../services/yahoo-finance';
import { getEconomicEvents } from '../services/fmp';
import { cache } from '../services/cache';

const CACHE_TTL = {
  SECTORS: 24 * 60 * 60 * 1000,
  EVENTS: 24 * 60 * 60 * 1000,
  NEWS: 60 * 60 * 1000,
  WATCHLIST: 5 * 60 * 1000,
  CONSTITUENTS: 24 * 60 * 60 * 1000,
  WORLD_MARKETS: 5 * 60 * 1000
};

export function setupIpcHandlers(mainWindow: BrowserWindow): void {
  ipcMain.on('fetch-all-data', async () => {
    console.log('Fetching all market data...');

    try {
      let sectors = cache.get('sectors');
      if (!sectors) {
        console.log('Fetching sector performance...');
        sectors = await getSectorPerformance();
        cache.set('sectors', sectors, CACHE_TTL.SECTORS);
      }
      mainWindow.webContents.send('market-data:updated', {
        sectors,
        lastUpdated: new Date()
      });

      let events = cache.get('events');
      if (!events) {
        console.log('Fetching economic events...');
        events = await getEconomicEvents();
        cache.set('events', events, CACHE_TTL.EVENTS);
      }
      mainWindow.webContents.send('economic-events:updated', {
        events,
        lastUpdated: new Date()
      });

      let news = cache.get('news');
      if (!news) {
        console.log('Fetching market news...');
        news = await getMarketNews();
        cache.set('news', news, CACHE_TTL.NEWS);
      }
      mainWindow.webContents.send('stock-news:updated', {
        articles: news,
        lastUpdated: new Date()
      });

      let worldMarkets = cache.get('worldMarkets');
      if (!worldMarkets) {
        console.log('Fetching world markets...');
        worldMarkets = await getWorldMarkets();
        cache.set('worldMarkets', worldMarkets, CACHE_TTL.WORLD_MARKETS);
      }
      mainWindow.webContents.send('world-markets:updated', {
        indices: worldMarkets,
        lastUpdated: new Date()
      });

      console.log('All data fetched successfully');
    } catch (error) {
      console.error('Error fetching data:', error);
      mainWindow.webContents.send('fetch-error', (error as Error).message);
    }
  });

  ipcMain.on('fetch-watchlist-data', async (_event, tickers: string[]) => {
    console.log('Fetching watchlist data for:', tickers);

    try {
      const stocks = await getStockQuotes(tickers);
      mainWindow.webContents.send('watchlist-data:updated', {
        stocks,
        lastUpdated: new Date()
      });
    } catch (error) {
      console.error('Error fetching watchlist data:', error);
      mainWindow.webContents.send('fetch-error', (error as Error).message);
    }
  });

  ipcMain.on('add-watchlist-stock', (_event, ticker: string) => {
    console.log('Stock added to watchlist:', ticker);
  });

  ipcMain.on('remove-watchlist-stock', (_event, ticker: string) => {
    console.log('Stock removed from watchlist:', ticker);
  });

  ipcMain.on('fetch-sector-constituents', async (_event, sectorSymbol: string) => {
    console.log('Fetching constituents for:', sectorSymbol);

    try {
      const cacheKey = `sector_constituents_${sectorSymbol}`;
      let constituents = cache.get(cacheKey);

      if (!constituents) {
        console.log('Cache miss, fetching from API...');
        constituents = await getETFConstituents(sectorSymbol);
        cache.set(cacheKey, constituents, CACHE_TTL.CONSTITUENTS);
      }

      mainWindow.webContents.send('sector-constituents:updated', {
        sectorSymbol,
        data: constituents
      });
    } catch (error) {
      console.error('Error fetching sector constituents:', error);
      mainWindow.webContents.send('fetch-error', (error as Error).message);
    }
  });

  setTimeout(() => {
    mainWindow.webContents.send('fetch-all-data');
  }, 2000);
}
