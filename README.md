<div align="center">

# 🌾 SMART HARVEST

### *IoT-Powered School Gardens for Climate-Resilient Nutrition and Learning*

**Transforming school kitchen gardens into intelligent, climate-resilient food systems through low-cost IoT, AI-driven insights, and hands-on STEM learning.**

[![Status](https://img.shields.io/badge/Status-Working_Prototype-success)]()
[![License](https://img.shields.io/badge/License-MIT-blue)]()
[![Hardware](https://img.shields.io/badge/Hardware-ESP8266-red)]()
[![Backend](https://img.shields.io/badge/Backend-Node.js-green)]()
[![AI](https://img.shields.io/badge/AI-Weather_Prediction-purple)]()
[![SDG](https://img.shields.io/badge/UN_SDGs-2_·_4_·_6_·_13-orange)]()

---

### 🎬 [Watch the Demo Video](https://youtu.be/z-pkNQOWAu4) &nbsp;·&nbsp; 🌐 [Live Dashboard](https://farm-backend-liard.vercel.app/) &nbsp;·&nbsp; 📊 [Live API](https://farm-backend-lyax.onrender.com/api/iot/readings)

</div>

---

## 📌 Table of Contents

1. [The Problem](#-the-problem)
2. [Our Solution](#-our-solution)
3. [Key Features](#-key-features)
4. [System Architecture](#-system-architecture)
5. [AI-Powered Weather Prediction](#-ai-powered-weather-prediction)
6. [Hardware & Materials (Bill of Materials)](#-hardware--materials-bill-of-materials)
7. [Software Stack](#-software-stack)
8. [Demo & Screenshots](#-demo--screenshots)
9. [Implementation Plan](#-implementation-plan)
10. [Expected Impact](#-expected-impact)
11. [Installation & Setup](#-installation--setup)
12. [API Documentation](#-api-documentation)
13. [Roadmap](#-roadmap)
14. [Grant & Funding Opportunity](#-grant--funding-opportunity)
15. [Team](#-team)
16. [License](#-license)

---

## 🌍 The Problem

Across Sub-Saharan Africa, **schools and smallholder communities face an interconnected agricultural and educational crisis**:

> 🚨 **Climate variability** — irregular rainfall, rising temperatures, and degraded soils — is destroying the productivity of school kitchen gardens that feed millions of students.

### The Stark Reality

- 🌧️ **Unpredictable rainfall** is making traditional farming calendars obsolete in arid regions of Rwanda and across Sub-Saharan Africa.
- 💧 **Water waste is rampant** — without real-time soil data, schools and farmers irrigate by guesswork, wasting precious water and still losing crops.
- 🥗 **School feeding programs suffer** — when kitchen gardens fail, student nutrition collapses, directly impacting learning outcomes.
- 🎓 **STEM education gap** — limited access to technology denies students the practical, hands-on learning that builds future innovators.
- 💸 **Existing smart agriculture tools are out of reach** — most commercial IoT systems cost hundreds or thousands of dollars and assume reliable infrastructure that simply doesn't exist in low-resource settings.

**The result:** A vicious cycle where climate change shrinks harvests, malnutrition undermines learning, and rural students are locked out of the digital revolution.

---

## 💡 Our Solution

**SMART HARVEST** is an **affordable, open-source, AI-powered IoT system** that transforms ordinary school kitchen gardens into:

✅ **Climate-resilient food systems** that produce more food with less water
✅ **Living STEM laboratories** where students learn IoT, data science, and AI hands-on
✅ **Community knowledge hubs** that spread smart agriculture beyond school walls

### How It Works (in 30 seconds)

1. **🌱 Sensors in the soil** continuously read moisture, temperature, humidity, pH, and light.
2. **📡 An ESP8266 microcontroller** sends the data over Wi-Fi to our cloud backend every 30 seconds.
3. **🤖 AI analyzes** the data alongside live weather forecasts to predict when irrigation is needed — and when to skip it because rain is coming.
4. **💧 An automatic relay-controlled pump** waters the crops only when truly needed, cutting water use by up to 40%.
5. **🧪 A second pump** can be triggered manually from the dashboard to apply pesticides or liquid fertilizer.
6. **📊 Teachers and students see everything** on a beautiful, mobile-friendly web dashboard — turning every garden cycle into a learning opportunity.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🌡️ **Real-time Sensor Monitoring** | Soil moisture, air temperature, humidity, pH, ambient light — sampled every 30 seconds. |
| 💧 **Automatic Irrigation** | Pump activates when soil moisture drops below threshold; runs for safe duration; auto-shuts off. |
| 🧴 **Manual Pesticide/Fertilizer Pump** | Toggle from dashboard for targeted spraying — controlled remotely. |
| 🤖 **AI Weather Prediction** | 7-day weather forecast integrated into irrigation logic — "Rain is coming, hold the water." |
| 📈 **Historical Data Visualization** | Charts and trends help students *see* climate patterns over weeks and months. |
| 📱 **Mobile-Friendly Dashboard** | Works on any phone, tablet, or computer — designed for low-bandwidth networks. |
| 🔋 **Solar-Power Ready** | Hardware is selected for low power so the system can run on a small solar panel + battery. |
| 📚 **Open-Source Toolkit** | All code, schematics, lesson plans, and documentation are freely available for any school to replicate. |
| 🚨 **SMS Alert Fallback** *(planned)* | For schools with weak internet — critical alerts via SMS when soil is dangerously dry. |

---

## 🏗️ System Architecture

```
┌─────────────────────────┐         ┌──────────────────────┐         ┌─────────────────────┐
│   FIELD LAYER           │         │   CLOUD LAYER        │         │   USER LAYER        │
│                         │         │                      │         │                     │
│  ┌───────────────────┐  │  HTTPS  │  ┌────────────────┐  │  HTTPS  │  ┌───────────────┐  │
│  │ ESP8266 NodeMCU   │──┼────────▶│  │ Node.js / API  │  │◀────────┼──│ Web Dashboard │  │
│  │                   │  │  POST   │  │  - Receive data│  │  GET    │  │ - Live cards  │  │
│  │  ▸ DHT22 (T/H)    │  │  every  │  │  - Store hist. │  │ every   │  │ - Charts      │  │
│  │  ▸ pH sensor      │◀─┼─────────│  │  - Pump cmd    │  │  5s     │  │ - Pump button │  │
│  │  ▸ Soil moisture  │  │  GET    │  │  - Open-Meteo  │  │         │  │ - AI forecast │  │
│  │  ▸ LDR (light)    │  │  pump   │  └────────────────┘  │         │  └───────────────┘  │
│  │                   │  │  cmd    │           │          │         │         │           │
│  │  ▸ Relay → 💧Pump │  │         │           ▼          │         │         ▼           │
│  │  ▸ Relay → 🧴Pump │  │         │  ┌────────────────┐  │         │   Students /        │
│  └───────────────────┘  │         │  │ AI Engine      │  │         │   Teachers /        │
│           ▲             │         │  │ - Weather API  │  │         │   Farmers           │
│           │             │         │  │ - Smart logic  │  │         │                     │
│       Solar Panel       │         │  │ - Predictions  │  │         │                     │
│       + Battery         │         │  └────────────────┘  │         │                     │
└─────────────────────────┘         └──────────────────────┘         └─────────────────────┘
```

---

## 🤖 AI-Powered Weather Prediction

> *"Why irrigate today if it's going to rain tonight?"*

This is what makes SMART HARVEST genuinely **smart**. We integrate live weather forecast data with our soil sensor readings to make **predictive irrigation decisions** instead of reactive ones.

### How the AI Layer Works

1. **🌐 Live Forecast Ingestion** — The backend pulls 7-day weather forecasts from the **Open-Meteo API** (free, no key required) using the school's GPS coordinates.

2. **🧠 Smart Decision Engine** — Combines forecast + sensor data using rule-based AI:
   - Soil dry **AND** no rain in next 24h → 💧 *Irrigate now*
   - Soil dry **BUT** heavy rain expected in next 6h → ⏸️ *Hold off, save water*
   - Soil moist **AND** heatwave incoming → 🌡️ *Pre-cool with light irrigation*
   - High humidity + warm temps for 3+ days → 🦠 *Fungal disease risk warning*

3. **📅 7-Day Crop Calendar** — Predicts the best planting and harvesting windows based on temperature trends and historical climate data.

4. **🚨 Anomaly Detection** *(planned)* — A lightweight ML model (TensorFlow.js Lite) detects unusual sensor patterns that may indicate sensor failure, pest infestation, or disease.

### Why This Matters for Farmers and Schools

- 💧 **20-40% water savings** by avoiding redundant irrigation before rain
- 📈 **10-30% yield improvement** by acting on heat/cold/moisture warnings early
- 🎓 **Teachable AI moments** — students see real machine intelligence applied to their own garden
- 🌍 **Adapts to local climate** — works as well in Kigali's wet season as in arid Eastern Province

---

## 🛠️ Hardware & Materials (Bill of Materials)

> 💰 **Total cost per unit: ≈ $35–$45 USD** *(depending on local sourcing)*

| # | Component | Quantity | Approx. Price (USD) | Purpose |
|---|---|---|---|---|
| 1 | **ESP8266 NodeMCU** (CP2102 or CH340) | 1 | $4.00 | Main microcontroller with built-in Wi-Fi |
| 2 | **DHT22 sensor** | 1 | $3.00 | Air temperature + humidity |
| 3 | **Soil moisture sensor** (capacitive recommended) | 1 | $2.50 | Detects when soil is dry |
| 4 | **Analog pH sensor module** (PH-4502C) | 1 | $7.00 | Soil/water pH measurement |
| 5 | **LDR (light-dependent resistor)** + 10kΩ resistor | 1 | $0.50 | Measures sunlight intensity |
| 6 | **2-channel relay module (5V)** | 1 | $2.50 | Switches the two pumps |
| 7 | **12V mini submersible water pump** | 1 | $4.00 | Irrigation pump |
| 8 | **12V diaphragm pump** (for spray) | 1 | $6.00 | Pesticide/fertilizer pump |
| 9 | **I2C LCD 16x2 display** | 1 | $3.00 | On-site readout |
| 10 | **Jumper wires + breadboard** | 1 set | $2.00 | Prototyping |
| 11 | **5V/2A power supply** *(or solar kit)* | 1 | $5.00 | System power |
| 12 | **Weatherproof enclosure (IP65)** | 1 | $4.00 | Field protection |
| 13 | **Silicone tubing + drip emitters** | ~2m | $2.00 | Water delivery |
| | **TOTAL** | | **≈ $45 USD** | |

### 🌞 Solar Power Add-On (Optional)

For schools without grid electricity:

- 10W solar panel — $8
- 12V 7Ah lead-acid or LiFePO4 battery — $15
- Solar charge controller — $5
- **+$28 to add solar autonomy**

---

## 💻 Software Stack

| Layer | Technology | Why We Chose It |
|---|---|---|
| **Firmware** | C++ on ESP8266 (Arduino framework) | Mature, free, runs on the cheapest WiFi-enabled MCU |
| **Backend API** | Node.js + Express | Simple, fast, free hosting on Render |
| **Database** | In-memory + planned MongoDB Atlas | Easy start, scalable |
| **Frontend** | Vanilla HTML/CSS/JavaScript | Zero build step, works on any browser, low bandwidth |
| **Weather AI** | Open-Meteo API + custom rule engine | Free, no API key, accurate worldwide |
| **Hosting** | Render (backend) + Vercel (dashboard) | Both have generous free tiers |
| **Future ML** | TensorFlow Lite for Microcontrollers | Run anomaly detection on-device |

---

## 📸 Demo & Screenshots

> 🎥 **Watch the full demo video here:** [LINK_TO_VIDEO]
>
> *Replace this link with your YouTube/Drive video URL once uploaded.*

### 📷 Photo Gallery

<table>
<tr>
<td align="center"><b>Hardware Build</b><br><img src="/SmartHavest_demo.png" width="280" alt="Add photo of ESP8266 + sensors wired up"/><br><i>The complete sensor & pump assembly</i></td>
<td align="center"><b>Field Deployment</b><br><img src="/Msarthavest_onsite.png" width="280" alt="Add photo of system in school garden"/><br><i>Prototype installed in test garden</i></td>
</tr>
<tr>
<td align="center"><b>Live Dashboard</b><br><img src="/SmartHarvest_dashboard.png" width="280" alt="Add screenshot of dashboard"/><br><i>Real-time sensor data + AI forecast</i></td>
<td align="center"><b>EMF team</b><br><img src="/ERM_team.jpg.jpeg" width="280" alt="Add photo of students using system"/><br><i>EMF team on the site</i></td>
</tr>
</table>


---

## 📅 Implementation Plan

### 🚀 Phase 1: Design & Prototyping *(Months 1–3)* — ✅ COMPLETED

- [x] Develop IoT prototype hardware (ESP8266 + sensors + pumps)
- [x] Build open-source backend API and dashboard
- [x] Implement automatic irrigation logic
- [x] Implement manual pesticide pump control
- [x] Integrate AI weather prediction
- [x] Demo video and field testing

### 🌱 Phase 2: Pilot Deployment *(Months 4–9)* — ⏳ READY FOR FUNDING

- [ ] Install systems in **10–15 schools** in Rwanda's arid regions
- [ ] Train teachers in IoT-based agriculture and STEM curriculum
- [ ] Train students as system caretakers and data collectors
- [ ] Collect 6 months of operational data (yield, water use, engagement)
- [ ] Develop Kinyarwanda + English curriculum materials

### 📊 Phase 3: Evaluation & Optimization *(Months 10–12)*

- [ ] Quantitative impact study: water saved, yield increase, learning outcomes
- [ ] Qualitative study: teacher and student interviews
- [ ] Refine hardware design based on field feedback
- [ ] Publish open-source toolkit (hardware bill, code, lesson plans)
- [ ] Academic paper submission

### 🌍 Phase 4: Scaling *(Year 2 and beyond)*

- [ ] Expand to **50+ schools** across Sub-Saharan Africa
- [ ] Partnerships with Ministry of Education, NGOs, and UN agencies
- [ ] Establish local manufacturing/assembly hubs in Rwanda
- [ ] Train-the-trainer programs to spread expertise organically
- [ ] Mobile app version for low-end Android phones
- [ ] Advanced ML features: disease detection from camera feeds, yield forecasting

---

## 🎯 Expected Impact

> Based on benchmarks from comparable IoT-based smart agriculture deployments worldwide:

| Metric | Target Improvement |
|---|---|
| 💧 **Water usage reduction** | **20–40%** |
| 🌾 **Crop yield improvement** | **10–30%** |
| 🎓 **STEM engagement** (measured pre/post) | **+50% interest in STEM careers** |
| 🥗 **School feeding program reliability** | **>90% kitchen garden uptime** |
| 👥 **Direct beneficiaries (Phase 2)** | **~5,000 students across 15 schools** |
| 🌍 **Long-term reach (Phase 4)** | **25,000+ students, 50+ schools** |

### Aligned with UN Sustainable Development Goals

- 🥬 **SDG 2** — Zero Hunger (improved school nutrition)
- 📚 **SDG 4** — Quality Education (hands-on STEM learning)
- 💧 **SDG 6** — Clean Water (efficient irrigation)
- 🌡️ **SDG 13** — Climate Action (climate-resilient agriculture)

---

## ⚙️ Installation & Setup

### Prerequisites

- Arduino IDE (1.8+) with ESP8266 board package
- Node.js 18+ (for backend)
- A free [Render](https://render.com) account (backend hosting)
- A free [Vercel](https://vercel.com) account (dashboard hosting)

### 1. Flash the ESP8266

```bash
# Open arduino/farm_smart_node.ino in Arduino IDE
# Install required libraries via Library Manager:
#   - ESP8266WiFi (built-in with ESP8266 boards package)
#   - ESP8266HTTPClient
#   - ArduinoJson by Benoit Blanchon
#   - DHT sensor library by Adafruit
#   - Adafruit Unified Sensor

# Edit credentials in the .ino file:
const char* ssid = "YOUR_WIFI";
const char* password = "YOUR_PASSWORD";
const char* apiSendUrl = "https://YOUR-API.onrender.com/api/iot/data";
const char* apiPumpUrl = "https://YOUR-API.onrender.com/api/iot/pump-status";

# Then upload to your NodeMCU
```

### 2. Deploy the Backend

```bash
cd backend
npm install
npm start          # local test on port 3000

# Then push to GitHub and connect to Render for free hosting
# Build command: npm install
# Start command: node server.js
```

### 3. Deploy the Dashboard

```bash
cd frontend
# Edit index.html and update API_BASE to your Render URL
# Push to GitHub and connect to Vercel — auto-deploys on push
```

📖 **Full step-by-step deployment guide:** [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

---

## 📡 API Documentation

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/` | Health check |
| `POST` | `/api/iot/data` | ESP8266 submits sensor readings |
| `GET` | `/api/iot/readings?deviceId=X` | Dashboard fetches latest readings + history |
| `GET` | `/api/iot/pump-status?deviceId=X` | ESP8266 polls for manual pump command |
| `POST` | `/api/iot/pump-control` | Dashboard sets pesticide pump on/off |
| `GET` | `/api/weather/forecast?lat=X&lon=Y` | AI weather prediction (7-day) |
| `GET` | `/api/ai/recommendation?deviceId=X` | AI irrigation recommendation |

### Sample Request — Sensor Data

```json
POST /api/iot/data
{
  "deviceId": "farm-node-001",
  "soilMoisture": 25,
  "temperature": 28.9,
  "humidity": 54.6,
  "pH": 6.65,
  "irrigationActive": true,
  "pesticideActive": false
}
```

### Sample Response — AI Recommendation

```json
GET /api/ai/recommendation?deviceId=farm-node-001
{
  "recommendation": "HOLD_IRRIGATION",
  "reason": "Heavy rain (12mm) expected in next 6 hours",
  "confidence": 0.87,
  "nextCheck": "2024-12-15T14:00:00Z"
}
```

---

## 🗺️ Roadmap

- [x] Working hardware prototype
- [x] Cloud backend deployed
- [x] Live dashboard
- [x] Auto-irrigation logic
- [x] Manual pesticide pump
- [x] AI weather prediction integration
- [ ] SMS alert fallback (Twilio integration)
- [ ] Kinyarwanda language support
- [ ] Native Android app
- [ ] On-device ML anomaly detection
- [ ] Camera-based disease detection (computer vision)
- [ ] Multi-device fleet management for districts
- [ ] LoRaWAN gateway for off-grid schools

---

## 💰 Grant & Funding Opportunity

> ### *We are actively seeking grants, partners, and sponsors to scale Smart Harvest from working prototype to thousands of school gardens across Sub-Saharan Africa.*

### What We've Achieved So Far (with $0 in external funding)

- ✅ Fully working hardware prototype
- ✅ Open-source codebase deployed and live
- ✅ AI-driven irrigation logic
- ✅ Cloud backend + responsive web dashboard
- ✅ Field-tested in a controlled garden setting
- ✅ Demo video and documentation

### What Funding Will Unlock

| Funding Tier | What It Enables |
|---|---|
| 🥉 **$2,500** | Deploy in 5 pilot schools + teacher training in Rwanda |
| 🥈 **$10,000** | Expand to 15 schools, full curriculum dev, 6-month impact study |
| 🥇 **$57,500** | 50 schools, local manufacturing partnership, mobile app |

### Why Smart Harvest Deserves Funding

1. ✅ **Already working** — not just a concept on paper. We have a deployed, tested system.
2. ✅ **Open-source** — every dollar invested benefits *every* school that adopts it, forever.
3. ✅ **Multi-impact** — addresses climate, food security, AND education simultaneously.
4. ✅ **Locally sustainable** — uses widely-available components, designed for local repair.
5. ✅ **Aligned with global priorities** — directly advances 4 UN SDGs.
6. ✅ **Scales economically** — at $45/unit, even modest funding reaches hundreds of schools.


---

## 👥 Team

| Role | Name | Contact |
|---|---|---|
| Founder and Executive Director  | Nnakubulwa Hamidah  | nnakuburwahamidah@gmail.com  |
| Program Manager | Ramadhani Shafii Wanjenja | ramadhanishafiiwanjenja@gmail.com |
| M&E and IT officer | NDATIMANA Emmuel | ndatimana@emf2foundation.org |
| Communication Officer | MWESIGWA Eric | mwesigwaeric57@gmail.com |
| Field Coordinator | UWERA Irene | uwerairene2016@gmail.com |
---

## 🤝 Contributing

We welcome contributions from developers, educators, agricultural specialists, and translators!

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open-source under the **MIT License** — see [LICENSE](LICENSE) for details.

You are free to use, modify, distribute, and build upon this work — including for commercial purposes — as long as you preserve the copyright notice and license.

We *strongly encourage* schools, NGOs, and developers in low-resource regions to copy, adapt, and improve this system for their local context. **That's the whole point.** 🌍

---

## 🙏 Acknowledgments

- **Open-Meteo** for free weather forecasts that make the AI layer possible
- **Render** and **Vercel** for free hosting tiers that lower the barrier to deployment
- **The ESP8266 community** for endless tutorials and library work
- **Schools and farmers in Rwanda** who inspired this project
- All contributors, testers, and supporters

---

<div align="center">

### *"The best time to plant a tree was 20 years ago. The second best time is now — and now we can do it with data."*

**SMART HARVEST** — *Building a climate-resilient future, one school garden at a time.* 🌱

[⬆ Back to top](#-smart-harvest)

</div>