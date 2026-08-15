import axios from 'axios';

const LOCAL_API_BASE = 'http://localhost:3001';

export const fetchLocalSatellites = () => {
    return fetch(`${LOCAL_API_BASE}/satellites`)
        .then(res => {
            if (!res.ok) throw new Error('Network response was not ok');
            return res.json();
        });
};

export const fetchLocalPayloads = () => {
    return fetch(`${LOCAL_API_BASE}/payloads`)
        .then(res => {
            if (!res.ok) throw new Error('Network response was not ok');
            return res.json();
        });
};

export const fetchExternalISS = () => {
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
    const response = await axios.get(
        `https://api.wheretheiss.at/v1/satellites/25544/positions?timestamps=${timestamps}&units=kilometers`
    );
    return response.data;
};
