import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { whisperMedicalTranscriptionService, MedicalTranscriptionResult } from '../services/WhisperMedicalTranscriptionService';

interface VoiceRecordingResult {
  success: boolean;
  text?: string;
  error?: string;
  medicalResult?: MedicalTranscriptionResult;
}

interface VoiceRecordingHook {
  isRecording: boolean;
  isProcessing: boolean;
  startRecording: () => Promise<boolean>;
  stopRecording: () => Promise<VoiceRecordingResult>;
  cancelRecording: () => Promise<void>;
}

export const useVoiceRecording = (): VoiceRecordingHook => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const startRecording = useCallback(async (): Promise<boolean> => {
    try {
      setIsRecording(true);
      console.log('🎤 Hook: Starting medical voice recording...');
      
      const success = await whisperMedicalTranscriptionService.startRecording();
      
      if (!success) {
        setIsRecording(false);
        Alert.alert(
          "Microphone Access Required", 
          "Unable to access your microphone. Please:\n\n• Grant microphone permissions in your browser\n• Check if another app is using your microphone\n• Try refreshing the page\n\nClick the microphone icon in your browser's address bar to manage permissions.",
          [
            { text: "Help", onPress: () => console.log('TODO: Show microphone help guide') },
            { text: "Try Again", onPress: () => {} }
          ]
        );
        return false;
      }
      
      console.log('✅ Hook: Recording started successfully');
      return true;
    } catch (error) {
      console.error('❌ Hook: Error starting voice recording:', error);
      setIsRecording(false);
      Alert.alert(
        "Recording Error",
        `Failed to start recording: ${error}`,
        [{ text: "OK" }]
      );
      return false;
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<VoiceRecordingResult> => {
    try {
      console.log('🛑 Hook: Stopping voice recording...');
      setIsProcessing(true);
      
      const medicalResult = await whisperMedicalTranscriptionService.stopRecordingWithMedicalProcessing();
      
      setIsRecording(false);
      
      if (medicalResult.success && medicalResult.originalText) {
        console.log('✅ Hook: Recording processed successfully');
        return {
          success: true,
          text: medicalResult.medicalSummary || medicalResult.normalizedText || medicalResult.originalText,
          medicalResult: medicalResult
        };
      } else {
        console.error('❌ Hook: Recording failed:', medicalResult.error);
        return {
          success: false,
          error: medicalResult.error || 'Recording failed',
          medicalResult: medicalResult
        };
      }
    } catch (error) {
      console.error('❌ Hook: Error stopping voice recording:', error);
      setIsRecording(false);
      return {
        success: false,
        error: `Recording processing failed: ${error}`
      };
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const cancelRecording = useCallback(async (): Promise<void> => {
    try {
      console.log('🚫 Hook: Cancelling voice recording...');
      await whisperMedicalTranscriptionService.cleanup();
      setIsRecording(false);
      setIsProcessing(false);
      console.log('✅ Hook: Recording cancelled');
    } catch (error) {
      console.error('❌ Hook: Error cancelling voice recording:', error);
      setIsRecording(false);
      setIsProcessing(false);
    }
  }, []);

  return {
    isRecording,
    isProcessing,
    startRecording,
    stopRecording,
    cancelRecording,
  };
}; 