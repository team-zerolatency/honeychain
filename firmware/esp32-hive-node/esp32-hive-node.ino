#include <WiFi.h>
#include <PubSubClient.h>
#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BME280.h>
#include <HX711.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <ArduinoJson.h>

// ---- Fill these in once you have hardware + credentials ----
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
const char* MQTT_BROKER = "192.168.1.X"; // your machine's LAN IP running Mosquitto
const int   MQTT_PORT = 1883;
const char* HIVE_CODE = "HIVE-001"; // MUST match a real hiveCode created in the dashboard

// ---- Pin mapping — exactly matching your circuit diagram ----
#define BME_SDA 21
#define BME_SCL 22
#define HX711_DT 19
#define HX711_SCK 18
#define MIC_PIN 34

// ---- HX711 calibration — set once you have the load cell in hand ----
// Procedure: 1) tare with nothing on the load cell, 2) place a known weight (e.g. 1kg),
// 3) note the raw reading, 4) CALIBRATION_FACTOR = rawReading / knownWeightKg
float CALIBRATION_FACTOR = 2280.0; // placeholder — recalculate with a real known weight

Adafruit_BME280 bme;
HX711 scale;
Adafruit_SSD1306 display(128, 64, &Wire, -1);
WiFiClient espClient;
PubSubClient mqttClient(espClient);

const unsigned long READ_INTERVAL_MS = 30000; // every 30s
unsigned long lastReadTime = 0;

void connectWifi() {
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println(" connected.");
}

void connectMqtt() {
  while (!mqttClient.connected()) {
    Serial.print("Connecting to MQTT broker...");
    if (mqttClient.connect(HIVE_CODE)) {
      Serial.println(" connected.");
    } else {
      Serial.print(" failed, rc="); Serial.print(mqttClient.state());
      Serial.println(" retrying in 3s");
      delay(3000);
    }
  }
}

void updateDisplay(float temp, float hum, float weight, float acoustic) {
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 0);
  display.println("Honey Chain");
  display.print("Temp: "); display.print(temp, 1); display.println(" C");
  display.print("Hum : "); display.print(hum, 0); display.println(" %");
  display.print("Wt  : "); display.print(weight, 1); display.println(" kg");
  display.print("WiFi: "); display.println(WiFi.status() == WL_CONNECTED ? "OK" : "--");
  display.print("MQTT: "); display.println(mqttClient.connected() ? "OK" : "--");
  display.display();
}

void setup() {
  Serial.begin(115200);
  Wire.begin(BME_SDA, BME_SCL);

  if (!bme.begin(0x76)) {
    Serial.println("BME280 not found — check wiring.");
  }

  scale.begin(HX711_DT, HX711_SCK);
  scale.set_scale(CALIBRATION_FACTOR);
  scale.tare(); // zero the scale — do this with nothing on the load cell

  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("OLED not found — check wiring.");
  }
  display.clearDisplay();
  display.display();

  connectWifi();
  mqttClient.setServer(MQTT_BROKER, MQTT_PORT);
}

void loop() {
  if (!mqttClient.connected()) connectMqtt();
  mqttClient.loop();

  if (millis() - lastReadTime >= READ_INTERVAL_MS) {
    lastReadTime = millis();

    float temperature = bme.readTemperature();
    float humidity = bme.readHumidity();
    float weight = scale.get_units(5); // average of 5 readings

    // Placeholder acoustic score — real feature extraction (MFCC etc.) happens server-side
    // in Phase 17; this just normalizes a raw analog read to a rough 0-1 activity signal.
    int rawMic = analogRead(MIC_PIN);
    float acousticScore = constrain(rawMic / 4095.0, 0.0, 1.0);

    StaticJsonDocument<256> doc;
    doc["temperature"] = temperature;
    doc["humidity"] = humidity;
    doc["weight"] = weight;
    doc["acousticScore"] = acousticScore;
    doc["timestamp"] = "1970-01-01T00:00:00.000Z"; // ESP32 has no RTC by default —
    // the ingestion service will need a real timestamp; simplest fix once hardware is up:
    // sync via NTP (WiFi.h supports this) and format properly, OR let the backend stamp
    // arrival time server-side instead of trusting the device clock. Flag this when we
    // wire the real device — don't ship the placeholder above as-is.

    char payload[256];
    serializeJson(doc, payload);

    String topic = String("honeychain/hives/") + HIVE_CODE + "/sensors";
    mqttClient.publish(topic.c_str(), payload);

    updateDisplay(temperature, humidity, weight, acousticScore);
    Serial.println(payload);
  }
}