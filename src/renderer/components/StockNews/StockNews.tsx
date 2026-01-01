import React from 'react';
import { useStockNews } from '../../hooks/useMarketData';
import './StockNews.css';

export default function StockNews() {
  const { newsData, loading } = useStockNews();

  if (loading) {
    return <div className="stock-news loading">Loading news...</div>;
  }

  if (!newsData || newsData.articles.length === 0) {
    return <div className="stock-news">No news available</div>;
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <div className="stock-news">
      <h2>Top Stock News</h2>
      <div className="news-list">
        {newsData.articles.map((article) => (
          <div key={article.id} className="news-card">
            <div className="news-header">
              <a href={article.url} target="_blank" rel="noopener noreferrer" className="news-headline">
                {article.headline}
              </a>
              <div className="news-meta">
                <span className="news-source">{article.source}</span>
                <span className="news-date">{formatDate(article.datetime)}</span>
              </div>
            </div>
            <div className="news-summary">{article.summary}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
