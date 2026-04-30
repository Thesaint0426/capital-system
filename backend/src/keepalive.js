const https = require('https');

const BACKEND_URL = process.env.RENDER_EXTERNAL_URL || 'https://capital-backend-lban.onrender.com';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://capital-frontend.onrender.com';

function pingUrl(url, label) {
  https.get(url, (res) => {
    console.log(`🏓 Keep-alive [${label}]: ${res.statusCode} at ${new Date().toISOString()}`);
  }).on('error', (err) => {
    console.log(`⚠️ Keep-alive [${label}] failed: ${err.message}`);
  });
}

function startKeepAlive() {
  if (process.env.NODE_ENV === 'production') {
    console.log('🏓 Keep-alive service started — pinging every 14 minutes');
    
    // Initial pings after 30 seconds
    setTimeout(() => {
      pingUrl(BACKEND_URL + '/health', 'backend');
      pingUrl(FRONTEND_URL, 'frontend');
    }, 30000);

    // Ping both every 14 minutes
    setInterval(() => {
      pingUrl(BACKEND_URL + '/health', 'backend');
      pingUrl(FRONTEND_URL, 'frontend');
    }, 14 * 60 * 1000);
  }
}

module.exports = { startKeepAlive };
