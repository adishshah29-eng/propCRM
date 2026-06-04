-- Migration: 013_rls_policies_and_integration_settings
-- Row Level Security policies + integration config table

-- Integration Settings (per org)
CREATE TABLE IF NOT EXISTS integration_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  twilio_sid text,
  twilio_token text,
  twilio_phone text,
  whatsapp_number text,
  resend_key text,
  openai_key text,
  lead_assignment_mode text DEFAULT 'round_robin' CHECK (lead_assignment_mode IN ('round_robin','manual','least_busy')),
  webhook_secret text,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE integration_settings ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_integration_settings_org_id ON integration_settings(org_id);

-- ============================================
-- RLS POLICIES
-- ============================================

-- Helper function: get current user's org_id
CREATE OR REPLACE FUNCTION get_my_org_id()
RETURNS uuid AS $$
  SELECT org_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper function: get current user's branch_id
CREATE OR REPLACE FUNCTION get_my_branch_id()
RETURNS uuid AS $$
  SELECT branch_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper function: get current user's role
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS text AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ============================================
-- ORGANIZATIONS
-- ============================================
CREATE POLICY org_select_super_admin ON organizations
  FOR SELECT USING (get_my_role() = 'super_admin');

CREATE POLICY org_select_member ON organizations
  FOR SELECT USING (id = get_my_org_id());

-- ============================================
-- PROFILES
-- ============================================
CREATE POLICY profiles_select_all ON profiles
  FOR SELECT USING (
    get_my_role() = 'super_admin'
    OR org_id = get_my_org_id()
  );

CREATE POLICY profiles_update_self ON profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY profiles_update_admin ON profiles
  FOR UPDATE USING (
    get_my_role() IN ('super_admin','admin')
    AND org_id = get_my_org_id()
  );

CREATE POLICY profiles_insert_super_admin ON profiles
  FOR INSERT WITH CHECK (
    get_my_role() = 'super_admin'
    OR (get_my_role() = 'admin' AND org_id = get_my_org_id())
  );

-- ============================================
-- BRANCHES
-- ============================================
CREATE POLICY branches_select ON branches
  FOR SELECT USING (org_id = get_my_org_id());

CREATE POLICY branches_modify_admin ON branches
  FOR ALL USING (
    get_my_role() IN ('super_admin','admin')
    AND org_id = get_my_org_id()
  );

-- ============================================
-- TEAMS
-- ============================================
CREATE POLICY teams_select ON teams
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM branches WHERE branches.id = teams.branch_id
      AND branches.org_id = get_my_org_id()
    )
  );

CREATE POLICY teams_modify_manager ON teams
  FOR ALL USING (
    get_my_role() IN ('super_admin','admin','manager')
    AND EXISTS (
      SELECT 1 FROM branches WHERE branches.id = teams.branch_id
      AND branches.org_id = get_my_org_id()
    )
  );

-- ============================================
-- LEADS
-- ============================================
CREATE POLICY leads_select ON leads
  FOR SELECT USING (
    org_id = get_my_org_id()
    AND (
      get_my_role() IN ('super_admin','admin','manager')
      OR assigned_to = auth.uid()
    )
  );

CREATE POLICY leads_insert ON leads
  FOR INSERT WITH CHECK (org_id = get_my_org_id());

CREATE POLICY leads_update ON leads
  FOR UPDATE USING (
    org_id = get_my_org_id()
    AND (
      get_my_role() IN ('super_admin','admin','manager')
      OR assigned_to = auth.uid()
    )
  );

CREATE POLICY leads_delete ON leads
  FOR DELETE USING (
    org_id = get_my_org_id()
    AND get_my_role() IN ('super_admin','admin')
  );

-- ============================================
-- PROPERTIES
-- ============================================
CREATE POLICY properties_select ON properties
  FOR SELECT USING (org_id = get_my_org_id());

CREATE POLICY properties_modify_admin ON properties
  FOR ALL USING (
    org_id = get_my_org_id()
    AND get_my_role() IN ('super_admin','admin')
  );

-- ============================================
-- ASSETS
-- ============================================
CREATE POLICY assets_select ON assets
  FOR SELECT USING (org_id = get_my_org_id());

CREATE POLICY assets_modify_admin ON assets
  FOR ALL USING (
    org_id = get_my_org_id()
    AND get_my_role() IN ('super_admin','admin')
  );

-- ============================================
-- DEALS
-- ============================================
CREATE POLICY deals_select ON deals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM leads WHERE leads.id = deals.lead_id
      AND leads.org_id = get_my_org_id()
    )
  );

CREATE POLICY deals_modify ON deals
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM leads WHERE leads.id = deals.lead_id
      AND leads.org_id = get_my_org_id()
      AND (
        get_my_role() IN ('super_admin','admin','manager')
        OR leads.assigned_to = auth.uid()
        OR deals.agent_id = auth.uid()
      )
    )
  );

-- ============================================
-- CALLS
-- ============================================
CREATE POLICY calls_select ON calls
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM leads WHERE leads.id = calls.lead_id
      AND leads.org_id = get_my_org_id()
      AND (
        get_my_role() IN ('super_admin','admin','manager')
        OR calls.agent_id = auth.uid()
        OR leads.assigned_to = auth.uid()
      )
    )
  );

