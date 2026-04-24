import { useState } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx'
import LoginPage from './pages/LoginPage.jsx';
import SimulateStocks from './pages/SimulateStocks.jsx';
import OptionPricing from './pages/OptionPricing.jsx';
import Testing from './pages/Testing.jsx';

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/simulate" element={<SimulateStocks />} />
          <Route path="/options" element={<OptionPricing />} />
          <Route path="/testing" element={<Testing />} />
          {/* Legacy redirects */}
          <Route path="/single" element={<Navigate to="/simulate" replace />} />
          <Route path="/multiple" element={<Navigate to="/simulate" replace />} />
          <Route path="/european" element={<Navigate to="/options" replace />} />
          <Route path="/american" element={<Navigate to="/options" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
