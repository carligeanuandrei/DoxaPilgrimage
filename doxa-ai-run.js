/**
 * Script pentru a rula aplicația DOXA AI fără a bloca consola
 * Acest script pornește un server HTTP pentru a servi fișierele statice ale aplicației DOXA AI
 * Adaptat pentru mediul Replit - ascultă pe 0.0.0.0
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Pornește un server simplu pentru a menține procesul activ și a afișa starea
const server = http.createServer((req, res) => {
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    
    // Generează un HTML cu informații despre DOXA
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>DOXA Server Status</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            h1 { color: #4a2882; }
            .status { padding: 15px; border-radius: 5px; margin: 20px 0; }
            .running { background-color: #d4edda; color: #155724; }
            pre { background: #f4f4f4; padding: 15px; overflow: auto; }
            .btn { display: inline-block; background: #4a2882; color: white; padding: 10px 15px; 
                   text-decoration: none; border-radius: 5px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <h1>DOXA Romanian Orthodox Platform - Server Status</h1>
          <div class="status running">
            <strong>✅ Server is running!</strong>
            <p>DOXA Platform server running on port 5000</p>
            <p>The main application is running in a separate process.</p>
          </div>
          
          <h3>Server Information:</h3>
          <pre>
Platform: ${process.platform}
Node.js: ${process.version}
Process ID: ${process.pid}
Working Directory: ${process.cwd()}
          </pre>
          
          <h3>How to access the application:</h3>
          <p>Open the web preview in Replit or access the external URL provided by Replit.</p>
          
          <a href="https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co" class="btn" target="_blank">
            Open Application
          </a>
        </body>
      </html>
    `;
    
    res.end(html);
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

// Pornește serverul de status pe un port diferit
const PORT = 3333;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Status server running at port ${PORT}`);
  console.log('Starting DOXA Application...');
  
  // Pornește aplicația principală într-un proces separat
  // Determină calea corectă pentru execuție
  const baseDir = fs.existsSync('./DoxaPilgrimage') ? './DoxaPilgrimage' : '.';
  
  // Pornește aplicația
  console.log(`Starting DOXA from directory: ${baseDir}`);
  const doxaProcess = spawn('npm', ['run', 'dev'], { 
    shell: true,
    stdio: 'inherit',
    cwd: baseDir
  });
  
  doxaProcess.on('error', (err) => {
    console.error('Failed to start DOXA process:', err);
  });
  
  // Ascultă pentru închiderea aplicației
  process.on('SIGINT', () => {
    console.log('Shutting down DOXA server...');
    doxaProcess.kill('SIGINT');
    server.close();
    process.exit(0);
  });
});