import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { simpleWhisperTranscriptionService, SimpleTranscriptionResult } from '../services/SimpleWhisperTranscriptionService';

export const SimpleVoiceRecorder: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcriptionResult, setTranscriptionResult] = useState<SimpleTranscriptionResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleStartRecording = async () => {
    try {
      setIsRecording(true);
      setTranscriptionResult(null);
      
      const success = await simpleWhisperTranscriptionService.startRecording();
      
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
      
      const result = await simpleWhisperTranscriptionService.stopRecording();
      setTranscriptionResult(result);
      
      if (!result.success) {
        Alert.alert('Transcription Failed', result.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Stop recording error:', error);
      Alert.alert('Error', 'Failed to stop recording');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearResult = () => {
    setTranscriptionResult(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Simple Voice-to-Text</Text>
      
      {/* Recording Controls */}
      <View style={styles.controlsContainer}>
        {!isRecording ? (
          <TouchableOpacity 
            style={[styles.button, styles.startButton]} 
            onPress={handleStartRecording}
            disabled={isProcessing}
          >
            <Text style={styles.buttonText}>
              {isProcessing ? 'Processing...' : '🎤 Start Recording'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.button, styles.stopButton]} 
            onPress={handleStopRecording}
          >
            <Text style={styles.buttonText}>🛑 Stop Recording</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Recording Status */}
      {isRecording && (
        <View style={styles.statusContainer}>
          <Text style={styles.recordingStatus}>🔴 Recording... Speak now!</Text>
        </View>
      )}

      {/* Processing Status */}
      {isProcessing && (
        <View style={styles.statusContainer}>
          <Text style={styles.processingStatus}>⏳ Transcribing audio...</Text>
        </View>
      )}

      {/* Transcription Result */}
      {transcriptionResult && (
        <View style={styles.resultContainer}>
          <View style={styles.resultHeader}>
            <Text style={styles.resultTitle}>
              {transcriptionResult.success ? '✅ Transcription Result' : '❌ Transcription Failed'}
            </Text>
            <TouchableOpacity onPress={handleClearResult} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          </View>

          {transcriptionResult.success ? (
            <>
              <View style={styles.transcriptContainer}>
                <Text style={styles.transcriptText}>
                  {transcriptionResult.text}
                </Text>
              </View>
              
              <View style={styles.metadataContainer}>
                {transcriptionResult.language && (
                  <Text style={styles.metadata}>
                    Language: {transcriptionResult.language}
                  </Text>
                )}
                {transcriptionResult.duration && (
                  <Text style={styles.metadata}>
                    Processing time: {transcriptionResult.duration}ms
                  </Text>
                )}
              </View>
            </>
          ) : (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>
                {transcriptionResult.error}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>How to use:</Text>
        <Text style={styles.instructionsText}>
          1. Tap "Start Recording" and speak clearly
        </Text>
        <Text style={styles.instructionsText}>
          2. Tap "Stop Recording" when finished
        </Text>
        <Text style={styles.instructionsText}>
          3. Wait for Whisper to transcribe your speech
        </Text>
        <Text style={styles.instructionsText}>
          4. View the transcribed text below
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
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
    backgroundColor: '#4CAF50',
  },
  stopButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  recordingStatus: {
    fontSize: 16,
    color: '#f44336',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  processingStatus: {
    fontSize: 16,
    color: '#FF9800',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  resultContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
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
    marginBottom: 10,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  clearButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  transcriptContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  transcriptText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  metadataContainer: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 10,
  },
  metadata: {
    fontSize: 12,
    color: '#666',
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
    color: '#d32f2f',
  },
  instructionsContainer: {
    backgroundColor: '#e3f2fd',
    borderRadius: 10,
    padding: 15,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 10,
  },
  instructionsText: {
    fontSize: 14,
    color: '#1976d2',
    marginBottom: 5,
  },
});

export default SimpleVoiceRecorder; 