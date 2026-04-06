-- nVision Demo PostgreSQL Schema
-- Generated: 2026-04-04
-- Author: Trinity (Backend Dev)

-- Drop tables if they exist (for re-running script)
DROP TABLE IF EXISTS agent_activity_log CASCADE;
DROP TABLE IF EXISTS analytics_metrics CASCADE;
DROP TABLE IF EXISTS daily_summary_reports CASCADE;
DROP TABLE IF EXISTS delivery_log CASCADE;
DROP TABLE IF EXISTS campaign_recipients CASCADE;
DROP TABLE IF EXISTS campaign_content_variants CASCADE;
DROP TABLE IF EXISTS campaigns CASCADE;
DROP TABLE IF EXISTS campaign_templates CASCADE;
DROP TABLE IF EXISTS patients CASCADE;

-- ===========================================================================
-- PATIENTS TABLE
-- ===========================================================================
CREATE TABLE patients (
  id SERIAL PRIMARY KEY,
  salesforce_id VARCHAR(18) UNIQUE,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(100),
  phone VARCHAR(20),
  procedure_interest VARCHAR(50), -- 'LASIK', 'Cataract', 'Premium Lens'
  last_visit_date DATE,
  consultation_notes TEXT,
  call_recording_summary TEXT,
  engagement_score INT CHECK (engagement_score >= 0 AND engagement_score <= 100),
  preferred_channel VARCHAR(10) CHECK (preferred_channel IN ('email', 'sms', 'both')),
  date_of_birth DATE,
  gender VARCHAR(10),
  city VARCHAR(80),
  state VARCHAR(2),
  insurance_provider VARCHAR(80),
  lead_source VARCHAR(50),
  appointment_status VARCHAR(30) DEFAULT 'none',
  last_contacted DATE,
  lifetime_value NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_patients_salesforce_id ON patients(salesforce_id);
CREATE INDEX idx_patients_procedure ON patients(procedure_interest);
CREATE INDEX idx_patients_engagement ON patients(engagement_score);
CREATE INDEX idx_patients_channel ON patients(preferred_channel);
CREATE INDEX idx_patients_city ON patients(city);
CREATE INDEX idx_patients_gender ON patients(gender);
CREATE INDEX idx_patients_insurance ON patients(insurance_provider);
CREATE INDEX idx_patients_lead_source ON patients(lead_source);
CREATE INDEX idx_patients_appointment ON patients(appointment_status);

-- ===========================================================================
-- CAMPAIGN TEMPLATES TABLE
-- ===========================================================================
CREATE TABLE campaign_templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'promotional', 'educational', 'nurture'
  target_procedure VARCHAR(50),
  base_prompt TEXT,
  email_subject_template TEXT,
  cadence_config JSONB, -- [{"day": 1, "channel": "email"}, {"day": 3, "channel": "sms"}, ...]
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_templates_type ON campaign_templates(type);
CREATE INDEX idx_templates_procedure ON campaign_templates(target_procedure);

-- ===========================================================================
-- CAMPAIGNS TABLE
-- ===========================================================================
CREATE TABLE campaigns (
  id SERIAL PRIMARY KEY,
  template_id INT REFERENCES campaign_templates(id) ON DELETE SET NULL,
  name VARCHAR(200) NOT NULL,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'in_review', 'approved', 'active', 'completed')),
  date_range_start DATE,
  date_range_end DATE,
  prompt_text TEXT,
  parsed_prompt_params JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_template ON campaigns(template_id);
CREATE INDEX idx_campaigns_dates ON campaigns(date_range_start, date_range_end);

