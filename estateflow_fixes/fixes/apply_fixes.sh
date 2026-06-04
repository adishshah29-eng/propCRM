#!/usr/bin/env bash
# =============================================================================
# EstateFlow CRM — Bug Fix Application Script
# Usage: bash apply_fixes.sh [/path/to/project-root]
# Default project root is the current directory.
# =============================================================================
set -euo pipefail

FIXES_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT="${1:-.}"

echo "🔧 Applying EstateFlow bug fixes to: $PROJECT"
echo ""

# ── 1. Create missing QueryProvider ──────────────────────────────────────────
echo "[1/10] Creating providers/QueryProvider.tsx  (CRITICAL: was missing)"
mkdir -p "$PROJECT/providers"
cp "$FIXES_DIR/providers/QueryProvider.tsx" \
   "$PROJECT/providers/QueryProvider.tsx"

# ── 2-7. Server-component pages: try/catch + parallel Promise.all ─────────────
echo "[2/10]  Patching app/admin/dashboard/page.tsx"
cp "$FIXES_DIR/app/admin/dashboard_page.tsx" \
   "$PROJECT/app/admin/dashboard/page.tsx"

echo "[3/10]  Patching app/admin/reports/page.tsx"
cp "$FIXES_DIR/app/admin/reports_page.tsx" \
   "$PROJECT/app/admin/reports/page.tsx"

echo "[4/10]  Patching app/caller/dashboard/page.tsx  (+ <a>→<Link>)"
cp "$FIXES_DIR/app/caller/dashboard_page.tsx" \
   "$PROJECT/app/caller/dashboard/page.tsx"

echo "[5/10]  Patching app/manager/dashboard/page.tsx"
cp "$FIXES_DIR/app/manager/dashboard_page.tsx" \
   "$PROJECT/app/manager/dashboard/page.tsx"

echo "[6/10]  Patching app/manager/reports/page.tsx"
cp "$FIXES_DIR/app/manager/reports_page.tsx" \
   "$PROJECT/app/manager/reports/page.tsx"

echo "[7/10]  Patching app/super-admin/dashboard/page.tsx"
cp "$FIXES_DIR/app/super-admin/dashboard_page.tsx" \
   "$PROJECT/app/super-admin/dashboard/page.tsx"

echo "[8/10]  Patching app/super-admin/reports/page.tsx"
cp "$FIXES_DIR/app/super-admin/reports_page.tsx" \
   "$PROJECT/app/super-admin/reports/page.tsx"

echo "[9/10]  Patching app/super-admin/billing/page.tsx"
cp "$FIXES_DIR/app/super-admin/billing_page.tsx" \
   "$PROJECT/app/super-admin/billing/page.tsx"

# ── 10. field/dashboard: raw <a> → <Link> ────────────────────────────────────
echo "[10/10] Patching app/field/dashboard/page.tsx  (<a>→<Link>)"
FIELD_DASH="$PROJECT/app/field/dashboard/page.tsx"

# Add Link import after the 'use client' line only if not already present
if ! grep -q "import Link from 'next/link'" "$FIELD_DASH"; then
  sed -i "s|^import { useState, useEffect } from 'react'|import Link from 'next/link'\nimport { useState, useEffect } from 'react'|" \
      "$FIELD_DASH"
fi

# Replace the raw <a> with <Link>
sed -i \
  's|<a href="/field/site-visits" className="text-sm text-primary hover:underline">View all →</a>|<Link href="/field/site-visits" className="text-sm text-primary hover:underline">View all \→<\/Link>|' \
  "$FIELD_DASH"

echo ""
echo "✅  All 10 fixes applied."
echo ""
echo "Next steps:"
echo "  1. Run:  npx tsc --noEmit   (verify no type errors)"
echo "  2. Run:  npm run build       (full production build check)"
