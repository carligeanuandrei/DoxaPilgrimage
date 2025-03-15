/**
 * Script pentru pornirea serviciului DOXA Platform
 * Acest script pornește doar platforma principală DOXA
 */
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configurăm fișierele de log
const platformLogPath = path.join(__dirname, 'doxa_platform.log');

// Creăm/resetăm fișierul de log
fs.writeFileSync(platformLogPath, '--- DOXA Platform Log (REPLIT) ---\n', { flag: 'w' });

// Afișăm banner-ul de start
console.log(`
╔════════════════════════════════════════════════════╗
║                                                    ║
║  DOXA Platform - Serviciul Principal              ║
║                                                    ║
╚════════════════════════════════════════════════════╝
`);

console.log('Inițializarea serviciului DOXA Platform...\n');

// Lista proceselor pornite
const processes = [];

// Funcție care pornește platforma principală
function startDoxaPlatform() {
  console.log('🚀 Pornire platformă DOXA...');
  console.log(`📝 Log: ${platformLogPath}`);
  
  // Deschidem stream-ul pentru log
  const platformLogStream = fs.createWriteStream(platformLogPath, { flags: 'a' });
  
  const platformProcess = spawn('node', ['doxa-platform-run.js'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: false
  });
  
  // Redirectăm output-ul către fișierul de log
  platformProcess.stdout.pipe(platformLogStream);
  platformProcess.stderr.pipe(platformLogStream);
  
  // Afișăm și în consolă primele mesaje de pornire
  platformProcess.stdout.on('data', (data) => {
    console.log(`[Platform] ${data.toString().trim()}`);
  });
  
  platformProcess.stderr.on('data', (data) => {
    console.error(`[Platform Error] ${data.toString().trim()}`);
  });
  
  platformProcess.on('error', (err) => {
    console.error(`⛔ Eroare la pornirea platformei: ${err.message}`);
    platformLogStream.write(`ERROR: ${err.message}\n`);
  });
  
  return platformProcess;
}

// Pornim procesul
processes.push(startDoxaPlatform());

// Handler pentru închidere gracefully
process.on('SIGINT', () => {
  console.log('\n👋 Închidere serviciu DOXA Platform...');
  
  // Oprim toate procesele pornite
  processes.forEach(proc => {
    if (proc && proc.kill) {
      try {
        proc.kill('SIGINT');
      } catch (e) {
        // Ignorăm erorile la închidere
      }
    }
  });
  
  process.exit(0);
});

// Afișăm informații utile
setTimeout(() => {
  console.log('\n✅ Serviciul DOXA Platform este activ:');
  console.log('   - Platformă DOXA: http://localhost:5001');
  console.log('\n📊 Status: verificați cu ./run_doxa_info.sh');
  console.log('📝 Loguri: doxa_platform.log');
  console.log('\n📌 Pentru a opri serviciul, apăsați Ctrl+C');
}, 3000);