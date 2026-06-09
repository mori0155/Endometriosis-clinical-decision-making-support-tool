import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

const Type = {
  OBJECT: "OBJECT" as const,
  ARRAY: "ARRAY" as const,
  STRING: "STRING" as const,
};

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialization of Gemini client
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

interface RetryParams {
  model: string;
  contents: any;
  config?: any;
}

async function generateContentWithRetry(ai: GoogleGenAI, params: RetryParams, maxRetries = 3): Promise<any> {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await ai.models.generateContent(params);
    } catch (err: any) {
      attempt++;
      const errorMessage = err?.message || String(err);
      const errLower = errorMessage.toLowerCase();
      const isTransient = (errorMessage.includes("503") ||
                          errorMessage.includes("UNAVAILABLE") ||
                          errorMessage.includes("overloaded") ||
                          errorMessage.includes("high demand") ||
                          err?.status === "UNAVAILABLE" ||
                          err?.code === 503) &&
                          !errLower.includes("429") &&
                          !errLower.includes("resource_exhausted") &&
                          !errLower.includes("quota") &&
                          !errLower.includes("limit") &&
                          !errLower.includes("exhausted") &&
                          !errLower.includes("depleted");

      if (isTransient && attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500;
        console.warn(`[GEMINI RETRY] API transient load/congestion error (attempt ${attempt}/${maxRetries}): ${errorMessage}. Retrying in ${Math.round(delay)}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw err;
    }
  }
}

// Summary of RANZCOG Guidelines extracted directly from the gold standard living evidence document
const RANZCOG_GUIDELINES = `
Australian Living Evidence Guideline: Endometriosis (RANZCOG) Guidelines:

1. Signs and Symptoms (CQ 1 / Page 14):
   - Commonest symptoms (associated with endometriosis in 25 to 70% of cases): severe painful periods (dysmenorrhoea), pain with sex (dyspareunia - pain during or after intercourse), infertility, pelvic pain, heavy menstrual bleeding.
   - Less common symptoms (associated with endometriosis in 10 to 25% of cases): bowel symptoms (constipation, diarrhoea, pain with bowel movement/dyschezia), severe tiredness, back pain, sleep difficulty, headache, urinary symptoms (dysuria, bladder pain, urine burn), allergies.
   - Clinical signs upon pelvic examination: reduced pelvic organ mobility, pelvic organ enlargement, posterior vaginal wall nodularity, pelvic and vaginal tenderness, visible vaginal endometriosis lesions. A normal examination does NOT exclude endometriosis.
   - Pelvic examination may be inappropriate or declined for some patients (e.g., adolescents, those who have not been sexually active, or those with vaginismus/vaginal muscle pain).
   - Medical history: Enquire about history of autoimmune disease (Sjogren's, Lupus, RA, Celiac) or first-degree relatives with a history of endometriosis (increases risk up to 30%).

2. Diagnosis and Pelvic Imaging (CQ 7 / Page 18, 50):
   - First-line investigation: Offer transvaginal pelvic ultrasound (TVUS) to all patients with symptoms suggestive of endometriosis, even if examinations are normal.
   - Alternative/Second-line pelvic imaging: Offer Pelvic MRI if TVUS is not appropriate, unavailable, or if deep endometriosis (bowel, bladder, ureter) or endometrioma is suspected for surgical mapping.
   - Adolescents / Non-sexually active: Suggest a transabdominal pelvic ultrasound (or MRI/transperineal if indicated by a specialist) instead of transvagal.
   - Exclusions: Do NOT use CT scan as a primary modality to investigate endometriosis (exposure to radiation, low sensitivity).
   - CA125: Serum CA125 is NOT recommended for routine endometriosis diagnosis due to high false negative rates. A normal score does not exclude the disease.

3. Referral Recommendations (CQ 5 & CQ 18 / Page 17, 44, 93):
   - Refer to secondary gynaecology services if:
     * Initial primary management (e.g. NSAIDs or first-line hormones) is not effective, not tolerated, or contraindicated.
     * Signs of endometriosis are found on physical examination and the patient fails first-line treatment.
     * Ultrasound/MRI imaging reports suggest an endometrioma or deep endometriosis.
     * Severe, persistent, or recurrent symptoms.
     * Concerns about fertility delay.
   - Deep Endometriosis referral: Suspected deep lesions involving bowel, bladder, or ureter must be referred to gynaecologists with advanced laparoscopic surgical expertise or specialized interdisciplinary services with colorectal/urological input.
   - Adolescents (CQ18 / Page 27, 103): Refer adolescents under 19 with suspected or confirmed endometriosis to a pediatric and adolescent gynaecologist, or a clinician experienced in managing young patients.
   - Infertility: If fertility is a major priority and delayed conception exists, refer to a fertility specialist.

4. Medical and Hormonal Management (CQ 12 & CQ 13 / Page 20, 67, 73):
   - First-line hormonal therapies: For patients NOT trying to conceive, offer combined oral contraceptives (COCs) or progestogens (oral e.g. dienogest or MPA, injection, implant, or LNG-IUD) as they have similar rates of pain improvement.
   - Pre-surgery: Pre-surgical hormonal treatment compared to placebo has little to no difference in pain and recurrence; treatment trial can be initiated prior to diagnostics.
   - Post-surgery: Offer postoperative hormonal suppression (minimum 6-12 months) of combined oral contraceptives, progestogens, or GnRH agonist for secondary prevention of recurrence in patients not trying to conceive.
   - Trying to conceive (Infertility Priority): Hormonal therapies are strictly contraindicated as they prevent conception and do NOT improve unassisted pregnancy rates alone or in combination with surgery.
   - Second-line hormonal therapies: GnRH agonists or GnRH antagonists can be considered under specialist recommendation if first-line fails. Always prescribe "add-back" hormone therapy to prevent bone mineral density loss and menopausal vasomotor symptoms.
   - Adenomyosis: Offer oral dienogest, oral contraceptives, LNG-IUD, or etonogestrel implant for pain and heavy bleeding control.

5. Surgical Management (CQ 14 / Page 21, 76):
   - Consider diagnostic or therapeutic laparoscopy preferably after a failed first-line medical trial.
   - Endometrioma surgery: It is strongly recommended to perform laparoscopic cyst excision (cystectomy) rather than cyst ablation or drainage, taking into account desire for fertility, as excision is associated with lower recurrence and no difference in ovarian reserve.
   - Laparoscopy is strongly preferred over open laparotomy.
   - Repeat surgery: Recommend careful consideration before recommending repeat laparoscopic surgery due to risks of adhesion formation.

6. Non-pharmacological & Support Options (CQ 10 & CQ 16 / Page 19, 23, 60, 86):
   - Analgesics: Offer a short trial of non-steroidal anti-inflammatory drugs (NSAIDs, e.g., ibuprofen) alone or combined with paracetamol. Opioid medications are ONLY indicated for short-term acute pain at minimum effective dose due to dependence risks.
   - Physical Therapy: Suggest a course of pelvic physiotherapy / pelvic floor muscle massage, as it improves pelvic pain and pain with sex (dyspareunia).
   - Psychological: Discuss and offer mindfulness classes, cognitive behavioural therapy, or psychological counselling to support coping, quality of life, and pain modulation.
   - Diet: Discuss potential benefits of low FODMAP diet, fish oil, and vitamin D supplements, but clarify that there is limited/very low evidence.
   - Acupuncture: Can be considered for short-term pain relief and quality of life enhancement.
   - Medicinal Cannabis (CQ 17 / Page 24, 90): Registered practitioners can discuss cannabis openly due to high patient prevalence, but must explain there is little formal clinical evidence on benefits/harms, no government subsidies, and strict prescribing regulations must be followed.

7. Asymptomatic Endometriosis (CQ 19 / Page 25, 96):
   - For patients with incidental finding of asymptomatic endometriosis/endometrioma on imaging, advise them of the low likelihood of progression and recommend expectant/individualised surveillance. Unnecessary medical/surgical interventions can cause harm.
`;

// Connection status healthcheck endpoint
app.get("/api/check-api-key", async (req, res) => {
  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key.trim() === "") {
      return res.json({ 
        success: false, 
        message: "GEMINI_API_KEY is not defined in the environment. Please configure it in Settings > Secrets." 
      });
    }

    // Verify key locally (just checking presence and minimal length) instead of making an expensive, rate-limited live network call to Gemini API.
    // This saves your free requests/day limit from being consumed on simple, automated page loads!
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

// Clinical assessment API endpoint
app.post("/api/assess", async (req, res) => {
  try {
    const patientData = req.body.patient;
    if (!patientData) {
      return res.status(400).json({ error: "Patient data object is required." });
    }

    // Lazy load and get model client
    const ai = getGeminiClient();

    // Check for critical missing variables in the input
    const missingItems: string[] = [];
    if (!patientData.age) {
      missingItems.push("Patient Age");
    } else {
      const ageNum = parseInt(patientData.age, 10);
      if (!isNaN(ageNum) && (ageNum < 15 || ageNum > 45)) {
        missingItems.push(`CLINICAL FLAG: Patient age (${ageNum} years) is outside the typical reproductive age range of 15-45 years`);
      }
    }
    if (patientData.fertilityPriority === "unspecified") {
      missingItems.push("Pregnancy / Fertility Intention (Trying to conceive vs. Not trying)");
    }
    if (patientData.ultrasoundDone === "no" && patientData.mriDone === "no") {
      missingItems.push("First-line Pelvic Imaging (Transvaginal/Transabdominal Ultrasound or MRI status)");
    }

    // Build the query to Gemini
    const prompt = `
You are a highly specialised clinical AI tool designed to assist healthcare professionals in evaluating suspected or confirmed endometriosis and adenomyosis. Your evaluation and advice must be 100% strictly aligned with the attached RANZCOG living evidence guideline (provided below) as your "golden source".

Instructions:
1. Conduct a rigorous, critical review of the patient's symptoms, clinical history, pain patterns, and imaging findings against the RANZCOG guideline recommendations.
2. Ensure your language is strictly clinical, objective, and neutral in tone. Avoid promotional, creative, or non-medical adjectives.
3. If critical pieces of information are missing (such as Age, Fertility priorities, or Pelvic imaging status), you MUST formally acknowledge this. Do not make inferences or draw information from external sources. You must explicitly state why the absence of this information impairs the formulation of safe, accurate recommendations.
4. If they are young / adolescent (under 19), make sure you address the special considerations for adolescents defined in RANZCOG CQ18 (e.g. transabdominal ultrasound preference over transvaginal, validity of period pain, avoiding certain invasive procedures, referencing pediatric gynaecologist).
5. Address the levels of suspicion dynamically (Low, Moderate, High, or Insufficient Information) and explain your reasoning by citing RANZCOG recommendations directly.
6. Provide referrals that closely correspond to the guideline criteria.
7. Break down management options exactly into Medical/Hormonal, Analgesics, Non-Pharmacological, and Surgical categories. Ensure you pay extreme attention to the contraception choice and fertility planning (e.g., highlighting that hormonal suppression is strictly contraindicated in patients attempting to conceive, citing CQ18 Recommendation 64).
8. Generate a "clinicSummary": a formal, professional clinic EMR note that the clinician can copy directly into their records. The summary should write out: clinical profile, level of suspicion, reference justifications, first-line imaging needs, and clinical recommendations.
9. Crucially, if the patient's age lies outside the typical range of 15-45 (e.g., under 15 or over 45), you must explicitly address this in your clinicalReasoning and clinicSummary. Discuss any clinical implications, guideline deviations, or required differential diagnostics (e.g., prepubertal or postmenopausal etiology).

Patient Profile Entered:
- Age: ${patientData.age || "Not entered"}${(() => {
  if (patientData.age) {
    const ageNum = parseInt(patientData.age, 10);
    if (!isNaN(ageNum) && (ageNum < 15 || ageNum > 45)) {
      return " (CLINICAL NOTE: Outside typical premenopausal reproductive age window of 15-45)";
    }
  }
  return "";
})()}
- Desire for Fertility (Trying to conceive?): ${patientData.fertilityPriority}
- Primary symptoms:
  * Severe painful periods (dysmenorrhea): ${patientData.severePainfulPeriods ? "YES" : "NO"}
  * Pain during or after sex (dyspareunia): ${patientData.painWithSex ? "YES" : "NO"}
  * Infertility / Difficulty conceiving: ${patientData.infertility ? "YES" : "NO"}
  * Pelvic pain (non-cyclical / persistent): ${patientData.pelvicPain ? "YES" : "NO"}
  * Heavy menstrual bleeding: ${patientData.heavyMenstrualBleeding ? "YES" : "NO"}
- Less common symptoms:
  * Bowel symptoms (diarrhoea/constipation/pain on bowel movement): ${patientData.bowelSymptoms ? "YES" : "NO"}
  * Severe tiredness: ${patientData.severeTiredness ? "YES" : "NO"}
  * Back pain: ${patientData.backPain ? "YES" : "NO"}
  * Sleep difficulty: ${patientData.sleepDifficulty ? "YES" : "NO"}
  * Headache / Migraine: ${patientData.headache ? "YES" : "NO"}
  * Urinary symptoms (dysuria, bladder pain, urine burn): ${patientData.urinarySymptoms ? "YES" : "NO"}
  * Allergies: ${patientData.allergies ? "YES" : "NO"}
- Additional user-specified custom symptoms (free-text):
  * ${patientData.otherSymptomsFreeText || "None entered"}
- Medical and Family History:
  * Autoimmune history: ${patientData.autoimmuneHistory ? "YES" : "NO"}${patientData.autoimmuneHistory && patientData.autoimmuneDetails && patientData.autoimmuneDetails !== 'none' ? ` (Specific condition: ${patientData.autoimmuneDetails === 'other' ? (patientData.autoimmuneOtherText || "Other") : patientData.autoimmuneDetails.replace('_', ' ')})` : ""}
  * First-degree relatives with endometriosis history: ${patientData.familyHistory ? "YES" : "NO"}${patientData.familyHistory && patientData.familyHistoryRelation && patientData.familyHistoryRelation !== 'none' ? ` (Relation: ${patientData.familyHistoryRelation})` : ""}
- Physical Examination:
  * Performed status: ${patientData.examinationPerformed}
  * Exam notes: ${patientData.examinationDetails || "No details provided"}
- Investigations History:
  * Ultrasound (TVUS/TAUS) performed: ${patientData.ultrasoundDone} ${patientData.ultrasoundDate ? `(Date performed: ${patientData.ultrasoundDate})` : ""}
  * Ultrasound findings: ${patientData.ultrasoundFindings || "No abnormal findings noted"}
  * Pelvic MRI performed: ${patientData.mriDone} ${patientData.mriDate ? `(Date performed: ${patientData.mriDate})` : ""}
  * pelvic MRI findings: ${patientData.mriFindings || "None"}
  * Diagnostic Laparoscopy performed: ${patientData.laparoscopyDone} ${patientData.laparoscopyDate ? `(Date performed: ${patientData.laparoscopyDate})` : ""}
  * Laparoscopy findings: ${patientData.laparoscopyFindings || "None"}
  * CA125 blood marker performed: ${patientData.ca125Done} ${patientData.ca125Date ? `(Date performed: ${patientData.ca125Date})` : ""}
  * CA125 level response: ${patientData.ca125Value || "None"}

Golden Source Guidelines (RANZCOG):
${RANZCOG_GUIDELINES}

You must return a raw JSON response strictly conforming to the response schema. No markup outside the JSON. Do not prefix the output with any Markdown formatting like \`\`\`json. Only JSON.
`;

    // Call Gemini using the robust retry wrapper to handle transient demand spikes
    const response = await generateContentWithRetry(ai, {
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            missingItemsList: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Array of items that are missing and prevent a completely accurate clinical assessment."
            },
            missingExplanation: {
              type: Type.STRING,
              description: "Clear clinical explanation of what cannot be decided because certain items are missing. Neutral clinical language."
            },
            levelOfSuspicion: {
              type: Type.STRING,
              description: "Must be one of: 'Low', 'Moderate', 'High', or 'Insufficient Information'."
            },
            clinicalReasoning: {
              type: Type.STRING,
              description: "Step-by-step professional clinical evaluation of the symptoms and examinations against the RANZCOG guideline."
            },
            citations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  recommendationNo: { type: Type.STRING, description: "e.g., CQ1 Rec 1, CQ7 Rec 14" },
                  type: { type: Type.STRING, description: "e.g., Conditional Recommendation, Good Practice Statement, Strong Recommendation" },
                  guidelineItem: { type: Type.STRING, description: "Short context key" },
                  explanation: { type: Type.STRING, description: "Citation details justifying this clinician recommendation" }
                },
                required: ["recommendationNo", "type", "guidelineItem", "explanation"]
              }
            },
            referrals: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of qualified referrals justified by the guidelines."
            },
            managementOptions: {
              type: Type.OBJECT,
              properties: {
                medical: { type: Type.ARRAY, items: { type: Type.STRING } },
                analgesic: { type: Type.ARRAY, items: { type: Type.STRING } },
                nonPharmacological: { type: Type.ARRAY, items: { type: Type.STRING } },
                surgical: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["medical", "analgesic", "nonPharmacological", "surgical"]
            },
            clinicSummary: {
              type: Type.STRING,
              description: "A comprehensive, formal clinical note to be imported directly into the EMR clinic notes. This note is intended to be editable by the clinician."
            }
          },
          required: [
            "missingItemsList",
            "missingExplanation",
            "levelOfSuspicion",
            "clinicalReasoning",
            "citations",
            "referrals",
            "managementOptions",
            "clinicSummary"
          ]
        }
      }
    });

    const textOutput = response.text;
    if (!textOutput) {
      throw new Error("Empty response returned from Gemini API");
    }

    // Try parsing the json output safely
    const parsedData = JSON.parse(textOutput.trim());
    return res.json({ result: parsedData });

  } catch (error: any) {
    console.error("Clinical assessment error:", error);
    
    const errMsg = error?.message || String(error);
    const lowErrMsg = errMsg.toLowerCase();
    
    // Check if the error is due to quota / limit / rate exhaustion
    if (
      lowErrMsg.includes("429") || 
      lowErrMsg.includes("resource_exhausted") || 
      lowErrMsg.includes("quota") || 
      lowErrMsg.includes("limit") || 
      lowErrMsg.includes("exhausted") || 
      lowErrMsg.includes("depleted")
    ) {
      return res.status(429).json({ 
        error: "The EndoAssessor has reached its daily capacity for analysing patient profiles. Access will be restored tomorrow. For urgent clinical use, please contact your local system support team/administrator." 
      });
    }

    // Check if the error is due to Model 503 high demand/rate limits
    if (lowErrMsg.includes("503") || lowErrMsg.includes("unavailable") || lowErrMsg.includes("high demand") || lowErrMsg.includes("overloaded")) {
      return res.status(503).json({ 
        error: "The clinical analysis engine (Gemini API) is currently experiencing peak high demand or transient server overload. Please click 'Run Clinical Evaluation' again in 5-10 seconds to retry." 
      });
    }
    
    return res.status(500).json({ error: error.message || "An error occurred during medical analysis." });
  }
});

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
