import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { ENV } from '../config/env';

export interface VoiceRecordingResult {
  success: boolean;
  text?: string;
  error?: string;
}

export class VoiceRecordingService {
  private recording: Audio.Recording | null = null;
  private isRecording: boolean = false;
  private recordingStartTime: number = 0;

  constructor() {
    this.initializeAudio();
  }

  private async initializeAudio() {
    try {
      console.log('🎙️ Initializing audio permissions...');
      const { status } = await Audio.requestPermissionsAsync();
      console.log('🎙️ Permission status:', status);
      
      if (status === 'granted') {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
        console.log('✅ Audio mode configured successfully');
      } else {
        console.warn('⚠️ Audio permission not granted during initialization');
      }
    } catch (error) {
      console.error('❌ Failed to initialize audio:', error);
    }
  }

  async startRecording(): Promise<boolean> {
    try {
      console.log('🎤 Starting voice recording...');
      
      if (this.isRecording) {
        console.warn('⚠️ Recording is already in progress');
        return false;
      }

      // Request permissions again to ensure they're granted
      console.log('🔐 Requesting microphone permissions...');
      const { status } = await Audio.requestPermissionsAsync();
      console.log('🔐 Permission result:', status);
      
      if (status !== 'granted') {
        console.error('❌ Audio recording permission not granted');
        return false;
      }

             // Set audio mode before recording
       console.log('⚙️ Configuring audio mode...');
       await Audio.setAudioModeAsync({
         allowsRecordingIOS: true,
         playsInSilentModeIOS: true,
         staysActiveInBackground: false,
         shouldDuckAndroid: true,
         playThroughEarpieceAndroid: false,
       });

      // Create and configure recording
      console.log('🎙️ Creating recording instance...');
      this.recording = new Audio.Recording();
      
             const recordingOptions = {
         android: {
           extension: '.m4a',
           outputFormat: Audio.AndroidOutputFormat.MPEG_4,
           audioEncoder: Audio.AndroidAudioEncoder.AAC,
           sampleRate: 16000, // Lower sample rate for better API compatibility
           numberOfChannels: 1, // Mono for better compatibility
           bitRate: 64000, // Lower bit rate for better quality
         },
         ios: {
           extension: '.m4a',
           outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
           audioQuality: Audio.IOSAudioQuality.MEDIUM, // Use MEDIUM for better compatibility
           sampleRate: 16000, // Lower sample rate for better API compatibility
           numberOfChannels: 1, // Mono for better compatibility
           bitRate: 64000, // Lower bit rate for better quality
           linearPCMBitDepth: 16,
           linearPCMIsBigEndian: false,
           linearPCMIsFloat: false,
         },
         web: {
           mimeType: 'audio/webm;codecs=opus', // Keep webm for better browser support
           bitsPerSecond: 128000, // Increase bit rate for better quality on web
         },
       };

      console.log('⚙️ Recording options:', recordingOptions);
      await this.recording.prepareToRecordAsync(recordingOptions);
      console.log('✅ Recording prepared successfully');

      await this.recording.startAsync();
      this.isRecording = true;
      this.recordingStartTime = Date.now(); // Record start time
      console.log('🎤 ✅ Recording started successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to start recording:', error);
      this.isRecording = false;
      this.recording = null;
      return false;
    }
  }

