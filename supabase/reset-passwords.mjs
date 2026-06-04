// Reset passwords using Supabase Admin API (handles bcrypt hashing correctly)
// Now that auth.users rows exist, this should work
// Run: node supabase/reset-passwords.mjs

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://rsdyopyafmbppzvqsqep.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzZHlvcHlhZm1icHB6dnFzcWVwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDQxOTA5MywiZXhwIjoyMDk1OTk1MDkzfQ.jUNSZPQUgu6h4vBi0o0AFO0FvIk7hWOJYIWcDCUyLIU'

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const users = [
  { id: '0dffdcb3-59f1-4701-abfd-6abbef656322', email: 'super@estateflow.demo' },
  { id: '9a62887b-a16e-4524-8345-9a98e31c0cae', email: 'admin@estateflow.demo' },
  { id: 'ecd71cf9-f628-4ecb-aa6e-3d98fe4472e5', email: 'manager1@estateflow.demo' },
  { id: '35db8336-5b9e-408b-965e-6159ce3f9be5', email: 'manager2@estateflow.demo' },
  { id: '98a63592-1c5c-4dc6-b5d5-47954d32ccc8', email: 'caller1@estateflow.demo' },
  { id: '71052889-2c3f-4b22-9b0f-e7fdd021e85a', email: 'caller2@estateflow.demo' },
  { id: '8130ed37-18e4-4cf0-93a0-1b08c36363c2', email: 'caller3@estateflow.demo' },
  { id: 'bfcd5ce1-9ebf-419d-8eda-c249b183a37a', email: 'caller4@estateflow.demo' },
  { id: 'eef620c3-ab27-4bc4-96c3-558c04423ddf', email: 'field@estateflow.demo' },
  { id: 'd90afb35-bed3-438c-9404-d6bf57b512ce', email: 'social@estateflow.demo' },
]

async function run() {
  // First list all users to confirm they exist
  const { data: { users: allUsers }, error: listErr } = await supabase.auth.admin.listUsers()
  if (listErr) {
    console.error('❌ Cannot list users:', listErr.message)
    return
  }

  const demoUsers = allUsers.filter(u => u.email?.includes('estateflow.demo'))
  console.log(`\n📋 Found ${demoUsers.length}/10 demo users in auth.users`)
  demoUsers.forEach(u => console.log(`   ✅ ${u.email} (id: ${u.id})`))

  if (demoUsers.length === 0) {
    console.log('\n❌ No users found — auth.users insert may have failed silently.')
    console.log('   Please check the Supabase dashboard → Authentication → Users tab.')
    return
  }

  // Reset password for each found user using their actual UUID from the database
  console.log('\n🔧 Setting passwords via Admin API (proper bcrypt hashing)...')
  for (const dbUser of demoUsers) {
    const { error } = await supabase.auth.admin.updateUserById(dbUser.id, {
      password: 'password123',
      email_confirm: true,
    })
    if (error) {
      console.error(`   ❌ ${dbUser.email}: ${error.message}`)
    } else {
      console.log(`   ✅ ${dbUser.email}: password set to "password123"`)
    }
  }

  console.log('\n✨ Done! Try logging in now with password: password123')
}

run().catch(console.error)
