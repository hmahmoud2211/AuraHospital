// Medical Terms Database Service
// SQLite database for storing medical terminology, dialect mappings, and validation feedback

import { Platform } from 'react-native';

// Conditional SQLite import for environments where expo-sqlite is not available
let SQLite: any = null;
try {
  SQLite = require('expo-sqlite');
} catch (error) {
  console.warn('expo-sqlite not available, using mock implementation');
}

export interface DatabaseMedicalTerm {
  id?: number;
  arabicText: string;
  englishText: string;
  dialectVariants: string; // JSON string of variants
  snomedCode: string;
  icd11Code: string;
  umlsCui?: string;
  category: string;
  confidence: number;
  createdAt: string;
  lastValidated?: string;
  validationCount: number;
  isValidated: boolean;
}

export interface DialectMapping {
  id?: number;
  originalText: string;
  normalizedText: string;
  sourceDialect: string;
  targetDialect: string;
  confidence: number;
  transformationType: string;
  createdAt: string;
}

export interface ValidationRecord {
  id?: number;
  termId: number;
  clinicianId?: string;
  feedback: 'correct' | 'incorrect' | 'partial';
  suggestedCorrection?: string;
  notes?: string;
  createdAt: string;
}

export interface AudioProcessingRecord {
  id?: number;
  audioHash: string;
  originalTranscription: string;
  arabicTranscription?: string;
  detectedDialect: string;
  dialectConfidence: number;
  processingTime: number;
  spectrogramFeatures?: string; // JSON string
  createdAt: string;
}

export class MedicalTermsDatabase {
  private db: any = null;
  private initialized = false;

  constructor() {
    this.initializeDatabase();
  }

  private async initializeDatabase(): Promise<void> {
    try {
      console.log('🗄️ Initializing Medical Terms Database...');
      
      if (Platform.OS === 'web') {
        // For web, we'll use a mock implementation or IndexedDB
        console.log('🌐 Web platform: Using IndexedDB simulation');
        await this.initializeWebDatabase();
      } else {
        // For mobile, use expo-sqlite
        this.db = SQLite.openDatabase('medical_terms.db');
        await this.createTables();
      }
      
      this.initialized = true;
      console.log('✅ Medical Terms Database initialized successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize database:', error);
    }
  }

  private async initializeWebDatabase(): Promise<void> {
    // Mock database for web platform
    console.log('📱 Initializing web database simulation...');
    
    // In a real implementation, this would use IndexedDB
    this.db = {
      transaction: (callback: any) => {
        callback({
          executeSql: (sql: string, params: any[], success?: any, error?: any) => {
            console.log('🔍 Mock SQL:', sql, params);
            if (success) success(null, { rows: { _array: [], length: 0 } });
          }
        });
      }
    } as any;
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const tables = [
      // Medical Terms table
      `CREATE TABLE IF NOT EXISTS medical_terms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        arabic_text TEXT NOT NULL,
        english_text TEXT NOT NULL,
        dialect_variants TEXT,
        snomed_code TEXT,
        icd11_code TEXT,
        umls_cui TEXT,
        category TEXT NOT NULL,
        confidence REAL NOT NULL,
        created_at TEXT NOT NULL,
        last_validated TEXT,
        validation_count INTEGER DEFAULT 0,
        is_validated BOOLEAN DEFAULT 0,
        UNIQUE(arabic_text, english_text)
      )`,

      // Dialect Mappings table
      `CREATE TABLE IF NOT EXISTS dialect_mappings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        original_text TEXT NOT NULL,
        normalized_text TEXT NOT NULL,
        source_dialect TEXT NOT NULL,
        target_dialect TEXT NOT NULL,
        confidence REAL NOT NULL,
        transformation_type TEXT NOT NULL,
        created_at TEXT NOT NULL
      )`,

      // Validation Records table
      `CREATE TABLE IF NOT EXISTS validation_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        term_id INTEGER NOT NULL,
        clinician_id TEXT,
        feedback TEXT NOT NULL,
        suggested_correction TEXT,
        notes TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY(term_id) REFERENCES medical_terms(id)
      )`,

      // Audio Processing Records table
      `CREATE TABLE IF NOT EXISTS audio_processing (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        audio_hash TEXT UNIQUE NOT NULL,
        original_transcription TEXT NOT NULL,
        arabic_transcription TEXT,
        detected_dialect TEXT NOT NULL,
        dialect_confidence REAL NOT NULL,
        processing_time INTEGER NOT NULL,
        spectrogram_features TEXT,
        created_at TEXT NOT NULL
      )`,

      // Indexes for better performance
      `CREATE INDEX IF NOT EXISTS idx_medical_terms_category ON medical_terms(category)`,
      `CREATE INDEX IF NOT EXISTS idx_medical_terms_confidence ON medical_terms(confidence)`,
      `CREATE INDEX IF NOT EXISTS idx_dialect_mappings_source ON dialect_mappings(source_dialect)`,
      `CREATE INDEX IF NOT EXISTS idx_validation_records_term ON validation_records(term_id)`,
      `CREATE INDEX IF NOT EXISTS idx_audio_processing_dialect ON audio_processing(detected_dialect)`
    ];

    for (const tableSQL of tables) {
      await this.executeQuery(tableSQL);
    }

    // Insert initial data
    await this.insertInitialData();
  }

