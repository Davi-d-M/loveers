import express from "express";
import path from "path";

const app = express();
app.use(express.json({ limit: "10mb" }));

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "EverGift API" });
});

// Paystack Transaction Verification Endpoint
app.get("/api/paystack/verify/:reference", async (req, res) => {
  try {
    const { reference } = req.params;
    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      return res.status(500).json({ error: "PAYSTACK_SECRET_KEY is not configured." });
    }

    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
    });

    const data = await response.json();
    res.json(data);
  } catch (err: any) {
    console.error("Paystack Verification Error:", err);
    res.status(500).json({ error: err?.message || "Verification failed" });
  }
});

// Development vs Production setup
if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  const setupDev = async () => {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);

    const PORT = 3000;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`EverGift server listening on http://localhost:${PORT}`);
    });
  };
  setupDev();
} else if (!process.env.VERCEL) {
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`EverGift local production server listening on port ${PORT}`);
  });
}

export default app;
