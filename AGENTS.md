# EstateFlow CRM — AGENTS.md
# Master Project Instruction File
# This file contains all 6 vibe coding documents in one place.
# Paste this at the start of EVERY session in ANY IDE or AI tool.
# This is the single source of truth. Nothing overrides this file.

---

# 📄 DOCUMENT 01 — PRD (Product Requirements Document)

## App Identity
- **Name:** EstateFlow CRM
- **Tagline:** The real estate sales operating system
- **Type:** Cloud-based, mobile-first CRM
- **Not a clone** — a standalone product built from scratch

## Problem Being Solved
Real estate businesses get leads from many sources (portals, ads, WhatsApp,
referrals) but have no unified system to manage them. Callers waste time
manually dialling, forgetting follow-ups, and switching between WhatsApp,
Excel, and phone apps. Managers have no visibility into what their team is
doing in real time. Deals fall through the cracks.

## Target Users
Small to mid-size real estate businesses with a sales team of 5–50 people.
The primary daily user is a "caller" — a salesperson who works leads by
phone and WhatsApp all day. Secondary users are managers who oversee teams
and admins who run a branch or office.

## Core Value Proposition
- New lead → caller is auto-called → lead is auto-called → both bridged in seconds
- Share a property brochure (PDF + images) via WhatsApp in one tap
- Every call, message, and follow-up is auto-logged to the lead timeline
- Manager sees live team activity without asking anyone anything

## Features — Must Have (MVP)
- Role-based login (super admin, admin, manager, caller, field exec, social manager)
- Lead management — add, import via webhook, assign, track status
- Twilio call bridge — system calls agent first, then lead, bridges both
- One-tap WhatsApp share — brochure PDF + images + pre-written message
- Assets/Projects page — internal catalogue of properties to share
- Deal pipeline — Kanban board per team
- Follow-up system — scheduled, automated, templated
- Attendance — GPS check-in/check-out for field executives
- Social media calendar — content planning and post scheduling
- Notifications — real-time in-app alerts for all roles
- Reports — per role, with real data and charts
- Dark mode + light mode

## Features — Nice to Have (Post-MVP)
- AI lead scoring (auto score 0–100 based on engagement)
- Best time to call indicator per lead
- AI intent detection from call notes
- Missed call auto-WhatsApp response
- Re-engagement campaigns for cold leads
- Client portal (buyer login to track their deal)
- Referral tracking
- Post-sale follow-up sequences
- Payment plan calculator per asset
- Inventory unit tracker per project
- PWA / offline mode for callers
- AWS S3 + CloudFront migration
- Call recording + AI transcription + summary

## Explicitly Out of Scope (v1)
- Direct social media publishing (posts are planned, not auto-published in v1)
- Built-in video calling
- Accounting or invoicing
- Property valuation tools
- MLS / portal sync (webhook intake handles this manually)
- Multi-currency support
- White-label / reseller mode

## User Stories

### Super Admin
- As a super admin, I want to create and manage branches so I can run multiple offices
- As a super admin, I want to see org-wide revenue and performance so I can make strategic decisions
- As a super admin, I want to audit every user action so I can maintain accountability

### Admin
- As an admin, I want to add properties and assets so callers have content to share
- As an admin, I want to assign leads to callers so work is distributed fairly
- As an admin, I want to see my branch pipeline so I know where deals stand

### Manager
- As a manager, I want to see my team's live activity so I can help underperformers in real time
- As a manager, I want to reassign leads between callers so no lead goes cold
- As a manager, I want to set follow-up tasks for my team so nothing falls through

### Caller
- As a caller, I want to call a lead in one tap so I don't waste time dialling manually
- As a caller, I want to send a property brochure via WhatsApp in one tap so I can share details instantly
- As a caller, I want to log call outcomes quickly so my manager can see my progress
- As a caller, I want to see my prioritised lead queue so I always know who to call next

### Field Executive
- As a field exec, I want to check in with GPS so my attendance is logged automatically
- As a field exec, I want to log site visit notes so the team knows what happened on the ground

### Social Media Manager
- As a social manager, I want to plan posts on a calendar so content is organised
- As a social manager, I want AI to suggest captions so I can draft faster

## Success Metrics
- Caller makes first contact with a new lead within 2 minutes of it entering the system
- 80%+ of leads have at least one logged activity within 24 hours
- Manager can see full team activity without a single message or call
- Zero leads lost due to missed follow-ups (system auto-reminds)
- App works smoothly on a mid-range Android phone on a 4G connection

---

# 📄 DOCUMENT 02 — TRD (Technical Requirements Document)

## Tech Stack (LOCKED — DO NOT CHANGE)

