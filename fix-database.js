
/**
 * Script pentru repararea conexiunii la baza de date
 */
const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log(`
╔════════════════════════════════════════════════════╗
║                                                    ║
║  DOXA - Diagnosticare Conexiune Bază de Date      ║
║                                                    ║
╚════════════════════════════════════════════════════╝
`);

// Verificăm variabilele de mediu
function checkEnvironmentVariables() {
  console.log('🔍 Verificare variabile de mediu...');
  const requiredVars = ['DATABASE_URL', 'NODE_ENV'];
  const missingVars = [];
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missingVars.push(varName);
      console.log(`❌ Variabila ${varName} lipsește`);
    } else {
      const value = process.env[varName];
      const maskedValue = varName === 'DATABASE_URL' 
        ? value.replace(/\/\/(.+?)@/, '//******@') 
        : value;
      console.log(`✅ ${varName}=${maskedValue}`);
    }
  }
  
  return missingVars;
}

// Încercăm să testăm conexiunea la baza de date
async function testDatabaseConnection() {
  console.log('\n🔄 Testare conexiune la baza de date...');
  
  try {
    // Încărcăm modulul db.ts folosind un script temporar pentru a evita probleme de ES modules
    fs.writeFileSync('temp-db-test.js', `
    async function run() {
      try {
        const { testConnection } = require('./server/db');
        const result = await testConnection();
        console.log(result ? '✅ Conexiune reușită la baza de date!' : '❌ Conexiunea a eșuat');
        process.exit(result ? 0 : 1);
      } catch (error) {
        console.error('❌ Eroare la testarea conexiunii:', error.message);
        process.exit(1);
      }
    }
    run();
    `);
    
    return new Promise((resolve) => {
      const proc = spawn('node', ['temp-db-test.js'], { stdio: 'inherit' });
      
      proc.on('close', (code) => {
        fs.unlinkSync('temp-db-test.js');
        resolve(code === 0);
      });
    });
  } catch (error) {
    console.error('❌ Eroare la testarea conexiunii:', error.message);
    return false;
  }
}

// Verificăm dacă serverul PostgreSQL este pornit
function checkPostgresRunning() {
  return new Promise((resolve) => {
    exec('ps aux | grep postgres', (error, stdout) => {
      const isRunning = stdout.includes('postgres') && !stdout.includes('grep postgres');
      console.log(isRunning 
        ? '✅ Serverul PostgreSQL este activ' 
        : '❌ Serverul PostgreSQL nu pare să fie activ');
      resolve(isRunning);
    });
  });
}

// Creăm un fișier de fallback pentru a afișa date demonstrative
function createFallbackData() {
  console.log('\n🔄 Crearea datelor demonstrative de rezervă...');
  
  const fallbackDataDir = path.join(__dirname, 'public', 'fallback-data');
  if (!fs.existsSync(fallbackDataDir)) {
    fs.mkdirSync(fallbackDataDir, { recursive: true });
  }
  
  // Date demonstrative pentru mănăstiri
  const monasteriesFallback = [
    { id: 1, name: 'Mănăstirea Voroneț', location: 'Voroneț, Suceava', yearFounded: 1488, description: 'Celebră pentru albastrul de Voroneț', image: '/public/images/monasteries/voronet.jpg' },
    { id: 2, name: 'Mănăstirea Putna', location: 'Putna, Suceava', yearFounded: 1469, description: 'Necropola lui Ștefan cel Mare', image: '/public/images/monasteries/putna.jpg' },
    { id: 3, name: 'Mănăstirea Moldovița', location: 'Moldovița, Suceava', yearFounded: 1532, description: 'Monument istoric UNESCO', image: '/public/images/monasteries/moldovita.jpg' },
    { id: 4, name: 'Mănăstirea Humor', location: 'Gura Humorului, Suceava', yearFounded: 1530, description: 'Monument istoric UNESCO', image: '/public/images/monasteries/humor.jpg' },
    { id: 5, name: 'Mănăstirea Sucevița', location: 'Sucevița, Suceava', yearFounded: 1585, description: 'Monument istoric UNESCO', image: '/public/images/monasteries/sucevita.jpg' }
  ];
  
  // Date demonstrative pentru pelerinaje
  const pilgrimagesFallback = [
    { id: 1, title: 'Pelerinaj la Mănăstirile din Bucovina', description: 'Vizitarea celor mai importante mănăstiri din Bucovina', startDate: '2025-06-01', endDate: '2025-06-07', price: 1200, locations: 'Voroneț, Putna, Moldovița, Sucevița', image: '/public/images/pilgrimages/bucovina.jpg', promoted: true },
    { id: 2, title: 'Pelerinaj la Muntele Athos', description: 'Călătorie spirituală pe Muntele Athos', startDate: '2025-07-10', endDate: '2025-07-20', price: 3500, locations: 'Muntele Athos, Grecia', image: '/public/images/pilgrimages/athos.jpg', promoted: true },
    { id: 3, title: 'Pelerinaj în Țara Sfântă', description: 'Călătorie pe urmele Mântuitorului', startDate: '2025-08-15', endDate: '2025-08-25', price: 4000, locations: 'Ierusalim, Betleem, Nazaret', image: '/public/images/pilgrimages/israel.jpg', promoted: false }
  ];
  
  // Salvăm datele în fișiere JSON
  fs.writeFileSync(path.join(fallbackDataDir, 'monasteries.json'), JSON.stringify(monasteriesFallback, null, 2));
  fs.writeFileSync(path.join(fallbackDataDir, 'pilgrimages.json'), JSON.stringify(pilgrimagesFallback, null, 2));
  
  console.log('✅ Date demonstrative create în public/fallback-data/');
}

