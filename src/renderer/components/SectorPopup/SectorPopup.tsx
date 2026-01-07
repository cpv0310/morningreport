import React from 'react';
import { SectorConstituentsData } from '../../types/market';

interface SectorPopupProps {
  data: SectorConstituentsData | null;
  position: { x: number; y: number };
  visible: boolean;
}

export default function SectorPopup({ data, position, visible }: SectorPopupProps) {
  if (!visible || !data) return null;

  return (
    <div
      className="fixed bg-card border-2 border-foreground rounded-lg p-4 shadow-xl z-[1000] min-w-[300px] pointer-events-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y - 10}px`,
        transform: 'translate(-50%, -100%)'
      }}
    >
      <h3 className="m-0 mb-3 text-base border-b border-border pb-2">{data.sectorName}</h3>

      {data.topPerformer && (
        <div className="mb-3">
          <span className="block text-xs text-muted-foreground mb-1">Top Performer:</span>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">{data.topPerformer.symbol}</span>
            <span className="text-xs text-muted-foreground flex-1 truncate">
              {data.topPerformer.holdingName}
            </span>
            <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400">
              +{data.topPerformer.changePercent?.toFixed(2)}%
            </span>
          </div>
        </div>
      )}

      {data.bottomPerformer && (
        <div className="mb-3">
          <span className="block text-xs text-muted-foreground mb-1">Bottom Performer:</span>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">{data.bottomPerformer.symbol}</span>
            <span className="text-xs text-muted-foreground flex-1 truncate">
              {data.bottomPerformer.holdingName}
            </span>
            <span className="font-bold text-sm text-red-600 dark:text-red-400">
              {data.bottomPerformer.changePercent?.toFixed(2)}%
            </span>
          </div>
        </div>
      )}

      <div className="text-xs text-center text-muted-foreground mt-4 pt-3 border-t border-border">
        Top {data.holdings.length} Holdings
      </div>
    </div>
  );
}
