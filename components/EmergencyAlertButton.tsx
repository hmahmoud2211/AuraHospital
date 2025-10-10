import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Alert,
  Linking,
  Platform
} from 'react-native';
import { AlertTriangle, MapPin, Phone } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Typography from '@/constants/typography';
import Button from '@/components/Button';
import useEmergencyContactsStore, { LocationData } from '@/store/emergency-contacts-store';
import { useAuthStore } from '@/store/auth-store';

interface EmergencyAlertButtonProps {
  style?: any;
}

export default function EmergencyAlertButton({ style }: EmergencyAlertButtonProps) {
  const { user } = useAuthStore();
  const { contacts, sendEmergencyAlert, isLoading } = useEmergencyContactsStore();
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const getCurrentLocation = (): Promise<LocationData> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      setIsGettingLocation(true);
      
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            
            // Try to get address from coordinates
            let address = '';
            try {
              const response = await fetch(
                `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=YOUR_API_KEY`
              );
              const data = await response.json();
              if (data.results && data.results.length > 0) {
                address = data.results[0].formatted;
              }
            } catch (error) {
              console.log('Could not get address:', error);
            }

            setIsGettingLocation(false);
            resolve({ latitude, longitude, address });
          } catch (error) {
            setIsGettingLocation(false);
            reject(error);
          }
        },
        (error) => {
          setIsGettingLocation(false);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    });
  };

  const handleEmergencyAlert = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'User not found');
      return;
    }

    if (contacts.length === 0) {
      Alert.alert(
        'No Emergency Contacts',
        'Please add emergency contacts first before sending an alert.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Find primary contact or first contact
    const primaryContact = contacts.find(c => c.is_primary) || contacts[0];

    Alert.alert(
      'Send Emergency Alert',
      `Send emergency alert to ${primaryContact.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Send Without Location', 
          onPress: () => sendAlertWithoutLocation(primaryContact.id)
        },
        { 
          text: 'Send With Location', 
          onPress: () => sendAlertWithLocation(primaryContact.id)
        }
      ]
    );
  };

  const sendAlertWithoutLocation = async (contactId: number) => {
    try {
      await sendEmergencyAlert(user.id, contactId);
      Alert.alert(
        'Alert Sent',
        'Emergency alert has been sent successfully!',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to send emergency alert');
    }
  };

  const sendAlertWithLocation = async (contactId: number) => {
    try {
      const location = await getCurrentLocation();
      await sendEmergencyAlert(user.id, contactId, location);
      
      Alert.alert(
        'Alert Sent',
        'Emergency alert with your location has been sent successfully!',
        [{ text: 'OK' }]
      );
    } catch (error) {
      if (error.message.includes('Geolocation')) {
        Alert.alert(
          'Location Access Denied',
          'Could not access your location. Would you like to send the alert without location?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Send Without Location', onPress: () => sendAlertWithoutLocation(contactId) }
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to send emergency alert');
      }
    }
  };

  const openWhatsAppDirectly = () => {
    if (contacts.length === 0) {
      Alert.alert('No Emergency Contacts', 'Please add emergency contacts first.');
      return;
    }

    const primaryContact = contacts.find(c => c.is_primary) || contacts[0];
    const phoneNumber = primaryContact.phone_number.replace(/\D/g, ''); // Remove non-digits
    
    const message = 'Emergency! I need help.';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    
    Linking.openURL(whatsappUrl).catch(() => {
      Alert.alert('Error', 'Could not open WhatsApp');
    });
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.alertSection}>
        <View style={styles.alertHeader}>
          <AlertTriangle size={24} color={Colors.danger} />
          <Text style={styles.alertTitle}>Emergency Alert</Text>
        </View>
        <Text style={styles.alertDescription}>
          Send an emergency alert to your emergency contacts via WhatsApp
        </Text>
        
        <View style={styles.buttonContainer}>
          <Button
            title="Send Emergency Alert"
            onPress={handleEmergencyAlert}
            loading={isLoading || isGettingLocation}
            style={styles.emergencyButton}
            textStyle={styles.emergencyButtonText}
          />
          
          <TouchableOpacity
            style={styles.whatsappButton}
            onPress={openWhatsAppDirectly}
          >
            <Phone size={20} color={Colors.success} />
            <Text style={styles.whatsappButtonText}>Open WhatsApp</Text>
          </TouchableOpacity>
        </View>
        
        {contacts.length > 0 && (
          <View style={styles.contactInfo}>
            <Text style={styles.contactInfoTitle}>Emergency Contact:</Text>
            <Text style={styles.contactInfoText}>
              {contacts.find(c => c.is_primary)?.name || contacts[0].name}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  alertSection: {
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.danger,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertTitle: {
    ...Typography.h4,
    color: Colors.danger,
    marginLeft: 8,
    fontWeight: '600',
  },
  alertDescription: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  buttonContainer: {
    gap: 12,
  },
  emergencyButton: {
    backgroundColor: Colors.danger,
    borderRadius: 8,
    paddingVertical: 12,
  },
  emergencyButtonText: {
    color: Colors.background,
    fontWeight: '600',
    fontSize: 16,
  },
  whatsappButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
    borderRadius: 8,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.success,
  },
  whatsappButtonText: {
    ...Typography.body,
    color: Colors.success,
    marginLeft: 8,
    fontWeight: '500',
  },
  contactInfo: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  contactInfoTitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  contactInfoText: {
    ...Typography.body,
    fontWeight: '500',
  },
});
