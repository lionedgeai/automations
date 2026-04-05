# Project Context

- **Owner:** Shay Lavi
- **Project:** n8n Automation POC — self-hosted n8n with sample workflows (Salesforce → SMS → CRM) and a custom UI for clients to trigger flows via API/webhooks
- **Stack:** n8n (Docker), Node.js/TypeScript (custom UI), REST APIs, Docker Compose
- **Created:** 2026-04-04

## Learnings

<!-- Append new learnings below. Each entry is something lasting about the project. -->

### 2026-04-04: POC Architecture Established

**Project Structure:**
- `docker/` — n8n deployment (Docker Compose + PostgreSQL)
- `ui/` — Custom client app (starting with vanilla HTML/JS)
- `workflows/` — n8n workflow JSON exports
- `docs/` — Setup guides and API reference
- Root `README.md` — Architecture overview and quick start

**Key Architecture Decisions:**
1. **n8n Deployment:** Docker Compose with PostgreSQL (production-ready, persistent)
2. **Integration Pattern:** Webhook trigger + REST API status polling
3. **Sample Workflow:** Mock Salesforce → SMS → CRM using public test APIs (webhook.site, reqres.in, httpbin)
4. **UI Technology:** Start with vanilla HTML/JS (zero build step), upgrade to React in Phase 2
5. **Scope:** POC validates integration pattern only — no auth, no real credentials, no production deployment

**Success Criteria:** User can trigger n8n workflow from custom UI and see execution status in under 10 minutes.

**User Preferences (Shay):**
- Wants testable POC quickly
- Self-hosted n8n (not cloud)
- Mock APIs acceptable for POC phase
- Keep it simple, iterate later

### 2026-04-04 — Initial n8n POC Backend Setup

**Architecture:**
- Docker Compose with n8n (latest) + PostgreSQL 15 for persistence
- n8n exposed on localhost:5678 with basic auth (admin/admin default)
- API key authentication configured for programmatic access
- Webhook functionality enabled for external triggers
- Health checks for both PostgreSQL and n8n ensure readiness

**Key Files:**
- `docker-compose.yml` — Complete n8n + PostgreSQL orchestration with health checks
- `.env.example` — Documented environment variables template
- `workflows/lead-to-sms-flow.json` — Sample webhook workflow (8-node flow: webhook → process → mock CRM → format SMS → mock send → CRM update → response)
- `scripts/setup.ps1` — PowerShell automation: starts Docker, waits for health, imports workflow, activates it
- `scripts/setup.sh` — Bash equivalent for Linux/Mac
- `README.md` — Complete POC documentation with curl examples

**Workflow Pattern:**
The sample workflow demonstrates the core integration pattern: 
1. Webhook trigger (POST /webhook/lead-to-sms)
2. Data processing and validation
3. External API calls (mocked with httpbin.org, webhook.site)
4. Response with execution details

Mock APIs used instead of real Salesforce/Twilio to avoid credential requirements for POC.

**Setup Script Logic:**
1. Checks Docker availability
2. Creates `.env` from `.env.example` if missing
3. Starts docker-compose
4. Polls `/healthz` endpoint (max 30 attempts, 2s intervals)
5. Imports workflow via n8n REST API
6. Activates workflow
7. Prints webhook URL and test curl command

**Integration Point:**
Custom UI (React/Vue) can now call `http://localhost:5678/webhook/lead-to-sms` with lead data. n8n handles execution, returns structured JSON response. UI can poll n8n REST API for status.

### 2026-04-04 — Phase 1 Backend: nVision Demo Database & Workflows

**Context:** Built complete Phase 1 backend for nVision AI Campaign demo. Replaces mock APIs with real PostgreSQL schema modeling healthcare marketing automation with multi-channel campaigns, AI-generated content variants, and analytics.

**Database Schema Design Decisions:**

