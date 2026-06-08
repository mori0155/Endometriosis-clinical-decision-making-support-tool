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
    title: "CQ1: Signs & Symptoms Profiling (RANZCOG Page 14)",
    question: "Do certain signs or symptoms predict the presence of endometriosis?",
    keyRecommendations: [
      "Commonest symptoms (25% - 70% prevalence) [RANZCOG Page 14]: severe painful periods (dysmenorrhoea), deep pain during or after sex (dyspareunia), pelvic pain (chronic or cyclical), heavy menstrual bleeding, and infertility.",
      "Less common symptoms (10% - 25% prevalence) [RANZCOG Page 14]: bowel symptoms (constipation, pain on bowel movement/dyschezia, bloating), chronic fatigue/tiredness, back pain, sleep difficulties, headache/cyclical migraines, urinary symptoms (urine burn/dysuria), and history of allergies (such as hay fever or sinusitis).",
      "Common signs during pelvic examination [RANZCOG Page 14]: reduced pelvic organ mobility, enlargement of pelvic organs, visible vaginal lesions, tenderness in the vagina/pelvic structures, or posterior vaginal wall nodularity.",
      "Clinical Note [RANZCOG Page 14]: A normal pelvic examination does NOT exclude endometriosis. Examination may be inappropriate or declined (especially in adolescents or those with vaginismus/no sexual activity history)."
    ],
    clinicalSignificance: "Comprehensive recording of multi-system clinical symptoms is the cornerstone of clinical suspicion, driving key decisions in accordance with RANZCOG Page 14."
  },
  CQ5: {
    title: "CQ5: Referral to Secondary Care (RANZCOG Page 17, 44)",
    question: "When should a patient with suspected/confirmed endometriosis be referred?",
    keyRecommendations: [
      "Refer to secondary gynaecology services [RANZCOG Page 17]: When first-line primary management (such as NSAIDs or combined oral contraceptives) is not effective, is poorly tolerated, or is contraindicated.",
      "Refer upon physical signs [RANZCOG Page 17]: Refer when abnormal pelvic signs are found on physical examination and the patient fails empirical therapy.",
      "Refer based on imaging findings [RANZCOG Page 44]: Refer immediately when diagnostic pelvic imaging (TVUS or MRI) suggests the presence of an endometrioma or deep endometriosis involving the bowel, bladder, or ureters.",
      "Refer for advanced surgery [RANZCOG Page 44]: Suspected deep lesions involving bowel, bladder, or ureters must be referred to gynaecologists with advanced laparoscopic surgical expertise or specialized interdisciplinary services with colorectal/urological input."
    ],
    clinicalSignificance: "Timely referral avoids diagnostic delay and ensures patients are matched with the appropriate tier of clinical or surgical expertise in accordance with RANZCOG Page 17 & Page 44."
  },
  CQ7: {
    title: "CQ7: Pelvic Diagnostic Imaging (RANZCOG Page 18, 50)",
    question: "What imaging modality should be used first-line for suspected endometriosis?",
    keyRecommendations: [
      "First-line Pelvic Ultrasound [RANZCOG Page 18]: Offer transvaginal pelvic ultrasound (TVUS) to all patients with symptoms suggestive of endometriosis, even if examinations are normal.",
      "Alternative Imaging for Adolescents / Non-sexually active [RANZCOG Page 50]: Offer transabdominal pelvic ultrasound (or MRI/transperineal scan if indicated) if transvaginal imaging is not appropriate, unavailable, or declined.",
      "Alternative/Second-line Imaging [RANZCOG Page 18, Page 50]: Provide Pelvic MRI as a second-line investigation if TVUS is inconclusive, unavailable, or if deep endometriosis (bowel, bladder, ureter) or endometrioma is suspected for surgical mapping.",
      "Exclusions & Marker limits [RANZCOG Page 18]: Do NOT use CT scan as a primary modality to investigate endometriosis due to low sensitivity and radiation exposure. Do NOT use regular serum CA125 assays as a routine diagnostic tool (low sensitivity; a normal CA125 does not exclude endometriosis)."
    ],
    clinicalSignificance: "Advanced pre-surgical imaging protocols optimize mapping of deep endometriosis lesions across pelvic structures in accordance with RANZCOG Page 18 & Page 50."
  },
  CQ10: {
    title: "CQ10: Analgesic Treatments (RANZCOG Page 19, 60)",
    question: "Which non-hormonal analgesic options should be offered to control pain?",
    keyRecommendations: [
      "First-line Analgesic Trial [RANZCOG Page 19]: Offer a short-term trial of non-steroidal anti-inflammatory drugs (NSAIDs, e.g., Naproxen or Ibuprofen) alone or in combination with Paracetamol/Acetaminophen for primary pain management.",
      "Opioid Constraints [RANZCOG Page 19, Page 60]: Caution: Do NOT prescribe opioid medications for routine, long-term chronic pelvic pain due to severe dependency risks and minimal evidence of benefit for neuropathic cyclic pain. Use only at lowest effective doses for acute severe flare-ups.",
      "Alternative supportive care [RANZCOG Page 60]: Discuss secondary non-pharmacological therapies such as acupuncture, low-FODMAP diet, fish oil, and vitamin D supplements, noting that evidence is limited but valuable for self-management."
    ],
    clinicalSignificance: "Effective non-hormonal pain relief ensures physical coping capacity during diagnostic investigations or while awaiting specialist assessment in accordance with RANZCOG Page 19 & Page 60."
  },
  CQ12: {
    title: "CQ12: Hormonal Suppression Trials (RANZCOG Page 20, 67)",
    question: "What are the first-line and second-line medical hormonal options?",
    keyRecommendations: [
      "First-line Hormonals [RANZCOG Page 20]: For patients not trying to conceive, offer combined oral contraceptives (COCs) or progestogens (such as oral dienogest, medroxyprogesterone injection, or LNG-IUD) as first-line empirical treatments.",
      "Treatment Selection [RANZCOG Page 20]: All first-line hormonal treatments demonstrate similar efficacy in controlling dysmenorrhoea and heavy bleeding; selection should depend on patient preference, side effects, and cost.",
      "Conception Contraindications [RANZCOG Page 20, Page 67]: Hormonal suppression is strictly contraindicated in patients actively trying to conceive, as they prevent ovulation and do not improve unassisted pregnancy rates during or after treatment.",
      "Second-line therapies [RANZCOG Page 20, Page 67]: Consider second-line therapies (GnRH agonists or antagonists) under specialist guidance for patients whose symptoms fail to respond to first-line hormonal options. Use 'add-back' hormone replacement therapy to protect bone density."
    ],
    clinicalSignificance: "Empirical hormonal trials can safely bypass diagnostic delays and provide continuous relief, rendering laparoscopy unnecessary for many mild-to-moderate cases in accordance with RANZCOG Page 20 & Page 67."
  },
  CQ13: {
    title: "CQ13: Adenomyosis Management (RANZCOG Page 21, 73)",
    question: "How should suspected or confirmed adenomyosis be managed?",
    keyRecommendations: [
      "Diagnostic Suspicion [RANZCOG Page 21]: Identify suspected adenomyosis during pelvic transvaginal ultrasound or MRI via distinct heterogeneous myometrial patterns or asymmetric wall thickening.",
      "First-line medical therapies [RANZCOG Page 21, Page 73]: Offer hormonal suppression agents—such as the levonorgestrel-releasing intrauterine system (LNG-IUD), combined oral contraceptives, oral dienogest, or etonogestrel implant—to control adenomyosis-associated pelvic pain and heavy menstrual bleeding.",
      "Surgical considerations [RANZCOG Page 73]: Discuss surgical options (e.g., adenomyomectomy, uterine artery embolisation, or hysterectomy) if medical treatments fail and the patient has completed their family planning."
    ],
    clinicalSignificance: "Adenomyosis frequently coexists with endometriosis and requires dedicated high-potency progestins or LNG-IUD to manage significant uterine enlargement and menorrhagia in accordance with RANZCOG Page 21 & Page 73."
  },
  CQ14: {
    title: "CQ14: Surgical Excision vs. Ablation (RANZCOG Page 21, 76)",
    question: "What is the role of laparoscopy and surgical excision representing cyst treatment?",
    keyRecommendations: [
      "Surgical Role [RANZCOG Page 21]: Select conservative laparoscopic surgery (excision or ablation of lesions) to improve pain outcomes in patients with mild-to-moderate disease.",
      "Endometrioma Excision [RANZCOG Page 21, Page 76]: For ovarian endometriomas, laparoscopic cyst excision (cystectomy) is strongly recommended over cyst ablation or drainage alone, as excision results in lower pain and recurrence rates.",
      "Abdominal Access [RANZCOG Page 76]: Laparoscopic approach is strongly preferred over open laparotomy to minimize adhesions, pain, and hospital stay.",
      "Repeat Surgeries [RANZCOG Page 76]: Advise careful consideration before pursuing repeat laparoscopic surgeries, as each additional procedure increases adhesion severity and risk of bowel/bladder injury."
    ],
    clinicalSignificance: "Laparoscopic cystectomy remains the most durable option for endometriomas, balancing recurrence prevention with ovarian reserve protection in accordance with RANZCOG Page 21 & Page 76."
  },
  CQ19: {
    title: "CQ19: Asymptomatic Surveillance (RANZCOG Page 25, 96)",
    question: "How should an incidental finding of asymptomatic endometriosis be approached?",
    keyRecommendations: [
      "Avoid Treatment [RANZCOG Page 25]: Do NOT offer medical or surgical treatment for incidental findings of asymptomatic endometriosis or endometriomas on imaging or other unrelated surgeries.",
      "Expectant Surveillance [RANZCOG Page 25, Page 96]: Inform the patient about the low likelihood of rapid progression and recommend expectant, individualized, non-invasive surveillance.",
      "Mitigate Risk [RANZCOG Page 96]: Avoid unnecessary medical therapies or clearance surgeries, which could introduce unnecessary operative risks, hormonal side effects, and patient anxiety."
    ],
    clinicalSignificance: "Observing asymptomatic disease minimizes over-treatment and focuses medical resources on quality-of-life-limiting symptomatology in accordance with RANZCOG Page 25 & Page 96."
  }
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
      .then((res) => res.json())
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

    // History
    autoimmuneHistory: false,
    autoimmuneDetails: "none",
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
    otherSymptomsFreeText: ""
  });

  const [assessmentResult, setAssessmentResult] = useState<ClinicalAssessmentResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [clinicalError, setClinicalError] = useState<string | null>(null);

  const handleAssessSubmit = async () => {
    setClinicalError(null);
    
    // Quick validate basic field
    if (!formData.age) {
      setClinicalError("Clinical Prerequisite Failed: Patient age is required to perform an accurate assessment in accordance with RANZCOG guidelines.");
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
      let data: any = null;
      try {
        data = JSON.parse(responseText);
      } catch (_) {
        // Not valid JSON
      }

      if (!response.ok) {
        throw new Error(
          (data && data.error) ||
          (responseText ? `Server Error (${response.status}): ${responseText.slice(0, 180)}` : `Server returned error status (${response.status})`)
        );
      }

      if (!data) {
        throw new Error(`Failed to parse response: ${responseText.slice(0, 100)}`);
      }

      setAssessmentResult(data.result);
    } catch (err: any) {
      console.error(err);
      setClinicalError(err.message || "Failed to successfully complete the clinical evaluation. Please check your network connection.");
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
            <span className="text-slate-400 font-bold text-[9px] uppercase tracking-wider">CURRENT AGE</span>
            <span className="font-bold text-slate-700">
              {formData.age ? `${formData.age} Years` : "Unspecified Value"}
            </span>
          </div>
          <div className="flex flex-col border-l border-slate-200 pl-4">
            <span className="text-slate-400 font-bold text-[9px] uppercase tracking-wider">SECURED EVIDENCE SOURCE</span>
            <span className="font-bold text-yellow-605 underline flex items-center gap-1 hover:text-yellow-750 transition-colors">
              RANZCOG_Living_Guideline_Endo.pdf
            </span>
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
            <div className="bg-rose-50 border border-rose-150 rounded-lg p-3.5 flex items-start gap-2.5 text-rose-800 text-xs leading-relaxed shadow-sm transition-all" id="dashboard-clinical-error-banner">
              <AlertCircle className="w-4.5 h-4.5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold mb-0.5 text-rose-900">Clinical Prerequisite Blocked</strong>
                <span>{clinicalError}</span>
              </div>
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
              <div className="grid grid-cols-1 gap-2 text-slate-700 font-bold">
                <button
                  type="button"
                  onClick={() => setSelectedCQKey('CQ1')}
                  className="w-full text-left flex items-center gap-1.5 p-2 rounded bg-slate-50 border border-slate-200 transition-all hover:bg-yellow-50/60 hover:border-yellow-400 hover:text-slate-900 cursor-pointer active:scale-[0.98]"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-yellow-600 shrink-0" />
                  <span>Signs & Symptoms profiling</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCQKey('CQ5')}
                  className="w-full text-left flex items-center gap-1.5 p-2 rounded bg-slate-50 border border-slate-200 transition-all hover:bg-yellow-50/60 hover:border-yellow-400 hover:text-slate-900 cursor-pointer active:scale-[0.98]"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-yellow-600 shrink-0" />
                  <span>Referral to Secondary Care</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCQKey('CQ7')}
                  className="w-full text-left flex items-center gap-1.5 p-2 rounded bg-slate-50 border border-slate-200 transition-all hover:bg-yellow-50/60 hover:border-yellow-400 hover:text-slate-900 cursor-pointer active:scale-[0.98]"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-yellow-600 shrink-0" />
                  <span>Pelvic Diagnostic Imaging</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCQKey('CQ10')}
                  className="w-full text-left flex items-center gap-1.5 p-2 rounded bg-slate-50 border border-slate-200 transition-all hover:bg-yellow-50/60 hover:border-yellow-400 hover:text-slate-900 cursor-pointer active:scale-[0.98]"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-yellow-600 shrink-0" />
                  <span>Analgesic Treatments</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCQKey('CQ12')}
                  className="w-full text-left flex items-center gap-1.5 p-2 rounded bg-slate-50 border border-slate-200 transition-all hover:bg-yellow-50/60 hover:border-yellow-400 hover:text-slate-900 cursor-pointer active:scale-[0.98]"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-yellow-600 shrink-0" />
                  <span>Hormonal Suppression trials</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCQKey('CQ13')}
                  className="w-full text-left flex items-center gap-1.5 p-2 rounded bg-slate-50 border border-slate-200 transition-all hover:bg-yellow-50/60 hover:border-yellow-400 hover:text-slate-900 cursor-pointer active:scale-[0.98]"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-yellow-600 shrink-0" />
                  <span>Adenomyosis Management</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCQKey('CQ14')}
                  className="w-full text-left flex items-center gap-1.5 p-2 rounded bg-slate-50 border border-slate-200 transition-all hover:bg-yellow-50/60 hover:border-yellow-400 hover:text-slate-900 cursor-pointer active:scale-[0.98]"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-yellow-600 shrink-0" />
                  <span>Surgical Excision vs. Ablation</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCQKey('CQ19')}
                  className="w-full text-left flex items-center gap-1.5 p-2 rounded bg-slate-50 border border-slate-200 transition-all hover:bg-yellow-50/60 hover:border-yellow-400 hover:text-slate-900 cursor-pointer active:scale-[0.98]"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-yellow-600 shrink-0" />
                  <span>Asymptomatic Surveillance</span>
                </button>
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
              <>
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-ping"></span>
                <span className="text-slate-500">Checking connection...</span>
              </>
            ) : apiKeyStatus.success ? (
              <>
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0"></span>
                <span className="text-emerald-500 font-bold" title={apiKeyStatus.message}>Gemini Key: Active</span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full shrink-0 animate-pulse"></span>
                <span className="text-rose-400 font-bold hover:underline cursor-help" title={apiKeyStatus.message}>Gemini Key: Fault ({apiKeyStatus.message.slice(0, 45)}...)</span>
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
