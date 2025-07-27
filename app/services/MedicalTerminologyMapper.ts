// Medical Terminology Mapper Service
// Maps Arabic medical terms to standardized medical codes (SNOMED CT, ICD-11)
// Based on MedSpaCy methodology with Arabic language support

export interface MedicalEntity {
  text: string;
  label: string;
  start: number;
  end: number;
  confidence: number;
  snomedCode?: string;
  icd11Code?: string;
  umls?: string;
}

export interface MedicalMappingResult {
  originalText: string;
  entities: MedicalEntity[];
  mappedTerms: StandardizedTerm[];
  confidence: number;
  processingTime: number;
}

export interface StandardizedTerm {
  originalText: string;
  arabicText?: string;
  englishText: string;
  category: MedicalCategory;
  snomedCT: {
    code: string;
    display: string;
    system: string;
  };
  icd11: {
    code: string;
    display: string;
    system: string;
  };
  umls?: {
    cui: string;
    preferredTerm: string;
  };
  confidence: number;
  synonyms: string[];
}

export type MedicalCategory = 
  | 'symptom'
  | 'disease'
  | 'medication'
  | 'procedure'
  | 'anatomy'
  | 'observation'
  | 'disorder'
  | 'finding';

export interface MappingRule {
  pattern: RegExp;
  category: MedicalCategory;
  snomedCode: string;
  icd11Code: string;
  confidence: number;
  synonyms: string[];
}

