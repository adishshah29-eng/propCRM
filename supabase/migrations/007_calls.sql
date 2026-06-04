-- Migration: 007_calls
-- Call logs with Twilio integration

CREATE TABLE IF NOT EXISTS calls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE,
  agent_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  call_sid text,
  conference_sid text,
  status text CHECK (status IN ('initiated','ringing','in-progress','completed','failed','no-answer','busy')),
  duration integer,
  recording_url text,
  outcome text CHECK (outcome IN ('Answered','No Answer','Busy','Callback Requested','Not Interested','Interested')),
  notes text,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE calls ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_calls_lead_id ON calls(lead_id);
CREATE INDEX idx_calls_agent_id ON calls(agent_id);
CREATE INDEX idx_calls_created_at ON calls(created_at);
