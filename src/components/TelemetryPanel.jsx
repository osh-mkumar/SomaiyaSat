import React, { useState, useEffect } from 'react';

const TelemetryPanel = () => {
    const [battery, setBattery] = useState(82.4);
    const [signal, setSignal] = useState(-85);
    const [temp, setTemp] = useState(24.5);
    const [showSettings, setShowSettings] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setBattery(prev => prev + (Math.random() * 0.2 - 0.1));
            setSignal(prev => prev + (Math.random() * 2 - 1));
            setTemp(prev => prev + (Math.random() * 0.4 - 0.2));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="panel telemetry-panel">
            <div className="panel-header">
                <h2 className="panel-title">Telemetry Health</h2>
                <span className="settings-icon" onClick={() => setShowSettings(!showSettings)}>
                    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                </span>
            </div>
            
            <div className="panel-content">
                {showSettings ? (
                    <div className="inline-config-panel">
                        <h4 className="config-title">Telemetry Thresholds</h4>
                        <div className="form-group">
                            <label>Low Battery Alert (V)</label>
                            <input type="number" defaultValue="70.0" step="0.1" />
                        </div>
                        <div className="form-group">
                            <label>Critical Signal (dBm)</label>
                            <input type="number" defaultValue="-95" />
                        </div>
                        <div className="form-group">
                            <label>Max Temp (°C)</label>
                            <input type="number" defaultValue="45.0" />
                        </div>
                        <div className="form-actions" style={{ marginTop: '20px' }}>
                            <button className="btn-primary" onClick={() => setShowSettings(false)}>Apply Settings</button>
                        </div>
                    </div>
                ) : (
                    <div className="telemetry-cards">
                        <div className="tel-card">
                            <span className="tel-label">Battery Voltage</span>
                            <span className="tel-value">{battery.toFixed(2)} V</span>
                            <div className="line-chart-mockup">
                                <svg preserveAspectRatio="none" viewBox="0 0 100 20" className="chart-line">
                                    <polyline points="0,15 20,12 40,16 60,10 80,14 100,5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                                </svg>
                            </div>
                        </div>
                        
                        <div className="tel-card">
                            <span className="tel-label">Signal Strength</span>
                            <span className="tel-value">{Math.round(signal)} dBm</span>
                            <div className="line-chart-mockup">
                                <svg preserveAspectRatio="none" viewBox="0 0 100 20" className="chart-line-fast">
                                    <polyline points="0,5 15,18 30,8 45,15 60,10 75,12 90,4 100,8" fill="none" stroke="currentColor" strokeWidth="1.5" />
                                </svg>
                            </div>
                        </div>
                        
                        <div className="tel-card">
                            <span className="tel-label">Temperature</span>
                            <span className="tel-value">{temp.toFixed(1)} °C</span>
                            <div className="line-chart-mockup">
                                <svg preserveAspectRatio="none" viewBox="0 0 100 20" className="chart-line-slow">
                                    <polyline points="0,10 25,12 50,11 75,9 100,10" fill="none" stroke="currentColor" strokeWidth="1.5" />
                                </svg>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TelemetryPanel;
