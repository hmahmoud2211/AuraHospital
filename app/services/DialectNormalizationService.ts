// Dialect Normalization Service based on Stanza methodology
// Normalizes various Arabic dialects to Modern Standard Arabic for consistent medical processing

export interface DialectNormalizationResult {
  originalText: string;
  normalizedText: string;
  detectedDialect: string;
  confidence: number;
  transformations: Transformation[];
}

export interface Transformation {
  original: string;
  normalized: string;
  type: 'phonological' | 'lexical' | 'morphological' | 'syntactic';
  confidence: number;
}

export interface DialectFeatures {
  phonological: string[];
  lexical: string[];
  morphological: string[];
  syntactic: string[];
}

export class DialectNormalizationService {
  // Dialect-specific transformation rules based on research findings
  private readonly DIALECT_RULES = {
    egyptian: {
      // Egyptian Arabic normalization rules
      phonological: [
        { pattern: /ج/g, replacement: 'ج', confidence: 0.95 }, // Jeem pronunciation
        { pattern: /ث/g, replacement: 'س', confidence: 0.90 }, // Thaa → Seen
        { pattern: /ذ/g, replacement: 'ز', confidence: 0.90 }, // Dhaal → Zay
      ],
      lexical: [
        { pattern: /عايز/g, replacement: 'أريد', confidence: 0.95 }, // want
        { pattern: /كده/g, replacement: 'هكذا', confidence: 0.90 }, // like this
        { pattern: /ازيك/g, replacement: 'كيف حالك', confidence: 0.85 }, // how are you
        { pattern: /وجع/g, replacement: 'ألم', confidence: 0.95 }, // pain
      ],
      morphological: [
        { pattern: /ـش$/g, replacement: '', confidence: 0.90 }, // Negation marker
        { pattern: /^ب/g, replacement: 'ي', confidence: 0.80 }, // Present tense marker
      ]
    },
    
    levantine: {
      phonological: [
        { pattern: /ق/g, replacement: 'ء', confidence: 0.85 }, // Qaf → Hamza
        { pattern: /ث/g, replacement: 'ت', confidence: 0.90 }, // Thaa → Taa
      ],
      lexical: [
        { pattern: /بدي/g, replacement: 'أريد', confidence: 0.95 }, // want
        { pattern: /هيك/g, replacement: 'هكذا', confidence: 0.90 }, // like this
        { pattern: /كيفك/g, replacement: 'كيف حالك', confidence: 0.85 }, // how are you
        { pattern: /وجع/g, replacement: 'ألم', confidence: 0.95 }, // pain
      ],
      morphological: [
        { pattern: /^عم/g, replacement: 'ي', confidence: 0.85 }, // Present continuous
        { pattern: /ـش$/g, replacement: '', confidence: 0.90 }, // Negation
      ]
    },
    
    gulf: {
      phonological: [
        { pattern: /ج/g, replacement: 'ي', confidence: 0.90 }, // Jeem → Yaa
        { pattern: /ك/g, replacement: 'ج', confidence: 0.80 }, // Kaaf → Jeem (in some contexts)
      ],
      lexical: [
        { pattern: /أبغى/g, replacement: 'أريد', confidence: 0.95 }, // want
        { pattern: /جذي/g, replacement: 'هكذا', confidence: 0.90 }, // like this
        { pattern: /شلونك/g, replacement: 'كيف حالك', confidence: 0.85 }, // how are you
        { pattern: /ألم/g, replacement: 'ألم', confidence: 1.0 }, // pain (already MSA)
      ],
      morphological: [
        { pattern: /^يـ/g, replacement: 'ي', confidence: 0.85 }, // Present tense
        { pattern: /ـه$/g, replacement: 'ه', confidence: 0.80 }, // Possessive pronoun
      ]
    },
    
    maghrebi: {
      phonological: [
        { pattern: /ق/g, replacement: 'ڨ', confidence: 0.85 }, // Qaf variant
        { pattern: /ث/g, replacement: 'ت', confidence: 0.90 }, // Thaa → Taa
      ],
      lexical: [
        { pattern: /بغيت/g, replacement: 'أريد', confidence: 0.95 }, // want
        { pattern: /هكا/g, replacement: 'هكذا', confidence: 0.90 }, // like this
        { pattern: /كيداير/g, replacement: 'كيف حالك', confidence: 0.85 }, // how are you
        { pattern: /ألم/g, replacement: 'ألم', confidence: 1.0 }, // pain
      ],
      morphological: [
        { pattern: /^كن/g, replacement: 'كان', confidence: 0.85 }, // Past tense marker
        { pattern: /ـش$/g, replacement: '', confidence: 0.90 }, // Negation
      ]
    }
  };

