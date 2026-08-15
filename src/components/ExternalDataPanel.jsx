import React, { useState, useEffect } from 'react';
import { fetchExternalISS, fetchISSPositions } from '../services/satelliteApi';

const ExternalDataPanel = () => {
    // State for Fetch demonstration (Current ISS Position)
    const [issData, setIssData] = useState(null);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);

    // State for Axios demonstration (Future Positions)
    const [positionsData, setPositionsData] = useState(null);
    const [axiosLoading, setAxiosLoading] = useState(true);
    const [axiosError, setAxiosError] = useState(null);

    useEffect(() => {
        // DEMONSTRATE: Promise chaining with fetch()
        setFetchLoading(true);
        fetchExternalISS()
            .then(data => {
                setIssData(data);
            })
            .catch(error => {
                console.error("Fetch API Error:", error);
                setFetchError(error.message);
            })
            .finally(() => {
                setFetchLoading(false);
            });

        // DEMONSTRATE: async/await with Axios
        const loadPositions = async () => {
            try {
                setAxiosLoading(true);
                const data = await fetchISSPositions();
                setPositionsData(data);
            } catch (error) {
                console.error("Axios API Error:", error);
                setAxiosError(error.message);
            } finally {
                setAxiosLoading(false);
            }
        };

        loadPositions();

        // Refresh ISS current position every 10 seconds to not spam API
        const interval = setInterval(() => {
            fetchExternalISS()
                .then(data => setIssData(data))
                .catch(err => console.error("Refresh Error:", err));
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    return (
        <section className="sci-section">
            <h3>EXTERNAL SPACE DATA</h3>
            <p>
                This module demonstrates retrieving relevant space mission data from external endpoints 
                using both the native <code>fetch</code> API (with Promise chaining) and the <code>axios</code> library (with async/await).
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
                {/* FETCH SECTION - ISS Position */}
                <div style={{ background: '#111827', padding: '20px', border: '1px solid #334', borderRadius: '4px' }}>
                    <h4 style={{ color: '#0df', marginTop: 0 }}>External ISS Data (via fetch)</h4>
                    
                    {fetchLoading && <div style={{ color: '#8892b0' }}>Loading ISS position...</div>}
                    
                    {fetchError && (
                        <div style={{ color: '#ff5555' }}>
                            <p>Unable to load ISS data.</p>
                            <p style={{ fontSize: '0.8em' }}>Error: {fetchError}</p>
                            <button onClick={() => window.location.reload()} style={{ background: '#334', color: '#fff', border: 'none', padding: '5px 10px', marginTop: '10px', cursor: 'pointer' }}>Try Again</button>
                        </div>
                    )}
                    
                    {!fetchLoading && !fetchError && issData && (
                        <div>
                            <div style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #334', display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px' }}>
                                <strong style={{ color: '#8892b0' }}>Latitude:</strong> <span style={{ fontFamily: 'monospace' }}>{issData.latitude.toFixed(4)}°</span>
                                <strong style={{ color: '#8892b0' }}>Longitude:</strong> <span style={{ fontFamily: 'monospace' }}>{issData.longitude.toFixed(4)}°</span>
                                <strong style={{ color: '#8892b0' }}>Altitude:</strong> <span style={{ fontFamily: 'monospace' }}>{issData.altitude.toFixed(2)} km</span>
                                <strong style={{ color: '#8892b0' }}>Velocity:</strong> <span style={{ fontFamily: 'monospace' }}>{issData.velocity.toFixed(2)} km/h</span>
                                <strong style={{ color: '#8892b0' }}>Visibility:</strong> <span>{issData.visibility}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* AXIOS SECTION - Positions */}
                <div style={{ background: '#111827', padding: '20px', border: '1px solid #334', borderRadius: '4px' }}>
                    <h4 style={{ color: '#0df', marginTop: 0 }}>EXTERNAL ORBIT DATA (via Axios)</h4>
                    
                    {axiosLoading && <div style={{ color: '#8892b0' }}>Loading predicted positions...</div>}
                    
                    {axiosError && (
                        <div style={{ color: '#ff5555' }}>
                            <p>Unable to load predicted positions.</p>
                            <p style={{ fontSize: '0.8em' }}>Error: {axiosError}</p>
                            <button onClick={() => window.location.reload()} style={{ background: '#334', color: '#fff', border: 'none', padding: '5px 10px', marginTop: '10px', cursor: 'pointer' }}>Try Again</button>
                        </div>
                    )}

                    {!axiosLoading && !axiosError && (!positionsData || positionsData.length === 0) && (
                        <div>No prediction data found.</div>
                    )}

                    {!axiosLoading && !axiosError && positionsData && positionsData.map((pos, index) => (
                        <div key={pos.timestamp} style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #334' }}>
                            <div style={{ fontWeight: 'bold', marginBottom: '5px', color: '#ffb86c' }}>
                                Prediction {index + 1} (T+{index * 60}s)
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '4px', fontSize: '0.9em' }}>
                                <strong style={{ color: '#8892b0' }}>Latitude:</strong> <span style={{ fontFamily: 'monospace' }}>{pos.latitude.toFixed(4)}°</span>
                                <strong style={{ color: '#8892b0' }}>Longitude:</strong> <span style={{ fontFamily: 'monospace' }}>{pos.longitude.toFixed(4)}°</span>
                                <strong style={{ color: '#8892b0' }}>Altitude:</strong> <span style={{ fontFamily: 'monospace' }}>{pos.altitude.toFixed(2)} km</span>
                                <strong style={{ color: '#8892b0' }}>Velocity:</strong> <span style={{ fontFamily: 'monospace' }}>{pos.velocity.toFixed(2)} km/h</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ExternalDataPanel;
