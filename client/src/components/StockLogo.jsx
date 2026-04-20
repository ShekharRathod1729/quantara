import React, { useEffect, useState } from 'react';

const COLORS = [
  'bg-blue-600', 'bg-emerald-600', 'bg-purple-600', 'bg-rose-600',
  'bg-amber-600', 'bg-teal-600', 'bg-indigo-600', 'bg-pink-600',
  'bg-cyan-600', 'bg-orange-600', 'bg-violet-600', 'bg-sky-600',
];

const getColor = (symbol) => COLORS[(symbol.charCodeAt(0) + symbol.length) % COLORS.length];

const StockLogo = ({ symbol, logoUrl, size = 'w-10 h-10' }) => {
  const [sourceIdx, setSourceIdx] = useState(0);
  const sources = [
    logoUrl,
    `https://assets.parqet.com/logos/symbol/${symbol}`,
    `https://storage.googleapis.com/iex/api/logos/${symbol}.png`,
  ].filter(Boolean);

  useEffect(() => {
    setSourceIdx(0);
  }, [symbol, logoUrl]);

  if (sources.length === 0 || sourceIdx >= sources.length) {
    return (
      <div className={`${size} rounded-full ${getColor(symbol)} flex items-center justify-center`}>
        <span className="text-white font-bold text-xs">{symbol.slice(0, 2)}</span>
      </div>
    );
  }

  return (
    <img
      src={sources[sourceIdx]}
      alt={symbol}
      className={`${size} object-contain`}
      onError={() => setSourceIdx((idx) => idx + 1)}
    />
  );
};

export default StockLogo;
