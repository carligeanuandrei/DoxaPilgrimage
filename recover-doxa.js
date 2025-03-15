
/**
 * Script pentru recuperarea și arhivarea fișierelor DOXA
 * Acest script va crea o arhivă ZIP cu toate fișierele importante din proiect
 */
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const { execSync } = require('child_process');

// Verificăm dacă avem modulul archiver instalat, dacă nu îl instalăm
try {
  require.resolve('archiver');
} catch (e) {
  console.log('📦 Instalarea modulului archiver...');
  try {
    execSync('npm install archiver --no-save', { stdio: 'inherit' });
    console.log('✅ Modulul archiver a fost instalat cu succes!');
  } catch (err) {
    console.error('❌ Eroare la instalarea modulului archiver:', err);
    process.exit(1);
  }
}

// Configurare
const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
const backupFileName = `doxa-backup-${timestamp}.zip`;
const output = fs.createWriteStream(backupFileName);
const archive = archiver('zip', {
  zlib: { level: 9 } // Nivel maxim de compresie
});

// Logică pentru recuperare
console.log(`
╔════════════════════════════════════════════════════╗
║                                                    ║
║  DOXA - Recuperarea fișierelor din deployment     ║
║                                                    ║
╚════════════════════════════════════════════════════╝
`);

// Inițializăm arhiva
output.on('close', () => {
  const sizeMB = (archive.pointer() / 1024 / 1024).toFixed(2);
  console.log(`
✅ Arhivarea completă! 
📦 Fișier creat: ${backupFileName}
📊 Dimensiune: ${sizeMB} MB

🔍 Acum poți descărca arhiva din Replit pentru a avea o copie locală a proiectului.
`);
});

archive.on('error', (err) => {
  console.error('❌ Eroare în timpul arhivării:', err);
  process.exit(1);
});

// Conectăm arhiva la stream-ul de ieșire
archive.pipe(output);

console.log('🔄 Se începe arhivarea fișierelor...');

// Adăugăm directoarele principale
const mainDirectories = [
  'DoxaPilgrimage',
  'client',
  'server',
  'shared',
  'scripts',
  'migrations',
  'public'
];

mainDirectories.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`📁 Se adaugă directorul: ${dir}`);
    archive.directory(dir, dir);
  }
});

// Adăugăm fișierele principale din rădăcină
const mainFiles = [
  '.replit',
  'package.json',
  'package-lock.json',
  'doxa-platform-run.js',
  'start-doxa.sh',
  'start-doxa-platform.js',
  'start-doxa-services.js',
  'start-doxa-pilgrimage.js'
];

mainFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`📄 Se adaugă fișierul: ${file}`);
    archive.file(file, { name: file });
  }
});

// Finalizăm arhiva
console.log('🔄 Se finalizează arhiva...');
archive.finalize();
