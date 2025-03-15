
const fs = require('fs');
const path = require('path');
const http = require('http');

console.log('╔════════════════════════════════════════════════════╗');
console.log('║                                                    ║');
console.log('║  Verificare Endpoint API și Date de Rezervă        ║');
console.log('║                                                    ║');
console.log('╚════════════════════════════════════════════════════╝');

// Verifică existența directorului fallback-data
const fallbackDir = path.join(__dirname, 'public', 'fallback-data');
if (!fs.existsSync(fallbackDir)) {
  console.log(`\n❌ Directorul pentru date de rezervă nu există: ${fallbackDir}`);
  console.log('📂 Creez directorul...');
  fs.mkdirSync(fallbackDir, { recursive: true });
  console.log('✅ Director creat cu succes!');
} else {
  console.log(`\n✅ Directorul pentru date de rezervă există: ${fallbackDir}`);
}

// Verifică fișierul JSON de rezervă
const fallbackFile = path.join(fallbackDir, 'monasteries.json');
if (!fs.existsSync(fallbackFile)) {
  console.log(`\n❌ Fișierul de date de rezervă nu există: ${fallbackFile}`);
  console.log('🔄 Voi crea un fișier cu date demonstrative...');
  
  const demoData = [
    {
      "id": 1,
      "name": "Mănăstirea Voroneț",
      "location": "Voroneț, Suceava",
      "yearFounded": 1488,
      "description": "Celebră pentru albastrul de Voroneț",
      "image": "/images/monasteries/voronet.jpg"
    },
    {
      "id": 2,
      "name": "Mănăstirea Putna",
      "location": "Putna, Suceava",
      "yearFounded": 1469,
      "description": "Necropola lui Ștefan cel Mare",
      "image": "/images/monasteries/putna.jpg"
    }
  ];
  
  fs.writeFileSync(fallbackFile, JSON.stringify(demoData, null, 2), 'utf8');
  console.log('✅ Fișier de date creat cu succes!');
} else {
  console.log(`\n✅ Fișierul de date de rezervă există: ${fallbackFile}`);
  try {
    const data = JSON.parse(fs.readFileSync(fallbackFile, 'utf8'));
    console.log(`📊 Conține ${data.length} înregistrări.`);
  } catch (error) {
    console.log(`❌ Eroare la citirea fișierului JSON: ${error.message}`);
  }
}

// Verifică endpoint-ul API local
console.log('\n🔄 Verificare API endpoint /api/monasteries...');

const options = {
  hostname: 'localhost',
  port: 5001,
  path: '/api/monasteries',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`🔄 Status API: ${res.statusCode}`);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode === 200) {
      try {
        const jsonData = JSON.parse(data);
        console.log(`✅ API funcțional! Conține ${jsonData.length} înregistrări.`);
      } catch (e) {
        console.log('❌ API returnează date, dar nu în format JSON valid.');
        console.log(`📝 Primele 200 caractere: ${data.substring(0, 200)}...`);
      }
    } else {
      console.log('❌ API nu returnează date valide.');
    }
    
    console.log('\n📋 Recomandări:');
    console.log('1. Asigurați-vă că serverul DOXA Platform rulează.');
    console.log('2. Verificați că API-ul /api/monasteries este configurat corect.');
    console.log('3. Datele de rezervă din public/fallback-data/monasteries.json sunt disponibile ca backup.');
  });
});

req.on('error', (e) => {
  console.log(`❌ Eroare la conectarea la API: ${e.message}`);
  console.log('⚠️ Verificați dacă serverul rulează și este accesibil.');
  console.log('\n📋 Recomandări:');
  console.log('1. Rulați "node doxa-platform-run.js" pentru a porni serverul.');
  console.log('2. Asigurați-vă că aplicația folosește datele de rezervă până când API-ul este disponibil.');
});

req.end();