  // Phonetic correction rules for common Arabic mispronunciations
  private readonly PHONETIC_CORRECTIONS: { [key: string]: string } = {
    // Pain-related corrections
    'وزع': 'وجع',    // Common mispronunciation of وجع (pain)
    'واجع': 'وجع',   // Another variation of وجع (pain)
    'وجاع': 'وجع',   // Another variation
    'وزاع': 'وجع',   // Speech recognition error
    'وغا': 'وجع',    // Transcription error for وجع (pain)
    'وعا': 'وجع',    // Another transcription error
    'وقا': 'وجع',    // Another transcription error
    
    // Headache-related corrections  
    'صداع': 'صداع',   // Already correct
    'سداع': 'صداع',   // Common mispronunciation
    'صدع': 'صداع',    // Shortened version
    
    // Cough-related corrections
    'سعال': 'سعال',   // Already correct  
    'كحة': 'سعال',    // Dialectal form
    'كحه': 'سعال',    // Variation
    'سعله': 'سعال',   // Mispronunciation
    
    // Fever-related corrections
    'حمى': 'حمى',     // Already correct
    'حمة': 'حمى',     // Variation
    'حرارة': 'حمى',   // Alternative term
    'سخونة': 'حمى',   // Dialectal
    'سخونه': 'حمى',   // Variation
    
    // Stomach-related corrections
    'بطن': 'بطن',     // Already correct
    'معدة': 'معدة',    // Already correct
    'معده': 'معدة',    // Variation
    
    // Back-related corrections
    'ظهر': 'ظهر',     // Already correct
    'ضهر': 'ظهر',     // Common mispronunciation
    'ظهور': 'ظهر',    // Variation
    
    // Chest-related corrections
    'صدر': 'صدر',     // Already correct
    'صدور': 'صدر',    // Variation
    
    // Common word corrections
    'في': 'في',       // Already correct
    'فى': 'في',       // Alternative spelling
    'عند': 'عند',     // Already correct
    'عندي': 'عندي',   // Already correct
    'عندى': 'عندي',   // Alternative spelling
    'لدي': 'عندي',    // Alternative form
    'لدى': 'عندي',    // Alternative form
  };

