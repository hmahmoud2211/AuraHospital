# 📦 Aura Hospital - App Modular Structure

## Overview
The Aura Hospital app is now organized into feature-based modules within the `app/` directory. Each module contains all related files (screens, components, store, services) in one place for better organization and maintainability.

---

## 🏗️ App Structure

```
app/
├── (auth)/                      # Authentication Flow
│   ├── _layout.tsx
│   ├── index.tsx                # Login screen
│   ├── register.tsx
│   ├── forgot-password.tsx
│   ├── mobile-number.tsx
│   ├── verify-code.tsx
│   ├── new-password.tsx
│   └── store/
│       └── auth-store.ts        # Auth state management
│
├── (app)/                       # Main App (After Login)
│   └── (tabs)/                  # Bottom Tab Navigation
│       ├── _layout.tsx
│       ├── index.tsx            # Home screen
│       ├── appointments.tsx     # Appointments tab
│       ├── chat.tsx             # Chatbot tab
│       ├── records.tsx          # Medical records tab
│       ├── pharmacy.tsx         # Pharmacy tab
│       ├── pharmacy-management.tsx # Pharmacist dashboard
│       └── profile.tsx          # Profile tab
│
├── appointments/                # 📅 APPOINTMENTS MODULE
│   ├── components/
│   │   ├── AppointmentCard.tsx
│   │   ├── AppointmentScheduler.tsx
│   │   ├── DateSelection.tsx
│   │   ├── TimeSelection.tsx
│   │   ├── DoctorSelection.tsx
│   │   └── index.ts
│   ├── store/
│   │   ├── appointment-store.ts
│   │   ├── appointmentStore.ts
│   │   └── index.ts
│   ├── services/
│   └── types/
│
├── chatbot/                     # 💬 CHATBOT/AI MODULE
│   ├── components/
│   │   ├── MedicalChat.tsx
│   │   ├── ChatHistory.tsx
│   │   └── index.ts
│   ├── screens/
│   │   ├── MedicalAssistantScreen.tsx
│   │   └── index.ts
│   ├── services/
│   │   ├── MedicalChatbot.ts
│   │   ├── WhisperMedicalTranscriptionService.ts
│   │   ├── SimpleWhisperTranscriptionService.ts
│   │   ├── MedicalTerminologyMapper.ts
│   │   ├── MedicalTermsDatabase.ts
│   │   ├── DialectNormalizationService.ts
│   │   └── index.ts
│   ├── store/
│   └── types/
│
├── pharmacy/                    # 💊 PHARMACY MODULE
│   ├── components/
│   │   ├── MedicationCard.tsx
│   │   └── index.ts
│   ├── store/
│   ├── services/
│   └── types/
│
├── medical-records/             # 📋 MEDICAL RECORDS MODULE
│   ├── components/
│   │   ├── MedicalRecordCard.tsx
│   │   └── index.ts
│   ├── store/
│   │   ├── medical-records-store.ts
│   │   └── index.ts
│   ├── services/
│   └── types/
│
├── laboratory/                  # 🔬 LABORATORY MODULE
│   ├── components/
│   ├── store/
│   ├── services/
│   └── types/
│
├── clinical-notes/              # 📝 CLINICAL NOTES MODULE
│   ├── components/
│   │   ├── SOAPExamination.tsx
│   │   └── index.ts
│   ├── store/
│   └── types/
│
├── emergency/                   # 🚨 EMERGENCY MODULE
│   ├── components/
│   │   ├── EmergencyAlertButton.tsx
│   │   └── index.ts
│   ├── store/
│   │   ├── emergency-contacts-store.ts
│   │   └── index.ts
│   ├── services/
│   └── types/
│
├── profile/                     # 👤 PROFILE MODULE
│   ├── components/
│   ├── store/
│   └── types/
│
└── shared/                      # 🔧 SHARED MODULE
    ├── components/
    │   ├── Button.tsx
    │   ├── Header.tsx
    │   ├── Tag.tsx
    │   ├── HealthMetricCard.tsx
    │   └── index.ts
    ├── constants/
    │   ├── colors.ts
    │   ├── typography.ts
    │   ├── config.ts
    │   └── index.ts
    ├── types/
    │   ├── appointment.ts
    │   ├── medical.ts
    │   ├── user.ts
    │   └── index.ts
    ├── hooks/
    │   ├── useVoiceRecording.ts
    │   └── index.ts
    └── config/
        ├── env.ts
        └── index.ts
```

