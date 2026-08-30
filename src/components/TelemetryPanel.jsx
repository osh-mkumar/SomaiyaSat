import React, { useState, useEffect, useMemo } from 'react';
import { fetchLocalSatellites } from '../services/satelliteApi';
import SatelliteDetailsOverlay from './SatelliteDetailsOverlay';
import TelemetrySettingsOverlay from './TelemetrySettingsOverlay';

// ==========================================
// CONSTANTS & INITIAL DATA
// ==========================================
const MAX_HISTORY = 30;

const INITIAL_LIMITS = {
    upperBattery: 100,
    lowerBattery: 20,
    criticalBattery: 15,
    tempAlarm: 45,
    refreshInterval: 2000,
    highTempAlert: true,
    lowBatteryAlert: true
};

const getStatusEmoji = (status) => {
    switch (status) {
        case "NOMINAL": return "🟢";
        case "WARNING": return "🟡";
        case "CRITICAL": return "🔴";
        default: return "";
    }
};

const calculateStatus = (battery, signal, communication, limits) => {
    if (battery <= (limits?.criticalBattery || 15) || signal < 30 || communication === "Offline") return "CRITICAL";
    if ((battery > (limits?.criticalBattery || 15) && battery <= limits?.lowerBattery) || (signal >= 30 && signal < 60)) return "WARNING";
    if (battery > limits?.lowerBattery && signal >= 60 && communication === "Online") return "NOMINAL";
    return "UNKNOWN";
};

