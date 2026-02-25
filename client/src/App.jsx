import { useState } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx'
import LoginPage from './pages/LoginPage.jsx';
import MainPage from './pages/MainPage.jsx';
import MultipleStocks from './pages/MultipleStocks.jsx';
import Testing from './pages/Testing.jsx';



function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/single" element={<MainPage />} />
          <Route path="/multiple" element={<MultipleStocks />} />
          <Route path="/testing" element={<Testing />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
