require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { connectDB } = require('../config/db.cjs');
const Satellite = require('../models/Satellite.cjs');
const Payload = require('../models/Payload.cjs');
const Pass = require('../models/Pass.cjs');
const Config = require('../models/Config.cjs');

const DB_JSON_PATH = path.join(__dirname, '..', 'data', 'db.json');

const migrateData = async () => {
    console.log('--- SomaiyaSat MongoDB Data Migration Script ---');

    if (!fs.existsSync(DB_JSON_PATH)) {
        console.error(`Source file not found at: ${DB_JSON_PATH}`);
        process.exit(1);
    }

    try {
        await connectDB();
    } catch (err) {
        console.error('Migration aborted: Unable to connect to MongoDB.', err.message);
        process.exit(1);
    }

    const rawData = fs.readFileSync(DB_JSON_PATH, 'utf8');
    const json = JSON.parse(rawData);

    // 1. Satellites Migration
    let satMigrated = 0;
    let satSkipped = 0;
    if (Array.isArray(json.satellites)) {
        for (const sat of json.satellites) {
            const exists = await Satellite.findOne({ id: sat.id });
            if (!exists) {
                await Satellite.create({
                    id: sat.id,
                    name: sat.name,
                    status: sat.status || 'Nominal',
                    battery: Number(sat.battery),
                    signal: Number(sat.signal),
                    temp: Number(sat.temp),
                    orbit: Number(sat.orbit || 500),
                    communication: sat.communication || 'Online'
                });
                satMigrated++;
            } else {
                satSkipped++;
            }
        }
    }

    // 2. Payloads Migration
    let payMigrated = 0;
    let paySkipped = 0;
    if (Array.isArray(json.payloads)) {
        for (const pay of json.payloads) {
            const exists = await Payload.findOne({ id: pay.id });
            if (!exists) {
                await Payload.create({
                    id: pay.id,
                    name: pay.name,
                    type: pay.type,
                    priority: pay.priority || 'Normal',
                    size: pay.size,
                    status: pay.status || 'Queued'
                });
                payMigrated++;
            } else {
                paySkipped++;
            }
        }
    }

    // 3. Orbital Passes Migration
    let passMigrated = 0;
    let passSkipped = 0;
    if (Array.isArray(json.passes)) {
        for (const p of json.passes) {
            const exists = await Pass.findOne({ id: p.id });
            if (!exists) {
                await Pass.create({
                    id: p.id,
                    satellite: p.satellite,
                    latitude: Number(p.latitude),
                    longitude: Number(p.longitude),
                    location: p.location,
                    scheduledTime: p.scheduledTime || p.time,
                    time: p.time || p.scheduledTime,
                    date: p.date,
                    status: p.status || 'Scheduled',
                    createdAt: p.createdAt ? new Date(p.createdAt) : new Date()
                });
                passMigrated++;
            } else {
                passSkipped++;
            }
        }
    }

    // 4. Mission Configuration Migration
    let configMigrated = false;
    if (json.config && Object.keys(json.config).length > 0) {
        const existingConfig = await Config.findOne();
        if (!existingConfig) {
            await Config.create({
                frequency: json.config.frequency,
                bandwidth: json.config.bandwidth,
                activeMode: json.config.activeMode,
                modes: json.config.modes,
                transmitPower: json.config.transmitPower,
                downtime: json.config.downtime
            });
            configMigrated = true;
        }
    }

    // Report Summary
    const satCount = await Satellite.countDocuments();
    const payCount = await Payload.countDocuments();
    const passCount = await Pass.countDocuments();
    const configCount = await Config.countDocuments();

    console.log('\n--- Migration Results Summary ---');
    console.log(`Satellites:  Migrated ${satMigrated}, Skipped ${satSkipped} (Total in DB: ${satCount})`);
    console.log(`Payloads:    Migrated ${payMigrated}, Skipped ${paySkipped} (Total in DB: ${payCount})`);
    console.log(`Passes:      Migrated ${passMigrated}, Skipped ${passSkipped} (Total in DB: ${passCount})`);
    console.log(`Config:      ${configMigrated ? 'Migrated' : 'Already Exists'} (Total in DB: ${configCount})`);
    console.log('Migration Completed Successfully!');
    process.exit(0);
};

migrateData();
