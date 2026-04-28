const https = require('https');

const BACKEND_URL = process.env.RENDER_EXTERNAL_URL || 'https://capital-backend-lban.onrender.com';

function ping() {
  const url = BACKEND_URL + '/health';
  https.get(url, (res) => {
    console.log(`🏓 Keep-alive ping: ${res.statusCode} at ${new Date().toISOString()}`);
  }).on('error', (err) => {
    console.log(`⚠️ Keep-alive ping failed: ${err.message}`);
  });
}

function startKeepAlive() {
  if (process.env.NODE_ENV === 'production') {
    console.log('🏓 Keep-alive service started — pinging every 14 minutes');
    setTimeout(ping, 30000);
    setInterval(ping, 14 * 60 * 1000);
  }
}

module.exports = { startKeepAlive };