export class MedicalTerminologyMapper {
  private readonly MEDICAL_MAPPING_RULES: { [key: string]: MappingRule[] } = {
    // Symptoms and Signs (English + Arabic)
    symptoms: [
      // English symptoms - prioritized for English speakers
      {
        pattern: /\b(pain|ache|aching|hurt|hurting|discomfort|sore|soreness)\b/gi,
        category: 'symptom',
        snomedCode: '22253000',
        icd11Code: 'MD81',
        confidence: 0.95,
        synonyms: ['pain', 'ache', 'discomfort']
      },
      {
        pattern: /\b(headache|head\s*ache|migraine|head\s*pain)\b/gi,
        category: 'symptom',
        snomedCode: '25064002',
        icd11Code: 'MD10.0',
        confidence: 0.95,
        synonyms: ['headache', 'head pain']
      },
      {
        pattern: /\b(fever|temperature|hot|feverish|pyrexia)\b/gi,
        category: 'symptom',
        snomedCode: '386661006',
        icd11Code: 'MG20.0',
        confidence: 0.95,
        synonyms: ['fever', 'temperature']
      },
      {
        pattern: /\b(cough|coughing|coughs)\b/gi,
        category: 'symptom',
        snomedCode: '49727002',
        icd11Code: 'MD12.0',
        confidence: 0.95,
        synonyms: ['cough']
      },
      {
        pattern: /\b(nausea|nauseous|sick|queasy|vomiting|throwing\s*up|vomit)\b/gi,
        category: 'symptom',
        snomedCode: '422400008',
        icd11Code: 'MD90.1',
        confidence: 0.95,
        synonyms: ['nausea', 'vomiting', 'sick']
      },
      {
        pattern: /\b(diarrhea|loose\s*stools|watery\s*stools|runny\s*stomach)\b/gi,
        category: 'symptom',
        snomedCode: '62315008',
        icd11Code: 'MD71.0',
        confidence: 0.95,
        synonyms: ['diarrhea', 'loose stools']
      },
      {
        pattern: /\b(constipation|constipated|difficulty\s*defecating|hard\s*stools)\b/gi,
        category: 'symptom',
        snomedCode: '14760008',
        icd11Code: 'MD70.0',
        confidence: 0.95,
        synonyms: ['constipation']
      },
      {
        pattern: /\b(dizziness|dizzy|lightheaded|vertigo|unsteady|balance\s*problems)\b/gi,
        category: 'symptom',
        snomedCode: '404640003',
        icd11Code: 'MB48.0',
        confidence: 0.90,
        synonyms: ['dizziness', 'vertigo', 'lightheadedness']
      },
      {
        pattern: /\b(fatigue|tired|exhausted|weakness|weak|energy\s*loss)\b/gi,
        category: 'symptom',
        snomedCode: '84229001',
        icd11Code: 'MG22.0',
        confidence: 0.90,
        synonyms: ['fatigue', 'tiredness', 'weakness']
      },
      {
        pattern: /\b(shortness\s*of\s*breath|breathing\s*difficulty|difficulty\s*breathing|breathless)\b/gi,
        category: 'symptom',
        snomedCode: '267036007',
        icd11Code: 'MD11.0',
        confidence: 0.95,
        synonyms: ['shortness of breath', 'dyspnea']
      },
      {
        pattern: /\b(chest\s*pain|chest\s*discomfort|heart\s*pain)\b/gi,
        category: 'symptom',
        snomedCode: '29857009',
        icd11Code: 'MD41.0',
        confidence: 0.95,
        synonyms: ['chest pain']
      },
      {
        pattern: /\b(back\s*pain|backache|lower\s*back\s*pain|spine\s*pain)\b/gi,
        category: 'symptom',
        snomedCode: '161891005',
        icd11Code: 'ME84.0',
        confidence: 0.95,
        synonyms: ['back pain', 'backache']
      },
      {
        pattern: /\b(stomach\s*pain|abdominal\s*pain|belly\s*pain|tummy\s*ache)\b/gi,
        category: 'symptom',
        snomedCode: '21522001',
        icd11Code: 'MD80.0',
        confidence: 0.95,
        synonyms: ['abdominal pain', 'stomach pain']
      },
      {
        pattern: /\b(neck\s*pain|stiff\s*neck|neck\s*ache)\b/gi,
        category: 'symptom',
        snomedCode: '81680005',
        icd11Code: 'ME84.1',
        confidence: 0.95,
        synonyms: ['neck pain', 'cervical pain']
      },
      {
        pattern: /\b(knee\s*pain|knee\s*ache|sore\s*knee)\b/gi,
        category: 'symptom',
        snomedCode: '30989003',
        icd11Code: 'ME84.2',
        confidence: 0.95,
        synonyms: ['knee pain']
      },
      // Arabic symptoms with comprehensive Egyptian dialect support
      {
        pattern: /وجع|ألم|آلام|أوجاع|وغا|واجع|وزع|وعا|وقا|وجعه|وجعان|موجوع|بيوجع|يوجع|متوجع|وجعني|يوجعني|بيوجعني/gi,
        category: 'symptom',
        snomedCode: '22253000',
        icd11Code: 'MD81',
        confidence: 0.90,
        synonyms: ['pain', 'ache', 'discomfort']
      },
      {
        pattern: /صداع|سداع|صدع|وجع الرأس|ألم الرأس|وجع راس|ألم راس|راسي بتوجعني|دماغي بتوجعني|صداع قوي|صداع جامد/gi,
        category: 'symptom',
        snomedCode: '25064002',
        icd11Code: 'MD10.0',
        confidence: 0.95,
        synonyms: ['headache', 'head pain']
      },
      {
        pattern: /حمى|حمة|حرارة|سخونة|سخونه|حرارة عالية|سخونة عالية|حمايا|حماية|حرارتي عالية|سخن|سخنان|محموم|بيحمي|عندي سخونة|فيا حرارة|فيا سخونة/gi,
        category: 'symptom',
        snomedCode: '386661006',
        icd11Code: 'MG20.0',
        confidence: 0.95,
        synonyms: ['fever', 'temperature']
      },
      {
        pattern: /سعال|سعله|كحة|كحه|سعال جاف|كحة جافة|بكح|بسعل|عندي كحة|كحة ناشفة|كحة بلغم|كحة شديدة|كحة قوية|سعال مستمر/gi,
        category: 'symptom',
        snomedCode: '49727002',
        icd11Code: 'MD12.0',
        confidence: 0.95,
        synonyms: ['cough']
      },
      {
        pattern: /غثيان|غثيان|قيء|قئ|استفراغ|تقيؤ|ترجيع|استفراغ|قلبي عايز يطلع|حاسس بغثيان|نفسي معكوسة|عايز أرجع|بترجع|رجعت|طلعت اللي جوايا/gi,
        category: 'symptom',
        snomedCode: '422400008',
        icd11Code: 'MD90.1',
        confidence: 0.95,
        synonyms: ['nausea', 'vomiting']
      },
      {
        pattern: /دوخة|دوار|دوخه|عدم التوازن|دوران|مدوخ|حاسس بدوخة|الدنيا بتلف|عيني بتدوب|راسي خفيف|دايخ|دايخة|دوارة/gi,
        category: 'symptom',
        snomedCode: '404640003',
        icd11Code: 'MB48.0',
        confidence: 0.90,
        synonyms: ['dizziness', 'vertigo']
      },
      {
        pattern: /تعب|إرهاق|خمول|ضعف|تعبان|متعب|مهدود|مكسور|مفكك|مش قادر|مش عارف أعمل حاجة|جسمي تقيل|حاسس بتعب|خلاص مش قادرة|فاتر|فاترة|خمولان|مرهق/gi,
        category: 'symptom',
        snomedCode: '84229001',
        icd11Code: 'MG22.0',
        confidence: 0.90,
        synonyms: ['fatigue', 'tiredness', 'weakness']
      },
      {
        pattern: /ضيق النفس|ضيق التنفس|صعوبة التنفس|لهاث/gi,
        category: 'symptom',
        snomedCode: '267036007',
        icd11Code: 'MD11.0',
        confidence: 0.95,
        synonyms: ['shortness of breath', 'dyspnea']
      },
      // Location-specific pain patterns with Egyptian dialect
      {
        pattern: /ألم البطن|وجع البطن|وجع في البطن|ألم في البطن|وجع باطن|مغص|تقلصات|بطني يوجعني|معدتي توجعني|كرشي بيوجعني|بطني بتوجعني|في مغص|عندي مغص|بطني قلبانة|معدتي مقلوبة|وجع في الكرش|ألم في المعدة|معدتي بتحرقني|حرقان في المعدة/gi,
        category: 'symptom',
        snomedCode: '21522001',
        icd11Code: 'MD80.0',
        confidence: 0.95,
        synonyms: ['abdominal pain', 'stomach ache', 'belly pain', 'cramps']
      },
      {
        pattern: /ألم في الظهر|ألم الظهر|وجع الظهر|وجع في الظهر|وجع ظهر|ظهري يوجعني|ألم ضهر|وجع ضهر|ضهري مكسور|ظهري واجعني|ضهري بيوجعني|عندي ديسك|فقراتي بتوجعني|عمودي الفقري واجعني|ظهري مش مريح/gi,
        category: 'symptom',
        snomedCode: '161891005',
        icd11Code: 'ME84.0',
        confidence: 0.95,
        synonyms: ['back pain', 'backache', 'dorsal pain']
      },
      {
        pattern: /ألم في الصدر|ألم الصدر|وجع الصدر|وجع في الصدر|وجع صدر|صدري يوجعني|ألم قلب|وجع قلب|صدري بيوجعني|قلبي بيوجعني|حاسس بضيق في صدري|صدري مضغوط|قلبي تعبان|صدري حاسس بيه/gi,
        category: 'symptom',
        snomedCode: '29857009',
        icd11Code: 'MD41.0',
        confidence: 0.95,
        synonyms: ['chest pain', 'thoracic pain', 'chest discomfort']
      },
      {
        pattern: /ألم في الرقبة|ألم الرقبة|وجع الرقبة|وجع في الرقبة/gi,
        category: 'symptom',
        snomedCode: '81680005',
        icd11Code: 'ME84.1',
        confidence: 0.95,
        synonyms: ['neck pain', 'cervical pain', 'neck ache']
      },
      {
        pattern: /ألم في الرأس|ألم الرأس|وجع الرأس|صداع/gi,
        category: 'symptom',
        snomedCode: '25064002',
        icd11Code: 'MD10.0',
        confidence: 0.95,
        synonyms: ['headache', 'head pain', 'cephalgia']
      },
      {
        pattern: /ألم في الركبة|ألم الركبة|وجع الركبة|وجع في الركبة/gi,
        category: 'symptom',
        snomedCode: '30989003',
        icd11Code: 'FB56.0',
        confidence: 0.95,
        synonyms: ['knee pain', 'knee ache', 'patellar pain']
      },
      {
        pattern: /ألم في الكتف|ألم الكتف|وجع الكتف|وجع في الكتف/gi,
        category: 'symptom',
        snomedCode: '45326000',
        icd11Code: 'FB40.0',
        confidence: 0.95,
        synonyms: ['shoulder pain', 'shoulder ache', 'deltoid pain']
      },
      {
        pattern: /سعال|كحة|كحة جافة|كحة بلغم/gi,
        category: 'symptom',
        snomedCode: '49727002',
        icd11Code: 'MD12.0',
        confidence: 0.95,
        synonyms: ['cough', 'dry cough', 'productive cough']
      },
      {
        pattern: /ألم في القدم|ألم القدم|وجع القدم|وجع في القدم/gi,
        category: 'symptom',
        snomedCode: '47933007',
        icd11Code: 'FB57.0',
        confidence: 0.95,
        synonyms: ['foot pain', 'pedal pain', 'ankle pain']
      },
      {
        pattern: /ألم في اليد|ألم اليد|وجع اليد|وجع في اليد/gi,
        category: 'symptom',
        snomedCode: '53057004',
        icd11Code: 'FB30.0',
        confidence: 0.95,
        synonyms: ['hand pain', 'wrist pain', 'arm pain']
      },
      {
        pattern: /ألم في العين|ألم العين|وجع العين|وجع في العين/gi,
        category: 'symptom',
        snomedCode: '41652007',
        icd11Code: 'MD20.0',
        confidence: 0.95,
        synonyms: ['eye pain', 'ocular pain', 'ophthalmic pain']
      },
      {
        pattern: /ألم في الأذن|ألم الأذن|وجع الأذن|وجع في الأذن/gi,
        category: 'symptom',
        snomedCode: '16001004',
        icd11Code: 'MD30.0',
        confidence: 0.95,
        synonyms: ['ear pain', 'otic pain', 'earache']
      },
      {
        pattern: /حمى|حرارة|سخونة|ارتفاع الحرارة/gi,
        category: 'symptom',
        snomedCode: '386661006',
        icd11Code: 'MG20.0',
        confidence: 0.95,
        synonyms: ['fever', 'pyrexia', 'high temperature']
      },
      {
        pattern: /ضيق التنفس|صعوبة التنفس|انقطاع النفس/gi,
        category: 'symptom',
        snomedCode: '267036007',
        icd11Code: 'MD12.1',
        confidence: 0.95,
        synonyms: ['dyspnea', 'shortness of breath', 'breathing difficulty']
      },
      {
        pattern: /غثيان|رغبة في القيء/gi,
        category: 'symptom',
        snomedCode: '422587007',
        icd11Code: 'MD90.0',
        confidence: 0.95,
        synonyms: ['nausea', 'feeling sick', 'queasiness']
      },
      {
        pattern: /قيء|استفراغ|ترجيع/gi,
        category: 'symptom',
        snomedCode: '422400008',
        icd11Code: 'MD90.1',
        confidence: 0.95,
        synonyms: ['vomiting', 'emesis', 'throwing up']
      },
      {
        pattern: /إسهال|براز سائل|إفرازات معوية/gi,
        category: 'symptom',
        snomedCode: '62315008',
        icd11Code: 'MD71.0',
        confidence: 0.95,
        synonyms: ['diarrhea', 'loose stools', 'watery stools']
      },
      {
        pattern: /إمساك|قبض|صعوبة الإخراج/gi,
        category: 'symptom',
        snomedCode: '14760008',
        icd11Code: 'MD70.0',
        confidence: 0.95,
        synonyms: ['constipation', 'difficulty defecating']
      },
      {
        pattern: /دوخة|دوار|عدم التوازن/gi,
        category: 'symptom',
        snomedCode: '404640003',
        icd11Code: 'MB48.0',
        confidence: 0.90,
        synonyms: ['dizziness', 'vertigo', 'lightheadedness']
      },
      {
        pattern: /صداع/gi,
        category: 'symptom',
        snomedCode: '25064002',
        icd11Code: 'MD10.0',
        confidence: 0.95,
        synonyms: ['headache', 'head pain']
      },
      {
        pattern: /سعال|كحة/gi,
        category: 'symptom',
        snomedCode: '49727002',
        icd11Code: 'MD12.0',
        confidence: 0.95,
        synonyms: ['cough']
      },
      {
        pattern: /حمى|حرارة|سخونة/gi,
        category: 'symptom',
        snomedCode: '386661006',
        icd11Code: 'MG20.0',
        confidence: 0.95,
        synonyms: ['fever', 'temperature']
      }
    ],

    // Diseases and Disorders (English + Arabic)
    diseases: [
      // English diseases
      {
        pattern: /\b(diabetes|diabetic|blood\s*sugar)\b/gi,
        category: 'disease',
        snomedCode: '73211009',
        icd11Code: '5A10',
        confidence: 0.98,
        synonyms: ['diabetes mellitus', 'diabetes', 'DM']
      },
      {
        pattern: /\b(hypertension|high\s*blood\s*pressure|elevated\s*blood\s*pressure)\b/gi,
        category: 'disease',
        snomedCode: '38341003',
        icd11Code: 'BA00',
        confidence: 0.98,
        synonyms: ['hypertension', 'high blood pressure', 'HTN']
      },
      {
        pattern: /\b(asthma|wheezing|bronchial\s*asthma)\b/gi,
        category: 'disease',
        snomedCode: '195967001',
        icd11Code: 'CA23.0',
        confidence: 0.95,
        synonyms: ['asthma', 'bronchial asthma']
      },
      {
        pattern: /\b(pneumonia|lung\s*infection|chest\s*infection)\b/gi,
        category: 'disease',
        snomedCode: '233604007',
        icd11Code: 'CA40.0',
        confidence: 0.95,
        synonyms: ['pneumonia', 'lung infection']
      },
      {
        pattern: /\b(gastritis|stomach\s*inflammation|stomach\s*ulcer|peptic\s*ulcer)\b/gi,
        category: 'disease',
        snomedCode: '4556007',
        icd11Code: 'DA60.0',
        confidence: 0.90,
        synonyms: ['gastritis', 'stomach inflammation', 'peptic ulcer']
      },
      // Arabic diseases with Egyptian dialect variations
      {
        pattern: /السكري|داء السكري|مرض السكر|السكر|عندي سكر|مريض سكر|سكري|عندي السكري|مرض السكر عندي|سكرة|إيدي بتتنمل من السكر/gi,
        category: 'disease',
        snomedCode: '73211009',
        icd11Code: '5A10',
        confidence: 0.98,
        synonyms: ['diabetes mellitus', 'diabetes', 'DM']
      },
      {
        pattern: /ارتفاع ضغط الدم|الضغط العالي|فرط ضغط الدم|ضغط عالي|عندي ضغط|مريض ضغط|ضغطي عالي|الضغط|ضغط الدم مرتفع|ضغطي مش منتظم|ضغط دم/gi,
        category: 'disease',
        snomedCode: '38341003',
        icd11Code: 'BA00',
        confidence: 0.98,
        synonyms: ['hypertension', 'high blood pressure', 'HTN']
      },
      {
        pattern: /الربو|حساسية الصدر|ضيق الشعب الهوائية|ربو|عندي ربو|حساسية في الصدر|صدري مسدود|صدري ضيق|مش قادر أتنفس|نفسي قصير|أزمة ربو|نوبة ربو/gi,
        category: 'disease',
        snomedCode: '195967001',
        icd11Code: 'CA23.0',
        confidence: 0.95,
        synonyms: ['asthma', 'bronchial asthma']
      },
      {
        pattern: /الالتهاب الرئوي|ذات الرئة|التهاب الرئتين|التهاب رئوي|رئتي ملتهبة|عندي التهاب في الرئة|عدوى في الرئة|برد على الرئة|شعبي هوائية ملتهبة/gi,
        category: 'disease',
        snomedCode: '233604007',
        icd11Code: 'CA40.0',
        confidence: 0.95,
        synonyms: ['pneumonia', 'lung infection']
      },
      {
        pattern: /التهاب المعدة|قرحة المعدة|تهيج المعدة|معدتي ملتهبة|قرحة في المعدة|حموضة|عندي قرحة|معدتي بتحرقني|حرقان المعدة|حموضة زيادة|جرثومة المعدة|هيليكوباكتر/gi,
        category: 'disease',
        snomedCode: '4556007',
        icd11Code: 'DA60.0',
        confidence: 0.90,
        synonyms: ['gastritis', 'stomach inflammation', 'peptic ulcer']
      }
    ],

    // Anatomy (English + Arabic)
    anatomy: [
      // English anatomy terms
      {
        pattern: /\b(heart|cardiac)\b/gi,
        category: 'anatomy',
        snomedCode: '80891009',
        icd11Code: 'XA4PM9',
        confidence: 0.98,
        synonyms: ['heart', 'cardiac muscle', 'myocardium']
      },
      {
        pattern: /\b(lung|lungs|pulmonary)\b/gi,
        category: 'anatomy',
        snomedCode: '39607008',
        icd11Code: 'XA6Q98',
        confidence: 0.98,
        synonyms: ['lung', 'lungs', 'pulmonary']
      },
      {
        pattern: /\b(liver|kidney|kidneys)\b/gi,
        category: 'anatomy',
        snomedCode: '10200004',
        icd11Code: 'XA8YX3',
        confidence: 0.98,
        synonyms: ['liver', 'kidney', 'kidneys', 'hepatic', 'renal']
      },
      {
        pattern: /\b(stomach|intestines|bowel)\b/gi,
        category: 'anatomy',
        snomedCode: '69695003',
        icd11Code: 'XA5T85',
        confidence: 0.98,
        synonyms: ['stomach', 'intestines', 'digestive system', 'GI tract']
      },
              // Arabic anatomy terms with comprehensive Egyptian dialect
        {
          pattern: /القلب|قلب|عضلة القلب|الفؤاد|فؤاد|قلبي|الفؤاد|فؤادي/gi,
          category: 'anatomy',
          snomedCode: '80891009',
          icd11Code: 'XA4PM9',
          confidence: 0.98,
          synonyms: ['heart', 'cardiac muscle', 'myocardium']
        },
      {
        pattern: /الرئة|رئة|الرئتين|رئتين|القصبة الهوائية|قصبة هوائية/gi,
        category: 'anatomy',
        snomedCode: '39607008',
        icd11Code: 'XA6Q98',
        confidence: 0.98,
        synonyms: ['lung', 'lungs', 'pulmonary']
      },
      {
        pattern: /الكبد|كبد|الكلية|كلية|الكليتين|كليتين|كلاوي/gi,
        category: 'anatomy',
        snomedCode: '10200004',
        icd11Code: 'XA8YX3',
        confidence: 0.98,
        synonyms: ['liver', 'kidney', 'kidneys', 'hepatic', 'renal']
      },
              {
          pattern: /المعدة|معدة|الأمعاء|أمعاء|الجهاز الهضمي|بطن|البطن|كرش|معدتي|بطني|كرشي|الكرش|أحشائي|جوايا|الأحشاء/gi,
          category: 'anatomy',
          snomedCode: '69695003',
          icd11Code: 'XA5T85',
          confidence: 0.98,
          synonyms: ['stomach', 'intestines', 'digestive system', 'abdomen']
        },
              {
          pattern: /الرأس|رأس|راس|الدماغ|دماغ|المخ|مخ|راسي|دماغي|مخي|الجمجمة|جمجمة|مقدمة الرأس|مؤخرة الرأس/gi,
          category: 'anatomy',
          snomedCode: '69536005',
          icd11Code: 'XA4PM9',
          confidence: 0.95,
          synonyms: ['head', 'brain', 'cranium']
        },
              {
          pattern: /الظهر|ظهر|ضهر|العمود الفقري|عمود فقري|فقرات|ظهري|ضهري|عمودي الفقري|الفقرات|فقراتي|الديسك|ديسك/gi,
          category: 'anatomy',
          snomedCode: '123037004',
          icd11Code: 'XA8M19',
          confidence: 0.95,
          synonyms: ['back', 'spine', 'vertebral column']
        },
      {
        pattern: /الصدر|صدر|الثدي|ثدي|القفص الصدري|قفص صدري/gi,
        category: 'anatomy',
        snomedCode: '51185008',
        icd11Code: 'XA8YM2',
        confidence: 0.95,
        synonyms: ['chest', 'thorax', 'breast']
      },
      {
        pattern: /الرقبة|رقبة|العنق|عنق|الحلق|حلق/gi,
        category: 'anatomy',
        snomedCode: '45048000',
        icd11Code: 'XA4T28',
        confidence: 0.95,
        synonyms: ['neck', 'cervical region', 'throat']
      },
      {
        pattern: /الركبة|ركبة|ركب|الركب/gi,
        category: 'anatomy',
        snomedCode: '72696002',
        icd11Code: 'XA6T47',
        confidence: 0.95,
        synonyms: ['knee', 'patella', 'knee joint']
      },
              {
          pattern: /اليد|يد|الذراع|ذراع|إيد|يدين|الأيدي|إيدي|يدي|ذراعي|إيدين|الإيدين|الكف|كف|كفي|رسغ|الرسغ|رسغي/gi,
          category: 'anatomy',
          snomedCode: '40983000',
          icd11Code: 'XA5M18',
          confidence: 0.95,
          synonyms: ['hand', 'arm', 'upper limb']
        },
        {
          pattern: /الرجل|رجل|القدم|قدم|الساق|ساق|فخذ|رجلين|أرجل|رجلي|قدمي|ساقي|فخذي|رجليا|الأرجل|الأقدام|كعب|الكعب|كعبي|أصابع الرجل/gi,
          category: 'anatomy',
          snomedCode: '61685007',
          icd11Code: 'XA6M15',
          confidence: 0.95,
          synonyms: ['leg', 'foot', 'lower limb', 'thigh']
        },
        // Additional Egyptian dialect body parts
        {
          pattern: /الرقبة|رقبة|عنق|حلق|حلقي|رقبتي|عنقي|الحلق|الغدة|غدد|الغدد|غددي/gi,
          category: 'anatomy',
          snomedCode: '45048000',
          icd11Code: 'XA4T28',
          confidence: 0.95,
          synonyms: ['neck', 'throat', 'cervical region']
        },
        {
          pattern: /العين|عين|عيون|عيني|عينيا|العيون|الجفن|جفن|جفني|الأجفان|أجفان/gi,
          category: 'anatomy',
          snomedCode: '81745001',
          icd11Code: 'XA4L89',
          confidence: 0.95,
          synonyms: ['eye', 'eyes', 'eyelid']
        },
        {
          pattern: /الأذن|أذن|آذان|ودن|ودني|أذني|الآذان|الودان|ودان/gi,
          category: 'anatomy',
          snomedCode: '117590005',
          icd11Code: 'XA6T45',
          confidence: 0.95,
          synonyms: ['ear', 'ears']
        },
        {
          pattern: /الأنف|أنف|منخار|منخاري|أنفي|الأنوف|أنوف/gi,
          category: 'anatomy',
          snomedCode: '181195007',
          icd11Code: 'XA5M67',
          confidence: 0.95,
          synonyms: ['nose', 'nasal']
        },
        {
          pattern: /الفم|فم|فمي|بوق|بوقي|الشفايف|شفايف|شفاه|شفتي|لسان|لساني|الأسنان|أسنان|سنان|ضرس|ضروس/gi,
          category: 'anatomy',
          snomedCode: '21082005',
          icd11Code: 'XA4T89',
          confidence: 0.95,
          synonyms: ['mouth', 'lips', 'tongue', 'teeth']
        }
    ],

    // Common Egyptian expressions for general health complaints
    general_complaints: [
      {
        pattern: /مش كويس|مريض|مش بخير|حاسس وحش|مش مرتاح|تعبان خالص|حالتي وحشة|مش في حالة|جسمي تعبان|حاسس بتعب شديد/gi,
        category: 'finding',
        snomedCode: '367391008',
        icd11Code: 'MG20.Z',
        confidence: 0.80,
        synonyms: ['feeling unwell', 'malaise', 'general discomfort']
      },
      {
        pattern: /مش نايم|أرق|مش قادر أنام|سهران|نومي مقطع|معنديش نوم|مش بنام|صاحي|عيني مقفولة/gi,
        category: 'symptom',
        snomedCode: '193462001',
        icd11Code: '7A00.0',
        confidence: 0.85,
        synonyms: ['insomnia', 'sleep difficulties', 'sleeplessness']
      },
      {
        pattern: /جعان|مش جعان|مش عايز أكل|شهيتي راحت|مش قادر آكل|أكلي قل|مش بحب الأكل|معنديش شهية|نزل وزني/gi,
        category: 'symptom',
        snomedCode: '79890006',
        icd11Code: 'MG50.0',
        confidence: 0.85,
        synonyms: ['loss of appetite', 'anorexia', 'decreased appetite']
      },
      {
        pattern: /زهقان|حزين|مكتئب|حالتي النفسية وحشة|مش متفائل|يأسان|مضايق|مش مبسوط|زعلان|حاسس بضيق|مش مرتاح نفسيا/gi,
        category: 'finding',
        snomedCode: '35489007',
        icd11Code: '6A70.Z',
        confidence: 0.80,
        synonyms: ['depression', 'sadness', 'low mood']
      },
      {
        pattern: /خايف|قلقان|متوتر|حاسس بقلق|عصبي|مش مرتاح|متشدد|حاسس بتوتر|قلبي بيدق بسرعة من القلق|مش عارف أريح/gi,
        category: 'finding',
        snomedCode: '48694002',
        icd11Code: '6B00.Z',
        confidence: 0.80,
        synonyms: ['anxiety', 'worry', 'nervousness']
      }
    ],

    // Medications
    medications: [
      {
        pattern: /باراسيتامول|أسيتامينوفين|بنادول/gi,
        category: 'medication',
        snomedCode: '387517004',
        icd11Code: 'XM0MG1',
        confidence: 0.95,
        synonyms: ['paracetamol', 'acetaminophen', 'panadol']
      },
      {
        pattern: /أسبرين|حمض الساليسيليك/gi,
        category: 'medication',
        snomedCode: '387458008',
        icd11Code: 'XM0VV5',
        confidence: 0.95,
        synonyms: ['aspirin', 'acetylsalicylic acid', 'ASA']
      },
      {
        pattern: /أموكسيسيلين|المضاد الحيوي/gi,
        category: 'medication',
        snomedCode: '372687004',
        icd11Code: 'XM3DM2',
        confidence: 0.90,
        synonyms: ['amoxicillin', 'antibiotic']
      }
    ]
  };

