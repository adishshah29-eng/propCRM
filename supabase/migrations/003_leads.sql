-- Migration: 003_leads
-- Lead management table with constraints per PRD

CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  branch_id uuid REFERENCES branches(id) ON DELETE SET NULL,
  assigned_to uuid REFERENCES profiles(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  phone text NOT NULL,
  email text,
  source text CHECK (source IN ('36Acre','MagicBricks','Housing','Facebook','Instagram','Website','WhatsApp','Referral','Manual','Other')),
  property_type text CHECK (property_type IN ('Apartment','Villa','Plot','Commercial','Rental')),
  budget_min numeric,
  budget_max numeric,
  preferred_location text,
  status text DEFAULT 'New' CHECK (status IN ('New','Contacted','Interested','Site Visit Scheduled','Negotiation','Won','Lost','Not Responding')),
  temperature text DEFAULT 'Cold' CHECK (temperature IN ('Cold','Warm','Hot')),
  score integer DEFAULT 0,
  notes text,
  next_followup_at timestamptz,
  last_contacted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Indexes for performance
CREATE INDEX idx_leads_org_id ON leads(org_id);
CREATE INDEX idx_leads_branch_id ON leads(branch_id);
CREATE INDEX idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_created_at ON leads(created_at);
