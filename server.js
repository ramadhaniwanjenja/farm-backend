// SMART HARVEST Backend API
// Node.js + Express server for IoT sensor data + AI weather predictions
// Free hosting on Render.com

const express = require('express');
const cors = require('cors');
const https = require('https');

const app = express();
app.use(cors());
app.use(express.json());

// ============================================================
// IN-MEMORY STORAGE
// (For production, swap with MongoDB Atlas — see README)
// ============================================================
let readings = [];                          // last 100 sensor readings
let pumpStates = {};                        // { deviceId: { pesticidePump: bool } }
let deviceLocations = {                     // GPS coordinates per device
  'farm-node-001': { lat: -1.9441, lon: 30.0619, name: 'Kigali Pilot Farm' }
};

// ============================================================
// HEALTH CHECK
// ============================================================
app.get('/', (req, res) => {
  res.json({
    project: 'SMART HARVEST',
    description: 'IoT-Powered School Gardens for Climate-Resilient Nutrition and Learning',
    status: 'API running',
    readings: readings.length,
    devices: Object.keys(pumpStates).length || 0,
    endpoints: {
      'POST /api/iot/data': 'Submit sensor reading (from ESP8266)',
      'GET /api/iot/readings': 'Fetch sensor history (for dashboard)',
      'GET /api/iot/pump-status': 'Check pump command (ESP8266 polls)',
      'POST /api/iot/pump-control': 'Set pump on/off (from dashboard)',
      'GET /api/weather/forecast': '7-day weather prediction',
      'GET /api/ai/recommendation': 'AI irrigation recommendation'
    }
  });
});

// ============================================================
// 1. ESP8266 → POSTs sensor data
// ============================================================
app.post('/api/iot/data', (req, res) => {
  const data = { ...req.body, receivedAt: new Date().toISOString() };
  readings.push(data);
  if (readings.length > 100) readings.shift();
  console.log('📥 Reading from', data.deviceId, '— soil:', data.soilMoisture, 'temp:', data.temperature);
  res.json({ ok: true });
});

// ============================================================
// 2. Dashboard → GETs sensor history
// ============================================================
app.get('/api/iot/readings', (req, res) => {
  const deviceId = req.query.deviceId;
  let filtered = readings;
  if (deviceId) filtered = readings.filter(r => r.deviceId === deviceId);
  res.json({
    readings: filtered,
    latest: filtered[filtered.length - 1] || null,
    count: filtered.length
  });
});

// ============================================================
// 3. ESP8266 → GETs pump command
// ============================================================
app.get('/api/iot/pump-status', (req, res) => {
  const deviceId = req.query.deviceId || 'farm-node-001';
  const state = pumpStates[deviceId] || { pesticidePump: false };
  res.json(state);
});

// ============================================================
// 4. Dashboard → POSTs pump command
// ============================================================
app.post('/api/iot/pump-control', (req, res) => {
  const { deviceId, pesticidePump } = req.body;
  if (!deviceId) return res.status(400).json({ error: 'deviceId required' });
  pumpStates[deviceId] = { pesticidePump: !!pesticidePump };
  console.log(`🧪 Pump for ${deviceId} → ${pesticidePump ? 'ON' : 'OFF'}`);
  res.json({ ok: true, ...pumpStates[deviceId] });
});