---

## 📁 Module Breakdown

### 1. 📅 **Appointments Module** (`app/appointments/`)

**Purpose:** Complete appointment management system

**Files:**
- **Components:**
  - `AppointmentCard.tsx` - Display appointment information
  - `AppointmentScheduler.tsx` - Full scheduler interface
  - `DateSelection.tsx` - Date picker component
  - `TimeSelection.tsx` - Time slot selector
  - `DoctorSelection.tsx` - Doctor selection dropdown
  
- **Store:**
  - `appointment-store.ts` - Appointment state management (Zustand)
  - `appointmentStore.ts` - Legacy store (to be merged)

- **Screens** (in `app/(app)/` folder):
  - `(tabs)/appointments.tsx` - Appointments tab
  - `appointments/appointments.tsx` - Appointments list
  - `appointments/book.tsx` - Book appointment form
  - `appointments/[id].tsx` - Appointment details
  - `appointments/reschedule.tsx` - Reschedule form

**Features:**
- View appointments (upcoming, past, all)
- Book new appointments
- Reschedule/cancel appointments
- Doctor availability management
- Patient/doctor views

---

### 2. 💬 **Chatbot Module** (`app/chatbot/`)

**Purpose:** AI-powered medical assistant with voice transcription

**Files:**
- **Components:**
  - `MedicalChat.tsx` - Chat interface
  - `ChatHistory.tsx` - Chat history viewer
  
- **Screens:**
  - `MedicalAssistantScreen.tsx` - Main chat screen with tabs
  
- **Services:**
  - `MedicalChatbot.ts` - AI chatbot logic
  - `WhisperMedicalTranscriptionService.ts` - Medical voice transcription
  - `SimpleWhisperTranscriptionService.ts` - Simple transcription
  - `MedicalTerminologyMapper.ts` - Medical term mapping
  - `MedicalTermsDatabase.ts` - Medical terms database
  - `DialectNormalizationService.ts` - Arabic dialect handling

- **Screens** (in `app/(app)/` folder):
  - `(tabs)/chat.tsx` - Chat tab
  - `chat/ai-assistant.tsx` - AI assistant screen
  - `chat/chat.tsx` - Chat wrapper

**Features:**
- AI medical assistant
- Voice-to-text (Groq Whisper API)
- Medical terminology understanding
- Arabic dialect normalization
- Appointment booking via chat
- Symptom checking

---

### 3. 💊 **Pharmacy Module** (`app/pharmacy/`)

**Purpose:** Pharmacy operations and medication management

**Files:**
- **Components:**
  - `MedicationCard.tsx` - Display medication information

- **Screens** (in `app/(app)/` folder):
  - `(tabs)/pharmacy.tsx` - Patient pharmacy view
  - `(tabs)/pharmacy-management.tsx` - Pharmacist dashboard
  - `pharmacist.tsx` - Pharmacist operations

**Features:**
- View medications
- Prescription management
- Medication tracking
- Pharmacy staff operations

---

### 4. 📋 **Medical Records Module** (`app/medical-records/`)

**Purpose:** Patient medical records and health history

**Files:**
- **Components:**
  - `MedicalRecordCard.tsx` - Display medical record

- **Store:**
  - `medical-records-store.ts` - Medical records state

- **Screens** (in `app/(app)/` folder):
  - `(tabs)/records.tsx` - Records tab
  - `medical-records/[id].tsx` - Record details
  - `medical-records/upload.tsx` - Upload documents

**Features:**
- View medical records
- Upload medical documents
- Track medical history
- FHIR-compliant data

---

### 5. 🔬 **Laboratory Module** (`app/laboratory/`)

**Purpose:** Lab tests and results management

**Screens** (in `app/(app)/` folder):
- `laboratory.tsx` - Lab dashboard
- `laboratory-staff.tsx` - Staff management
- `laborist.tsx` - Laborist operations
- `laborist/chat.tsx` - Lab chat
- `laborist/upload.tsx` - Upload results

**Features:**
- Lab test ordering
- Results viewing
- Lab staff management

---

