-- ============================================================
-- STEP 1: Run this in Supabase SQL Editor
-- This inserts auth users directly bypassing the Admin API
-- ============================================================

-- First, check if there are any existing auth users
SELECT id, email FROM auth.users WHERE email LIKE '%estateflow.demo';

-- Insert auth.users with VALID bcrypt hash for 'password123'
-- Hash: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LcOyC2u8UE6
INSERT INTO auth.users 
  (id, instance_id, email, encrypted_password, email_confirmed_at, 
   raw_app_meta_data, raw_user_meta_data, 
   aud, role, created_at, updated_at,
   confirmation_token, recovery_token, email_change_token_new, email_change)
VALUES
  ('0dffdcb3-59f1-4701-abfd-6abbef656322', '00000000-0000-0000-0000-000000000000',
   'super@estateflow.demo',
   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LcOyC2u8UE6',
   now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Aarav Sharma"}',
   'authenticated', 'authenticated', now(), now(), '', '', '', ''),

  ('9a62887b-a16e-4524-8345-9a98e31c0cae', '00000000-0000-0000-0000-000000000000',
   'admin@estateflow.demo',
   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LcOyC2u8UE6',
   now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Priya Patel"}',
   'authenticated', 'authenticated', now(), now(), '', '', '', ''),

  ('ecd71cf9-f628-4ecb-aa6e-3d98fe4472e5', '00000000-0000-0000-0000-000000000000',
   'manager1@estateflow.demo',
   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LcOyC2u8UE6',
   now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Rahul Verma"}',
   'authenticated', 'authenticated', now(), now(), '', '', '', ''),

  ('35db8336-5b9e-408b-965e-6159ce3f9be5', '00000000-0000-0000-0000-000000000000',
   'manager2@estateflow.demo',
   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LcOyC2u8UE6',
   now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Sneha Gupta"}',
   'authenticated', 'authenticated', now(), now(), '', '', '', ''),

  ('98a63592-1c5c-4dc6-b5d5-47954d32ccc8', '00000000-0000-0000-0000-000000000000',
   'caller1@estateflow.demo',
   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LcOyC2u8UE6',
   now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Arjun Nair"}',
   'authenticated', 'authenticated', now(), now(), '', '', '', ''),

  ('71052889-2c3f-4b22-9b0f-e7fdd021e85a', '00000000-0000-0000-0000-000000000000',
   'caller2@estateflow.demo',
   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LcOyC2u8UE6',
   now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Meera Iyer"}',
   'authenticated', 'authenticated', now(), now(), '', '', '', ''),

  ('8130ed37-18e4-4cf0-93a0-1b08c36363c2', '00000000-0000-0000-0000-000000000000',
   'caller3@estateflow.demo',
   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LcOyC2u8UE6',
   now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Vikram Rao"}',
   'authenticated', 'authenticated', now(), now(), '', '', '', ''),

  ('bfcd5ce1-9ebf-419d-8eda-c249b183a37a', '00000000-0000-0000-0000-000000000000',
   'caller4@estateflow.demo',
   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LcOyC2u8UE6',
   now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Ananya Desai"}',
   'authenticated', 'authenticated', now(), now(), '', '', '', ''),

  ('eef620c3-ab27-4bc4-96c3-558c04423ddf', '00000000-0000-0000-0000-000000000000',
   'field@estateflow.demo',
   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LcOyC2u8UE6',
   now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Karan Singh"}',
   'authenticated', 'authenticated', now(), now(), '', '', '', ''),

  ('d90afb35-bed3-438c-9404-d6bf57b512ce', '00000000-0000-0000-0000-000000000000',
   'social@estateflow.demo',
   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LcOyC2u8UE6',
   now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Tanya Bose"}',
   'authenticated', 'authenticated', now(), now(), '', '', '', '')

ON CONFLICT (id) DO UPDATE SET
  encrypted_password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LcOyC2u8UE6',
  email_confirmed_at = now(),
  updated_at = now();

-- Verify
SELECT id, email, email_confirmed_at IS NOT NULL as confirmed 
FROM auth.users 
WHERE email LIKE '%estateflow.demo'
ORDER BY email;
