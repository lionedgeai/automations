const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { getAIProvider } = require('./ai/provider');
const { sendEmail, testConnection: testResend, resetResendClient } = require('./email/resend');

const app = express();
const PORT = process.env.PORT || 3001;

const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'n8n',
  user: process.env.DB_USER || 'n8n',
  password: process.env.DB_PASSWORD || 'n8n_password_change_me',
});

pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5678'],
  credentials: true
}));

app.use(express.json());

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    const ai = getAIProvider();
    res.json({ status: 'ok', db: 'connected', ai_provider: ai.name });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({ status: 'error', db: 'disconnected', error: error.message });
  }
});

app.get('/api/ai/status', (req, res) => {
  const config = require('./ai/provider').getProviderConfig();
  const ai = getAIProvider();
  res.json({
    active_provider: ai.name,
    configured: {
      anthropic: !!config.anthropic.apiKey,
      openai: !!config.openai.apiKey,
      github: !!config.github.apiKey,
      mock: true,
      resend: !!process.env.RESEND_API_KEY,
    },
    models: {
      anthropic: config.anthropic.model,
      openai: config.openai.model,
      github: config.github.model,
    },
    resend_from: process.env.RESEND_FROM || 'NVISION Eye Centers <onboarding@resend.dev>',
  });
});

app.post('/api/ai/config', (req, res) => {
  const { provider, anthropic_api_key, anthropic_model, openai_api_key, openai_model, github_token, github_model, resend_api_key, resend_from } = req.body;

  if (provider) process.env.AI_PROVIDER = provider;
  if (anthropic_api_key !== undefined) process.env.ANTHROPIC_API_KEY = anthropic_api_key;
  if (anthropic_model) process.env.ANTHROPIC_MODEL = anthropic_model;
  if (openai_api_key !== undefined) process.env.OPENAI_API_KEY = openai_api_key;
  if (openai_model) process.env.OPENAI_MODEL = openai_model;
  if (github_token !== undefined) process.env.GITHUB_TOKEN = github_token;
  if (github_model) process.env.GITHUB_MODEL = github_model;
  if (resend_api_key !== undefined) { process.env.RESEND_API_KEY = resend_api_key; resetResendClient(); }
  if (resend_from) process.env.RESEND_FROM = resend_from;

  // Reset provider so next call picks up new config
  const { resetProvider, getProviderConfig } = require('./ai/provider');
  resetProvider();

  const ai = getAIProvider();
  const config = getProviderConfig();
  console.log(`[AI] Provider switched to: ${ai.name}`);

  res.json({
    active_provider: ai.name,
    configured: {
      anthropic: !!config.anthropic.apiKey,
      openai: !!config.openai.apiKey,
      github: !!config.github.apiKey,
      mock: true,
      resend: !!process.env.RESEND_API_KEY,
    },
    models: {
      anthropic: config.anthropic.model,
      openai: config.openai.model,
      github: config.github.model,
    },
    resend_from: process.env.RESEND_FROM || 'NVISION Eye Centers <onboarding@resend.dev>',
  });
});

app.post('/api/ai/test', async (req, res) => {
  const ai = getAIProvider();
  if (ai.name === 'mock') {
    return res.json({ success: true, provider: 'mock', message: 'Mock provider is always available' });
  }
  try {
    await ai.parsePrompt('Test LASIK campaign');
    res.json({ success: true, provider: ai.name, message: `${ai.name} is working correctly` });
  } catch (err) {
    res.json({ success: false, provider: ai.name, message: err.message });
  }
});

// SSE stream for real-time AI console
app.get('/api/ai/console', (req, res) => {
  const { aiLogger } = require('./ai/logger');

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  const recent = aiLogger.getRecent(50);
  for (const entry of recent) {
    res.write(`data: ${JSON.stringify(entry)}\n\n`);
  }

  const onLog = (entry) => {
    res.write(`data: ${JSON.stringify(entry)}\n\n`);
  };
  aiLogger.on('log', onLog);

  req.on('close', () => {
    aiLogger.off('log', onLog);
  });
});

// GET recent logs (non-streaming fallback)
app.get('/api/ai/logs', (req, res) => {
  const { aiLogger } = require('./ai/logger');
  res.json(aiLogger.getRecent(50));
});

