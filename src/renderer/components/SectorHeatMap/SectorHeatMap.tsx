import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useMarketData } from '../../hooks/useMarketData';
import { SectorConstituentsData } from '../../types/market';
import SectorPopup from '../SectorPopup/SectorPopup';
import { Card } from '@/components/ui/card';

export default function SectorHeatMap() {
  const { marketData, loading } = useMarketData();
  const svgRef = useRef<SVGSVGElement>(null);
  const [popupData, setPopupData] = useState<SectorConstituentsData | null>(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [popupVisible, setPopupVisible] = useState(false);
  const [hoveredSector, setHoveredSector] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = window.marketAPI.onSectorConstituentsUpdated((result) => {
      if (result.sectorSymbol === hoveredSector) {
        setPopupData(result.data);
        setPopupVisible(true);
      }
    });

    return unsubscribe;
  }, [hoveredSector]);

  useEffect(() => {
    if (!marketData || !marketData.sectors || !svgRef.current) return;

    // Filter out index ETFs, keep only sector ETFs
    const sectors = marketData.sectors.filter(
      s => !['SPY', 'QQQ', 'DIA', 'IWM'].includes(s.symbol)
    );

    if (sectors.length === 0) return;

    // Clear previous visualization
    d3.select(svgRef.current).selectAll('*').remove();

    // Set up dimensions
    const width = svgRef.current.clientWidth || 800;
    const height = svgRef.current.clientHeight || 800;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Prepare data for D3 hierarchy
    const hierarchyData = {
      name: 'sectors',
      children: sectors.map(sector => ({
        name: sector.symbol,
        fullName: sector.name,
        value: sector.marketCap || 1000000000, // Use market cap for size
        performance: sector.day1,
        marketCap: sector.marketCap
      }))
    };

    // Create hierarchy
    const root = d3.hierarchy(hierarchyData)
      .sum((d: any) => d.value || 0)
      .sort((a, b) => ((b.value as any) || 0) - ((a.value as any) || 0));

    // Create treemap layout
    const treemap = d3.treemap()
      .size([width, height])
      .paddingInner(2)
      .paddingOuter(2)
      .round(true);

    treemap(root as any);

    // Color scale
    const colorScale = d3.scaleLinear<string>()
      .domain([-1, 0, 1])
      .range(['#dc3545', '#f8f9fa', '#28a745'])
      .clamp(true);

    // Create cells
    const cell = svg.selectAll('g')
      .data(root.leaves() as any[])
      .enter()
      .append('g')
      .attr('transform', (d: any) => `translate(${d.x0},${d.y0})`);

    // Add rectangles
    cell.append('rect')
      .attr('width', (d: any) => d.x1 - d.x0)
      .attr('height', (d: any) => d.y1 - d.y0)
      .attr('fill', (d: any) => colorScale(d.data.performance))
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .attr('rx', 4)
      .style('cursor', 'pointer')
      .on('mouseover', function(_event: any, d: any) {
        const rect = (this as SVGRectElement).getBoundingClientRect();
        setPopupPosition({
          x: rect.left + rect.width / 2,
          y: rect.top
        });
        setHoveredSector(d.data.name);
        window.marketAPI.fetchSectorConstituents(d.data.name);

        d3.select(this)
          .attr('stroke', '#000')
          .attr('stroke-width', 3);
      })
      .on('mouseout', function() {
        setPopupVisible(false);
        setPopupData(null);
        setHoveredSector(null);

        d3.select(this)
          .attr('stroke', '#fff')
          .attr('stroke-width', 2);
      });

    // Add text - symbol
    cell.append('text')
      .attr('x', (d: any) => (d.x1 - d.x0) / 2)
      .attr('y', (d: any) => (d.y1 - d.y0) / 2 - 8)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .style('font-size', (d: any) => {
        const area = (d.x1 - d.x0) * (d.y1 - d.y0);
        return `${Math.min(20, Math.max(12, Math.sqrt(area) / 8))}px`;
      })
      .style('font-weight', 'bold')
      .style('fill', '#fff')
      .style('text-shadow', '0 1px 2px rgba(0,0,0,0.8)')
      .style('pointer-events', 'none')
      .text((d: any) => d.data.name);

    // Add text - performance
    cell.append('text')
      .attr('x', (d: any) => (d.x1 - d.x0) / 2)
      .attr('y', (d: any) => (d.y1 - d.y0) / 2 + 12)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .style('font-size', (d: any) => {
        const area = (d.x1 - d.x0) * (d.y1 - d.y0);
        return `${Math.min(16, Math.max(10, Math.sqrt(area) / 10))}px`;
      })
      .style('font-weight', '600')
      .style('fill', '#fff')
      .style('text-shadow', '0 1px 2px rgba(0,0,0,0.8)')
      .style('pointer-events', 'none')
      .text((d: any) => `${d.data.performance >= 0 ? '+' : ''}${d.data.performance.toFixed(2)}%`);

  }, [marketData]);

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

  return (
    <Card className="p-5 mb-5">
      <h2 className="text-xl font-semibold mb-5">Sector Performance Heat Map</h2>
      <div className="w-full h-[800px]">
        <svg ref={svgRef} className="block w-full h-full"></svg>
      </div>
      <div className="flex items-center justify-center gap-4 mt-5 pt-4 border-t border-border">
        <span className="text-sm font-semibold text-foreground">Daily Performance:</span>
        <div className="flex items-center gap-2 relative px-2">
          <span className="text-xs">-1%</span>
          <div
            className="w-48 h-4 rounded"
            style={{
              background: 'linear-gradient(to right, #dc3545, #f8f9fa, #28a745)'
            }}
          ></div>
          <span className="text-xs">+1%</span>
        </div>
      </div>
      <SectorPopup
        data={popupData}
        position={popupPosition}
        visible={popupVisible}
      />
    </Card>
  );
}
