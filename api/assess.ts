import { GoogleGenAI, ThinkingLevel } from "@google/genai";
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

interface RetryParams {
  model: string;
  contents: any;
  config: any;
}

async function generateContentWithRetry(ai: GoogleGenAI, params: RetryParams, maxRetries = 2): Promise<any> {
  const modelsToTry = [params.model, "gemini-3.1-flash-lite"];
  let lastError: any = null;

  for (const modelName of modelsToTry) {
    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        console.log(`[GEMINI REQUEST] Querying model: ${modelName} (attempt ${attempt + 1}/${maxRetries})`);
        return await ai.models.generateContent({
          ...params,
          model: modelName,
        });
      } catch (err: any) {
        attempt++;
        const errorMessage = err?.message || String(err);
        const errLower = errorMessage.toLowerCase();
        
        // Detect quota or resource exhaustion limits
        const isQuotaExceeded = 
          errLower.includes("429") ||
          errLower.includes("resource_exhausted") ||
          errLower.includes("quota") ||
          errLower.includes("limit") ||
          errLower.includes("exhausted") ||
          errLower.includes("depleted") ||
          err?.status === "RESOURCE_EXHAUSTED" ||
          err?.code === 429;

        if (isQuotaExceeded) {
          console.warn(`[GEMINI QUOTA] Quota limit hit on model ${modelName}: ${errorMessage}`);
          const currentIdx = modelsToTry.indexOf(modelName);
          if (currentIdx < modelsToTry.length - 1) {
            const nextModel = modelsToTry[currentIdx + 1];
            console.warn(`[GEMINI FALLBACK] Automatically falling back to model: ${nextModel}`);
            break; // Break the current retry loop, moves to the next model in modelsToTry
          }
          lastError = err;
          throw err;
        }

        const isTransient = (errorMessage.includes("503") ||
                            errorMessage.includes("UNAVAILABLE") ||
                            errorMessage.includes("overloaded") ||
                            errorMessage.includes("high demand") ||
                            err?.status === "UNAVAILABLE" ||
                            err?.code === 503);

        if (isTransient && attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500;
          console.warn(`[GEMINI RETRY] API transient load/congestion error on ${modelName} (attempt ${attempt}/${maxRetries}): ${errorMessage}. Retrying in ${Math.round(delay)}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        lastError = err;
        throw err;
      }
    }
  }
  throw lastError || new Error("Failed to generate content after trying fallback models");
}

const Type = {
  OBJECT: "OBJECT" as const,
  ARRAY: "ARRAY" as const,
  STRING: "STRING" as const,
  INTEGER: "INTEGER" as const,
};

const RANZCOG_GUIDELINES = `
Australian Living Evidence Guideline: Endometriosis (RANZCOG) Guidelines:

1. Signs and Symptoms (CQ 1 / Page 14):
   - Commonest symptoms (associated with endometriosis in 25 to 70% of cases): severe painful periods (dysmenorrhoea), pain with sex (dyspareunia - pain during or after intercourse), infertility, pelvic pain, heavy menstrual bleeding.
   - Less common symptoms (associated with endometriosis in 10 to 25% of cases): bowel symptoms (constipation, diarrhoea, pain with bowel movement/dyschezia), severe tiredness, back pain, sleep difficulty, headache, urinary symptoms (dysuria, bladder pain, urine burn), allergies.
   - Clinical signs upon pelvic examination: reduced pelvic organ mobility, pelvic organ enlargement, posterior vaginal wall nodularity, pelvic and vaginal tenderness, visible vaginal endometriosis lesions. A normal examination does NOT exclude endometriosis.
   - Pelvic examination may be inappropriate or declined for some patients (e.g., adolescents, those who have not been sexually active, or those with vaginismus/vaginal muscle pain).
   - Medical history: Enquire about history of autoimmune disease (Sjogren's, Lupus, RA, Celiac) or first-degree relatives with a history of endometriosis.

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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

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

    // Build formatters for potentially multiple diagnostic findings/records
    const formatUltrasounds = () => {
      const parts = [];
      parts.push(`  * Primary Pelvic Ultrasound: Status: ${patientData.ultrasoundDone}, Findings: ${patientData.ultrasoundFindings || "None"}, Date Performed: ${patientData.ultrasoundDate || "Not entered"}`);
      if (patientData.ultrasounds && patientData.ultrasounds.length > 0) {
        patientData.ultrasounds.forEach((ul: any, idx: number) => {
          parts.push(`  * Additional Pelvic Ultrasound #${idx + 1}: Status: ${ul.done}, Findings: ${ul.findings || "None"}, Date Performed: ${ul.date || "Not entered"}`);
        });
      }
      return parts.join("\n");
    };

    const formatMris = () => {
      const parts = [];
      parts.push(`  * Primary Pelvic MRI: Status: ${patientData.mriDone}, Findings: ${patientData.mriFindings || "None"}, Date Performed: ${patientData.mriDate || "Not entered"}`);
      if (patientData.mris && patientData.mris.length > 0) {
        patientData.mris.forEach((m: any, idx: number) => {
          parts.push(`  * Additional Pelvic MRI #${idx + 1}: Status: ${m.done}, Findings: ${m.findings || "None"}, Date Performed: ${m.date || "Not entered"}`);
        });
      }
      return parts.join("\n");
    };

    const formatLaparoscopies = () => {
      const parts = [];
      parts.push(`  * Primary Diagnostic Laparoscopy: Status: ${patientData.laparoscopyDone}, Findings: ${patientData.laparoscopyFindings || "None"}, Date Performed: ${patientData.laparoscopyDate || "Not entered"}`);
      if (patientData.laparoscopies && patientData.laparoscopies.length > 0) {
        patientData.laparoscopies.forEach((l: any, idx: number) => {
          parts.push(`  * Additional Diagnostic Laparoscopy #${idx + 1}: Status: ${l.done}, Findings: ${l.findings || "None"}, Date Performed: ${l.date || "Not entered"}`);
        });
      }
      return parts.join("\n");
    };

    const formatCa125s = () => {
      const parts = [];
      parts.push(`  * Primary CA125 Biomarker: Status: ${patientData.ca125Done}, Value: ${patientData.ca125Value || "None"}, Date Performed: ${patientData.ca125Date || "Not entered"}`);
      if (patientData.ca125s && patientData.ca125s.length > 0) {
        patientData.ca125s.forEach((c: any, idx: number) => {
          parts.push(`  * Additional CA125 Biomarker #${idx + 1}: Status: ${c.done}, Value: ${c.value || "None"}, Date Performed: ${c.date || "Not entered"}`);
        });
      }
      return parts.join("\n");
    };

    // Build the query to Gemini
    const prompt = `
You are a highly specialised clinical AI tool designed to assist healthcare professionals in evaluating suspected or confirmed endometriosis and adenomyosis. Your evaluation and advice must be 100% strictly aligned with the attached RANZCOG living evidence guideline (provided below) as your "golden source".

Instructions:
1. Conduct a rigorous, critical review of the patient's symptoms, clinical history, pain patterns, and imaging findings against the RANZCOG guideline recommendations.
2. Ensure your language is strictly clinical, objective, and neutral in tone. Avoid promotional, creative, or non-medical adjectives.
3. Keep all text sections extremely concise, direct, and well-structured. Set a target length of under 180 words for clinicalReasoning and under 150 words for clinicSummary. Avoid fluff, repetitive sentences, or long essays.
4. If critical pieces of information are missing (such as Age, Fertility priorities, or Pelvic imaging status), you MUST formally acknowledge this. Do not make inferences or draw information from external sources. You must explicitly state why the absence of this information impairs the formulation of safe, accurate recommendations.
5. If they are young / adolescent (under 19), make sure you address the special considerations for adolescents defined in RANZCOG CQ18 (e.g. transabdominal ultrasound preference over transvaginal, validity of period pain, avoiding certain invasive procedures, referencing pediatric gynaecologist).
6. Determine the diagnostic probability of endometriosis dynamically ('Low', 'Moderate', 'High', or 'Insufficient Information') and explain your reasoning by citing RANZCOG recommendations directly. Assign a numeric confidencePercentage (0-100) reflecting how securely the patient's symptomatic burden, duration, history, exam details, and imaging align with established endometriosis benchmarks (e.g., highly suggestive ultrasound combined with multi-system symptoms would warrant both High Diagnostic Probability and high confidence (>90%), while subtle unsupported symptoms without positive imaging warrants lower diagnostic probability/confidence).
7. Provide referrals that closely correspond to the guideline criteria.
8. Break down management options exactly into Medical/Hormonal, Analgesics, Non-Pharmacological, and Surgical categories. Ensure you pay extreme attention to the contraception choice and fertility planning (e.g., highlighting that hormonal suppression is strictly contraindicated in patients attempting to conceive, citing CQ18 Recommendation 64).
9. Generate a "clinicSummary": a concise, formal, professional clinic EMR note (under 120 words using brief bullet points) that the clinician can copy directly into their records. Do NOT include full reference justifications, bibliography explanations, page-number brackets, or citations in this string itself (as they are already listed in the clinical insights section of the UI). Instead, focus strictly on summarizing the patient's objective clinical profile, diagnostic probability, confidence, first-line imaging status, and core clinical recommendations in brief points.
10. Crucially, if the patient's age lies outside the typical range of 15-45 (e.g., under 15 or over 45), you must explicitly address this in your clinicalReasoning and clinicSummary. Discuss any clinical implications or required differential diagnostics concisely.
11. Crucially, you MUST embed the GRADE Evidence base citation directly into the clinicalReasoning (i.e., the Assessment Analysis & Guideline Alignment) using page numbers in the format [pX] (e.g., [p14] for signs, [p18] or [p50] for imaging, [p17] or [p44] for referral, [p19] or [p60] for analgesic, [p20] or [p67] for hormonal, [p21] or [p73] for adenomyosis, [p21] or [p76] for laparoscopy/cystectomy, etc.). Ensure there are multiple page number citations embedded naturally in the paragraph text corresponding exactly to the guideline sections discussed.

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
- Desire for Fertility (Trying to conceive?): ${patientData.fertilityPriority}${patientData.fertilityPriority === 'yes' ? ` (Duration trying to conceive: ${patientData.tryingToConceiveMonths || "Not specified"} months; Partner fertility evaluation status: ${patientData.partnerFertilityStatus || "Not specified"})` : ""}
- Menstrual Cycle regularity & duration:
  * Regularity: ${patientData.menstrualCycleRegularity || "unspecified"}
  * Typical Cycle Length: ${patientData.menstrualCycleLength ? `${patientData.menstrualCycleLength} days` : "unspecified"}
  * Typical Period/Bleeding Duration: ${patientData.menstrualBleedingDuration ? `${patientData.menstrualBleedingDuration} days` : "unspecified"}
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
- Investigations and Imaging History:
${formatUltrasounds()}
${formatMris()}
${formatLaparoscopies()}
${formatCa125s()}

Golden Source Guidelines (RANZCOG):
${RANZCOG_GUIDELINES}

You must return a raw JSON response strictly conforming to the response schema. No markup outside the JSON. Do not prefix the output with any Markdown formatting like \`\`\`json. Only JSON.
`;

    // Call Gemini using the robust retry wrapper to handle transient demand spikes
    const response = await generateContentWithRetry(ai, {
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.LOW,
        },
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
            diagnosticProbability: {
              type: Type.STRING,
              description: "Must be one of: 'Low', 'Moderate', 'High', or 'Insufficient Information'."
            },
            confidencePercentage: {
              type: Type.INTEGER,
              description: "An estimated model confidence percentage (0 to 100) representing how securely the patient's symptomatic burden, duration, history, and imaging align with established endometriosis levels under the guidelines."
            },
            clinicalReasoning: {
              type: Type.STRING,
              description: "Concise step-by-step professional clinical evaluation of symptoms against RANZCOG guidelines. MUST include embedded page number citations in [pX] format (e.g. [p14]) throughout the paragraph text and be strictly under 180 words."
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
              description: "A concise, formal clinical note to be imported directly into the EMR clinic notes (strictly under 150 words) using clean bullet points."
            }
          },
          required: [
            "missingItemsList",
            "missingExplanation",
            "diagnosticProbability",
            "confidencePercentage",
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
}
