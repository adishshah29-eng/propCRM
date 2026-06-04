-- Migration: 008_messages
-- WhatsApp, SMS, Email messages

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  channel text CHECK (channel IN ('whatsapp','sms','email')),
  body text,
  asset_id uuid REFERENCES assets(id) ON DELETE SET NULL,
  status text DEFAULT 'sent' CHECK (status IN ('sent','delivered','failed')),
  sent_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_messages_lead_id ON messages(lead_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
