import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";

// Setăm explicit mediul de dezvoltare în Replit
if (process.env.REPL_ID) {
  process.env.NODE_ENV = "development";
  console.log("Mediu de dezvoltare Replit detectat");
}

console.log(`Directoare disponibile:
- root: ${path.resolve(".")}
- public: ${path.resolve("public")}
- client: ${path.resolve("client")}
- node_modules: ${path.resolve("node_modules")}
`);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Servim fișierele statice din folderul public, care conține imagini și alte resurse
app.use('/public', express.static(path.resolve("public")));
app.use(express.static(path.resolve("public")));

// Servim și folderul node_modules și client în modul de dezvoltare
if (process.env.NODE_ENV === "development") {
  console.log("Servim fișiere statice din node_modules și client");
  
  // Configurăm MIME types corect pentru module ES
  express.static.mime.define({
    'application/javascript': ['js', 'mjs', 'jsx', 'tsx', 'ts'],
    'text/javascript': ['jsx', 'tsx', 'ts']
  });
  
  // Middleware personalizat pentru a asigura Content-Type corect pentru module ES
  app.use((req, res, next) => {
    const url = req.url;
    if (url.endsWith('.js') || url.endsWith('.mjs') || 
        url.endsWith('.jsx') || url.endsWith('.ts') || url.endsWith('.tsx')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    }
    next();
  });
  
  // Configurații standard pentru servirea fișierelor statice
  app.use('/node_modules', express.static(path.resolve("node_modules"), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.js') || filePath.endsWith('.mjs') || 
          filePath.endsWith('.jsx') || filePath.endsWith('.ts') || 
          filePath.endsWith('.tsx')) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      }
    }
  }));
  
  app.use('/client', express.static(path.resolve("client"), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.js') || filePath.endsWith('.mjs') || 
          filePath.endsWith('.jsx') || filePath.endsWith('.ts') || 
          filePath.endsWith('.tsx')) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      }
    }
  }));
  
  // Servim fișiere din directorul client/src
  app.use('/src', express.static(path.resolve("client/src"), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.js') || filePath.endsWith('.mjs') || 
          filePath.endsWith('.ts') || filePath.endsWith('.tsx') || 
          filePath.endsWith('.jsx')) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      }
    }
  }));
  
  // Adăugăm o redirecționare de la pagina principală către aplicația React completă
  app.get('/', (req, res) => {
    res.redirect('/client/');
  });
}

// Middleware pentru gestionarea timeout-urilor
app.use((req, res, next) => {
  // Setează un timeout pentru toate cererile API
  if (req.path.startsWith('/api')) {
    const timeoutMs = 8000; // 8 secunde
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        res.status(503).json({ 
          message: 'Cerere timeout. Serverul este prea ocupat, încercați din nou.',
          timeout: true
        });
      }
    }, timeoutMs);

    // Curăță timeout-ul când cererea se termină
    res.on('finish', () => clearTimeout(timeout));
    res.on('close', () => clearTimeout(timeout));
  }
  
  // Continuă cu middleware-ul de logging
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Check if we're in a Replit environment
  const isReplit = !!process.env.REPL_ID || !!process.env.REPL_OWNER;
  
  // For Replit, even if we can't bind to port 5000, we need to keep the process alive
  if (isReplit) {
    log("Running in Replit environment - will keep process alive even if port 5000 is unavailable");
  }
  
  // Try all ports, starting with 5000 which is what Replit expects
  let serverStarted = false;
  
  // Try to bind on port 5000 first
  server.listen(5000, "0.0.0.0", () => {
    log("⚡ Server is running on port 5000");
    serverStarted = true;
    process.env.PORT = "5000";
  }).on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      log("Port 5000 is already in use");
      
      // In Replit we need to keep the process alive even if we can't bind to port 5000
      if (isReplit) {
        // This is a workaround to keep the process alive for Replit
        log("In Replit environment - keeping process alive and trying alternative port");
        
        // Try on port 5001
        server.listen(5001, "0.0.0.0", () => {
          log("⚡ Server is running on port 5001");
          serverStarted = true;
          process.env.PORT = "5001";
        }).on('error', (err: any) => {
          log(`Error starting server on port 5001: ${err.message}`);
        });
      } else {
        log("Not in Replit - exiting due to port 5000 being unavailable");
        process.exit(1);
      }
    } else {
      log(`Error starting server: ${err.message}`);
      if (!isReplit) {
        process.exit(1);
      }
    }
  });
})();
