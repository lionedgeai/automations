# nVision AI Campaign Automation — Demo Plan

**Prepared for:** George (nVision stakeholder)  
**Demo Date:** TBD  
**Prepared by:** Morpheus (Lead Architect)  
**Version:** 1.0  
**Date:** 2026-04-04

---

## Executive Summary

This demo showcases an end-to-end AI-powered healthcare marketing automation platform that extracts patient data, generates personalized campaigns, delivers content across channels, and provides analytics — all without manual intervention.

**Demo Duration:** 15-20 minutes  
**Format:** Live sandbox with pre-seeded realistic data  
**Key Message:** "Watch an AI agent turn patient data into a personalized multi-channel campaign in under 5 minutes"

---

## Demo Capabilities Overview

| # | Capability | Demo Approach | Wow Factor |
|---|------------|---------------|------------|
| 1 | Natural Language Campaign Prompt | Chat-style UX where George types campaign instructions in plain text | ⭐⭐⭐⭐⭐ High |
| 2 | AI Agent Pipeline Visibility | Live agent activity panel showing 3 agents working (Data, Copywriter, Delivery) | ⭐⭐⭐⭐⭐ High |
| 3 | Multiple Tone Variations with Retry | AI generates 5-10 tone variants per message (Medical → Casual spectrum) with regenerate option | ⭐⭐⭐⭐⭐ High |
| 4 | Blended Multi-Channel Cadence | Timeline view mixing Email + SMS across days (Day 1: Email, Day 3: SMS, etc.) | ⭐⭐⭐⭐ High |
| 5 | Automated Daily Summary Reports | System generates morning summary emails after each campaign day | ⭐⭐⭐⭐ High |
| 6 | Reporting & Analytics | Real-time dashboard with live metrics (mock data, real charts) | ⭐⭐⭐⭐ High |
| 7 | Review & Approval Workflow | Interactive approval UI with tone selection and approve/reject actions | ⭐⭐⭐⭐ High |
| 8 | Configurable Campaign Types | Template selector showing 3+ campaign types switching instantly | ⭐⭐⭐ Medium |

**Demo Philosophy:** Real where it impresses (AI content generation, agent pipeline, tone variations, analytics UI), mock where it's operational overhead (Salesforce, SMS delivery).

**George's Pain Point (Frame the Demo):** "I have to use three people — my data Salesforce guy, my marketing guy, someone for SMS cadence and frequency." This demo shows one prompt replacing all three.

---

## Demo Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                         Demo UI (Browser)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Campaign   │  │   Review &   │  │  Analytics   │         │
│  │   Prompt     │  │   Approval   │  │  Dashboard   │         │
│  │ (Chat Style) │  │ + Tone Picker│  │ + Daily Rpt  │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│  ┌──────────────────────────────────────────────────┐         │
│  │   Agent Activity Panel (Live Status Feed)        │         │
│  └──────────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                             │ REST API
┌─────────────────────────────────────────────────────────────────┐
│                        n8n Workflows                            │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ 1. Patient Extraction Workflow                            │ │
│  │    Webhook → Mock Salesforce API → Process → Store        │ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │ 2. Campaign Generation Workflow                           │ │
│  │    Trigger → OpenAI API → Generate Variations → Store     │ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │ 3. Approval Workflow                                      │ │
│  │    Webhook → Update Status → Notify → Schedule           │ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │ 4. Delivery Workflow                                      │ │
│  │    Scheduled → Mock Email/SMS API → Update Metrics        │ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │ 5. Analytics Aggregation Workflow                         │ │
│  │    Cron → Calculate Metrics → Store Results              │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                             │
┌─────────────────────────────────────────────────────────────────┐
│                      PostgreSQL Database                        │
│  • patients (mock Salesforce data)                             │
│  • campaign_templates (LASIK, cataract, wellness)              │
│  • campaigns (generated content)                               │
│  • campaign_recipients (who gets what)                         │
│  • delivery_log (mock sends with timestamps)                   │
│  • analytics_metrics (aggregated performance data)             │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Campaign Creation:**  
   UI → "New Campaign" → Select Template → Select Patient Segment → Trigger Workflow 1 (Extract) → Workflow 2 (Generate) → Review UI

2. **Approval & Delivery:**  
   Review UI → Approve/Edit → Trigger Workflow 3 (Approval) → Schedule → Workflow 4 (Delivery) → Update Metrics

3. **Analytics:**  
   Workflow 5 (Background Cron) → Aggregate Metrics → Dashboard displays real-time data

---

## Mock vs. Real Strategy

### REAL Components (High Demo Value)

| Component | Why Real | Implementation |
|-----------|----------|----------------|
| **AI Content Generation** | Core differentiator — must show actual AI quality | OpenAI GPT-4o API with campaign-specific prompts |
| **Analytics Dashboard** | Visual impact, shows real data processing | Chart.js with live PostgreSQL queries |
| **Workflow Orchestration** | Proves n8n can handle complexity | Real n8n workflows with actual logic |
| **Approval Workflow** | Interactive demo element George will use | Real state machine in PostgreSQL |

### MOCK Components (Operational Overhead)

| Component | Why Mock | Implementation |
|-----------|----------|------------------|
| **Salesforce** | Avoids credential setup, org access, compliance | Mock REST API returning realistic patient JSON from PostgreSQL |
| **Email Delivery (SendGrid/Mailgun)** | No real emails during demo, no spam risk | Mock API + visual "Email Sent" confirmation UI |
| **SMS Delivery (Twilio)** | No real SMS costs, no phone number verification | Mock API + visual "SMS Sent" confirmation UI |
| **Campaign Metrics (opens/clicks)** | Can't generate real engagement in demo timeframe | Pre-seeded mock data + simulated real-time updates |

### Hybrid Approach

**Mock Salesforce API:** Simple Node.js Express server (or n8n HTTP response node) returning patient data from PostgreSQL. Realistic JSON structure matching Salesforce Contact/Lead schema.

**Mock Delivery with Visual Proof:** Instead of "pretending" emails/SMS were sent, show a visual delivery log in the UI with timestamps, recipient names, content preview, and status badges. Feels real without actual sending.

**AI Content Generation:** Use real OpenAI API with constrained prompts. Cache results in PostgreSQL to avoid re-generating during demo (faster, consistent).

---

## Data Requirements

### Mock Patient Data (PostgreSQL `patients` table)

Pre-seed 50 realistic patient records:

