import React, { useState, useEffect, useRef } from 'react';
import { ClinicalAssessmentResult } from '../types';
import { 
  Clipboard, 
  Check, 
  AlertTriangle, 
  Stethoscope, 
  ArrowRight, 
  BookOpen,
  FileText,
  BadgeAlert,
  ChevronRight
} from 'lucide-react';

interface AssessmentResultsProps {
  assessment: ClinicalAssessmentResult | null;
  isLoading: boolean;
}

export const AssessmentResults: React.FC<AssessmentResultsProps> = ({
  assessment,
  isLoading
}) => {
  const [editedSummary, setEditedSummary] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [progress, setProgress] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showDeclaration, setShowDeclaration] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync edited summary with incoming assessment summaries, append management options and processed RANZCOG citations
  useEffect(() => {
    if (assessment) {
      let summary = assessment.clinicSummary || '';

      // Append evidence-based management options
      const opts = assessment.managementOptions;
      if (opts) {
        const sections: string[] = [];
        if (opts.medical && opts.medical.length > 0) {
          sections.push(`  - Hormonal Trials: ${opts.medical.join('; ')}`);
        }
        if (opts.analgesic && opts.analgesic.length > 0) {
          sections.push(`  - Analgesics: ${opts.analgesic.join('; ')}`);
        }
        if (opts.nonPharmacological && opts.nonPharmacological.length > 0) {
          sections.push(`  - Supportive & Non-Pharm Options: ${opts.nonPharmacological.join('; ')}`);
        }
        if (opts.surgical && opts.surgical.length > 0) {
          sections.push(`  - Surgical Considerations: ${opts.surgical.join('; ')}`);
        }

        if (sections.length > 0) {
          summary = `${summary}\n\nEvidence-Based Management Options:\n${sections.join('\n')}`;
        }
      }

      if (assessment.citations && assessment.citations.length > 0) {
        const citationList = assessment.citations.map(c => `Ref: ${c.recommendationNo}`).join(', ');
        summary = `${summary}\n\nProcessed RANZCOG Citations: ${citationList}`;
      }
      setEditedSummary(summary);
    } else {
      setEditedSummary('');
    }
  }, [assessment]);

  // Auto-resize textarea to fit entire content height without a scroll bar
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [editedSummary]);

  // Generate realistic percentage progress synced with duration
  useEffect(() => {
    if (isLoading) {
      setProgress(0);
      setElapsedSeconds(0);
      const startTime = Date.now();

      const interval = setInterval(() => {
        const secs = Math.floor((Date.now() - startTime) / 1000);
        setElapsedSeconds(secs);
        
        // Paced progress to reach around 96% by 95 seconds (estimating ~2 mins total API time safely)
        const ESTIMATED_TOTAL_SECONDS = 95;
        let pct = 0;
        if (secs < ESTIMATED_TOTAL_SECONDS) {
          pct = Math.floor((secs / ESTIMATED_TOTAL_SECONDS) * 96);
        } else {
          // Extra slow drift from 96% to 99% for safety over the next 120 seconds
          const extra = secs - ESTIMATED_TOTAL_SECONDS;
          pct = Math.min(99, 96 + Math.floor((extra / 120) * 3));
        }
        setProgress(pct);
      }, 1000);

      return () => {
        clearInterval(interval);
      };
    }
  }, [isLoading]);

  const handleCopy = () => {
    // Show clinicians the declaration model prior to copying actual text
    setShowDeclaration(true);
  };

  const handleConfirmCopy = async () => {
    setShowDeclaration(false);
    try {
      await navigator.clipboard.writeText(editedSummary);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  // Dynamic progress label and subtext based on percentage
  const getProgressLabel = (pct: number) => {
    if (pct < 30) return "Analyzing Patient Demographics...";
    if (pct < 65) return "Evaluating Guidelines & Evidence...";
    if (pct < 90) return "Generating Clinical Insights...";
    return "Almost done: Finalizing Clinical Report...";
  };

  const getProgressSubtext = (pct: number) => {
    if (pct < 30) return "Extracting symptoms, risk factors, and prior diagnostic values.";
    if (pct < 65) return "Cross-referencing clinical profile against RANZCOG GRADE evidence guidelines.";
    if (pct < 90) return "Drafting professional EMR notes and organizing indicated referral pathways.";
    return "Performing final clinical logical safety checks on contraception & fertility priority.";
  };

  if (isLoading) {
    const radius = 24;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;
    const ESTIMATED_TOTAL_SECONDS = 95;
    const isOverrun = elapsedSeconds >= ESTIMATED_TOTAL_SECONDS;
    const secondsRemaining = Math.max(0, ESTIMATED_TOTAL_SECONDS - elapsedSeconds);

    return (
      <div className="bg-white border border-slate-200 rounded-lg p-10 text-center space-y-6 shadow-sm" id="results-skeleton">
        <div className="flex justify-center">
          <div className="relative flex items-center justify-center w-16 h-16" id="results-skeleton-spinner">
            {/* SVG Progress Circle */}
            <svg className="w-16 h-16 transform -rotate-90 absolute">
              {/* Spinning track ring */}
              <circle
                className="text-slate-100"
                strokeWidth="4"
                stroke="currentColor"
                fill="transparent"
                r={radius}
                cx="32"
                cy="32"
              />
              {/* Active filled progress indicator */}
              <circle
                className="text-yellow-550 transition-all duration-300 ease-out"
                strokeWidth="4"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r={radius}
                cx="32"
                cy="32"
              />
            </svg>
            
            {/* Subtle outer rotating track to show background processing is active */}
            <div className="absolute inset-0 rounded-full border border-yellow-200/40 border-t-yellow-500 animate-spin opacity-80"></div>

            {/* Centered progress text */}
            <span className="text-xs font-mono font-bold text-slate-800 z-10">
              {progress}%
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-slate-700 text-xs font-bold uppercase tracking-wider">
            {getProgressLabel(progress)}
          </p>
          <p className="text-[11px] text-slate-400 max-w-sm mx-auto leading-relaxed">
            {getProgressSubtext(progress)}
          </p>
        </div>

        {/* Estimated Time Remaining Section */}
        <div className="text-center space-y-1 py-1" id="progress-time-remaining">
          <p className="text-xs font-bold text-yellow-600 uppercase tracking-wider">
            {!isOverrun ? `Estimated Time Remaining: ~${secondsRemaining} seconds` : "Finalizing comprehensive clinical report..."}
          </p>
          <p className="text-[10px] text-slate-400">
            {!isOverrun ? "Processing evidence-based guidelines" : "Generating diagnostic options, please wait"}
          </p>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="bg-slate-50 border border-dashed border-slate-300 rounded-lg p-12 text-center space-y-3" id="results-placeholder">
        <Stethoscope className="w-9 h-9 text-slate-400 mx-auto" strokeWidth={1.5} />
        <h3 className="text-slate-800 text-xs font-bold uppercase tracking-wide">Ready for Clinical Evaluation</h3>
        <p className="text-[11px] text-slate-500 max-w-sm mx-auto leading-relaxed">
          Please fill out the patient's symptomatic details, demographics, and prior investigations on the left, then click <strong>"Generate Clinical Evaluation"</strong> to produce an evidence-backed insight report.
        </p>
      </div>
    );
  }

  // Determine badge styling for level of diagnostic probability
  const getProbabilityBadge = (level: string) => {
    switch (level) {
      case 'High':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'Moderate':
        return 'bg-orange-50 text-orange-850 border-orange-200';
      case 'Low':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const hasMissingVariables = assessment.missingItemsList && assessment.missingItemsList.length > 0;

  return (
    <div className="space-y-5" id="clinical-assessment-results-main">
      
      {/* Clinician Missing Info Warning banner */}
      {hasMissingVariables && (
        <div className="p-3 bg-white border border-yellow-250 rounded flex space-x-3 items-start" id="missing-info-warning-container">
          <svg className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
          <div className="text-[11px] text-slate-800 leading-tight space-y-1">
            <strong className="text-slate-900 font-bold">Clinical Alerts & Guidelines Indicators:</strong>
            <p className="text-slate-600 leading-normal">
              Please review the following diagnostic notifications or omitted clinical values:
            </p>
            <ul className="list-disc pl-3 mt-1 text-[10px] space-y-0.5 font-bold text-amber-800">
              {assessment.missingItemsList.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
            {assessment.missingExplanation && (
              <p className="mt-1.5 text-[10.5px] italic text-slate-550 border-l border-yellow-300 pl-2 leading-relaxed">
                {assessment.missingExplanation}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Main clinical insights header row */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden" id="report-suspicion-level">
        <div className="p-3 bg-white border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-xs font-bold text-slate-705 uppercase tracking-wider flex items-center gap-1.5">
            <BadgeAlert className="w-4 h-4 text-slate-500" />
            Clinical Insights & Guidelines Diagnosis
          </h2>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold text-slate-400">DIAGNOSTIC PROBABILITY FOR ENDOMETRIOSIS:</span>
            <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${getProbabilityBadge(assessment.diagnosticProbability)}`}>
              {assessment.diagnosticProbability.toUpperCase()}
              {typeof assessment.confidencePercentage === 'number' && ` (${assessment.confidencePercentage}% CONFIDENCE)`}
            </span>
          </div>
        </div>

        <div className="p-4 space-y-4">
          
          {/* Clinical reasoning */}
          <div>
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Assessment Analysis & Guideline Alignment
            </h4>
            <p className="text-slate-700 text-xs leading-relaxed whitespace-pre-line bg-[#F8FAFC] border border-slate-200 p-3.5 rounded font-normal">
              {assessment.clinicalReasoning}
            </p>
          </div>

          {/* Golden Source Citation tracker */}
          {assessment.citations && assessment.citations.length > 0 && (
            <div className="space-y-2 pt-1">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-yellow-600" />
                GRADE Evidence base citations
              </h4>
              <div className="grid grid-cols-1 gap-2 max-h-52 overflow-y-auto pr-1">
                {assessment.citations.map((cite, index) => (
                  <div key={index} className="p-2.5 bg-white border border-slate-200 hover:border-slate-300 rounded text-xs space-y-1 select-text transition-colors">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-amber-900 bg-yellow-50 px-1.5 py-0.5 rounded text-[9px] border border-yellow-200">
                        Recommendation {cite.recommendationNo}
                      </span>
                      <span className="text-[9px] text-slate-405 italic uppercase font-bold tracking-tight">
                        {cite.type}
                      </span>
                    </div>
                    <div className="font-bold text-slate-700 text-[11px] leading-snug">{cite.guidelineItem}</div>
                    <p className="text-slate-500 text-[10px] leading-relaxed italic border-l-2 border-slate-250 pl-2 mt-1">
                      "{cite.explanation}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Referral Recommendations */}
          {assessment.referrals && assessment.referrals.length > 0 && (
            <div className="pt-2 border-t border-slate-100 space-y-1.5">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Indicated Referral Pathways
              </h4>
              <ul className="grid grid-cols-1 gap-1.5">
                {assessment.referrals.map((ref, idx) => (
                  <li key={idx} className="text-xs text-slate-700 flex items-start gap-2 bg-slate-50 p-2.5 border border-slate-200 rounded font-medium">
                    <ArrowRight className="w-3.5 h-3.5 text-yellow-650 mt-0.5 shrink-0" />
                    <span>{ref}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>
      </div>

      {/* Structured Category breakdowns */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden" id="report-treatment-pathways">
        <div className="bg-slate-50 border-b border-slate-200 px-3.5 py-2">
          <span className="text-[10.5px] font-bold text-slate-700 uppercase tracking-wider block">
            Evidence-Based Management Options
          </span>
        </div>
        <div className="p-3.5 grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Medical Supression options */}
          <div className="space-y-1">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1">
              <span className="text-xs font-bold text-slate-800">1. Hormonal trials (CQs 12 & 13)</span>
            </div>
            <ul className="space-y-1 pl-1">
              {assessment.managementOptions.medical.map((item, idx) => (
                <li key={idx} className="text-[11px] text-slate-650 flex items-start gap-1">
                  <span className="text-yellow-500 mr-1 shrink-0 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pain / Analgesics */}
          <div className="space-y-1">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1">
              <span className="text-xs font-bold text-slate-800">2. Analgesic trial options (CQ10)</span>
            </div>
            <ul className="space-y-1 pl-1">
              {assessment.managementOptions.analgesic.map((item, idx) => (
                <li key={idx} className="text-[11px] text-slate-650 flex items-start gap-1">
                  <span className="text-yellow-500 mr-1 shrink-0 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Supportive / Physiotheraphy details */}
          <div className="space-y-1">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1 font-bold">
              <span className="text-xs font-bold text-slate-800">3. Non-Pharm Supportive care (CQ16)</span>
            </div>
            <ul className="space-y-1 pl-1">
              {assessment.managementOptions.nonPharmacological.map((item, idx) => (
                <li key={idx} className="text-[11px] text-slate-650 flex items-start gap-1">
                  <span className="text-yellow-500 mr-1 shrink-0 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Surgical considerations */}
          <div className="space-y-1">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1">
              <span className="text-xs font-bold text-slate-800">4. Keyhole Surgical (CQs 14 & 18)</span>
            </div>
            <ul className="space-y-1 pl-1">
              {assessment.managementOptions.surgical.map((item, idx) => (
                <li key={idx} className="text-[11px] text-slate-650 flex items-start gap-1">
                  <span className="text-yellow-500 mr-1 shrink-0 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {/* Editable clinical summary copyable board */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden" id="report-clinic-note-editor">
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-yellow-600" />
            Draft Clinical Summary Note (Editable)
          </label>
          <button
            onClick={handleCopy}
            className="text-[10px] font-bold text-yellow-600 hover:text-yellow-800 inline-flex items-center gap-1 cursor-pointer select-none py-0.5 border border-dashed border-slate-350 hover:border-yellow-500 rounded px-1.5 bg-white transition-all uppercase tracking-tight"
            id="copy-to-emr-btn"
          >
            {copySuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>COPIED SUCCESSFULLY</span>
              </>
            ) : (
              <>
                <Clipboard className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>COPY TO CLINICAL NOTES</span>
              </>
            )}
          </button>
        </div>

        <div className="p-3 bg-white" id="clinical-record-emr-box">
          <p className="text-[10px] text-slate-500 mb-2 leading-relaxed">
            Review, append, or copy these draft records directly into EMR software. They include clinical metrics and citations:
          </p>
          <textarea
            ref={textareaRef}
            value={editedSummary}
            onChange={(e) => setEditedSummary(e.target.value)}
            className="w-full bg-[#FCFDFE] border border-slate-300 rounded p-3 text-slate-800 text-[11px] font-mono focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 leading-relaxed resize-none overflow-hidden select-text font-medium"
            id="clinical-summary-editable-textarea"
          />
          <p className="text-[9px] text-slate-405 mt-1.5 italic">
            * Field is live editable. Modifications made are saved directly prior to clipping.
          </p>
        </div>
      </div>



      {showDeclaration && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-[1px] flex items-center justify-center p-4 z-50 animate-in fade-in duration-200" id="declaration-modal-overlay">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150" id="declaration-modal">
            <div className="p-5 space-y-4">
              <div className="flex gap-3 items-start text-yellow-600">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                    Clinician Responsibility Declaration
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    To maintain clinical accountability and ensure patient safety, please confirm your review of this generated summary prior to export.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded text-slate-700 text-xs leading-relaxed font-medium font-sans">
                "I have had the opportunity to review and modify the information this tool has provided in line with my professional judgement, and understand I remain responsible for any final recommendations provided to the patient."
              </div>

              <div className="pt-2 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setShowDeclaration(false)}
                  className="px-3.5 py-2 border border-slate-300 hover:bg-slate-50 rounded font-semibold text-slate-600 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCopy}
                  className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 border border-yellow-500 rounded font-bold text-slate-950 hover:shadow transition-all cursor-pointer"
                  id="confirm-declaration-copy-btn"
                >
                  Yes, I Agree & Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
