import React, { useState } from 'react';
import { useWatchlist } from '../../hooks/useMarketData';
import SparkLine from '../SparkLine/SparkLine';
import BackgroundSparkLine from '../BackgroundSparkLine/BackgroundSparkLine';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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
    return (
      <Card className="p-5 mb-5">
        <div className="flex items-center justify-center text-muted-foreground italic">
          Loading watchlist...
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-5 mb-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold m-0">My Watchlist</h2>
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogTrigger asChild>
            <Button>+ Add Stock</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Stock to Watchlist</DialogTitle>
            </DialogHeader>
            <Input
              placeholder="Enter ticker symbols separated by spaces (e.g., AAPL MSFT GOOGL)"
              value={newTicker}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTicker(e.target.value.toUpperCase())}
              onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleAddStock()}
              autoFocus
            />
            <div className="flex gap-2 justify-end mt-4">
              <Button onClick={handleAddStock}>Add</Button>
              <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Symbol</TableHead>
            <TableHead>Price (Change)</TableHead>
            <TableHead>Volume (5d)</TableHead>
            <TableHead>RSI (14)</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {watchlistData?.stocks.map((stock) => (
            <TableRow key={stock.symbol}>
              <TableCell className="font-semibold">
                <a
                  href={`https://www.tradingview.com/symbols/${stock.symbol}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {stock.symbol}
                </a>
              </TableCell>
              <TableCell className="relative overflow-hidden h-[35px] min-w-[150px] align-middle text-center">
                {stock.priceHistory && stock.priceHistory.length > 0 && (
                  <BackgroundSparkLine
                    data={stock.priceHistory}
                    color={stock.change >= 0 ? '#10b981' : '#ef4444'}
                    opacity={0.8}
                  />
                )}
                <span className="relative z-10 inline-block py-1 px-2 bg-white/90 dark:bg-slate-900/90 rounded font-semibold text-xs">
                  <span className="mr-2">{formatPrice(stock.currentPrice)}</span>
                  <span className={stock.change >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>
                    ({stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                  </span>
                </span>
              </TableCell>
              <TableCell>
                <SparkLine data={stock.volumeHistory || []} width={60} height={20} />
              </TableCell>
              <TableCell className={`font-semibold ${
                stock.rsi === undefined ? '' :
                stock.rsi > 70 ? 'text-red-600 dark:text-red-400' :
                stock.rsi < 30 ? 'text-emerald-600 dark:text-emerald-400' :
                'text-slate-500 dark:text-slate-400'
              }`}>
                {stock.rsi !== undefined ? stock.rsi.toFixed(2) : '-'}
              </TableCell>
              <TableCell>
                <Button
                  variant="destructive"
                  size="icon"
                  className="rounded-full h-6 w-6 text-base"
                  onClick={() => removeStock(stock.symbol)}
                >
                  ×
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
