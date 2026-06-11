import React, { useState, useEffect } from 'react';
import { PatientDetails, ClinicalAssessmentResult } from './types';
import { AssessmentForm } from './components/AssessmentForm';
import { AssessmentResults } from './components/AssessmentResults';
import { 
  ShieldAlert, 
  Activity, 
  BookOpen, 
  ChevronRight,
  ClipboardCheck,
  AlertCircle,
  FileText,
  X
} from 'lucide-react';

interface CQGuideline {
  title: string;
  question: string;
  keyRecommendations: string[];
  clinicalSignificance: string;
}

const CQ_DETAILS: Record<string, CQGuideline> = {
  CQ1: {
    title: "CQ1: Signs & Symptoms Profiling (page 14 of the RANZCOG Australian Living Evidence Guideline for Endometriosis)",
    question: "Do certain signs or symptoms predict the presence of endometriosis?",
    keyRecommendations: [
      "Commonest symptoms (25% - 70% prevalence) [p14]: severe painful periods (dysmenorrhoea), deep pain during or after sex (dyspareunia), pelvic pain (chronic or cyclical), heavy menstrual bleeding, and infertility.",
      "Less common symptoms (10% - 25% prevalence) [p14]: bowel symptoms (constipation, pain on bowel movement/dyschezia, bloating), chronic fatigue/tiredness, back pain, sleep difficulties, headache/cyclical migraines, urinary symptoms (urine burn/dysuria), and history of allergies (such as hay fever or sinusitis).",
      "Common signs during pelvic examination [p14]: reduced pelvic organ mobility, enlargement of pelvic organs, visible vaginal lesions, tenderness in the vagina/pelvic structures, or posterior vaginal wall nodularity.",
      "Clinical Note [p14]: A normal pelvic examination does NOT exclude endometriosis. Examination may be inappropriate or declined (especially in adolescents or those with vaginismus/no sexual activity history)."
    ],
    clinicalSignificance: "Comprehensive recording of multi-system clinical symptoms is the cornerstone of clinical suspicion, driving key decisions in accordance with page 14 of the RANZCOG Australian Living Evidence Guideline for Endometriosis."
  },
  CQ2: {
    title: "CQ2: Patient Information Needs & Experiences (pages 15 & 30 of the RANZCOG Australian Living Evidence Guideline)",
    question: "What information and support do patients with endometriosis find most beneficial?",
    keyRecommendations: [
      "Offer personalized, high-quality information upon diagnosis [p15]: Ensure educational materials address disease mechanisms, treatment possibilities, fertility impacts, and physiological coping strategies.",
      "Promote cooperative clinician-patient communication models [p30]: Actively validate chronic period pain as real, mitigating feelings of being dismissed by medical practitioners.",
      "Tailor support options dynamically based on patient age groups [p30]: Offer targeted resources for adolescents versus patients nearing postmenopause."
    ],
    clinicalSignificance: "Validating patient experiences and providing high-quality educational material significantly reduces psychological stress, builds self-efficacy, and shortens diagnostic pathways."
  },
  CQ3: {
    title: "CQ3: Support Groups & Self-Management (pages 16 & 35 of the RANZCOG Australian Living Evidence Guideline)",
    question: "What has been shown to improve self-efficacy and coping in endometriosis self-management?",
    keyRecommendations: [
      "Acknowledge patient peer support networks [p16]: Joining verified peer support groups can improve community connections, decrease functional isolation, and enhance continuous coping.",
      "Recommend self-management toolkits [p35]: Guide patients toward evidence-informed trackers, educational modules, and pain-coping diaries.",
      "Acknowledge partner and family involvement [p35]: Educating caregivers or partners on the functional impact of chronic pain enhances relationship resilience and coping."
    ],
    clinicalSignificance: "Self-management strategies combined with structured support networks empower patients to take an active role in their ongoing physical and mental care plans."
  },
  CQ4: {
    title: "CQ4: Diagnostic Delay and Health Pathways (pages 16 & 40 of the RANZCOG Australian Living Evidence Guideline)",
    question: "How can the diagnostic delay (averaging 6.5 - 8 years) be reduced in clinical practice?",
    keyRecommendations: [
      "Improve early symptom tracking [p16]: Utilize standardized clinical symptom questionnaires (like the pelvic pain index) to identify cyclical signs early.",
      "Establish structured diagnostic pathways [p40]: Create automated prompts in Electronic Medical Records (EMR) for persistent painful periods failing first-line remedies.",
      "Enhance professional education [p40]: Educate primary care providers to avoid normalizing severe cyclic pelvic pain as standard menstruation."
    ],
    clinicalSignificance: "Proactive symptom mapping and optimized primary care pathways successfully reduce diagnostic latency, preventing long-term pain centralisation."
  },
  CQ5: {
    title: "CQ5: Referral to Secondary Care (pages 17 & 44 of the RANZCOG Australian Living Evidence Guideline for Endometriosis)",
    question: "When should a patient with suspected/confirmed endometriosis be referred?",
    keyRecommendations: [
      "Refer to secondary gynaecology services [p17]: When first-line primary management (such as NSAIDs or combined oral contraceptives) is not effective, is poorly tolerated, or is contraindicated.",
      "Refer upon physical signs [p17]: Refer when abnormal pelvic signs are found on physical examination and the patient fails empirical therapy.",
      "Refer based on imaging findings [p44]: Refer immediately when diagnostic pelvic imaging (TVUS or MRI) suggests the presence of an endometrioma or deep endometriosis involving the bowel, bladder, or ureters.",
      "Refer for advanced surgery [p44]: Suspected deep lesions involving bowel, bladder, or ureters must be referred to gynaecologists with advanced laparoscopic surgical expertise or specialized interdisciplinary services with colorectal/urological input."
    ],
    clinicalSignificance: "Timely referral avoids diagnostic delay and ensures patients are matched with the appropriate tier of clinical or surgical expertise in accordance with pages 17 & 44 of the RANZCOG Australian Living Evidence Guideline for Endometriosis."
  },
  CQ6: {
    title: "CQ6: Pelvic Examination and Clinical Signs (pages 17 & 48 of the RANZCOG Australian Living Evidence Guideline)",
    question: "When and how should physical pelvic examinations be offered for suspected endometriosis?",
    keyRecommendations: [
      "Perform clinical pelvic examination [p17]: Offer checking for pelvic tenderness, organ mobility, retroversion, adnexal masses, or vaginal nodularity to establish baseline findings.",
      "Contraindications / Decline criteria [p17, p48]: A pelvic exam is inappropriate for pediatric/adolescent patients, patients with no coital history, or patients with severe vaginismus; respect all patient decisions to decline.",
      "Examination Limitations [p48]: A normal physical examination does NOT exclude the presence of superficial or deep endometriosis; pelvic imaging is still recommended if symptoms persist."
    ],
    clinicalSignificance: "Physical examinations provide valuable direct markers of deep pelvic disease (such as nodularity or fixation), but must be performed with strict clinical consent and age-specific safety protocols."
  },
  CQ7: {
    title: "CQ7: Pelvic Diagnostic Imaging (pages 18 & 50 of the RANZCOG Australian Living Evidence Guideline for Endometriosis)",
    question: "What imaging modality should be used first-line for suspected endometriosis?",
    keyRecommendations: [
      "First-line Pelvic Ultrasound [p18]: Offer transvaginal pelvic ultrasound (TVUS) to all patients with symptoms suggestive of endometriosis, even if examinations are normal.",
      "Alternative Imaging for Adolescents / Non-sexually active [p50]: Offer transabdominal pelvic ultrasound (or MRI/transperineal scan if indicated) if transvaginal imaging is not appropriate, unavailable, or declined.",
      "Alternative/Second-line Imaging [p18, p50]: Provide Pelvic MRI as a second-line investigation if TVUS is inconclusive, unavailable, or if deep endometriosis (bowel, bladder, ureter) or endometrioma is suspected for surgical mapping.",
      "Exclusions & Marker limits [p18]: Do NOT use CT scan as a primary modality to investigate endometriosis due to low sensitivity and radiation exposure. Do NOT use regular serum CA125 assays as a routine diagnostic tool (low sensitivity; a normal CA125 does not exclude endometriosis)."
    ],
    clinicalSignificance: "Advanced pre-surgical imaging protocols optimize mapping of deep endometriosis lesions across pelvic structures in accordance with pages 18 & 50 of the RANZCOG Australian Living Evidence Guideline for Endometriosis."
  },
  CQ8: {
    title: "CQ8: Biomarkers in Diagnosis (pages 18 & 54 of the RANZCOG Australian Living Evidence Guideline)",
    question: "What is the diagnostic value of blood, serum, or urine biomarkers for endometriosis?",
    keyRecommendations: [
      "Do NOT use serum CA125 as a primary diagnostic assay [p18]: Regular serum CA125 assays are unreliable for screening or detecting superficial disease due to poor clinical specificity and high false-negatives.",
      "Acknowledge normal biomarkers do NOT exclude disease [p54]: Do not reassure patients that they do not have endometriosis based only on regular blood panels.",
      "Do NOT use endometrial biopsy or urine biomarkers [p54] for routine screening, as there is insufficient diagnostic evidence to justify clinical utility."
    ],
    clinicalSignificance: "Over-reliance on blood markers can delay care; negative assays cannot rule out pelvic lesions and must always be supplemented by high-quality imaging trials."
  },
  CQ9: {
    title: "CQ9: Diagnostic Laparoscopy (pages 19 & 56 of the RANZCOG Australian Living Evidence Guideline)",
    question: "When is a diagnostic laparoscopy indicated for establishing an endometriosis diagnosis?",
    keyRecommendations: [
      "Offer laparoscopy for definitive histological diagnosis [p19]: Diagnostic laparoscopy with biopsy remains the gold standard, although empirical management can be attempted first.",
      "Failed Medical Trial Preference [p19]: Diagnostic or therapeutic laparoscopy should preferably be considered after a failed first-line medical/suppressive trial.",
      "Surgical mapping requirement [p56]: Ensure high-quality pre-surgical imaging (ultrasound or pelvic MRI) is performed prior to schedules to map deep peritoneal layout."
    ],
    clinicalSignificance: "While gold standard for tissue evidence, diagnostic laparoscopy carries operative risks and should be reserved for therapeutic excision or patients who do not respond to clinical therapies."
  },
  CQ10: {
    title: "CQ10: Analgesic Treatments (pages 19 & 60 of the RANZCOG Australian Living Evidence Guideline for Endometriosis)",
    question: "Which non-hormonal analgesic options should be offered to control pain?",
    keyRecommendations: [
      "First-line Analgesic Trial [p19]: Offer a short-term trial of non-steroidal anti-inflammatory drugs (NSAIDs, e.g., Naproxen or Ibuprofen) alone or in combination with Paracetamol/Acetaminophen for primary pain management.",
      "Opioid Constraints [p19, p60]: Caution: Do NOT prescribe opioid medications for routine, long-term chronic pelvic pain due to severe dependency risks and minimal evidence of benefit for neuropathic cyclic pain. Use only at lowest effective doses for acute severe flare-ups.",
      "Alternative supportive care [p60]: Discuss secondary non-pharmacological therapies such as acupuncture, low-FODMAP diet, fish oil, and vitamin D supplements, noting that evidence is limited but valuable for self-management."
    ],
    clinicalSignificance: "Effective non-hormonal pain relief ensures physical coping capacity during diagnostic investigations or while awaiting specialist assessment in accordance with pages 19 & 60 of the RANZCOG Australian Living Evidence Guideline for Endometriosis."
  },
  CQ11: {
    title: "CQ11: Neuromodulators & Adjunctive Pain Therapies (pages 20 & 64 of the RANZCOG Australian Living Evidence Guideline)",
    question: "What is the role of neuromodulating medications in treating chronic pelvic pain?",
    keyRecommendations: [
      "Consider neuromodulators under specialist guidance [p20]: Offer trying low-dose Amitriptyline, Gabapentin, or Pregabalin for patients with centralized chronic pelvic pain.",
      "Monitor adverse neuropathic profiles [p64]: Conduct regular evaluations of cognitive, depressive, and somnolence side effects associated with gabapentinoids.",
      "Integrate with multidisciplinary pathways [p64]: Neuromodulators are most effective when combined with pelvic physiotherapy, pain counseling, and clinical cycle controls."
    ],
    clinicalSignificance: "Neuropathy and centralization often sustain pelvic pain even after surgical clearing; neuromodulation can safely re-regulate sensory pathways under supervision."
  },
  CQ12: {
    title: "CQ12: Hormonal Suppression Trials (pages 20 & 67 of the RANZCOG Australian Living Evidence Guideline for Endometriosis)",
    question: "What are the first-line and second-line medical hormonal options?",
    keyRecommendations: [
      "First-line Hormonals [p20]: For patients not trying to conceive, offer combined oral contraceptives (COCs) or progestogens (such as oral dienogest, medroxyprogesterone injection, or LNG-IUD) as first-line empirical treatments.",
      "Treatment Selection [p20]: All first-line hormonal treatments demonstrate similar efficacy in controlling `dysmenorrhoea` and heavy bleeding; selection should depend on patient preference, side effects, and cost.",
      "Conception Contraindications [p20, p67]: Hormonal suppression is strictly contraindicated in patients actively trying to conceive, as they prevent ovulation and do not improve unassisted pregnancy rates during or after treatment.",
      "Second-line therapies [p20, p67]: Consider second-line therapies (GnRH agonists or antagonists) under specialist guidance for patients whose symptoms fail to respond to first-line hormonal options. Use 'add-back' hormone replacement therapy to protect bone density."
    ],
    clinicalSignificance: "Empirical hormonal trials can safely bypass diagnostic delays and provide continuous relief, rendering laparoscopy unnecessary for many mild-to-moderate cases in accordance with pages 20 & 67 of the RANZCOG Australian Living Evidence Guideline for Endometriosis."
  },
  CQ13: {
    title: "CQ13: Adenomyosis Management (pages 21 & 73 of the RANZCOG Australian Living Evidence Guideline for Endometriosis)",
    question: "How should suspected or confirmed adenomyosis be managed?",
    keyRecommendations: [
      "Diagnostic Suspicion [p21]: Identify suspected adenomyosis during pelvic transvaginal ultrasound or MRI via distinct heterogeneous myometrial patterns or asymmetric wall thickening.",
      "First-line medical therapies [p21, p73]: Offer hormonal suppression agents—such as the levonorgestrel-releasing intrauterine system (LNG-IUD), combined oral contraceptives, oral dienogest, or etonogestrel implant—to control adenomyosis-associated pelvic pain and heavy menstrual bleeding.",
      "Surgical considerations [p73]: Discuss surgical options (e.g., adenomyomectomy, uterine artery embolisation, or hysterectomy) if medical treatments fail and the patient has completed their family planning."
    ],
    clinicalSignificance: "Adenomyosis frequently coexists with endometriosis and requires dedicated high-potency progestins or LNG-IUD to manage significant uterine enlargement and menorrhagia in accordance with pages 21 & 73 of the RANZCOG Australian Living Evidence Guideline for Endometriosis."
  },
  CQ14: {
    title: "CQ14: Surgical Excision vs. Ablation (pages 21 & 76 of the RANZCOG Australian Living Evidence Guideline for Endometriosis)",
    question: "What is the role of laparoscopy and surgical excision representing cyst treatment?",
    keyRecommendations: [
      "Surgical Role [p21]: Select conservative laparoscopic surgery (excision or ablation of lesions) to improve pain outcomes in patients with mild-to-moderate disease.",
      "Endometrioma Excision [p21, p76]: For ovarian endometriomas, laparoscopic cyst excision (cystectomy) is strongly recommended over cyst ablation or drainage alone, as excision results in lower pain and recurrence rates.",
      "Abdominal Access [p76]: Laparoscopic approach is strongly preferred over open laparotomy to minimize adhesions, pain, and hospital stay.",
      "Repeat Surgeries [p76]: Advise careful consideration before pursuing repeat laparoscopic surgeries, as each additional procedure increases adhesion severity and risk of bowel/bladder injury."
    ],
    clinicalSignificance: "Laparoscopic cystectomy remains the most durable option for endometriomas, balancing recurrence prevention with ovarian reserve protection in accordance with pages 21 & 76 of the RANZCOG Australian Living Evidence Guideline for Endometriosis."
  },
  CQ15: {
    title: "CQ15: Surgical Treatment of Deep Endometriosis (pages 22 & 79 of the RANZCOG Australian Living Evidence Guideline)",
    question: "What are the recommended surgical protocols for deep endometriosis involving bowel, bladder, or ureter?",
    keyRecommendations: [
      "Refer to highly specialized interdisciplinary units [p22]: Complex surgeries involving bowel shaving, discoid excision, segmental resection, or ureterolysis should only be performed by expert multidisciplinary teams.",
      "Balance surgical hazards against functional gains [p79]: Evaluate potential complications (such as nerve damage, anastomotic leakage, or neurogenic bladder) against symptomatic severity.",
      "Ensure pre-operative mapping is thorough [p79]: Utilize dedicated deep endometriosis transvaginal ultrasound protocols and pelvic MRI prior to scheduling deep resections."
    ],
    clinicalSignificance: "Deep endometriosis surgery is highly technical and risk-prone; restricting procedures to accredited advanced laparoscopy specialized centers ensures lower morbidity and better long-term recovery."
  },
  CQ16: {
    title: "CQ16: Non-Pharmacological & Integrative Support Options (pages 23 & 86 of the RANZCOG Australian Living Evidence Guideline)",
    question: "What physical, dietary, or psychological non-pharmacological therapies are helpful?",
    keyRecommendations: [
      "Offer Pelvic Physiotherapy [p23]: Recommend a course of pelvic floor muscle therapy or massage to reduce myofascial pain, pelvic hypertonicity, and pain with sex (dyspareunia).",
      "Support psychological counseling [p86]: Discuss psychological therapies (CBT, mindfulness, or acceptance and commitment therapy) to support quality-of-life and clinical pain coping.",
      "Advise on dietary modifications [p23, p86]: Offer trying a low-FODMAP diet, fish oil, or vitamin D supplements to help manage chronic abdominal bloating, noting evidence is low.",
      "Discuss acupuncture [p86]: Acupuncture can be considered for short-term clinical pelvic pain relief and functional wellness benefits."
    ],
    clinicalSignificance: "Multimodal non-pharmacological therapies addressing pelvic hypertonicity, digestive symptoms, and psychological coping are core assets of a functional multidisciplinary care plan."
  },
  CQ17: {
    title: "CQ17: Medicinal Cannabis (pages 24 & 90 of the RANZCOG Australian Living Evidence Guideline)",
    question: "What are the clinical guidelines and prescribing requirements for medicinal cannabis?",
    keyRecommendations: [
      "Acknowledge open discussion of cannabis [p24]: Clinicians can discuss cannabis openly due to high patient prevalence, but must clarify that formal clinical evidence is very limited.",
      "Explain regulatory prescribing limits [p90]: Medicinal cannabis is not government-subsidized, requires authorized prescriber/SAS approvals, and has strict driving rules.",
      "Advise on risk evaluation [p90]: Discuss possible side effects like somnolence, cognitive impairment, medication interactions, and risk of dependence before prescribing."
    ],
    clinicalSignificance: "While clinical research is emergent, open and legal risk profiling helps patients avoid unprescribed illicit purchase and ensures structured clinical safety supervision."
  },
  CQ18: {
    title: "CQ18: Specialist Pediatric & Adolescent Referrals (pages 24 & 93 of the RANZCOG Australian Living Evidence Guideline)",
    question: "What are the specific referral guidelines for adolescents with suspected pelvic pathology?",
    keyRecommendations: [
      "Refer adolescents under 19 with suspected or confirmed endometriosis [p24] to a pediatric and adolescent gynaecologist, or a high-experience pediatric clinician.",
      "Prioritise non-invasive clinical investigations [p93]: Offer transabdominal pelvic ultrasound or transperineal scans, strictly avoiding transvaginal investigations in non-sexually active profiles.",
      "Avoid early invasive laparoscopies [p93] for mild-to-moderate cyclic pain unless first-line empirical medical treatments fail or pelvic imaging suggests distinct structural pathology."
    ],
    clinicalSignificance: "Adolescent endometriosis displays distinct peritoneal patterns and requires early non-surgical trials, validation of periodic pain, and expert developmental gynaecology guidance."
  },
  CQ19: {
    title: "CQ19: Asymptomatic Surveillance (pages 25 & 96 of the RANZCOG Australian Living Evidence Guideline for Endometriosis)",
    question: "How should an incidental finding of asymptomatic endometriosis be approached?",
    keyRecommendations: [
      "Avoid Treatment [p25]: Do NOT offer medical or surgical treatment for incidental findings of asymptomatic endometriosis or endometriomas on imaging or other unrelated surgeries.",
      "Expectant Surveillance [p25, p96]: Inform the patient about the low likelihood of rapid progression and recommend expectant, individualized, non-invasive surveillance.",
      "Mitigate Risk [p96]: Avoid unnecessary medical therapies or clearance surgeries, which could introduce unnecessary operative risks, hormonal side effects, and patient anxiety."
    ],
    clinicalSignificance: "Observing asymptomatic disease minimizes over-treatment and focuses medical resources on quality-of-life-limiting symptomatology in accordance with pages 25 & 96 of the RANZCOG Australian Living Evidence Guideline for Endometriosis."
  }
};