  async stopRecording(): Promise<VoiceRecordingResult> {
    try {
      console.log('🛑 Stopping voice recording...');
      
      if (!this.isRecording || !this.recording) {
        console.warn('⚠️ No recording in progress');
        return {
          success: false,
          error: 'No recording in progress'
        };
      }

      // Check recording duration
      const recordingDuration = Date.now() - this.recordingStartTime;
      console.log('⏱️ Recording duration:', recordingDuration, 'ms');
      
      if (recordingDuration < 1000) { // Less than 1 second
        console.warn('⚠️ Recording too short:', recordingDuration, 'ms');
        await this.recording.stopAndUnloadAsync();
        this.isRecording = false;
        this.recording = null;
        return {
          success: false,
          error: `Recording too short (${Math.round(recordingDuration/1000)}s). Please record for at least 1-2 seconds and speak clearly.`
        };
      }

      console.log('⏹️ Stopping and unloading recording...');
      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      this.isRecording = false;

      if (!uri) {
        console.error('❌ Failed to get recording URI');
        return {
          success: false,
          error: 'Failed to get recording URI'
        };
      }

      console.log('📁 Recording saved at:', uri);
      console.log('⏱️ Total recording duration:', recordingDuration, 'ms');

      // Convert audio to text using Groq API
      const transcriptionResult = await this.transcribeAudio(uri);
      
      // Clean up the recording file (only on mobile, web handles cleanup automatically)
      if (Platform.OS !== 'web') {
        try {
          await FileSystem.deleteAsync(uri);
          console.log('🗑️ Mobile: Cleaned up audio file');
        } catch (cleanupError) {
          console.warn('⚠️ Failed to cleanup recording file:', cleanupError);
        }
      } else {
        console.log('🌐 Web: Blob URL cleanup handled by browser');
      }

      this.recording = null;
      return transcriptionResult;
    } catch (error) {
      console.error('❌ Failed to stop recording:', error);
      this.isRecording = false;
      this.recording = null;
      return {
        success: false,
        error: `Failed to stop recording: ${error}`
      };
    }
  }

