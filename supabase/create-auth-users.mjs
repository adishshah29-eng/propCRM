// Creates / resets all seed demo users via Supabase Admin API
// Run with: node supabase/create-auth-users.mjs

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const users = [
  { email: 'super@estateflow.demo', password: 'password123', full_name: 'Aarav Sharma', id: '0dffdcb3-59f1-4701-abfd-6abbef656322' },
  { email: 'admin@estateflow.demo', password: 'password123', full_name: 'Priya Patel', id: '9a62887b-a16e-4524-8345-9a98e31c0cae' },
  { email: 'manager1@estateflow.demo', password: 'password123', full_name: 'Rahul Verma', id: 'ecd71cf9-f628-4ecb-aa6e-3d98fe4472e5' },
  { email: 'manager2@estateflow.demo', password: 'password123', full_name: 'Sneha Gupta', id: '35db8336-5b9e-408b-965e-6159ce3f9be5' },
  { email: 'caller1@estateflow.demo', password: 'password123', full_name: 'Arjun Nair', id: '98a63592-1c5c-4dc6-b5d5-47954d32ccc8' },
  { email: 'caller2@estateflow.demo', password: 'password123', full_name: 'Meera Iyer', id: '71052889-2c3f-4b22-9b0f-e7fdd021e85a' },
  { email: 'caller3@estateflow.demo', password: 'password123', full_name: 'Vikram Rao', id: '8130ed37-18e4-4cf0-93a0-1b08c36363c2' },
  { email: 'caller4@estateflow.demo', password: 'password123', full_name: 'Ananya Desai', id: 'bfcd5ce1-9ebf-419d-8eda-c249b183a37a' },
  { email: 'field@estateflow.demo', password: 'password123', full_name: 'Karan Singh', id: 'eef620c3-ab27-4bc4-96c3-558c04423ddf' },
  { email: 'social@estateflow.demo', password: 'password123', full_name: 'Tanya Bose', id: 'd90afb35-bed3-438c-9404-d6bf57b512ce' },
]

async function run() {
  console.log('🚀 Creating/updating EstateFlow demo users...\n')

  for (const user of users) {
    // Try to update password first (in case user exists)
    const { data: existing } = await supabase.auth.admin.getUserById(user.id)

    if (existing?.user) {
      // User exists — just reset the password
      const { error } = await supabase.auth.admin.updateUserById(user.id, {
        password: user.password,
        email_confirm: true,
      })
      if (error) {
        console.error(`❌ Failed to update ${user.email}:`, error.message)
      } else {
        console.log(`✅ Updated password for: ${user.email}`)
      }
    } else {
      // User does not exist — create with specific UUID
      const { error } = await supabase.auth.admin.createUser({
        user_metadata: { full_name: user.full_name },
        email: user.email,
        password: user.password,
        email_confirm: true,
        // Note: Supabase admin API generates its own UUID; we rely on profiles already having the correct IDs
      })
      if (error) {
        console.error(`❌ Failed to create ${user.email}:`, error.message)
      } else {
        console.log(`✅ Created: ${user.email}`)
      }
    }
  }

  console.log('\n✨ Done! Try logging in with password: password123')
}

run().catch(console.error)
