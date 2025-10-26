import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaChartLine, FaLock, FaUser } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Particles from "react-particles";
import { loadFull } from "tsparticles";

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const particlesInit = async (main) => {
    await loadFull(main);
  };

  // Check if already logged in
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn) {
      navigate('/');
    }
  }, [navigate]);

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Simple validation (you can add more complex logic)
    if (username && password) {
      // Set login flag in localStorage
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('username', username);
      
      // Navigate to main page
      navigate('/');
    } else {
      setError('Please enter both username and password');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 relative overflow-hidden flex items-center justify-center">
      <Particles
        id="tsparticles-login"
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <FaChartLine className="text-blue-600" size={32} />
            <h1 className="text-3xl font-bold text-blue-600">QUANTARA</h1>
          </div>
          <p className="text-gray-600">Monte Carlo Stock Simulator</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <div className="relative">
              <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none transition-colors"
                placeholder="Enter your username"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none transition-colors"
                placeholder="Enter your password"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-bold hover:shadow-lg transition-all duration-300"
          >
            Login
          </motion.button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Demo credentials: Any username/password</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
