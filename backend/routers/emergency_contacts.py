from fastapi import APIRouter, HTTPException, Depends
from tortoise.exceptions import DoesNotExist
from typing import List, Optional
import urllib.parse
from datetime import datetime

from models import (
    EmergencyContact, EmergencyAlert, Patient,
    EmergencyContact_Pydantic, EmergencyContactIn_Pydantic,
    EmergencyAlert_Pydantic, EmergencyAlertIn_Pydantic,
    EmergencyContactCreate, EmergencyContactUpdate,
    EmergencyAlertCreate, EmergencyAlertUpdate
)

router = APIRouter()

# Emergency Contact Management Endpoints

@router.get("/patients/{patient_id}/emergency-contacts", response_model=List[EmergencyContact_Pydantic])
async def get_patient_emergency_contacts(patient_id: int):
    """Get all emergency contacts for a patient"""
    try:
        contacts = await EmergencyContact.filter(patient_id=patient_id, is_active=True).order_by('-is_primary', 'name')
        return contacts
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching emergency contacts: {str(e)}")

@router.post("/patients/{patient_id}/emergency-contacts", response_model=EmergencyContact_Pydantic)
async def create_emergency_contact(patient_id: int, contact_data: EmergencyContactCreate):
    """Create a new emergency contact for a patient"""
    try:
        # Verify patient exists
        await Patient.get(id=patient_id)
        
        # If this is set as primary, unset other primary contacts
        if contact_data.is_primary:
            await EmergencyContact.filter(patient_id=patient_id, is_primary=True).update(is_primary=False)
        
        contact = await EmergencyContact.create(
            patient_id=patient_id,
            name=contact_data.name,
            relationship=contact_data.relationship,
            phone_number=contact_data.phone_number,
            is_primary=contact_data.is_primary
        )
        return contact
    except DoesNotExist:
        raise HTTPException(status_code=404, detail="Patient not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating emergency contact: {str(e)}")

@router.put("/emergency-contacts/{contact_id}", response_model=EmergencyContact_Pydantic)
async def update_emergency_contact(contact_id: int, contact_data: EmergencyContactUpdate):
    """Update an emergency contact"""
    try:
        contact = await EmergencyContact.get(id=contact_id)
        
        # If setting as primary, unset other primary contacts for this patient
        if contact_data.is_primary:
            await EmergencyContact.filter(patient_id=contact.patient_id, is_primary=True).update(is_primary=False)
        
        # Update fields
        update_data = contact_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(contact, field, value)
        
        await contact.save()
        return contact
    except DoesNotExist:
        raise HTTPException(status_code=404, detail="Emergency contact not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating emergency contact: {str(e)}")

@router.delete("/emergency-contacts/{contact_id}")
async def delete_emergency_contact(contact_id: int):
    """Delete (deactivate) an emergency contact"""
    try:
        contact = await EmergencyContact.get(id=contact_id)
        contact.is_active = False
        await contact.save()
        return {"message": "Emergency contact deactivated successfully"}
    except DoesNotExist:
        raise HTTPException(status_code=404, detail="Emergency contact not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting emergency contact: {str(e)}")

# Emergency Alert Endpoints

@router.post("/emergency-alerts", response_model=EmergencyAlert_Pydantic)
async def create_emergency_alert(alert_data: EmergencyAlertCreate):
    """Create a new emergency alert"""
    try:
        # Verify patient and contact exist
        await Patient.get(id=alert_data.patient_id)
        await EmergencyContact.get(id=alert_data.emergency_contact_id)
        
        alert = await EmergencyAlert.create(
            patient_id=alert_data.patient_id,
            emergency_contact_id=alert_data.emergency_contact_id,
            alert_type=alert_data.alert_type,
            latitude=alert_data.latitude,
            longitude=alert_data.longitude,
            location_address=alert_data.location_address,
            message_sent=alert_data.message_sent,
            whatsapp_url=alert_data.whatsapp_url
        )
        return alert
    except DoesNotExist:
        raise HTTPException(status_code=404, detail="Patient or emergency contact not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating emergency alert: {str(e)}")

