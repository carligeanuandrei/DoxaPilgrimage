/**
 * Script pentru pornirea serviciilor DOXA
 * Acest script pornește serviciile DOXA principale: platforma și aplicația Pilgrimage
 */
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configurăm fișierele de log
const platformLogPath = path.join(__dirname, 'doxa_platform.log');
const pilgrimageLogPath = path.join(__dirname, 'doxa_pilgrimage.log');

// Creăm/resetăm fișierele de log
fs.writeFileSync(platformLogPath, '--- DOXA Platform Log ---\n', { flag: 'w' });
fs.writeFileSync(pilgrimageLogPath, '--- DOXA Pilgrimage Log ---\n', { flag: 'w' });

// Afișăm banner-ul de start
console.log(`
╔════════════════════════════════════════════════════╗
║                                                    ║
║  DOXA Services - Platforme Complete               ║
║                                                    ║
╚════════════════════════════════════════════════════╝
`);

console.log('Inițializarea serviciilor DOXA...\n');

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

// Funcție care pornește aplicația Pilgrimage
function startDoxaPilgrimage() {
  console.log('🌐 Pornire aplicație DOXA Pilgrimage...');
  console.log(`📝 Log: ${pilgrimageLogPath}`);
  
  // Deschidem stream-ul pentru log
  const pilgrimageLogStream = fs.createWriteStream(pilgrimageLogPath, { flags: 'a' });
  
  const pilgrimageProcess = spawn('node', ['start-doxa-pilgrimage.js'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: false
  });
  
  // Redirectăm output-ul către fișierul de log
  pilgrimageProcess.stdout.pipe(pilgrimageLogStream);
  pilgrimageProcess.stderr.pipe(pilgrimageLogStream);
  
  // Afișăm și în consolă primele mesaje de pornire
  pilgrimageProcess.stdout.on('data', (data) => {
    console.log(`[Pilgrimage] ${data.toString().trim()}`);
  });
  
  pilgrimageProcess.stderr.on('data', (data) => {
    console.error(`[Pilgrimage Error] ${data.toString().trim()}`);
  });
  
  pilgrimageProcess.on('error', (err) => {
    console.error(`⛔ Eroare la pornirea aplicației Pilgrimage: ${err.message}`);
    pilgrimageLogStream.write(`ERROR: ${err.message}\n`);
  });
  
  return pilgrimageProcess;
}

// Pornim procesele
processes.push(startDoxaPlatform());
processes.push(startDoxaPilgrimage());

// Handler pentru închidere gracefully
process.on('SIGINT', () => {
  console.log('\n👋 Închidere servicii DOXA...');
  
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
  console.log('\n✅ Serviciile DOXA sunt active:');
  console.log('   - Platformă DOXA: http://localhost:5001');
  console.log('   - Aplicație DOXA Pilgrimage: http://localhost:3000');
  console.log('\n📊 Status: verificați cu ./run_doxa_info.sh');
  console.log('📝 Loguri: doxa_platform.log și doxa_pilgrimage.log');
  console.log('\n📌 Pentru a opri serviciile, apăsați Ctrl+C');
}, 3000);