# Simple Voice Transcription with Whisper

This guide shows how to use the simplified voice transcription system that uses only Whisper for basic voice-to-text conversion.

## Features

✅ **Simple Voice-to-Text**: Record audio and get transcribed text  
✅ **Whisper API Integration**: Uses Groq's Whisper API for accurate transcription  
✅ **Multi-language Support**: Automatically detects language or can be configured for specific languages  
✅ **Cross-platform**: Works on iOS, Android, and Web  
✅ **No Complex Processing**: Just pure audio → text conversion  
✅ **Under 896 Characters**: Optimized prompts that stay within API limits  

## Files Created

- `app/services/SimpleWhisperTranscriptionService.ts` - Core transcription service
- `app/components/SimpleVoiceRecorder.tsx` - React component for recording
- `app/(app)/simple-voice-test.tsx` - Test screen
- `docs/SIMPLE_VOICE_TRANSCRIPTION.md` - This documentation

## Quick Start

### 1. Use the Test Screen

Navigate to `/simple-voice-test` in your app to see the transcription in action.

### 2. Basic Service Usage

```typescript
import { simpleWhisperTranscriptionService } from '../services/SimpleWhisperTranscriptionService';

// Start recording
const startSuccess = await simpleWhisperTranscriptionService.startRecording();

// Stop recording and get transcription
const result = await simpleWhisperTranscriptionService.stopRecording();

if (result.success) {
  console.log('Transcribed text:', result.text);
  console.log('Detected language:', result.language);
  console.log('Processing time:', result.duration + 'ms');
} else {
  console.error('Transcription failed:', result.error);
}
```

### 3. Use the Component

```tsx
import SimpleVoiceRecorder from '../components/SimpleVoiceRecorder';

export default function MyScreen() {
  return (
    <View>
      <SimpleVoiceRecorder />
    </View>
  );
}
```

## API Reference

### SimpleWhisperTranscriptionService

#### Methods

- `startRecording(): Promise<boolean>` - Start audio recording
- `stopRecording(): Promise<SimpleTranscriptionResult>` - Stop recording and transcribe
- `getRecordingStatus(): RecordingStatus` - Get current recording status
- `cleanup(): Promise<void>` - Clean up resources

#### SimpleTranscriptionResult

```typescript
interface SimpleTranscriptionResult {
  success: boolean;      // Whether transcription succeeded
  text?: string;         // Transcribed text
  language?: string;     // Detected language (e.g., "en", "ar")
  error?: string;        // Error message if failed
  duration?: number;     // Processing time in milliseconds
}
```

## Configuration

### Language Settings

By default, the service auto-detects language. To force a specific language:

```typescript
// In SimpleWhisperTranscriptionService.ts, uncomment this line:
formData.append('language', 'ar'); // For Arabic-only
// or
formData.append('language', 'en'); // For English-only
```

### Audio Quality

The service is configured for optimal quality:
- **Sample Rate**: 44.1kHz
- **Channels**: Mono (better compatibility)
- **Bit Rate**: 128kbps
- **Format**: M4A (mobile), WebM with Opus (web)

## Differences from Complex Medical System

| Feature | Simple System | Complex Medical System |
|---------|---------------|------------------------|
| **Processing** | Whisper only | Whisper + Medical mapping + Dialect normalization |
| **Output** | Raw transcribed text | Medical terms + normalized text + clinical summary |
| **Prompt** | Short/none | Long medical context |
| **Performance** | Fast | Slower due to multiple processing steps |
| **Use Case** | General transcription | Medical documentation |
| **Complexity** | Low | High |

## Example Usage Scenarios

### 1. General Note Taking
```typescript
// Record a voice note
const result = await simpleWhisperTranscriptionService.stopRecording();
const voiceNote = result.text; // "Remember to buy groceries tomorrow"
```

### 2. Meeting Transcription
```typescript
// Long recording for meeting notes
const result = await simpleWhisperTranscriptionService.stopRecording();
const meetingNotes = result.text; // Full meeting transcription
```

### 3. Voice Commands
```typescript
// Quick voice command
const result = await simpleWhisperTranscriptionService.stopRecording();
const command = result.text; // "Navigate to settings"
```

## Troubleshooting

### Common Issues

1. **"Recording failed"**
   - Check microphone permissions
   - Ensure device has microphone access

2. **"Audio file too short"**
   - Record for at least 1-2 seconds
   - Speak clearly during recording

3. **"Transcription failed: 400"**
   - API key issues - check ENV.GROQ_API_KEY
   - Prompt too long (should be fixed in this version)

4. **Empty transcription**
   - Speak louder and clearer
   - Check microphone is working
   - Try recording in a quieter environment

### Debug Logging

The service provides detailed console logging:
- 🎙️ Recording status
- 📊 Audio file size
- 🚀 API requests
- ✅ Transcription results
- ❌ Error details

## Environment Requirements

Make sure these are set in your `app/config/env.ts`:

```typescript
export const ENV = {
  GROQ_API_KEY: 'your-groq-api-key',
  GROQ_API_URL: 'https://api.groq.com/openai/v1/audio/transcriptions',
  WHISPER_MODEL: 'whisper-large-v3',
  WHISPER_RESPONSE_FORMAT: 'json',
};
```

## Next Steps

1. **Test the system**: Use the test screen at `/simple-voice-test`
2. **Integrate**: Add `SimpleVoiceRecorder` to your screens
3. **Customize**: Modify the component styling and behavior
4. **Extend**: Add features like text editing, saving, sharing

This simplified system gives you clean, fast voice-to-text conversion without the complexity of medical processing! 