import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { ENV } from '../config/env';

export interface SimpleTranscriptionResult {
  success: boolean;
  text?: string;
  language?: string;
  error?: string;
  duration?: number;
}

export interface RecordingStatus {
  isRecording: boolean;
  duration: number;
}

export class SimpleWhisperTranscriptionService {
  private recording: Audio.Recording | null = null;
  private isRecording = false;

  constructor() {
    console.log('🎤 Simple Whisper Transcription Service initialized');
  }

  // Start audio recording
  async startRecording(): Promise<boolean> {
    try {
      console.log('🎙️ Starting simple audio recording...');

      if (this.isRecording) {
        console.warn('⚠️ Recording already in progress');
        return false;
      }

      // Request permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        console.error('❌ Audio recording permission denied');
        return false;
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Configure recording options
      const recordingOptions: Audio.RecordingOptions = {
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 1, // Mono for better compatibility
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 44100,
          numberOfChannels: 1, // Mono for better compatibility
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm;codecs=opus',
          bitsPerSecond: 128000,
        },
      };

      // Create new recording
      this.recording = new Audio.Recording();
      await this.recording.prepareToRecordAsync(recordingOptions);
      await this.recording.startAsync();

      this.isRecording = true;
      console.log('✅ Recording started successfully');
      return true;

    } catch (error) {
      console.error('❌ Failed to start recording:', error);
      this.isRecording = false;
      return false;
    }
  }

  // Stop recording and transcribe
  async stopRecording(): Promise<SimpleTranscriptionResult> {
    try {
      console.log('🛑 Stopping recording...');

      if (!this.isRecording || !this.recording) {
        return {
          success: false,
          error: 'No recording in progress'
        };
      }

      // Stop recording
      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      this.isRecording = false;

      if (!uri) {
        return {
          success: false,
          error: 'Failed to get recording URI'
        };
      }

      console.log('📁 Recording saved to:', uri);

      // Transcribe the audio
      const transcriptionResult = await this.transcribeAudio(uri);
      
      // Clean up
      this.recording = null;

      return transcriptionResult;

    } catch (error) {
      console.error('❌ Failed to stop recording:', error);
      this.isRecording = false;
      this.recording = null;
      return {
        success: false,
        error: `Recording failed: ${error}`
      };
    }
  }

  // Get current recording status
  getRecordingStatus(): RecordingStatus {
    return {
      isRecording: this.isRecording,
      duration: 0 // Could be enhanced to track actual duration
    };
  }

  // Simple transcription using only Whisper
  private async transcribeAudio(audioUri: string): Promise<SimpleTranscriptionResult> {
    const startTime = Date.now();
    
    try {
      console.log('🔄 Starting Whisper transcription...');
      
      // Convert audio file to blob
      let audioBlob: Blob;
      
      if (Platform.OS === 'web') {
        const response = await fetch(audioUri);
        audioBlob = await response.blob();
      } else {
        const audioBase64 = await FileSystem.readAsStringAsync(audioUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        audioBlob = this.base64ToBlob(audioBase64, 'audio/m4a');
      }

      // Validate audio
      if (audioBlob.size === 0) {
        return {
          success: false,
          error: 'Audio file is empty'
        };
      }

      if (audioBlob.size < 1000) {
        return {
          success: false,
          error: 'Audio file too short - please record for at least 1-2 seconds'
        };
      }

      console.log(`📊 Audio size: ${audioBlob.size} bytes`);

      // Prepare FormData for Whisper API
      const formData = new FormData();
      formData.append('file', audioBlob, Platform.OS === 'web' ? 'audio.webm' : 'audio.m4a');
      formData.append('model', ENV.WHISPER_MODEL || 'whisper-large-v3');
      formData.append('response_format', ENV.WHISPER_RESPONSE_FORMAT || 'json');
      formData.append('temperature', '0.0'); // For consistent results
      
      // Optional: Set language if needed (remove for auto-detection)
      // formData.append('language', 'ar'); // Uncomment for Arabic-only

      console.log('🚀 Sending to Whisper API...');

      // Call Whisper API
      const response = await fetch(ENV.GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ENV.GROQ_API_KEY}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Whisper API error:', response.status, errorText);
        return {
          success: false,
          error: `Transcription failed: ${response.status} - ${errorText}`
        };
      }

      const data = await response.json();
      console.log('✅ Whisper response:', data);

      const transcribedText = data.text?.trim();
      const detectedLanguage = data.language;
      const duration = Date.now() - startTime;

      if (!transcribedText) {
        return {
          success: false,
          error: 'No speech detected in audio'
        };
      }

      console.log(`📝 Transcribed: "${transcribedText}"`);
      console.log(`🌐 Language: ${detectedLanguage || 'auto-detected'}`);
      console.log(`⏱️ Processing time: ${duration}ms`);

      return {
        success: true,
        text: transcribedText,
        language: detectedLanguage,
        duration: duration
      };

    } catch (error) {
      console.error('❌ Transcription failed:', error);
      return {
        success: false,
        error: `Transcription error: ${error}`
      };
    }
  }

  // Helper: Convert base64 to blob
  private base64ToBlob(base64: string, mimeType: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }

  // Clean up resources
  async cleanup(): Promise<void> {
    try {
      if (this.isRecording && this.recording) {
        await this.recording.stopAndUnloadAsync();
      }
      this.recording = null;
      this.isRecording = false;
      console.log('🧹 Simple transcription service cleaned up');
    } catch (error) {
      console.error('❌ Cleanup error:', error);
    }
  }
}

// Export singleton instance
export const simpleWhisperTranscriptionService = new SimpleWhisperTranscriptionService(); 