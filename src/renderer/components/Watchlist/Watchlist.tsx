import React, { useState } from 'react';
import { useWatchlist } from '../../hooks/useMarketData';
import SparkLine from '../SparkLine/SparkLine';
import BackgroundSparkLine from '../BackgroundSparkLine/BackgroundSparkLine';
import './Watchlist.css';

export default function Watchlist() {
  const { watchlistData, loading, addStock, addMultipleStocks, removeStock } = useWatchlist();
  const [newTicker, setNewTicker] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const handleAddStock = () => {
    if (newTicker.trim()) {
      // Split by spaces and filter out empty strings
      const tickers = newTicker.trim().split(/\s+/).filter(t => t.length > 0);

      // Add stocks (single or multiple)
      if (tickers.length === 1) {
        addStock(tickers[0]);
      } else if (tickers.length > 1) {
        addMultipleStocks(tickers);
      }

      setNewTicker('');
      setShowAddModal(false);
    }
  };

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  if (loading) {
    return <div className="watchlist loading">Loading watchlist...</div>;
  }

  return (
    <div className="watchlist">
      <div className="watchlist-header">
        <h2>My Watchlist</h2>
        <button className="add-button" onClick={() => setShowAddModal(true)}>+ Add Stock</button>
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Add Stock to Watchlist</h3>
            <input
              type="text"
              placeholder="Enter ticker symbols separated by spaces (e.g., AAPL MSFT GOOGL)"
              value={newTicker}
              onChange={(e) => setNewTicker(e.target.value.toUpperCase())}
              onKeyPress={(e) => e.key === 'Enter' && handleAddStock()}
              autoFocus
            />
            <div className="modal-buttons">
              <button onClick={handleAddStock}>Add</button>
              <button onClick={() => setShowAddModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <table>
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Price (Change)</th>
            <th>Volume (5d)</th>
            <th>RSI (14)</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {watchlistData?.stocks.map((stock) => (
            <tr key={stock.symbol}>
              <td className="stock-symbol">
                <a
                  href={`https://www.tradingview.com/symbols/${stock.symbol}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ticker-link"
                >
                  {stock.symbol}
                </a>
              </td>
              <td className={`price-change-cell ${stock.change >= 0 ? 'positive' : 'negative'}`}>
                {stock.priceHistory && stock.priceHistory.length > 0 && (
                  <BackgroundSparkLine
                    data={stock.priceHistory}
                    color={stock.change >= 0 ? '#28a745' : '#dc3545'}
                    opacity={0.8}
                  />
                )}
                <span className="cell-value">
                  {formatPrice(stock.currentPrice)} ({stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                </span>
              </td>
              <td>
                <SparkLine data={stock.volumeHistory || []} width={100} height={30} />
              </td>
              <td className={
                stock.rsi === undefined ? '' :
                stock.rsi > 70 ? 'rsi-overbought' :
                stock.rsi < 30 ? 'rsi-oversold' :
                'rsi-neutral'
              }>
                {stock.rsi !== undefined ? stock.rsi.toFixed(2) : '-'}
              </td>
              <td>
                <button className="remove-button" onClick={() => removeStock(stock.symbol)}>×</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
