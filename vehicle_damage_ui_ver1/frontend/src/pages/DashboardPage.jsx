import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DashboardPage.css';

const BigStat = ({ emoji, value, label, color, sublabel }) => (
  <div className="big-stat glass-card">
    <div className="big-stat-emoji">{emoji}</div>
    <div className="big-stat-value" style={{ color }}>{value}</div>
    <div className="big-stat-label">{label}</div>
    {sublabel && <div className="big-stat-sub">{sublabel}</div>}
  </div>
);

const BarChart = ({ title, data, total }) => (
  <div className="chart-card glass-card">
    <h3 className="chart-title">{title}</h3>
    <div className="chart-bars">
      {data.map((item, i) => {
        const pct = total > 0 ? (item.value / total) * 100 : 0;
        return (
          <div key={i} className="chart-bar-row">
            <div className="chart-bar-label">
              <span>{item.label}</span>
              <span className="chart-bar-value">{item.value}</span>
            </div>
            <div className="chart-bar-track">
              <div
                className="chart-bar-fill"
                style={{
                  width: `${pct}%`,
                  background: item.color || 'linear-gradient(90deg, #00f5ff, #0080ff)',
                  animationDelay: `${i * 0.1}s`
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, histRes] = await Promise.all([
        axios.get('/api/stats'),
        axios.get('/api/history'),
      ]);
      setStats(statsRes.data);
      setHistory(histRes.data);
    } catch {
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  // Compute damage type frequency
  const damageTypeFreq = {};
  history.forEach(r => {
    if (Array.isArray(r.damage_types)) {
      r.damage_types.forEach(t => {
        damageTypeFreq[t] = (damageTypeFreq[t] || 0) + 1;
      });
    }
  });

  const damageTypeData = Object.entries(damageTypeFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([label, value]) => ({
      label,
      value,
      color: 'linear-gradient(90deg, #ff6b35, #ff003c)',
    }));

  // Part frequency
  const partFreq = {};
  history.forEach(r => {
    if (r.part_name) partFreq[r.part_name] = (partFreq[r.part_name] || 0) + 1;
  });

  const partData = Object.entries(partFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([label, value]) => ({
      label,
      value,
      color: 'linear-gradient(90deg, #00f5ff, #0050ff)',
    }));

  if (loading) {
    return (
      <div className="dashboard-page page-container" style={{ textAlign: 'center', paddingTop: 80 }}>
        <div className="spinner" style={{ width: 48, height: 48, margin: '0 auto 20px' }} />
        <p style={{ color: 'rgba(200,200,255,0.4)' }}>Loading dashboard data...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="dashboard-page page-container" style={{ textAlign: 'center', paddingTop: 80 }}>
        <div style={{ fontSize: '4rem', marginBottom: 20 }}>⚠️</div>
        <h2 style={{ color: '#ff6b35', fontFamily: 'Rajdhani,sans-serif', letterSpacing: 2 }}>
          Backend Offline
        </h2>
        <p style={{ color: 'rgba(200,200,255,0.5)', marginTop: 10 }}>
          Start the Flask backend server at localhost:5000
        </p>
      </div>
    );
  }

  const damageRate = stats.total_inspections > 0
    ? ((stats.damaged_count / stats.total_inspections) * 100).toFixed(1)
    : 0;

  const recentActivity = history.slice(0, 5);

  return (
    <div className="dashboard-page page-container" style={{ position: 'relative', zIndex: 1 }}>
      {/* Header */}
      <div className="dashboard-header">
        <h1 className="section-title">
          📊 <span className="neon-text-cyan">Analytics</span> Dashboard
        </h1>
        <p className="section-subtitle">
          Real-time insights from your SQLite database
        </p>
        <button className="btn-secondary" onClick={fetchData} style={{ marginTop: 12, fontSize: '0.85rem', padding: '8px 18px' }}>
          🔄 Refresh
        </button>
      </div>

      {/* Big Stats */}
      <div className="big-stats-grid">
        <BigStat emoji="🔬" value={stats.total_inspections} label="Total Inspections" color="#00f5ff" sublabel="All time" />
        <BigStat emoji="⚠️" value={stats.damaged_count} label="Damage Detected" color="#ff6b35" sublabel={`${damageRate}% rate`} />
        <BigStat emoji="✅" value={stats.undamaged_count} label="Clean Vehicles" color="#39ff14" sublabel="No damage found" />
        <BigStat emoji="🚗" value={stats.by_vehicle_type?.car || 0} label="Cars Scanned" color="#00f5ff" />
        {/* <BigStat emoji="🏍️" value={stats.by_vehicle_type?.bike || 0} label="Bikes Scanned" color="#ff6b35" /> */}
        <BigStat emoji="📈" value={`${damageRate}%`} label="Damage Rate" color={damageRate > 50 ? '#ff003c' : '#39ff14'} sublabel="of all scans" />
      </div>

      {/* Charts Row */}
      <div className="charts-row">
        {damageTypeData.length > 0 ? (
          <BarChart
            title="⚠️ Top Damage Types"
            data={damageTypeData}
            total={history.length}
          />
        ) : (
          <div className="chart-card glass-card" style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>📊</div>
            <p style={{ color: 'rgba(200,200,255,0.4)' }}>No damage data yet</p>
          </div>
        )}

        {partData.length > 0 ? (
          <BarChart
            title="🔩 Most Affected Parts"
            data={partData}
            total={history.length}
          />
        ) : (
          <div className="chart-card glass-card" style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>🔩</div>
            <p style={{ color: 'rgba(200,200,255,0.4)' }}>No part data yet</p>
          </div>
        )}
      </div>

      {/* Vehicle Type Distribution */}
      <div className="vehicle-distribution glass-card">
        <h3 className="chart-title">🚗  Vehicle Distribution</h3>
        <div className="donut-row">
          <div className="donut-section">
            <div className="donut-value neon-text-cyan">
              {stats.total_inspections > 0
                ? `${(((stats.by_vehicle_type?.car || 0) / stats.total_inspections) * 100).toFixed(0)}%`
                : '0%'}
            </div>
            <div className="donut-label">🚗 Cars</div>
          </div>
          {/*<div className="donut-divider" />
          <div className="donut-section">
            <div className="donut-value neon-text-orange">
              {stats.total_inspections > 0
                ? `${(((stats.by_vehicle_type?.bike || 0) / stats.total_inspections) * 100).toFixed(0)}%`
                : '0%'}
            </div>
            <div className="donut-label">🏍️ Bikes</div>
          </div>*/}
          <div className="donut-divider" />
          <div className="donut-section">
            <div className="donut-value" style={{ color: '#ff6b35' }}>{damageRate}%</div>
            <div className="donut-label">⚠️ Damage Rate</div>
          </div>
          <div className="donut-divider" />
          <div className="donut-section">
            <div className="donut-value" style={{ color: '#39ff14' }}>
              {(100 - parseFloat(damageRate)).toFixed(1)}%
            </div>
            <div className="donut-label">✅ Clean Rate</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="dist-bar-wrapper">
          <div className="dist-bar">
            <div
              className="dist-bar-car"
              style={{
                width: stats.total_inspections > 0
                  ? `${((stats.by_vehicle_type?.car || 0) / stats.total_inspections) * 100}%`
                  : '50%'
              }}
            />
            <div
              className="dist-bar-bike"
              style={{
                width: stats.total_inspections > 0
                  ? `${((stats.by_vehicle_type?.bike || 0) / stats.total_inspections) * 100}%`
                  : '50%'
              }}
            />
          </div>
          <div className="dist-legend">
            <span><span className="legend-dot cyan" />Cars</span>
            {/*<span><span className="legend-dot orange" />Bikes</span>*/}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <div className="recent-section">
          <h3 className="chart-title" style={{ marginBottom: 20 }}>
            🕐 Recent Inspections
          </h3>
          <div className="recent-list">
            {recentActivity.map(r => (
              <div key={r.record_id} className="recent-item glass-card">
                <span className="recent-icon">{r.vehicle_type === 'car' ? '🚗' : '🏍️'}</span>
                <div className="recent-info">
                  <div className="recent-name">{r.brand} {r.model_name} · {r.year}</div>
                  <div className="recent-meta">{r.part_name}</div>
                </div>
                <div className="recent-right">
                  <span className={`badge ${r.damaged ? 'badge-orange' : 'badge-green'}`} style={{ fontSize: '0.72rem' }}>
                    {r.damaged ? '⚠️ Damaged' : '✅ Clean'}
                  </span>
                  <div className="recent-time">
                    {new Date(r.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;