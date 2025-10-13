import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, Platform, Dimensions } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, Calendar, MessageSquare, FileText, Pill, UserIcon, AlertTriangle, Phone } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Typography from '@/constants/typography';
import { useAuthStore } from '@/store/auth-store';
import { usePatientStore } from '@/store/patient-store';
import { useAppointmentStore } from '@/store/appointment-store';
import HealthMetricCard from '@/components/HealthMetricCard';
import AppointmentCard from '@/components/AppointmentCard';
import * as Notifications from 'expo-notifications';
import { NotificationTriggerInput } from 'expo-notifications';

// Define the Colors type
interface AppColors {
  primary: string;
  primaryLight: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  background: string;
  text: string;
  textSecondary: string;
  card: string;
  border: string;
  error: string;
  errorLight: string;
}

const ExtendedColors: AppColors = {
  ...Colors,
  error: '#FF3333',
  errorLight: '#FFEEEE',
};

// Define the HealthMetricCardProps interface
interface HealthMetricCardProps {
  title: string;
  value: number | string;
  unit: string;
  isCritical?: boolean;
}

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { currentPatient, vitalSigns, setCurrentPatient } = usePatientStore();
  const { upcomingAppointments, fetchAppointments } = useAppointmentStore();
  const [emergencyAlert, setEmergencyAlert] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const { width: screenWidth } = Dimensions.get('window');
  
  // Responsive card configuration
  const getCardsPerView = () => {
    if (screenWidth >= 1024) return 3; // Desktop
    if (screenWidth >= 768) return 2;  // Tablet
    return 1; // Mobile
  };
  
  const cardsPerView = getCardsPerView();
  const cardWidth = (screenWidth - 48 - (cardsPerView - 1) * 16) / cardsPerView; // Account for padding and spacing
  const cardSpacing = 16;
  
  // Redirect pharmacists to pharmacy management dashboard
  useEffect(() => {
    if (user?.role === 'pharmacist') {
      router.replace('/(app)/(tabs)/pharmacy-management');
      return;
    }
  }, [user, router]);

  // Debug: Log user data
  console.log('User object:', user);
  console.log('User role:', user?.role);

  // Fallback user data for debugging
  const fallbackUser = {
    id: 'fallback-id',
    name: 'Test User',
    role: 'patient',
  };
  const effectiveUser = user || fallbackUser;

  useEffect(() => {
    if (effectiveUser) {
      if (effectiveUser.role === 'patient') {
        setCurrentPatient(String(effectiveUser.id));
        fetchAppointments(String(effectiveUser.id), effectiveUser.role);
      } else if (effectiveUser.role === 'doctor') {
        fetchAppointments(String(effectiveUser.id), effectiveUser.role);
      }
    }
  }, [effectiveUser]);

  const defaultVitalSigns = {
    heartRate: 72,
    bloodPressure: {
      systolic: 120,
      diastolic: 80,
    },
    glucose: 98,
  };

  const currentVitals = {
    heartRate: vitalSigns?.current?.heartRate ?? defaultVitalSigns.heartRate,
    bloodPressure: {
      systolic: vitalSigns?.current?.bloodPressure?.systolic ?? defaultVitalSigns.bloodPressure.systolic,
      diastolic: vitalSigns?.current?.bloodPressure?.diastolic ?? defaultVitalSigns.bloodPressure.diastolic,
    },
    glucose: vitalSigns?.current?.glucose ?? defaultVitalSigns.glucose,
  };

  useEffect(() => {
    const checkEmergencyConditions = () => {
      if (currentVitals.heartRate > 100 || currentVitals.heartRate < 60) {
        setEmergencyAlert('Heart rate critical: Immediate attention required');
      } else if (currentVitals.bloodPressure.systolic > 180 || currentVitals.bloodPressure.diastolic > 120) {
        setEmergencyAlert('Blood pressure critical: Immediate attention required');
      } else if (currentVitals.glucose > 250 || currentVitals.glucose < 70) {
        setEmergencyAlert('Glucose levels critical: Immediate attention required');
      } else {
        setEmergencyAlert(null);
      }
    };
    checkEmergencyConditions();
  }, [currentVitals]);

  const handleEmergencyCall = () => {
    Alert.alert(
      'Emergency Contact',
      'Call emergency services?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call 911', onPress: () => console.log('Calling emergency services...') },
      ]
    );
  };

  const renderEmergencyBanner = () => {
    if (!emergencyAlert) return null;
    return (
      <View style={styles.emergencyBanner}>
        <AlertTriangle size={24} color={ExtendedColors.error} />
        <Text style={styles.emergencyText}>{emergencyAlert}</Text>
        <TouchableOpacity style={styles.emergencyCallButton} onPress={handleEmergencyCall}>
          <Phone size={20} color={ExtendedColors.background} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderPaginationDots = (totalItems: number) => {
    const totalPages = Math.ceil(totalItems / cardsPerView);
    if (totalPages <= 1) return null;
    
    return (
      <View style={styles.paginationContainer}>
        {Array.from({ length: totalPages }, (_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => scrollToPage(index)}
            style={styles.paginationDotContainer}
          >
            <View
              style={[
                styles.paginationDot,
                index === currentPage && styles.paginationDotActive
              ]}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const page = Math.round(contentOffset / (cardWidth + cardSpacing));
    setCurrentPage(page);
  };

  const scrollToPage = (page: number) => {
    const offset = page * (cardWidth + cardSpacing);
    scrollViewRef.current?.scrollTo({ x: offset, animated: true });
  };

  const renderAppointmentCard = (appointment: any, showPatient: boolean = false) => {
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    const formatTime = (timeString: string) => {
      const [hours, minutes] = timeString.split(':').map(Number);
      const period = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 || 12;
      return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    };

    const getStatusColor = () => {
      switch (appointment.status) {
        case 'confirmed':
          return ExtendedColors.primary || '#007BFF';
        case 'completed':
          return ExtendedColors.success || '#28a745';
        case 'cancelled':
          return ExtendedColors.danger || '#dc3545';
        case 'no-show':
          return ExtendedColors.warning || '#ffc107';
        default:
          return ExtendedColors.info || '#17a2b8';
      }
    };

    const getStatusBackground = () => {
      switch (appointment.status) {
        case 'confirmed':
          return ExtendedColors.primaryLight || '#E3F2FD';
        case 'completed':
          return '#E8F5E9';
        case 'cancelled':
          return '#FFEBEE';
        case 'no-show':
          return '#FFF3E0';
        default:
          return '#F3F4F6';
      }
    };

    const patientName = (() => {
      const patientDetails = appointment.patientDetails;
      if (!patientDetails?.name) return 'Unknown Patient';
      
      if (Array.isArray(patientDetails.name)) {
        return patientDetails.name[0]?.text || 'Unknown Patient';
      }
      
      if (typeof patientDetails.name === 'object') {
        return patientDetails.name?.text || 'Unknown Patient';
      }
      
      return patientDetails.name || 'Unknown Patient';
    })();

    const doctorName = appointment.doctor?.name || 'Dr. Smith';

    const isUrgent = appointment.reason?.toLowerCase().includes('urgent') || 
                    appointment.reason?.toLowerCase().includes('emergency');

    return (
      <TouchableOpacity 
        style={[
          styles.enhancedAppointmentCard,
          isUrgent && styles.urgentCard
        ]}
        onPress={() => router.push(`/appointments/${appointment.id}`)}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <View style={styles.statusContainer}>
            <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
            <Text style={styles.cardStatus}>
              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
            </Text>
          </View>
          {isUrgent && (
            <View style={styles.urgentBadge}>
              <Text style={styles.urgentText}>URGENT</Text>
            </View>
          )}
        </View>
        
        <View style={styles.cardContent}>
          <View style={styles.cardInfoRow}>
            <Calendar size={16} color={ExtendedColors.textSecondary || '#6c757d'} />
            <Text style={styles.cardInfoText}>
              {formatDate(appointment.date)} • {formatTime(appointment.time)}
            </Text>
          </View>
          
          <View style={styles.cardInfoRow}>
            <UserIcon size={16} color={ExtendedColors.textSecondary || '#6c757d'} />
            <Text style={styles.cardInfoText}>
              {showPatient ? `Dr. ${doctorName}` : patientName}
            </Text>
          </View>
          
          <View style={styles.reasonContainer}>
            <Text style={styles.reasonLabel}>Reason for Visit</Text>
            <Text style={styles.reasonText} numberOfLines={3}>
              {appointment.reason}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderPatientDashboard = () => {
    console.log('Rendering Patient Dashboard');
    return (
      <>
        {renderEmergencyBanner()}
        <View style={styles.welcomeSection}>
          <View>
            <Text style={styles.welcomeText}>Hello,</Text>
            <Text style={styles.userName}>{effectiveUser?.name || 'Patient'}</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Bell size={24} color={ExtendedColors.text || '#000000'} />
          </TouchableOpacity>
        </View>
        
        {/* Enhanced Upcoming Appointments with responsive pagination */}
        <View style={styles.upcomingAppointmentsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
            <TouchableOpacity onPress={() => router.push('/appointments')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {upcomingAppointments.length > 0 ? (
            <>
              <ScrollView
                ref={scrollViewRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.enhancedCardsScrollView}
                contentContainerStyle={styles.enhancedCardsContainer}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                pagingEnabled={false}
                decelerationRate="fast"
                snapToInterval={cardWidth + cardSpacing}
                snapToAlignment="start"
              >
                {upcomingAppointments.map((appointment) => (
                  <View key={appointment.id} style={[styles.enhancedCardWrapper, { width: cardWidth }]}>
                    {renderAppointmentCard(appointment, false)}
                  </View>
                ))}
              </ScrollView>
              {renderPaginationDots(upcomingAppointments.length)}
            </>
          ) : (
            <View style={styles.noAppointmentsContainer}>
              <Text style={styles.noAppointmentsText}>No upcoming appointments</Text>
              <TouchableOpacity 
                style={styles.bookAppointmentButton}
                onPress={() => router.push('/appointments/book')}
              >
                <Text style={styles.bookAppointmentText}>Book Appointment</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        {/* Quick Actions remain unchanged */}
        <View style={styles.quickActionsSection}>
          <Link href="/(app)/(tabs)/appointments" asChild>
            <TouchableOpacity style={styles.actionCard}>
              <View style={[styles.actionIconContainer, { backgroundColor: ExtendedColors.primaryLight || '#E0F7FA' }]}> 
                <Calendar size={24} color={ExtendedColors.primary || '#007BFF'} />
              </View>
              <Text style={styles.actionText}>Appointments</Text>
            </TouchableOpacity>
          </Link>
          <Link href="/(app)/(tabs)/chat" asChild>
            <TouchableOpacity style={styles.actionCard}>
              <View style={[styles.actionIconContainer, { backgroundColor: '#E3F2FD' }]}> 
                <MessageSquare size={24} color={ExtendedColors.info || '#2196F3'} />
              </View>
              <Text style={styles.actionText}>Chat with AI</Text>
            </TouchableOpacity>
          </Link>
          <Link href="/(app)/(tabs)/records" asChild>
            <TouchableOpacity style={styles.actionCard}>
              <View style={[styles.actionIconContainer, { backgroundColor: '#E8F5E9' }]}> 
                <FileText size={24} color={ExtendedColors.success || '#008000'} />
              </View>
              <Text style={styles.actionText}>Upload Docs</Text>
            </TouchableOpacity>
          </Link>
          <Link href="/(app)/(tabs)/pharmacy" asChild>
            <TouchableOpacity style={styles.actionCard}>
              <View style={[styles.actionIconContainer, { backgroundColor: '#FFF3E0' }]}> 
                <Pill size={24} color="#FF9800" />
              </View>
              <Text style={styles.actionText}>Pharmacy</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </>
    );
  };

  const renderDoctorDashboard = () => {
    console.log('Rendering Doctor Dashboard');
    return (
      <>
        {renderEmergencyBanner()}
        <View style={styles.welcomeSection}>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{effectiveUser?.name || 'Doctor'}</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Bell size={24} color={ExtendedColors.text || '#000000'} />
          </TouchableOpacity>
        </View>
        
        {/* Enhanced Upcoming Appointments with responsive pagination for doctors */}
        <View style={styles.upcomingAppointmentsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
            <TouchableOpacity onPress={() => router.push('/appointments')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {upcomingAppointments.length > 0 ? (
            <>
              <ScrollView
                ref={scrollViewRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.enhancedCardsScrollView}
                contentContainerStyle={styles.enhancedCardsContainer}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                pagingEnabled={false}
                decelerationRate="fast"
                snapToInterval={cardWidth + cardSpacing}
                snapToAlignment="start"
              >
                {upcomingAppointments.map((appointment) => (
                  <View key={appointment.id} style={[styles.enhancedCardWrapper, { width: cardWidth }]}>
                    {renderAppointmentCard(appointment, true)}
                  </View>
                ))}
              </ScrollView>
              {renderPaginationDots(upcomingAppointments.length)}
            </>
          ) : (
            <View style={styles.noAppointmentsContainer}>
              <Text style={styles.noAppointmentsText}>No upcoming appointments</Text>
            </View>
          )}
        </View>
        
        {/* Quick Actions remain unchanged */}
        <View style={styles.quickActionsSection}>
          <Link href="/(app)/(tabs)/appointments" asChild>
            <TouchableOpacity style={styles.actionCard}>
              <View style={[styles.actionIconContainer, { backgroundColor: ExtendedColors.primaryLight || '#E0F7FA' }]}> 
                <Calendar size={24} color={ExtendedColors.primary || '#007BFF'} />
              </View>
              <Text style={styles.actionText}>Schedule</Text>
            </TouchableOpacity>
          </Link>
          <Link href="/patients" asChild>
            <TouchableOpacity style={styles.actionCard}>
              <View style={[styles.actionIconContainer, { backgroundColor: '#E3F2FD' }]}> 
                <FileText size={24} color={ExtendedColors.info || '#2196F3'} />
              </View>
              <Text style={styles.actionText}>Patients</Text>
            </TouchableOpacity>
          </Link>
          <Link href="/diagnostic-tools" asChild>
            <TouchableOpacity style={styles.actionCard}>
              <View style={[styles.actionIconContainer, { backgroundColor: '#E8F5E9' }]}> 
                <MessageSquare size={24} color={ExtendedColors.success || '#008000'} />
              </View>
              <Text style={styles.actionText}>Diagnostics</Text>
            </TouchableOpacity>
          </Link>
          <Link href="/(app)/(tabs)/pharmacy" asChild>
            <TouchableOpacity style={styles.actionCard}>
              <View style={[styles.actionIconContainer, { backgroundColor: '#FFF3E0' }]}> 
                <Pill size={24} color="#FF9800" />
              </View>
              <Text style={styles.actionText}>Prescribe</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </>
    );
  };

  // Schedule reminders for upcoming appointments
  useEffect(() => {
    async function scheduleReminders() {
      // Only schedule notifications on native platforms
      if (Platform.OS === 'web') {
        console.log('Notifications are not supported on web platform');
        return;
      }

      for (const appointment of upcomingAppointments) {
        const appointmentDate = new Date(`${appointment.date}T${appointment.time}`);
        const reminderTime = new Date(appointmentDate.getTime() - 30 * 60 * 1000); // 30 min before
        if (reminderTime > new Date()) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: 'Appointment Reminder',
              body: `You have an appointment at ${appointmentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
              data: { appointmentId: appointment.id },
            },
            trigger: {
              seconds: Math.floor((reminderTime.getTime() - Date.now()) / 1000),
            } as NotificationTriggerInput,
          });
        }
      }
    }
    if (upcomingAppointments && upcomingAppointments.length > 0) {
      scheduleReminders();
    }
  }, [upcomingAppointments]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {effectiveUser.role === 'patient' ? renderPatientDashboard() : renderDoctorDashboard()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ExtendedColors.background || '#F5F5F5',
  },
  scrollContent: {
    padding: 16,
  },
  welcomeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 16,
    color: ExtendedColors.textSecondary || '#707070',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: ExtendedColors.text || '#000000',
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ExtendedColors.card || '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emergencyBanner: {
    backgroundColor: ExtendedColors.errorLight || '#ffebee',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emergencyText: {
    fontSize: 14,
    color: ExtendedColors.text || '#000000',
    marginBottom: 8,
  },
  emergencyCallButton: {
    backgroundColor: ExtendedColors.error || '#d32f2f',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  emergencyButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  criticalCareSection: {
    backgroundColor: ExtendedColors.card || '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: ExtendedColors.text || '#000000',
  },
  criticalCareContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  criticalCareItem: {
    width: '48%',
    marginBottom: 12,
  },
  criticalCareLabel: {
    fontSize: 14,
    color: ExtendedColors.textSecondary || '#707070',
    marginBottom: 4,
  },
  criticalCareValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  normal: {
    color: ExtendedColors.success || '#4caf50',
  },
  critical: {
    color: ExtendedColors.error || '#d32f2f',
  },
  quickActionsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionCard: {
    width: '48%',
    backgroundColor: ExtendedColors.card || '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    color: ExtendedColors.text || '#000000',
    fontWeight: '500',
  },
  upcomingAppointmentsSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  seeAllText: {
    fontSize: 14,
    color: ExtendedColors.primary || '#007BFF',
    fontWeight: '600',
  },
  noAppointmentsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: ExtendedColors.card || '#FFFFFF',
    borderRadius: 16,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  noAppointmentsText: {
    fontSize: 16,
    color: ExtendedColors.textSecondary || '#6c757d',
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '500',
  },
  bookAppointmentButton: {
    backgroundColor: ExtendedColors.primary || '#007BFF',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: ExtendedColors.primary || '#007BFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  bookAppointmentText: {
    color: ExtendedColors.background || '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  todayScheduleSection: {
    backgroundColor: ExtendedColors.card || '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  scheduleContainer: {
    
  },
  timeSlots: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  timeSlot: {
    alignItems: 'center',
  },
  timeSlotText: {
    fontSize: 14,
    color: ExtendedColors.textSecondary || '#707070',
    marginBottom: 4,
  },
  timeSlotDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: ExtendedColors.primary || '#007BFF',
  },
  timeSlotActive: {
    
  },
  timeSlotCurrent: {
    
  },
  nextPatientText: {
    fontSize: 16,
    fontWeight: '500',
    color: ExtendedColors.text || '#000000',
  },
  patientUpdatesSection: {
    marginBottom: 24,
  },
  patientCard: {
    backgroundColor: ExtendedColors.card || '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  patientCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  patientIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ExtendedColors.primaryLight || '#E0F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    ...Typography.body,
    fontWeight: '500',
    marginBottom: 4,
  },
  patientReason: {
    ...Typography.caption,
    color: ExtendedColors.textSecondary || '#808080',
  },
  appointmentTime: {
    ...Typography.body,
    color: ExtendedColors.primary || '#007BFF',
    fontWeight: '500',
  },
  patientCardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  patientCardButton: {
    flex: 1,
    backgroundColor: ExtendedColors.secondary || '#E0E0E0',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  patientCardButtonText: {
    ...Typography.caption,
    color: ExtendedColors.primary || '#007BFF',
    fontWeight: '500',
  },
  enhancedAppointmentCard: {
    backgroundColor: ExtendedColors.card || '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    height: 200, // Reduced height since we removed the notes section
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: ExtendedColors.border || '#E0E0E0',
    marginBottom: 0, // Remove bottom margin for carousel
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  cardStatus: {
    fontSize: 11,
    fontWeight: '700',
    color: ExtendedColors.text || '#000000',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  urgentBadge: {
    backgroundColor: ExtendedColors.warning || '#ffc107',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginLeft: 10,
  },
  urgentText: {
    fontSize: 10,
    fontWeight: '700',
    color: ExtendedColors.background || '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  urgentCard: {
    borderLeftWidth: 6,
    borderLeftColor: ExtendedColors.warning || '#ffc107',
  },
  cardContent: {
    flex: 1,
  },
  cardInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardInfoText: {
    fontSize: 14,
    color: ExtendedColors.textSecondary || '#6c757d',
    marginLeft: 10,
    fontWeight: '500',
    lineHeight: 18,
  },
  reasonContainer: {
    marginTop: 16,
    flex: 1, // Take remaining space
  },
  reasonLabel: {
    fontSize: 11,
    color: ExtendedColors.textSecondary || '#6c757d',
    marginBottom: 8,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  reasonText: {
    fontSize: 15,
    color: ExtendedColors.text || '#000000',
    fontWeight: '600',
    lineHeight: 20,
  },
  enhancedCardWrapper: {
    marginRight: 16,
    height: 200, // Match reduced card height
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 12,
  },
  paginationDotContainer: {
    padding: 6,
  },
  paginationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: ExtendedColors.textSecondary || '#D1D5DB',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: ExtendedColors.primary || '#007BFF',
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  enhancedCardsScrollView: {
    marginVertical: 12,
  },
  enhancedCardsContainer: {
    paddingHorizontal: 20,
  },
});