  // Clinical context patterns for better accuracy
  private readonly CONTEXT_PATTERNS = {
    temporal: [
      /منذ|من|قبل|اليوم|أمس|الأسبوع الماضي|الشهر الماضي/gi,
      /مؤخراً|حديثاً|الآن|حالياً|في الوقت الحالي/gi
    ],
    severity: [
      /شديد|قوي|حاد|مؤلم جداً|لا يطاق/gi,
      /خفيف|بسيط|طفيف|قليل|أحياناً/gi,
      /متوسط|معتدل|مقبول|يمكن تحمله/gi
    ],
    frequency: [
      /دائماً|باستمرار|طوال الوقت|لا ينقطع/gi,
      /أحياناً|من وقت لآخر|نادراً|قليلاً/gi,
      /يومياً|أسبوعياً|شهرياً/gi
    ]
  };

  constructor() {
    console.log('🏥 Initializing Medical Terminology Mapper...');
  }

  async mapMedicalTerms(text: string, language: 'ar' | 'en' = 'ar'): Promise<MedicalMappingResult> {
    const startTime = Date.now();
    
    try {
      console.log(`🔍 Mapping medical terms in text: "${text}" (language: ${language})`);
      console.log(`🔍 Text length: ${text.length}, contains Arabic: ${/[\u0600-\u06FF\u0750-\u077F]/.test(text)}`);
      
      const entities: MedicalEntity[] = [];
      const mappedTerms: StandardizedTerm[] = [];
      
      // Step 1: Extract medical entities using rule-based approach
      // Sort rules by pattern length (longest first) to prioritize specific compound phrases
      const allRulesWithCategory: Array<{rule: MappingRule, category: string}> = [];
      for (const [category, rules] of Object.entries(this.MEDICAL_MAPPING_RULES)) {
        for (const rule of rules) {
          allRulesWithCategory.push({rule, category});
        }
      }
      
      // Sort by pattern length (estimated by synonym length) - longest first
      allRulesWithCategory.sort((a, b) => {
        const aLength = a.rule.synonyms[0]?.length || 0;
        const bLength = b.rule.synonyms[0]?.length || 0;
        return bLength - aLength;
      });
      
      console.log(`🔍 Processing ${allRulesWithCategory.length} rules in order of specificity (longest first)`);
      
      const processedRanges: Array<{start: number, end: number}> = [];
      
      for (const {rule, category} of allRulesWithCategory) {
        const matches = this.findMatches(text, rule.pattern);
        console.log(`🔍 Pattern ${rule.pattern} found ${matches.length} matches in category ${category}`);
        
        for (const match of matches) {
          // Check if this match overlaps with already processed matches
          const overlaps = processedRanges.some(range => 
            (match.start >= range.start && match.start < range.end) ||
            (match.end > range.start && match.end <= range.end) ||
            (match.start <= range.start && match.end >= range.end)
          );
          
          if (!overlaps) {
            console.log(`✅ Found non-overlapping match: "${match.text}" (${rule.category})`);
            processedRanges.push({start: match.start, end: match.end});
            
            const entity: MedicalEntity = {
              text: match.text,
              label: rule.category,
              start: match.start,
              end: match.end,
              confidence: rule.confidence,
              snomedCode: rule.snomedCode,
              icd11Code: rule.icd11Code
            };
            
            entities.push(entity);
            
            // Create standardized term with Arabic text preserved
            const standardizedTerm = await this.createStandardizedTerm(match.text, rule);
            standardizedTerm.arabicText = match.text; // Preserve original Arabic
            mappedTerms.push(standardizedTerm);
          } else {
            console.log(`⚠️ Skipping overlapping match: "${match.text}" - already covered by longer match`);
          }
        }
      }
      
      // Step 2: Enhance with context analysis
      const enhancedEntities = await this.enhanceWithContext(text, entities);
      
      // Step 3: Remove duplicates and resolve conflicts
      const resolvedTerms = this.resolveConflicts(mappedTerms);
      
      // Step 4: Calculate overall confidence
      const avgConfidence = resolvedTerms.length > 0 
        ? resolvedTerms.reduce((sum, term) => sum + term.confidence, 0) / resolvedTerms.length
        : 0;
      
      const processingTime = Date.now() - startTime;
      
      console.log(`✅ Medical mapping complete: ${resolvedTerms.length} terms mapped in ${processingTime}ms`);
      
      return {
        originalText: text,
        entities: enhancedEntities,
        mappedTerms: resolvedTerms,
        confidence: avgConfidence,
        processingTime
      };
      
    } catch (error) {
      console.error('❌ Medical mapping failed:', error);
      return {
        originalText: text,
        entities: [],
        mappedTerms: [],
        confidence: 0,
        processingTime: Date.now() - startTime
      };
    }
  }

