# Greenhouse Care System

## Overview

The Greenhouse Care System is an Arduino and ESP32-based project designed to monitor greenhouse conditions and support automated plant care. It measures temperature, humidity, and water reservoir levels, while providing sensor data to a web dashboard.

## Features

- Temperature and humidity monitoring using a DHT11 sensor
- Water reservoir level monitoring
- Automatic fan control for cooling
- Buzzer alert for low water levels
- LCD display for local readings
- ESP32 Wi-Fi communication with a backend server
- Web dashboard for live readings and sensor history
- SQLite database for storing sensor readings
- API key authentication for sensor data submissions

## Technologies Used

- Arduino Uno
- ESP32
- Arduino IDE
- Node.js
- Express.js
- SQLite
- HTML, CSS, and JavaScript

## Project Structure

- `Greenhouse Care System/` — Main project folder containing the backend and frontend
- `package-lock.json` — Node.js dependency lockfile

The dashboard files are located in the `public/` folder.

## Setup and Installation

1. Install Node.js.
2. Clone or download this repository.
3. Open a terminal in the `Greenhouse Care System` folder.
4. Install the project dependencies:

   `npm install`

5. Configure the backend settings, including the API key and ESP32 server address.
6. Start the backend:

   `node server.js`

7. Open `http://localhost:3000` in your browser.

## Hardware

The project uses an Arduino Uno and ESP32 with a DHT11 temperature and humidity sensor, a water-level sensor, a buzzer, an LCD1602 I²C display, a relay, and a DC fan motor.

## Security

The sensor submission endpoint uses API key authentication through the `x-api-key` HTTP request header. Keep the actual API key private and do not publish it in this repository.

## Project Status

The project is under development. Hardware integration, dashboard functionality, and testing should be verified on the actual system before final deployment.