| Layer | Tool | Notes |
|---|---|---|
| Framework | Next.js 15 (App Router) | Server components where possible |
| Language | TypeScript | Strict mode, no `any` |
| Styling | Tailwind CSS | Utility first |
| Components | shadcn/ui | Extend, never override base |
| Database | Supabase PostgreSQL | RLS on every table |
| Auth | Supabase Auth | JWT, role in profiles table |
| Realtime | Supabase Realtime | Live notifications + lead updates |
| Storage | Supabase Storage → AWS S3 | Start Supabase, migrate S3 in Phase 12 |
| Calling | Twilio Voice | Call bridge agent → lead |
| WhatsApp | Twilio WhatsApp / Meta Cloud API | Message + PDF/image |
| Email | Resend | Transactional + campaigns |
| AI | OpenAI adapter | Lead scoring, captions, intent |
| State | Zustand | Client state only |
| Data fetching | TanStack Query | Server state + caching |
| Forms | React Hook Form + Zod | Client + server validation |
| Charts | Recharts | All dashboard charts |
| Icons | Lucide React | Only icon library |
| Hosting | Vercel | Auto-deploy from main |
| CDN (Phase 12) | AWS CloudFront | Global asset delivery |
| Jobs (Phase 12) | AWS Lambda | Heavy background tasks |

## Key Libraries
```
next@15, typescript, tailwindcss, @shadcn/ui
@supabase/supabase-js, @supabase/ssr
zustand, @tanstack/react-query
react-hook-form, zod
recharts, lucide-react
twilio, resend, openai
```

## Environment Variables
```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
TWILIO_WHATSAPP_NUMBER=
RESEND_API_KEY=
OPENAI_API_KEY=
NEXT_PUBLIC_GOOGLE_MAPS_KEY=
NEXT_PUBLIC_APP_URL=
DRY_RUN=true
WEBHOOK_SECRET=
AWS_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=
AWS_CLOUDFRONT_URL=
```

## Technical Constraints
- Mobile first — every screen must work at 390px width
- Both dark and light mode on every screen
- All external service calls must support DRY_RUN=true for local dev
- No `any` TypeScript types anywhere
- Zod validation on every form and every API route
- RLS enforced at database level — never rely on frontend-only auth checks
- Service adapters are the only place external APIs are called — never call Twilio/WhatsApp/OpenAI directly from UI components or pages

---

# 📄 DOCUMENT 03 — APP FLOW (Navigation & User Journey)

## Entry Points
```
/ (root)          → redirect to /login if not authenticated
/login            → auth page, all roles land here
After login       → middleware reads role → redirects to correct dashboard
```

## Role → Dashboard Route Map
```
super_admin    →  /super-admin/dashboard
admin          →  /admin/dashboard
manager        →  /manager/dashboard
caller         →  /caller/dashboard
field_exec     →  /field/dashboard
social_manager →  /social/calendar
```

## Auth Flow
```
/login
  → user enters email + password
  → Supabase Auth validates
  → session created, JWT issued
  → middleware reads profiles.role
  → redirect to role dashboard

/forgot-password
  → user enters email
  → Supabase sends reset link
  → user clicks link → reset password page
  → redirect to /login

Session expired
  → middleware catches it
  → redirect to /login
  → after login → back to where they were
```

## Navigation Structure

### Desktop
```
Left sidebar (always dark) — role-specific nav links
Top bar — search, notifications bell, dark/light toggle, user avatar
Main content area — page content
```

### Mobile
```
Bottom tab bar — 5 tabs (role-specific)
Top bar — page title + notification bell + avatar
Full screen content — no sidebar
```

## All Pages Per Role

### Super Admin
```
/super-admin/dashboard      KPI cards, org revenue, branch comparison charts
/super-admin/branches       Table of all branches, add/edit/deactivate
/super-admin/users          All users across org, role assignment
/super-admin/permissions    Toggle permissions per role
/super-admin/billing        Plan info, seat count, invoice history (UI only v1)
/super-admin/reports        Org-wide revenue, source ROI, forecasting
/super-admin/audit-logs     Every action by every user, filterable
/super-admin/settings       Branding, timezone, integrations config
```

### Admin
```
/admin/dashboard            Branch KPIs, team summary, overdue alerts
/admin/team                 Managers + callers list, workload per person
/admin/leads                All branch leads, assign/reassign, filters
/admin/pipeline             Kanban of all branch deals
/admin/properties           Property listings CRUD + photo upload
/admin/assets               Project catalogue CRUD + brochure upload
/admin/reports              Branch performance, source breakdown
/admin/templates            Email/WhatsApp message templates
/admin/documents            Transaction documents per deal
/admin/attendance           Branch attendance overview
/admin/social               Social posts overview for branch
/admin/settings             Branch settings, integrations
```

### Manager
```
/manager/dashboard          Team KPIs, live caller activity feed
/manager/my-team            Caller stats, workload, reassign leads
/manager/leads              Team lead queue, filter/assign/flag
/manager/pipeline           Team Kanban board
/manager/assets             View + share assets (no edit)
/manager/appointments       All team viewings calendar
/manager/tasks              Assign tasks to callers, view overdue
/manager/reports            Team conversion, call performance
```

