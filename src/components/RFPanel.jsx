import React from 'react';
import MissionForm from './MissionForm';

const RFPanel = ({ role }) => {
    return (
        <div className="panel rf-panel">
            <h2 className="panel-title">RF Configuration Panel</h2>
            <div className="panel-content">
                <MissionForm role={role} />
            </div>
        </div>
    );
};

export default RFPanel;
