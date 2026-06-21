import resend
import os
from dotenv import load_dotenv

load_dotenv()

RESEND_API = os.getenv("RESEND_API_KEY")
resend.api_key = RESEND_API

def send_booking_confirmation(patient_email ,patient_name, appointment_date, appointment_time, service_name):
    r = resend.Emails.send({
        "from": "onboarding@resend.dev", 
        "to": "aryang62004@gmail.com",
        "subject": "Appointment Confirmed — CareBook",
        "html": f"Hi {patient_name}, your appointment is confirmed for {appointment_date} at {appointment_time}. Service: {service_name}."
    })
