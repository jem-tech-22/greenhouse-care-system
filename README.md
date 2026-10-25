# Greenhouse Care System

## 1. Overview

The Greenhouse Care System is an Arduino Uno and ESP32-based project designed to monitor greenhouse conditions and support automated plant care. It measures temperature, humidity, and water reservoir levels, controls a cooling fan, and sends sensor readings to a web dashboard for monitoring and historical data storage.

## 2. Features

* Temperature and humidity monitoring using a DHT11 sensor
* Water reservoir level monitoring
* Automatic fan control based on temperature
* Buzzer alert for low water levels
* LCD1602 I²C display for local readings
* ESP32 Wi-Fi communication with a backend server
* Web dashboard for live readings and sensor history
* SQLite database for storing sensor readings
* API key authentication for sensor data submissions

## 3. Technologies Used

### Hardware

* Arduino Uno R3
* ESP32 development board
* DHT11 temperature and humidity sensor
* Water-level sensor
* Buzzer
* LCD1602 I²C display
* Single-channel 5 V relay module
* DC fan motor

### Software

* Arduino IDE
* Node.js
* Express.js
* SQLite
* HTML, CSS, and JavaScript

## 4. Project Structure

The project contains the backend server and frontend dashboard.

* `server.js` — backend server entry point
* `public/` — frontend dashboard files
* `package.json` — Node.js project information and dependencies
* `package-lock.json` — locked dependency versions
* `greenhouse.db` — SQLite database created or used by the backend

The exact files may vary depending on the current repository contents.

## 5. Hardware Wiring

Disconnect power before changing any wiring. Confirm the pin assignments against your actual firmware and physical connections before powering the system.

### Arduino Uno Connections

| Component                 | Arduino Pin |
| ------------------------- | ----------- |
| DHT11 signal              | A0          |
| Water-level sensor signal | A1          |
| Buzzer signal             | D8          |
| Software serial RX        | D10         |
| Software serial TX        | D11         |

The DHT11 module's power and ground pins should be connected to the appropriate Arduino power and ground pins.

### ESP32 Connections

| Component                      | ESP32 Pin   |
| ------------------------------ | ----------- |
| Relay input                    | GPIO23      |
| LCD SDA                        | GPIO21      |
| LCD SCL                        | GPIO22      |
| Serial data input from Arduino | GPIO16 (RX) |

The LCD I²C address used during setup was `0x27`.

### Arduino-to-ESP32 Communication

* Connect Arduino D11 (TX) to ESP32 GPIO16 (RX) through the 1 kΩ and 2 kΩ voltage divider.
* Connect Arduino GND and ESP32 GND together.
* Ensure the serial communication settings match in both firmware programs.

The voltage divider reduces the Arduino's 5 V TX signal to a level more suitable for the ESP32's 3.3 V input.

### Relay and Fan

The ESP32 controls the relay through GPIO23. Verify the relay's active-low behavior and the motor's power requirements before connecting the fan. Do not power a motor directly from an ESP32 GPIO pin.

## 6. Software Requirements

Install the following before running the project:

1. Node.js and npm.
2. Arduino IDE.
3. ESP32 board support in Arduino IDE.
4. The Arduino libraries required by the firmware, including the DHT and LCD libraries used by the project.

Use the library names and versions compatible with the existing firmware.

## 7. Setup and Installation

### Step 1: Obtain the Repository

Clone or download the repository:

`https://github.com/jem-tech-22/greenhouse-care-system`

Open a terminal in the project folder containing `package.json`.

### Step 2: Install Backend Dependencies

Run:

```bash
npm install
```

### Step 3: Configure the Backend

Check the backend configuration in `server.js`.

* Set the API key to a private value.
* Keep the backend's expected API key and the ESP32's configured API key identical.
* Do not commit real passwords or private API keys to a public repository.

### Step 4: Configure the ESP32

Before uploading the ESP32 firmware:

* Configure the Wi-Fi SSID and password.
* Set the server address to the computer's reachable local network IP address.
* Confirm that the server port and API endpoint match the backend configuration.
* Ensure the computer and ESP32 can communicate over the network.

`localhost` refers to the computer running the browser or server. It should not be used as the ESP32's server address when the ESP32 is a separate device.

## 8. How to Run Each Tier

### Tier 1: Arduino Sensor Controller

1. Connect the Arduino Uno to the computer using a USB data cable.
2. Open the Arduino firmware in Arduino IDE.
3. Select the correct board and serial port.
4. Verify the sensor pin assignments and serial communication settings.
5. Upload the firmware.
6. Open Serial Monitor and check that sensor readings are being produced.

The Arduino reads the sensors and sends the readings to the ESP32 using serial communication.

### Tier 2: ESP32 Communication and Control

1. Connect the ESP32 to the computer using a USB data cable.
2. Open the ESP32 firmware in Arduino IDE.
3. Configure the Wi-Fi credentials and backend server address.
4. Select the correct ESP32 board and serial port.
5. Upload the firmware.
6. Open Serial Monitor and verify Wi-Fi connection and sensor-data transmission.

The ESP32 receives sensor data, manages the connected relay according to the firmware's control logic, and submits readings to the backend.

### Tier 3: Backend and Database

1. Open a terminal in the project folder.

2. Install dependencies if this has not already been done:

   `npm install`

3. Start the server:

   `node server.js`

4. Keep the terminal running while using the dashboard.

5. Confirm that the server starts without errors.

The backend receives authenticated sensor submissions and provides API endpoints for the dashboard.

### Tier 4: Web Dashboard

1. Start the backend using `node server.js`.

2. Open a browser on the computer running the server.

3. Visit:

   `http://localhost:3000`

4. Check that live sensor readings, fan status, water-level information, and historical readings are displayed as implemented.

For access from another device, use the server computer's local network IP address and ensure the network and firewall settings permit the connection.

## 9. API Endpoints

| Method | Endpoint        | Purpose                             | Authentication                       |
| ------ | --------------- | ----------------------------------- | ------------------------------------ |
| GET    | `/api/latest`   | Retrieves the latest sensor reading | Verify current server implementation |
| GET    | `/api/history`  | Retrieves saved sensor history      | Verify current server implementation |
| POST   | `/api/readings` | Submits a sensor reading            | API key through `x-api-key` header   |

The sensor submission endpoint expects JSON data matching the backend's validation rules. Use the existing API specification for exact field names, response examples, and error codes.

## 10. Database

The backend uses SQLite to store sensor history. The dashboard can request saved readings through the history endpoint.

Keep database files and any private configuration out of public commits when they contain information that should not be shared.

## 11. Security

* The sensor submission endpoint uses API key authentication through the `x-api-key` HTTP request header.
* The backend should validate incoming sensor data before storing it.
* Keep API keys and Wi-Fi passwords private.
* Use HTTPS and appropriate network protections if the system is exposed beyond a trusted local network.

## 12. Troubleshooting

### ESP32 cannot connect to Wi-Fi

* Check the SSID and password.
* Confirm that the selected Wi-Fi network is available to the ESP32.

### Dashboard does not load

* Confirm that `node server.js` is running.
* Check the terminal for errors.
* Confirm that the browser is using the correct server address and port.

### No sensor readings appear

* Check the sensor wiring and firmware pin assignments.
* Confirm the Arduino-to-ESP32 serial connection and common ground.
* Verify that the ESP32 is sending data to the correct server address.

### Sensor submissions are rejected

* Confirm that the API key in the ESP32 firmware matches the backend configuration.
* Check the request header and JSON field names.
* Review the backend terminal for validation or database errors.

## 13. Project Status

WORKING! 
