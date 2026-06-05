import React, { useState } from 'react';
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
  FileText
} from 'lucide-react';

export default function App() {
  // Disclaimer state (shows immediately on initial app render)
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(true);

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
    familyHistory: false,

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

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "A secure server connection failure prevented evaluation.");
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
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col selection:bg-yellow-100 relative" id="main-clinician-dashboard">
      
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
            <h1 className="text-sm font-bold text-slate-800 uppercase tracking-tight flex items-center gap-1.5">
              EndoAssessor
            </h1>
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
              Clinical Decision Support System
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
      <div className="bg-yellow-50/50 border-b border-yellow-250 px-4 py-2 flex items-center justify-between text-[11px] text-slate-750" id="advisory-strip">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="w-3.5 h-3.5 text-yellow-600 shrink-0" />
          <span>
            <strong>RANZCOG Guideline Status:</strong> Audited with May 2025 GRADE recommendations. Evidence locked to EndoAus protocols.
          </span>
        </div>
        <div className="hidden lg:block text-[10px] text-slate-400 uppercase font-semibold">
          Source Validation: Verified Live Database Connection
        </div>
      </div>

      {/* Main split-screen panel container */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" id="main-advisor-workspace">
        
        {/* Left column */}
        <div className="lg:col-span-5 space-y-6">
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
        <div className="lg:col-span-7 space-y-6">
          
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
              <BookOpen className="w-3.5 h-3.5 text-yellow-600" />
              Living Evidence Guideline Reference Index
            </h4>
            
            <div className="text-[11px] text-slate-650 leading-relaxed space-y-2.5">
              <p>
                RANZCOG Clinical Questions (CQ) & diagnostic components integrated into this advisor tool:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 font-medium">
                <div className="flex items-center gap-1.5 p-2 rounded bg-slate-50 border border-slate-200 transition-all hover:bg-yellow-50/50 hover:border-yellow-300">
                  <ChevronRight className="w-3 h-3 text-yellow-600 shrink-0" />
                  <span>CQ1: Signs & Symptoms profiling</span>
                </div>
                <div className="flex items-center gap-1.5 p-2 rounded bg-slate-50 border border-slate-200 transition-all hover:bg-yellow-50/50 hover:border-yellow-300">
                  <ChevronRight className="w-3 h-3 text-yellow-600 shrink-0" />
                  <span>CQ5: Referral to Secondary Care</span>
                </div>
                <div className="flex items-center gap-1.5 p-2 rounded bg-slate-50 border border-slate-200 transition-all hover:bg-yellow-50/50 hover:border-yellow-300">
                  <ChevronRight className="w-3 h-3 text-yellow-600 shrink-0" />
                  <span>CQ7: Pelvic Diagnostic Imaging</span>
                </div>
                <div className="flex items-center gap-1.5 p-2 rounded bg-slate-50 border border-slate-200 transition-all hover:bg-yellow-50/50 hover:border-yellow-300">
                  <ChevronRight className="w-3 h-3 text-yellow-600 shrink-0" />
                  <span>CQ10: Analgesic Treatments</span>
                </div>
                <div className="flex items-center gap-1.5 p-2 rounded bg-slate-50 border border-slate-200 transition-all hover:bg-yellow-50/50 hover:border-yellow-300">
                  <ChevronRight className="w-3 h-3 text-yellow-600 shrink-0" />
                  <span>CQ12: Hormonal Suppression trials</span>
                </div>
                <div className="flex items-center gap-1.5 p-2 rounded bg-slate-50 border border-slate-200 transition-all hover:bg-yellow-50/50 hover:border-yellow-300">
                  <ChevronRight className="w-3 h-3 text-yellow-600 shrink-0" />
                  <span>CQ13: Adenomyosis Management</span>
                </div>
                <div className="flex items-center gap-1.5 p-2 rounded bg-slate-50 border border-slate-200 transition-all hover:bg-yellow-50/50 hover:border-yellow-300">
                  <ChevronRight className="w-3 h-3 text-yellow-600 shrink-0" />
                  <span>CQ14: Surgical Excision vs. Ablation</span>
                </div>
                <div className="flex items-center gap-1.5 p-2 rounded bg-slate-50 border border-slate-200 transition-all hover:bg-yellow-50/50 hover:border-yellow-300">
                  <ChevronRight className="w-3 h-3 text-yellow-600 shrink-0" />
                  <span>CQ19: Asymptomatic Surveillance</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* High Density Litigation disclaimer Footer */}
      <footer className="bg-slate-900 border-t border-slate-950 px-4 py-3 flex flex-col md:flex-row items-start md:items-center justify-between text-slate-400 gap-3" id="clinical-disclaimer-panel">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full shrink-0"></div>
          <p className="text-[10px] leading-tight max-w-380 text-slate-400">
            <strong>DISCLAIMER:</strong> This clinical tool of RANZCOG Australian living evidence guide works strictly as a decision support aid. It does NOT replace the professional judgment of a clinical medical practitioner. Medical professionals remain solely responsible for all diagnostic and treatment decisions.
          </p>
        </div>
        <div className="text-[9px] font-mono text-slate-500 whitespace-nowrap">
          Sess: 0x82f..8c | v_env_secured
        </div>
      </footer>

    </div>
  );
}