```sql
CREATE TABLE patients (
  id SERIAL PRIMARY KEY,
  salesforce_id VARCHAR(18) UNIQUE,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  email VARCHAR(100),
  phone VARCHAR(20),
  procedure_interest VARCHAR(50), -- 'LASIK', 'Cataract', 'Wellness'
  last_visit_date DATE,
  consultation_notes TEXT,
  call_recording_summary TEXT, -- Simulated AI transcription
  engagement_score INT, -- 0-100
  preferred_channel VARCHAR(10), -- 'email' or 'sms'
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Sample Records:**
- **Sarah Mitchell:** High engagement, LASIK interest, detailed consultation notes mentioning night driving concerns
- **Robert Chen:** Cataract patient, prefers SMS, concerned about recovery time
- **Maria Garcia:** Wellness check-up, low engagement, email only
- **David Thompson:** LASIK candidate, spoke about sports/active lifestyle in call notes

**Why This Data:**
- Shows AI can extract key details (night driving, sports, recovery concerns)
- Demonstrates segmentation (procedure type, engagement score, channel preference)
- Realistic enough to convince George it's real Salesforce data

### Campaign Templates

Pre-define 3 campaign types in `campaign_templates` table:

```sql
CREATE TABLE campaign_templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  type VARCHAR(50), -- 'promotional', 'educational', 'nurture'
  target_procedure VARCHAR(50),
  base_prompt TEXT, -- OpenAI prompt template
  email_subject_template TEXT,
  cadence_days VARCHAR(50), -- '0,3,7,14' for multi-touch
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Template 1: Year-End LASIK Promo**
- Type: Promotional
- Target: LASIK-interested patients
- Cadence: Single send (day 0)
- Email subject: "Clear Vision for the New Year — LASIK Special Ends Soon"
- AI prompt: "Generate a promotional email for {first_name} interested in LASIK. Mention their concern about {concern_from_notes}. Include year-end savings offer. Tone: Enthusiastic but medical."

**Template 2: Cataract Education Series**
- Type: Educational
- Target: Cataract patients
- Cadence: 4-part series (days 0, 3, 7, 14)
- Email subjects: "Understanding Cataracts", "Treatment Options", "Recovery Guide", "Patient Success Stories"
- AI prompt: "Generate educational email {part} of 4 for {first_name} about cataract treatment. Address their concern about {concern_from_notes}. Tone: Informative, reassuring."

**Template 3: Premium Lens Options Drip**
- Type: Educational/Nurture
- Target: Cataract patients or premium IOL candidates
- Cadence: 3-part (days 0, 4, 10)
- Email subjects: "Premium Lens Options Explained", "Which Lens is Right for You?", "Patient Stories: Life After Premium IOLs"
- AI prompt: "Generate an educational email for {first_name} about premium intraocular lens options. Mention their specific vision goals from notes: {concern_from_notes}. Tone: Informative, empowering."

### Campaign Scenarios (Pre-Generated for Demo Speed)

To avoid waiting for OpenAI API during demo, **pre-generate 2 complete campaigns** and store in database:

1. **LASIK Promo Campaign (ACTIVE):**
   - 12 recipients (Sarah Mitchell, David Thompson, + 10 others)
   - All content generated, approved, scheduled for "tomorrow"
   - Mock delivery log shows 8 emails sent, 3 opened, 1 clicked (live demo updates this)

2. **Cataract Education Series (IN_REVIEW):**
   - 8 recipients (Robert Chen + 7 others)
   - Content generated for all 4 parts
   - Status: Pending approval (George will approve this live)

### Mock Analytics Data

Pre-populate `analytics_metrics` table with realistic campaign performance:

```sql
CREATE TABLE analytics_metrics (
  id SERIAL PRIMARY KEY,
  campaign_id INT REFERENCES campaigns(id),
  metric_date DATE,
  emails_sent INT DEFAULT 0,
  emails_opened INT DEFAULT 0,
  emails_clicked INT DEFAULT 0,
  sms_sent INT DEFAULT 0,
  sms_replied INT DEFAULT 0,
  conversions INT DEFAULT 0, -- appointments booked
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Sample Metrics for LASIK Campaign:**
- Day 1: 12 sent, 5 opened (41.6%), 2 clicked (16.6%)
- Day 2: 12 sent, 7 opened (58.3%), 3 clicked (25%)
- Day 3: 12 sent, 8 opened (66.6%), 4 clicked (33.3%), 1 conversion

**Why Mock Metrics:** Can't generate real opens/clicks in a demo. Pre-seeded data shows realistic engagement patterns. During live demo, we can simulate a new "open" event to show real-time updates.

---

## Demo Script (Step-by-Step Walkthrough)

**Total Time:** 18 minutes  
**Format:** George watches, occasionally interacts  
**Presenter:** You (or Trinity for technical execution)

### INTRO (2 min)

**Script:**  
"George, you mentioned needing three people to run a campaign — your data Salesforce guy for extraction, your marketing guy for copywriting, and someone to manage SMS cadence and frequency. What you're about to see is how one prompt replaces all three. You'll type something like 'Run a year-end LASIK promo for consultation patients between now and August 31st' — and the AI agents handle data extraction, content generation, and delivery scheduling. Let me show you."

**Screen:** Show the main dashboard (Campaign Overview)

**Note:** George has direct Salesforce access (no IT blocker), and they're bringing in Claude Enterprise. The AI content generation can leverage Claude instead of or alongside OpenAI.

---

### PART 1: Patient Data Extraction (3 min)

**Action:** Click "View Patients" tab

**Screen Shows:**
- Table of 50 patients with columns: Name, Email, Phone, Procedure Interest, Last Visit, Engagement Score
- Search/filter controls (filter by "LASIK" interest)
- Click on "Sarah Mitchell" row → Modal opens with full patient details

**George Sees:**
```
Patient: Sarah Mitchell
Email: sarah.mitchell@email.com
Phone: (555) 123-4567
Procedure Interest: LASIK
Last Visit: 2025-11-15
Engagement Score: 87/100

Consultation Notes:
"Patient expressed strong interest in LASIK. Main concern is night driving glare. Currently wears glasses for distance. Active lifestyle, plays tennis 3x/week. Wants procedure before vacation in March."

