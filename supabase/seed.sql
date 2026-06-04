-- Seed Data for EstateFlow CRM
-- Run after all migrations are applied
-- Default password for all users: password123

-- ============================================
-- ORGANIZATION & BRANCH
-- ============================================
INSERT INTO organizations (id, name, plan) VALUES
('61b13237-1130-4259-b64e-17fd95ee1c7c', 'EstateFlow Demo Org', 'pro');

INSERT INTO branches (id, org_id, name, location, admin_id) VALUES
('083817c1-cee8-4c01-9e2f-c25d9267aee6', '61b13237-1130-4259-b64e-17fd95ee1c7c', 'Gurgaon HQ', 'Gurgaon, Haryana', NULL);

-- ============================================
-- AUTH USERS (for local dev — create via Auth API in production)
-- Password for all: password123
-- bcrypt hash generated for 'password123'
-- ============================================
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at) VALUES
('0dffdcb3-59f1-4701-abfd-6abbef656322', 'super@estateflow.demo', '$2a$10$abcdefghijklmnopqrstuvwx1234567890123456789012345678', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Aarav Sharma"}', now(), now()),
('9a62887b-a16e-4524-8345-9a98e31c0cae', 'admin@estateflow.demo', '$2a$10$abcdefghijklmnopqrstuvwx1234567890123456789012345678', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Priya Patel"}', now(), now()),
('ecd71cf9-f628-4ecb-aa6e-3d98fe4472e5', 'manager1@estateflow.demo', '$2a$10$abcdefghijklmnopqrstuvwx1234567890123456789012345678', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Rahul Verma"}', now(), now()),
('35db8336-5b9e-408b-965e-6159ce3f9be5', 'manager2@estateflow.demo', '$2a$10$abcdefghijklmnopqrstuvwx1234567890123456789012345678', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Sneha Gupta"}', now(), now()),
('98a63592-1c5c-4dc6-b5d5-47954d32ccc8', 'caller1@estateflow.demo', '$2a$10$abcdefghijklmnopqrstuvwx1234567890123456789012345678', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Arjun Nair"}', now(), now()),
('71052889-2c3f-4b22-9b0f-e7fdd021e85a', 'caller2@estateflow.demo', '$2a$10$abcdefghijklmnopqrstuvwx1234567890123456789012345678', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Meera Iyer"}', now(), now()),
('8130ed37-18e4-4cf0-93a0-1b08c36363c2', 'caller3@estateflow.demo', '$2a$10$abcdefghijklmnopqrstuvwx1234567890123456789012345678', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Vikram Rao"}', now(), now()),
('bfcd5ce1-9ebf-419d-8eda-c249b183a37a', 'caller4@estateflow.demo', '$2a$10$abcdefghijklmnopqrstuvwx1234567890123456789012345678', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Ananya Desai"}', now(), now()),
('eef620c3-ab27-4bc4-96c3-558c04423ddf', 'field@estateflow.demo', '$2a$10$abcdefghijklmnopqrstuvwx1234567890123456789012345678', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Karan Singh"}', now(), now()),
('d90afb35-bed3-438c-9404-d6bf57b512ce', 'social@estateflow.demo', '$2a$10$abcdefghijklmnopqrstuvwx1234567890123456789012345678', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Tanya Bose"}', now(), now());

-- ============================================
-- PROFILES
-- ============================================
INSERT INTO profiles (id, org_id, branch_id, full_name, email, role, phone, theme, is_active) VALUES
('0dffdcb3-59f1-4701-abfd-6abbef656322', '61b13237-1130-4259-b64e-17fd95ee1c7c', NULL, 'Aarav Sharma', 'super@estateflow.demo', 'super_admin', '+91-98765-43210', 'dark', true),
('9a62887b-a16e-4524-8345-9a98e31c0cae', '61b13237-1130-4259-b64e-17fd95ee1c7c', '083817c1-cee8-4c01-9e2f-c25d9267aee6', 'Priya Patel', 'admin@estateflow.demo', 'admin', '+91-98765-43211', 'dark', true),
('ecd71cf9-f628-4ecb-aa6e-3d98fe4472e5', '61b13237-1130-4259-b64e-17fd95ee1c7c', '083817c1-cee8-4c01-9e2f-c25d9267aee6', 'Rahul Verma', 'manager1@estateflow.demo', 'manager', '+91-98765-43212', 'dark', true),
('35db8336-5b9e-408b-965e-6159ce3f9be5', '61b13237-1130-4259-b64e-17fd95ee1c7c', '083817c1-cee8-4c01-9e2f-c25d9267aee6', 'Sneha Gupta', 'manager2@estateflow.demo', 'manager', '+91-98765-43213', 'light', true),
('98a63592-1c5c-4dc6-b5d5-47954d32ccc8', '61b13237-1130-4259-b64e-17fd95ee1c7c', '083817c1-cee8-4c01-9e2f-c25d9267aee6', 'Arjun Nair', 'caller1@estateflow.demo', 'caller', '+91-98765-43214', 'dark', true),
('71052889-2c3f-4b22-9b0f-e7fdd021e85a', '61b13237-1130-4259-b64e-17fd95ee1c7c', '083817c1-cee8-4c01-9e2f-c25d9267aee6', 'Meera Iyer', 'caller2@estateflow.demo', 'caller', '+91-98765-43215', 'dark', true),
('8130ed37-18e4-4cf0-93a0-1b08c36363c2', '61b13237-1130-4259-b64e-17fd95ee1c7c', '083817c1-cee8-4c01-9e2f-c25d9267aee6', 'Vikram Rao', 'caller3@estateflow.demo', 'caller', '+91-98765-43216', 'light', true),
('bfcd5ce1-9ebf-419d-8eda-c249b183a37a', '61b13237-1130-4259-b64e-17fd95ee1c7c', '083817c1-cee8-4c01-9e2f-c25d9267aee6', 'Ananya Desai', 'caller4@estateflow.demo', 'caller', '+91-98765-43217', 'dark', true),
('eef620c3-ab27-4bc4-96c3-558c04423ddf', '61b13237-1130-4259-b64e-17fd95ee1c7c', '083817c1-cee8-4c01-9e2f-c25d9267aee6', 'Karan Singh', 'field@estateflow.demo', 'field_exec', '+91-98765-43218', 'dark', true),
('d90afb35-bed3-438c-9404-d6bf57b512ce', '61b13237-1130-4259-b64e-17fd95ee1c7c', '083817c1-cee8-4c01-9e2f-c25d9267aee6', 'Tanya Bose', 'social@estateflow.demo', 'social_manager', '+91-98765-43219', 'light', true);

-- Update branch admin_id now that profiles exist
UPDATE branches SET admin_id = '9a62887b-a16e-4524-8345-9a98e31c0cae' WHERE id = '083817c1-cee8-4c01-9e2f-c25d9267aee6';

-- ============================================
-- TEAMS
-- ============================================
INSERT INTO teams (id, branch_id, manager_id, name) VALUES
('3f534de6-0db0-45d7-854b-66c2f56c0821', '083817c1-cee8-4c01-9e2f-c25d9267aee6', 'ecd71cf9-f628-4ecb-aa6e-3d98fe4472e5', 'Alpha Sales Team'),
('825574c3-5629-494f-8d2d-e26fe43e9815', '083817c1-cee8-4c01-9e2f-c25d9267aee6', '35db8336-5b9e-408b-965e-6159ce3f9be5', 'Beta Sales Team');

-- ============================================
-- LEADS (20 leads)
-- ============================================
INSERT INTO leads (id, org_id, branch_id, assigned_to, full_name, phone, email, source, property_type, budget_min, budget_max, preferred_location, status, temperature, score, notes, next_followup_at, last_contacted_at) VALUES
(gen_random_uuid(), '61b13237-1130-4259-b64e-17fd95ee1c7c', '083817c1-cee8-4c01-9e2f-c25d9267aee6', '98a63592-1c5c-4dc6-b5d5-47954d32ccc8', 'Rajesh Kumar', '+91-98100-11111', 'rajesh.k@email.com', 'MagicBricks', 'Apartment', 5000000, 8000000, 'Gurgaon Sector 45', 'New', 'Hot', 85, 'Looking for 3BHK urgently', now() + interval '2 hours', NULL),
(gen_random_uuid(), '61b13237-1130-4259-b64e-17fd95ee1c7c', '083817c1-cee8-4c01-9e2f-c25d9267aee6', '98a63592-1c5c-4dc6-b5d5-47954d32ccc8', 'Sunita Devi', '+91-98100-22222', 'sunita.d@email.com', '36Acre', 'Villa', 12000000, 15000000, 'Gurgaon Sector 62', 'Contacted', 'Warm', 72, 'Wants gated community with pool', now() + interval '4 hours', now() - interval '1 day'),
(gen_random_uuid(), '61b13237-1130-4259-b64e-17fd95ee1c7c', '083817c1-cee8-4c01-9e2f-c25d9267aee6', '98a63592-1c5c-4dc6-b5d5-47954d32ccc8', 'Amitabh Shah', '+91-98100-33333', 'amitabh.s@email.com', 'Facebook', 'Apartment', 3000000, 5000000, 'Delhi NCR', 'Interested', 'Hot', 91, 'Ready to move in 1 month', now() + interval '1 day', now() - interval '2 hours'),
(gen_random_uuid(), '61b13237-1130-4259-b64e-17fd95ee1c7c', '083817c1-cee8-4c01-9e2f-c25d9267aee6', '71052889-2c3f-4b22-9b0f-e7fdd021e85a', 'Neha Kapoor', '+91-98100-44444', 'neha.k@email.com', 'Instagram', 'Apartment', 6000000, 9000000, 'Gurgaon Sector 56', 'New', 'Warm', 68, 'Family of 4, needs schools nearby', now() + interval '3 hours', NULL),
(gen_random_uuid(), '61b13237-1130-4259-b64e-17fd95ee1c7c', '083817c1-cee8-4c01-9e2f-c25d9267aee6', '71052889-2c3f-4b22-9b0f-e7fdd021e85a', 'Vijay Malhotra', '+91-98100-55555', 'vijay.m@email.com', 'Website', 'Plot', 2000000, 4000000, 'Faridabad', 'Contacted', 'Cold', 45, 'Investment purpose only', now() + interval '6 hours', now() - interval '3 days'),
(gen_random_uuid(), '61b13237-1130-4259-b64e-17fd95ee1c7c', '083817c1-cee8-4c01-9e2f-c25d9267aee6', '71052889-2c3f-4b22-9b0f-e7fdd021e85a', 'Pooja Reddy', '+91-98100-66666', 'pooja.r@email.com', 'Referral', 'Villa', 15000000, 20000000, 'Gurgaon Sector 65', 'Site Visit Scheduled', 'Hot', 94, 'Referred by existing client Mr. Sharma', now() + interval '1 day', now() - interval '1 day'),
(gen_random_uuid(), '61b13237-1130-4259-b64e-17fd95ee1c7c', '083817c1-cee8-4c01-9e2f-c25d9267aee6', '8130ed37-18e4-4cf0-93a0-1b08c36363c2', 'Rohan Mehta', '+91-98100-77777', 'rohan.m@email.com', 'WhatsApp', 'Commercial', 8000000, 12000000, 'Gurgaon MG Road', 'New', 'Warm', 60, 'Office space for startup', now() + interval '2 hours', NULL),
(gen_random_uuid(), '61b13237-1130-4259-b64e-17fd95ee1c7c', '083817c1-cee8-4c01-9e2f-c25d9267aee6', '8130ed37-18e4-4cf0-93a0-1b08c36363c2', 'Kavita Joshi', '+91-98100-88888', 'kavita.j@email.com', 'Housing', 'Apartment', 4500000, 7000000, 'Noida Sector 18', 'Contacted', 'Cold', 38, 'Budget flexible if good location', now() + interval '5 hours', now() - interval '2 days'),
(gen_random_uuid(), '61b13237-1130-4259-b64e-17fd95ee1c7c', '083817c1-cee8-4c01-9e2f-c25d9267aee6', '8130ed37-18e4-4cf0-93a0-1b08c36363c2', 'Deepak Tiwari', '+91-98100-99999', 'deepak.t@email.com', 'MagicBricks', 'Rental', 25000, 40000, 'Gurgaon Cyber Hub', 'Interested', 'Hot', 88, 'Corporate rental for 2 years', now() + interval '1 day', now() - interval '4 hours'),
(gen_random_uuid(), '61b13237-1130-4259-b64e-17fd95ee1c7c', '083817c1-cee8-4c01-9e2f-c25d9267aee6', 'bfcd5ce1-9ebf-419d-8eda-c249b183a37a', 'Sonal Agrawal', '+91-98101-00000', 'sonal.a@email.com', 'Manual', 'Apartment', 7000000, 10000000, 'Gurgaon Golf Course Road', 'New', 'Warm', 55, 'Looking for resale property', now() + interval '3 hours', NULL),
(gen_random_uuid(), '61b13237-1130-4259-b64e-17fd95ee1c7c', '083817c1-cee8-4c01-9e2f-c25d9267aee6', 'bfcd5ce1-9ebf-419d-8eda-c249b183a37a', 'Manish Khanna', '+91-98101-11111', 'manish.k@email.com', 'Facebook', 'Villa', 10000000, 14000000, 'Gurgaon Sohna Road', 'Contacted', 'Cold', 42, 'Not ready to buy for 6 months', now() + interval '1 week', now() - interval '5 days'),
(gen_random_uuid(), '61b13237-1130-4259-b64e-17fd95ee1c7c', '083817c1-cee8-4c01-9e2f-c25d9267aee6', 'bfcd5ce1-9ebf-419d-8eda-c249b183a37a', 'Anjali Menon', '+91-98101-22222', 'anjali.m@email.com', 'Website', 'Apartment', 5500000, 8500000, 'Gurgaon Sector 70', 'Negotiation', 'Hot', 96, 'Finalizing loan approval', now() + interval '12 hours', now() - interval '6 hours'),
(gen_random_uuid(), '61b13237-1130-4259-b64e-17fd95ee1c7c', '083817c1-cee8-4c01-9e2f-c25d9267aee6', '98a63592-1c5c-4dc6-b5d5-47954d32ccc8', 'Harish Bhatia', '+91-98101-33333', 'harish.b@email.com', '36Acre', 'Plot', 1500000, 3000000, 'Jaipur Highway', 'New', 'Cold', 30, 'Long term investment', now() + interval '1 day', NULL),
(gen_random_uuid(), '61b13237-1130-4259-b64e-17fd95ee1c7c', '083817c1-cee8-4c01-9e2f-c25d9267aee6', '71052889-2c3f-4b22-9b0f-e7fdd021e85a', 'Ritu Saxena', '+91-98101-44444', 'ritu.s@email.com', 'Instagram', 'Apartment', 4000000, 6000000, 'Delhi Dwarka', 'Contacted', 'Warm', 65, 'First time buyer, needs guidance', now() + interval '4 hours', now() - interval '1 day'),
(gen_random_uuid(), '61b13237-1130-4259-b64e-17fd95ee1c7c', '083817c1-cee8-4c01-9e2f-c25d9267aee6', '8130ed37-18e4-4cf0-93a0-1b08c36363c2', 'Prakash Yadav', '+91-98101-55555', 'prakash.y@email.com', 'Referral', 'Commercial', 5000000, 8000000, 'Gurgaon Udyog Vihar', 'Site Visit Scheduled', 'Hot', 90, 'Expanding existing business', now() + interval '1 day', now() - interval '2 hours'),
(gen_random_uuid(), '61b13237-1130-4259-b64e-17fd95ee1c7c', '083817c1-cee8-4c01-9e2f-c25d9267aee6', 'bfcd5ce1-9ebf-419d-8eda-c249b183a37a', 'Fatima Sheikh', '+91-98101-66666', 'fatima.s@email.com', 'WhatsApp', 'Villa', 18000000, 25000000, 'Gurgaon DLF Phase 2', 'New', 'Warm', 75, 'Luxury segment buyer', now() + interval '2 hours', NULL),
(gen_random_uuid(), '61b13237-1130-4259-b64e-17fd95ee1c7c', '083817c1-cee8-4c01-9e2f-c25d9267aee6', '98a63592-1c5c-4dc6-b5d5-47954d32ccc8', 'Gaurav Pillai', '+91-98101-77777', 'gaurav.p@email.com', 'Housing', 'Rental', 30000, 50000, 'Gurgaon Sector 15', 'Contacted', 'Cold', 40, 'Temporary assignment in Gurgaon', now() + interval '3 days', now() - interval '2 days'),
(gen_random_uuid(), '61b13237-1130-4259-b64e-17fd95ee1c7c', '083817c1-cee8-4c01-9e2f-c25d9267aee6', '71052889-2c3f-4b22-9b0f-e7fdd021e85a', 'Divya Narang', '+91-98101-88888', 'divya.n@email.com', 'MagicBricks', 'Apartment', 8000000, 12000000, 'Gurgaon Sector 80', 'Interested', 'Hot', 82, 'Ready with down payment', now() + interval '6 hours', now() - interval '8 hours'),
(gen_random_uuid(), '61b13237-1130-4259-b64e-17fd95ee1c7c', '083817c1-cee8-4c01-9e2f-c25d9267aee6', '8130ed37-18e4-4cf0-93a0-1b08c36363c2', 'Naveen Sharma', '+91-98101-99999', 'naveen.s@email.com', 'Manual', 'Apartment', 3500000, 5500000, 'Faridabad Sector 21', 'Not Responding', 'Cold', 20, 'Multiple attempts, no response', now() + interval '3 days', now() - interval '7 days'),
(gen_random_uuid(), '61b13237-1130-4259-b64e-17fd95ee1c7c', '083817c1-cee8-4c01-9e2f-c25d9267aee6', 'bfcd5ce1-9ebf-419d-8eda-c249b183a37a', 'Lakshmi Iyer', '+91-98102-00000', 'lakshmi.i@email.com', 'Website', 'Villa', 22000000, 30000000, 'Gurgaon Golf Course Ext', 'Won', 'Hot', 100, 'Deal closed last week', now() + interval '1 week', now() - interval '2 days');

-- ============================================
-- PROPERTIES (10 properties)
-- ============================================
INSERT INTO properties (id, org_id, branch_id, title, location, address, type, price, size, bedrooms, bathrooms, floor, furnishing, availability, description, amenities, images) VALUES
(gen_random_uuid(), '61b13237-1130-4259-b64e-17fd95ee1c7c', '083817c1-cee8-4c01-9e2f-c25d9267aee6', 'Sunset Villas Phase 2', 'Gurgaon Sector 62', 'Plot 45, Sunset Boulevard', 'Villa', 15000000, '3000 sqft', 4, 4, 2, 'Fully Furnished', 'Available', 'Luxury villa with private pool and garden', '{"Swimming Pool","Garden","Gated Community","Power Backup","Club House"}', '{"https://images.unsplash.com/photo-1600596542815-27bfef402e68?w=800","https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"}'),
(gen_random_uuid(), '61b13237-1130-4259-b64e-17fd95ee1c7c', '083817c1-cee8-4c01-9e2f-c25d9267aee6', 'Cyber Heights Apartments', 'Gurgaon Cyber City', 'Tower B, Cyber Heights', 'Apartment', 8500000, '1800 sqft', 3, 2, 15, 'Semi Furnished', 'Available', 'Modern apartment with city views near metro', '{"Gym","Parking","Security","Lift","Play Area"}', '{"https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800","https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"}'),
(gen_random_uuid(), '61b13237-1130-4259-b64e-17fd95ee1c7c', '083817c1-cee8-4c01-9e2f-c25d9267aee6', 'Green Valley Plots', 'Gurgaon Sohna Road', 'Sector 33, Green Valley', 'Plot', 2500000, '200 sqyd', NULL, NULL, NULL, NULL, 'Available', 'Investment plots with high appreciation potential', '{"Park","Wide Roads","Street Lights","Water Supply"}', '{"https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800"}'),
(gen_random_uuid(), '61b13237-1130-4259-b64e-17fd95ee1c7c', '083817c1-cee8-4c01-9e2f-c25d9267aee6', 'Metro Residency', 'Delhi Dwarka', 'Sector 12, Metro Residency', 'Apartment', 6500000, '1400 sqft', 3, 2, 8, 'Unfurnished', 'Available', 'Affordable family homes near metro station', '{"Parking","Security","Lift"}', '{"https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"}'),
(gen_random_uuid(), '61b13237-1130-4259-b64e-17fd95ee1c7c', '083817c1-cee8-4c01-9e2f-c25d9267aee6', 'Business Park Plaza', 'Gurgaon Udyog Vihar', 'Phase 4, Business Park', 'Commercial', 12000000, '2500 sqft', NULL, NULL, 3, 'Bare Shell', 'Available', 'Premium office space for IT companies', '{"24/7 Security","Power Backup","Parking","Cafeteria"}', '{"https://images.unsplash.com/photo-1497366216548-37526070297c?w=800","https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800"}'),
(gen_random_uuid(), '61b13237-1130-4259-b64e-17fd95ee1c7c', '083817c1-cee8-4c01-9e2f-c25d9267aee6', 'Royal Palm Villas', 'Gurgaon DLF Phase 2', 'DLF Phase 2, Royal Palm', 'Villa', 25000000, '4500 sqft', 5, 5, 3, 'Fully Furnished', 'Available', 'Ultra luxury villa with smart home features', '{"Private Pool","Home Theater","Smart Home","Servant Quarters","Triple Height Lobby"}', '{"https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800","https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800"}'),
(gen_random_uuid(), '61b13237-1130-4259-b64e-17fd95ee1c7c', '083817c1-cee8-4c01-9e2f-c25d9267aee6', 'Noida Express Homes', 'Noida Sector 18', 'Sector 18, Noida Express', 'Apartment', 5500000, '1200 sqft', 2, 2, 6, 'Semi Furnished', 'Hold', 'Compact apartments for young professionals', '{"Gym","Pool","Co-working Space"}', '{"https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"}'),
(gen_random_uuid(), '61b13237-1130-4259-b64e-17fd95ee1c7c', '083817c1-cee8-4c01-9e2f-c25d9267aee6', 'Faridabad Greens', 'Faridabad Sector 21', 'Sector 21, Faridabad Greens', 'Apartment', 4200000, '1100 sqft', 2, 2, 4, 'Unfurnished', 'Available', 'Budget friendly homes with green surroundings', '{"Park","Jogging Track","Community Hall"}', '{"https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800"}'),
(gen_random_uuid(), '61b13237-1130-4259-b64e-17fd95ee1c7c', '083817c1-cee8-4c01-9e2f-c25d9267aee6', 'Cyber Hub Studios', 'Gurgaon Cyber Hub', 'Cyber Hub, Tower A', 'Rental', 35000, '600 sqft', 1, 1, 5, 'Fully Furnished', 'Available', 'Premium studio apartments for corporate rentals', '{"Housekeeping","WiFi","Gym","Laundry"}', '{"https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800"}'),
(gen_random_uuid(), '61b13237-1130-4259-b64e-17fd95ee1c7c', '083817c1-cee8-4c01-9e2f-c25d9267aee6', 'Highway Commercial', 'Jaipur Highway', 'Km 25, Jaipur Highway', 'Commercial', 8000000, '3000 sqft', NULL, NULL, 1, 'Bare Shell', 'Sold', 'Highway facing commercial complex', '{"Ample Parking","High Visibility","Loading Dock"}', '{"https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800"}');

-- ============================================
-- ASSETS (5 assets)
-- ============================================
INSERT INTO assets (id, org_id, branch_id, name, location, type, price_min, price_max, status, description, brochure_url, images, whatsapp_template, is_active, created_by) VALUES
(gen_random_uuid(), '61b13237-1130-4259-b64e-17fd95ee1c7c', '083817c1-cee8-4c01-9e2f-c25d9267aee6', 'Sunset Villas Phase 2', 'Gurgaon Sector 62', 'Villa', 12000000, 18000000, 'Ready', 'Premium villa community with world-class amenities', 'https://storage.estateflow.demo/brochures/sunset-villas.pdf', '{"https://images.unsplash.com/photo-1600596542815-27bfef402e68?w=800","https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"}', 'Hi {clientName} 👋, I would like to share details about *Sunset Villas Phase 2* in Gurgaon Sector 62. 📌 Starting from: ₹1.2 Cr 📅 Status: Ready to Move. Please find the brochure attached. — {agentName}', true, '9a62887b-a16e-4524-8345-9a98e31c0cae'),
(gen_random_uuid(), '61b13237-1130-4259-b64e-17fd95ee1c7c', '083817c1-cee8-4c01-9e2f-c25d9267aee6', 'Cyber Heights', 'Gurgaon Cyber City', 'Apartment', 7500000, 9500000, 'Under Construction', 'Smart apartments for modern living near metro', 'https://storage.estateflow.demo/brochures/cyber-heights.pdf', '{"https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800"}', 'Hi {clientName} 👋, I would like to share details about *Cyber Heights* in Gurgaon Cyber City. 📌 Starting from: ₹75 L 📅 Status: Under Construction. Please find the brochure attached. — {agentName}', true, '9a62887b-a16e-4524-8345-9a98e31c0cae'),
(gen_random_uuid(), '61b13237-1130-4259-b64e-17fd95ee1c7c', '083817c1-cee8-4c01-9e2f-c25d9267aee6', 'Green Valley', 'Gurgaon Sohna Road', 'Plot', 1500000, 3500000, 'Launching', 'Investment plots with 3x appreciation potential', 'https://storage.estateflow.demo/brochures/green-valley.pdf', '{"https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800"}', 'Hi {clientName} 👋, I would like to share details about *Green Valley* in Sohna Road. 📌 Starting from: ₹15 L 📅 Status: Launching Soon. Please find the brochure attached. — {agentName}', true, '9a62887b-a16e-4524-8345-9a98e31c0cae'),
(gen_random_uuid(), '61b13237-1130-4259-b64e-17fd95ee1c7c', '083817c1-cee8-4c01-9e2f-c25d9267aee6', 'Royal Palm', 'Gurgaon DLF Phase 2', 'Villa', 20000000, 30000000, 'Ready', 'Ultra-luxury smart villas for discerning buyers', 'https://storage.estateflow.demo/brochures/royal-palm.pdf', '{"https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800","https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800"}', 'Hi {clientName} 👋, I would like to share details about *Royal Palm* in DLF Phase 2. 📌 Starting from: ₹2 Cr 📅 Status: Ready to Move. Please find the brochure attached. — {agentName}', true, '9a62887b-a16e-4524-8345-9a98e31c0cae'),
(gen_random_uuid(), '61b13237-1130-4259-b64e-17fd95ee1c7c', '083817c1-cee8-4c01-9e2f-c25d9267aee6', 'Business Park', 'Gurgaon Udyog Vihar', 'Commercial', 8000000, 15000000, 'Under Construction', 'Grade A office spaces for growing businesses', 'https://storage.estateflow.demo/brochures/business-park.pdf', '{"https://images.unsplash.com/photo-1497366216548-37526070297c?w=800"}', 'Hi {clientName} 👋, I would like to share details about *Business Park* in Udyog Vihar. 📌 Starting from: ₹80 L 📅 Status: Under Construction. Please find the brochure attached. — {agentName}', true, '9a62887b-a16e-4524-8345-9a98e31c0cae');

-- ============================================
-- DEALS (sample deals linked to leads)
-- ============================================
-- We'll create deals for leads that have progressed
INSERT INTO deals (id, lead_id, property_id, agent_id, stage, value, probability, expected_close, notes)
SELECT 
  gen_random_uuid(),
  l.id,
  (SELECT id FROM properties ORDER BY random() LIMIT 1),
  l.assigned_to,
  CASE l.status 
    WHEN 'Interested' THEN 'Interested'
    WHEN 'Site Visit Scheduled' THEN 'Viewing Scheduled'
    WHEN 'Negotiation' THEN 'Closing'
    WHEN 'Won' THEN 'Won'
    ELSE 'New'
  END,
  l.budget_max,
  CASE l.status
    WHEN 'New' THEN 10
    WHEN 'Contacted' THEN 25
    WHEN 'Interested' THEN 50
    WHEN 'Site Visit Scheduled' THEN 70
    WHEN 'Negotiation' THEN 85
    WHEN 'Won' THEN 100
    ELSE 5
  END,
  now() + interval '30 days',
  'Auto-created from lead status'
FROM leads l
WHERE l.status IN ('Interested','Site Visit Scheduled','Negotiation','Won');

-- ============================================
-- CALLS (sample call logs)
-- ============================================
INSERT INTO calls (id, lead_id, agent_id, status, duration, outcome, notes, started_at, ended_at)
SELECT 
  gen_random_uuid(),
  l.id,
  l.assigned_to,
  'completed',
  (floor(random() * 300) + 30)::integer,
  CASE WHEN random() > 0.3 THEN 'Answered' ELSE 'Callback Requested' END,
  'Sample call log from seed data',
  now() - (random() * interval '7 days'),
  now() - (random() * interval '7 days') + (random() * interval '5 minutes')
FROM leads l
WHERE l.last_contacted_at IS NOT NULL
LIMIT 15;

-- ============================================
-- MESSAGES (sample WhatsApp messages)
-- ============================================
INSERT INTO messages (id, lead_id, sender_id, channel, body, status, sent_at)
SELECT 
  gen_random_uuid(),
  l.id,
  l.assigned_to,
  'whatsapp',
  'Project brochure shared via WhatsApp',
  'delivered',
  now() - (random() * interval '5 days')
FROM leads l
WHERE l.status IN ('Contacted','Interested','Site Visit Scheduled')
LIMIT 10;

-- ============================================
-- TASKS (sample tasks)
-- ============================================
INSERT INTO tasks (id, org_id, assigned_to, created_by, lead_id, title, description, due_date, priority, status) VALUES
(gen_random_uuid(), '61b13237-1130-4259-b64e-17fd95ee1c7c', '98a63592-1c5c-4dc6-b5d5-47954d32ccc8', 'ecd71cf9-f628-4ecb-aa6e-3d98fe4472e5', NULL, 'Follow up with hot leads', 'Call all leads with temperature Hot by EOD', now() + interval '4 hours', 'High', 'Pending'),
(gen_random_uuid(), '61b13237-1130-4259-b64e-17fd95ee1c7c', '71052889-2c3f-4b22-9b0f-e7fdd021e85a', 'ecd71cf9-f628-4ecb-aa6e-3d98fe4472e5', NULL, 'Update lead notes', 'Add detailed notes for all contacted leads today', now() + interval '2 hours', 'Medium', 'In Progress'),
(gen_random_uuid(), '61b13237-1130-4259-b64e-17fd95ee1c7c', '8130ed37-18e4-4cf0-93a0-1b08c36363c2', '35db8336-5b9e-408b-965e-6159ce3f9be5', NULL, 'Site visit confirmation', 'Confirm tomorrow site visits with clients', now() + interval '6 hours', 'Urgent', 'Pending'),
(gen_random_uuid(), '61b13237-1130-4259-b64e-17fd95ee1c7c', 'bfcd5ce1-9ebf-419d-8eda-c249b183a37a', '35db8336-5b9e-408b-965e-6159ce3f9be5', NULL, 'Pipeline update', 'Move qualified leads to Interested stage', now() + interval '1 day', 'Medium', 'Pending'),
(gen_random_uuid(), '61b13237-1130-4259-b64e-17fd95ee1c7c', '98a63592-1c5c-4dc6-b5d5-47954d32ccc8', 'ecd71cf9-f628-4ecb-aa6e-3d98fe4472e5', NULL, 'MagicBricks lead callback', 'Return missed calls from MagicBricks source', now() + interval '1 hour', 'High', 'Pending');

-- ============================================
-- ACTIVITIES (sample timeline events)
-- ============================================
INSERT INTO activities (id, lead_id, type, description, created_by, created_at)
SELECT 
  gen_random_uuid(),
  l.id,
  'note',
  'Lead imported from ' || l.source || ' portal',
  l.assigned_to,
  l.created_at
FROM leads l;

-- ============================================
-- FOLLOW_UPS (sample scheduled follow-ups)
-- ============================================
INSERT INTO follow_ups (id, lead_id, assigned_to, channel, scheduled_at, status)
SELECT 
  gen_random_uuid(),
  l.id,
  l.assigned_to,
  'call',
  l.next_followup_at,
  'Pending'
FROM leads l
WHERE l.next_followup_at IS NOT NULL;

-- ============================================
-- ATTENDANCE (sample check-ins for field exec + callers)
-- ============================================
INSERT INTO attendance (id, user_id, org_id, check_in_time, check_out_time, check_in_lat, check_in_lng, status, notes) VALUES
(gen_random_uuid(), 'eef620c3-ab27-4bc4-96c3-558c04423ddf', '61b13237-1130-4259-b64e-17fd95ee1c7c', now() - interval '8 hours', now() - interval '1 hour', 28.4595, 77.0266, 'Present', 'Site visit to Sunset Villas'),
(gen_random_uuid(), 'eef620c3-ab27-4bc4-96c3-558c04423ddf', '61b13237-1130-4259-b64e-17fd95ee1c7c', now() - interval '1 day 8 hours', now() - interval '1 day 1 hour', 28.4089, 77.3178, 'Present', 'Property inspection at Cyber Heights'),
(gen_random_uuid(), '98a63592-1c5c-4dc6-b5d5-47954d32ccc8', '61b13237-1130-4259-b64e-17fd95ee1c7c', now() - interval '8 hours', now() - interval '30 minutes', NULL, NULL, 'Present', 'Office attendance'),
(gen_random_uuid(), '71052889-2c3f-4b22-9b0f-e7fdd021e85a', '61b13237-1130-4259-b64e-17fd95ee1c7c', now() - interval '8 hours', now() - interval '45 minutes', NULL, NULL, 'Present', 'Office attendance'),
(gen_random_uuid(), '8130ed37-18e4-4cf0-93a0-1b08c36363c2', '61b13237-1130-4259-b64e-17fd95ee1c7c', now() - interval '8 hours', now() - interval '20 minutes', NULL, NULL, 'Present', 'Office attendance'),
(gen_random_uuid(), 'bfcd5ce1-9ebf-419d-8eda-c249b183a37a', '61b13237-1130-4259-b64e-17fd95ee1c7c', now() - interval '8 hours', now() - interval '1 hour', NULL, NULL, 'Present', 'Office attendance');

-- ============================================
-- SOCIAL_POSTS (sample content calendar)
-- ============================================
INSERT INTO social_posts (id, org_id, created_by, assigned_to, platform, caption, status, scheduled_at, notes) VALUES
(gen_random_uuid(), '61b13237-1130-4259-b64e-17fd95ee1c7c', 'd90afb35-bed3-438c-9404-d6bf57b512ce', 'd90afb35-bed3-438c-9404-d6bf57b512ce', 'Instagram Post', 'Discover luxury living at Sunset Villas 🌅✨ Premium 4BHK villas starting at ₹1.2 Cr. DM us for a site visit today! #RealEstate #Gurgaon #LuxuryLiving', 'Scheduled', now() + interval '2 days', 'High engagement expected'),
(gen_random_uuid(), '61b13237-1130-4259-b64e-17fd95ee1c7c', 'd90afb35-bed3-438c-9404-d6bf57b512ce', 'd90afb35-bed3-438c-9404-d6bf57b512ce', 'Facebook Post', 'Investment alert! Green Valley plots on Sohna Road. 3x appreciation potential. Starting at just ₹15 Lakhs. Call now!', 'Draft', now() + interval '3 days', 'Target investors'),
(gen_random_uuid(), '61b13237-1130-4259-b64e-17fd95ee1c7c', 'd90afb35-bed3-438c-9404-d6bf57b512ce', 'd90afb35-bed3-438c-9404-d6bf57b512ce', 'Instagram Reel', 'Walkthrough of Cyber Heights smart apartments. Metro connectivity + modern amenities = perfect home! 🏠🚇', 'Idea', now() + interval '5 days', 'Need videographer'),
(gen_random_uuid(), '61b13237-1130-4259-b64e-17fd95ee1c7c', 'd90afb35-bed3-438c-9404-d6bf57b512ce', 'd90afb35-bed3-438c-9404-d6bf57b512ce', 'LinkedIn Post', 'Grade A office spaces now available at Business Park, Udyog Vihar. Ideal for IT/ITES companies. Enquire within.', 'Scheduled', now() + interval '1 day', 'B2B targeting'),
(gen_random_uuid(), '61b13237-1130-4259-b64e-17fd95ee1c7c', 'd90afb35-bed3-438c-9404-d6bf57b512ce', 'd90afb35-bed3-438c-9404-d6bf57b512ce', 'Story', 'Flash giveaway! Follow us and tag 3 friends to win a free property consultation. 🎁🏡', 'Draft', now() + interval '1 day', 'Engagement booster');

-- ============================================
-- NOTIFICATIONS (sample alerts)
-- ============================================
INSERT INTO notifications (id, user_id, type, title, message, read, link, created_at) VALUES
(gen_random_uuid(), '98a63592-1c5c-4dc6-b5d5-47954d32ccc8', 'lead_assigned', 'New Lead Assigned', 'Rajesh Kumar from MagicBricks has been assigned to you', false, '/caller/lead/', now() - interval '2 hours'),
(gen_random_uuid(), '98a63592-1c5c-4dc6-b5d5-47954d32ccc8', 'followup_due', 'Follow-up Due', 'Amitabh Shah follow-up scheduled in 1 hour', false, '/caller/follow-ups', now() - interval '30 minutes'),
(gen_random_uuid(), 'ecd71cf9-f628-4ecb-aa6e-3d98fe4472e5', 'call_missed', 'Missed Call Alert', 'Arjun Nair missed a call with Deepak Tiwari', false, '/manager/my-team', now() - interval '1 hour'),
(gen_random_uuid(), '9a62887b-a16e-4524-8345-9a98e31c0cae', 'attendance_issue', 'Attendance Alert', 'Karan Singh has not checked in today', false, '/admin/attendance', now() - interval '15 minutes'),
(gen_random_uuid(), 'd90afb35-bed3-438c-9404-d6bf57b512ce', 'post_due', 'Post Due Tomorrow', 'LinkedIn post for Business Park is scheduled', false, '/social/calendar', now() - interval '10 minutes');

-- ============================================
-- INTEGRATION SETTINGS
-- ============================================
INSERT INTO integration_settings (id, org_id, twilio_sid, twilio_phone, whatsapp_number, lead_assignment_mode, webhook_secret) VALUES
(gen_random_uuid(), '61b13237-1130-4259-b64e-17fd95ee1c7c', 'AC_demo_twilio_sid_12345', '+91-98765-00000', '+91-98765-00001', 'round_robin', 'whsec_demo_webhook_secret_12345');

-- ============================================
-- DONE
-- ============================================
