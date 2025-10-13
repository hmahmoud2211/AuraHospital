# 📦 Aura Hospital - Modular Structure

## Overview
This document describes the modular architecture of the Aura Hospital application. The project has been reorganized into feature-based modules to improve code organization, maintainability, and scalability.

## 🏗️ Module Architecture

Each module follows a consistent structure:

```
modules/[module-name]/
├── components/     # Module-specific React components
├── screens/        # Screen components for this module
├── store/          # State management (Zustand stores)
├── services/       # API calls and business logic
├── types/          # TypeScript type definitions
├── utils/          # Helper functions
└── index.ts        # Module exports
```

## 📁 Modules

### 1. **`modules/auth`** - Authentication & User Management
**Purpose:** Handles all authentication-related functionality

**Structure:**
```
modules/auth/
├── store/
│   ├── auth-store.ts         # Authentication state management
│   └── index.ts
├── types/
└── index.ts
```

**Screens Located In:** `app/(auth)/`
- Login (`index.tsx`)
- Register (`register.tsx`)
- Forgot Password (`forgot-password.tsx`)
- Mobile Number Verification (`mobile-number.tsx`)
- Verify Code (`verify-code.tsx`)
- New Password (`new-password.tsx`)

**Key Features:**
- User login/logout
- Registration
- Password reset
- Mobile verification

---

### 2. **`modules/appointments`** - Appointment Management
**Purpose:** Manages appointment booking, viewing, and rescheduling

**Structure:**
```
modules/appointments/
├── components/
│   ├── AppointmentCard.tsx           # Display appointment info
│   ├── AppointmentScheduler.tsx      # Scheduler component
│   ├── DateSelection.tsx             # Date picker
│   ├── TimeSelection.tsx             # Time slot selector
│   ├── DoctorSelection.tsx           # Doctor selector
│   └── index.ts
├── store/
│   ├── appointment-store.ts          # Appointment state
│   ├── appointmentStore.ts           # Legacy store (to be merged)
│   └── index.ts
├── services/
└── index.ts
```

**Screens Located In:** 
- Tab: `app/(app)/(tabs)/appointments.tsx`
- Details: `app/(app)/appointments/`
  - `appointments.tsx` - List view
  - `book.tsx` - Booking form
  - `[id].tsx` - Appointment details
  - `reschedule.tsx` - Reschedule form

**Key Features:**
- View appointments (upcoming, past, all)
- Book new appointments
- Reschedule existing appointments
- Cancel appointments
- Doctor availability management

---

### 3. **`modules/medical-records`** - Medical Records & Patient History
**Purpose:** Manages patient medical records and health history

**Structure:**
```
modules/medical-records/
├── components/
│   ├── MedicalRecordCard.tsx         # Display medical record
│   └── index.ts
├── store/
│   ├── medical-records-store.ts      # Medical records state
│   └── index.ts
├── services/
└── index.ts
```

**Screens Located In:** `app/(app)/medical-records/`
- `[id].tsx` - Medical record details
- `upload.tsx` - Upload medical documents

**Key Features:**
- View medical records
- Upload medical documents
- Track medical history
- FHIR-compliant data structure

---

### 4. **`modules/pharmacy`** - Pharmacy & Medication Management
**Purpose:** Handles pharmacy operations and medication tracking

**Structure:**
```
modules/pharmacy/
├── components/
│   ├── MedicationCard.tsx            # Display medication info
│   └── index.ts
├── store/
├── services/
└── index.ts
```

**Screens Located In:** 
- `app/(app)/(tabs)/pharmacy.tsx` - Patient pharmacy view
- `app/(app)/(tabs)/pharmacy-management.tsx` - Pharmacist dashboard
- `app/(app)/pharmacist.tsx` - Pharmacist operations

**Key Features:**
- View medications
- Prescription management
- Medication tracking
- Pharmacy staff management

---

### 5. **`modules/chat`** - AI Assistant & Medical Chat
**Purpose:** AI-powered medical chat and voice transcription

