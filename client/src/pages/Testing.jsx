import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChartLine, FaRocket, FaCalendar, FaArrowLeft, FaCheckCircle, FaTimesCircle, FaBalanceScale, FaSignOutAlt } from 'react-icons/fa';
import { BiTrendingUp } from 'react-icons/bi';
import { MdHistory } from 'react-icons/md';
import Particles from "react-particles";
import { loadFull } from "tsparticles";
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

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

const CONFIDENCE_LEVELS = [90, 95, 99];

const Testing = () => {
  const navigate = useNavigate();
  const [selectedStock, setSelectedStock] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [numSimulations, setNumSimulations] = useState(3);
  const [confidenceLevel, setConfidenceLevel] = useState(95);
  const [isSimulating, setIsSimulating] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [showResults, setShowResults] = useState(false);

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

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    navigate('/');
  };

  // Filter to only allow US business days after 2023-12-31
  const isBusinessDay = (date) => {
    const day = date.getDay();
    const cutoffDate = new Date('2023-12-31');
    
    // Exclude weekends and dates before cutoff
    if (day === 0 || day === 6 || date <= cutoffDate) {
      return false;
    }
    
    return true;
  };

  const handleTest = async () => {
    if (!selectedStock) {
      setError('Please select a stock');
      return;
    }

    if (!selectedDate) {
      setError('Please select a date');
      return;
    }

    setIsSimulating(true);
    setError(null);
    setResults(null);

    try {
      // Format date as YYYY-MM-DD
      const formattedDate = selectedDate.toISOString().split('T')[0];

      const response = await axios.get('http://127.0.0.1:5000/historical/test', {
        params: {
          ticker: selectedStock.symbol,
          date: formattedDate,
          num_sim: SIMULATION_COUNTS[numSimulations],
          confidence: confidenceLevel,
        },
      });

      setResults(response.data);
      setShowResults(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch test data. Please try again.');
      console.error('Test error:', err);
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
        {/* Header */}
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
                <Link to="/multiple">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm"
                  >
                    <FaBalanceScale size={16} />
                    <span>Portfolio</span>
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
              selectedStock={selectedStock}
              setSelectedStock={setSelectedStock}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              isBusinessDay={isBusinessDay}
              numSimulations={numSimulations}
              setNumSimulations={setNumSimulations}
              confidenceLevel={confidenceLevel}
              setConfidenceLevel={setConfidenceLevel}
              isSimulating={isSimulating}
              error={error}
              handleTest={handleTest}
            />
          ) : (
            <ResultsScreen
              results={results}
              selectedStock={selectedStock}
              handleTestAgain={handleTestAgain}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Selection Screen Component
const SelectionScreen = ({
  selectedStock,
  setSelectedStock,
  selectedDate,
  setSelectedDate,
  isBusinessDay,
  numSimulations,
  setNumSimulations,
  confidenceLevel,
  setConfidenceLevel,
  isSimulating,
  error,
  handleTest,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 h-[calc(100vh-80px)] flex flex-col"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 overflow-hidden">
        {/* Stock Selection */}
        <div className="lg:col-span-3">
          <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
            <BiTrendingUp className="text-blue-600" size={20} />
            Select Stock
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-gray-100">
            {STOCKS.map((stock) => (
              <motion.button
                key={stock.symbol}
                onClick={() => setSelectedStock(stock)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex-shrink-0 p-3 rounded-xl border-2 transition-all duration-200 ${
                  selectedStock?.symbol === stock.symbol
                    ? 'border-blue-600 bg-blue-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-blue-300'
                }`}
              >
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
            ))}
          </div>
        </div>

        {/* Date Selection */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <FaCalendar className="text-blue-600" size={16} />
            Select Date
          </h3>
          <div className="space-y-3">
            <p className="text-xs text-gray-600">
              Choose a US business day after Dec 31, 2023
            </p>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              minDate={new Date('2024-01-01')}
              maxDate={new Date()}
              filterDate={isBusinessDay}
              placeholderText="Select a business day"
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none text-center font-medium text-sm"
              dateFormat="MMMM d, yyyy"
            />
            {selectedDate && (
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-gray-600">Selected Date</p>
                <p className="text-lg font-bold text-blue-600 mt-1">
                  {selectedDate.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Number of Simulations */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
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

        {/* Confidence Level */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <FaChartLine className="text-blue-600" size={16} />
            Confidence Level
          </h3>
          <div className="space-y-3">
            <input
              type="range"
              min="80"
              max="99"
              value={confidenceLevel}
              onChange={(e) => setConfidenceLevel(parseInt(e.target.value))}
              className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-500 px-1">
              <span className={confidenceLevel <= 85 ? 'font-bold text-blue-600' : ''}>80%</span>
              <span className={confidenceLevel >= 85 && confidenceLevel <= 92 ? 'font-bold text-blue-600' : ''}>85%</span>
              <span className={confidenceLevel >= 92 && confidenceLevel <= 96 ? 'font-bold text-blue-600' : ''}>90%</span>
              <span className={confidenceLevel >= 96 && confidenceLevel <= 98 ? 'font-bold text-blue-600' : ''}>95%</span>
              <span className={confidenceLevel >= 98 ? 'font-bold text-blue-600' : ''}>99%</span>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <span className="text-2xl font-bold text-blue-600">
                {confidenceLevel}%
              </span>
              <p className="text-xs text-gray-600 mt-1">confidence level</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-xs text-blue-800">
              <p className="font-medium mb-1">📊 What does this mean?</p>
              <p>A {confidenceLevel}% confidence level means we expect the actual price to fall within the predicted range {confidenceLevel}% of the time.</p>
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

      {/* Test Button */}
      <div className="flex justify-center mt-4">
        <motion.button
          onClick={handleTest}
          disabled={isSimulating || !selectedStock || !selectedDate}
          whileHover={{ scale: isSimulating || !selectedStock || !selectedDate ? 1 : 1.05 }}
          whileTap={{ scale: isSimulating || !selectedStock || !selectedDate ? 1 : 0.95 }}
          className={`px-10 py-3 rounded-xl font-bold text-base transition-all duration-300 flex items-center gap-3 ${
            isSimulating || !selectedStock || !selectedDate
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
              <span>Testing...</span>
            </>
          ) : (
            <>
              <MdHistory />
              <span>Run Historical Test</span>
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};

// Results Screen Component
const ResultsScreen = ({
  results,
  selectedStock,
  handleTestAgain,
}) => {
  const withinRange = results.within_range;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 h-[calc(100vh-80px)] flex flex-col"
    >
      {/* Main Result Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-4 flex-1 flex flex-col">
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-3 mb-3">
            <img 
              src={selectedStock.logoUrl} 
              alt={selectedStock.symbol}
              className="w-12 h-12 object-contain"
            />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{selectedStock.symbol}</h2>
              <p className="text-sm text-gray-600">{selectedStock.name}</p>
            </div>
          </div>
          <p className="text-base text-gray-600">
            Historical Test Results for{' '}
            <span className="font-bold text-gray-900">
              {new Date(results.date).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Actual Price */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4">
            <p className="text-xs text-gray-600 mb-2 text-center uppercase tracking-wide">
              Actual Closing Price
            </p>
            <p className="text-3xl font-bold text-blue-600 text-center">
              ${results.actual_price.toFixed(2)}
            </p>
          </div>

          {/* Test Details */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-600 mb-2 uppercase tracking-wide">Test Details</p>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Business Days:</span>
                <span className="font-bold text-gray-900">{results.business_days}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Data Cutoff:</span>
                <span className="font-bold text-gray-900">Dec 31, 2023</span>
              </div>
            </div>
          </div>
        </div>

        {/* Confidence Interval */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 mb-4">
          <p className="text-xs text-gray-600 mb-3 text-center uppercase tracking-wide">
            {results.confidence_level}% Confidence Interval (Predicted Range)
          </p>
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Lower Bound</p>
              <p className="text-2xl font-bold text-blue-700">
                ${results.range_low.toFixed(2)}
              </p>
            </div>
            <div className="text-xl text-gray-400">→</div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Upper Bound</p>
              <p className="text-2xl font-bold text-blue-700">
                ${results.range_high.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Result Status */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className={`rounded-xl p-4 ${
            withinRange 
              ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
              : 'bg-gradient-to-r from-orange-500 to-orange-600'
          }`}
        >
          <div className="flex items-center justify-center gap-3 text-white">
            {withinRange ? (
              <>
                <FaCheckCircle size={24} />
                <div>
                  <p className="text-lg font-bold">Within Predicted Range! ✓</p>
                  <p className="text-xs opacity-90">
                    The actual price fell within the {results.confidence_level}% confidence interval
                  </p>
                </div>
              </>
            ) : (
              <>
                <FaTimesCircle size={24} />
                <div>
                  <p className="text-lg font-bold">Outside Predicted Range</p>
                  <p className="text-xs opacity-90">
                    The actual price fell outside the {results.confidence_level}% confidence interval
                  </p>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>

      {/* Test Again Button */}
      <div className="flex justify-center">
        <motion.button
          onClick={handleTestAgain}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-2.5 rounded-lg bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-bold text-sm transition-all duration-300 flex items-center gap-2 shadow-sm"
        >
          <FaArrowLeft />
          <span>Test Another Date</span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Testing;