1. **Normalized Structure:** Separated concerns into 9 tables to support complex campaign workflows:
   - `patients` (50 seeded) — Mock Salesforce data with rich consultation notes for AI personalization
   - `campaign_templates` (3 seeded) — Reusable campaign blueprints with JSONB cadence configs
   - `campaigns` — Campaign instances with status workflow (draft → generating → in_review → approved → active → completed)
   - `campaign_content_variants` — Core innovation: 5-10 tone variations per message (Medical/Professional → Casual spectrum)
   - `campaign_recipients` — Junction table linking patients to campaigns with selected variants
   - `delivery_log` — Mock delivery tracking with status progression (sent → delivered → opened → clicked)
   - `analytics_metrics` — Daily aggregated performance metrics
   - `daily_summary_reports` — AI-generated daily summaries
   - `agent_activity_log` — Live agent pipeline visualization data

2. **JSONB for Flexibility:** Used JSONB columns for:
   - `cadence_config` in campaign_templates — Blended email/SMS schedules: `[{"day": 1, "channel": "email"}, {"day": 3, "channel": "sms"}]`
   - `parsed_prompt_params` in campaigns — Extracted parameters from natural language prompts
   - Allows schema evolution without migrations, critical for POC iteration speed

3. **Indexing Strategy:** Created indexes on:
   - Foreign keys (campaign_id, patient_id, etc.) for join performance
   - Query filters (status, procedure_interest, engagement_score, scheduled_time)
   - Analytics queries (metric_date, sent_at)
   - Total 20+ indexes across all tables for sub-50ms query times

4. **PostgreSQL-Specific Features:**
   - Dollar-quoted strings (`$$content$$`) to avoid escaping nightmares in long-form content with quotes
   - CHECK constraints for status enums and engagement score ranges (0-100)
   - CASCADE deletes on campaign → recipients → delivery_log for clean data lifecycle
   - UNIQUE constraint on (campaign_id, metric_date) to prevent duplicate analytics

**Seed Data Strategy:**

- **50 Realistic Patients:** 20 LASIK, 15 Cataract, 15 Premium Lens
  - American names, realistic emails/phones (555 area code pattern)
  - Detailed consultation notes (300-500 chars) mentioning specific concerns (night driving, sports, recovery time, cost)
  - Call recording summaries simulating AI transcription
  - Engagement scores 20-95 (realistic distribution, avg 73.7)
  - Mixed preferred_channel (email/sms/both) for cadence testing
  - Salesforce-style IDs (003Dn00000AXXXX format)

- **Key Demo Patients (required by demo script):**
  - Sarah Mitchell (ID 1): LASIK, 87 engagement, tennis player, ski trip, night driving concerns
  - David Thompson (ID 2): LASIK, 91 engagement, basketball, software dev, dry eye concerns
  - Robert Chen (ID 21): Cataract, 72 engagement, SMS preferred, grandchild visit, recovery time focus
  - Maria Garcia (ID 36): Premium Lens, 35 engagement (low), email only, reading glasses frustration

- **2 Pre-Generated Campaigns:**
  - Campaign 1 "Summer LASIK Promo 2026" — Active, 12 recipients, 4-step blended cadence (email → SMS → email → SMS)
  - Campaign 2 "Cataract Education Q2" — In Review, 8 recipients, 6-step educational series

- **18 Tone Variants:** 5 tones for Sarah/David (email), 3 for Robert (email + SMS), 3 SMS for David
  - Tone spectrum: Medical/Professional → Informative → Friendly → Casual → Empathetic
  - Each variant ~150-300 words (email) or ~100 chars (SMS)
  - Personalized to patient consultation notes (ski trip, basketball, grandchild, etc.)
  - `is_selected` flag marks the "Informative" tone as default approved variant

- **30 Mock Delivery Log Entries:** 3-day progression for Campaign 1
  - Day 1: 12 emails sent (5 opened, 2 clicked immediately)
  - Day 2: Additional opens/clicks (realistic engagement curve)
  - Day 3: 8 SMS sent (cadence step 2)
  - Status progression: sent → delivered → opened → clicked

