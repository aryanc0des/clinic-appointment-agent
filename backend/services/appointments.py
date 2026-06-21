from db import *
from fastapi import HTTPException
from datetime import timedelta, datetime, time

#calculating end time of a session#

def calcEndTime(serviceID, startTime):
    duration = supabase.table("services").select("duration_minutes").eq("id", serviceID).execute()
    
    if not duration.data:
        raise HTTPException(status_code=400, detail="service id doesnt exist")
    
    start_dt = datetime.combine(datetime.today(), startTime)
    end_dt = start_dt + timedelta(minutes=duration.data[0]["duration_minutes"])
    return end_dt.time()

def is_slot_available(serviceID, startTime, date):
    endTime = str(calcEndTime(serviceID, time.fromisoformat(startTime)))

    slot = supabase.table("appointments").select("id").eq("appointment_date", date).lt("start_time", endTime).gt("end_time", str(startTime)).eq("status", "scheduled").execute()

    if not slot.data:
        return True
    else:
        return False

def find_service_by_name(name):
    services = supabase.table("services").select("*").execute().data
    name_lower = name.strip().lower()

    for s in services:
        if s["name"].lower() == name_lower:
            return s

    for s in services:
        if name_lower in s["name"].lower() or s["name"].lower() in name_lower:
            return s

    return None

def find_alternative_slots(service_id, target_date, target_time, max_results=3):
    duration = supabase.table("services").select("duration_minutes").eq("id", service_id).execute().data[0]["duration_minutes"]

    alternatives = []
    slot = datetime.combine(target_date, time(10, 0))
    end_of_day = datetime.combine(target_date, time(21, 0))

    while slot + timedelta(minutes=duration) <= end_of_day and len(alternatives) < max_results:
        slot_time_str = slot.time().strftime("%H:%M:%S")
        if slot.time() != target_time and is_slot_available(service_id, slot_time_str, str(target_date)):
            alternatives.append(slot.time().strftime("%H:%M"))
        slot += timedelta(minutes=30)

    return alternatives

def shape_staff_appointment(row, service_map):
    svc = service_map.get(row["service_id"], {})
    return {
        "id": row["id"],
        "patient_id": row["patient_id"],
        "patient_name": row["patient_name"],
        "service_id": row["service_id"],
        "service_name": svc.get("name", "Unknown"),
        "appointment_date": row["appointment_date"],
        "start_time": row["start_time"],
        "end_time": row["end_time"],
        "status": row["status"],
        "booking_channel": row["booking_channel"],
        "treatment_plan_id": row["treatment_plan_id"],
        "session_number": row["session_number"],
        "created_at": row["created_at"],
    }

def shape_patient_appointment(row, service_map):
    svc = service_map.get(row["service_id"], {})
    return {
        "id": row["id"],
        "patient_id": row["patient_id"],
        "full_name": row["patient_name"],
        "appointment_date": row["appointment_date"],
        "appointment_time": row["start_time"],
        "appointment_type_id": row["service_id"],
        "appointment_type": {
            "id": row["service_id"],
            "name": svc.get("name", "Unknown"),
            "duration_minutes": svc.get("duration_minutes"),
        },
        "status": row["status"],
        "created_at": row["created_at"],
    }