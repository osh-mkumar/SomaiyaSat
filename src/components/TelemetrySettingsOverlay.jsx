import React, { useState } from 'react';

const TelemetrySettingsOverlay = ({ limits, onSave, onCancel, role }) => {
    const [draftLimits, setDraftLimits] = useState(limits);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setDraftLimits(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : Number(value)
        }));
    };

    const handleApply = (e) => {
        e.preventDefault();
        onSave(draftLimits);
    };

    return (
        <div className="overlay-backdrop" onClick={onCancel}>
            <div className="overlay-content" onClick={e => e.stopPropagation()}>
                <div className="overlay-header">
                    <h2>TELEMETRY SETTINGS</h2>
                    <button className="close-btn" onClick={onCancel}>×</button>
                </div>
                
                {role !== "Admin" ? (
                    <div className="overlay-body">
                        <p style={{ color: '#ffb86c' }}>Administrator privileges required to edit telemetry thresholds.</p>
                        
                        <div className="form-group" style={{marginTop: 15}}>
                            <label>Battery Warning Threshold (%)</label>
                            <input type="number" value={draftLimits.lowerBattery} disabled />
                        </div>
                        <div className="form-group" style={{marginTop: 10}}>
                            <label>Critical Battery Threshold (%)</label>
                            <input type="number" value={draftLimits.criticalBattery || 15} disabled />
                        </div>
                        <div className="form-group" style={{marginTop: 10}}>
                            <label>Temperature Warning Threshold (°C)</label>
                            <input type="number" value={draftLimits.tempAlarm} disabled />
                        </div>
                    </div>
                ) : (
                    <form className="overlay-body mission-form" onSubmit={handleApply}>
                        <div className="form-group">
                            <label>Battery Warning Threshold (%)</label>
                            <input type="number" name="lowerBattery" value={draftLimits.lowerBattery} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Critical Battery Threshold (%)</label>
                            <input type="number" name="criticalBattery" value={draftLimits.criticalBattery || 15} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Temperature Warning Threshold (°C)</label>
                            <input type="number" name="tempAlarm" value={draftLimits.tempAlarm} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Telemetry Refresh Interval (ms)</label>
                            <input type="number" name="refreshInterval" value={draftLimits.refreshInterval} onChange={handleChange} />
                        </div>
                        
                        <div className="checkbox-group" style={{ marginTop: '15px' }}>
                            <input type="checkbox" id="highTempAlert" name="highTempAlert" checked={draftLimits.highTempAlert} onChange={handleChange} />
                            <label htmlFor="highTempAlert">High Temperature Alert</label>
                        </div>
                        
                        <div className="checkbox-group" style={{ marginTop: '10px', marginBottom: '20px' }}>
                            <input type="checkbox" id="lowBatteryAlert" name="lowBatteryAlert" checked={draftLimits.lowBatteryAlert || false} onChange={handleChange} />
                            <label htmlFor="lowBatteryAlert">Low Battery Alert</label>
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="btn-primary">Apply Changes</button>
                            <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default TelemetrySettingsOverlay;
