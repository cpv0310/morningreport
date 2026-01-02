import React, { useState } from 'react';
import { useWatchlist } from '../../hooks/useMarketData';
import './Watchlist.css';

export default function Watchlist() {
  const { watchlistData, loading, addStock, removeStock } = useWatchlist();
  const [newTicker, setNewTicker] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const handleAddStock = () => {
    if (newTicker.trim()) {
      addStock(newTicker.trim());
      setNewTicker('');
      setShowAddModal(false);
    }
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
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
              placeholder="Enter ticker symbol (e.g., AAPL)"
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
            <th>Price</th>
            <th>Change</th>
            <th>Volume</th>
            <th>RSI (14)</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {watchlistData?.stocks.map((stock) => (
            <tr key={stock.symbol}>
              <td className="stock-symbol">{stock.symbol}</td>
              <td>{formatPrice(stock.currentPrice)}</td>
              <td className={stock.change >= 0 ? 'positive' : 'negative'}>
                {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
              </td>
              <td>{formatNumber(stock.volume)}</td>
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
