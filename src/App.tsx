import React, { useState, useEffect } from 'react';
import { PatientDetails, ClinicalAssessmentResult } from './types';
import { AssessmentForm } from './components/AssessmentForm';
import { AssessmentResults } from './components/AssessmentResults';
import { 
  ShieldAlert, 
  Activity, 
  ClipboardCheck,
  AlertCircle,
  FileText
} from 'lucide-react';

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
    menstrualCycleRegularity: "unspecified",
    menstrualCycleLength: "",
    menstrualBleedingDuration: "",
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
        "Please review your responses for Question 1 (Patient Demographics) and provide the patient's age. Patient age is required to perform an accurate assessment in accordance with RANZCOG guidelines."
      );
      return;
    }

    if (formData.fertilityPriority === "unspecified") {
      setClinicalError(
        "Please review your responses for Question 1 (Patient Demographics) and select the fertility goal. This selection is required to perform an accurate assessment in accordance with RANZCOG guidelines."
      );
      return;
    }

    if (formData.infertility && formData.fertilityPriority !== "yes") {
      setClinicalError(
        "Inconsistency detected: 'Infertility / conceiving delay' is checked in Question 2, but the patient's Fertility Goal in Question 1 is not set to 'Yes, actively trying to conceive'. Please either update the Fertility Goal to 'Yes, actively trying to conceive' or uncheck 'Infertility / conceiving delay' to proceed."
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
        if (response.status === 504 || response.status === 502 || response.status === 503 || responseText.toLowerCase().includes("timeout") || responseText.toLowerCase().includes("function_invocation_timeout")) {
          throw new Error("The AI clinical evaluator is temporarily busy or timed out. This is a temporary connection issue and is NOT a problem with the app itself. Please wait 10-15 seconds and try clicking 'Generate Clinical Evaluation' again.");
        }
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
      } else if (
        lowMsg.includes("504") ||
        lowMsg.includes("timeout") ||
        lowMsg.includes("gateway") ||
        lowMsg.includes("502") ||
        lowMsg.includes("503")
      ) {
        setClinicalError("The AI clinical evaluator timed out or is temporarily busy. This is a temporary server communication delay and is NOT a problem with the app itself. Please wait 10-15 seconds and try clicking 'Generate' again.");
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

        </div>
      </main>

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
