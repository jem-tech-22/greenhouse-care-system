# Greenhouse Care System — Testing Guide

## 1. Purpose

This document describes how to test the Greenhouse Care System API and verify that it returns sensor readings correctly.

## 2. Prerequisites

Before testing, make sure:

- Node.js and the project dependencies are installed.
- The project server can start using `node server.js`.
- The server is accessible at `http://localhost:3000`.
- An API client, such as a browser or Postman, is available.

## 3. Start the Server

Open a terminal in the project directory and run:

```bash
node server.js
```

Expected result: the terminal displays a message indicating that the Greenhouse server is running on port 3000.

Keep the terminal open while testing.

## 4. Test the Latest Reading

**Endpoint:** `GET /api/latest`

Open this URL in your browser:

`http://localhost:3000/api/latest`

Expected result: the endpoint returns the latest available reading as JSON. If no reading has been saved or received, the response may be `null`.

## 5. Test Reading History

**Endpoint:** `GET /api/history`

Open this URL in your browser:

`http://localhost:3000/api/history`

Expected result: the endpoint returns a JSON array containing up to 50 of the most recently saved readings. The array may be empty if no readings have been saved.

## 6. Test Sensor Data Submission

**Endpoint:** `POST /api/readings`

This endpoint requires the `x-api-key` request header and a JSON body.

Required fields:

- `temperature`: number
- `humidity`: number
- `water_level`: number
- `fan_status`: string
- `low_water`: number

Example JSON body:

```json
{
  "temperature": 30.5,
  "humidity": 75,
  "water_level": 350,
  "fan_status": "OFF",
  "low_water": 0
}
```

Use the API key configured for the server. The default key is `change-this-key` unless `GREENHOUSE_API_KEY` is configured.

Expected success response:

```json
{
  "success": true,
  "message": "Live reading received"
}
```

The example data is for testing only and does not represent actual sensor measurements.

## 7. Expected Error Responses

| Status | Meaning |
|---|---|
| 400 Bad Request | One or more required fields have an invalid type. |
| 401 Unauthorized | The API key is missing or incorrect. |
| 500 Internal Server Error | The server encountered a database error while processing the submission. |

## 8. History Saving Behavior

The server updates the latest live reading whenever valid sensor data is received.

It saves a history record on the first accepted reading after server startup, then saves no more than once per 60 seconds while the server remains running.

The history endpoint returns up to 50 saved records.

## 9. Safety Notes

- Do not commit the local `greenhouse.db` file unless intentionally required.
- Do not publish a real API key in public documentation.
- Use actual ESP32 readings when verifying hardware integration.
- Example sensor values in this guide are illustrative only.