CREATE POLICY calls_insert ON calls
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM leads WHERE leads.id = calls.lead_id
      AND leads.org_id = get_my_org_id()
    )
  );

CREATE POLICY calls_update ON calls
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM leads WHERE leads.id = calls.lead_id
      AND leads.org_id = get_my_org_id()
      AND (calls.agent_id = auth.uid() OR get_my_role() IN ('super_admin','admin','manager'))
    )
  );

-- ============================================
-- MESSAGES
-- ============================================
CREATE POLICY messages_select ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM leads WHERE leads.id = messages.lead_id
      AND leads.org_id = get_my_org_id()
      AND (
        get_my_role() IN ('super_admin','admin','manager')
        OR messages.sender_id = auth.uid()
        OR leads.assigned_to = auth.uid()
      )
    )
  );

CREATE POLICY messages_insert ON messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM leads WHERE leads.id = messages.lead_id
      AND leads.org_id = get_my_org_id()
    )
  );

-- ============================================
-- TASKS
-- ============================================
CREATE POLICY tasks_select ON tasks
  FOR SELECT USING (
    org_id = get_my_org_id()
    AND (
      get_my_role() IN ('super_admin','admin','manager')
      OR assigned_to = auth.uid()
      OR created_by = auth.uid()
    )
  );

CREATE POLICY tasks_insert ON tasks
  FOR INSERT WITH CHECK (org_id = get_my_org_id());

CREATE POLICY tasks_update ON tasks
  FOR UPDATE USING (
    org_id = get_my_org_id()
    AND (
      get_my_role() IN ('super_admin','admin','manager')
      OR assigned_to = auth.uid()
      OR created_by = auth.uid()
    )
  );

CREATE POLICY tasks_delete ON tasks
  FOR DELETE USING (
    org_id = get_my_org_id()
    AND (
      get_my_role() IN ('super_admin','admin','manager')
      OR created_by = auth.uid()
    )
  );

-- ============================================
-- ACTIVITIES
-- ============================================
CREATE POLICY activities_select ON activities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM leads WHERE leads.id = activities.lead_id
      AND leads.org_id = get_my_org_id()
      AND (
        get_my_role() IN ('super_admin','admin','manager')
        OR leads.assigned_to = auth.uid()
      )
    )
  );

CREATE POLICY activities_insert ON activities
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM leads WHERE leads.id = activities.lead_id
      AND leads.org_id = get_my_org_id()
    )
  );

-- ============================================
-- FOLLOW_UPS
-- ============================================
CREATE POLICY follow_ups_select ON follow_ups
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM leads WHERE leads.id = follow_ups.lead_id
      AND leads.org_id = get_my_org_id()
      AND (
        get_my_role() IN ('super_admin','admin','manager')
        OR follow_ups.assigned_to = auth.uid()
        OR leads.assigned_to = auth.uid()
      )
    )
  );

CREATE POLICY follow_ups_insert ON follow_ups
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM leads WHERE leads.id = follow_ups.lead_id
      AND leads.org_id = get_my_org_id()
    )
  );

CREATE POLICY follow_ups_update ON follow_ups
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM leads WHERE leads.id = follow_ups.lead_id
      AND leads.org_id = get_my_org_id()
      AND (
        get_my_role() IN ('super_admin','admin','manager')
        OR follow_ups.assigned_to = auth.uid()
      )
    )
  );

-- ============================================
-- ATTENDANCE
-- ============================================
CREATE POLICY attendance_select ON attendance
  FOR SELECT USING (
    org_id = get_my_org_id()
    AND (
      get_my_role() IN ('super_admin','admin','manager')
      OR user_id = auth.uid()
    )
  );

CREATE POLICY attendance_insert ON attendance
  FOR INSERT WITH CHECK (
    org_id = get_my_org_id()
    AND user_id = auth.uid()
  );

CREATE POLICY attendance_update ON attendance
  FOR UPDATE USING (
    org_id = get_my_org_id()
    AND user_id = auth.uid()
  );

-- ============================================
-- SOCIAL_POSTS
-- ============================================
CREATE POLICY social_posts_select ON social_posts
  FOR SELECT USING (org_id = get_my_org_id());

CREATE POLICY social_posts_modify ON social_posts
  FOR ALL USING (
    org_id = get_my_org_id()
    AND (
      get_my_role() IN ('super_admin','admin','social_manager')
      OR created_by = auth.uid()
    )
  );

-- ============================================
-- NOTIFICATIONS
-- ============================================
CREATE POLICY notifications_select ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY notifications_insert ON notifications
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY notifications_update ON notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY notifications_delete ON notifications
  FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- INTEGRATION_SETTINGS
-- ============================================
CREATE POLICY integration_settings_select ON integration_settings
  FOR SELECT USING (org_id = get_my_org_id());

CREATE POLICY integration_settings_modify ON integration_settings
  FOR ALL USING (
    org_id = get_my_org_id()
    AND get_my_role() IN ('super_admin','admin')
  );
