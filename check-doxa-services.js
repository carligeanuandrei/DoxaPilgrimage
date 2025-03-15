/**
 * Script pentru verificarea stării serviciilor DOXA
 * Afișează informații despre serviciile DOXA active
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

console.log(`
╔════════════════════════════════════════════════════╗
║                                                    ║
║  Verificare stare servicii DOXA                   ║
║                                                    ║
╚════════════════════════════════════════════════════╝
`);

// Funcție pentru verificarea unui serviciu
function checkService(name, port, endpoint = '') {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: port,
      path: endpoint,
      method: 'GET',
      timeout: 3000
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve({
          name,
          port,
          status: 'running',
          statusCode: res.statusCode,
          data: data
        });
      });
    });

    req.on('error', () => {
      resolve({
        name,
        port,
        status: 'stopped'
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        name,
        port,
        status: 'timeout'
      });
    });

    req.end();
  });
}

// Funcție pentru afișarea ultimelor linii din log
function getLastLogLines(logFile, lines = 5) {
  try {
    if (fs.existsSync(logFile)) {
      const data = fs.readFileSync(logFile, 'utf8');
      const allLines = data.split('\n');
      return allLines.slice(-lines).join('\n');
    }
    return 'Fișierul de log nu există';
  } catch (err) {
    return `Eroare la citirea logului: ${err.message}`;
  }
}

// Verificăm serviciile
async function checkServices() {
  const platformLogPath = path.join(__dirname, 'doxa_platform.log');
  const pilgrimageLogPath = path.join(__dirname, 'doxa_pilgrimage.log');
  const aiLogPath = path.join(__dirname, 'doxa_ai.log'); // Added AI log path

  // Verificăm DOXA Platform
  const platformResult = await checkService('DOXA Platform', 5001, '/status');

  console.log(`\n=== DOXA Platform ===`);
  if (platformResult.status === 'running') {
    console.log(`✅ Status: Rulează (port 5001)`);
    console.log(`🔄 Cod răspuns: ${platformResult.statusCode}`);
    console.log(`\n📝 Ultimele evenimente log:`);
    console.log(getLastLogLines(platformLogPath));
  } else {
    console.log(`❌ Status: ${platformResult.status === 'timeout' ? 'Timeout' : 'Oprit'}`);
    console.log(`\n⚠️ Verificați ${platformLogPath} pentru erori`);
  }

  // Verificăm DOXA Pilgrimage
  const pilgrimageResult = await checkService('DOXA Pilgrimage', 3000);

  console.log(`\n=== DOXA Pilgrimage ===`);
  if (pilgrimageResult.status === 'running') {
    console.log(`✅ Status: Rulează (port 3000)`);
    console.log(`🔄 Cod răspuns: ${pilgrimageResult.statusCode}`);
    console.log(`\n📝 Ultimele evenimente log:`);
    console.log(getLastLogLines(pilgrimageLogPath));
  } else {
    console.log(`❌ Status: ${pilgrimageResult.status === 'timeout' ? 'Timeout' : 'Oprit'}`);
    console.log(`\n⚠️ Verificați ${pilgrimageLogPath} pentru erori`);
  }

  // Verificăm DOXA AI
  const aiResult = await checkService('DOXA AI', 5002, '/status'); // Added AI service check

  console.log(`\n=== DOXA AI ===`);
  if (aiResult.status === 'running') {
    console.log(`✅ Status: Rulează (port 5002)`);
    console.log(`🔄 Cod răspuns: ${aiResult.statusCode}`);
    console.log(`\n📝 Ultimele evenimente log:`);
    console.log(getLastLogLines(aiLogPath)); // Added AI log display
  } else {
    console.log(`❌ Status: ${aiResult.status === 'timeout' ? 'Timeout' : 'Oprit'}`);
    console.log(`\n⚠️ Verificați ${aiLogPath} pentru erori`); // Added AI log error message
  }


  console.log(`\n📊 URL-uri servicii:`);
  console.log(`- DOXA Platform: http://localhost:5001`);
  console.log(`- DOXA Pilgrimage: http://localhost:3000`);
  console.log(`- DOXA AI: http://localhost:5002`);

  console.log(`\n📌 Pentru a porni serviciile:`);
  console.log(`- Aplicația și platforma: bash start-doxa.sh`);
  console.log(`- DOXA AI (separat): rulați workflow-ul "DOXA AI"`);
}

// Rulăm verificarea
checkServices();