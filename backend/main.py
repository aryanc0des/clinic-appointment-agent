import os
import uuid
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from models import *
from db import *
from services.appointments import *
from services.auth import *
from services.email import *
from services.treatment_plans import *

app = FastAPI()

allowed_origins = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/refresh")
def refreshToken(tokenData: RefreshToken):
    try:
        decode = verify_token(tokenData.refresh_token)
        userID = decode["user_id"]
        role = decode.get("role", "patient")

        if decode.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")

        return {"access_token": create_token(userID, role), "token_type": "bearer"}
    
    except HTTPException:
        raise
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
        access_token = create_token(user_id.data[0]["id"], "patient")
        refresh_token = create_refresh_token(user_id.data[0]["id"], "patient")

        return {
            "message": "User logged in",
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer"
            }

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))

@app.post("/login-staff")
def loginStaff(staffData: Login):

    email = supabase.table("staff").select("email").eq("email", staffData.email).execute()

    if not email.data:
        raise HTTPException(status_code=401, detail="Invalid Credentials")

    hashed_password = supabase.table("staff").select("hashed_password").eq("email", staffData.email).execute()
    verification = verify_password(staffData.password, hashed_password.data[0]["hashed_password"])

    if verification == False:
        raise HTTPException(status_code=401, detail="Invalid Credentials")

    try:
        staff_id = supabase.table("staff").select("id").eq("email", staffData.email).execute()
        access_token = create_token(staff_id.data[0]["id"], "staff")
        refresh_token = create_refresh_token(staff_id.data[0]["id"], "staff")

        return {
            "message": "Staff logged in",
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer"
            }

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))

@app.get("/staff/me")
def getStaffMe(current_user = Depends(get_current_staff)):
    res = supabase.table("staff").select("id, full_name, email").eq("id", current_user["user_id"]).execute()

    if not res.data:
        raise HTTPException(status_code=404, detail="Staff not found")

    s = res.data[0]
    return {"id": s["id"], "full_name": s["full_name"], "email": s["email"], "role": "staff"}

@app.get("/me")
def getMe(current_user = Depends(get_current_user)):
    res = supabase.table("patients").select("id, full_name, email, phone, created_at").eq("id", current_user["user_id"]).execute()

    if not res.data:
        raise HTTPException(status_code=404, detail="Patient not found")

    return res.data[0]

@app.patch("/me")
def updateMe(updates: UpdateProfile, current_user = Depends(get_current_user)):
    update_data = updates.model_dump(exclude_none=True)

    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    res = supabase.table("patients").update(update_data).eq("id", current_user["user_id"]).execute()

    if not res.data:
        raise HTTPException(status_code=404, detail="Patient not found")

    p = res.data[0]
    return {
        "id": p["id"],
        "full_name": p["full_name"],
        "email": p["email"],
        "phone": p.get("phone"),
        "created_at": p["created_at"],
    }

@app.get("/appointments")
def listMyAppointments(current_user = Depends(get_current_user)):
    patientID = current_user["user_id"]
    appointments = supabase.table("appointments").select("*").eq("patient_id", patientID).execute().data
    services = supabase.table("services").select("id, name, duration_minutes").execute().data
    service_map = {s["id"]: s for s in services}

    return [shape_patient_appointment(a, service_map) for a in appointments]

@app.post("/book-appointment")
def bookAppointmentManual(appointment: BookAppointment, current_user = Depends(get_current_user)):
    data = appointment.model_dump(mode="json")
    serviceID = data["service_id"]
    startTime = data["start_time"]
    date = data["appointment_date"]

    try:
        serviceTable = supabase.table("services").select("*").eq("id", serviceID).execute()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid service_id")

    if not serviceTable.data:
        raise HTTPException(status_code=400, detail="Service not found")
    service = serviceTable.data[0]

    if is_slot_available(serviceID, startTime, date):
        try:
            endTime = calcEndTime(appointment.service_id, appointment.start_time)
            patientID = current_user["user_id"]
            data["end_time"] = str(endTime)
            data["patient_id"] = str(patientID)

            if service["is_multi_session"]:
                plan = supabase.table("treatment_plans").insert({
                    "patient_id": str(patientID),
                    "service_id": serviceID,
                    "total_sessions": service["session_count"],
                    "current_session": 1,
                    "status": "in_progress",
                }).execute()
                data["treatment_plan_id"] = plan.data[0]["id"]
                data["session_number"] = 1

            res = supabase.table("appointments").insert(data).execute()

            patientTable = supabase.table("patients").select("email, full_name").eq("id", patientID).execute()

            send_booking_confirmation(patientTable.data[0]["email"], patientTable.data[0]["full_name"], date, startTime, service["name"])

            return shape_patient_appointment(res.data[0], {serviceID: service})

        except HTTPException:
            raise
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
            "Appointments": res
        }
        
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error)) 
    
