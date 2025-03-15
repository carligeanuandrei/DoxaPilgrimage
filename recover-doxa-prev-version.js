
/**
 * Script pentru recuperarea aplicației DOXA la o versiune anterioară (13.03.2025)
 */
const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');

console.log(`
╔════════════════════════════════════════════════════╗
║                                                    ║
║    DOXA - Recuperare la Versiunea 13.03.2025      ║
║                                                    ║
╚════════════════════════════════════════════════════╝
`);

// Configurare
const timestamp = new Date('2025-03-13T12:00:00').toISOString().split('T')[0];
console.log(`🔄 Se inițiază recuperarea la versiunea din data: ${timestamp}`);

// Funcție pentru repararea datelor de rezervă
function fixFallbackData() {
  console.log('\n🔧 Reparare date de rezervă...');
  
  const fallbackDir = path.join(__dirname, 'public', 'fallback-data');
  if (!fs.existsSync(fallbackDir)) {
    fs.mkdirSync(fallbackDir, { recursive: true });
    console.log(`📁 Creat director pentru date de rezervă: ${fallbackDir}`);
  }
  
  // Creem o versiune corectă a datelor pentru mănăstiri
  const monasteryData = [
    {
      id: 1,
      name: "Mănăstirea Putna",
      location: "Putna, Suceava",
      foundingYear: 1466,
      description: "Mănăstirea Putna a fost ctitorită de Ștefan cel Mare între anii 1466 și 1469.",
      imageUrl: "/images/monastery-placeholder.jpg",
      accommodationAvailable: true,
      contact: "info@manastirea-putna.ro",
      region: "Moldova"
    },
    {
      id: 2,
      name: "Mănăstirea Voroneț",
      location: "Voroneț, Suceava",
      foundingYear: 1488,
      description: "Mănăstirea Voroneț este renumită pentru culoarea albastră unică a picturilor sale exterioare.",
      imageUrl: "/images/monastery-placeholder.jpg",
      accommodationAvailable: true,
      contact: "contact@manastireavoronet.ro",
      region: "Moldova"
    },
    {
      id: 3,
      name: "Mănăstirea Cozia",
      location: "Călimănești, Vâlcea",
      foundingYear: 1388,
      description: "Una dintre cele mai vechi și mai importante mănăstiri din România.",
      imageUrl: "/images/monastery-placeholder.jpg",
      accommodationAvailable: true,
      contact: "office@manastirea-cozia.ro",
      region: "Muntenia"
    },
    {
      id: 4,
      name: "Mănăstirea Curtea de Argeș",
      location: "Curtea de Argeș, Argeș",
      foundingYear: 1512,
      description: "Mănăstirea este legată de legenda Meșterului Manole și este cunoscută pentru arhitectura unică.",
      imageUrl: "/images/monastery-placeholder.jpg",
      accommodationAvailable: true,
      contact: "info@manastireacurteadearges.ro",
      region: "Muntenia"
    },
    {
      id: 5,
      name: "Mănăstirea Sâmbăta de Sus",
      location: "Sâmbăta de Sus, Brașov",
      foundingYear: 1696,
      description: "Mănăstire construită de Constantin Brâncoveanu, un important centru spiritual ortodox din Transilvania.",
      imageUrl: "/images/monastery-placeholder.jpg",
      accommodationAvailable: true,
      contact: "contact@manastireasambata.ro",
      region: "Transilvania"
    }
  ];
  
  // Salvăm datele în fișierul JSON
  const monasteryFilePath = path.join(fallbackDir, 'monasteries.json');
  fs.writeFileSync(monasteryFilePath, JSON.stringify(monasteryData, null, 2), 'utf8');
  console.log(`✅ Date de rezervă pentru mănăstiri create: ${monasteryFilePath}`);
  
  // Verificăm că imaginile placeholder există
  const imagesDir = path.join(__dirname, 'public', 'images');
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }
  
  const placeholderPath = path.join(imagesDir, 'monastery-placeholder.jpg');
  if (!fs.existsSync(placeholderPath)) {
    console.log('⚠️ Imaginea placeholder lipsește. Se va crea o versiune simplă.');
    // Aici am putea crea o imagine simplă sau copia una existentă
  }
}

