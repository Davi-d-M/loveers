import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: "10mb" }));

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "EverGift API" });
});

// Paystack Transaction Verification Endpoint
app.get("/api/paystack/verify/:reference", async (req, res) => {
  const { reference } = req.params;
  console.log(`[Paystack] Verifying reference: ${reference}`);

  try {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      console.error("[Paystack] PAYSTACK_SECRET_KEY is missing in environment variables.");
      return res.status(500).json({ status: false, message: "PAYSTACK_SECRET_KEY is not configured." });
    }

    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Paystack] API Error: ${response.status} - ${errorText}`);
      return res.status(response.status).json({ status: false, message: "Paystack API connection error." });
    }

    const data = await response.json();
    console.log(`[Paystack] Verification result for ${reference}:`, data.status);
    res.json(data);
  } catch (err: any) {
    console.error("[Paystack] Unexpected Verification Error:", err);
    res.status(500).json({ status: false, message: err?.message || "Internal server verification error" });
  }
});

// Environment-based setup
const isVercel = !!process.env.VERCEL;
const isProd = process.env.NODE_ENV === "production" || !!process.env.RENDER;

if (!isProd && !isVercel) {
  // --- Local Development Mode ---
  const setupDev = async () => {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);

    const PORT = 3000;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`EverGift dev server listening on http://localhost:${PORT}`);
    });
  };
  setupDev();
} else {
  // --- Production Mode (Render, Vercel, etc.) ---
  const PORT = Number(process.env.PORT) || 3000;

  // Resolve absolute path to dist relative to this file
  const distPath = path.resolve(__dirname, "dist");
  const indexPath = path.join(distPath, "index.html");

  console.log(`[Server] Production mode active.`);
  console.log(`[Server] __dirname: ${__dirname}`);
  console.log(`[Server] Serving static files from: ${distPath}`);

  // Safety check: Verify dist folder exists
  if (fs.existsSync(distPath)) {
    console.log(`[Server] Found dist folder at: ${distPath}`);
    app.use(express.static(distPath));
  } else {
    console.warn(`[Server] WARNING: dist folder NOT found at: ${distPath}`);
    // Check if dist exists in current working directory as fallback
    const cwdDist = path.resolve(process.cwd(), "dist");
    if (fs.existsSync(cwdDist)) {
      console.log(`[Server] Fallback: Found dist folder in CWD: ${cwdDist}`);
      app.use(express.static(cwdDist));
    } else {
      console.error(`[Server] CRITICAL: Could not find dist folder in __dirname or CWD.`);
      console.log(`[Server] Files in __dirname:`, fs.readdirSync(__dirname));
    }
  }

  // Catch-all route to serve the frontend for any non-API path
  app.get("*", (req, res, next) => {
    if (req.url.startsWith('/api/')) return next();

    // Try to serve index.html from __dirname/dist or process.cwd()/dist
    const finalIndexPath = fs.existsSync(indexPath) ? indexPath : path.join(process.cwd(), "dist", "index.html");

    if (fs.existsSync(finalIndexPath)) {
      res.sendFile(finalIndexPath);
    } else {
      console.error(`[Server] ERROR: index.html not found anywhere.`);
      res.status(404).send("Frontend build not found. Please ensure 'npm run build' completed successfully.");
    }
  });

  // Only listen on a port if not on Vercel (Vercel handles the listener)
  if (!isVercel) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`EverGift production server listening on port ${PORT}`);
    });
  }
}

export default app;
