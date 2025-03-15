const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Creează un server HTTP simplu
const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  // Normalizează URL-ul cererii
  let filePath = '.' + req.url;
  if (filePath === './') {
    filePath = './index.html';
  }
  
  // Obține extensia fișierului
  const extname = path.extname(filePath);
  let contentType = MIME_TYPES[extname] || 'application/octet-stream';
  
  // Citește fișierul
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // Fișierul nu a fost găsit
        fs.readFile('./index.html', (err, content) => {
          if (err) {
            // Nu s-a putut încărca nici pagina de index
            res.writeHead(500);
            res.end('Eroare la încărcarea paginii: ' + err.code);
          } else {
            // Se afișează pagina de index
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content, 'utf-8');
          }
        });
      } else {
        // Altă eroare de server
        res.writeHead(500);
        res.end('Eroare de server: ' + err.code);
      }
    } else {
      // Succes - conținutul a fost citit
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

// Pornește serverul și ascultă pe toate interfețele (important pentru Replit)
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Serverul DOXA AI rulează pe portul ${PORT}`);
  console.log(`Data și ora: ${new Date().toISOString()}`);
  console.log('Serverul este accesibil la URL-ul Replit');
});