Call Recording Summary (AI-Generated):
"Patient called to ask about recovery time. Mentioned upcoming ski trip. Wants to know if she can drive at night immediately after LASIK."
```

**Script:**  
"This is live data from our mock Salesforce. In production, this would be a real API call pulling patient records. Notice the consultation notes and AI-generated call summaries — this is what our AI will use to personalize campaigns."

**Behind the Scenes (Technical):**
- n8n workflow: `patient-extraction-flow`
- Triggered on page load
- Queries PostgreSQL `patients` table
- Returns JSON to UI
- ~500ms response time

---

### PART 2: Campaign Generation with Natural Language Prompt (6 min)

**Action:** Click "New Campaign" button

**Screen Shows:**
- **Natural Language Prompt Interface** (chat/command box):
  - Large text input field with placeholder: "Example: Run a year-end LASIK promo for all consultation patients who haven't converted, running between now and August 31st, with 20% off pricing, payment plans available"
  - "Send" button
  - Helper text: "Describe your campaign in plain language. The AI will extract patient segment, campaign type, date range, and messaging guidelines."

**George Interaction:**
1. Types in the prompt box: "Run a year-end LASIK promo for all consultation patients who haven't converted, running between now and August 31st, pricing $500 off per eye, flexible payment terms"
2. Clicks "Send"

**Screen Shows:**
- **Agent Activity Panel** appears below prompt (live status feed):
  ```
  🔍 Agent 1 (Data Analyst): Parsing campaign request... ✓
  🔍 Agent 1 (Data Analyst): Querying Salesforce for LASIK consults with no conversion... ✓ Found 47 patients
  ✍️ Agent 2 (Copywriter): Generating 5 email tone variations (Medical → Casual)... ✓ Content ready for review
  ✍️ Agent 2 (Copywriter): Creating 3 SMS tone variants... ✓ SMS versions ready
  📅 Agent 3 (Campaign Manager): Building blended email+SMS delivery schedule... ✓ 4-week cadence set (Apr 15 → Aug 31)
  📅 Agent 3 (Campaign Manager): Date-range campaign active: April 15 → August 31, 2026 | 12-touch cadence
  ```

- **Parsed Parameters Panel** appears (showing what the agent understood):
  ```
  Campaign Type: Year-End LASIK Promo
  Target Segment: LASIK consultation patients (no conversion)
  Patient Count: 47 patients
  Date Range: April 15 → August 31, 2026
  Pricing: $500 off per eye
  Terms: Flexible payment plans
  Channels: Email + SMS (blended cadence)
  ```

**Behind the Scenes (Technical):**
- n8n workflow: `campaign-generation-flow`
- Step 1: Query patients matching filters
- Step 2: For each patient, call OpenAI API with prompt:
  ```
  Generate a promotional email for Sarah Mitchell interested in LASIK.
  Her main concern from consultation notes: "night driving glare"
  Include year-end savings offer. Keep under 200 words. Tone: Enthusiastic but medical.
  ```
- Step 3: OpenAI returns personalized email content
- Step 4: Store in `campaigns` and `campaign_recipients` tables
- Step 5: Return campaign ID to UI

**Result Screen:**
- **Tone Variation Selector** showing 5-10 variants per message type:
  
  **Email Tone Spectrum (5 variants shown for Sarah Mitchell):**
  
  | Tone | Preview | Action |
  |------|---------|--------|
  | **Medical/Professional** | "Ms. Mitchell, Our board-certified ophthalmologists have reviewed your LASIK candidacy assessment. Clinical studies demonstrate..." | 🔄 Regenerate |
  | **Informative** | "Hi Sarah, Based on your consultation, you're an excellent LASIK candidate. Let me address your night driving concern..." | 🔄 Regenerate |
  | **Friendly** | "Hi Sarah! Great news about your LASIK consultation. I know night driving was a big concern for you, so let's talk about that..." | ✅ Select |
  | **Casual** | "Hey Sarah! 👋 Remember when we talked about night driving after LASIK? Here's the deal..." | 🔄 Regenerate |
  | **Warm/Conversational** | "Sarah, I wanted to follow up on your consultation. You mentioned playing tennis — imagine no glasses on the court!" | 🔄 Regenerate |

  **SMS Tone Spectrum (3 variants shown):**
  
  | Tone | Preview | Action |
  |------|---------|--------|
  | **Professional** | "Sarah, nVision here. Your LASIK consultation showed great candidacy. $500 off per eye through 8/31. Reply YES for details." | 🔄 Regenerate |
  | **Friendly** | "Hi Sarah! 🎾 Ready for glasses-free tennis? $500 off LASIK per eye through Aug 31. Night driving concerns? We can help! Reply Y" | ✅ Select |
  | **Casual** | "Sarah! LASIK deal: $500 off/eye til 8/31. No more glasses on the court 😎 Text back?" | 🔄 Regenerate |

- **Blended Multi-Channel Cadence Timeline:**
  ```
  Campaign Timeline: April 15 → August 31, 2026 (12-touch cadence)
  
  ┌─────────────────────────────────────────────────────────────┐
  │ Day 1 (Apr 15): 📧 Email - Introduction + Offer            │
  │ Day 3 (Apr 17): 📱 SMS - Quick reminder                     │
  │ Day 5 (Apr 19): 📧 Email - Address concerns (night vision)  │
  │ Day 7 (Apr 21): 📱 SMS - Payment plan details               │
  │ Day 10 (Apr 24): 📧 Email - Patient success stories         │
  │ Day 14 (Apr 28): 📱 SMS - Deadline reminder (Aug 31)        │
  │ Day 21 (May 5): 📧 Email - FAQ + testimonials               │
  │ Day 30 (May 14): 🔊 Voice Call 🔜 (Coming Soon)            │
  └─────────────────────────────────────────────────────────────┘
  ```

**Script:**  
"Look at this — the AI just generated 5 tone variations for each message, from medical-professional to casual. Just like ChatGPT gives you 10 different versions to pick from. Sarah's email can be warm and mention her tennis hobby, or it can be clinical. You choose. And if you don't like a variant, click 'Regenerate' and it'll try again instantly.

Notice the blended cadence — Day 1 is an email, Day 3 is an SMS, Day 5 back to email, and so on. We mix channels throughout the campaign. And see Day 30? Voice agent calls — that's coming soon, but the platform is built to support it."

**Wow Moment:** George sees the tone spectrum (Medical → Casual) with instant regeneration. This is the ChatGPT-style flexibility he described.

---

### PART 3: Review & Approval Workflow with Tone Selection (3 min)

**Action:** Click "Campaigns" tab → Select "Premium Lens Options Drip (IN_REVIEW)"

**Screen Shows:**
- Campaign status: ⏳ Pending Approval
- **Selected tone variants** for review (George's picks from tone spectrum shown earlier)
- Blended cadence timeline showing Email + SMS mix across 3-part series
- Recipient list (8 patients)
- Approval actions: ✏️ Edit, 🔄 Change Tone, ✅ Approve, ❌ Reject

**George Interaction:**
1. Click "Preview" on Email 1 (Robert Chen) — sees "Friendly" tone variant selected
2. See personalized content mentioning recovery time concerns
3. Click 🔄 Change Tone → Tone picker modal appears showing the 5 variants again
4. Select "Informative" tone instead → Preview updates
5. Click ✅ Approve Campaign button

**Screen Shows:**
- Confirmation modal: "This will schedule a blended email + SMS campaign (8 patients × 3 parts × 2 channels = 48 touches) running April 15 → August 31. Continue?"
- Click "Confirm"
- Status changes to: ✅ Approved — Campaign Active: April 15 → August 31, 2026

**Behind the Scenes (Technical):**
- n8n workflow: `approval-workflow`
- Updates `campaigns` table: status = 'approved', date_range_start = '2026-04-15', date_range_end = '2026-08-31'
- Triggers `delivery-workflow` with blended channel schedule
- Sends notification (mock email to George's dashboard)

**Script:**  
"You just approved a multi-channel, date-ranged campaign. The system handles the blended cadence — email, SMS, email, SMS — across the date range you specified (April 15 to August 31). And if you change your mind on the tone, you can swap variants right here before approval."

---

### PART 4: Automated Delivery with Daily Summary Reports (3 min)

**Action:** Switch to "Delivery Log" tab

**Screen Shows:**
- Real-time table of sent messages showing **blended Email + SMS sends**:
  - Timestamp, Recipient Name, Campaign, Channel (📧 Email / 📱 SMS), Status (Sent ✓, Failed ✗)
  - Content preview (first 50 chars)
  - Delivery confirmation (mock tracking ID)

**George Sees:**
```
| Day | Time     | Recipient        | Campaign           | Channel | Status | Preview                    |
|-----|----------|------------------|--------------------|---------|--------|----------------------------|
| 1   | 09:04 AM | Sarah Mitchell   | LASIK Promo        | 📧 Email| Sent ✓ | "Hi Sarah, Clear vision..." |
| 3   | 09:04 AM | Sarah Mitchell   | LASIK Promo        | 📱 SMS  | Sent ✓ | "Sarah, year-end LASIK..." |
| 5   | 09:03 AM | Sarah Mitchell   | LASIK Promo        | 📧 Email| Sent ✓ | "Sarah, remember we tal..." |
| 1   | 09:02 AM | David Thompson   | LASIK Promo        | 📧 Email| Sent ✓ | "David, ready to get ba..." |
| 3   | 09:02 AM | David Thompson   | LASIK Promo        | 📱 SMS  | Sent ✓ | "David, no more glasses..." |
```

**New Feature: Automated Daily Summary Reports**

**Action:** Click "Daily Summaries" tab

**Screen Shows:**
- List of automated morning reports sent to George each day:

**Sample Daily Summary (Day 3 of LASIK Summer Promo):**
```
📊 Daily Summary — LASIK Summer Promo (Day 3)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Today: 12 SMS sent | 8 delivered | 3 replies
Overall: 47 emails + 12 SMS sent | 31 opened (66%) | 8 clicked (17%) | 2 consultations booked

