import React from 'react';
import { useMarketData } from '../../hooks/useMarketData';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function SectorTable() {
  const { marketData, loading } = useMarketData();

  if (loading) {
    return (
      <Card className="p-5 mb-5">
        <div className="flex items-center justify-center text-muted-foreground italic">
          Loading sector data...
        </div>
      </Card>
    );
  }

  if (!marketData || !marketData.sectors) {
    return (
      <Card className="p-5 mb-5">
        <div className="text-muted-foreground">No sector data available</div>
      </Card>
    );
  }

  const formatPercent = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  const getColorClass = (value: number) => {
    if (value > 0) return 'text-positive';
    if (value < 0) return 'text-negative';
    return 'text-neutral';
  };

  return (
    <Card className="p-5 mb-5">
      <h2 className="text-xl font-semibold mb-4">Sector Performance</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sector</TableHead>
            <TableHead>1 Day</TableHead>
            <TableHead>5 Days</TableHead>
            <TableHead>10 Days</TableHead>
            <TableHead>30 Days</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {marketData.sectors.map((sector) => (
            <TableRow key={sector.symbol}>
              <TableCell>
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold text-sm">{sector.symbol}</span>
                  <span className="text-xs text-muted-foreground">{sector.name}</span>
                </div>
              </TableCell>
              <TableCell className={`font-semibold ${getColorClass(sector.day1)}`}>
                {formatPercent(sector.day1)}
              </TableCell>
              <TableCell className={`font-semibold ${getColorClass(sector.day5)}`}>
                {formatPercent(sector.day5)}
              </TableCell>
              <TableCell className={`font-semibold ${getColorClass(sector.day10)}`}>
                {formatPercent(sector.day10)}
              </TableCell>
              <TableCell className={`font-semibold ${getColorClass(sector.day30)}`}>
                {formatPercent(sector.day30)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