### Caller
```
/caller/dashboard           Today's queue, daily stats, overdue alerts
/caller/my-leads            Prioritised lead list by score
/caller/lead/[id]           Full lead profile + timeline + actions
/caller/assets              Browse projects to share
/caller/call-log            History of all calls made
/caller/follow-ups          Scheduled follow-ups list
/caller/tasks               Personal task list
```

### Field Executive
```
/field/dashboard            Today's visits, attendance status
/field/attendance           GPS check-in/out, history
/field/site-visits          Assigned visits list + notes
```

### Social Manager
```
/social/calendar            Monthly content calendar view
/social/posts               All posts list with status
/social/create              Create/edit post form
```

## Core User Journeys

### Journey 1 — New Lead to First Call (Caller)
```
Lead enters via webhook
  → auto-assigned to caller (round-robin)
  → caller gets in-app notification: "New lead assigned: Rahul Sharma"
  → Twilio calls caller's phone
  → caller picks up, hears: "New lead from MagicBricks. Press any key to connect."
  → caller presses key
  → Twilio calls lead
  → both bridged on live call
  → call ends → CRM auto-opens CallOutcomeForm popup
  → caller selects: Answered / Interested / Callback
  → adds note: "Wants 3BHK, budget 80L, needs 2 months"
  → AI reads note, sets follow-up for 7 weeks, tags lead "Long Term"
  → activity logged to lead timeline
```

### Journey 2 — Share Property via WhatsApp (Caller)
```
Caller opens lead profile (/caller/lead/[id])
  → taps "Share Project" button
  → AssetPicker modal opens — shows all active assets
  → caller selects "Sunset Villas Phase 2"
  → ShareDrawer slides up showing:
      - Pre-written WhatsApp message (auto-filled with client name + project)
      - PDF brochure thumbnail
      - Project images
      - Editable message text area
  → caller taps "Open WhatsApp"
  → WhatsApp opens with message pre-filled + wa.me link
  → CRM logs: "WhatsApp shared — Sunset Villas" to lead timeline
```

### Journey 3 — Manager Reviews Team (Manager)
```
Manager opens /manager/dashboard
  → sees live feed: "Arjun is on a call", "Priya hasn't called in 2 hours"
  → clicks Priya's name → sees her lead queue
  → sees 3 overdue follow-ups
  → assigns those leads to Arjun
  → sets a task for Priya: "Call these 5 leads before 5pm"
  → Priya gets in-app notification instantly
```

### Journey 4 — Field Exec Attendance (Field Exec)
```
Field exec opens /field/dashboard on mobile
  → sees "Not Checked In" status
  → taps big "Check In" button
  → browser requests GPS permission
  → location captured + timestamp logged
  → status changes to "Checked In — 9:04 AM, Gurgaon Sector 56"
  → at end of day taps "Check Out"
  → duration auto-calculated
  → admin sees this on /admin/attendance in real time
```

## Empty States
```
Lead queue empty         → "No leads assigned yet. Your manager will assign leads shortly."
Pipeline empty           → "No active deals. Start by converting a lead."
Assets empty             → "No projects added yet. Ask your admin to add properties."
Notifications empty      → "You're all caught up!"
Call log empty           → "No calls made yet. Your call history will appear here."
Attendance empty         → "No attendance records found for this period."
```

## Error States
```
Failed API call          → Toast: "Something went wrong. Please try again."
Supabase RLS blocked     → Redirect to /login with message "Session expired"
Twilio call failed       → Mark lead "Call Pending", notify manager, create task
WhatsApp send failed     → Toast: "Message failed. Try again or copy the message."
GPS denied               → "Location access required for check-in. Please allow in browser settings."
File upload failed       → "Upload failed. Max file size is 10MB."
```

## Redirect Logic
```
After login              → role dashboard
After logout             → /login
Unauthorized route       → /login
After lead assigned      → /caller/my-leads
After call logged        → back to /caller/lead/[id]
After asset shared       → back to /caller/lead/[id] with success toast
After check-in           → /field/dashboard with updated status
```

---

# 📄 DOCUMENT 04 — UI/UX DESIGN BRIEF

## Aesthetic Direction
Premium, data-dense, purposeful. Feels like a tool professionals actually
want to use. Dark sidebar always. Content area switches between dark and light.
Inspired by: Linear, Vercel dashboard, and the Metric Flow dark dashboard
reference provided by the product owner.

## Color System (LOCKED)
```css
--primary:        #6C63FF   /* Purple — main accent, CTAs, active states */
--primary-hover:  #5A52E0
--success:        #22C55E
--warning:        #F59E0B
--danger:         #EF4444
--info:           #06B6D4

/* Dark Mode */
--bg-dark:        #0F0F14
--sidebar:        #13131A   /* ALWAYS dark — even in light mode */
--card-dark:      #1C1C27
--text-primary:   #FFFFFF
--text-muted:     #A0A0B0

/* Light Mode */
--bg-light:       #F5F6FA
--sidebar:        #1A1A2E   /* Still dark in light mode */
--card-light:     #FFFFFF
--text-primary:   #1A1A2E
--text-muted:     #6B7280
```

