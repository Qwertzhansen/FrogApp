
import express from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

const db = new sqlite3.Database('./frogtack.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the frogtack database.');
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS profile (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        age INTEGER,
        height INTEGER,
        weight INTEGER,
        gender TEXT,
        activityLevel TEXT,
        goal TEXT,
        bodyFatPercentage REAL,
        bmrMode TEXT,
        manualBmr INTEGER
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS activities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT,
        name TEXT,
        duration INTEGER,
        distance REAL,
        calories INTEGER,
        protein REAL,
        carbs REAL,
        fat REAL,
        timestamp TEXT
    )`);
});

app.get('/api/profile', (req, res) => {
    db.get("SELECT * FROM profile ORDER BY id DESC LIMIT 1", [], (err, row) => {
        if (err) {
            res.status(400).json({"error":err.message});
            return;
        }
        res.json(row);
    });
});

app.get('/api/activities', (req, res) => {
    db.all("SELECT * FROM activities ORDER BY timestamp DESC", [], (err, rows) => {
        if (err) {
            res.status(400).json({"error":err.message});
            return;
        }
        res.json(rows);
    });
});

app.post('/api/activities', (req, res) => {
    const { type, data, timestamp } = req.body;
    const { name, duration, distance, calories, protein, carbs, fat } = data;
    const sql = `INSERT INTO activities (type, name, duration, distance, calories, protein, carbs, fat, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [type, name, duration, distance, calories, protein, carbs, fat, timestamp];
    db.run(sql, params, function(err) {
        if (err) {
            res.status(400).json({"error":err.message});
            return;
        }
        res.json({
            "message":"success",
            "data": req.body,
            "id" : this.lastID
        })
    });
});

// We will add the /api/analyze endpoint later

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
