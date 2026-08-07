import React, { useState, useEffect } from 'react';
import {
    validateUsername,
    validatePassword,
    validateEmail,
    validateMissionId,
    validateFrequency,
    validateEmergencyContact,
    validateOperatorName,
    validateSatelliteNickname,
    validateCountry,
    validateTerms
} from '../utils/Validation';

const INITIAL_DATA = {
    missionName: 'SomaiyaSat Demo',
    missionId: 'KJS-SRS-01',
    operatorName: 'John Doe',
    operatorEmail: 'operator@somaiya.edu',
    satelliteNickname: 'SomaiyaPod-Alpha',
    communicationFrequency: '435',
    bandwidth: '12.5kHz',
    missionMode: 'Nominal',
    powerSlider: '50',
    targetOrbit: 'LEO',
    country: 'IN',
    emergencyContact: '9876543210',
    username: 'admin',
    password: 'Password1',
    confirmPassword: 'Password1',
    agreeTerms: true
};

const MissionForm = () => {
    const [isEditing, setIsEditing] = useState(false);
    
    // Maintain originalData for the read-only view and for resetting
    const [originalData, setOriginalData] = useState(INITIAL_DATA);
    
    // Maintain formData for the editable view
    const [formData, setFormData] = useState(INITIAL_DATA);

    const [errors, setErrors] = useState({});
    const [isFormValid, setIsFormValid] = useState(false);

    useEffect(() => {
        if (!isEditing) return;

        const newErrors = {};

        if (formData.username && !validateUsername(formData.username)) {
            newErrors.username = "Username minimum 4 characters";
        }
        if (formData.password && !validatePassword(formData.password)) {
            newErrors.password = "Min 6 chars, 1 uppercase, 1 number";
        }
        if (formData.confirmPassword && formData.confirmPassword !== formData.password) {
            newErrors.confirmPassword = "Passwords do not match";
        }
        if (formData.operatorEmail && !validateEmail(formData.operatorEmail)) {
            newErrors.operatorEmail = "Invalid email format";
        }
        if (formData.missionId && !validateMissionId(formData.missionId)) {
            newErrors.missionId = "Must match pattern: KJS-SRS-01";
        }
        if (formData.communicationFrequency && !validateFrequency(formData.communicationFrequency)) {
            newErrors.communicationFrequency = "Must be a number between 430-450";
        }
        if (formData.emergencyContact && !validateEmergencyContact(formData.emergencyContact)) {
            newErrors.emergencyContact = "Must be exactly 10 digits";
        }
        if (formData.operatorName && !validateOperatorName(formData.operatorName)) {
            newErrors.operatorName = "Letters and spaces only";
        }
        if (formData.satelliteNickname && !validateSatelliteNickname(formData.satelliteNickname)) {
            newErrors.satelliteNickname = "Letters, numbers, dash only";
        }
        if (formData.country !== '' && !validateCountry(formData.country)) {
            newErrors.country = "Select a country";
        }

        setErrors(newErrors);

        const allFilled = formData.missionName && formData.missionId && formData.operatorName && 
                          formData.operatorEmail && formData.satelliteNickname && formData.communicationFrequency && 
                          formData.country && formData.emergencyContact && formData.username && formData.password && 
                          formData.confirmPassword && formData.agreeTerms;
                          
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
                <div className="form-section-divider">Mission Identity</div>
                <div className="summary-row">
                    <span className="summary-label">Mission Name:</span> <span className="summary-val">{originalData.missionName || 'N/A'}</span>
                </div>
                <div className="summary-row">
                    <span className="summary-label">Mission ID:</span> <span className="summary-val">{originalData.missionId || 'N/A'}</span>
                </div>
                <div className="summary-row">
                    <span className="summary-label">Operator Name:</span> <span className="summary-val">{originalData.operatorName || 'N/A'}</span>
                </div>
                <div className="summary-row">
                    <span className="summary-label">Operator Email:</span> <span className="summary-val">{originalData.operatorEmail || 'N/A'}</span>
                </div>
                
                <div className="form-section-divider">Hardware & RF Link</div>
                <div className="summary-row">
                    <span className="summary-label">Satellite Nickname:</span> <span className="summary-val">{originalData.satelliteNickname || 'N/A'}</span>
                </div>
                <div className="summary-row">
                    <span className="summary-label">Frequency (MHz):</span> <span className="summary-val">{originalData.communicationFrequency || 'N/A'}</span>
                </div>
                <div className="summary-row">
                    <span className="summary-label">Bandwidth:</span> <span className="summary-val">{originalData.bandwidth}</span>
                </div>
                <div className="summary-row">
                    <span className="summary-label">Mission Mode:</span> <span className="summary-val">{originalData.missionMode}</span>
                </div>
                <div className="summary-row">
                    <span className="summary-label">Target Orbit:</span> <span className="summary-val">{originalData.targetOrbit}</span>
                </div>
                <div className="summary-row">
                    <span className="summary-label">Power Output Limit:</span> <span className="summary-val">{originalData.powerSlider}%</span>
                </div>

                <div className="form-section-divider">Security & Locale</div>
                <div className="summary-row">
                    <span className="summary-label">Country:</span> <span className="summary-val">{originalData.country || 'N/A'}</span>
                </div>
                <div className="summary-row">
                    <span className="summary-label">Emergency Contact:</span> <span className="summary-val">{originalData.emergencyContact || 'N/A'}</span>
                </div>
                <div className="summary-row">
                    <span className="summary-label">System Username:</span> <span className="summary-val">{originalData.username || 'N/A'}</span>
                </div>

                <div className="form-actions" style={{marginTop: "20px"}}>
                    <button type="button" className="btn-primary" onClick={() => setIsEditing(true)}>Edit Configuration</button>
                </div>
            </div>
        );
    }

    return (
        <form className="mission-form" onSubmit={handleApplyChanges}>
            <div className="form-section-divider">Mission Identity</div>
            <div className="form-row">
                <div className="form-group">
                    <label>Mission Name</label>
                    <input type="text" name="missionName" value={formData.missionName} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Mission ID</label>
                    <input type="text" name="missionId" value={formData.missionId} onChange={handleChange} placeholder="KJS-SRS-01" />
                    {errors.missionId && <span className="error-msg">{errors.missionId}</span>}
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Operator Name</label>
                    <input type="text" name="operatorName" value={formData.operatorName} onChange={handleChange} />
                    {errors.operatorName && <span className="error-msg">{errors.operatorName}</span>}
                </div>
                <div className="form-group">
                    <label>Operator Email</label>
                    <input type="text" name="operatorEmail" value={formData.operatorEmail} onChange={handleChange} />
                    {errors.operatorEmail && <span className="error-msg">{errors.operatorEmail}</span>}
                </div>
            </div>

            <div className="form-section-divider">Hardware & RF Link</div>
            <div className="form-group">
                <label>Satellite Nickname</label>
                <input type="text" name="satelliteNickname" value={formData.satelliteNickname} onChange={handleChange} />
                {errors.satelliteNickname && <span className="error-msg">{errors.satelliteNickname}</span>}
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Comm Frequency (MHz)</label>
                    <input type="text" name="communicationFrequency" value={formData.communicationFrequency} onChange={handleChange} placeholder="430-450" />
                    {errors.communicationFrequency && <span className="error-msg">{errors.communicationFrequency}</span>}
                </div>
                <div className="form-group">
                    <label>Bandwidth</label>
                    <select name="bandwidth" value={formData.bandwidth} onChange={handleChange}>
                        <option value="12.5kHz">12.5kHz</option>
                        <option value="25.0kHz">25.0kHz</option>
                        <option value="19.2kHz">19.2kHz</option>
                    </select>
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

            <div className="form-group">
                <label>Power Output Limit: {formData.powerSlider}%</label>
                <input type="range" name="powerSlider" min="0" max="100" value={formData.powerSlider} onChange={handleChange} />
            </div>

            <div className="form-section-divider">Security & Locale</div>
            <div className="form-row">
                <div className="form-group">
                    <label>Country of Operation</label>
                    <select name="country" value={formData.country} onChange={handleChange}>
                        <option value="">Select Country</option>
                        <option value="IN">India</option>
                        <option value="US">USA</option>
                        <option value="EU">Europe</option>
                    </select>
                    {errors.country && <span className="error-msg">{errors.country}</span>}
                </div>
                <div className="form-group">
                    <label>Emergency Contact</label>
                    <input type="text" name="emergencyContact" value={formData.emergencyContact} onChange={handleChange} placeholder="10 Digits" />
                    {errors.emergencyContact && <span className="error-msg">{errors.emergencyContact}</span>}
                </div>
            </div>

            <div className="form-group">
                <label>System Username</label>
                <input type="text" name="username" value={formData.username} onChange={handleChange} />
                {errors.username && <span className="error-msg">{errors.username}</span>}
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Security Key (Password)</label>
                    <input type="password" name="password" value={formData.password} onChange={handleChange} />
                    {errors.password && <span className="error-msg">{errors.password}</span>}
                </div>
                <div className="form-group">
                    <label>Confirm Key</label>
                    <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} />
                    {errors.confirmPassword && <span className="error-msg">{errors.confirmPassword}</span>}
                </div>
            </div>

            <div className="form-group checkbox-group" style={{marginTop: "10px"}}>
                <input type="checkbox" name="agreeTerms" id="agreeTerms" checked={formData.agreeTerms} onChange={handleChange} />
                <label htmlFor="agreeTerms">Acknowledge Mission Control Authority & Protocol Terms</label>
            </div>

            <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={!isFormValid}>Apply Changes</button>
                <button type="button" className="btn-secondary" onClick={handleCancel}>Cancel</button>
            </div>
        </form>
    );
};

export default MissionForm;
