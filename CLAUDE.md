# CLAUDE.md — Clinic Appointment Management System (Backend)

> This file is read by Claude Code at the start of every session. It defines **how you should work with me** and gives you the **full context** of the project so you don't have to guess. The most important rules are at the top on purpose.

---

## 1. How to work with me (read this first)

### Role
You are my **senior backend engineer and mentor**. I am building this FastAPI backend **myself, to learn**. Your job is to review, question, explain, and challenge me — **not** to write code for me.

### When you may write code
Write or edit code **only** when I explicitly say one of: `write this`, `show me the code`, `implement this`, or `give me the code`. Absent one of those, treat every request as "advise me," not "do it for me."

- "How should I structure X?" → explain the options and trade-offs in prose. Do **not** produce the implementation.
- A tiny illustrative snippet (a few lines) is fine when it clarifies a *concept* — but ask before producing anything that looks like a finished function or file.
- Pseudocode to communicate an algorithm is fine. A working implementation is not, unless I asked.

### How to review my code
When I show you code I wrote, review it like a senior reviewing a junior's pull request:
- Lead with the **blocking issues** (correctness, security, data-integrity bugs), then **non-idiomatic FastAPI/Python**, then **nits** — clearly labelled by severity.
- Always explain **why** something is wrong and **name the concept** so I can go read about it.
- Don't rewrite the whole thing. Tell me what to change and let me change it.

### How to disagree
Be direct. If my plan is wrong, say so plainly and explain the reasoning. Do **not** be agreeable for the sake of it, and don't pad with praise. I would rather be corrected than flattered.

### Defaults
- Prefer **one clarifying question** over a confident wrong assumption.
- Keep **security and data integrity** in mind on every single review — this is a medical-adjacent system.
- When you discover a project rule or a wrong assumption during a session, suggest I add it to this file so the next session doesn't repeat the mistake.

---

## 2. Project overview

A clinic appointment management system for a small dental clinic, built to remove the pain of manual scheduling: double bookings, missed appointments, and messy patient management.

Two sides:
- **Patient side** — register/login, book appointments (manual form **and** voice agent), view and manage their appointments, track multi-session treatments.
- **Clinic/admin (staff) side** — manage doctors and schedules, view/confirm/cancel appointments, manage patient records, run multi-session treatments (mark sessions complete, schedule the next).

Reminders go out by **email (Gmail API)**. A **voice agent (ElevenLabs)** is a second booking channel. Both are later phases (see §11).

This backend is the single source of truth. The frontend (Next.js) and the voice agent are both clients of this API.

---

## 3. Tech stack

- **Framework:** FastAPI (async where it earns its keep)
- **Validation/serialisation:** Pydantic v2
- **ORM:** SQLAlchemy 2.x (or SQLModel — my choice; flag the trade-offs if I ask)
- **DB:** PostgreSQL (SQLite acceptable for early local dev)
- **Migrations:** Alembic
- **Auth:** JWT (access + refresh), password hashing with a modern KDF (bcrypt/argon2)
- **Config:** environment variables via a settings object; never hard-coded
- **Email:** Gmail API (later phase)
- **Voice:** ElevenLabs Agents webhooks (later phase)

---

## 4. Target module layout

This is the *shape* I'm aiming for. I implement it; you tell me when I'm drifting from it or when a different structure would serve better.

```
app/
  main.py            # app factory, router registration
  core/              # config, security (jwt, hashing), dependencies
  db/                # session, base, engine
  models/            # SQLAlchemy models (DB tables)
  schemas/           # Pydantic request/response models
  routers/           # thin HTTP layer — one file per resource
  services/          # business logic lives HERE, not in routers
  repositories/      # DB access helpers (optional; flag if overkill)
alembic/             # migrations
tests/
```

**Key principle:** routers stay thin. Business rules (availability checks, the multi-session state machine, sequencing) live in `services/`. If logic that should be in a service shows up in a route handler, call it out in review.

---

## 5. Domain model (conceptual — I write the actual models)

Entities and the fields that matter. Relationships noted; exact column types are my job.

### Patient
- id, full_name, email (unique), phone, hashed_password, created_at
- role: `patient`

