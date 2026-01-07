import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

export interface MarketAPI {
  onMarketDataUpdated: (callback: (data: any) => void) => () => void;
  onEconomicEventsUpdated: (callback: (data: any) => void) => () => void;
  onStockNewsUpdated: (callback: (data: any) => void) => () => void;
  onWatchlistDataUpdated: (callback: (data: any) => void) => () => void;
  onSectorConstituentsUpdated: (callback: (data: any) => void) => () => void;
  onWorldMarketsUpdated: (callback: (data: any) => void) => () => void;
  onFetchError: (callback: (error: string) => void) => () => void;
  fetchAllData: () => void;
  fetchWatchlistData: (tickers: string[]) => void;
  fetchSectorConstituents: (sectorSymbol: string) => void;
  addWatchlistStock: (ticker: string) => void;
  removeWatchlistStock: (ticker: string) => void;
}

const marketAPI: MarketAPI = {
  onMarketDataUpdated: (callback) => {
    const subscription = (_event: IpcRendererEvent, data: any) => callback(data);
    ipcRenderer.on('market-data:updated', subscription);
    return () => ipcRenderer.removeListener('market-data:updated', subscription);
  },
  onEconomicEventsUpdated: (callback) => {
    const subscription = (_event: IpcRendererEvent, data: any) => callback(data);
    ipcRenderer.on('economic-events:updated', subscription);
    return () => ipcRenderer.removeListener('economic-events:updated', subscription);
  },
  onStockNewsUpdated: (callback) => {
    const subscription = (_event: IpcRendererEvent, data: any) => callback(data);
    ipcRenderer.on('stock-news:updated', subscription);
    return () => ipcRenderer.removeListener('stock-news:updated', subscription);
  },
  onWatchlistDataUpdated: (callback) => {
    const subscription = (_event: IpcRendererEvent, data: any) => callback(data);
    ipcRenderer.on('watchlist-data:updated', subscription);
    return () => ipcRenderer.removeListener('watchlist-data:updated', subscription);
  },
  onSectorConstituentsUpdated: (callback) => {
    const subscription = (_event: IpcRendererEvent, data: any) => callback(data);
    ipcRenderer.on('sector-constituents:updated', subscription);
    return () => ipcRenderer.removeListener('sector-constituents:updated', subscription);
  },
  onWorldMarketsUpdated: (callback) => {
    const subscription = (_event: IpcRendererEvent, data: any) => callback(data);
    ipcRenderer.on('world-markets:updated', subscription);
    return () => ipcRenderer.removeListener('world-markets:updated', subscription);
  },
  onFetchError: (callback) => {
    const subscription = (_event: IpcRendererEvent, error: string) => callback(error);
    ipcRenderer.on('fetch-error', subscription);
    return () => ipcRenderer.removeListener('fetch-error', subscription);
  },
  fetchAllData: () => ipcRenderer.send('fetch-all-data'),
  fetchWatchlistData: (tickers: string[]) => ipcRenderer.send('fetch-watchlist-data', tickers),
  fetchSectorConstituents: (sectorSymbol: string) => ipcRenderer.send('fetch-sector-constituents', sectorSymbol),
  addWatchlistStock: (ticker: string) => ipcRenderer.send('add-watchlist-stock', ticker),
  removeWatchlistStock: (ticker: string) => ipcRenderer.send('remove-watchlist-stock', ticker)
};

contextBridge.exposeInMainWorld('marketAPI', marketAPI);
