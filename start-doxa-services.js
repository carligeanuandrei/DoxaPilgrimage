/**
 * Script pentru pornirea tuturor serviciilor DOXA
 * Acest script pornește toate serviciile DOXA: platforma principală, asistentul AI și aplicația Pilgrimage
 */
const { spawn } = require('child_process');

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

// Funcție care pornește aplicația Pilgrimage
function startDoxaPilgrimage() {
  console.log('🌐 Pornire aplicație DOXA Pilgrimage...');
  
  const pilgrimageProcess = spawn('node', ['start-doxa-pilgrimage.js'], {
    stdio: 'inherit',
    detached: false
  });
  
  pilgrimageProcess.on('error', (err) => {
    console.error(`⛔ Eroare la pornirea aplicației Pilgrimage: ${err.message}`);
  });
  
  return pilgrimageProcess;
}

// Pornim procesele
processes.push(startDoxaPlatform());
processes.push(startDoxaAI());
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
  console.log('\n✅ Toate serviciile DOXA sunt active:');
  console.log('   - Platformă DOXA: http://localhost:5001');
  console.log('   - Asistent DOXA AI: http://localhost:3333');
  console.log('   - Aplicație DOXA Pilgrimage: http://localhost:3000');
  console.log('\n📌 Pentru a opri serviciile, apăsați Ctrl+C');
}, 2000);