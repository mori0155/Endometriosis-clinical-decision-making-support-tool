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
    if (!key) {
      return res.status(200).json({ 
        success: false, 
        message: "GEMINI_API_KEY is not defined in the environment. Please configure it in Settings > Secrets." 
      });
    }

    const ai = getGeminiClient();
    const result = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: "Respond with the word: ConnectSuccess",
      config: {
        maxOutputTokens: 10,
      }
    });

    const bodyText = result.text || "";
    if (bodyText.includes("ConnectSuccess") || bodyText.length > 0) {
      return res.status(200).json({ 
        success: true, 
        message: "Gemini API integration verified successfully.",
        modelUsed: "gemini-3.5-flash"
      });
    } else {
      return res.status(200).json({
        success: false,
        message: "Gemini API returned an incomplete response."
      });
    }
  } catch (error: any) {
    console.error("API Key Verification Error:", error);
    return res.status(200).json({
      success: false,
      message: error?.message || String(error)
    });
  }
}