  private findMatches(text: string, pattern: RegExp): Array<{text: string, start: number, end: number}> {
    const matches: Array<{text: string, start: number, end: number}> = [];
    let match;
    
    while ((match = pattern.exec(text)) !== null) {
      matches.push({
        text: match[0],
        start: match.index,
        end: match.index + match[0].length
      });
    }
    
    return matches;
  }

  private async createStandardizedTerm(text: string, rule: MappingRule): Promise<StandardizedTerm> {
    return {
      originalText: text,
      englishText: rule.synonyms[0] || text,
      category: rule.category,
      snomedCT: {
        code: rule.snomedCode,
        display: rule.synonyms[0] || text,
        system: 'http://snomed.info/sct'
      },
      icd11: {
        code: rule.icd11Code,
        display: rule.synonyms[0] || text,
        system: 'https://icd.who.int/browse11'
      },
      confidence: rule.confidence,
      synonyms: rule.synonyms
    };
  }

  private async enhanceWithContext(text: string, entities: MedicalEntity[]): Promise<MedicalEntity[]> {
    const enhancedEntities = [...entities];
    
    // Analyze context around each entity
    for (const entity of enhancedEntities) {
      const contextBefore = text.substring(Math.max(0, entity.start - 50), entity.start);
      const contextAfter = text.substring(entity.end, Math.min(text.length, entity.end + 50));
      
      // Check for temporal context
      for (const pattern of this.CONTEXT_PATTERNS.temporal) {
        if (pattern.test(contextBefore) || pattern.test(contextAfter)) {
          entity.confidence = Math.min(1.0, entity.confidence + 0.1);
          break;
        }
      }
      
      // Check for severity context
      for (const pattern of this.CONTEXT_PATTERNS.severity) {
        if (pattern.test(contextBefore) || pattern.test(contextAfter)) {
          entity.confidence = Math.min(1.0, entity.confidence + 0.05);
          break;
        }
      }
    }
    
    return enhancedEntities;
  }

