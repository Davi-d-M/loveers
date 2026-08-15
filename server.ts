import express from "express";
import path from "path";
import fs from "fs";

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

  // Resolve absolute path to dist
  const distPath = path.resolve(process.cwd(), "dist");
  const indexPath = path.join(distPath, "index.html");

  console.log(`[Server] Production mode active.`);
  console.log(`[Server] Serving static files from: ${distPath}`);

  // Safety check: Verify dist folder exists
  if (fs.existsSync(distPath)) {
    console.log(`[Server] Found dist folder at: ${distPath}`);
    app.use(express.static(distPath));
  } else {
    console.warn(`[Server] WARNING: dist folder NOT found at: ${distPath}`);
    console.log(`[Server] Current directory content:`, fs.readdirSync(process.cwd()));
  }

  // Catch-all route to serve the frontend for any non-API path
  app.get("*", (req, res, next) => {
    if (req.url.startsWith('/api/')) return next();

    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      console.error(`[Server] ERROR: index.html not found at: ${indexPath}`);
      res.status(404).send("Frontend build not found. Please run 'npm run build' first.");
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