Top Performer: Sarah Mitchell (opened email, clicked CTA, booked consultation)
Needs Follow-Up: 15 patients haven't opened email yet

Tomorrow: Follow-up email to 15 non-openers scheduled for 9 AM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Script:**  
"This is the blended delivery log — email, SMS, email, SMS across the campaign timeline. And every morning, the system automatically generates a summary report like this one. It tells you what happened yesterday, overall campaign performance, who's engaged, who needs follow-up, and what's scheduled for tomorrow. George, you described this exact workflow: 'follows up with reports, creates a summary, and then next day, same thing.' This is it."

**Simulation (Optional):** Click "Simulate Day 4 Summary" button → A new report appears showing next day's automated summary.

**Behind the Scenes (Technical):**
- n8n workflow: `delivery-workflow`
- Triggered by cron (or manual for demo)
- Queries `campaign_recipients` where status = 'scheduled' and scheduled_time <= NOW()
- Calls mock email/SMS API (HTTP Response node returning 200 OK)
- Inserts record into `delivery_log` table
- Updates `campaign_recipients` status = 'sent'

---

### PART 5: Reporting & Analytics (3 min)

**Action:** Click "Analytics Dashboard" tab

**Screen Shows:**
- Campaign performance cards:
  - **LASIK Promo:** 12 sent, 8 opened (66.6%), 4 clicked (33.3%), 1 conversion
  - **Cataract Series:** 32 scheduled, 0 sent (starts tomorrow)
- Line chart: "Opens Over Time" (last 7 days)
- Bar chart: "Campaign Comparison" (email vs. SMS performance)
- Table: "Top Performing Content" (which email variations got highest engagement)

**George Interaction:**
1. Hover over line chart → Tooltip shows daily opens
2. Click "LASIK Promo" card → Drill-down view with individual recipient engagement

**Drill-Down Screen:**
```
| Recipient        | Email Opened | Clicked | SMS Replied | Status        |
|------------------|--------------|---------|-------------|---------------|
| Sarah Mitchell   | ✓ Yes        | ✓ Yes   | No          | 🎯 Converted  |
| David Thompson   | ✓ Yes        | No      | ✓ Yes       | ⏳ Engaged    |
| Maria Garcia     | ✓ Yes        | No      | No          | 👁️ Viewed    |
| John Davis       | No           | No      | No          | 📭 Not Opened |
```

**Script:**  
"Here's the campaign performance dashboard. You can see overall metrics, drill down to individual recipients, and compare channels. Sarah opened the email, clicked the CTA, and booked a consultation — that's a full conversion. David replied to the SMS but didn't click the email. This data helps you optimize future campaigns."

**Behind the Scenes (Technical):**
- n8n workflow: `analytics-aggregation-flow` (runs every 5 minutes via cron)
- Queries `delivery_log` and `analytics_metrics` tables
- Aggregates counts (GROUP BY campaign_id, metric_date)
- UI fetches aggregated data via REST API
- Charts rendered with Chart.js

**Wow Moment:** George sees professional analytics dashboard that looks like a real SaaS product.

---

### PART 6: Configurable Campaign Types (1 min)

**Action:** Return to Campaign Prompt interface → Show example prompts for different campaign types

**Screen Shows:**
- Example prompts demonstrating flexibility:
  - **Year-End LASIK Promo:** "Run a year-end LASIK promo for all consultation patients who haven't converted, running between now and August 31st, pricing $500 off per eye, payment plans available"
  - **Cataract Education:** "Create a cataract education email series for patients over 60 who mentioned vision concerns in their last visit, informative tone, 4-part series over 2 weeks"
  - **Premium Lens Options Drip:** "Send a premium lens options drip campaign to cataract surgery candidates, explaining trifocal vs monofocal IOLs, running through summer, professional but empowering tone"

**Script:**  
"This natural language prompt interface handles any campaign type you can describe. Year-end promos, educational series, premium lens drip campaigns — you type what you want, the AI agents figure out the rest. No rebuilding workflows, no IT tickets. You're not locked into templates."

**Behind the Scenes (Technical):**
- Templates stored in `campaign_templates` table
- UI reads template config and dynamically updates form
- Same `campaign-generation-flow` workflow handles all types (reads template config from database)

---

### CLOSING (1 min)

**Script:**  
"George, what took three people — your Salesforce data guy, your copywriter, and your delivery scheduler — plus multiple rounds of revisions and weeks of back-and-forth… you just did in under 5 minutes with a single prompt. You typed what you wanted, watched the three AI agents work (data extraction, content generation, delivery scheduling), picked your tone, and approved it. Tomorrow morning, you'll get an automated summary report. That's the vision for nVision's marketing automation platform."

**George's Takeaway:**  
"This actually replaces my three-person workflow. The AI content quality is impressive, the tone flexibility is exactly what I need, and the blended email-SMS cadence is what we've been trying to build manually."

---

## What to Build (Concrete Implementation List)

### 1. n8n Workflows (5 workflows)

| Workflow Name | Trigger | Key Nodes | Output |
|---------------|---------|-----------|--------|
| `prompt-parser-flow` | Webhook (POST /api/campaigns/prompt) | NLP parsing (extract intent, segments, dates, pricing) → Update agent activity panel | Parsed parameters JSON |
| `patient-extraction-flow` | Called by prompt-parser | PostgreSQL query based on parsed segment → Update agent activity | Patient list JSON |
| `campaign-generation-flow` | Webhook (POST /api/campaigns/generate) | Loop patients → OpenAI/Claude API (generate 5-10 tone variants per message) → Store variants | Campaign ID + tone variants |
| `approval-workflow` | Webhook (POST /api/campaigns/:id/approve) | Update status → Schedule blended email+SMS delivery → Notify | Confirmation JSON |
| `delivery-workflow` | Cron (every 5 min) OR manual trigger | Query scheduled (both email & SMS) → Mock API calls → Update log → Trigger daily summary if end-of-day | Delivery confirmations |
| `daily-summary-flow` | Cron (daily at 7 AM) OR triggered by delivery-workflow | Aggregate previous day metrics → Generate summary report → Send to dashboard | Daily summary report |
| `analytics-aggregation-flow` | Cron (every 5 min) | Query logs → Aggregate metrics (email + SMS combined) → Store | Updated metrics |

