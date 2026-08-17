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

// --- Smart Path Discovery for Production ---
const PORT = Number(process.env.PORT) || 3000;
const isVercel = !!process.env.VERCEL;

const getProductionPaths = () => {
  const possiblePaths = [
    path.resolve(process.cwd(), "dist"),
    path.resolve(__dirname, "dist"),
    path.resolve(__dirname, "..", "dist"),
    path.resolve(process.cwd(), "..", "dist")
  ];

  console.log(`[Server] Searching for build in:`);
  possiblePaths.forEach(p => console.log(` - ${p}`));

  for (const p of possiblePaths) {
    const indexPath = path.join(p, "index.html");
    if (fs.existsSync(indexPath)) {
      return { distPath: p, indexPath };
    }
  }
  return null;
};

const paths = getProductionPaths();

if (paths) {
  console.log(`[Server] Success! Found dist at: ${paths.distPath}`);
  app.use(express.static(paths.distPath));
} else {
  console.warn(`[Server] Initial path discovery failed. Current CWD: ${process.cwd()}`);
}

// Catch-all route
app.get("*", (req, res, next) => {
  if (req.url.startsWith('/api/')) return next();

  if (paths && fs.existsSync(paths.indexPath)) {
    return res.sendFile(paths.indexPath);
  }

  // Final Emergency Search
  const emergencyPaths = getProductionPaths();
  if (emergencyPaths) {
    return res.sendFile(emergencyPaths.indexPath);
  }

  // If still not found, log directory structure to help debug
  let dirCont: string[] = [];
  let rootCont: string[] = [];
  try { dirCont = fs.readdirSync(process.cwd()); } catch (e) { dirCont = ["Error reading CWD"]; }
  try { rootCont = fs.readdirSync(path.resolve(process.cwd(), "..")); } catch (e) { rootCont = ["Error reading Root"]; }

  res.status(404).send(`
    <html>
      <body style="font-family: sans-serif; text-align: center; padding: 50px; background: #faf9f8; color: #333;">
        <h1>Memory Vault: Build Link Missing</h1>
        <p>The server is looking for the <b>dist</b> folder but can't find it in the current environment.</p>

        <div style="text-align: left; background: #eee; padding: 20px; display: inline-block; border-radius: 8px; font-family: monospace; max-width: 80%; overflow-x: auto;">
          <b>Current Folder:</b> ${process.cwd()}<br/>
          <b>Files in this folder:</b><br/>
          ${dirCont.map(f => `- ${f}`).join('<br/>')}
          <br/><br/>
          <b>Files in parent folder:</b><br/>
          ${rootCont.map(f => `- ${f}`).join('<br/>')}
        </div>
        <hr/>
        <p><b>Action Required:</b> Check your Render dashboard. Ensure your "Build Command" is <code>npm run build</code> and that it completed without errors.</p>
      </body>
    </html>
  `);
});

if (!isVercel) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`EverGift server listening on port ${PORT}`);
  });
}

export default app;
