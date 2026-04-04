# Squad Decisions

## Active Decisions

### POC Architecture (2026-04-04) — Morpheus

**Status:** Approved for POC

**Core Decisions:**
1. **n8n Deployment Model:** Docker Compose with PostgreSQL (persistent, production-ready, self-hosted control)
2. **Database:** PostgreSQL 15-alpine (rejects SQLite; better for concurrent executions)
3. **Integration Pattern:** Webhook trigger + REST API status polling (decoupled, standard n8n pattern, testable)
4. **Sample Workflow:** Mock Salesforce → SMS → CRM using public test APIs (webhook.site, reqres.in, httpbin.org)
5. **Frontend Technology:** Vanilla HTML/JS Phase 1 (zero build overhead, fastest POC path) → React Phase 2
6. **Project Structure:**
   ```
   automations/
   ├── docker/               # n8n deployment
   ├── ui/                   # Custom client app
   ├── workflows/            # n8n workflow exports
   ├── docs/                 # Usage guides
   └── README.md             # Quick start
   ```

**Scope Boundaries (Out of POC):**
- Authentication (n8n API keys, OAuth)
- Real API credentials (Salesforce, Twilio)
- Production deployment (cloud hosting, CI/CD)
- Error recovery, retry logic, webhook signature verification
- Multi-tenancy, user management, performance optimization, monitoring

**Success Criteria:**
1. n8n starts via docker-compose
2. Sample workflow imports and activates
3. Custom UI sends webhook POST → workflow executes
4. UI polls execution status via n8n API
5. All mock API calls complete
6. End-to-end flow testable in <10 minutes

**Alternatives Rejected:**
- n8n Cloud (wanted self-hosted control)
- SQLite (not production-ready)
- SSE pattern (more complex than polling for POC)
- React Phase 1 (faster iteration with vanilla JS)

---

### Backend Architecture (2026-04-04) — Trinity

**Status:** Implemented

**Infrastructure:**
- Docker Compose orchestration with n8n (latest) + PostgreSQL 15
- n8n exposed localhost:5678, basic auth (admin/admin), API key for REST calls
- Health checks for both services before workflow import
- Persistent volumes for workflows and execution history

**Implementation Details:**
- `docker-compose.yml` with bridge networking, health endpoints
- `.env.example` with documented environment variables
- `workflows/lead-to-sms-flow.json` — 8-node webhook workflow (no real credentials)
- `scripts/setup.ps1` (PowerShell) and `scripts/setup.sh` (Bash)
  - Docker detection, .env creation, docker-compose orchestration
  - Health polling (30 attempts, 2s intervals)
  - REST API workflow import and activation
  - Webhook URL and test curl command

**Rationale:**
- Docker Compose keeps POC self-contained and reproducible
- PostgreSQL provides production-ready persistence
- Automated scripts reduce setup time to ~2 minutes
- Mock APIs eliminate credential requirements for POC

**Consequences:**
- Single command: `./scripts/setup.ps1` starts entire stack
- Workflows persist across container restarts
- Webhook URL is predictable and documented
- Local-only (intentional security), API key in .env acceptable for POC

---

### Frontend Design (2026-04-04) — Tank

**Status:** Implemented

**Technology:** Single HTML file with vanilla JavaScript, CSS, no build tooling or npm dependencies

**Features:**
- Embedded dark-theme UI with card layout
- localStorage for webhook URL config and execution history (max 50 records)
- Fetch API for direct POST to n8n webhook
- Configuration presets (Test/Production URLs)
- Execution panel with status indicators, loading spinner, response preview
- History table with timestamp, name, status, HTTP code, response time

**Rationale:**
- POC needs immediate testability — no build friction
- Single file can be opened directly (file://) or served
- Zero dependencies = zero installation issues
- Meets client requirements: simple interface to trigger workflows

**Upgrade Path:**
- Phase 2: React for state management and components
- Phase 3: Next.js for SSR and API routes
- Add backend proxy for security, real auth/authorization

---

## Governance

- All meaningful changes require team consensus
- Document architectural decisions here
- Keep history focused on work, decisions focused on direction