// ============================================================
// 5. AI WEATHER FORECAST (uses Open-Meteo — free, no key)
// ============================================================
function fetchOpenMeteo(lat, lon) {
  return new Promise((resolve, reject) => {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max` +
      `&hourly=precipitation,temperature_2m&timezone=auto&forecast_days=7`;
    https.get(url, (resp) => {
      let data = '';
      resp.on('data', chunk => data += chunk);
      resp.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

app.get('/api/weather/forecast', async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat) || -1.9441;
    const lon = parseFloat(req.query.lon) || 30.0619;
    const forecast = await fetchOpenMeteo(lat, lon);
    res.json(forecast);
  } catch (e) {
    res.status(500).json({ error: 'Weather fetch failed', details: e.message });
  }
});

// ============================================================
// 6. AI IRRIGATION RECOMMENDATION
// Combines latest sensor reading + weather forecast → smart decision
// ============================================================
app.get('/api/ai/recommendation', async (req, res) => {
  try {
    const deviceId = req.query.deviceId || 'farm-node-001';
    const loc = deviceLocations[deviceId] || { lat: -1.9441, lon: 30.0619 };

    // Latest sensor data
    const deviceReadings = readings.filter(r => r.deviceId === deviceId);
    const latest = deviceReadings[deviceReadings.length - 1];
    if (!latest) {
      return res.json({
        recommendation: 'NO_DATA',
        reason: 'No sensor readings available yet',
        confidence: 0
      });
    }

    // Weather forecast
    const weather = await fetchOpenMeteo(loc.lat, loc.lon);
    const hourly = weather.hourly;
    const daily = weather.daily;

    // Calculate rain expected in next 6h and 24h
    let rainNext6h = 0, rainNext24h = 0;
    if (hourly && hourly.precipitation) {
      for (let i = 0; i < Math.min(24, hourly.precipitation.length); i++) {
        rainNext24h += hourly.precipitation[i];
        if (i < 6) rainNext6h += hourly.precipitation[i];
      }
    }

    const avgMaxTemp = (daily.temperature_2m_max[0] + daily.temperature_2m_max[1] + daily.temperature_2m_max[2]) / 3;

    // Decision tree
    let recommendation, reason, confidence;
    if (latest.soilMoisture < 40 && rainNext6h >= 5) {
      recommendation = 'HOLD_IRRIGATION';
      reason = `Soil dry but ${rainNext6h.toFixed(1)}mm rain expected in next 6h`;
      confidence = 0.92;
    } else if (latest.soilMoisture < 40 && rainNext24h < 2) {
      recommendation = 'IRRIGATE_NOW';
      reason = `Soil dry (${latest.soilMoisture}%), no rain forecast (${rainNext24h.toFixed(1)}mm in 24h)`;
      confidence = 0.94;
    } else if (avgMaxTemp > 32) {
      recommendation = 'HEATWAVE_PROTECTION';
      reason = `Avg max temp next 3 days: ${avgMaxTemp.toFixed(1)}°C — apply mulch, shade, morning watering`;
      confidence = 0.88;
    } else if (latest.humidity > 80 && latest.temperature > 22 && avgMaxTemp > 24) {
      recommendation = 'FUNGAL_RISK';
      reason = `Sustained high humidity + warm temps → disease risk`;
      confidence = 0.78;
    } else if (rainNext24h > 30) {
      recommendation = 'HEAVY_RAIN_PREP';
      reason = `${rainNext24h.toFixed(1)}mm rain in next 24h — check drainage`;
      confidence = 0.91;
    } else if (latest.soilMoisture > 80) {
      recommendation = 'SOIL_SATURATED';
      reason = `Soil very wet (${latest.soilMoisture}%) — risk of root rot, ensure drainage`;
      confidence = 0.82;
    } else {
      recommendation = 'CONDITIONS_OPTIMAL';
      reason = `All parameters within normal range`;
      confidence = 0.86;
    }

    res.json({
      recommendation,
      reason,
      confidence,
      sensors: {
        soilMoisture: latest.soilMoisture,
        temperature: latest.temperature,
        humidity: latest.humidity,
        pH: latest.pH
      },
      weather: {
        rainNext6h: parseFloat(rainNext6h.toFixed(1)),
        rainNext24h: parseFloat(rainNext24h.toFixed(1)),
        avgMaxTemp3day: parseFloat(avgMaxTemp.toFixed(1))
      },
      generatedAt: new Date().toISOString()
    });
  } catch (e) {
    res.status(500).json({ error: 'Recommendation failed', details: e.message });
  }
});

// ============================================================
// START
// ============================================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🌾 SMART HARVEST API running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/`);
  console.log(`   AI rec: http://localhost:${PORT}/api/ai/recommendation\n`);
});