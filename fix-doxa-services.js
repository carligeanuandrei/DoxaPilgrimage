
/**
 * Script pentru diagnosticarea și repararea serviciilor DOXA
 */
const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

console.log(`
╔════════════════════════════════════════════════════╗
║                                                    ║
║    DOXA - Diagnosticare și Repornire              ║
║                                                    ║
╚════════════════════════════════════════════════════╝
`);

// Verifică dacă un proces rulează pe un anumit port
function checkPortInUse(port) {
  return new Promise((resolve) => {
    exec(`netstat -tuln | grep ${port}`, (error, stdout) => {
      if (error || !stdout) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}

// Oprește toate procesele care rulează pe un anumit port
function killProcessOnPort(port) {
  return new Promise((resolve) => {
    exec(`fuser -k ${port}/tcp`, (error) => {
      if (error) {
        console.log(`⚠️ Nu s-a putut opri procesul de pe portul ${port}. Încercăm alternativ...`);
        
        // Metodă alternativă dacă fuser nu este disponibil
        exec(`lsof -t -i:${port} | xargs -r kill -9`, (err) => {
          if (err) {
            console.log(`⚠️ Nu s-a putut opri procesul de pe portul ${port}. Se continuă oricum.`);
          } else {
            console.log(`✅ Proces oprit pe portul ${port}`);
          }
          resolve();
        });
      } else {
        console.log(`✅ Proces oprit pe portul ${port}`);
        resolve();
      }
    });
  });
}

// Verifică dacă un pachet este instalat în DOXA Pilgrimage
function checkPackageInstalled(packageName) {
  const pilgrimageDir = path.join(__dirname, 'DoxaPilgrimage');
  try {
    // Verificăm dacă există în node_modules
    return fs.existsSync(path.join(pilgrimageDir, 'node_modules', packageName));
  } catch (err) {
    return false;
  }
}

// Instalează pachetele lipsă pentru DOXA Pilgrimage
async function installMissingPackages() {
  console.log('\n🔍 Verificare pachete necesare...');
  
  const packagesToInstall = [];
  
  // Verificăm pachetele care ar putea lipsi
  if (!checkPackageInstalled('@tailwindcss/typography')) {
    packagesToInstall.push('@tailwindcss/typography');
  }
  
  if (packagesToInstall.length === 0) {
    console.log('✅ Toate pachetele necesare sunt instalate');
    return true;
  }
  
  console.log(`⚠️ Pachete lipsă: ${packagesToInstall.join(', ')}`);
  console.log('🔄 Instalare pachete lipsă...');
  
  return new Promise((resolve) => {
    const pilgrimageDir = path.join(__dirname, 'DoxaPilgrimage');
    
    // Folosim --force pentru a evita problemele de compatibilitate
    const installProcess = spawn('npm', ['install', '--save-dev', '--force', ...packagesToInstall], {
      cwd: pilgrimageDir,
      stdio: 'inherit'
    });
    
    installProcess.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Pachete instalate cu succes');
        resolve(true);
      } else {
        console.log('⚠️ Eroare la instalarea pachetelor, încercăm alternative...');
        
        // Încercăm cu yarn dacă npm eșuează
        const yarnProcess = spawn('yarn', ['add', '--dev', ...packagesToInstall], {
          cwd: pilgrimageDir,
          stdio: 'inherit'
        });
        
        yarnProcess.on('close', (yarnCode) => {
          if (yarnCode === 0) {
            console.log('✅ Pachete instalate cu succes folosind yarn');
            resolve(true);
          } else {
            console.log('⚠️ Eșec la instalarea pachetelor. Încercăm metoda directă...');
            
            // Încercăm să copiem direct fișierele necesare dacă instalarea eșuează
            const npx = spawn('npx', ['tailwindcss', 'init', '-p'], {
              cwd: pilgrimageDir,
              stdio: 'inherit'
            });
            
            npx.on('close', () => {
              console.log('🔄 Configurare Tailwind reinițializată');
              resolve(false);
            });
          }
        });
      }
    });
  });
}

// Verifică și oprește serviciile existente
async function checkAndStopServices() {
  console.log('\n🔍 Verificare servicii active...');
  
  const platform5001 = await checkPortInUse(5001);
  if (platform5001) {
    console.log('⚠️ Portul 5001 este ocupat. Se oprește procesul existent...');
    await killProcessOnPort(5001);
  }
  
  const pilgrimage3000 = await checkPortInUse(3000);
  if (pilgrimage3000) {
    console.log('⚠️ Portul 3000 este ocupat. Se oprește procesul existent...');
    await killProcessOnPort(3000);
  }
  
  // Așteptăm puțin pentru a ne asigura că procesele s-au oprit
  return new Promise((resolve) => {
    setTimeout(resolve, 2000);
  });
}

// Verifică și repară fișierele de configurare
function checkAndFixConfigs() {
  console.log('\n🔍 Verificare configurări...');
  
  // Verifică tailwind.config.ts în DoxaPilgrimage
  const tailwindConfigPath = path.join(__dirname, 'DoxaPilgrimage', 'tailwind.config.ts');
  if (fs.existsSync(tailwindConfigPath)) {
    try {
      let tailwindConfig = fs.readFileSync(tailwindConfigPath, 'utf8');
      
      // Verifică dacă @tailwindcss/typography este menționat dar nu instalat
      if (tailwindConfig.includes('@tailwindcss/typography')) {
        console.log('✅ Configurare Tailwind conține referință la typography, se va instala pachetul');
      } else {
        console.log('ℹ️ Configurare Tailwind nu folosește typography plugin');
      }
      
      // Verificăm dacă trebuie să reparăm configurarea Tailwind
      if (!checkPackageInstalled('@tailwindcss/typography') && tailwindConfig.includes('@tailwindcss/typography')) {
        // Opțional: putem modifica temporar configurarea pentru a face aplicația să funcționeze
        const updatedConfig = tailwindConfig.replace(
          /require\(["']@tailwindcss\/typography["']\)/g, 
          '/* temporar dezactivat: require("@tailwindcss/typography") */'
        );
        
        // Salvăm o copie de backup înainte de a modifica
        fs.writeFileSync(tailwindConfigPath + '.backup', tailwindConfig);
        // Aplicăm modificarea temporară
        fs.writeFileSync(tailwindConfigPath, updatedConfig);
        console.log('🔧 Am creat o configurare temporară pentru a permite pornirea aplicației');
      }
    } catch (err) {
      console.log(`⚠️ Eroare la citirea fișierului de configurare Tailwind: ${err.message}`);
    }
  }
  
  return true;
}

// Pornește DOXA Platform
function startPlatform() {
  console.log('\n🚀 Pornire DOXA Platform...');
  
  const platformProcess = spawn('node', ['doxa-platform-run.js'], {
    detached: true,
    stdio: 'ignore'
  });
  
  platformProcess.unref();
  
  return new Promise((resolve) => {
    // Verificăm dacă platforma a pornit
    setTimeout(() => {
      http.get('http://localhost:5001/status', (res) => {
        if (res.statusCode === 200) {
          console.log('✅ DOXA Platform a pornit cu succes');
          resolve(true);
        } else {
          console.log(`⚠️ DOXA Platform a pornit, dar returnează codul ${res.statusCode}`);
          resolve(false);
        }
      }).on('error', () => {
        console.log('⚠️ DOXA Platform nu a pornit corect');
        resolve(false);
      });
    }, 3000);
  });
}

// Pornește DOXA Pilgrimage
function startPilgrimage() {
  console.log('\n🚀 Pornire DOXA Pilgrimage...');
  
  // Înainte de a porni, verificăm dacă avem un script de backup pentru pornire
  const pilgrimageDir = path.join(__dirname, 'DoxaPilgrimage');
  const packageJsonPath = path.join(pilgrimageDir, 'package.json');
  
  try {
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      // Verificăm dacă există script de dev în package.json
      if (packageJson.scripts && packageJson.scripts.dev) {
        console.log('✅ Script de dezvoltare găsit în package.json');
      } else {
        console.log('⚠️ Nu s-a găsit script de dezvoltare în package.json, adăugăm unul temporar');
        packageJson.scripts = packageJson.scripts || {};
        packageJson.scripts.dev = 'tsx server/index.ts';
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      }
    }
  } catch (err) {
    console.log(`⚠️ Eroare la verificarea package.json: ${err.message}`);
  }
  
  const pilgrimageProcess = spawn('node', ['start-doxa-pilgrimage.js'], {
    detached: true,
    stdio: 'ignore'
  });
  
  pilgrimageProcess.unref();
  
  return new Promise((resolve) => {
    // Verificăm dacă aplicația a pornit
    setTimeout(() => {
      http.get('http://localhost:3000', (res) => {
        if (res.statusCode === 200) {
          console.log('✅ DOXA Pilgrimage a pornit cu succes');
          resolve(true);
        } else {
          console.log(`⚠️ DOXA Pilgrimage a pornit, dar returnează codul ${res.statusCode}`);
          resolve(false);
        }
      }).on('error', () => {
        console.log('⚠️ DOXA Pilgrimage nu a pornit corect');
        resolve(false);
      });
    }, 5000);
  });
}

// Restaurează configurările originale după ce s-au instalat pachetele
function restoreConfigs() {
  console.log('\n🔄 Restaurare configurări originale...');
  
  const tailwindConfigPath = path.join(__dirname, 'DoxaPilgrimage', 'tailwind.config.ts');
  const backupPath = tailwindConfigPath + '.backup';
  
  if (fs.existsSync(backupPath)) {
    try {
      fs.copyFileSync(backupPath, tailwindConfigPath);
      fs.unlinkSync(backupPath);
      console.log('✅ Configurare Tailwind restaurată la original');
    } catch (err) {
      console.log(`⚠️ Eroare la restaurarea configurării: ${err.message}`);
    }
  }
  
  return true;
}

// Funcția principală
async function fixDoxaServices() {
  // Oprește serviciile existente
  await checkAndStopServices();
  
  // Verifică și repară configurările
  checkAndFixConfigs();
  
  // Instalează pachetele lipsă
  const packagesInstalled = await installMissingPackages();
  
  // Restaurează configurările originale dacă pachetele au fost instalate
  if (packagesInstalled) {
    restoreConfigs();
  }
  
  // Pornește serviciile
  const platformStarted = await startPlatform();
  const pilgrimageStarted = await startPilgrimage();
  
  console.log(`
╔════════════════════════════════════════════════════╗
║                                                    ║
║    DOXA - Rezultat Diagnosticare                  ║
║                                                    ║
╚════════════════════════════════════════════════════╝
  
📊 Stare servicii după reparare:
- DOXA Platform: ${platformStarted ? '✅ Funcțional' : '❌ Nefuncțional'}
- DOXA Pilgrimage: ${pilgrimageStarted ? '✅ Funcțional' : '❌ Nefuncțional'}

📌 URL-uri servicii:
- DOXA Platform: http://0.0.0.0:5001
- DOXA Pilgrimage: http://0.0.0.0:3000

📝 Recomandări:
${packagesInstalled ? '✅ Pachetul @tailwindcss/typography a fost instalat cu succes' : '⚠️ Pachetul @tailwindcss/typography nu a putut fi instalat complet, s-a folosit o configurare temporară'}
- Verificați logs pentru detalii: doxa_platform.log și doxa_pilgrimage.log
- Dacă serviciile nu pornesc corect, rulați 'node recover-doxa-prev-version.js'
- Pentru a verifica status-ul curent, folosiți 'node check-doxa-services.js'
  
🔄 Procesele au fost pornite în fundal și vor continua să ruleze
  `);
}

// Rulăm diagnosticarea și repararea
fixDoxaServices();
