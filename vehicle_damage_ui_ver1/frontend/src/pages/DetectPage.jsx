import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { toast } from '../components/Toast';
import ResultCard from '../components/ResultCard';
import './DetectPage.css';

const CAR_BRANDS = [
  'Maruti Suzuki', 'Hyundai', 'Tata', 'Mahindra', 'Honda', 'Toyota',
  'Kia', 'Volkswagen', 'Skoda', 'Ford', 'Renault', 'Nissan',
  'MG', 'BMW', 'Audi', 'Mercedes-Benz', 'Jeep', 'Other'
];

const BIKE_BRANDS = [
  'Hero', 'Honda', 'Bajaj', 'TVS', 'Royal Enfield', 'Yamaha',
  'Suzuki', 'KTM', 'Jawa', 'Triumph', 'Ducati', 'Other'
];

const CAR_PARTS = [
  'Front Bumper', 'Rear Bumper', 'Hood / Bonnet', 'Trunk / Boot Lid',
  'Front Left Door', 'Front Right Door', 'Rear Left Door', 'Rear Right Door',
  'Front Left Fender', 'Front Right Fender', 'Roof', 'Windshield',
  'Rear Windshield', 'Left Headlight', 'Right Headlight', 'Left Tail Light',
  'Right Tail Light', 'Radiator Grille', 'Side Mirror (L)', 'Side Mirror (R)',
  'Left Rocker Panel', 'Right Rocker Panel', 'Wheel / Rim', 'Other'
];

const BIKE_PARTS = [
  'Front Fairing', 'Rear Fairing', 'Fuel Tank', 'Seat Panel',
  'Front Fender', 'Rear Fender', 'Headlight', 'Tail Light',
  'Exhaust Pipe', 'Handle Bar', 'Engine Cover', 'Side Panel (L)',
  'Side Panel (R)', 'Footrest', 'Windscreen', 'Other'
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 30 }, (_, i) => CURRENT_YEAR - i);

const VehicleSelector = ({ vehicleType, onSelect }) => (
  <div className="vehicle-selector">
    <h3 className="selector-title">Select Vehicle Type</h3>
    {/*<div className="vehicle-options">
      <button
        className={`vehicle-option ${vehicleType === 'car' ? 'active' : ''}`}
        onClick={() => onSelect('car')}
        type="button"
      >
        <span className="vehicle-emoji">🚗</span>
        <span className="vehicle-label">Car</span>
        <span className="vehicle-sub">4-Wheeler</span>
        {vehicleType === 'car' && <div className="vehicle-active-ring" />}
      </button>*/}
    <div className="vehicle-container">
    <button
      className={`vehicle-option ${vehicleType === 'car' ? 'active' : ''}`}
      onClick={() => onSelect('car')}
      type="button"
    >
      <span className="vehicle-emoji">🚗</span>
      <span className="vehicle-label">CAR</span>
      <span className="vehicle-sub">4-Wheeler</span>
      {vehicleType === 'car' && <div className="vehicle-active-ring" />}
    </button>



      {/*
      <button
        className={`vehicle-option ${vehicleType === 'bike' ? 'active' : ''}`}
        onClick={() => onSelect('bike')}
        type="button"
      >
        <span className="vehicle-emoji">🏍️</span>
        <span className="vehicle-label">Bike</span>
        <span className="vehicle-sub">2-Wheeler</span>
        <span className="coming-soon-tag">Model Soon</span>
        {vehicleType === 'bike' && <div className="vehicle-active-ring bike-ring" />}
      </button>
      */}

    </div>
  </div>
);

