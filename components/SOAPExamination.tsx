import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  ScrollView,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Plus, Search, Trash, Mic, StopCircle } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Typography from '@/constants/typography';
import { searchMedications, Drug } from '@/data/drugsDatabase';
import { voiceRecordingService, VoiceRecordingResult } from '@/app/services/VoiceRecordingService';

export interface SOAPExaminationProps {
  patientId: string;
  patientName: string;
  onClose: () => void;
  onSave: (soapData: SOAPData, prescriptions: PrescriptionItem[]) => void;
}

export interface SOAPData {
  diagnosis: string;
  symptoms: string;
  allergies: string;
  treatmentPlan: string;
  additionalNotes: string;
}

export interface PrescriptionItem {
  id: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

const SOAPExamination: React.FC<SOAPExaminationProps> = ({
  patientId,
  patientName,
  onClose,
  onSave,
}) => {
  const [soapData, setSOAPData] = useState<SOAPData>({
    diagnosis: '',
    symptoms: '',
    allergies: '',
    treatmentPlan: '',
    additionalNotes: '',
  });

  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([]);
  const [showAddMedication, setShowAddMedication] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Drug[]>([]);
  const [isVoiceRecording, setIsVoiceRecording] = useState<string | null>(null);
  
  const [currentPrescription, setCurrentPrescription] = useState<PrescriptionItem>({
    id: `rx-${Date.now()}`,
    medicationName: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: '',
  });

  useEffect(() => {
    if (searchQuery.length > 1) {
      setSearchResults(searchMedications(searchQuery));
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleInputChange = (field: keyof SOAPData, value: string) => {
    setSOAPData(prev => ({ ...prev, [field]: value }));
  };

  const handlePrescriptionChange = (field: keyof PrescriptionItem, value: string) => {
    setCurrentPrescription(prev => ({ ...prev, [field]: value }));
  };

  const handleAddPrescription = () => {
    if (!currentPrescription.medicationName) {
      return;
    }
    
    setPrescriptions([...prescriptions, { ...currentPrescription, id: `rx-${Date.now()}` }]);
    setCurrentPrescription({
      id: `rx-${Date.now()}`,
      medicationName: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: '',
    });
    setShowAddMedication(false);
  };

  const handleRemovePrescription = (id: string) => {
    setPrescriptions(prescriptions.filter(p => p.id !== id));
  };

  const handleSelectMedication = (medication: Drug) => {
    setCurrentPrescription({
      ...currentPrescription,
      medicationName: medication.name,
      dosage: medication.dosageStrengths[0] || '',
      frequency: medication.commonDosages[0] || '',
      instructions: `Used for: ${medication.usedFor.join(', ')}`,
    });
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSave = () => {
    onSave(soapData, prescriptions);
  };

  const startVoiceRecording = async (field: keyof SOAPData) => {
    try {
      console.log('🎤 Starting voice recording for field:', field);
      
      // Check if we're on web and provide appropriate feedback
      if (Platform.OS === 'web') {
        console.log('🌐 Running on web platform');
      }
      
      setIsVoiceRecording(field);
      const success = await voiceRecordingService.startRecording();
      
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
                const sampleText = "Sample diagnosis text for testing";
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
        "🎤 Voice Recording Active", 
        `Recording started for ${field}.\n\n🔴 SPEAK CLEARLY AND LOUDLY\n📱 Hold phone close to your mouth\n⏱️ Speak for at least 2-3 seconds\n🗣️ Example: "Patient has a fever and cough"\n\nTap the microphone again to stop recording.`,
        [
          {
            text: "Cancel Recording",
            onPress: () => stopVoiceRecording(field, true),
            style: "cancel"
          }
        ]
      );
    } catch (error) {
      console.error('❌ Error starting voice recording:', error);
      Alert.alert(
        "Voice Recording Error", 
        `Failed to start voice recording: ${error}\n\nWould you like to test with sample text instead?`,
        [
          {
            text: "Add Sample Text",
            onPress: () => {
              const sampleText = "Sample text for testing";
              const currentText = soapData[field];
              const newText = currentText ? `${currentText} ${sampleText}` : sampleText;
              handleInputChange(field, newText);
              Alert.alert("Test Mode", `Sample text added to ${field}`);
            }
          },
          {
            text: "Cancel",
            style: "cancel"
          }
        ]
      );
      setIsVoiceRecording(null);
    }
  };

  const stopVoiceRecording = async (field: keyof SOAPData, cancelled: boolean = false) => {
    try {
      console.log('🛑 Stopping voice recording for field:', field, 'cancelled:', cancelled);
      
      // Show processing indicator
      if (!cancelled) {
        Alert.alert("🔄 Processing", "Processing your voice recording...\n\nPlease wait...");
      }
      
      let result: VoiceRecordingResult;
      
      if (cancelled) {
        console.log('🚫 Cancelling recording...');
        await voiceRecordingService.cancelRecording();
        result = { success: false, error: 'Recording cancelled' };
      } else {
        console.log('🔄 Processing recording...');
        result = await voiceRecordingService.stopRecording();
      }

      setIsVoiceRecording(null);

      console.log('📝 Transcription result:', result);

      if (result.success && result.text) {
        // Append the transcribed text to the existing field content
        const currentText = soapData[field];
        const newText = currentText ? `${currentText} ${result.text}` : result.text;
        console.log('✨ Adding transcribed text to field:', field, 'Text:', result.text);
        
        // Update the field
        handleInputChange(field, newText);
        
        // Show success message with the transcribed text
        Alert.alert(
          "✅ Voice Recording Complete!", 
          `Your speech has been successfully transcribed and added to ${field}:\n\n"${result.text}"\n\nThe text has been automatically added to the ${field} field.`,
          [
            {
              text: "Great!",
              style: "default"
            }
          ]
        );
      } else if (result.error && !cancelled) {
        console.error('❌ Recording failed:', result.error);
        
        // Special handling for "Thank you" transcription issue
        const isThankYouIssue = result.error.includes('Thank you');
        
        Alert.alert(
          isThankYouIssue ? "🔧 Microphone Issue Detected" : "Recording Failed", 
          isThankYouIssue 
            ? `The system keeps hearing "Thank you" instead of your speech. This usually means:\n\n🔇 Microphone too quiet/far away\n🎤 Browser audio issues\n🌐 Need better microphone setup\n\n${result.error}`
            : `${result.error}`,
          [
            ...(isThankYouIssue ? [{
              text: "🧪 Test Microphone",
              onPress: testMicrophone
            }] : []),
            {
              text: "🔄 Try Again",
              onPress: () => startVoiceRecording(field)
            },
            {
              text: "📝 Type Instead",
              onPress: () => {
                Alert.alert(
                  "Manual Input", 
                  `Please type your ${field} manually in the text field above.`,
                  [{ text: "OK" }]
                );
              }
            },
            {
              text: "Cancel",
              style: "cancel"
            }
          ]
        );
      } else if (cancelled) {
        console.log('✅ Recording cancelled by user');
        Alert.alert("Recording Cancelled", "Voice recording has been cancelled.");
      }
    } catch (error) {
      console.error('❌ Error stopping voice recording:', error);
      Alert.alert(
        "Processing Error", 
        `Failed to process voice recording: ${error}\n\nPlease try again.`,
        [
          {
            text: "Try Again",
            onPress: () => startVoiceRecording(field)
          },
          {
            text: "Cancel",
            style: "cancel"
          }
        ]
      );
      setIsVoiceRecording(null);
    }
  };

  const testTextInput = (field: keyof SOAPData) => {
    const testTexts = {
      diagnosis: "Acute upper respiratory infection with mild fever",
      symptoms: "Cough, sore throat, nasal congestion, low-grade fever",
      allergies: "No known allergies",
      treatmentPlan: "Rest, fluids, over-the-counter pain relievers as needed",
      additionalNotes: "Follow up in 1 week if symptoms persist"
    };
    
    const currentText = soapData[field];
    const testText = testTexts[field];
    const newText = currentText ? `${currentText} ${testText}` : testText;
    
    handleInputChange(field, newText);
    console.log('✅ Test text added to field:', field);
    Alert.alert("Test Successful", `Test text has been added to the ${field} field!`);
  };

  const testMicrophone = async () => {
    Alert.alert(
      "🎤 Microphone Test", 
      "Testing your microphone...",
      [{ text: "OK" }]
    );
    
    try {
      const success = await voiceRecordingService.testMicrophone();
      if (success) {
        Alert.alert(
          "✅ Microphone Test Successful!", 
          "Your microphone is working properly. If you're still getting 'Thank you', try:\n\n• Speaking LOUDER and more clearly\n• Getting closer to your microphone\n• Using headphones with a microphone\n• Testing in a quieter environment",
          [{ text: "Got it!" }]
        );
      } else {
        Alert.alert(
          "❌ Microphone Test Failed", 
          "There's an issue with your microphone. Please:\n\n• Check browser permissions\n• Allow microphone access\n• Try refreshing the page\n• Use a different browser",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      Alert.alert(
        "❌ Test Error", 
        `Microphone test failed: ${error}`,
        [{ text: "OK" }]
      );
    }
  };

  const renderVoiceButton = (field: keyof SOAPData) => {
    const isRecordingThisField = isVoiceRecording === field;
    
    return (
      <View style={styles.voiceButtonContainer}>
        <TouchableOpacity 
          style={[
            styles.voiceButton,
            isRecordingThisField && styles.voiceButtonRecording
          ]}
          onPress={() => {
            if (isRecordingThisField) {
              stopVoiceRecording(field);
            } else if (!isVoiceRecording) {
              startVoiceRecording(field);
            }
          }}
          disabled={isVoiceRecording !== null && !isRecordingThisField}
        >
          {isRecordingThisField ? (
            <StopCircle 
              size={20} 
              color={Colors.danger}
            />
          ) : (
            <Mic 
              size={20} 
              color={isVoiceRecording ? Colors.textSecondary : Colors.primary} 
            />
          )}
        </TouchableOpacity>
        
        {/* Add helper buttons for debugging and testing */}
        <TouchableOpacity 
          style={styles.testButton}
          onPress={() => testTextInput(field)}
          onLongPress={() => {
            Alert.alert(
              "Test Options", 
              "• Tap: Add sample text\n• Long press + Hold: Test microphone",
              [
                { text: "Test Microphone", onPress: testMicrophone },
                { text: "Add Sample Text", onPress: () => testTextInput(field) },
                { text: "Cancel", style: "cancel" }
              ]
            );
          }}
        >
          <Text style={styles.testButtonText}>T</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Modal
      visible={true}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>SOAP Examination</Text>
            <View style={styles.headerButtons}>
              <TouchableOpacity onPress={testMicrophone} style={styles.micTestButton}>
                <Mic size={16} color={Colors.primary} />
                <Text style={styles.micTestText}>Test Mic</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.patientInfo}>
            <Text style={styles.patientName}>{patientName}</Text>
            <Text style={styles.patientId}>ID: {patientId}</Text>
          </View>

          <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Diagnosis</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter diagnosis"
                  value={soapData.diagnosis}
                  onChangeText={(text) => handleInputChange('diagnosis', text)}
                  multiline
                />
                {renderVoiceButton('diagnosis')}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Symptoms</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter symptoms"
                  value={soapData.symptoms}
                  onChangeText={(text) => handleInputChange('symptoms', text)}
                  multiline
                />
                {renderVoiceButton('symptoms')}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Allergies</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter allergies"
                  value={soapData.allergies}
                  onChangeText={(text) => handleInputChange('allergies', text)}
                  multiline
                />
                {renderVoiceButton('allergies')}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Treatment Plan</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter treatment plan"
                  value={soapData.treatmentPlan}
                  onChangeText={(text) => handleInputChange('treatmentPlan', text)}
                  multiline
                />
                {renderVoiceButton('treatmentPlan')}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Additional Notes</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter additional notes"
                  value={soapData.additionalNotes}
                  onChangeText={(text) => handleInputChange('additionalNotes', text)}
                  multiline
                />
                {renderVoiceButton('additionalNotes')}
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.prescriptionHeader}>
                <Text style={styles.sectionTitle}>Prescriptions</Text>
                <TouchableOpacity 
                  style={styles.addButton}
                  onPress={() => setShowAddMedication(true)}
                >
                  <Plus size={20} color={Colors.background} />
                  <Text style={styles.addButtonText}>Add Medication</Text>
                </TouchableOpacity>
              </View>

              {prescriptions.length > 0 ? (
                <View style={styles.prescriptionList}>
                  {prescriptions.map((prescription) => (
                    <View key={prescription.id} style={styles.prescriptionItem}>
                      <View style={styles.prescriptionContent}>
                        <Text style={styles.prescriptionName}>{prescription.medicationName}</Text>
                        <Text style={styles.prescriptionDetails}>
                          {prescription.dosage}, {prescription.frequency}, {prescription.duration}
                        </Text>
                        <Text style={styles.prescriptionInstructions}>
                          {prescription.instructions}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => handleRemovePrescription(prescription.id)}
                      >
                        <Trash size={20} color={Colors.danger} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.emptyText}>No medications added</Text>
              )}
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.saveButton]}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Add Medication Modal */}
          <Modal
            visible={showAddMedication}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowAddMedication(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Add Medication</Text>
                  <TouchableOpacity
                    onPress={() => setShowAddMedication(false)}
                    style={styles.modalCloseButton}
                  >
                    <X size={24} color={Colors.text} />
                  </TouchableOpacity>
                </View>

                <View style={styles.searchContainer}>
                  <Search size={20} color={Colors.textSecondary} style={styles.searchIcon} />
                  <TextInput
                    style={styles.searchInput}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search medications..."
                    placeholderTextColor={Colors.textSecondary}
                  />
                </View>

                {searchResults.length > 0 && (
                  <FlatList
                    data={searchResults}
                    keyExtractor={(item) => item.id}
                    style={styles.searchResults}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.searchResultItem}
                        onPress={() => handleSelectMedication(item)}
                      >
                        <Text style={styles.searchResultName}>{item.name}</Text>
                        <Text style={styles.searchResultDetails}>
                          {item.genericName} - {item.category}
                        </Text>
                      </TouchableOpacity>
                    )}
                  />
                )}

                <TextInput
                  style={styles.modalInput}
                  placeholder="Medication Name"
                  value={currentPrescription.medicationName}
                  onChangeText={(text) => handlePrescriptionChange('medicationName', text)}
                />

                <TextInput
                  style={styles.modalInput}
                  placeholder="Dosage (e.g., 10mg)"
                  value={currentPrescription.dosage}
                  onChangeText={(text) => handlePrescriptionChange('dosage', text)}
                />

                <TextInput
                  style={styles.modalInput}
                  placeholder="Frequency (e.g., Once daily)"
                  value={currentPrescription.frequency}
                  onChangeText={(text) => handlePrescriptionChange('frequency', text)}
                />

                <TextInput
                  style={styles.modalInput}
                  placeholder="Duration (e.g., 7 days)"
                  value={currentPrescription.duration}
                  onChangeText={(text) => handlePrescriptionChange('duration', text)}
                />

                <TextInput
                  style={[styles.modalInput, styles.instructionsInput]}
                  placeholder="Instructions"
                  value={currentPrescription.instructions}
                  onChangeText={(text) => handlePrescriptionChange('instructions', text)}
                  multiline
                />

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelModalButton]}
                    onPress={() => setShowAddMedication(false)}
                  >
                    <Text style={styles.cancelModalButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.addModalButton]}
                    onPress={handleAddPrescription}
                  >
                    <Text style={styles.addModalButtonText}>Add</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    ...Typography.h3,
    color: Colors.text,
  },
  closeButton: {
    padding: 8,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  micTestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  micTestText: {
    ...Typography.caption,
    color: Colors.primary,
    marginLeft: 4,
    fontWeight: '500',
  },
  patientInfo: {
    padding: 16,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  patientName: {
    ...Typography.h4,
    color: Colors.text,
    marginBottom: 4,
  },
  patientId: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    ...Typography.h5,
    color: Colors.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    backgroundColor: Colors.card,
  },
  input: {
    ...Typography.body,
    flex: 1,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  voiceButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voiceButton: {
    padding: 12,
    alignSelf: 'flex-start',
  },
  voiceButtonRecording: {
    backgroundColor: Colors.card,
    borderRadius: 6,
  },
  testButton: {
    padding: 4,
    alignSelf: 'flex-start',
  },
  testButtonText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  prescriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addButtonText: {
    ...Typography.caption,
    color: Colors.background,
    fontWeight: '600',
    marginLeft: 4,
  },
  prescriptionList: {
    marginTop: 8,
  },
  prescriptionItem: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  prescriptionContent: {
    flex: 1,
  },
  prescriptionName: {
    ...Typography.body,
    fontWeight: '600',
    marginBottom: 4,
  },
  prescriptionDetails: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  prescriptionInstructions: {
    ...Typography.caption,
  },
  removeButton: {
    padding: 4,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    padding: 16,
    backgroundColor: Colors.card,
    borderRadius: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.card,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    marginLeft: 8,
  },
  cancelButtonText: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
  },
  saveButtonText: {
    ...Typography.body,
    color: Colors.background,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    ...Typography.h4,
  },
  modalCloseButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    ...Typography.body,
    flex: 1,
    paddingVertical: 12,
    color: Colors.text,
  },
  searchResults: {
    maxHeight: 350,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
  },
  searchResultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchResultName: {
    ...Typography.body,
    fontWeight: '500',
  },
  searchResultDetails: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  modalInput: {
    ...Typography.body,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: Colors.card,
  },
  instructionsInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelModalButton: {
    backgroundColor: Colors.card,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  addModalButton: {
    backgroundColor: Colors.primary,
    marginLeft: 8,
  },
  cancelModalButtonText: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
  },
  addModalButtonText: {
    ...Typography.body,
    color: Colors.background,
    fontWeight: '600',
  },
});

export default SOAPExamination; 