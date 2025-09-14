import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FaChartLine, FaShieldAlt, FaChartPie, FaRobot, FaArrowRight } from 'react-icons/fa';
import { BiAnalyse } from 'react-icons/bi';
import { BsGraphUp, BsLightningCharge } from 'react-icons/bs';
import Slider from "react-slick";
import Lottie from "lottie-react";
import CountUp from 'react-countup';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Particles from "react-particles";
import { loadFull } from "tsparticles";
import { AnimatePresence } from "framer-motion";


// Import required CSS for react-slick
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Import financial animation
import financialAnimation from '../assets/financial-animation.json';

// Sample data for charts
const chartData = [
  { name: 'Jan', value: 1000 },
  { name: 'Feb', value: 1200 },
  { name: 'Mar', value: 900 },
  { name: 'Apr', value: 1500 },
  { name: 'May', value: 1800 },
  { name: 'Jun', value: 1400 },
  { name: 'Jul', value: 2000 },
  { name: 'Aug', value: 2200 },
];

const sampleScenarios = [
  { name: 'Baseline', values: [1000, 1100, 1250, 1400, 1600, 1800, 2000, 2200] },
  { name: 'Bullish', values: [1000, 1200, 1500, 1800, 2200, 2700, 3300, 4000] },
  { name: 'Bearish', values: [1000, 950, 920, 880, 800, 750, 700, 650] },
];

const LandingPage = () => {
  const [animatedBackground, setAnimatedBackground] = useState(null);

  const particlesInit = async (main) => {
    await loadFull(main);
  };

  const particlesLoaded = (container) => {
    setAnimatedBackground(container);
  };

  return (
    <div className="bg-white text-gray-800 min-h-screen overflow-hidden">
      <Particles
        id="tsparticles"
        init={particlesInit}
        loaded={particlesLoaded}
        options={{
          particles: {
            number: {
              value: 15,
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
              stroke: {
                width: 0,
                color: "#000000"
              },
            },
            opacity: {
              value: 0.1,
              random: true,
              anim: {
                enable: true,
                speed: 1,
                opacity_min: 0.05,
                sync: false
              }
            },
            size: {
              value: 50,
              random: true,
              anim: {
                enable: true,
                speed: 2,
                size_min: 30,
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
              onclick: {
                enable: false,
                mode: "push"
              },
              resize: true
            },
            modes: {
              grab: {
                distance: 150,
                line_linked: {
                  opacity: 0.2
                }
              }
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
          zIndex: -1
        }}
      />
      <NavBar />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <DemoChartsSection />
      <UseCasesSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  );
};

const NavBar = () => {
  return (
    <nav className="flex justify-between items-center px-6 md:px-20 py-4 backdrop-blur-md bg-white bg-opacity-90 fixed w-full z-50 shadow-sm">
      <div className="flex items-center">
        <span className="text-2xl font-bold text-blue-600">QUANTARA</span>
      </div>
      <div className="hidden md:flex space-x-8">
        <NavLink text="Features" />
        <NavLink text="How It Works" />
        <NavLink text="Use Cases" />
        <NavLink text="Pricing" />
      </div>
      <div className="flex space-x-4">
        <button className="px-4 py-2 rounded-md text-gray-800 hover:text-blue-600 transition duration-300">Login</button>
        <button className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition duration-300">Get Started</button>
      </div>
    </nav>
  );
};

const NavLink = ({ text }) => (
  <a href="#" className="text-gray-600 hover:text-blue-600 transition duration-300">{text}</a>
);

const HeroSection = () => {
  return (
    <div className="pt-32 pb-20 px-6 md:px-20 flex flex-col md:flex-row items-center justify-between">
      <motion.div 
        className="md:w-1/2 mb-10 md:mb-0"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6 text-gray-900">
          Quantify Risk. <br />
          <span className="text-blue-600">
            Optimize Returns.
          </span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-8">
          Advanced Monte Carlo simulations to model financial uncertainty 
          and guide your investment decisions with data-driven insights.
        </p>
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <button className="px-8 py-3 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition duration-300 font-medium text-lg">
            Start Free Trial
          </button>
          <button className="px-8 py-3 rounded-md border border-blue-600 text-blue-600 hover:bg-blue-50 transition duration-300 font-medium text-lg">
            Watch Demo
          </button>
        </div>
      </motion.div>
      <motion.div 
        className="md:w-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <div className="relative max-w-lg mx-auto">
          <Lottie 
            animationData={financialAnimation} 
            className="w-full"
          />
        </div>
      </motion.div>
    </div>
  );
};

// New statistics section with animated counters
const StatsSection = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section className="py-12 bg-blue-50">
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <div 
          ref={ref} 
          className="grid grid-cols-1 md:grid-cols-4 gap-8"
        >
          <StatCard 
            value={5000} 
            label="Simulations per Analysis" 
            icon={<FaChartLine className="text-blue-600" />}
            inView={inView}
          />
          <StatCard 
            value={99.8} 
            label="Accuracy Rate" 
            suffix="%" 
            icon={<FaShieldAlt className="text-blue-600" />}
            inView={inView}
          />
          <StatCard 
            value={500} 
            label="Financial Institutions" 
            suffix="+" 
            icon={<FaChartPie className="text-blue-600" />}
            inView={inView}
          />
          <StatCard 
            value={2.5} 
            label="Billion in Assets Analyzed" 
            suffix="B+" 
            icon={<BiAnalyse className="text-blue-600" />}
            inView={inView}
          />
        </div>
      </div>
    </section>
  );
};

const StatCard = ({ value, label, suffix = "", icon, inView }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm text-center">
      <div className="flex justify-center mb-3">
        <div className="p-3 bg-blue-50 rounded-full">
          {React.cloneElement(icon, { size: 24 })}
        </div>
      </div>
      <h3 className="text-3xl font-bold text-gray-900 mb-2 flex justify-center items-end">
        {inView ? (
          <CountUp 
            end={value} 
            duration={2.5} 
            separator="," 
            decimals={value % 1 !== 0 ? 1 : 0}
          />
        ) : (
          <span>0</span>
        )}
        <span className="text-blue-600 ml-1">{suffix}</span>
      </h3>
      <p className="text-gray-600">{label}</p>
    </div>
  );
};

