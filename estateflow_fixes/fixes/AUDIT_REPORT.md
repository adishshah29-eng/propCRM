# EstateFlow CRM — Next.js Code Audit Report

**Audited:** `app/` directory (121 files)  
**Issues found:** 8 bugs across 3 severity levels

---

## 🔴 CRITICAL — Will crash the app on first load

### Issue 1 · Missing `providers/QueryProvider.tsx`

**File:** `app/layout.tsx` line 3  
**Why it breaks:** The root layout unconditionally imports `QueryProvider` from `@/providers/QueryProvider`. This file does not exist in the codebase. The **entire app fails to compile and serve** — every single route returns a Module Not Found error.

```tsx
// app/layout.tsx — line 3
import { QueryProvider } from '@/providers/QueryProvider'  // ← file missing
```

**Fix:** Create `providers/QueryProvider.tsx`:

```tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // useState ensures a fresh QueryClient per request (server) and
  // a shared one per session (client) — never a module-level singleton.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 60 * 1000, retry: 1 } },
      })
  )
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
```

**Key details:**
- Must have `'use client'` — `QueryClientProvider` uses React context internally.
- `useState` factory pattern is required. A module-level `new QueryClient()` would be shared across all server-rendered requests, leaking data between users.

---

## 🟠 HIGH — Server pages crash the entire route on DB errors

### Issues 2–7 · Server Component dashboards/reports lack `try/catch`

**Affected files (6 total):**

| File | Why it crashes |
|------|----------------|
| `app/admin/dashboard/page.tsx` | 5 sequential `await supabase.from(...)` with no error handling |
| `app/admin/reports/page.tsx` | 4 sequential awaits with no error handling |
| `app/caller/dashboard/page.tsx` | 3 awaits + `auth.getUser()` with no error handling |
| `app/manager/dashboard/page.tsx` | 5 sequential awaits with no error handling |
| `app/manager/reports/page.tsx` | 4 sequential awaits with no error handling |
| `app/super-admin/dashboard/page.tsx` | 5 sequential awaits with no error handling |

**Why it breaks:** In Next.js 15 App Router, async Server Components that throw an unhandled error crash the entire page render and display the generic error boundary (or a blank 500 in production). A transient Supabase network hiccup, an RLS policy rejection, or a missing environment variable causes the dashboard to hard-crash instead of gracefully degrading.

Additionally, all 6 pages run their DB queries **sequentially** (`const a = await ...; const b = await ...`), which multiplies latency unnecessarily.

**Fix pattern** (applied to all 6 files):

```tsx
// ✅ CORRECT
export default async function AdminDashboardPage() {
  try {
    const supabase = await createClient()

    // Run all queries in parallel — not sequentially
    const [{ data: leads }, { data: users }, { data: deals }] =
      await Promise.all([
        supabase.from('leads').select('*'),
        supabase.from('profiles').select('*'),
        supabase.from('deals').select('*'),
      ])

    // ... derive stats ...
    return <div>...</div>

  } catch (error) {
    console.error('[AdminDashboard] Failed to load data:', error)
    return (
      <div>
        <PageHeader title="Branch Dashboard" description="..." />
        <div className="rounded-card border border-danger/20 bg-danger/10 p-6 text-center">
          <p className="text-sm font-medium text-danger">
            Failed to load dashboard data. Please refresh the page.
          </p>
        </div>
      </div>
    )
  }
}
```

---

## 🟡 MEDIUM — Navigation correctness

### Issue 8 · Raw `<a>` tags instead of Next.js `<Link>` in server/client pages

**Affected files (2 total):**

| File | Line | Raw anchor pointing to |
|------|------|------------------------|
| `app/caller/dashboard/page.tsx` | 76 | `/caller/my-leads` |
| `app/field/dashboard/page.tsx` | 212 | `/field/site-visits` |

**Why it breaks:** Using `<a href="...">` in a Next.js App Router app causes a **full page reload** instead of a client-side navigation. This discards the React tree, flashes a blank page, and loses all React Query cache. It won't "crash", but it is incorrect behavior that degrades UX significantly.

**Fix:**

```tsx
// ❌ WRONG — causes full page reload
<a href="/caller/my-leads" className="text-sm text-primary hover:underline">View all →</a>

// ✅ CORRECT — client-side navigation
import Link from 'next/link'
<Link href="/caller/my-leads" className="text-sm text-primary hover:underline">View all →</Link>
```

---

## ✅ Items audited and confirmed correct

| Check | Result |
|-------|--------|
| `(auth)` route group URL mapping | ✅ `/login` and `/forgot-password` URLs resolve correctly |
| `Link` hrefs in auth pages | ✅ `/login` ↔ `/forgot-password` cross-links are correct |
| `router.push` in `login/page.tsx` | ✅ Points to `getDashboardPath(role)` — correct indirection |
| `router.push('/caller/my-leads')` in `caller/lead/[id]/page.tsx` | ✅ Route exists |
| All `'use client'` directives on hook-using pages | ✅ No missing directives found |
| No server components using client-only hooks | ✅ All async server components are clean |
| Double-brace `{{ }}` syntax errors | ✅ None found |
| All `useMutation` pages have `onError` handlers | ✅ All mutations surface errors via `setError(err.message)` |
| API routes (`/api/twilio/*`, `/api/ai/*`, `/api/whatsapp/*`) | ✅ All wrapped in `try/catch`, return correct HTTP status codes |
| `super-admin/users/page.tsx` — `saveMutation` only updates, never creates | ⚠️ NOTE: The "Add User" button calls `saveMutation.mutate()` but `mutationFn` only runs the update branch when `editingUser` is set. New user creation is a no-op (silently succeeds without inserting). This is a **logic bug**, not a crash — add Supabase Auth invite flow or an insert for the create path. |

---

## Complete File Change List

| File to create/replace | Change |
|------------------------|--------|
| `providers/QueryProvider.tsx` | **CREATE** — was missing entirely |
| `app/admin/dashboard/page.tsx` | **REPLACE** — add `try/catch`, parallelize queries |
| `app/admin/reports/page.tsx` | **REPLACE** — add `try/catch`, parallelize queries |
| `app/caller/dashboard/page.tsx` | **REPLACE** — add `try/catch`, parallelize queries, `<a>` → `<Link>` |
| `app/manager/dashboard/page.tsx` | **REPLACE** — add `try/catch`, parallelize queries |
| `app/manager/reports/page.tsx` | **REPLACE** — add `try/catch`, parallelize queries |
| `app/super-admin/dashboard/page.tsx` | **REPLACE** — add `try/catch`, parallelize queries |
| `app/field/dashboard/page.tsx` | **PATCH** — `<a>` → `<Link>` (add `import Link` at top) |
| `app/super-admin/reports/page.tsx` | **REPLACE** — add `try/catch`, parallelize queries |
| `app/super-admin/billing/page.tsx` | **REPLACE** — add `try/catch`, parallelize queries |

To apply all fixes at once, run:

```bash
bash apply_fixes.sh /path/to/your/project
```
