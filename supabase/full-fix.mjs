// Full fix: Delete conflicting profiles → create auth users → restore profile data
// Run: node supabase/full-fix.mjs

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://rsdyopyafmbppzvqsqep.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzZHlvcHlhZm1icHB6dnFzcWVwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDQxOTA5MywiZXhwIjoyMDk1OTk1MDkzfQ.jUNSZPQUgu6h4vBi0o0AFO0FvIk7hWOJYIWcDCUyLIU'

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const ORG_ID = '61b13237-1130-4259-b64e-17fd95ee1c7c'
const BRANCH_ID = '083817c1-cee8-4c01-9e2f-c25d9267aee6'

const users = [
  { email: 'super@estateflow.demo',    password: 'password123', full_name: 'Aarav Sharma',  role: 'super_admin',    branch_id: null,      phone: '+91-98765-43210', theme: 'dark' },
  { email: 'admin@estateflow.demo',    password: 'password123', full_name: 'Priya Patel',   role: 'admin',          branch_id: BRANCH_ID, phone: '+91-98765-43211', theme: 'dark' },
  { email: 'manager1@estateflow.demo', password: 'password123', full_name: 'Rahul Verma',   role: 'manager',        branch_id: BRANCH_ID, phone: '+91-98765-43212', theme: 'dark' },
  { email: 'manager2@estateflow.demo', password: 'password123', full_name: 'Sneha Gupta',   role: 'manager',        branch_id: BRANCH_ID, phone: '+91-98765-43213', theme: 'light' },
  { email: 'caller1@estateflow.demo',  password: 'password123', full_name: 'Arjun Nair',    role: 'caller',         branch_id: BRANCH_ID, phone: '+91-98765-43214', theme: 'dark' },
  { email: 'caller2@estateflow.demo',  password: 'password123', full_name: 'Meera Iyer',    role: 'caller',         branch_id: BRANCH_ID, phone: '+91-98765-43215', theme: 'dark' },
  { email: 'caller3@estateflow.demo',  password: 'password123', full_name: 'Vikram Rao',    role: 'caller',         branch_id: BRANCH_ID, phone: '+91-98765-43216', theme: 'light' },
  { email: 'caller4@estateflow.demo',  password: 'password123', full_name: 'Ananya Desai',  role: 'caller',         branch_id: BRANCH_ID, phone: '+91-98765-43217', theme: 'dark' },
  { email: 'field@estateflow.demo',    password: 'password123', full_name: 'Karan Singh',   role: 'field_exec',     branch_id: BRANCH_ID, phone: '+91-98765-43218', theme: 'dark' },
  { email: 'social@estateflow.demo',   password: 'password123', full_name: 'Tanya Bose',    role: 'social_manager', branch_id: BRANCH_ID, phone: '+91-98765-43219', theme: 'light' },
]

const OLD_IDS = [
  '0dffdcb3-59f1-4701-abfd-6abbef656322',
  '9a62887b-a16e-4524-8345-9a98e31c0cae',
  'ecd71cf9-f628-4ecb-aa6e-3d98fe4472e5',
  '35db8336-5b9e-408b-965e-6159ce3f9be5',
  '98a63592-1c5c-4dc6-b5d5-47954d32ccc8',
  '71052889-2c3f-4b22-9b0f-e7fdd021e85a',
  '8130ed37-18e4-4cf0-93a0-1b08c36363c2',
  'bfcd5ce1-9ebf-419d-8eda-c249b183a37a',
  'eef620c3-ab27-4bc4-96c3-558c04423ddf',
  'd90afb35-bed3-438c-9404-d6bf57b512ce',
]

async function run() {
  console.log('🧹 Step 1: Deleting existing profile rows (to unblock auth user creation)...')
  const { error: delErr } = await supabase
    .from('profiles')
    .delete()
    .in('id', OLD_IDS)
  if (delErr) {
    console.error('❌ Could not delete profiles:', delErr.message)
    console.log('   You may need to delete related records first (leads, tasks, etc.)')
    console.log('   Try running the SQL below in the Supabase SQL Editor and then re-run this script:\n')
    console.log(`   DELETE FROM notifications WHERE user_id IN ('${OLD_IDS.join("','")}');`)
    console.log(`   DELETE FROM tasks WHERE assigned_to IN ('${OLD_IDS.join("','")}') OR created_by IN ('${OLD_IDS.join("','")}');`)
    console.log(`   DELETE FROM activities WHERE created_by IN ('${OLD_IDS.join("','")}');`)
    console.log(`   DELETE FROM attendance WHERE user_id IN ('${OLD_IDS.join("','")}');`)
    console.log(`   DELETE FROM calls WHERE agent_id IN ('${OLD_IDS.join("','")}');`)
    console.log(`   DELETE FROM messages WHERE sender_id IN ('${OLD_IDS.join("','")}');`)
    console.log(`   DELETE FROM follow_ups WHERE assigned_to IN ('${OLD_IDS.join("','")}');`)
    console.log(`   DELETE FROM social_posts WHERE created_by IN ('${OLD_IDS.join("','")}') OR assigned_to IN ('${OLD_IDS.join("','")}');`)
    console.log(`   DELETE FROM assets WHERE created_by IN ('${OLD_IDS.join("','")}');`)
    console.log(`   UPDATE leads SET assigned_to = NULL WHERE assigned_to IN ('${OLD_IDS.join("','")}');`)
    console.log(`   UPDATE branches SET admin_id = NULL WHERE admin_id IN ('${OLD_IDS.join("','")}');`)
    console.log(`   DELETE FROM profiles WHERE id IN ('${OLD_IDS.join("','")}');`)
    return
  }
  console.log('   ✅ Profiles deleted\n')

  console.log('👤 Step 2: Creating auth users (Supabase handles bcrypt hashing)...')
  const createdUsers = []
  for (const u of users) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { full_name: u.full_name },
    })
    if (error) {
      console.error(`   ❌ ${u.email}: ${error.message}`)
    } else {
      console.log(`   ✅ Created ${u.email} → id: ${data.user.id}`)
      createdUsers.push({ ...u, id: data.user.id })
    }
  }

  if (createdUsers.length === 0) {
    console.log('\n❌ No users created. Something is still blocking creation.')
    return
  }

  console.log('\n📝 Step 3: Restoring profile data with new UUIDs...')
  for (const u of createdUsers) {
    const { error } = await supabase.from('profiles').upsert({
      id: u.id,
      org_id: ORG_ID,
      branch_id: u.branch_id,
      full_name: u.full_name,
      email: u.email,
      role: u.role,
      phone: u.phone,
      theme: u.theme,
      is_active: true,
    })
    if (error) {
      console.error(`   ❌ Profile for ${u.email}: ${error.message}`)
    } else {
      console.log(`   ✅ Profile restored: ${u.email} (${u.role})`)
    }
  }

  console.log('\n✨ All done!')
  console.log('\n📋 Login credentials:')
  createdUsers.forEach(u => console.log(`   ${u.email} / password123  [${u.role}]`))
  console.log('\n⚠️  Note: UUIDs have changed. Leads/deals/other linked data may need re-seeding.')
}

run().catch(console.error)