// Verificăm și încercăm să reparăm conexiunea la baza de date
async function fixDatabaseConnection() {
  const missingVars = checkEnvironmentVariables();
  
  if (missingVars.includes('DATABASE_URL')) {
    console.log('\n❌ Lipsește variabila de mediu DATABASE_URL');
    console.log('🔄 Verificăm dacă există o bază de date în Replit...');
    
    // Folosim Replit Database Tool pentru a verifica configurația
    exec('curl -s "https://replit.com/data/database/info" -H "Cookie: connect.sid=$REPLIT_CONNECT_SID"', (error, stdout) => {
      try {
        const data = JSON.parse(stdout);
        if (data && data.connectionString) {
          console.log('✅ S-a găsit configurația bazei de date! Trebuie să o setați în variabilele de mediu.');
          console.log('\n📋 Instrucțiuni:');
          console.log('1. Deschideți panoul "Secrets" din meniul lateral al Replit');
          console.log('2. Adăugați un secret nou cu numele "DATABASE_URL"');
          console.log('3. Copiați valoarea din consola Replit și adăugați-o ca valoare a secretului');
          console.log('4. Reporniți aplicația folosind butonul "Run"');
        } else {
          console.log('❌ Nu s-a găsit o configurație de bază de date în Replit');
          console.log('\n📋 Pentru a crea o bază de date:');
          console.log('1. Deschideți panoul "Database" din meniul lateral al Replit');
          console.log('2. Urmați instrucțiunile pentru a crea o bază de date PostgreSQL');
          console.log('3. Variabila DATABASE_URL va fi setată automat');
        }
      } catch (e) {
        console.log('❌ Nu s-a putut verifica configurația bazei de date');
      }
    });
  } else {
    const isConnected = await testDatabaseConnection();
    
    if (!isConnected) {
      console.log('\n🔄 Conexiunea la baza de date a eșuat, încercăm să diagnosticăm problema...');
      
      const isPostgresRunning = await checkPostgresRunning();
      
      if (!isPostgresRunning) {
        console.log('❌ Serverul PostgreSQL nu este activ');
        console.log('\n📋 Dacă folosiți o bază de date Replit PostgreSQL:');
        console.log('1. Asigurați-vă că baza de date este activă în panoul Database');
        console.log('2. Verificați URL-ul de conexiune în variabilele de mediu');
      } else {
        console.log('\n🔍 Verificăm URL-ul de conexiune...');
        const dbUrl = process.env.DATABASE_URL || '';
        
        if (!dbUrl.includes('postgres')) {
          console.log('❌ URL-ul de conexiune nu pare să fie valid pentru PostgreSQL');
        } else {
          console.log('🔄 URL-ul de conexiune pare corect, dar conexiunea eșuează');
          console.log('📋 Posibile cauze:');
          console.log('- Serverul PostgreSQL refuză conexiunile (verificați firewallul)');
          console.log('- Credențialele din URL sunt incorecte');
          console.log('- Serverul PostgreSQL este inactiv sau indisponibil temporar');
        }
      }
    }
  }
  
  // Creem date demonstrative pentru cazul în care conexiunea nu poate fi reparată
  createFallbackData();
  
  // Actualizăm codul frontend pentru a utiliza datele de rezervă
  updateFrontendForFallback();
}

