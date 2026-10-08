import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './HistoryPage.css';

const HistoryCard = ({ record, onExpand, onDelete }) => {
  const dtypes = Array.isArray(record.damage_types) ? record.damage_types : [];
  const isClean = !record.damaged;

  return (
    <div className={`history-card glass-card ${isClean ? 'card-clean' : 'card-damaged'}`}>
      <div className="hcard-header">
        <div className="hcard-vehicle">
          <span className="hcard-type-icon">{record.vehicle_type === 'car' ? '🚗' : '🏍️'}</span>
          <div>
            <div className="hcard-name">
              {record.brand} {record.model_name}
            </div>
            <div className="hcard-sub">{record.year} · {record.part_name}</div>
          </div>
        </div>
        <div className={`hcard-status ${isClean ? 'status-clean' : 'status-damaged'}`}>
          {isClean ? '✅ Clean' : '⚠️ Damaged'}
        </div>
      </div>

      {!isClean && (
        <div className="hcard-tags">
          {dtypes.map((t, i) => (
            <span key={i} className="badge badge-orange" style={{ fontSize: '0.72rem' }}>
              {t}
            </span>
          ))}
          <span className="badge badge-red" style={{ fontSize: '0.72rem' }}>
            {record.damage_count} area(s)
          </span>
        </div>
      )}

      <div className="hcard-footer">
        <span className="hcard-time">
          🕐 {new Date(record.created_at).toLocaleString()}
        </span>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="hcard-btn btn-primary" onClick={() => onExpand(record)}>
            View →
          </button>

          <button
            className="hcard-btn"
            style={{ background: '#ff4d4f', color: '#fff' }}
            onClick={() => onDelete(record.record_id)}
          >
            ❌ Delete
          </button>
        </div>
      </div>

      {record.output_image_base64 && (
        <div className="hcard-thumb">
          <img src={record.output_image_base64} alt="Result thumbnail" />
        </div>
      )}
    </div>
  );
};

const ExpandedModal = ({ record, onClose }) => {
  if (!record) return null;
  const dtypes = Array.isArray(record.damage_types) ? record.damage_types : [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕ Close</button>

        <h2 className="modal-title">
          {record.vehicle_type === 'car' ? '🚗' : '🏍️'} {record.brand} {record.model_name}
        </h2>

        <div className="modal-grid">
          <div className="modal-info">
            <div className="info-row"><span>Year</span><b>{record.year}</b></div>
            <div className="info-row"><span>Part</span><b>{record.part_name}</b></div>
            <div className="info-row"><span>Owner</span><b>{record.owner_name || '—'}</b></div>
            <div className="info-row"><span>Contact</span><b>{record.contact || '—'}</b></div>
            <div className="info-row"><span>Damaged</span>
              <b style={{ color: record.damaged ? '#ff6b35' : '#39ff14' }}>
                {record.damaged ? '⚠️ Yes' : '✅ No'}
              </b>
            </div>
            <div className="info-row"><span>Damage Count</span><b>{record.damage_count}</b></div>
          </div>

          <div className="modal-image">
            {record.output_image_base64 && (
              <img src={record.output_image_base64} alt="Detection result" />
            )}
          </div>
        </div>

        {dtypes.length > 0 && (
          <div className="modal-section">
            <div className="modal-section-title">⚠️ Damage Types</div>
            <div className="damage-tags" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {dtypes.map((t, i) => <span key={i} className="badge badge-orange">{t}</span>)}
            </div>
          </div>
        )}

        <div className="modal-section">
          <div className="modal-section-title">💰 Cost Estimate</div>
          <div className="modal-cost">
            {record.cost_estimate?.split('\n').map((line, i) => (
              line.trim() ? <p key={i}>{line}</p> : <br key={i} />
            ))}
          </div>
        </div>

        <div className="modal-section">
          <div className="modal-section-title">🆔 Record Info</div>
          <div className="info-row">
            <span>Record ID</span>
            <b style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.8rem' }}>
              {record.record_id}
            </b>
          </div>
          <div className="info-row">
            <span>Timestamp</span>
            <b>{new Date(record.created_at).toLocaleString()}</b>
          </div>
        </div>
      </div>
    </div>
  );
};

const HistoryPage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/history');
      setRecords(res.data);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  // DELETE ALL
  const deleteAllHistory = async () => {
    if (!window.confirm("Delete ALL history?")) return;

    try {
      await axios.delete('/api/delete_all');
      setRecords([]); // clear UI
    } catch (err) {
      console.error(err);
    }
  };

  // DELETE ONE
  const deleteOne = async (id) => {
    if (!window.confirm("Delete this record?")) return;

    try {
      await axios.delete(`/api/delete/${id}`);
      setRecords(prev => prev.filter(r => r.record_id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = records.filter(r => {
    if (filter === 'car') return r.vehicle_type === 'car';
    if (filter === 'bike') return r.vehicle_type === 'bike';
    if (filter === 'damaged') return r.damaged;
    if (filter === 'clean') return !r.damaged;
    return true;
  });

  return (
    <div className="history-page page-container">

      <div className="history-header">
        <h1 className="section-title">
          📋 <span className="neon-text-cyan">Inspection</span> History
        </h1>
        <p className="section-subtitle">All past vehicle damage scans stored in your local SQLite database</p>
      </div>

      <div className="filter-bar">
        {['all', 'car',  'damaged', 'clean'].map(f => (
          <button
            key={f}
            className={`filter-btn ${filter === f ? 'filter-active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? '🌐 All' : f === 'car' ? '🚗 Cars' : f === 'damaged' ? '⚠️ Damaged' : '✅ Clean'}
          </button>
        ))}

        <button className="filter-btn refresh-btn" onClick={fetchHistory}>
          🔄 Refresh
        </button>

        <button className="filter-btn" onClick={deleteAllHistory}>
          🗑️ Clear All
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : filtered.length === 0 ? (
        <p>No records found</p>
      ) : (
        <div className="history-grid">
          {filtered.map(record => (
            <HistoryCard
              key={record.record_id}
              record={record}
              onExpand={setExpanded}
              onDelete={deleteOne}
            />
          ))}
        </div>
      )}

      {expanded && (
        <ExpandedModal record={expanded} onClose={() => setExpanded(null)} />
      )}
    </div>
  );
};

export default HistoryPage;