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

**File Paths:**
- Architecture decisions: `.squad/decisions.md`
- Setup guide: `docs/setup.md`
- API reference: `docs/api-reference.md`
- Main README: `README.md`

**User Preferences (Shay):**
- Wants testable POC quickly
- Self-hosted n8n (not cloud)
- Mock APIs acceptable for POC phase
- Keep it simple, iterate later

### 2026-04-04 — Backend Infrastructure Complete

**Architecture:**
- Docker Compose with n8n (latest) + PostgreSQL 15 for persistence
- n8n exposed on localhost:5678 with basic auth (admin/admin default)
- API key authentication configured for programmatic access
- Webhook functionality enabled for external triggers

**Implementation:**
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

**Automated Setup:**
- Cross-platform setup scripts (PowerShell + Bash)
- Docker health checks for both n8n and PostgreSQL
- REST API workflow import and activation
- Reduces setup time from ~15 minutes to ~2 minutes

### 2026-04-04: Frontend UI Delivered

**Implementation:**
- Single-file vanilla JS app: `ui/index.html` (no build tools required)
- Dark-theme card layout, responsive grid design
- Browser localStorage for webhook URL config and execution history
- Direct fetch() API calls to n8n webhooks (no backend proxy needed for POC)

**Key Features:**
- Configuration presets (Test/Production webhook URLs)
- Lead form with name, phone, email, company fields
- Real-time execution status display with loading spinner
- Execution history table (timestamp, name, status, response time, HTTP code)
- Pretty-printed JSON response viewer
- Works with file:// protocol or any static server

**Integration Point:**
Frontend POSTs to `http://localhost:5678/webhook/lead-to-sms` with lead data. n8n handles execution, returns structured JSON response. UI polls REST API for status.

**Future Upgrades:**
- Phase 2: React for component reusability and state management
- Phase 3: Next.js with TypeScript
- Backend proxy for webhook security
- Real authentication and authorization

### 2026-04-04: Repository Restructured for Multi-Purpose Use

**Decision:** Reorganized repo from single-project to multi-project structure.

**New Top-Level Structure:**
- `demos/` — Demo projects and examples
- `customers/` — Customer-specific automation work (organized by customer name)
- `common/` — Shared utilities, libraries, and helpers
- `.squad/`, `.github/`, `.copilot/` remain at root

**n8n POC Location:** Moved from root to `customers/nvision/poc/`

**Files Moved:**
- `docker-compose.yml`, `.env.example` → `customers/nvision/poc/`
- `docker/`, `scripts/`, `ui/`, `workflows/`, `docs/` → `customers/nvision/poc/`
- Created POC-specific README at `customers/nvision/poc/README.md`
- Updated root `README.md` to describe multi-project hub structure

**Benefits:**
- Clear separation of different customer projects
- Room for demo projects and shared utilities
- Maintains git history through `git mv` commands
- Each project remains self-contained with its own README

**Key Paths:**
- nVision POC: `customers/nvision/poc/`
- Shared code: `common/`
- Demos: `demos/`

### 2026-04-04: nVision Demo Plan for George

**Context:** George (nVision stakeholder) needs to see a live end-to-end demo of the AI campaign automation platform before committing to full development.

**Demo Requirements (6 Capabilities to Showcase):**
1. Patient Data Extraction from Salesforce — AI extracts patient data including notes/call recordings
2. Personalized Campaign Generation — AI generates personalized email/SMS with variations
3. Automated Campaign Delivery — Schedules and sends campaigns without manual intervention
4. Reporting & Analytics — Campaign performance metrics (open rates, click-throughs)
5. Review & Approval Workflow — Review, approve, and modify campaigns before sending
6. Configurable Campaign Types — Handle different campaigns (LASIK promo vs. cataract education) without rebuilding