**Structure:**
```
modules/chat/
├── components/
│   ├── MedicalChat.tsx               # Chat interface
│   ├── ChatHistory.tsx               # Chat history viewer
│   └── index.ts
├── screens/
│   ├── MedicalAssistantScreen.tsx    # Main chat screen
│   └── index.ts
├── services/
│   ├── MedicalChatbot.ts             # AI chatbot logic
│   ├── WhisperMedicalTranscriptionService.ts
│   ├── SimpleWhisperTranscriptionService.ts
│   ├── MedicalTerminologyMapper.ts
│   ├── MedicalTermsDatabase.ts
│   ├── DialectNormalizationService.ts
│   └── index.ts
├── store/
└── index.ts
```

**Screens Located In:** 
- Tab: `app/(app)/(tabs)/chat.tsx`
- Detail: `app/(app)/chat/`
  - `chat.tsx`
  - `ai-assistant.tsx`

**Key Features:**
- AI medical assistant
- Voice-to-text transcription (Groq Whisper)
- Medical terminology mapping
- Arabic dialect normalization
- Appointment booking via chat
- Medical information lookup

---

### 6. **`modules/laboratory`** - Lab Tests & Results
**Purpose:** Laboratory test management and results

**Structure:**
```
modules/laboratory/
├── components/
├── screens/
├── store/
├── services/
└── index.ts
```

**Screens Located In:** `app/(app)/`
- `laboratory.tsx` - Lab dashboard
- `laboratory-staff.tsx` - Staff management
- `laborist.tsx` - Laborist operations
- `laborist/` folder:
  - `chat.tsx`
  - `upload.tsx`

**Key Features:**
- Lab test ordering
- Results viewing
- Lab staff management
- Test upload functionality

---

### 7. **`modules/clinical-notes`** - SOAP Notes & Clinical Documentation
**Purpose:** Clinical documentation using SOAP format

**Structure:**
```
modules/clinical-notes/
├── components/
│   ├── SOAPExamination.tsx           # SOAP note form
│   └── index.ts
├── store/
└── index.ts
```

**Screens Located In:** `app/(app)/clinical-notes/`
- `[id].tsx` - Clinical note details

**Key Features:**
- SOAP note creation
- Clinical documentation
- Examination records

---

### 8. **`modules/emergency`** - Emergency Contacts & Alerts
**Purpose:** Emergency contact management and alert system

**Structure:**
```
modules/emergency/
├── components/
│   ├── EmergencyAlertButton.tsx      # Emergency button
│   └── index.ts
├── store/
│   ├── emergency-contacts-store.ts   # Emergency contacts state
│   └── index.ts
├── services/
└── index.ts
```

**Screens Located In:** `app/(app)/`
- `emergency-contacts.tsx` - Manage emergency contacts

**Key Features:**
- Emergency contact management
- Emergency alerts
- Quick access to emergency services

---

### 9. **`modules/profile`** - User Profile & Settings
**Purpose:** User profile management and app settings

**Structure:**
```
modules/profile/
├── components/
├── screens/
├── store/
└── index.ts
```

**Screens Located In:** 
- Tab: `app/(app)/(tabs)/profile.tsx`
- Edit: `app/(app)/profile/edit.tsx`

**Key Features:**
- View/edit profile
- Account settings
- Preferences

---

### 10. **`modules/shared`** - Shared Components & Utilities
**Purpose:** Common resources used across multiple modules

**Structure:**
```
modules/shared/
├── components/
│   ├── Button.tsx                    # Reusable button
│   ├── Header.tsx                    # App header
│   ├── Tag.tsx                       # Tag component
│   ├── HealthMetricCard.tsx          # Health metrics
│   └── index.ts
├── constants/
│   ├── colors.ts                     # Color palette
│   ├── typography.ts                 # Typography styles
│   ├── config.ts                     # App configuration
│   └── index.ts
├── hooks/
│   ├── useVoiceRecording.ts          # Voice recording hook
│   └── index.ts
├── types/
│   ├── appointment.ts                # Appointment types
│   ├── medical.ts                    # Medical types
│   ├── user.ts                       # User types
│   └── index.ts
├── config/
│   ├── env.ts                        # Environment config
│   └── index.ts
├── utils/
└── index.ts
```

