import React from 'react';

const StatusBadge = ({ status, text }) => {
    return (
        <div className="status-badge">
            <span className={`status-indicator ${status}`}>●</span> {text}
        </div>
    );
};

export default StatusBadge;
