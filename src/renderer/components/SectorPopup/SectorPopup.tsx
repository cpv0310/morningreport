import React from 'react';
import { SectorConstituentsData } from '../../types/market';
import './SectorPopup.css';

interface SectorPopupProps {
  data: SectorConstituentsData | null;
  position: { x: number; y: number };
  visible: boolean;
}

export default function SectorPopup({ data, position, visible }: SectorPopupProps) {
  if (!visible || !data) return null;

  return (
    <div
      className="sector-popup"
      style={{
        left: `${position.x}px`,
        top: `${position.y - 10}px`,
        transform: 'translate(-50%, -100%)'
      }}
    >
      <h3>{data.sectorName}</h3>

      {data.topPerformer && (
        <div className="performer top-performer">
          <span className="label">Top Performer:</span>
          <div className="stock-info">
            <span className="symbol">{data.topPerformer.symbol}</span>
            <span className="name">{data.topPerformer.holdingName}</span>
            <span className="change positive">
              +{data.topPerformer.changePercent?.toFixed(2)}%
            </span>
          </div>
        </div>
      )}

      {data.bottomPerformer && (
        <div className="performer bottom-performer">
          <span className="label">Bottom Performer:</span>
          <div className="stock-info">
            <span className="symbol">{data.bottomPerformer.symbol}</span>
            <span className="name">{data.bottomPerformer.holdingName}</span>
            <span className="change negative">
              {data.bottomPerformer.changePercent?.toFixed(2)}%
            </span>
          </div>
        </div>
      )}

      <div className="holdings-summary">
        Top {data.holdings.length} Holdings
      </div>
    </div>
  );
}
