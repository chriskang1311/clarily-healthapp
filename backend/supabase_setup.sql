-- Run this entire file in the Supabase SQL Editor (one-time setup)
-- Project: Clarily HealthApp

CREATE TABLE IF NOT EXISTS journeys (
  id              BIGSERIAL PRIMARY KEY,
  primary_symptom TEXT,
  symptom_summary TEXT,
  diagnoses       JSONB DEFAULT '[]',
  progress_steps  JSONB DEFAULT '[]',
  completed_steps JSONB DEFAULT '[]',
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS appointments (
  id          BIGSERIAL PRIMARY KEY,
  doctor_name TEXT,
  date        TEXT,
  time        TEXT,
  reason      TEXT,
  journey_id  BIGINT,
  status      TEXT DEFAULT 'upcoming',
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
  id         BIGSERIAL PRIMARY KEY,
  message    TEXT,
  type       TEXT DEFAULT 'general',
  read       BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS insurance (
  id           BIGSERIAL PRIMARY KEY,
  provider     TEXT,
  plan_name    TEXT,
  member_id    TEXT,
  group_number TEXT,
  plan_type    TEXT DEFAULT 'Primary',
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS support_messages (
  id         BIGSERIAL PRIMARY KEY,
  name       TEXT,
  email      TEXT,
  message    TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Auth Migration (run once after initial setup) ────────────────────────────
-- Add user_id to user-owned tables

ALTER TABLE journeys       ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE appointments   ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE notifications  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE insurance      ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_journeys_user_id      ON journeys(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_user_id  ON appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_insurance_user_id     ON insurance(user_id);

ALTER TABLE journeys      ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments  ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance     ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_journeys"      ON journeys      FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users_own_appointments"  ON appointments  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users_own_notifications" ON notifications FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users_own_insurance"     ON insurance     FOR ALL USING (auth.uid() = user_id);
-- ─────────────────────────────────────────────────────────────────────────────
