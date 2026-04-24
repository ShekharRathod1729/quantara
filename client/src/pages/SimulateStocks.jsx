import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaChartLine, FaRocket, FaClock, FaArrowLeft, FaBalanceScale,
  FaSignOutAlt, FaDollarSign, FaFlag,
} from 'react-icons/fa';
import StockSelector from '../components/StockSelector';
import StockLogo from '../components/StockLogo';
import { MdHistory } from 'react-icons/md';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, Legend,
} from 'recharts';
import Particles from 'react-particles';
import { loadFull } from 'tsparticles';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const SIMULATION_COUNTS = [100, 1000, 5000, 10000, 20000, 50000, 100000];

const TIME_PERIODS = [
  { days: 1, label: '1 Day' },
  { days: 10, label: '10 Days' },
  { days: 30, label: '30 Days' },
  { days: 90, label: '90 Days' },
  { days: 180, label: '180 Days' },
  { days: 365, label: '1 Year' },
];

const PATH_COLORS = [
  '#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6',
  '#06b6d4','#ec4899','#84cc16','#f97316','#6366f1',
  '#14b8a6','#e11d48','#a3e635','#fb923c','#818cf8',
  '#2dd4bf','#f43f5e','#bef264','#fdba74','#a78bfa',
  '#67e8f9','#fda4af','#d9f99d','#fed7aa','#c4b5fd',
  '#a5f3fc','#fecdd3','#ecfccb','#ffedd5','#ede9fe',
];

