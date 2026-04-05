const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

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
    res.json({ status: 'ok', db: 'connected' });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({ status: 'error', db: 'disconnected', error: error.message });
  }
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
      query += ` AND (name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
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

app.post('/api/campaigns', async (req, res) => {
  const client = await pool.connect();
  try {
    const { prompt_text, template_id } = req.body;
    
    if (!prompt_text) {
      return res.status(400).json({ error: 'prompt_text is required' });
    }
    
    await client.query('BEGIN');
    
    const parsedParams = parsePromptText(prompt_text);
    
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
    
    const patientsResult = await client.query(buildPatientQuery(parsedParams));
    const matchedPatients = patientsResult.rows;
    
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
        const content = generateToneVariant(patient, parsedParams, tones[i]);
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
          const smsContent = generateSMSVariant(patient, parsedParams, smsTones[i]);
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
    
    res.status(201).json(finalResult.rows[0]);
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
    if (original.message_type === 'email') {
      newContent = regenerateToneVariant(patient, parsedParams, newTone, original.content);
    } else {
      newContent = { subject: null, body: regenerateSMSVariant(patient, parsedParams, newTone, original.content) };
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

function parsePromptText(promptText) {
  const lower = promptText.toLowerCase();
  
  let procedure = null;
  if (lower.includes('lasik')) procedure = 'LASIK';
  else if (lower.includes('cataract')) procedure = 'Cataract Surgery';
  else if (lower.includes('premium lens') || lower.includes('lens upgrade')) procedure = 'Premium Lens Upgrade';
  
  let campaignName = 'AI Generated Campaign';
  if (procedure) {
    campaignName = `${procedure} Campaign`;
  }
  if (lower.includes('summer')) campaignName = `Summer ${procedure || 'Vision'} Promotion`;
  if (lower.includes('spring')) campaignName = `Spring ${procedure || 'Vision'} Promotion`;
  if (lower.includes('fall') || lower.includes('autumn')) campaignName = `Fall ${procedure || 'Vision'} Promotion`;
  if (lower.includes('winter')) campaignName = `Winter ${procedure || 'Vision'} Promotion`;
  if (lower.includes('education')) campaignName = `${procedure || 'Vision'} Education Series`;
  
  const now = new Date();
  let dateStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let dateEnd = new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());
  
  const monthMatch = lower.match(/through\s+(january|february|march|april|may|june|july|august|september|october|november|december)/);
  if (monthMatch) {
    const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
    const monthIndex = months.indexOf(monthMatch[1]);
    dateEnd = new Date(now.getFullYear(), monthIndex, 28);
    if (dateEnd < dateStart) {
      dateEnd = new Date(now.getFullYear() + 1, monthIndex, 28);
    }
  }
  
  let minEngagement = 0;
  if (lower.includes('high engagement')) minEngagement = 70;
  else if (lower.includes('medium engagement')) minEngagement = 50;
  else if (lower.includes('engaged')) minEngagement = 60;
  
  return {
    campaignName,
    procedure,
    minEngagement,
    dateStart,
    dateEnd,
    segment: lower.includes('haven\'t converted') ? 'unconverted' : 'all'
  };
}

function buildPatientQuery(params) {
  let query = 'SELECT * FROM patients WHERE 1=1';
  const conditions = [];
  
  if (params.procedure) {
    conditions.push(`procedure_interest = '${params.procedure}'`);
  }
  
  if (params.minEngagement > 0) {
    conditions.push(`engagement_score >= ${params.minEngagement}`);
  }
  
  if (conditions.length > 0) {
    query += ' AND ' + conditions.join(' AND ');
  }
  
  query += ' ORDER BY engagement_score DESC LIMIT 20';
  
  return query;
}

function generateToneVariant(patient, params, tone) {
  const procedure = params.procedure || patient.procedure_interest;
  const firstName = patient.first_name;
  const fullName = `${patient.first_name} ${patient.last_name}`;
  
  const subjects = {
    'Medical/Professional': `Important Information Regarding ${procedure} at nVision`,
    'Informative': `${procedure}: What You Need to Know`,
    'Friendly': `Hi ${firstName}, Let's Talk About Your ${procedure} Options`,
    'Casual': `${firstName}, Ready to See Clearer? 👓`,
    'Empathetic': `${firstName}, We Understand Your Vision Concerns`
  };
  
  const intros = {
    'Medical/Professional': `Dear ${fullName},\n\nBased on your recent consultation regarding ${procedure}, we wanted to provide you with comprehensive information about this procedure.`,
    'Informative': `Hello ${fullName},\n\nThank you for your interest in ${procedure}. Here's what you should know about your options.`,
    'Friendly': `Hi ${firstName}!\n\nIt was great speaking with you about ${procedure}. I wanted to follow up with some helpful information.`,
    'Casual': `Hey ${firstName},\n\nSo you're thinking about ${procedure}? Let me break it down for you in simple terms.`,
    'Empathetic': `Dear ${firstName},\n\nWe know that considering ${procedure} is a big decision, and we're here to support you every step of the way.`
  };
  
  const consultationRef = patient.consultation_notes ? 
    `\n\nDuring your consultation, you mentioned ${patient.consultation_notes.substring(0, 100)}...` : '';
  
  const bodies = {
    'Medical/Professional': `${intros['Medical/Professional']}${consultationRef}\n\n${procedure} is a clinically proven procedure with a high success rate. Our board-certified ophthalmologists utilize state-of-the-art technology to ensure optimal outcomes.\n\nWe recommend scheduling a comprehensive evaluation to determine your candidacy and discuss the specific benefits relevant to your visual needs.\n\nPlease contact our office at your earliest convenience.\n\nSincerely,\nnVision Centers Medical Team`,
    'Informative': `${intros['Informative']}${consultationRef}\n\n${procedure} can significantly improve your vision and quality of life. The procedure typically takes 15-30 minutes, with most patients experiencing improved vision within 24-48 hours.\n\nKey benefits include:\n• Reduced dependence on glasses/contacts\n• Quick recovery time\n• Long-lasting results\n\nWe'd love to schedule a follow-up consultation to answer any questions.\n\nBest regards,\nThe nVision Team`,
    'Friendly': `${intros['Friendly']}${consultationRef}\n\nI know you had some great questions during our chat, and I wanted to make sure you have all the info you need to make the best decision for your eyes.\n\n${procedure} has helped thousands of people just like you achieve clearer vision. Imagine waking up and being able to see clearly without reaching for your glasses!\n\nWant to chat more? Just give us a call or reply to this email.\n\nLooking forward to hearing from you!\nYour friends at nVision`,
    'Casual': `${intros['Casual']}${consultationRef}\n\nLook, I get it - vision correction surgery sounds intimidating. But here's the thing: it's actually pretty straightforward, and the results are amazing.\n\nMost of our patients wish they'd done it sooner. Seriously.\n\nIf you're ready to ditch the glasses or contacts, let's make it happen. We're here to answer any questions, no pressure.\n\nShoot us a message anytime!\nThe nVision Crew`,
    'Empathetic': `${intros['Empathetic']}${consultationRef}\n\nWe understand that you may have concerns about the procedure, cost, or recovery time. These are completely normal feelings, and we're here to address each one.\n\nMany of our patients felt the same way you do now, and they're thrilled with their decision. We'll work with you to create a personalized plan that fits your needs and timeline.\n\nYou're not alone in this journey. Our caring team is here to support you.\n\nWarm regards,\nThe nVision Family`
  };
  
  return {
    subject: subjects[tone],
    body: bodies[tone]
  };
}

