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

### 2026-04-05: React UI Scaffold for nVision Demo (Phase 1)

**Architecture Decisions:**
- **Stack:** React 18 + TypeScript + Vite + Tailwind CSS + React Router v6
- **Why Vite:** Fast dev server, zero config, modern tooling (vs CRA which is deprecated)
- **Why Tailwind:** Rapid prototyping, consistent design system, no CSS module overhead
- **Why React Router:** Client-side routing for multi-page feel, no SSR needed for demo

**Component Architecture:**
```
App (Router)
├── Sidebar (persistent navigation)
└── Pages (route-level)
    ├── DashboardPage (placeholder)
    ├── PatientsPage (BUILT)
    │   ├── Patient table with sort/filter
    │   └── PatientModal (detail view)
    ├── CampaignsPage (placeholder)
    ├── AnalyticsPage (placeholder)
    └── DeliveryLogPage (placeholder)
```

**API Layer Pattern:**
- **Mock-first with graceful fallback:** Tries real backend first, falls back to mock data on error
- **Why:** Works even if Trinity's backend isn't ready yet; allows parallel development
- **Mock data:** 10 realistic patient records matching PostgreSQL schema
- Client-side filtering when using mocks (server-side when backend ready)

**Design Choices:**
- **Dark theme:** Professional SaaS look (Linear/Vercel style) — George is a healthcare exec, needs polished UI
- **Color palette:** Slate backgrounds (#0f172a), indigo primary (#6366f1), semantic colors for status
- **Engagement scores:** Green (70+), Yellow (40-69), Red (<40) — instant visual hierarchy
- **Procedure badges:** Blue (LASIK), Amber (Cataract), Purple (Premium Lens)
- **Smooth interactions:** Hover states, modal animations, sortable table headers

**Patients Page Features:**
- Sortable columns (click header to toggle asc/desc)
- Search (name/email/phone)
- Filters (procedure, channel)
- Patient count display
- Click row → modal with full details (consultation notes, call summaries)
- Loading skeleton and error states

**TypeScript Types:**
- Strict mode enabled
- Interfaces match PostgreSQL schema from `docs/demo-plan.md`
- Patient, Campaign, CampaignTemplate types defined
- PatientsFilter for API params

**Key Learnings:**
1. Mock data is CRITICAL for frontend independence — never block on backend availability
2. Dark theme + colored badges = instant professionalism for executive demos
3. Sortable tables are trivial with React state but add huge UX value
4. Tailwind utility classes 10x faster than writing custom CSS for demos

**User Experience Philosophy:**
- George's reaction to the UI is as important as the functionality
- Polished UI = Trust in the platform
- Every interaction should feel responsive (loading states, smooth transitions)
- "It looks real" matters more than "it works perfectly" in a demo context

**Development Speed:**
- Zero to running React app in ~30 minutes (scaffolding, deps, components, styling)
- Vite dev server starts in ~1 second (vs 10+ seconds with webpack)
- Tailwind = no context switching between files for styling
