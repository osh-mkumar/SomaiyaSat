import React, { useState, useEffect } from 'react';
import {
    validateFrequency
} from '../utils/Validation';

const INITIAL_DATA = {
    frequency: '437.450',
    bandwidth: '12.5kHz',
    modes: {
        M17: true,
        Codec2: false,
        SSTV: false
    },
    transmitPower: 50,
    downtime: {
        hours: 0,
        minutes: 15,
        seconds: 0
    }
};

const MissionForm = ({ role, selectedPass }) => {
    // Keep track of the original data separately so we can discard unsaved edits on cancel.
    const [isEditing, setIsEditing] = useState(false);
    const [originalData, setOriginalData] = useState(INITIAL_DATA);
    const [formData, setFormData] = useState(INITIAL_DATA);
    const [errors, setErrors] = useState({});
    const [isFormValid, setIsFormValid] = useState(true);

    useEffect(() => {
        if (!isEditing) return;

        const newErrors = {};

        if (formData.frequency && !validateFrequency(formData.frequency)) {
            newErrors.frequency = "Frequency must be between 430 - 450 MHz";
        }

        setErrors(newErrors);
        const hasNoErrors = Object.keys(newErrors).length === 0;
        setIsFormValid(hasNoErrors);
    }, [formData, isEditing]);

    const handleTextChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleModeToggle = (modeName) => {
        setFormData(prev => ({
            ...prev,
            modes: {
                ...prev.modes,
                [modeName]: !prev.modes[modeName]
            }
        }));
    };

    const handleDowntimeChange = (unit, value) => {
        const numVal = Math.max(0, parseInt(value, 10) || 0);
        setFormData(prev => ({
            ...prev,
            downtime: {
                ...prev.downtime,
                [unit]: numVal
            }
        }));
    };

    const handleApplyChanges = (e) => {
        e.preventDefault();
        if (isFormValid) {
            setOriginalData(formData);
            setIsEditing(false);
        }
    };

    const handleCancel = () => {
        setFormData(originalData);
        setIsEditing(false);
        setErrors({});
    };

    const formatDowntime = (dt) => {
        return `${String(dt.hours).padStart(2, '0')}h ${String(dt.minutes).padStart(2, '0')}m ${String(dt.seconds).padStart(2, '0')}s`;
    };

    const activeModesList = Object.entries(originalData.modes)
        .filter(([_, active]) => active)
        .map(([name]) => name)
        .join(', ') || 'None';

    if (!isEditing) {
        return (
            <div className="mission-summary">
                {selectedPass && (
                    <div style={{
                        background: 'rgba(0, 207, 255, 0.08)',
                        border: '1px solid #0df',
                        padding: '12px',
                        borderRadius: '4px',
                        marginBottom: '15px'
                    }}>
                        <div style={{ color: '#0df', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>
                            NEXT PASS
                        </div>
                        <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#fff', marginTop: '2px' }}>
                            {selectedPass.satellite}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#8892b0', fontFamily: 'var(--font-mono)' }}>
                            {selectedPass.time} • {selectedPass.location}
                        </div>
                    </div>
                )}

                <div className="form-section-divider">RF CONFIGURATION</div>
                <div className="summary-row">
                    <span className="summary-label">Frequency:</span> 
                    <span className="summary-val">{originalData.frequency} MHz</span>
                </div>
                <div className="summary-row">
                    <span className="summary-label">Bandwidth:</span> 
                    <span className="summary-val">{originalData.bandwidth}</span>
                </div>
                <div className="summary-row">
                    <span className="summary-label">Active Modes:</span> 
                    <span className="summary-val" style={{ color: '#0df' }}>{activeModesList}</span>
                </div>
                <div className="summary-row">
                    <span className="summary-label">Transmit Power:</span> 
                    <span className="summary-val">{originalData.transmitPower}%</span>
                </div>
                <div className="summary-row">
                    <span className="summary-label">Downtime Window:</span> 
                    <span className="summary-val">{formatDowntime(originalData.downtime)}</span>
                </div>

                <div className="form-actions" style={{ marginTop: "20px" }}>
                    {role === "Admin" ? (
                        <button type="button" className="btn-primary" onClick={() => setIsEditing(true)}>
                            EDIT CONFIGURATION
                        </button>
                    ) : (
                        <p style={{ color: '#ffb86c', fontSize: '0.85em', margin: 0 }}>
                            Student Mode: Administrator privileges required to edit RF configuration.
                        </p>
                    )}
                </div>
            </div>
        );
    }

    // INLAY EDIT MODE
    return (
        <form className="mission-form" onSubmit={handleApplyChanges}>
            <div className="form-section-divider">EDIT RF CONFIGURATION</div>
            
            <div className="form-group">
                <label>Frequency (MHz)</label>
                <input 
                    type="text" 
                    name="frequency" 
                    value={formData.frequency} 
                    onChange={handleTextChange} 
                />
                {errors.frequency && <span className="error-msg">{errors.frequency}</span>}
            </div>

            <div className="form-group">
                <label>Bandwidth</label>
                <select name="bandwidth" value={formData.bandwidth} onChange={handleTextChange}>
                    <option value="12.5kHz">12.5kHz</option>
                    <option value="25.0kHz">25.0kHz</option>
                    <option value="19.2kHz">19.2kHz</option>
                </select>
            </div>

            {/* MODE CONTROLS: M17, CODEC2, SSTV */}
            <div className="form-group">
                <label>Mode Controls</label>
                <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                    {['M17', 'Codec2', 'SSTV'].map((m) => {
                        const isOn = formData.modes[m];
                        return (
                            <button
                                key={m}
                                type="button"
                                onClick={() => handleModeToggle(m)}
                                style={{
                                    flex: 1,
                                    padding: '8px 10px',
                                    background: isOn ? 'rgba(0, 207, 255, 0.15)' : '#08111f',
                                    border: `1px solid ${isOn ? '#0df' : '#1a2b4c'}`,
                                    color: isOn ? '#0df' : '#64748b',
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '0.85rem',
                                    cursor: 'pointer',
                                    fontWeight: isOn ? 'bold' : 'normal',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '2px'
                                }}
                            >
                                <span style={{ fontSize: '0.7rem', color: isOn ? '#10b981' : '#64748b' }}>
                                    {isOn ? '[ ON ]' : '[ OFF ]'}
                                </span>
                                <span>{m}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* DOWNTIME WINDOW DURATION (Hours / Minutes / Seconds) */}
            <div className="form-group">
                <label>Downtime Window Duration</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '4px' }}>
                    <div>
                        <span style={{ fontSize: '0.75rem', color: '#8892b0', fontFamily: 'var(--font-mono)' }}>Hours</span>
                        <input
                            type="number"
                            min="0"
                            max="24"
                            value={formData.downtime.hours}
                            onChange={(e) => handleDowntimeChange('hours', e.target.value)}
                            style={{ width: '100%' }}
                        />
                    </div>
                    <div>
                        <span style={{ fontSize: '0.75rem', color: '#8892b0', fontFamily: 'var(--font-mono)' }}>Minutes</span>
                        <input
                            type="number"
                            min="0"
                            max="59"
                            value={formData.downtime.minutes}
                            onChange={(e) => handleDowntimeChange('minutes', e.target.value)}
                            style={{ width: '100%' }}
                        />
                    </div>
                    <div>
                        <span style={{ fontSize: '0.75rem', color: '#8892b0', fontFamily: 'var(--font-mono)' }}>Seconds</span>
                        <input
                            type="number"
                            min="0"
                            max="59"
                            value={formData.downtime.seconds}
                            onChange={(e) => handleDowntimeChange('seconds', e.target.value)}
                            style={{ width: '100%' }}
                        />
                    </div>
                </div>
            </div>

            {/* POWER SLIDER: LOW --------●-------- HIGH */}
            <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label>Transmit Power: {formData.transmitPower}%</label>
                    <span style={{ fontSize: '0.75rem', color: '#8892b0', fontFamily: 'var(--font-mono)' }}>
                        {formData.transmitPower < 30 ? 'LOW' : formData.transmitPower > 70 ? 'HIGH' : 'MED'}
                    </span>
                </div>
                <input 
                    type="range" 
                    name="transmitPower" 
                    min="0" 
                    max="100" 
                    value={formData.transmitPower} 
                    onChange={handleTextChange} 
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                    <span>LOW</span>
                    <span>MED</span>
                    <span>HIGH</span>
                </div>
            </div>

            <div className="form-actions" style={{ marginTop: '10px' }}>
                <button type="submit" className="btn-primary" disabled={!isFormValid}>APPLY CHANGES</button>
                <button type="button" className="btn-secondary" onClick={handleCancel}>CANCEL</button>
            </div>
        </form>
    );
};

export default MissionForm;
