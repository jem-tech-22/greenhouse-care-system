
#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

const char* ssid = "test";
const char* password = "123456789";

const char* serverURL =
  "http://10.25.175.9:3000/api/readings";

// Must match the API key configured in server.js
const char* apiKey = "change-this-key";

#define RELAY_PIN 23
#define RELAY_ON LOW
#define RELAY_OFF HIGH

#define LOW_WATER_THRESHOLD 191

LiquidCrystal_I2C lcd(0x27, 16, 2);

String receivedData = "";
unsigned long lastSendTime = 0;
unsigned long lastWiFiRetry = 0;

const unsigned long WIFI_RETRY_INTERVAL = 10000;

float temperature = 0;
float humidity = 0;
int waterLevel = 0;
bool hasReading = false;
bool fanOn = false;

void printWiFiStatus() {
  Serial.print("WiFi status: ");
  Serial.println(WiFi.status());

  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
}

void setup() {
  Serial.begin(115200);

  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, RELAY_OFF);

  // Receive Arduino data on GPIO16; transmit on GPIO17
  Serial2.begin(9600, SERIAL_8N1, 16, 17);

  Wire.begin(21, 22);
  lcd.init();
  lcd.backlight();
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("GREENHOUSE");
  lcd.setCursor(0, 1);
  lcd.print("Connecting WiFi");

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  int attempts = 0;

  while (WiFi.status() != WL_CONNECTED &&
         attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWi-Fi CONNECTED!");
  } else {
    Serial.println("\nWi-Fi connection failed");
  }

  printWiFiStatus();
  lastWiFiRetry = millis();

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("GREENHOUSE");
  lcd.setCursor(0, 1);
  lcd.print("System Ready");
  delay(1000);
  lcd.clear();
}

void loop() {
  // Receive sensor readings from Arduino
  while (Serial2.available()) {
    char c = Serial2.read();

    if (c == '\n') {
      receivedData.trim();

      int humPos = receivedData.indexOf(",HUM:");
      int waterPos = receivedData.indexOf(",WATER:");

      if (receivedData.startsWith("TEMP:") &&
          humPos > 0 && waterPos > humPos) {

        temperature =
          receivedData.substring(5, humPos).toFloat();

        humidity =
          receivedData.substring(humPos + 5, waterPos).toFloat();

        waterLevel =
          receivedData.substring(waterPos + 7).toInt();

        hasReading = true;

        // Fan ON at 31°C or higher
        fanOn = (temperature >= 31.0);
        digitalWrite(RELAY_PIN,
                     fanOn ? RELAY_ON : RELAY_OFF);

        // Update LCD
        lcd.setCursor(0, 0);
        lcd.print("T:");
        lcd.print(temperature, 1);
        lcd.print("C H:");
        lcd.print(humidity, 0);
        lcd.print("%  ");

        lcd.setCursor(0, 1);
        lcd.print("Water:");
        lcd.print(waterLevel);
        lcd.print(" Fan:");
        lcd.print(fanOn ? "ON " : "OFF");

        Serial.println(receivedData);
        Serial.print("Fan status: ");
        Serial.println(fanOn ? "ON" : "OFF");
      }

      receivedData = "";
    } else {
      receivedData += c;

      if (receivedData.length() > 100) {
        receivedData = "";
      }
    }
  }

  // Retry Wi-Fi every 10 seconds when disconnected
  if (WiFi.status() != WL_CONNECTED &&
      millis() - lastWiFiRetry >= WIFI_RETRY_INTERVAL) {

    lastWiFiRetry = millis();
    Serial.println("Retrying Wi-Fi connection...");
    WiFi.reconnect();
    printWiFiStatus();
  }

  // Send readings to the backend every 3 seconds
  if (hasReading &&
      WiFi.status() == WL_CONNECTED &&
      millis() - lastSendTime >= 3000) {

    lastSendTime = millis();

    HTTPClient http;
    http.begin(serverURL);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("x-api-key", apiKey);

    String payload = "{";
    payload += "\"temperature\":" + String(temperature, 1) + ",";
    payload += "\"humidity\":" + String(humidity, 1) + ",";
    payload += "\"water_level\":" + String(waterLevel) + ",";
    payload += "\"fan_status\":\"";
    payload += (fanOn ? "ON" : "OFF");
    payload += "\",";
    payload += "\"low_water\":";
    payload += (waterLevel < LOW_WATER_THRESHOLD ? "1" : "0");
    payload += "}";

    int httpCode = http.POST(payload);

    Serial.print("Website HTTP response: ");
    Serial.println(httpCode);

    if (httpCode > 0) {
      Serial.println(http.getString());
    } else {
      Serial.println(http.errorToString(httpCode));
    }

    http.end();
  }
}
  