const Sparkline = ({ data, color, min, max }) => {
    if (!data || data.length === 0) return null;

    const pts = data.map((val, i) => {
        const x = (i / (MAX_HISTORY - 1)) * 100;
        const normalizedY = Math.max(0, Math.min(1, (val - min) / (max - min || 1)));
        const y = 100 - (normalizedY * 100);
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg preserveAspectRatio="none" viewBox="0 -10 100 120" className="chart-line-svg" style={{ width: '100%', height: '35px', marginTop: '8px' }}>
            <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
};

const ProgressBar = ({ value, color }) => {
    const barsCount = 18;
    const filledCount = Math.round((value / 100) * barsCount);
    const bars = Array.from({ length: barsCount }).map((_, i) => (
        <span key={i} style={{ color: i < filledCount ? color : '#1e293b' }}>█</span>
    ));
    return (
        <span style={{ fontFamily: 'monospace', letterSpacing: '-1px' }}>
            {bars} <span style={{ marginLeft: '8px', color: '#fff', fontSize: '0.9em' }}>{Math.round(value)}%</span>
        </span>
    );
};

const TelemetryPanel = ({
    role,
    compact = false,
    selectedPass,
    limits = INITIAL_LIMITS,
    setLimits,
    satellites: propsSatellites,
    history: propsHistory
}) => {
    const [internalSatellites, setInternalSatellites] = useState([]);
    const [internalHistory, setInternalHistory] = useState({});
    const [loading, setLoading] = useState(!propsSatellites || propsSatellites.length === 0);
    const [error, setError] = useState(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [selectedSatelliteId, setSelectedSatelliteId] = useState(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [internalLimits, setInternalLimits] = useState(limits);

    const activeLimits = limits || internalLimits;
    const updateLimits = setLimits || setInternalLimits;

    // Use props if passed, otherwise use internal state
    const satellites = propsSatellites && propsSatellites.length > 0 ? propsSatellites : internalSatellites;
    const history = propsHistory && Object.keys(propsHistory).length > 0 ? propsHistory : internalHistory;

    useEffect(() => {
        if (propsSatellites && propsSatellites.length > 0) {
            setLoading(false);
            return;
        }

        fetchLocalSatellites()
            .then(data => {
                setInternalSatellites(data);
                
                const initialHistory = {};
                data.forEach(sat => {
                    initialHistory[sat.id] = {
                        battery: Array(MAX_HISTORY).fill(sat.battery),
                        signal: Array(MAX_HISTORY).fill(sat.signal),
                        temp: Array(MAX_HISTORY).fill(sat.temp),
                    };
                });
                setInternalHistory(initialHistory);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load satellite data:", err);
                setError(err.message);
                setLoading(false);
            });
    }, [propsSatellites]);

    useEffect(() => {
        if (propsSatellites && propsSatellites.length > 0) return; // When using parent state, parent drives update

        const interval = setInterval(() => {
            setInternalSatellites(prevSats => {
                const nextSats = prevSats.map(sat => {
                    const batteryDelta = (Math.random() * 0.2 - 0.1);
                    const signalDelta = (Math.random() * 2 - 1);
                    const tempDelta = (Math.random() * 0.4 - 0.2);

                    const newBattery = Math.max(0, Math.min(100, sat.battery + batteryDelta));
                    const newSignal = Math.max(0, Math.min(100, sat.signal + signalDelta));
                    const newTemp = Math.max(-20, Math.min(80, sat.temp + tempDelta));

                    const newOrbit = sat.altitude + (Math.random() * 0.2 - 0.1);

                    return {
                        ...sat,
                        battery: newBattery,
                        signal: newSignal,
                        temp: newTemp,
                        altitude: newOrbit
                    };
                });

                setInternalHistory(prevHist => {
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
        }, activeLimits.refreshInterval);

        return () => clearInterval(interval);
    }, [propsSatellites, activeLimits.refreshInterval]);

    const satellitesWithStatus = useMemo(() => {
        return satellites.map(sat => ({
            ...sat,
            status: calculateStatus(sat.battery, sat.signal, sat.communication, activeLimits)
        }));
    }, [satellites, activeLimits]);

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

    // Primary Satellite for Mission Dashboard (SomaiyaSat-1)
    const primarySat = satellitesWithStatus[0] || {
        name: "SomaiyaSat-1",
        battery: 82.65,
        signal: 78,
        temp: 24.8,
        status: "NOMINAL",
        id: "SS-001"
    };
    const primaryHist = history[primarySat.id] || {
        battery: [80, 81, 82, 82.65],
        signal: [75, 76, 77, 78],
        temp: [24.5, 24.6, 24.7, 24.8]
    };

    // 1. THREE-COLUMN MISSION DASHBOARD VIEW (COMPACT)
    if (compact) {
        // Compute dBm approximation from signal % (0-100% -> -110dBm to -50dBm)
        const signalDbm = Math.round(-110 + (primarySat.signal / 100) * 60);

        return (
            <div className="panel telemetry-panel">
                <div className="panel-header">
                    <h2 className="panel-title" style={{ border: 'none' }}>Telemetry Health</h2>
                    <button
                        className="settings-icon-btn"
                        onClick={() => setIsSettingsOpen(true)}
                        style={{ background: 'none', border: 'none', color: '#0df', cursor: 'pointer', paddingRight: '20px' }}
                        title="Telemetry Settings"
                    >
                        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
                    </button>
                </div>

                <div className="panel-content" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {/* PASS WINDOW INDICATOR */}
                    <div style={{
                        background: '#08111f',
                        border: '1px solid #1a2b4c',
                        padding: '10px 15px',
                        borderRadius: '4px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <span style={{ fontSize: '0.8rem', color: '#8892b0', fontFamily: 'var(--font-mono)' }}>PASS WINDOW</span>
                        <span style={{ fontSize: '0.85rem', color: '#10b981', fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>
                            {selectedPass ? `Available (${selectedPass.time})` : 'Available'}
                        </span>
                    </div>

                    {/* 1. BATTERY SECTION */}
                    <div className="tel-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <span className="tel-label">BATTERY VOLTAGE</span>
                            <span style={{ fontSize: '0.75rem', color: primarySat.battery < activeLimits.lowerBattery ? '#ff5555' : '#10b981' }}>
                                ● {primarySat.status}
                            </span>
                        </div>
                        <div className="tel-value">
                            {(primarySat.battery * 0.95 + 4.2).toFixed(2)} V
                            <span style={{ fontSize: '0.85rem', color: '#8892b0', marginLeft: '10px' }}>({primarySat.battery.toFixed(1)}%)</span>
                        </div>
                        <Sparkline data={primaryHist.battery} color="#00cfff" min={0} max={100} />
                    </div>

                    {/* 2. SIGNAL STRENGTH SECTION */}
                    <div className="tel-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <span className="tel-label">SIGNAL STRENGTH</span>
                            <span style={{ fontSize: '0.75rem', color: '#0df' }}>RSSI</span>
                        </div>
                        <div className="tel-value">
                            {signalDbm} dBm
                            <span style={{ fontSize: '0.85rem', color: '#8892b0', marginLeft: '10px' }}>({primarySat.signal.toFixed(0)}%)</span>
                        </div>
                        <Sparkline data={primaryHist.signal} color="#10b981" min={0} max={100} />
                    </div>

                    {/* 3. TEMPERATURE SECTION */}
                    <div className="tel-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <span className="tel-label">TEMPERATURE</span>
                            <span style={{ fontSize: '0.75rem', color: primarySat.temp > activeLimits.tempAlarm ? '#ff5555' : '#8892b0' }}>
                                {primarySat.temp > activeLimits.tempAlarm ? 'ALARM' : 'NOMINAL'}
                            </span>
                        </div>
                        <div className="tel-value">
                            {primarySat.temp.toFixed(1)} °C
                        </div>
                        <Sparkline data={primaryHist.temp} color="#ffb86c" min={-10} max={60} />
                    </div>
                </div>

                {isSettingsOpen && (
                    <TelemetrySettingsOverlay
                        limits={activeLimits}
                        role={role}
                        onSave={(newLimits) => { updateLimits(newLimits); setIsSettingsOpen(false); }}
                        onCancel={() => setIsSettingsOpen(false)}
                    />
                )}
            </div>
        );
    }

    // 2. FULL TELEMETRY VIEW (TAB 05)
    return (
        <section className="sci-section telemetry-page">
            <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0 }}>05. Satellite Telemetry Dashboard</h3>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <button
                        className="settings-icon-btn"
                        onClick={() => setIsSettingsOpen(true)}
                        style={{ background: 'none', border: 'none', color: '#0df', cursor: 'pointer' }}
                        title="Telemetry Settings"
                    >
                        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
                    </button>
                </div>
            </div>

            {isSettingsOpen && (
                <TelemetrySettingsOverlay
                    limits={activeLimits}
                    role={role}
                    onSave={(newLimits) => { updateLimits(newLimits); setIsSettingsOpen(false); }}
                    onCancel={() => setIsSettingsOpen(false)}
                />
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
                    const hist = history[sat.id];
                    let borderColor = '#334';
                    let accentColor = '#0df';

                    if (sat.status === 'WARNING') { borderColor = '#ffb86c'; accentColor = '#ffb86c'; }
                    if (sat.status === 'CRITICAL') { borderColor = '#ff5555'; accentColor = '#ff5555'; }

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
                                transition: 'all 0.2s'
                            }}
                        >
                            <h3 style={{ margin: '0 0 15px 0', borderBottom: `1px solid ${borderColor}`, paddingBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                {sat.name}
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{ fontSize: '0.8em', color: accentColor, display: 'block' }}>{getStatusEmoji(sat.status)} {sat.status}</span>
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
                            </div>
                        </div>
                    );
                })}
            </div>
            )}

            {selectedSatellite && (
                <SatelliteDetailsOverlay
                    satellite={selectedSatellite}
                    onClose={() => setSelectedSatelliteId(null)}
                />
            )}
        </section>
    );
};

export default TelemetryPanel;
