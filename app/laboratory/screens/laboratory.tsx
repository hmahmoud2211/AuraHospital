import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Search, Plus, FileText, Upload, Bell, Calendar, User, AlertTriangle,
  CheckCircle, Clock, Eye, BarChart3, Settings, Filter, ChevronRight,
  X, Printer, MessageSquare, Camera, Download, Flag, TrendingUp,
  Activity, FileImage, File, Users, Zap
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAuthStore } from '@/store/auth-store';
import Header from '@/components/Header';
import Button from '@/components/Button';

interface TestOrder {
  id: string;
  patientName: string;
  patientId: string;
  doctorName: string;
  testName: string;
  testCategory: string;
  priority: 'routine' | 'urgent' | 'stat';
  timeOrdered: string;
  status: 'pending' | 'in_progress' | 'completed';
  sampleType: string;
  notes?: string;
}

export default function LaboratoryScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'upload' | 'catalog' | 'analytics'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<TestOrder | null>(null);

  // Mock data
  const testOrders: TestOrder[] = [
    {
      id: '1',
      patientName: 'Sarah Johnson',
      patientId: 'P101',
      doctorName: 'Dr. Smith',
      testName: 'Complete Blood Count (CBC)',
      testCategory: 'Hematology',
      priority: 'urgent',
      timeOrdered: '2024-01-16 09:30',
      status: 'in_progress',
      sampleType: 'Blood',
      notes: 'Patient has been experiencing fatigue'
    },
    {
      id: '2',
      patientName: 'Mike Davis',
      patientId: 'P102',
      doctorName: 'Dr. Johnson',
      testName: 'Lipid Panel',
      testCategory: 'Biochemistry',
      priority: 'routine',
      timeOrdered: '2024-01-16 08:15',
      status: 'pending',
      sampleType: 'Blood'
    },
    {
      id: '3',
      patientName: 'Emily Wilson',
      patientId: 'P103',
      doctorName: 'Dr. Brown',
      testName: 'Urinalysis',
      testCategory: 'Microbiology',
      priority: 'stat',
      timeOrdered: '2024-01-16 10:45',
      status: 'completed',
      sampleType: 'Urine'
    }
  ];

  const dashboardStats = {
    pendingTests: testOrders.filter(o => o.status === 'pending').length,
    inProgressTests: testOrders.filter(o => o.status === 'in_progress').length,
    completedTests: testOrders.filter(o => o.status === 'completed').length,
    criticalResults: 2,
    dailyVolume: testOrders.length,
    avgTurnaround: '4.2 hours'
  };

  const filteredOrders = testOrders.filter(order => {
    const matchesSearch = order.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.testName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || order.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const renderDashboard = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Lab Dashboard</Text>
        <TouchableOpacity style={styles.refreshButton}>
          <Activity size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <Clock size={24} color={Colors.warning} />
            <Text style={styles.statNumber}>{dashboardStats.pendingTests}</Text>
          </View>
          <Text style={styles.statLabel}>Pending Tests</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <Activity size={24} color={Colors.primary} />
            <Text style={styles.statNumber}>{dashboardStats.inProgressTests}</Text>
          </View>
          <Text style={styles.statLabel}>In Progress</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <CheckCircle size={24} color={Colors.success} />
            <Text style={styles.statNumber}>{dashboardStats.completedTests}</Text>
          </View>
          <Text style={styles.statLabel}>Completed</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <AlertTriangle size={24} color={Colors.danger} />
            <Text style={styles.statNumber}>{dashboardStats.criticalResults}</Text>
          </View>
          <Text style={styles.statLabel}>Critical Results</Text>
        </View>
      </View>

      <View style={styles.metricsSection}>
        <Text style={styles.metricsTitle}>Today's Performance</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{dashboardStats.dailyVolume}</Text>
            <Text style={styles.metricLabel}>Tests Ordered</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{dashboardStats.avgTurnaround}</Text>
            <Text style={styles.metricLabel}>Avg Turnaround</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderTestOrders = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Test Orders</Text>
        <TouchableOpacity style={styles.addButton}>
          <Plus size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInput}>
          <Search size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchTextInput}
            placeholder="Search orders..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        {[
          { key: 'all', label: 'All', count: testOrders.length },
          { key: 'pending', label: 'Pending', count: testOrders.filter(o => o.status === 'pending').length },
          { key: 'in_progress', label: 'In Progress', count: testOrders.filter(o => o.status === 'in_progress').length },
          { key: 'completed', label: 'Completed', count: testOrders.filter(o => o.status === 'completed').length }
        ].map(filter => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterChip,
              selectedFilter === filter.key && styles.filterChipActive
            ]}
            onPress={() => setSelectedFilter(filter.key)}
          >
            <Text style={[
              styles.filterText,
              selectedFilter === filter.key && styles.filterTextActive
            ]}>
              {filter.label} ({filter.count})
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.ordersList}>
        {filteredOrders.map(order => (
          <TouchableOpacity
            key={order.id}
            style={styles.orderCard}
            onPress={() => {
              setSelectedOrder(order);
              setShowUploadModal(true);
            }}
          >
            <View style={styles.orderCardHeader}>
              <View style={styles.orderInfoContainer}>
                <Text style={styles.orderPatient}>{order.patientName}</Text>
                <Text style={styles.orderId}>ID: {order.patientId}</Text>
              </View>
              <View style={[
                styles.priorityBadge,
                order.priority === 'stat' ? styles.priorityStat :
                order.priority === 'urgent' ? styles.priorityUrgent :
                styles.priorityRoutine
              ]}>
                <Text style={styles.priorityText}>{order.priority.toUpperCase()}</Text>
              </View>
            </View>

            <Text style={styles.orderTest}>{order.testName}</Text>
            <Text style={styles.orderCategory}>{order.testCategory}</Text>

            <View style={styles.orderDetails}>
              <View style={styles.orderDetail}>
                <User size={16} color={Colors.textSecondary} />
                <Text style={styles.orderDetailText}>{order.doctorName}</Text>
              </View>
              <View style={styles.orderDetail}>
                <Calendar size={16} color={Colors.textSecondary} />
                <Text style={styles.orderDetailText}>{order.timeOrdered}</Text>
              </View>
              <View style={styles.orderDetail}>
                <FileText size={16} color={Colors.textSecondary} />
                <Text style={styles.orderDetailText}>{order.sampleType}</Text>
              </View>
            </View>

            <View style={styles.orderActions}>
              <TouchableOpacity style={[
                styles.actionButton,
                order.status === 'pending' && styles.actionButtonPrimary
              ]}>
                <Text style={styles.actionButtonText}>
                  {order.status === 'pending' ? 'Start Test' : 
                   order.status === 'in_progress' ? 'Continue' : 'View Result'}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderUploadPanel = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Result Upload</Text>
        <TouchableOpacity style={styles.templateButton}>
          <FileText size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.uploadGrid}>
        <TouchableOpacity style={styles.uploadCard}>
          <Upload size={24} color={Colors.primary} />
          <Text style={styles.uploadTitle}>Upload Results</Text>
          <Text style={styles.uploadDesc}>Submit test results and reports</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.uploadCard}>
          <FileImage size={24} color={Colors.primary} />
          <Text style={styles.uploadTitle}>Upload Images</Text>
          <Text style={styles.uploadDesc}>Add scan or microscopy images</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.uploadCard}>
          <File size={24} color={Colors.primary} />
          <Text style={styles.uploadTitle}>Upload Reports</Text>
          <Text style={styles.uploadDesc}>Attach PDF or Word documents</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.uploadCard}>
          <Flag size={24} color={Colors.warning} />
          <Text style={styles.uploadTitle}>Flag Critical</Text>
          <Text style={styles.uploadDesc}>Mark results as critical</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTestCatalog = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Test Catalog</Text>
        <TouchableOpacity style={styles.addButton}>
          <Plus size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.catalogList}>
        {[
          { code: 'CBC', name: 'Complete Blood Count', category: 'Hematology', sample: 'Blood' },
          { code: 'LIPID', name: 'Lipid Panel', category: 'Biochemistry', sample: 'Blood' },
          { code: 'URINAL', name: 'Urinalysis', category: 'Microbiology', sample: 'Urine' }
        ].map(test => (
          <View key={test.code} style={styles.catalogCard}>
            <View style={styles.catalogCardHeader}>
              <Text style={styles.testCode}>{test.code}</Text>
              <Text style={styles.testCategory}>{test.category}</Text>
            </View>
            <Text style={styles.testName}>{test.name}</Text>
            <Text style={styles.testSample}>Sample: {test.sample}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderAnalytics = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Lab Analytics</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Settings size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.analyticsGrid}>
        <View style={styles.analyticsCard}>
          <TrendingUp size={24} color={Colors.primary} />
          <Text style={styles.analyticsNumber}>156</Text>
          <Text style={styles.analyticsLabel}>Tests This Week</Text>
        </View>
        <View style={styles.analyticsCard}>
          <Clock size={24} color={Colors.warning} />
          <Text style={styles.analyticsNumber}>4.2h</Text>
          <Text style={styles.analyticsLabel}>Avg Turnaround</Text>
        </View>
        <View style={styles.analyticsCard}>
          <CheckCircle size={24} color={Colors.success} />
          <Text style={styles.analyticsNumber}>98%</Text>
          <Text style={styles.analyticsLabel}>Completion Rate</Text>
        </View>
        <View style={styles.analyticsCard}>
          <AlertTriangle size={24} color={Colors.danger} />
          <Text style={styles.analyticsNumber}>3</Text>
          <Text style={styles.analyticsLabel}>Critical Results</Text>
        </View>
      </View>
    </View>
  );

  const renderUploadModal = () => (
    <Modal
      visible={showUploadModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Upload Results</Text>
          <TouchableOpacity onPress={() => setShowUploadModal(false)}>
            <X size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {selectedOrder && (
          <ScrollView style={styles.modalContent}>
            <View style={styles.orderInfo}>
              <Text style={styles.modalOrderTitle}>{selectedOrder.testName}</Text>
              <Text style={styles.modalOrderPatient}>{selectedOrder.patientName}</Text>
              <Text style={styles.modalOrderId}>Patient ID: {selectedOrder.patientId}</Text>
            </View>

            <View style={styles.uploadForm}>
              <Text style={styles.formLabel}>Test Results</Text>
              <TextInput
                style={styles.resultsInput}
                placeholder="Enter test results..."
                multiline
                numberOfLines={6}
              />

              <Text style={styles.formLabel}>Technician Notes</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="Add any observations or notes..."
                multiline
                numberOfLines={4}
              />

              <View style={styles.attachmentButtons}>
                <TouchableOpacity style={styles.attachmentButton}>
                  <FileImage size={16} color={Colors.primary} />
                  <Text style={styles.attachmentText}>Add Images</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.attachmentButton}>
                  <File size={16} color={Colors.primary} />
                  <Text style={styles.attachmentText}>Add Files</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.criticalCheckbox}>
                <AlertTriangle size={16} color={Colors.warning} />
                <Text style={styles.criticalText}>Mark as Critical Result</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}

        <View style={styles.modalFooter}>
          <Button
            title="Cancel"
            onPress={() => setShowUploadModal(false)}
            variant="outline"
            style={styles.modalButton}
          />
          <Button
            title="Upload Results"
            onPress={() => {
              Alert.alert('Success', 'Results uploaded successfully');
              setShowUploadModal(false);
            }}
            style={styles.modalButton}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Laboratory" />
      
      <View style={styles.tabContainer}>
        {[
          { key: 'dashboard', label: 'Dashboard', icon: BarChart3 },
          { key: 'orders', label: 'Orders', icon: FileText },
          { key: 'upload', label: 'Upload', icon: Upload },
          { key: 'catalog', label: 'Catalog', icon: File },
          { key: 'analytics', label: 'Analytics', icon: TrendingUp }
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
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'orders' && renderTestOrders()}
        {activeTab === 'upload' && renderUploadPanel()}
        {activeTab === 'catalog' && renderTestCatalog()}
        {activeTab === 'analytics' && renderAnalytics()}
      </ScrollView>

      {renderUploadModal()}
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
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    width: '48%',
    alignItems: 'center',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginLeft: 8,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  metricsSection: {
    marginBottom: 24,
  },
  metricsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  metricItem: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
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
  filterScroll: {
    marginBottom: 16,
  },
  filterChip: {
    backgroundColor: Colors.card,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  filterTextActive: {
    color: Colors.background,
  },
  ordersList: {
    gap: 12,
  },
  orderCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderInfoContainer: {
    flex: 1,
  },
  orderPatient: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  orderId: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityStat: {
    backgroundColor: '#FFEBEE',
  },
  priorityUrgent: {
    backgroundColor: '#FFF3E0',
  },
  priorityRoutine: {
    backgroundColor: '#E8F5E9',
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
  },
  orderTest: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  orderCategory: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  orderDetails: {
    gap: 8,
    marginBottom: 12,
  },
  orderDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderDetailText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  orderActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionButtonPrimary: {
    backgroundColor: Colors.primary,
  },
  actionButtonText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  uploadGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  uploadCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    width: '48%',
    alignItems: 'center',
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  uploadDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  catalogList: {
    gap: 12,
  },
  catalogCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  catalogCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  testCode: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  testCategory: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  testName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  testSample: {
    fontSize: 12,
    color: Colors.textSecondary,
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
    marginTop: 8,
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
  orderInfo: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
  },
  modalOrderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  modalOrderPatient: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  modalOrderId: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  uploadForm: {
    gap: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  resultsInput: {
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
  attachmentButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  attachmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  attachmentText: {
    fontSize: 14,
    color: Colors.primary,
    marginLeft: 4,
    fontWeight: '500',
  },
  criticalCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  criticalText: {
    fontSize: 14,
    color: Colors.warning,
    marginLeft: 8,
    fontWeight: '500',
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
  templateButton: {
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