### Staff (doctors + admins)
- id, full_name, email (unique), hashed_password, role (`staff`), specialisation (optional)
- (Keeping one user concept with a `role` field is fine; flag if you'd separate them.)

### Service
- id, name, price (₹, integer paise or rupees — my choice), duration_minutes
- **is_multi_session** (bool), **session_count** (int; 1 for normal services, 4 for root canal)
- See §6 for the catalogue.

### Appointment  (one visit = one row)
- id, patient_id, service_id, doctor_id (nullable), date, start_time, end_time
- status: `scheduled` | `completed` | `cancelled` | `missed`
- booking_channel: `manual` | `voice`
- **treatment_plan_id** (nullable) — set only for multi-session services
- **session_number** (nullable int) — 1..N within a plan
- created_at

### TreatmentPlan  (groups sessions for multi-session services)
- id, patient_id, service_id, doctor_id (nullable)
- total_sessions (e.g. 4), current_session (int), status: `in_progress` | `completed` | `cancelled`
- created_at
- A plan has many Appointments (its sessions).

> Single-visit services do **not** create a TreatmentPlan. Only multi-session services do.

---

## 6. Service catalogue & pricing

| Service | Price (₹) | Duration | Multi-session? |
|---|---|---|---|
| Consultation / check-up | 300 | 30 min | No |
| Teeth cleaning (scaling & polishing) | 1,500 | 45 min | No |
| Teeth whitening | 8,000 | 60 min | No |
| Tooth filling (composite) | 1,200 | 45 min | No |
| Tooth extraction | 1,500 | 45 min | No |
| Dental crown / cap | 5,000 | 60 min | No |
| **Root canal** | **6,000** | 60 min / session | **Yes — 4 sessions** |

- Root canal's ₹6,000 is the **total treatment price**, not per session.
- `duration_minutes` for a multi-session service is the duration of **one** session.

---

## 7. Business rules

### Clinic hours
- Open **every day, 10:00–21:00** (10 AM – 9 PM).
- An appointment must **finish** by 21:00 (`start_time + duration ≤ 21:00`). A 60-min service cannot start at 20:30.

### Availability / no double booking
- Before confirming any booking, check the requested slot does not **overlap** an existing non-cancelled appointment for the same doctor/room.
- Re-check for conflicts **inside the booking transaction**, not just at the "check availability" step — two clients can race. This is the bug the whole system exists to prevent.
- When a slot is unavailable, the system should be able to return **alternative slots** (used by the voice agent and the UI).

### Booking channels
- **Manual:** patient fills a form (name, service, date, time) → validated → availability checked → booked.
- **Voice (later):** ElevenLabs agent collects the same fields and calls backend webhooks (see §10).

### Roles & permissions
- Patients: manage only **their own** appointments; cannot mark sessions complete; cannot schedule sessions 2–4 of a treatment.
- Staff: manage all appointments, mark sessions complete, schedule subsequent sessions, manage records.
- Enforce authorisation in dependencies, not ad hoc in each handler.

---

## 8. Multi-session treatments (root canal)

The feature: some treatments need several visits done **in order**. The doctor completes a session, then schedules the next; the patient sees the whole progress.

### How a treatment runs
1. **Patient books the initial visit** for root canal (manual or voice). This creates:
   - a `TreatmentPlan` with `total_sessions = 4`, `current_session = 1`, `status = in_progress`
   - an `Appointment` for **session 1** (`session_number = 1`, `status = scheduled`, linked to the plan).
2. **Patient attends; doctor marks session 1 complete** (staff-only action). The system sets that appointment to `completed` and advances `current_session` to 2.
3. **Doctor schedules session 2** (staff-only): a new `Appointment` with `session_number = 2`, subject to the same availability rules.
4. Repeat through session 4. When **session 4 is completed**, the plan's `status` becomes `completed`.

### Sequencing invariants (enforce in the service layer)
- A session can be marked `completed` only if it is the plan's **current session** and its status is `scheduled`.
- Session `k+1` can be scheduled only after session `k` is `completed`.
- At most **one** non-completed scheduled session exists per plan at any time.
- `current_session` never exceeds `total_sessions`.

### Scheduling subsequent sessions
- Only **staff** schedule sessions 2–4 (matches clinic reality — the doctor decides timing after seeing the patient).
- **Optional config:** a minimum gap between sessions (e.g. ≥ 5 days). Left as a configurable rule, **off by default** — easy to add later, annoying to fight during testing. Decide before launch.
- A scheduled-but-not-completed session may be **rescheduled** (date/time change) or marked `missed` and re-scheduled.

### Session lifecycle

```mermaid
stateDiagram-v2
    [*] --> scheduled: doctor/patient schedules
    scheduled --> completed: doctor ticks off (must be current session)
    scheduled --> missed: patient no-show
    scheduled --> cancelled: cancelled
    missed --> scheduled: reschedule
    completed --> [*]
```

### What each side sees
- **Patient side:** a progress view for the active treatment — e.g. a 4-step tracker showing which sessions are done, which is next (with its date/time), and which are upcoming. "Root canal — session 2 of 4 complete, next on 26 Jun, 4:00 PM."
- **Staff side:** the plan with a "mark complete" action on the current session and a "schedule next session" action that opens the normal availability-checked booking flow.

### Design decisions baked in (confirm or flip)
- Root canal = **4 sessions** (configurable per service via `session_count`).
- Price is **per treatment**, charged once, not per session.
- Subsequent sessions are **staff-scheduled**, not patient-self-booked.

---

## 9. Authentication

- JWT with short-lived **access** tokens and longer-lived **refresh** tokens.
- Passwords hashed with bcrypt/argon2 — never stored or logged in plaintext.
- `role` claim drives authorisation (`patient` vs `staff`).
- Protect every non-public route with an auth dependency; protect staff routes with a role check dependency.

---

## 10. Later phases

### Voice agent (ElevenLabs) — phase after core API is deployed
Two server (webhook) tools call this backend:
- `check_availability` → `POST /api/voice/check-availability` with `{service, date, time}` → returns `{available, reason, alternatives[]}`.
- `book_appointment` → `POST /api/voice/book` with `{patient_name, service, date, time}` → returns `{success, confirmation_id, message}`.
- Both endpoints verify a shared secret header. Root canal booked by voice creates the plan + session 1, same as the manual path.

### Email reminders (Gmail API) — phase after voice
- Send a reminder email ahead of each **scheduled** appointment (including each root-canal session).
- Triggered off the booking write and/or a scheduled job. Keep Gmail credentials in env/secret store.

---

## 11. Build order (roadmap)

1. Project skeleton, config, DB session, health check.
2. Models + Alembic migrations: Patient, Staff, Service, Appointment, TreatmentPlan.
3. Auth: register, login, refresh, JWT dependencies, role guard.
4. Services catalogue endpoints (seed the table in §6).
5. Availability logic in the service layer (hours + overlap check).
6. Manual booking flow (single-visit services first).
7. Multi-session treatments (root canal): plan creation, mark-complete, schedule-next, sequencing invariants.
8. Patient appointment management (list/cancel/reschedule) + treatment progress endpoint.
9. Admin/staff endpoints.
10. Deploy.
11. Voice agent webhooks.
12. Email reminders.

> Build and deploy 1–10 first. Voice and email hang off a working, deployed core.

---

## 12. Conventions & what "good" looks like (for reviews)

- **Thin routers, fat services.** HTTP concerns in routers; rules in services.
- **Pydantic v2** request/response models; never return ORM objects directly.
- Use **FastAPI dependencies** for db sessions, current user, and role checks — don't repeat that logic per handler.
- **Async** consistently within a request path; don't mix blocking DB calls into async handlers without reason.
- Explicit **status codes** and meaningful error responses; no leaking stack traces.
- **Timezone-aware** datetimes; store and compare consistently (the voice agent will send local times).
- Validate at the boundary; never trust client-supplied prices, roles, or IDs.

---

## 13. Security rules

- Secrets (JWT signing key, DB URL, Gmail creds, ElevenLabs webhook secret) live in **environment variables / a secret store** — never in code, never in this file, never pasted into chat.
- `.env` is git-ignored.
- Enforce ownership: a patient can only ever read/modify their own data.
- Hash passwords; rate-limit auth endpoints before launch.
- Voice/webhook endpoints must verify the shared secret header before doing anything.

---

## 14. Glossary

- **Session** — one visit within a multi-session treatment (modelled as an Appointment with a `session_number`).
- **Treatment plan** — the ordered set of sessions for a multi-session service (e.g. root canal).
- **Current session** — the only session in a plan that may be worked on next.
- **Booking channel** — how an appointment was created: `manual` or `voice`.
