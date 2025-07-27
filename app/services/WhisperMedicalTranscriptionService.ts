import { simpleWhisperTranscriptionService, SimpleTranscriptionResult } from './SimpleWhisperTranscriptionService';
import { medicalTerminologyMapper, MedicalMappingResult } from './MedicalTerminologyMapper';
import { dialectNormalizationService, DialectNormalizationResult } from './DialectNormalizationService';

export interface MedicalTranscriptionResult {
  success: boolean;
  error?: string;
  
  // Original transcription data
  originalText?: string;
  detectedLanguage?: string;
  transcriptionDuration?: number;
  
  // Medical processing results
  normalizedText?: string;
  medicalTerms?: any[];
  medicalSummary?: string;
  medicalCategories?: string[];
  
  // Processing metadata
  dialectNormalization?: DialectNormalizationResult;
  medicalMapping?: MedicalMappingResult;
  totalProcessingTime?: number;
}

export class WhisperMedicalTranscriptionService {
  private isRecording = false;

  constructor() {
    console.log('🏥 Whisper Medical Transcription Service initialized');
  }

  // Start recording
  async startRecording(): Promise<boolean> {
    try {
      console.log('🎙️ Starting medical voice recording...');
      this.isRecording = true;
      return await simpleWhisperTranscriptionService.startRecording();
    } catch (error) {
      console.error('❌ Failed to start recording:', error);
      this.isRecording = false;
      return false;
    }
  }

  // Stop recording and process with medical terminology
  async stopRecordingWithMedicalProcessing(): Promise<MedicalTranscriptionResult> {
    const totalStartTime = Date.now();
    
    try {
      console.log('🛑 Stopping recording and processing medical terminology...');
      
      if (!this.isRecording) {
        return {
          success: false,
          error: 'No recording in progress'
        };
      }

      this.isRecording = false;

      // Step 1: Get clean Whisper transcription
      console.log('📝 Step 1: Getting Whisper transcription...');
      const whisperResult: SimpleTranscriptionResult = await simpleWhisperTranscriptionService.stopRecording();
      
      if (!whisperResult.success || !whisperResult.text) {
        return {
          success: false,
          error: whisperResult.error || 'Transcription failed',
          transcriptionDuration: whisperResult.duration
        };
      }

      console.log(`✅ Whisper transcription: "${whisperResult.text}"`);
      console.log(`🌐 Detected language: ${whisperResult.language}`);

      // Step 2: Apply dialect normalization (if Arabic)
      let normalizedText = whisperResult.text;
      let normalizationResult: DialectNormalizationResult | undefined;
      
      console.log('🔍 DEBUG: Original transcribed text:', JSON.stringify(whisperResult.text));
      console.log('🔍 DEBUG: Text length:', whisperResult.text.length);
      console.log('🔍 DEBUG: Contains Arabic chars:', /[\u0600-\u06FF\u0750-\u077F]/.test(whisperResult.text));
      console.log('🔍 DEBUG: Text character codes:', whisperResult.text.split('').map(char => `${char}(${char.charCodeAt(0)})`).join(' '));
      
      if (whisperResult.language === 'ar' || /[\u0600-\u06FF\u0750-\u077F]/.test(whisperResult.text)) {
        console.log('📝 Applying dialect normalization for Arabic text...');
        normalizationResult = await dialectNormalizationService.normalizeText(whisperResult.text);
        normalizedText = normalizationResult.normalizedText;
        console.log(`🔄 Normalized: "${normalizedText}"`);
      }

      // Step 3: Extract medical terminology
      console.log('🏥 Step 3: Extracting medical terminology...');
      console.log('🔍 DEBUG: Text to analyze for medical terms:', JSON.stringify(normalizedText));
      
      const medicalMapping: MedicalMappingResult = await medicalTerminologyMapper.mapMedicalTerms(
        normalizedText,
        whisperResult.language === 'ar' ? 'ar' : 'en'
      );

      console.log('🏥 DEBUG: Medical mapping result:', {
        termsFound: medicalMapping.mappedTerms.length,
        entities: medicalMapping.entities.length,
        confidence: medicalMapping.confidence,
        terms: medicalMapping.mappedTerms.map(t => ({
          original: t.originalText,
          english: t.englishText,
          category: t.category
        }))
      });

      // If no medical terms found, let's test some simple patterns manually
      if (medicalMapping.mappedTerms.length === 0) {
        console.log('❌ No medical terms detected. Testing simple patterns...');
        
        // Test simple Arabic patterns
        const testPatterns = [
          { name: 'صداع', pattern: /صداع/gi },
          { name: 'وجع', pattern: /وجع/gi },
          { name: 'ألم', pattern: /ألم/gi },
          { name: 'حمى', pattern: /حمى/gi },
          { name: 'سعال', pattern: /سعال/gi },
          { name: 'pain', pattern: /\bpain\b/gi },
          { name: 'headache', pattern: /\bheadache\b/gi },
          { name: 'fever', pattern: /\bfever\b/gi },
        ];
        
        for (const test of testPatterns) {
          const matches = normalizedText.match(test.pattern);
          console.log(`🧪 Pattern "${test.name}" (${test.pattern}): ${matches ? `FOUND ${matches.length} matches: ${matches.join(', ')}` : 'NO MATCH'}`);
        }
        
        // Also test if there are any Arabic characters at all
        const arabicChars = normalizedText.match(/[\u0600-\u06FF\u0750-\u077F]/g);
        console.log(`🔤 Arabic characters found: ${arabicChars ? arabicChars.join(', ') : 'NONE'}`);
        
        // Test if there are any English words
        const englishWords = normalizedText.match(/\b[a-zA-Z]+\b/g);
        console.log(`🔤 English words found: ${englishWords ? englishWords.join(', ') : 'NONE'}`);
      }

      // Step 4: Generate medical summary
      const medicalSummary = this.generateMedicalSummary(medicalMapping);
      const medicalCategories = this.extractMedicalCategories(medicalMapping);

      const totalProcessingTime = Date.now() - totalStartTime;

      console.log(`✅ Medical transcription complete in ${totalProcessingTime}ms`);
      console.log(`📋 Medical summary: "${medicalSummary}"`);

      return {
        success: true,
        originalText: whisperResult.text,
        detectedLanguage: whisperResult.language,
        transcriptionDuration: whisperResult.duration,
        normalizedText: normalizedText,
        medicalTerms: medicalMapping.mappedTerms,
        medicalSummary: medicalSummary,
        medicalCategories: medicalCategories,
        dialectNormalization: normalizationResult,
        medicalMapping: medicalMapping,
        totalProcessingTime: totalProcessingTime
      };

    } catch (error) {
      console.error('❌ Medical transcription failed:', error);
      return {
        success: false,
        error: `Medical processing failed: ${error}`,
        totalProcessingTime: Date.now() - totalStartTime
      };
    }
  }

