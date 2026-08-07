import React from 'react';
import StatusBadge from './StatusBadge';

const TopBar = () => {
    return (
        <header className="top-bar">
            <div className="top-bar-left">
                SomaiyaSat & SomaiyaPod Dashboard
            </div>
            <div className="top-bar-right">
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
