import React, { useState, useEffect, useMemo } from 'react';
import { getPasses, createPass, deletePass } from '../services/satelliteApi';
import {
    validateLatitude,
    validateLongitude,
    validateDate,
    validateTime,
    validateSatellite
} from '../utils/Validation';

// Simple Natural Language & Regex parser for Pass Scheduling
const parseNaturalLanguage = (text) => {
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
        return { isValid: false, reason: "Input is empty." };
    }

    const cleaned = text.trim();

    // 1. Latitude & Longitude extraction
    const coordPairRegex = /(-?\d+(?:\.\d+)?)\s*([NSns])?\s*[,/ ]\s*(-?\d+(?:\.\d+)?)\s*([EWew])?/i;
    const coordMatch = cleaned.match(coordPairRegex);

    let lat = null;
    let lon = null;

    if (coordMatch) {
        let latVal = parseFloat(coordMatch[1]);
        const latDir = (coordMatch[2] || '').toUpperCase();
        if (latDir === 'S') latVal = -Math.abs(latVal);
        else if (latDir === 'N') latVal = Math.abs(latVal);
        lat = latVal;

        let lonVal = parseFloat(coordMatch[3]);
        const lonDir = (coordMatch[4] || '').toUpperCase();
        if (lonDir === 'W') lonVal = -Math.abs(lonVal);
        else if (lonDir === 'E') lonVal = Math.abs(lonVal);
        lon = lonVal;
    } else {
        const latRegex = /(-?\d+(?:\.\d+)?)\s*([NSns])?/i;
        const lonRegex = /(?:,\s*|\s+)(-?\d+(?:\.\d+)?)\s*([EWew])?/i;
        const latM = cleaned.match(latRegex);
        if (latM) {
            lat = parseFloat(latM[1]);
            const latDir = (latM[2] || '').toUpperCase();
            if (latDir === 'S') lat = -Math.abs(lat);
        }
        const lonM = cleaned.match(lonRegex);
        if (lonM) {
            lon = parseFloat(lonM[1]);
            const lonDir = (lonM[2] || '').toUpperCase();
            if (lonDir === 'W') lon = -Math.abs(lon);
        }
    }

    // 2. Time Regex Match: e.g. "tomorrow at 4pm", "4pm", "14:00UTC", "16:00 UTC", "16:00"
    const timeRegex = /(?:(?:at|@)\s*)?(\d{1,2})(?::(\d{2}))?\s*(am|pm|utc)?/i;
    const timeMatch = cleaned.match(timeRegex);

    let parsedTime = null;
    if (timeMatch) {
        let hours = parseInt(timeMatch[1], 10);
        let minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
        let modifier = (timeMatch[3] || '').toUpperCase();

        if (modifier === 'PM' && hours < 12) {
            hours += 12;
        } else if (modifier === 'AM' && hours === 12) {
            hours = 0;
        }

        if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
            parsedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} UTC`;
        }
    }

    // 3. Satellite ID detection
    let satId = "SomaiyaSat-1";
    if (/somaiyast-2|somaiyatsat-2|somaiyasat 2|somaiyasat-2/i.test(cleaned)) {
        satId = "SomaiyaSat-2";
    } else if (/somaiyast-3|somaiyatsat-3|somaiyasat 3|somaiyasat-3/i.test(cleaned)) {
        satId = "SomaiyaSat-3";
    } else if (/indiansat|indiansat80/i.test(cleaned)) {
        satId = "IndianSat80";
    }

    // Date detection
    let passDate = new Date().toISOString().split('T')[0];
    if (/tomorrow/i.test(cleaned)) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        passDate = tomorrow.toISOString().split('T')[0];
    }

    const isLatValid = lat !== null && !isNaN(lat) && lat >= -90 && lat <= 90;
    const isLonValid = lon !== null && !isNaN(lon) && lon >= -180 && lon <= 180;
    const isTimeValid = parsedTime !== null;

    if (!isLatValid || !isLonValid || !isTimeValid) {
        return {
            isValid: false,
            reason: "Unable to interpret location/time. Please use a format such as: 19.0760 N, 72.8777 E tomorrow at 4pm"
        };
    }

    const formattedLat = `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? 'N' : 'S'}`;
    const formattedLon = `${Math.abs(lon).toFixed(4)}° ${lon >= 0 ? 'E' : 'W'}`;

    return {
        isValid: true,
        lat: lat,
        lon: lon,
        formattedLat,
        formattedLon,
        time: parsedTime,
        date: passDate,
        satelliteId: satId
    };
};

const PassSchedulingConsole = ({
    role,
    scheduledPasses = [],
    setScheduledPasses,
    selectedPass,
    setSelectedPass,
    satelliteList = ["SomaiyaSat-1", "SomaiyaSat-2", "SomaiyaSat-3", "IndianSat80"]
}) => {
    const [useStructured, setUseStructured] = useState(false);
    const [nlpInput, setNlpInput] = useState("19.0760 N, 72.8777 E tomorrow at 4pm");
    const [successMessage, setSuccessMessage] = useState(null);

    // Structured form state
    const [structuredData, setStructuredData] = useState({
        latitude: '19.0760',
        longitude: '72.8777',
        date: new Date().toISOString().split('T')[0],
        time: '16:00',
        satelliteId: 'SomaiyaSat-1'
    });

    const [structuredErrors, setStructuredErrors] = useState({});

    // Live parsed NLP output
    const parsedNlp = useMemo(() => {
        return parseNaturalLanguage(nlpInput);
    }, [nlpInput]);

    // Structured validation
    const validateStructured = () => {
        const errors = {};
        if (!validateLatitude(structuredData.latitude)) {
            errors.latitude = "Latitude must be between -90 and 90";
        }
        if (!validateLongitude(structuredData.longitude)) {
            errors.longitude = "Longitude must be between -180 and 180";
        }
        if (!validateDate(structuredData.date)) {
            errors.date = "Date is required";
        }
        if (!validateTime(structuredData.time)) {
            errors.time = "Time is required";
        }
        if (!validateSatellite(structuredData.satelliteId)) {
            errors.satelliteId = "Satellite is required";
        }
        setStructuredErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleStructuredChange = (e) => {
        const { name, value } = e.target;
        setStructuredData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Fetch passes from Express backend on component mount
    useEffect(() => {
        getPasses()
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    const formattedPasses = data.map(p => ({
                        ...p,
                        location: p.location || `${Math.abs(p.latitude).toFixed(4)}° ${p.latitude >= 0 ? 'N' : 'S'}, ${Math.abs(p.longitude).toFixed(4)}° ${p.longitude >= 0 ? 'E' : 'W'}`,
                        time: p.time || p.scheduledTime
                    }));
                    setScheduledPasses(formattedPasses);
                    if (!selectedPass && formattedPasses.length > 0) {
                        setSelectedPass(formattedPasses[0]);
                    }
                }
            })
            .catch(err => {
                console.warn("Failed to load passes from Express API:", err);
            });
    }, []);

    const handleSchedulePass = async (e) => {
        if (e) e.preventDefault();

        if (role !== "Admin") {
            alert("Administrator privileges are required to schedule passes.");
            return;
        }

        let newPassPayload = null;

        if (useStructured) {
            if (!validateStructured()) {
                return;
            }
            const latNum = parseFloat(structuredData.latitude);
            const lonNum = parseFloat(structuredData.longitude);
            const formattedLat = `${Math.abs(latNum).toFixed(4)}° ${latNum >= 0 ? 'N' : 'S'}`;
            const formattedLon = `${Math.abs(lonNum).toFixed(4)}° ${lonNum >= 0 ? 'E' : 'W'}`;
            const formattedTime = `${structuredData.time} UTC`;

            newPassPayload = {
                id: `PASS-${Date.now().toString().slice(-4)}`,
                satellite: structuredData.satelliteId,
                location: `${formattedLat}, ${formattedLon}`,
                latitude: latNum,
                longitude: lonNum,
                scheduledTime: formattedTime,
                time: formattedTime,
                date: structuredData.date,
                status: 'Scheduled',
                createdAt: new Date().toISOString()
            };
        } else {
            if (!parsedNlp.isValid) {
                return;
            }
            newPassPayload = {
                id: `PASS-${Date.now().toString().slice(-4)}`,
                satellite: parsedNlp.satelliteId,
                location: `${parsedNlp.formattedLat}, ${parsedNlp.formattedLon}`,
                latitude: parsedNlp.lat,
                longitude: parsedNlp.lon,
                scheduledTime: parsedNlp.time,
                time: parsedNlp.time,
                date: parsedNlp.date,
                status: 'Scheduled',
                createdAt: new Date().toISOString()
            };
        }

        try {
            const apiRes = await createPass(newPassPayload);
            const createdPass = apiRes.data || newPassPayload;
            const finalPass = {
                ...createdPass,
                location: createdPass.location || `${Math.abs(createdPass.latitude).toFixed(4)}° ${createdPass.latitude >= 0 ? 'N' : 'S'}, ${Math.abs(createdPass.longitude).toFixed(4)}° ${createdPass.longitude >= 0 ? 'E' : 'W'}`,
                time: createdPass.time || createdPass.scheduledTime
            };

            setScheduledPasses(prev => [finalPass, ...prev]);
            setSelectedPass(finalPass);
            setSuccessMessage({
                title: "PASS SCHEDULED VIA EXPRESS API",
                satellite: finalPass.satellite,
                location: finalPass.location,
                time: finalPass.time,
                status: finalPass.status
            });

            setTimeout(() => {
                setSuccessMessage(null);
            }, 6000);
        } catch (err) {
            console.error("Failed to schedule pass via Express API:", err);
            alert(`Error scheduling pass: ${err.response?.data?.error || err.message}`);
        }
    };

    const handleCancelPass = async (passId) => {
        if (role !== "Admin") {
            alert("Administrator privileges are required to cancel passes.");
            return;
        }

        try {
            await deletePass(passId);
            setScheduledPasses(prev => prev.filter(p => p.id !== passId));
            if (selectedPass && selectedPass.id === passId) {
                setSelectedPass(null);
            }
        } catch (err) {
            console.error("Failed to delete pass via Express API:", err);
            // Still update state locally if API returns error/not found
            setScheduledPasses(prev => prev.filter(p => p.id !== passId));
            if (selectedPass && selectedPass.id === passId) {
                setSelectedPass(null);
            }
        }
    };

    const isNLPValid = parsedNlp.isValid;

    return (
        <section className="sci-section pass-scheduling-page">
            <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                    <h3 style={{ margin: 0, color: '#0df' }}>PASS SCHEDULING CONSOLE</h3>
                    <p style={{ margin: '5px 0 0 0', color: '#8892b0', fontSize: '0.9em' }}>
                        Configure ground station acquisition windows, orbital passes, and telemetry downlink schedules.
                    </p>
                </div>
                {role !== 'Admin' && (
                    <div style={{ background: 'rgba(255, 184, 108, 0.1)', border: '1px solid #ffb86c', padding: '8px 12px', borderRadius: '4px', color: '#ffb86c', fontSize: '0.85em' }}>
                        Student Mode: View-Only (Admin required to schedule/cancel passes)
                    </div>
                )}
            </div>

            {/* SUCCESS BANNER */}
            {successMessage && (
                <div style={{
                    background: '#0a231c',
                    border: '1px solid #10b981',
                    borderLeft: '5px solid #10b981',
                    padding: '15px 20px',
                    marginBottom: '20px',
                    borderRadius: '4px',
                    color: '#e2e8f0'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ color: '#10b981', letterSpacing: '1px', fontFamily: 'var(--font-mono)' }}>
                            ✓ {successMessage.title}
                        </strong>
                        <button 
                            onClick={() => setSuccessMessage(null)}
                            style={{ background: 'transparent', border: 'none', color: '#8892b0', cursor: 'pointer', fontSize: '1.1em' }}
                        >×</button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px', marginTop: '10px', fontSize: '0.9em' }}>
                        <div><span style={{ color: '#8892b0' }}>Satellite:</span> <strong>{successMessage.satellite}</strong></div>
                        <div><span style={{ color: '#8892b0' }}>Location:</span> <strong>{successMessage.location}</strong></div>
                        <div><span style={{ color: '#8892b0' }}>Time:</span> <strong>{successMessage.time}</strong></div>
                        <div><span style={{ color: '#8892b0' }}>Status:</span> <span style={{ color: '#10b981' }}>● {successMessage.status}</span></div>
                    </div>
                </div>
            )}

            {/* PASS INPUT WORKSPACE */}
            <div style={{
                background: '#0a1426',
                border: '1px solid #1a2b4c',
                padding: '25px',
                marginBottom: '30px',
                borderRadius: '4px'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid #1a2b4c', paddingBottom: '10px' }}>
                    <h4 style={{ margin: 0, color: '#0df', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        PASS SCHEDULE & TARGET COORDINATES
                    </h4>
                    <button
                        type="button"
                        onClick={() => setUseStructured(!useStructured)}
                        style={{
                            background: 'transparent',
                            border: '1px solid #0df',
                            color: '#0df',
                            padding: '6px 14px',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            borderRadius: '2px',
                            transition: 'all 0.2s'
                        }}
                    >
                        {useStructured ? "Use Natural Language Input" : "Use Structured Input Instead"}
                    </button>
                </div>

                {!useStructured ? (
                    /* FORGIVING NATURAL LANGUAGE INPUT MODE */
                    <div>
                        <div className="form-group" style={{ marginBottom: '15px' }}>
                            <label style={{ fontFamily: 'var(--font-mono)', color: '#8892b0', fontSize: '0.8rem' }}>
                                Natural-Language Pass Command
                            </label>
                            <input
                                type="text"
                                value={nlpInput}
                                onChange={(e) => setNlpInput(e.target.value)}
                                placeholder='e.g. "19.0760 N, 72.8777 E tomorrow at 4pm" or "19.076, 72.877 14:00UTC"'
                                style={{
                                    background: '#08111f',
                                    border: '1px solid #1a2b4c',
                                    color: '#fff',
                                    padding: '12px 15px',
                                    fontSize: '1rem',
                                    fontFamily: 'var(--font-mono)',
                                    width: '100%',
                                    outline: 'none'
                                }}
                            />
                            <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                                Forgiving parser detects Latitude, Longitude, UTC/Local Time, Date, and Target Satellite.
                            </span>
                        </div>

                        {/* PARSED OUTPUT PREVIEW */}
                        <div style={{
                            background: '#08111f',
                            border: `1px solid ${parsedNlp.isValid ? '#1a2b4c' : '#ef4444'}`,
                            padding: '18px',
                            borderRadius: '4px',
                            marginBottom: '20px'
                        }}>
                            <div style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.85rem',
                                color: parsedNlp.isValid ? '#0df' : '#ef4444',
                                marginBottom: '12px',
                                letterSpacing: '1px'
                            }}>
                                PARSED OUTPUT PREVIEW
                            </div>

                            {parsedNlp.isValid ? (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                                    <div>
                                        <div style={{ color: '#8892b0', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>Interpreted Latitude:</div>
                                        <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#fff' }}>{parsedNlp.formattedLat}</div>
                                    </div>
                                    <div>
                                        <div style={{ color: '#8892b0', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>Interpreted Longitude:</div>
                                        <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#fff' }}>{parsedNlp.formattedLon}</div>
                                    </div>
                                    <div>
                                        <div style={{ color: '#8892b0', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>Interpreted UTC Time:</div>
                                        <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#0df' }}>{parsedNlp.time}</div>
                                    </div>
                                    <div>
                                        <div style={{ color: '#8892b0', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>Interpreted Target Satellite ID:</div>
                                        <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#50fa7b' }}>{parsedNlp.satelliteId}</div>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ color: '#ffb86c', fontSize: '0.9rem', lineHeight: '1.6' }}>
                                    <p style={{ color: '#ef4444', margin: '0 0 5px 0', fontWeight: 'bold' }}>Unable to interpret location/time.</p>
                                    <p style={{ margin: 0 }}>Please use a format such as: <code style={{ color: '#0df' }}>19.0760 N, 72.8777 E tomorrow at 4pm</code> or <code style={{ color: '#0df' }}>19.076, 72.877 14:00UTC</code></p>
                                </div>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={handleSchedulePass}
                            disabled={!isNLPValid || role !== 'Admin'}
                            className="btn-primary"
                            style={{
                                width: 'auto',
                                minWidth: '200px',
                                padding: '12px 24px',
                                cursor: (!isNLPValid || role !== 'Admin') ? 'not-allowed' : 'pointer'
                            }}
                        >
                            SCHEDULE PASS
                        </button>
                    </div>
                ) : (
                    /* STRUCTURED FORM INPUT MODE */
                    <form onSubmit={handleSchedulePass} className="mission-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Latitude (-90 to 90)</label>
                                <input
                                    type="text"
                                    name="latitude"
                                    value={structuredData.latitude}
                                    onChange={handleStructuredChange}
                                    placeholder="e.g. 19.0760"
                                />
                                {structuredErrors.latitude && <span className="error-msg">{structuredErrors.latitude}</span>}
                            </div>
                            <div className="form-group">
                                <label>Longitude (-180 to 180)</label>
                                <input
                                    type="text"
                                    name="longitude"
                                    value={structuredData.longitude}
                                    onChange={handleStructuredChange}
                                    placeholder="e.g. 72.8777"
                                />
                                {structuredErrors.longitude && <span className="error-msg">{structuredErrors.longitude}</span>}
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Date</label>
                                <input
                                    type="date"
                                    name="date"
                                    value={structuredData.date}
                                    onChange={handleStructuredChange}
                                />
                                {structuredErrors.date && <span className="error-msg">{structuredErrors.date}</span>}
                            </div>
                            <div className="form-group">
                                <label>Time (UTC)</label>
                                <input
                                    type="time"
                                    name="time"
                                    value={structuredData.time}
                                    onChange={handleStructuredChange}
                                />
                                {structuredErrors.time && <span className="error-msg">{structuredErrors.time}</span>}
                            </div>
                            <div className="form-group">
                                <label>Target Satellite</label>
                                <select
                                    name="satelliteId"
                                    value={structuredData.satelliteId}
                                    onChange={handleStructuredChange}
                                >
                                    {satelliteList.map(sat => (
                                        <option key={sat} value={sat}>{sat}</option>
                                    ))}
                                </select>
                                {structuredErrors.satelliteId && <span className="error-msg">{structuredErrors.satelliteId}</span>}
                            </div>
                        </div>

                        <div className="form-actions" style={{ flexDirection: 'row', gap: '15px', marginTop: '15px' }}>
                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={role !== 'Admin'}
                                style={{ width: 'auto', minWidth: '200px', padding: '12px 24px' }}
                            >
                                SCHEDULE PASS
                            </button>
                        </div>
                    </form>
                )}
            </div>

            {/* SCHEDULED PASSES SECTION */}
            <div style={{
                background: '#0a1426',
                border: '1px solid #1a2b4c',
                padding: '25px',
                borderRadius: '4px'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid #1a2b4c', paddingBottom: '10px' }}>
                    <h4 style={{ margin: 0, color: '#0df', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        SCHEDULED PASSES ({scheduledPasses.length})
                    </h4>
                    <span style={{ fontSize: '0.8rem', color: '#8892b0', fontFamily: 'var(--font-mono)' }}>
                        Active Operational Queue
                    </span>
                </div>

                {scheduledPasses.length === 0 ? (
                    <div style={{ color: '#8892b0', padding: '20px', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                        No passes currently scheduled. Use the form above to register an acquisition window.
                    </div>
                ) : (
                    <div className="spec-table" style={{ marginTop: 0 }}>
                        <div className="table-row" style={{ borderBottom: '2px solid #1a2b4c', background: '#08111f' }}>
                            <span className="col-title" style={{ flex: 1.5 }}>Satellite</span>
                            <span className="col-title" style={{ flex: 2 }}>Target Location</span>
                            <span className="col-title" style={{ flex: 1.5 }}>Scheduled Time</span>
                            <span className="col-title" style={{ flex: 1 }}>Status</span>
                            <span className="col-title" style={{ flex: 1.5, textAlign: 'right' }}>Actions</span>
                        </div>

                        {scheduledPasses.map((pass) => {
                            const isSelected = selectedPass && selectedPass.id === pass.id;
                            return (
                                <div
                                    key={pass.id}
                                    className="table-row"
                                    style={{
                                        alignItems: 'center',
                                        background: isSelected ? 'rgba(0, 207, 255, 0.08)' : 'transparent',
                                        borderLeft: isSelected ? '3px solid #0df' : '3px solid transparent'
                                    }}
                                >
                                    <span style={{ flex: 1.5, fontWeight: 'bold', color: '#fff' }}>
                                        {pass.satellite}
                                    </span>
                                    <span style={{ flex: 2, color: '#8892b0', fontFamily: 'var(--font-mono)', fontSize: '0.9em' }}>
                                        {pass.location}
                                    </span>
                                    <span style={{ flex: 1.5, color: '#0df', fontFamily: 'var(--font-mono)' }}>
                                        {pass.time}
                                    </span>
                                    <span style={{ flex: 1, color: pass.status === 'Scheduled' ? '#10b981' : '#ffb86c' }}>
                                        ● {pass.status}
                                    </span>
                                    <span style={{ flex: 1.5, display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedPass(pass)}
                                            style={{
                                                background: isSelected ? '#0df' : '#1a2b4c',
                                                color: isSelected ? '#08111f' : '#0df',
                                                border: '1px solid #0df',
                                                padding: '4px 10px',
                                                fontSize: '0.8rem',
                                                fontFamily: 'var(--font-mono)',
                                                cursor: 'pointer',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            {isSelected ? 'Active' : 'Select'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleCancelPass(pass.id)}
                                            disabled={role !== 'Admin'}
                                            style={{
                                                background: 'transparent',
                                                color: role === 'Admin' ? '#ef4444' : '#475569',
                                                border: `1px solid ${role === 'Admin' ? '#ef4444' : '#334'}`,
                                                padding: '4px 10px',
                                                fontSize: '0.8rem',
                                                fontFamily: 'var(--font-mono)',
                                                cursor: role === 'Admin' ? 'pointer' : 'not-allowed'
                                            }}
                                        >
                                            Cancel
                                        </button>
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
};

export default PassSchedulingConsole;
