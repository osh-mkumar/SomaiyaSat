import React, { useState, useEffect } from 'react';
import { fetchExternalISS } from '../services/satelliteApi';

const OrbitPanel = ({ selectedPass }) => {
    const [activeOrbitView, setActiveOrbitView] = useState('LIVE');
    const [issPosition, setIssPosition] = useState(null);

    useEffect(() => {
        let isMounted = true;
        fetchExternalISS()
            .then(data => {
                if (isMounted) setIssPosition(data);
            })
            .catch(err => {
                console.log("ISS data fetch skipped/fallback:", err.message);
            });

        const interval = setInterval(() => {
            fetchExternalISS()
                .then(data => {
                    if (isMounted) setIssPosition(data);
                })
                .catch(() => {});
        }, 15000);

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, []);

    const targetPassInfo = selectedPass || {
        satellite: "SomaiyaSat-1",
        location: "19.0760° N, 72.8777° E",
        time: "16:00 UTC",
        status: "Scheduled"
    };

    const renderView = () => {
        if (activeOrbitView === 'LIVE') {
            return (
                <div className="orbit-map-container">
                    <div className="mock-globe">
                        <svg className="globe-svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
                            <circle cx="50" cy="50" r="48" fill="#020617" stroke="#1a2b4c" strokeWidth="1" />
                            
                            {/* Latitude / Longitude grid lines */}
                            <path d="M 50,2 A 48,48 0 0,0 50,98 A 48,48 0 0,0 50,2" fill="none" stroke="#0f172a" strokeWidth="1" />
                            <path d="M 50,2 A 24,48 0 0,0 50,98 A 24,48 0 0,0 50,2" fill="none" stroke="#0f172a" strokeWidth="1" />
                            <path d="M 2,50 A 48,48 0 0,0 98,50 A 48,48 0 0,0 2,50" fill="none" stroke="#0f172a" strokeWidth="1" />
                            <path d="M 2,50 A 48,24 0 0,0 98,50 A 48,24 0 0,0 2,50" fill="none" stroke="#0f172a" strokeWidth="1" />

                            {/* Orbit Track */}
                            <path d="M 10,80 Q 50,20 90,80" fill="none" stroke="#64748b" strokeWidth="1" strokeDasharray="3, 3" />
                            
                            {/* Satellite Marker (Live pulsating) */}
                            <circle cx="45" cy="45" r="2.5" fill="#00cfff" className="pulse-marker" />
                            <circle cx="45" cy="45" r="5" fill="none" stroke="#00cfff" strokeWidth="0.5" opacity="0.6" />
                            <text x="49" y="44" fill="#00cfff" fontSize="3.5" fontFamily="monospace">SomaiyaSat-1</text>
                            
                            {/* Ground Station Marker */}
                            <rect x="53" y="58" width="2.5" height="2.5" fill="#10b981" />
                            <path d="M54.2 58 L52 55 L56.5 55 Z" fill="#10b981" />
                            <text x="58" y="60" fill="#10b981" fontSize="3" fontFamily="monospace">GS-MUMBAI</text>
                        </svg>
                    </div>

                    {/* WIREFRAME COMPACT INFO AREA */}
                    <div className="orbit-stats" style={{ padding: '15px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <p><strong>AOS:</strong> <span>00:14:32</span></p>
                        <p><strong>LOS:</strong> <span>00:26:10</span></p>
                        <p><strong>MAX ELEVATION:</strong> <span style={{ color: '#0df' }}>64.2°</span></p>
                        <p><strong>NEXT PASS:</strong> <span style={{ color: '#fff', fontWeight: 'bold' }}>{targetPassInfo.satellite}</span></p>

                        {/* TARGET PASS CONNECTION */}
                        <div style={{
                            background: '#08111f',
                            border: '1px solid #1a2b4c',
                            borderLeft: '3px solid #0df',
                            padding: '8px 12px',
                            marginTop: '6px',
                            borderRadius: '2px'
                        }}>
                            <div style={{ fontSize: '0.75rem', color: '#0df', fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>
                                TARGET PASS ({targetPassInfo.status})
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#fff', marginTop: '2px' }}>
                                {targetPassInfo.satellite} • {targetPassInfo.location}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#8892b0', fontFamily: 'var(--font-mono)' }}>
                                {targetPassInfo.time}
                            </div>
                        </div>

                        {issPosition && (
                            <div style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                                ISS Ref: {issPosition.latitude.toFixed(2)}°, {issPosition.longitude.toFixed(2)}° ({issPosition.altitude.toFixed(0)} km)
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        if (activeOrbitView === 'NEXT PASS') {
            return (
                <div style={{ padding: '20px' }}>
                    <div className="summary-card" style={{ background: '#111827', padding: '15px', border: '1px solid #334', borderLeft: '4px solid #0df', marginBottom: '20px' }}>
                        <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1em', color: '#0df' }}>Next Ground Station Pass</h3>
                        <div className="mission-summary">
                            <div className="summary-row"><span className="summary-label">Satellite</span> <span className="summary-val" style={{ color: '#fff' }}>{targetPassInfo.satellite}</span></div>
                            <div className="summary-row"><span className="summary-label">Target Location</span> <span className="summary-val">{targetPassInfo.location}</span></div>
                            <div className="summary-row"><span className="summary-label">AOS (Acquisition of Signal)</span> <span className="summary-val">{targetPassInfo.time || '18:42:15 UTC'}</span></div>
                            <div className="summary-row"><span className="summary-label">LOS (Loss of Signal)</span> <span className="summary-val">18:54:30 UTC</span></div>
                            <div className="summary-row"><span className="summary-label">Duration</span> <span className="summary-val">12m 15s</span></div>
                            <div className="summary-row"><span className="summary-label">Maximum Elevation</span> <span className="summary-val" style={{ color: '#0df' }}>64.2°</span></div>
                            <div className="summary-row"><span className="summary-label">Ground Station</span> <span className="summary-val">GS-MUMBAI-01</span></div>
                            <div className="summary-row"><span className="summary-label">Status</span> <span className="summary-val" style={{ color: '#10b981' }}>● {targetPassInfo.status}</span></div>
                        </div>
                    </div>
                </div>
            );
        }

        if (activeOrbitView === 'HISTORY') {
            const passes = [
                { sat: 'SomaiyaSat-1', time: '14:20:00 UTC', duration: '11m 45s', elev: '68.2°', success: '98%', status: 'Complete' },
                { sat: 'SomaiyaSat-1', time: '12:45:10 UTC', duration: '10m 10s', elev: '42.1°', success: '85%', status: 'Complete' },
                { sat: 'SomaiyaSat-2', time: '11:10:05 UTC', duration: '8m 20s', elev: '21.5°', success: '65%', status: 'Degraded' },
            ];

            return (
                <div style={{ padding: '20px' }}>
                    <div className="spec-table" style={{ marginTop: 0 }}>
                        <div className="table-row" style={{ borderBottom: '2px solid #1a2b4c', background: '#08111f' }}>
                            <span className="col-title" style={{ flex: 1.5 }}>Satellite / Time</span>
                            <span className="col-title" style={{ flex: 1 }}>Duration</span>
                            <span className="col-title" style={{ flex: 1 }}>Max Elev</span>
                            <span className="col-title" style={{ flex: 1 }}>Success</span>
                        </div>
                        {passes.map((p, i) => (
                            <div className="table-row" key={i}>
                                <span style={{ flex: 1.5 }}>
                                    <div style={{ fontWeight: 'bold', color: '#fff' }}>{p.sat}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#8892b0' }}>{p.time}</div>
                                </span>
                                <span style={{ flex: 1 }}>{p.duration}</span>
                                <span style={{ flex: 1 }}>{p.elev}</span>
                                <span style={{ flex: 1, color: p.status === 'Complete' ? '#10b981' : '#ffb86c' }}>{p.success}</span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
    };

    return (
        <div className="panel orbit-panel">
            <h2 className="panel-title">Orbital Pass</h2>
            <div className="virtual-tabs" style={{ padding: '15px 20px 0 20px', marginBottom: 0, borderBottom: '1px solid #1a2b4c' }}>
                <button className={`virtual-tab-btn ${activeOrbitView === 'LIVE' ? 'active' : ''}`} onClick={() => setActiveOrbitView('LIVE')}>LIVE</button>
                <button className={`virtual-tab-btn ${activeOrbitView === 'NEXT PASS' ? 'active' : ''}`} onClick={() => setActiveOrbitView('NEXT PASS')}>NEXT PASS</button>
                <button className={`virtual-tab-btn ${activeOrbitView === 'HISTORY' ? 'active' : ''}`} onClick={() => setActiveOrbitView('HISTORY')}>HISTORY</button>
            </div>
            {renderView()}
        </div>
    );
};

export default OrbitPanel;