const FeatureCard = ({ icon, title, description, delay }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay }}
      className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
    >
      <div className="flex items-center mb-4">
        <div className="p-3 bg-blue-50 rounded-lg mr-4">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
      </div>
      <p className="text-gray-600">{description}</p>
    </motion.div>
  );
};

const FeaturesSection = () => {
  const features = [
    {
      icon: <FaChartLine size={24} className="text-blue-600" />,
      title: "Portfolio Projections",
      description: "Visualize your portfolio's future value across thousands of simulated market scenarios.",
      delay: 0.1
    },
    {
      icon: <FaShieldAlt size={24} className="text-blue-600" />,
      title: "Risk Quantification",
      description: "Measure your potential downside with industry-standard Value at Risk (VaR) metrics.",
      delay: 0.2
    },
    {
      icon: <BiAnalyse size={24} className="text-blue-600" />,
      title: "Probabilistic Analysis",
      description: "Understand the full distribution of possible outcomes for your investment strategies.",
      delay: 0.3
    },
    {
      icon: <FaChartPie size={24} className="text-blue-600" />,
      title: "Scenario Modeling",
      description: "Test how your portfolio might perform under specific market conditions and stress tests.",
      delay: 0.4
    }
  ];

  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section className="py-20 px-6 md:px-20 bg-gray-50" id="features">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Powerful Features</h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          QUANTARA combines sophisticated financial modeling with an intuitive interface to give you insights that drive better investment decisions.
        </p>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <FeatureCard key={index} {...feature} />
        ))}
      </div>
    </section>
  );
};

