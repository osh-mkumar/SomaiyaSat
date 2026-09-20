import axios from 'axios';

const LOCAL_API_BASE = 'http://localhost:3000/api';

// ==========================================
// SATELLITES API
// ==========================================

export const getSatellites = async () => {
    const res = await fetch(`${LOCAL_API_BASE}/satellites`);
    if (!res.ok) throw new Error('Failed to fetch satellites');
    const json = await res.json();
    return json.data || json;
};

// Backwards compatibility alias for existing code
export const fetchLocalSatellites = async () => {
    return getSatellites();
};

export const getSatellite = async (id) => {
    const res = await fetch(`${LOCAL_API_BASE}/satellites/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch satellite ${id}`);
    const json = await res.json();
    return json.data;
};

export const createSatellite = async (satelliteData) => {
    const res = await axios.post(`${LOCAL_API_BASE}/satellites`, satelliteData);
    return res.data;
};

export const updateSatellite = async (id, satelliteData) => {
    const res = await axios.put(`${LOCAL_API_BASE}/satellites/${id}`, satelliteData);
    return res.data;
};

export const deleteSatellite = async (id) => {
    const res = await axios.delete(`${LOCAL_API_BASE}/satellites/${id}`);
    return res.data;
};

// ==========================================
// PAYLOADS API
// ==========================================

export const getPayloads = async () => {
    const res = await fetch(`${LOCAL_API_BASE}/payloads`);
    if (!res.ok) throw new Error('Failed to fetch payloads');
    const json = await res.json();
    return json.data || json;
};

// Backwards compatibility alias for existing code
export const fetchLocalPayloads = async () => {
    return getPayloads();
};

export const getPayload = async (id) => {
    const res = await fetch(`${LOCAL_API_BASE}/payloads/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch payload ${id}`);
    const json = await res.json();
    return json.data;
};

export const createPayload = async (payloadData) => {
    const res = await axios.post(`${LOCAL_API_BASE}/payloads`, payloadData);
    return res.data;
};

export const updatePayload = async (id, payloadData) => {
    const res = await axios.put(`${LOCAL_API_BASE}/payloads/${id}`, payloadData);
    return res.data;
};

export const deletePayload = async (id) => {
    const res = await axios.delete(`${LOCAL_API_BASE}/payloads/${id}`);
    return res.data;
};

// ==========================================
// PASSES API
// ==========================================

export const getPasses = async () => {
    const res = await fetch(`${LOCAL_API_BASE}/passes`);
    if (!res.ok) throw new Error('Failed to fetch passes');
    const json = await res.json();
    return json.data || json;
};

export const getPass = async (id) => {
    const res = await fetch(`${LOCAL_API_BASE}/passes/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch pass ${id}`);
    const json = await res.json();
    return json.data;
};

export const createPass = async (passData) => {
    const res = await axios.post(`${LOCAL_API_BASE}/passes`, passData);
    return res.data;
};

export const updatePass = async (id, passData) => {
    const res = await axios.put(`${LOCAL_API_BASE}/passes/${id}`, passData);
    return res.data;
};

export const deletePass = async (id) => {
    const res = await axios.delete(`${LOCAL_API_BASE}/passes/${id}`);
    return res.data;
};

// ==========================================
// CONFIGURATION API
// ==========================================

export const getConfig = async () => {
    const res = await fetch(`${LOCAL_API_BASE}/config`);
    if (!res.ok) throw new Error('Failed to fetch RF configuration');
    const json = await res.json();
    return json.data || json;
};

export const updateConfig = async (configData) => {
    const res = await axios.put(`${LOCAL_API_BASE}/config`, configData);
    return res.data;
};

// ==========================================
// EXTERNAL PUBLIC API (ISS TRACKING)
// ==========================================

export const fetchExternalISS = () => {
    // Pull real-time live data from the public ISS API endpoint instead of the local server.
    return fetch('https://api.wheretheiss.at/v1/satellites/25544')
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to fetch ISS data");
            }
            return response.json();
        });
};

export const fetchISSPositions = async () => {
    const now = Math.floor(Date.now() / 1000);
    const timestamps = [now, now + 60, now + 120].join(",");
    // Wait for the HTTP request to finish completely before returning the position data.
    const response = await axios.get(
        `https://api.wheretheiss.at/v1/satellites/25544/positions?timestamps=${timestamps}&units=kilometers`
    );
    return response.data;
};
