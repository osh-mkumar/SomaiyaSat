import React from 'react';
import MissionForm from './MissionForm';

const RFPanel = () => {
    return (
        <div className="panel rf-panel">
            <h2 className="panel-title">RF Configuration Panel</h2>
            <div className="panel-content">
                <MissionForm />
            </div>
        </div>
    );
};

export default RFPanel;
