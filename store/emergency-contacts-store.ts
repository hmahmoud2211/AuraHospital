import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@/constants/config';

export interface EmergencyContact {
  id: number;
  patient_id: number;
  name: string;
  relationship: string;
  phone_number: string;
  is_primary: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmergencyAlert {
  id: number;
  patient_id: number;
  emergency_contact_id: number;
  alert_type: string;
  latitude?: number;
  longitude?: number;
  location_address?: string;
  message_sent: string;
  whatsapp_url: string;
  status: string;
  response_received: boolean;
  response_message?: string;
  created_at: string;
}

export interface EmergencyContactCreate {
  patient_id: number;
  name: string;
  relationship: string;
  phone_number: string;
  is_primary?: boolean;
}

export interface EmergencyContactUpdate {
  name?: string;
  relationship?: string;
  phone_number?: string;
  is_primary?: boolean;
  is_active?: boolean;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
}

interface EmergencyContactsState {
  contacts: EmergencyContact[];
  alerts: EmergencyAlert[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchContacts: (patientId: number) => Promise<void>;
  addContact: (contact: EmergencyContactCreate) => Promise<void>;
  updateContact: (contactId: number, updates: EmergencyContactUpdate) => Promise<void>;
  deleteContact: (contactId: number) => Promise<void>;
  fetchAlerts: (patientId: number) => Promise<void>;
  sendEmergencyAlert: (patientId: number, contactId: number, location?: LocationData) => Promise<void>;
  clearError: () => void;
}

const useEmergencyContactsStore = create<EmergencyContactsState>()(
  persist(
    (set, get) => ({
      contacts: [],
      alerts: [],
      isLoading: false,
      error: null,

      fetchContacts: async (patientId: number) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_URL}/patients/${patientId}/emergency-contacts`);
          if (!response.ok) {
            throw new Error('Failed to fetch emergency contacts');
          }
          const contacts = await response.json();
          set({ contacts, isLoading: false });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Unknown error', isLoading: false });
        }
      },

      addContact: async (contact: EmergencyContactCreate) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_URL}/patients/${contact.patient_id}/emergency-contacts`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(contact),
          });
          
          if (!response.ok) {
            throw new Error('Failed to add emergency contact');
          }
          
          const newContact = await response.json();
          set(state => ({
            contacts: [...state.contacts, newContact],
            isLoading: false
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Unknown error', isLoading: false });
        }
      },

      updateContact: async (contactId: number, updates: EmergencyContactUpdate) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_URL}/emergency-contacts/${contactId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updates),
          });
          
          if (!response.ok) {
            throw new Error('Failed to update emergency contact');
          }
          
          const updatedContact = await response.json();
          set(state => ({
            contacts: state.contacts.map(contact => 
              contact.id === contactId ? updatedContact : contact
            ),
            isLoading: false
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Unknown error', isLoading: false });
        }
      },

      deleteContact: async (contactId: number) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_URL}/emergency-contacts/${contactId}`, {
            method: 'DELETE',
          });
          
          if (!response.ok) {
            throw new Error('Failed to delete emergency contact');
          }
          
          set(state => ({
            contacts: state.contacts.filter(contact => contact.id !== contactId),
            isLoading: false
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Unknown error', isLoading: false });
        }
      },

      fetchAlerts: async (patientId: number) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_URL}/patients/${patientId}/emergency-alerts`);
          if (!response.ok) {
            throw new Error('Failed to fetch emergency alerts');
          }
          const alerts = await response.json();
          set({ alerts, isLoading: false });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Unknown error', isLoading: false });
        }
      },

      sendEmergencyAlert: async (patientId: number, contactId: number, location?: LocationData) => {
        set({ isLoading: true, error: null });
        try {
          let response;
          
          if (location) {
            // Send alert with location
            response = await fetch(`${API_URL}/emergency-alerts/send-with-location`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                patient_id: patientId,
                emergency_contact_id: contactId,
                latitude: location.latitude,
                longitude: location.longitude,
                location_address: location.address,
              }),
            });
          } else {
            // Send alert without location
            const contact = get().contacts.find(c => c.id === contactId);
            if (!contact) {
              throw new Error('Emergency contact not found');
            }
            
            response = await fetch(`${API_URL}/emergency-contacts/${contactId}/whatsapp-url`);
            if (!response.ok) {
              throw new Error('Failed to generate WhatsApp URL');
            }
            
            const { whatsapp_url, message } = await response.json();
            
            // Create alert record
            response = await fetch(`${API_URL}/emergency-alerts`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                patient_id: patientId,
                emergency_contact_id: contactId,
                alert_type: 'emergency',
                message_sent: message,
                whatsapp_url: whatsapp_url,
              }),
            });
          }
          
          if (!response.ok) {
            throw new Error('Failed to send emergency alert');
          }
          
          const alertData = await response.json();
          set(state => ({
            alerts: [alertData, ...state.alerts],
            isLoading: false
          }));
          
          // Open WhatsApp
          if (alertData.whatsapp_url) {
            // For React Native, you would use Linking.openURL
            // For web, you would use window.open
            if (typeof window !== 'undefined') {
              window.open(alertData.whatsapp_url, '_blank');
            }
          }
          
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Unknown error', isLoading: false });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'emergency-contacts-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        contacts: state.contacts,
        alerts: state.alerts 
      }),
    }
  )
);

export default useEmergencyContactsStore;
