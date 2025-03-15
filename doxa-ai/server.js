/**
 * Server pentru asistentul DOXA AI
 * Acest server expune API-ul pentru asistentul de pelerinaje ortodoxe
 */
const express = require('express');
const path = require('path');
const fs = require('fs');

// Inițializare server
const app = express();
const PORT = process.env.AI_PORT || 3333;

// Middleware
app.use(express.static(__dirname));
app.use(express.json());

// Activăm CORS pentru a permite cereri de la diferite origini
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Ruta principală care servește interfața 
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// API pentru interogări către asistentul AI
app.post('/api/chat', (req, res) => {
  const { message } = req.body;
  
  if (!message) {
    return res.status(400).json({
      success: false,
      error: 'Nu a fost furnizat niciun mesaj pentru interogare'
    });
  }
  
  // Răspunsuri predefinite pentru asistentul AI
  const responses = {
    "mănăstiri": "DOXA cuprinde informații despre 637 de mănăstiri din România, incluzând detalii despre istorie, program de vizitare și hram.",
    "pelerinaje": "Puteți planifica pelerinaje la diferite mănăstiri din România folosind platforma noastră. Vă recomandăm să verificați evenimentele religioase pentru a alege perioada optimă.",
    "post": "Perioadele principale de post în tradiția ortodoxă sunt: Postul Paștelui (cel mai lung și strict), Postul Crăciunului, Postul Sfinților Apostoli Petru și Pavel și Postul Adormirii Maicii Domnului.",
    "calendar": "Calendarul ortodox include principalele sărbători religioase precum Paștele, Rusaliile, Adormirea Maicii Domnului (15 august) și Nașterea Domnului (25 decembrie).",
    "ajutor": "Vă pot oferi informații despre mănăstiri, pelerinaje, tradiții ortodoxe, rețete de post și sărbători religioase. Întrebați-mă orice legat de aceste subiecte!",
    "default": "Mulțumesc pentru întrebarea dumneavoastră despre patrimoniul spiritual ortodox. Pentru informații mai detaliate, vă recomand să consultați secțiunile specializate ale platformei DOXA."
  };
  
  // Verificăm dacă mesajul conține cuvinte cheie pentru a determina răspunsul
  let responseText = responses.default;
  
  for (const [keyword, response] of Object.entries(responses)) {
    if (message.toLowerCase().includes(keyword)) {
      responseText = response;
      break;
    }
  }
  
  // Adăugăm un mic delay pentru a simula procesarea
  setTimeout(() => {
    res.json({
      success: true,
      message: responseText,
      timestamp: new Date().toISOString()
    });
  }, 1000);
});

// Endpoint pentru verificarea stării serverului
app.get('/status', (req, res) => {
  res.json({
    status: 'running',
    service: 'doxa-ai-assistant',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Pornim serverul
app.listen(PORT, '0.0.0.0', () => {
  console.log(`DOXA AI Assistant rulează pe port ${PORT}`);
  console.log(`Data și ora: ${new Date().toISOString()}`);
  console.log(`Accesează http://localhost:${PORT} pentru a interacționa cu asistentul`);
});