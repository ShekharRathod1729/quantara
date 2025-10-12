import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from "lottie-react";
import Particles from "react-particles";
import { loadFull } from "tsparticles";
import { FaUser, FaLock, FaArrowRight, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import financialAnimation from '../assets/financial-animation.json';
import { useNavigate } from 'react-router-dom'; // added import

const LoginPage = () => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const navigate = useNavigate(); // added navigate hook

  const particlesInit = async (main) => {
    await loadFull(main);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate loading
    setTimeout(() => {
      if (userId === 'jash' && password === '1234567890') {
        setSuccess(true);
        setError('');
        // Redirect to /home after short delay
        setTimeout(() => {
          navigate('/home');
        }, 600);
      } else {
        setError('Invalid credentials. Please try again.');
        setSuccess(false);
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center overflow-hidden relative">
      <Particles
        id="tsparticles-login"
        init={particlesInit}
        options={{
          particles: {
            number: {
              value: 20,
              density: {
                enable: true,
                value_area: 800
              }
            },
            color: {
              value: "#3b82f6"
            },
            shape: {
              type: "circle",
            },
            opacity: {
              value: 0.08,
              random: true,
              anim: {
                enable: true,
                speed: 1,
                opacity_min: 0.03,
                sync: false
              }
            },
            size: {
              value: 40,
              random: true,
              anim: {
                enable: true,
                speed: 2,
                size_min: 20,
                sync: false
              }
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
              onhover: {
                enable: true,
                mode: "grab"
              },
              resize: true
            },
            modes: {
              grab: {
                distance: 140,
                line_linked: {
                  opacity: 0.15
                }
              }
            }
          },
          retina_detect: true
        }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20">
          {/* Left side - Animation */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="hidden lg:block w-full lg:w-1/2 max-w-md"
          >
            <div className="relative">
              <Lottie 
                animationData={financialAnimation} 
                className="w-full"
              />
              <div className="mt-6 text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to QUANTARA</h2>
                <p className="text-gray-600 text-lg">Advanced Financial Risk Analytics</p>
              </div>
            </div>
          </motion.div>

          {/* Right side - Login Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full lg:w-1/2 max-w-md"
          >
            <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10 border border-gray-100">
              {/* Logo for mobile */}
              <div className="lg:hidden text-center mb-6">
                <h1 className="text-3xl font-bold text-blue-600">QUANTARA</h1>
                <p className="text-gray-600 mt-2">Sign in to your account</p>
              </div>

              {/* Desktop heading */}
              <div className="hidden lg:block mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h2>
                <p className="text-gray-600">Enter your credentials to access your account</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* User ID Field */}
                <div>
                  <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-2">
                    User ID
                  </label>
                  <motion.div 
                    className={`relative transition-all duration-300 ${
                      focusedField === 'userId' ? 'scale-[1.02]' : ''
                    }`}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaUser className={`transition-colors duration-300 ${
                        focusedField === 'userId' ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                    </div>
                    <input
                      type="text"
                      id="userId"
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      onFocus={() => setFocusedField('userId')}
                      onBlur={() => setFocusedField(null)}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 outline-none"
                      placeholder="Enter your user ID"
                      required
                    />
                  </motion.div>
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <motion.div 
                    className={`relative transition-all duration-300 ${
                      focusedField === 'password' ? 'scale-[1.02]' : ''
                    }`}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaLock className={`transition-colors duration-300 ${
                        focusedField === 'password' ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                    </div>
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 outline-none"
                      placeholder="Enter your password"
                      required
                    />
                  </motion.div>
                </div>

                {/* Error/Success Messages */}
                <AnimatePresence mode="wait">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700"
                    >
                      <FaTimesCircle className="flex-shrink-0" />
                      <span className="text-sm">{error}</span>
                    </motion.div>
                  )}
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700"
                    >
                      <FaCheckCircle className="flex-shrink-0" />
                      <span className="text-sm">Login successful! Redirecting...</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={isLoading || success}
                  whileHover={{ scale: isLoading || success ? 1 : 1.02 }}
                  whileTap={{ scale: isLoading || success ? 1 : 0.98 }}
                  className={`w-full py-3 px-6 rounded-lg font-medium text-white transition-all duration-300 flex items-center justify-center gap-2 ${
                    isLoading || success
                      ? 'bg-blue-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                      <span>Signing In...</span>
                    </>
                  ) : success ? (
                    <>
                      <FaCheckCircle />
                      <span>Success!</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <FaArrowRight />
                    </>
                  )}
                </motion.button>

                {/* Additional Links */}
                <div className="flex items-center justify-between text-sm mt-4">
                  <a href="#" className="text-blue-600 hover:text-blue-700 transition-colors">
                    Forgot password?
                  </a>
                  <a href="#" className="text-blue-600 hover:text-blue-700 transition-colors">
                    Create account
                  </a>
                </div>
              </form>

              {/* Demo Credentials Hint */}
              {/* <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100"
              >
                <p className="text-xs text-gray-600 text-center">
                  <span className="font-semibold text-blue-600">Demo Credentials:</span><br />
                  ID: <code className="bg-white px-2 py-1 rounded">jash</code> | 
                  Password: <code className="bg-white px-2 py-1 rounded">1234567890</code>
                </p>
              </motion.div> */}
            </div>

            {/* Footer */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-center text-gray-500 text-sm mt-6"
            >
              © {new Date().getFullYear()} QUANTARA. All rights reserved.
            </motion.p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
