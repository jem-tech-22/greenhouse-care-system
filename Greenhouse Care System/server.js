const express = require("express");
const Database = require("better-sqlite3");

const app = express();
const PORT = 3000;
const HISTORY_INTERVAL = 60 * 1000;

// API key authentication
const API_KEY =
  process.env.GREENHOUSE_API_KEY || "change-this-key";

app.use(express.json());
app.use(express.static("public"));

const db = new Database("greenhouse.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS readings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    temperature REAL,
    humidity REAL,
    water_level INTEGER,
    fan_status TEXT,
    low_water INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

const insertReading = db.prepare(`
  INSERT INTO readings
  (temperature, humidity, water_level, fan_status, low_water)
  VALUES (?, ?, ?, ?, ?)
`);

const getLatestSaved = db.prepare(`
  SELECT * FROM readings
  ORDER BY id DESC
  LIMIT 1
`);

const getHistory = db.prepare(`
  SELECT id, temperature, humidity, water_level,
         fan_status, low_water, created_at
  FROM readings
  ORDER BY id DESC
  LIMIT 50
`);

let latestReading = getLatestSaved.get() || null;
let lastHistorySaveAt = 0;

// Receive live readings from ESP32
app.post("/api/readings", (req, res) => {
  const providedKey = req.get("x-api-key");

  if (providedKey !== API_KEY) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid or missing API key"
    });
  }

  const {
    temperature,
    humidity,
    water_level,
    fan_status,
    low_water
  } = req.body;

  if (
    typeof temperature !== "number" ||
    typeof humidity !== "number" ||
    typeof water_level !== "number" ||
    typeof fan_status !== "string" ||
    typeof low_water !== "number"
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid sensor data"
    });
  }

  const now = Date.now();

  // Keep the newest sensor values in memory for the live dashboard.
  latestReading = {
    ...(latestReading || {}),
    temperature,
    humidity,
    water_level,
    fan_status,
    low_water,
    created_at: new Date(now).toISOString()
  };

  try {
    // Save history immediately on the first reading,
    // then save at most once every 60 seconds.
    if (
      lastHistorySaveAt === 0 ||
      now - lastHistorySaveAt >= HISTORY_INTERVAL
    ) {
      insertReading.run(
        temperature,
        humidity,
        water_level,
        fan_status,
        low_water
      );

      lastHistorySaveAt = now;
      latestReading = {
        ...latestReading,
        id: Number(db.prepare(
          "SELECT last_insert_rowid() AS id"
        ).get().id)
      };

      console.log("History reading saved.");
    }

    res.json({
      success: true,
      message: "Live reading received"
    });
  } catch (error) {
    console.error("Database error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to process reading"
    });
  }
});

// Get the newest live sensor values
app.get("/api/latest", (req, res) => {
  res.json(latestReading);
});

// Get saved history records
app.get("/api/history", (req, res) => {
  res.json(getHistory.all());
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `Greenhouse server running at http://localhost:${PORT}`
  );
  console.log("API key authentication enabled.");
  console.log("History saving interval: 60 seconds.");
});