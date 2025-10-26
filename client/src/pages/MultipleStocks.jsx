import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChartLine, FaRocket, FaClock, FaArrowLeft, FaBalanceScale, FaCheckCircle, FaSignOutAlt } from 'react-icons/fa';
import { BiTrendingUp } from 'react-icons/bi';
import { MdHistory } from 'react-icons/md';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Particles from "react-particles";
import { loadFull } from "tsparticles";
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.', logoUrl: 'https://logo.clearbit.com/apple.com', bgColor: 'bg-gray-100' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', logoUrl: 'https://cdn1.iconfinder.com/data/icons/google-s-logo/150/Google_Icons-09-512.png', bgColor: 'bg-blue-100' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', logoUrl: 'https://logo.clearbit.com/microsoft.com', bgColor: 'bg-sky-100' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', logoUrl: 'https://logo.clearbit.com/amazon.com', bgColor: 'bg-orange-100' },
  { symbol: 'TSLA', name: 'Tesla Inc.', logoUrl: 'https://logo.clearbit.com/tesla.com', bgColor: 'bg-red-100' },
  { symbol: 'META', name: 'Meta Platforms', logoUrl: 'https://logo.clearbit.com/meta.com', bgColor: 'bg-blue-100' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', logoUrl: 'https://logo.clearbit.com/nvidia.com', bgColor: 'bg-green-100' },
  { symbol: 'JPM', name: 'JPMorgan Chase', logoUrl: 'https://logo.clearbit.com/jpmorganchase.com', bgColor: 'bg-indigo-100' },
  { symbol: 'V', name: 'Visa Inc.', logoUrl: 'https://logo.clearbit.com/visa.com', bgColor: 'bg-blue-100' },
  { symbol: 'WMT', name: 'Walmart Inc.', logoUrl: 'https://logo.clearbit.com/walmart.com', bgColor: 'bg-yellow-100' },
  { symbol: 'DIS', name: 'Walt Disney Co.', logoUrl: 'https://logo.clearbit.com/disney.com', bgColor: 'bg-blue-100' },
  { symbol: 'NFLX', name: 'Netflix Inc.', logoUrl: 'https://logo.clearbit.com/netflix.com', bgColor: 'bg-red-100' },
  { symbol: 'INTC', name: 'Intel Corp.', logoUrl: 'https://logo.clearbit.com/intel.com', bgColor: 'bg-blue-100' },
  { symbol: 'AMD', name: 'AMD Inc.', logoUrl: 'https://logo.clearbit.com/amd.com', bgColor: 'bg-green-100' },
  { symbol: 'PYPL', name: 'PayPal Holdings', logoUrl: 'https://logo.clearbit.com/paypal.com', bgColor: 'bg-blue-100' },
  { symbol: 'CSCO', name: 'Cisco Systems', logoUrl: 'https://logo.clearbit.com/cisco.com', bgColor: 'bg-blue-100' },
  { symbol: 'BA', name: 'Boeing Co.', logoUrl: 'https://logo.clearbit.com/boeing.com', bgColor: 'bg-blue-100' },
  { symbol: 'NKE', name: 'Nike Inc.', logoUrl: 'https://logo.clearbit.com/nike.com', bgColor: 'bg-orange-100' },
  { symbol: 'CRM', name: 'Salesforce Inc.', logoUrl: 'https://logo.clearbit.com/salesforce.com', bgColor: 'bg-blue-100' },
  { symbol: 'ADBE', name: 'Adobe Inc.', logoUrl: 'https://logo.clearbit.com/adobe.com', bgColor: 'bg-red-100' },
  { symbol: 'ORCL', name: 'Oracle Corp.', logoUrl: 'https://logo.clearbit.com/oracle.com', bgColor: 'bg-red-100' },
  { symbol: 'PEP', name: 'PepsiCo Inc.', logoUrl: 'https://logo.clearbit.com/pepsi.com', bgColor: 'bg-blue-100' },
  { symbol: 'KO', name: 'Coca-Cola Co.', logoUrl: 'https://logo.clearbit.com/coca-cola.com', bgColor: 'bg-red-100' },
];

