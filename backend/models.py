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