## Typography
```
Font: Inter (Google Fonts — load via next/font)
Page title:     24px / 700
Section header: 18px / 600
Card title:     14px / 600
Body:           13px / 400
Badge/label:    11px / 500 / uppercase
```

## Component Rules
```
Border radius:   8px cards, 6px buttons, 20px badges, 50% avatar
Shadows light:   0 2px 8px rgba(0,0,0,0.08)
Shadows dark:    faint accent glow on active/hover cards
Transitions:     all 0.15s ease
Separators:      background color difference, not borders
Color usage:     restrained everywhere except charts
Charts:          use full color palette freely
```

## Kanban Column Colors
```
New Lead:            #6C63FF  purple
Contacted:           #06B6D4  cyan
Interested:          #F59E0B  amber
Viewing Scheduled:   #8B5CF6  violet
Offer Made:          #EF4444  red
Closing:             #22C55E  green
```

## Mobile UI Rules
```
Bottom navigation:   5 tabs, icons + labels
Tap targets:         minimum 44px height
Action buttons:      sticky at bottom of lead detail page
Lead cards:          full width, call + WhatsApp buttons prominent
Filters:             horizontal scroll chips, not dropdowns
Modals:              slide up from bottom (drawer style)
Forms:               one field visible at a time where possible
```

## Dark / Light Mode
```
Toggle:     sun/moon icon in top bar
Default:    dark mode
Preference: saved per user in profiles table
Sidebar:    ALWAYS dark regardless of mode
Transition: background 0.2s ease on body
```

---

# 📄 DOCUMENT 05 — BACKEND SCHEMA

## Database Tables

