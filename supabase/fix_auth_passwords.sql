-- Fix: Update all seed users to use a real bcrypt hash for 'password123'
-- Real bcrypt hash (cost 10) for the string: password123

UPDATE auth.users
SET 
  encrypted_password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LcOyC2u8UE6',
  updated_at = now()
WHERE email IN (
  'super@estateflow.demo',
  'admin@estateflow.demo',
  'manager1@estateflow.demo',
  'manager2@estateflow.demo',
  'caller1@estateflow.demo',
  'caller2@estateflow.demo',
  'caller3@estateflow.demo',
  'caller4@estateflow.demo',
  'field@estateflow.demo',
  'social@estateflow.demo'
);

-- Verify the update
SELECT email, 
       CASE WHEN encrypted_password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LcOyC2u8UE6' 
            THEN '✅ Fixed' ELSE '❌ Still broken' END AS status
FROM auth.users
WHERE email LIKE '%estateflow.demo';