**Complexity Assessment:**
- ⭐⭐⭐ Medium-High: prompt-parser-flow (NLP parsing or simple regex extraction)
- ⭐ Easy: patient-extraction-flow (simple SQL query)
- ⭐⭐⭐⭐ High: campaign-generation-flow (OpenAI/Claude API loop generating 5-10 variants per patient per message type)
- ⭐⭐ Medium: approval-workflow (state updates + blended channel scheduling)
- ⭐⭐⭐ Medium-High: delivery-workflow (cron + dual channel mock APIs + daily summary trigger)
- ⭐⭐ Medium: daily-summary-flow (aggregate + format report)
- ⭐⭐ Medium: analytics-aggregation-flow (SQL aggregations across channels)

### 2. PostgreSQL Schema (6 tables)

```sql
-- Core tables
patients (id, salesforce_id, first_name, last_name, email, phone, procedure_interest, 
          last_visit_date, consultation_notes, call_recording_summary, engagement_score, 
          preferred_channel, created_at)

campaign_templates (id, name, type, target_procedure, base_prompt, email_subject_template, 
                    cadence_config, created_at)
-- cadence_config now stores blended channel timeline: JSON like [{"day": 1, "channel": "email"}, {"day": 3, "channel": "sms"}, ...]

campaigns (id, template_id, name, status, date_range_start, date_range_end, 
           parsed_prompt_params, created_at, updated_at)
-- Added date_range_start/end, parsed_prompt_params (JSON storing extracted campaign parameters)

campaign_content_variants (id, campaign_id, patient_id, message_type, tone_label, 
                            content, is_selected, created_at)
-- NEW: Stores 5-10 tone variants per patient per message type (email/sms)

campaign_recipients (id, campaign_id, patient_id, selected_email_variant_id, selected_sms_variant_id,
                     scheduled_time, status, created_at)
-- Links to selected tone variants

delivery_log (id, campaign_recipient_id, channel, sent_at, tracking_id, status)

daily_summary_reports (id, campaign_id, report_date, summary_text, created_at)
-- NEW: Stores generated daily summaries

analytics_metrics (id, campaign_id, metric_date, emails_sent, emails_opened, emails_clicked, 
                   sms_sent, sms_replied, conversions, created_at)

agent_activity_log (id, campaign_id, agent_name, activity_message, status, created_at)
-- NEW: Stores agent activity for live feed (e.g., "Querying Salesforce... ✓ Found 47 patients")
```

**Seed Data:**
- 50 patients (mix of LASIK, cataract, premium lens interests)
- 3 campaign templates with blended cadence configs
- 2 pre-generated campaigns with tone variants (1 active, 1 pending approval)
- Mock tone variants (5-10 per patient per message type) for pre-generated campaigns
- Mock delivery logs (email + SMS mixed) and analytics for active campaign
- Mock daily summary reports for past 3 days of active campaign
- Mock agent activity logs showing 3-agent pipeline

**Complexity Assessment:** ⭐⭐⭐ Medium-High (expanded schema with variants and agent logs, larger seed data set)

### 3. UI Screens (Single-Page App)

**Technology:** Upgrade from vanilla HTML to **React** (justified for demo complexity).

| Screen/Component | Features | Complexity |
|------------------|----------|------------|
| **Dashboard (Home)** | Campaign summary cards, quick stats | ⭐ Easy |
| **Patients View** | Table with search/filter, patient detail modal | ⭐⭐ Medium |
| **Campaign Prompt (Builder)** | Natural language text input, agent activity live feed, parsed parameters panel | ⭐⭐⭐⭐ High |
| **Tone Variation Selector** | 5-10 tone variants per message (Medical → Casual spectrum), regenerate buttons, select/preview | ⭐⭐⭐⭐ High |
| **Blended Cadence Timeline** | Visual timeline showing Email + SMS mixed across days, voice call coming-soon indicator | ⭐⭐⭐ Medium-High |
| **Campaign Review** | Tone variant preview, tone picker modal, approve/reject buttons | ⭐⭐⭐⭐ High |
| **Delivery Log** | Real-time table with Email + SMS rows, pagination, status badges | ⭐⭐⭐ Medium-High |
| **Daily Summary Reports** | List of automated morning reports, formatted summaries | ⭐⭐ Medium |
| **Analytics Dashboard** | Chart.js charts (email + SMS combined), campaign drill-down | ⭐⭐⭐ Medium-High |

**UI Stack:**
- React 18 (component reusability)
- Tailwind CSS (rapid styling)
- Chart.js (analytics charts)
- React Router (multi-page navigation)
- Fetch API (n8n webhook calls)

**Build Time Estimate:** 4-5 days (Trinity or Tank) — increased due to prompt interface, tone variants UI, agent activity panel, blended timeline, daily summaries

### 4. Mock APIs (Optional — Can Use n8n HTTP Response Nodes)

If not using n8n HTTP Response nodes, create lightweight Express server:

- `GET /mock-salesforce/contacts` → Returns patient JSON
- `POST /mock-email/send` → Returns `{ success: true, tracking_id: '...' }`
- `POST /mock-sms/send` → Returns `{ success: true, message_sid: '...' }`

**Complexity Assessment:** ⭐ Easy (20 lines of Express code each)

### 5. Data Fixtures (SQL Seed Script)

**File:** `customers/nvision/poc/scripts/seed-demo-data.sql`

**Contents:**
- 50 patient records with realistic names, emails, consultation notes
- 3 campaign templates with AI prompts
- 2 pre-generated campaigns with content
- Mock delivery logs for 1 campaign
- Mock analytics metrics

**Complexity Assessment:** ⭐ Easy (SQL INSERT statements)

---

## Risk & Complexity Assessment

### 🟢 Low Risk (Easy to Deliver)

1. **Patient Data Extraction:** Simple PostgreSQL query, minimal logic
2. **Mock Salesforce API:** Can use n8n HTTP Response node, no external dependencies
3. **Campaign Templates:** Static data in database
4. **UI Dashboard:** Standard React components

**Success Probability:** 95%

### 🟡 Medium Risk (Requires Testing)

1. **OpenAI API Integration:** Dependent on API reliability, needs error handling for rate limits
2. **Campaign Generation Loop:** Processing 12 patients × OpenAI calls = ~30 seconds, need loading UX
3. **Analytics Charts:** Chart.js learning curve, data formatting edge cases
4. **Approval Workflow State Machine:** Need to handle edge cases (re-approval, cancellation)

