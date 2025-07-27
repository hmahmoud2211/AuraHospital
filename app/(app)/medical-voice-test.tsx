import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, TextInput } from 'react-native';
import { MedicalVoiceRecorder } from '../components/MedicalVoiceRecorder';
import { medicalTerminologyMapper } from '../services/MedicalTerminologyMapper';
import Colors from '../../constants/colors';

export default function MedicalVoiceTestScreen() {
  const [testResults, setTestResults] = useState<string>('');
  const [manualTestText, setManualTestText] = useState<string>('');
  const [manualTestResult, setManualTestResult] = useState<string>('');

  const testPhrases = [
    // English phrases (should now be detected!)
    "I have a headache", // Should detect "headache"
    "My stomach hurts", // Should detect "stomach" + "hurt"
    "I feel chest pain", // Should detect "chest pain"
    "I have a fever and cough", // Should detect "fever" + "cough"
    "My back is sore", // Should detect "back" + "sore"
    "I feel dizzy and nauseous", // Should detect "dizzy" + "nauseous"
    "I have diabetes", // Should detect "diabetes"
    "Knee pain bothering me", // Should detect "knee pain"
    
    // Arabic phrases - testing common variations
    "صداع", // Simple: headache
    "وجع", // Simple: pain
    "حمى", // Simple: fever
    "سعال", // Simple: cough
    "عندي صداع", // I have headache
    "عندي وجع", // I have pain
    "وجع في البطن", // Pain in stomach
    "وجع في الظهر", // Back pain
    "صداع شديد", // Severe headache
    "حمى عالية", // High fever
    "سعال جاف", // Dry cough
    "ألم في الصدر", // Chest pain
    "دوخة وغثيان", // Dizziness and nausea
    "عندي صداع شديد", // I have severe headache
    "أشعر بألم في البطن", // I feel stomach pain
    "لدي حمى وسعال", // I have fever and cough
    
    // Egyptian dialect variations to test
    "وغا", // Egyptian dialect for pain
    "سداع", // Common mispronunciation of headache
    "كحة", // Dialect for cough
    "سخونة", // Dialect for fever
    "راسي بتوجعني", // My head hurts (Egyptian)
    "كرشي بيوجعني", // My stomach hurts (Egyptian)
    "مش كويس", // I'm not well (Egyptian)
    "تعبان خالص", // Very tired (Egyptian)
    "حاسس وحش", // Feeling bad (Egyptian)
    "عندي سخونة", // I have fever (Egyptian)
    "بكح كتير", // Coughing a lot (Egyptian)
    "مش قادر أتنفس", // Can't breathe (Egyptian)
    
    // Non-medical phrases (should show no terms)
    "Test without medical terms",
    "The weather is nice today",
    "مرحبا كيف حالك", // Arabic greeting - no medical terms
  ];

  const testMedicalDetection = async (text: string) => {
    try {
      console.log(`🧪 Testing medical detection for: "${text}"`);
      
      // Debug the text first
      const debugInfo = {
        text: text,
        length: text.length,
        hasArabic: /[\u0600-\u06FF\u0750-\u077F]/.test(text),
        hasEnglish: /[a-zA-Z]/.test(text),
        charCodes: text.split('').map(char => `${char}(${char.charCodeAt(0)})`).join(' ')
      };
      
      console.log('🔍 Debug info:', debugInfo);
      
      const result = await medicalTerminologyMapper.mapMedicalTerms(text);
      
      const resultText = `
📝 Text: "${text}"
🔍 Length: ${text.length} | Arabic: ${debugInfo.hasArabic} | English: ${debugInfo.hasEnglish}
🔤 Chars: ${debugInfo.charCodes}
🏥 Terms Found: ${result.mappedTerms.length}
${result.mappedTerms.map(term => 
  `  • ${term.originalText} → ${term.englishText} (${term.category})`
).join('\n')}
📊 Confidence: ${(result.confidence * 100).toFixed(1)}%
⏱️ Time: ${result.processingTime}ms
${'='.repeat(50)}
`;
      
      setTestResults(prev => prev + resultText);
    } catch (error) {
      Alert.alert('Test Error', `Failed to test: ${error}`);
    }
  };

  const testManualText = async () => {
    if (!manualTestText.trim()) {
      Alert.alert('Error', 'Please enter some text to test');
      return;
    }
    
    try {
      const result = await medicalTerminologyMapper.mapMedicalTerms(manualTestText);
      
      // Manual pattern testing
      const testPatterns = [
        { name: 'صداع (headache)', pattern: /صداع/gi },
        { name: 'وجع (pain)', pattern: /وجع/gi },
        { name: 'ألم (pain)', pattern: /ألم/gi },
        { name: 'حمى (fever)', pattern: /حمى/gi },
        { name: 'سعال (cough)', pattern: /سعال/gi },
        { name: 'pain', pattern: /\bpain\b/gi },
        { name: 'headache', pattern: /\bheadache\b/gi },
        { name: 'fever', pattern: /\bfever\b/gi },
        { name: 'cough', pattern: /\bcough\b/gi },
      ];
      
      let patternResults = '\n🧪 MANUAL PATTERN TESTS:\n';
      for (const test of testPatterns) {
        const matches = manualTestText.match(test.pattern);
        patternResults += `${test.name}: ${matches ? `✅ FOUND: ${matches.join(', ')}` : '❌ NO MATCH'}\n`;
      }
      
      const manualResult = `
📝 Manual Test: "${manualTestText}"
🔍 Length: ${manualTestText.length}
🔤 Has Arabic: ${/[\u0600-\u06FF\u0750-\u077F]/.test(manualTestText)}
🔤 Has English: ${/[a-zA-Z]/.test(manualTestText)}
🏥 Medical Terms Detected: ${result.mappedTerms.length}
${result.mappedTerms.map(term => 
  `  • ${term.originalText} → ${term.englishText} (${term.category})`
).join('\n')}
${patternResults}
${'='.repeat(50)}
`;
      
      setManualTestResult(manualResult);
    } catch (error) {
      Alert.alert('Test Error', `Failed to test manual text: ${error}`);
    }
  };

  const runAllTests = async () => {
    setTestResults('🧪 MEDICAL TERM DETECTION TESTS\n' + '='.repeat(50) + '\n');
    
    for (const phrase of testPhrases) {
      await testMedicalDetection(phrase);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  };

  const clearResults = () => {
    setTestResults('');
    setManualTestResult('');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Medical Voice Transcription Test</Text>
      
      {/* Voice Recorder Component */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎤 Voice Recording Test</Text>
        <Text style={styles.description}>
          Record your voice and see medical term detection results.
          Now with comprehensive Egyptian dialect support! Try: "راسي بتوجعني", "كرشي بيوجعني", "مش كويس", "تعبان خالص".
        </Text>
        <MedicalVoiceRecorder />
      </View>

      {/* Manual Text Testing */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>✍️ Manual Text Testing</Text>
        <Text style={styles.description}>
          Type any text below to test medical term detection manually:
        </Text>
        
        <TextInput
          style={styles.textInput}
          placeholder="Enter text to test (English or Arabic)"
          placeholderTextColor={Colors.textSecondary}
          value={manualTestText}
          onChangeText={setManualTestText}
          multiline
        />
        
        <TouchableOpacity style={styles.testButton} onPress={testManualText}>
          <Text style={styles.buttonText}>Test This Text</Text>
        </TouchableOpacity>
        
        {manualTestResult ? (
          <ScrollView style={styles.miniResultsContainer}>
            <Text style={styles.resultsText}>{manualTestResult}</Text>
          </ScrollView>
        ) : null}
      </View>

      {/* Predefined Tests */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🧪 Predefined Tests</Text>
        <Text style={styles.description}>
          Test medical term detection with predefined phrases:
        </Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.testButton} onPress={runAllTests}>
            <Text style={styles.buttonText}>Run All Tests</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.clearButton} onPress={clearResults}>
            <Text style={styles.clearButtonText}>Clear Results</Text>
          </TouchableOpacity>
        </View>

        {/* Individual Test Buttons */}
        <Text style={styles.subtitle}>Or test individual phrases:</Text>
        {testPhrases.slice(0, 8).map((phrase, index) => (
          <TouchableOpacity
            key={index}
            style={styles.phraseButton}
            onPress={() => testMedicalDetection(phrase)}
          >
            <Text style={styles.phraseText}>{phrase}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Results */}
      {testResults ? (
        <View style={styles.resultsSection}>
          <Text style={styles.sectionTitle}>📋 Test Results</Text>
          <ScrollView style={styles.resultsContainer}>
            <Text style={styles.resultsText}>{testResults}</Text>
          </ScrollView>
        </View>
      ) : null}

      {/* Instructions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💡 Tips for Better Detection</Text>
        <Text style={styles.tipText}>
          • Enhanced with comprehensive Egyptian dialect support!
          {'\n'}• English: "headache", "pain", "fever", "cough", "nausea"
          {'\n'}• Standard Arabic: صداع (headache), وجع (pain), حمى (fever)
          {'\n'}• Egyptian dialect: "راسي بتوجعني", "كرشي بيوجعني", "مش كويس", "تعبان خالص"
          {'\n'}• Colloquial expressions: "حاسس وحش", "بكح كتير", "عندي سخونة"
          {'\n'}• Body parts: "كرشي", "ضهري", "راسي", "قلبي", "إيدي"
          {'\n'}• Pain expressions: "وغا", "بيوجعني", "يوجعني", "موجوع"
          {'\n'}• Check the console logs for detailed debugging info
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    minHeight: 80,
    fontSize: 16,
    backgroundColor: Colors.background,
    color: Colors.text,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  testButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButton: {
    flex: 1,
    backgroundColor: Colors.secondary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  buttonText: {
    color: Colors.background,
    fontWeight: '600',
  },
  clearButtonText: {
    color: Colors.text,
    fontWeight: '600',
  },
  phraseButton: {
    backgroundColor: Colors.primaryLight,
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  phraseText: {
    color: Colors.primary,
    fontSize: 14,
  },
  resultsSection: {
    marginBottom: 32,
  },
  resultsContainer: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    maxHeight: 300,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  miniResultsContainer: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 8,
  },
  resultsText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: Colors.text,
    lineHeight: 16,
  },
  tipText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
}); 