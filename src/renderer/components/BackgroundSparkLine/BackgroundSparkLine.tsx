import React from 'react';
import './BackgroundSparkLine.css';

interface BackgroundSparkLineProps {
  data: number[];
  color?: string;
  opacity?: number;
}

export default function BackgroundSparkLine({
  data,
  color = '#007bff',
  opacity = 0.6
}: BackgroundSparkLineProps) {
  console.log('BackgroundSparkLine rendering with data:', data);

  if (!data || data.length === 0) {
    console.log('BackgroundSparkLine: No data provided');
    return null;
  }

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min;

  if (range === 0) {
    console.log('BackgroundSparkLine: Range is 0, all values are the same');
    return null; // Don't render if all values are the same
  }

  console.log(`BackgroundSparkLine: Rendering with ${data.length} points, range: ${min} - ${max}`);

  const width = 100;
  const height = 100;
  const padding = 5;
  const availableHeight = height - padding * 2;
  const availableWidth = width - padding * 2;
  const stepX = availableWidth / (data.length - 1);

  // Build path points
  const pathPoints: string[] = [];

  data.forEach((value, index) => {
    const x = padding + index * stepX;
    const normalizedValue = (value - min) / range;
    const y = padding + availableHeight - normalizedValue * availableHeight;
    pathPoints.push(`${x},${y}`);
  });

  // Create line path
  const linePath = `M ${pathPoints.join(' L ')}`;

  // Create filled area path
  const firstX = padding;
  const lastX = padding + (data.length - 1) * stepX;
  const bottomY = height - padding;
  const areaPath = `M ${firstX},${bottomY} L ${pathPoints.join(' L ')} L ${lastX},${bottomY} Z`;

  return (
    <svg
      className="background-sparkline"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
    >
      {/* Filled area */}
      <path
        d={areaPath}
        fill={color}
        opacity={opacity * 0.3}
      />
      {/* Line */}
      <path
        d={linePath}
        stroke={color}
        strokeWidth="4"
        fill="none"
        opacity={opacity}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
