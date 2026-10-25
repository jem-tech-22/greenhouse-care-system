
#include <DHT.h>
#include <SoftwareSerial.h>

#define DHTPIN A0
#define DHTTYPE DHT11
#define WATER_PIN A1
#define BUZZER_PIN 8
#define LOW_WATER_THRESHOLD 191

// Arduino D10 = RX, D11 = TX
SoftwareSerial espSerial(10, 11);
DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(9600);
  espSerial.begin(9600);

  dht.begin();
  pinMode(BUZZER_PIN, OUTPUT);

  Serial.println("GREENHOUSE SYSTEM READY");
}

void loop() {
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();
  int waterLevel = analogRead(WATER_PIN);

  if (waterLevel < LOW_WATER_THRESHOLD) {
    tone(BUZZER_PIN, 2000);
    delay(50);
    noTone(BUZZER_PIN);
  } else {
    noTone(BUZZER_PIN);
  }

  if (!isnan(temperature) && !isnan(humidity)) {
    // Send readings to ESP32
    espSerial.print("TEMP:");
    espSerial.print(temperature);
    espSerial.print(",HUM:");
    espSerial.print(humidity);
    espSerial.print(",WATER:");
    espSerial.println(waterLevel);

    // Show readings in Serial Monitor
    Serial.print("TEMP:");
    Serial.print(temperature);
    Serial.print(",HUM:");
    Serial.print(humidity);
    Serial.print(",WATER:");
    Serial.println(waterLevel);
  } else {
    Serial.println("DHT11 READ FAILED");
  }

  delay(2000);
}
