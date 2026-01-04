import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useMarketData } from '../../hooks/useMarketData';
import './SectorHeatMap.css';

export default function SectorHeatMap() {
  const { marketData, loading } = useMarketData();
  const svgRef = useRef<SVGSVGElement>(null);

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
      .on('mouseover', function() {
        d3.select(this)
          .attr('stroke', '#000')
          .attr('stroke-width', 3);
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('stroke', '#fff')
          .attr('stroke-width', 2);
      })
      .append('title')
      .text((d: any) => `${d.data.fullName}\n${d.data.performance >= 0 ? '+' : ''}${d.data.performance.toFixed(2)}%`);

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
    return <div className="sector-heatmap loading">Loading sector data...</div>;
  }

  if (!marketData || !marketData.sectors) {
    return <div className="sector-heatmap">No sector data available</div>;
  }

  return (
    <div className="sector-heatmap">
      <h2>Sector Performance Heat Map</h2>
      <div className="heatmap-container-d3">
        <svg ref={svgRef}></svg>
      </div>
      <div className="heatmap-legend">
        <span className="legend-label">Daily Performance:</span>
        <div className="legend-gradient">
          <span className="legend-min">-1%</span>
          <span className="legend-zero">0%</span>
          <span className="legend-max">+1%</span>
        </div>
      </div>
    </div>
  );
}
