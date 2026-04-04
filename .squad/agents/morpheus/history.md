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
