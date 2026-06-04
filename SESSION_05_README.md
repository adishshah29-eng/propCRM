# SESSION 05 — Manager (Complete, End to End)

## ✅ Status: COMPLETE

## Deliverables

### Pages (8 total)

| Page | Route | Features |
|------|-------|----------|
| Dashboard | `/manager/dashboard` | Team KPIs (callers, today's calls, overdue tasks, pipeline), live activity feed (last 10 calls with outcomes), LeadFunnelChart, SourceBreakdownChart |
| My Team | `/manager/my-team` | Caller cards with stats (leads, calls, talk time), overdue alerts per caller, one-click reassign leads modal |
| Leads | `/manager/leads` | Full lead table with status + temperature filters, edit modal, flag button (creates urgent task), score display |
| Pipeline | `/manager/pipeline` | Drag-and-drop Kanban (8 stages), same as admin but manager scope. Deal cards with probability, value, expected close |
| Assets | `/manager/assets` | Grid view of active assets with image thumbnails, share modal with WhatsApp template preview, brochure link |
| Appointments | `/manager/appointments` | Site visits calendar (tasks with "visit" in title), schedule/edit/delete visits, lead + agent dropdowns, datetime picker |
| Tasks | `/manager/tasks` | Full CRUD task management with priority badges, overdue highlighting, assign to caller, status tracking |
| Reports | `/manager/reports` | 4 KPI cards, SourceBreakdownChart, LeadFunnelChart, detailed caller performance table (leads, calls, deals won, talk time, conversion %) |

### Key Features
- **Live activity feed**: Real-time call history with caller avatars, outcomes, and timestamps
- **Caller workload cards**: Visual stats per caller with reassign button
- **Lead flagging**: One-click creates urgent follow-up task
- **Kanban drag-and-drop**: Same implementation as admin, manager-scoped
- **Appointment scheduling**: Uses tasks table as proxy (v1), with dedicated UI
- **Overdue highlighting**: Tasks and leads show danger styling when past due
- **Caller performance table**: Conversion rates, talk time, deals won per caller

### Reused Components
- DataTable, Modal, ConfirmDialog, StatCard, Badge, Input, Button
- LeadStatusBadge, LeadTemperatureBadge
- Charts: SourceBreakdownChart, LeadFunnelChart

## How to Test

1. Login as `manager1@estateflow.demo` / `password123`
2. View live activity feed on Dashboard
3. Reassign leads from My Team page
4. Flag a lead for urgent follow-up on Leads page
5. Schedule a site visit on Appointments page
6. View caller conversion rates on Reports page

## Next Steps
Proceed to **SESSION 06 — Caller (Complete, End to End)**
