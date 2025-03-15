/**
 * Script pentru pornirea aplicației DOXA Pilgrimage
 * Acest script execută comanda npm run dev în directorul DoxaPilgrimage
 */
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Calea către directorul DoxaPilgrimage
const pilgrimageDir = path.join(__dirname, 'DoxaPilgrimage');

// Banner pentru aplicația Pilgrimage
console.log(`
╔════════════════════════════════════════════════════╗
║                                                    ║
║  DOXA Pilgrimage - Aplicație pentru Pelerinaje    ║
║                                                    ║
╚════════════════════════════════════════════════════╝
`);

// Verificăm dacă directorul există
if (!fs.existsSync(pilgrimageDir)) {
  console.error(`⛔ Eroare: Directorul DoxaPilgrimage nu există la calea ${pilgrimageDir}`);
  console.log('Verificați structura proiectului sau executați configurarea inițială');
  process.exit(1);
}

// Funcție pentru a verifica dacă package.json există
function checkPackageJson() {
  const packageJsonPath = path.join(pilgrimageDir, 'package.json');
  return fs.existsSync(packageJsonPath);
}

// Funcție pentru a porni aplicația
function startPilgrimageApp() {
  console.log('🚀 Inițializare aplicație DOXA Pilgrimage...');
  console.log(`📂 Director: ${pilgrimageDir}`);

  // Verificăm existența package.json
  if (!checkPackageJson()) {
    console.error('⛔ Eroare: Nu s-a găsit fișierul package.json în directorul DoxaPilgrimage');
    console.log('Verificați dacă proiectul a fost inițializat corect');
    process.exit(1);
  }

  console.log('📦 Se pornește aplicația cu npm run dev...');

  // Pornim aplicația folosind npm run dev
  const pilgrimageProcess = spawn('npm', ['run', 'dev'], {
    cwd: pilgrimageDir,
    stdio: 'inherit',
    shell: true
  });

  // Gestionează evenimentele procesului
  pilgrimageProcess.on('error', (err) => {
    console.error(`⛔ Eroare la pornirea aplicației: ${err.message}`);
    process.exit(1);
  });

  pilgrimageProcess.on('close', (code) => {
    if (code !== 0) {
      console.error(`⛔ Aplicația s-a închis cu codul de ieșire ${code}`);
    } else {
      console.log('✅ Aplicația s-a închis normal');
    }
  });

  // Gestionează semnalele pentru închidere gracefully
  process.on('SIGINT', () => {
    console.log('\n👋 Se închide aplicația DOXA Pilgrimage...');
    pilgrimageProcess.kill('SIGINT');
    setTimeout(() => {
      process.exit(0);
    }, 1000);
  });

  process.on('SIGTERM', () => {
    console.log('\n👋 Se închide aplicația DOXA Pilgrimage...');
    pilgrimageProcess.kill('SIGTERM');
    setTimeout(() => {
      process.exit(0);
    }, 1000);
  });

  // Afișăm un mesaj cu URL-ul aplicației după pornire
  setTimeout(() => {
    console.log('\n✅ Aplicația DOXA Pilgrimage este activă:');
    console.log('   🌐 URL local: http://localhost:3000');
    console.log('   🌐 URL Replit: https://[replit-id].replit.dev');
    console.log('\n📌 Pentru a opri aplicația, apăsați Ctrl+C');
  }, 5000);
}

// Pornim aplicația
startPilgrimageApp();