  // Medical-specific normalization rules
  private readonly MEDICAL_NORMALIZATION_RULES = {
    symptoms: [
      { pattern: /وجع|ألم|آلام/g, replacement: 'ألم', confidence: 0.95 },
      { pattern: /كحة|سعال|سعلة/g, replacement: 'سعال', confidence: 0.95 },
      { pattern: /حمى|حرارة|سخونة/g, replacement: 'حمى', confidence: 0.95 },
      { pattern: /صداع|وجع الرأس/g, replacement: 'صداع', confidence: 0.95 },
      { pattern: /غثيان|دوخة|دوار/g, replacement: 'غثيان', confidence: 0.90 },
      { pattern: /إسهال|سهال|براز سائل/g, replacement: 'إسهال', confidence: 0.95 },
      { pattern: /إمساك|قبض/g, replacement: 'إمساك', confidence: 0.95 },
      { pattern: /تعب|إرهاق|خمول/g, replacement: 'تعب', confidence: 0.90 },
    ],
    
    body_parts: [
      { pattern: /بطن|معدة|كرش/g, replacement: 'بطن', confidence: 0.95 },
      { pattern: /رأس|راس|دماغ/g, replacement: 'رأس', confidence: 0.95 },
      { pattern: /صدر|قفص صدري/g, replacement: 'صدر', confidence: 0.95 },
      { pattern: /ظهر|ضهر/g, replacement: 'ظهر', confidence: 0.95 },
      { pattern: /يد|إيد|ذراع/g, replacement: 'يد', confidence: 0.90 },
      { pattern: /رجل|قدم|ساق/g, replacement: 'رجل', confidence: 0.90 },
    ],
    
    intensity: [
      { pattern: /كتير|كثير|واجد/g, replacement: 'كثير', confidence: 0.90 },
      { pattern: /شوي|قليل|شويه/g, replacement: 'قليل', confidence: 0.90 },
      { pattern: /خفيف|بسيط/g, replacement: 'خفيف', confidence: 0.95 },
      { pattern: /شديد|قوي|زايد/g, replacement: 'شديد', confidence: 0.95 },
    ]
  };

  constructor() {
    console.log('🔄 Initializing Dialect Normalization Service...');
  }

  // Apply phonetic corrections for common Arabic mispronunciations
  private applyPhoneticCorrections(text: string, transformations: Transformation[]): string {
    console.log(`🔊 Applying phonetic corrections to: "${text}"`);
    let correctedText = text;
    
    // Split text into words and check each word
    const words = correctedText.split(/\s+/);
    const correctedWords = words.map(word => {
      // Remove punctuation for matching
      const cleanWord = word.replace(/[.,!?;:]/g, '');
      
      // Check if word needs phonetic correction
      if (this.PHONETIC_CORRECTIONS[cleanWord]) {
        const correctedWord = this.PHONETIC_CORRECTIONS[cleanWord];
        console.log(`🔧 Phonetic correction: "${cleanWord}" → "${correctedWord}"`);
        
        // Add transformation record
        transformations.push({
          original: cleanWord,
          normalized: correctedWord,
          type: 'phonological',
          confidence: 0.95
        });
        
        // Replace in original word (preserve punctuation)
        return word.replace(cleanWord, correctedWord);
      }
      
      return word;
    });
    
    correctedText = correctedWords.join(' ');
    
    // Also check for compound phrases that might need correction
    correctedText = this.correctCompoundPhrases(correctedText, transformations);
    
    console.log(`🔊 Phonetic corrections result: "${correctedText}"`);
    return correctedText;
  }

  // Correct compound phrases and common combinations
  private correctCompoundPhrases(text: string, transformations: Transformation[]): string {
    let correctedText = text;
    
    // Define compound phrase corrections
    const compoundCorrections: { [key: string]: string } = {
      // Pain in body parts with corrections
      'وزع في الظهر': 'وجع في الظهر',
      'واجع في الظهر': 'وجع في الظهر', 
      'وزع في الصدر': 'وجع في الصدر',
      'واجع في الصدر': 'وجع في الصدر',
      'وزع في البطن': 'وجع في البطن',
      'واجع في البطن': 'وجع في البطن',
      'وغا باطن': 'وجع في البطن',     // Transcription error correction
      'وغا في البطن': 'وجع في البطن',  // Alternative transcription error
      'وعا باطن': 'وجع في البطن',     // Another transcription error
      'وقا باطن': 'وجع في البطن',     // Another transcription error
      'وزع في الرأس': 'وجع في الرأس',
      'واجع في الرأس': 'وجع في الرأس',
      'وزع في الرقبة': 'وجع في الرقبة',
      'واجع في الرقبة': 'وجع في الرقبة',
      'وزع في الركبة': 'وجع في الركبة',
      'واجع في الركبة': 'وجع في الركبة',
      
      // Alternative prepositions
      'وجع بالظهر': 'وجع في الظهر',
      'ألم بالظهر': 'ألم في الظهر',
      'وجع بالصدر': 'وجع في الصدر',
      'ألم بالصدر': 'ألم في الصدر',
      
      // Common combinations
      'عندي وزع': 'عندي وجع',
      'عندي واجع': 'عندي وجع',
      'لدي وزع': 'عندي وجع',
      'لدي واجع': 'عندي وجع',
    };
    
    // Apply compound corrections
    for (const [incorrect, correct] of Object.entries(compoundCorrections)) {
      if (correctedText.includes(incorrect)) {
        console.log(`🔧 Compound phrase correction: "${incorrect}" → "${correct}"`);
        correctedText = correctedText.replace(new RegExp(incorrect, 'g'), correct);
        
        transformations.push({
          original: incorrect,
          normalized: correct,
          type: 'phonological',
          confidence: 0.98
        });
      }
    }
    
    return correctedText;
  }