@app.get("/past_appointments")
def pastAppointments(current_user = Depends(get_current_user)):
    try:
        patientID = current_user["user_id"]
        res = supabase.table("appointments").select("*").eq("patient_id", patientID).in_("status", ["completed", "cancelled", "missed"]).execute()
        
        return {
            "message": "Past Appoinments",
            "Appointments": res
        }
        
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error)) 
    
@app.patch("/cancel-appointment/{appointment_id}")
def cancelAppointment(appointment_id: str, current_user = Depends(get_current_user)):
    
    try:
        patientID = current_user["user_id"]
        patient = supabase.table("appointments").update({"status": "cancelled"}).eq("patient_id", patientID).eq("status", "scheduled").eq("id", appointment_id).execute()

        if not patient.data:
            raise HTTPException(status_code=404, detail="Appointment not found")

        row = patient.data[0]
        service = supabase.table("services").select("id, name, duration_minutes").eq("id", row["service_id"]).execute()
        service_map = {row["service_id"]: service.data[0]} if service.data else {}

        return shape_patient_appointment(row, service_map)


    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))
    
@app.patch("/appointments/{id}/reschedule")
def rescheduleAppointment(id: str, rescheduleData: RescheduleAppointment, current_user = Depends(get_current_user)):
    appointmentData = supabase.table("appointments").select("*").eq("id", id).execute()
        
    if not appointmentData.data:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    serviceID = appointmentData.data[0]["service_id"]
    is_staff = current_user.get("role") == "staff"

    if is_slot_available(serviceID, str(rescheduleData.appointment_time), rescheduleData.appointment_date):
        try:
            reschedule_data = rescheduleData.model_dump(mode="json")
            reschedule_data["start_time"] = reschedule_data.pop("appointment_time")
            endTime = calcEndTime(serviceID, rescheduleData.appointment_time)
            reschedule_data["end_time"] = str(endTime)

            query = supabase.table("appointments").update(reschedule_data).eq("id", id)
            if not is_staff:
                query = query.eq("patient_id", current_user["user_id"])
            res = query.execute()

            if not res.data:
                raise HTTPException(status_code=403, detail="Not authorized")
            else:
                row = res.data[0]
                service = supabase.table("services").select("id, name, duration_minutes").eq("id", serviceID).execute()
                service_map = {serviceID: service.data[0]} if service.data else {}
                if is_staff:
                    return shape_staff_appointment(row, service_map)
                return shape_patient_appointment(row, service_map)

        except HTTPException:
            raise
        except Exception as error:
            raise HTTPException(status_code=500, detail=str(error))

    else:
        raise HTTPException(status_code=409, detail="This time slot is already booked. Please choose a different time.")

@app.get("/services")
def listServices(current_user = Depends(get_current_user)):
    res = supabase.table("services").select("*").execute()
    return [
        {
            "id": s["id"],
            "name": s["name"],
            "price": s["price_rupees"],
            "duration_minutes": s["duration_minutes"],
            "is_multi_session": s["is_multi_session"],
            "session_count": s["session_count"],
        }
        for s in res.data
    ]

@app.patch("/staff/services/{service_id}")
def updateService(service_id: str, updates: UpdateService, current_user = Depends(get_current_staff)):
    update_data = updates.model_dump(exclude_none=True)

    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    res = supabase.table("services").update(update_data).eq("id", service_id).execute()

    if not res.data:
        raise HTTPException(status_code=404, detail="Service not found")

    s = res.data[0]
    return {
        "id": s["id"],
        "name": s["name"],
        "price": s["price_rupees"],
        "duration_minutes": s["duration_minutes"],
        "is_multi_session": s["is_multi_session"],
        "session_count": s["session_count"],
    }

@app.get("/staff/appointments")
def listStaffAppointments(current_user = Depends(get_current_staff)):
    appointments = supabase.table("appointments").select("*").execute().data
    services = supabase.table("services").select("id, name").execute().data
    service_map = {s["id"]: s for s in services}

    return [shape_staff_appointment(a, service_map) for a in appointments]

@app.patch("/staff/appointments/{appointment_id}/status")
def updateStaffAppointmentStatus(appointment_id: str, statusData: UpdateAppointmentStatus, current_user = Depends(get_current_staff)):
    allowed_statuses = {"scheduled", "completed", "cancelled", "missed"}

    if statusData.status not in allowed_statuses:
        raise HTTPException(status_code=400, detail=f"status must be one of {sorted(allowed_statuses)}")

    res = supabase.table("appointments").update({"status": statusData.status}).eq("id", appointment_id).execute()

    if not res.data:
        raise HTTPException(status_code=404, detail="Appointment not found")

    row = res.data[0]
    service = supabase.table("services").select("id, name").eq("id", row["service_id"]).execute()
    service_map = {row["service_id"]: service.data[0]} if service.data else {}

    return shape_staff_appointment(row, service_map)

