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
    
    slot = supabase.table("appointments").select("id").eq("appointment_date", date).lt("start_time", endTime).gt("end_time", str(startTime)).neq("status", "cancelled").execute()
    
    if not slot.data:
        return True
    else:
        return False