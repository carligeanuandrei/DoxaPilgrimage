/**
 * Script pentru a rula aplicația DOXA AI fără a bloca consola
 * Acest script pornește un server HTTP pentru a servi fișierele statice ale aplicației DOXA AI
 * Adaptat pentru mediul Replit - ascultă pe 0.0.0.0
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const express = require('express');

// Portul pentru aplicația DOXA AI
const PORT = 3333;

// Banner de start
console.log(`
==========================================
        DOXA AI Assistant Server         
==========================================
`);

// Verifică dacă există directorul doxa-ai
const doxaAiDir = path.join(__dirname, 'doxa-ai');
if (!fs.existsSync(doxaAiDir)) {
  console.log(`ℹ️ Directorul doxa-ai nu a fost găsit. Pornire în modul server simplu pentru DOXA AI...`);
  console.log(`🔄 Starting simple HTTP server for DOXA AI...`);
  startSimpleServer();
} else {
  console.log(`ℹ️ Directorul doxa-ai a fost găsit. Pornire în modul standalone DOXA AI...`);
  console.log(`🔄 Starting standalone DOXA AI server...`);
  startStandaloneServer();
}

/**
 * Pornește un server standalone pentru DOXA AI
 * Aceasta este opțiunea preferată când avem un director doxa-ai complet
 */
function startStandaloneServer() {
  const app = express();
  
  // Configurare middleware
  app.use(express.static(path.join(__dirname, 'doxa-ai')));
  app.use(express.json());
  
  // Rută pentru pagina principală
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'doxa-ai', 'index.html'));
  });
  
  // Rută pentru verificarea stării
  app.get('/status', (req, res) => {
    res.json({
      status: 'running',
      platform: 'doxa-ai',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    });
  });
  
  // Pornire server
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Status server running at port ${PORT}`);
  });
}

/**
 * Pornește un server simplu care servește o pagină informativă
 * Aceasta este opțiunea de fallback când nu avem directorul doxa-ai
 */
function startSimpleServer() {
  // HTML simplu pentru pagina de bază
  const fallbackHTML = `
<!DOCTYPE html>
<html lang="ro">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DOXA AI Assistant</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      color: #333;
    }
    h1 {
      color: #0066cc;
      text-align: center;
      margin-bottom: 30px;
    }
    .container {
      border: 1px solid #ddd;
      border-radius: 10px;
      padding: 20px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
    .status {
      background: #e6f7ff;
      border-left: 4px solid #1890ff;
      padding: 10px 15px;
      margin: 20px 0;
    }
    footer {
      text-align: center;
      margin-top: 40px;
      color: #666;
      font-size: 0.9em;
    }
  </style>
</head>
<body>
  <h1>DOXA AI Assistant</h1>
  
  <div class="container">
    <h2>Status: Activ</h2>
    <p>Asistentul DOXA AI este în curs de rulare pe acest server.</p>
    
    <div class="status">
      <p><strong>Server Info:</strong> Rulează pe portul ${PORT}</p>
      <p><strong>Status:</strong> Activ și disponibil pentru interogări</p>
      <p><strong>Timestamp:</strong> <span id="timestamp"></span></p>
    </div>
    
    <h3>Despre DOXA AI</h3>
    <p>DOXA AI este un asistent inteligent specializat în patrimoniul cultural și spiritual ortodox românesc.</p>
    <p>Poate oferi informații despre:</p>
    <ul>
      <li>Mănăstiri și locații de pelerinaj</li>
      <li>Sărbători și evenimente religioase</li>
      <li>Tradiții și obiceiuri ortodoxe</li>
      <li>Rețete de post și informații despre perioadele de post</li>
    </ul>
  </div>
  
  <footer>
    <p>DOXA Platform &copy; 2023-2025. Toate drepturile rezervate.</p>
  </footer>
  
  <script>
    // Afișăm timestamp-ul curent
    document.getElementById('timestamp').textContent = new Date().toLocaleString('ro-RO');
    
    // Actualizăm timestamp-ul la fiecare minut
    setInterval(() => {
      document.getElementById('timestamp').textContent = new Date().toLocaleString('ro-RO');
    }, 60000);
  </script>
</body>
</html>
  `;
  
  // Răspuns simplu pentru ruta /status
  const statusResponse = JSON.stringify({
    status: 'running',
    platform: 'doxa-ai-fallback',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
  
  // Creăm serverul
  const server = http.createServer((req, res) => {
    // Setăm headerele CORS pentru a permite accesul de pe orice origin
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Verificăm calea cererii
    if (req.url === '/status') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(statusResponse);
    } else {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(fallbackHTML);
    }
  });
  
  // Pornim serverul
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Status server running at port ${PORT}`);
  });
}