**Mitigation:**
- Cache OpenAI responses for demo (pre-generate content, store in DB)
- Add loading states with progress indicators
- Use Chart.js starter templates
- Simplify state machine to 3 states: draft, approved, sent

**Success Probability:** 85%

### 🔴 High Risk (Could Derail Demo)

1. **Live OpenAI/Claude API Calls During Demo:** What if API is slow/down/rate-limited, especially for generating 5-10 tone variants per patient?
   - **Mitigation:** Pre-generate all campaign content and tone variants, store in DB. During demo, "generate" button fetches from cache (~instant). "Regenerate" button also pulls from pre-cached pool. Optionally show 1 real API call with loading state for wow factor.

2. **Natural Language Prompt Parsing Fails:** What if George types something unexpected and the parser can't extract parameters?
   - **Mitigation:** Use simple regex patterns for demo (match keywords like "LASIK", "promo", date patterns). Pre-script 3-4 example prompts that are guaranteed to work. Have fallback: "I didn't understand that, here are example prompts."

3. **Tone Variations All Sound Similar:** OpenAI/Claude generates 5 variants but they're not different enough
   - **Mitigation:** Pre-generate tone variants carefully with strong tone modifiers in prompts. QA review all 5 tones for each patient during setup. Use temperature=1.0 for more diversity. Pre-cache high-quality variants.

4. **Real-Time Agent Activity Panel:** Simulating 3 agents working in real-time
   - **Mitigation:** Pre-script agent activity log entries with realistic timestamps. Insert into database with ~2-second delays between each step. Looks real, controlled timing.

5. **Complex Multi-Step Workflow Coordination:** 7 workflows now (added prompt-parser, campaign-manager, daily-summary)
   - **Mitigation:** Build workflows incrementally, test each independently before integration. Create end-to-end test script that runs full demo flow. Have backup: pre-generated campaigns ready to show.

**Success Probability:** 65% (with mitigations → 85%)

### What Could Go Wrong in Live Demo?

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| OpenAI/Claude API timeout (tone variants) | Medium | High | Pre-generate all tone variants, cache in DB, pull from pool |
| Prompt parsing fails on unexpected input | Medium | High | Pre-script 3-4 guaranteed prompts, use simple regex, have fallback message |
| Tone variations sound too similar | Medium | High | QA review all variants during setup, use high temperature, pre-cache quality |
| Agent activity panel timing off | Low | Medium | Pre-script activity log with realistic delays, insert with controlled timing |
| Docker/n8n not starting | Low | Critical | Test setup script on clean machine, have backup demo video |
| UI bug/crash (complex tone picker) | Medium | High | QA test tone selection flows, have restart plan, pre-load all data |
| Database query slow (tone variants = 5-10x data) | Medium | Medium | Index key columns, test with 500+ variant records, optimize joins |
| George asks "can I see real Salesforce?" | High | Medium | "This is mock data for demo security, but you have direct Salesforce access (no IT blocker), here's the integration architecture" |
| George asks about Meta Ads or fax processing | Low | Low | "Meta Ads would be second phase, you mentioned being okay there. Fax processing is a different project." |

**Overall Demo Risk:** 🟡 Medium-High (with mitigations → 🟡 Medium)

---

## Success Criteria

### George Will Be Impressed If:

1. ✅ **Natural language prompt feels magical** — Types campaign in plain English, AI understands and executes
2. ✅ **Agent pipeline is visible** — Sees the 3 agents working (data, copywriter, delivery) replacing his 3-person team
3. ✅ **Tone variations are high-quality** — 5-10 options like ChatGPT, Medical → Casual spectrum, instant regeneration
4. ✅ **Blended cadence makes sense** — Email, SMS, email, SMS across days with voice call teased
5. ✅ **Daily summaries are actionable** — Morning reports showing what happened, what's next
6. ✅ **Demo flows smoothly without crashes** — No "oops, let me restart that"
7. ✅ **UI looks professional** — Not a toy, looks like a real product
8. ✅ **End-to-end story is clear** — "This replaced my three-person workflow"

### George Will Be Skeptical If:

