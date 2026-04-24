import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaChartLine, FaArrowLeft, FaSignOutAlt, FaDollarSign, FaFlag, FaRocket,
} from 'react-icons/fa';
import { MdHistory } from 'react-icons/md';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line,
} from 'recharts';
import StockSelector from '../components/StockSelector';
import StockLogo from '../components/StockLogo';
import Particles from 'react-particles';
import { loadFull } from 'tsparticles';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const SIMULATION_COUNTS = [100, 1000, 5000, 10000, 20000, 50000, 100000];
const PERIOD_COUNTS = [10, 25, 50, 100, 200, 500];

const PATH_COLORS = [
  '#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6',
  '#06b6d4','#ec4899','#84cc16','#f97316','#6366f1',
  '#14b8a6','#e11d48','#a3e635','#fb923c','#818cf8',
  '#2dd4bf','#f43f5e','#bef264','#fdba74','#a78bfa',
  '#67e8f9','#fda4af','#d9f99d','#fed7aa','#c4b5fd',
  '#a5f3fc','#fecdd3','#ecfccb','#ffedd5','#ede9fe',
];

const OptionPricing = () => {
  const navigate = useNavigate();
  const [optionStyle, setOptionStyle] = useState('european'); // 'european' | 'american'
  const [optionType, setOptionType] = useState('call');       // 'call' | 'put'
  const [selectedStock, setSelectedStock] = useState(null);
  const [maturityDate, setMaturityDate] = useState(null);
  const [strikePrice, setStrikePrice] = useState('');
  const [useMCS, setUseMCS] = useState(true);
  const [useBT, setUseBT] = useState(false);
  const [numSimIdx, setNumSimIdx] = useState(3);
  const [numPeriodsIdx, setNumPeriodsIdx] = useState(3);
  const [isCalculating, setIsCalculating] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [showResults, setShowResults] = useState(false);

  const particlesInit = async (main) => { await loadFull(main); };

  useEffect(() => {
    if (localStorage.getItem('isLoggedIn') !== 'true') navigate('/login');
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    navigate('/');
  };

  const isFutureBusinessDay = (date) => {
    const day = date.getDay();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return day !== 0 && day !== 6 && date > today;
  };

  // American put only allows BT; enforce this when style/type changes
  useEffect(() => {
    if (optionStyle === 'american' && optionType === 'put') {
      setUseMCS(false);
      setUseBT(true);
    }
  }, [optionStyle, optionType]);

  const isAmericanPut = optionStyle === 'american' && optionType === 'put';

  const handleCalculate = async () => {
    if (!selectedStock) { setError('Please select a stock'); return; }
    if (!maturityDate) { setError('Please select a maturity date'); return; }
    if (!strikePrice || parseFloat(strikePrice) <= 0) { setError('Please enter a valid strike price'); return; }
    if (!useMCS && !useBT) { setError('Please select at least one pricing method'); return; }

    setIsCalculating(true);
    setError(null);
    setResults(null);

    const formattedDate = maturityDate.toISOString().split('T')[0];

    try {
      const promises = [];

      // MCS (not available for American put)
      if (useMCS && !isAmericanPut) {
        promises.push(
          axios.post('http://127.0.0.1:5000/options/european/mcs', {
            ticker: selectedStock.symbol,
            maturity_date: formattedDate,
            strike_price: parseFloat(strikePrice),
            option_type: optionType,
            num_sim: SIMULATION_COUNTS[numSimIdx],
          }).then(r => ({ method: 'mcs', data: r.data }))
        );
      }

      // BT
      if (useBT) {
        if (isAmericanPut) {
          promises.push(
            axios.post('http://127.0.0.1:5000/options/american/put', {
              ticker: selectedStock.symbol,
              maturity_date: formattedDate,
              strike_price: parseFloat(strikePrice),
              num_periods: PERIOD_COUNTS[numPeriodsIdx],
            }).then(r => ({ method: 'bt_am_put', data: r.data }))
          );
        } else {
          promises.push(
            axios.post('http://127.0.0.1:5000/options/european/bt', {
              ticker: selectedStock.symbol,
              maturity_date: formattedDate,
              strike_price: parseFloat(strikePrice),
              option_type: optionType,
              num_periods: PERIOD_COUNTS[numPeriodsIdx],
            }).then(r => ({ method: 'bt', data: r.data }))
          );
        }
      }

      // Stock simulation for underlying visualization
      // Use same T as option maturity (business_days will be computed by the first successful promise)
      // We approximate t from maturity date
      const today = new Date();
      const msPerDay = 86400000;
      const calDays = Math.round((maturityDate - today) / msPerDay);
      const approxBizDays = Math.round(calDays * 252 / 365);

      promises.push(
        axios.post('http://127.0.0.1:5000/simul/stocks', {
          tickers: [selectedStock.symbol],
          weights: [1.0],
          num_sim: 1000,
          t: Math.max(1, approxBizDays),
        }).then(r => ({ method: 'stock_sim', data: r.data }))
      );

      const settled = await Promise.allSettled(promises);

      const compiled = {};
      settled.forEach(s => {
        if (s.status === 'fulfilled') {
          compiled[s.value.method] = s.value.data;
        }
      });

      if (!compiled.mcs && !compiled.bt && !compiled.bt_am_put) {
        throw new Error('Option pricing failed. Check inputs and try again.');
      }

      setResults(compiled);
      setShowResults(true);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to price option. Please try again.');
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 relative overflow-hidden">
      <Particles
        id="tsparticles-options"
        init={particlesInit}
        options={{
          particles: {
            number: { value: 15, density: { enable: true, value_area: 800 } },
            color: { value: '#3b82f6' },
            opacity: { value: 0.08, random: true, anim: { enable: true, speed: 1, opacity_min: 0.03, sync: false } },
            size: { value: 40, random: true, anim: { enable: true, speed: 2, size_min: 20, sync: false } },
            move: { enable: true, speed: 0.5, direction: 'none', random: true, straight: false, out_mode: 'out', bounce: false },
          },
          interactivity: { detect_on: 'canvas', events: { onhover: { enable: true, mode: 'grab' }, resize: true }, modes: { grab: { distance: 150, line_linked: { opacity: 0.15 } } } },
          retina_detect: true,
        }}
        style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}
      />

      <div className="relative z-10">
        <header className="backdrop-blur-md bg-white bg-opacity-90 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Link to="/"><h1 className="text-2xl font-bold text-blue-600 cursor-pointer hover:text-blue-700 transition-colors">QUANTARA</h1></Link>
              <div className="flex items-center gap-3">
                <Link to="/simulate"><motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm"><FaChartLine size={14} /><span>Simulator</span></motion.button></Link>
                <Link to="/options"><motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm"><FaDollarSign size={14} /><span>Option Pricing</span></motion.button></Link>
                <Link to="/testing"><motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm"><MdHistory size={14} /><span>Testing</span></motion.button></Link>
                <motion.button onClick={handleLogout} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm shadow-sm"><FaSignOutAlt size={14} /><span>Logout</span></motion.button>
              </div>
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {!showResults ? (
            <SelectionScreen
              key="selection"
              optionStyle={optionStyle} setOptionStyle={setOptionStyle}
              optionType={optionType} setOptionType={setOptionType}
              selectedStock={selectedStock} setSelectedStock={setSelectedStock}
              maturityDate={maturityDate} setMaturityDate={setMaturityDate}
              strikePrice={strikePrice} setStrikePrice={setStrikePrice}
              useMCS={useMCS} setUseMCS={setUseMCS}
              useBT={useBT} setUseBT={setUseBT}
              numSimIdx={numSimIdx} setNumSimIdx={setNumSimIdx}
              numPeriodsIdx={numPeriodsIdx} setNumPeriodsIdx={setNumPeriodsIdx}
              isCalculating={isCalculating}
              error={error}
              handleCalculate={handleCalculate}
              isFutureBusinessDay={isFutureBusinessDay}
              isAmericanPut={isAmericanPut}
            />
          ) : (
            <ResultsScreen
              key="results"
              results={results}
              selectedStock={selectedStock}
              optionStyle={optionStyle}
              optionType={optionType}
              strikePrice={strikePrice}
              numSimIdx={numSimIdx}
              numPeriodsIdx={numPeriodsIdx}
              onBack={() => { setShowResults(false); setResults(null); setError(null); }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const SelectionScreen = ({
  optionStyle, setOptionStyle, optionType, setOptionType,
  selectedStock, setSelectedStock,
  maturityDate, setMaturityDate, strikePrice, setStrikePrice,
  useMCS, setUseMCS, useBT, setUseBT,
  numSimIdx, setNumSimIdx, numPeriodsIdx, setNumPeriodsIdx,
  isCalculating, error, handleCalculate, isFutureBusinessDay, isAmericanPut,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col"
    >
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <FaDollarSign className="text-blue-600" size={20} />Option Pricing
      </h2>

      {/* Stock Selection */}
      <div className="mb-4">
        <StockSelector selected={selectedStock} onSelect={setSelectedStock} />
      </div>

      {/* Style + Type toggles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <h3 className="text-sm font-bold text-gray-700 mb-2">Option Style</h3>
          <div className="flex gap-3">
            {[{ key: 'european', label: 'European' }, { key: 'american', label: 'American' }].map(s => (
              <motion.button key={s.key} onClick={() => setOptionStyle(s.key)}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className={`px-5 py-2.5 rounded-lg border-2 font-medium text-sm transition-all duration-200 ${optionStyle === s.key ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-200 bg-white hover:border-blue-300 text-gray-700'}`}>
                {s.label}
              </motion.button>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-700 mb-2">Option Type</h3>
          <div className="flex gap-3">
            {['call', 'put'].map(t => (
              <motion.button key={t} onClick={() => setOptionType(t)}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className={`px-5 py-2.5 rounded-lg border-2 font-medium text-sm capitalize transition-all duration-200 ${
                  optionType === t
                    ? t === 'call' ? 'border-green-500 bg-green-50 text-green-600' : 'border-red-500 bg-red-50 text-red-600'
                    : 'border-gray-200 bg-white hover:border-blue-300 text-gray-700'
                }`}>
                {t}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* American put note */}
      {isAmericanPut && (
        <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-800">
          <span className="font-semibold">American Put</span> is priced using Binomial Tree only.
        </div>
      )}
      {optionStyle === 'american' && optionType === 'call' && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
          <span className="font-semibold">American Call</span> = European Call (no early exercise premium for non-dividend stocks).
        </div>
      )}

      {/* Pricing Methods */}
      <div className="mb-4">
        <h3 className="text-sm font-bold text-gray-700 mb-2">Pricing Method{isAmericanPut ? '' : 's'}</h3>
        {isAmericanPut ? (
          <div className="flex items-center gap-2 px-5 py-2.5 rounded-lg border-2 border-blue-600 bg-blue-50 text-blue-600 font-medium text-sm w-fit">
            Binomial Tree (only)
          </div>
        ) : (
          <div className="flex gap-3">
            {[{ key: 'mcs', label: 'Monte Carlo Simulation', state: useMCS, setState: setUseMCS },
              { key: 'bt', label: 'Binomial Tree', state: useBT, setState: setUseBT }].map(m => (
              <motion.button key={m.key} onClick={() => m.setState(!m.state)}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg border-2 font-medium text-sm transition-all duration-200 ${
                  m.state ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-200 bg-white hover:border-blue-300 text-gray-700'
                }`}>
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${m.state ? 'border-blue-600 bg-blue-600' : 'border-gray-400'}`}>
                  {m.state && <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 12 12"><path d="M1 6l3.5 3.5L11 2" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                {m.label}
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
        {/* Maturity Date */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-900 mb-2">Maturity Date</h3>
          <DatePicker selected={maturityDate} onChange={setMaturityDate}
            minDate={new Date(Date.now() + 86400000)} filterDate={isFutureBusinessDay}
            placeholderText="Select maturity date"
            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none text-center font-medium text-sm"
            dateFormat="MMMM d, yyyy" />
          {maturityDate && (
            <div className="text-center p-2 bg-blue-50 rounded-lg mt-2">
              <p className="text-xs text-gray-600">Maturity</p>
              <p className="text-sm font-bold text-blue-600">{maturityDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
            </div>
          )}
        </div>

        {/* Strike Price */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-900 mb-2">Strike Price ($)</h3>
          <input type="number" step="0.01" min="0" value={strikePrice}
            onChange={e => setStrikePrice(e.target.value)}
            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none text-center font-bold text-lg"
            placeholder="e.g. 200" />
        </div>

        {/* MCS count (if MCS selected) */}
        {(useMCS && !isAmericanPut) && (
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
              <FaRocket className="text-blue-600" size={12} />Monte Carlo Simulations
            </h3>
            <input type="range" min="0" max={SIMULATION_COUNTS.length - 1} value={numSimIdx}
              onChange={e => setNumSimIdx(parseInt(e.target.value))}
              className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600" />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              {SIMULATION_COUNTS.map((c, i) => (
                <span key={c} className={i === numSimIdx ? 'font-bold text-blue-600' : ''}>{c >= 1000 ? `${c / 1000}k` : c}</span>
              ))}
            </div>
            <div className="text-center p-2 bg-blue-50 rounded-lg mt-2">
              <span className="text-lg font-bold text-blue-600">{SIMULATION_COUNTS[numSimIdx].toLocaleString()}</span>
              <p className="text-xs text-gray-600">simulations</p>
            </div>
          </div>
        )}

        {/* BT periods (if BT selected or american put) */}
        {(useBT || isAmericanPut) && (
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 mb-2">Time Periods (N)</h3>
            <input type="range" min="0" max={PERIOD_COUNTS.length - 1} value={numPeriodsIdx}
              onChange={e => setNumPeriodsIdx(parseInt(e.target.value))}
              className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600" />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              {PERIOD_COUNTS.map((c, i) => (
                <span key={c} className={i === numPeriodsIdx ? 'font-bold text-blue-600' : ''}>{c}</span>
              ))}
            </div>
            <div className="text-center p-2 bg-blue-50 rounded-lg mt-2">
              <span className="text-lg font-bold text-blue-600">{PERIOD_COUNTS[numPeriodsIdx]}</span>
              <p className="text-xs text-gray-600">periods</p>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center text-sm">{error}</motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-center mt-2">
        <motion.button onClick={handleCalculate}
          disabled={isCalculating || !selectedStock || !maturityDate || !strikePrice}
          whileHover={{ scale: isCalculating || !selectedStock || !maturityDate || !strikePrice ? 1 : 1.05 }}
          whileTap={{ scale: isCalculating || !selectedStock || !maturityDate || !strikePrice ? 1 : 0.95 }}
          className={`px-10 py-3 rounded-xl font-bold text-base transition-all duration-300 flex items-center gap-3 ${
            isCalculating || !selectedStock || !maturityDate || !strikePrice
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl'
          }`}
        >
          {isCalculating ? (
            <><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" /><span>Calculating...</span></>
          ) : (
            <><FaDollarSign /><span>Price Option</span></>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};

const ResultsScreen = ({ results, selectedStock, optionStyle, optionType, strikePrice, numSimIdx, numPeriodsIdx, onBack }) => {
  const mcs = results?.mcs;
  const bt = results?.bt;
  const btAmPut = results?.bt_am_put;
  const stockSim = results?.stock_sim;

  const isAmericanPut = optionStyle === 'american' && optionType === 'put';
  const styleName = `${optionStyle.charAt(0).toUpperCase()}${optionStyle.slice(1)} ${optionType.charAt(0).toUpperCase()}${optionType.slice(1)}`;

  const getPayoffHistogram = (payoffs) => {
    if (!payoffs?.length) return [];
    const min = Math.min(...payoffs);
    const max = Math.max(...payoffs);
    if (min === max) return [{ label: `$${min.toFixed(2)}`, count: payoffs.length }];
    const binCount = 30;
    const binSize = (max - min) / binCount;
    const bins = Array.from({ length: binCount }, () => 0);
    payoffs.forEach(v => { bins[Math.min(Math.floor((v - min) / binSize), binCount - 1)]++; });
    return bins.map((count, i) => {
      const low = min + i * binSize;
      return { label: `${low.toFixed(2)} – ${(low + binSize).toFixed(2)}`, count };
    });
  };

  const getTerminalHistogram = (terminal) => {
    if (!terminal?.length) return [];
    const min = Math.min(...terminal);
    const max = Math.max(...terminal);
    if (min === max) return [{ label: `$${min.toFixed(2)}`, count: terminal.length }];
    const binCount = 30;
    const binSize = (max - min) / binCount;
    const bins = Array.from({ length: binCount }, () => 0);
    terminal.forEach(v => { bins[Math.min(Math.floor((v - min) / binSize), binCount - 1)]++; });
    return bins.map((count, i) => {
      const low = min + i * binSize;
      return { label: `${low.toFixed(2)} – ${(low + binSize).toFixed(2)}`, count };
    });
  };

  const payoffHistData = mcs ? getPayoffHistogram(mcs.payoffs) : [];
  const payoffMaxCount = payoffHistData.length ? Math.max(...payoffHistData.map(d => d.count)) : 1;

  const stockTerminalData = stockSim ? getTerminalHistogram(stockSim.terminal) : [];
  const stockMaxCount = stockTerminalData.length ? Math.max(...stockTerminalData.map(d => d.count)) : 1;

  const stockPaths = stockSim?.paths ?? [];
  const pathChartData = stockPaths.map((row, t) => {
    const point = { t };
    row.forEach((val, i) => { point[`p${i}`] = parseFloat(val.toFixed(2)); });
    return point;
  });
  const numDisplayPaths = stockPaths[0]?.length ?? 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
    >
      {/* Header */}
      <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-center gap-3 mb-4">
          <StockLogo symbol={selectedStock.symbol} logoUrl={selectedStock.logoUrl} size="w-10 h-10" />
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900">{selectedStock.symbol} — {selectedStock.name}</h2>
            <p className="text-sm text-gray-600">{styleName} Option</p>
          </div>
        </div>

        {/* Option Prices */}
        <div className={`grid gap-4 ${mcs && (bt || btAmPut) ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {mcs && (
            <div className="text-center p-5 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
              <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Option Price (Monte Carlo)</p>
              <p className="text-4xl font-bold text-blue-600">${mcs.price.toFixed(4)}</p>
              <p className="text-xs text-gray-500 mt-1">{SIMULATION_COUNTS[numSimIdx].toLocaleString()} simulations</p>
            </div>
          )}
          {(bt || btAmPut) && (
            <div className="text-center p-5 bg-gradient-to-r from-green-50 to-green-100 rounded-xl">
              <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Option Price (Binomial Tree)</p>
              <p className="text-4xl font-bold text-green-600">
                ${((bt || btAmPut).option_price).toFixed(4)}
              </p>
              <p className="text-xs text-gray-500 mt-1">{PERIOD_COUNTS[numPeriodsIdx]} periods</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 text-center mt-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500 uppercase">Strike Price</p>
            <p className="text-lg font-bold text-gray-900">${parseFloat(strikePrice).toFixed(2)}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500 uppercase">Business Days</p>
            <p className="text-lg font-bold text-gray-900">{(mcs || bt || btAmPut)?.business_days ?? '—'}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500 uppercase">T (Years)</p>
            <p className="text-lg font-bold text-gray-900">{((mcs || bt || btAmPut)?.T_years ?? 0).toFixed(4)}</p>
          </div>
        </div>
      </div>

      {/* American Put early exercise */}
      {btAmPut && (
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3 text-center">Early Exercise Analysis</h3>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-xl">
              <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Early Exercise Optimal Nodes</p>
              <p className="text-3xl font-bold text-orange-600">{btAmPut.early_optimal?.length || 0}</p>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl">
              <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Tree Periods</p>
              <p className="text-3xl font-bold text-blue-600">{PERIOD_COUNTS[numPeriodsIdx]}</p>
            </div>
          </div>
          {(btAmPut.early_optimal?.length ?? 0) > 0 && (
            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-800">
              Early exercise is optimal at {btAmPut.early_optimal.length} node(s). The American put carries an early exercise premium over its European counterpart.
            </div>
          )}
        </div>
      )}

      {/* MCS Payoff Distribution */}
      {mcs && payoffHistData.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-1 text-center">Payoff Distribution (Monte Carlo)</h3>
          {mcs.metrics && (
            <div className="grid grid-cols-5 gap-4 text-center mb-4">
              {['mean', 'median', 'std_dev', 'min_val', 'max_val'].map((k, i) => (
                <div key={k}>
                  <p className="text-xs text-gray-500 uppercase">{['Mean', 'Median', 'Std Dev', 'Min', 'Max'][i]}</p>
                  <p className="text-lg font-bold text-gray-900">${mcs.metrics[k].toFixed(2)}</p>
                </div>
              ))}
            </div>
          )}
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={payoffHistData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" interval={Math.ceil(payoffHistData.length / 8)} tick={{ fontSize: 11 }}
                  tickFormatter={t => t.length > 12 ? `${t.slice(0, 12)}...` : t} height={55} angle={-30} textAnchor="end" />
                <YAxis label={{ value: 'Frequency', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={v => [`${v} occurrences`, 'Frequency']} labelFormatter={l => `Range: ${l}`}
                  contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {payoffHistData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`rgba(59, 130, 246, ${0.35 + (entry.count / payoffMaxCount) * 0.65})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Underlying stock simulation section */}
      {stockSim && (
        <>
          <div className="mb-3 mt-2">
            <h3 className="text-lg font-bold text-gray-700 flex items-center gap-2">
              <FaChartLine className="text-blue-600" />
              Underlying Stock — {selectedStock.symbol} Simulation
            </h3>
            <p className="text-xs text-gray-500 mt-1">1,000 simulated paths for the underlying stock over the option's time horizon</p>
          </div>

          {/* Stock Path Chart */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-1 text-center">Simulated Stock Price Paths</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={pathChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="t" label={{ value: 'Time (days)', position: 'insideBottom', offset: -4 }} tick={{ fontSize: 11 }} />
                  <YAxis label={{ value: 'Price ($)', angle: -90, position: 'insideLeft' }} tick={{ fontSize: 11 }} tickFormatter={v => `$${v.toFixed(0)}`} />
                  <Tooltip formatter={v => [`$${v}`, '']} labelFormatter={t => `Day ${t}`}
                    contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                  {Array.from({ length: numDisplayPaths }, (_, i) => (
                    <Line key={i} type="monotone" dataKey={`p${i}`} dot={false} strokeWidth={1}
                      stroke={PATH_COLORS[i % PATH_COLORS.length]} strokeOpacity={0.7} isAnimationActive={false} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Stock Terminal Histogram */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-1 text-center">Stock Terminal Price Distribution</h3>
            {stockSim.metrics && (
              <div className="grid grid-cols-5 gap-4 text-center mb-4">
                {['mean', 'median', 'std_dev', 'min_val', 'max_val'].map((k, i) => (
                  <div key={k}>
                    <p className="text-xs text-gray-500 uppercase">{['Mean', 'Median', 'Std Dev', 'Min', 'Max'][i]}</p>
                    <p className="text-lg font-bold text-gray-900">${stockSim.metrics[k].toFixed(2)}</p>
                  </div>
                ))}
              </div>
            )}
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stockTerminalData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="label" interval={Math.ceil(stockTerminalData.length / 8)} tick={{ fontSize: 11 }}
                    tickFormatter={t => t.length > 12 ? `${t.slice(0, 12)}...` : t} height={55} angle={-30} textAnchor="end" />
                  <YAxis label={{ value: 'Frequency', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={v => [`${v} occurrences`, 'Frequency']} labelFormatter={l => `Range: ${l}`}
                    contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {stockTerminalData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`rgba(16, 185, 129, ${0.35 + (entry.count / stockMaxCount) * 0.65})`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      <div className="flex justify-center">
        <motion.button onClick={onBack} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          className="px-8 py-3 rounded-lg bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-bold text-base transition-all duration-300 flex items-center gap-2 shadow-sm">
          <FaArrowLeft /><span>Price Another Option</span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default OptionPricing;