  async normalizeText(text: string, detectedDialect?: string): Promise<DialectNormalizationResult> {
    try {
      console.log(`🔄 Normalizing text from ${detectedDialect || 'unknown'} dialect...`);
      
      let normalizedText = text;
      const transformations: Transformation[] = [];
      
      // Step 0: Apply phonetic corrections first
      normalizedText = this.applyPhoneticCorrections(normalizedText, transformations);
      
      // Step 1: Apply dialect-specific rules
      if (detectedDialect && this.DIALECT_RULES[detectedDialect as keyof typeof this.DIALECT_RULES]) {
        const dialectRules = this.DIALECT_RULES[detectedDialect as keyof typeof this.DIALECT_RULES];
        
        // Apply phonological transformations
        for (const rule of dialectRules.phonological || []) {
          const matches = normalizedText.match(rule.pattern);
          if (matches) {
            normalizedText = normalizedText.replace(rule.pattern, rule.replacement);
            transformations.push({
              original: matches[0],
              normalized: rule.replacement,
              type: 'phonological',
              confidence: rule.confidence
            });
          }
        }
        
        // Apply lexical transformations
        for (const rule of dialectRules.lexical || []) {
          const matches = normalizedText.match(rule.pattern);
          if (matches) {
            normalizedText = normalizedText.replace(rule.pattern, rule.replacement);
            transformations.push({
              original: matches[0],
              normalized: rule.replacement,
              type: 'lexical',
              confidence: rule.confidence
            });
          }
        }
        
        // Apply morphological transformations
        for (const rule of dialectRules.morphological || []) {
          const matches = normalizedText.match(rule.pattern);
          if (matches) {
            normalizedText = normalizedText.replace(rule.pattern, rule.replacement);
            transformations.push({
              original: matches[0],
              normalized: rule.replacement,
              type: 'morphological',
              confidence: rule.confidence
            });
          }
        }
      }
      
      // Step 2: Apply medical-specific normalization
      normalizedText = await this.applyMedicalNormalization(normalizedText, transformations);
      
      // Step 3: Calculate overall confidence
      const avgConfidence = transformations.length > 0 
        ? transformations.reduce((sum, t) => sum + t.confidence, 0) / transformations.length
        : 0.8; // Default confidence if no transformations
      
      console.log(`✅ Normalization complete: ${transformations.length} transformations applied`);
      
      return {
        originalText: text,
        normalizedText: normalizedText,
        detectedDialect: detectedDialect || 'unknown',
        confidence: avgConfidence,
        transformations: transformations
      };
      
    } catch (error) {
      console.error('❌ Normalization failed:', error);
      return {
        originalText: text,
        normalizedText: text,
        detectedDialect: 'unknown',
        confidence: 0,
        transformations: []
      };
    }
  }

