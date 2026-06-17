from fastapi import FastAPI, HTTPException, Depends
from models import *
from db import *
from services.appointments import *
from services.auth import *

app = FastAPI()

@app.post("/refresh")
def refreshToken(tokenData: RefreshToken):
    try:
        decode = verify_token(tokenData.refresh_token)
        userID = decode["user_id"]
        
        if decode.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        
        return create_token(userID)
    
    except Exception as error:
        raise HTTPException(status_code=401, detail=str(error))

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
        
@app.post("/login-user")
def loginUser(userData: Login):
    
    email = supabase.table("patients").select("email").eq("email", userData.email).execute()
    
    if not email.data:
        raise HTTPException(status_code=401, detail="Invalid Credentials")
    
    hashed_password = supabase.table("patients").select("hashed_password").eq("email", userData.email).execute()
    verification = verify_password(userData.password, hashed_password.data[0]["hashed_password"])
    
    if verification == False:
        raise HTTPException(status_code=401, detail="Invalid Credentials")
    
    try:
        user_id = supabase.table("patients").select("id").eq("email", userData.email).execute()
        print(user_id)
        access_token = create_token(user_id.data[0]["id"])
        refresh_token = create_refresh_token(user_id.data[0]["id"])
        
        return {
            "message": "User logged in",
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer"
            }
    
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))
        
@app.post("/book-appointment")
def bookAppointmentManual(appointment: BookAppointment, current_user = Depends(get_current_user)):
    data = appointment.model_dump(mode="json")
    serviceID = data["service_id"]
    startTime = data["start_time"]
    date = data["appointment_date"]
    if is_slot_available(serviceID, startTime, date):
        try:
            endTime = calcEndTime(appointment.service_id, appointment.start_time)
            patientID = current_user["user_id"]
            data["end_time"] = str(endTime)
            data["patient_id"] = str(patientID)
            res = supabase.table("appointments").insert(data).execute()
            
            return {
                "message": "Booking Successfull",
                "Appointment": res
            }
            
        except Exception as error:
            raise HTTPException(status_code=500, detail=str(error)) 
        
    else:
        raise HTTPException(status_code=409, detail="This time slot is already booked. Please choose a different time.")
    
    
@app.get("/active_appointments")
def activeAppointments(current_user = Depends(get_current_user)):
    try:
        patientID = current_user["user_id"]
        res = supabase.table("appointments").select("*").eq("patient_id", patientID).eq("status", "scheduled").execute()
        
        return {
            "message": "Active Appoinments",
            "Appointmens": res
        }
        
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error)) 