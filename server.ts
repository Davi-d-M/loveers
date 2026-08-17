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
  res.json({ status: "ok", service: "A Little Box of Goodies API" });
});

// Paystack Transaction Verification Endpoint
app.get("/api/paystack/verify/:reference", async (req, res) => {
  const { reference } = req.params;
  console.log(`[Paystack] Verifying reference: ${reference}`);

  try {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      console.error("[Paystack] PAYSTACK_SECRET_KEY is missing.");
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

// --- Enhanced Path Discovery ---
const isVercel = !!process.env.VERCEL;
const isProd = process.env.NODE_ENV === "production" || !!process.env.RENDER;

const getProductionPaths = () => {
  const possiblePaths = [
    path.resolve(process.cwd(), "dist"),
    path.resolve(__dirname, "dist"),
    path.resolve(__dirname, "..", "dist"),
    path.resolve(process.cwd(), "..", "dist"),
    path.resolve("/opt/render/project/src", "dist") // Explicit Render path
  ];

  console.log(`[Server] Searching for 'dist' in:`);
  possiblePaths.forEach(p => console.log(` - ${p}`));

  for (const p of possiblePaths) {
    const indexPath = path.join(p, "index.html");
    if (fs.existsSync(indexPath)) {
      return { distPath: p, indexPath };
    }
  }
  return null;
};

if (!isProd && !isVercel) {
  // Development Mode
  const setupDev = async () => {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);

    const PORT = 3000;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`A Little Box of Goodies dev server listening on http://localhost:${PORT}`);
    });
  };
  setupDev();
} else {
  // Production Mode
  const paths = getProductionPaths();

  if (paths) {
    console.log(`[Server] FOUND dist at: ${paths.distPath}`);
    app.use(express.static(paths.distPath));
  }

  app.get("*", (req, res, next) => {
    if (req.url.startsWith('/api/')) return next();

    if (paths && fs.existsSync(paths.indexPath)) {
      return res.sendFile(paths.indexPath);
    }

    // Emergency Diagnostics
    const cwdFiles = fs.readdirSync(process.cwd());
    const dirFiles = fs.readdirSync(__dirname);

    res.status(404).send(`
      <html>
        <body style="font-family: sans-serif; text-align: center; padding: 40px; background: #faf9f8;">
          <h1 style="color: #a3392f;">Vault Empty: Build Not Found</h1>
          <p>The server is running, but the built frontend files are missing.</p>
          <div style="text-align: left; background: #eee; padding: 20px; display: inline-block; border-radius: 8px; font-family: monospace; max-width: 90%;">
            <b>Current Dir:</b> ${process.cwd()}<br/>
            <b>Files:</b> ${cwdFiles.join(', ')}<br/><br/>
            <b>Server Dir:</b> ${__dirname}<br/>
            <b>Files:</b> ${dirFiles.join(', ')}
          </div>
          <hr/>
          <p>Verify your <b>Build Command</b> is: <code>npm run build</code></p>
        </body>
      </html>
    `);
  });

  if (!isVercel) {
    const PORT = Number(process.env.PORT) || 3000;
    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`A Little Box of Goodies production server listening on port ${PORT}`);
    }).on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`[Server] Port ${PORT} busy, trying ${PORT + 1}...`);
        server.listen(PORT + 1);
      }
    });
  }
}

export default app;