  private async applyMedicalNormalization(text: string, transformations: Transformation[]): Promise<string> {
    let normalizedText = text;
    
    // Apply medical normalization rules
    for (const [category, rules] of Object.entries(this.MEDICAL_NORMALIZATION_RULES)) {
      for (const rule of rules) {
        const matches = normalizedText.match(rule.pattern);
        if (matches) {
          normalizedText = normalizedText.replace(rule.pattern, rule.replacement);
          transformations.push({
            original: matches[0],
            normalized: rule.replacement,
            type: 'lexical',
            confidence: rule.confidence
          });
        }
      }
    }
    
    return normalizedText;
  }

  // Extract dialect features for classification
  extractDialectFeatures(text: string): DialectFeatures {
    const features: DialectFeatures = {
      phonological: [],
      lexical: [],
      morphological: [],
      syntactic: []
    };
    
    // Extract phonological features
    if (text.includes('ج')) features.phonological.push('has_jeem');
    if (text.includes('ق')) features.phonological.push('has_qaf');
    if (text.includes('ث')) features.phonological.push('has_thaa');
    if (text.includes('ذ')) features.phonological.push('has_dhaal');
    
    // Extract lexical features
    if (text.includes('عايز') || text.includes('بدي') || text.includes('أبغى')) {
      features.lexical.push('dialectal_want_verb');
    }
    if (text.includes('كده') || text.includes('هيك') || text.includes('جذي')) {
      features.lexical.push('dialectal_demonstrative');
    }
    
    // Extract morphological features
    if (text.includes('ـش')) features.morphological.push('dialectal_negation');
    if (text.match(/^ب/)) features.morphological.push('present_marker_ba');
    if (text.match(/^عم/)) features.morphological.push('present_continuous_3am');
    
    // Extract syntactic features
    if (text.match(/\s+مش\s+/)) features.syntactic.push('negation_mish');
    if (text.match(/ما\s+\w+ش/)) features.syntactic.push('circumfix_negation');
    
    return features;
  }

  // Batch normalization for multiple texts
  async normalizeMultipleTexts(texts: string[], detectedDialect?: string): Promise<DialectNormalizationResult[]> {
    const results: DialectNormalizationResult[] = [];
    
    for (const text of texts) {
      const result = await this.normalizeText(text, detectedDialect);
      results.push(result);
    }
    
    return results;
  }

  // Get normalization statistics
  getStatistics(results: DialectNormalizationResult[]): {
    totalTexts: number;
    avgTransformations: number;
    avgConfidence: number;
    dialectDistribution: { [key: string]: number };
  } {
    const dialectCounts: { [key: string]: number } = {};
    let totalTransformations = 0;
    let totalConfidence = 0;
    
    for (const result of results) {
      dialectCounts[result.detectedDialect] = (dialectCounts[result.detectedDialect] || 0) + 1;
      totalTransformations += result.transformations.length;
      totalConfidence += result.confidence;
    }
    
    return {
      totalTexts: results.length,
      avgTransformations: results.length > 0 ? totalTransformations / results.length : 0,
      avgConfidence: results.length > 0 ? totalConfidence / results.length : 0,
      dialectDistribution: dialectCounts
    };
  }

  // Validate normalization quality
  async validateNormalization(
    result: DialectNormalizationResult,
    clinicianFeedback: 'correct' | 'incorrect' | 'partial'
  ): Promise<void> {
    try {
      console.log(`👨‍⚕️ Validating normalization: ${result.originalText} → ${result.normalizedText}`);
      console.log(`Feedback: ${clinicianFeedback}`);
      
      // This would typically update ML model weights or rule confidences
      // For now, we'll log the feedback for future model training
      
      const feedbackData = {
        original: result.originalText,
        normalized: result.normalizedText,
        dialect: result.detectedDialect,
        transformations: result.transformations,
        feedback: clinicianFeedback,
        timestamp: new Date().toISOString()
      };
      
      // In a real implementation, this would be stored for model improvement
      console.log('📊 Feedback stored for model improvement:', feedbackData);
      
    } catch (error) {
      console.error('❌ Failed to validate normalization:', error);
    }
  }
}

export const dialectNormalizationService = new DialectNormalizationService(); 