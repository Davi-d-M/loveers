import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

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

// AI Letter / Poem Generator Endpoint
app.post("/api/gemini/letter", async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({
        error: "GEMINI_API_KEY environment variable is missing. Please configure it in the Secrets panel."
      });
    }

    const { prompt, tone, recipientName, senderName, occasion } = req.body;
    const ai = new GoogleGenAI({ apiKey });

    const systemPrompt = `You are an empathetic, poetic, and heartwarming AI assistant for EverGift, a digital keepsake platform.
Your task is to write a deeply personal, touching letter or poem based on the user's intent.

Context:
- Recipient: ${recipientName || "Loved one"}
- Sender: ${senderName || "Someone special"}
- Occasion: ${occasion || "Just because"}
- Desired Tone: ${tone || "Heartfelt & Romantic"}

User instructions / memories:
"${prompt}"

Rules:
- Write in a natural, emotional, and beautiful voice.
- Avoid robotic corporate clichés ("in this realm", "delve", "testament").
- Keep paragraph lengths rhythmic and comfortable for reading.
- Include subtle placeholders or brackets if the user might want to customize dates or names [e.g., (that sunny afternoon)].
- Keep response under 350 words unless specifically asked for longer.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [systemPrompt]
    });

    res.json({ text: response.text });
  } catch (err: any) {
    console.error("Gemini API Error:", err);
    res.status(500).json({ error: err?.message || "Failed to generate AI letter" });
  }
});

// AI Life Story / Cinematic Narrative Generator Endpoint
app.post("/api/gemini/life-story", async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({
        error: "GEMINI_API_KEY environment variable is missing."
      });
    }

    const { memories, title, theme } = req.body;
    const ai = new GoogleGenAI({ apiKey });

    const promptText = `Given these memory moments in a gift package titled "${title || 'Cherished Moments'}" with theme "${theme || 'Ethereal'}":
${JSON.stringify(memories, null, 2)}

Write a cinematic, chapter-by-chapter story narration (3 short chapters).
Each chapter should have a Chapter Title, a short poetic passage (2-3 sentences), and a suggested background music mood.
Return pure JSON with format:
{
  "narrativeTitle": "string",
  "chapters": [
    { "chapter": 1, "title": "string", "narrative": "string", "musicMood": "string" }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [promptText],
      config: {
        responseMimeType: "application/json"
      }
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (err: any) {
    console.error("Gemini Life Story Error:", err);
    res.status(500).json({ error: err?.message || "Failed to generate life story" });
  }
});

// Development vs Production setup
if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  const setupDev = async () => {
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
} else {
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

export default app;
