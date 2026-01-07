import React from 'react';
import { useStockNews } from '../../hooks/useMarketData';
import { Card } from '@/components/ui/card';

export default function StockNews() {
  const { newsData, loading } = useStockNews();

  if (loading) {
    return (
      <Card className="p-5 mb-5">
        <div className="flex items-center justify-center text-muted-foreground italic">
          Loading news...
        </div>
      </Card>
    );
  }

  if (!newsData || newsData.articles.length === 0) {
    return (
      <Card className="p-5 mb-5">
        <div className="text-muted-foreground">No news available</div>
      </Card>
    );
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <Card className="p-5 mb-5">
      <h2 className="text-xl font-semibold mb-4">Top Stock News</h2>
      <div className="flex flex-col gap-4">
        {newsData.articles.map((article) => (
          <div key={article.id} className="p-4 rounded-md bg-muted border-l-4 border-l-blue-600">
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-base text-blue-600 dark:text-blue-400 hover:underline block mb-2"
            >
              {article.headline}
            </a>
            <div className="flex gap-4 text-xs text-muted-foreground mb-2">
              <span>{article.source}</span>
              <span>{formatDate(article.datetime)}</span>
            </div>
            <div className="text-sm text-foreground leading-relaxed">{article.summary}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}
