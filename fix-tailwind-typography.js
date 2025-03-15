
/**
 * Script pentru repararea modulului @tailwindcss/typography
 * 
 * Acest script va reinstala pachetul @tailwindcss/typography în directorul DoxaPilgrimage
 * și va reporni serviciul Pilgrimage.
 */

const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configurare
const pilgrimageDir = path.join(__dirname, 'DoxaPilgrimage');

console.log(`
╔════════════════════════════════════════════════════╗
║                                                    ║
║    Reparare modul @tailwindcss/typography         ║
║                                                    ║
╚════════════════════════════════════════════════════╝
`);

// Verifică existența directorului
if (!fs.existsSync(pilgrimageDir)) {
  console.error(`❌ Eroare: Directorul DoxaPilgrimage nu există la ${pilgrimageDir}`);
  process.exit(1);
}

// Funcție pentru a executa comenzi în shell cu output afișat
function executeCommand(command, cwd) {
  console.log(`🔄 Executare: ${command}`);
  return execSync(command, { 
    cwd: cwd || __dirname,
    stdio: 'inherit',
    shell: true
  });
}

// Funcție pentru a reporni serviciul Pilgrimage
function restartPilgrimageApp() {
  console.log('\n🚀 Repornire serviciu DOXA Pilgrimage...');
  
  // Oprește procesele existente
  try {
    executeCommand('pkill -f "node.*DoxaPilgrimage/server/index.ts"', __dirname);
    console.log('✅ Procesele vechi au fost oprite');
  } catch (error) {
    console.log('ℹ️ Nu există procese care rulează pentru DOXA Pilgrimage');
  }
  
  // Repornește serviciul
  console.log('🚀 Pornire serviciu DOXA Pilgrimage...');
  const pilgrimageProcess = spawn('node', ['start-doxa-pilgrimage.js'], {
    cwd: __dirname,
    detached: true,
    stdio: 'ignore'
  });
  
  pilgrimageProcess.unref();
  console.log('✅ Serviciul DOXA Pilgrimage a fost pornit în fundal');
}

// Funcția principală
async function main() {
  try {
    console.log('🔍 Verificare și reinstalare modul @tailwindcss/typography...');
    
    // Mergem în directorul DoxaPilgrimage
    process.chdir(pilgrimageDir);
    
    // Verifică dacă pachetul există deja
    if (fs.existsSync(path.join(pilgrimageDir, 'node_modules', '@tailwindcss', 'typography'))) {
      console.log('🔄 Ștergere instalare anterioară a modulului...');
      executeCommand('rm -rf node_modules/@tailwindcss/typography', pilgrimageDir);
    }
    
    // Reinstalează pachetul
    console.log('📦 Reinstalare @tailwindcss/typography...');
    executeCommand('npm install @tailwindcss/typography', pilgrimageDir);
    
    console.log('✅ Modul @tailwindcss/typography reinstalat cu succes');
    
    // Regenerăm fișierul de configurare pentru Tailwind
    console.log('🔄 Regenerare fișier tailwind.config.ts...');
    
    // Repornire serviciu
    restartPilgrimageApp();
    
    console.log(`
╔════════════════════════════════════════════════════╗
║                                                    ║
║    Reparare completată cu succes                  ║
║                                                    ║
╚════════════════════════════════════════════════════╝

📝 Următorii pași:
1. Accesează aplicația la: http://0.0.0.0:3000
2. Verifică dacă stilurile se încarcă corect
3. Dacă aplicația tot nu funcționează, rulează 'node fix-doxa-services.js'
`);
    
  } catch (error) {
    console.error(`❌ Eroare în timpul reparării: ${error.message}`);
    process.exit(1);
  }
}

// Execută funcția principală
main();
