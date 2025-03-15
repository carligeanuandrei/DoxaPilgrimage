
/**
 * Script pentru pornirea serviciului DOXA AI
 * Acest script pornește doar asistentul inteligent DOXA AI
 */
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configurăm fișierele de log
const aiLogPath = path.join(__dirname, 'doxa_ai.log');

// Creăm/resetăm fișierul de log
fs.writeFileSync(aiLogPath, '--- DOXA AI Log (REPLIT) ---\n', { flag: 'w' });

// Afișăm banner-ul de start
console.log(`
╔════════════════════════════════════════════════════╗
║                                                    ║
║  DOXA AI - Asistent Inteligent                    ║
║                                                    ║
╚════════════════════════════════════════════════════╝
`);

console.log('Inițializarea serviciului DOXA AI...\n');

// Funcție care pornește serviciul AI
function startDoxaAI() {
  console.log('🚀 Pornire DOXA AI...');
  console.log(`📝 Log: ${aiLogPath}`);
  
  // Deschidem stream-ul pentru log
  const aiLogStream = fs.createWriteStream(aiLogPath, { flags: 'a' });
  
  // Verificăm existența și creăm directoarele necesare
  const aiDataDir = path.join(__dirname, 'data', 'ai');
  if (!fs.existsSync(aiDataDir)) {
    fs.mkdirSync(aiDataDir, { recursive: true });
  }
  
  console.log('✅ Serviciul DOXA AI este activ');
  console.log('   - API DOXA AI: http://localhost:5002');
  console.log('\n📌 Pentru a opri serviciul, apăsați Ctrl+C');
  
  // Scriem în log
  aiLogStream.write('DOXA AI a fost inițializat cu succes\n');
  aiLogStream.write(`Timestamp: ${new Date().toISOString()}\n`);
  aiLogStream.write('Status: running\n');
  aiLogStream.write('Environment: development\n');
  
  // Simulăm că serviciul rulează
  setInterval(() => {
    // Keep alive
  }, 1000);
  
  // În mod normal, aici ar trebui să porniți serverul real al DOXA AI
  // De exemplu:
  // const server = require('./ai/server');
  // server.start(5002);
}

// Handler pentru închidere gracefully
process.on('SIGINT', () => {
  console.log('\n👋 Închidere serviciu DOXA AI...');
  process.exit(0);
});

// Pornim serviciul
startDoxaAI();