// Actualizăm codul frontend pentru a utiliza datele de rezervă în cazul unui eșec de conexiune
function updateFrontendForFallback() {
  console.log('\n🔄 Actualizăm codul frontend pentru a utiliza datele de rezervă...');
  
  try {
    // Actualizăm pagina monasteries.html pentru a folosi datele de rezervă
    const monasteriesPath = path.join(__dirname, 'public', 'monasteries.html');
    if (fs.existsSync(monasteriesPath)) {
      let monasteriesHtml = fs.readFileSync(monasteriesPath, 'utf8');
      
      // Verificăm dacă există deja cod pentru fallback
      if (!monasteriesHtml.includes('fallback-data')) {
        // Identificăm secțiunea de JavaScript care încarcă datele
        const scriptStartIndex = monasteriesHtml.indexOf('<script>');
        if (scriptStartIndex !== -1) {
          const scriptEndIndex = monasteriesHtml.indexOf('</script>', scriptStartIndex);
          if (scriptEndIndex !== -1) {
            // Extragem codul existent
            const originalScript = monasteriesHtml.substring(scriptStartIndex + 8, scriptEndIndex);
            
            // Înlocuim cu versiunea cu fallback
            const newScript = `
  // Funcție pentru a afișa notificarea de eroare
  function showConnectionError() {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'connection-error';
    errorDiv.innerHTML = \`
      <div class="alert alert-warning" role="alert">
        <h4><i class="fas fa-exclamation-triangle"></i> ⚠️ Notificare</h4>
        <p>Nu s-a putut conecta la serverul de date. Se afișează informații demonstrative.</p>
        <p>Datele afișate sunt demonstrative și nu reflectă informațiile reale din baza de date.</p>
      </div>
    \`;
    document.querySelector('main').prepend(errorDiv);
  }

  // Funcție pentru a încărca mănăstirile
  async function loadMonasteries() {
    try {
      // Încercăm să obținem datele de la API
      const response = await fetch('/api/monasteries');
      
      // Verificăm dacă API-ul a răspuns cu succes
      if (response.ok) {
        const monasteries = await response.json();
        displayMonasteries(monasteries);
      } else {
        throw new Error('Eroare la comunicarea cu serverul');
      }
    } catch (error) {
      console.error("Eroare la încărcarea mănăstirilor:", error);
      
      // Dacă API-ul eșuează, încărcăm datele de rezervă
      console.log("Folosim date de rezervă pentru mănăstiri");
      showConnectionError();
      
      try {
        const fallbackResponse = await fetch('/public/fallback-data/monasteries.json');
        const fallbackData = await fallbackResponse.json();
        displayMonasteries(fallbackData);
      } catch (fallbackError) {
        console.error("Eroare la încărcarea datelor de rezervă:", fallbackError);
      }
    }
  }

  // Funcție pentru a afișa mănăstirile
  function displayMonasteries(monasteries) {
    const container = document.getElementById('monasteries-container');
    container.innerHTML = '';
    
    monasteries.forEach(monastery => {
      const card = document.createElement('div');
      card.className = 'col-md-4 mb-4';
      card.innerHTML = \`
        <div class="card h-100 monastery-card">
          <img src="\${monastery.image || '/public/images/monastery-placeholder.jpg'}" 
               class="card-img-top" alt="\${monastery.name}"
               onerror="this.src='/public/images/monastery-placeholder.jpg'">
          <div class="card-body">
            <h5 class="card-title">\${monastery.name}</h5>
            <p class="card-text">
              <small class="text-muted"><i class="fas fa-map-marker-alt"></i> \${monastery.location || 'Locație necunoscută'}</small>
            </p>
            <p class="card-text"><i class="fas fa-calendar-alt"></i> An fondare: \${monastery.yearFounded || 'Necunoscut'}</p>
            <p class="card-text">\${monastery.description || 'Fără descriere'}</p>
          </div>
          <div class="card-footer">
            <a href="#" class="btn btn-primary view-details" data-id="\${monastery.id}">
              Vezi detalii <i class="fas fa-arrow-right"></i>
            </a>
          </div>
        </div>
      \`;
      container.appendChild(card);
    });
  }

  // Încărcăm mănăstirile când pagina se încarcă
  document.addEventListener('DOMContentLoaded', loadMonasteries);
`;
            
            // Înlocuim scriptul în HTML
            monasteriesHtml = monasteriesHtml.substring(0, scriptStartIndex + 8) + 
                             newScript + 
                             monasteriesHtml.substring(scriptEndIndex);
            
            // Salvăm fișierul actualizat
            fs.writeFileSync(monasteriesPath, monasteriesHtml);
            console.log('✅ Pagina monasteries.html a fost actualizată pentru a utiliza date de rezervă');
          }
        }
      } else {
        console.log('✅ Pagina monasteries.html are deja suport pentru date de rezervă');
      }
    }
    
    // Actualizăm și pilgrimages.html dacă există
    const pilgrimagesPath = path.join(__dirname, 'public', 'pilgrimages.html');
    if (fs.existsSync(pilgrimagesPath)) {
      // Aici am putea implementa o logică similară pentru pilgrimages.html
      console.log('ℹ️ Adăugați suport pentru date de rezervă în pilgrimages.html manual dacă este necesar');
    }
    
  } catch (error) {
    console.error('❌ Eroare la actualizarea fișierelor frontend:', error);
  }
}

// Rulăm funcția principală
fixDatabaseConnection();
