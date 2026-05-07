require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const path = require('path');
const pool = require('./config/database');
const { startKeepAlive } = require('./keepalive');

const app = express();

// Rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many login attempts, please try again later.' },
});

app.use(cors({ origin: '*', methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'], allowedHeaders: ['Content-Type','Authorization'] }));
app.options('*', cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(globalLimiter);

app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/investor', require('./routes/investor'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/apply', require('./routes/apply'));

app.get('/health', (req, res) => res.json({ status: 'ok', version: '2.1.0', timestamp: new Date().toISOString() }));
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
app.use((err, req, res, next) => { console.error(err); res.status(500).json({ error: 'Server error' }); });

const PORT = process.env.PORT || 4000;

async function initDB() {
  try {
    const schema = fs.readFileSync(path.join(__dirname, 'config', 'schema.sql'), 'utf8');
    const statements = schema.split(';').map(s => s.trim()).filter(s => s.length > 0 && !s.startsWith('--'));
    for (const stmt of statements) {
      try { await pool.query(stmt); }
      catch (e) { if (!e.message.includes('already exists') && !e.message.includes('must be owner')) console.warn('Schema:', e.message); }
    }
    console.log('✅ Database ready');
  } catch (err) {
    console.error('❌ DB init error:', err.message);
  }
}

async function start() {
  await initDB();
  app.listen(PORT, () => {
    console.log(`🚀 Capital Invest API v2.1 running on port ${PORT}`);
    startKeepAlive();
  });
}

start();
