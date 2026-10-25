# Greenhouse Care System — API Specification

## 1. Overview

The Greenhouse Care System API connects the ESP32 sensor device to a Node.js and Express backend. It provides live sensor readings to the web dashboard and stores periodic readings in an SQLite database.

**Base URL (local network):** `http://<SERVER_IP>:3000`

**Content type:** `application/json`

## 2. Authentication

The `POST /api/readings` endpoint requires an API key in the HTTP request header.

| Header | Value |
|---|---|
| `x-api-key` | Your configured API key |

The server reads the key from the `GREENHOUSE_API_KEY` environment variable. If that variable is not configured, the code uses `change-this-key` as a fallback.

Keep the actual API key private. The `GET /api/latest` and `GET /api/history` endpoints do not require authentication in the current implementation.

## 3. API Endpoints

### 3.1 Get Latest Sensor Reading

**Method:** `GET`  
**Endpoint:** `/api/latest`  
**Authentication:** Not required

Returns the latest sensor values held in server memory. These values are updated whenever the server accepts a new sensor reading.

**Example request:**

```http
GET /api/latest HTTP/1.1
Host: localhost:3000
```

**Example successful response — HTTP 200:**

```json
{
  "id": 12,
  "temperature": 27.8,
  "humidity": 84,
  "water_level": 150,
  "fan_status": "OFF",
  "low_water": 1,
  "created_at": "2026-10-25T02:42:30.000Z"
}
```

The values above are illustrative examples, not actual sensor measurements.

**Response behavior:**
- Returns the latest reading as a JSON object.
- Returns `null` if no reading is available in memory or the database.
- The `id` may refer to the latest saved history record, while the other fields reflect the newest accepted reading.

### 3.2 Get Sensor History

**Method:** `GET`  
**Endpoint:** `/api/history`  
**Authentication:** Not required

Returns the 50 most recent readings saved in the SQLite database, ordered from newest to oldest.

**Example request:**

```http
GET /api/history HTTP/1.1
Host: localhost:3000
```

**Example successful response — HTTP 200:**

```json
[
  {
    "id": 12,
    "temperature": 27.8,
    "humidity": 84,
    "water_level": 150,
    "fan_status": "OFF",
    "low_water": 1,
    "created_at": "2026-10-25 02:42:30"
  }
]
```

The example contains one record for readability. The actual response can contain up to 50 records or an empty array if no history has been saved.

### 3.3 Submit Sensor Reading

**Method:** `POST`  
**Endpoint:** `/api/readings`  
**Authentication:** Required — API key

Receives sensor data from the ESP32, updates the latest reading used by the dashboard, and periodically saves readings to the SQLite database.

**Required headers:**

```http
Content-Type: application/json
x-api-key: YOUR_API_KEY
```

**Request body:**

```json
{
  "temperature": 27.8,
  "humidity": 84,
  "water_level": 150,
  "fan_status": "OFF",
  "low_water": 1
}
```

**Field descriptions:**

| Field | Data type | Description |
|---|---|---|
| `temperature` | Number | Temperature reading |
| `humidity` | Number | Relative humidity reading |
| `water_level` | Number | Water sensor reading |
| `fan_status` | String | Current fan status |
| `low_water` | Number | Low-water indicator |

The server validates the data types but does not enforce numerical ranges or restrict the allowed strings for `fan_status`.

**Successful response — HTTP 200:**

```json
{
  "success": true,
  "message": "Live reading received"
}
```

**History saving behavior:**
- The first accepted reading is saved immediately, provided database insertion succeeds.
- Subsequent readings are saved no more than once every 60 seconds.
- Accepted readings update the live dashboard even when they are not saved as new history records.

## 4. HTTP Status Codes and Errors

| Status code | Meaning | Example response |
|---|---|---|
| `200 OK` | Request succeeded | `{"success":true,"message":"Live reading received"}` |
| `400 Bad Request` | Required sensor fields have incorrect or missing data types | `{"success":false,"message":"Invalid sensor data"}` |
| `401 Unauthorized` | API key is missing or invalid | `{"success":false,"message":"Unauthorized: Invalid or missing API key"}` |
| `500 Internal Server Error` | Database processing failed while handling a reading | `{"success":false,"message":"Failed to process reading"}` |

The `400`, `401`, and `500` examples apply to the `POST /api/readings` endpoint. The `GET` endpoints currently return their data directly without custom error responses.

## 5. Data Storage

Sensor history is stored in the `readings` SQLite table.

| Column | Type | Description |
|---|---|---|
| `id` | Integer | Automatically generated record ID |
| `temperature` | Real | Temperature |
| `humidity` | Real | Humidity |
| `water_level` | Integer | Water sensor reading |
| `fan_status` | Text | Fan status |
| `low_water` | Integer | Low-water indicator |
| `created_at` | Date/time | Database-generated timestamp |

The database is created automatically if it does not exist. The history endpoint retrieves at most 50 records per request.

## 6. Security Considerations

- Configure `GREENHOUSE_API_KEY` with a strong, private value.
- Do not publish real API keys in source code, screenshots, or public documentation.
- The current API protects sensor submissions but leaves the read endpoints publicly accessible to clients that can reach the server.
- Use a trusted network and consider HTTPS and authentication for read endpoints before deployment outside a local network.
- Do not commit the live `greenhouse.db` file if it contains data you do not want to publish.

## 7. Current Limitations

- The API does not use JWT authentication; it uses a shared API key for sensor submissions.
- The API does not implement pagination for history; it returns the latest 50 saved records.
- The backend validates field types but does not validate sensor value ranges.
- The live dashboard reading and the saved history record may not have identical timestamps or IDs because history is saved less frequently than live readings.

