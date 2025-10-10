import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  Modal,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Phone, 
  User, 
  Heart, 
  MapPin,
  AlertTriangle,
  CheckCircle
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import Typography from '@/constants/typography';
import Header from '@/components/Header';
import Button from '@/components/Button';
import useEmergencyContactsStore, { EmergencyContact, EmergencyContactCreate } from '@/store/emergency-contacts-store';
import { useAuthStore } from '@/store/auth-store';

interface EmergencyContactsScreenProps {
  navigation?: any;
}

export default function EmergencyContactsScreen({ navigation }: EmergencyContactsScreenProps) {
  const { user } = useAuthStore();
  const {
    contacts,
    isLoading,
    error,
    fetchContacts,
    addContact,
    updateContact,
    deleteContact,
    clearError
  } = useEmergencyContactsStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    phone_number: '',
    is_primary: false
  });

  useEffect(() => {
    if (user?.id) {
      fetchContacts(user.id);
    }
  }, [user?.id]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [{ text: 'OK', onPress: clearError }]);
    }
  }, [error]);

  const handleAddContact = async () => {
    if (!user?.id) return;
    
    if (!formData.name || !formData.relationship || !formData.phone_number) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const contactData: EmergencyContactCreate = {
      patient_id: user.id,
      name: formData.name,
      relationship: formData.relationship,
      phone_number: formData.phone_number,
      is_primary: formData.is_primary
    };

    await addContact(contactData);
    setShowAddModal(false);
    resetForm();
  };

  const handleEditContact = async () => {
    if (!editingContact) return;

    await updateContact(editingContact.id, {
      name: formData.name,
      relationship: formData.relationship,
      phone_number: formData.phone_number,
      is_primary: formData.is_primary
    });

    setShowEditModal(false);
    setEditingContact(null);
    resetForm();
  };

  const handleDeleteContact = (contact: EmergencyContact) => {
    Alert.alert(
      'Delete Contact',
      `Are you sure you want to delete ${contact.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteContact(contact.id)
        }
      ]
    );
  };

  const resetForm = () => {
    setFormData({
      name: '',
      relationship: '',
      phone_number: '',
      is_primary: false
    });
  };

  const openEditModal = (contact: EmergencyContact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      relationship: contact.relationship,
      phone_number: contact.phone_number,
      is_primary: contact.is_primary
    });
    setShowEditModal(true);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const renderContactCard = (contact: EmergencyContact) => (
    <View key={contact.id} style={styles.contactCard}>
      <View style={styles.contactHeader}>
        <View style={styles.contactInfo}>
          <View style={styles.contactNameRow}>
            <User size={20} color={Colors.primary} />
            <Text style={styles.contactName}>{contact.name}</Text>
            {contact.is_primary && (
              <View style={styles.primaryBadge}>
                <Text style={styles.primaryText}>Primary</Text>
              </View>
            )}
          </View>
          <Text style={styles.relationship}>{contact.relationship}</Text>
          <View style={styles.phoneRow}>
            <Phone size={16} color={Colors.textSecondary} />
            <Text style={styles.phoneNumber}>{contact.phone_number}</Text>
          </View>
        </View>
        <View style={styles.contactActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => openEditModal(contact)}
          >
            <Edit size={20} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleDeleteContact(contact)}
          >
            <Trash2 size={20} color={Colors.danger} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderModal = (isEdit: boolean) => (
    <Modal
      visible={isEdit ? showEditModal : showAddModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <Header 
          title={isEdit ? 'Edit Contact' : 'Add Emergency Contact'}
          showBack={true}
          onBackPress={() => {
            if (isEdit) {
              setShowEditModal(false);
              setEditingContact(null);
            } else {
              setShowAddModal(false);
            }
            resetForm();
          }}
        />
        
        <ScrollView style={styles.modalContent}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
              placeholder="Enter contact name"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Relationship *</Text>
            <TextInput
              style={styles.input}
              value={formData.relationship}
              onChangeText={(text) => setFormData(prev => ({ ...prev, relationship: text }))}
              placeholder="e.g., Spouse, Parent, Friend"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Phone Number *</Text>
            <TextInput
              style={styles.input}
              value={formData.phone_number}
              onChangeText={(text) => setFormData(prev => ({ ...prev, phone_number: text }))}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
            />
          </View>

          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setFormData(prev => ({ ...prev, is_primary: !prev.is_primary }))}
          >
            <View style={[styles.checkbox, formData.is_primary && styles.checkboxChecked]}>
              {formData.is_primary && <CheckCircle size={16} color={Colors.background} />}
            </View>
            <Text style={styles.checkboxLabel}>Set as primary emergency contact</Text>
          </TouchableOpacity>

          <View style={styles.modalActions}>
            <Button
              title={isEdit ? 'Update Contact' : 'Add Contact'}
              onPress={isEdit ? handleEditContact : handleAddContact}
              loading={isLoading}
              style={styles.submitButton}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title="Emergency Contacts"
        showBack={true}
        rightComponent={
          <TouchableOpacity 
            style={styles.addButton}
            onPress={openAddModal}
          >
            <Plus size={24} color={Colors.background} />
          </TouchableOpacity>
        }
      />
      
      <ScrollView style={styles.content}>
        {contacts.length === 0 ? (
          <View style={styles.emptyState}>
            <Heart size={64} color={Colors.textLight} />
            <Text style={styles.emptyTitle}>No Emergency Contacts</Text>
            <Text style={styles.emptyDescription}>
              Add emergency contacts to quickly reach out for help when needed.
            </Text>
            <Button
              title="Add First Contact"
              onPress={openAddModal}
              style={styles.emptyButton}
            />
          </View>
        ) : (
          <>
            <View style={styles.infoCard}>
              <AlertTriangle size={20} color={Colors.warning} />
              <Text style={styles.infoText}>
                Emergency contacts will be notified via WhatsApp when you send an emergency alert.
              </Text>
            </View>
            
            {contacts.map(renderContactCard)}
          </>
        )}
      </ScrollView>

      {renderModal(false)}
      {renderModal(true)}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    ...Typography.h3,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    marginTop: 16,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  infoText: {
    ...Typography.body,
    color: Colors.text,
    marginLeft: 12,
    flex: 1,
  },
  contactCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  contactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  contactInfo: {
    flex: 1,
  },
  contactNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  contactName: {
    ...Typography.body,
    fontWeight: '600',
    marginLeft: 8,
  },
  primaryBadge: {
    backgroundColor: Colors.success,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  primaryText: {
    ...Typography.caption,
    color: Colors.background,
    fontWeight: '500',
  },
  relationship: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phoneNumber: {
    ...Typography.body,
    marginLeft: 8,
  },
  contactActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    ...Typography.body,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Typography.body,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.border,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkboxLabel: {
    ...Typography.body,
    flex: 1,
  },
  modalActions: {
    marginTop: 24,
  },
  submitButton: {
    marginBottom: 16,
  },
});
