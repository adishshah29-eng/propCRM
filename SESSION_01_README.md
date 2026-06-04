# SESSION 01 — Database Schema + Migrations + RLS + Seed

## ✅ Status: COMPLETE

## Deliverables

### Migrations (13 files)
All files located in `supabase/migrations/`:

| # | File | Description |
|---|------|-------------|
| 001 | `001_organizations.sql` | Root org table |
| 002 | `002_users_profiles.sql` | Profiles (extends auth.users), branches, teams |
| 003 | `003_leads.sql` | Lead management with constraints & indexes |
| 004 | `004_properties.sql` | Property listings |
| 005 | `005_assets.sql` | Project catalogue / shareable assets |
| 006 | `006_deals.sql` | Deal pipeline / Kanban |
| 007 | `007_calls.sql` | Call logs with Twilio fields |
| 008 | `008_messages.sql` | WhatsApp/SMS/Email messages |
| 009 | `009_tasks.sql` | Tasks and assignments |
| 010 | `010_attendance.sql` | Activities, follow-ups, attendance |
| 011 | `011_social_posts.sql` | Social media content calendar |
| 012 | `012_notifications.sql` | Real-time in-app notifications |
| 013 | `013_rls_policies.sql` | RLS policies + integration_settings table |

### Seed Data
`supabase/seed.sql` — Complete dataset with:
- 1 Organization (EstateFlow Demo Org)
- 1 Branch (Gurgaon HQ)
- 2 Teams (Alpha Sales, Beta Sales)
- 10 Users across all 6 roles
- 20 Leads with realistic Indian names & data
- 10 Properties with Unsplash images
- 5 Assets with WhatsApp templates
- Sample deals, calls, messages, tasks, activities, follow-ups
- Attendance records (GPS + office)
- Social posts (Instagram, Facebook, LinkedIn, Stories)
- Notifications
- Integration settings

## How to Apply

### Option A: Supabase CLI (Local)
```bash
supabase db reset
# Migrations auto-run, then seed.sql loads
```

### Option B: Supabase Dashboard (SQL Editor)
1. Open SQL Editor → New query
2. Paste migrations 001–013 in order
3. Paste seed.sql
4. Run

### Option C: Programmatic
```bash
psql $SUPABASE_DB_URL -f supabase/migrations/001_organizations.sql
# ... repeat for all migrations
psql $SUPABASE_DB_URL -f supabase/seed.sql
```

## Default Login Credentials (Seed)
All users share password: `password123`

| Role | Email |
|------|-------|
| Super Admin | super@estateflow.demo |
| Admin | admin@estateflow.demo |
| Manager 1 | manager1@estateflow.demo |
| Manager 2 | manager2@estateflow.demo |
| Caller 1 | caller1@estateflow.demo |
| Caller 2 | caller2@estateflow.demo |
| Caller 3 | caller3@estateflow.demo |
| Caller 4 | caller4@estateflow.demo |
| Field Exec | field@estateflow.demo |
| Social Manager | social@estateflow.demo |

## RLS Policy Summary

| Table | Super Admin | Admin | Manager | Caller | Field Exec | Social Mgr |
|-------|:-----------:|:-----:|:-------:|:------:|:----------:|:----------:|
| organizations | ✅ ALL | ✅ READ | ✅ READ | ✅ READ | ✅ READ | ✅ READ |
| profiles | ✅ ALL | ✅ ORG | ✅ ORG | ✅ SELF | ✅ SELF | ✅ SELF |
| branches | ✅ ALL | ✅ ORG | ✅ ORG | ✅ READ | ✅ READ | ✅ READ |
| teams | ✅ ALL | ✅ ORG | ✅ ORG | ✅ READ | ✅ READ | ✅ READ |
| leads | ✅ ALL | ✅ ORG | ✅ ORG | ✅ ASSIGNED | ❌ | ❌ |
| properties | ✅ ALL | ✅ ORG | ✅ ORG | ✅ READ | ✅ READ | ✅ READ |
| assets | ✅ ALL | ✅ ORG | ✅ ORG | ✅ READ | ✅ READ | ✅ READ |
| deals | ✅ ALL | ✅ ORG | ✅ ORG | ✅ ASSIGNED | ❌ | ❌ |
| calls | ✅ ALL | ✅ ORG | ✅ ORG | ✅ OWN | ❌ | ❌ |
| messages | ✅ ALL | ✅ ORG | ✅ ORG | ✅ OWN | ❌ | ❌ |
| tasks | ✅ ALL | ✅ ORG | ✅ ORG | ✅ ASSIGNED | ❌ | ❌ |
| activities | ✅ ALL | ✅ ORG | ✅ ORG | ✅ ASSIGNED | ❌ | ❌ |
| follow_ups | ✅ ALL | ✅ ORG | ✅ ORG | ✅ ASSIGNED | ❌ | ❌ |
| attendance | ✅ ALL | ✅ ORG | ✅ ORG | ✅ SELF | ✅ SELF | ✅ SELF |
| social_posts | ✅ ALL | ✅ ORG | ✅ READ | ✅ READ | ✅ READ | ✅ ORG |
| notifications | ✅ ALL | ✅ OWN | ✅ OWN | ✅ OWN | ✅ OWN | ✅ OWN |
| integration_settings | ✅ ALL | ✅ ORG | ❌ | ❌ | ❌ | ❌ |

## Next Steps
Proceed to **SESSION 02 — Auth + Routing Shell + Layouts + Design System**
