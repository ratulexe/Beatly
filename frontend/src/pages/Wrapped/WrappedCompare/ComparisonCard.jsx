import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const ComparisonCard = ({ title, currentValue, previousValue, unit, isPositiveGood = true }) => {
  const diff = currentValue - previousValue;
  const percentChange = previousValue === 0 ? 100 : Math.round((diff / previousValue) * 100);
  
  const isPositive = diff > 0;
  const isNeutral = diff === 0;
  
  const isGood = isNeutral ? null : isPositive === isPositiveGood;

  return (
    <div className="glass-panel p-6 flex flex-col gap-4 rounded-2xl">
      <h3 className="text-beatly-text-muted text-sm font-bold uppercase tracking-wider">{title}</h3>
      <div className="flex items-end justify-between">
        <div>
          <span className="text-3xl font-extrabold text-white">{typeof currentValue === 'number' ? currentValue.toLocaleString() : currentValue}</span>
          {unit && <span className="text-beatly-text-muted ml-1">{unit}</span>}
        </div>
        <div className={`flex items-center gap-1 text-sm font-bold px-2 py-1 rounded-full ${isNeutral ? 'bg-gray-500/20 text-gray-400' : isGood ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          {isNeutral ? (
            <Minus size={16} />
          ) : isPositive ? (
            <TrendingUp size={16} />
          ) : (
            <TrendingDown size={16} />
          )}
          <span>{isNeutral ? '0%' : `${Math.abs(percentChange)}%`}</span>
        </div>
      </div>
      <div className="text-xs text-beatly-text-muted">
        Compared to {typeof previousValue === 'number' ? previousValue.toLocaleString() : previousValue} {unit} last year
      </div>
    </div>
  );
};

export default ComparisonCard;
