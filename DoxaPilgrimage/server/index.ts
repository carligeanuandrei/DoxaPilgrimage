import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
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

  // Simplified approach to starting server on an available port
  const preferredPort = 3000;
  
  // Close the server if it's already listening (which might happen during hot reload)
  if (server.listening) {
    log("Server is already running, closing and restarting...");
    server.close();
  }
  
  // Start the server directly
  server.listen(preferredPort, "0.0.0.0", () => {
    log(`⚡ Server is running on preferred port ${preferredPort}`);
  }).on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      const alternativePort = preferredPort + 1;
      log(`Default port ${preferredPort} is already in use, trying ${alternativePort}`);
      
      // Start on alternative port
      server.listen(alternativePort, "0.0.0.0", () => {
        log(`⚡ Server is running on alternative port ${alternativePort}`);
      });
    } else {
      log(`Error starting server: ${err.message}`);
      process.exit(1);
    }
  });
})();