**Key Architecture Decisions:**
- **Real AI Content Generation:** Use OpenAI GPT-4o API for personalized content (core differentiator, must be real)
- **Mock Salesforce:** PostgreSQL-backed mock API with realistic patient data (avoids credential setup, compliance risk)
- **Mock Email/SMS Delivery:** Visual confirmation UI instead of real sends (no spam risk, immediate results)
- **Pre-Seeded Analytics:** Realistic mock engagement data with simulated real-time updates (can't generate real opens/clicks in demo)
- **React UI Upgrade:** Move from vanilla JS to React for complex multi-screen demo interface

**Demo Flow (18 minutes):**
1. Patient data extraction (view 50 patients, drill into consultation notes)
2. Campaign generation (select template, AI generates personalized content in ~15 seconds)
3. Review & approval (George clicks approve button, sees scheduled delivery)
4. Delivery log (visual confirmation of sent emails/SMS with tracking IDs)
5. Analytics dashboard (Chart.js visualizations, campaign drill-down)
6. Template switching (show 3 campaign types: promo, education, nurture)

**Implementation Scope:**
- 5 n8n workflows (patient extraction, campaign generation, approval, delivery, analytics aggregation)
- 6 PostgreSQL tables with seed data (50 patients, 3 templates, 2 pre-generated campaigns)
- React UI with 6 screens (Dashboard, Patients, Builder, Review, Delivery Log, Analytics)
- Build time: 8-10 days (1 full-time developer)

**Risk Mitigation:**
- Pre-generate all campaign content during setup, cache in database (fallback if OpenAI API slow/down)
- Use proven Chart.js templates for analytics (reduce UI complexity)
- Test full demo flow 3x before live presentation
- Record backup demo video (fallback if technical issues)

**George's Priorities (Inferred):**
1. AI content quality must be impressive (not generic templates)
2. Professional UI (looks like real product, not prototype)
3. Interactive demo (he can click approve and see results)
4. Clear end-to-end story ("this saves hours per campaign")
5. Proof of n8n orchestration capabilities (not just a simple script)

**Success Criteria:**
George walks away thinking: "This actually works. I can see my team using this."

**Demo Plan Document:** `customers/nvision/poc/docs/demo-plan.md`

### 2026-04-04: nVision Demo Plan Updated from George's Transcript

**Context:** Shay reviewed the actual transcript of the call with George (nVision stakeholder) and identified 9 gaps between the original demo plan and what George ACTUALLY said he wants to see. Updated demo plan to match George's specific requirements.

**George's Key Pain Point:**  
"I have to use three people — my data Salesforce guy, my marketing guy, someone for SMS cadence and frequency." The demo must show one prompt replacing all three.

**Major UX Shift — Natural Language Prompt Interface:**
- **Original:** Form-based Campaign Builder with template selector, segment filters, and preview
- **Updated:** Chat/prompt-style UX where George types natural language instructions like: "Run a year-end LASIK promo for all consultation patients who haven't converted, running between now and August 31st, with pricing X, terms Y"
- **Rationale:** George said "I give an order to an agent and they go and execute" — wants prompt-based interaction, not form-filling
- The AI agent parses intent, extracts parameters (segment, campaign type, date range, messaging), and executes
- Form fields now appear as "parsed parameters" AFTER prompt processing (showing what agent understood)

**9 Gaps Addressed:**

1. **Natural Language Prompt Interface** — Replaced form-based builder with chat-style prompt input (MAJOR UX CHANGE)

2. **Multiple Tone Variations with Pick/Retry** — George: "ChatGPT gives me 10 different versions... I can pick." Added 5-10 tone variants per message on a spectrum (Medical/Professional → Informative → Friendly → Casual), with "Regenerate/Retry" button per variant

3. **Blended Multi-Channel Cadence** — George: "Follow-up email... third day is an SMS. Fourth day, a voice agent." Updated to timeline view mixing channels: Day 1: Email, Day 3: SMS, Day 5: Email, Day 7: SMS, etc. (not separate email/SMS sections)

4. **Voice Agent as Future Option** — Added "Voice Call" in cadence timeline as greyed-out/coming-soon step (Day 30: Voice Call 🔜) — signals platform extensibility without building it

5. **Agent Pipeline Visibility** — Elad described 3 agents to George: Salesforce expert, Copywriter, Delivery agent. Added "Agent Activity" panel showing step-by-step progress:
   - 🔍 Agent 1 (Data Analyst): Querying Salesforce... ✓ Found 47 patients
   - ✍️ Agent 2 (Copywriter): Generating 5 email variations... ✓ Content ready
   - 📅 Agent 3 (Campaign Manager): Building delivery schedule... ✓ 4-week cadence set
   - This makes the "3 people replaced by 3 agents" story visible

6. **Date-Range Campaign Scheduling** — George: "summer promotion running between now and August 31st." Changed from single scheduled_date to date_range_start/end. Cadence fits within range. Display: "Campaign Active: April 15 → August 31, 2026"

7. **Campaign Template Naming** — George's examples: "Year-end LASIK promotion", "Cataract education type of email", "Premium lens options drip campaign." Renamed template 3 from "Wellness Re-engagement" to "Premium Lens Options Drip" to match his exact terminology

8. **Automated Post-Send Summary Reports** — George: "follows up with reports... creates a summary. And then next day, same thing." Added Daily Campaign Summary feature with automated morning reports:
   ```
   📊 Daily Summary — LASIK Summer Promo (Day 3)
   Today: 12 SMS sent | 8 delivered | 3 replies
   Overall: 47 emails + 12 SMS sent | 31 opened (66%) | 8 clicked (17%) | 2 consultations booked
   Tomorrow: Follow-up email to 15 non-openers scheduled for 9 AM
   ```

9. **"3 People Replaced" Narrative** — Added to INTRO and CLOSING scripts to explicitly frame demo around George's pain point:
   - INTRO: "George, you mentioned needing three people to run a campaign — data extraction, copywriting, delivery scheduling. Watch one prompt replace all three."
   - CLOSING: "What took three people, multiple rounds of revisions, and weeks — you just did in under 5 minutes with a single prompt."

**Explicitly Out of Scope (George's Guidance):**
- **Meta Ads:** George said "that would probably be second phase, we're okay there" — NOT in demo
- **Fax/Referral Processing:** George said "that's a different project" — NOT in demo

**Additional Context:**
- **Claude Enterprise:** George mentioned bringing in Claude Enterprise — noted that AI content generation can use Claude instead of/alongside OpenAI
- **Salesforce Access:** George controls Salesforce access directly (no IT blocker) — noted as positive signal

**Implementation Changes:**
- Added 2 new n8n workflows: `prompt-parser-flow` (extracts campaign parameters from natural language), `daily-summary-flow` (generates morning reports)
- Expanded PostgreSQL schema: `campaign_content_variants` (stores 5-10 tone options per patient per message), `daily_summary_reports`, `agent_activity_log`, `campaigns.date_range_start/end`, `campaigns.parsed_prompt_params`
- Updated UI screens: Campaign Prompt (chat-style), Tone Variation Selector, Blended Cadence Timeline, Agent Activity Panel, Daily Summary Reports tab
- Build time increased from 8-10 days to 12-14 days (complexity increase due to prompt parsing, tone variants, agent pipeline, daily summaries)
- Demo confidence: Medium-High with mitigations (prompt parsing has risk, tone variant quality critical)

**Key Technical Risks:**
1. Natural language prompt parsing may fail on unexpected input (mitigated with pre-scripted example prompts, simple regex)
2. Generating 5-10 tone variants per patient = 5-10x OpenAI API calls (mitigated with pre-generation and caching)
3. Tone variations may sound too similar (mitigated with QA review, high temperature, strong tone modifiers)

**George's Specific Preferences:**
- Wants prompt-based interaction ("I give an order to an agent")
- Wants ChatGPT-style tone variation options (5-10 variants from serious → casual)
- Wants to see agents working (not just loading spinners — show actual activity)
- Wants blended email + SMS cadence (not separate campaigns)
- Wants automated daily summaries (morning reports showing what happened, what's next)
- Wants date-range campaigns (not single-send or fixed schedules)
- Uses specific terminology: "Premium lens options drip", "Cataract education", "Year-end LASIK promo"

**Demo Plan Version:** 2.0 (updated from transcript)  
**Location:** `customers/nvision/poc/docs/demo-plan.md`