```sql
organizations
  id uuid PK
  name text
  plan text default 'free'
  created_at timestamptz

profiles
  id uuid PK (= auth.users.id)
  org_id uuid FK → organizations.id
  branch_id uuid FK → branches.id (nullable)
  full_name text
  email text
  role text CHECK IN ('super_admin','admin','manager','caller','field_exec','social_manager')
  phone text
  avatar_url text
  theme text default 'dark'
  is_active boolean default true
  created_at timestamptz
  updated_at timestamptz

branches
  id uuid PK
  org_id uuid FK → organizations.id
  name text
  location text
  admin_id uuid FK → profiles.id
  created_at timestamptz

teams
  id uuid PK
  branch_id uuid FK → branches.id
  manager_id uuid FK → profiles.id
  name text
  created_at timestamptz

leads
  id uuid PK
  org_id uuid FK → organizations.id
  branch_id uuid FK → branches.id
  assigned_to uuid FK → profiles.id
  full_name text NOT NULL
  phone text NOT NULL
  email text
  source text CHECK IN ('36Acre','MagicBricks','Housing','Facebook','Instagram','Website','WhatsApp','Referral','Manual','Other')
  property_type text CHECK IN ('Apartment','Villa','Plot','Commercial','Rental')
  budget_min numeric
  budget_max numeric
  preferred_location text
  status text CHECK IN ('New','Contacted','Interested','Site Visit Scheduled','Negotiation','Won','Lost','Not Responding')
  temperature text CHECK IN ('Cold','Warm','Hot')
  score integer default 0
  notes text
  next_followup_at timestamptz
  last_contacted_at timestamptz
  created_at timestamptz
  updated_at timestamptz

properties
  id uuid PK
  org_id uuid FK → organizations.id
  branch_id uuid FK → branches.id
  title text
  location text
  address text
  type text
  price numeric
  size text
  bedrooms integer
  bathrooms integer
  floor integer
  furnishing text
  availability text CHECK IN ('Available','Hold','Sold','Rented')
  description text
  amenities text[]
  images text[]
  documents text[]
  created_at timestamptz
  updated_at timestamptz

assets
  id uuid PK
  org_id uuid FK → organizations.id
  branch_id uuid FK → branches.id
  name text NOT NULL
  location text
  type text
  price_min numeric
  price_max numeric
  status text CHECK IN ('Launching','Under Construction','Ready','Sold Out')
  description text
  brochure_url text
  floor_plan_url text
  images text[]
  whatsapp_template text
  is_active boolean default true
  created_by uuid FK → profiles.id
  created_at timestamptz
  updated_at timestamptz

deals
  id uuid PK
  lead_id uuid FK → leads.id
  property_id uuid FK → properties.id
  agent_id uuid FK → profiles.id
  stage text CHECK IN ('New','Contacted','Interested','Viewing Scheduled','Offer Made','Closing','Won','Lost')
  value numeric
  probability integer
  expected_close date
  notes text
  created_at timestamptz
  updated_at timestamptz

calls
  id uuid PK
  lead_id uuid FK → leads.id
  agent_id uuid FK → profiles.id
  call_sid text
  conference_sid text
  status text CHECK IN ('initiated','ringing','in-progress','completed','failed','no-answer','busy')
  duration integer
  recording_url text
  outcome text CHECK IN ('Answered','No Answer','Busy','Callback Requested','Not Interested','Interested')
  notes text
  started_at timestamptz
  ended_at timestamptz
  created_at timestamptz

messages
  id uuid PK
  lead_id uuid FK → leads.id
  sender_id uuid FK → profiles.id
  channel text CHECK IN ('whatsapp','sms','email')
  body text
  asset_id uuid FK → assets.id (nullable)
  status text CHECK IN ('sent','delivered','failed')
  sent_at timestamptz
  created_at timestamptz

tasks
  id uuid PK
  org_id uuid FK → organizations.id
  assigned_to uuid FK → profiles.id
  created_by uuid FK → profiles.id
  lead_id uuid FK → leads.id (nullable)
  title text NOT NULL
  description text
  due_date timestamptz
  priority text CHECK IN ('Low','Medium','High','Urgent')
  status text CHECK IN ('Pending','In Progress','Done','Snoozed')
  created_at timestamptz
  updated_at timestamptz

activities
  id uuid PK
  lead_id uuid FK → leads.id
  type text CHECK IN ('call','message','note','follow-up','status-change','property-share','viewing','deal-update')
  description text
  created_by uuid FK → profiles.id
  created_at timestamptz

follow_ups
  id uuid PK
  lead_id uuid FK → leads.id
  assigned_to uuid FK → profiles.id
  channel text CHECK IN ('call','whatsapp','sms','email')
  message_template text
  scheduled_at timestamptz
  status text CHECK IN ('Pending','Sent','Snoozed','Done')
  snoozed_until timestamptz
  created_at timestamptz

attendance
  id uuid PK
  user_id uuid FK → profiles.id
  org_id uuid FK → organizations.id
  check_in_time timestamptz
  check_out_time timestamptz
  check_in_lat numeric
  check_in_lng numeric
  check_out_lat numeric
  check_out_lng numeric
  status text CHECK IN ('Present','Late','Absent','Half Day')
  notes text
  selfie_url text
  created_at timestamptz

social_posts
  id uuid PK
  org_id uuid FK → organizations.id
  created_by uuid FK → profiles.id
  assigned_to uuid FK → profiles.id
  platform text CHECK IN ('Instagram Reel','Instagram Post','Facebook Post','LinkedIn Post','Story')
  caption text
  media_urls text[]
  status text CHECK IN ('Idea','Draft','Scheduled','Published')
  scheduled_at timestamptz
  notes text
  zapier_webhook_sent boolean default false
  created_at timestamptz
  updated_at timestamptz

notifications
  id uuid PK
  user_id uuid FK → profiles.id
  type text CHECK IN ('lead_assigned','call_missed','followup_due','visit_scheduled','property_shared','attendance_issue','post_due','system')
  title text
  message text
  read boolean default false
  link text
  created_at timestamptz

integration_settings
  id uuid PK
  org_id uuid FK → organizations.id
  twilio_sid text
  twilio_token text
  twilio_phone text
  whatsapp_number text
  resend_key text
  openai_key text
  lead_assignment_mode text CHECK IN ('round_robin','manual','least_busy')
  webhook_secret text
  updated_at timestamptz
```

## Relationships Summary
```
organizations → branches (one to many)
organizations → profiles (one to many)
branches → teams (one to many)
teams → profiles/callers (one to many)
profiles → leads (assigned_to, one to many)
leads → calls (one to many)
leads → messages (one to many)
leads → activities (one to many)
leads → follow_ups (one to many)
leads → deals (one to many)
deals → properties (many to one)
assets → messages (one to many, via asset_id)
profiles → attendance (one to many)
profiles → social_posts (one to many)
profiles → notifications (one to many)
```

## RLS Policies Summary
```
super_admin   → full access all tables, all orgs
admin         → full access within their org_id + branch_id
manager       → read/write leads, calls, tasks for their team only
caller        → read/write only rows where assigned_to = auth.uid()
field_exec    → read/write only their own attendance rows
social_manager→ read/write social_posts within their org_id

Every sensitive table filters by:
  org_id = (SELECT org_id FROM profiles WHERE id = auth.uid())
```

## Storage Buckets
```
property-images/     → {org_id}/{property_id}/{filename}
asset-brochures/     → {org_id}/{asset_id}/{filename}
asset-images/        → {org_id}/{asset_id}/{filename}
attendance-selfies/  → {org_id}/{user_id}/{date}/{filename}
social-media/        → {org_id}/{post_id}/{filename}
documents/           → {org_id}/{deal_id}/{filename}
avatars/             → {user_id}/{filename}
```

