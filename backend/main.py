from fastapi import FastAPI, HTTPException
from models import *
from db import *
from services.appointments import *

app = FastAPI()



@app.post("/book-appointment")
def bookAppointmentManual(appointment: BookAppointment):
    try:
        endTime = calcEndTime(appointment.service_id, appointment.start_time)
        data = appointment.model_dump(mode="json")
        data["end_time"] = str(endTime)
        res = supabase.table("appointments").insert(data).execute()
        
        return {
            "message": "Booking Successfull",
            "Appointment": res
        }
        
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error)) 