function generateSMSVariant(patient, params, tone) {
  const firstName = patient.first_name;
  const procedure = params.procedure || patient.procedure_interest;
  
  const messages = {
    'Informative': `Hi ${firstName}, this is nVision Centers. Ready to learn more about ${procedure}? We can answer all your questions. Reply YES for a callback.`,
    'Friendly': `Hey ${firstName}! 👋 It's nVision. Still thinking about ${procedure}? We'd love to chat and help you out. Text back anytime!`,
    'Casual': `${firstName}, quick question - still interested in clearer vision? ${procedure} could be perfect for you. Let's talk! Reply to connect.`
  };
  
  return messages[tone];
}

function regenerateToneVariant(patient, params, tone, originalContent) {
  const base = generateToneVariant(patient, params, tone);
  
  const variations = [
    'Additionally, ',
    'Furthermore, ',
    'Moreover, ',
    'What\'s more, ',
    'Also worth noting: '
  ];
  
  const randomVariation = variations[Math.floor(Math.random() * variations.length)];
  
  return {
    subject: base.subject + ' (Updated)',
    body: base.body.replace('significantly', 'dramatically')
                  .replace('comprehensive', 'thorough')
                  .replace('optimal', 'excellent')
                  .replace('great', 'wonderful')
                  .replace('\n\n', `\n\n${randomVariation}`)
  };
}

function regenerateSMSVariant(patient, params, tone, originalContent) {
  const base = generateSMSVariant(patient, params, tone);
  
  const emojis = ['✨', '💙', '👁️', '⭐'];
  const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
  
  return base.replace('?', `? ${randomEmoji}`)
            .replace('anytime', 'whenever')
            .replace('Ready', 'Excited');
}

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`nVision Demo API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing HTTP server');
  pool.end(() => {
    console.log('Database pool closed');
    process.exit(0);
  });
});
