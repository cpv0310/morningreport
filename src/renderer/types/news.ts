export interface NewsArticle {
  id: number;
  headline: string;
  summary: string;
  source: string;
  url: string;
  datetime: number;
  image?: string;
  related?: string;
}

export interface StockNewsData {
  articles: NewsArticle[];
  lastUpdated: Date;
}
