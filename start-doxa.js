/**
 * Script principal pentru pornirea platformei DOXA
 * Acest script poate fi folosit ca punct de intrare principal în aplicație
 */
const { execSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Afișăm banner-ul de start
console.log(`
╔════════════════════════════════════════════════════╗
║                                                    ║
║      DOXA - Romanian Orthodox Platform             ║
║        Dezvoltat pentru Replit                     ║
║                                                    ║
╚════════════════════════════════════════════════════╝
`);

// În funcție de argumentele de la linia de comandă, pornim componente diferite
const args = process.argv.slice(2);
const startAll = args.length === 0 || args.includes('all');
const startPlatform = startAll || args.includes('platform');
const startAI = startAll || args.includes('ai');

// Afișăm ce componente vor fi pornite
console.log(`Pornirea serviciilor DOXA...`);
if (startPlatform) console.log(`- ✓ Platforma principală`);
if (startAI) console.log(`- ✓ Asistentul AI`);
console.log('');

// Funcție pentru a verifica dacă un port este disponibil
function isPortAvailable(port) {
  try {
    execSync(`lsof -i:${port} -t`, { stdio: 'ignore' });
    return false;
  } catch (e) {
    return true;
  }
}

// Funcție care pornește platforma principală
function startDoxaPlatform() {
  console.log('🚀 Pornire platformă DOXA...');
  
  const platformProcess = spawn('node', ['doxa-platform-run.js'], {
    stdio: 'inherit',
    detached: false
  });
  
  platformProcess.on('error', (err) => {
    console.error(`⛔ Eroare la pornirea platformei: ${err.message}`);
  });
  
  return platformProcess;
}

// Funcție care pornește asistentul AI
function startDoxaAI() {
  console.log('🤖 Pornire asistent DOXA AI...');
  
  const aiProcess = spawn('node', ['doxa-ai-run.js'], {
    stdio: 'inherit',
    detached: false
  });
  
  aiProcess.on('error', (err) => {
    console.error(`⛔ Eroare la pornirea asistentului AI: ${err.message}`);
  });
  
  return aiProcess;
}

// Lista proceselor pornite
const processes = [];

// Pornim procesele conform configurației
if (startPlatform) {
  processes.push(startDoxaPlatform());
}

if (startAI) {
  processes.push(startDoxaAI());
}

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
  console.log('\n✅ Informații acces:');
  console.log('   - Platformă DOXA: http://localhost:5001');
  console.log('   - Asistent DOXA AI: http://localhost:3333');
  console.log('\n📌 Pentru a opri serviciile, apăsați Ctrl+C');
}, 2000);