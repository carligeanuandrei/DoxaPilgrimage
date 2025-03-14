import { Express, Request, Response } from "express";

/**
 * Înregistrează rutele pentru verificarea statusului serverului
 * Aceste rute sunt folosite pentru diagnosticare și monitorizare
 */
export function registerServerStatusRoutes(app: Express) {
  /**
   * GET /api/server-status
   * Returnează statusul serverului și informații despre mediu
   */
  app.get('/api/server-status', (req: Request, res: Response) => {
    const serverInfo = {
      status: 'online',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      replit: process.env.REPL_ID ? true : false,
      node_version: process.version,
      memory: process.memoryUsage(),
      uptime: process.uptime()
    };
    
    res.json(serverInfo);
  });
  
  /**
   * GET /api/server-status/html
   * Returnează o pagină HTML care arată statusul serverului
   */
  app.get('/api/server-status/html', (req: Request, res: Response) => {
    const uptime = process.uptime();
    const uptimeFormatted = formatUptime(uptime);
    const memoryUsage = Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100;
    
    const html = `
      <!DOCTYPE html>
      <html lang="ro">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>DOXA - Status Server</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f8f9fa;
            color: #333;
          }
          .container {
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          h1 {
            color: #3b5998;
            margin-bottom: 1rem;
          }
          .status {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 4px;
            font-weight: bold;
            background-color: #28a745;
            color: white;
          }
          .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 20px;
          }
          .info-card {
            padding: 16px;
            border-radius: 8px;
            background-color: #f8f9fa;
            border: 1px solid #e9ecef;
          }
          .info-card h3 {
            margin-top: 0;
            color: #3b5998;
          }
          .back-link {
            display: inline-block;
            margin-top: 20px;
            padding: 8px 16px;
            background-color: #3b5998;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            font-weight: 500;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>DOXA - Status Server</h1>
          <p>Status server: <span class="status">Online</span></p>
          
          <div class="info-grid">
            <div class="info-card">
              <h3>Informații Server</h3>
              <p><strong>Node.js:</strong> ${process.version}</p>
              <p><strong>Mediu:</strong> ${process.env.NODE_ENV || 'development'}</p>
              <p><strong>Platforma:</strong> ${process.platform}</p>
            </div>
            
            <div class="info-card">
              <h3>Performanță</h3>
              <p><strong>Uptime:</strong> ${uptimeFormatted}</p>
              <p><strong>Memorie utilizată:</strong> ${memoryUsage} MB</p>
              <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
            </div>
          </div>
          
          <a href="/" class="back-link">Înapoi la pagina principală</a>
        </div>
      </body>
      </html>
    `;
    
    res.send(html);
  });
}

/**
 * Formatează uptime-ul (în secunde) într-un format ușor de citit
 */
function formatUptime(uptime: number): string {
  const days = Math.floor(uptime / 86400);
  const hours = Math.floor((uptime % 86400) / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);
  
  if (days > 0) {
    return `${days}z ${hours}h ${minutes}m ${seconds}s`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}