const ImageDropzone = ({ onImageSelect, previewUrl }) => {
  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image must be under 10MB');
        return;
      }
      onImageSelect(file);
    }
  }, [onImageSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    multiple: false,
  });

  return (
    <div {...getRootProps()} className={`dropzone ${isDragActive ? 'drag-active' : ''} ${previewUrl ? 'has-preview' : ''}`}>
      <input {...getInputProps()} />
      {previewUrl ? (
        <div className="preview-container">
          <img src={previewUrl} alt="Preview" className="preview-img" />
          <div className="preview-overlay">
            <span>📸 Click to change image</span>
          </div>
        </div>
      ) : (
        <div className="dropzone-content">
          <div className="drop-icon">
            {isDragActive ? '📂' : '📸'}
          </div>
          <p className="drop-title">
            {isDragActive ? 'Drop your image here!' : 'Drag & Drop vehicle image'}
          </p>
          <p className="drop-sub">or click to browse • JPG, PNG, WEBP • max 10MB</p>
          <div className="drop-guidelines">
            <span>✅ Clear, well-lit photo</span>
            <span>✅ Damage area visible</span>
            <span>✅ Single vehicle</span>
          </div>
        </div>
      )}
    </div>
  );
};

const DetectPage = () => {
  const [vehicleType, setVehicleType] = useState('car');
  const [brand, setBrand] = useState('');
  const [modelName, setModelName] = useState('');
  const [part, setPart] = useState('');
  const [year, setYear] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [contact, setContact] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [step, setStep] = useState(1); // 1=vehicle, 2=details, 3=upload

  const brands = vehicleType === 'car' ? CAR_BRANDS : BIKE_BRANDS;
  const parts = vehicleType === 'car' ? CAR_PARTS : BIKE_PARTS;

  const handleImageSelect = (file) => {
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleVehicleSelect = (type) => {
    setVehicleType(type);
    setBrand('');
    setPart('');
    setResult(null);
  };

  const handleSubmit = async () => {
    if (!brand || !modelName || !part || !year) {
      toast.error('Please fill in all vehicle details');
      return;
    }
    if (!imageFile) {
      toast.error('Please upload a vehicle image');
      return;
    }

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('vehicle_type', vehicleType);
    formData.append('brand', brand);
    formData.append('model_name', modelName);
    formData.append('part_name', part);
    formData.append('year', year);
    formData.append('owner_name', ownerName);
    formData.append('contact', contact);
    formData.append('image', imageFile);

    try {
      const toastId = toast.loading('🤖 AI is analyzing your vehicle...');
      const res = await axios.post('/api/detect', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000,
      });
      toast.dismiss(toastId);
      toast.success('✅ Analysis complete!');
      setResult(res.data);
    } catch (err) {
      const msg = err.response?.data?.error || 'Server error. Is the backend running?';
      toast.error(`❌ ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setImageFile(null);
    setPreviewUrl('');
    setStep(1);
    setBrand('');
    setModelName('');
    setPart('');
    setYear('');
  };

  return (
    <div className="detect-page page-container" style={{ position: 'relative', zIndex: 1 }}>
      {/* Page Title */}
      <div className="detect-header">
        <h1 className="section-title">
          🔍 <span className="neon-text-cyan">Vehicle Damage</span> Scanner
        </h1>
        <p className="section-subtitle">
          Fill in your vehicle details, upload a damage photo, and let the AI do the rest
        </p>
      </div>

      <div className="detect-layout">
        {/* ── LEFT: FORM PANEL ── */}
        <div className="form-panel glass-card">
          {/* Step indicators */}
          <div className="step-indicators">
            {[1, 2, 3].map(s => (
              <div
                key={s}
                className={`step-indicator ${step >= s ? 'done' : ''} ${step === s ? 'active' : ''}`}
                onClick={() => setStep(s)}
              >
                <div className="step-dot">{step > s ? '✓' : s}</div>
                <span className="step-ind-label">
                  {s === 1 ? 'Vehicle' : s === 2 ? 'Details' : 'Upload'}
                </span>
              </div>
            ))}
            <div className="step-track" style={{ '--progress': `${((step - 1) / 2) * 100}%` }} />
          </div>

          {/* ── STEP 1: Vehicle Type ── */}
          {step === 1 && (
            <div className="form-step animate-fade-in">
              <VehicleSelector vehicleType={vehicleType} onSelect={handleVehicleSelect} />
              <div className="step-actions">
                <button className="btn-primary" onClick={() => setStep(2)}>
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2: Vehicle Details ── */}
          {step === 2 && (
            <div className="form-step animate-fade-in">
              <div className="form-section-title">
                {vehicleType === 'car' ? '🚗' : '🏍️'} Vehicle Details
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Brand *</label>
                  <select className="form-select" value={brand} onChange={e => setBrand(e.target.value)}>
                    <option value="">Select Brand</option>
                    {brands.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Model Name *</label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder={vehicleType === 'car' ? 'e.g. Swift, Creta' : 'e.g. Splendor, Pulsar'}
                    value={modelName}
                    onChange={e => setModelName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Manufacturing Year *</label>
                  <select className="form-select" value={year} onChange={e => setYear(e.target.value)}>
                    <option value="">Select Year</option>
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Damaged Part *</label>
                  <select className="form-select" value={part} onChange={e => setPart(e.target.value)}>
                    <option value="">Select Part</option>
                    {parts.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <div className="neon-divider" />

              <div className="form-section-title">👤 Owner Details (Optional)</div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Owner Name</label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="e.g. Aditya Kumar"
                    value={ownerName}
                    onChange={e => setOwnerName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Contact Number</label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="e.g. 9876543210"
                    value={contact}
                    onChange={e => setContact(e.target.value)}
                  />
                </div>
              </div>

              <div className="step-actions">
                <button className="btn-secondary" onClick={() => setStep(1)}>← Back</button>
                <button className="btn-primary" onClick={() => setStep(3)}>Continue →</button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Image Upload ── */}
          {step === 3 && (
            <div className="form-step animate-fade-in">
              <div className="form-section-title">📸 Upload Damage Image</div>

              {/* Summary */}
              <div className="vehicle-summary">
                <span className="badge badge-cyan">{vehicleType === 'car' ? '🚗' : '🏍️'} {vehicleType}</span>
                <span className="badge badge-cyan">{brand}</span>
                <span className="badge badge-cyan">{modelName}</span>
                <span className="badge badge-orange">{part}</span>
                <span className="badge badge-cyan">{year}</span>
              </div>

              <ImageDropzone onImageSelect={handleImageSelect} previewUrl={previewUrl} />

              <div className="step-actions">
                <button className="btn-secondary" onClick={() => setStep(2)}>← Back</button>
                <button
                  className="btn-primary btn-analyze"
                  onClick={handleSubmit}
                  disabled={loading || !imageFile}
                >
                  {loading ? (
                    <>
                      <div className="spinner" style={{ width: 18, height: 18 }} />
                      Analyzing...
                    </>
                  ) : (
                    '⚡ Analyze Damage'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: RESULT PANEL ── */}
        <div className="result-panel">
          {!result && !loading && (
            <div className="result-placeholder glass-card">
              <div className="placeholder-icon">🤖</div>
              <h3 className="placeholder-title">AI Result Will Appear Here</h3>
              <p className="placeholder-sub">
                Complete the form and upload a photo to get damage detection results and repair cost estimates
              </p>
              <div className="placeholder-features">
                <div>✅ Damage classification</div>
                <div>✅ Bounding box visualization</div>
                <div>✅ Repair cost in INR</div>
                <div>✅ Severity assessment</div>
              </div>
            </div>
          )}

          {loading && (
            <div className="loading-panel glass-card">
              <div className="loading-scanner">
                <div className="loading-car">🚗</div>
                <div className="loading-beam" />
              </div>
              <h3 className="loading-title">AI is Scanning...</h3>
              <div className="loading-steps">
                <div className="loading-step active">🔬 Running YOLO detection</div>
                <div className="loading-step">💬 Querying LLM for cost estimate</div>
                <div className="loading-step">💾 Saving to database</div>
              </div>
            </div>
          )}

          {result && (
            <ResultCard
              result={result}
              vehicleType={vehicleType}
              brand={brand}
              model={modelName}
              part={part}
              year={year}
              onReset={handleReset}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DetectPage;