const getFriendlyErrorMessage = (raw: string): string => {
  if (!raw) return "Unknown evaluation mismatch";
  
  const low = raw.toLowerCase();
  if (
    low.includes("429") || 
    low.includes("resource_exhausted") || 
    low.includes("quota") || 
    low.includes("limit") || 
    low.includes("exhausted") || 
    low.includes("depleted")
  ) {
    return "Daily Capacity Reached";
  }
  if (low.includes("503") || low.includes("unavailable") || low.includes("overloaded")) {
    return "Service Temporarily Unavailable (503)";
  }
  if (raw.includes("Google API key format") || raw.includes("start with 'AIzaSy'")) {
    return "Invalid Key Format";
  }
  if (raw.includes("not defined") || raw.includes("not configured") || raw.trim() === "") {
    return "Secrets Key Missing";
  }
  if (raw.includes("API_KEY") || raw.includes("Secrets")) {
    return "Secrets Key Misconfigured";
  }

  try {
    // Try to extract JSON from string if it's wrapped in other text
    const jsonMatch = raw.match(/(\{.*\})/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[1] : raw);
    
    if (parsed && parsed.error) {
      if (parsed.error.message) {
        const msg = parsed.error.message;
        if (msg.includes("quota") || msg.includes("exceeded")) {
          return "Quota Exceeded (429 Rate Limit)";
        }
        return msg;
      }
      if (parsed.error.status === "RESOURCE_EXHAUSTED") {
        return "Quota Exceeded (429 Rate Limit)";
      }
    }
    if (parsed && parsed.message) {
      return parsed.message;
    }
  } catch (_) {
    // Fail-safe to standard match
  }

  // Clean substring fallback if it's too long
  if (raw.length > 50) {
    return `${raw.slice(0, 47)}...`;
  }
  return raw;
};

