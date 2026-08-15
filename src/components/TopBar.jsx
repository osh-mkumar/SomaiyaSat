import React from 'react';
import StatusBadge from './StatusBadge';

const TopBar = ({ role, setRole }) => {
    return (
        <header className="top-bar">
            <div className="top-bar-left">
                SomaiyaSat & SomaiyaPod Dashboard
            </div>
            <div className="top-bar-right" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ fontSize: '0.9em', background: '#1a2235', padding: '4px 10px', borderRadius: '4px', border: '1px solid #334' }}>
                    Role:
                    <select value={role} onChange={e => setRole(e.target.value)} style={{ background: 'transparent', color: '#0df', border: 'none', marginLeft: '5px' }}>
                        <option value="Admin">Admin</option>
                        <option value="Student">Student</option>
                    </select>
                </div>
                <select className="satellite-selector">
                    <option>SomaiyaSat-1 (Active)</option>
                    <option>IndianSat80</option>
                </select>
                <StatusBadge status="connected" text="Link Status: Connected" />
            </div>
        </header>
    );
};

export default TopBar;