  private async insertInitialData(): Promise<void> {
    console.log('📚 Inserting initial medical terms data...');
    
    const initialTerms = [
      {
        arabicText: 'ألم البطن',
        englishText: 'abdominal pain',
        dialectVariants: JSON.stringify(['وجع البطن', 'مغص', 'تقلصات']),
        snomedCode: '21522001',
        icd11Code: 'MD80.0',
        category: 'symptom',
        confidence: 0.95,
        validationCount: 0,
        isValidated: false
      },
      {
        arabicText: 'صداع',
        englishText: 'headache',
        dialectVariants: JSON.stringify(['ألم الرأس', 'وجع الرأس']),
        snomedCode: '25064002',
        icd11Code: 'MD10.0',
        category: 'symptom',
        confidence: 0.95,
        validationCount: 0,
        isValidated: false
      },
      {
        arabicText: 'سعال',
        englishText: 'cough',
        dialectVariants: JSON.stringify(['كحة', 'كحة جافة', 'كحة بلغم']),
        snomedCode: '49727002',
        icd11Code: 'MD12.0',
        category: 'symptom',
        confidence: 0.95,
        validationCount: 0,
        isValidated: false
      },
      {
        arabicText: 'حمى',
        englishText: 'fever',
        dialectVariants: JSON.stringify(['حرارة', 'سخونة', 'ارتفاع الحرارة']),
        snomedCode: '386661006',
        icd11Code: 'MG20.0',
        category: 'symptom',
        confidence: 0.95,
        validationCount: 0,
        isValidated: false
      }
    ];

    for (const term of initialTerms) {
      await this.insertMedicalTerm(term);
    }
  }