export default function App() {
  // Disclaimer state (shows immediately on initial app render)
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(true);

  // Selected clinical question state for RANZCOG Reference Index overlay
  const [selectedCQKey, setSelectedCQKey] = useState<string | null>(null);

  // Local dynamic clock state matching user's locale formatting
  const [currentDateTime, setCurrentDateTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatted = now.toLocaleString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
      setCurrentDateTime(formatted);
    };

    updateTime();
    const intervalId = setInterval(updateTime, 1000);
    return () => clearInterval(intervalId);
  }, []);

  // Gemini API key status healthcheck
  const [apiKeyStatus, setApiKeyStatus] = useState<{
    checked: boolean;
    success: boolean;
    message: string;
  }>({ checked: false, success: false, message: "" });

  useEffect(() => {
    fetch("/api/check-api-key")
      .then(async (res) => {
        const text = await res.text();
        if (text.trim().startsWith("<!doctype") || text.trim().startsWith("<html") || text.trim().startsWith("<!DOCTYPE")) {
          throw new Error("Server temporarily busy (returned redirect).");
        }
        return JSON.parse(text);
      })
      .then((data) => {
        setApiKeyStatus({
          checked: true,
          success: !!data.success,
          message: data.message || ""
        });
      })
      .catch((err) => {
        setApiKeyStatus({
          checked: true,
          success: false,
          message: err.message || "Failed to contact integration endpoint."
        });
      });
  }, []);

  // Clinical profile initialization
  const [formData, setFormData] = useState<PatientDetails>({
    age: "",
    fertilityPriority: "unspecified",
    tryingToConceiveMonths: "",
    partnerFertilityStatus: "unspecified",
    severePainfulPeriods: false,
    painWithSex: false,
    infertility: false,
    pelvicPain: false,
    heavyMenstrualBleeding: false,
    
    // Less common symptoms
    bowelSymptoms: false,
    severeTiredness: false,
    backPain: false,
    sleepDifficulty: false,
    headache: false,
    urinarySymptoms: false,
    allergies: false,
    commonNoneReported: false,
    lessCommonNoneReported: false,

    // History
    autoimmuneHistory: false,
    autoimmuneDetails: "none",
    autoimmuneOtherText: "",
    familyHistory: false,
    familyHistoryRelation: "none",

    // Exam
    examinationPerformed: "no",
    examinationDetails: "",

    // Investigations
    ultrasoundDone: "no",
    ultrasoundFindings: "",
    ultrasoundDate: "",
    mriDone: "no",
    mriFindings: "",
    mriDate: "",
    laparoscopyDone: "no",
    laparoscopyFindings: "",
    laparoscopyDate: "",
    ca125Done: "no",
    ca125Value: "",
    ca125Date: "",
    ultrasounds: [],
    mris: [],
    laparoscopies: [],
    ca125s: [],
    otherSymptomsFreeText: ""
  });

  const [assessmentResult, setAssessmentResult] = useState<ClinicalAssessmentResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [clinicalError, setClinicalError] = useState<string | null>(null);

  const handleAssessSubmit = async () => {
    setClinicalError(null);
    
    // Quick validate basic field
    if (!formData.age) {
      setClinicalError(
        "Please review your responses for Question 1 (Patient Demographics & Fertility Intention) and provide the patient's age. Patient age is required to perform an accurate assessment in accordance with RANZCOG guidelines."
      );
      return;
    }

    if (formData.fertilityPriority === "unspecified") {
      setClinicalError(
        "Please review your responses for Question 1 (Patient Demographics & Fertility Intention) and select the desire for unassisted fertility option. This selection is required to perform an accurate assessment in accordance with RANZCOG guidelines."
      );
      return;
    }

    // Validate if anything is selected in Question 2 and Question 3
    const commonKeys = [
      "severePainfulPeriods",
      "painWithSex",
      "infertility",
      "pelvicPain",
      "heavyMenstrualBleeding",
      "commonNoneReported"
    ];
    const hasCommon = commonKeys.some(key => !!(formData as any)[key]);

    const lessCommonKeys = [
      "bowelSymptoms",
      "severeTiredness",
      "backPain",
      "sleepDifficulty",
      "headache",
      "urinarySymptoms",
      "allergies",
      "lessCommonNoneReported"
    ];
    const hasLessCommon = lessCommonKeys.some(key => !!(formData as any)[key]);

    if (!hasCommon || !hasLessCommon) {
      setClinicalError(
        "Please review your responses for Question 2 (Common Symptoms) and/or Question 3 (Less Common Symptoms) and select at least one symptom option. If no symptoms are experienced, please select 'None reported' for that section to proceed."
      );
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/assess", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ patient: formData })
      });

      const responseText = await response.text();
      const isHtml = responseText.trim().startsWith("<!doctype") || responseText.trim().startsWith("<html") || responseText.trim().startsWith("<!DOCTYPE");
      
      let data: any = null;
      if (!isHtml) {
        try {
          data = JSON.parse(responseText);
        } catch (_) {
          // Not valid JSON
        }
      }

      if (!response.ok) {
        if (isHtml) {
          throw new Error(`The clinical evaluator is currently experiencing server-side congestion (Status ${response.status}). Please wait 10-15 seconds and try again.`);
        }
        throw new Error(
          (data && data.error) ||
          (responseText ? `Server Error (${response.status}): ${responseText.slice(0, 180)}` : `Server returned error status (${response.status})`)
        );
      }

      if (isHtml || !data) {
        throw new Error(
          "The assessment endpoint returned an unexpected response format. This typically indicates a temporary network gateway fallback. Please try again."
        );
      }

      setAssessmentResult(data.result);
    } catch (err: any) {
      console.error(err);
      const rawMsg = err.message || "Failed to successfully complete the clinical evaluation. Please check your network connection.";
      const lowMsg = rawMsg.toLowerCase();
      
      if (
        lowMsg.includes("429") || 
        lowMsg.includes("resource_exhausted") || 
        lowMsg.includes("quota") || 
        lowMsg.includes("limit") || 
        lowMsg.includes("exhausted") || 
        lowMsg.includes("depleted")
      ) {
        setClinicalError("The EndoAssessor has reached its daily capacity for analysing patient profiles. Access will be restored tomorrow. For urgent clinical use, please contact your local system support team/administrator.");
      } else {
        setClinicalError(rawMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-yellow-50/85 text-slate-900 font-sans flex flex-col selection:bg-yellow-105 relative" id="main-clinician-dashboard">
      
      {/* Disclaimer Modal Popup */}
      {isDisclaimerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs select-none" id="disclaimer-dialog-backdrop">
          <div className="bg-white rounded-lg border-2 border-yellow-400 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in duration-200" id="disclaimer-dialog-container">
            <div className="bg-yellow-400 p-4 flex items-center justify-center gap-2 border-b border-yellow-500">
              <ShieldAlert className="w-5 h-5 text-slate-900 shrink-0" />
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-center">
                EndoAssessor Clinical Disclaimer
              </h2>
              <ShieldAlert className="w-5 h-5 text-slate-900 shrink-0" />
            </div>
            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-700 leading-relaxed font-semibold text-center">
                By entering this platform, I understand and acknowledge that:
              </p>
              <ul className="text-xs text-slate-600 space-y-2.5 list-disc pl-4 leading-normal">
                <li>
                  This tool operates strictly as a Clinical Decision Support System (CDSS) for medical practitioners. 
                </li>
                <li>
                  All assessments, susception metrics, and management pathways are based on RANZCOG living evidence guidelines and Australian primary health protocols.
                </li>
                <li>
                  It does <strong>NOT</strong> substitute the professional clinical judgment of a qualified medical specialist. Medical professionals remain solely responsible for all patient diagnostics and treatment regimens.
                </li>
              </ul>
              <div className="pt-3 border-t border-slate-100 flex justify-center">
                <button
                  type="button"
                  onClick={() => setIsDisclaimerOpen(false)}
                  className="px-5 py-2 bg-yellow-400 text-slate-900 text-xs font-bold uppercase tracking-wider rounded border border-yellow-500 hover:bg-yellow-500 active:bg-yellow-600 transition-colors shadow-sm cursor-pointer"
                  id="disclaimer-dialog-accept-btn"
                >
                  I Acknowledge and Proceed
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* High Density Header Section */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between px-4 py-3 bg-white border-b border-slate-200 shadow-sm z-10 gap-3" id="main-header">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-yellow-400 border border-yellow-500 rounded flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-slate-900 animate-pulse" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-800 uppercase tracking-tight flex items-center gap-1.5">
              EndoAssessor
            </h1>
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
              Clinical Decision Support System for Endometriosis
            </p>
          </div>
        </div>

        {/* Clinical Tracking Metadata bar (Excluded Patient Status) */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] text-slate-650 font-medium">
          <div className="flex flex-col">
            <span className="text-slate-400 font-bold text-[9px] uppercase tracking-wider">SECURED EVIDENCE SOURCE</span>
            <a 
              href="https://ranzcog.edu.au/wp-content/uploads/Endometriosis-Clinical-Practice-Guideline.pdf" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-bold text-yellow-600 underline flex items-center gap-1 hover:text-yellow-750 transition-colors"
            >
              RANZCOG_Living_Guideline_Endo.pdf
            </a>
          </div>
        </div>
      </header>

      {/* Audit & Legal status strip */}
      <div className="bg-[#0f172a] border-b border-slate-800 px-5 py-3.5 flex items-start sm:items-center gap-3" id="advisory-strip">
        <div className="w-2 h-2 bg-yellow-400 rounded-full shrink-0 mt-1.5 sm:mt-0 animate-pulse"></div>
        <p className="text-[11.5px] md:text-xs leading-relaxed text-slate-100">
          <strong>DISCLAIMER:</strong> This clinical tool of RANZCOG Australian living evidence guide works strictly as a decision support aid. It does NOT replace the professional judgment of a clinical medical practitioner. Medical professionals remain solely responsible for all diagnostic and treatment decisions.
        </p>
      </div>

      {/* Main split-screen panel container */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" id="main-advisor-workspace">
        
        {/* Left column */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-lg border border-slate-250 shadow-sm overflow-hidden">
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-yellow-550 animate-pulse" />
                Assessment Inputs & Criteria Profiling
              </h2>
            </div>
            
            <AssessmentForm 
              formData={formData}
              onFormChange={setFormData}
              onAssessSubmit={handleAssessSubmit}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Clinical Execution level Error Notification banner */}
          {clinicalError && (
            <div className="bg-rose-50 border border-rose-150 rounded-lg p-4 text-rose-800 text-xs leading-relaxed shadow-sm transition-all space-y-2" id="dashboard-clinical-error-banner">
              <div className="flex items-center justify-center gap-2.5">
                <AlertCircle className="w-6 h-6 text-rose-600 shrink-0" />
                <strong className="font-bold text-rose-900 text-sm">Unable to generate clinical evaluation</strong>
              </div>
              <p className="text-center text-rose-800">
                {clinicalError}
              </p>
            </div>
          )}

          <AssessmentResults 
            assessment={assessmentResult}
            isLoading={isLoading}
          />
                 {/* Bottom High Density Guideline reference index board */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 space-y-3" id="quick-links-evidence">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-tight flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <BookOpen className="w-3.5 h-3.5 text-yellow-605" />
              Living Evidence Guideline Reference Index
            </h4>
            
            <div className="text-[11px] text-slate-650 leading-relaxed space-y-2.5">
              <p>
                Select a Clinical Question (CQ) below to view its specific RANZCOG gold-standard recommendations, evidence outcomes, and diagnostic parameters directly:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700 font-bold">
                {Object.keys(CQ_DETAILS).map((key) => {
                  const titleParts = CQ_DETAILS[key].title.split(':');
                  const titleText = titleParts[1] ? titleParts[1].split('(')[0].trim() : CQ_DETAILS[key].title;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedCQKey(key)}
                      className="w-full text-left flex items-center gap-1.5 p-2 rounded bg-slate-50 border border-slate-200 transition-all hover:bg-yellow-50/60 hover:border-yellow-400 hover:text-slate-900 cursor-pointer active:scale-[0.98] text-[11px]"
                    >
                      <ChevronRight className="w-3.5 h-3.5 text-yellow-605 shrink-0" />
                      <span className="truncate">{key}: {titleText}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* RANZCOG Guideline Detail Modal Dialogue */}
      {selectedCQKey && CQ_DETAILS[selectedCQKey] && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs" 
          onClick={() => setSelectedCQKey(null)}
          id="guideline-dialog-backdrop"
        >
          <div 
            className="bg-white rounded-lg border-2 border-yellow-400 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in duration-150"
            onClick={(e) => e.stopPropagation()}
            id="guideline-dialog-content"
          >
            {/* Modal Header */}
            <div className="bg-slate-900 p-4 shrink-0 flex items-center justify-between border-b border-slate-950">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-yellow-400 shrink-0" />
                <span className="bg-yellow-400 text-slate-950 font-extrabold px-1.5 py-0.5 rounded text-[10px] font-mono tracking-wider">
                  {selectedCQKey}
                </span>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  {CQ_DETAILS[selectedCQKey].title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCQKey(null)}
                className="text-slate-400 hover:text-white p-1 rounded transition-colors cursor-pointer"
                aria-label="Close guideline detail"
                id="guideline-dialog-close-icon"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Modal Content */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs leading-relaxed text-slate-700">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Clinical Question</span>
                <p className="font-bold text-slate-800 text-sm leading-snug">
                  "{CQ_DETAILS[selectedCQKey].question}"
                </p>
              </div>

              <div className="space-y-2.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Gold-Standard Practice Recommendations</span>
                <ul className="space-y-2">
                  {CQ_DETAILS[selectedCQKey].keyRecommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded border border-slate-150">
                      <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full shrink-0 mt-1.5"></div>
                      <span className="text-slate-650 font-medium">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-yellow-50/85 rounded-lg p-3.5 border border-yellow-250">
                <span className="text-[10px] font-bold text-yellow-750 uppercase tracking-widest block mb-0.5">Clinical Significance & Impact</span>
                <p className="text-slate-650 font-semibold italic">
                  {CQ_DETAILS[selectedCQKey].clinicalSignificance}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 border-t border-slate-150 px-5 py-3 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setSelectedCQKey(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
                id="guideline-dialog-close-btn"
              >
                Close Guideline Reference
              </button>
            </div>
          </div>
        </div>
      )}

      {/* High Density Litigation disclaimer Footer */}
      <footer className="bg-slate-900 border-t border-slate-950 px-4 py-3 flex items-center justify-between text-slate-400 gap-4 flex-wrap sm:flex-nowrap" id="clinical-disclaimer-panel">
        <div className="flex items-center gap-2 flex-wrap text-[10px]">
          <p className="text-slate-550">
            EndoAssessor CDSS — Built with audited evidence.
          </p>
          <span className="text-slate-750 hidden sm:inline">|</span>
          <div className="flex items-center gap-1.5 shrink-0">
            {!apiKeyStatus.checked ? (
              <div className="flex items-center gap-2 shrink-0" id="gemini-checking-container">
                <span className="text-slate-500">Checking connection:</span>
                <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden relative" title="Checking Gemini API key status...">
                  <style>{`
                    @keyframes slideIndicator {
                      0% { left: -40%; width: 40%; }
                      50% { width: 60%; }
                      100% { left: 100%; width: 40%; }
                    }
                    .slide-bar {
                      position: absolute;
                      height: 100%;
                      background-color: #fbbf24; /* amber-400 */
                      border-radius: 9999px;
                      animation: slideIndicator 1.4s infinite linear;
                    }
                  `}</style>
                  <div className="slide-bar"></div>
                </div>
              </div>
            ) : apiKeyStatus.success ? (
              <>
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0"></span>
                <span className="text-emerald-500 font-bold" title={apiKeyStatus.message}>Retrieval-Augmented Generation (RAG) status: active</span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full shrink-0 animate-pulse"></span>
                <span className="text-rose-400 font-bold hover:underline cursor-help" title={apiKeyStatus.message}>Retrieval-Augmented Generation (RAG) status: fault ({getFriendlyErrorMessage(apiKeyStatus.message)})</span>
              </>
            )}
          </div>
        </div>
        <div className="text-[10px] font-medium text-slate-400 select-none flex items-center gap-1 whitespace-nowrap">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0"></span>
          <span>{currentDateTime || "Retrieving local clock..."}</span>
        </div>
      </footer>

    </div>
  );
}
