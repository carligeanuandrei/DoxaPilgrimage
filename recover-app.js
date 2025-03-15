
/**
 * Script pentru recuperarea aplicației DOXA
 */
const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log(`
╔════════════════════════════════════════════════════╗
║                                                    ║
║    DOXA - Recuperare Servicii                     ║
║                                                    ║
╚════════════════════════════════════════════════════╝
`);

// Verificăm dacă serviciile rulează
function checkService(port, name) {
  return new Promise((resolve) => {
    exec(`lsof -i:${port}`, (error, stdout) => {
      if (error || !stdout) {
        console.log(`❌ ${name} nu rulează pe portul ${port}`);
        resolve(false);
      } else {
        console.log(`✅ ${name} rulează pe portul ${port}`);
        resolve(true);
      }
    });
  });
}

// Pornire platformă DOXA
function startDoxaPlatform() {
  console.log('🔄 Pornire platforma DOXA...');
  const platformProcess = spawn('node', ['doxa-platform-run.js'], {
    stdio: 'inherit',
    detached: false
  });
  
  platformProcess.on('error', (err) => {
    console.error(`⛔ Eroare la pornirea platformei: ${err.message}`);
  });
  
  return platformProcess;
}

// Pornire DOXA Pilgrimage
function startDoxaPilgrimage() {
  console.log('🔄 Pornire DOXA Pilgrimage...');
  const pilgrimageProcess = spawn('node', ['start-doxa-pilgrimage.js'], {
    stdio: 'inherit',
    detached: false
  });
  
  pilgrimageProcess.on('error', (err) => {
    console.error(`⛔ Eroare la pornirea Pilgrimage: ${err.message}`);
  });
  
  return pilgrimageProcess;
}

// Verificăm și pornim serviciile
async function recoverServices() {
  const platformRunning = await checkService(5001, 'DOXA Platform');
  const pilgrimageRunning = await checkService(3000, 'DOXA Pilgrimage');
  
  const processes = [];
  
  if (!platformRunning) {
    processes.push(startDoxaPlatform());
  }
  
  if (!pilgrimageRunning) {
    processes.push(startDoxaPilgrimage());
  }
  
  if (processes.length > 0) {
    console.log('\n🔄 Serviciile au fost repornite cu succes!');
    console.log('\n📌 URL-uri servicii:');
    console.log('   - DOXA Platform: http://0.0.0.0:5001');
    console.log('   - DOXA Pilgrimage: http://0.0.0.0:3000');
  } else {
    console.log('\n✅ Toate serviciile sunt deja pornite.');
  }
  
  // Verificăm dacă există orice probleme de conexiune în logs
  console.log('\n🔍 Verificare log-uri pentru erori de comunicare...');
  try {
    if (fs.existsSync('doxa_platform.log')) {
      const platformLog = fs.readFileSync('doxa_platform.log', 'utf8');
      if (platformLog.includes('Error') || platformLog.includes('error')) {
        console.log('⚠️ Erori detectate în log-ul platformei. Verificați doxa_platform.log');
      }
    }
    
    if (fs.existsSync('doxa_pilgrimage.log')) {
      const pilgrimageLog = fs.readFileSync('doxa_pilgrimage.log', 'utf8');
      if (pilgrimageLog.includes('Error') || pilgrimageLog.includes('error')) {
        console.log('⚠️ Erori detectate în log-ul Pilgrimage. Verificați doxa_pilgrimage.log');
      }
    }
  } catch (err) {
    console.error('Eroare la citirea log-urilor:', err);
  }
}

// Rulăm recuperarea
recoverServices();
