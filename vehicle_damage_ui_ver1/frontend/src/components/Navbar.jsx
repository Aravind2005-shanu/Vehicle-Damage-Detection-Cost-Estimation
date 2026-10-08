import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { path: '/', label: 'Home', emoji: '🏠' },
    { path: '/detect', label: 'Detect', emoji: '🔍' },
    { path: '/history', label: 'History', emoji: '📋' },
    { path: '/dashboard', label: 'Dashboard', emoji: '📊' },
  ];

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo" onClick={() => setMenuOpen(false)}>
          <span className="logo-icon">🚗</span>
          <span className="logo-text">
            <span className="logo-auto">AUTO</span>
            <span className="logo-scan">SCAN</span>
            <span className="logo-ai"> AI</span>
          </span>
          <span className="logo-version">v1.0</span>
        </Link>

        {/* Desktop Links */}
        <div className="navbar-links">
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
            >
              <span className="nav-emoji">{link.emoji}</span>
              {link.label}
              {location.pathname === link.path && <span className="active-indicator" />}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <Link to="/detect" className="navbar-cta btn-primary">
          ⚡ Scan Now
        </Link>

        {/* Mobile Toggle */}
        <button
          className="mobile-toggle"
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
        >
          <span className={`hamburger ${menuOpen ? 'open' : ''}`}>
            <span /><span /><span />
          </span>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mobile-menu">
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`mobile-nav-link ${location.pathname === link.path ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {link.emoji} {link.label}
            </Link>
          ))}
          <Link to="/detect" className="btn-primary mobile-cta" onClick={() => setMenuOpen(false)}>
            ⚡ Scan Now
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;