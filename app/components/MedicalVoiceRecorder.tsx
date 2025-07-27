import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { whisperMedicalTranscriptionService, MedicalTranscriptionResult } from '../services/WhisperMedicalTranscriptionService';

export const MedicalVoiceRecorder: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [result, setResult] = useState<MedicalTranscriptionResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleStartRecording = async () => {
    try {
      setIsRecording(true);
      setResult(null);
      
      const success = await whisperMedicalTranscriptionService.startRecording();
      
      if (!success) {
        Alert.alert('Error', 'Failed to start recording. Please check microphone permissions.');
        setIsRecording(false);
      }
    } catch (error) {
      console.error('Start recording error:', error);
      Alert.alert('Error', 'Failed to start recording');
      setIsRecording(false);
    }
  };

  const handleStopRecording = async () => {
    try {
      setIsRecording(false);
      setIsProcessing(true);
      
      const medicalResult = await whisperMedicalTranscriptionService.stopRecordingWithMedicalProcessing();
      setResult(medicalResult);
      
      if (!medicalResult.success) {
        Alert.alert('Processing Failed', medicalResult.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Stop recording error:', error);
      Alert.alert('Error', 'Failed to process recording');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearResult = () => {
    setResult(null);
  };

  const formatProcessingTime = (ms?: number): string => {
    if (!ms) return 'N/A';
    return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Medical Voice Transcription</Text>
      <Text style={styles.subtitle}>Whisper → Medical Terminology</Text>
      
      {/* Recording Controls */}
      <View style={styles.controlsContainer}>
        {!isRecording ? (
          <TouchableOpacity 
            style={[styles.button, styles.startButton]} 
            onPress={handleStartRecording}
            disabled={isProcessing}
          >
            <Text style={styles.buttonText}>
              {isProcessing ? '⏳ Processing...' : '🎤 Start Medical Recording'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.button, styles.stopButton]} 
            onPress={handleStopRecording}
          >
            <Text style={styles.buttonText}>🛑 Stop & Process</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Recording Status */}
      {isRecording && (
        <View style={styles.statusContainer}>
          <Text style={styles.recordingStatus}>🔴 Recording medical consultation... Speak clearly!</Text>
        </View>
      )}

      {/* Processing Status */}
      {isProcessing && (
        <View style={styles.statusContainer}>
          <Text style={styles.processingStatus}>
            ⏳ Processing: Whisper transcription → Medical terminology mapping...
          </Text>
        </View>
      )}

      {/* Results */}
      {result && (
        <View style={styles.resultContainer}>
          <View style={styles.resultHeader}>
            <Text style={styles.resultTitle}>
              {result.success ? '✅ Medical Transcription Complete' : '❌ Processing Failed'}
            </Text>
            <TouchableOpacity onPress={handleClearResult} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          </View>

          {result.success ? (
            <>
              {/* Original Transcription */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>📝 Original Transcription</Text>
                <View style={styles.transcriptContainer}>
                  <Text style={styles.transcriptText}>{result.originalText}</Text>
                </View>
                <Text style={styles.metadata}>
                  Language: {result.detectedLanguage} | Whisper: {formatProcessingTime(result.transcriptionDuration)}
                </Text>
              </View>

              {/* Normalized Text (if different) */}
              {result.normalizedText && result.normalizedText !== result.originalText && (
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>🔧 Normalized Text</Text>
                  <View style={styles.normalizedContainer}>
                    <Text style={styles.transcriptText}>{result.normalizedText}</Text>
                  </View>
                  {result.dialectNormalization && (
                    <Text style={styles.metadata}>
                      {result.dialectNormalization.transformations.length} dialect corrections applied
                    </Text>
                  )}
                </View>
              )}

              {/* Medical Summary */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>🏥 Medical Summary</Text>
                <View style={styles.summaryContainer}>
                  <Text style={styles.summaryText}>
                    {result.medicalSummary || 'No medical terms detected'}
                  </Text>
                </View>
              </View>

              {/* Medical Terms */}
              {result.medicalTerms && result.medicalTerms.length > 0 && (
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>
                    📋 Medical Terms ({result.medicalTerms.length})
                  </Text>
                  {result.medicalTerms.slice(0, 5).map((term, index) => (
                    <View key={index} style={styles.termContainer}>
                      <Text style={styles.termOriginal}>
                        {term.arabicText || term.originalText}
                      </Text>
                      <Text style={styles.termEnglish}>
                        → {term.englishText}
                      </Text>
                      <Text style={styles.termCategory}>
                        {term.category} • {(term.confidence * 100).toFixed(0)}%
                      </Text>
                      {term.snomedCT?.code && (
                        <Text style={styles.termCode}>
                          SNOMED: {term.snomedCT.code}
                        </Text>
                      )}
                    </View>
                  ))}
                  {result.medicalTerms.length > 5 && (
                    <Text style={styles.moreTermsText}>
                      + {result.medicalTerms.length - 5} more terms...
                    </Text>
                  )}
                </View>
              )}

              {/* Categories */}
              {result.medicalCategories && result.medicalCategories.length > 0 && (
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>🏷️ Medical Categories</Text>
                  <View style={styles.categoriesContainer}>
                    {result.medicalCategories.map((category, index) => (
                      <View key={index} style={styles.categoryChip}>
                        <Text style={styles.categoryText}>{category}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Processing Metadata */}
              <View style={styles.metadataContainer}>
                <Text style={styles.metadata}>
                  Total processing time: {formatProcessingTime(result.totalProcessingTime)}
                </Text>
                {result.medicalMapping && (
                  <Text style={styles.metadata}>
                    Medical confidence: {(result.medicalMapping.confidence * 100).toFixed(1)}%
                  </Text>
                )}
              </View>
            </>
          ) : (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{result.error}</Text>
            </View>
          )}
        </View>
      )}

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>How it works:</Text>
        <Text style={styles.instructionsText}>
          1. 🎤 Records your voice with high quality audio
        </Text>
        <Text style={styles.instructionsText}>
          2. 📝 Whisper transcribes speech to text (any language)
        </Text>
        <Text style={styles.instructionsText}>
          3. 🔧 Normalizes Arabic dialects (if detected)
        </Text>
        <Text style={styles.instructionsText}>
          4. 🏥 Maps text to standardized medical terminology
        </Text>
        <Text style={styles.instructionsText}>
          5. 📋 Generates clinical summary with SNOMED codes
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
    color: '#2c3e50',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
  controlsContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  button: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  startButton: {
    backgroundColor: '#27ae60',
  },
  stopButton: {
    backgroundColor: '#e74c3c',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  recordingStatus: {
    fontSize: 16,
    color: '#e74c3c',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  processingStatus: {
    fontSize: 14,
    color: '#f39c12',
    fontWeight: '600',
    textAlign: 'center',
  },
  resultContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  clearButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  sectionContainer: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#34495e',
    marginBottom: 8,
  },
  transcriptContainer: {
    backgroundColor: '#ecf0f1',
    borderRadius: 8,
    padding: 12,
    marginBottom: 5,
  },
  normalizedContainer: {
    backgroundColor: '#e8f5e8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 5,
  },
  summaryContainer: {
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  transcriptText: {
    fontSize: 16,
    color: '#2c3e50',
    lineHeight: 22,
  },
  summaryText: {
    fontSize: 15,
    color: '#856404',
    fontWeight: '500',
  },
  termContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#3498db',
  },
  termOriginal: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  termEnglish: {
    fontSize: 14,
    color: '#27ae60',
    marginTop: 2,
  },
  termCategory: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 3,
  },
  termCode: {
    fontSize: 11,
    color: '#95a5a6',
    marginTop: 2,
  },
  moreTermsText: {
    fontSize: 13,
    color: '#7f8c8d',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 5,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    backgroundColor: '#e3f2fd',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  categoryText: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '600',
  },
  metadataContainer: {
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
    paddingTop: 10,
    marginTop: 10,
  },
  metadata: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    borderRadius: 8,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  errorText: {
    fontSize: 14,
    color: '#c62828',
  },
  instructionsContainer: {
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1565c0',
    marginBottom: 10,
  },
  instructionsText: {
    fontSize: 14,
    color: '#1976d2',
    marginBottom: 6,
    lineHeight: 20,
  },
});

export default MedicalVoiceRecorder; 