app.get('/api/patients', async (req, res) => {
  try {
    const { procedure_interest, min_engagement_score, preferred_channel, search } = req.query;
    
    let query = 'SELECT * FROM patients WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (procedure_interest) {
      paramCount++;
      query += ` AND procedure_interest = $${paramCount}`;
      params.push(procedure_interest);
    }

    if (min_engagement_score) {
      paramCount++;
      query += ` AND engagement_score >= $${paramCount}`;
      params.push(parseInt(min_engagement_score));
    }

    if (preferred_channel) {
      paramCount++;
      query += ` AND preferred_channel = $${paramCount}`;
      params.push(preferred_channel);
    }

    if (search) {
      paramCount++;
      query += ` AND (CONCAT(first_name, ' ', last_name) ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    query += ' ORDER BY engagement_score DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// ============ AI Patient Filter ============

app.post('/api/patients/ai-filter', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || !query.trim()) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const { logAIEvent } = require('./ai/logger');
    logAIEvent({ provider: 'system', operation: 'ai-filter', status: 'start', detail: `Query: "${query}"` });

    const ai = getAIProvider();
    const today = new Date().toISOString().split('T')[0];

    // Get distinct values for context
    const distinctVals = await pool.query(`
      SELECT 
        array_agg(DISTINCT city) FILTER (WHERE city IS NOT NULL) as cities,
        array_agg(DISTINCT insurance_provider) FILTER (WHERE insurance_provider IS NOT NULL) as insurers,
        array_agg(DISTINCT lead_source) FILTER (WHERE lead_source IS NOT NULL) as sources,
        array_agg(DISTINCT appointment_status) FILTER (WHERE appointment_status IS NOT NULL) as statuses
      FROM patients
    `);
    const meta = distinctVals.rows[0];

    const systemPrompt = `You are an AI assistant for NVISION Eye Centers patient database.
Convert natural language queries into SQL WHERE clauses for the patients table.

Available columns:
- first_name VARCHAR, last_name VARCHAR, email VARCHAR, phone VARCHAR
- procedure_interest VARCHAR ('LASIK', 'Cataract', 'Premium Lens')
- engagement_score INT (0-100; high=70+, medium=40-69, low=<40)
- preferred_channel VARCHAR ('email', 'sms', 'both')
- date_of_birth DATE (use AGE() or EXTRACT for age calculations)
- gender VARCHAR ('Male', 'Female')
- city VARCHAR (cities: ${(meta.cities || []).join(', ')})
- state VARCHAR (2-letter code, all 'CA')
- insurance_provider VARCHAR (insurers: ${(meta.insurers || []).join(', ')})
- lead_source VARCHAR (sources: ${(meta.sources || []).join(', ')})
- appointment_status VARCHAR (statuses: ${(meta.statuses || []).join(', ')})
- last_contacted DATE
- lifetime_value NUMERIC (in dollars)
- last_visit_date DATE
- consultation_notes TEXT, call_recording_summary TEXT

Today's date: ${today}

Return ONLY valid JSON:
{
  "where_clause": "SQL WHERE clause (without 'WHERE' keyword). Use $1, $2, etc for parameters.",
  "params": ["array of parameter values"],
  "explanation": "brief human-readable explanation of what was filtered",
  "sort": "ORDER BY clause (without 'ORDER BY' keyword), default: engagement_score DESC"
}

Examples:
- "female lasik patients in LA" → {"where_clause": "gender = $1 AND procedure_interest = $2 AND city = $3", "params": ["Female", "LASIK", "Los Angeles"], "explanation": "Female LASIK patients in Los Angeles", "sort": "engagement_score DESC"}
- "high engagement patients over 60" → {"where_clause": "engagement_score >= $1 AND EXTRACT(YEAR FROM AGE(date_of_birth)) >= $2", "params": [70, 60], "explanation": "High engagement patients over 60 years old", "sort": "engagement_score DESC"}
- "patients with Medicare" → {"where_clause": "insurance_provider ILIKE $1", "params": ["%Medicare%"], "explanation": "Patients with Medicare insurance", "sort": "last_name ASC"}`;

    let filterResult;
    try {
      // Try real AI provider
      if (typeof ai._complete === 'function') {
        const raw = await ai._complete(systemPrompt, query, 512);
        const cleaned = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
        filterResult = JSON.parse(cleaned);
      } else {
        // Mock fallback: keyword-based parsing
        filterResult = mockParsePatientFilter(query);
      }
    } catch (aiErr) {
      console.warn('[AI Filter] AI call failed, using mock:', aiErr.message);
      filterResult = mockParsePatientFilter(query);
    }

    const { where_clause, params, explanation, sort } = filterResult;
    const sql = `SELECT * FROM patients WHERE ${where_clause || '1=1'} ORDER BY ${sort || 'engagement_score DESC'}`;
    
    console.log('[AI Filter] SQL:', sql, 'Params:', params);
    const result = await pool.query(sql, params || []);

    logAIEvent({ 
      provider: ai.name || 'mock', operation: 'ai-filter', status: 'success', 
      detail: `"${query}" → ${result.rows.length} results`,
      output: { explanation, count: result.rows.length, sql_preview: where_clause }
    });

    res.json({
      patients: result.rows,
      explanation,
      count: result.rows.length,
      query,
    });
  } catch (error) {
    console.error('Error in AI filter:', error);
    const { logAIEvent } = require('./ai/logger');
    logAIEvent({ provider: 'system', operation: 'ai-filter', status: 'error', detail: error.message });
    res.status(500).json({ error: 'AI filter failed', message: error.message });
  }
});

// Mock patient filter parser (keyword-based fallback)
function mockParsePatientFilter(query) {
  const lower = query.toLowerCase();
  const conditions = [];
  const params = [];
  let paramCount = 0;

  // Gender
  if (lower.includes('female') || lower.includes('women')) {
    conditions.push(`gender = $${++paramCount}`);
    params.push('Female');
  } else if (lower.includes('male') || lower.includes('men')) {
    conditions.push(`gender = $${++paramCount}`);
    params.push('Male');
  }

  // Procedure
  if (lower.includes('lasik')) {
    conditions.push(`procedure_interest = $${++paramCount}`);
    params.push('LASIK');
  } else if (lower.includes('cataract')) {
    conditions.push(`procedure_interest = $${++paramCount}`);
    params.push('Cataract');
  } else if (lower.includes('premium') || lower.includes('lens')) {
    conditions.push(`procedure_interest = $${++paramCount}`);
    params.push('Premium Lens');
  }

  // Engagement
  if (lower.includes('high engagement') || lower.includes('highly engaged')) {
    conditions.push(`engagement_score >= $${++paramCount}`);
    params.push(70);
  } else if (lower.includes('low engagement')) {
    conditions.push(`engagement_score < $${++paramCount}`);
    params.push(40);
  }

  // Age
  const ageOverMatch = lower.match(/over (\d+)|older than (\d+)|above (\d+)/);
  if (ageOverMatch) {
    const age = parseInt(ageOverMatch[1] || ageOverMatch[2] || ageOverMatch[3]);
    conditions.push(`EXTRACT(YEAR FROM AGE(date_of_birth)) >= $${++paramCount}`);
    params.push(age);
  }
  const ageUnderMatch = lower.match(/under (\d+)|younger than (\d+)|below (\d+)/);
  if (ageUnderMatch) {
    const age = parseInt(ageUnderMatch[1] || ageUnderMatch[2] || ageUnderMatch[3]);
    conditions.push(`EXTRACT(YEAR FROM AGE(date_of_birth)) < $${++paramCount}`);
    params.push(age);
  }

  // City
  const cities = ['los angeles', 'san diego', 'san francisco', 'irvine', 'pasadena', 'long beach', 'santa monica', 'beverly hills', 'newport beach', 'orange', 'riverside', 'anaheim', 'glendale', 'burbank', 'torrance', 'san jose', 'sacramento', 'berkeley', 'santa barbara', 'ventura', 'bakersfield', 'fresno', 'laguna beach', 'palm springs', 'marina del rey', 'mammoth lakes'];
  for (const city of cities) {
    if (lower.includes(city)) {
      conditions.push(`LOWER(city) = $${++paramCount}`);
      params.push(city);
      break;
    }
  }
  // Short aliases
  if (lower.includes(' la ') || lower.includes(' la,') || lower.endsWith(' la')) {
    conditions.push(`city = $${++paramCount}`);
    params.push('Los Angeles');
  } else if (lower.includes(' sf ') || lower.includes(' sf,') || lower.endsWith(' sf')) {
    conditions.push(`city = $${++paramCount}`);
    params.push('San Francisco');
  } else if (lower.includes(' sd ') || lower.includes(' sd,') || lower.endsWith(' sd')) {
    conditions.push(`city = $${++paramCount}`);
    params.push('San Diego');
  }

  // Insurance
  if (lower.includes('medicare')) {
    conditions.push(`insurance_provider ILIKE $${++paramCount}`);
    params.push('%Medicare%');
  } else if (lower.includes('kaiser')) {
    conditions.push(`insurance_provider ILIKE $${++paramCount}`);
    params.push('%Kaiser%');
  } else if (lower.includes('aetna')) {
    conditions.push(`insurance_provider ILIKE $${++paramCount}`);
    params.push('%Aetna%');
  } else if (lower.includes('blue cross') || lower.includes('blue shield')) {
    conditions.push(`insurance_provider ILIKE $${++paramCount}`);
    params.push('%Blue%');
  }

  // Lead source
  if (lower.includes('referral')) {
    conditions.push(`lead_source ILIKE $${++paramCount}`);
    params.push('%Referral%');
  } else if (lower.includes('google')) {
    conditions.push(`lead_source ILIKE $${++paramCount}`);
    params.push('%Google%');
  } else if (lower.includes('social') || lower.includes('facebook') || lower.includes('instagram')) {
    conditions.push(`lead_source ILIKE $${++paramCount}`);
    params.push('%Facebook%');
  }

  // Appointment status
  if (lower.includes('scheduled') || lower.includes('booked')) {
    conditions.push(`appointment_status = $${++paramCount}`);
    params.push('procedure_scheduled');
  } else if (lower.includes('no show') || lower.includes('no-show')) {
    conditions.push(`appointment_status = $${++paramCount}`);
    params.push('no_show');
  } else if (lower.includes('follow up') || lower.includes('follow-up')) {
    conditions.push(`appointment_status = $${++paramCount}`);
    params.push('follow_up_scheduled');
  }

  // Lifetime value
  if (lower.includes('high value') || lower.includes('high ltv') || lower.includes('valuable')) {
    conditions.push(`lifetime_value >= $${++paramCount}`);
    params.push(2000);
  }

  // Channel
  if (lower.includes('email only') || (lower.includes('email') && !lower.includes('sms'))) {
    conditions.push(`preferred_channel = $${++paramCount}`);
    params.push('email');
  } else if (lower.includes('sms only') || (lower.includes('sms') && !lower.includes('email'))) {
    conditions.push(`preferred_channel = $${++paramCount}`);
    params.push('sms');
  }

  const where_clause = conditions.length > 0 ? conditions.join(' AND ') : '1=1';
  const explanation = conditions.length > 0 
    ? `Filtered patients matching: ${query}` 
    : `Showing all patients (no specific filters matched for: "${query}")`;

  return { where_clause, params, explanation, sort: 'engagement_score DESC' };
}

app.get('/api/patients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM patients WHERE id = $1', [parseInt(id)]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching patient:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// ============ Campaign Templates ============

app.get('/api/templates', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM campaign_templates ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// ============ Campaigns ============

app.get('/api/campaigns', async (req, res) => {
  try {
    const query = `
      SELECT 
        c.*,
        ct.name as template_name,
        ct.cadence_config,
        (SELECT COUNT(*) FROM campaign_recipients cr WHERE cr.campaign_id = c.id) as recipient_count
      FROM campaigns c
      LEFT JOIN campaign_templates ct ON c.template_id = ct.id
      ORDER BY c.created_at DESC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

app.get('/api/campaigns/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const campaignResult = await pool.query(`
      SELECT 
        c.*,
        ct.name as template_name,
        ct.cadence_config,
        ct.base_prompt as template_description
      FROM campaigns c
      LEFT JOIN campaign_templates ct ON c.template_id = ct.id
      WHERE c.id = $1
    `, [parseInt(id)]);
    
    if (campaignResult.rows.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    const recipientsResult = await pool.query(`
      SELECT 
        cr.*,
        CONCAT(p.first_name, ' ', p.last_name) as patient_name,
        p.email,
        p.phone,
        p.procedure_interest,
        p.engagement_score
      FROM campaign_recipients cr
      JOIN patients p ON cr.patient_id = p.id
      WHERE cr.campaign_id = $1
      ORDER BY p.engagement_score DESC
    `, [parseInt(id)]);
    
    const activityResult = await pool.query(`
      SELECT * FROM agent_activity_log
      WHERE campaign_id = $1
      ORDER BY created_at ASC
    `, [parseInt(id)]);
    
    const campaign = campaignResult.rows[0];
    campaign.recipients = recipientsResult.rows;
    campaign.activity = activityResult.rows;
    
    res.json(campaign);
  } catch (error) {
    console.error('Error fetching campaign:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// ============ Campaign Recipients Management ============

// Get recipients for a campaign (with email_override)
app.get('/api/campaigns/:id/recipients', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT DISTINCT ON (cr.patient_id)
        cr.id,
        cr.patient_id,
        cr.email_override,
        cr.cadence_step,
        cr.channel,
        cr.status,
        CONCAT(p.first_name, ' ', p.last_name) as patient_name,
        p.email as original_email,
        p.phone,
        p.procedure_interest,
        p.engagement_score
      FROM campaign_recipients cr
      JOIN patients p ON cr.patient_id = p.id
      WHERE cr.campaign_id = $1
      ORDER BY cr.patient_id, cr.cadence_step ASC
    `, [parseInt(id)]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching campaign recipients:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Add recipient to campaign
app.post('/api/campaigns/:id/recipients', async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { patient_id, email_override } = req.body;
    const cid = parseInt(id);

    if (!patient_id) {
      return res.status(400).json({ error: 'patient_id is required' });
    }

    // Check patient exists
    const patientResult = await client.query('SELECT * FROM patients WHERE id = $1', [parseInt(patient_id)]);
    if (patientResult.rows.length === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Check not already in campaign
    const existing = await client.query(
      'SELECT id FROM campaign_recipients WHERE campaign_id = $1 AND patient_id = $2 LIMIT 1',
      [cid, parseInt(patient_id)]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Patient already in campaign' });
    }

    await client.query('BEGIN');

    // Add 4 cadence steps (email, sms, email, sms)
    const channels = ['email', 'sms', 'email', 'sms'];
    for (let step = 0; step < channels.length; step++) {
      await client.query(`
        INSERT INTO campaign_recipients (campaign_id, patient_id, cadence_step, channel, email_override, status)
        VALUES ($1, $2, $3, $4, $5, 'pending')
      `, [cid, parseInt(patient_id), step + 1, channels[step], email_override || null]);
    }

    await client.query('COMMIT');

    const patient = patientResult.rows[0];
    res.status(201).json({
      patient_id: patient.id,
      patient_name: `${patient.first_name} ${patient.last_name}`,
      email: patient.email,
      email_override: email_override || null,
      message: 'Recipient added with 4 cadence steps',
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error adding recipient:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  } finally {
    client.release();
  }
});

// Update recipient email override
app.put('/api/campaigns/:id/recipients/:patientId', async (req, res) => {
  try {
    const { id, patientId } = req.params;
    const { email_override } = req.body;

    const result = await pool.query(`
      UPDATE campaign_recipients
      SET email_override = $1
      WHERE campaign_id = $2 AND patient_id = $3
      RETURNING id
    `, [email_override || null, parseInt(id), parseInt(patientId)]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Recipient not found in campaign' });
    }

    res.json({ updated: result.rowCount, email_override: email_override || null });
  } catch (error) {
    console.error('Error updating recipient:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Bulk update all recipients' email override (for demo: "send all to me")
app.put('/api/campaigns/:id/recipients-override', async (req, res) => {
  try {
    const { id } = req.params;
    const { email_override } = req.body;

    const result = await pool.query(`
      UPDATE campaign_recipients
      SET email_override = $1
      WHERE campaign_id = $2
    `, [email_override || null, parseInt(id)]);

    res.json({ updated: result.rowCount, email_override: email_override || null });
  } catch (error) {
    console.error('Error bulk updating recipients:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Remove recipient from campaign
app.delete('/api/campaigns/:id/recipients/:patientId', async (req, res) => {
  const client = await pool.connect();
  try {
    const { id, patientId } = req.params;
    const cid = parseInt(id);
    const pid = parseInt(patientId);

    await client.query('BEGIN');
    await client.query(`
      DELETE FROM delivery_log
      WHERE campaign_recipient_id IN (
        SELECT id FROM campaign_recipients WHERE campaign_id = $1 AND patient_id = $2
      )
    `, [cid, pid]);
    await client.query(
      'DELETE FROM campaign_content_variants WHERE campaign_id = $1 AND patient_id = $2',
      [cid, pid]
    );
    const result = await client.query(
      'DELETE FROM campaign_recipients WHERE campaign_id = $1 AND patient_id = $2 RETURNING id',
      [cid, pid]
    );
    await client.query('COMMIT');

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Recipient not found in campaign' });
    }
    res.json({ deleted: result.rowCount });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error removing recipient:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  } finally {
    client.release();
  }
});

// Remove ALL recipients from campaign
app.delete('/api/campaigns/:id/recipients', async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const cid = parseInt(id);

    await client.query('BEGIN');
    await client.query(`
      DELETE FROM delivery_log
      WHERE campaign_recipient_id IN (
        SELECT id FROM campaign_recipients WHERE campaign_id = $1
      )
    `, [cid]);
    await client.query('DELETE FROM campaign_content_variants WHERE campaign_id = $1', [cid]);
    const result = await client.query('DELETE FROM campaign_recipients WHERE campaign_id = $1 RETURNING id', [cid]);
    await client.query('COMMIT');

    res.json({ deleted: result.rowCount });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error removing all recipients:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  } finally {
    client.release();
  }
});

app.post('/api/campaigns', async (req, res) => {
  const client = await pool.connect();
  try {
    const { prompt_text, template_id, patient_ids } = req.body;
    
    if (!prompt_text) {
      return res.status(400).json({ error: 'prompt_text is required' });
    }
    
    await client.query('BEGIN');
    const ai = getAIProvider();
    const { MockAIClient } = require('./ai/mock');
    const mockFallback = new MockAIClient();
    let usedFallback = false;

    async function tryAI(fn, mockFn) {
      try {
        return await fn(ai);
      } catch (err) {
        console.warn(`[AI] Provider error, falling back to mock: ${err.message}`);
        usedFallback = true;
        return await mockFn(mockFallback);
      }
    }

    const parsedParams = await tryAI(
      (p) => p.parsePrompt(prompt_text),
      (p) => p.parsePrompt(prompt_text)
    );
    
    const campaignResult = await client.query(`
      INSERT INTO campaigns (
        name, 
        prompt_text, 
        template_id, 
        status, 
        date_range_start, 
        date_range_end,
        parsed_prompt_params
      ) VALUES ($1, $2, $3, 'generating', $4, $5, $6)
      RETURNING *
    `, [
      parsedParams.campaignName,
      prompt_text,
      template_id || null,
      parsedParams.dateStart,
      parsedParams.dateEnd,
      JSON.stringify(parsedParams)
    ]);
    
    const campaignId = campaignResult.rows[0].id;
    
    const baseTime = new Date();
    
    await client.query(`
      INSERT INTO agent_activity_log (campaign_id, agent_name, activity_message, status, created_at)
      VALUES ($1, 'Data Analyst', 'Querying Salesforce for matching patients...', 'running', $2)
    `, [campaignId, new Date(baseTime.getTime())]);
    
    let matchedPatients;
    if (patient_ids && Array.isArray(patient_ids) && patient_ids.length > 0) {
      // Use pre-selected patient IDs from the UI preview
      const placeholders = patient_ids.map((_, i) => `$${i + 1}`).join(',');
      const patientsResult = await client.query(
        `SELECT * FROM patients WHERE id IN (${placeholders}) ORDER BY engagement_score DESC`,
        patient_ids.map(id => parseInt(id))
      );
      matchedPatients = patientsResult.rows;
    } else {
      // Fallback: use AI filter on prompt text for patient targeting
      let filterResult;
      try {
        filterResult = mockParsePatientFilter(prompt_text);
      } catch (e) {
        filterResult = { where_clause: '1=1', params: [], sort: 'engagement_score DESC' };
      }
      const sql = `SELECT * FROM patients WHERE ${filterResult.where_clause} ORDER BY ${filterResult.sort} LIMIT 20`;
      const patientsResult = await client.query(sql, filterResult.params);
      matchedPatients = patientsResult.rows;
    }
    
    await client.query(`
      INSERT INTO agent_activity_log (campaign_id, agent_name, activity_message, status, created_at)
      VALUES ($1, 'Data Analyst', $2, 'completed', $3)
    `, [campaignId, `Found ${matchedPatients.length} patients matching criteria`, new Date(baseTime.getTime() + 2000)]);
    
    await client.query(`
      INSERT INTO agent_activity_log (campaign_id, agent_name, activity_message, status, created_at)
      VALUES ($1, 'Copywriter', 'Generating personalized email content with 5 tone variations...', 'running', $2)
    `, [campaignId, new Date(baseTime.getTime() + 3000)]);
    
    // Blended cadence: Day 1 email, Day 3 SMS, Day 5 email, Day 7 SMS
    const cadenceSteps = [
      { step: 1, channel: 'email', dayOffset: 0 },
      { step: 2, channel: 'sms',   dayOffset: 2 },
      { step: 3, channel: 'email', dayOffset: 4 },
      { step: 4, channel: 'sms',   dayOffset: 6 },
    ];
    const startDate = parsedParams.dateStart ? new Date(parsedParams.dateStart) : new Date();

    for (const patient of matchedPatients) {
      // Create cadence recipient entries
      for (const cs of cadenceSteps) {
        if (cs.channel === 'sms' && patient.preferred_channel === 'email') continue;
        const scheduledTime = new Date(startDate);
        scheduledTime.setDate(scheduledTime.getDate() + cs.dayOffset);

        await client.query(`
          INSERT INTO campaign_recipients (campaign_id, patient_id, cadence_step, channel, scheduled_time, created_at)
          VALUES ($1, $2, $3, $4, $5, NOW())
        `, [campaignId, patient.id, cs.step, cs.channel, scheduledTime]);
      }

      // Generate 5 email tone variants
      const tones = ['Medical/Professional', 'Informative', 'Friendly', 'Casual', 'Empathetic'];
      for (let i = 0; i < tones.length; i++) {
        const content = await tryAI(
          (p) => p.generateEmail(patient, parsedParams, tones[i]),
          (p) => p.generateEmail(patient, parsedParams, tones[i])
        );
        const isSelected = tones[i] === 'Informative';
        
        await client.query(`
          INSERT INTO campaign_content_variants (
            campaign_id, patient_id, message_type, tone_label, 
            subject_line, content, is_selected, created_at
          ) VALUES ($1, $2, 'email', $3, $4, $5, $6, NOW())
        `, [campaignId, patient.id, tones[i], content.subject, content.body, isSelected]);
      }
      
      // Generate SMS variants if patient accepts SMS
      if (patient.preferred_channel === 'both' || patient.preferred_channel === 'sms') {
        const smsTones = ['Informative', 'Friendly', 'Casual'];
        for (let i = 0; i < smsTones.length; i++) {
          const smsContent = await tryAI(
            (p) => p.generateSMS(patient, parsedParams, smsTones[i]),
            (p) => p.generateSMS(patient, parsedParams, smsTones[i])
          );
          const isSelected = smsTones[i] === 'Friendly';
          
          await client.query(`
            INSERT INTO campaign_content_variants (
              campaign_id, patient_id, message_type, tone_label,
              subject_line, content, is_selected, created_at
            ) VALUES ($1, $2, 'sms', $3, NULL, $4, $5, NOW())
          `, [campaignId, patient.id, smsTones[i], smsContent, isSelected]);
        }
      }
    }
    
    await client.query(`
      INSERT INTO agent_activity_log (campaign_id, agent_name, activity_message, status, created_at)
      VALUES ($1, 'Copywriter', 'Content ready for review', 'completed', $2)
    `, [campaignId, new Date(baseTime.getTime() + 5000)]);
    
    await client.query(`
      INSERT INTO agent_activity_log (campaign_id, agent_name, activity_message, status, created_at)
      VALUES ($1, 'Campaign Manager', 'Building blended email+SMS delivery schedule...', 'running', $2)
    `, [campaignId, new Date(baseTime.getTime() + 6000)]);
    
    await client.query(`
      INSERT INTO agent_activity_log (campaign_id, agent_name, activity_message, status, created_at)
      VALUES ($1, 'Campaign Manager', 'Campaign ready for review', 'completed', $2)
    `, [campaignId, new Date(baseTime.getTime() + 8000)]);
    
    await client.query(`
      UPDATE campaigns SET status = 'in_review', updated_at = NOW()
      WHERE id = $1
    `, [campaignId]);
    
    await client.query('COMMIT');
    
    const finalResult = await pool.query(`
      SELECT 
        c.*,
        ct.name as template_name,
        ct.cadence_config,
        (SELECT COUNT(*) FROM campaign_recipients WHERE campaign_id = c.id) as recipient_count
      FROM campaigns c
      LEFT JOIN campaign_templates ct ON c.template_id = ct.id
      WHERE c.id = $1
    `, [campaignId]);
    
    res.status(201).json({ ...finalResult.rows[0], ai_fallback: usedFallback });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating campaign:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  } finally {
    client.release();
  }
});

// ============ Campaign Content Variants ============

app.get('/api/campaigns/:id/variants', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      SELECT 
        ccv.*,
        CONCAT(p.first_name, ' ', p.last_name) as patient_name,
        p.procedure_interest
      FROM campaign_content_variants ccv
      JOIN patients p ON ccv.patient_id = p.id
      WHERE ccv.campaign_id = $1
      ORDER BY p.first_name, p.last_name, ccv.message_type, ccv.created_at
    `, [parseInt(id)]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching variants:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

app.post('/api/campaigns/:id/variants/:variantId/select', async (req, res) => {
  const client = await pool.connect();
  try {
    const { variantId } = req.params;
    
    const variantResult = await client.query(
      'SELECT campaign_id, patient_id, message_type FROM campaign_content_variants WHERE id = $1',
      [parseInt(variantId)]
    );
    
    if (variantResult.rows.length === 0) {
      return res.status(404).json({ error: 'Variant not found' });
    }
    
    const { campaign_id, patient_id, message_type } = variantResult.rows[0];
    
    await client.query('BEGIN');
    
    await client.query(`
      UPDATE campaign_content_variants 
      SET is_selected = FALSE 
      WHERE campaign_id = $1 AND patient_id = $2 AND message_type = $3
    `, [campaign_id, patient_id, message_type]);
    
    await client.query(`
      UPDATE campaign_content_variants 
      SET is_selected = TRUE 
      WHERE id = $1
    `, [parseInt(variantId)]);
    
    await client.query('COMMIT');
    
    const updatedResult = await pool.query(
      'SELECT * FROM campaign_content_variants WHERE id = $1',
      [parseInt(variantId)]
    );
    
    res.json(updatedResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error selecting variant:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  } finally {
    client.release();
  }
});

app.post('/api/campaigns/:id/variants/:variantId/regenerate', async (req, res) => {
  try {
    const { variantId } = req.params;
    const { tone_label } = req.body;
    
    const variantResult = await pool.query(
      'SELECT * FROM campaign_content_variants WHERE id = $1',
      [parseInt(variantId)]
    );
    
    if (variantResult.rows.length === 0) {
      return res.status(404).json({ error: 'Variant not found' });
    }
    
    const original = variantResult.rows[0];
    const patientResult = await pool.query('SELECT * FROM patients WHERE id = $1', [original.patient_id]);
    const patient = patientResult.rows[0];
    
    const campaignResult = await pool.query('SELECT * FROM campaigns WHERE id = $1', [original.campaign_id]);
    const campaign = campaignResult.rows[0];
    const parsedParams = campaign.parsed_prompt_params || {};
    
    const newTone = tone_label || original.tone_label;
    
    let newContent;
    const ai = getAIProvider();
    if (original.message_type === 'email') {
      newContent = await ai.regenerateEmail(patient, parsedParams, newTone, { subject: original.subject_line, body: original.content });
    } else {
      const smsText = await ai.regenerateSMS(patient, parsedParams, newTone, original.content);
      newContent = { subject: null, body: smsText };
    }
    
    const insertResult = await pool.query(`
      INSERT INTO campaign_content_variants (
        campaign_id, patient_id, message_type, tone_label,
        subject_line, content, is_selected, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, FALSE, NOW())
      RETURNING *
    `, [
      original.campaign_id,
      original.patient_id,
      original.message_type,
      newTone,
      newContent.subject,
      newContent.body
    ]);
    
    res.status(201).json(insertResult.rows[0]);
  } catch (error) {
    console.error('Error regenerating variant:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// ============ Campaign Approval ============

app.post('/api/campaigns/:id/approve', async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { date_range_start, date_range_end } = req.body;
    
    await client.query('BEGIN');
    
    const campaignResult = await client.query('SELECT * FROM campaigns WHERE id = $1', [parseInt(id)]);
    if (campaignResult.rows.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    const campaign = campaignResult.rows[0];
    const startDate = date_range_start ? new Date(date_range_start) : new Date(campaign.date_range_start);
    const endDate = date_range_end ? new Date(date_range_end) : new Date(campaign.date_range_end);
    
    await client.query(`
      UPDATE campaigns 
      SET status = 'approved', 
          date_range_start = $2,
          date_range_end = $3,
          updated_at = NOW()
      WHERE id = $1
    `, [parseInt(id), startDate, endDate]);
    
    const templateResult = await client.query(
      'SELECT cadence_config FROM campaign_templates WHERE id = $1',
      [campaign.template_id]
    );
    
    if (templateResult.rows.length > 0 && templateResult.rows[0].cadence_config) {
      const cadence = templateResult.rows[0].cadence_config;
      const recipients = await client.query(
        'SELECT * FROM campaign_recipients WHERE campaign_id = $1',
        [parseInt(id)]
      );
      
      for (const recipient of recipients.rows) {
        for (const step of cadence) {
          const scheduledTime = new Date(startDate.getTime() + (step.day - 1) * 24 * 60 * 60 * 1000);
          
          if (scheduledTime <= endDate) {
            await client.query(`
              UPDATE campaign_recipients
              SET scheduled_time = $1
              WHERE id = $2
            `, [scheduledTime, recipient.id]);
          }
        }
      }
    }
    
    await client.query(`
      UPDATE campaigns 
      SET status = 'active', updated_at = NOW()
      WHERE id = $1
    `, [parseInt(id)]);
    
    await client.query(`
      INSERT INTO agent_activity_log (campaign_id, agent_name, activity_message, status, created_at)
      VALUES ($1, 'Campaign Manager', 'Campaign approved and activated', 'completed', NOW())
    `, [parseInt(id)]);
    
    await client.query('COMMIT');
    
    const updatedResult = await pool.query(`
      SELECT 
        c.*,
        ct.name as template_name,
        (SELECT COUNT(*) FROM campaign_recipients WHERE campaign_id = c.id) as recipient_count
      FROM campaigns c
      LEFT JOIN campaign_templates ct ON c.template_id = ct.id
      WHERE c.id = $1
    `, [parseInt(id)]);
    
    res.json(updatedResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error approving campaign:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  } finally {
    client.release();
  }
});

app.post('/api/campaigns/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      UPDATE campaigns 
      SET status = 'draft', updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [parseInt(id)]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    await pool.query(`
      INSERT INTO agent_activity_log (campaign_id, agent_name, activity_message, status, created_at)
      VALUES ($1, 'Campaign Manager', 'Campaign rejected, returned to draft', 'completed', NOW())
    `, [parseInt(id)]);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error rejecting campaign:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

app.delete('/api/campaigns/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const cid = parseInt(id);

    await client.query('BEGIN');
    await client.query('DELETE FROM agent_activity_log WHERE campaign_id = $1', [cid]);
    await client.query('DELETE FROM analytics_metrics WHERE campaign_id = $1', [cid]);
    await client.query('DELETE FROM daily_summary_reports WHERE campaign_id = $1', [cid]);
    // delivery_log cascades via campaign_recipients FK
    await client.query('DELETE FROM delivery_log WHERE campaign_recipient_id IN (SELECT id FROM campaign_recipients WHERE campaign_id = $1)', [cid]);
    await client.query('DELETE FROM campaign_content_variants WHERE campaign_id = $1', [cid]);
    await client.query('DELETE FROM campaign_recipients WHERE campaign_id = $1', [cid]);
    const result = await client.query('DELETE FROM campaigns WHERE id = $1 RETURNING id, name', [cid]);
    await client.query('COMMIT');

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    res.json({ deleted: true, campaign: result.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting campaign:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  } finally {
    client.release();
  }
});

// ============ Campaign Send (Resend) ============

app.post('/api/campaigns/:id/send', async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const cid = parseInt(id);

    // Verify campaign is approved/active
    const campaignResult = await client.query('SELECT * FROM campaigns WHERE id = $1', [cid]);
    if (campaignResult.rows.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    const campaign = campaignResult.rows[0];
    if (!['approved', 'active'].includes(campaign.status)) {
      return res.status(400).json({ error: `Campaign must be approved before sending (current: ${campaign.status})` });
    }

    // Get distinct recipients with their selected email variants
    const recipientsResult = await client.query(`
      SELECT DISTINCT ON (cr.patient_id)
        cr.id as recipient_id,
        cr.patient_id,
        cr.email_override,
        p.first_name,
        p.last_name,
        p.email,
        p.procedure_interest,
        cv.subject_line,
        cv.content,
        cv.tone_label
      FROM campaign_recipients cr
      JOIN patients p ON cr.patient_id = p.id
      LEFT JOIN campaign_content_variants cv
        ON cv.campaign_id = cr.campaign_id
        AND cv.patient_id = cr.patient_id
        AND cv.message_type = 'email'
        AND cv.is_selected = true
      WHERE cr.campaign_id = $1
        AND cr.channel = 'email'
      ORDER BY cr.patient_id, cr.cadence_step ASC
    `, [cid]);

    if (recipientsResult.rows.length === 0) {
      return res.status(400).json({ error: 'No email recipients found for this campaign' });
    }

    const { logAIEvent } = require('./ai/logger');
    logAIEvent({
      provider: 'resend',
      operation: 'sendCampaign',
      status: 'start',
      detail: `Sending campaign "${campaign.name}" to ${recipientsResult.rows.length} recipients`,
    });

    const results = [];
    let successCount = 0;
    let failCount = 0;

    for (const row of recipientsResult.rows) {
      const patientName = `${row.first_name} ${row.last_name}`;
      const toEmail = row.email_override || row.email;
      const subject = row.subject_line || `${campaign.name} — Special Offer for You`;
      const body = row.content || `We have an exciting opportunity for your ${row.procedure_interest || 'eye care'} needs.`;

      try {
        const result = await sendEmail({
          to: toEmail,
          patientName,
          subject,
          body,
          procedureInterest: row.procedure_interest,
          campaignId: cid,
          recipientId: row.recipient_id,
        });

        // Log to delivery_log
        await client.query(`
          INSERT INTO delivery_log (campaign_recipient_id, channel, status, sent_at, tracking_id, created_at)
          VALUES ($1, 'email', 'sent', NOW(), $2, NOW())
        `, [row.recipient_id, result.emailId]);

        results.push({ patient: patientName, email: toEmail, status: 'sent', emailId: result.emailId });
        successCount++;
      } catch (err) {
        await client.query(`
          INSERT INTO delivery_log (campaign_recipient_id, channel, status, sent_at, created_at)
          VALUES ($1, 'email', 'failed', NOW(), NOW())
        `, [row.recipient_id]);

        results.push({ patient: patientName, email: toEmail, status: 'failed', error: err.message });
        failCount++;
      }
    }

    // Update campaign status
    await client.query(`
      UPDATE campaigns SET status = 'active', updated_at = NOW() WHERE id = $1
    `, [cid]);

    // Log activity
    await client.query(`
      INSERT INTO agent_activity_log (campaign_id, agent_name, activity_message, status, created_at)
      VALUES ($1, 'Email Delivery Agent', $2, 'completed', NOW())
    `, [cid, `Sent ${successCount} emails (${failCount} failed) via Resend`]);

    logAIEvent({
      provider: 'resend',
      operation: 'sendCampaign',
      status: 'success',
      detail: `Campaign "${campaign.name}": ${successCount} sent, ${failCount} failed`,
      output: { successCount, failCount, total: recipientsResult.rows.length },
    });

    res.json({ success: true, sent: successCount, failed: failCount, results });
  } catch (error) {
    console.error('Error sending campaign:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  } finally {
    client.release();
  }
});

// Campaign delivery status
app.get('/api/campaigns/:id/delivery', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT
        dl.id,
        dl.channel,
        dl.status,
        dl.sent_at,
        dl.tracking_id,
        CONCAT(p.first_name, ' ', p.last_name) as patient_name,
        p.email,
        cr.cadence_step
      FROM delivery_log dl
      JOIN campaign_recipients cr ON dl.campaign_recipient_id = cr.id
      JOIN patients p ON cr.patient_id = p.id
      WHERE cr.campaign_id = $1
      ORDER BY dl.sent_at DESC
    `, [parseInt(id)]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching delivery status:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Test Resend connection
app.post('/api/email/test', async (req, res) => {
  const result = await testResend();
  res.json(result);
});

// ============ Delivery Log ============

app.get('/api/delivery', async (req, res) => {
  try {
    const { campaign_id, channel, status, limit } = req.query;
    
    let query = `
      SELECT 
        dl.*,
        CONCAT(p.first_name, ' ', p.last_name) as patient_name,
        p.email,
        p.phone,
        c.name as campaign_name
      FROM delivery_log dl
      JOIN campaign_recipients cr ON dl.campaign_recipient_id = cr.id
      JOIN patients p ON cr.patient_id = p.id
      JOIN campaigns c ON cr.campaign_id = c.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 0;
    
    if (campaign_id) {
      paramCount++;
      query += ` AND cr.campaign_id = $${paramCount}`;
      params.push(parseInt(campaign_id));
    }
    
    if (channel) {
      paramCount++;
      query += ` AND dl.channel = $${paramCount}`;
      params.push(channel);
    }
    
    if (status) {
      paramCount++;
      query += ` AND dl.status = $${paramCount}`;
      params.push(status);
    }
    
    query += ' ORDER BY dl.sent_at DESC';
    
    if (limit) {
      paramCount++;
      query += ` LIMIT $${paramCount}`;
      params.push(parseInt(limit));
    } else {
      query += ' LIMIT 50';
    }
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching delivery log:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

app.post('/api/delivery/simulate', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const activeCampaign = await client.query(`
      SELECT c.id, cr.id as recipient_id, cr.patient_id
      FROM campaigns c
      JOIN campaign_recipients cr ON c.id = cr.campaign_id
      WHERE c.status = 'active'
      AND NOT EXISTS (
        SELECT 1 FROM delivery_log dl 
        WHERE dl.campaign_recipient_id = cr.id 
        AND dl.sent_at::date = CURRENT_DATE
      )
      LIMIT 5
    `);
    
    if (activeCampaign.rows.length === 0) {
      return res.status(400).json({ error: 'No pending deliveries for active campaigns' });
    }
    
    const newEntries = [];
    
    for (const row of activeCampaign.rows) {
      const channels = ['email', 'sms'];
      const channel = channels[Math.floor(Math.random() * channels.length)];
      
      const insertResult = await client.query(`
        INSERT INTO delivery_log (
          campaign_recipient_id, channel, status, sent_at, delivered_at, created_at
        ) VALUES ($1, $2, 'sent', NOW(), NOW() + INTERVAL '5 seconds', NOW())
        RETURNING *
      `, [row.recipient_id, channel]);
      
      newEntries.push(insertResult.rows[0]);
    }
    
    await client.query('COMMIT');
    
    res.status(201).json(newEntries);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error simulating delivery:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  } finally {
    client.release();
  }
});

// ============ Analytics ============

app.get('/api/analytics', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, campaign_id, metric_date,
        emails_sent, emails_opened, emails_clicked,
        sms_sent, COALESCE(sms_replied, 0) as sms_replied,
        conversions
      FROM analytics_metrics
      ORDER BY metric_date ASC
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

app.get('/api/analytics/:campaignId', async (req, res) => {
  try {
    const { campaignId } = req.params;
    
    const result = await pool.query(`
      SELECT 
        id, campaign_id, metric_date,
        emails_sent, emails_opened, emails_clicked,
        sms_sent, COALESCE(sms_replied, 0) as sms_replied,
        conversions
      FROM analytics_metrics
      WHERE campaign_id = $1
      ORDER BY metric_date ASC
    `, [parseInt(campaignId)]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching campaign analytics:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

app.get('/api/analytics/:campaignId/recipients', async (req, res) => {
  try {
    const { campaignId } = req.params;
    
    const result = await pool.query(`
      SELECT 
        p.id,
        CONCAT(p.first_name, ' ', p.last_name) as name,
        p.email,
        p.engagement_score,
        COUNT(CASE WHEN dl.status IN ('opened', 'clicked') THEN 1 END) as opened_count,
        COUNT(CASE WHEN dl.status = 'clicked' THEN 1 END) as clicked_count,
        MAX(CASE WHEN dl.status = 'clicked' THEN 1 ELSE 0 END) as has_clicked,
        0 as replied_count,
        0 as converted
      FROM campaign_recipients cr
      JOIN patients p ON cr.patient_id = p.id
      LEFT JOIN delivery_log dl ON dl.campaign_recipient_id = cr.id
      WHERE cr.campaign_id = $1
      GROUP BY p.id, p.first_name, p.last_name, p.email, p.engagement_score
      ORDER BY p.engagement_score DESC
    `, [parseInt(campaignId)]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching recipient analytics:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// ============ Daily Summaries ============

app.get('/api/summaries', async (req, res) => {
  try {
    const { campaign_id } = req.query;
    
    let query = `
      SELECT 
        dsr.*,
        c.name as campaign_name
      FROM daily_summary_reports dsr
      JOIN campaigns c ON dsr.campaign_id = c.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (campaign_id) {
      params.push(parseInt(campaign_id));
      query += ` AND dsr.campaign_id = $1`;
    }
    
    query += ' ORDER BY dsr.report_date DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching summaries:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

app.get('/api/summaries/latest', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT ON (dsr.campaign_id)
        dsr.*,
        c.name as campaign_name
      FROM daily_summary_reports dsr
      JOIN campaigns c ON dsr.campaign_id = c.id
      WHERE c.status = 'active'
      ORDER BY dsr.campaign_id, dsr.report_date DESC
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching latest summaries:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// ============ Agent Activity ============

app.get('/api/agent-activity/:campaignId', async (req, res) => {
  try {
    const { campaignId } = req.params;
    
    const result = await pool.query(`
      SELECT * FROM agent_activity_log
      WHERE campaign_id = $1
      ORDER BY created_at ASC
    `, [parseInt(campaignId)]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching agent activity:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// ============ Dashboard Stats ============

app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const patientsResult = await pool.query('SELECT COUNT(*) as count FROM patients');
    const activeCampaignsResult = await pool.query('SELECT COUNT(*) as count FROM campaigns WHERE status = \'active\'');
    const pendingReviewResult = await pool.query('SELECT COUNT(*) as count FROM campaigns WHERE status = \'in_review\'');
    
    const metricsResult = await pool.query(`
      SELECT 
        SUM(emails_sent + sms_sent) as total_sent,
        SUM(emails_opened) as total_opened,
        SUM(emails_clicked) as total_clicked,
        SUM(conversions) as total_conversions
      FROM analytics_metrics
    `);
    
    const metrics = metricsResult.rows[0];
    const totalSent = parseInt(metrics.total_sent) || 0;
    const totalOpened = parseInt(metrics.total_opened) || 0;
    const totalClicked = parseInt(metrics.total_clicked) || 0;
    
    const openRate = totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) + '%' : '0.0%';
    const clickRate = totalSent > 0 ? ((totalClicked / totalSent) * 100).toFixed(1) + '%' : '0.0%';
    
    res.json({
      total_patients: parseInt(patientsResult.rows[0].count),
      active_campaigns: parseInt(activeCampaignsResult.rows[0].count),
      pending_review: parseInt(pendingReviewResult.rows[0].count),
      total_sent: totalSent,
      total_opened: totalOpened,
      total_clicked: totalClicked,
      total_conversions: parseInt(metrics.total_conversions) || 0,
      open_rate: openRate,
      click_rate: clickRate
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// ============ Helper Functions ============

function buildPatientQuery(params) {
  let query = 'SELECT * FROM patients WHERE 1=1';
  const values = [];
  let paramIndex = 1;
  
  if (params.procedure) {
    query += ` AND procedure_interest = $${paramIndex++}`;
    values.push(params.procedure);
  }
  
  if (params.minEngagement > 0) {
    query += ` AND engagement_score >= $${paramIndex++}`;
    values.push(params.minEngagement);
  }
  
  query += ' ORDER BY engagement_score DESC LIMIT 20';
  
  return { text: query, values };
}

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, '0.0.0.0', () => {
  const ai = getAIProvider();
  console.log(`nVision Demo API server running on port ${PORT}`);
  console.log(`AI Provider: ${ai.name}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing HTTP server');
  pool.end(() => {
    console.log('Database pool closed');
    process.exit(0);
  });
});
