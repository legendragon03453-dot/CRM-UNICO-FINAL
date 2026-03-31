-- 1. Create Enums
CREATE TYPE user_role AS ENUM ('admin', 'sales');
CREATE TYPE lead_status AS ENUM (
  'iniciou_atendimento', 
  'conversando', 
  'abandonou_conversa', 
  'agendamento', 
  'follow_up', 
  'compareceu'
);
CREATE TYPE task_status AS ENUM ('pending', 'completed', 'overdue');

-- 2. Create Profiles Table (Linked to Auth)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role user_role DEFAULT 'sales',
  points_pos TEXT[] DEFAULT '{}',
  points_neg TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Leads Table (The Golden Columns)
CREATE TABLE leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  instagram TEXT,
  whatsapp TEXT,
  faturamento_estimado NUMERIC,
  dia TEXT, -- Extra Column Requested
  horario TEXT, -- Extra Column Requested
  status lead_status DEFAULT 'iniciou_atendimento',
  ai_score INTEGER CHECK (ai_score >= 0 AND ai_score <= 100),
  ai_tags JSONB DEFAULT '[]',
  ai_summary TEXT,
  owner_id UUID REFERENCES profiles(id),
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Tasks Table
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES profiles(id),
  created_by UUID REFERENCES profiles(id),
  due_date TIMESTAMPTZ,
  status task_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create Appointments Table
CREATE TABLE appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  scheduled_at TIMESTAMPTZ NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Enable Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies
-- Profiles: Users can see their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Leads: Admins see all, Sales see assigned
CREATE POLICY "Admins see all leads" ON leads
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Sales see assigned leads" ON leads
  FOR SELECT USING (owner_id = auth.uid());

-- Tasks: Admins see all, Sales see assigned
CREATE POLICY "Admins see all tasks" ON tasks
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Sales see assigned tasks" ON tasks
  FOR SELECT USING (assigned_to = auth.uid());

-- 8. Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE leads;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