const SimulateStocks = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState('single'); // 'single' | 'multiple'
  const [selectedStock, setSelectedStock] = useState(null);
  const [selectedStocks, setSelectedStocks] = useState([]);
  const [weights, setWeights] = useState({});
  const [weightsValid, setWeightsValid] = useState(false);
  const [numSimulations, setNumSimulations] = useState(3);
  const [timePeriod, setTimePeriod] = useState(30);
  const [isSimulating, setIsSimulating] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [showResults, setShowResults] = useState(false);

  const particlesInit = async (main) => { await loadFull(main); };

  useEffect(() => {
    if (localStorage.getItem('isLoggedIn') !== 'true') navigate('/login');
  }, [navigate]);

  useEffect(() => {
    if (mode === 'single') { setWeightsValid(true); return; }
    if (selectedStocks.length === 0) { setWeightsValid(false); return; }
    const total = selectedStocks.reduce((s, st) => s + (parseFloat(weights[st.symbol]) || 0), 0);
    setWeightsValid(Math.abs(total - 1.0) < 0.0001);
  }, [weights, selectedStocks, mode]);

  const handleStockToggle = (stock) => {
    if (selectedStocks.find(s => s.symbol === stock.symbol)) {
      const next = selectedStocks.filter(s => s.symbol !== stock.symbol);
      setSelectedStocks(next);
      const nw = { ...weights };
      delete nw[stock.symbol];
      setWeights(nw);
    } else {
      const next = [...selectedStocks, stock];
      setSelectedStocks(next);
      const even = (1.0 / next.length).toFixed(4);
      const nw = {};
      next.forEach(s => { nw[s.symbol] = even; });
      setWeights(nw);
    }
  };

  const normalizeWeights = () => {
    const total = selectedStocks.reduce((s, st) => s + (parseFloat(weights[st.symbol]) || 0), 0);
    if (total === 0) return;
    const nw = {};
    selectedStocks.forEach(st => {
      nw[st.symbol] = (parseFloat(weights[st.symbol]) / total).toFixed(4);
    });
    setWeights(nw);
  };

  const handleSimulate = async () => {
    const tickers = mode === 'single'
      ? (selectedStock ? [selectedStock.symbol] : [])
      : selectedStocks.map(s => s.symbol);
    const wts = mode === 'single'
      ? [1.0]
      : selectedStocks.map(s => parseFloat(weights[s.symbol]));

    if (tickers.length === 0) { setError('Please select a stock'); return; }
    if (mode === 'multiple' && !weightsValid) { setError('Weights must sum to 1.0'); return; }

    setIsSimulating(true);
    setError(null);
    setResults(null);

    try {
      const response = await axios.post('http://127.0.0.1:5000/simul/stocks', {
        tickers,
        weights: wts,
        num_sim: SIMULATION_COUNTS[numSimulations],
        t: timePeriod,
      });
      setResults(response.data);
      setShowResults(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to run simulation. Please try again.');
    } finally {
      setIsSimulating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    navigate('/');
  };

  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const totalWeight = selectedStocks.reduce((s, st) => s + (parseFloat(weights[st.symbol]) || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 relative overflow-hidden">
      <Particles
        id="tsparticles-simulate"
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
                {isLoggedIn ? (
                  <>
                    <Link to="/simulate"><motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm"><FaChartLine size={14} /><span>Simulator</span></motion.button></Link>
                    <Link to="/options"><motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm"><FaDollarSign size={14} /><span>Option Pricing</span></motion.button></Link>
                    <Link to="/testing"><motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm"><MdHistory size={14} /><span>Testing</span></motion.button></Link>
                    <motion.button onClick={handleLogout} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm shadow-sm"><FaSignOutAlt size={14} /><span>Logout</span></motion.button>
                  </>
                ) : (
                  <Link to="/login"><motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm"><FaSignOutAlt size={14} /><span>Login</span></motion.button></Link>
                )}
              </div>
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {!showResults ? (
            <SelectionScreen
              key="selection"
              mode={mode}
              setMode={setMode}
              selectedStock={selectedStock}
              setSelectedStock={setSelectedStock}
              selectedStocks={selectedStocks}
              handleStockToggle={handleStockToggle}
              weights={weights}
              setWeights={setWeights}
              weightsValid={weightsValid}
              totalWeight={totalWeight}
              normalizeWeights={normalizeWeights}
              numSimulations={numSimulations}
              setNumSimulations={setNumSimulations}
              timePeriod={timePeriod}
              setTimePeriod={setTimePeriod}
              isSimulating={isSimulating}
              error={error}
              handleSimulate={handleSimulate}
            />
          ) : (
            <ResultsScreen
              key="results"
              results={results}
              mode={mode}
              selectedStock={selectedStock}
              selectedStocks={selectedStocks}
              weights={weights}
              timePeriod={timePeriod}
              numSimulations={numSimulations}
              onBack={() => { setShowResults(false); setResults(null); setError(null); }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const SelectionScreen = ({
  mode, setMode,
  selectedStock, setSelectedStock,
  selectedStocks, handleStockToggle,
  weights, setWeights, weightsValid, totalWeight, normalizeWeights,
  numSimulations, setNumSimulations,
  timePeriod, setTimePeriod,
  isSimulating, error, handleSimulate,
}) => {
  const canSimulate = mode === 'single'
    ? !!selectedStock
    : selectedStocks.length > 0 && weightsValid;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col"
    >
      {/* Mode Toggle */}
      <div className="flex gap-3 mb-4">
        {[{ key: 'single', label: 'Single Stock', icon: <FaChartLine size={14} /> }, { key: 'multiple', label: 'Multiple Stocks', icon: <FaBalanceScale size={14} /> }].map(m => (
          <motion.button
            key={m.key}
            onClick={() => setMode(m.key)}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg border-2 font-medium text-sm transition-all duration-200 ${
              mode === m.key ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-200 bg-white hover:border-blue-300 text-gray-700'
            }`}
          >
            {m.icon}<span>{m.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Stock Selection */}
      <div className="mb-4">
        {mode === 'single' ? (
          <StockSelector selected={selectedStock} onSelect={setSelectedStock} />
        ) : (
          <StockSelector multiple selected={selectedStocks} onSelect={handleStockToggle} />
        )}
      </div>

      {/* Weights (multi-stock only) */}
      <AnimatePresence>
        {mode === 'multiple' && selectedStocks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FaBalanceScale className="text-blue-600" size={16} />Portfolio Weights
              </h3>
              <div className="flex items-center gap-2">
                <div className={`px-3 py-1.5 rounded-lg font-bold text-sm ${weightsValid ? 'bg-green-100 text-green-700' : Math.abs(totalWeight - 1.0) < 0.01 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                  Sum: {totalWeight.toFixed(4)}
                </div>
                <button onClick={normalizeWeights} className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium text-xs">
                  Auto-Normalize
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {selectedStocks.map(stock => (
                <div key={stock.symbol} className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <StockLogo symbol={stock.symbol} logoUrl={stock.logoUrl} size="w-7 h-7" />
                    <p className="font-bold text-sm text-gray-900">{stock.symbol}</p>
                  </div>
                  <input
                    type="number" step="0.01" min="0" max="1"
                    value={weights[stock.symbol] || ''}
                    onChange={e => setWeights(w => ({ ...w, [stock.symbol]: e.target.value }))}
                    className="w-full px-2 py-1.5 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none text-center font-bold text-sm"
                    placeholder="0.00"
                  />
                  <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${(parseFloat(weights[stock.symbol]) || 0) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sim params */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="lg:col-span-2 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <FaRocket className="text-blue-600" size={16} />Number of Simulations
          </h3>
          <input type="range" min="0" max={SIMULATION_COUNTS.length - 1} value={numSimulations}
            onChange={e => setNumSimulations(parseInt(e.target.value))}
            className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600" />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            {SIMULATION_COUNTS.map((c, i) => (
              <span key={c} className={i === numSimulations ? 'font-bold text-blue-600' : ''}>{c >= 1000 ? `${c / 1000}k` : c}</span>
            ))}
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg mt-2">
            <span className="text-2xl font-bold text-blue-600">{SIMULATION_COUNTS[numSimulations].toLocaleString()}</span>
            <p className="text-xs text-gray-600 mt-1">simulations</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <FaClock className="text-blue-600" size={16} />Time Period
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {TIME_PERIODS.map(p => (
              <motion.button key={p.days} onClick={() => setTimePeriod(p.days)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className={`p-3 rounded-lg border-2 transition-all duration-200 text-xs font-medium ${timePeriod === p.days ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-200 bg-white hover:border-blue-300 text-gray-700'}`}>
                {p.label}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center text-sm">{error}</motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-center mt-2">
        <motion.button onClick={handleSimulate} disabled={isSimulating || !canSimulate}
          whileHover={{ scale: isSimulating || !canSimulate ? 1 : 1.05 }}
          whileTap={{ scale: isSimulating || !canSimulate ? 1 : 0.95 }}
          className={`px-10 py-3 rounded-xl font-bold text-base transition-all duration-300 flex items-center gap-3 ${
            isSimulating || !canSimulate ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl'
          }`}
        >
          {isSimulating ? (
            <><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" /><span>Simulating...</span></>
          ) : (
            <><FaRocket /><span>Run Simulation</span></>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};

const ResultsScreen = ({ results, mode, selectedStock, selectedStocks, weights, timePeriod, numSimulations, onBack }) => {
  const terminal = results?.terminal ?? [];
  const paths = results?.paths ?? [];

  const getHistogramData = () => {
    if (!terminal.length) return [];
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

  const histogramData = getHistogramData();
  const maxCount = histogramData.length ? Math.max(...histogramData.map(d => d.count)) : 1;

  const pathChartData = paths.map((row, t) => {
    const point = { t };
    row.forEach((val, i) => { point[`p${i}`] = parseFloat(val.toFixed(2)); });
    return point;
  });
  const numDisplayPaths = paths[0]?.length ?? 0;

  const label = mode === 'single'
    ? selectedStock?.symbol
    : selectedStocks.map(s => `${s.symbol} (${(parseFloat(weights[s.symbol]) * 100).toFixed(1)}%)`).join(', ');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
    >
      {/* Metrics */}
      <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-5 gap-6 text-center">
          {['mean', 'median', 'std_dev', 'min_val', 'max_val'].map((k, i) => (
            <div key={k}>
              <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">{['Mean', 'Median', 'Std Dev', 'Min', 'Max'][i]}</p>
              <p className="text-xl font-bold text-gray-900">${results.metrics[k].toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Path Simulation Chart */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-1 text-center">Simulated Price Paths</h3>
        <p className="text-center text-xs text-gray-500 mb-4">Showing {numDisplayPaths} of {SIMULATION_COUNTS[numSimulations]?.toLocaleString() ?? ''} simulated paths over {timePeriod} days</p>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={pathChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="t" label={{ value: 'Time (days)', position: 'insideBottom', offset: -4 }} tick={{ fontSize: 11 }} />
              <YAxis label={{ value: 'Price ($)', angle: -90, position: 'insideLeft' }} tick={{ fontSize: 11 }} tickFormatter={v => `$${v.toFixed(0)}`} />
              <Tooltip formatter={(v) => [`$${v}`, '']} labelFormatter={t => `Day ${t}`}
                contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
              {Array.from({ length: numDisplayPaths }, (_, i) => (
                <Line key={i} type="monotone" dataKey={`p${i}`} dot={false} strokeWidth={1}
                  stroke={PATH_COLORS[i % PATH_COLORS.length]} strokeOpacity={0.7} isAnimationActive={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Terminal Price Histogram */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-1 text-center">Terminal Price Distribution</h3>
        <p className="text-center text-xs text-gray-500 mb-4">
          Distribution of {terminal.length.toLocaleString()} simulated terminal prices for{' '}
          <span className="font-bold text-blue-600">{label}</span> after{' '}
          <span className="font-bold">{timePeriod} days</span>
        </p>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={histogramData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" interval={Math.ceil(histogramData.length / 8)} tick={{ fontSize: 11 }}
                tickFormatter={t => t.length > 12 ? `${t.slice(0, 12)}...` : t} height={60} angle={-30} textAnchor="end" />
              <YAxis label={{ value: 'Frequency', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={v => [`${v} occurrences`, 'Frequency']} labelFormatter={l => `Range: ${l}`}
                contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {histogramData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`rgba(59, 130, 246, ${0.35 + (entry.count / maxCount) * 0.65})`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="flex justify-center">
        <motion.button onClick={onBack} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          className="px-8 py-3 rounded-lg bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-bold text-base transition-all duration-300 flex items-center gap-2 shadow-sm">
          <FaArrowLeft /><span>Simulate Again</span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default SimulateStocks;
