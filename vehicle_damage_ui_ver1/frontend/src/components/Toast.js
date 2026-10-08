import React, { useState, useEffect } from 'react';

// Simple global toast system (no external dependency)
let _setToasts = null;

export const toast = {
  success: (msg) => _setToasts && _setToasts(p => [...p, { id: Date.now(), msg, type: 'success' }]),
  error: (msg) => _setToasts && _setToasts(p => [...p, { id: Date.now(), msg, type: 'error' }]),
  loading: (msg) => {
    const id = Date.now();
    _setToasts && _setToasts(p => [...p, { id, msg, type: 'loading' }]);
    return id;
  },
  dismiss: (id) => _setToasts && _setToasts(p => p.filter(t => t.id !== id)),
};

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);
  _setToasts = setToasts;

  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setTimeout(() => {
      setToasts(p => p.slice(1));
    }, 3500);
    return () => clearTimeout(timer);
  }, [toasts]);

  const colors = { success: '#39ff14', error: '#ff6b35', loading: '#00f5ff' };
  const emojis = { success: '✅', error: '❌', loading: '⏳' };

  return (
    <div style={{
      position: 'fixed', top: 24, right: 24, zIndex: 99999,
      display: 'flex', flexDirection: 'column', gap: 10,
      maxWidth: 360,
    }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          background: '#0d0d2b',
          border: `1px solid ${colors[t.type]}44`,
          borderLeft: `3px solid ${colors[t.type]}`,
          borderRadius: 10,
          padding: '12px 18px',
          color: '#e0e0ff',
          fontFamily: "'Exo 2', sans-serif",
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          boxShadow: `0 4px 20px rgba(0,0,0,0.4)`,
          animation: 'slideIn 0.3s ease',
        }}>
          <span>{emojis[t.type]}</span>
          <span>{t.msg}</span>
        </div>
      ))}
      <style>{`@keyframes slideIn { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }`}</style>
    </div>
  );
}
