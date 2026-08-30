import React, { useState } from 'react';

const OverviewDashboard = ({
    satellites = [],
    selectedPass,
    scheduledPasses = [],
    payloads = [],
    setActiveTab,
    telemetryMetrics = {}
}) => {
    const [isTechParamsOpen, setIsTechParamsOpen] = useState(false);

    // Derive Mission Summary Cards data
    const totalSatellites = satellites.length > 0 ? satellites.length : 3;
    const activePassesCount = scheduledPasses.length;
    const activePayloadsCount = payloads.length > 0 ? payloads.length : 4;
    const linkStatus = "CONNECTED";

    // Alert calculation based on satellite statuses
    const alertSatellites = satellites.filter(
        s => s.status === "WARNING" || s.status === "CRITICAL" || s.status === "Warning" || s.status === "Critical"
    );

    // Target Pass Data
    const passInfo = selectedPass || {
        satellite: "SomaiyaSat-1",
        location: "19.0760° N, 72.8777° E",
        time: "16:00 UTC",
        status: "Scheduled"
    };

    // Simulated Chronological Mission Activity
    const recentActivities = [
        { time: "16:02:14", text: "Telemetry frame verified from SomaiyaSat-1 (Beacon OK)", type: "telemetry" },
        { time: "15:59:42", text: "SSTV payload packet queued for GS-MUMBAI acquisition", type: "payload" },
        { time: "15:54:18", text: "Pass window acquisition trajectory calculated (Max Elev 64.2°)", type: "pass" },
        { time: "15:48:03", text: "AI routing engine updated priority matrix: TT&C High", type: "ai" }
    ];

    // Priority color helper
    const getStatusColor = (status) => {
        const s = (status || "").toUpperCase();
        if (s === "NOMINAL" || s === "ONLINE" || s === "CONNECTED") return "#10b981";
        if (s === "WARNING") return "#ffb86c";
        if (s === "CRITICAL" || s === "OFFLINE") return "#ef4444";
        return "#00cfff";
    };

    return (
        <div className="overview-dashboard">
            {/* 1. HEADER */}
            <div className="dashboard-header" style={{ marginBottom: '25px' }}>
                <div className="hero-badge" style={{ marginBottom: '6px' }}>
                    SOMAIYASAT & SOMAIYAPOD // MISSION CONTROL
                </div>
                <h1 style={{ fontSize: '2rem', margin: '0 0 10px 0', color: '#fff', letterSpacing: '0.5px' }}>
                    Mission Operations Dashboard
                </h1>
                <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.95rem', maxWidth: '850px', lineHeight: '1.6' }}>
                    Real-time overview of satellite health, communication status, payload activity, and autonomous routing decisions.
                </p>
            </div>

            {/* 2. MISSION SUMMARY CARDS */}
            <div className="mission-summary-cards" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '15px',
                marginBottom: '25px'
            }}>
                <div className="telemetry-card" style={{ padding: '16px' }}>
                    <span className="telemetry-key">TOTAL SATELLITES</span>
                    <span className="telemetry-val" style={{ color: '#00cfff', fontSize: '1.6rem', marginTop: '6px' }}>
                        {totalSatellites}
                    </span>
                </div>
                <div className="telemetry-card" style={{ padding: '16px' }}>
                    <span className="telemetry-key">ACTIVE PASSES</span>
                    <span className="telemetry-val" style={{ color: '#00cfff', fontSize: '1.6rem', marginTop: '6px' }}>
                        {activePassesCount}
                    </span>
                </div>
                <div className="telemetry-card" style={{ padding: '16px' }}>
                    <span className="telemetry-key">ACTIVE PAYLOADS</span>
                    <span className="telemetry-val" style={{ color: '#00cfff', fontSize: '1.6rem', marginTop: '6px' }}>
                        {activePayloadsCount}
                    </span>
                </div>
                <div className="telemetry-card" style={{ padding: '16px' }}>
                    <span className="telemetry-key">LINK STATUS</span>
                    <span className="telemetry-val" style={{ color: '#10b981', fontSize: '1.4rem', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.9rem' }}>●</span> {linkStatus}
                    </span>
                </div>
            </div>

            {/* 3. ALERTS / MISSION ATTENTION SECTION */}
            <div style={{ marginBottom: '25px' }}>
                {alertSatellites.length > 0 ? (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.08)',
                        border: '1px solid #ef4444',
                        borderLeft: '4px solid #ef4444',
                        padding: '16px 20px',
                        borderRadius: '4px'
                    }}>
                        <div style={{ color: '#ef4444', fontFamily: 'var(--font-mono)', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '8px', letterSpacing: '1px' }}>
                            ⚠ MISSION ATTENTION REQUIRED
                        </div>
                        {alertSatellites.map(sat => (
                            <div key={sat.id} style={{ fontSize: '0.9rem', color: '#e2e8f0', marginBottom: '4px' }}>
                                <strong style={{ color: '#ffb86c' }}>● {sat.name}:</strong> Status {sat.status} — Battery: {sat.battery.toFixed(0)}%, Signal: {sat.signal.toFixed(0)}%, Temp: {sat.temp.toFixed(1)}°C. Immediate telemetry monitoring advised.
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{
                        background: 'rgba(16, 185, 129, 0.06)',
                        border: '1px solid #10b981',
                        borderLeft: '4px solid #10b981',
                        padding: '12px 18px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <span style={{ color: '#10b981', fontSize: '1.1rem' }}>✓</span>
                        <span style={{ color: '#e2e8f0', fontSize: '0.9rem', fontFamily: 'var(--font-mono)' }}>
                            MISSION STATUS: All monitored satellites operating within nominal parameters.
                        </span>
                    </div>
                )}
            </div>

            {/* 4. MAIN OPERATIONAL GRID (SATELLITE HEALTH 2-COL + ORBITAL PASS 1-COL) */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1.2fr)',
                gap: '20px',
                marginBottom: '25px'
            }}>
                {/* 01. SATELLITE HEALTH */}
                <div className="panel" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderBottom: '1px solid var(--border-color)' }}>
                        <h3 style={{ margin: 0, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', fontSize: '1.05rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            01. Satellite Health
                        </h3>
                        <button
                            onClick={() => setActiveTab('telemetry')}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--accent-cyan)',
                                cursor: 'pointer',
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.8rem',
                                padding: 0
                            }}
                        >
                            FULL TELEMETRY →
                        </button>
                    </div>

                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {satellites.map((sat) => {
                            const statusColor = getStatusColor(sat.status);
                            return (
                                <div
                                    key={sat.id}
                                    style={{
                                        background: '#08111f',
                                        border: `1px solid ${statusColor === '#10b981' ? 'var(--border-color)' : statusColor}`,
                                        padding: '14px 18px',
                                        borderRadius: '4px',
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
                                        gap: '12px',
                                        alignItems: 'center'
                                    }}
                                >
                                    <div>
                                        <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '0.95rem' }}>{sat.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: statusColor, fontFamily: 'var(--font-mono)', marginTop: '3px' }}>
                                            ● {sat.status}
                                        </div>
                                    </div>

                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>BATTERY</div>
                                        <div style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#e2e8f0', marginTop: '2px' }}>
                                            {sat.battery.toFixed(0)}%
                                        </div>
                                    </div>

                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>SIGNAL</div>
                                        <div style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#e2e8f0', marginTop: '2px' }}>
                                            {sat.signal.toFixed(0)}%
                                        </div>
                                    </div>

                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>ORBIT</div>
                                        <div style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#e2e8f0', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                                            {sat.altitude.toFixed(0)} km
                                        </div>
                                    </div>

                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>COMM</div>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: sat.communication === 'Offline' ? '#ef4444' : '#10b981', marginTop: '2px' }}>
                                            {sat.communication}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 02. CURRENT ORBITAL PASS */}
                <div className="panel" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '4px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderBottom: '1px solid var(--border-color)' }}>
                        <h3 style={{ margin: 0, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', fontSize: '1.05rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            02. Current Orbital Pass
                        </h3>
                        <button
                            onClick={() => setActiveTab('passes')}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--accent-cyan)',
                                cursor: 'pointer',
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.8rem',
                                padding: 0
                            }}
                        >
                            PASS SCHEDULE →
                        </button>
                    </div>

                    <div style={{ padding: '15px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {/* Compact Orbit Visualization Graphic */}
                        <div style={{ background: '#020617', border: '1px solid var(--border-color)', height: '140px', position: 'relative', overflow: 'hidden', borderRadius: '3px' }}>
                            <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '100%' }}>
                                <circle cx="50" cy="50" r="46" fill="#020617" stroke="#1a2b4c" strokeWidth="1" />
                                <path d="M 50,4 A 46,46 0 0,0 50,96 A 46,46 0 0,0 50,4" fill="none" stroke="#0f172a" strokeWidth="1" />
                                <path d="M 4,50 A 46,46 0 0,0 96,50 A 46,46 0 0,0 4,50" fill="none" stroke="#0f172a" strokeWidth="1" />
                                <path d="M 12,78 Q 50,22 88,78" fill="none" stroke="#64748b" strokeWidth="1" strokeDasharray="3, 3" />
                                <circle cx="45" cy="45" r="2.5" fill="#00cfff" className="pulse-marker" />
                                <circle cx="45" cy="45" r="5" fill="none" stroke="#00cfff" strokeWidth="0.5" opacity="0.6" />
                                <text x="49" y="44" fill="#00cfff" fontSize="4" fontFamily="monospace">{passInfo.satellite}</text>
                                <rect x="54" y="58" width="3" height="3" fill="#10b981" />
                                <text x="59" y="61" fill="#10b981" fontSize="3.5" fontFamily="monospace">GS-MUMBAI</text>
                            </svg>
                        </div>

                        <div className="mission-summary" style={{ marginTop: '5px' }}>
                            <div className="summary-row">
                                <span className="summary-label">Target Satellite:</span>
                                <span className="summary-val" style={{ color: '#00cfff' }}>{passInfo.satellite}</span>
                            </div>
                            <div className="summary-row">
                                <span className="summary-label">Ground Station:</span>
                                <span className="summary-val">GS-MUMBAI-01</span>
                            </div>
                            <div className="summary-row">
                                <span className="summary-label">AOS:</span>
                                <span className="summary-val">00:14:32 (18:42 UTC)</span>
                            </div>
                            <div className="summary-row">
                                <span className="summary-label">LOS:</span>
                                <span className="summary-val">00:26:10 (18:54 UTC)</span>
                            </div>
                            <div className="summary-row">
                                <span className="summary-label">Max Elevation:</span>
                                <span className="summary-val" style={{ color: '#10b981' }}>64.2°</span>
                            </div>
                            <div className="summary-row">
                                <span className="summary-label">Next Scheduled:</span>
                                <span className="summary-val">{passInfo.time}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 5. LOWER OPERATIONAL ROW: AI ROUTING (1fr) + PAYLOAD ACTIVITY (1fr) + RECENT MISSION ACTIVITY (1.2fr) */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '20px',
                marginBottom: '25px'
            }}>
                {/* 03. AUTONOMOUS ROUTING */}
                <div className="panel" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderBottom: '1px solid var(--border-color)' }}>
                        <h3 style={{ margin: 0, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            03. Autonomous Routing
                        </h3>
                    </div>

                    <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div className="summary-row">
                            <span className="summary-label">CURRENT DECISION:</span>
                            <span className="summary-val" style={{ color: '#00cfff' }}>SSTV → Ground Station</span>
                        </div>
                        <div className="summary-row">
                            <span className="summary-label">ACTIVE PAYLOAD:</span>
                            <span className="summary-val">TT&C Housekeeping</span>
                        </div>
                        <div className="summary-row">
                            <span className="summary-label">PRIORITY:</span>
                            <span className="summary-val" style={{ color: '#ff5555' }}>CRITICAL</span>
                        </div>
                        <div className="summary-row">
                            <span className="summary-label">ROUTING STATUS:</span>
                            <span className="summary-val" style={{ color: '#10b981' }}>● ACTIVE</span>
                        </div>
                        <div className="summary-row">
                            <span className="summary-label">QUEUED PAYLOADS:</span>
                            <span className="summary-val">{activePayloadsCount}</span>
                        </div>

                        <button
                            type="button"
                            onClick={() => setActiveTab('ai')}
                            className="btn-secondary"
                            style={{ marginTop: '10px', fontSize: '0.8rem', padding: '8px 12px' }}
                        >
                            VIEW ROUTING ENGINE →
                        </button>
                    </div>
                </div>

                {/* 04. PAYLOAD ACTIVITY */}
                <div className="panel" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderBottom: '1px solid var(--border-color)' }}>
                        <h3 style={{ margin: 0, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            04. Payload Activity
                        </h3>
                    </div>

                    <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {payloads.slice(0, 3).map(p => (
                            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px dashed rgba(255,255,255,0.05)' }}>
                                <div>
                                    <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '0.85rem' }}>{p.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.type} • {p.size}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{
                                        fontSize: '0.75rem',
                                        color: p.status === 'Transmitting' ? '#10b981' : '#00cfff',
                                        fontFamily: 'var(--font-mono)'
                                    }}>
                                        {p.status}
                                    </span>
                                </div>
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={() => setActiveTab('payloads')}
                            className="btn-secondary"
                            style={{ marginTop: '10px', fontSize: '0.8rem', padding: '8px 12px' }}
                        >
                            VIEW ALL PAYLOADS →
                        </button>
                    </div>
                </div>

                {/* 05. RECENT MISSION ACTIVITY */}
                <div className="panel" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderBottom: '1px solid var(--border-color)' }}>
                        <h3 style={{ margin: 0, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            05. Recent Mission Activity
                        </h3>
                    </div>

                    <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {recentActivities.map((act, index) => (
                            <div key={index} style={{ display: 'flex', gap: '10px', fontSize: '0.85rem', alignItems: 'flex-start' }}>
                                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', fontSize: '0.75rem', marginTop: '1px' }}>
                                    {act.time}
                                </span>
                                <span style={{ color: 'var(--text-main)', lineHeight: '1.4' }}>
                                    {act.text}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 6. TECHNICAL PARAMETERS (COLLAPSIBLE / SECONDARY SECTION) */}
            <div style={{
                background: 'var(--bg-panel)',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                marginTop: '10px'
            }}>
                <div
                    onClick={() => setIsTechParamsOpen(!isTechParamsOpen)}
                    style={{
                        padding: '15px 20px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        background: 'rgba(0, 207, 255, 0.03)'
                    }}
                >
                    <h3 style={{ margin: 0, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', fontSize: '0.95rem', letterSpacing: '1px' }}>
                        06. MISSION TECHNICAL PARAMETERS {isTechParamsOpen ? '▲' : '▼'}
                    </h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {isTechParamsOpen ? 'Click to collapse' : 'Click to expand profile parameters'}
                    </span>
                </div>

                {isTechParamsOpen && (
                    <div style={{ padding: '20px', borderTop: '1px solid var(--border-color)' }}>
                        <div className="telemetry-grid" style={{ marginBottom: 0 }}>
                            {Object.entries(telemetryMetrics).map(([key, value]) => (
                                <div className="telemetry-card" key={key}>
                                    <span className="telemetry-key">{key.replace(/([A-Z])/g, " $1").toUpperCase()}</span>
                                    <span className="telemetry-val">{value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OverviewDashboard;
