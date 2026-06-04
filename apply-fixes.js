const fs = require('fs')
const path = require('path')

const projectDir = __dirname
const fixesDir = path.join(projectDir, 'estateflow_fixes', 'fixes')

console.log(`🔧 Applying EstateFlow bug fixes to: ${projectDir}\n`)

// 1. Create missing QueryProvider (already created but safe to copy again)
console.log('[1/10] Creating providers/QueryProvider.tsx')
fs.mkdirSync(path.join(projectDir, 'src/providers'), { recursive: true })
fs.copyFileSync(
  path.join(fixesDir, 'providers', 'QueryProvider.tsx'),
  path.join(projectDir, 'src/providers', 'QueryProvider.tsx')
)

// 2-9. Server-component pages
const patchFiles = [
  { src: 'app/admin/dashboard_page.tsx', dest: 'src/app/admin/dashboard/page.tsx' },
  { src: 'app/admin/reports_page.tsx', dest: 'src/app/admin/reports/page.tsx' },
  { src: 'app/caller/dashboard_page.tsx', dest: 'src/app/caller/dashboard/page.tsx' },
  { src: 'app/manager/dashboard_page.tsx', dest: 'src/app/manager/dashboard/page.tsx' },
  { src: 'app/manager/reports_page.tsx', dest: 'src/app/manager/reports/page.tsx' },
  { src: 'app/super-admin/dashboard_page.tsx', dest: 'src/app/super-admin/dashboard/page.tsx' },
  { src: 'app/super-admin/reports_page.tsx', dest: 'src/app/super-admin/reports/page.tsx' },
  { src: 'app/super-admin/billing_page.tsx', dest: 'src/app/super-admin/billing/page.tsx' }
]

patchFiles.forEach((f, i) => {
  console.log(`[${i+2}/10] Patching ${f.dest}`)
  const srcPath = path.join(fixesDir, f.src)
  const destPath = path.join(projectDir, f.dest)
  
  // ensure directory exists
  fs.mkdirSync(path.dirname(destPath), { recursive: true })
  
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath)
  } else {
    console.warn(`Source file missing: ${srcPath}`)
  }
})

// 10. field/dashboard: raw <a> -> <Link>
console.log('[10/10] Patching src/app/field/dashboard/page.tsx (<a>-><Link>)')
const fieldDashPath = path.join(projectDir, 'src/app/field/dashboard/page.tsx')
if (fs.existsSync(fieldDashPath)) {
  let content = fs.readFileSync(fieldDashPath, 'utf8')
  if (!content.includes("import Link from 'next/link'")) {
    content = content.replace(
      "import { useState, useEffect } from 'react'",
      "import Link from 'next/link'\nimport { useState, useEffect } from 'react'"
    )
  }
  content = content.replace(
    '<a href="/field/site-visits" className="text-sm text-primary hover:underline">View all →</a>',
    '<Link href="/field/site-visits" className="text-sm text-primary hover:underline">View all →</Link>'
  )
  fs.writeFileSync(fieldDashPath, content)
}

console.log('\n✅ All 10 fixes applied.')
