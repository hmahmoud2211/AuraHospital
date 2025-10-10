# Auradent Emergency Contacts Feature

This feature allows patients in the Auradent hospital management system to manage emergency contacts and send emergency alerts via WhatsApp with their current location.

## Features Implemented

### ✅ Backend (Python/FastAPI)
- **Database Models**: `EmergencyContact` and `EmergencyAlert` models
- **API Endpoints**: Full CRUD operations for emergency contacts and alerts
- **WhatsApp Integration**: Automatic URL generation for WhatsApp messages
- **Location Services**: Support for GPS coordinates and address lookup

### ✅ Frontend (React Native/Expo)
- **Emergency Contacts Management**: Add, edit, delete emergency contacts
- **Emergency Alert Button**: Send alerts with/without location
- **Location Services**: Get current GPS coordinates
- **WhatsApp Integration**: Direct WhatsApp opening with pre-filled messages
- **State Management**: Zustand store for emergency contacts

### ✅ Web Demo (HTML/JavaScript)
- **Complete Web Implementation**: Standalone HTML file with all features
- **Location Services**: Browser geolocation API
- **Local Storage**: Simple data persistence
- **Responsive Design**: Mobile-friendly interface

## Quick Start Guide

### 1. Backend Setup

The backend models and API endpoints are already integrated into your existing FastAPI application:

```python
# Models are in backend/models.py
class EmergencyContact(models.Model):
    # ... emergency contact fields

class EmergencyAlert(models.Model):
    # ... emergency alert fields

# API endpoints are in backend/routers/emergency_contacts.py
# Already included in backend/main.py
```

### 2. Frontend Integration

The React Native components are ready to use:

```tsx
// Import the components
import EmergencyAlertButton from '@/components/EmergencyAlertButton';
import EmergencyContactsScreen from '@/app/(app)/emergency-contacts';

// Use in your profile screen
<EmergencyAlertButton />
```

### 3. Web Implementation

For a simple web implementation, use the provided `emergency-contacts-demo.html` file. It includes:

- Emergency contact management
- Location services
- WhatsApp integration
- Local storage

## API Endpoints

### Emergency Contacts
- `GET /api/patients/{patient_id}/emergency-contacts` - Get all contacts
- `POST /api/patients/{patient_id}/emergency-contacts` - Add new contact
- `PUT /api/emergency-contacts/{contact_id}` - Update contact
- `DELETE /api/emergency-contacts/{contact_id}` - Delete contact

### Emergency Alerts
- `POST /api/emergency-alerts` - Create alert
- `GET /api/patients/{patient_id}/emergency-alerts` - Get alerts
- `POST /api/emergency-alerts/send-with-location` - Send alert with location

### WhatsApp Integration
- `GET /api/emergency-contacts/{contact_id}/whatsapp-url` - Generate WhatsApp URL

## Usage Examples

### Adding an Emergency Contact

```typescript
const contactData = {
  patient_id: 1,
  name: "John Doe",
  relationship: "spouse",
  phone_number: "+1234567890",
  is_primary: true
};

await addContact(contactData);
```

### Sending Emergency Alert

```typescript
// With location
const location = {
  latitude: 40.7128,
  longitude: -74.0060,
  address: "New York, NY"
};

await sendEmergencyAlert(patientId, contactId, location);

// Without location
await sendEmergencyAlert(patientId, contactId);
```

### WhatsApp URL Generation

```typescript
const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
// Opens WhatsApp with pre-filled emergency message
```

## Security Considerations

### 1. Location Privacy
- Location data is only stored when explicitly requested
- Users can choose to send alerts with or without location
- Location data is encrypted in transit

### 2. Contact Validation
- Phone numbers are validated and cleaned
- Only active contacts can receive alerts
- Primary contact designation is enforced

### 3. Rate Limiting
- Consider implementing rate limiting for emergency alerts
- Log all emergency alerts for audit purposes
- Implement user authentication checks

## Database Schema

### EmergencyContact Table
```sql
CREATE TABLE emergency_contacts (
    id INTEGER PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id),
    name VARCHAR(255) NOT NULL,
    relationship VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### EmergencyAlert Table
```sql
CREATE TABLE emergency_alerts (
    id INTEGER PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id),
    emergency_contact_id INTEGER REFERENCES emergency_contacts(id),
    alert_type VARCHAR(50) DEFAULT 'emergency',
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),
    location_address VARCHAR(500),
    message_sent TEXT NOT NULL,
    whatsapp_url VARCHAR(1000) NOT NULL,
    status VARCHAR(20) DEFAULT 'sent',
    response_received BOOLEAN DEFAULT FALSE,
    response_message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Testing the Feature

### 1. Backend Testing
```bash
# Start the backend server
cd backend
python main.py

# Test API endpoints
curl -X GET "http://localhost:8000/api/patients/1/emergency-contacts"
```

### 2. Frontend Testing
```bash
# Start the React Native app
npm start

# Navigate to Profile > Emergency Contacts
```

### 3. Web Demo Testing
```bash
# Open the HTML file in a browser
open emergency-contacts-demo.html

# Test location services and WhatsApp integration
```

## Customization Options

### 1. Message Templates
Customize the emergency message format:

```typescript
const message = `Emergency! I need help. This is ${patientName}. My location: ${locationUrl}`;
```

### 2. Location Services
Integrate with different geocoding services:

```typescript
// Google Maps API
const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${API_KEY}`);

// OpenCage API
const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${API_KEY}`);
```

### 3. Notification Channels
Extend beyond WhatsApp:

```typescript
// SMS integration
const smsUrl = `sms:${phoneNumber}?body=${encodeURIComponent(message)}`;

// Email integration
const emailUrl = `mailto:${email}?subject=Emergency Alert&body=${encodeURIComponent(message)}`;
```

## Troubleshooting

### Common Issues

1. **Location not working**: Check browser/device location permissions
2. **WhatsApp not opening**: Verify phone number format and WhatsApp installation
3. **API errors**: Check backend server status and CORS configuration
4. **Database errors**: Ensure database migrations are run

### Debug Mode

Enable debug logging:

```typescript
// In your store
console.log('Emergency alert data:', alertData);
console.log('WhatsApp URL:', whatsappUrl);
```

## Future Enhancements

### Planned Features
- [ ] Multiple notification channels (SMS, Email, Push)
- [ ] Emergency alert history and analytics
- [ ] Integration with hospital emergency systems
- [ ] Voice message support
- [ ] Automated follow-up messages
- [ ] Emergency contact verification system

### Integration Opportunities
- [ ] Hospital emergency response system
- [ ] Medical device integration
- [ ] Wearable device alerts
- [ ] AI-powered emergency detection

## Support

For questions or issues with the emergency contacts feature:

1. Check the troubleshooting section above
2. Review the API documentation
3. Test with the provided demo files
4. Check browser/device console for errors

## License

This emergency contacts feature is part of the Auradent hospital management system and follows the same licensing terms.
