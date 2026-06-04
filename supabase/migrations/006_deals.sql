-- Migration: 006_deals
-- Deal pipeline / Kanban board

CREATE TABLE IF NOT EXISTS deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE,
  property_id uuid REFERENCES properties(id) ON DELETE SET NULL,
  agent_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  stage text DEFAULT 'New' CHECK (stage IN ('New','Contacted','Interested','Viewing Scheduled','Offer Made','Closing','Won','Lost')),
  value numeric,
  probability integer,
  expected_close date,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER update_deals_updated_at
  BEFORE UPDATE ON deals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_deals_lead_id ON deals(lead_id);
CREATE INDEX idx_deals_agent_id ON deals(agent_id);
