import React from 'react';
import { PatientDetails } from '../types';
import { 
  Activity,
  History,
  Info,
  Calendar,
  PlusCircle,
  FileText
} from 'lucide-react';

interface AssessmentFormProps {
  formData: PatientDetails;
  onFormChange: (data: PatientDetails) => void;
  onAssessSubmit: () => void;
  isLoading: boolean;
}

export const AssessmentForm: React.FC<AssessmentFormProps> = ({
  formData,
  onFormChange,
  onAssessSubmit,
  isLoading
}) => {
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      onFormChange({
        ...formData,
        [name]: checked
      });
    } else {
      onFormChange({
        ...formData,
        [name]: value
      });
    }
  };

  const handleReset = () => {
    onFormChange({
      age: "",
      fertilityPriority: "unspecified",
      severePainfulPeriods: false,
      painWithSex: false,
      infertility: false,
      pelvicPain: false,
      heavyMenstrualBleeding: false,
      bowelSymptoms: false,
      severeTiredness: false,
      backPain: false,
      sleepDifficulty: false,
      headache: false,
      urinarySymptoms: false,
      allergies: false,
      autoimmuneHistory: false,
      familyHistory: false,
      examinationPerformed: "no",
      examinationDetails: "",
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
  };

  return (
    <div className="p-4 space-y-5" id="clinical-assessment-form-container">
      
      {/* Inputs Section */}
      <div className="space-y-4" id="demographics-form-fields">
        
        {/* Section 1: Demographics & Gynaecological Plans */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            1. Patient Demographics & Fertility Intention
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Age at Consultation <span className="text-red-600 font-bold">*</span>
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                placeholder="e.g. 15 or 32"
                min="1"
                max="120"
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 focus:outline-none transition-all placeholder:text-slate-400 font-medium"
                id="input-patient-age"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Desire for Unassisted Fertility <span className="text-red-500 font-bold">*</span>
              </label>
              <select
                name="fertilityPriority"
                value={formData.fertilityPriority}
                onChange={handleInputChange}
                className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 focus:outline-none bg-white font-medium"
                id="select-fertility-priority"
              >
                <option value="unspecified">-- Choose Fertility Intentions --</option>
                <option value="yes">Yes, actively trying to conceive</option>
                <option value="no">No active pregnancy plan</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Clinical Symptoms */}
        <div className="space-y-3" id="symptoms-section-box">
          
          {/* Commonest Symptoms Area */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              2. Commonest Symptoms (Associated with 25% – 70% of cases)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { label: "Severe painful periods (dysmenorrhoea)", key: "severePainfulPeriods", id: "chk-dysmenorrhea" },
                { label: "Deep pain with sex (dyspareunia)", key: "painWithSex", id: "chk-dyspareunia" },
                { label: "Infertility / conceiving delay", key: "infertility", id: "chk-infertility" },
                { label: "Chronic / cyclic pelvic pain", key: "pelvicPain", id: "chk-pelvic-pain" },
                { label: "Heavy menstrual bleeding", key: "heavyMenstrualBleeding", id: "chk-hmb" }
              ].map((symptom) => {
                const isChecked = !!(formData as any)[symptom.key];
                return (
                  <label
                    key={symptom.key}
                    className={`flex items-center p-2 rounded border text-xs cursor-pointer select-none transition-all duration-150 ${
                      isChecked 
                        ? "border-yellow-400 bg-yellow-50 text-slate-900 font-semibold" 
                        : "border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50/50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      name={symptom.key}
                      checked={isChecked}
                      onChange={handleInputChange}
                      className="w-3.5 h-3.5 text-yellow-650 rounded focus:ring-yellow-500 accent-yellow-500"
                      id={symptom.id}
                    />
                    <span className="ml-2 leading-tight">{symptom.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Less Common Symptoms Area */}
          <div className="space-y-2 pt-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              3. Less Common Symptoms (Associated with 10% – 25% of cases)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { label: "Bowel symptoms (constipation/dyschezia)", key: "bowelSymptoms" },
                { label: "Severe tiredness / chronic fatigue", key: "severeTiredness" },
                { label: "Lower back pain status", key: "backPain" },
                { label: "Sleep difficulty / insomnia", key: "sleepDifficulty" },
                { label: "Headache / cyclical migraine", key: "headache" },
                { label: "Urinary symptoms (urine burn/dysuria)", key: "urinarySymptoms" },
                { label: "Allergies history (hay fever/sinusitis)", key: "allergies" }
              ].map((symptom) => {
                const isChecked = !!(formData as any)[symptom.key];
                return (
                  <label
                    key={symptom.key}
                    className={`flex items-center p-2 rounded border text-xs cursor-pointer select-none transition-all duration-150 ${
                      isChecked 
                        ? "border-yellow-400 bg-yellow-50 text-slate-900 font-semibold" 
                        : "border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50/50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      name={symptom.key}
                      checked={isChecked}
                      onChange={handleInputChange}
                      className="w-3.5 h-3.5 text-yellow-650 rounded focus:ring-yellow-500 accent-yellow-500"
                    />
                    <span className="ml-2 leading-tight">{symptom.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* CUSTOM SYMPTOMS FREE TEXT BOX */}
          <div className="space-y-1.5 pt-1">
            <label className="block text-[11px] font-semibold text-slate-700">
              Other Related Symptoms & Custom Observations (Specify below)
            </label>
            <textarea
              name="otherSymptomsFreeText"
              value={formData.otherSymptomsFreeText || ""}
              onChange={handleInputChange}
              rows={2}
              placeholder="Enter details on specific pain thresholds, chest symptoms, cyclical flares, or custom symptoms..."
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 focus:outline-none resize-none text-slate-800"
              id="txt-custom-other-symptoms"
            />
          </div>

        </div>

        {/* Section 4: History & Diagnostics */}
        <div className="space-y-3 pt-2" id="medical-family-investigations">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            4. Family History & Co-morbidities
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            <label className={`flex items-start p-3 border rounded text-xs cursor-pointer select-none transition-all duration-150 ${
              formData.familyHistory 
                ? "border-yellow-400 bg-yellow-50 text-slate-900" 
                : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white"
            }`}>
              <input
                type="checkbox"
                name="familyHistory"
                checked={formData.familyHistory}
                onChange={handleInputChange}
                className="mt-0.5 w-3.5 h-3.5 text-yellow-600 rounded focus:ring-yellow-500 accent-yellow-500"
                id="chk-family-history"
              />
              <div className="ml-2.5">
                <span className="block font-bold">First-Degree Relative</span>
                <span className="block text-[10px] text-slate-550 mt-0.5 leading-normal">
                  Mother or sister has confirmed diagnosis (increases risk up to 30%).
                </span>
              </div>
            </label>

            <label className={`flex items-start p-3 border rounded text-xs cursor-pointer select-none transition-all duration-150 ${
              formData.autoimmuneHistory 
                ? "border-yellow-400 bg-yellow-50 text-slate-900" 
                : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white"
            }`}>
              <input
                type="checkbox"
                name="autoimmuneHistory"
                checked={formData.autoimmuneHistory}
                onChange={handleInputChange}
                className="mt-0.5 w-3.5 h-3.5 text-yellow-600 rounded focus:ring-yellow-500 accent-yellow-500"
                id="chk-autoimmune-history"
              />
              <div className="ml-2.5">
                <span className="block font-bold">Autoimmune disease</span>
                <span className="block text-[10px] text-slate-550 mt-0.5 leading-normal">
                  Sjögren's, Lupus, RA, or Celiac Disease increases statistical probability.
                </span>
              </div>
            </label>

          </div>
        </div>

        {/* Practical Pelvic Exam section with warning guidance */}
        <div className="space-y-2 pt-2" id="exam-guidance-inputs">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            5. Clinical Pelvic Examination Findings
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3 border border-slate-200 rounded-md">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Exam Performed Status
              </label>
              <select
                name="examinationPerformed"
                value={formData.examinationPerformed}
                onChange={handleInputChange}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 focus:outline-none bg-white"
                id="select-exam-performed"
              >
                <option value="no">No examination performed</option>
                <option value="yes_normal">Yes - findings are within normal parameters</option>
                <option value="yes_abnormal">Yes - abnormal findings noted</option>
                <option value="inappropriate">Deemed clinically inappropriate</option>
              </select>
              <span className="block text-[9px] text-slate-400 mt-1 leading-normal">
                * Note: Under 19 or vaginismus makes the pelvic exam inappropriate. A normal exam does NOT rule out endometriosis.
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Examination Details / Palpable Findings
              </label>
              <textarea
                name="examinationDetails"
                value={formData.examinationDetails}
                onChange={handleInputChange}
                placeholder="Describe any palpable nodules, pelvic tenderness, visible lesions..."
                rows={3}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 focus:outline-none resize-none font-medium"
                id="txt-exam-details"
                disabled={formData.examinationPerformed === 'no' || formData.examinationPerformed === 'inappropriate'}
              />
            </div>
          </div>
        </div>

        {/* Section 6: Prior Imaging & Investigations */}
        <div className="space-y-3 pt-2" id="report-imaging-criteria">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            6. Diagnostic Imaging & Lab Findings
          </label>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* TVUS/TAUS */}
            <div className="p-3 border border-slate-200 rounded bg-white text-xs flex flex-col justify-between">
              <div>
                <span className="block font-bold text-slate-700 mb-1">Pelvic Ultrasound findings</span>
                <select
                  name="ultrasoundDone"
                  value={formData.ultrasoundDone}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1 border border-slate-300 rounded bg-white mb-2 text-xs"
                >
                  <option value="no">No ultrasound done</option>
                  <option value="yes_transvaginal">Transvaginal Ultrasound (TVUS) - Preferred</option>
                  <option value="yes_transabdominal">Transabdominal Ultrasound - Youth/Alt</option>
                </select>
                <input
                  type="text"
                  name="ultrasoundFindings"
                  value={formData.ultrasoundFindings || ""}
                  onChange={handleInputChange}
                  placeholder="e.g. Left endometrioma 3.5cm"
                  className="w-full px-2 py-1 border border-slate-300 rounded text-xs placeholder:text-slate-400 mb-2"
                  disabled={formData.ultrasoundDone === 'no'}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Date Performed:</label>
                <input
                  type="date"
                  name="ultrasoundDate"
                  value={formData.ultrasoundDate || ""}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1 border border-slate-300 rounded text-xs text-slate-700 bg-white"
                  disabled={formData.ultrasoundDone === 'no'}
                />
              </div>
            </div>

            {/* Pelvic MRI */}
            <div className="p-3 border border-slate-200 rounded bg-white text-xs flex flex-col justify-between">
              <div>
                <span className="block font-bold text-slate-700 mb-1">Pelvic MRI status</span>
                <select
                  name="mriDone"
                  value={formData.mriDone}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1 border border-slate-300 rounded bg-white mb-2 text-xs"
                >
                  <option value="no">No MRI done</option>
                  <option value="yes">Pelvic MRI performed</option>
                </select>
                <input
                  type="text"
                  name="mriFindings"
                  value={formData.mriFindings || ""}
                  onChange={handleInputChange}
                  placeholder="e.g. Suspected deep infiltration"
                  className="w-full px-2 py-1 border border-slate-300 rounded text-xs placeholder:text-slate-400 mb-2"
                  disabled={formData.mriDone === 'no'}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Date Performed:</label>
                <input
                  type="date"
                  name="mriDate"
                  value={formData.mriDate || ""}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1 border border-slate-300 rounded text-xs text-slate-700 bg-white"
                  disabled={formData.mriDone === 'no'}
                />
              </div>
            </div>

            {/* Diagnostic Laparoscopy */}
            <div className="p-3 border border-slate-200 rounded bg-white text-xs flex flex-col justify-between">
              <div>
                <span className="block font-bold text-slate-700 mb-1">Prior Laparoscopy status</span>
                <select
                  name="laparoscopyDone"
                  value={formData.laparoscopyDone}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1 border border-slate-300 rounded bg-white mb-2 text-xs"
                >
                  <option value="no">No prior laparoscopy</option>
                  <option value="yes">Laparoscopy previously done</option>
                </select>
                <input
                  type="text"
                  name="laparoscopyFindings"
                  value={formData.laparoscopyFindings || ""}
                  onChange={handleInputChange}
                  placeholder="e.g. Peritoneal disease excision"
                  className="w-full px-2 py-1 border border-slate-300 rounded text-xs placeholder:text-slate-400 mb-2"
                  disabled={formData.laparoscopyDone === 'no'}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Date Performed:</label>
                <input
                  type="date"
                  name="laparoscopyDate"
                  value={formData.laparoscopyDate || ""}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1 border border-slate-300 rounded text-xs text-slate-700 bg-white"
                  disabled={formData.laparoscopyDone === 'no'}
                />
              </div>
            </div>

            {/* Serum CA125 */}
            <div className="p-3 border border-slate-200 rounded bg-white text-xs flex flex-col justify-between">
              <div>
                <span className="block font-bold text-slate-700 mb-1">CA125 Biomarker</span>
                <select
                  name="ca125Done"
                  value={formData.ca125Done}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1 border border-slate-300 rounded bg-white mb-2 text-xs"
                >
                  <option value="no">No CA125 checked</option>
                  <option value="yes">CA125 checked</option>
                </select>
                <input
                  type="text"
                  name="ca125Value"
                  value={formData.ca125Value || ""}
                  onChange={handleInputChange}
                  placeholder="Result in U/mL (e.g. 42)"
                  className="w-full px-2 py-1 border border-slate-300 rounded text-xs placeholder:text-slate-400 mb-2"
                  disabled={formData.ca125Done === 'no'}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Date Performed:</label>
                <input
                  type="date"
                  name="ca125Date"
                  value={formData.ca125Date || ""}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1 border border-slate-300 rounded text-xs text-slate-700 bg-white"
                  disabled={formData.ca125Done === 'no'}
                />
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Analysis action buttons section */}
      <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row gap-3 justify-between items-center" id="form-actions-submit-section">
        <button
          type="button"
          onClick={handleReset}
          className="w-full sm:w-auto px-4 py-2 border border-slate-300 hover:bg-slate-50 rounded text-xs font-semibold text-slate-700 uppercase tracking-wider transition-colors cursor-pointer select-none"
        >
          Reset Parameters
        </button>
        
        <button
          type="button"
          onClick={onAssessSubmit}
          disabled={isLoading}
          className={`w-full sm:w-auto px-6 py-2.5 rounded text-xs font-bold uppercase tracking-widest text-slate-900 shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 ${
            isLoading 
              ? "bg-slate-300 text-slate-500 cursor-not-allowed" 
              : "bg-yellow-400 hover:bg-yellow-500 active:bg-yellow-600 border border-yellow-500"
          }`}
          id="assess-submit-button"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-slate-905 inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Consulting RANZCOG Guidelines...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4 text-slate-900" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
              </svg>
              <span>Generate Clinical Analysis</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
};
