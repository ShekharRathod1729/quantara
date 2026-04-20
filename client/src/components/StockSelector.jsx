import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BiTrendingUp } from 'react-icons/bi';
import { FaCheckCircle, FaPlus } from 'react-icons/fa';
import StockLogo from './StockLogo';

const PRESET_STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.', logoUrl: 'https://financialmodelingprep.com/image-stock/AAPL.png' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', logoUrl: 'https://financialmodelingprep.com/image-stock/GOOGL.png' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', logoUrl: 'https://financialmodelingprep.com/image-stock/MSFT.png' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', logoUrl: 'https://financialmodelingprep.com/image-stock/AMZN.png' },
  { symbol: 'TSLA', name: 'Tesla Inc.', logoUrl: 'https://financialmodelingprep.com/image-stock/TSLA.png' },
  { symbol: 'META', name: 'Meta Platforms', logoUrl: 'https://financialmodelingprep.com/image-stock/META.png' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', logoUrl: 'https://financialmodelingprep.com/image-stock/NVDA.png' },
  { symbol: 'JPM', name: 'JPMorgan Chase', logoUrl: 'https://financialmodelingprep.com/image-stock/JPM.png' },
  { symbol: 'V', name: 'Visa Inc.', logoUrl: 'https://financialmodelingprep.com/image-stock/V.png' },
  { symbol: 'WMT', name: 'Walmart Inc.', logoUrl: 'https://financialmodelingprep.com/image-stock/WMT.png' },
  { symbol: 'DIS', name: 'Walt Disney Co.', logoUrl: 'https://financialmodelingprep.com/image-stock/DIS.png' },
  { symbol: 'NFLX', name: 'Netflix Inc.', logoUrl: 'https://financialmodelingprep.com/image-stock/NFLX.png' },
  { symbol: 'INTC', name: 'Intel Corp.', logoUrl: 'https://financialmodelingprep.com/image-stock/INTC.png' },
  { symbol: 'AMD', name: 'AMD Inc.', logoUrl: 'https://financialmodelingprep.com/image-stock/AMD.png' },
  { symbol: 'PYPL', name: 'PayPal Holdings', logoUrl: 'https://financialmodelingprep.com/image-stock/PYPL.png' },
  { symbol: 'CSCO', name: 'Cisco Systems', logoUrl: 'https://financialmodelingprep.com/image-stock/CSCO.png' },
  { symbol: 'BA', name: 'Boeing Co.', logoUrl: 'https://financialmodelingprep.com/image-stock/BA.png' },
  { symbol: 'NKE', name: 'Nike Inc.', logoUrl: 'https://financialmodelingprep.com/image-stock/NKE.png' },
  { symbol: 'CRM', name: 'Salesforce Inc.', logoUrl: 'https://financialmodelingprep.com/image-stock/CRM.png' },
  { symbol: 'ADBE', name: 'Adobe Inc.', logoUrl: 'https://financialmodelingprep.com/image-stock/ADBE.png' },
  { symbol: 'ORCL', name: 'Oracle Corp.', logoUrl: 'https://financialmodelingprep.com/image-stock/ORCL.png' },
  { symbol: 'PEP', name: 'PepsiCo Inc.', logoUrl: 'https://financialmodelingprep.com/image-stock/PEP.png' },
  { symbol: 'KO', name: 'Coca-Cola Co.', logoUrl: 'https://financialmodelingprep.com/image-stock/KO.png' },
];

/**
 * Props:
 *   multiple        - boolean, multi-select mode (for portfolio page)
 *   selected        - single mode: { symbol, name, logoUrl } | null
 *                     multi mode: [{ symbol, name, logoUrl }, ...]
 *   onSelect        - single mode: (stock) => void
 *                     multi mode: (stock) => void  (toggles selection)
 *   label           - optional header label override
 */
const StockSelector = ({ multiple = false, selected, onSelect, label }) => {
  const [customTicker, setCustomTicker] = useState('');
  const [customStocks, setCustomStocks] = useState([]);

  const allStocks = [...PRESET_STOCKS, ...customStocks];

  const isSelected = (stock) => {
    if (multiple) {
      return selected?.some((s) => s.symbol === stock.symbol);
    }
    return selected?.symbol === stock.symbol;
  };

  const handleAddCustom = () => {
    const ticker = customTicker.trim().toUpperCase();
    if (!ticker) return;
    if (allStocks.some((s) => s.symbol === ticker)) {
      // Already exists - just select it
      const existing = allStocks.find((s) => s.symbol === ticker);
      onSelect(existing);
      setCustomTicker('');
      return;
    }
    const newStock = { symbol: ticker, name: ticker, logoUrl: null };
    setCustomStocks((prev) => [...prev, newStock]);
    onSelect(newStock);
    setCustomTicker('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCustom();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
          <BiTrendingUp className="text-blue-600" size={16} />
          {label || (multiple ? 'Select Stocks for Portfolio' : 'Select Stock')}
          {multiple && selected?.length > 0 && (
            <span className="text-xs font-normal text-gray-500">({selected.length} selected)</span>
          )}
        </h3>

        {/* Custom ticker input */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={customTicker}
            onChange={(e) => setCustomTicker(e.target.value.toUpperCase())}
            onKeyDown={handleKeyDown}
            placeholder="Custom ticker"
            className="px-3 py-1.5 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none text-sm font-medium w-36 uppercase"
            maxLength={10}
          />
          <motion.button
            onClick={handleAddCustom}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={!customTicker.trim()}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium text-sm transition-colors ${
              customTicker.trim()
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <FaPlus size={10} />
            <span>Add</span>
          </motion.button>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-gray-100">
        {allStocks.map((stock) => {
          const sel = isSelected(stock);
          return (
            <motion.button
              key={stock.symbol}
              onClick={() => onSelect(stock)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex-shrink-0 p-3 rounded-xl border-2 transition-all duration-200 relative ${
                sel
                  ? 'border-blue-600 bg-blue-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-blue-300'
              }`}
            >
              {multiple && sel && (
                <div className="absolute -top-2 -right-2 bg-blue-600 text-white rounded-full p-1">
                  <FaCheckCircle size={12} />
                </div>
              )}
              <div className="flex flex-col items-center gap-1 w-16">
                <div className="w-10 h-10 flex items-center justify-center p-1 overflow-hidden">
                  <StockLogo symbol={stock.symbol} logoUrl={stock.logoUrl} />
                </div>
                <span className="text-xs font-bold text-gray-900 truncate w-full text-center">{stock.symbol}</span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export { PRESET_STOCKS };
export default StockSelector;