1. ❌ Prompt parsing fails or feels gimmicky (can't handle variations)
2. ❌ Tone variations all sound the same (not truly different tones)
3. ❌ Agent pipeline feels fake (just loading spinners, not real activity)
4. ❌ Blended cadence is confusing or doesn't make sense
5. ❌ UI is clunky or slow
6. ❌ "Mock" feels too fake (no delivery confirmation, no analytics)

**Critical Path:** Focus 80% effort on:
1. Natural language prompt interface (must feel natural)
2. Tone variation quality (5-10 truly different variants, high quality)
3. Agent activity panel (must show real work happening)
4. Blended timeline UX (intuitive visualization)
5. Daily summary format (actionable, not just numbers)

---

## Build Roadmap (Recommended Order)

### Phase 1: Foundation (Day 1-2)
1. PostgreSQL schema + seed data (expanded for tone variants, agent logs, daily summaries)
2. n8n workflow: patient-extraction-flow
3. Basic React UI with Patients View

**Checkpoint:** Can view 50 patients in UI from database

### Phase 2: Natural Language Prompt & Agent Pipeline (Day 3-5)
1. n8n workflow: prompt-parser-flow (extract campaign parameters from natural language)
2. UI: Campaign Prompt interface (chat-style input box)
3. UI: Agent Activity Panel (live feed showing 3 agents working)
4. UI: Parsed Parameters Panel (shows what AI understood)
5. n8n workflow: campaign-generation-flow (OpenAI/Claude integration with 5-10 tone variants)
6. Pre-generate 2 campaigns with tone variants and store in DB

**Checkpoint:** Can type natural language prompt, see agents work, see parsed parameters

### Phase 3: Tone Variations & Blended Cadence (Day 6-8)
1. UI: Tone Variation Selector (5-10 variants per message, Medical → Casual spectrum, regenerate buttons)
2. UI: Blended Cadence Timeline (visual timeline mixing Email + SMS, voice call coming-soon)
3. UI: Campaign Review screen with tone picker
4. n8n workflow: campaign-manager-flow (builds blended email+SMS schedule)
5. n8n workflow: approval-workflow (handles date-range campaigns)

**Checkpoint:** Can select tone variants, see blended timeline, approve campaign

### Phase 4: Delivery & Daily Summaries (Day 9-11)
1. n8n workflow: delivery-workflow (blended email + SMS sends, triggers daily summary)
2. n8n workflow: daily-summary-flow (aggregates metrics, generates morning reports)
3. UI: Delivery Log screen (email + SMS mixed)
4. UI: Daily Summary Reports tab
5. n8n workflow: analytics-aggregation-flow (email + SMS combined metrics)
6. UI: Analytics Dashboard with Chart.js

**Checkpoint:** Can see blended delivery log, daily summaries, analytics charts

### Phase 5: Polish & Testing (Day 12-13)
1. UI styling (Tailwind CSS polish)
2. Loading states and error handling
3. Demo script testing (run full flow 3x)
4. Edge case handling (empty states, failed API calls)
5. Demo data validation (realistic names, notes, tone variants)

**Checkpoint:** Full demo runs end-to-end without errors

### Phase 6: Backup Plan (Day 14)
1. Record demo video (fallback if live demo fails)
2. Create printed handout (architecture diagram + screenshots)
3. Prepare Q&A talking points (Salesforce integration, Claude Enterprise, pricing, timeline)

**Total Build Time:** 12-14 days (1 full-time developer) — increased from original 8-10 days due to prompt interface, tone variants, agent pipeline, blended cadence, and daily summaries

---

## Technical Notes

### OpenAI API Prompts (Examples)

**LASIK Promotional Email:**
```
You are a healthcare marketing assistant for nVision Eye Center.

Generate a promotional email for a patient named {first_name} {last_name}.

Patient Context:
- Procedure Interest: LASIK
- Consultation Notes: {consultation_notes}
- Main Concern: {extracted_concern}

Campaign Details:
- Offer: Year-end LASIK savings (up to $500 off per eye)
- Call to Action: Schedule a free consultation
- Deadline: December 31, 2026

Instructions:
- Address the patient's specific concern from their notes
- Keep email under 200 words
- Tone: Enthusiastic but professional, medical credibility
- Include clear CTA button text
- Personalize based on their lifestyle mentions (if any)

Output format: Plain text email body only (no subject line, no HTML).
```

**Expected Output:**
```
Hi Sarah,

We noticed you're interested in LASIK and had questions about night driving after the procedure. Great news: modern LASIK techniques significantly reduce glare and halos, and most patients report improved night vision within weeks.

As someone who plays tennis regularly, you'll love the freedom of glasses-free vision on the court! And right now, we're offering year-end savings of up to $500 off per eye for procedures scheduled before December 31st.

Let's address your night driving concerns in a free consultation. Our team can show you real patient outcomes and answer all your questions.

Schedule your free consultation today: [Book Now]

Looking forward to helping you achieve clear vision for the new year!

Best regards,
nVision Eye Center Team
```

### n8n Workflow Snippets (Pseudocode)

**prompt-parser-flow:**
```
1. Webhook Trigger (POST /api/campaigns/prompt)
   Input: { prompt_text: "Run a year-end LASIK promo for all consultation patients..." }

2. Agent Activity Log Insert: "Agent 1 (Data Analyst): Parsing campaign request..."

3. Function Node: Extract parameters from natural language
   - Campaign type (keywords: "promo", "education", "drip")
   - Target segment (keywords: "LASIK consults", "cataract patients", "no conversion")
   - Date range (extract "between now and August 31st" → start_date, end_date)
   - Pricing/terms (extract "$500 off", "payment plans")
   - Can use simple regex or call OpenAI for structured extraction

4. Agent Activity Log Update: "✓ Parsed campaign parameters"

5. Call patient-extraction-flow with extracted segment parameters

6. Respond to Webhook
   Return: { parsed_params: {...}, patient_count: 47, agent_activity: [...] }
```

**campaign-generation-flow (updated for tone variants):**
```
1. Webhook Trigger (POST /api/campaigns/generate)
   Input: { campaign_id, parsed_params }

2. Agent Activity Log Insert: "Agent 2 (Copywriter): Generating tone variations..."

3. PostgreSQL Node: Fetch campaign details and patients

4. Loop Node: For each patient
   a. Function Node: Build base OpenAI prompt
   
   b. Loop Node: Generate 5 tone variants (Medical, Informative, Friendly, Casual, Warm)
      - HTTP Request Node: Call OpenAI/Claude API with tone modifier
        POST https://api.openai.com/v1/chat/completions
        Prompt: "Generate email for Sarah, tone: {tone_label}, ..."
      
      - PostgreSQL Node: Store variant
        INSERT INTO campaign_content_variants (campaign_id, patient_id, message_type, tone_label, content, ...)
   
   c. Repeat for SMS (generate 3 tone variants)

5. Agent Activity Log Update: "✓ 5 email variations ready | ✓ 3 SMS variants ready"

6. Call campaign-manager-flow to build blended cadence

7. Respond to Webhook
   Return: { success: true, campaign_id, tone_variants: [...] }
```

**campaign-manager-flow (NEW for blended cadence):**
```
1. Triggered by campaign-generation-flow

2. Agent Activity Log Insert: "Agent 3 (Campaign Manager): Building delivery schedule..."

3. Function Node: Build blended email+SMS timeline based on date range
   - Parse date_range_start → date_range_end
   - Generate cadence: [Day 1: Email, Day 3: SMS, Day 5: Email, Day 7: SMS, ...]

4. PostgreSQL Node: Store cadence config in campaigns table

5. Agent Activity Log Update: "✓ 4-week cadence set (Apr 15 → Aug 31)"
```

**delivery-workflow (Cron - updated for blended channels):**
```
1. Cron Trigger (every 5 minutes)

2. PostgreSQL Node: Fetch scheduled sends (both email and SMS based on blended cadence)
   SELECT cr.*, cv_email.content AS email_content, cv_sms.content AS sms_content
   FROM campaign_recipients cr
   JOIN campaign_content_variants cv_email ON cr.selected_email_variant_id = cv_email.id
   JOIN campaign_content_variants cv_sms ON cr.selected_sms_variant_id = cv_sms.id
   WHERE cr.status = 'scheduled' AND cr.scheduled_time <= NOW()
   LIMIT 10

3. Loop Node: For each recipient
   a. Function Node: Determine channel for this send (based on cadence day)
   
   b. IF email day:
      - HTTP Request Node: Mock email API
        POST https://mock-email-api/send
      - PostgreSQL Node: Log delivery (channel = 'email')
   
   c. IF sms day:
      - HTTP Request Node: Mock SMS API
        POST https://mock-sms-api/send
      - PostgreSQL Node: Log delivery (channel = 'sms')
   
   d. PostgreSQL Node: Update recipient status

4. PostgreSQL Node: Update campaign metrics (email + SMS combined)

5. Function Node: Check if end of day → If yes, trigger daily-summary-flow
```

**daily-summary-flow (NEW):**
```
1. Cron Trigger (daily at 7 AM) OR called by delivery-workflow

2. PostgreSQL Node: Aggregate previous day's metrics
   SELECT campaign_id, 
          SUM(CASE WHEN channel = 'email' THEN 1 ELSE 0 END) AS emails_sent,
          SUM(CASE WHEN channel = 'sms' THEN 1 ELSE 0 END) AS sms_sent,
          ... (opens, clicks, replies, conversions)
   FROM delivery_log
   WHERE DATE(sent_at) = CURRENT_DATE - 1
   GROUP BY campaign_id

3. Function Node: Format summary report
   Template: 
   "📊 Daily Summary — {campaign_name} (Day {day_number})
    Today: {sms_sent} SMS sent | {delivered} delivered | {replies} replies
    Overall: {total_emails} emails + {total_sms} SMS sent | {opens} opened ({pct}%) | {clicks} clicked | {conversions} booked
    Tomorrow: {next_action}"

4. PostgreSQL Node: Store summary
   INSERT INTO daily_summary_reports (campaign_id, report_date, summary_text, ...)

5. HTTP Request Node: Send notification to dashboard (mock email to George)
```

---

## Alternative Approaches Considered

### Rejected: Real Salesforce Integration

**Why Considered:** Maximum realism, proves integration works  
**Why Rejected:**
- Requires Salesforce org access (nVision might not grant sandbox access)
- OAuth setup complexity, credential management
- Compliance risk (real patient data in demo)
- Can break if API rate limits hit during demo

**Decision:** Mock Salesforce with realistic JSON responses from PostgreSQL. Functionally identical from n8n perspective.

---

### Rejected: Real Email Delivery (SendGrid/Mailgun)

**Why Considered:** Truly end-to-end, shows real integration  
**Why Rejected:**
- Need verified sender domain (demo@nvision.com)
- Risk of spam filtering, deliverability issues
- Can't show "immediate" results (opens/clicks take time)
- Costs money per send

**Decision:** Mock delivery with visual confirmation UI. Shows tracking IDs, timestamps, status — feels real without actual sending.

---

### Rejected: Simplified Single Workflow

**Why Considered:** Easier to build, fewer moving parts  
**Why Rejected:**
- Doesn't demonstrate n8n's orchestration capabilities
- Less impressive (looks like a simple script)
- Misses opportunity to show approval workflow, scheduled delivery, analytics aggregation

**Decision:** Build 5 separate workflows that work together. Shows n8n's strength as an orchestration platform.

---

### Accepted: Pre-Generate Campaign Content (Cache OpenAI Responses)

**Why:** Mitigates live API risk, ensures consistent demo quality  
**Implementation:** Run campaign generation once during setup, store results in DB. "Generate" button fetches cached content instantly.  
**Trade-off:** Less impressive (no live AI call) but more reliable. Optional: Show 1 live OpenAI call if internet is reliable.

**Decision:** Default to cached, optionally enable live calls for "wow factor" if confident.

---

## Q&A Prep (Anticipated George Questions)

**Q: "How does this connect to my real Salesforce?"**  
A: The n8n Salesforce node uses OAuth 2.0 and can query Contacts, Leads, or custom objects. We're showing mock data for demo security, but here's the architecture diagram showing the real integration.

**Q: "Can I customize the AI prompts?"**  
A: Yes, each campaign template has an editable prompt. You can adjust tone, length, and personalization variables through the UI.

**Q: "What if the AI generates something wrong or inappropriate?"**  
A: That's why we have the approval workflow. Every campaign goes through human review before sending. You can edit any content before approval.

**Q: "How much does this cost per campaign?"**  
A: OpenAI API costs ~$0.01 per email generated (GPT-4o pricing). For a 100-patient campaign, that's ~$1 in AI costs. Email delivery (SendGrid) is ~$0.001 per email. Total: ~$1-2 per campaign.

**Q: "Can I A/B test different email variations?"**  
A: Not in this POC, but we can add that. The AI already generates 5-10 tone variations per message — we'd just need to randomize sends across the tone spectrum and track performance by tone. You'd see which tone (Medical vs. Casual) converts best for LASIK vs. Cataract patients.

**Q: "Can you use Claude instead of OpenAI?"**  
A: Absolutely. We can integrate with Claude Enterprise (which you mentioned bringing in), Azure OpenAI, or any LLM API. The n8n workflows are model-agnostic — we just swap the API endpoint and prompt format.

**Q: "What about HIPAA compliance?"**  
A: Great question. For production, we'd need BAA (Business Associate Agreement) with OpenAI, encrypted data storage, audit logs, and access controls. This POC is for functional validation only — not production-ready for PHI.

**Q: "Can I use my own email templates instead of AI?"**  
A: Yes. Campaign templates can be pure template-based (no AI) or hybrid (AI fills in template variables). Fully flexible.

**Q: "How long to deploy this to production?"**  
A: Assuming real Salesforce/Twilio credentials ready, 2-3 weeks for production hardening (auth, security, monitoring, error handling, HIPAA compliance). This POC validates the core concept works.

---

## Conclusion

This demo plan balances **impressive realism** (natural language prompts, visible agent pipeline, tone variation spectrum, blended cadence, daily summaries, real AI content generation, professional UI) with **practical delivery** (mock APIs, pre-seeded data, cached responses). 

**Key Success Factors:**
1. **Natural language prompt feels magical** — George types what he wants, AI extracts and executes
2. **Agent pipeline visibility** — George sees the 3 agents (Data, Copywriter, Delivery) replacing his 3-person team
3. **Tone variation quality** — 5-10 truly different tones (Medical → Casual), high-quality content
4. **Blended cadence UX** — Intuitive timeline showing Email + SMS mixed across days
5. **Daily summaries are actionable** — Morning reports George actually wants to read
6. **UI polish** — Looks like a real product, not a prototype
7. **Smooth execution** — No crashes, fast load times

**Recommended Build Time:** 12-14 days (1 developer) — increased from original estimate  
**Demo Confidence Level:** 🟡 Medium-High (with mitigations → 🟢 High)

George will walk away thinking: *"This actually replaces my three-person workflow. I can type what I want and it just happens. The tone options are exactly what I need."*

---

## Out of Scope (George's Explicit Guidance)

**Meta Ads Integration:**  
George said: "That would probably be second phase, we're okay there."  
**Action:** Do NOT include Meta Ads in this demo. Focus on email + SMS only. Voice call teased as coming soon.

**Fax/Referral Processing:**  
George said: "That's a different project."  
**Action:** Do NOT include fax or referral processing workflows in this demo.

**Claude Enterprise Note:**  
George mentioned bringing in Claude Enterprise. The AI content generation architecture should support Claude API as an alternative to OpenAI. Note this in Q&A prep and technical documentation.

---

**Next Steps:**
1. Review this plan with Shay (align on priorities, confirm George's transcript insights)
2. Assign build tasks (Trinity for workflows, Tank for UI)
3. Set demo date (allow 14 days build + 2 days buffer)
4. Schedule dry-run demo (test full flow 48 hours before real demo)
5. Prepare 3-4 example prompts that are guaranteed to parse correctly
6. QA review all pre-generated tone variants for quality and diversity

---

**Document Version:** 2.0 (Updated from George's actual transcript)  
**Author:** Morpheus (Lead Architect)  
**Updated:** 2026-04-04 (incorporated 9 gaps from George's call with Shay/Elad)  
**Changes:**
- Added natural language prompt interface (chat-style, replaces form-based builder)
- Added agent pipeline visibility (3 agents: Data, Copywriter, Delivery)
- Added tone variation spectrum (5-10 variants, Medical → Casual, with regenerate)
- Added blended multi-channel cadence (Email + SMS mixed timeline)
- Added voice call as coming-soon feature
- Added daily summary reports (automated morning emails)
- Added date-range campaign scheduling (start → end dates)
- Renamed template 3 to "Premium Lens Options Drip" (George's terminology)
- Added "3 people replaced" narrative to intro and closing
- Removed Meta Ads and fax processing (out of scope per George)
- Added Claude Enterprise integration note
- Updated build time to 12-14 days (from 8-10)

**Reviewed by:** [Pending Shay review]  
**Approved by:** [Pending]
