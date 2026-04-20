import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChartLine, FaRocket, FaArrowLeft, FaBalanceScale, FaSignOutAlt, FaDollarSign, FaFlag } from 'react-icons/fa';
import { BiTrendingUp } from 'react-icons/bi';
import { MdHistory } from 'react-icons/md';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import StockSelector from '../components/StockSelector';
import StockLogo from '../components/StockLogo';
import Particles from "react-particles";
import { loadFull } from "tsparticles";
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';


const SIMULATION_COUNTS = [100, 1000, 5000, 10000, 20000, 50000, 100000];
const PERIOD_COUNTS = [10, 25, 50, 100, 200, 500];

const EuropeanOptions = () => {
  const navigate = useNavigate();
  const [selectedStock, setSelectedStock] = useState(null);
  const [maturityDate, setMaturityDate] = useState(null);
  const [strikePrice, setStrikePrice] = useState('');
  const [optionType, setOptionType] = useState('call');
  const [method, setMethod] = useState('mcs'); // 'mcs' or 'bt'
  const [numSimIdx, setNumSimIdx] = useState(3);
  const [numPeriodsIdx, setNumPeriodsIdx] = useState(3);
  const [isCalculating, setIsCalculating] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [showResults, setShowResults] = useState(false);

  const particlesInit = async (main) => {
    await loadFull(main);
  };

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn !== 'true') {
      navigate('/login');
    }
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

  const handleCalculate = async () => {
    if (!selectedStock) { setError('Please select a stock'); return; }
    if (!maturityDate) { setError('Please select a maturity date'); return; }
    if (!strikePrice || parseFloat(strikePrice) <= 0) { setError('Please enter a valid strike price'); return; }

    setIsCalculating(true);
    setError(null);
    setResults(null);

    const formattedDate = maturityDate.toISOString().split('T')[0];

    try {
      let response;
      if (method === 'mcs') {
        response = await axios.post('http://127.0.0.1:5000/options/european/mcs', {
          ticker: selectedStock.symbol,
          maturity_date: formattedDate,
          strike_price: parseFloat(strikePrice),
          option_type: optionType,
          num_sim: SIMULATION_COUNTS[numSimIdx],
        });
      } else {
        response = await axios.post('http://127.0.0.1:5000/options/european/bt', {
          ticker: selectedStock.symbol,
          maturity_date: formattedDate,
          strike_price: parseFloat(strikePrice),
          option_type: optionType,
          num_periods: PERIOD_COUNTS[numPeriodsIdx],
        });
      }
      setResults({ ...response.data, method });
      setShowResults(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to price option. Please try again.');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleBack = () => {
    setShowResults(false);
    setResults(null);
    setError(null);
  };

  const getHistogramData = () => {
    if (!results?.payoffs || results.payoffs.length === 0) return [];
    const payoffs = results.payoffs;
    const min = Math.min(...payoffs);
    const max = Math.max(...payoffs);
    if (min === max) return [{ label: `$${min.toFixed(2)}`, count: payoffs.length }];
    const binCount = 30;
    const binSize = (max - min) / binCount;
    const bins = Array.from({ length: binCount }, () => 0);
    payoffs.forEach((v) => {
      const idx = Math.min(Math.floor((v - min) / binSize), binCount - 1);
      bins[idx]++;
    });
    return bins.map((count, i) => {
      const low = min + i * binSize;
      const high = low + binSize;
      return { label: `${low.toFixed(2)} - ${high.toFixed(2)}`, count };
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 relative overflow-hidden">
      <Particles
        id="tsparticles-eu-opt"
        init={particlesInit}
        options={{
          particles: {
            number: { value: 15, density: { enable: true, value_area: 800 } },
            color: { value: "#3b82f6" },
            opacity: { value: 0.08, random: true, anim: { enable: true, speed: 1, opacity_min: 0.03, sync: false } },
            size: { value: 40, random: true, anim: { enable: true, speed: 2, size_min: 20, sync: false } },
            move: { enable: true, speed: 0.5, direction: "none", random: true, straight: false, out_mode: "out", bounce: false }
          },
          interactivity: { detect_on: "canvas", events: { onhover: { enable: true, mode: "grab" }, resize: true }, modes: { grab: { distance: 150, line_linked: { opacity: 0.15 } } } },
          retina_detect: true
        }}
        style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0 }}
      />

      <div className="relative z-10">
        <header className="backdrop-blur-md bg-white bg-opacity-90 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Link to="/"><h1 className="text-2xl font-bold text-blue-600 cursor-pointer hover:text-blue-700 transition-colors">QUANTARA</h1></Link>
              <div className="flex items-center gap-3">
                <Link to="/single"><motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm"><FaChartLine size={14} /><span>Simulator</span></motion.button></Link>
                <Link to="/multiple"><motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm"><FaBalanceScale size={14} /><span>Portfolio</span></motion.button></Link>
                <Link to="/american"><motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm"><FaFlag size={14} /><span>American Put</span></motion.button></Link>
                <Link to="/testing"><motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm"><MdHistory size={14} /><span>Testing</span></motion.button></Link>
                <motion.button onClick={handleLogout} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm shadow-sm"><FaSignOutAlt size={14} /><span>Logout</span></motion.button>
              </div>
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {!showResults ? (
            <motion.div
              key="selection"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <FaDollarSign className="text-blue-600" size={20} />
                European Option Pricing
              </h2>

              {/* Stock Selection */}
              <div className="mb-4">
                <StockSelector selected={selectedStock} onSelect={setSelectedStock} />
              </div>

              {/* Method Toggle */}
              <div className="mb-4">
                <h3 className="text-sm font-bold text-gray-700 mb-2">Pricing Method</h3>
                <div className="flex gap-3">
                  {[{ key: 'mcs', label: 'Monte Carlo Simulation' }, { key: 'bt', label: 'Binomial Tree' }].map((m) => (
                    <motion.button
                      key={m.key}
                      onClick={() => setMethod(m.key)}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className={`px-5 py-2.5 rounded-lg border-2 font-medium text-sm transition-all duration-200 ${
                        method === m.key
                          ? 'border-blue-600 bg-blue-50 text-blue-600'
                          : 'border-gray-200 bg-white hover:border-blue-300 text-gray-700'
                      }`}
                    >
                      {m.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
                {/* Maturity Date */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900 mb-2">Maturity Date</h3>
                  <DatePicker
                    selected={maturityDate}
                    onChange={(date) => setMaturityDate(date)}
                    minDate={new Date(Date.now() + 86400000)}
                    filterDate={isFutureBusinessDay}
                    placeholderText="Select maturity date"
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none text-center font-medium text-sm"
                    dateFormat="MMMM d, yyyy"
                  />
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
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={strikePrice}
                    onChange={(e) => setStrikePrice(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none text-center font-bold text-lg"
                    placeholder="e.g. 200"
                  />
                </div>

                {/* Option Type */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900 mb-2">Option Type</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {['call', 'put'].map((type) => (
                      <motion.button
                        key={type}
                        onClick={() => setOptionType(type)}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className={`p-3 rounded-lg border-2 transition-all duration-200 text-sm font-bold capitalize ${
                          optionType === type
                            ? type === 'call'
                              ? 'border-green-500 bg-green-50 text-green-600'
                              : 'border-red-500 bg-red-50 text-red-600'
                            : 'border-gray-200 bg-white hover:border-blue-300 text-gray-700'
                        }`}
                      >
                        {type}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Sim Count or Period Count */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  {method === 'mcs' ? (
                    <>
                      <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <FaRocket className="text-blue-600" size={14} />
                        Simulations
                      </h3>
                      <input
                        type="range" min="0" max={SIMULATION_COUNTS.length - 1} value={numSimIdx}
                        onChange={(e) => setNumSimIdx(parseInt(e.target.value))}
                        className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        {SIMULATION_COUNTS.map((c, i) => (
                          <span key={c} className={i === numSimIdx ? 'font-bold text-blue-600' : ''}>{c >= 1000 ? `${c/1000}k` : c}</span>
                        ))}
                      </div>
                      <div className="text-center p-2 bg-blue-50 rounded-lg mt-2">
                        <span className="text-lg font-bold text-blue-600">{SIMULATION_COUNTS[numSimIdx].toLocaleString()}</span>
                        <p className="text-xs text-gray-600">simulations</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <h3 className="text-sm font-bold text-gray-900 mb-2">Time Periods (N)</h3>
                      <input
                        type="range" min="0" max={PERIOD_COUNTS.length - 1} value={numPeriodsIdx}
                        onChange={(e) => setNumPeriodsIdx(parseInt(e.target.value))}
                        className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        {PERIOD_COUNTS.map((c, i) => (
                          <span key={c} className={i === numPeriodsIdx ? 'font-bold text-blue-600' : ''}>{c}</span>
                        ))}
                      </div>
                      <div className="text-center p-2 bg-blue-50 rounded-lg mt-2">
                        <span className="text-lg font-bold text-blue-600">{PERIOD_COUNTS[numPeriodsIdx]}</span>
                        <p className="text-xs text-gray-600">periods</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center text-sm">{error}</motion.div>
                )}
              </AnimatePresence>

              {/* Calculate Button */}
              <div className="flex justify-center mt-2">
                <motion.button
                  onClick={handleCalculate}
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
                    <>
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-5 h-5 border-3 border-white border-t-transparent rounded-full" />
                      <span>Calculating...</span>
                    </>
                  ) : (
                    <>
                      <FaDollarSign />
                      <span>Price Option</span>
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
            >
              {/* Header Info */}
              <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <StockLogo symbol={selectedStock.symbol} logoUrl={selectedStock.logoUrl} size="w-10 h-10" />
                  <div className="text-center">
                    <h2 className="text-xl font-bold text-gray-900">{selectedStock.symbol} - {selectedStock.name}</h2>
                    <p className="text-sm text-gray-600">
                      European {optionType.charAt(0).toUpperCase() + optionType.slice(1)} Option | {results.method === 'mcs' ? 'Monte Carlo Simulation' : 'Binomial Tree'}
                    </p>
                  </div>
                </div>

                {/* Option Price */}
                <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl mb-4">
                  <p className="text-sm text-gray-600 uppercase tracking-wide mb-1">Option Price</p>
                  <p className="text-4xl font-bold text-blue-600">
                    ${results.method === 'mcs' ? results.price.toFixed(4) : results.option_price.toFixed(4)}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase">Strike Price</p>
                    <p className="text-lg font-bold text-gray-900">${parseFloat(strikePrice).toFixed(2)}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase">Business Days</p>
                    <p className="text-lg font-bold text-gray-900">{results.business_days}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase">T (Years)</p>
                    <p className="text-lg font-bold text-gray-900">{results.T_years.toFixed(4)}</p>
                  </div>
                </div>
              </div>

              {/* MCS-specific: Payoff Distribution */}
              {results.method === 'mcs' && results.metrics && (
                <>
                  <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-3 text-center">Payoff Statistics</h3>
                    <div className="grid grid-cols-5 gap-6 text-center">
                      <MetricItem label="Mean" value={`$${results.metrics.mean.toFixed(2)}`} />
                      <MetricItem label="Median" value={`$${results.metrics.median.toFixed(2)}`} />
                      <MetricItem label="Std Dev" value={`$${results.metrics.std_dev.toFixed(2)}`} />
                      <MetricItem label="Min" value={`$${results.metrics.min_val.toFixed(2)}`} />
                      <MetricItem label="Max" value={`$${results.metrics.max_val.toFixed(2)}`} />
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Payoff Distribution</h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={getHistogramData()}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="label" interval={Math.ceil(getHistogramData().length / 8)} tick={{ fontSize: 11 }}
                            tickFormatter={(t) => t.length > 12 ? `${t.slice(0, 12)}...` : t} height={60} angle={-30} textAnchor="end" />
                          <YAxis label={{ value: 'Frequency', angle: -90, position: 'insideLeft' }} />
                          <Tooltip formatter={(v) => [`${v} occurrences`, 'Frequency']} labelFormatter={(l) => `Range: ${l}`}
                            contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                          <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                            {getHistogramData().map((entry, index) => {
                              const maxCount = Math.max(...getHistogramData().map(d => d.count), 1);
                              return <Cell key={`cell-${index}`} fill={`rgba(59, 130, 246, ${0.35 + (entry.count / maxCount) * 0.65})`} />;
                            })}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </>
              )}

              {/* BT-specific: show option price prominently (already shown above) */}
              {results.method === 'bt' && (
                <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 text-center">Binomial Tree Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 uppercase">Periods (N)</p>
                      <p className="text-lg font-bold text-gray-900">{PERIOD_COUNTS[numPeriodsIdx]}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 uppercase">Tree Size</p>
                      <p className="text-lg font-bold text-gray-900">{results.stock_bt?.length || 0} x {results.stock_bt?.[0]?.length || 0}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Back Button */}
              <div className="flex justify-center">
                <motion.button onClick={handleBack} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 rounded-lg bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-bold text-base transition-all duration-300 flex items-center gap-2 shadow-sm">
                  <FaArrowLeft /><span>Price Another Option</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const MetricItem = ({ label, value }) => (
  <div>
    <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">{label}</p>
    <p className="text-xl font-bold text-gray-900">{value}</p>
  </div>
);

export default EuropeanOptions;
