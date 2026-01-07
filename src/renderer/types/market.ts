export interface ETFConstituent {
  symbol: string;
  holdingName: string;
  holdingPercent: number;
  currentPrice?: number;
  change?: number;
  changePercent?: number;
}

export interface SectorConstituentsData {
  sectorSymbol: string;
  sectorName: string;
  holdings: ETFConstituent[];
  topPerformer?: ETFConstituent;
  bottomPerformer?: ETFConstituent;
  lastUpdated: Date;
}

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

export interface WorldMarketIndex {
  symbol: string;
  name: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  priceHistory?: number[];
}

export interface WorldMarketsData {
  indices: WorldMarketIndex[];
  lastUpdated: Date;
}
