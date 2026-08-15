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

// --- Production Mode (Render, Vercel, etc.) ---
const PORT = Number(process.env.PORT) || 3000;
const isVercel = !!process.env.VERCEL;

// Explicitly resolve the dist folder path
const distPath = path.resolve(process.cwd(), "dist");
const indexPath = path.join(distPath, "index.html");

console.log(`[Server] Runtime Directory: ${process.cwd()}`);
console.log(`[Server] Serving static files from: ${distPath}`);

// Static files (CSS, JS, Images)
app.use(express.static(distPath));

// API fallback (if no endpoint matched above)
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Catch-all route to serve the frontend index.html
app.get("*", (req, res) => {
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    console.error(`[Server] ERROR: index.html not found at: ${indexPath}`);
    res.status(404).send(`
      <html>
        <body style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h1>Frontend build not found</h1>
          <p>Please ensure 'npm run build' completed successfully on Render.</p>
          <hr/>
          <p style="color: gray;">Looking in: ${indexPath}</p>
        </body>
      </html>
    `);
  }
});

// Only listen on a port if not on Vercel
if (!isVercel) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`EverGift production server listening on port ${PORT}`);
  });
}

export default app;
