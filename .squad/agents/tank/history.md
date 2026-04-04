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

### 2026-04-04: POC Frontend UI Created

- **File:** `ui/index.html` - Single-file vanilla JS app (no build tools required)
- **Design Pattern:** Card-based dark theme UI with real-time execution feedback
- **Storage:** LocalStorage for webhook URL config and execution history (max 50 records)
- **Key Features:**
  - Direct fetch() calls to n8n webhook endpoints (no backend proxy)
  - Test/Production URL presets with persistence
  - Execution results panel with status indicators (green/red/orange)
  - History table showing timestamp, lead name, status, response time, HTTP code
  - Works with file:// protocol or any static server
- **n8n Integration:** POSTs lead data (name, phone, email, company) to configurable webhook URL
- **UX Decisions:** Loading spinner during execution, pretty-printed JSON responses, responsive grid layout

### 2026-04-04: Backend Infrastructure Integration

**Trinity's Backend Stack Ready:**
- Docker Compose orchestration with n8n + PostgreSQL persistence
- Automated setup scripts (PowerShell + Bash) reduce setup to ~2 minutes
- Sample workflow (8-node): webhook → process → mock APIs → response
- Webhook URL: `http://localhost:5678/webhook/lead-to-sms`
- Mock APIs (webhook.site, reqres.in, httpbin) eliminate credential requirements

**Frontend Integration Points:**
- Frontend POSTs lead data to webhook endpoint
- n8n processes and returns execution details
- UI polls REST API for execution status and history
- Complete end-to-end workflow testable in <10 minutes

**Coordination Notes:**
- Backend ready for UI consumption (webhook endpoint stable)
- Both teams use mock APIs for seamless POC testing
- Phase 2 will replace mocks with real Salesforce/Twilio APIs
