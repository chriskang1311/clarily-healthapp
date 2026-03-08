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
