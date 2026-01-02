import React from 'react';
import './SparkLine.css';

interface SparkLineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}

export default function SparkLine({
  data,
  width = 100,
  height = 30,
  color = '#007bff'
}: SparkLineProps) {
  if (!data || data.length === 0) {
    return <div className="sparkline-empty">-</div>;
  }

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min;

  if (range === 0) {
    // All values are the same, draw a flat line
    return (
      <svg width={width} height={height} className="sparkline">
        <line
          x1="0"
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke={color}
          strokeWidth="2"
          fill="none"
        />
      </svg>
    );
  }

  // Calculate points for the polyline
  const padding = 2;
  const availableHeight = height - padding * 2;
  const availableWidth = width - padding * 2;
  const stepX = availableWidth / (data.length - 1);

  const points = data
    .map((value, index) => {
      const x = padding + index * stepX;
      const normalizedValue = (value - min) / range;
      const y = padding + availableHeight - normalizedValue * availableHeight;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} className="sparkline">
      <polyline
        points={points}
        stroke={color}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Add dots at each data point */}
      {data.map((value, index) => {
        const x = padding + index * stepX;
        const normalizedValue = (value - min) / range;
        const y = padding + availableHeight - normalizedValue * availableHeight;
        return (
          <circle
            key={index}
            cx={x}
            cy={y}
            r="2"
            fill={color}
          />
        );
      })}
    </svg>
  );
}
