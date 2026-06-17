from typing import Optional
from pydantic import BaseModel, EmailStr
from datetime import *

class BookAppointment(BaseModel):
    patient_name: str
    service_id: str
    appointment_date: date
    start_time: time
    
class Register(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    
    