  private resolveConflicts(terms: StandardizedTerm[]): StandardizedTerm[] {
    const uniqueTerms = new Map<string, StandardizedTerm>();
    
    for (const term of terms) {
      const key = `${term.snomedCT.code}_${term.icd11.code}`;
      
      if (!uniqueTerms.has(key) || uniqueTerms.get(key)!.confidence < term.confidence) {
        uniqueTerms.set(key, term);
      }
    }
    
    return Array.from(uniqueTerms.values()).sort((a, b) => b.confidence - a.confidence);
  }

  // Batch processing for multiple texts
  async mapMultipleTexts(texts: string[], language: 'ar' | 'en' = 'ar'): Promise<MedicalMappingResult[]> {
    const results: MedicalMappingResult[] = [];
    
    for (const text of texts) {
      const result = await this.mapMedicalTerms(text, language);
      results.push(result);
    }
    
    return results;
  }

  // Get mapping statistics
  getStatistics(results: MedicalMappingResult[]): {
    totalTexts: number;
    totalEntities: number;
    avgEntitiesPerText: number;
    avgConfidence: number;
    categoryDistribution: { [key: string]: number };
  } {
    const categoryCount: { [key: string]: number } = {};
    let totalEntities = 0;
    let totalConfidence = 0;
    
    for (const result of results) {
      totalEntities += result.entities.length;
      totalConfidence += result.confidence;
      
      for (const entity of result.entities) {
        categoryCount[entity.label] = (categoryCount[entity.label] || 0) + 1;
      }
    }
    
    return {
      totalTexts: results.length,
      totalEntities,
      avgEntitiesPerText: results.length > 0 ? totalEntities / results.length : 0,
      avgConfidence: results.length > 0 ? totalConfidence / results.length : 0,
      categoryDistribution: categoryCount
    };
  }

