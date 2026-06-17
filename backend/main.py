from fastapi import FastAPI, HTTPException, Depends, Header
from models import *
from db import *
from services.appointments import *
from services.auth import *

app = FastAPI()


@app.post("/register-user")
def registerUser(userData: Register):
    try:
        raw_password = userData.password
        data = userData.model_dump(mode="json")
        data.pop("password")
        data["hashed_password"] = hash_password(raw_password)
        res = supabase.table("patients").insert(data).execute()

        patient = res.data[0]
        return {
            "message": "User registered successfully",
            "user": {
                "id": patient["id"],
                "full_name": patient["full_name"],
                "email": patient["email"]
            }
        }
         
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))
        

        
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