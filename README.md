# CareBook — Patient Appointment Frontend

Patient-facing frontend for a clinic appointment management system.
Built with Next.js 16, TypeScript, Tailwind CSS v4, TanStack Query, React Hook Form + Zod.

---

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

In **mock mode** (the default) the app runs entirely standalone — no backend needed.
Any email + a password of 6+ characters will log you in.

---

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | FastAPI backend base URL (no trailing slash) |
| `NEXT_PUBLIC_MOCK_MODE` | `"true"` | Set to `"true"` for local mock data, `"false"` to hit the real API |
| `NEXT_PUBLIC_ELEVENLABS_AGENT_ID` | _(empty)_ | ElevenLabs Conversational AI agent ID for voice booking |

### Switching from mock to real backend

1. Edit `.env.local`: set `NEXT_PUBLIC_MOCK_MODE=false` and update `NEXT_PUBLIC_API_URL`
2. Restart the dev server — **no component changes needed**

---

## Project structure

```
src/
  app/
    (auth)/           — Login & Register (unauthenticated layout)
    (app)/            — Protected pages with NavBar + client auth guard
      dashboard/      — Greeting, upcoming appointments, quick actions
      book/           — Manual form + ElevenLabs voice agent toggle
      appointments/   — All appointments with cancel/reschedule dialogs
      profile/        — View & edit patient info
  components/
    ui/               — Design-system primitives (Button, Input, Card, Badge, …)
    layout/           — AppShell, NavBar (desktop + mobile bottom-tab)
    appointments/     — AppointmentCard, BookingForm, VoiceAgent
  lib/
    api/
      client.ts       — Typed fetch wrapper — JWT attach + auto-refresh
      auth.ts         — login, register, getMe, updateProfile
      appointments.ts — list, create, cancel, reschedule + types
      mock-data.ts    — Realistic fixtures (used when MOCK_MODE=true)
    types.ts          — Shared TypeScript types (Patient, Appointment, …)
    auth-context.tsx  — Auth state + logout
  providers/          — QueryProvider (TanStack), AuthProvider
```

### Adding the /admin section (phase 2)

The route-group pattern keeps it clean — zero changes to patient code:

1. Create `src/app/(admin)/layout.tsx` with an admin auth guard
2. Create `src/components/layout/admin-shell.tsx`
3. Add admin pages under `src/app/(admin)/`

---

## Design system

All tokens live in `src/app/globals.css` as CSS custom properties.

- **Primary**: calm teal `#0D7A70`
- **Background**: warm off-white `#F7F4F0`
- **Dark mode**: token overrides under `.dark` class — toggle by adding `dark` to `<html>`

To change the palette, edit the `:root {}` block — all Tailwind utilities
(`bg-primary`, `text-muted-foreground`, `rounded-lg`, etc.) pick up changes automatically
via the `@theme inline` mapping in the same file.

---

## Tech stack

| | |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + custom CSS design tokens |
| UI primitives | shadcn/ui-style (hand-rolled, no CLI dep) |
| Forms | React Hook Form + Zod |
| Data fetching | TanStack Query v5 |
| Icons | lucide-react |
| Dates | date-fns v4 + react-day-picker v8 |
| Voice booking | ElevenLabs Conversational AI web component |
