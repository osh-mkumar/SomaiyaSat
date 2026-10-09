const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
    if (isConnected) {
        return;
    }

    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/somaiyasat';

    try {
        mongoose.set('strictQuery', true);
        const conn = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000 // 5 seconds timeout for quick error handling if DB offline
        });

        isConnected = !!conn.connections[0].readyState;
        console.log(`MongoDB Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        isConnected = false;
        // Rethrow or handle cleanly so routes can return standard 500 errors if DB is unreachable
        throw error;
    }
};

const getIsConnected = () => isConnected;

module.exports = {
    connectDB,
    getIsConnected
};
