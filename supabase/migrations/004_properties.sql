-- Migration: 004_properties
-- Property listings for branch inventory

CREATE TABLE IF NOT EXISTS properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  branch_id uuid REFERENCES branches(id) ON DELETE SET NULL,
  title text NOT NULL,
  location text,
  address text,
  type text,
  price numeric,
  size text,
  bedrooms integer,
  bathrooms integer,
  floor integer,
  furnishing text,
  availability text DEFAULT 'Available' CHECK (availability IN ('Available','Hold','Sold','Rented')),
  description text,
  amenities text[],
  images text[],
  documents text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_properties_org_id ON properties(org_id);
CREATE INDEX idx_properties_branch_id ON properties(branch_id);
