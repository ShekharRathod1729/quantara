import { useState } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx'
import LoginPage from './pages/LoginPage.jsx';
import MainPage from './pages/MainPage.jsx';



function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/home" element={<MainPage />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
