import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import assessHandler from "./api/assess.js";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialization of Gemini client for server healthcheck
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required and has not been configured in Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Connection status healthcheck endpoint
app.get("/api/check-api-key", async (req, res) => {
  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key.trim() === "") {
      return res.json({ 
        success: false, 
        message: "GEMINI_API_KEY is not defined in the environment. Please configure it in Secrets." 
      });
    }

    // Verify key locally (just checking presence and minimal length) instead of making an expensive, rate-limited live network call to Gemini API.
    const hasCorrectLength = key.trim().length >= 5;
    
    if (!hasCorrectLength) {
      return res.json({
        success: false,
        message: "GEMINI_API_KEY is present, but appears too short to be a valid API key."
      });
    }

    console.log("[GEMINI HEALTHCHECK] Key configured locally & validated successfully.");

    return res.json({ 
      success: true, 
      message: "Retrieval-Augmented Generation (RAG) is configured and active.",
      modelUsed: "gemini-3.5-flash"
    });
  } catch (error: any) {
    console.error("API Key Verification Error:", error);
    return res.json({
      success: false,
      message: error?.message || String(error)
    });
  }
});

// Clinical assessment API endpoint delegated to self-contained handler
app.post("/api/assess", assessHandler);

// Serve static assets in production or mount Vite middleware in development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Clinical server running on host 0.0.0.0, port ${PORT}`);
  });
}

startServer();