const icons = {
  dataCollection: (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 51H13.3333C11.4924 51 9.7254 50.2625 8.42513 48.9622C7.12487 47.6619 6.38733 45.895 6.38733 44V14C6.38733 12.105 7.12487 10.3381 8.42513 9.03781C9.7254 7.73755 11.4924 7 13.3333 7H50.6667C52.5076 7 54.2746 7.73755 55.5749 9.03781C56.8751 10.3381 57.6127 12.105 57.6127 14V27" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6.38733 20H57.6127" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M44 47.6667C49.8839 47.6667 54.6667 42.8839 54.6667 37C54.6667 31.1161 49.8839 26.3333 44 26.3333C38.1161 26.3333 33.3333 31.1161 33.3333 37C33.3333 42.8839 38.1161 47.6667 44 47.6667Z" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M57.6127 57.0001L50.6667 50.0541" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  simulation: (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 56V35.2C8 33.5333 8.42933 32.2 9.288 31.2C10.1467 30.2 11.3333 29.6667 12.8 29.3333L26.6667 26.6667C27.6 26.5333 28.4 26.1333 29.0667 25.4667C29.7333 24.8 30.0667 24 30.0667 23.0667V8" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21.3333 8H30.0667" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M30.0667 15.4667V8" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 56L24 40L34.6667 45.3333L48 32L56 37.3333" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 56L18.6667 50.6667L26.6667 56L37.3333 48L45.3333 53.3333L56 45.3333" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  analysis: (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 58.6667C46.7276 58.6667 58.6667 46.7276 58.6667 32C58.6667 17.2724 46.7276 5.33334 32 5.33334C17.2724 5.33334 5.33333 17.2724 5.33333 32C5.33333 46.7276 17.2724 58.6667 32 58.6667Z" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M32 16V32L42.6667 37.3333" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21.3333 48C23.5428 45.414 26.6393 43.4116 30.1333 42.3333" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  visualization: (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 53.3333H13.3333C11.4924 53.3333 9.7254 52.5958 8.42513 51.2955C7.12487 49.9953 6.38733 48.2283 6.38733 46.3873V17.6127C6.38733 15.7717 7.12487 14.0047 8.42513 12.7045C9.7254 11.4042 11.4924 10.6667 13.3333 10.6667H50.6667C52.5076 10.6667 54.2746 11.4042 55.5749 12.7045C56.8751 14.0047 57.6127 15.7717 57.6127 17.6127V32" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16 7V14.3333" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M48 7V14.3333" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6.38733 24H57.6127" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M48 48C53.5228 48 58 43.5228 58 38C58 32.4772 53.5228 28 48 28C42.4772 28 38 32.4772 38 38C38 43.5228 42.4772 48 48 48Z" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M48 58V48" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M38 38H48" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M53.6567 43.6567L48 48" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

const HowItWorksSection = () => {
  const steps = [
    {
      number: "01",
      title: "Data Collection",
      description: "We fetch real-time market data from trusted sources like Yahoo! Finance to ensure your simulations are grounded in the most current and accurate information available.",
      icon: icons.dataCollection
    },
    {
      number: "02",
      title: "Monte Carlo Simulation",
      description: "Our powerful engine runs thousands of possible future price paths, meticulously modeled on historical volatility and asset correlations to map out a full spectrum of potential outcomes.",
      icon: icons.simulation
    },
    {
      number: "03",
      title: "Risk Analysis",
      description: "We distill complex data into key risk metrics, including Value at Risk (VaR) and Expected Shortfall (ES), giving you a clear, quantitative measure of potential portfolio losses.",
      icon: icons.analysis
    },
    {
      number: "04",
      title: "Visualization & Insights",
      description: "Complex results are transformed into intuitive charts and actionable reports. Our clear, compelling visualizations empower you to make smarter, data-driven decisions with confidence.",
      icon: icons.visualization
    }
  ];

  const [currentStep, setCurrentStep] = useState(0);
  
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50" id="how-it-works">
      <div className="max-w-6xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">How It Works</h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto mt-4">
            Our platform leverages cutting-edge financial modeling techniques to provide you with robust risk insights in four simple steps.
          </p>
        </motion.div>

        {/* Interactive steps indicator with labels */}
        <div className="mb-12 hidden md:block">
          <div className="relative flex justify-between items-center">
            <div className="absolute left-0 top-[1.1rem] w-full h-0.5 bg-slate-200" />
            <motion.div 
              className="absolute left-0 top-[1.1rem] h-0.5 bg-blue-600"
              animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
            {steps.map((step, index) => (
              <div key={index} className="relative z-10 text-center">
                <button
                  onClick={() => setCurrentStep(index)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out ${
                    index <= currentStep ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-500 border-2 border-slate-200'
                  }`}
                >
                  <span className="text-sm font-bold">{index + 1}</span>
                </button>
                <p className={`mt-2 text-sm font-medium transition-colors duration-300 ${index <= currentStep ? 'text-blue-600' : 'text-slate-400'}`}>
                  {step.title}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden ring-1 ring-slate-900/5">
          <div className="grid grid-cols-1 md:grid-cols-2 min-h-[480px]">
            {/* Left side - Icon display */}
            <div className="bg-slate-100 p-8 md:p-12 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div 
                  key={`icon-${currentStep}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.4, ease: "backOut" }}
                  className="relative w-48 h-48 flex items-center justify-center"
                >
                  <div className="absolute inset-0 bg-white rounded-full" />
                  <div className="relative text-blue-600">
                    {steps[currentStep].icon}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
            
            {/* Right side - Content display */}
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`content-${currentStep}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                >
                  <span className="text-sm font-bold text-blue-600 uppercase tracking-wider">{`Step ${steps[currentStep].number}`}</span>
                  <h3 className="text-2xl font-bold mt-2 mb-4 text-slate-900">
                    {steps[currentStep].title}
                  </h3>
                  <p className="text-slate-600 text-base leading-relaxed">
                    {steps[currentStep].description}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex justify-between mt-8 pt-6 border-t border-slate-200">
                <button 
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  disabled={currentStep === 0}
                  className="px-4 py-2 flex items-center text-sm font-medium rounded-md disabled:text-slate-400 disabled:cursor-not-allowed text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Previous
                </button>
                
                <button 
                  onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                  disabled={currentStep === steps.length - 1}
                  className="px-4 py-2 flex items-center text-sm font-medium rounded-md disabled:text-slate-400 disabled:cursor-not-allowed text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Next
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// New section with interactive charts
const DemoChartsSection = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [activeScenario, setActiveScenario] = useState(0);

  // Convert the scenario data to the format required by Recharts
  const scenarioData = sampleScenarios[activeScenario].values.map((value, index) => ({
    month: index + 1,
    value: value
  }));

  return (
    <section className="py-20 px-6 md:px-20 bg-gray-50" id="demo-charts">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Visualize Your Investment Future</h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Our sophisticated models help you see potential outcomes under different market conditions.
        </p>
      </motion.div>

      <div className="max-w-6xl mx-auto bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-gray-100">
        <div className="mb-8 flex flex-wrap justify-center gap-4">
          {sampleScenarios.map((scenario, index) => (
            <button
              key={index}
              onClick={() => setActiveScenario(index)}
              className={`px-6 py-3 rounded-lg transition-all duration-300 ${
                activeScenario === index 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {scenario.name} Scenario
            </button>
          ))}
        </div>
        
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={scenarioData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="month" 
                label={{ value: 'Months', position: 'insideBottom', offset: -10 }} 
              />
              <YAxis 
                label={{ value: 'Portfolio Value ($)', angle: -90, position: 'insideLeft' }} 
              />
              <Tooltip 
                formatter={(value) => [`$${value.toLocaleString()}`, 'Portfolio Value']}
                labelFormatter={(label) => `Month ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#3b82f6" 
                strokeWidth={3} 
                dot={{ fill: '#3b82f6', r: 6 }}
                activeDot={{ r: 8, fill: '#2563eb' }}
                animationDuration={2000}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-8 text-center text-gray-600">
          <p className="text-lg font-medium text-gray-900 mb-2">{sampleScenarios[activeScenario].name} Scenario</p>
          <p>Starting value: ${sampleScenarios[activeScenario].values[0].toLocaleString()}</p>
          <p>Ending value: ${sampleScenarios[activeScenario].values[sampleScenarios[activeScenario].values.length - 1].toLocaleString()}</p>
        </div>
      </div>
    </section>
  );
};

// New testimonials section with slider
const TestimonialsSection = () => {
  const testimonials = [
    {
      quote: "QUANTARA's Monte Carlo simulations have completely transformed our approach to risk management. We've been able to identify vulnerabilities we never would have seen otherwise.",
      author: "Sarah Johnson",
      title: "Chief Investment Officer, Apex Capital"
    },
    {
      quote: "The level of detail in QUANTARA's analysis is exceptional. It's like having a crystal ball that shows you thousands of possible futures for your portfolio.",
      author: "Michael Chen",
      title: "Portfolio Manager, Horizon Investments"
    },
    {
      quote: "We've reduced our downside risk by 23% since implementing QUANTARA's recommendations. The ROI has been remarkable.",
      author: "David Williams",
      title: "Risk Manager, Everest Financial"
    },
  ];

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 6000,
  };

  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section className="py-20 px-6 md:px-20 bg-white" id="testimonials">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Trusted by Industry Leaders</h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          See what financial professionals are saying about QUANTARA's impact on their investment strategies.
        </p>
      </motion.div>

      <div className="max-w-4xl mx-auto">
        <Slider {...sliderSettings}>
          {testimonials.map((testimonial, index) => (
            <div key={index} className="px-4">
              <div className="bg-blue-50 p-8 md:p-12 rounded-2xl relative">
                <svg className="h-12 w-12 text-blue-200 absolute top-6 left-6 opacity-50" fill="currentColor" viewBox="0 0 32 32">
                  <path d="M10 8c-3.3 0-6 2.7-6 6v10h10V14H8c0-1.1 0.9-2 2-2V8zm12 0c-3.3 0-6 2.7-6 6v10h10V14h-6c0-1.1 0.9-2 2-2V8z"/>
                </svg>
                
                <div className="relative z-10">
                  <p className="text-xl text-gray-700 italic mb-6 mt-4">{testimonial.quote}</p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                      {testimonial.author.split(' ').map(name => name[0]).join('')}
                    </div>
                    <div className="ml-4">
                      <p className="font-bold text-gray-900">{testimonial.author}</p>
                      <p className="text-gray-600">{testimonial.title}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
};

// New section for use cases
const UseCasesSection = () => {
  const useCases = [
    {
      icon: <BsGraphUp size={36} className="text-blue-600" />,
      title: "Portfolio Risk Assessment",
      description: "Understand the potential downside of your investment portfolio and identify vulnerabilities before they impact your returns.",
      delay: 0.1
    },
    {
      icon: <FaRobot size={36} className="text-blue-600" />,
      title: "Financial Decision Support",
      description: "Make data-driven investment decisions by comparing the risk-return profiles of different portfolio allocations.",
      delay: 0.2
    },
    {
      icon: <BsLightningCharge size={36} className="text-blue-600" />,
      title: "Scenario Modeling",
      description: "Test how your portfolio might perform during market crashes, interest rate changes, or other economic scenarios.",
      delay: 0.3
    }
  ];

  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section className="py-20 px-6 md:px-20 bg-gray-50" id="use-cases">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Use Cases</h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          QUANTARA supports a wide range of financial decision-making processes with its powerful analytics.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {useCases.map((useCase, index) => (
          <UseCaseCard key={index} {...useCase} />
        ))}
      </div>
    </section>
  );
};

const UseCaseCard = ({ icon, title, description, delay }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay }}
      className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center"
    >
      <div className="flex justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-gray-900">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </motion.div>
  );
};

const CTASection = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section className="py-20 px-6 md:px-20 bg-white">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.6 }}
        className="max-w-5xl mx-auto bg-blue-50 p-10 md:p-16 rounded-2xl relative overflow-hidden shadow-sm"
      >
        <div className="relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center text-gray-900">Ready to Transform Your Investment Strategy?</h2>
          <p className="text-xl text-gray-600 mb-10 text-center max-w-3xl mx-auto">
            Join thousands of investors who are making smarter decisions with QUANTARA's powerful risk analytics.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button className="px-8 py-3 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition duration-300 font-medium text-lg flex items-center justify-center">
              Get Started <FaArrowRight className="ml-2" />
            </button>
            <button className="px-8 py-3 rounded-md border border-blue-600 text-blue-600 hover:bg-blue-50 transition duration-300 font-medium text-lg">
              Schedule Demo
            </button>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="py-12 px-6 md:px-20 bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-1">
            <h3 className="text-2xl font-bold text-blue-600 mb-4">QUANTARA</h3>
            <p className="text-gray-500 mb-4">Advanced financial risk analytics powered by Monte Carlo simulations.</p>
            <div className="flex space-x-4">
              <SocialIcon />
              <SocialIcon />
              <SocialIcon />
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-gray-900">Product</h4>
            <ul className="space-y-2">
              <FooterLink text="Features" />
              <FooterLink text="Pricing" />
              <FooterLink text="API" />
              <FooterLink text="Documentation" />
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-gray-900">Company</h4>
            <ul className="space-y-2">
              <FooterLink text="About Us" />
              <FooterLink text="Careers" />
              <FooterLink text="Blog" />
              <FooterLink text="Contact" />
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-gray-900">Legal</h4>
            <ul className="space-y-2">
              <FooterLink text="Privacy Policy" />
              <FooterLink text="Terms of Service" />
              <FooterLink text="Cookie Policy" />
              <FooterLink text="Disclaimer" />
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 text-center text-gray-500">
          <p>© {new Date().getFullYear()} QUANTARA. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

const SocialIcon = () => (
  <a href="#" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition duration-300">
    <span className="sr-only">Social media</span>
  </a>
);

const FooterLink = ({ text }) => (
  <li>
    <a href="#" className="text-gray-500 hover:text-blue-600 transition duration-300">{text}</a>
  </li>
);


export default LandingPage;
