/**
 * Script pentru pornirea aplicației DOXA Pilgrimage
 * Acest script execută comanda npm run dev în directorul DoxaPilgrimage
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Banner de start
console.log(`
==========================================
      DOXA Pilgrimage Application         
==========================================
`);

console.log('🌐 Pornire aplicație DOXA Pilgrimage...');

// Verificăm dacă directorul există
const pilgrimageDir = path.join(__dirname, 'DoxaPilgrimage');
if (!fs.existsSync(pilgrimageDir)) {
  console.error('❌ Eroare: Directorul DoxaPilgrimage nu există!');
  process.exit(1);
}

// Pornire aplicație din directorul DoxaPilgrimage
const childProcess = spawn('npx', ['tsx', 'server/index.ts'], {
  cwd: pilgrimageDir,
  stdio: 'inherit',
  shell: true
});

// Gestionare evenimente pentru procesul copil
childProcess.on('error', (error) => {
  console.error(`❌ Eroare la pornirea aplicației: ${error.message}`);
  process.exit(1);
});

childProcess.on('close', (code) => {
  if (code !== 0) {
    console.error(`❌ Aplicația s-a închis cu codul: ${code}`);
  }
});

// Gestionare semnal de închidere pentru procesul principal
process.on('SIGINT', () => {
  console.log('\n🛑 Oprire aplicație DOXA Pilgrimage...');
  childProcess.kill('SIGINT');
});

console.log('✅ Proces de pornire inițiat. Așteptați mesajele de pornire...');