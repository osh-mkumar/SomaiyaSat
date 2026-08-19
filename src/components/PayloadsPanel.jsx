import React, { useState, useEffect, useMemo } from 'react';
import { fetchLocalPayloads } from '../services/satelliteApi';

const SYSTEM_PRIORITY = ['TT&C', 'Housekeeping'];

const PayloadsPanel = ({ role }) => {
    const [payloads, setPayloads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [activePayloadView, setActivePayloadView] = useState('QUEUED');
    
    // For drag and drop
    const [draggedItemId, setDraggedItemId] = useState(null);

    useEffect(() => {
        fetchLocalPayloads()
            .then(data => {
                // Initial sort to ensure criticals are at top if they are queued
                const sorted = data.sort((a, b) => {
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
        // Small delay for better UX
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
        if (isTargetLocked) {
            // Cannot drop onto or above a locked system priority payload
            return;
        }

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
                        >
                            <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                                {canDrag && <span className="drag-handle">≡</span>}
                                {!canDrag && <span className="drag-handle" style={{ cursor: 'not-allowed', color: isLocked ? '#ff5555' : '#334' }}>{isLocked ? '🔒' : '≡'}</span>}
                                <div>
                                    <div style={{ fontWeight: 'bold', color: isLocked ? '#ff5555' : '#fff' }}>{index + 1}. {payload.name}</div>
                                    <div style={{ fontSize: '0.85em', color: '#8892b0' }}>{payload.type}</div>
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.8em', color: '#8892b0' }}>Priority</div>
                                    <div style={{ color: payload.priority === 'Critical' ? '#ff5555' : payload.priority === 'High' ? '#ffb86c' : '#50fa7b' }}>{payload.priority}</div>
                                </div>
                                <div style={{ textAlign: 'right', minWidth: '60px' }}>
                                    <div style={{ fontSize: '0.8em', color: '#8892b0' }}>Size</div>
                                    <div>{payload.size}</div>
                                </div>
                                <div style={{ textAlign: 'right', minWidth: '80px' }}>
                                    <div style={{ fontSize: '0.8em', color: '#8892b0' }}>Status</div>
                                    <div style={{ color: payload.status === 'Transmitting' ? '#50fa7b' : '#0df' }}>{payload.status}</div>
                                </div>
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
                    <h3>03. RF Payload Manager</h3>
                    <p style={{ maxWidth: '700px' }}>
                        The communication subsystem dynamically allocates bandwidth between
                        multiple amateur radio payloads based on mission requirements and
                        available power.
                    </p>
                </div>
                {role !== 'Admin' && (
                    <div style={{ background: 'rgba(255, 184, 108, 0.1)', border: '1px solid #ffb86c', padding: '10px 15px', borderRadius: '4px', color: '#ffb86c', fontSize: '0.85em' }}>
                        Read-only: Admin access required to reorder queue.
                    </div>
                )}
            </div>

            <div className="virtual-tabs" style={{ marginTop: '20px' }}>
                <button className={`virtual-tab-btn ${activePayloadView === 'QUEUED' ? 'active' : ''}`} onClick={() => setActivePayloadView('QUEUED')}>QUEUED</button>
                <button className={`virtual-tab-btn ${activePayloadView === 'TRANSMITTING' ? 'active' : ''}`} onClick={() => setActivePayloadView('TRANSMITTING')}>TRANSMITTING</button>
                <button className={`virtual-tab-btn ${activePayloadView === 'COMPLETED' ? 'active' : ''}`} onClick={() => setActivePayloadView('COMPLETED')}>COMPLETED</button>
                <button className={`virtual-tab-btn ${activePayloadView === 'FAILED' ? 'active' : ''}`} onClick={() => setActivePayloadView('FAILED')}>FAILED</button>
            </div>

            {loading && <div style={{ color: '#0df' }}>Loading payload data...</div>}
            {error && <div style={{ color: '#ff5555' }}>Unable to load payload data: {error}</div>}
            
            {!loading && !error && renderQueue()}

        </section>
    );
};

export default PayloadsPanel;