@app.get("/staff/treatment-plans")
def listTreatmentPlans(current_user = Depends(get_current_staff)):
    return get_all_treatment_plans()

@app.get("/staff/treatment-plans/{plan_id}")
def getTreatmentPlan(plan_id: str, current_user = Depends(get_current_staff)):
    return get_treatment_plan(plan_id)

@app.post("/staff/treatment-plans/{plan_id}/sessions/{session_number}/complete")
def completeTreatmentSession(plan_id: str, session_number: int, current_user = Depends(get_current_staff)):
    return mark_session_complete(plan_id, session_number)

@app.post("/staff/treatment-plans/{plan_id}/sessions/{session_number}/schedule")
def scheduleTreatmentSession(plan_id: str, session_number: int, sessionData: ScheduleSession, current_user = Depends(get_current_staff)):
    return schedule_session(plan_id, session_number, sessionData.appointment_date, sessionData.start_time)

@app.get("/staff/patients")
def listStaffPatients(current_user = Depends(get_current_staff)):
    patients = supabase.table("patients").select("id, full_name, email, phone, created_at").execute().data
    appointments = supabase.table("appointments").select("patient_id").execute().data
    plans = supabase.table("treatment_plans").select("patient_id").eq("status", "in_progress").execute().data

    appointment_counts = {}
    for a in appointments:
        appointment_counts[a["patient_id"]] = appointment_counts.get(a["patient_id"], 0) + 1

    plan_counts = {}
    for p in plans:
        plan_counts[p["patient_id"]] = plan_counts.get(p["patient_id"], 0) + 1

    return [
        {
            "id": p["id"],
            "full_name": p["full_name"],
            "email": p["email"],
            "phone": p.get("phone"),
            "created_at": p["created_at"],
            "total_appointments": appointment_counts.get(p["id"], 0),
            "active_treatment_plans": plan_counts.get(p["id"], 0),
        }
        for p in patients
    ]

@app.post("/api/voice/check-availability")
def voiceCheckAvailability(payload: VoiceCheckAvailability, _voice_auth = Depends(verify_voice_secret)):
    service = find_service_by_name(payload.service)

    if not service:
        return {"available": False, "reason": f"We don't offer a service called '{payload.service}'.", "alternatives": []}

    if is_slot_available(service["id"], str(payload.time), str(payload.date)):
        return {"available": True, "reason": None, "alternatives": []}

    alternatives = find_alternative_slots(service["id"], payload.date, payload.time)
    return {
        "available": False,
        "reason": "That time is already booked.",
        "alternatives": alternatives,
    }

@app.post("/api/voice/book")
def voiceBookAppointment(payload: VoiceBookAppointment, _voice_auth = Depends(verify_voice_secret)):
    service = find_service_by_name(payload.service)

    if not service:
        raise HTTPException(status_code=400, detail=f"We don't offer a service called '{payload.service}'.")

    if not is_slot_available(service["id"], str(payload.time), str(payload.date)):
        raise HTTPException(status_code=409, detail="This time slot is already booked. Please choose a different time.")

    try:
        patient_id = None

        if payload.patient_id:
            existing = supabase.table("patients").select("id").eq("id", payload.patient_id).execute()
            if existing.data:
                patient_id = existing.data[0]["id"]

        if not patient_id:
            guest_email = f"voice-{uuid.uuid4()}@smilecare.voice"
            guest_password_hash = hash_password(str(uuid.uuid4()))
            patient_res = supabase.table("patients").insert({
                "full_name": payload.patient_name,
                "email": guest_email,
                "hashed_password": guest_password_hash,
            }).execute()
            patient_id = patient_res.data[0]["id"]

        end_time = calcEndTime(service["id"], payload.time)

        appt_data = {
            "patient_id": patient_id,
            "patient_name": payload.patient_name,
            "service_id": service["id"],
            "appointment_date": str(payload.date),
            "start_time": str(payload.time),
            "end_time": str(end_time),
            "status": "scheduled",
            "booking_channel": "voice",
        }

        if service["is_multi_session"]:
            plan = supabase.table("treatment_plans").insert({
                "patient_id": patient_id,
                "service_id": service["id"],
                "total_sessions": service["session_count"],
                "current_session": 1,
                "status": "in_progress",
            }).execute()
            appt_data["treatment_plan_id"] = plan.data[0]["id"]
            appt_data["session_number"] = 1

        res = supabase.table("appointments").insert(appt_data).execute()
        confirmation_id = res.data[0]["id"]

        return {
            "success": True,
            "confirmation_id": confirmation_id,
            "message": f"You're all set, {payload.patient_name}. Your {service['name']} appointment is confirmed for {payload.date} at {payload.time}.",
        }

    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))