  // Get recording status
  isCurrentlyRecording(): boolean {
    return this.isRecording;
  }

  // Check if text contains Arabic characters
  private isArabicText(text: string): boolean {
    return /[\u0600-\u06FF\u0750-\u077F]/.test(text);
  }

  // Detect dialect from Whisper's language detection
  private detectDialectFromLanguage(language?: string): string | undefined {
    if (!language || language !== 'ar') return undefined;
    
    // For now, return undefined to let the normalization service auto-detect
    // Could be enhanced with more specific dialect detection logic
    return undefined;
  }

  // Generate a clinical summary from medical terms
  private generateMedicalSummary(medicalMapping: MedicalMappingResult): string {
    if (medicalMapping.mappedTerms.length === 0) {
      return 'No medical terms detected in the transcription.';
    }

    const termsByCategory: { [key: string]: any[] } = {};
    
    // Group terms by category
    for (const term of medicalMapping.mappedTerms) {
      const category = term.category || 'observation'; // Use 'observation' as fallback
      if (!termsByCategory[category]) {
        termsByCategory[category] = [];
      }
      termsByCategory[category].push(term);
    }

    // Build summary
    const summaryParts: string[] = [];
    
    for (const [category, terms] of Object.entries(termsByCategory)) {
      const termTexts = terms.map(t => t.englishText || t.arabicText || t.originalText);
      const uniqueTerms = [...new Set(termTexts)];
      summaryParts.push(`${category}: ${uniqueTerms.join(', ')}`);
    }

    return summaryParts.join('. ');
  }

  // Extract unique medical categories
  private extractMedicalCategories(medicalMapping: MedicalMappingResult): string[] {
    const categories = medicalMapping.mappedTerms
      .map(term => term.category)
      .filter(cat => cat !== undefined);
    
    return [...new Set(categories)];
  }

  // Clean up resources
  async cleanup(): Promise<void> {
    try {
      await simpleWhisperTranscriptionService.cleanup();
      this.isRecording = false;
      console.log('🧹 Whisper Medical Transcription Service cleaned up');
    } catch (error) {
      console.error('❌ Cleanup error:', error);
    }
  }
}

// Export singleton instance
export const whisperMedicalTranscriptionService = new WhisperMedicalTranscriptionService(); 