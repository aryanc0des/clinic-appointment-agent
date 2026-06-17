from db import *
from fastapi import HTTPException
from datetime import timedelta, datetime

#calculating end time of a session#

def calcEndTime(serviceID, startTime):
    duration = supabase.table("services").select("duration_minutes").eq("id", serviceID).execute()
    
    if not duration.data:
        raise HTTPException(status_code=400, detail="service id doesnt exist")
    
    start_dt = datetime.combine(datetime.today(), startTime)
    end_dt = start_dt + timedelta(minutes=duration.data[0]["duration_minutes"])
    return end_dt.time()