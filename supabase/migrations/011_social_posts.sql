-- Migration: 011_social_posts
-- Social media content calendar

CREATE TABLE IF NOT EXISTS social_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  assigned_to uuid REFERENCES profiles(id) ON DELETE SET NULL,
  platform text CHECK (platform IN ('Instagram Reel','Instagram Post','Facebook Post','LinkedIn Post','Story')),
  caption text,
  media_urls text[],
  status text DEFAULT 'Idea' CHECK (status IN ('Idea','Draft','Scheduled','Published')),
  scheduled_at timestamptz,
  notes text,
  zapier_webhook_sent boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER update_social_posts_updated_at
  BEFORE UPDATE ON social_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_social_posts_org_id ON social_posts(org_id);
CREATE INDEX idx_social_posts_status ON social_posts(status);
CREATE INDEX idx_social_posts_scheduled_at ON social_posts(scheduled_at);