---

# 📄 DOCUMENT 06 — IMPLEMENTATION PLAN

## Phase / Session Breakdown

Each session is self-contained. Completed sessions are NEVER modified.
Mark sessions complete by updating STATUS below after each session.

```
SESSION 01 — Database Schema + Migrations + RLS + Seed
STATUS: [ ] NOT STARTED
Goal: Every Supabase table exists, RLS works, seed data loads
Delivers:
  - supabase/migrations/001 through 013
  - supabase/seed.sql (1 org, 1 super admin, 1 admin, 2 managers,
    4 callers, 1 field exec, 1 social manager, 20 leads,
    10 properties, 5 assets, sample calls, tasks, attendance)
  - All RLS policies tested in Supabase dashboard
Done when: Every table visible in Supabase, seed runs without error,
           RLS blocks cross-org queries

SESSION 02 — Auth + Routing Shell + Layouts + Design System
STATUS: [ ] NOT STARTED
Goal: Any role can log in and land on their correct dashboard layout
Delivers:
  - Next.js 15 project scaffold with exact folder structure
  - src/app/(auth)/login and /forgot-password pages — fully designed
  - middleware.ts — role detection + route protection
  - Layout shells for all 6 roles (sidebar + topbar, no page content yet)
  - tailwind.config.ts — full design token setup
  - globals.css — CSS variables for dark/light mode
  - Dark/light mode toggle working and persisted
  - Inter font loaded via next/font
Done when: All 6 roles can log in, land on correct layout,
           protected routes redirect unauthenticated users

SESSION 03 — Super Admin (Complete, End to End)
STATUS: [ ] NOT STARTED
Goal: Super admin can do everything in their section with real data
Pages: dashboard, branches, users, permissions, billing, reports,
       audit-logs, settings
Done when: Super admin can create a branch, add an admin, see org-wide
           reports, and view audit logs — all with real Supabase data

SESSION 04 — Admin (Complete, End to End)
STATUS: [ ] NOT STARTED
Goal: Admin can fully manage their branch with real data
Pages: dashboard, team, leads, pipeline, properties, assets, reports,
       templates, documents, attendance, social, settings
Done when: Admin can add a property with photos, create an asset with
           brochure, assign leads to callers, see branch pipeline

SESSION 05 — Manager (Complete, End to End)
STATUS: [ ] NOT STARTED
Goal: Manager can run their team fully with real data
Pages: dashboard, my-team, leads, pipeline, assets, appointments,
       tasks, reports
Done when: Manager can see live team activity, reassign leads,
           assign tasks, view pipeline Kanban

SESSION 06 — Caller (Complete, End to End)
STATUS: [ ] NOT STARTED
Goal: Caller can work a full day end to end with real data
Pages: dashboard, my-leads, lead/[id], assets, call-log,
       follow-ups, tasks
Includes:
  - Twilio call bridge (dry-run mode when DRY_RUN=true)
  - WhatsApp share drawer with pre-text + PDF + images
  - CallOutcomeForm auto-popup after call
  - Full lead timeline (calls, messages, notes, shares)
Done when: Caller can see leads, tap call button (dry-run logs it),
           open share drawer, send WhatsApp, log outcome — all saved

SESSION 07 — Field Executive (Complete, End to End)
STATUS: [ ] NOT STARTED
Goal: Field exec can check in, log visits, view history
Pages: dashboard, attendance, site-visits
Done when: GPS check-in saves coordinates, admin sees it in real time

SESSION 08 — Social Media Manager (Complete, End to End)
STATUS: [ ] NOT STARTED
Goal: Social manager can plan and schedule content
Pages: calendar, posts, create
Includes: AI caption helper (dry-run if no OpenAI key),
          Zapier webhook (dry-run mode)
Done when: Post created, visible on calendar, status updates work

SESSION 09 — Notifications + Realtime (All Roles)
STATUS: [ ] NOT STARTED
Goal: All live updates work across all roles instantly
Delivers:
  - NotificationBell + NotificationList (all layouts)
  - Supabase Realtime subscriptions for:
      new lead assigned → caller notified
      missed call → manager notified
      follow-up due → reminder fires
      new message reply
  - useRealtime.ts hook
  - notificationStore.ts
Done when: Assign a lead in one tab, caller's bell updates
           in another tab within 1 second

SESSION 10 — Intelligence Layer
STATUS: [ ] NOT STARTED
Goal: CRM makes smart decisions automatically
Delivers:
  - Lead score 0–100 auto-calculated on lead create/update
  - Best time to call indicator on lead cards
  - AI intent detection from call notes (dry-run if no key)
  - Missed call auto-WhatsApp response
  - Follow-up automation rules (no-answer → retry in 4hr)
  - Re-engagement sequences for cold leads (30+ days no activity)
Done when: New lead gets score, missed call triggers auto-message (dry-run)

SESSION 11 — Reports + Analytics (All Roles)
STATUS: [ ] NOT STARTED
Goal: Every role has meaningful real-data reports
Delivers:
  - Super admin: org revenue forecast, source ROI
  - Admin: branch pipeline, agent performance
  - Manager: team conversion rate, call performance
  - Loss analysis: why deals are lost (pie chart by reason)
  - Leads by source chart (bar)
  - Calls made over time (line chart)
  - Attendance summary (admin view)
Done when: All charts show real data from seed + any added test data

SESSION 12 — AWS Migration + Production Deploy
STATUS: [ ] NOT STARTED
Goal: App is live, fast, and production ready
Delivers:
  - Supabase Storage → AWS S3 migration for assets/properties
  - CloudFront CDN configured
  - Vercel production deployment
  - All environment variables set in Vercel
  - Security audit (RLS double-check, no exposed keys)
  - README.md with full setup + deployment instructions
Done when: App is accessible on production URL, all features work,
           file uploads go to S3, images load via CloudFront
```

