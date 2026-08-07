export const validateUsername = (username) => {
    return username.length >= 4;
};

export const validatePassword = (password) => {
    return password.length >= 6 && /[A-Z]/.test(password) && /\d/.test(password);
};

export const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validateMissionId = (missionId) => {
    return missionId === 'KJS-SRS-01';
};

export const validateFrequency = (frequency) => {
    const num = parseFloat(frequency);
    return !isNaN(num) && num >= 430 && num <= 450;
};

export const validateEmergencyContact = (contact) => {
    return /^\d{10}$/.test(contact);
};

export const validateOperatorName = (name) => {
    return /^[a-zA-Z\s]+$/.test(name) && name.trim().length > 0;
};

export const validateSatelliteNickname = (nickname) => {
    return /^[a-zA-Z0-9\-]+$/.test(nickname) && nickname.length > 0;
};

export const validateCountry = (country) => {
    return country && country !== '';
};

export const validateTerms = (agreed) => {
    return agreed === true;
};