  private async transcribeAudio(audioUri: string): Promise<VoiceRecordingResult> {
    try {
      console.log('🔄 Starting transcription process...');
      let audioBlob: Blob;
      
      if (Platform.OS === 'web') {
        // On web, audioUri is a blob URL, fetch it directly
        console.log('🌐 Web platform: Converting blob URL to audio data');
        const response = await fetch(audioUri);
        audioBlob = await response.blob();
        console.log('🌐 Web blob size:', audioBlob.size, 'bytes');
        console.log('🌐 Web blob type:', audioBlob.type);
      } else {
        // On mobile, read the file and convert to blob
        console.log('📱 Mobile platform: Reading audio file');
        const audioBase64 = await FileSystem.readAsStringAsync(audioUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        console.log('📱 Mobile base64 length:', audioBase64.length);
        audioBlob = this.base64ToBlob(audioBase64, 'audio/m4a');
        console.log('📱 Mobile blob size:', audioBlob.size, 'bytes');
      }

      if (audioBlob.size === 0) {
        console.error('❌ Audio blob is empty');
        return {
          success: false,
          error: 'Recording is empty or corrupted'
        };
      }

      // Check minimum audio size (should be at least 1KB for a valid recording)
      if (audioBlob.size < 1000) {
        console.warn('⚠️ Audio file seems very small:', audioBlob.size, 'bytes');
        return {
          success: false,
          error: `Audio recording too short (${audioBlob.size} bytes). Please record for at least 1-2 seconds.`
        };
      }

      console.log('🎵 Audio blob size:', audioBlob.size, 'bytes');

      // Create FormData
      const formData = new FormData();
      formData.append('file', audioBlob, Platform.OS === 'web' ? 'audio.webm' : 'audio.m4a');
      formData.append('model', ENV.WHISPER_MODEL);
      formData.append('temperature', ENV.WHISPER_TEMPERATURE.toString());
      formData.append('response_format', ENV.WHISPER_RESPONSE_FORMAT);
      formData.append('language', 'en'); // Explicitly set language to English
      formData.append('prompt', 'Medical transcription for healthcare documentation. Please transcribe medical terms and symptoms accurately.'); // Add context prompt

      console.log('🚀 Sending transcription request to Groq API...');
      console.log('🔑 Using API key:', ENV.GROQ_API_KEY.substring(0, 10) + '...');
      console.log('📝 Request details:', {
        model: ENV.WHISPER_MODEL,
        temperature: ENV.WHISPER_TEMPERATURE,
        response_format: ENV.WHISPER_RESPONSE_FORMAT,
        audioSize: audioBlob.size
      });

      // Make API request to Groq
      const response = await fetch(ENV.GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ENV.GROQ_API_KEY}`,
        },
        body: formData,
      });

      console.log('📡 API Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ Groq API error:', response.status, errorData);
        return {
          success: false,
          error: `Transcription failed: ${response.status} - ${errorData}`
        };
      }

      const data = await response.json();
      console.log('✅ Full Transcription response:', JSON.stringify(data, null, 2));

      if (data.text && data.text.trim()) {
        const transcribedText = data.text.trim();
        console.log('📝 Transcribed text:', transcribedText);
        
        // Check if the transcription seems like a placeholder or error
        if (transcribedText.toLowerCase() === 'thank you.' || 
            transcribedText.toLowerCase() === 'thank you' ||
            transcribedText.length < 3) {
          console.warn('⚠️ Suspicious transcription result:', transcribedText);
          return {
            success: false,
            error: `Transcription quality issue. Got: "${transcribedText}". Please try speaking more clearly and for longer duration (3+ seconds).`
          };
        }
        
        return {
          success: true,
          text: transcribedText
        };
      } else {
        console.warn('⚠️ No transcription text received');
        console.log('🔍 Response structure:', Object.keys(data));
        return {
          success: false,
          error: 'No transcription text received or text is empty'
        };
      }
    } catch (error) {
      console.error('❌ Transcription error:', error);
      return {
        success: false,
        error: `Failed to transcribe audio: ${error}`
      };
    }
  }

  private base64ToBlob(base64: string, mimeType: string): Blob {
    try {
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      return new Blob([byteArray], { type: mimeType });
    } catch (error) {
      console.error('❌ Error converting base64 to blob:', error);
      return new Blob([], { type: mimeType });
    }
  }

  async cancelRecording(): Promise<void> {
    try {
      console.log('🚫 Cancelling voice recording...');
      
      if (this.isRecording && this.recording) {
        await this.recording.stopAndUnloadAsync();
        const uri = this.recording.getURI();
        
        // Only cleanup files on mobile platforms
        if (uri && Platform.OS !== 'web') {
          await FileSystem.deleteAsync(uri);
          console.log('🗑️ Mobile: Cancelled and cleaned up audio file');
        } else if (Platform.OS === 'web') {
          console.log('🌐 Web: Recording cancelled, blob cleanup handled by browser');
        }
      }
    } catch (error) {
      console.error('❌ Failed to cancel recording:', error);
    } finally {
      this.isRecording = false;
      this.recording = null;
      console.log('✅ Recording cancelled and cleaned up');
    }
  }

  getIsRecording(): boolean {
    return this.isRecording;
  }

  // Debug function to test microphone input
  async testMicrophone(): Promise<boolean> {
    try {
      console.log('🧪 Testing microphone access...');
      
      // Request permissions first
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        console.error('❌ Microphone permission not granted');
        return false;
      }

      // Try to get user media directly (web only)
      if (Platform.OS === 'web') {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
              sampleRate: 16000,
              channelCount: 1
            } 
          });
          
          // Test if we can create an audio context
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const source = audioContext.createMediaStreamSource(stream);
          const analyser = audioContext.createAnalyser();
          source.connect(analyser);
          
          // Check for audio input levels
          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          analyser.getByteFrequencyData(dataArray);
          
          // Clean up
          stream.getTracks().forEach(track => track.stop());
          audioContext.close();
          
          console.log('✅ Microphone test successful');
          return true;
        } catch (webError) {
          console.error('❌ Web microphone test failed:', webError);
          return false;
        }
      }
      
      console.log('✅ Microphone permissions granted');
      return true;
    } catch (error) {
      console.error('❌ Microphone test failed:', error);
      return false;
    }
  }

  // Enhanced transcription with better error handling
  private async transcribeAudioWithRetry(audioUri: string, retryCount: number = 0): Promise<VoiceRecordingResult> {
    const maxRetries = 2;
    const result = await this.transcribeAudio(audioUri);
    
    // If we get "Thank you" and haven't exceeded retry limit, suggest retry
    if (!result.success && retryCount < maxRetries && 
        result.error?.includes('Thank you')) {
      console.log(`🔄 Transcription retry ${retryCount + 1}/${maxRetries}`);
      return {
        success: false,
        error: `Transcription attempt ${retryCount + 1}: ${result.error}\n\nTip: Try speaking louder and closer to the microphone.`
      };
    }
    
    return result;
  }
}

export const voiceRecordingService = new VoiceRecordingService(); 