---

# 📁 FOLDER STRUCTURE (LOCKED — FOLLOW EXACTLY)

```
/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── forgot-password/page.tsx
│   │   │
│   │   ├── (super-admin)/
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── branches/page.tsx
│   │   │   ├── users/page.tsx
│   │   │   ├── permissions/page.tsx
│   │   │   ├── billing/page.tsx
│   │   │   ├── reports/page.tsx
│   │   │   ├── audit-logs/page.tsx
│   │   │   └── settings/page.tsx
│   │   │
│   │   ├── (admin)/
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── team/page.tsx
│   │   │   ├── leads/page.tsx
│   │   │   ├── pipeline/page.tsx
│   │   │   ├── properties/page.tsx
│   │   │   ├── assets/page.tsx
│   │   │   ├── reports/page.tsx
│   │   │   ├── templates/page.tsx
│   │   │   ├── documents/page.tsx
│   │   │   ├── attendance/page.tsx
│   │   │   ├── social/page.tsx
│   │   │   └── settings/page.tsx
│   │   │
│   │   ├── (manager)/
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── my-team/page.tsx
│   │   │   ├── leads/page.tsx
│   │   │   ├── pipeline/page.tsx
│   │   │   ├── assets/page.tsx
│   │   │   ├── appointments/page.tsx
│   │   │   ├── tasks/page.tsx
│   │   │   └── reports/page.tsx
│   │   │
│   │   ├── (caller)/
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── my-leads/page.tsx
│   │   │   ├── lead/[id]/page.tsx
│   │   │   ├── assets/page.tsx
│   │   │   ├── call-log/page.tsx
│   │   │   ├── follow-ups/page.tsx
│   │   │   └── tasks/page.tsx
│   │   │
│   │   ├── (field)/
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── attendance/page.tsx
│   │   │   └── site-visits/page.tsx
│   │   │
│   │   ├── (social)/
│   │   │   ├── layout.tsx
│   │   │   ├── calendar/page.tsx
│   │   │   ├── posts/page.tsx
│   │   │   └── create/page.tsx
│   │   │
│   │   └── api/
│   │       ├── webhooks/leads/route.ts
│   │       ├── twilio/call-bridge/route.ts
│   │       ├── twilio/call-status/route.ts
│   │       ├── twilio/recording/route.ts
│   │       ├── whatsapp/send/route.ts
│   │       └── ai/score-lead/route.ts
│   │
│   ├── components/
│   │   ├── ui/                    # shadcn base — never edit directly
│   │   ├── common/                # Topbar, Sidebar, MobileNav, PageHeader
│   │   ├── charts/                # BarChart, LineChart, PieChart, StatCard, FunnelChart
│   │   ├── leads/                 # LeadCard, LeadTable, LeadFilters, LeadStatusBadge
│   │   ├── deals/                 # KanbanBoard, KanbanColumn, DealCard, DealModal
│   │   ├── properties/            # PropertyCard, PropertyForm, PropertyGallery
│   │   ├── assets/                # AssetCard, AssetForm, ShareDrawer, AssetPicker
│   │   ├── calls/                 # CallOutcomeForm, CallLogItem, CallBridgeStatus
│   │   ├── contacts/              # ContactProfile, ActivityTimeline, ContactForm
│   │   ├── tasks/                 # TaskList, TaskCard, TaskForm
│   │   ├── attendance/            # CheckInCard, AttendanceTable, GPSStatus
│   │   ├── social/                # PostCard, ContentCalendar, PostForm
│   │   ├── notifications/         # NotificationBell, NotificationList
│   │   └── reports/               # ReportCard, StatGrid
│   │
│   ├── services/
│   │   ├── callService.ts         # Twilio Voice — dry-run supported
│   │   ├── messageService.ts      # WhatsApp/SMS — dry-run supported
│   │   ├── emailService.ts        # Resend — dry-run supported
│   │   ├── leadAssignmentService.ts
│   │   ├── propertyShareService.ts
│   │   ├── attendanceService.ts
│   │   ├── socialPostService.ts
│   │   ├── aiService.ts
│   │   └── notificationService.ts
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   └── middleware.ts
│   │   ├── validations/
│   │   │   ├── lead.schema.ts
│   │   │   ├── property.schema.ts
│   │   │   ├── asset.schema.ts
│   │   │   └── user.schema.ts
│   │   └── utils/
│   │       ├── formatDate.ts
│   │       ├── formatCurrency.ts
│   │       ├── roleGuard.ts
│   │       └── cn.ts
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useLeads.ts
│   │   ├── useRealtime.ts
│   │   ├── useProperties.ts
│   │   └── useNotifications.ts
│   │
│   ├── store/
│   │   ├── authStore.ts
│   │   ├── leadStore.ts
│   │   ├── uiStore.ts
│   │   └── notificationStore.ts
│   │
│   ├── types/
│   │   ├── user.types.ts
│   │   ├── lead.types.ts
│   │   ├── property.types.ts
│   │   ├── asset.types.ts
│   │   ├── deal.types.ts
│   │   ├── call.types.ts
│   │   └── common.types.ts
│   │
│   └── constants/
│       ├── roles.ts
│       ├── leadStatuses.ts
│       ├── leadSources.ts
│       ├── dealStages.ts
│       └── routes.ts
│
├── supabase/
│   ├── migrations/
│   │   ├── 001_organizations.sql
│   │   ├── 002_users_profiles.sql
│   │   ├── 003_leads.sql
│   │   ├── 004_properties.sql
│   │   ├── 005_assets.sql
│   │   ├── 006_deals.sql
│   │   ├── 007_calls.sql
│   │   ├── 008_messages.sql
│   │   ├── 009_tasks.sql
│   │   ├── 010_attendance.sql
│   │   ├── 011_social_posts.sql
│   │   ├── 012_notifications.sql
│   │   └── 013_rls_policies.sql
│   └── seed.sql
│
├── middleware.ts
├── .env.example
└── README.md
```

