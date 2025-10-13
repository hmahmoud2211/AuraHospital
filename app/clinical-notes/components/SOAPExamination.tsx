import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Mic, StopCircle, X, Plus, Trash } from 'lucide-react-native';

// Import the new voice transcription service
import { whisperMedicalTranscriptionService, MedicalTranscriptionResult } from '../app/services/WhisperMedicalTranscriptionService';
import { drugsDatabase, Drug } from '../data/drugsDatabase';
import Colors from '../constants/colors';
import Typography from '../constants/typography';

// SOAP data structure
export interface SOAPData {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

interface SOAPExaminationProps {
  patientName?: string;
  onSave?: (data: SOAPData) => void;
  onClose?: () => void;
  initialData?: Partial<SOAPData>;
}

const SOAPExamination: React.FC<SOAPExaminationProps> = ({
  patientName = 'Patient',
  onSave,
  onClose,
  initialData,
}) => {
  // State management
  const [soapData, setSOAPData] = useState<SOAPData>({
    subjective: initialData?.subjective || '',
    objective: initialData?.objective || '',
    assessment: initialData?.assessment || '',
    plan: initialData?.plan || '',
  });

  const [isVoiceRecording, setIsVoiceRecording] = useState<keyof SOAPData | null>(null);
  const [medicalResult, setMedicalResult] = useState<MedicalTranscriptionResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAddMedication, setShowAddMedication] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Drug[]>([]);

  // Handle text input changes
  const handleInputChange = (field: keyof SOAPData, value: string) => {
    setSOAPData(prev => ({
            ...prev,
      [field]: value,
    }));
  };

  // Voice recording functions
  const startVoiceRecording = async (field: keyof SOAPData) => {
    try {
      console.log('🎤 Starting medical voice recording for field:', field);
      
      // Check if already recording
      if (isVoiceRecording) {
        console.log('🔄 Stopping previous recording before starting new one...');
        await stopVoiceRecording(isVoiceRecording, true);
        await new Promise(resolve => setTimeout(resolve, 300)); // Wait for cleanup
      }
      
      setIsVoiceRecording(field);
      
      // Use the new medical voice transcription service
      const success = await whisperMedicalTranscriptionService.startRecording();
        
        if (!success) {
          console.error('❌ Failed to start recording');
          Alert.alert(
            "Recording Error", 
            "Failed to start recording. Please check:\n• Microphone permissions\n• Browser microphone access\n• Internet connection",
            [
              {
                text: "Test with Sample Text",
                onPress: () => {
                  // Add sample text for testing
                const sampleText = "Sample medical text for testing";
                  const currentText = soapData[field];
                  const newText = currentText ? `${currentText} ${sampleText}` : sampleText;
                  handleInputChange(field, newText);
                  Alert.alert("Test Mode", `Sample text added to ${field}`);
                  setIsVoiceRecording(null);
                }
              },
              {
                text: "OK",
                onPress: () => setIsVoiceRecording(null)
              }
            ]
          );
          return;
      }

      console.log('✅ Recording started successfully');
        Alert.alert(
        "🎤 Recording", 
        "Speak medical information clearly. Recording will automatically process with medical terminology mapping.",
          [
            {
            text: "Stop Recording",
            onPress: () => stopVoiceRecording(field)
            }
          ]
        );
    } catch (error) {
      console.error('❌ Error starting voice recording:', error);
      setIsVoiceRecording(null);
      Alert.alert("Error", `Failed to start recording: ${error}`);
    }
  };

