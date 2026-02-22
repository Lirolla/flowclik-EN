import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
// import { createCheckoutSession } from "./stripe-checkout"; // REMOVIDO: Stripe
import { handleStripeWebhook } from "./stripeWebhook";
// import { handlePaddleWebhook } from "./paddleWebhook"; // REMOVIDO: Paddle
import multer from "multer";
import { storagePut, R2Paths } from "../storage";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  
  // Stripe webhook needs raw body (REMOVIDO)
  app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), handleStripeWebhook);
  
  // Paddle webhook (REMOVIDO)
  // app.post("/api/paddle/webhook", express.json(), handlePaddleWebhook);
  
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  
  
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  
  // 🔥 TESTE DE CONEXÃO DO BANCO
  app.get("/api/test-db", async (req, res) => {
    const logs: string[] = [];
    
    try {
      logs.push("[1] Importando módulos...");
      const mysql = await import("mysql2/promise");
      
      // Credenciais hardcoded
      const dbConfig = {
        host: '127.0.0.1',
        port: 3306,
        user: 'u219024948_flowclikbr',
        password: 'Pagotto24',
        database: 'u219024948_flowclikbr'
      };
      
      logs.push("[2] Configuração do banco:");
      logs.push(`   Host: ${dbConfig.host}`);
      logs.push(`   Port: ${dbConfig.port}`);
      logs.push(`   User: ${dbConfig.user}`);
      logs.push(`   Database: ${dbConfig.database}`);
      
      logs.push("[3] Tentando criar pool...");
      const pool = mysql.createPool(dbConfig);
      logs.push("[4] ✅ Pool criado!");
      
      logs.push("[5] Tentando obter conexão...");
      const connection = await pool.getConnection();
      logs.push("[6] ✅ Conexão obtida!");
      
      logs.push("[7] Testando ping...");
      await connection.ping();
      logs.push("[8] ✅ Ping OK!");
      
      logs.push("[9] Testando query simples...");
      const [rows] = await connection.query("SELECT 1 + 1 AS result");
      logs.push(`[10] ✅ Query OK! Resultado: ${JSON.stringify(rows)}`);
      
      logs.push("[11] Testando query na tabela tenants...");
      const [tenants] = await connection.query("SELECT COUNT(*) as total FROM tenants");
      logs.push(`[12] ✅ Tenants OK! Total: ${JSON.stringify(tenants)}`);
      
      connection.release();
      logs.push("[13] ✅ Conexão liberada!");
      
      logs.push("\n🎉 BANCO CONECTADO COM SUCESSO!");
      
      return res.json({
        success: true,
        message: "Banco conectado!",
        logs
      });
      
    } catch (error: any) {
      logs.push(`\n❌ ERRO: ${error.message}`);
      logs.push(`Stack: ${error.stack}`);
      
      return res.status(500).json({
        success: false,
        message: "Erro ao conectar",
        error: error.message,
        logs
      });
    }
  });
  
  // Stripe checkout (REMOVIDO)
  // app.post("/api/create-checkout-session", createCheckoutSession);
  
  // Generate and download album ZIP directly
  app.get("/api/download-album/:appointmentId", async (req, res) => {
    try {
      const appointmentId = parseInt(req.params.appointmentId);
      if (isNaN(appointmentId)) {
        return res.status(400).send("Invalid appointment ID");
      }

      // Import required modules
      const JSZip = (await import("jszip")).default;
      const axios = (await import("axios")).default;
      const { getDb } = await import("../db.js");
      const db = await getDb();
      if (!db) {
        return res.status(500).send("Database not available");
      }
      const { finalAlbums } = await import("../../drizzle/schema.js");
      const { eq } = await import("drizzle-orm");

      console.log(`[ZIP] Generating ZIP for appointment ${appointmentId}`);

      // Get final photos from finalAlbums table
      const photos = await db
        .select()
        .from(finalAlbums)
        .where(eq(finalAlbums.appointmentId, appointmentId));

      console.log(`[ZIP] Found ${photos.length} photos`);

      if (photos.length === 0) {
        return res.status(404).send("No photos found");
      }

      // Create ZIP
      const zip = new JSZip();

      // Download and add each photo to ZIP
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        try {
          console.log(`[ZIP] Downloading photo ${i + 1}/${photos.length}: ${photo.photoUrl}`);
          const response = await axios.get(photo.photoUrl, {
            responseType: "arraybuffer",
            timeout: 30000,
          });
          const filename = photo.fileName || `photo-${i + 1}.jpg`;
          zip.file(filename, response.data);
          console.log(`[ZIP] Added ${filename} to ZIP`);
        } catch (error) {
          console.error(`[ZIP] Failed to download photo ${photo.id}:`, error);
        }
      }

      console.log(`[ZIP] Generating ZIP buffer...`);
      // Generate ZIP buffer
      const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
      console.log(`[ZIP] ZIP buffer generated: ${zipBuffer.length} bytes`);

      // Send ZIP file
      res.setHeader("Content-Type", "application/zip");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="album-${appointmentId}.zip"`
      );
      res.send(zipBuffer);
      console.log(`[ZIP] ZIP file sent to client`);
    } catch (error) {
      console.error("[ZIP] Error generating ZIP:", error);
      res.status(500).send("Error generating ZIP file");
    }
  });

  // Serve temporary ZIP downloads
  app.get("/api/download/:filename", async (req, res) => {
    try {
      const { filename } = req.params;
      const path = await import("path");
      const fs = await import("fs/promises");
      
      const zipPath = path.join(process.cwd(), "tmp", filename);
      
      // Check if file exists
      try {
        await fs.access(zipPath);
      } catch {
        return res.status(404).json({ error: "File not found" });
      }
      
      // Send file
      res.download(zipPath, filename, async (err) => {
        if (err) {
          console.error("Download error:", err);
        }
        // Delete file after download
        try {
          await fs.unlink(zipPath);
        } catch (e) {
          console.error("Error deleting temp file:", e);
        }
      });
    } catch (error) {
      console.error("Download endpoint error:", error);
      res.status(500).json({ error: "Download failed" });
    }
  });
  
  // File upload
  const upload = multer({ storage: multer.memoryStorage() });
  app.post("/api/upload", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      // TODO: Get tenantId from session/auth
      const tenantId = 1; // Temporary hardcoded
      const fileName = `${Date.now()}-${req.file.originalname}`;
      const fileKey = R2Paths.portfolio(tenantId, fileName);
      const { url } = await storagePut(fileKey, req.file.buffer, req.file.mimetype);
      res.json({ url });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Upload failed' });
    }
  });
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
