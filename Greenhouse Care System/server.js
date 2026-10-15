const express = require("express");
const Database = require("better-sqlite3");

const app = express();
const PORT = 3000;

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
===================== */

app.post("/api/readings", (req, res) => {
  const {
    temperature,
    humidity,
    water_level,
    fan_status,
    low_water
  } = req.body;

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
});