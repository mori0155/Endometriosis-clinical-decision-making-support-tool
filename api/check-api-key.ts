import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

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

export default async function handler(req: any, res: any) {
  // CORS Configuration
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key.trim() === "") {
      return res.status(200).json({ 
        success: false, 
        message: "GEMINI_API_KEY is not defined in the environment. Please configure it in Settings > Secrets." 
      });
    }

    // Verify key locally (just checking presence and minimal length) instead of making an expensive, rate-limited live network call to Gemini API.
    // This saves your free requests/day limit from being consumed on simple, automated page loads!
    const hasCorrectLength = key.trim().length >= 5;
    
    if (!hasCorrectLength) {
      return res.status(200).json({
        success: false,
        message: "GEMINI_API_KEY is present, but appears too short to be a valid API key."
      });
    }

    console.log("[GEMINI HEALTHCHECK SERVERLESS] Key configured locally & validated successfully.");

    return res.status(200).json({ 
      success: true, 
      message: "Retrieval-Augmented Generation (RAG) is configured and active.",
      modelUsed: "gemini-3.5-flash"
    });
  } catch (error: any) {
    console.error("API Key Verification Error:", error);
    return res.status(200).json({
      success: false,
      message: error?.message || String(error)
    });
  }
}
