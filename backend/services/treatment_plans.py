from db import supabase
from fastapi import HTTPException
from services.appointments import calcEndTime, is_slot_available

def _build_plan_response(plan, patient_name, service_name, appointments_for_plan):
    appts_by_session = {a["session_number"]: a for a in appointments_for_plan}
    sessions = []

    for n in range(1, plan["total_sessions"] + 1):
        appt = appts_by_session.get(n)
        if appt:
            sessions.append({
                "id": appt["id"],
                "treatment_plan_id": plan["id"],
                "session_number": n,
                "appointment_date": appt["appointment_date"],
                "start_time": appt["start_time"],
                "status": appt["status"],
            })
        else:
            sessions.append({
                "id": f"{plan['id']}-session-{n}",
                "treatment_plan_id": plan["id"],
                "session_number": n,
                "appointment_date": None,
                "start_time": None,
                "status": "scheduled",
            })

    return {
        "id": plan["id"],
        "patient_id": plan["patient_id"],
        "patient_name": patient_name,
        "service_id": plan["service_id"],
        "service_name": service_name,
        "total_sessions": plan["total_sessions"],
        "current_session": plan["current_session"],
        "status": plan["status"],
        "sessions": sessions,
        "created_at": plan["created_at"],
    }

def get_all_treatment_plans():
    plans = supabase.table("treatment_plans").select("*").execute().data
    if not plans:
        return []

    patient_ids = list({p["patient_id"] for p in plans})
    service_ids = list({p["service_id"] for p in plans})
    plan_ids = [p["id"] for p in plans]

    patients = supabase.table("patients").select("id, full_name").in_("id", patient_ids).execute().data
    services = supabase.table("services").select("id, name").in_("id", service_ids).execute().data
    appointments = supabase.table("appointments").select("*").in_("treatment_plan_id", plan_ids).execute().data

    patient_names = {p["id"]: p["full_name"] for p in patients}
    service_names = {s["id"]: s["name"] for s in services}

    return [
        _build_plan_response(
            plan,
            patient_names.get(plan["patient_id"], "Unknown"),
            service_names.get(plan["service_id"], "Unknown"),
            [a for a in appointments if a["treatment_plan_id"] == plan["id"]],
        )
        for plan in plans
    ]

def get_treatment_plan(plan_id):
    plan_res = supabase.table("treatment_plans").select("*").eq("id", plan_id).execute()
    if not plan_res.data:
        raise HTTPException(status_code=404, detail="Treatment plan not found")

    plan = plan_res.data[0]
    patient = supabase.table("patients").select("full_name").eq("id", plan["patient_id"]).execute()
    service = supabase.table("services").select("name").eq("id", plan["service_id"]).execute()
    appointments = supabase.table("appointments").select("*").eq("treatment_plan_id", plan_id).execute().data

    return _build_plan_response(
        plan,
        patient.data[0]["full_name"] if patient.data else "Unknown",
        service.data[0]["name"] if service.data else "Unknown",
        appointments,
    )

def mark_session_complete(plan_id, session_number):
    plan_res = supabase.table("treatment_plans").select("*").eq("id", plan_id).execute()
    if not plan_res.data:
        raise HTTPException(status_code=404, detail="Treatment plan not found")

    plan = plan_res.data[0]

    if plan["status"] != "in_progress":
        raise HTTPException(status_code=409, detail="Treatment plan is not in progress")

    if session_number != plan["current_session"]:
        raise HTTPException(status_code=409, detail="Only the current session can be marked complete")

    appt_res = supabase.table("appointments").select("*").eq("treatment_plan_id", plan_id).eq("session_number", session_number).execute()
    if not appt_res.data:
        raise HTTPException(status_code=404, detail="This session has not been scheduled yet")

    appt = appt_res.data[0]
    if appt["status"] != "scheduled":
        raise HTTPException(status_code=409, detail="Session is not in a scheduled state")

    supabase.table("appointments").update({"status": "completed"}).eq("id", appt["id"]).execute()

    next_session = session_number + 1
    plan_finished = next_session > plan["total_sessions"]

    supabase.table("treatment_plans").update({
        "current_session": plan["total_sessions"] if plan_finished else next_session,
        "status": "completed" if plan_finished else "in_progress",
    }).eq("id", plan_id).execute()

    return get_treatment_plan(plan_id)

def schedule_session(plan_id, session_number, appointment_date, start_time):
    plan_res = supabase.table("treatment_plans").select("*").eq("id", plan_id).execute()
    if not plan_res.data:
        raise HTTPException(status_code=404, detail="Treatment plan not found")

    plan = plan_res.data[0]

    if plan["status"] != "in_progress":
        raise HTTPException(status_code=409, detail="Treatment plan is not in progress")

    if session_number != plan["current_session"]:
        raise HTTPException(status_code=409, detail="Only the current session can be scheduled")

    existing = supabase.table("appointments").select("id").eq("treatment_plan_id", plan_id).eq("session_number", session_number).execute()
    if existing.data:
        raise HTTPException(status_code=409, detail="This session is already scheduled")

    if not is_slot_available(plan["service_id"], str(start_time), appointment_date):
        raise HTTPException(status_code=409, detail="This time slot is already booked. Please choose a different time.")

    end_time = calcEndTime(plan["service_id"], start_time)
    patient = supabase.table("patients").select("full_name").eq("id", plan["patient_id"]).execute()

    supabase.table("appointments").insert({
        "patient_id": plan["patient_id"],
        "patient_name": patient.data[0]["full_name"] if patient.data else None,
        "service_id": plan["service_id"],
        "appointment_date": str(appointment_date),
        "start_time": str(start_time),
        "end_time": str(end_time),
        "status": "scheduled",
        "booking_channel": "manual",
        "treatment_plan_id": plan_id,
        "session_number": session_number,
    }).execute()

    return get_treatment_plan(plan_id)
