import React, { useState, useEffect } from 'react';
import { fetchLocalPayloads } from '../services/satelliteApi';

const PayloadsPanel = ({ role }) => {
    const [payloads, setPayloads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Search and filter state
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('All');
    const [priorityFilter, setPriorityFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');

    useEffect(() => {
        fetchLocalPayloads()
            .then(data => {
                setPayloads(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load payload data:", err);
                setError(err.message);
                setLoading(false);
            });
    }, []);

    const filteredPayloads = payloads.filter(payload => {
        const matchesSearch = payload.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              payload.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'All' || payload.type === typeFilter;
        const matchesPriority = priorityFilter === 'All' || payload.priority === priorityFilter;
        const matchesStatus = statusFilter === 'All' || payload.status === statusFilter;

        return matchesSearch && matchesType && matchesPriority && matchesStatus;
    });

    return (
        <section className="sci-section">
            <h3>03. RF Payload Manager</h3>
            <p>
                The communication subsystem dynamically allocates bandwidth between
                multiple amateur radio payloads based on mission requirements and
                available power.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '20px', padding: '15px', background: '#111827', border: '1px solid #334', borderRadius: '4px' }}>
                <input
                    type="text"
                    placeholder="Search payloads..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ padding: '8px', background: '#0a0f18', color: '#fff', border: '1px solid #334' }}
                />
                <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={{ padding: '8px', background: '#0a0f18', color: '#fff', border: '1px solid #334' }}>
                    <option value="All">All Types</option>
                    <option value="TT&C">TT&C</option>
                    <option value="SSTV">SSTV</option>
                    <option value="Codec2">Codec2</option>
                    <option value="M17">M17</option>
                </select>
                <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} style={{ padding: '8px', background: '#0a0f18', color: '#fff', border: '1px solid #334' }}>
                    <option value="All">All Priorities</option>
                    <option value="Critical">Critical</option>
                    <option value="Normal">Normal</option>
                    <option value="Low">Low</option>
                </select>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: '8px', background: '#0a0f18', color: '#fff', border: '1px solid #334' }}>
                    <option value="All">All Statuses</option>
                    <option value="Queued">Queued</option>
                    <option value="Transmitting">Transmitting</option>
                    <option value="Suspended">Suspended</option>
                </select>
            </div>

            {loading && <div style={{ color: '#0df' }}>Loading payload data...</div>}
            {error && <div style={{ color: '#ff5555' }}>Unable to load payload data: {error}</div>}
            
            {!loading && !error && filteredPayloads.length === 0 && (
                <div style={{ color: '#ffb86c' }}>No payloads match your criteria.</div>
            )}

            {!loading && !error && filteredPayloads.length > 0 && (
                <div className="spec-table">
                    {filteredPayloads.map(payload => (
                        <div className="table-row" key={payload.id}>
                            <span className="col-title" style={{ width: '80px' }}>{payload.type}</span>
                            <span style={{ flex: 1 }}>{payload.name} ({payload.id})</span>
                            <span style={{ width: '100px', color: payload.priority === 'Critical' ? '#ff5555' : '#8892b0' }}>{payload.priority}</span>
                            <span style={{ width: '120px', color: payload.status === 'Transmitting' ? '#50fa7b' : payload.status === 'Queued' ? '#0df' : '#ffb86c' }}>{payload.status}</span>
                            <span style={{ width: '80px', textAlign: 'right' }}>{payload.size}</span>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
};

export default PayloadsPanel;
