export interface SectorData {
  symbol: string;
  name: string;
  day1: number;
  day5: number;
  day10: number;
  day30: number;
  marketCap?: number;
}

export interface StockQuote {
  symbol: string;
  currentPrice: number;
  previousClose: number;
  volume: number;
  change: number;
  changePercent: number;
}

export interface MarketData {
  sectors: SectorData[];
  lastUpdated: Date;
}
