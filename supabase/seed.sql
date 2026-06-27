-- Seed data: Realistic sample for status-page
-- NOTE: This seed requires a real user to exist in auth.users.
-- For local development with Supabase CLI:
--   1. supabase start
--   2. Create a user via Supabase Studio or API
--   3. Replace the user_id below with the actual user UUID
--   4. Run: supabase db seed

-- Example realistic seed (uncomment and update user_id):
/*
DO $$
DECLARE
  v_user_id UUID := '00000000-0000-0000-0000-000000000001'; -- Replace with actual user ID
  v_page_id UUID;
  v_api_component_id UUID;
  v_web_component_id UUID;
  v_db_component_id UUID;
  v_cdn_component_id UUID;
  v_incident_id UUID;
BEGIN
  -- Create status page
  INSERT INTO pages (user_id, name, slug, description, settings)
  VALUES (
    v_user_id,
    'Acme Cloud Platform',
    'acme-cloud',
    'Real-time status of Acme Cloud services. Subscribe to get notified of incidents.',
    '{"brandColor":"#0066cc","timezone":"Asia/Tokyo"}'
  )
  RETURNING id INTO v_page_id;

  -- Create components
  INSERT INTO components (page_id, name, description, group_name, status, sort_order)
  VALUES
    (v_page_id, 'API Gateway', 'REST/GraphQL API endpoint', 'Core Infrastructure', 'operational', 1)
  RETURNING id INTO v_api_component_id;

  INSERT INTO components (page_id, name, description, group_name, status, sort_order)
  VALUES
    (v_page_id, 'Web App', 'app.acme.io dashboard', 'Core Infrastructure', 'operational', 2)
  RETURNING id INTO v_web_component_id;

  INSERT INTO components (page_id, name, description, group_name, status, sort_order)
  VALUES
    (v_page_id, 'PostgreSQL Database', 'Primary relational database', 'Data Layer', 'operational', 3)
  RETURNING id INTO v_db_component_id;

  INSERT INTO components (page_id, name, description, group_name, status, sort_order)
  VALUES
    (v_page_id, 'CDN / Edge Network', 'Global content delivery (Cloudflare)', 'Delivery', 'operational', 4)
  RETURNING id INTO v_cdn_component_id;

  -- Add a past resolved incident
  INSERT INTO incidents (page_id, title, status, impact, started_at, resolved_at)
  VALUES (
    v_page_id,
    'Elevated API error rates in ap-northeast-1',
    'resolved',
    'major',
    now() - INTERVAL '5 days 3 hours',
    now() - INTERVAL '5 days 1 hour'
  )
  RETURNING id INTO v_incident_id;

  INSERT INTO incident_updates (incident_id, status, message, created_at)
  VALUES
    (v_incident_id, 'investigating', 'We are investigating elevated 5xx error rates reported by users in the Tokyo region. API latency is also impacted.', now() - INTERVAL '5 days 3 hours'),
    (v_incident_id, 'identified', 'Root cause identified: a misconfigured load balancer rule deployed at 14:23 JST is routing approximately 30% of traffic to an unhealthy backend pool.', now() - INTERVAL '5 days 2 hours 30 minutes'),
    (v_incident_id, 'monitoring', 'The misconfigured rule has been reverted. Error rates are returning to baseline. We are monitoring for the next 30 minutes.', now() - INTERVAL '5 days 2 hours'),
    (v_incident_id, 'resolved', 'All systems are operating normally. Error rates are at 0.01% (within SLO). A post-mortem will be published within 48 hours.', now() - INTERVAL '5 days 1 hour');

  -- Link incident to affected components
  INSERT INTO incident_components (incident_id, component_id)
  VALUES
    (v_incident_id, v_api_component_id),
    (v_incident_id, v_web_component_id);

  -- Add uptime records for last 90 days
  INSERT INTO uptime_records (component_id, date, status, uptime_percent)
  SELECT
    v_api_component_id,
    (now() - (n || ' days')::INTERVAL)::DATE,
    CASE WHEN n = 5 THEN 'degraded' ELSE 'operational' END,
    CASE WHEN n = 5 THEN 87.50 ELSE 100.00 END
  FROM generate_series(0, 89) AS s(n);

  INSERT INTO uptime_records (component_id, date, status, uptime_percent)
  SELECT
    v_web_component_id,
    (now() - (n || ' days')::INTERVAL)::DATE,
    CASE WHEN n = 5 THEN 'degraded' ELSE 'operational' END,
    CASE WHEN n = 5 THEN 91.20 ELSE 100.00 END
  FROM generate_series(0, 89) AS s(n);

  INSERT INTO uptime_records (component_id, date, status, uptime_percent)
  SELECT v_db_component_id, (now() - (n || ' days')::INTERVAL)::DATE, 'operational', 100.00
  FROM generate_series(0, 89) AS s(n);

  INSERT INTO uptime_records (component_id, date, status, uptime_percent)
  SELECT v_cdn_component_id, (now() - (n || ' days')::INTERVAL)::DATE, 'operational', 100.00
  FROM generate_series(0, 89) AS s(n);

  -- Add a scheduled maintenance
  INSERT INTO maintenances (page_id, title, description, scheduled_start, scheduled_end, status)
  VALUES (
    v_page_id,
    'PostgreSQL 16 → 17 upgrade — primary database',
    'We will be upgrading the primary PostgreSQL instance from version 16 to 17. During this window, write operations may experience up to 60 seconds of downtime. Read replicas will remain available.',
    now() + INTERVAL '3 days 2 hours',
    now() + INTERVAL '3 days 4 hours',
    'scheduled'
  );

  RAISE NOTICE 'Seed completed. Page slug: acme-cloud, Page ID: %', v_page_id;
END;
$$;
*/
