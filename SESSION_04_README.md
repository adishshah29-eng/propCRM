# SESSION 04 — Admin (Complete, End to End)

## ✅ Status: COMPLETE

## Deliverables

### Pages (12 total)

| Page | Route | Features |
|------|-------|----------|
| Dashboard | `/admin/dashboard` | Branch KPIs (leads, pipeline value, team size, overdue alerts), SourceBreakdownChart, LeadFunnelChart, overdue follow-up banner |
| Team | `/admin/team` | All team members table with role badges, branch info, workload stats (calls + leads per person), active/inactive status |
| Leads | `/admin/leads` | Full CRUD with filters (status + source dropdowns), assignment dropdown with live caller list, score display, budget formatting. Add/Edit modal with all fields |
| Pipeline | `/admin/pipeline` | Drag-and-drop Kanban board (8 stages), deal cards with probability badges, value + expected close date. Real-time stage updates via mutation |
| Properties | `/admin/properties` | Full CRUD with image thumbnails, property details (BHK, size, floor), availability badges. Image URL input with live preview |
| Assets | `/admin/assets` | Full CRUD project catalogue with WhatsApp template editor, price range, status badges, active toggle. Image + brochure URL support |
| Reports | `/admin/reports` | 4 KPI cards (leads, conversion rate, calls, pipeline), SourceBreakdownChart, LeadFunnelChart, caller performance grid |
| Templates | `/admin/templates` | WhatsApp template preview from assets table, redirect to Assets page for management (v1 simplification) |
| Documents | `/admin/documents` | Transaction documents table per deal (agreements + invoices), download/view actions |
| Attendance | `/admin/attendance` | Branch attendance overview with date filter, duration calculation, GPS coordinates display, status badges |
| Social | `/admin/social` | Social posts overview with platform icons, status badges, scheduled dates, creator names |
| Settings | `/admin/settings` | Branch info, timezone, lead assignment mode (round-robin/manual/least-busy), auto-followup toggle, integration status cards |

### Key Features
- **Real Supabase data** on every page — no mocks
- **Full CRUD** on Branches (from SA), Leads, Properties, Assets
- **Drag-and-drop Kanban** pipeline with instant database updates
- **Image previews** on Properties and Assets forms
- **WhatsApp template editor** with variable placeholders
- **Date filtering** on Attendance
- **Overdue alerts** banner on Dashboard
- **Caller workload** visible on Team page
- **Integration status** visible on Settings

### Reused Components
- DataTable (search, sort, pagination)
- Modal (slide-up mobile, centered desktop)
- ConfirmDialog (destructive actions)
- StatCard, Badge, Input, Button
- LeadStatusBadge, LeadTemperatureBadge
- Charts: SourceBreakdownChart, LeadFunnelChart

## How to Test

1. Login as `admin@estateflow.demo` / `password123`
2. Navigate through all 12 pages via sidebar
3. Add a new lead on `/admin/leads` → assign to a caller
4. Drag a deal between stages on `/admin/pipeline`
5. Add a property with image URL on `/admin/properties`
6. Filter attendance by date on `/admin/attendance`

## Next Steps
Proceed to **SESSION 05 — Manager (Complete, End to End)**
