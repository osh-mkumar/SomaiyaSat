import React from 'react';

const SatelliteDetailsOverlay = ({ satellite, onClose }) => {
    if (!satellite) return null;

    return (
        <div className="overlay-backdrop" onClick={onClose}>
            <div className="overlay-content" onClick={e => e.stopPropagation()}>
                <div className="overlay-header">
                    <h2>{satellite.name}</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                <div className="overlay-body">
                    <div className="summary-row">
                        <span className="summary-label">STATUS</span>
                        <span className={`summary-val ${satellite.status.toLowerCase()}`}>● {satellite.status}</span>
                    </div>
                    <div className="summary-row">
                        <span className="summary-label">BATTERY</span>
                        <span className="summary-val">{satellite.battery.toFixed(0)}%</span>
                    </div>
                    <div className="summary-row">
                        <span className="summary-label">SIGNAL</span>
                        <span className="summary-val">{satellite.signal.toFixed(0)}%</span>
                    </div>
                    <div className="summary-row">
                        <span className="summary-label">TEMPERATURE</span>
                        <span className="summary-val">{satellite.temp.toFixed(1)} °C</span>
                    </div>
                    <div className="summary-row">
                        <span className="summary-label">ALTITUDE</span>
                        <span className="summary-val">{satellite.altitude.toFixed(0)} km</span>
                    </div>
                    <div className="summary-row">
                        <span className="summary-label">COMMUNICATION</span>
                        <span className="summary-val" style={{ color: satellite.communication === 'Offline' ? '#ff5555' : '#50fa7b' }}>
                            ● {satellite.communication}
                        </span>
                    </div>
                    <div className="summary-row">
                        <span className="summary-label">LAST CONTACT</span>
                        <span className="summary-val">Just now</span>
                    </div>
                </div>
                <div className="overlay-footer form-actions">
                    <button className="btn-primary" onClick={onClose}>View Telemetry</button>
                    <button className="btn-secondary" onClick={onClose}>View Orbital Pass</button>
                </div>
            </div>
        </div>
    );
};

export default SatelliteDetailsOverlay;
