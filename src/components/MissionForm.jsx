import React, { useState, useEffect } from 'react';
import {
    validateMissionId,
    validateFrequency,
    validateSatelliteNickname
} from '../utils/Validation';

const INITIAL_DATA = {
    // Mission Identity
    missionId: 'KJS-SRS-01',
    satelliteNickname: 'SomaiyaPod-Alpha',
    missionMode: 'Nominal',
    targetOrbit: 'LEO',
    
    // RF Configuration
    uplinkFrequency: '435.000',
    downlinkFrequency: '437.450',
    bandwidth: '12.5kHz',
    modulation: 'FSK',
    transmitPower: '50',
    
    // Power & Safety
    batteryWarning: '30',
    criticalBattery: '15',
    tempWarning: '45',
    safeModeTrigger: 'Battery',
    
    // Payload Configuration
    sstvPriority: 'High',
    m17Priority: 'Normal',
    codec2Priority: 'Normal',
    maxSstvSize: '500',
    
    // Ground Station
    gsId: 'GS-MUMBAI-01',
    gsLat: '19.0760',
    gsLon: '72.8777',
    commWindow: '15'
};

const MissionForm = ({ role }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [originalData, setOriginalData] = useState(INITIAL_DATA);
    const [formData, setFormData] = useState(INITIAL_DATA);
    const [errors, setErrors] = useState({});
    const [isFormValid, setIsFormValid] = useState(false);

    useEffect(() => {
        if (!isEditing) return;

        const newErrors = {};

        if (formData.missionId && !validateMissionId(formData.missionId)) {
            newErrors.missionId = "Must match pattern: KJS-SRS-01";
        }
        if (formData.satelliteNickname && !validateSatelliteNickname(formData.satelliteNickname)) {
            newErrors.satelliteNickname = "Letters, numbers, dash only";
        }
        if (formData.uplinkFrequency && !validateFrequency(formData.uplinkFrequency)) {
            newErrors.uplinkFrequency = "Must be a number between 430-450";
        }
        if (formData.downlinkFrequency && !validateFrequency(formData.downlinkFrequency)) {
            newErrors.downlinkFrequency = "Must be a number between 430-450";
        }

        setErrors(newErrors);

        const allFilled = formData.missionId && formData.satelliteNickname && formData.uplinkFrequency && formData.downlinkFrequency;
        const hasNoErrors = Object.keys(newErrors).length === 0;

        setIsFormValid(!!(allFilled && hasNoErrors));
    }, [formData, isEditing]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
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

    if (!isEditing) {
        return (
            <div className="mission-summary">
                <div className="form-section-divider">Mission Profile</div>
                <div className="summary-row"><span className="summary-label">Mission ID:</span> <span className="summary-val">{originalData.missionId}</span></div>
                <div className="summary-row"><span className="summary-label">Satellite Nickname:</span> <span className="summary-val">{originalData.satelliteNickname}</span></div>
                <div className="summary-row"><span className="summary-label">Mission Mode:</span> <span className="summary-val">{originalData.missionMode}</span></div>
                <div className="summary-row"><span className="summary-label">Target Orbit:</span> <span className="summary-val">{originalData.targetOrbit}</span></div>

                <div className="form-section-divider">RF Configuration</div>
                <div className="summary-row"><span className="summary-label">Uplink (MHz):</span> <span className="summary-val">{originalData.uplinkFrequency}</span></div>
                <div className="summary-row"><span className="summary-label">Downlink (MHz):</span> <span className="summary-val">{originalData.downlinkFrequency}</span></div>
                <div className="summary-row"><span className="summary-label">Bandwidth:</span> <span className="summary-val">{originalData.bandwidth}</span></div>
                <div className="summary-row"><span className="summary-label">Modulation:</span> <span className="summary-val">{originalData.modulation}</span></div>
                <div className="summary-row"><span className="summary-label">Transmit Power:</span> <span className="summary-val">{originalData.transmitPower}%</span></div>

                <div className="form-section-divider">Power & Safety</div>
                <div className="summary-row"><span className="summary-label">Battery Warning:</span> <span className="summary-val">{originalData.batteryWarning}%</span></div>
                <div className="summary-row"><span className="summary-label">Critical Battery:</span> <span className="summary-val">{originalData.criticalBattery}%</span></div>
                <div className="summary-row"><span className="summary-label">Temp Warning:</span> <span className="summary-val">{originalData.tempWarning}°C</span></div>
                <div className="summary-row"><span className="summary-label">Safe Mode Trigger:</span> <span className="summary-val">{originalData.safeModeTrigger}</span></div>

                <div className="form-section-divider">Payload Config</div>
                <div className="summary-row"><span className="summary-label">SSTV Priority:</span> <span className="summary-val">{originalData.sstvPriority}</span></div>
                <div className="summary-row"><span className="summary-label">Max SSTV Size:</span> <span className="summary-val">{originalData.maxSstvSize} KB</span></div>

                <div className="form-section-divider">Ground Station</div>
                <div className="summary-row"><span className="summary-label">Station ID:</span> <span className="summary-val">{originalData.gsId}</span></div>
                <div className="summary-row"><span className="summary-label">Comm Window:</span> <span className="summary-val">{originalData.commWindow} mins</span></div>

                <div className="form-actions" style={{ marginTop: "20px" }}>
                    {role === "Admin" ? (
                        <button type="button" className="btn-primary" onClick={() => setIsEditing(true)}>Edit Configuration</button>
                    ) : (
                        <p style={{ color: '#ffb86c' }}>Administrator privileges required to edit configuration.</p>
                    )}
                </div>
            </div>
        );
    }

    return (
        <form className="mission-form" onSubmit={handleApplyChanges}>
            <div className="form-section-divider">Mission Profile</div>
            <div className="form-row">
                <div className="form-group">
                    <label>Mission ID</label>
                    <input type="text" name="missionId" value={formData.missionId} onChange={handleChange} />
                    {errors.missionId && <span className="error-msg">{errors.missionId}</span>}
                </div>
                <div className="form-group">
                    <label>Satellite Nickname</label>
                    <input type="text" name="satelliteNickname" value={formData.satelliteNickname} onChange={handleChange} />
                    {errors.satelliteNickname && <span className="error-msg">{errors.satelliteNickname}</span>}
                </div>
            </div>
            <div className="form-row">
                <div className="form-group">
                    <label>Mission Mode</label>
                    <select name="missionMode" value={formData.missionMode} onChange={handleChange}>
                        <option value="Nominal">Nominal</option>
                        <option value="Safe">Safe Mode</option>
                        <option value="Recovery">Recovery</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Target Orbit</label>
                    <select name="targetOrbit" value={formData.targetOrbit} onChange={handleChange}>
                        <option value="LEO">LEO</option>
                        <option value="MEO">MEO</option>
                        <option value="GEO">GEO</option>
                    </select>
                </div>
            </div>

            <div className="form-section-divider">RF Configuration</div>
            <div className="form-row">
                <div className="form-group">
                    <label>Uplink Freq (MHz)</label>
                    <input type="text" name="uplinkFrequency" value={formData.uplinkFrequency} onChange={handleChange} />
                    {errors.uplinkFrequency && <span className="error-msg">{errors.uplinkFrequency}</span>}
                </div>
                <div className="form-group">
                    <label>Downlink Freq (MHz)</label>
                    <input type="text" name="downlinkFrequency" value={formData.downlinkFrequency} onChange={handleChange} />
                    {errors.downlinkFrequency && <span className="error-msg">{errors.downlinkFrequency}</span>}
                </div>
            </div>
            <div className="form-row">
                <div className="form-group">
                    <label>Bandwidth</label>
                    <select name="bandwidth" value={formData.bandwidth} onChange={handleChange}>
                        <option value="12.5kHz">12.5kHz</option>
                        <option value="25.0kHz">25.0kHz</option>
                        <option value="19.2kHz">19.2kHz</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Modulation</label>
                    <select name="modulation" value={formData.modulation} onChange={handleChange}>
                        <option value="FSK">FSK</option>
                        <option value="BPSK">BPSK</option>
                        <option value="QPSK">QPSK</option>
                    </select>
                </div>
            </div>
            <div className="form-group">
                <label>Transmit Power: {formData.transmitPower}%</label>
                <input type="range" name="transmitPower" min="0" max="100" value={formData.transmitPower} onChange={handleChange} />
            </div>

            <div className="form-section-divider">Power & Safety</div>
            <div className="form-row">
                <div className="form-group">
                    <label>Battery Warning (%)</label>
                    <input type="number" name="batteryWarning" value={formData.batteryWarning} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Critical Battery (%)</label>
                    <input type="number" name="criticalBattery" value={formData.criticalBattery} onChange={handleChange} />
                </div>
            </div>
            <div className="form-row">
                <div className="form-group">
                    <label>Temp Warning (°C)</label>
                    <input type="number" name="tempWarning" value={formData.tempWarning} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Safe Mode Trigger</label>
                    <select name="safeModeTrigger" value={formData.safeModeTrigger} onChange={handleChange}>
                        <option value="Battery">Battery</option>
                        <option value="Temperature">Temperature</option>
                        <option value="Signal">Signal Loss</option>
                    </select>
                </div>
            </div>

            <div className="form-section-divider">Payload Config</div>
            <div className="form-row">
                <div className="form-group">
                    <label>SSTV Priority</label>
                    <select name="sstvPriority" value={formData.sstvPriority} onChange={handleChange}>
                        <option value="Critical">Critical</option>
                        <option value="High">High</option>
                        <option value="Normal">Normal</option>
                        <option value="Low">Low</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Max SSTV Size (KB)</label>
                    <input type="number" name="maxSstvSize" value={formData.maxSstvSize} onChange={handleChange} />
                </div>
            </div>
            <div className="form-row">
                <div className="form-group">
                    <label>M17 Priority</label>
                    <select name="m17Priority" value={formData.m17Priority} onChange={handleChange}>
                        <option value="Normal">Normal</option>
                        <option value="Low">Low</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Codec2 Priority</label>
                    <select name="codec2Priority" value={formData.codec2Priority} onChange={handleChange}>
                        <option value="Normal">Normal</option>
                        <option value="Low">Low</option>
                    </select>
                </div>
            </div>

            <div className="form-section-divider">Ground Station</div>
            <div className="form-group">
                <label>GS ID</label>
                <input type="text" name="gsId" value={formData.gsId} onChange={handleChange} />
            </div>
            <div className="form-row">
                <div className="form-group">
                    <label>Latitude</label>
                    <input type="text" name="gsLat" value={formData.gsLat} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Longitude</label>
                    <input type="text" name="gsLon" value={formData.gsLon} onChange={handleChange} />
                </div>
            </div>
            <div className="form-group">
                <label>Comm Window (mins)</label>
                <input type="number" name="commWindow" value={formData.commWindow} onChange={handleChange} />
            </div>

            <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={!isFormValid}>Apply Changes</button>
                <button type="button" className="btn-secondary" onClick={handleCancel}>Cancel</button>
            </div>
        </form>
    );
};

export default MissionForm;
