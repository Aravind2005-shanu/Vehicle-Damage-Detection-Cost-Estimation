import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './HomePage.css';

const StatCard = ({ emoji, value, label, color }) => (
  <div className="stat-card glass-card">
    <div className="stat-emoji">{emoji}</div>
    <div className="stat-value" style={{ color }}>{value}</div>
    <div className="stat-label">{label}</div>
  </div>
);

const FeatureCard = ({ emoji, title, desc, delay }) => (
  <div className="feature-card glass-card" style={{ animationDelay: `${delay}ms` }}>
    <div className="feature-emoji">{emoji}</div>
    <h3 className="feature-title">{title}</h3>
    <p className="feature-desc">{desc}</p>
  </div>
);

const StepCard = ({ step, emoji, title, desc }) => (
  <div className="step-card">
    <div className="step-number">{step}</div>
    <div className="step-emoji">{emoji}</div>
    <h3 className="step-title">{title}</h3>
    <p className="step-desc">{desc}</p>
  </div>
);

const HomePage = () => {
  const [stats, setStats] = useState(null);
  const [backendOnline, setBackendOnline] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await axios.get('/api/health');
        setBackendOnline(true);
        const res = await axios.get('/api/stats');
        setStats(res.data);
      } catch {
        setBackendOnline(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="home-page" style={{ position: 'relative', zIndex: 1 }}>
      {/* ── HERO ── */}
      <section className="hero-section">
        <div className="hero-badge">
          <span className="pulse-dot" />
          <span>
            {backendOnline === null
              ? '⏳ Connecting to AI Engine...'
              : backendOnline
              ? '🟢 AI Engine Online'
              : '🔴 Backend Offline — Start Flask server'}
          </span>
        </div>

        <h1 className="hero-title">
          <span className="hero-title-line">Detect Vehicle Damage &</span>
          <span className="hero-title-accent neon-text-cyan">Repair Cost Instantly</span>
          <span className="hero-title-line">with AI Precision</span>
        </h1>

        <p className="hero-subtitle">
          Upload a photo of your car  — our AI scans for damage,
          classifies severity, and gives you an <strong>instant repair cost estimate</strong> powered
          by advanced language models. 🚗⚡
        </p>

        <div className="hero-actions">
          <Link to="/detect" className="btn-primary btn-large">
            🔍 Start Scanning
          </Link>
          <Link to="/history" className="btn-secondary btn-large">
            📋 View History
          </Link>
        </div>

        {/* Animated car graphic */}
        <div className="hero-visual">
          <div className="scan-animation">
            <div className="scan-frame">
              <div className="scan-corner tl" />
              <div className="scan-corner tr" />
              <div className="scan-corner bl" />
              <div className="scan-corner br" />
              <div className="scan-car">🚗</div>
              <div className="scan-beam" />
            </div>
            <div className="scan-labels">
              <span className="scan-label" style={{ top: '20%', left: '-30%' }}>
                🔴 Dent Detected
              </span>
              <span className="scan-label" style={{ top: '60%', right: '-30%' }}>
                🟡 Scratch Found
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      {stats && (
        <section className="stats-section page-container">
          <div className="stats-grid">
            <StatCard emoji="🔬" value={stats.total_inspections} label="Total Inspections" color="#00f5ff" />
            <StatCard emoji="⚠️" value={stats.damaged_count} label="Damage Found" color="#ff6b35" />
            <StatCard emoji="✅" value={stats.undamaged_count} label="Clean Vehicles" color="#39ff14" />
            <StatCard emoji="🚗" value={stats.by_vehicle_type?.car || 0} label="Cars Scanned" color="#00f5ff" />
           { /* <StatCard emoji="🏍️" value={stats.by_vehicle_type?.bike || 0} label="Bikes Scanned" color="#ff6b35" /> */}
          </div>
        </section>
      )}

      {/* ── HOW IT WORKS ── */}
      <section className="how-section page-container">
        <div className="section-header">
          <h2 className="section-title neon-text-cyan">⚡ How It Works</h2>
          <p className="section-subtitle">
            Three simple steps to get your vehicle damage report in seconds
          </p>
        </div>
        <div className="steps-grid">
          <StepCard step="01" emoji="📸" title="Upload Photo" desc="Take a clear photo of the damaged vehicle part and upload it to our system." />
          <StepCard step="02" emoji="🤖" title="AI Analyzes" desc="Our YOLO neural network scans every pixel, detecting dents, scratches, and breaks." />
          <StepCard step="03" emoji="💰" title="Get Estimate" desc="Receive a detailed repair cost estimate in INR, powered by LLM reasoning." />
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="features-section page-container">
        <div className="section-header">
          <h2 className="section-title">🛡️ <span className="neon-text-orange">Capabilities</span></h2>
          <p className="section-subtitle">Industry-grade AI built for insurance, repair shops & fleet managers</p>
        </div>
        <div className="features-grid">
          <FeatureCard emoji="🎯" title="YOLO Detection" desc="Real-time object detection identifies damage zones with bounding boxes and confidence scores." delay={0} />
          <FeatureCard emoji="🚗" title="Car Detection" desc="Trained specifically on automotive damage patterns — dents, scratches, cracks, and more." delay={100} />
          <FeatureCard emoji="🏍️" title="Bike Detection (Soon)" desc="Motorcycle damage model coming soon. " delay={200} />
          <FeatureCard emoji="💬" title="LLM Cost AI" desc="OpenRouter-powered language model generates accurate, contextual repair cost ranges in INR." delay={300} />
          <FeatureCard emoji="🗄️" title="SQLite Database" desc="Every inspection is saved with full metadata, timestamps and output images for future reference." delay={400} />
          <FeatureCard emoji="📊" title="Analytics Dashboard" desc="Track inspection trends, damage rates, and vehicle statistics at a glance." delay={500} />
        </div>
      </section>

      {/* ── CTA FOOTER ── */}
      <section className="cta-section">
        <div className="cta-inner page-container">
          <h2 className="cta-title">Ready to Scan Your Vehicle?</h2>
          <p className="cta-sub">Upload a photo and get results in under 30 seconds 🚀</p>
          <Link to="/detect" className="btn-primary btn-large">
            ⚡ Launch Scanner
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;