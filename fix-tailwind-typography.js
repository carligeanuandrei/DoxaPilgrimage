
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

// Funcție principală pentru repararea pachetului
async function repairTailwindTypography() {
  console.log('🔍 Verificare și reinstalare modul @tailwindcss/typography...');
  
  // 1. Ștergere completă a modulului existent
  console.log('🔄 Ștergere instalare anterioară a modulului...');
  try {
    executeCommand('rm -rf node_modules/@tailwindcss/typography', pilgrimageDir);
  } catch (error) {
    console.log('⚠️ Nu s-a putut șterge directorul, continuăm...');
  }
  
  // 2. Reinstalare pachet
  console.log('📦 Reinstalare @tailwindcss/typography...');
  try {
    executeCommand('npm install @tailwindcss/typography', pilgrimageDir);
  } catch (error) {
    console.log('⚠️ Eroare la instalarea pachetului, încercăm instalarea globală...');
    executeCommand('npm install -g @tailwindcss/typography', pilgrimageDir);
  }
  
  console.log('✅ Modul @tailwindcss/typography reinstalat cu succes');
  
  // 3. Verificare/regenerare configurare Tailwind
  console.log('🔄 Regenerare fișier tailwind.config.ts...');
  
  const tailwindConfigPath = path.join(pilgrimageDir, 'tailwind.config.ts');
  let tailwindConfig = fs.readFileSync(tailwindConfigPath, 'utf8');
  
  // Verificăm dacă configurația conține deja pluginul
  if (!tailwindConfig.includes('@tailwindcss/typography')) {
    // Adăugăm pluginul dacă nu există
    tailwindConfig = tailwindConfig.replace(
      /plugins:\s*\[(.*?)\]/s,
      'plugins: [$1, require("@tailwindcss/typography")]'
    );
    fs.writeFileSync(tailwindConfigPath, tailwindConfig);
    console.log('✅ Plugin adăugat în configurația Tailwind');
  } else {
    console.log('✅ Configurația Tailwind conține deja pluginul');
  }
  
  // 4. Curata cache-ul Tailwind și Vite
  try {
    executeCommand('rm -rf node_modules/.vite', pilgrimageDir);
    executeCommand('rm -rf .cache', pilgrimageDir);
    console.log('✅ Cache-ul Vite a fost șters');
  } catch (error) {
    console.log('⚠️ Eroare la ștergerea cache-ului, continuăm...');
  }
  
  // 5. Repornire serviciu DOXA Pilgrimage
  restartPilgrimageApp();
}

// Funcție pentru a reporni serviciul Pilgrimage
function restartPilgrimageApp() {
  console.log('\n🚀 Repornire serviciu DOXA Pilgrimage...');
  
  // Oprește procesele existente
  try {
    executeCommand('pkill -f "node.*DoxaPilgrimage/server/index.ts"');
    console.log('✅ Procesele vechi au fost oprite');
  } catch (error) {
    console.log('ℹ️ Nu există procese care rulează pentru DOXA Pilgrimage');
  }
  
  // Repornește serviciul
  console.log('🚀 Pornire serviciu DOXA Pilgrimage...');
  
  const pilgrimageProcess = spawn('node', ['start-doxa-pilgrimage.js'], {
    detached: true,
    stdio: 'ignore'
  });
  
  pilgrimageProcess.unref();
  console.log('✅ Serviciul DOXA Pilgrimage a fost pornit în fundal');
  
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
}

// Rulăm funcția principală
repairTailwindTypography();