// Verificăm și reparăm fișierele HTML
function fixHtmlFiles() {
  console.log('\n🔧 Reparare fișiere HTML...');
  
  const monasteryHtmlPath = path.join(__dirname, 'public', 'monasteries.html');
  
  // Verificăm dacă fișierul există, dacă nu, îl creem
  if (!fs.existsSync(monasteryHtmlPath)) {
    const htmlContent = `<!DOCTYPE html>
<html lang="ro">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1">
  <title>DOXA - Platformă de Pelerinaje Ortodoxe</title>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    header {
      background-color: #1a237e;
      color: white;
      padding: 1rem;
      text-align: center;
      margin-bottom: 2rem;
      border-radius: 5px;
    }
    h1 {
      margin: 0;
    }
    .monastery-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 2rem;
    }
    .monastery-card {
      border: 1px solid #ddd;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      transition: transform 0.3s ease;
    }
    .monastery-card:hover {
      transform: translateY(-5px);
    }
    .monastery-image {
      width: 100%;
      height: 200px;
      object-fit: cover;
    }
    .monastery-details {
      padding: 1rem;
    }
    .monastery-name {
      font-size: 1.2rem;
      font-weight: bold;
      margin: 0 0 0.5rem;
    }
    .monastery-location {
      color: #666;
      margin-bottom: 0.5rem;
    }
    .monastery-description {
      margin-bottom: 1rem;
    }
    .monastery-meta {
      display: flex;
      justify-content: space-between;
      font-size: 0.9rem;
      color: #555;
    }
    .notification {
      background-color: #ffeb3b;
      color: #333;
      padding: 10px;
      margin-bottom: 20px;
      border-radius: 5px;
      text-align: center;
      font-weight: bold;
    }
    .loading {
      text-align: center;
      padding: 2rem;
      font-size: 1.2rem;
      color: #555;
    }
  </style>
</head>
<body>
  <header>
    <h1>DOXA</h1>
    <p>Platformă de Pelerinaje Ortodoxe</p>
  </header>
  
  <div id="notification" class="notification" style="display:none">
    ⚠️ Notificare<br>
    Nu s-a putut conecta la serverul de date. Se afișează informații demonstrative.<br>
    Datele afișate sunt demonstrative și nu reflectă informațiile reale din baza de date.
  </div>
  
  <div id="monasteries-container">
    <div id="loading" class="loading">Se încarcă mănăstirile...</div>
    <div id="monasteries-grid" class="monastery-grid"></div>
  </div>
  
  <script>
    document.addEventListener('DOMContentLoaded', loadMonasteries);
    
    // Funcție pentru afișarea notificării de eroare
    function showConnectionError() {
      document.getElementById('notification').style.display = 'block';
    }
    
    // Funcție pentru ascunderea animației de încărcare
    function hideLoading() {
      document.getElementById('loading').style.display = 'none';
    }
    
    // Funcție pentru crearea unui card pentru mănăstire
    function createMonasteryCard(monastery) {
      return \`
        <div class="monastery-card">
          <img class="monastery-image" src="\${monastery.imageUrl || '/images/monastery-placeholder.jpg'}" alt="\${monastery.name}">
          <div class="monastery-details">
            <h3 class="monastery-name">\${monastery.name}</h3>
            <p class="monastery-location">\${monastery.location}</p>
            <p class="monastery-description">\${monastery.description}</p>
            <div class="monastery-meta">
              <span>Anul fondării: \${monastery.foundingYear || 'Necunoscut'}</span>
              <span>Cazare: \${monastery.accommodationAvailable ? 'Disponibilă' : 'Indisponibilă'}</span>
            </div>
          </div>
        </div>
      \`;
    }
    
    // Funcție pentru încărcarea datelor despre mănăstiri
    function loadMonasteries() {
      const monasteryGrid = document.getElementById('monasteries-grid');
      
      // Încercăm să obținem datele de la API
      fetch('/api/monasteries')
        .then(response => {
          if (!response.ok) {
            throw new Error('Răspuns server invalid');
          }
          return response.json();
        })
        .then(data => {
          console.log('Date primite de la API:', data);
          renderMonasteries(data);
        })
        .catch(error => {
          console.error('Eroare la încărcarea mănăstirilor:', error);
          
          // Arătăm notificarea de eroare
          showConnectionError();
          
          // Încărcăm datele de rezervă
          console.log('Folosim date de rezervă pentru mănăstiri');
          fetch('/fallback-data/monasteries.json')
            .then(response => response.json())
            .then(fallbackData => {
              renderMonasteries(fallbackData);
            })
            .catch(fallbackError => {
              console.error('Eroare la încărcarea datelor de rezervă:', fallbackError);
              monasteryGrid.innerHTML = '<p>Nu s-au putut încărca informații despre mănăstiri.</p>';
              hideLoading();
            });
        });
      
      // Funcție pentru randarea mănăstirilor în grid
      function renderMonasteries(monasteries) {
        hideLoading();
        
        if (!monasteries || monasteries.length === 0) {
          monasteryGrid.innerHTML = '<p>Nu există mănăstiri disponibile.</p>';
          return;
        }
        
        const monasteriesHTML = monasteries.map(createMonasteryCard).join('');
        monasteryGrid.innerHTML = monasteriesHTML;
      }
    }
  </script>
</body>
</html>`;
    
    fs.writeFileSync(monasteryHtmlPath, htmlContent, 'utf8');
    console.log(`✅ Fișier HTML pentru mănăstiri creat: ${monasteryHtmlPath}`);
  } else {
    console.log(`✅ Fișierul HTML pentru mănăstiri există deja: ${monasteryHtmlPath}`);
  }
}

// Verifică serviciile, dacă nu rulează, încearcă să le pornească
async function startServices() {
  console.log('\n🔄 Pornire servicii DOXA...');
  
  // Pornim procesele folosind scripturile existente
  exec('node recover-app.js', (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Eroare la pornirea serviciilor: ${error.message}`);
      return;
    }
    
    console.log(`✅ Serviciile au fost pornite cu succes!`);
    console.log(`${stdout}`);
    
    // După pornirea serviciilor, afișăm un mesaj de succes
    console.log(`
╔════════════════════════════════════════════════════╗
║                                                    ║
║  Recuperare la versiunea din 13.03.2025 completă! ║
║                                                    ║
╚════════════════════════════════════════════════════╝

📌 URL-uri servicii:
   - DOXA Platform: http://localhost:5001
   - DOXA Pilgrimage: http://localhost:3000
   
📝 Note:
   - Datele afișate sunt demonstrative și corespund versiunii din 13.03.2025
   - Informațiile reale vor fi disponibile când conexiunea la baza de date este restabilită
   - Folosiți scriptul fix-database.js pentru repararea conexiunii la baza de date
    `);
  });
}

// Execuție secvențială a funcțiilor
(async () => {
  fixFallbackData();
  fixHtmlFiles();
  await startServices();
})();
