-- Run this in Supabase SQL Editor to wipe broken auth rows
-- Then run: node supabase/full-fix.mjs

-- Step 1: Delete broken identities
DELETE FROM auth.identities 
WHERE provider_id LIKE '%estateflow.demo';

-- Step 2: Delete broken auth users  
DELETE FROM auth.users 
WHERE email LIKE '%estateflow.demo';

-- Verify both are empty
SELECT 'auth.users' as tbl, count(*) FROM auth.users WHERE email LIKE '%estateflow.demo'
UNION ALL
SELECT 'auth.identities', count(*) FROM auth.identities WHERE provider_id LIKE '%estateflow.demo';
