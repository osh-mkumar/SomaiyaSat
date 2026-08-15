import React, { useState, useEffect, useMemo } from 'react';
import { fetchLocalSatellites } from '../services/satelliteApi';

// ==========================================
// CONSTANTS & INITIAL DATA
// ==========================================
const MAX_HISTORY = 30;

// INITIAL_SATELLITES removed, data now fetched from API

const INITIAL_LIMITS = {
    upperBattery: 100,
    lowerBattery: 20,
    tempAlarm: 45,
    refreshInterval: 1000,
    highTempAlert: true
};

const getStatusEmoji = (status) => {
    switch (status) {
        case "NOMINAL": return "🟢";
        case "WARNING": return "🟡";
        case "CRITICAL": return "🔴";
        default: return "";
    }
};

const calculateStatus = (battery, signal, communication) => {
    if (battery < 20 || signal < 30 || communication === "Offline") return "CRITICAL";
    if ((battery >= 20 && battery < 50) || (signal >= 30 && signal < 60)) return "WARNING";
    if (battery >= 50 && signal >= 60 && communication === "Online") return "NOMINAL";
    return "UNKNOWN";
};

const Sparkline = ({ data, color, min, max }) => {
    if (!data || data.length === 0) return null;

    // Normalize data to 0-100 height, 0-100 width
    const pts = data.map((val, i) => {
        const x = (i / (MAX_HISTORY - 1)) * 100;
        const normalizedY = Math.max(0, Math.min(1, (val - min) / (max - min)));
        const y = 100 - (normalizedY * 100);
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg preserveAspectRatio="none" viewBox="0 -10 100 120" className="chart-line-svg" style={{ width: '100%', height: '30px', marginTop: '5px' }}>
            <polyline points={pts} fill="none" stroke={color} strokeWidth="2" />
        </svg>
    );
};

const ProgressBar = ({ value, color }) => {
    const barsCount = 20;
    const filledCount = Math.round((value / 100) * barsCount);
    const bars = Array.from({ length: barsCount }).map((_, i) => (
        <span key={i} style={{ color: i < filledCount ? color : '#334' }}>█</span>
    ));
    return (
        <span style={{ fontFamily: 'monospace', letterSpacing: '-1px' }}>
            {bars} <span style={{ marginLeft: '8px', color: '#fff' }}>{Math.round(value)}%</span>
        </span>
    );
};

const TelemetryPanel = ({ role }) => {
    const [satellites, setSatellites] = useState([]);
    const [history, setHistory] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [selectedSatelliteId, setSelectedSatelliteId] = useState(null);
    const [showSettings, setShowSettings] = useState(false);
    const [limits, setLimits] = useState(INITIAL_LIMITS);
    const [draftLimits, setDraftLimits] = useState(INITIAL_LIMITS);

    useEffect(() => {
        fetchLocalSatellites()
            .then(data => {
                setSatellites(data);
                
                // Initialize history for fetched satellites
                const initialHistory = {};
                data.forEach(sat => {
                    initialHistory[sat.id] = {
                        battery: Array(MAX_HISTORY).fill(sat.battery),
                        signal: Array(MAX_HISTORY).fill(sat.signal),
                        temp: Array(MAX_HISTORY).fill(sat.temp),
                    };
                });
                setHistory(initialHistory);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load satellite data:", err);
                setError(err.message);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setSatellites(prevSats => {
                const nextSats = prevSats.map(sat => {
                    const batteryDelta = (Math.random() * 0.2 - 0.1);
                    const signalDelta = (Math.random() * 2 - 1);
                    const tempDelta = (Math.random() * 0.4 - 0.2);

                    const newBattery = Math.max(0, Math.min(100, sat.battery + batteryDelta));
                    const newSignal = Math.max(0, Math.min(100, sat.signal + signalDelta));
                    const newTemp = Math.max(-20, Math.min(80, sat.temp + tempDelta));

                    // Simple simulated orbit drift
                    const newOrbit = sat.altitude + (Math.random() * 0.2 - 0.1);

                    return {
                        ...sat,
                        battery: newBattery,
                        signal: newSignal,
                        temp: newTemp,
                        altitude: newOrbit
                    };
                });

                // Update history
                setHistory(prevHist => {
                    const nextHist = { ...prevHist };
                    nextSats.forEach(sat => {
                        const h = nextHist[sat.id];
                        if (h && h.battery) {
                            nextHist[sat.id] = {
                                battery: [...h.battery.slice(1), sat.battery],
                                signal: [...h.signal.slice(1), sat.signal],
                                temp: [...h.temp.slice(1), sat.temp],
                            };
                        }
                    });
                    return nextHist;
                });

                setLastUpdated(new Date());
                return nextSats;
            });
        }, limits.refreshInterval);

        return () => clearInterval(interval);
    }, [limits.refreshInterval]);

    // Derived states
    const satellitesWithStatus = useMemo(() => {
        return satellites.map(sat => ({
            ...sat,
            status: calculateStatus(sat.battery, sat.signal, sat.communication)
        }));
    }, [satellites]);

    const filteredSatellites = useMemo(() => {
        return satellitesWithStatus.filter(sat => {
            const matchesSearch = sat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  String(sat.id).toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === "all" || sat.status.toLowerCase() === statusFilter.toLowerCase();
            return matchesSearch && matchesStatus;
        });
    }, [satellitesWithStatus, searchTerm, statusFilter]);

    const criticalCount = satellitesWithStatus.filter(s => s.status === "CRITICAL").length;
    const selectedSatellite = satellitesWithStatus.find(s => s.id === selectedSatelliteId);

    const handleApplySettings = () => {
        setLimits(draftLimits);
        setShowSettings(false);
    };

    return (
        <section className="sci-section telemetry-page">
            <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0 }}>05. Satellite Telemetry Dashboard</h3>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    {(role === "Admin" || showSettings) && (
                        <button
                            className="settings-icon-btn"
                            onClick={() => {
                                setDraftLimits(limits);
                                setShowSettings(!showSettings);
                            }}
                            style={{ background: 'none', border: 'none', color: '#0df', cursor: 'pointer' }}
                        >
                            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
                        </button>
                    )}
                </div>
            </div>

            {showSettings && (
                <div className="telemetry-settings-panel" style={{ background: '#111827', padding: '20px', border: '1px solid #334', borderRadius: '4px', marginBottom: '20px' }}>
                    <h4 style={{ margin: '0 0 15px 0', color: '#0df' }}>Telemetry Settings</h4>
                    {role !== "Admin" ? (
                        <p style={{ color: '#ff5555' }}>Access Denied: Administrator privileges required to change telemetry thresholds.</p>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <div className="form-group">
                                <label>Upper Battery Alarm Limit (%)</label>
                                <input type="number" value={draftLimits.upperBattery} onChange={e => setDraftLimits({ ...draftLimits, upperBattery: Number(e.target.value) })} style={{ width: '100%', padding: '8px', background: '#0a0f18', color: '#fff', border: '1px solid #334' }} />
                            </div>
                            <div className="form-group">
                                <label>Lower Battery Alarm Limit (%)</label>
                                <input type="number" value={draftLimits.lowerBattery} onChange={e => setDraftLimits({ ...draftLimits, lowerBattery: Number(e.target.value) })} style={{ width: '100%', padding: '8px', background: '#0a0f18', color: '#fff', border: '1px solid #334' }} />
                            </div>
                            <div className="form-group">
                                <label>Temperature Alarm Limit (°C)</label>
                                <input type="number" value={draftLimits.tempAlarm} onChange={e => setDraftLimits({ ...draftLimits, tempAlarm: Number(e.target.value) })} style={{ width: '100%', padding: '8px', background: '#0a0f18', color: '#fff', border: '1px solid #334' }} />
                            </div>
                            <div className="form-group">
                                <label>Refresh Interval (ms)</label>
                                <input type="number" value={draftLimits.refreshInterval} onChange={e => setDraftLimits({ ...draftLimits, refreshInterval: Number(e.target.value) })} style={{ width: '100%', padding: '8px', background: '#0a0f18', color: '#fff', border: '1px solid #334' }} />
                            </div>
                            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <label style={{ margin: 0 }}>High Temperature Alert</label>
                                <input type="checkbox" checked={draftLimits.highTempAlert} onChange={e => setDraftLimits({ ...draftLimits, highTempAlert: e.target.checked })} />
                            </div>
                            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button onClick={handleApplySettings} style={{ background: '#0df', color: '#000', border: 'none', padding: '8px 16px', cursor: 'pointer', fontWeight: 'bold' }}>Apply Changes</button>
                                <button onClick={() => setShowSettings(false)} style={{ background: '#334', color: '#fff', border: 'none', padding: '8px 16px', cursor: 'pointer' }}>Cancel</button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <p className="update-time" style={{ fontFamily: 'monospace', color: '#8892b0', margin: '0 0 15px 0' }}>
                Last Updated: {lastUpdated.toLocaleTimeString()}
            </p>

            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', padding: '15px', background: '#111827', border: '1px solid #334', borderRadius: '4px' }}>
                <input 
                    type="text" 
                    placeholder="Search satellites..." 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)} 
                    style={{ flex: 1, padding: '8px', background: '#0a0f18', color: '#fff', border: '1px solid #334' }}
                />
                <select 
                    value={statusFilter} 
                    onChange={e => setStatusFilter(e.target.value)}
                    style={{ padding: '8px', background: '#0a0f18', color: '#fff', border: '1px solid #334' }}
                >
                    <option value="all">All Status</option>
                    <option value="nominal">Nominal</option>
                    <option value="warning">Warning</option>
                    <option value="critical">Critical</option>
                    <option value="offline">Offline</option>
                </select>
            </div>

            <div className="summary-card" style={{ background: '#111827', padding: '15px', border: '1px solid #334', borderLeft: '4px solid #0df', marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1em' }}>Mission Status Summary</h3>
                <div style={{ display: 'flex', gap: '30px' }}>
                    <p style={{ margin: 0 }}><strong>Total Satellites:</strong> {satellitesWithStatus.length}</p>
                    <p style={{ margin: 0, color: criticalCount > 0 ? '#ff5555' : 'inherit' }}><strong>Critical Satellites:</strong> {criticalCount}</p>
                </div>
            </div>

            {loading && <div style={{ color: '#0df', marginBottom: '20px' }}>Loading satellite telemetry...</div>}
            
            {error && (
                <div style={{ color: '#ff5555', marginBottom: '20px' }}>
                    <p>Unable to load satellite telemetry.</p>
                    <button onClick={() => window.location.reload()} style={{ background: '#334', color: '#fff', border: 'none', padding: '5px 10px', cursor: 'pointer' }}>Try Again</button>
                </div>
            )}

            {!loading && !error && filteredSatellites.length === 0 && (
                <div style={{ color: '#ffb86c', marginBottom: '20px' }}>No satellites match your criteria.</div>
            )}

            {!loading && !error && filteredSatellites.length > 0 && (
                <div className="satellite-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                    {filteredSatellites.map((sat) => {
                    const isSelected = selectedSatelliteId === sat.id;
                    const hist = history[sat.id];
                    let borderColor = '#334';
                    let accentColor = '#0df';

                    if (sat.status === 'WARNING') { borderColor = '#ffb86c'; accentColor = '#ffb86c'; }
                    if (sat.status === 'CRITICAL') { borderColor = '#ff5555'; accentColor = '#ff5555'; }
                    if (isSelected) borderColor = '#0df'; // override if selected

                    return (
                        <div
                            key={sat.id}
                            className={`sat-card ${sat.status.toLowerCase()}`}
                            onClick={() => setSelectedSatelliteId(sat.id)}
                            style={{
                                cursor: 'pointer',
                                background: '#0d131f',
                                border: `1px solid ${borderColor}`,
                                padding: '15px',
                                borderRadius: '4px',
                                boxShadow: isSelected ? '0 0 15px rgba(0, 221, 255, 0.1)' : 'none',
                                transition: 'all 0.2s'
                            }}
                        >
                            <h3 style={{ margin: '0 0 15px 0', borderBottom: `1px solid ${borderColor}`, paddingBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                {sat.name}
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{ fontSize: '0.8em', color: accentColor, display: 'block' }}>{getStatusEmoji(sat.status)} {sat.status}</span>
                                    {sat.status === 'CRITICAL' && <span style={{ fontSize: '0.6em', color: '#ff5555', display: 'block' }}>Immediate Mission Attention Required</span>}
                                    {sat.communication === 'Offline' && <span style={{ fontSize: '0.6em', color: '#ff5555', display: 'block' }}>Communication Lost</span>}
                                </div>
                            </h3>

                            <div style={{ marginBottom: '15px' }}>
                                <div style={{ fontSize: '0.8em', color: '#8892b0', marginBottom: '4px' }}>Battery</div>
                                <ProgressBar value={sat.battery} color={accentColor} />
                                {hist && <Sparkline data={hist.battery} color={accentColor} min={0} max={100} />}
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <div style={{ fontSize: '0.8em', color: '#8892b0', marginBottom: '4px' }}>Signal</div>
                                <ProgressBar value={sat.signal} color={accentColor} />
                                {hist && <Sparkline data={hist.signal} color={accentColor} min={0} max={100} />}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.9em' }}>
                                <div>
                                    <div style={{ color: '#8892b0', fontSize: '0.9em' }}>Temperature</div>
                                    <div style={{ fontFamily: 'monospace' }}>{sat.temp.toFixed(1)} °C</div>
                                </div>
                                <div>
                                    <div style={{ color: '#8892b0', fontSize: '0.9em' }}>Orbit</div>
                                    <div style={{ fontFamily: 'monospace' }}>{sat.altitude.toFixed(1)} km</div>
                                </div>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <div style={{ color: '#8892b0', fontSize: '0.9em' }}>Communication</div>
                                    <div style={{ fontFamily: 'monospace', color: sat.communication === 'Offline' ? '#ff5555' : '#50fa7b' }}>{sat.communication}</div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            )}

            {selectedSatellite && (
                <div className="selected-satellite-detail" style={{ background: '#0a0f18', border: '1px solid #0df', padding: '20px', borderRadius: '4px' }}>
                    <h3 style={{ margin: '0 0 15px 0', color: '#0df' }}>SELECTED SATELLITE: {selectedSatellite.name}</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
                        <div>
                            <div style={{ color: '#8892b0', fontSize: '0.9em' }}>Battery</div>
                            <div style={{ fontFamily: 'monospace', fontSize: '1.2em' }}>{selectedSatellite.battery.toFixed(1)}%</div>
                        </div>
                        <div>
                            <div style={{ color: '#8892b0', fontSize: '0.9em' }}>Signal</div>
                            <div style={{ fontFamily: 'monospace', fontSize: '1.2em' }}>{selectedSatellite.signal.toFixed(1)}%</div>
                        </div>
                        <div>
                            <div style={{ color: '#8892b0', fontSize: '0.9em' }}>Temperature</div>
                            <div style={{ fontFamily: 'monospace', fontSize: '1.2em' }}>{selectedSatellite.temp.toFixed(1)} °C</div>
                        </div>
                        <div>
                            <div style={{ color: '#8892b0', fontSize: '0.9em' }}>Orbit</div>
                            <div style={{ fontFamily: 'monospace', fontSize: '1.2em' }}>{selectedSatellite.altitude.toFixed(1)} km</div>
                        </div>
                        <div>
                            <div style={{ color: '#8892b0', fontSize: '0.9em' }}>Communication</div>
                            <div style={{ fontFamily: 'monospace', fontSize: '1.2em', color: selectedSatellite.communication === 'Offline' ? '#ff5555' : '#50fa7b' }}>{selectedSatellite.communication}</div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default TelemetryPanel;