@router.get("/patients/{patient_id}/emergency-alerts", response_model=List[EmergencyAlert_Pydantic])
async def get_patient_emergency_alerts(patient_id: int, limit: int = 50):
    """Get emergency alerts for a patient"""
    try:
        alerts = await EmergencyAlert.filter(patient_id=patient_id).order_by('-created_at').limit(limit)
        return alerts
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching emergency alerts: {str(e)}")

@router.put("/emergency-alerts/{alert_id}", response_model=EmergencyAlert_Pydantic)
async def update_emergency_alert(alert_id: int, alert_data: EmergencyAlertUpdate):
    """Update an emergency alert (e.g., mark as delivered, add response)"""
    try:
        alert = await EmergencyAlert.get(id=alert_id)
        
        update_data = alert_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(alert, field, value)
        
        await alert.save()
        return alert
    except DoesNotExist:
        raise HTTPException(status_code=404, detail="Emergency alert not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating emergency alert: {str(e)}")

# WhatsApp Integration Helper Endpoint

@router.get("/emergency-contacts/{contact_id}/whatsapp-url")
async def generate_whatsapp_url(contact_id: int, latitude: Optional[float] = None, longitude: Optional[float] = None):
    """Generate WhatsApp URL for emergency contact with optional location"""
    try:
        contact = await EmergencyContact.get(id=contact_id)
        
        # Clean phone number (remove spaces, dashes, etc.)
        phone_number = ''.join(filter(str.isdigit, contact.phone_number))
        
        # Create emergency message
        message = f"Emergency! I need help. This is {contact.patient.name if hasattr(contact, 'patient') else 'a patient'}."
        
        # Add location if provided
        if latitude and longitude:
            location_url = f"https://maps.google.com/?q={latitude},{longitude}"
            message += f" My location: {location_url}"
        
        # URL encode the message
        encoded_message = urllib.parse.quote(message)
        
        # Create WhatsApp URL
        whatsapp_url = f"https://wa.me/{phone_number}?text={encoded_message}"
        
        return {
            "whatsapp_url": whatsapp_url,
            "phone_number": contact.phone_number,
            "contact_name": contact.name,
            "message": message
        }
    except DoesNotExist:
        raise HTTPException(status_code=404, detail="Emergency contact not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating WhatsApp URL: {str(e)}")

# Location Services Helper Endpoint

@router.post("/emergency-alerts/send-with-location")
async def send_emergency_alert_with_location(
    patient_id: int,
    emergency_contact_id: int,
    latitude: float,
    longitude: float,
    location_address: Optional[str] = None
):
    """Send emergency alert with location data"""
    try:
        # Get contact details
        contact = await EmergencyContact.get(id=emergency_contact_id)
        patient = await Patient.get(id=patient_id)
        
        # Clean phone number
        phone_number = ''.join(filter(str.isdigit, contact.phone_number))
        
        # Create emergency message with location
        message = f"Emergency! I need help. This is {patient.name.get('given', ['Patient'])[0] if isinstance(patient.name, dict) else 'a patient'}."
        location_url = f"https://maps.google.com/?q={latitude},{longitude}"
        message += f" My location: {location_url}"
        
        if location_address:
            message += f" Address: {location_address}"
        
        # URL encode the message
        encoded_message = urllib.parse.quote(message)
        
        # Create WhatsApp URL
        whatsapp_url = f"https://wa.me/{phone_number}?text={encoded_message}"
        
        # Create alert record
        alert = await EmergencyAlert.create(
            patient_id=patient_id,
            emergency_contact_id=emergency_contact_id,
            alert_type='emergency',
            latitude=latitude,
            longitude=longitude,
            location_address=location_address,
            message_sent=message,
            whatsapp_url=whatsapp_url
        )
        
        return {
            "alert": alert,
            "whatsapp_url": whatsapp_url,
            "message": message,
            "success": True
        }
    except DoesNotExist:
        raise HTTPException(status_code=404, detail="Patient or emergency contact not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error sending emergency alert: {str(e)}")
