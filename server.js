const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// In-memory storage (resets if server restarts — fine for a starter project)
let readings = [];          // last 100 readings
let pumpStates = {};        // { "farm-node-001": { pesticidePump: false } }

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'Smart Farm API running', readings: readings.length });
});

// 1) ESP8266 POSTs sensor data here
app.post('/api/iot/data', (req, res) => {
  const data = { ...req.body, receivedAt: new Date().toISOString() };
  readings.push(data);
  if (readings.length > 100) readings.shift();
  console.log('📥 Reading:', data);
  res.json({ ok: true });
});

// 2) Dashboard GETs latest readings
app.get('/api/iot/readings', (req, res) => {
  const deviceId = req.query.deviceId;
  let filtered = readings;
  if (deviceId) filtered = readings.filter(r => r.deviceId === deviceId);
  res.json({ readings: filtered, latest: filtered[filtered.length - 1] || null });
});

// 3) ESP8266 GETs current pesticide pump command
app.get('/api/iot/pump-status', (req, res) => {
  const deviceId = req.query.deviceId || 'farm-node-001';
  const state = pumpStates[deviceId] || { pesticidePump: false };
  res.json(state);
});

// 4) Dashboard sets pump on/off
app.post('/api/iot/pump-control', (req, res) => {
  const { deviceId, pesticidePump } = req.body;
  if (!deviceId) return res.status(400).json({ error: 'deviceId required' });
  pumpStates[deviceId] = { pesticidePump: !!pesticidePump };
  console.log(`🧪 Pesticide pump for ${deviceId} -> ${pesticidePump ? 'ON' : 'OFF'}`);
  res.json({ ok: true, ...pumpStates[deviceId] });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🌱 Server on port ${PORT}`));