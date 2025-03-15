
/**
 * Script pentru recuperarea aplicației DOXA
 */
const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

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

// Verifică dacă un director există, dacă nu îl creează
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.log(`📂 Creare director: ${dirPath}`);
    fs.mkdirSync(dirPath, { recursive: true });
    return true;
  }
  return false;
}

// Verifică fișierele de date de rezervă
function checkFallbackData() {
  console.log('\n🔍 Verificare date de rezervă...');
  
  const fallbackDir = path.join(__dirname, 'public', 'fallback-data');
  ensureDirectoryExists(fallbackDir);
  
  const monasteryFile = path.join(fallbackDir, 'monasteries.json');
  if (!fs.existsSync(monasteryFile)) {
    console.log(`❌ Fișierul de date pentru mănăstiri lipsește: ${monasteryFile}`);
    return false;
  } else {
    try {
      const data = JSON.parse(fs.readFileSync(monasteryFile, 'utf8'));
      console.log(`✅ Fișier de date mănăstiri valid cu ${data.length} înregistrări`);
      return true;
    } catch (error) {
      console.log(`❌ Eroare la citirea fișierului JSON pentru mănăstiri: ${error.message}`);
      return false;
    }
  }
}

// Verifică că imaginile necesare există
function checkRequiredImages() {
  console.log('\n🔍 Verificare imagini necesare...');
  
  const imagesDir = path.join(__dirname, 'public', 'images');
  ensureDirectoryExists(imagesDir);
  
  const placeholderImage = path.join(imagesDir, 'monastery-placeholder.jpg');
  if (!fs.existsSync(placeholderImage)) {
    console.log(`❌ Imaginea placeholder lipsește: ${placeholderImage}`);
    return false;
  }
  
  console.log('✅ Imagini necesare disponibile');
  return true;
}

// Pornire platformă DOXA
function startDoxaPlatform() {
  console.log('\n🔄 Pornire platforma DOXA...');
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
  console.log('\n🔄 Pornire DOXA Pilgrimage...');
  const pilgrimageProcess = spawn('node', ['start-doxa-pilgrimage.js'], {
    stdio: 'inherit',
    detached: false
  });
  
  pilgrimageProcess.on('error', (err) => {
    console.error(`⛔ Eroare la pornirea Pilgrimage: ${err.message}`);
  });
  
  return pilgrimageProcess;
}

// Verifică dacă un port este disponibil
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = http.createServer();
    
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(false);
      } else {
        resolve(true);
      }
      server.close();
    });
    
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    
    server.listen(port, '0.0.0.0');
  });
}

// Verificăm și pornim serviciile
async function recoverServices() {
  // Verifică fișierele de date de rezervă și imaginile
  const fallbackDataOk = checkFallbackData();
  const imagesOk = checkRequiredImages();
  
  if (!fallbackDataOk || !imagesOk) {
    console.log('\n⚠️ Unele fișiere de date sau imagini lipsesc sau sunt invalide.');
    console.log('   Se vor crea datele lipsă la nevoie.');
  }
  
  // Verifică serviciile
  const platformRunning = await checkService(5001, 'DOXA Platform');
  const pilgrimageRunning = await checkService(3000, 'DOXA Pilgrimage');
  
  // Verifică dacă porturile sunt disponibile când serviciile nu rulează
  if (!platformRunning) {
    const port5001Available = await isPortAvailable(5001);
    if (!port5001Available) {
      console.log('⚠️ Portul 5001 este ocupat de alt proces, dar nu este detectat ca DOXA Platform.');
      console.log('   Se va încerca oprirea procesului pe portul 5001...');
      exec('kill $(lsof -t -i:5001)', (error) => {
        if (error) {
          console.log(`❌ Nu s-a putut opri procesul de pe portul 5001: ${error.message}`);
        } else {
          console.log('✅ Proces oprit de pe portul 5001');
        }
      });
    }
  }
  
  if (!pilgrimageRunning) {
    const port3000Available = await isPortAvailable(3000);
    if (!port3000Available) {
      console.log('⚠️ Portul 3000 este ocupat de alt proces, dar nu este detectat ca DOXA Pilgrimage.');
      console.log('   Se va încerca oprirea procesului pe portul 3000...');
      exec('kill $(lsof -t -i:3000)', (error) => {
        if (error) {
          console.log(`❌ Nu s-a putut opri procesul de pe portul 3000: ${error.message}`);
        } else {
          console.log('✅ Proces oprit de pe portul 3000');
        }
      });
    }
  }
  
  // Pornește serviciile care nu rulează
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