### 6. 📝 **Clinical Notes Module** (`app/clinical-notes/`)

**Purpose:** Clinical documentation using SOAP format

**Files:**
- **Components:**
  - `SOAPExamination.tsx` - SOAP note form (Subjective, Objective, Assessment, Plan)

- **Screens** (in `app/(app)/` folder):
  - `clinical-notes/[id].tsx` - Clinical note details

**Features:**
- SOAP note creation
- Clinical documentation
- Examination records

---

### 7. 🚨 **Emergency Module** (`app/emergency/`)

**Purpose:** Emergency contacts and alerts

**Files:**
- **Components:**
  - `EmergencyAlertButton.tsx` - Emergency alert button

- **Store:**
  - `emergency-contacts-store.ts` - Emergency contacts state

- **Screens** (in `app/(app)/` folder):
  - `emergency-contacts.tsx` - Manage contacts

**Features:**
- Emergency contact management
- Emergency alerts
- Quick access to emergency services

---

### 8. 👤 **Profile Module** (`app/profile/`)

**Purpose:** User profile and settings

**Screens** (in `app/(app)/` folder):
- `(tabs)/profile.tsx` - Profile tab
- `profile/edit.tsx` - Edit profile

**Features:**
- View/edit profile
- Account settings
- Preferences

---

### 9. 🔧 **Shared Module** (`app/shared/`)

**Purpose:** Common resources used across all modules

**Files:**
- **Components:**
  - `Button.tsx` - Reusable button
  - `Header.tsx` - App header
  - `Tag.tsx` - Tag component
  - `HealthMetricCard.tsx` - Health metrics display

- **Constants:**
  - `colors.ts` - App color palette
  - `typography.ts` - Typography styles
  - `config.ts` - App configuration

- **Types:**
  - `appointment.ts` - Appointment types
  - `medical.ts` - Medical data types
  - `user.ts` - User types

- **Hooks:**
  - `useVoiceRecording.ts` - Voice recording hook

- **Config:**
  - `env.ts` - Environment configuration (Groq API keys, etc.)

---

## 🔄 Import Examples

### Old Way (Before Modularization)
```typescript
import Button from '@/components/Button';
import Colors from '@/constants/colors';
import { useAuthStore } from '@/store/auth-store';
```

### New Way (After Modularization)
```typescript
// Shared resources
import { Button, Colors, Typography } from '@/app/shared';

// Module-specific
import { useAuthStore } from '@/app/(auth)/store';
import { AppointmentCard } from '@/app/appointments/components';
import { MedicalChat } from '@/app/chatbot/components';
import { MedicationCard } from '@/app/pharmacy/components';
```

---

## 📱 Navigation Structure

```
Root
├── (auth)                    # Before login
│   ├── Login
│   ├── Register
│   └── Password Reset
│
└── (app)                     # After login
    └── (tabs)                # Bottom tabs
        ├── Home
        ├── Appointments → app/appointments/
        ├── Chat → app/chatbot/
        ├── Records → app/medical-records/
        ├── Pharmacy → app/pharmacy/
        └── Profile → app/profile/
```

---

## ✅ Benefits of This Structure

1. **Co-location** - Related files are together
2. **Easy Navigation** - Find all appointment files in one folder
3. **Clear Boundaries** - Each module is independent
4. **Scalability** - Easy to add new modules
5. **Maintainability** - Changes are localized to modules
6. **Team Collaboration** - Different devs can work on different modules

---

## 📝 Adding New Features

When adding a new feature to the app:

1. **Identify the module** it belongs to (e.g., appointments, chatbot, etc.)
2. **Add components** to `app/[module]/components/`
3. **Add screens** to `app/(app)/[feature]/`
4. **Add state** to `app/[module]/store/`
5. **Add services** to `app/[module]/services/`
6. **Export** from `index.ts` files
7. **Update** navigation if needed

---

## 🎯 Current Status

✅ **Completed:**
- Module structure created
- Files organized into modules
- Index files for clean exports
- Navigation fixed for appointments & chat

⏳ **Next Steps:**
- Update remaining import paths
- Test all navigation flows
- Remove old duplicate files
- Add module-level tests

---

**Last Updated:** October 13, 2025
**Structure:** Modular (Feature-Based)
**Location:** Inside `app/` directory

