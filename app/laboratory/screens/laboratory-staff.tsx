import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Mail, 
  User, 
  Phone, 
  Building, 
  Plus, 
  Search, 
  Filter,
  MessageSquare,
  Send,
  X,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import Header from '@/components/Header';
import Button from '@/components/Button';

interface LabStaff {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  role: 'technician' | 'supervisor' | 'manager';
  specialization: string;
  isAvailable: boolean;
}

interface LabEmail {
  id: string;
  to: string;
  subject: string;
  message: string;
  timestamp: string;
  status: 'draft' | 'sent' | 'read';
  priority: 'low' | 'medium' | 'high';
}

export default function LaboratoryStaffScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'staff' | 'emails' | 'communication'>('staff');
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<LabStaff | null>(null);

  // Mock laboratory staff data
  const labStaff: LabStaff[] = [
    {
      id: '1',
      name: 'Dr. Sarah Chen',
      email: 'sarah.chen@aurahospital.com',
      phone: '+1 (555) 123-4567',
      department: 'Clinical Laboratory',
      role: 'supervisor',
      specialization: 'Hematology & Immunology',
      isAvailable: true
    },
    {
      id: '2',
      name: 'Mike Rodriguez',
      email: 'mike.rodriguez@aurahospital.com',
      phone: '+1 (555) 234-5678',
      department: 'Clinical Laboratory',
      role: 'technician',
      specialization: 'Blood Chemistry',
      isAvailable: true
    },
    {
      id: '3',
      name: 'Dr. Emily Johnson',
      email: 'emily.johnson@aurahospital.com',
      phone: '+1 (555) 345-6789',
      department: 'Radiology',
      role: 'supervisor',
      specialization: 'MRI & CT Imaging',
      isAvailable: false
    },
    {
      id: '4',
      name: 'Alex Thompson',
      email: 'alex.thompson@aurahospital.com',
      phone: '+1 (555) 456-7890',
      department: 'Clinical Laboratory',
      role: 'technician',
      specialization: 'Microbiology',
      isAvailable: true
    },
    {
      id: '5',
      name: 'Dr. Robert Kim',
      email: 'robert.kim@aurahospital.com',
      phone: '+1 (555) 567-8901',
      department: 'Pathology',
      role: 'manager',
      specialization: 'Histopathology',
      isAvailable: true
    }
  ];

  const labEmails: LabEmail[] = [
    {
      id: '1',
      to: 'sarah.chen@aurahospital.com',
      subject: 'Urgent CBC Results - Patient ID 101',
      message: 'Please prioritize the CBC results for patient Sarah Johnson. Results needed by 2 PM today.',
      timestamp: '2024-01-16 09:30',
      status: 'sent',
      priority: 'high'
    },
    {
      id: '2',
      to: 'mike.rodriguez@aurahospital.com',
      subject: 'Lipid Panel Processing',
      message: 'Patient Mike Davis lipid panel is ready for processing. Standard protocol.',
      timestamp: '2024-01-16 08:15',
      status: 'read',
      priority: 'medium'
    }
  ];

  const filteredStaff = labStaff.filter(staff => 
    staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    staff.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    staff.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderStaffList = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Laboratory Staff</Text>
        <TouchableOpacity style={styles.addButton}>
          <Plus size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInput}>
          <Search size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchTextInput}
            placeholder="Search staff members..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.staffList}>
        {filteredStaff.map(staff => (
          <TouchableOpacity
            key={staff.id}
            style={styles.staffCard}
            onPress={() => {
              setSelectedStaff(staff);
              setShowEmailModal(true);
            }}
          >
            <View style={styles.staffCardHeader}>
              <View style={styles.staffInfo}>
                <Text style={styles.staffName}>{staff.name}</Text>
                <Text style={styles.staffRole}>{staff.role}</Text>
              </View>
              <View style={[
                styles.availabilityIndicator,
                staff.isAvailable ? styles.available : styles.unavailable
              ]}>
                <Text style={styles.availabilityText}>
                  {staff.isAvailable ? 'Available' : 'Busy'}
                </Text>
              </View>
            </View>

            <View style={styles.staffDetails}>
              <View style={styles.staffDetail}>
                <Mail size={16} color={Colors.textSecondary} />
                <Text style={styles.staffDetailText}>{staff.email}</Text>
              </View>
              <View style={styles.staffDetail}>
                <Phone size={16} color={Colors.textSecondary} />
                <Text style={styles.staffDetailText}>{staff.phone}</Text>
              </View>
              <View style={styles.staffDetail}>
                <Building size={16} color={Colors.textSecondary} />
                <Text style={styles.staffDetailText}>{staff.department}</Text>
              </View>
            </View>

            <Text style={styles.specialization}>Specialization: {staff.specialization}</Text>

            <View style={styles.staffActions}>
              <TouchableOpacity style={styles.actionButton}>
                <Mail size={16} color={Colors.primary} />
                <Text style={styles.actionText}>Email</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <MessageSquare size={16} color={Colors.primary} />
                <Text style={styles.actionText}>Message</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderEmailList = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Lab Communications</Text>
        <TouchableOpacity style={styles.addButton}>
          <Plus size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.emailList}>
        {labEmails.map(email => (
          <TouchableOpacity key={email.id} style={styles.emailCard}>
            <View style={styles.emailHeader}>
              <Text style={styles.emailTo}>{email.to}</Text>
              <View style={[
                styles.priorityBadge,
                email.priority === 'high' ? styles.priorityHigh :
                email.priority === 'medium' ? styles.priorityMedium :
                styles.priorityLow
              ]}>
                <Text style={styles.priorityText}>{email.priority}</Text>
              </View>
            </View>
            
            <Text style={styles.emailSubject}>{email.subject}</Text>
            <Text style={styles.emailMessage} numberOfLines={2}>{email.message}</Text>
            
            <View style={styles.emailFooter}>
              <Text style={styles.emailTimestamp}>{email.timestamp}</Text>
              <View style={[
                styles.statusBadge,
                email.status === 'sent' ? styles.statusSent :
                email.status === 'read' ? styles.statusRead :
                styles.statusDraft
              ]}>
                <Text style={styles.statusText}>{email.status}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderCommunication = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Quick Communication</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.communicationGrid}>
        <TouchableOpacity style={styles.communicationCard}>
          <Mail size={24} color={Colors.primary} />
          <Text style={styles.communicationTitle}>Send Email</Text>
          <Text style={styles.communicationDesc}>Compose new email to lab staff</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.communicationCard}>
          <MessageSquare size={24} color={Colors.primary} />
          <Text style={styles.communicationTitle}>Quick Message</Text>
          <Text style={styles.communicationDesc}>Send urgent message</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.communicationCard}>
          <AlertTriangle size={24} color={Colors.warning} />
          <Text style={styles.communicationTitle}>Emergency Contact</Text>
          <Text style={styles.communicationDesc}>Contact on-call staff</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.communicationCard}>
          <Clock size={24} color={Colors.primary} />
          <Text style={styles.communicationTitle}>Schedule Meeting</Text>
          <Text style={styles.communicationDesc}>Arrange lab meeting</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmailModal = () => (
    <Modal
      visible={showEmailModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Send Email</Text>
          <TouchableOpacity onPress={() => setShowEmailModal(false)}>
            <X size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {selectedStaff && (
          <ScrollView style={styles.modalContent}>
            <View style={styles.recipientInfo}>
              <Text style={styles.recipientName}>{selectedStaff.name}</Text>
              <Text style={styles.recipientEmail}>{selectedStaff.email}</Text>
              <Text style={styles.recipientRole}>{selectedStaff.role} • {selectedStaff.department}</Text>
            </View>

            <View style={styles.emailForm}>
              <Text style={styles.formLabel}>Subject</Text>
              <TextInput
                style={styles.subjectInput}
                placeholder="Enter email subject..."
              />

              <Text style={styles.formLabel}>Priority</Text>
              <View style={styles.priorityButtons}>
                {['low', 'medium', 'high'].map(priority => (
                  <TouchableOpacity key={priority} style={styles.priorityButton}>
                    <Text style={styles.priorityButtonText}>{priority.toUpperCase()}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.formLabel}>Message</Text>
              <TextInput
                style={styles.messageInput}
                placeholder="Type your message here..."
                multiline
                numberOfLines={8}
              />
            </View>
          </ScrollView>
        )}

        <View style={styles.modalFooter}>
          <Button
            title="Cancel"
            onPress={() => setShowEmailModal(false)}
            variant="outline"
            style={styles.modalButton}
          />
          <Button
            title="Send Email"
            onPress={() => {
              Alert.alert('Success', 'Email sent successfully');
              setShowEmailModal(false);
            }}
            style={styles.modalButton}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Laboratory Staff" />
      
      <View style={styles.tabContainer}>
        {[
          { key: 'staff', label: 'Staff', icon: User },
          { key: 'emails', label: 'Emails', icon: Mail },
          { key: 'communication', label: 'Quick Actions', icon: MessageSquare }
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
        {activeTab === 'staff' && renderStaffList()}
        {activeTab === 'emails' && renderEmailList()}
        {activeTab === 'communication' && renderCommunication()}
      </ScrollView>

      {renderEmailModal()}
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
  staffList: {
    gap: 12,
  },
  staffCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  staffCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  staffInfo: {
    flex: 1,
  },
  staffName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  staffRole: {
    fontSize: 14,
    color: Colors.textSecondary,
    textTransform: 'capitalize',
  },
  availabilityIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  available: {
    backgroundColor: '#E8F5E9',
  },
  unavailable: {
    backgroundColor: '#FFEBEE',
  },
  availabilityText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
  },
  staffDetails: {
    gap: 8,
    marginBottom: 12,
  },
  staffDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  staffDetailText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  specialization: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  staffActions: {
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
  actionText: {
    fontSize: 14,
    color: Colors.primary,
    marginLeft: 4,
    fontWeight: '500',
  },
  emailList: {
    gap: 12,
  },
  emailCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  emailTo: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityHigh: {
    backgroundColor: '#FFEBEE',
  },
  priorityMedium: {
    backgroundColor: '#FFF3E0',
  },
  priorityLow: {
    backgroundColor: '#E8F5E9',
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
  },
  emailSubject: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  emailMessage: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  emailFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emailTimestamp: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusSent: {
    backgroundColor: '#E3F2FD',
  },
  statusRead: {
    backgroundColor: '#E8F5E9',
  },
  statusDraft: {
    backgroundColor: '#FFF3E0',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
  },
  communicationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  communicationCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    width: '48%',
    alignItems: 'center',
  },
  communicationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  communicationDesc: {
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
  recipientInfo: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
  },
  recipientName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  recipientEmail: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  recipientRole: {
    fontSize: 14,
    color: Colors.textSecondary,
    textTransform: 'capitalize',
  },
  emailForm: {
    gap: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  subjectInput: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: 16,
    color: Colors.text,
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
  priorityButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  messageInput: {
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
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 