  private executeQuery(sql: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.transaction((tx: any) => {
        tx.executeSql(
          sql,
          params,
          (_: any, result: any) => resolve(result),
          (_: any, error: any) => {
            console.error('❌ SQL Error:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  }

  // Medical Terms CRUD operations
  async insertMedicalTerm(term: Omit<DatabaseMedicalTerm, 'id' | 'createdAt'>): Promise<number> {
    try {
      const sql = `
        INSERT OR REPLACE INTO medical_terms 
        (arabic_text, english_text, dialect_variants, snomed_code, icd11_code, 
         umls_cui, category, confidence, created_at, validation_count, is_validated)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const result = await this.executeQuery(sql, [
        term.arabicText,
        term.englishText,
        term.dialectVariants,
        term.snomedCode,
        term.icd11Code,
        term.umlsCui || null,
        term.category,
        term.confidence,
        new Date().toISOString(),
        term.validationCount || 0,
        term.isValidated ? 1 : 0
      ]);
      
      console.log(`✅ Inserted medical term: ${term.arabicText} → ${term.englishText}`);
      return result.insertId;
      
    } catch (error) {
      console.error('❌ Failed to insert medical term:', error);
      throw error;
    }
  }

  async getMedicalTerms(
    filters?: {
      category?: string;
      minConfidence?: number;
      searchText?: string;
      limit?: number;
    }
  ): Promise<DatabaseMedicalTerm[]> {
    try {
      let sql = 'SELECT * FROM medical_terms WHERE 1=1';
      const params: any[] = [];
      
      if (filters?.category) {
        sql += ' AND category = ?';
        params.push(filters.category);
      }
      
      if (filters?.minConfidence) {
        sql += ' AND confidence >= ?';
        params.push(filters.minConfidence);
      }
      
      if (filters?.searchText) {
        sql += ' AND (arabic_text LIKE ? OR english_text LIKE ?)';
        params.push(`%${filters.searchText}%`, `%${filters.searchText}%`);
      }
      
      sql += ' ORDER BY confidence DESC';
      
      if (filters?.limit) {
        sql += ' LIMIT ?';
        params.push(filters.limit);
      }
      
      const result = await this.executeQuery(sql, params);
      return result.rows._array || [];
      
    } catch (error) {
      console.error('❌ Failed to get medical terms:', error);
      return [];
    }
  }

  async updateMedicalTermConfidence(id: number, newConfidence: number): Promise<void> {
    try {
      const sql = `
        UPDATE medical_terms 
        SET confidence = ?, last_validated = ?
        WHERE id = ?
      `;
      
      await this.executeQuery(sql, [newConfidence, new Date().toISOString(), id]);
      console.log(`✅ Updated confidence for term ID ${id}: ${newConfidence}`);
      
    } catch (error) {
      console.error('❌ Failed to update medical term confidence:', error);
      throw error;
    }
  }

  // Dialect Mappings operations
  async insertDialectMapping(mapping: Omit<DialectMapping, 'id' | 'createdAt'>): Promise<number> {
    try {
      const sql = `
        INSERT INTO dialect_mappings 
        (original_text, normalized_text, source_dialect, target_dialect, 
         confidence, transformation_type, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      const result = await this.executeQuery(sql, [
        mapping.originalText,
        mapping.normalizedText,
        mapping.sourceDialect,
        mapping.targetDialect,
        mapping.confidence,
        mapping.transformationType,
        new Date().toISOString()
      ]);
      
      return result.insertId;
      
    } catch (error) {
      console.error('❌ Failed to insert dialect mapping:', error);
      throw error;
    }
  }

  async getDialectMappings(sourceDialect?: string): Promise<DialectMapping[]> {
    try {
      let sql = 'SELECT * FROM dialect_mappings';
      const params: any[] = [];
      
      if (sourceDialect) {
        sql += ' WHERE source_dialect = ?';
        params.push(sourceDialect);
      }
      
      sql += ' ORDER BY confidence DESC';
      
      const result = await this.executeQuery(sql, params);
      return result.rows._array || [];
      
    } catch (error) {
      console.error('❌ Failed to get dialect mappings:', error);
      return [];
    }
  }

  // Validation Records operations
  async insertValidationRecord(validation: Omit<ValidationRecord, 'id' | 'createdAt'>): Promise<number> {
    try {
      const sql = `
        INSERT INTO validation_records 
        (term_id, clinician_id, feedback, suggested_correction, notes, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      const result = await this.executeQuery(sql, [
        validation.termId,
        validation.clinicianId || null,
        validation.feedback,
        validation.suggestedCorrection || null,
        validation.notes || null,
        new Date().toISOString()
      ]);
      
      // Update validation count for the term
      await this.executeQuery(
        'UPDATE medical_terms SET validation_count = validation_count + 1 WHERE id = ?',
        [validation.termId]
      );
      
      return result.insertId;
      
    } catch (error) {
      console.error('❌ Failed to insert validation record:', error);
      throw error;
    }
  }

  // Audio Processing Records operations
  async insertAudioProcessingRecord(record: Omit<AudioProcessingRecord, 'id' | 'createdAt'>): Promise<number> {
    try {
      const sql = `
        INSERT OR REPLACE INTO audio_processing 
        (audio_hash, original_transcription, arabic_transcription, detected_dialect,
         dialect_confidence, processing_time, spectrogram_features, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const result = await this.executeQuery(sql, [
        record.audioHash,
        record.originalTranscription,
        record.arabicTranscription || null,
        record.detectedDialect,
        record.dialectConfidence,
        record.processingTime,
        record.spectrogramFeatures || null,
        new Date().toISOString()
      ]);
      
      return result.insertId;
      
    } catch (error) {
      console.error('❌ Failed to insert audio processing record:', error);
      throw error;
    }
  }

  // Statistics and Analytics
  async getStatistics(): Promise<{
    totalTerms: number;
    termsByCategory: { [key: string]: number };
    avgConfidence: number;
    totalValidations: number;
    dialectDistribution: { [key: string]: number };
  }> {
    try {
      const [
        totalTermsResult,
        categoryStatsResult,
        avgConfidenceResult,
        validationStatsResult,
        dialectStatsResult
      ] = await Promise.all([
        this.executeQuery('SELECT COUNT(*) as count FROM medical_terms'),
        this.executeQuery('SELECT category, COUNT(*) as count FROM medical_terms GROUP BY category'),
        this.executeQuery('SELECT AVG(confidence) as avg FROM medical_terms'),
        this.executeQuery('SELECT COUNT(*) as count FROM validation_records'),
        this.executeQuery('SELECT detected_dialect, COUNT(*) as count FROM audio_processing GROUP BY detected_dialect')
      ]);
      
      const termsByCategory: { [key: string]: number } = {};
      for (const row of categoryStatsResult.rows._array || []) {
        termsByCategory[row.category] = row.count;
      }
      
      const dialectDistribution: { [key: string]: number } = {};
      for (const row of dialectStatsResult.rows._array || []) {
        dialectDistribution[row.detected_dialect] = row.count;
      }
      
      return {
        totalTerms: totalTermsResult.rows._array?.[0]?.count || 0,
        termsByCategory,
        avgConfidence: avgConfidenceResult.rows._array?.[0]?.avg || 0,
        totalValidations: validationStatsResult.rows._array?.[0]?.count || 0,
        dialectDistribution
      };
      
    } catch (error) {
      console.error('❌ Failed to get statistics:', error);
      return {
        totalTerms: 0,
        termsByCategory: {},
        avgConfidence: 0,
        totalValidations: 0,
        dialectDistribution: {}
      };
    }
  }

  // Search functionality
  async searchTerms(query: string, options?: {
    category?: string;
    fuzzyMatch?: boolean;
    limit?: number;
  }): Promise<DatabaseMedicalTerm[]> {
    try {
      let sql = `
        SELECT *, 
        CASE 
          WHEN arabic_text = ? THEN 100
          WHEN english_text = ? THEN 95
          WHEN arabic_text LIKE ? THEN 90
          WHEN english_text LIKE ? THEN 85
          WHEN dialect_variants LIKE ? THEN 80
          ELSE 0
        END as relevance_score
        FROM medical_terms 
        WHERE relevance_score > 0
      `;
      
      const params = [
        query,
        query,
        `%${query}%`,
        `%${query}%`,
        `%${query}%`
      ];
      
      if (options?.category) {
        sql += ' AND category = ?';
        params.push(options.category);
      }
      
      sql += ' ORDER BY relevance_score DESC, confidence DESC';
      
      if (options?.limit) {
        sql += ' LIMIT ?';
        params.push(options.limit.toString());
      }
      
      const result = await this.executeQuery(sql, params);
      return result.rows._array || [];
      
    } catch (error) {
      console.error('❌ Failed to search terms:', error);
      return [];
    }
  }

  // Database maintenance
  async cleanupOldRecords(daysOld: number = 30): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);
      const cutoffISO = cutoffDate.toISOString();
      
      await this.executeQuery(
        'DELETE FROM audio_processing WHERE created_at < ?',
        [cutoffISO]
      );
      
      console.log(`✅ Cleaned up audio processing records older than ${daysOld} days`);
      
    } catch (error) {
      console.error('❌ Failed to cleanup old records:', error);
    }
  }

  // Export/Import functionality
  async exportData(): Promise<string> {
    try {
      const [terms, mappings, validations] = await Promise.all([
        this.getMedicalTerms(),
        this.getDialectMappings(),
        this.executeQuery('SELECT * FROM validation_records')
      ]);
      
      const exportData = {
        medical_terms: terms,
        dialect_mappings: mappings,
        validation_records: validations.rows._array || [],
        exported_at: new Date().toISOString()
      };
      
      return JSON.stringify(exportData, null, 2);
      
    } catch (error) {
      console.error('❌ Failed to export data:', error);
      throw error;
    }
  }
}

export const medicalTermsDatabase = new MedicalTermsDatabase(); 