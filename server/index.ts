import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Logging Middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (req.path.startsWith("/api")) {
      console.log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
    }
  });
  next();
});

// Health Check
app.get("/health", (req, res) => res.status(200).send("OK"));
app.get("/api/health", (req, res) =>
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
);

// ==========================================
// API ROUTES
// ==========================================

// SKU Routes
import skuRouter from "./routes/skus";
app.use("/api/skus", skuRouter);

// Lead Routes
import leadRouter from "./routes/leads";
app.use("/api/leads", leadRouter);

// Call Routes
import callRouter from "./routes/calls";
app.use("/api/calls", callRouter);

// Quote Routes
import quoteRouter from "./routes/quotes";
app.use("/api/quotes", quoteRouter);

// Invoice Routes
import invoiceRouter from "./routes/invoices";
app.use("/api/invoices", invoiceRouter);

// Landing Page Routes
import landingPageRouter from "./routes/landing-pages";
app.use("/api/landing-pages", landingPageRouter);

// ==========================================
// STATIC FILE SERVING (Production)
// ==========================================

if (process.env.NODE_ENV === "production") {
  const publicPath = path.resolve(__dirname, "../dist/public");
  app.use(express.static(publicPath));
  app.get("*", (req, res) => {
    if (!req.path.startsWith("/api")) {
      res.sendFile(path.join(publicPath, "index.html"));
    }
  });
}

// ==========================================
// VITE DEV SERVER PROXY (Development)
// ==========================================

if (process.env.NODE_ENV !== "production") {
  const { createServer: createViteServer } = await import("vite");
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
}

// ==========================================
// START SERVER
// ==========================================

const PORT = process.env.PORT || 5001;
const server = createServer(app);

server.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   ⚡ ROOKETRADE ELECTRICAL                                ║
║   Server running on http://localhost:${PORT}               ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});
