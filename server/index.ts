import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// Health check endpoint for deployment verification - responds immediately without database
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// CORS configuration
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

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

// ALWAYS serve the app on the port specified in the environment variable PORT
// Other ports are firewalled. Default to 5000 if not specified.
const port = parseInt(process.env.PORT || '5000', 10);

// Graceful error handling for async initialization
(async () => {
  try {
    // Register routes (returns HTTP server)
    const server = await registerRoutes(app);

    // Start listening IMMEDIATELY after routes are registered
    // This ensures health check responds quickly
    await new Promise<void>((resolve, reject) => {
      server.on('error', (error: NodeJS.ErrnoException) => {
        if (error.code === 'EADDRINUSE') {
          log(`Port ${port} is already in use`, "error");
          reject(error);
        } else {
          log(`Server error: ${error.message}`, "error");
          reject(error);
        }
      });

      server.listen({
        port,
        host: "0.0.0.0",
        reusePort: true,
      }, () => {
        log(`Server successfully started on port ${port}`);
        log(`Environment: ${app.get("env")}`);
        log(`Health check available at /health`);
        resolve();
      });
    });

    // Setup Vite AFTER server is listening (non-blocking)
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // Error handler middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      res.status(status).json({ message });
      log(`Error ${status}: ${message}`, "error");
    });

    // Handle uncaught exceptions and rejections
    process.on('uncaughtException', (error) => {
      log(`Uncaught Exception: ${error.message}`, "error");
      console.error(error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      log(`Unhandled Rejection at: ${promise}, reason: ${reason}`, "error");
      console.error(reason);
      process.exit(1);
    });

  } catch (error) {
    // Catch block for async initialization errors
    log(`Failed to initialize server: ${error instanceof Error ? error.message : 'Unknown error'}`, "error");
    console.error(error);
    process.exit(1);
  }
})();
