import { MarketAPI } from '../main/preload';

declare global {
  interface Window {
    marketAPI: MarketAPI;
  }
}

export {};
