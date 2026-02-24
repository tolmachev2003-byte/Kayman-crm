-- ============================================================
-- Kayman CRM — Database Schema + RLS
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1) TRAINERS
CREATE TABLE trainers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  phone       TEXT,
  archived_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- 2) PROFILES (linked to Supabase Auth)
CREATE TABLE profiles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role        TEXT NOT NULL DEFAULT 'trainer' CHECK (role IN ('admin', 'trainer')),
  trainer_id  UUID REFERENCES trainers(id),
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- 3) CLIENTS
CREATE TABLE clients (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_full_name     TEXT NOT NULL,
  parent_name         TEXT,
  parent_phone        TEXT,
  birth_date          DATE,
  subscription_type   TEXT CHECK (subscription_type IN ('1', '4', '8')),
  comment             TEXT,
  status              TEXT DEFAULT 'записался' CHECK (status IN ('записался', 'ходит', 'ходил')),
  assigned_trainer_id UUID REFERENCES trainers(id),
  archived_at         TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

-- 4) BOOKINGS
CREATE TABLE bookings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id  UUID NOT NULL REFERENCES trainers(id),
  client_id   UUID REFERENCES clients(id),
  date        DATE NOT NULL,
  time_slot   TIME NOT NULL,
  client_type TEXT DEFAULT 'новый' CHECK (client_type IN ('новый', 'постоянный', 'пробный', 'абонемент')),
  archived_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(trainer_id, date, time_slot)
);

-- 5) TEMPLATES (trainer work intervals)
CREATE TABLE templates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id  UUID NOT NULL REFERENCES trainers(id),
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Mon
  start_time  TIME NOT NULL,
  end_time    TIME NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- 6) TEMPLATE_ASSIGNMENTS (pinned clients in template slots)
CREATE TABLE template_assignments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id  UUID NOT NULL REFERENCES trainers(id),
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  time_slot   TIME NOT NULL,
  client_id   UUID NOT NULL REFERENCES clients(id),
  client_type TEXT DEFAULT 'постоянный' CHECK (client_type IN ('новый', 'постоянный', 'пробный', 'абонемент')),
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(trainer_id, day_of_week, time_slot)
);

-- 7) TASKS
CREATE TABLE tasks (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id),
  client_id  UUID REFERENCES clients(id),
  due_date   DATE NOT NULL,
  text       TEXT NOT NULL,
  status     TEXT DEFAULT 'open' CHECK (status IN ('open', 'done')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_bookings_date ON bookings(date);
CREATE INDEX idx_bookings_trainer ON bookings(trainer_id);
CREATE INDEX idx_clients_trainer ON clients(assigned_trainer_id);
CREATE INDEX idx_tasks_user ON tasks(user_id);
CREATE INDEX idx_tasks_due ON tasks(due_date);
CREATE INDEX idx_templates_trainer ON templates(trainer_id);
CREATE INDEX idx_profiles_user ON profiles(user_id);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_trainers_updated BEFORE UPDATE ON trainers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_clients_updated  BEFORE UPDATE ON clients  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_bookings_updated BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_templates_updated BEFORE UPDATE ON templates FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_template_assignments_updated BEFORE UPDATE ON template_assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_tasks_updated    BEFORE UPDATE ON tasks    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- HELPER FUNCTION: get current user's role
-- ============================================================
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION get_my_trainer_id()
RETURNS UUID AS $$
  SELECT trainer_id FROM profiles WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- TRAINERS: everyone can read active, admin can write
ALTER TABLE trainers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trainers_select" ON trainers FOR SELECT USING (true);
CREATE POLICY "trainers_insert" ON trainers FOR INSERT WITH CHECK (get_my_role() = 'admin');
CREATE POLICY "trainers_update" ON trainers FOR UPDATE USING (get_my_role() = 'admin');
CREATE POLICY "trainers_delete" ON trainers FOR DELETE USING (get_my_role() = 'admin');

-- PROFILES: user sees own, admin sees all
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (
  get_my_role() = 'admin' OR user_id = auth.uid()
);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (get_my_role() = 'admin');
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (get_my_role() = 'admin');

-- CLIENTS: admin all, trainer sees assigned or booked
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clients_select" ON clients FOR SELECT USING (
  get_my_role() = 'admin'
  OR assigned_trainer_id = get_my_trainer_id()
  OR id IN (
    SELECT client_id FROM bookings
    WHERE trainer_id = get_my_trainer_id() AND archived_at IS NULL
  )
);
CREATE POLICY "clients_insert" ON clients FOR INSERT WITH CHECK (true);
CREATE POLICY "clients_update" ON clients FOR UPDATE USING (
  get_my_role() = 'admin' OR assigned_trainer_id = get_my_trainer_id()
);

-- BOOKINGS: admin all, trainer sees own
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bookings_select" ON bookings FOR SELECT USING (
  get_my_role() = 'admin' OR trainer_id = get_my_trainer_id()
);
CREATE POLICY "bookings_insert" ON bookings FOR INSERT WITH CHECK (
  get_my_role() = 'admin' OR trainer_id = get_my_trainer_id()
);
CREATE POLICY "bookings_update" ON bookings FOR UPDATE USING (
  get_my_role() = 'admin' OR trainer_id = get_my_trainer_id()
);

-- TEMPLATES: admin all, trainer sees own
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "templates_select" ON templates FOR SELECT USING (
  get_my_role() = 'admin' OR trainer_id = get_my_trainer_id()
);
CREATE POLICY "templates_insert" ON templates FOR INSERT WITH CHECK (
  get_my_role() = 'admin' OR trainer_id = get_my_trainer_id()
);
CREATE POLICY "templates_update" ON templates FOR UPDATE USING (
  get_my_role() = 'admin' OR trainer_id = get_my_trainer_id()
);
CREATE POLICY "templates_delete" ON templates FOR DELETE USING (
  get_my_role() = 'admin' OR trainer_id = get_my_trainer_id()
);

-- TEMPLATE_ASSIGNMENTS: same as templates
ALTER TABLE template_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ta_select" ON template_assignments FOR SELECT USING (
  get_my_role() = 'admin' OR trainer_id = get_my_trainer_id()
);
CREATE POLICY "ta_insert" ON template_assignments FOR INSERT WITH CHECK (
  get_my_role() = 'admin' OR trainer_id = get_my_trainer_id()
);
CREATE POLICY "ta_update" ON template_assignments FOR UPDATE USING (
  get_my_role() = 'admin' OR trainer_id = get_my_trainer_id()
);
CREATE POLICY "ta_delete" ON template_assignments FOR DELETE USING (
  get_my_role() = 'admin' OR trainer_id = get_my_trainer_id()
);

-- TASKS: user sees own, admin sees all
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tasks_select" ON tasks FOR SELECT USING (
  get_my_role() = 'admin' OR user_id = auth.uid()
);
CREATE POLICY "tasks_insert" ON tasks FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "tasks_update" ON tasks FOR UPDATE USING (
  get_my_role() = 'admin' OR user_id = auth.uid()
);
