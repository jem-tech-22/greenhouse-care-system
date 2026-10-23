
const express = require("express");
const Database = require("better-sqlite3");

const app = express();
const PORT = 3000;

// Temporary API key for development.
// The ESP32 must send the same key.
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

/* =====================
   SAVE SENSOR READING
   API KEY AUTHENTICATION
===================== */

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

  // Basic validation
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

  try {
    const insert = db.prepare(`
      INSERT INTO readings
      (temperature, humidity, water_level, fan_status, low_water)
      VALUES (?, ?, ?, ?, ?)
    `);

    insert.run(
      temperature,
      humidity,
      water_level,
      fan_status,
      low_water
    );

    res.json({
      success: true,
      message: "Reading saved"
    });
  } catch (error) {
    console.error("Database error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to save reading"
    });
  }
});

/* =====================
   GET LATEST READING
===================== */

app.get("/api/latest", (req, res) => {
  const reading = db.prepare(`
    SELECT *
    FROM readings
    ORDER BY id DESC
    LIMIT 1
  `).get();

  res.json(reading || null);
});

/* =====================
   GET SENSOR HISTORY
===================== */

app.get("/api/history", (req, res) => {
  const readings = db.prepare(`
    SELECT
      id,
      temperature,
      humidity,
      water_level,
      fan_status,
      low_water,
      created_at
    FROM readings
    ORDER BY id DESC
    LIMIT 50
  `).all();

  res.json(readings);
});

/* =====================
   START SERVER
===================== */

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `Greenhouse server running at http://localhost:${PORT}`
  );
  console.log("API key authentication enabled for POST /api/readings");
});
