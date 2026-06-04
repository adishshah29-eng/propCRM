# EstateFlow CRM

The real estate sales operating system. Cloud-based, mobile-first CRM built with Next.js 15, Supabase, and Twilio.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS
- **Database:** Supabase PostgreSQL with RLS
- **Auth:** Supabase Auth (JWT)
- **Realtime:** Supabase Realtime
- **State:** Zustand (client), TanStack Query (server)
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts
- **Icons:** Lucide React

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables
cp .env.example .env.local
# Fill in your Supabase, Twilio, Resend, OpenAI keys

# 3. Run database migrations (Supabase CLI or SQL Editor)
# Apply supabase/migrations/001_organizations.sql through 013_rls_policies.sql
# Then run supabase/seed.sql

# 4. Start dev server
npm run dev
```

## Project Structure

```
src/
  app/           # Next.js App Router pages (grouped by role)
  components/    # React components (ui, common, charts, leads, etc.)
  services/      # External API adapters (Twilio, WhatsApp, OpenAI)
  lib/           # Utilities, Supabase clients, validations
  hooks/         # React hooks (useAuth, useLeads, useRealtime, etc.)
  store/         # Zustand stores (auth, ui, lead, notification)
  types/         # TypeScript types
  constants/     # App constants (roles, statuses, routes)
supabase/
  migrations/    # 13 SQL migration files
  seed.sql       # Complete seed data
```

## Default Login (Seed Data)

| Role | Email | Password |
|------|-------|----------|
| Super Admin | super@estateflow.demo | password123 |
| Admin | admin@estateflow.demo | password123 |
| Manager | manager1@estateflow.demo | password123 |
| Caller | caller1@estateflow.demo | password123 |
| Field Exec | field@estateflow.demo | password123 |
| Social Manager | social@estateflow.demo | password123 |

## Sessions

- ✅ SESSION 01 — Database Schema + Migrations + RLS + Seed
- ✅ SESSION 02 — Auth + Routing Shell + Layouts + Design System
- ✅ SESSION 03 — Super Admin (Complete, End to End)
- ✅ SESSION 04 — Admin (Complete, End to End)
- ✅ SESSION 05 — Manager (Complete, End to End)
- ✅ SESSION 06 — Caller (Complete, End to End)
- ✅ SESSION 07 — Field Executive (Complete, End to End)
- ✅ SESSION 08 — Social Media Manager (Complete, End to End)
- ✅ SESSION 09 — Notifications + Realtime (All Roles)
- ✅ SESSION 10 — Intelligence Layer
- ✅ SESSION 11 — Reports + Analytics (All Roles)
- ✅ SESSION 12 — AWS Migration + Production Deploy

## Features Implemented

### Core CRM
- Role-based auth (6 roles) with Supabase
- Lead management with scoring, temperature, status pipeline
- Deal pipeline with drag-and-drop Kanban
- Property and asset catalogues
- Task management with priorities and due dates
- Attendance tracking with GPS
- Social media content calendar

### Communication
- Twilio call bridge (DRY_RUN mode)
- WhatsApp share with pre-filled templates
- Email service adapter (Resend)
- Real-time notifications

### Intelligence
- AI lead scoring (heuristic + OpenAI ready)
- Intent detection from call notes
- Best time to call indicator
- Auto-followup rules
- Caption generation for social posts

### Analytics
- Source breakdown charts
- Lead funnel visualization
- Revenue trend tracking
- Caller performance metrics
- Branch comparison
- Role distribution

## Production Checklist

See [SECURITY_CHECKLIST.md](SECURITY_CHECKLIST.md)

## License

Proprietary — EstateFlow CRM
