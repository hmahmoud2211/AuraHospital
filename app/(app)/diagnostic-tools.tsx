import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, Modal, TextInput, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Search, 
  Plus, 
  FileText, 
  Download, 
  Bell, 
  Calendar, 
  User, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Upload,
  BarChart3,
  Settings,
  Filter,
  ChevronRight,
  ChevronDown,
  X,
  Printer,
  MessageSquare,
  Camera
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import Typography from '@/constants/typography';
import { useAuthStore } from '@/store/auth-store';
import Header from '@/components/Header';
import Button from '@/components/Button';

interface DiagnosticTest {
  id: string;
  name: string;
  category: string;
  description: string;
  preparation: string;
  duration: string;
  cost: number;
}

interface TestOrder {
  id: string;
  testId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  dateOrdered: string;
  priority: 'routine' | 'urgent' | 'stat';
  status: 'ordered' | 'in_process' | 'completed' | 'cancelled';
  notes: string;
  appointmentId?: string;
}

interface TestResult {
  id: string;
  orderId: string;
  testName: string;
  dateCompleted: string;
  results: any;
  summary: string;
  doctorComment?: string;
  attachments: string[];
  isAbnormal: boolean;
}

export default function DiagnosticToolsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'ordering' | 'history' | 'results' | 'analytics'>('ordering');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState<DiagnosticTest | null>(null);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null);

  // Mock data
  const testCategories = [
    { id: 'all', name: 'All Tests', icon: '🔬' },
    { id: 'bloodwork', name: 'Bloodwork', icon: '🩸' },
    { id: 'imaging', name: 'Imaging', icon: '📷' },
    { id: 'cardiology', name: 'Cardiology', icon: '❤️' },
    { id: 'neurology', name: 'Neurology', icon: '🧠' },
    { id: 'pathology', name: 'Pathology', icon: '🔬' },
  ];

  const diagnosticTests: DiagnosticTest[] = [
    {
      id: '1',
      name: 'Complete Blood Count (CBC)',
      category: 'bloodwork',
      description: 'Measures red blood cells, white blood cells, and platelets',
      preparation: 'Fasting required for 8 hours',
      duration: '15-30 minutes',
      cost: 45
    },
    {
      id: '2',
      name: 'MRI Brain',
      category: 'imaging',
      description: 'Magnetic resonance imaging of the brain',
      preparation: 'No metal objects, may require contrast',
      duration: '45-60 minutes',
      cost: 850
    },
    {
      id: '3',
      name: 'Chest X-Ray',
      category: 'imaging',
      description: 'X-ray examination of the chest',
      preparation: 'Remove jewelry and metal objects',
      duration: '10-15 minutes',
      cost: 120
    },
    {
      id: '4',
      name: 'Blood Glucose',
      category: 'bloodwork',
      description: 'Measures blood sugar levels',
      preparation: 'Fasting required for 8-12 hours',
      duration: '5-10 minutes',
      cost: 25
    },
    {
      id: '5',
      name: 'ECG/EKG',
      category: 'cardiology',
      description: 'Electrocardiogram to measure heart activity',
      preparation: 'No special preparation required',
      duration: '10-15 minutes',
      cost: 95
    },
    {
      id: '6',
      name: 'Lipid Panel',
      category: 'bloodwork',
      description: 'Measures cholesterol and triglycerides',
      preparation: 'Fasting required for 12 hours',
      duration: '15-30 minutes',
      cost: 35
    }
  ];

  const testOrders: TestOrder[] = [
    {
      id: '1',
      testId: '1',
      patientId: '101',
      patientName: 'Sarah Johnson',
      doctorId: '201',
      doctorName: 'Dr. Smith',
      dateOrdered: '2024-01-15',
      priority: 'routine',
      status: 'completed',
      notes: 'Patient has been experiencing fatigue',
      appointmentId: '301'
    },
    {
      id: '2',
      testId: '2',
      patientId: '102',
      patientName: 'Mike Davis',
      doctorId: '201',
      doctorName: 'Dr. Smith',
      dateOrdered: '2024-01-16',
      priority: 'urgent',
      status: 'in_process',
      notes: 'Suspected neurological issue',
      appointmentId: '302'
    }
  ];

  const testResults: TestResult[] = [
    {
      id: '1',
      orderId: '1',
      testName: 'Complete Blood Count (CBC)',
      dateCompleted: '2024-01-16',
      results: {
        hemoglobin: { value: 14.2, unit: 'g/dL', normal: '12-16', status: 'normal' },
        whiteBloodCells: { value: 11.5, unit: 'K/μL', normal: '4.5-11.0', status: 'high' },
        platelets: { value: 250, unit: 'K/μL', normal: '150-450', status: 'normal' }
      },
      summary: 'Slightly elevated white blood cell count, otherwise normal',
      doctorComment: 'Mild elevation in WBC may indicate recent infection. Monitor for symptoms.',
      attachments: ['cbc_report.pdf'],
      isAbnormal: true
    }
  ];

  const filteredTests = diagnosticTests.filter(test => {
    const matchesSearch = test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         test.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || test.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const renderTestOrderingPanel = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Test Ordering</Text>
        <TouchableOpacity style={styles.addButton}>
          <Plus size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInput}>
          <Search size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchTextInput}
            placeholder="Search diagnostic tests..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Category Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
        {testCategories.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryChip,
              selectedCategory === category.id && styles.categoryChipActive
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Text style={styles.categoryIcon}>{category.icon}</Text>
            <Text style={[
              styles.categoryText,
              selectedCategory === category.id && styles.categoryTextActive
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Test List */}
      <View style={styles.testList}>
        {filteredTests.map(test => (
          <TouchableOpacity
            key={test.id}
            style={styles.testCard}
            onPress={() => {
              setSelectedTest(test);
              setShowOrderModal(true);
            }}
          >
            <View style={styles.testCardHeader}>
              <Text style={styles.testName}>{test.name}</Text>
              <Text style={styles.testCost}>${test.cost}</Text>
            </View>
            <Text style={styles.testDescription}>{test.description}</Text>
            <View style={styles.testDetails}>
              <Text style={styles.testDetail}>⏱️ {test.duration}</Text>
              <Text style={styles.testDetail}>📋 {test.preparation}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderPatientHistory = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Diagnostic History</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.historyList}>
        {testOrders.map(order => {
          const test = diagnosticTests.find(t => t.id === order.testId);
          const result = testResults.find(r => r.orderId === order.id);
          
          return (
            <TouchableOpacity
              key={order.id}
              style={styles.historyCard}
              onPress={() => {
                if (result) {
                  setSelectedResult(result);
                  setShowResultsModal(true);
                }
              }}
            >
              <View style={styles.historyCardHeader}>
                <Text style={styles.historyTestName}>{test?.name}</Text>
                <View style={[
                  styles.statusBadge,
                  order.status === 'ordered' ? styles.statusOrdered :
                  order.status === 'in_process' ? styles.statusInProcess :
                  order.status === 'completed' ? styles.statusCompleted :
                  styles.statusCancelled
                ]}>
                  <Text style={styles.statusText}>{order.status}</Text>
                </View>
              </View>
              
              <View style={styles.historyCardDetails}>
                <View style={styles.historyDetail}>
                  <User size={16} color={Colors.textSecondary} />
                  <Text style={styles.historyDetailText}>{order.patientName}</Text>
                </View>
                <View style={styles.historyDetail}>
                  <Calendar size={16} color={Colors.textSecondary} />
                  <Text style={styles.historyDetailText}>{order.dateOrdered}</Text>
                </View>
                <View style={styles.historyDetail}>
                  <AlertTriangle size={16} color={Colors.textSecondary} />
                  <Text style={styles.historyDetailText}>{order.priority}</Text>
                </View>
              </View>

              {order.notes && (
                <Text style={styles.historyNotes}>{order.notes}</Text>
              )}

              {result && (
                <View style={styles.resultIndicator}>
                  <CheckCircle size={16} color={Colors.success} />
                  <Text style={styles.resultText}>Results Available</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderTestResultsViewer = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Test Results</Text>
        <TouchableOpacity style={styles.analyticsButton}>
          <BarChart3 size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.resultsList}>
        {testResults.map(result => (
          <TouchableOpacity
            key={result.id}
            style={[
              styles.resultCard,
              result.isAbnormal && styles.resultCardAbnormal
            ]}
            onPress={() => {
              setSelectedResult(result);
              setShowResultsModal(true);
            }}
          >
            <View style={styles.resultCardHeader}>
              <Text style={styles.resultTestName}>{result.testName}</Text>
              {result.isAbnormal && (
                <View style={styles.abnormalBadge}>
                  <AlertTriangle size={16} color={Colors.warning} />
                  <Text style={styles.abnormalText}>Abnormal</Text>
                </View>
              )}
            </View>
            
            <Text style={styles.resultDate}>{result.dateCompleted}</Text>
            <Text style={styles.resultSummary}>{result.summary}</Text>
            
            <View style={styles.resultActions}>
              <TouchableOpacity style={styles.resultAction}>
                <Eye size={16} color={Colors.primary} />
                <Text style={styles.resultActionText}>View Details</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.resultAction}>
                <Download size={16} color={Colors.primary} />
                <Text style={styles.resultActionText}>Download</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderAnalytics = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Diagnostic Analytics</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Settings size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.analyticsGrid}>
        <View style={styles.analyticsCard}>
          <Text style={styles.analyticsNumber}>156</Text>
          <Text style={styles.analyticsLabel}>Tests This Month</Text>
        </View>
        <View style={styles.analyticsCard}>
          <Text style={styles.analyticsNumber}>23</Text>
          <Text style={styles.analyticsLabel}>Abnormal Results</Text>
        </View>
        <View style={styles.analyticsCard}>
          <Text style={styles.analyticsNumber}>4.2</Text>
          <Text style={styles.analyticsLabel}>Avg. Turnaround (Days)</Text>
        </View>
        <View style={styles.analyticsCard}>
          <Text style={styles.analyticsNumber}>89%</Text>
          <Text style={styles.analyticsLabel}>Patient Satisfaction</Text>
        </View>
      </View>
    </View>
  );

  const renderOrderModal = () => (
    <Modal
      visible={showOrderModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Order Test</Text>
          <TouchableOpacity onPress={() => setShowOrderModal(false)}>
            <X size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {selectedTest && (
          <ScrollView style={styles.modalContent}>
            <View style={styles.testInfo}>
              <Text style={styles.modalTestName}>{selectedTest.name}</Text>
              <Text style={styles.modalTestDescription}>{selectedTest.description}</Text>
            </View>

            <View style={styles.orderForm}>
              <Text style={styles.formLabel}>Patient</Text>
              <TouchableOpacity style={styles.formInput}>
                <Text style={styles.formInputText}>Select Patient</Text>
                <ChevronRight size={20} color={Colors.textSecondary} />
              </TouchableOpacity>

              <Text style={styles.formLabel}>Priority</Text>
              <View style={styles.priorityButtons}>
                {['routine', 'urgent', 'stat'].map(priority => (
                  <TouchableOpacity key={priority} style={styles.priorityButton}>
                    <Text style={styles.priorityText}>{priority.toUpperCase()}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.formLabel}>Notes for Lab Technician</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="Add any special instructions..."
                multiline
                numberOfLines={4}
              />

              <Text style={styles.formLabel}>Link to Appointment</Text>
              <TouchableOpacity style={styles.formInput}>
                <Text style={styles.formInputText}>Select Appointment (Optional)</Text>
                <ChevronRight size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}

        <View style={styles.modalFooter}>
          <Button
            title="Cancel"
            onPress={() => setShowOrderModal(false)}
            variant="outline"
            style={styles.modalButton}
          />
          <Button
            title="Order Test"
            onPress={() => {
              Alert.alert('Success', 'Test order submitted successfully');
              setShowOrderModal(false);
            }}
            style={styles.modalButton}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );

  const renderResultsModal = () => (
    <Modal
      visible={showResultsModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Test Results</Text>
          <TouchableOpacity onPress={() => setShowResultsModal(false)}>
            <X size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {selectedResult && (
          <ScrollView style={styles.modalContent}>
            <View style={styles.resultInfo}>
              <Text style={styles.modalTestName}>{selectedResult.testName}</Text>
              <Text style={styles.resultDate}>{selectedResult.dateCompleted}</Text>
            </View>

            <View style={styles.resultsDetail}>
              <Text style={styles.resultsTitle}>Results Summary</Text>
              <Text style={styles.resultsSummary}>{selectedResult.summary}</Text>
              
              {selectedResult.doctorComment && (
                <View style={styles.doctorComment}>
                  <Text style={styles.commentLabel}>Doctor's Comment</Text>
                  <Text style={styles.commentText}>{selectedResult.doctorComment}</Text>
                </View>
              )}

              <View style={styles.resultsActions}>
                <TouchableOpacity style={styles.resultActionButton}>
                  <Download size={16} color={Colors.primary} />
                  <Text style={styles.actionButtonText}>Download PDF</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.resultActionButton}>
                  <Printer size={16} color={Colors.primary} />
                  <Text style={styles.actionButtonText}>Print</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.resultActionButton}>
                  <MessageSquare size={16} color={Colors.primary} />
                  <Text style={styles.actionButtonText}>Request Follow-up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        )}

        <View style={styles.modalFooter}>
          <Button
            title="Close"
            onPress={() => setShowResultsModal(false)}
            style={styles.modalButton}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Diagnostic Tools" />
      
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {[
          { key: 'ordering', label: 'Order Tests', icon: Plus },
          { key: 'history', label: 'History', icon: FileText },
          { key: 'results', label: 'Results', icon: CheckCircle },
          { key: 'analytics', label: 'Analytics', icon: BarChart3 }
        ].map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && styles.tabActive
            ]}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <tab.icon size={20} color={activeTab === tab.key ? Colors.primary : Colors.textSecondary} />
            <Text style={[
              styles.tabText,
              activeTab === tab.key && styles.tabTextActive
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'ordering' && renderTestOrderingPanel()}
        {activeTab === 'history' && renderPatientHistory()}
        {activeTab === 'results' && renderTestResultsViewer()}
        {activeTab === 'analytics' && renderAnalytics()}
      </ScrollView>

      {renderOrderModal()}
      {renderResultsModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: Colors.primaryLight,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginTop: 4,
  },
  tabTextActive: {
    color: Colors.primary,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchTextInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: Colors.text,
  },
  categoryScroll: {
    marginBottom: 16,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  categoryTextActive: {
    color: Colors.background,
  },
  testList: {
    gap: 12,
  },
  testCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  testCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  testName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  testCost: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  testDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  testDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  testDetail: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  historyList: {
    gap: 12,
  },
  historyCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  historyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyTestName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusOrdered: {
    backgroundColor: '#E3F2FD',
  },
  statusInProcess: {
    backgroundColor: '#FFF3E0',
  },
  statusCompleted: {
    backgroundColor: '#E8F5E9',
  },
  statusCancelled: {
    backgroundColor: '#FFEBEE',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
  },
  historyCardDetails: {
    gap: 8,
    marginBottom: 12,
  },
  historyDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyDetailText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  historyNotes: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  resultIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultText: {
    fontSize: 14,
    color: Colors.success,
    marginLeft: 8,
    fontWeight: '500',
  },
  resultsList: {
    gap: 12,
  },
  resultCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  resultCardAbnormal: {
    borderColor: Colors.warning,
    backgroundColor: '#FFF3E0',
  },
  resultCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultTestName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  abnormalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warning,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  abnormalText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.background,
    marginLeft: 4,
  },
  resultDate: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  resultSummary: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  resultActions: {
    flexDirection: 'row',
    gap: 16,
  },
  resultAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultActionText: {
    fontSize: 14,
    color: Colors.primary,
    marginLeft: 4,
    fontWeight: '500',
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  analyticsCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    width: '48%',
    alignItems: 'center',
  },
  analyticsNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  analyticsLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  testInfo: {
    marginBottom: 24,
  },
  modalTestName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  modalTestDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  orderForm: {
    gap: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  formInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  formInputText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  priorityButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  priorityButton: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  notesInput: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: 16,
    color: Colors.text,
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  modalButton: {
    flex: 1,
  },
  resultInfo: {
    marginBottom: 24,
  },
  resultsDetail: {
    gap: 16,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  resultsSummary: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  doctorComment: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    padding: 16,
  },
  commentLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  commentText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  resultsActions: {
    flexDirection: 'row',
    gap: 12,
  },
  resultActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionButtonText: {
    fontSize: 14,
    color: Colors.primary,
    marginLeft: 4,
    fontWeight: '500',
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  analyticsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
});