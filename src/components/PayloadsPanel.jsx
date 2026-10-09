import React, { useState, useEffect, useMemo } from 'react';
import { fetchLocalPayloads, createPayload, deletePayload } from '../services/satelliteApi';

const SYSTEM_PRIORITY = ['TT&C', 'Housekeeping'];

const PayloadsPanel = ({ role, payloads: propsPayloads, setPayloads: propsSetPayloads }) => {
    const [internalPayloads, setInternalPayloads] = useState([]);
    const [loading, setLoading] = useState(!propsPayloads || propsPayloads.length === 0);
    const [error, setError] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);

    // Form state for creating new payload
    const [newPayload, setNewPayload] = useState({
        name: '',
        type: 'M17',
        priority: 'Normal',
        size: '25 KB',
        status: 'Queued'
    });
    const [formError, setFormError] = useState(null);

    const payloads = propsPayloads && propsPayloads.length > 0 ? propsPayloads : internalPayloads;
    const setPayloads = propsSetPayloads || setInternalPayloads;

    const [activePayloadView, setActivePayloadView] = useState('QUEUED');
    const [draggedItemId, setDraggedItemId] = useState(null);

    const loadPayloads = () => {
        setLoading(true);
        fetchLocalPayloads()
            .then(data => {
                const sorted = (Array.isArray(data) ? data : []).sort((a, b) => {
                    if (a.status === 'Queued' && b.status === 'Queued') {
                        const aLocked = SYSTEM_PRIORITY.includes(a.type) || SYSTEM_PRIORITY.includes(a.name);
                        const bLocked = SYSTEM_PRIORITY.includes(b.type) || SYSTEM_PRIORITY.includes(b.name);
                        if (aLocked && !bLocked) return -1;
                        if (!aLocked && bLocked) return 1;
                    }
                    return 0;
                });
                setPayloads(sorted);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load payload data:", err);
                setError(err.message);
                setLoading(false);
            });
    };

    useEffect(() => {
        if (!propsPayloads || propsPayloads.length === 0) {
            loadPayloads();
        } else {
            setLoading(false);
        }
    }, []);

    const filteredPayloads = useMemo(() => {
        return payloads.filter(payload => {
            if (activePayloadView === 'QUEUED') return payload.status === 'Queued' || payload.status === 'Suspended';
            if (activePayloadView === 'TRANSMITTING') return payload.status === 'Transmitting';
            if (activePayloadView === 'COMPLETED') return payload.status === 'Completed';
            if (activePayloadView === 'FAILED') return payload.status === 'Failed';
            return true;
        });
    }, [payloads, activePayloadView]);

    const handleCreatePayload = async (e) => {
        e.preventDefault();
        if (role !== 'Admin') {
            alert('Admin privileges required.');
            return;
        }
        if (!newPayload.name.trim()) {
            setFormError('Payload name is required');
            return;
        }

        try {
            const apiRes = await createPayload({
                id: `PAY-${Date.now().toString().slice(-4)}`,
                ...newPayload
            });
            const created = apiRes.data || apiRes;
            setPayloads(prev => [...prev, created]);
            setNewPayload({ name: '', type: 'M17', priority: 'Normal', size: '25 KB', status: 'Queued' });
            setShowAddForm(false);
            setFormError(null);
        } catch (err) {
            console.error('Failed to create payload via API:', err);
            setFormError(err.response?.data?.error || err.message);
        }
    };

    const handleDeletePayload = async (id) => {
        if (role !== 'Admin') {
            alert('Admin privileges required.');
            return;
        }
        try {
            await deletePayload(id);
            setPayloads(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            console.error('Failed to delete payload via API:', err);
            // Fallback UI update
            setPayloads(prev => prev.filter(p => p.id !== id));
        }
    };

    const handleDragStart = (e, id) => {
        if (role !== 'Admin') {
            e.preventDefault();
            return;
        }
        const payload = payloads.find(p => p.id === id);
        const isLocked = SYSTEM_PRIORITY.includes(payload.type) || SYSTEM_PRIORITY.includes(payload.name);
        if (isLocked) {
            e.preventDefault();
            return;
        }
        setDraggedItemId(id);
        e.dataTransfer.effectAllowed = 'move';
        setTimeout(() => e.target.classList.add('dragging'), 0);
    };

    const handleDragEnd = (e) => {
        e.target.classList.remove('dragging');
        setDraggedItemId(null);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e, targetId) => {
        e.preventDefault();
        if (role !== 'Admin' || !draggedItemId || draggedItemId === targetId) return;

        const targetPayload = payloads.find(p => p.id === targetId);
        const isTargetLocked = SYSTEM_PRIORITY.includes(targetPayload.type) || SYSTEM_PRIORITY.includes(targetPayload.name);
        if (isTargetLocked) return;

        const draggedIdx = payloads.findIndex(p => p.id === draggedItemId);
        const targetIdx = payloads.findIndex(p => p.id === targetId);
        
        const newPayloads = [...payloads];
        const [draggedItem] = newPayloads.splice(draggedIdx, 1);
        newPayloads.splice(targetIdx, 0, draggedItem);
        
        setPayloads(newPayloads);
    };

    const renderQueue = () => {
        if (filteredPayloads.length === 0) {
            return <div style={{ color: '#ffb86c', marginTop: '20px' }}>No payloads in {activePayloadView}.</div>;
        }

        return (
            <div className="payload-queue-list" style={{ marginTop: '20px' }}>
                {filteredPayloads.map((payload, index) => {
                    const isLocked = SYSTEM_PRIORITY.includes(payload.type) || SYSTEM_PRIORITY.includes(payload.name);
                    const canDrag = role === 'Admin' && !isLocked;

                    return (
                        <div 
                            key={payload.id}
                            className={`draggable-item ${isLocked ? 'locked-item' : ''}`}
                            draggable={canDrag}
                            onDragStart={(e) => handleDragStart(e, payload.id)}
                            onDragEnd={handleDragEnd}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, payload.id)}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#0a1426', marginBottom: '8px', border: '1px solid #1a2b4c', borderRadius: '4px' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                                {canDrag && <span className="drag-handle" style={{ cursor: 'grab', marginRight: '12px' }}>≡</span>}
                                {!canDrag && <span className="drag-handle" style={{ cursor: 'not-allowed', color: isLocked ? '#ff5555' : '#334', marginRight: '12px' }}>{isLocked ? '🔒' : '≡'}</span>}
                                <div>
                                    <div style={{ fontWeight: 'bold', color: isLocked ? '#ff5555' : '#fff' }}>{index + 1}. {payload.name}</div>
                                    <div style={{ fontSize: '0.85em', color: '#8892b0' }}>{payload.type} ({payload.id})</div>
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.8em', color: '#8892b0' }}>Priority</div>
                                    <div style={{ color: payload.priority === 'Critical' ? '#ff5555' : payload.priority === 'High' ? '#ffb86c' : '#50fa7b' }}>{payload.priority}</div>
                                </div>
                                <div style={{ textAlign: 'right', minWidth: '60px' }}>
                                    <div style={{ fontSize: '0.8em', color: '#8892b0' }}>Size</div>
                                    <div>{typeof payload.size === 'number' ? `${payload.size} KB` : payload.size}</div>
                                </div>
                                <div style={{ textAlign: 'right', minWidth: '80px' }}>
                                    <div style={{ fontSize: '0.8em', color: '#8892b0' }}>Status</div>
                                    <div style={{ color: payload.status === 'Transmitting' ? '#50fa7b' : '#0df' }}>{payload.status}</div>
                                </div>
                                {role === 'Admin' && !isLocked && (
                                    <button
                                        type="button"
                                        onClick={() => handleDeletePayload(payload.id)}
                                        style={{
                                            background: 'transparent',
                                            border: '1px solid #ef4444',
                                            color: '#ef4444',
                                            padding: '4px 8px',
                                            fontSize: '0.75rem',
                                            cursor: 'pointer',
                                            borderRadius: '2px',
                                            marginLeft: '10px'
                                        }}
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <section className="sci-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h3 style={{ margin: 0, color: '#0df' }}>03. RF Payload Manager</h3>
                    <p style={{ maxWidth: '700px', color: '#8892b0', fontSize: '0.9rem' }}>
                        The communication subsystem dynamically allocates bandwidth between
                        multiple amateur radio payloads based on mission requirements and available power.
                    </p>
                </div>
                {role === 'Admin' ? (
                    <button
                        type="button"
                        onClick={() => setShowAddForm(!showAddForm)}
                        style={{
                            background: '#0df',
                            color: '#08111f',
                            border: 'none',
                            padding: '8px 16px',
                            fontWeight: 'bold',
                            fontFamily: 'var(--font-mono)',
                            cursor: 'pointer',
                            borderRadius: '2px'
                        }}
                    >
                        {showAddForm ? 'CANCEL' : '+ REGISTER PAYLOAD'}
                    </button>
                ) : (
                    <div style={{ background: 'rgba(255, 184, 108, 0.1)', border: '1px solid #ffb86c', padding: '8px 12px', borderRadius: '4px', color: '#ffb86c', fontSize: '0.85em' }}>
                        Read-only: Admin access required to edit payloads.
                    </div>
                )}
            </div>

            {/* ADD PAYLOAD FORM */}
            {showAddForm && (
                <form onSubmit={handleCreatePayload} style={{ background: '#0a1426', border: '1px solid #0df', padding: '20px', borderRadius: '4px', marginTop: '20px' }}>
                    <h4 style={{ margin: '0 0 15px 0', color: '#0df', fontFamily: 'var(--font-mono)' }}>REGISTER NEW RADIO PAYLOAD</h4>
                    {formError && <div style={{ color: '#ef4444', marginBottom: '10px', fontSize: '0.85rem' }}>{formError}</div>}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px' }}>
                        <div>
                            <label style={{ fontSize: '0.8rem', color: '#8892b0' }}>Payload Name</label>
                            <input
                                type="text"
                                value={newPayload.name}
                                onChange={(e) => setNewPayload({ ...newPayload, name: e.target.value })}
                                placeholder="e.g. Atmospheric Probe"
                                style={{ width: '100%', padding: '8px', background: '#08111f', border: '1px solid #1a2b4c', color: '#fff' }}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.8rem', color: '#8892b0' }}>Payload Type</label>
                            <select
                                value={newPayload.type}
                                onChange={(e) => setNewPayload({ ...newPayload, type: e.target.value })}
                                style={{ width: '100%', padding: '8px', background: '#08111f', border: '1px solid #1a2b4c', color: '#fff' }}
                            >
                                <option value="M17">M17 Digital</option>
                                <option value="Codec2">Codec2 Voice</option>
                                <option value="SSTV">SSTV Image</option>
                                <option value="Telemetry">Telemetry</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.8rem', color: '#8892b0' }}>Priority</label>
                            <select
                                value={newPayload.priority}
                                onChange={(e) => setNewPayload({ ...newPayload, priority: e.target.value })}
                                style={{ width: '100%', padding: '8px', background: '#08111f', border: '1px solid #1a2b4c', color: '#fff' }}
                            >
                                <option value="Critical">Critical</option>
                                <option value="High">High</option>
                                <option value="Normal">Normal</option>
                                <option value="Low">Low</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.8rem', color: '#8892b0' }}>Data Size</label>
                            <input
                                type="text"
                                value={newPayload.size}
                                onChange={(e) => setNewPayload({ ...newPayload, size: e.target.value })}
                                placeholder="e.g. 50 KB"
                                style={{ width: '100%', padding: '8px', background: '#08111f', border: '1px solid #1a2b4c', color: '#fff' }}
                            />
                        </div>
                    </div>
                    <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                        <button type="submit" className="btn-primary" style={{ padding: '8px 20px' }}>SAVE TO MONGODB</button>
                        <button type="button" className="btn-secondary" onClick={() => setShowAddForm(false)} style={{ padding: '8px 20px' }}>CANCEL</button>
                    </div>
                </form>
            )}

            <div className="virtual-tabs" style={{ marginTop: '20px' }}>
                <button className={`virtual-tab-btn ${activePayloadView === 'QUEUED' ? 'active' : ''}`} onClick={() => setActivePayloadView('QUEUED')}>QUEUED</button>
                <button className={`virtual-tab-btn ${activePayloadView === 'TRANSMITTING' ? 'active' : ''}`} onClick={() => setActivePayloadView('TRANSMITTING')}>TRANSMITTING</button>
                <button className={`virtual-tab-btn ${activePayloadView === 'COMPLETED' ? 'active' : ''}`} onClick={() => setActivePayloadView('COMPLETED')}>COMPLETED</button>
                <button className={`virtual-tab-btn ${activePayloadView === 'FAILED' ? 'active' : ''}`} onClick={() => setActivePayloadView('FAILED')}>FAILED</button>
            </div>

            {loading && <div style={{ color: '#0df', marginTop: '20px' }}>Loading payload data...</div>}
            {error && <div style={{ color: '#ff5555', marginTop: '20px' }}>Unable to load payload data: {error}</div>}
            
            {!loading && !error && renderQueue()}

        </section>
    );
};

export default PayloadsPanel;
