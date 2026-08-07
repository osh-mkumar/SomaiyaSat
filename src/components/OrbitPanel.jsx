import React from 'react';

const OrbitPanel = () => {
    return (
        <div className="panel orbit-panel">
            <h2 className="panel-title">Orbital Pass</h2>
            <div className="orbit-map-container">
                <div className="mock-globe">
                    {/* Realistic SVG Globe with lat/lon lines */}
                    <svg className="globe-svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
                        <circle cx="50" cy="50" r="48" fill="#020617" stroke="#1a2b4c" strokeWidth="1" />
                        
                        {/* Lat/Lon grid */}
                        <path d="M 50,2 A 48,48 0 0,0 50,98 A 48,48 0 0,0 50,2" fill="none" stroke="#0f172a" strokeWidth="1" />
                        <path d="M 50,2 A 24,48 0 0,0 50,98 A 24,48 0 0,0 50,2" fill="none" stroke="#0f172a" strokeWidth="1" />
                        <path d="M 2,50 A 48,48 0 0,0 98,50 A 48,48 0 0,0 2,50" fill="none" stroke="#0f172a" strokeWidth="1" />
                        <path d="M 2,50 A 48,24 0 0,0 98,50 A 48,24 0 0,0 2,50" fill="none" stroke="#0f172a" strokeWidth="1" />

                        {/* Orbit Path */}
                        <path d="M 10,80 Q 50,20 90,80" fill="none" stroke="#64748b" strokeWidth="1" strokeDasharray="3, 3" />
                        
                        {/* Satellite Marker (cyan glow) */}
                        <circle cx="45" cy="45" r="2.5" fill="#00cfff" className="pulse-marker" />
                        <circle cx="45" cy="45" r="5" fill="none" stroke="#00cfff" strokeWidth="0.5" opacity="0.6" />
                        
                        {/* Ground Station (green) */}
                        <rect x="53" y="58" width="2" height="2" fill="#10b981" />
                        <path d="M54 58 L52 55 L56 55 Z" fill="#10b981" />
                    </svg>
                </div>
                <div className="orbit-stats">
                    <p><strong>AOS:</strong> 00:14:32</p>
                    <p><strong>LOS:</strong> 00:26:10</p>
                    <p><strong>Max Elev:</strong> 64.2°</p>
                </div>
            </div>
        </div>
    );
};

export default OrbitPanel;
