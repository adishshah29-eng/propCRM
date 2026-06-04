-- Fix auth.users: set correct bcrypt hash, aud, and role
UPDATE auth.users 
SET 
  encrypted_password = '$2b$10$yyskJ1ieoxcMsaGr.9bwMu.zgaUJGJhwlcNrLwlZTOXar3UJUOi12',
  aud = 'authenticated',
  role = 'authenticated'
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

-- Confirm the update
SELECT email, encrypted_password, aud, role FROM auth.users WHERE email LIKE '%estateflow.demo%';