const SIMULATION_COUNTS = [100, 1000, 5000, 10000, 20000, 50000, 100000];

const TIME_PERIODS = [
  { days: 1, label: '1 Day' },
  { days: 10, label: '10 Days' },
  { days: 30, label: '30 Days' },
  { days: 90, label: '90 Days' },
  { days: 180, label: '180 Days' },
  { days: 365, label: '1 Year' },
];

const MultipleStocks = () => {
  const navigate = useNavigate();
  const [selectedStocks, setSelectedStocks] = useState([]);
  const [weights, setWeights] = useState({});
  const [numSimulations, setNumSimulations] = useState(3);
  const [timePeriod, setTimePeriod] = useState(30);
  const [isSimulating, setIsSimulating] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [weightsValid, setWeightsValid] = useState(false);

  const particlesInit = async (main) => {
    await loadFull(main);
  };

  // Check if user is logged in - redirect to login if not
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn !== 'true') {
      navigate('/login');
    }
  }, [navigate]);

  // Calculate if weights sum to 1
  useEffect(() => {
    if (selectedStocks.length === 0) {
      setWeightsValid(false);
      return;
    }

    const totalWeight = selectedStocks.reduce((sum, stock) => {
      return sum + (parseFloat(weights[stock.symbol]) || 0);
    }, 0);

    setWeightsValid(Math.abs(totalWeight - 1.0) < 0.0001);
  }, [weights, selectedStocks]);

  const handleStockToggle = (stock) => {
    if (selectedStocks.find(s => s.symbol === stock.symbol)) {
      setSelectedStocks(selectedStocks.filter(s => s.symbol !== stock.symbol));
      const newWeights = { ...weights };
      delete newWeights[stock.symbol];
      setWeights(newWeights);
    } else {
      setSelectedStocks([...selectedStocks, stock]);
      // Auto-distribute weights evenly
      const newCount = selectedStocks.length + 1;
      const evenWeight = (1.0 / newCount).toFixed(4);
      const newWeights = {};
      [...selectedStocks, stock].forEach(s => {
        newWeights[s.symbol] = evenWeight;
      });
      setWeights(newWeights);
    }
  };

  const handleWeightChange = (symbol, value) => {
    setWeights({
      ...weights,
      [symbol]: value,
    });
  };

  const normalizeWeights = () => {
    const total = selectedStocks.reduce((sum, stock) => {
      return sum + (parseFloat(weights[stock.symbol]) || 0);
    }, 0);

    if (total === 0) return;

    const normalized = {};
    selectedStocks.forEach(stock => {
      const currentWeight = parseFloat(weights[stock.symbol]) || 0;
      normalized[stock.symbol] = (currentWeight / total).toFixed(4);
    });
    setWeights(normalized);
  };

  const handleSimulate = async () => {
    if (selectedStocks.length === 0) {
      setError('Please select at least one stock');
      return;
    }

    if (!weightsValid) {
      setError('Weights must sum to 1.0');
      return;
    }

    setIsSimulating(true);
    setError(null);
    setResults(null);

    try {
      const payload = {
        stocks: selectedStocks.map(s => s.symbol),
        weights: selectedStocks.map(s => parseFloat(weights[s.symbol])),
        num_sim: SIMULATION_COUNTS[numSimulations],
        t: timePeriod,
      };

      const response = await axios.post('http://127.0.0.1:5000/simul/portfolio', payload);

      setResults(response.data);
      setShowResults(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch simulation data. Please try again.');
      console.error('Simulation error:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleSimulateAgain = () => {
    setShowResults(false);
    setResults(null);
    setError(null);
  };

  const getHistogramData = () => {
    if (!results?.simulations || results.simulations.length === 0) return [];

    const simulations = results.simulations;
    const min = Math.min(...simulations);
    const max = Math.max(...simulations);

    // If all values identical -> single bin
    if (min === max) {
      return [{
        label: `$${min.toFixed(2)}`,
        mid: min,
        count: simulations.length,
      }];
    }

    const binCount = 30;
    const binSize = (max - min) / binCount;

    const bins = Array.from({ length: binCount }, () => 0);

    simulations.forEach((value) => {
      const idx = Math.min(Math.floor((value - min) / binSize), binCount - 1);
      bins[idx]++;
    });

    return bins.map((count, i) => {
      const low = min + i * binSize;
      const high = low + binSize;
      const mid = (low + high) / 2;
      return {
        label: `${low.toFixed(2)} - ${high.toFixed(2)}`,
        mid,
        count,
      };
    });
  };

  const totalWeight = selectedStocks.reduce((sum, stock) => {
    return sum + (parseFloat(weights[stock.symbol]) || 0);
  }, 0);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 relative overflow-hidden">
      <Particles
        id="tsparticles-portfolio"
        init={particlesInit}
        options={{
          particles: {
            number: { value: 20, density: { enable: true, value_area: 800 } },
            color: { value: "#3b82f6" },
            opacity: {
              value: 0.08,
              random: true,
              anim: { enable: true, speed: 1, opacity_min: 0.03, sync: false }
            },
            size: {
              value: 40,
              random: true,
              anim: { enable: true, speed: 2, size_min: 20, sync: false }
            },
            move: {
              enable: true,
              speed: 0.5,
              direction: "none",
              random: true,
              straight: false,
              out_mode: "out",
              bounce: false,
            }
          },
          interactivity: {
            detect_on: "canvas",
            events: {
              onhover: { enable: true, mode: "grab" },
              resize: true
            },
            modes: {
              grab: { distance: 150, line_linked: { opacity: 0.15 } }
            }
          },
          retina_detect: true
        }}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0
        }}
      />

      <div className="relative z-10">
        <header className="backdrop-blur-md bg-white bg-opacity-90 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Link to="/">
                <h1 className="text-2xl font-bold text-blue-600 cursor-pointer hover:text-blue-700 transition-colors">QUANTARA</h1>
              </Link>
              <div className="flex items-center gap-4">
                <Link to="/single">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm"
                  >
                    <FaChartLine size={16} />
                    <span>Simulator</span>
                  </motion.button>
                </Link>
                <Link to="/testing">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm"
                  >
                    <MdHistory size={16} />
                    <span>Testing</span>
                  </motion.button>
                </Link>
                <motion.button
                  onClick={handleLogout}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm shadow-sm"
                >
                  <FaSignOutAlt size={16} />
                  <span>Logout</span>
                </motion.button>
              </div>
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {!showResults ? (
            <SelectionScreen
              selectedStocks={selectedStocks}
              handleStockToggle={handleStockToggle}
              weights={weights}
              handleWeightChange={handleWeightChange}
              normalizeWeights={normalizeWeights}
              weightsValid={weightsValid}
              totalWeight={totalWeight}
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
              results={results}
              selectedStocks={selectedStocks}
              weights={weights}
              timePeriod={timePeriod}
              getHistogramData={getHistogramData}
              handleSimulateAgain={handleSimulateAgain}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const SelectionScreen = ({
  selectedStocks,
  handleStockToggle,
  weights,
  handleWeightChange,
  normalizeWeights,
  weightsValid,
  totalWeight,
  numSimulations,
  setNumSimulations,
  timePeriod,
  setTimePeriod,
  isSimulating,
  error,
  handleSimulate,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 h-[calc(100vh-80px)] flex flex-col overflow-auto"
    >
      <div className="grid grid-cols-1 gap-4">
        {/* Stock Selection */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
            <BiTrendingUp className="text-blue-600" size={20} />
            Select Stocks for Portfolio
            {selectedStocks.length > 0 && (
              <span className="text-sm font-normal text-gray-600">
                ({selectedStocks.length} selected)
              </span>
            )}
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-gray-100">
            {STOCKS.map((stock) => {
              const isSelected = selectedStocks.find(s => s.symbol === stock.symbol);
              return (
                <motion.button
                  key={stock.symbol}
                  onClick={() => handleStockToggle(stock)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex-shrink-0 p-3 rounded-xl border-2 transition-all duration-200 relative ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-blue-300'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute -top-2 -right-2 bg-blue-600 text-white rounded-full p-1">
                      <FaCheckCircle size={12} />
                    </div>
                  )}
                  <div className="flex flex-col items-center gap-1 w-16">
                    <div className="w-10 h-10 flex items-center justify-center p-1 overflow-hidden">
                      <img 
                        src={stock.logoUrl} 
                        alt={stock.symbol}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = `<span class="text-lg font-bold text-gray-700">${stock.symbol.charAt(0)}</span>`;
                        }}
                      />
                    </div>
                    <span className="text-xs font-bold text-gray-900 truncate w-full text-center">{stock.symbol}</span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Weights Section */}
        <AnimatePresence>
          {selectedStocks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white p-4 rounded-xl shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <FaBalanceScale className="text-blue-600" size={16} />
                  Portfolio Weights
                </h3>
                <div className="flex items-center gap-2">
                  <div className={`px-3 py-1.5 rounded-lg font-bold text-sm ${
                    weightsValid 
                      ? 'bg-green-100 text-green-700' 
                      : Math.abs(totalWeight - 1.0) < 0.01
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    Sum: {totalWeight.toFixed(4)}
                  </div>
                  <button
                    onClick={normalizeWeights}
                    className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium text-xs"
                  >
                    Auto-Normalize
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {selectedStocks.map((stock) => (
                  <div key={stock.symbol} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 flex items-center justify-center overflow-hidden">
                        <img 
                          src={stock.logoUrl} 
                          alt={stock.symbol}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-gray-900">{stock.symbol}</p>
                      </div>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={weights[stock.symbol] || ''}
                      onChange={(e) => handleWeightChange(stock.symbol, e.target.value)}
                      className="w-full px-2 py-1.5 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none text-center font-bold text-sm"
                      placeholder="0.00"
                    />
                    <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 transition-all duration-300"
                        style={{ width: `${(parseFloat(weights[stock.symbol]) || 0) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Simulation Parameters */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Number of Simulations */}
          <div className="lg:col-span-2 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <FaRocket className="text-blue-600" size={16} />
              Number of Simulations
            </h3>
            <div className="space-y-3">
              <input
                type="range"
                min="0"
                max={SIMULATION_COUNTS.length - 1}
                value={numSimulations}
                onChange={(e) => setNumSimulations(parseInt(e.target.value))}
                className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-500">
                {SIMULATION_COUNTS.map((count, idx) => (
                  <span key={count} className={idx === numSimulations ? 'font-bold text-blue-600' : ''}>
                    {count >= 1000 ? `${count / 1000}k` : count}
                  </span>
                ))}
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <span className="text-2xl font-bold text-blue-600">
                  {SIMULATION_COUNTS[numSimulations].toLocaleString()}
                </span>
                <p className="text-xs text-gray-600 mt-1">simulations</p>
              </div>
            </div>
          </div>

          {/* Time Period */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <FaClock className="text-blue-600" size={16} />
              Time Period
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {TIME_PERIODS.map((period) => (
                <motion.button
                  key={period.days}
                  onClick={() => setTimePeriod(period.days)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 text-xs font-medium ${
                    timePeriod === period.days
                      ? 'border-blue-600 bg-blue-50 text-blue-600'
                      : 'border-gray-200 bg-white hover:border-blue-300 text-gray-700'
                  }`}
                >
                  {period.label}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center text-sm"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Simulate Button */}
      <div className="flex justify-center mt-4">
        <motion.button
          onClick={handleSimulate}
          disabled={isSimulating || selectedStocks.length === 0 || !weightsValid}
          whileHover={{ scale: isSimulating || selectedStocks.length === 0 || !weightsValid ? 1 : 1.05 }}
          whileTap={{ scale: isSimulating || selectedStocks.length === 0 || !weightsValid ? 1 : 0.95 }}
          className={`px-10 py-3 rounded-xl font-bold text-base transition-all duration-300 flex items-center gap-3 ${
            isSimulating || selectedStocks.length === 0 || !weightsValid
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl'
          }`}
        >
          {isSimulating ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-3 border-white border-t-transparent rounded-full"
              />
              <span>Simulating Portfolio...</span>
            </>
          ) : (
            <>
              <FaRocket />
              <span>Run Portfolio Simulation</span>
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};

const ResultsScreen = ({
  results,
  selectedStocks,
  weights,
  timePeriod,
  getHistogramData,
  handleSimulateAgain,
}) => {
  const histogramData = getHistogramData();
  const maxCount = histogramData.length ? Math.max(...histogramData.map(d => d.count)) : 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
    >
      {/* Portfolio Composition */}
      <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FaBalanceScale className="text-blue-600" />
          Portfolio Composition
        </h3>
        <div className="flex flex-wrap gap-4">
          {selectedStocks.map((stock) => (
            <div key={stock.symbol} className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
              <img src={stock.logoUrl} alt={stock.symbol} className="w-6 h-6 object-contain" />
              <span className="font-bold text-gray-900">{stock.symbol}</span>
              <span className="text-blue-600 font-bold">{(parseFloat(weights[stock.symbol]) * 100).toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Metrics */}
      <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-5 gap-6 text-center">
          <MetricItem label="Mean" value={`$${results.metrics.mean.toFixed(2)}`} />
          <MetricItem label="Median" value={`$${results.metrics.median.toFixed(2)}`} />
          <MetricItem label="Std Dev" value={`$${results.metrics.std_dev.toFixed(2)}`} />
          <MetricItem label="Min" value={`$${results.metrics.min_val.toFixed(2)}`} />
          <MetricItem label="Max" value={`$${results.metrics.max_val.toFixed(2)}`} />
        </div>
      </div>

      {/* Histogram */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
          Portfolio Value Distribution
        </h3>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={histogramData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="label"
                interval={Math.ceil(histogramData.length / 8)}
                tick={{ fontSize: 12 }}
                tickFormatter={(tick) => (tick.length > 12 ? `${tick.slice(0, 12)}...` : tick)}
                height={60}
                angle={-30}
                textAnchor="end"
              />
              <YAxis
                label={{ value: 'Frequency', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                formatter={(value) => [`${value} occurrences`, 'Frequency']}
                labelFormatter={(label) => `Range: ${label}`}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {histogramData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={`rgba(59, 130, 246, ${0.35 + (entry.count / Math.max(maxCount, 1)) * 0.65})`}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-center text-gray-600 mt-4 text-sm">
          Distribution of {results.simulations.length.toLocaleString()} simulated portfolio values over{' '}
          <span className="font-bold">{timePeriod} days</span>
        </p>
      </div>

      {/* Simulate Again Button */}
      <div className="flex justify-center">
        <motion.button
          onClick={handleSimulateAgain}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-3 rounded-lg bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-bold text-base transition-all duration-300 flex items-center gap-2 shadow-sm"
        >
          <FaArrowLeft />
          <span>Simulate Again</span>
        </motion.button>
      </div>
    </motion.div>
  );
};

const MetricItem = ({ label, value }) => {
  return (
    <div>
      <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">{label}</p>
      <p className="text-xl font-bold text-gray-900">{value}</p>
    </div>
  );
};

export default MultipleStocks;
