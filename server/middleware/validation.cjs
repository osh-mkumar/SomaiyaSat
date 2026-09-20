const validateSatellite = (req, res, next) => {
    const { name, battery, signal, temp, temperature, orbit, altitude } = req.body;
    const details = [];

    if (!name || typeof name !== 'string' || name.trim() === '') {
        details.push('Satellite name is required');
    }

    const bVal = Number(battery);
    if (battery === undefined || isNaN(bVal) || bVal < 0 || bVal > 100) {
        details.push('Battery must be between 0 and 100');
    }

    const sVal = Number(signal);
    if (signal === undefined || isNaN(sVal) || sVal < 0 || sVal > 100) {
        details.push('Signal must be between 0 and 100');
    }

    const tempVal = Number(temp !== undefined ? temp : temperature);
    if ((temp === undefined && temperature === undefined) || isNaN(tempVal)) {
        details.push('Temperature must be numeric');
    }

    const orbVal = Number(orbit !== undefined ? orbit : altitude);
    if ((orbit === undefined && altitude === undefined) || isNaN(orbVal) || orbVal <= 0) {
        details.push('Orbit altitude must be positive');
    }

    if (details.length > 0) {
        return res.status(400).json({
            success: false,
            error: 'Invalid satellite data',
            details
        });
    }

    next();
};

const validatePayload = (req, res, next) => {
    const { name, type, priority, size, status } = req.body;
    const details = [];

    if (!name || typeof name !== 'string' || name.trim() === '') {
        details.push('Payload name is required');
    }

    if (!type || typeof type !== 'string' || type.trim() === '') {
        details.push('Payload type is required');
    }

    const validPriorities = ['Critical', 'High', 'Normal', 'Low'];
    if (!priority || !validPriorities.includes(priority)) {
        details.push(`Priority must be one of: ${validPriorities.join(', ')}`);
    }

    // size can be numeric or string like "12 KB" or number 12
    let numericSize = typeof size === 'number' ? size : parseFloat(size);
    if (size === undefined || isNaN(numericSize) || numericSize <= 0) {
        details.push('Payload size must be positive');
    }

    const validStatuses = ['Queued', 'Transmitting', 'Suspended', 'Completed'];
    if (status && !validStatuses.includes(status)) {
        details.push(`Status must be one of: ${validStatuses.join(', ')}`);
    }

    if (details.length > 0) {
        return res.status(400).json({
            success: false,
            error: 'Invalid payload data',
            details
        });
    }

    next();
};

const validatePass = (req, res, next) => {
    const { satellite, latitude, longitude, scheduledTime, time, status } = req.body;
    const details = [];

    if (!satellite || typeof satellite !== 'string' || satellite.trim() === '') {
        details.push('Satellite is required');
    }

    const latVal = Number(latitude);
    if (latitude === undefined || isNaN(latVal) || latVal < -90 || latVal > 90) {
        details.push('Latitude must be between -90 and 90');
    }

    const lonVal = Number(longitude);
    if (longitude === undefined || isNaN(lonVal) || lonVal < -180 || lonVal > 180) {
        details.push('Longitude must be between -180 and 180');
    }

    const passTime = scheduledTime || time;
    if (!passTime || typeof passTime !== 'string' || passTime.trim() === '') {
        details.push('Scheduled time is required');
    }

    const validStatuses = ['Scheduled', 'In Progress', 'Completed', 'Cancelled'];
    if (status && !validStatuses.includes(status)) {
        details.push(`Status must be one of: ${validStatuses.join(', ')}`);
    }

    if (details.length > 0) {
        return res.status(400).json({
            success: false,
            error: 'Invalid pass data',
            details
        });
    }

    next();
};

const validateConfig = (req, res, next) => {
    const { frequency, bandwidth, activeMode, transmitPower, downtime } = req.body;
    const details = [];

    if (activeMode !== undefined && (typeof activeMode !== 'string' || activeMode.trim() === '')) {
        details.push('Active mode must be a valid string');
    }

    const freqVal = Number(frequency);
    if (frequency !== undefined && isNaN(freqVal)) {
        details.push('Frequency must be numeric');
    }

    if (bandwidth !== undefined && (typeof bandwidth !== 'string' || bandwidth.trim() === '')) {
        details.push('Bandwidth must be a valid string');
    }

    const pwrVal = Number(transmitPower);
    if (transmitPower !== undefined && (isNaN(pwrVal) || pwrVal < 0 || pwrVal > 100)) {
        details.push('Transmit power must be between 0 and 100');
    }

    if (downtime !== undefined && typeof downtime === 'object') {
        const { hours, minutes, seconds } = downtime;
        if (hours !== undefined && (isNaN(Number(hours)) || Number(hours) < 0)) details.push('Downtime hours must be non-negative');
        if (minutes !== undefined && (isNaN(Number(minutes)) || Number(minutes) < 0 || Number(minutes) >= 60)) details.push('Downtime minutes must be between 0 and 59');
        if (seconds !== undefined && (isNaN(Number(seconds)) || Number(seconds) < 0 || Number(seconds) >= 60)) details.push('Downtime seconds must be between 0 and 59');
    }

    if (details.length > 0) {
        return res.status(400).json({
            success: false,
            error: 'Invalid configuration data',
            details
        });
    }

    next();
};

module.exports = {
    validateSatellite,
    validatePayload,
    validatePass,
    validateConfig
};
