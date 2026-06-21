from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from datetime import *

class BookAppointment(BaseModel):
    patient_name: str
    service_id: str
    appointment_date: date
    start_time: time
    
class Register(BaseModel):
    full_name: str
    email: EmailStr
    password: str = Field(min_length=8)

class Login(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    
class RefreshToken(BaseModel):
    refresh_token: str
    
class RescheduleAppointment(BaseModel):
    appointment_date: date
    appointment_time: time

class UpdateAppointmentStatus(BaseModel):
    status: str

class ScheduleSession(BaseModel):
    appointment_date: date
    start_time: time

class UpdateService(BaseModel):
    price_rupees: Optional[int] = None
    duration_minutes: Optional[int] = None

class UpdateProfile(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None

class VoiceCheckAvailability(BaseModel):
    service: str
    date: date
    time: time

class VoiceBookAppointment(BaseModel):
    patient_name: str
    service: str
    date: date
    time: time