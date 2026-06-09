export interface PatientDetails {
  age: string; // empty string or number string
  fertilityPriority: 'yes' | 'no' | 'unspecified' | 'unknown';
  severePainfulPeriods: boolean;
  painWithSex: boolean;
  infertility: boolean;
  pelvicPain: boolean;
  heavyMenstrualBleeding: boolean;
  
  // Less common symptoms
  bowelSymptoms: boolean; // constipation, diarrhoea, pain with bowel movement
  severeTiredness: boolean;
  backPain: boolean;
  sleepDifficulty: boolean;
  headache: boolean;
  urinarySymptoms: boolean; // dysuria, bladder pain, urine burn
  allergies: boolean;
  
  // None reported flags
  commonNoneReported?: boolean;
  lessCommonNoneReported?: boolean;

  // History
  autoimmuneHistory: boolean;
  autoimmuneDetails?: 'none' | 'sjogrens' | 'lupus' | 'rheumatoid_arthritis' | 'celiac' | 'other';
  autoimmuneOtherText?: string;
  familyHistory: boolean; // first-degree relative
  familyHistoryRelation?: 'none' | 'mother' | 'sister' | 'both';

  // Physical Examination
  examinationPerformed: 'yes_normal' | 'yes_abnormal' | 'no' | 'inappropriate';
  examinationDetails: string;

  // Imaging and investigations
  ultrasoundDone: 'yes_transvaginal' | 'yes_transabdominal' | 'no';
  ultrasoundFindings: string;
  ultrasoundDate?: string;
  mriDone: 'yes' | 'no';
  mriFindings: string;
  mriDate?: string;
  laparoscopyDone: 'yes' | 'no';
  laparoscopyFindings: string;
  laparoscopyDate?: string;
  ca125Done: 'yes' | 'no';
  ca125Value: string;
  ca125Date?: string;

  // Plural collections (supporting more than one entry)
  ultrasounds?: UltrasoundRecord[];
  mris?: MriRecord[];
  laparoscopies?: LaparoscopyRecord[];
  ca125s?: Ca125Record[];

  // Additional options
  otherSymptomsFreeText?: string;
}

export interface UltrasoundRecord {
  done: 'yes_transvaginal' | 'yes_transabdominal' | 'no';
  findings: string;
  date?: string;
}

export interface MriRecord {
  done: 'yes' | 'no';
  findings: string;
  date?: string;
}

export interface LaparoscopyRecord {
  done: 'yes' | 'no';
  findings: string;
  date?: string;
}

export interface Ca125Record {
  done: 'yes' | 'no';
  value: string;
  date?: string;
}

export interface Citation {
  recommendationNo: string;
  type: string; // e.g. "Conditional Recommendation", "Strong Recommendation", "Good Practice Statement"
  guidelineItem: string; // Short caption of what it is
  explanation: string; // Exact context from the guideline
}

export interface ClinicalAssessmentResult {
  missingVariables: string[];
  missingExplanation: string | null;
  levelOfSuspicion: 'Low' | 'Moderate' | 'High' | 'Insufficient Information';
  clinicalReasoning: string;
  citations: Citation[];
  referrals: string[];
  managementOptions: {
    medical: string[];
    analgesic: string[];
    nonPharmacological: string[];
    surgical: string[];
  };
  clinicSummary: string;
}
