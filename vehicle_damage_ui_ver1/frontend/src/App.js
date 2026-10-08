import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import DetectPage from './pages/DetectPage';
import HistoryPage from './pages/HistoryPage';
import DashboardPage from './pages/DashboardPage';
import ParticleBackground from './components/ParticleBackground';
import { ToastContainer } from './components/Toast';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-root">
        <ParticleBackground />
        <Navbar />
        <ToastContainer />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/detect" element={<DetectPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
