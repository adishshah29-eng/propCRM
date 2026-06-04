-- ============================================================
-- FIX: Insert missing auth.identities rows
-- Supabase requires an identity record for email/password login
-- Run this in the Supabase SQL Editor
-- ============================================================

INSERT INTO auth.identities 
  (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES
  (gen_random_uuid(), '0dffdcb3-59f1-4701-abfd-6abbef656322', 'super@estateflow.demo',
   '{"sub":"0dffdcb3-59f1-4701-abfd-6abbef656322","email":"super@estateflow.demo","email_verified":true}',
   'email', now(), now(), now()),

  (gen_random_uuid(), '9a62887b-a16e-4524-8345-9a98e31c0cae', 'admin@estateflow.demo',
   '{"sub":"9a62887b-a16e-4524-8345-9a98e31c0cae","email":"admin@estateflow.demo","email_verified":true}',
   'email', now(), now(), now()),

  (gen_random_uuid(), 'ecd71cf9-f628-4ecb-aa6e-3d98fe4472e5', 'manager1@estateflow.demo',
   '{"sub":"ecd71cf9-f628-4ecb-aa6e-3d98fe4472e5","email":"manager1@estateflow.demo","email_verified":true}',
   'email', now(), now(), now()),

  (gen_random_uuid(), '35db8336-5b9e-408b-965e-6159ce3f9be5', 'manager2@estateflow.demo',
   '{"sub":"35db8336-5b9e-408b-965e-6159ce3f9be5","email":"manager2@estateflow.demo","email_verified":true}',
   'email', now(), now(), now()),

  (gen_random_uuid(), '98a63592-1c5c-4dc6-b5d5-47954d32ccc8', 'caller1@estateflow.demo',
   '{"sub":"98a63592-1c5c-4dc6-b5d5-47954d32ccc8","email":"caller1@estateflow.demo","email_verified":true}',
   'email', now(), now(), now()),

  (gen_random_uuid(), '71052889-2c3f-4b22-9b0f-e7fdd021e85a', 'caller2@estateflow.demo',
   '{"sub":"71052889-2c3f-4b22-9b0f-e7fdd021e85a","email":"caller2@estateflow.demo","email_verified":true}',
   'email', now(), now(), now()),

  (gen_random_uuid(), '8130ed37-18e4-4cf0-93a0-1b08c36363c2', 'caller3@estateflow.demo',
   '{"sub":"8130ed37-18e4-4cf0-93a0-1b08c36363c2","email":"caller3@estateflow.demo","email_verified":true}',
   'email', now(), now(), now()),

  (gen_random_uuid(), 'bfcd5ce1-9ebf-419d-8eda-c249b183a37a', 'caller4@estateflow.demo',
   '{"sub":"bfcd5ce1-9ebf-419d-8eda-c249b183a37a","email":"caller4@estateflow.demo","email_verified":true}',
   'email', now(), now(), now()),

  (gen_random_uuid(), 'eef620c3-ab27-4bc4-96c3-558c04423ddf', 'field@estateflow.demo',
   '{"sub":"eef620c3-ab27-4bc4-96c3-558c04423ddf","email":"field@estateflow.demo","email_verified":true}',
   'email', now(), now(), now()),

  (gen_random_uuid(), 'd90afb35-bed3-438c-9404-d6bf57b512ce', 'social@estateflow.demo',
   '{"sub":"d90afb35-bed3-438c-9404-d6bf57b512ce","email":"social@estateflow.demo","email_verified":true}',
   'email', now(), now(), now())

ON CONFLICT (provider, provider_id) DO NOTHING;

-- Verify: should show 10 rows
SELECT i.provider_id, i.provider, u.email_confirmed_at IS NOT NULL as confirmed
FROM auth.identities i
JOIN auth.users u ON u.id = i.user_id
WHERE i.provider_id LIKE '%estateflow.demo'
ORDER BY i.provider_id;