- **4 Days Analytics Metrics:** Campaign 1 performance shows realistic engagement
  - Day 1: 12 sent, 5 opens (41.6%), 2 clicks (16.6%)
  - Day 4: 9 opens (75%), 5 clicks (41.6%), 1 conversion
  - Demonstrates analytics dashboard will have real data

- **16 Agent Activity Log Entries:** Mock AI agent pipeline execution
  - Data Analyst: Patient extraction, filtering (24 → 12 patients)
  - Copywriter: Analyzing notes, generating 5 tone variants per patient (60 email + 40 SMS variants)
  - Campaign Manager: Cadence scheduling, approval workflow, delivery orchestration
  - Shows agent progress with timestamps for live UI updates

**n8n Workflow Pattern:**

Created `patient-extraction-flow.json` with dual webhook pattern:
- `GET /webhook/patients` — List patients with query filters (procedure_interest, min_engagement_score, preferred_channel, limit)
- `GET /webhook/patients/:id` — Single patient detail

**Workflow Architecture (8 nodes total):**
1. Webhook Trigger (GET /patients)
2. PostgreSQL Query — Dynamic WHERE clause from query params
3. Code Node (Format Response) — Transforms snake_case DB columns to camelCase JSON
4. Respond to Webhook — Returns `{success, count, patients[], filters, timestamp}`
5. Webhook Trigger (GET /patients/:id)
6. PostgreSQL Single — Query by ID with LIMIT 1
7. Code Node (Format Single) — Returns patient or 404 error
8. Respond to Webhook

**Key Implementation Details:**
- Uses n8n expression syntax for dynamic SQL: `{{ $parameter["queryParameters"]["procedure_interest"] ? "AND ..." : "" }}`
- PostgreSQL credentials reference: `"n8n PostgreSQL"` (assumes pre-configured in n8n)
- Clean JSON response with success flag, timestamp, applied filters
- Replaces old `lead-to-sms-flow.json` as the primary data extraction endpoint

**Setup Automation:**

`setup-demo.ps1` PowerShell script automates entire setup:
1. Docker health check
2. docker-compose up -d
3. Wait for PostgreSQL health (30 attempts, 2s intervals)
4. Execute init-demo-db.sql via `docker exec` pipe
5. Execute seed-demo-data.sql
6. Wait for n8n health
7. Import all workflow JSONs via n8n REST API
8. Activate workflows
9. Print webhook URLs and test curl commands

**Tested & Verified:**
- Schema creates cleanly (9 tables, 20+ indexes, 0 errors)
- Seed data inserts successfully (50 patients, 3 templates, 2 campaigns, 18 variants, 30 delivery logs, 4 metrics, 16 agent logs)
- Key demo patients confirmed: Sarah (ID 1), David (ID 2), Robert (ID 21), Maria (ID 36)
- Patient distribution: 20 LASIK (avg 79.7 engagement), 15 Cataract (avg 69.3), 15 Premium Lens (avg 72.1)
- Campaigns: 12 active recipients, 8 pending review
- All SQL runs in <2 seconds on n8n_postgres container

**Integration Points for UI:**
- Webhook endpoints: `http://localhost:5678/webhook/patients` (list), `/patients/:id` (detail)
- Direct PostgreSQL queries for analytics dashboard, campaign management, content variant selection
- Agent activity log for live pipeline visualization
- Delivery log for mock email/SMS tracking UI

**Tech Stack Patterns Established:**
- PostgreSQL as source of truth (not n8n's internal DB)
- JSONB for flexible schema (cadence configs, prompt parsing results)
- Dollar-quoted strings for long-form content (avoids quote escaping hell)
- Comprehensive indexing for dashboard query performance
- Mock data with realistic distribution (not just "test1, test2, test3")

**Consequences:**
- Phase 2 (UI) can now build against real data structure
- Campaign generation workflow can read templates, create variants, write to DB
- Analytics queries are fast (indexed properly)
- Demo data is rich enough to show AI personalization quality
- Setup is single-command: `.\scripts\setup-demo.ps1`