  const stopVoiceRecording = async (field: keyof SOAPData, silent: boolean = false) => {
    try {
      if (!isVoiceRecording && !silent) {
        Alert.alert("No Recording", "No recording in progress");
        return;
      }

      console.log('🛑 Stopping voice recording...');
      setIsVoiceRecording(null);
      setIsProcessing(true);

      if (!silent) {
        console.log('🔄 Processing recording with medical terminology...');
            
        // Use the new medical transcription service
        const result = await whisperMedicalTranscriptionService.stopRecordingWithMedicalProcessing();
            
        setMedicalResult(result);
        
        if (result.success && result.originalText) {
          // Use medical summary if available, otherwise use original text
          const finalText = result.medicalSummary || result.normalizedText || result.originalText;
          
          // Add the transcribed text to the field
          const currentText = soapData[field];
          const newText = currentText ? `${currentText} ${finalText}` : finalText;
          handleInputChange(field, newText);
              
          // Show medical information if available
          if (result.medicalTerms && result.medicalTerms.length > 0) {
                setTimeout(() => {
                  Alert.alert(
                "🏥 Medical Analysis Complete", 
                `✅ Transcribed: "${result.originalText}"\n\n🏥 Medical Summary: ${result.medicalSummary}\n\n📋 Found ${result.medicalTerms?.length || 0} medical terms\n🏷️ Categories: ${result.medicalCategories?.join(', ') || 'None'}\n⏱️ Processing: ${result.totalProcessingTime}ms`,
                    [{ text: "Great!" }]
                  );
                }, 500);
            } else {
            // Show basic transcription result
              setTimeout(() => {
                Alert.alert(
                "📝 Transcription Complete", 
                `Text captured: "${result.originalText}"\n\nLanguage: ${result.detectedLanguage}\n\nNo medical terms were detected in this recording.`,
                  [{ text: "OK" }]
                );
              }, 500);
          }
            } else {
          Alert.alert(
            "Processing Failed", 
            result.error || "Failed to process recording. Please try again.",
            [{ text: "OK" }]
          );
        }
      }
    } catch (error) {
      console.error('❌ Error stopping voice recording:', error);
      Alert.alert("Error", `Failed to stop recording: ${error}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Medication search
  const searchMedications = (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    const filtered = drugsDatabase.filter(drug =>
      drug.name.toLowerCase().includes(query.toLowerCase()) ||
      drug.genericName.toLowerCase().includes(query.toLowerCase()) ||
      drug.category.toLowerCase().includes(query.toLowerCase())
    );

    setSearchResults(filtered.slice(0, 10)); // Limit to 10 results
  };

  const selectMedication = (drug: Drug) => {
    const medicationText = `${drug.name} (${drug.genericName}) - ${drug.category} - Dosage: ${drug.commonDosages[0] || 'As prescribed'} - Frequency: ${drug.commonDosages.length > 1 ? drug.commonDosages[1] : 'As needed'} - Instructions: See ${drug.interactions.length > 0 ? 'interactions' : 'standard protocols'}`;
    const currentText = soapData.plan;
    const newText = currentText ? `${currentText}\n${medicationText}` : medicationText;
    handleInputChange('plan', newText);
    setShowAddMedication(false);
  };

  // Handle save
  const handleSave = () => {
    // Validate that at least one field has content
    const hasContent = Object.values(soapData).some(value => value.trim().length > 0);
    
    if (!hasContent) {
        Alert.alert(
        "Incomplete SOAP Note",
        "Please add content to at least one field before saving.",
                  [{ text: "OK" }]
                );
      return;
    }

    console.log('💾 Saving SOAP data:', soapData);
    
    if (onSave) {
      onSave(soapData);
    }
    
      Alert.alert(
      "SOAP Note Saved",
      "Your SOAP examination has been saved successfully.",
      [
        {
          text: "Continue Editing",
          style: "cancel"
        },
        {
          text: "Close",
          onPress: onClose
        }
      ]
        );
  };

  // Render voice recording button
  const renderVoiceButton = (field: keyof SOAPData) => {
    const isRecording = isVoiceRecording === field;
    const isCurrentlyProcessing = isProcessing && isVoiceRecording === field;
    
    return (
        <TouchableOpacity 
          style={[
            styles.voiceButton,
          isRecording && styles.voiceButtonActive,
          isCurrentlyProcessing && styles.voiceButtonDisabled,
          ]}
        onPress={() => isRecording ? stopVoiceRecording(field) : startVoiceRecording(field)}
        disabled={isCurrentlyProcessing}
        >
        {isRecording ? (
          <StopCircle size={20} color={Colors.primary} />
          ) : (
          <Mic size={20} color={isProcessing ? Colors.textSecondary : Colors.primary} />
          )}
        <Text style={[styles.voiceButtonText, isRecording && styles.voiceButtonTextActive]}>
          {isRecording ? 'Stop' : 'Voice'}
        </Text>
        </TouchableOpacity>
    );
  };

  // Render SOAP field
  const renderSOAPField = (field: keyof SOAPData, label: string, placeholder: string) => (
    <View style={styles.fieldContainer}>
      <View style={styles.fieldHeader}>
        <Text style={styles.fieldLabel}>{label}</Text>
        {renderVoiceButton(field)}
          </View>

      {isVoiceRecording === field && (
        <View style={styles.recordingIndicator}>
          <ActivityIndicator size="small" color={Colors.danger} />
          <Text style={styles.recordingText}>Recording... Speak clearly</Text>
          </View>
      )}
      
      {isProcessing && isVoiceRecording === field && (
        <View style={styles.processingIndicator}>
          <ActivityIndicator size="small" color={Colors.background} />
          <Text style={styles.processingText}>Processing medical terminology...</Text>
              </View>
      )}

                <TextInput
        style={styles.textInput}
        value={soapData[field]}
        onChangeText={(text) => handleInputChange(field, text)}
        placeholder={placeholder}
        placeholderTextColor={Colors.textSecondary}
                  multiline
        numberOfLines={6}
        textAlignVertical="top"
                />
              </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SOAP Examination</Text>
        <Text style={styles.patientName}>{patientName}</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <X size={24} color={Colors.textSecondary} />
        </TouchableOpacity>
            </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Subjective */}
        {renderSOAPField('subjective', 'Subjective', 'Patient\'s chief complaint, history of present illness, review of systems...')}

        {/* Objective */}
        {renderSOAPField('objective', 'Objective', 'Vital signs, physical examination findings, diagnostic results...')}

        {/* Assessment */}
        {renderSOAPField('assessment', 'Assessment', 'Clinical impression, differential diagnosis, problem list...')}

        {/* Plan */}
        <View style={styles.fieldContainer}>
          <View style={styles.fieldHeader}>
            <Text style={styles.fieldLabel}>Plan</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity 
                  style={styles.addButton}
                  onPress={() => setShowAddMedication(true)}
                >
                <Plus size={20} color={Colors.primary} />
                  <Text style={styles.addButtonText}>Add Medication</Text>
                </TouchableOpacity>
              {renderVoiceButton('plan')}
            </View>
              </View>

          {isVoiceRecording === 'plan' && (
            <View style={styles.recordingIndicator}>
              <ActivityIndicator size="small" color={Colors.danger} />
              <Text style={styles.recordingText}>Recording... Speak clearly</Text>
            </View>
          )}

          <TextInput
            style={styles.textInput}
            value={soapData.plan}
            onChangeText={(text) => handleInputChange('plan', text)}
            placeholder="Treatment plan, medications, follow-up instructions, patient education..."
            placeholderTextColor={Colors.textSecondary}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        {/* Medical Results Display */}
        {medicalResult && medicalResult.success && (
          <View style={styles.medicalResultContainer}>
            <Text style={styles.medicalResultTitle}>Latest Medical Analysis</Text>
            <Text style={styles.medicalResultText}>
              📝 Original: "{medicalResult.originalText}"
                        </Text>
            {medicalResult.medicalSummary && (
              <Text style={styles.medicalResultText}>
                🏥 Medical Summary: {medicalResult.medicalSummary}
                        </Text>
            )}
            {medicalResult.medicalTerms && medicalResult.medicalTerms.length > 0 && (
              <View style={styles.medicalTermsSection}>
                <Text style={styles.medicalTermsTitle}>
                  Medical Terms ({medicalResult.medicalTerms.length})
                </Text>
                <View style={styles.medicalTermsList}>
                  {medicalResult.medicalTerms.slice(0, 10).map((term, index) => (
                    <View key={index} style={styles.medicalTerm}>
                      <Text style={styles.medicalTermText}>{term.term}</Text>
                    </View>
                  ))}
                </View>
              </View>
              )}
            </View>
        )}
      </ScrollView>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save SOAP Note</Text>
              </TouchableOpacity>

      {/* Medication Modal */}
          <Modal
            visible={showAddMedication}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowAddMedication(false)}
          >
        <SafeAreaView style={styles.modal}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Add Medication</Text>
                  <TouchableOpacity
                    style={styles.modalCloseButton}
                onPress={() => setShowAddMedication(false)}
                  >
                <X size={20} color={Colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search medications..."
                    placeholderTextColor={Colors.textSecondary}
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                searchMedications(text);
              }}
                  />

                  <FlatList
                    data={searchResults}
              style={styles.medicationList}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                  style={styles.medicationListItem}
                  onPress={() => selectMedication(item)}
                      >
                  <Text style={styles.medicationListName}>{item.name}</Text>
                  <Text style={styles.medicationListGeneric}>
                    {item.genericName} • {item.category}
                        </Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>
      </SafeAreaView>
    </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.card,
  },
  headerTitle: {
    ...Typography.h2,
    color: Colors.text,
    flex: 1,
  },
  patientName: {
    ...Typography.body,
    color: Colors.textSecondary,
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  fieldContainer: {
    marginBottom: 24,
  },
  fieldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  fieldLabel: {
    ...Typography.label,
    fontWeight: '600',
    color: Colors.text,
  },
  voiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  voiceButtonActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  voiceButtonDisabled: {
    opacity: 0.5,
    borderColor: Colors.border,
  },
  voiceButtonText: {
    ...Typography.caption,
    color: Colors.primary,
    marginLeft: 6,
  },
  voiceButtonTextActive: {
    color: Colors.primary,
  },
  textInput: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    lineHeight: 24,
    textAlignVertical: 'top',
    backgroundColor: Colors.card,
    color: Colors.text,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dangerLight,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  recordingText: {
    ...Typography.caption,
    color: Colors.danger,
    marginLeft: 8,
  },
  processingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warning,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  processingText: {
    ...Typography.caption,
    color: Colors.background,
    marginLeft: 8,
  },
  addButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  addButtonText: {
    ...Typography.caption,
    color: Colors.background,
    fontWeight: '600',
    marginLeft: 4,
  },
  medicalResultContainer: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  medicalResultTitle: {
    ...Typography.h5,
    color: Colors.primary,
    marginBottom: 8,
  },
  medicalResultText: {
    ...Typography.body,
    color: Colors.text,
    marginBottom: 8,
  },
  medicalTermsSection: {
    marginTop: 12,
  },
  medicalTermsTitle: {
    ...Typography.label,
    color: Colors.primary,
    marginBottom: 8,
  },
  medicalTermsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  medicalTerm: {
    backgroundColor: Colors.info,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 6,
  },
  medicalTermText: {
    ...Typography.caption,
    color: Colors.background,
    fontSize: 12,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
    marginHorizontal: 20,
  },
  saveButtonText: {
    ...Typography.body,
    color: Colors.background,
    fontWeight: '600',
  },
  modal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    ...Typography.h4,
    color: Colors.text,
  },
  modalCloseButton: {
    backgroundColor: Colors.border,
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: Colors.card,
    color: Colors.text,
  },
  medicationList: {
    maxHeight: 300,
  },
  medicationListItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  medicationListName: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: 4,
  },
  medicationListGeneric: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
});

export default SOAPExamination; 