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
  
  const ultrasoundsList = formData.ultrasounds || [];
  const mrisList = formData.mris || [];
  const laparoscopiesList = formData.laparoscopies || [];
  const ca125sList = formData.ca125s || [];

  const addUltrasound = () => {
    onFormChange({
      ...formData,
      ultrasounds: [...ultrasoundsList, { done: 'no', findings: '', date: '' }]
    });
  };

  const removeUltrasound = (index: number) => {
    const updated = [...ultrasoundsList];
    updated.splice(index, 1);
    onFormChange({
      ...formData,
      ultrasounds: updated
    });
  };

  const updateUltrasound = (index: number, field: string, value: any) => {
    const updated = [...ultrasoundsList];
    updated[index] = {
      ...updated[index],
      [field]: value
    } as any;
    onFormChange({
      ...formData,
      ultrasounds: updated
    });
  };

  const addMri = () => {
    onFormChange({
      ...formData,
      mris: [...mrisList, { done: 'no', findings: '', date: '' }]
    });
  };

  const removeMri = (index: number) => {
    const updated = [...mrisList];
    updated.splice(index, 1);
    onFormChange({
      ...formData,
      mris: updated
    });
  };

  const updateMri = (index: number, field: string, value: any) => {
    const updated = [...mrisList];
    updated[index] = {
      ...updated[index],
      [field]: value
    } as any;
    onFormChange({
      ...formData,
      mris: updated
    });
  };

  const addLaparoscopy = () => {
    onFormChange({
      ...formData,
      laparoscopies: [...laparoscopiesList, { done: 'no', findings: '', date: '' }]
    });
  };

  const removeLaparoscopy = (index: number) => {
    const updated = [...laparoscopiesList];
    updated.splice(index, 1);
    onFormChange({
      ...formData,
      laparoscopies: updated
    });
  };

  const updateLaparoscopy = (index: number, field: string, value: any) => {
    const updated = [...laparoscopiesList];
    updated[index] = {
      ...updated[index],
      [field]: value
    } as any;
    onFormChange({
      ...formData,
      laparoscopies: updated
    });
  };

  const addCa125 = () => {
    onFormChange({
      ...formData,
      ca125s: [...ca125sList, { done: 'no', value: '', date: '' }]
    });
  };

  const removeCa125 = (index: number) => {
    const updated = [...ca125sList];
    updated.splice(index, 1);
    onFormChange({
      ...formData,
      ca125s: updated
    });
  };

  const updateCa125 = (index: number, field: string, value: any) => {
    const updated = [...ca125sList];
    updated[index] = {
      ...updated[index],
      [field]: value
    } as any;
    onFormChange({
      ...formData,
      ca125s: updated
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      let updatedData = {
        ...formData,
        [name]: checked
      };
      
      if (name === 'commonNoneReported' && checked) {
        updatedData.severePainfulPeriods = false;
        updatedData.painWithSex = false;
        updatedData.infertility = false;
        updatedData.pelvicPain = false;
        updatedData.heavyMenstrualBleeding = false;
      } else if (['severePainfulPeriods', 'painWithSex', 'infertility', 'pelvicPain', 'heavyMenstrualBleeding'].includes(name) && checked) {
        updatedData.commonNoneReported = false;
      }
      
      if (name === 'lessCommonNoneReported' && checked) {
        updatedData.bowelSymptoms = false;
        updatedData.severeTiredness = false;
        updatedData.backPain = false;
        updatedData.sleepDifficulty = false;
        updatedData.headache = false;
        updatedData.urinarySymptoms = false;
        updatedData.allergies = false;
      } else if (['bowelSymptoms', 'severeTiredness', 'backPain', 'sleepDifficulty', 'headache', 'urinarySymptoms', 'allergies'].includes(name) && checked) {
        updatedData.lessCommonNoneReported = false;
      }
      
      onFormChange(updatedData);
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
      tryingToConceiveMonths: "",
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
      commonNoneReported: false,
      lessCommonNoneReported: false,
      autoimmuneHistory: false,
      autoimmuneDetails: "none",
      autoimmuneOtherText: "",
      familyHistory: false,
      familyHistoryRelation: "none",
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
      ultrasounds: [],
      mris: [],
      laparoscopies: [],
      ca125s: [],
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
                <option value="unknown">Unknown / Not determined</option>
              </select>
            </div>
          </div>
          {formData.fertilityPriority === 'yes' && (
            <div className="bg-amber-50/40 border border-amber-200/80 rounded p-2.5 mt-2 animate-fadeIn flex flex-col items-center text-center" id="trying-to-conceive-duration-container">
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Estimated duration actively trying to conceive (in months)
              </label>
              <input
                type="number"
                name="tryingToConceiveMonths"
                value={formData.tryingToConceiveMonths || ""}
                onChange={handleInputChange}
                placeholder="e.g. 6, 12, etc."
                min="0"
                max="300"
                className="w-full sm:max-w-[200px] px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 focus:outline-none transition-all placeholder:text-slate-400 font-medium text-center"
                id="input-trying-to-conceive-months"
              />
            </div>
          )}
        </div>

        {/* Section 2: Clinical Symptoms */}
        <div className="space-y-3" id="symptoms-section-box">
          
          {/* Common Symptoms Area */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              2. Common Symptoms
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { label: "Severe painful periods (dysmenorrhoea)", key: "severePainfulPeriods", id: "chk-dysmenorrhea" },
                { label: "Deep pain with sex (dyspareunia)", key: "painWithSex", id: "chk-dyspareunia" },
                { label: "Infertility / conceiving delay", key: "infertility", id: "chk-infertility" },
                { label: "Chronic / cyclic pelvic pain", key: "pelvicPain", id: "chk-pelvic-pain" },
                { label: "Heavy menstrual bleeding", key: "heavyMenstrualBleeding", id: "chk-hmb" },
                { label: "None reported", key: "commonNoneReported", id: "chk-common-none" }
              ].map((symptom) => {
                const isChecked = !!(formData as any)[symptom.key];
                return (
                  <label
                    key={symptom.key}
                    className={`flex items-center p-2 rounded border text-xs cursor-pointer select-none transition-all duration-150 w-full h-full min-h-[52px] ${
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
              3. Less Common Symptoms
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { label: "Bowel symptoms (constipation/dyschezia)", key: "bowelSymptoms" },
                { label: "Severe tiredness / chronic fatigue", key: "severeTiredness" },
                { label: "Lower back pain status", key: "backPain" },
                { label: "Sleep difficulty / insomnia", key: "sleepDifficulty" },
                { label: "Headache / cyclical migraine", key: "headache" },
                { label: "Urinary symptoms (urine burn/dysuria)", key: "urinarySymptoms" },
                { label: "Allergies history (hay fever/sinusitis)", key: "allergies" },
                { label: "None reported", key: "lessCommonNoneReported" }
              ].map((symptom) => {
                const isChecked = !!(formData as any)[symptom.key];
                return (
                  <label
                    key={symptom.key}
                    className={`flex items-center p-2 rounded border text-xs cursor-pointer select-none transition-all duration-150 w-full h-full min-h-[52px] ${
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
        <div className="space-y-4 pt-2" id="medical-family-investigations">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            4. Family History & Co-morbidities
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* First-Degree Relative Radio buttons */}
            <div className="p-3 border border-slate-205 rounded-md bg-white space-y-2">
              <span className="block text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>First-Degree Relative History</span>
              </span>
              <p className="text-[10px] text-slate-450 leading-relaxed">
                Confirmed endometriosis diagnosis in immediate family (increases risk up to 30%).
              </p>
              <div className="space-y-1.5 pt-1">
                {[
                  { label: "No family history in first-degree relatives", value: "none" },
                  { label: "Mother has confirmed diagnosis", value: "mother" },
                  { label: "Sister has confirmed diagnosis", value: "sister" },
                  { label: "Both Mother and Sister have confirmed diagnosis", value: "both" }
                ].map((option) => {
                  const isSelected = (formData.familyHistoryRelation || "none") === option.value;
                  return (
                    <label
                      key={option.value}
                      className={`flex items-center p-2 rounded border text-[11px] cursor-pointer select-none transition-all duration-150 ${
                        isSelected
                          ? "border-yellow-400 bg-yellow-50 text-slate-900 font-semibold"
                          : "border-slate-100 hover:border-slate-200 text-slate-700 hover:bg-slate-50/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="familyHistoryRelation"
                        value={option.value}
                        checked={isSelected}
                        onChange={() => {
                          onFormChange({
                            ...formData,
                            familyHistoryRelation: option.value as any,
                            familyHistory: option.value !== "none"
                          });
                        }}
                        className="w-3.5 h-3.5 text-yellow-600 focus:ring-yellow-500 accent-yellow-500 shrink-0"
                      />
                      <span className="ml-2 leading-snug">{option.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Autoimmune History Radio buttons */}
            <div className="p-3 border border-slate-205 rounded-md bg-white space-y-2">
              <span className="block text-xs font-bold text-slate-700">
                Autoimmune Disease History
              </span>
              <p className="text-[10px] text-slate-450 leading-relaxed">
                Co-morbid immune conditions that statistically increase endometriosis clinical correlation.
              </p>
              <div className="space-y-1.5 pt-1">
                {[
                  { label: "No history of autoimmune disease", value: "none" },
                  { label: "Sjögren's Syndrome", value: "sjogrens" },
                  { label: "Lupus (Systemic Lupus Erythematosus)", value: "lupus" },
                  { label: "Rheumatoid Arthritis", value: "rheumatoid_arthritis" },
                  { label: "Celiac Disease", value: "celiac" },
                  { label: "Other Autoimmune Condition", value: "other" }
                ].map((option) => {
                  const isSelected = (formData.autoimmuneDetails || "none") === option.value;
                  return (
                    <label
                      key={option.value}
                      className={`flex items-center p-1.5 rounded border text-[11px] cursor-pointer select-none transition-all duration-150 ${
                        isSelected
                          ? "border-yellow-400 bg-yellow-50 text-slate-900 font-semibold"
                          : "border-slate-100 hover:border-slate-200 text-slate-700 hover:bg-slate-50/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="autoimmuneDetails"
                        value={option.value}
                        checked={isSelected}
                        onChange={() => {
                          onFormChange({
                            ...formData,
                            autoimmuneDetails: option.value as any,
                            autoimmuneHistory: option.value !== "none"
                          });
                        }}
                        className="w-3.5 h-3.5 text-yellow-600 focus:ring-yellow-500 accent-yellow-500 shrink-0"
                      />
                      <span className="ml-2 leading-snug">{option.label}</span>
                    </label>
                  );
                })}
              </div>

              {formData.autoimmuneDetails === "other" && (
                <div className="pt-2 animate-in slide-in-from-top-1 fade-in duration-150" id="other-autoimmune-field-wrapper">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Please specify other condition <span className="text-red-500 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    name="autoimmuneOtherText"
                    required
                    value={formData.autoimmuneOtherText || ""}
                    onChange={handleInputChange}
                    placeholder="e.g. Hashimoto's Thyroiditis, Crohn's Disease, etc."
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 focus:outline-none placeholder:text-slate-400 font-medium text-slate-800"
                    id="txt-custom-autoimmune-details"
                  />
                </div>
              )}
            </div>

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
            6. Diagnostic Imaging & Pathology Findings
          </label>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* TVUS/TAUS */}
            <div className="p-3 border border-slate-200 rounded bg-white text-xs space-y-3">
              <div className="flex justify-between items-center pb-1.5 border-b border-slate-100">
                <span className="font-bold text-slate-700">Pelvic Ultrasound findings</span>
                <button
                  type="button"
                  onClick={addUltrasound}
                  className="text-[10px] font-bold text-yellow-600 hover:text-yellow-700 inline-flex items-center gap-1 cursor-pointer select-none"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>ADD ANOTHER</span>
                </button>
              </div>

              {/* Primary ultrasound */}
              <div className="space-y-2 bg-slate-50/50 p-2 rounded border border-slate-150/60">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400">PRIMARY RESULT</span>
                </div>
                <select
                  name="ultrasoundDone"
                  value={formData.ultrasoundDone}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1 border border-slate-300 rounded bg-white text-xs focus:ring-1 focus:ring-yellow-500 focus:outline-none"
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
                  className="w-full px-2 py-1 border border-slate-300 rounded text-xs placeholder:text-slate-400"
                  disabled={formData.ultrasoundDone === 'no'}
                />
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Date Performed:</label>
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

              {/* Additional ultrasounds */}
              {ultrasoundsList.map((ul, idx) => (
                <div key={idx} className="space-y-2 bg-[#FCFDFE] p-2 rounded border border-slate-150 relative animate-in fade-in slide-in-from-top-1 duration-100">
                  <div className="flex justify-between items-center pb-1 border-b border-dashed border-slate-150">
                    <span className="text-[10px] font-bold text-slate-400">ADDITIONAL RESULT #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeUltrasound(idx)}
                      className="text-red-500 hover:text-red-700 font-bold text-[10px] cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                  <select
                    value={ul.done}
                    onChange={(e) => updateUltrasound(idx, 'done', e.target.value)}
                    className="w-full px-2 py-1 border border-slate-300 rounded bg-white text-xs focus:ring-1 focus:ring-yellow-500 focus:outline-none"
                  >
                    <option value="no">No ultrasound done</option>
                    <option value="yes_transvaginal">Transvaginal Ultrasound (TVUS) - Preferred</option>
                    <option value="yes_transabdominal">Transabdominal Ultrasound - Youth/Alt</option>
                  </select>
                  <input
                    type="text"
                    value={ul.findings || ""}
                    onChange={(e) => updateUltrasound(idx, 'findings', e.target.value)}
                    placeholder="Findings details..."
                    className="w-full px-2 py-1 border border-slate-300 rounded text-xs placeholder:text-slate-400"
                    disabled={ul.done === 'no'}
                  />
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Date Performed:</label>
                    <input
                      type="date"
                      value={ul.date || ""}
                      onChange={(e) => updateUltrasound(idx, 'date', e.target.value)}
                      className="w-full px-2 py-1 border border-slate-300 rounded text-xs text-slate-705 bg-white"
                      disabled={ul.done === 'no'}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Pelvic MRI */}
            <div className="p-3 border border-slate-200 rounded bg-white text-xs space-y-3">
              <div className="flex justify-between items-center pb-1.5 border-b border-slate-100">
                <span className="font-bold text-slate-700">Pelvic MRI status</span>
                <button
                  type="button"
                  onClick={addMri}
                  className="text-[10px] font-bold text-yellow-600 hover:text-yellow-700 inline-flex items-center gap-1 cursor-pointer select-none"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>ADD ANOTHER</span>
                </button>
              </div>

              {/* Primary MRI */}
              <div className="space-y-2 bg-slate-50/50 p-2 rounded border border-slate-150/60">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400">PRIMARY RESULT</span>
                </div>
                <select
                  name="mriDone"
                  value={formData.mriDone}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1 border border-slate-300 rounded bg-white text-xs focus:ring-1 focus:ring-yellow-500 focus:outline-none"
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
                  className="w-full px-2 py-1 border border-slate-300 rounded text-xs placeholder:text-slate-400"
                  disabled={formData.mriDone === 'no'}
                />
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Date Performed:</label>
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

              {/* Additional MRIs */}
              {mrisList.map((m, idx) => (
                <div key={idx} className="space-y-2 bg-[#FCFDFE] p-2 rounded border border-slate-150 relative animate-in fade-in slide-in-from-top-1 duration-100">
                  <div className="flex justify-between items-center pb-1 border-b border-dashed border-slate-150">
                    <span className="text-[10px] font-bold text-slate-400">ADDITIONAL RESULT #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeMri(idx)}
                      className="text-red-500 hover:text-red-700 font-bold text-[10px] cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                  <select
                    value={m.done}
                    onChange={(e) => updateMri(idx, 'done', e.target.value)}
                    className="w-full px-2 py-1 border border-slate-300 rounded bg-white text-xs focus:ring-1 focus:ring-yellow-500 focus:outline-none"
                  >
                    <option value="no">No MRI done</option>
                    <option value="yes">Pelvic MRI performed</option>
                  </select>
                  <input
                    type="text"
                    value={m.findings || ""}
                    onChange={(e) => updateMri(idx, 'findings', e.target.value)}
                    placeholder="Findings details..."
                    className="w-full px-2 py-1 border border-slate-300 rounded text-xs placeholder:text-slate-400"
                    disabled={m.done === 'no'}
                  />
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Date Performed:</label>
                    <input
                      type="date"
                      value={m.date || ""}
                      onChange={(e) => updateMri(idx, 'date', e.target.value)}
                      className="w-full px-2 py-1 border border-slate-300 rounded text-xs text-slate-705 bg-white"
                      disabled={m.done === 'no'}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Diagnostic Laparoscopy */}
            <div className="p-3 border border-slate-200 rounded bg-white text-xs space-y-3">
              <div className="flex justify-between items-center pb-1.5 border-b border-slate-100">
                <span className="font-bold text-slate-700">Prior Laparoscopy status</span>
                <button
                  type="button"
                  onClick={addLaparoscopy}
                  className="text-[10px] font-bold text-yellow-600 hover:text-yellow-700 inline-flex items-center gap-1 cursor-pointer select-none"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>ADD ANOTHER</span>
                </button>
              </div>

              {/* Primary Laparoscopy */}
              <div className="space-y-2 bg-slate-50/50 p-2 rounded border border-slate-150/60">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400">PRIMARY RESULT</span>
                </div>
                <select
                  name="laparoscopyDone"
                  value={formData.laparoscopyDone}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1 border border-slate-300 rounded bg-white text-xs focus:ring-1 focus:ring-yellow-500 focus:outline-none"
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
                  className="w-full px-2 py-1 border border-slate-300 rounded text-xs placeholder:text-slate-400"
                  disabled={formData.laparoscopyDone === 'no'}
                />
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Date Performed:</label>
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

              {/* Additional Laparoscopies */}
              {laparoscopiesList.map((lap, idx) => (
                <div key={idx} className="space-y-2 bg-[#FCFDFE] p-2 rounded border border-slate-150 relative animate-in fade-in slide-in-from-top-1 duration-100">
                  <div className="flex justify-between items-center pb-1 border-b border-dashed border-slate-150">
                    <span className="text-[10px] font-bold text-slate-400">ADDITIONAL RESULT #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeLaparoscopy(idx)}
                      className="text-red-500 hover:text-red-700 font-bold text-[10px] cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                  <select
                    value={lap.done}
                    onChange={(e) => updateLaparoscopy(idx, 'done', e.target.value)}
                    className="w-full px-2 py-1 border border-slate-300 rounded bg-white text-xs focus:ring-1 focus:ring-yellow-500 focus:outline-none"
                  >
                    <option value="no">No prior laparoscopy</option>
                    <option value="yes">Laparoscopy previously done</option>
                  </select>
                  <input
                    type="text"
                    value={lap.findings || ""}
                    onChange={(e) => updateLaparoscopy(idx, 'findings', e.target.value)}
                    placeholder="Findings details..."
                    className="w-full px-2 py-1 border border-slate-300 rounded text-xs placeholder:text-slate-400"
                    disabled={lap.done === 'no'}
                  />
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Date Performed:</label>
                    <input
                      type="date"
                      value={lap.date || ""}
                      onChange={(e) => updateLaparoscopy(idx, 'date', e.target.value)}
                      className="w-full px-2 py-1 border border-slate-300 rounded text-xs text-slate-705 bg-white"
                      disabled={lap.done === 'no'}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Serum CA125 */}
            <div className="p-3 border border-slate-200 rounded bg-white text-xs space-y-3">
              <div className="flex justify-between items-center pb-1.5 border-b border-slate-100">
                <span className="font-bold text-slate-700">CA125 Biomarker</span>
                <button
                  type="button"
                  onClick={addCa125}
                  className="text-[10px] font-bold text-yellow-600 hover:text-yellow-700 inline-flex items-center gap-1 cursor-pointer select-none"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>ADD ANOTHER</span>
                </button>
              </div>

              {/* Primary CA125 */}
              <div className="space-y-2 bg-slate-50/50 p-2 rounded border border-slate-150/60">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400">PRIMARY RESULT</span>
                </div>
                <select
                  name="ca125Done"
                  value={formData.ca125Done}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1 border border-slate-300 rounded bg-white text-xs focus:ring-1 focus:ring-yellow-500 focus:outline-none"
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
                  className="w-full px-2 py-1 border border-slate-300 rounded text-xs placeholder:text-slate-400"
                  disabled={formData.ca125Done === 'no'}
                />
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Date Performed:</label>
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

              {/* Additional CA125s */}
              {ca125sList.map((c, idx) => (
                <div key={idx} className="space-y-2 bg-[#FCFDFE] p-2 rounded border border-slate-150 relative animate-in fade-in slide-in-from-top-1 duration-100">
                  <div className="flex justify-between items-center pb-1 border-b border-dashed border-slate-150">
                    <span className="text-[10px] font-bold text-slate-400">ADDITIONAL RESULT #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeCa125(idx)}
                      className="text-red-500 hover:text-red-700 font-bold text-[10px] cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                  <select
                    value={c.done}
                    onChange={(e) => updateCa125(idx, 'done', e.target.value)}
                    className="w-full px-2 py-1 border border-slate-300 rounded bg-white text-xs focus:ring-1 focus:ring-yellow-500 focus:outline-none"
                  >
                    <option value="no">No CA125 checked</option>
                    <option value="yes">CA125 checked</option>
                  </select>
                  <input
                    type="text"
                    value={c.value || ""}
                    onChange={(e) => updateCa125(idx, 'value', e.target.value)}
                    placeholder="Result detail..."
                    className="w-full px-2 py-1 border border-slate-300 rounded text-xs placeholder:text-slate-400"
                    disabled={c.done === 'no'}
                  />
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Date Performed:</label>
                    <input
                      type="date"
                      value={c.date || ""}
                      onChange={(e) => updateCa125(idx, 'date', e.target.value)}
                      className="w-full px-2 py-1 border border-slate-300 rounded text-xs text-slate-705 bg-white"
                      disabled={c.done === 'no'}
                    />
                  </div>
                </div>
              ))}
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
              <span>Generate Clinical Evaluation</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
};