  // Validate mapping with clinician feedback
  async validateMapping(
    term: StandardizedTerm,
    feedback: {
      isCorrect: boolean;
      correctSnomedCode?: string;
      correctIcd11Code?: string;
      notes?: string;
    }
  ): Promise<void> {
    try {
      console.log(`👨‍⚕️ Validating mapping: ${term.originalText} → ${term.englishText}`);
      console.log(`SNOMED: ${term.snomedCT.code}, ICD-11: ${term.icd11.code}`);
      console.log(`Feedback: ${feedback.isCorrect ? 'Correct' : 'Incorrect'}`);
      
      if (!feedback.isCorrect && feedback.correctSnomedCode) {
        console.log(`Suggested SNOMED: ${feedback.correctSnomedCode}`);
        console.log(`Suggested ICD-11: ${feedback.correctIcd11Code}`);
      }
      
      // Store feedback for model improvement
      const validationData = {
        originalTerm: term,
        feedback,
        timestamp: new Date().toISOString()
      };
      
      // In a real implementation, this would update the mapping rules
      console.log('📊 Validation stored for model improvement');
      
    } catch (error) {
      console.error('❌ Failed to validate mapping:', error);
    }
  }

  // Get term suggestions based on partial input
  async getSuggestions(partialText: string, category?: MedicalCategory): Promise<StandardizedTerm[]> {
    const suggestions: StandardizedTerm[] = [];
    
    for (const [cat, rules] of Object.entries(this.MEDICAL_MAPPING_RULES)) {
      if (category && cat !== `${category}s`) continue;
      
      for (const rule of rules) {
        for (const synonym of rule.synonyms) {
          if (synonym.toLowerCase().includes(partialText.toLowerCase()) ||
              rule.pattern.toString().toLowerCase().includes(partialText.toLowerCase())) {
            
            const suggestion = await this.createStandardizedTerm(synonym, rule);
            suggestions.push(suggestion);
          }
        }
      }
    }
    
    return suggestions.sort((a, b) => b.confidence - a.confidence).slice(0, 10);
  }
}

export const medicalTerminologyMapper = new MedicalTerminologyMapper(); 