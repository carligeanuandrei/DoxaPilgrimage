/**
 * Script pentru a rula Platforma DOXA în mediul Replit
 * Acest script pornește serverul pentru platforma principală DOXA
 */
const express = require('express');
const path = require('path');
const fs = require('fs');

// Inițializare aplicație Express
const app = express();
const PORT = process.env.PORT || 5001; // folosim portul 5001 ca alternativă

// Banner de start
console.log(`
==========================================
        DOXA Platform Server         
==========================================

`);

// Servim fișierele statice din directorul principal
console.log('🌐 Configurare server pentru platforma DOXA...');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Rută de bază pentru verificarea stării
app.get('/status', (req, res) => {
  res.json({
    status: 'running',
    platform: 'doxa',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Rută pentru pagina de start
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rută de fallback pentru SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Pornirea serverului
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Platforma DOXA rulează pe http://localhost:${PORT}`);
  console.log(`🔄 Mediu: ${process.env.NODE_ENV || 'development'}`);
  console.log('📌 Apăsați Ctrl+C pentru a opri serverul\n');
});