-- ===========================================================================
-- CAMPAIGN CONTENT VARIANTS TABLE
-- ===========================================================================
CREATE TABLE campaign_content_variants (
  id SERIAL PRIMARY KEY,
  campaign_id INT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  patient_id INT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  message_type VARCHAR(10) NOT NULL CHECK (message_type IN ('email', 'sms')),
  tone_label VARCHAR(30) NOT NULL, -- 'Medical/Professional', 'Informative', 'Friendly', 'Casual', 'Empathetic'
  subject_line TEXT,
  content TEXT NOT NULL,
  is_selected BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_variants_campaign ON campaign_content_variants(campaign_id);
CREATE INDEX idx_variants_patient ON campaign_content_variants(patient_id);
CREATE INDEX idx_variants_selected ON campaign_content_variants(is_selected);
CREATE INDEX idx_variants_tone ON campaign_content_variants(tone_label);

-- ===========================================================================
-- CAMPAIGN RECIPIENTS TABLE
-- ===========================================================================
CREATE TABLE campaign_recipients (
  id SERIAL PRIMARY KEY,
  campaign_id INT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  patient_id INT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  selected_email_variant_id INT REFERENCES campaign_content_variants(id) ON DELETE SET NULL,
  selected_sms_variant_id INT REFERENCES campaign_content_variants(id) ON DELETE SET NULL,
  cadence_step INT NOT NULL, -- which step in the cadence (1, 2, 3, ...)
  channel VARCHAR(10) NOT NULL CHECK (channel IN ('email', 'sms')),
  scheduled_time TIMESTAMP,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'sent', 'failed')),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_recipients_campaign ON campaign_recipients(campaign_id);
CREATE INDEX idx_recipients_patient ON campaign_recipients(patient_id);
CREATE INDEX idx_recipients_status ON campaign_recipients(status);
CREATE INDEX idx_recipients_scheduled ON campaign_recipients(scheduled_time);

-- ===========================================================================
-- DELIVERY LOG TABLE
-- ===========================================================================
CREATE TABLE delivery_log (
  id SERIAL PRIMARY KEY,
  campaign_recipient_id INT NOT NULL REFERENCES campaign_recipients(id) ON DELETE CASCADE,
  channel VARCHAR(10) NOT NULL CHECK (channel IN ('email', 'sms')),
  sent_at TIMESTAMP,
  tracking_id VARCHAR(50),
  status VARCHAR(20) NOT NULL CHECK (status IN ('sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed')),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_delivery_recipient ON delivery_log(campaign_recipient_id);
CREATE INDEX idx_delivery_status ON delivery_log(status);
CREATE INDEX idx_delivery_sent ON delivery_log(sent_at);

-- ===========================================================================
-- DAILY SUMMARY REPORTS TABLE
-- ===========================================================================
CREATE TABLE daily_summary_reports (
  id SERIAL PRIMARY KEY,
  campaign_id INT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  report_date DATE NOT NULL,
  summary_text TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reports_campaign ON daily_summary_reports(campaign_id);
CREATE INDEX idx_reports_date ON daily_summary_reports(report_date);

-- ===========================================================================
-- ANALYTICS METRICS TABLE
-- ===========================================================================
CREATE TABLE analytics_metrics (
  id SERIAL PRIMARY KEY,
  campaign_id INT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  emails_sent INT DEFAULT 0,
  emails_opened INT DEFAULT 0,
  emails_clicked INT DEFAULT 0,
  sms_sent INT DEFAULT 0,
  sms_replied INT DEFAULT 0,
  conversions INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(campaign_id, metric_date)
);

CREATE INDEX idx_metrics_campaign ON analytics_metrics(campaign_id);
CREATE INDEX idx_metrics_date ON analytics_metrics(metric_date);

-- ===========================================================================
-- AGENT ACTIVITY LOG TABLE
-- ===========================================================================
CREATE TABLE agent_activity_log (
  id SERIAL PRIMARY KEY,
  campaign_id INT REFERENCES campaigns(id) ON DELETE CASCADE,
  agent_name VARCHAR(50) NOT NULL, -- 'Data Analyst', 'Copywriter', 'Campaign Manager'
  activity_message TEXT NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('running', 'completed', 'error')),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_activity_campaign ON agent_activity_log(campaign_id);
CREATE INDEX idx_activity_status ON agent_activity_log(status);
CREATE INDEX idx_activity_created ON agent_activity_log(created_at);

-- ===========================================================================
-- COMPLETION
-- ===========================================================================
-- Grant permissions for n8n user
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO n8n;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO n8n;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'nVision demo database schema created successfully!';
  RAISE NOTICE 'Tables created: patients, campaign_templates, campaigns, campaign_content_variants, campaign_recipients, delivery_log, daily_summary_reports, analytics_metrics, agent_activity_log';
END $$;
