const path = require('path');
const fs = require('fs');

// Carregar .env manualmente
const envPath = path.join(__dirname, '.env');
const envVars = {};
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const idx = line.indexOf('=');
    if (idx > 0) {
      const key = line.substring(0, idx).trim();
      const value = line.substring(idx + 1).trim();
      if (key) envVars[key] = value;
    }
  });
}

// Aceitar certificado R2
envVars.NODE_TLS_REJECT_UNAUTHORIZED = '0';

module.exports = {
  apps: [{
    name: 'flowclik',
    script: 'dist/index.js',
    cwd: '/var/www/flowclik',
    interpreter: '/usr/bin/node',
    env: envVars,
    watch: false,
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    max_memory_restart: '500M'
  }]
};
