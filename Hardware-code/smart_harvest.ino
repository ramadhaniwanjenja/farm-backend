/*
 *  SMART FARM NODE v1.0
 *  ESP8266 + DHT22 + pH + Moisture + 2 Relay Pumps
 *  
 *  WIRING:
 *    pH sensor       -> A0
 *    Moisture (DO)   -> D1 (GPIO5)
 *    DHT22 DATA      -> D2 (GPIO4)  + 10k pull-up to 3.3V
 *    IRRIGATION RELAY IN -> D5 (GPIO14)
 *    PESTICIDE  RELAY IN -> D6 (GPIO12)
 *    Relay VCC -> Vin (5V)  |  GND -> GND
 *  
 *  Most relay modules are ACTIVE LOW. If yours is active high,
 *  swap RELAY_ON and RELAY_OFF below.
 */

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>
#include <DHT.h>

// ===== WIFI =====
const char* ssid     = "Twinnie";
const char* password = "1234567890";

// ===== API ===== (you'll fill these in after deployment)
const char* apiSendUrl  = "https://farm-backend-lyax.onrender.com/api/iot/data";
const char* apiPumpUrl  = "https://farm-backend-lyax.onrender.com/api/iot/pump-status";

String deviceId = "farm-node-001";

// ===== PINS =====
const int pH_Pin             = A0;
const int moistureDigitalPin = 5;   // D1
const int dhtPin             = 4;   // D2
const int relayIrrigationPin = 14;  // D5
const int relayPesticidePin  = 12;  // D6

#define RELAY_ON  LOW
#define RELAY_OFF HIGH

#define DHTTYPE DHT22
DHT dht(dhtPin, DHTTYPE);

// ===== SETTINGS =====
float calibrationOffset = 0.00;
const int numReadings   = 10;
const int WET_SIGNAL    = LOW;
const int DRY_THRESHOLD = 40;
const unsigned long IRRIGATION_DURATION_MS = 10000;  // pump runs 10s
const unsigned long SEND_INTERVAL_MS = 30000;
const unsigned long PUMP_POLL_MS     = 5000;

unsigned long lastSendTime = 0;
unsigned long lastPumpPollTime = 0;
unsigned long irrigationStartTime = 0;
bool irrigationActive = false;
bool pesticideActive  = false;

void setup() {
  Serial.begin(115200);
  pinMode(moistureDigitalPin, INPUT);
  pinMode(relayIrrigationPin, OUTPUT);
  pinMode(relayPesticidePin,  OUTPUT);
  digitalWrite(relayIrrigationPin, RELAY_OFF);
  digitalWrite(relayPesticidePin,  RELAY_OFF);
  dht.begin();

  Serial.println("\nConnecting to WiFi...");
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }
  Serial.println("\nConnected! IP: " + WiFi.localIP().toString());
}

float readPHSensor() {
  long raw = 0;
  for (int i = 0; i < numReadings; i++) { raw += analogRead(pH_Pin); delay(10); }
  raw /= numReadings;
  float voltage = raw * (3.3 / 1023.0);
  float pH = 3.5 * voltage + calibrationOffset;
  if (pH < 0) pH = 0; if (pH > 14) pH = 14;
  return pH;
}

int readMoisture() {
  int wet = 0;
  for (int i = 0; i < 5; i++) { if (digitalRead(moistureDigitalPin) == WET_SIGNAL) wet++; delay(20); }
  return (wet >= 3) ? 85 : 25;
}

void readDHT22(float &t, float &h) {
  t = dht.readTemperature(); h = dht.readHumidity();
  if (isnan(t) || isnan(h)) { t = 25.0; h = 60.0; }
}

void handleIrrigation(int soil) {
  if (soil < DRY_THRESHOLD && !irrigationActive) {
    Serial.println("Soil DRY -> irrigation ON");
    digitalWrite(relayIrrigationPin, RELAY_ON);
    irrigationActive = true;
    irrigationStartTime = millis();
  }
  if (irrigationActive && (millis() - irrigationStartTime >= IRRIGATION_DURATION_MS)) {
    digitalWrite(relayIrrigationPin, RELAY_OFF);
    irrigationActive = false;
    Serial.println("Irrigation OFF");
  }
}

void pollPesticidePump() {
  if (WiFi.status() != WL_CONNECTED) return;
  
  WiFiClientSecure client;
  client.setInsecure();
  HTTPClient http;
  String url = String(apiPumpUrl) + "?deviceId=" + deviceId;
  
  if (!http.begin(client, url)) return;
  int code = http.GET();
  if (code == 200) {
    String body = http.getString();
    StaticJsonDocument<128> doc;
    if (!deserializeJson(doc, body)) {
      bool wantOn = doc["pesticidePump"] | false;
      if (wantOn != pesticideActive) {
        pesticideActive = wantOn;
        digitalWrite(relayPesticidePin, wantOn ? RELAY_ON : RELAY_OFF);
        Serial.println(wantOn ? "Pesticide ON" : "Pesticide OFF");
      }
    }
  }
  http.end();
}

bool sendToAPI(int soil, float t, float h, float pH) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ WiFi not connected");
    return false;
  }

  WiFiClientSecure client;
  client.setInsecure();      // skip cert verification (fine for hobby projects)
  HTTPClient http;
  
  Serial.print("→ POST to: ");
  Serial.println(apiSendUrl);

  if (!http.begin(client, apiSendUrl)) {
    Serial.println("❌ http.begin failed");
    return false;
  }
  http.addHeader("Content-Type", "application/json");

  StaticJsonDocument<256> doc;
  doc["deviceId"]         = deviceId;
  doc["soilMoisture"]     = soil;
  doc["temperature"]      = t;
  doc["humidity"]         = h;
  doc["pH"]               = pH;
  doc["irrigationActive"] = irrigationActive;
  doc["pesticideActive"]  = pesticideActive;

  String body;
  serializeJson(doc, body);
  Serial.println("→ Body: " + body);

  int code = http.POST(body);
  String response = http.getString();

  Serial.print("← HTTP code: ");
  Serial.println(code);
  Serial.print("← Response : ");
  Serial.println(response);

  http.end();
  return (code == 200 || code == 201);
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) { WiFi.reconnect(); delay(2000); return; }

  if (millis() - lastSendTime >= SEND_INTERVAL_MS || lastSendTime == 0) {
    lastSendTime = millis();
    float pH = readPHSensor();
    int soil = readMoisture();
    float t, h; readDHT22(t, h);
    Serial.printf("pH=%.2f Soil=%d T=%.1f H=%.1f Irr=%d Pst=%d\n",
                  pH, soil, t, h, irrigationActive, pesticideActive);
    handleIrrigation(soil);
    sendToAPI(soil, t, h, pH);
  }

  if (irrigationActive && (millis() - irrigationStartTime >= IRRIGATION_DURATION_MS)) {
    digitalWrite(relayIrrigationPin, RELAY_OFF);
    irrigationActive = false;
  }

  if (millis() - lastPumpPollTime >= PUMP_POLL_MS) {
    lastPumpPollTime = millis();
    pollPesticidePump();
  }
  if (sendToAPI(soil, t, h, pH)) {
  Serial.println("✅ Sent OK");
} else {
  Serial.println("❌ Send failed");
}
}