const express = require('express');
const cors = require('cors');

// Create Express app
const app = express();
app.use(cors());
app.use(express.json());

// Store data in memory (temporary)
let patients = [];
let iotData = [];
let alerts = [];

// ============ HEALTH CHECK ============
app.get('/', (req, res) => {
    res.json({ 
        message: '✅ Biosynervix API is running!', 
        status: 'active',
        timestamp: new Date()
    });
});

// ============ PATIENT API ============
// Add new patient
app.post('/api/patients', (req, res) => {
    const { name, age, condition, deviceId } = req.body;
    
    const newPatient = {
        id: patients.length + 1,
        name,
        age,
        condition,
        deviceId,
        createdAt: new Date()
    };
    
    patients.push(newPatient);
    console.log('📝 New patient added:', newPatient);
    
    res.json({ success: true, patient: newPatient });
});

// Get all patients
app.get('/api/patients', (req, res) => {
    res.json(patients);
});

// ============ IoMT DEVICE DATA API ============
// Receive data from medical devices
app.post('/api/iomt/data', (req, res) => {
    const { deviceId, heartRate, temperature, spo2, battery } = req.body;
    
    const reading = {
        id: iotData.length + 1,
        deviceId,
        heartRate,
        temperature,
        spo2,
        battery,
        timestamp: new Date(),
        alert: (heartRate > 120 || spo2 < 90) ? '⚠️ CRITICAL' : '✅ NORMAL'
    };
    
    iotData.push(reading);
    console.log('📡 IoMT Data received:', reading);
    
    // Create alert if critical
    if (reading.alert === '⚠️ CRITICAL') {
        const newAlert = {
            id: alerts.length + 1,
            deviceId,
            message: `🚨 ALERT: Heart Rate ${heartRate}, SpO2 ${spo2}%`,
            timestamp: new Date(),
            resolved: false
        };
        alerts.push(newAlert);
        console.log('🔔 ALERT CREATED:', newAlert.message);
    }
    
    res.json({ success: true, reading });
});

// Get latest data for a specific device
app.get('/api/iomt/latest/:deviceId', (req, res) => {
    const deviceReadings = iotData.filter(d => d.deviceId === req.params.deviceId);
    const latest = deviceReadings[deviceReadings.length - 1];
    
    if (latest) {
        res.json(latest);
    } else {
        res.json({ message: 'No data found for this device' });
    }
});

// Get all device data
app.get('/api/iomt/all', (req, res) => {
    res.json(iotData);
});

// ============ ALERTS API ============
// Get all active (unresolved) alerts
app.get('/api/alerts', (req, res) => {
    const activeAlerts = alerts.filter(a => !a.resolved);
    res.json(activeAlerts);
});

// Resolve an alert
app.put('/api/alerts/:id/resolve', (req, res) => {
    const alertId = parseInt(req.params.id);
    const alert = alerts.find(a => a.id === alertId);
    
    if (alert) {
        alert.resolved = true;
        console.log('✅ Alert resolved:', alertId);
        res.json({ success: true, message: 'Alert resolved' });
    } else {
        res.status(404).json({ error: 'Alert not found' });
    }
});

// ============ ASSET TRACKING API ============
let assets = [];

// Track hospital assets
app.post('/api/assets/track', (req, res) => {
    const { assetId, location, status, maintenanceScore } = req.body;
    
    const existingAsset = assets.find(a => a.assetId === assetId);
    
    if (existingAsset) {
        existingAsset.location = location;
        existingAsset.status = status;
        existingAsset.maintenanceScore = maintenanceScore;
        existingAsset.lastUpdated = new Date();
    } else {
        assets.push({
            assetId,
            location,
            status,
            maintenanceScore: maintenanceScore || 100,
            lastUpdated: new Date()
        });
    }
    
    console.log('📍 Asset updated:', assetId, location);
    res.json({ success: true });
});

// Get all assets
app.get('/api/assets', (req, res) => {
    res.json(assets);
});

// ============ STATISTICS API ============
app.get('/api/stats', (req, res) => {
    res.json({
        totalPatients: patients.length,
        totalReadings: iotData.length,
        activeAlerts: alerts.filter(a => !a.resolved).length,
        totalAssets: assets.length,
        lastUpdate: new Date()
    });
});

// ============ START SERVER ============
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`
    ╔════════════════════════════════════════╗
    ║     🚀 BIOSYNERVIX API STARTED 🚀      ║
    ╠════════════════════════════════════════╣
    ║  📡 Server: http://localhost:${PORT}    ║
    ║  🩺 Health Check: /                    ║
    ║  📋 Patients: /api/patients            ║
    ║  📊 IoMT Data: /api/iomt/data          ║
    ║  🔔 Alerts: /api/alerts                ║
    ╚════════════════════════════════════════╝
    `);
});