---

# 🚦 GOLDEN RULES (APPLY EVERY SESSION)

```
01. Read this entire AGENTS.md before writing any code
02. Only build what the current session specifies
03. Do NOT modify files from completed sessions
04. Every page connects to real Supabase data — no mocks in production code
05. Every external API call must work in DRY_RUN=true mode
06. Follow folder structure exactly — no new folders without reason
07. TypeScript strict — zero `any` types
08. Zod on every form input and every API route body
09. RLS enforced at DB level — never rely on frontend checks alone
10. Mobile first — design at 390px, enhance for desktop
11. Dark AND light mode on every screen — both look premium
12. Loading state on every async operation
13. Error state on every data fetch
14. Empty state on every list or table
15. Confirmation dialog on every destructive action
16. Never call Twilio/WhatsApp/OpenAI directly from UI — use service adapters
17. After session done → mark STATUS complete in this file
```

---

# 🎯 HOW TO START ANY SESSION

Paste this exactly into your IDE or AI at the start of the session:

```
I am building EstateFlow CRM.

Here is my AGENTS.md — treat it as the single source of truth:
[paste or attach AGENTS.md]

Current session: SESSION [NUMBER] — [SESSION NAME]
Completed sessions: [list e.g. 01, 02]

Rules:
- Do not modify any files from completed sessions
- Follow the folder structure in AGENTS.md exactly
- Follow all golden rules in AGENTS.md
- Connect everything to real Supabase data
- Use DRY_RUN mode for all external services

Begin SESSION [NUMBER] now.
```

---

# 📌 QUICK REFERENCE

## Lead Sources
```
36Acre | MagicBricks | Housing | Facebook | Instagram | Website | WhatsApp | Referral | Manual | Other
```

## Lead Statuses
```
New → Contacted → Interested → Site Visit Scheduled → Negotiation → Won → Lost → Not Responding
```

## Lead Temperature
```
Cold | Warm | Hot
```

## Property Types
```
Apartment | Villa | Plot | Commercial | Rental
```

## Service Adapter Dry-Run Pattern
```typescript
const DRY_RUN = process.env.DRY_RUN === 'true'
if (DRY_RUN) {
  console.log('[DRY RUN]', payload)
  return { success: true, dryRun: true }
}
```

## WhatsApp Message Template
```
Hi {clientName} 👋,

I'd like to share details about *{projectName}* in {location}.

📌 Starting from: {price}
📅 Status: {projectStatus}

Please find the brochure attached. Feel free to reach out
for a free consultation!

— {agentName}
{companyName}
```

---

*AGENTS.md version: 2.0 — All 6 vibe coding documents included*
*Last updated: Session 0 — Project Setup Complete*
*Next: SESSION 01 — Database Schema*
