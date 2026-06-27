-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ステータスページ
CREATE TABLE pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  description TEXT,
  settings JSONB DEFAULT '{"brandColor":"#22c55e","timezone":"Asia/Tokyo"}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pages_owner" ON pages FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "pages_public_read" ON pages FOR SELECT USING (true);

-- コンポーネント
CREATE TABLE components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES pages ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  group_name TEXT,
  status TEXT DEFAULT 'operational' CHECK (status IN ('operational','degraded','partial_outage','major_outage','maintenance')),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE components ENABLE ROW LEVEL SECURITY;
CREATE POLICY "components_owner" ON components FOR ALL
  USING (page_id IN (SELECT id FROM pages WHERE user_id = auth.uid()));
CREATE POLICY "components_public_read" ON components FOR SELECT USING (true);

-- インシデント
CREATE TABLE incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES pages ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'investigating' CHECK (status IN ('investigating','identified','monitoring','resolved')),
  impact TEXT DEFAULT 'minor' CHECK (impact IN ('none','minor','major','critical')),
  started_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "incidents_owner" ON incidents FOR ALL
  USING (page_id IN (SELECT id FROM pages WHERE user_id = auth.uid()));
CREATE POLICY "incidents_public_read" ON incidents FOR SELECT USING (true);

-- インシデント更新
CREATE TABLE incident_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID REFERENCES incidents ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE incident_updates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "updates_owner" ON incident_updates FOR ALL
  USING (incident_id IN (
    SELECT i.id FROM incidents i
    JOIN pages p ON p.id = i.page_id
    WHERE p.user_id = auth.uid()
  ));
CREATE POLICY "updates_public_read" ON incident_updates FOR SELECT USING (true);

-- インシデント影響コンポーネント
CREATE TABLE incident_components (
  incident_id UUID REFERENCES incidents ON DELETE CASCADE NOT NULL,
  component_id UUID REFERENCES components ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (incident_id, component_id)
);
ALTER TABLE incident_components ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ic_owner" ON incident_components FOR ALL
  USING (incident_id IN (
    SELECT i.id FROM incidents i
    JOIN pages p ON p.id = i.page_id
    WHERE p.user_id = auth.uid()
  ));
CREATE POLICY "ic_public_read" ON incident_components FOR SELECT USING (true);

-- メンテナンス
CREATE TABLE maintenances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES pages ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_start TIMESTAMPTZ NOT NULL,
  scheduled_end TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled','in_progress','completed')),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE maintenances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "maint_owner" ON maintenances FOR ALL
  USING (page_id IN (SELECT id FROM pages WHERE user_id = auth.uid()));
CREATE POLICY "maint_public_read" ON maintenances FOR SELECT USING (true);

-- メール購読
CREATE TABLE subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES pages ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  confirmed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(page_id, email)
);
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subs_owner" ON subscribers FOR ALL
  USING (page_id IN (SELECT id FROM pages WHERE user_id = auth.uid()));
CREATE POLICY "subs_insert" ON subscribers FOR INSERT WITH CHECK (true);

-- 稼働率記録（日次）
CREATE TABLE uptime_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_id UUID REFERENCES components ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  status TEXT NOT NULL,
  uptime_percent NUMERIC(5,2) DEFAULT 100.00,
  UNIQUE(component_id, date)
);
ALTER TABLE uptime_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "uptime_owner" ON uptime_records FOR ALL
  USING (component_id IN (
    SELECT c.id FROM components c
    JOIN pages p ON p.id = c.page_id
    WHERE p.user_id = auth.uid()
  ));
CREATE POLICY "uptime_public_read" ON uptime_records FOR SELECT USING (true);

-- updated_at自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pages_updated_at
  BEFORE UPDATE ON pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
