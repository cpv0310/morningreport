export interface WatchlistItem {
  symbol: string;
  name?: string;
  currentPrice: number;
  previousClose: number;
  volume: number;
  change: number;
  changePercent: number;
}

export interface WatchlistData {
  stocks: WatchlistItem[];
  lastUpdated: Date;
}
