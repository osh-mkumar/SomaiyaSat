const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'db.json');

const readDatabase = () => {
    try {
        const rawData = fs.readFileSync(DB_PATH, 'utf8');
        return JSON.parse(rawData);
    } catch (err) {
        console.error('Error reading database file:', err);
        return { satellites: [], payloads: [], passes: [], config: {} };
    }
};

const writeDatabase = (data) => {
    try {
        fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (err) {
        console.error('Error writing to database file:', err);
        return false;
    }
};

module.exports = {
    readDatabase,
    writeDatabase
};
