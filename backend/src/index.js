require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const pool = require('./config/database');
const { startKeepAlive } = require('./keepalive');

const app = express();

// Fix CORS — allow all origins for now
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
}));

app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/investor', require('./routes/investor'));
app.use('/api/admin', require('./routes/admin'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 4000;

async function initDB() {
  try {
    const schema = fs.readFileSync(path.join(__dirname, 'config', 'schema.sql'), 'utf8');
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    for (const stmt of statements) {
      try {
        await pool.query(stmt);
      } catch (e) {
        if (!e.message.includes('already exists') && !e.message.includes('must be owner')) {
          console.warn('Schema warning:', e.message);
        }
      }
    }
    console.log('✅ Database ready');
  } catch (err) {
    console.error('❌ DB init error:', err.message);
  }
}

async function start() {
  await initDB();
  app.listen(PORT, () => {
    console.log(`🚀 Capital System API running on http://localhost:${PORT}`);
    startKeepAlive();
  });
}

start();
