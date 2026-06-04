// Diagnostic + fix script
// Run with: node supabase/fix-auth.mjs

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const targetEmails = [
  'super@estateflow.demo',
  'admin@estateflow.demo',
  'manager1@estateflow.demo',
  'manager2@estateflow.demo',
  'caller1@estateflow.demo',
  'caller2@estateflow.demo',
  'caller3@estateflow.demo',
  'caller4@estateflow.demo',
  'field@estateflow.demo',
  'social@estateflow.demo',
]

async function run() {
  // Step 1: List all users and find existing ones
  console.log('🔍 Fetching all users from Supabase Auth...\n')
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()

  if (listError) {
    console.error('❌ Could not list users:', listError.message)
    return
  }

  console.log(`Found ${users.length} total users in auth.users\n`)

  const existing = users.filter(u => targetEmails.includes(u.email))
  const existingEmails = existing.map(u => u.email)
  const missing = targetEmails.filter(e => !existingEmails.includes(e))

  console.log('✅ Found these demo users:')
  existing.forEach(u => console.log(`   ${u.email} (id: ${u.id})`))

  console.log('\n❌ Missing these demo users:')
  missing.forEach(e => console.log(`   ${e}`))

  // Step 2: Reset password for existing users
  if (existing.length > 0) {
    console.log('\n🔧 Resetting passwords for existing users...')
    for (const user of existing) {
      const { error } = await supabase.auth.admin.updateUserById(user.id, {
        password: 'password123',
        email_confirm: true,
      })
      if (error) {
        console.error(`   ❌ ${user.email}: ${error.message}`)
      } else {
        console.log(`   ✅ ${user.email}: password reset to "password123"`)
      }
    }
  }

  // Step 3: Create missing users (without forcing UUID)
  if (missing.length > 0) {
    console.log('\n🆕 Creating missing users...')
    for (const email of missing) {
      const fullName = {
        'super@estateflow.demo': 'Aarav Sharma',
        'admin@estateflow.demo': 'Priya Patel',
        'manager1@estateflow.demo': 'Rahul Verma',
        'manager2@estateflow.demo': 'Sneha Gupta',
        'caller1@estateflow.demo': 'Arjun Nair',
        'caller2@estateflow.demo': 'Meera Iyer',
        'caller3@estateflow.demo': 'Vikram Rao',
        'caller4@estateflow.demo': 'Ananya Desai',
        'field@estateflow.demo': 'Karan Singh',
        'social@estateflow.demo': 'Tanya Bose',
      }[email]

      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password: 'password123',
        email_confirm: true,
        user_metadata: { full_name: fullName },
      })

      if (error) {
        console.error(`   ❌ ${email}: ${error.message}`)
      } else {
        console.log(`   ✅ Created ${email} → new id: ${data.user.id}`)
        console.log(`      ⚠️  Update profiles table: set id='${data.user.id}' where email='${email}'`)
      }
    }
  }

  console.log('\n✨ Done! Try logging in with password: password123')
}

run().catch(console.error)
