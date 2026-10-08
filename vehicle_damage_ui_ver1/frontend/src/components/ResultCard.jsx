import React, { useState } from 'react';
import './ResultCard.css';

const ResultCard = ({ result, vehicleType, brand, model, part, year, onReset }) => {
  const [imgFullscreen, setImgFullscreen] = useState(false);

  const {
    damaged,
    damage_types = [],
    damage_count = 0,
    cost_estimate = '',
    output_image_base64,
    record_id,
    timestamp,
  } = result;

  // Parse severity from cost estimate text
  const getSeverityInfo = () => {
    const text = cost_estimate.toLowerCase();
    if (text.includes('severe') || text.includes('major')) return { level: 'Severe', color: '#ff003c', emoji: '🔴' };
    if (text.includes('moderate') || text.includes('medium')) return { level: 'Moderate', color: '#ff6b35', emoji: '🟠' };
    if (text.includes('minor') || text.includes('light')) return { level: 'Minor', color: '#f5c518', emoji: '🟡' };
    return { level: 'Detected', color: '#ff6b35', emoji: '⚠️' };
  };

  const severity = damaged ? getSeverityInfo() : { level: 'Clean', color: '#39ff14', emoji: '✅' };

  return (
    <div className={`result-card ${damaged ? 'result-damaged' : 'result-clean'}`}>
      {/* ── Header ── */}
      <div className="result-header">
        <div className="result-status">
          <span className="status-emoji">{severity.emoji}</span>
          <div>
            <div className="status-label" style={{ color: severity.color }}>
              {damaged ? '⚠️ Damage Detected' : '✅ No Damage Found'}
            </div>
            <div className="status-severity" style={{ color: severity.color }}>
              Severity: {severity.level}
            </div>
          </div>
        </div>

        <div className="result-record">
          <span className="record-label">Record ID</span>
          <span className="record-id">{record_id?.slice(0, 12)}...</span>
        </div>
      </div>

      {/* ── Vehicle Info ── */}
      <div className="result-vehicle-info">
        <span className="badge badge-cyan">{vehicleType === 'car' ? '🚗' : '🏍️'} {vehicleType}</span>
        <span className="badge badge-cyan">{brand}</span>
        <span className="badge badge-cyan">{model}</span>
        <span className="badge badge-orange">{part}</span>
        <span className="badge badge-cyan">{year}</span>
      </div>

      {/* ── Detection Stats ── */}
      <div className="detection-stats">
        <div className="det-stat">
          <div className="det-stat-value" style={{ color: damaged ? '#ff6b35' : '#39ff14' }}>
            {damage_count}
          </div>
          <div className="det-stat-label">Damages Found</div>
        </div>
        <div className="det-stat">
          <div className="det-stat-value" style={{ color: '#00f5ff' }}>
            {damage_types.length}
          </div>
          <div className="det-stat-label">Damage Types</div>
        </div>
        <div className="det-stat">
          <div className="det-stat-value" style={{ color: severity.color }}>
            {severity.level}
          </div>
          <div className="det-stat-label">Severity</div>
        </div>
      </div>

      {/* ── Damage Types ── */}
      {damage_types.length > 0 && (
        <div className="damage-types-section">
          <div className="section-mini-title">🔎 Detected Damage Types</div>
          <div className="damage-tags">
            {damage_types.map((dtype, i) => (
              <span key={i} className="badge badge-orange damage-tag">
                ⚠️ {dtype}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Output Image ── */}
      {output_image_base64 && (
        <div className="result-image-section">
          <div className="section-mini-title">📸 AI Annotated Image</div>
          <div className="result-image-container" onClick={() => setImgFullscreen(true)}>
            <img
              src={output_image_base64}
              alt="Damage detection result"
              className="result-image"
            />
            <div className="image-overlay">
              <span>🔍 Click to expand</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Cost Estimate ── */}
      <div className="cost-section">
        <div className="section-mini-title">💰 AI Repair Cost Estimate</div>
        <div className="cost-box">
          <div className="cost-content">
            {cost_estimate.split('\n').map((line, i) => (
              line.trim() ? (
                <p key={i} className={`cost-line ${i === 0 ? 'cost-main' : 'cost-detail'}`}>
                  {line}
                </p>
              ) : <br key={i} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="result-footer">
        <div className="result-timestamp">
          🕐 {timestamp ? new Date(timestamp).toLocaleString() : 'Just now'}
        </div>
        <div className="result-actions">
          <button className="btn-secondary" onClick={onReset} style={{ padding: '10px 20px', fontSize: '0.85rem' }}>
            🔄 New Scan
          </button>
          <button
            className="btn-primary"
            onClick={() => window.print()}
            style={{ padding: '10px 20px', fontSize: '0.85rem' }}
          >
            🖨️ Print Report
          </button>
        </div>
      </div>

      {/* ── Fullscreen Modal ── */}
      {imgFullscreen && (
        <div className="fullscreen-modal" onClick={() => setImgFullscreen(false)}>
          <div className="fullscreen-inner">
            <img src={output_image_base64} alt="Fullscreen result" />
            <button className="fullscreen-close" onClick={() => setImgFullscreen(false)}>✕ Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultCard;