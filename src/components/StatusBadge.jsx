import React from 'react';

// Pass the status as a prop to easily reuse this badge across different UI panels with different colors.
const StatusBadge = ({ status, text }) => {
    return (
        <div className="status-badge">
            <span className={`status-indicator ${status}`}>●</span> {text}
        </div>
    );
};

export default StatusBadge;
