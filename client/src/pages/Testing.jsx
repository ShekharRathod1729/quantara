import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChartLine, FaRocket, FaCalendar, FaArrowLeft, FaCheckCircle, FaTimesCircle, FaSignOutAlt, FaDollarSign, FaArrowRight } from 'react-icons/fa';
import { MdHistory } from 'react-icons/md';
import StockSelector from '../components/StockSelector';
import StockLogo from '../components/StockLogo';
import Particles from "react-particles";
import { loadFull } from "tsparticles";
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const SIMULATION_COUNTS = [100, 1000, 5000, 10000, 20000, 50000, 100000];

const Testing = () => {
  const navigate = useNavigate();
  const [selectedStock, setSelectedStock] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [numSimulations, setNumSimulations] = useState(3);
  const [confidenceLevel, setConfidenceLevel] = useState(95);
  const [isSimulating, setIsSimulating] = useState(false);
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

  const isBusinessDay = (date) => {
    const day = date.getDay();
    return day !== 0 && day !== 6;
  };

  const fmt = (date) => date.toISOString().split('T')[0];

  const handleTest = async () => {
    if (!selectedStock) return setError('Please select a stock');
    if (!startDate) return setError('Please select a start date');
    if (!endDate) return setError('Please select an end date');
    if (endDate <= startDate) return setError('End date must be after start date');

    setIsSimulating(true);
    setError(null);
    setResults(null);

    try {
      const { data } = await axios.get('http://127.0.0.1:5000/historical/test', {
        params: {
          ticker: selectedStock.symbol,
          start_date: fmt(startDate),
          end_date: fmt(endDate),
          num_sim: SIMULATION_COUNTS[numSimulations],
          confidence: confidenceLevel,
        },
      });
      setResults(data);
      setShowResults(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch test data. Please try again.');
    } finally {
      setIsSimulating(false);
    }
  };

  const handleTestAgain = () => {
    setShowResults(false);
    setResults(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 relative overflow-hidden">
      <Particles
        id="tsparticles-testing"
        init={particlesInit}
        options={{
          particles: {
            number: { value: 18, density: { enable: true, value_area: 800 } },
            color: { value: "#3b82f6" },
            opacity: { value: 0.08, random: true, anim: { enable: true, speed: 1, opacity_min: 0.03, sync: false } },
            size: { value: 40, random: true, anim: { enable: true, speed: 2, size_min: 20, sync: false } },
            move: { enable: true, speed: 0.5, direction: "none", random: true, straight: false, out_mode: "out", bounce: false },
          },
          interactivity: {
            detect_on: "canvas",
            events: { onhover: { enable: true, mode: "grab" }, resize: true },
            modes: { grab: { distance: 150, line_linked: { opacity: 0.15 } } },
          },
          retina_detect: true,
        }}
        style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0 }}
      />

      <div className="relative z-10">
        <header className="backdrop-blur-md bg-white bg-opacity-90 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Link to="/"><h1 className="text-2xl font-bold text-blue-600 cursor-pointer hover:text-blue-700 transition-colors">QUANTARA</h1></Link>
              <div className="flex items-center gap-4">
                <Link to="/simulate">
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm">
                    <FaChartLine size={16} /><span>Simulator</span>
                  </motion.button>
                </Link>
                <Link to="/options">
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm">
                    <FaDollarSign size={16} /><span>Option Pricing</span>
                  </motion.button>
                </Link>
                <motion.button onClick={handleLogout} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm shadow-sm">
                  <FaSignOutAlt size={16} /><span>Logout</span>
                </motion.button>
              </div>
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {!showResults ? (
            <SelectionScreen
              selectedStock={selectedStock} setSelectedStock={setSelectedStock}
              startDate={startDate} setStartDate={setStartDate}
              endDate={endDate} setEndDate={setEndDate}
              isBusinessDay={isBusinessDay}
              numSimulations={numSimulations} setNumSimulations={setNumSimulations}
              confidenceLevel={confidenceLevel} setConfidenceLevel={setConfidenceLevel}
              isSimulating={isSimulating} error={error} handleTest={handleTest}
            />
          ) : (
            <ResultsScreen results={results} selectedStock={selectedStock} handleTestAgain={handleTestAgain} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const DateLabel = ({ date }) =>
  date ? (
    <div className="text-center p-3 bg-blue-50 rounded-lg mt-2">
      <p className="text-xs text-gray-600">Selected</p>
      <p className="text-base font-bold text-blue-600 mt-0.5">
        {date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
      </p>
    </div>
  ) : null;

const SelectionScreen = ({
  selectedStock, setSelectedStock,
  startDate, setStartDate,
  endDate, setEndDate,
  isBusinessDay,
  numSimulations, setNumSimulations,
  confidenceLevel, setConfidenceLevel,
  isSimulating, error, handleTest,
}) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // End date must be a business day after start date and not in the future
  const isValidEndDay = (date) => {
    if (!isBusinessDay(date)) return false;
    if (date >= today) return false;
    if (startDate && date <= startDate) return false;
    return true;
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col">

      <div className="mb-4">
        <StockSelector selected={selectedStock} onSelect={setSelectedStock} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">

        {/* Start Date */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
            <FaCalendar className="text-blue-600" size={14} />Start Date
          </h3>
          <p className="text-xs text-gray-500 mb-3">Simulation starting point — must be a past business day</p>
          <DatePicker
            selected={startDate}
            onChange={(date) => { setStartDate(date); if (endDate && endDate <= date) setEndDate(null); }}
            maxDate={(() => { const d = new Date(); d.setDate(d.getDate() - 1); return d; })()}
            filterDate={isBusinessDay}
            placeholderText="Select start date"
            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none text-center font-medium text-sm"
            dateFormat="MMM d, yyyy"
          />
          <DateLabel date={startDate} />
        </div>

        {/* End Date */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
            <FaCalendar className="text-green-600" size={14} />End Date
          </h3>
          <p className="text-xs text-gray-500 mb-3">Target date to predict — must be after start date</p>
          <DatePicker
            selected={endDate}
            onChange={setEndDate}
            minDate={startDate ? (() => { const d = new Date(startDate); d.setDate(d.getDate() + 1); return d; })() : undefined}
            maxDate={(() => { const d = new Date(); d.setDate(d.getDate() - 1); return d; })()}
            filterDate={isValidEndDay}
            placeholderText={startDate ? "Select end date" : "Select start date first"}
            disabled={!startDate}
            className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none text-center font-medium text-sm ${
              startDate ? 'border-gray-200 focus:border-green-600' : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
            }`}
            dateFormat="MMM d, yyyy"
          />
          <DateLabel date={endDate} />
        </div>

        {/* Number of Simulations */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
            <FaRocket className="text-blue-600" size={14} />Simulations
          </h3>
          <input type="range" min="0" max={SIMULATION_COUNTS.length - 1} value={numSimulations}
            onChange={(e) => setNumSimulations(parseInt(e.target.value))}
            className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600 mt-2" />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            {SIMULATION_COUNTS.map((c, i) => (
              <span key={c} className={i === numSimulations ? 'font-bold text-blue-600' : ''}>
                {c >= 1000 ? `${c / 1000}k` : c}
              </span>
            ))}
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg mt-3">
            <span className="text-2xl font-bold text-blue-600">{SIMULATION_COUNTS[numSimulations].toLocaleString()}</span>
            <p className="text-xs text-gray-500 mt-0.5">simulations</p>
          </div>
        </div>

        {/* Confidence Level */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
            <FaChartLine className="text-blue-600" size={14} />Confidence
          </h3>
          <input type="range" min="80" max="99" value={confidenceLevel}
            onChange={(e) => setConfidenceLevel(parseInt(e.target.value))}
            className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600 mt-2" />
          <div className="flex justify-between text-xs text-gray-400 mt-1 px-0.5">
            {['80%','85%','90%','95%','99%'].map(l => <span key={l}>{l}</span>)}
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg mt-3">
            <span className="text-2xl font-bold text-blue-600">{confidenceLevel}%</span>
            <p className="text-xs text-gray-500 mt-0.5">confidence level</p>
          </div>
          <p className="text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded-lg p-2 mt-2">
            Model predicts the price will land in this band {confidenceLevel}% of the time.
          </p>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center text-sm">
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-center">
        <motion.button onClick={handleTest}
          disabled={isSimulating || !selectedStock || !startDate || !endDate}
          whileHover={{ scale: isSimulating || !selectedStock || !startDate || !endDate ? 1 : 1.05 }}
          whileTap={{ scale: isSimulating || !selectedStock || !startDate || !endDate ? 1 : 0.95 }}
          className={`px-10 py-3 rounded-xl font-bold text-base transition-all duration-300 flex items-center gap-3 ${
            isSimulating || !selectedStock || !startDate || !endDate
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl'
          }`}>
          {isSimulating ? (
            <>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
              <span>Running Simulation...</span>
            </>
          ) : (
            <><MdHistory /><span>Run Historical Test</span></>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};

const ResultsScreen = ({ results, selectedStock, handleTestAgain }) => {
  const withinRange = results.within_range;
  const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const priceDelta = results.actual_price - results.start_price;
  const pctDelta = ((priceDelta / results.start_price) * 100).toFixed(2);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <StockLogo symbol={selectedStock.symbol} logoUrl={selectedStock.logoUrl} size="w-12 h-12" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{selectedStock.symbol}</h2>
            <p className="text-sm text-gray-500">{selectedStock.name}</p>
          </div>
        </div>
        <div className="flex items-center justify-center gap-3 text-sm text-gray-600 mt-2">
          <span className="font-semibold text-gray-800">{fmtDate(results.start_date)}</span>
          <FaArrowRight className="text-blue-400" />
          <span className="font-semibold text-gray-800">{fmtDate(results.end_date)}</span>
          <span className="text-gray-400">·</span>
          <span>{results.business_days} business day{results.business_days !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Price cards */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Start Price</p>
          <p className="text-3xl font-bold text-gray-700">${results.start_price.toFixed(2)}</p>
          <p className="text-xs text-gray-400 mt-1">{fmtDate(results.start_date)}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Actual End Price</p>
          <p className="text-3xl font-bold text-blue-600">${results.actual_price.toFixed(2)}</p>
          <p className={`text-sm font-semibold mt-1 ${priceDelta >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {priceDelta >= 0 ? '+' : ''}{priceDelta.toFixed(2)} ({pctDelta}%)
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Simulated Mean</p>
          <p className="text-3xl font-bold text-purple-600">${results.simulated_mean.toFixed(2)}</p>
          <p className="text-xs text-gray-400 mt-1">simulated paths</p>
        </div>
      </div>

      {/* Confidence Interval */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4">
        <p className="text-xs text-gray-500 uppercase tracking-wide text-center mb-4">
          {results.confidence_level}% Confidence Interval
        </p>
        <div className="flex items-center gap-4">
          <div className="text-center flex-1">
            <p className="text-xs text-gray-400 mb-1">Lower Bound</p>
            <p className="text-2xl font-bold text-blue-700">${results.range_low.toFixed(2)}</p>
          </div>

          {/* Visual bar */}
          <div className="flex-[3] relative">
            <ConfidenceBar low={results.range_low} high={results.range_high} actual={results.actual_price} start={results.start_price} />
          </div>

          <div className="text-center flex-1">
            <p className="text-xs text-gray-400 mb-1">Upper Bound</p>
            <p className="text-2xl font-bold text-blue-700">${results.range_high.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Result banner */}
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }}
        className={`rounded-xl p-5 mb-6 flex items-center justify-center gap-3 text-white ${
          withinRange ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gradient-to-r from-orange-500 to-orange-600'
        }`}>
        {withinRange ? <FaCheckCircle size={22} /> : <FaTimesCircle size={22} />}
        <div>
          <p className="text-lg font-bold">{withinRange ? 'Within Predicted Range ✓' : 'Outside Predicted Range'}</p>
          <p className="text-xs opacity-90">
            The actual closing price {withinRange ? 'fell within' : 'fell outside'} the {results.confidence_level}% confidence interval.
          </p>
        </div>
      </motion.div>

      <div className="flex justify-center">
        <motion.button onClick={handleTestAgain} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          className="px-8 py-2.5 rounded-lg bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-bold text-sm transition-all flex items-center gap-2 shadow-sm">
          <FaArrowLeft /><span>Test Another Range</span>
        </motion.button>
      </div>
    </motion.div>
  );
};

// Small visual bar showing where actual price sits within (or outside) the CI
const ConfidenceBar = ({ low, high, actual, start }) => {
  const pad = (high - low) * 0.3;
  const domMin = Math.min(low - pad, actual - pad, start);
  const domMax = Math.max(high + pad, actual + pad);
  const range = domMax - domMin;

  const pct = (v) => `${(((v - domMin) / range) * 100).toFixed(1)}%`;
  const lowPct = parseFloat(pct(low));
  const highPct = parseFloat(pct(high));
  const actualPct = parseFloat(pct(actual));

  return (
    <div className="relative h-10 w-full">
      {/* CI band */}
      <div className="absolute top-3 h-4 rounded-full bg-blue-100 border border-blue-200"
        style={{ left: `${lowPct}%`, width: `${highPct - lowPct}%` }} />
      {/* Actual price marker */}
      <div className="absolute top-1 flex flex-col items-center" style={{ left: `${actualPct}%`, transform: 'translateX(-50%)' }}>
        <div className="w-0.5 h-8 bg-blue-600 rounded" />
        <span className="text-xs font-bold text-blue-700 whitespace-nowrap mt-0.5">${actual.toFixed(0)}</span>
      </div>
    </div>
  );
};

export default Testing;
