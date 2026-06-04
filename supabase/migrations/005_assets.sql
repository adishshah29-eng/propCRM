-- Migration: 005_assets
-- Project catalogue / assets to share via WhatsApp

CREATE TABLE IF NOT EXISTS assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  branch_id uuid REFERENCES branches(id) ON DELETE SET NULL,
  name text NOT NULL,
  location text,
  type text,
  price_min numeric,
  price_max numeric,
  status text DEFAULT 'Launching' CHECK (status IN ('Launching','Under Construction','Ready','Sold Out')),
  description text,
  brochure_url text,
  floor_plan_url text,
  images text[],
  whatsapp_template text,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER update_assets_updated_at
  BEFORE UPDATE ON assets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_assets_org_id ON assets(org_id);
CREATE INDEX idx_assets_branch_id ON assets(branch_id);
