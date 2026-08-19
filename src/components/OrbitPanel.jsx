import React, { useState } from 'react';

const OrbitPanel = () => {
    const [activeOrbitView, setActiveOrbitView] = useState('LIVE');

    const renderView = () => {
        if (activeOrbitView === 'LIVE') {
            return (
                <div className="orbit-map-container">
                    <div className="mock-globe">
                        <svg className="globe-svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
                            <circle cx="50" cy="50" r="48" fill="#020617" stroke="#1a2b4c" strokeWidth="1" />
                            
                            <path d="M 50,2 A 48,48 0 0,0 50,98 A 48,48 0 0,0 50,2" fill="none" stroke="#0f172a" strokeWidth="1" />
                            <path d="M 50,2 A 24,48 0 0,0 50,98 A 24,48 0 0,0 50,2" fill="none" stroke="#0f172a" strokeWidth="1" />
                            <path d="M 2,50 A 48,48 0 0,0 98,50 A 48,48 0 0,0 2,50" fill="none" stroke="#0f172a" strokeWidth="1" />
                            <path d="M 2,50 A 48,24 0 0,0 98,50 A 48,24 0 0,0 2,50" fill="none" stroke="#0f172a" strokeWidth="1" />

                            <path d="M 10,80 Q 50,20 90,80" fill="none" stroke="#64748b" strokeWidth="1" strokeDasharray="3, 3" />
                            
                            <circle cx="45" cy="45" r="2.5" fill="#00cfff" className="pulse-marker" />
                            <circle cx="45" cy="45" r="5" fill="none" stroke="#00cfff" strokeWidth="0.5" opacity="0.6" />
                            
                            <rect x="53" y="58" width="2" height="2" fill="#10b981" />
                            <path d="M54 58 L52 55 L56 55 Z" fill="#10b981" />
                        </svg>
                    </div>
                    <div className="orbit-stats">
                        <p><strong>Satellite:</strong> SomaiyaSat-1</p>
                        <p><strong>Altitude:</strong> 504.2 km</p>
                        <p><strong>Velocity:</strong> 7.66 km/s</p>
                        <p><strong>Ground Station:</strong> GS-MUMBAI-01</p>
                    </div>
                </div>
            );
        }

        if (activeOrbitView === 'NEXT PASS') {
            return (
                <div style={{ padding: '20px' }}>
                    <div className="summary-card" style={{ background: '#111827', padding: '15px', border: '1px solid #334', borderLeft: '4px solid #0df', marginBottom: '20px' }}>
                        <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1em' }}>Next Ground Station Pass</h3>
                        <div className="mission-summary">
                            <div className="summary-row"><span className="summary-label">AOS (Acquisition of Signal)</span> <span className="summary-val">18:42:15 UTC</span></div>
                            <div className="summary-row"><span className="summary-label">LOS (Loss of Signal)</span> <span className="summary-val">18:54:30 UTC</span></div>
                            <div className="summary-row"><span className="summary-label">Duration</span> <span className="summary-val">12m 15s</span></div>
                            <div className="summary-row"><span className="summary-label">Maximum Elevation</span> <span className="summary-val">74.5°</span></div>
                            <div className="summary-row"><span className="summary-label">Est. Comm Quality</span> <span className="summary-val" style={{color: '#50fa7b'}}>Excellent</span></div>
                        </div>
                    </div>
                </div>
            );
        }

        if (activeOrbitView === 'HISTORY') {
            const passes = [
                { time: '14:20:00 UTC', duration: '11m 45s', elev: '68.2°', success: '98%', status: 'Complete' },
                { time: '12:45:10 UTC', duration: '10m 10s', elev: '42.1°', success: '85%', status: 'Complete' },
                { time: '11:10:05 UTC', duration: '8m 20s', elev: '21.5°', success: '65%', status: 'Degraded' },
            ];

            return (
                <div style={{ padding: '20px' }}>
                    <div className="spec-table" style={{ marginTop: 0 }}>
                        <div className="table-row" style={{ borderBottom: '2px solid #1a2b4c' }}>
                            <span className="col-title" style={{ flex: 2 }}>Time</span>
                            <span className="col-title" style={{ flex: 1 }}>Duration</span>
                            <span className="col-title" style={{ flex: 1 }}>Max Elev</span>
                            <span className="col-title" style={{ flex: 1 }}>Success</span>
                        </div>
                        {passes.map((p, i) => (
                            <div className="table-row" key={i}>
                                <span style={{ flex: 2 }}>{p.time}</span>
                                <span style={{ flex: 1 }}>{p.duration}</span>
                                <span style={{ flex: 1 }}>{p.elev}</span>
                                <span style={{ flex: 1, color: p.status === 'Complete' ? '#50fa7b' : '#ffb86c' }}>{p.success}</span>
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