**Key Features:**
- Reusable UI components
- Type definitions
- Configuration management
- Common hooks and utilities

---

## 🔄 Import Patterns

### Old Import Pattern (Before Modularization)
```typescript
import Button from '@/components/Button';
import { useAuthStore } from '@/store/auth-store';
import Colors from '@/constants/colors';
import { Appointment } from '@/types/appointment';
```

### New Import Pattern (After Modularization)
```typescript
// Shared resources
import { Button, Header, Colors, Typography } from '@/modules/shared';

// Module-specific imports
import { useAuthStore } from '@/modules/auth';
import { AppointmentCard, useAppointmentStore } from '@/modules/appointments';
import { MedicalRecordCard } from '@/modules/medical-records';
import { MedicationCard } from '@/modules/pharmacy';
import { MedicalChat, MedicalAssistantScreen } from '@/modules/chat';
import { EmergencyAlertButton } from '@/modules/emergency';
```

---

## 📱 App Navigation Structure

The app uses Expo Router with file-based routing:

```
app/
├── _layout.tsx                   # Root layout
├── (auth)/                       # Auth screens (before login)
│   └── [auth screens]
├── (app)/                        # Main app (after login)
│   ├── (tabs)/                   # Bottom tab navigation
│   │   ├── index.tsx             # Home
│   │   ├── appointments.tsx      # Appointments tab
│   │   ├── chat.tsx              # Chat tab
│   │   ├── records.tsx           # Records tab
│   │   ├── pharmacy.tsx          # Pharmacy tab
│   │   ├── pharmacy-management.tsx # Pharmacist tab
│   │   └── profile.tsx           # Profile tab
│   └── [feature folders]/        # Feature-specific screens
└── +not-found.tsx
```

---

## 🔧 Configuration Files

### TypeScript Path Aliases (`tsconfig.json`)
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"],
      "@/modules/*": ["./modules/*"]
    }
  }
}
```

---

## 🚀 Migration Guide

### For Developers

When adding new features:

1. **Identify the appropriate module** or create a new one
2. **Place components** in the module's `components/` folder
3. **Place screens** in the module's `screens/` folder
4. **Place state management** in the module's `store/` folder
5. **Place API calls** in the module's `services/` folder
6. **Export from index.ts** for clean imports
7. **Update this documentation** with new features

### File Movement Checklist

- [x] Create module directory structure
- [x] Move components to respective modules
- [x] Move stores to respective modules
- [x] Move services to respective modules
- [x] Create index.ts files for each module
- [ ] Update all import statements (in progress)
- [ ] Test all navigation flows
- [ ] Remove old directories (after verification)

---

## 📊 Module Dependencies

```
┌─────────────────────┐
│   Shared Module     │  ← All modules depend on this
└─────────────────────┘
         ↑
         │
    ┌────┴────┬────────┬──────────┬─────────┐
    │         │        │          │         │
┌───┴───┐ ┌──┴──┐ ┌───┴────┐ ┌──┴───┐ ┌──┴──────┐
│ Auth  │ │Appts│ │ Records│ │Pharm │ │  Chat   │ etc...
└───────┘ └─────┘ └────────┘ └──────┘ └─────────┘
```

---

## 📝 Benefits of Modular Architecture

✅ **Better Organization** - Related code is grouped together
✅ **Easier Navigation** - Find files quickly
✅ **Improved Maintainability** - Changes are localized
✅ **Reusability** - Components are easily reused
✅ **Scalability** - Easy to add new modules
✅ **Team Collaboration** - Multiple developers can work on different modules
✅ **Testing** - Easier to test individual modules

---

## 🔮 Future Improvements

- [ ] Add unit tests for each module
- [ ] Create Storybook for shared components
- [ ] Add module-level documentation
- [ ] Implement lazy loading for modules
- [ ] Add module performance monitoring

---

## 📞 Contact

For questions or suggestions about the module structure, please contact the development team.

**Last Updated:** October 13, 2025

