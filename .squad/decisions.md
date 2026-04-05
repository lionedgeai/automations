# Squad Decisions

## Active Decisions

### Repository Structure (2026-04-04) — Morpheus

**Status:** Implemented

**Context:**
The automation repository was initially set up as a single-project POC for nVision's n8n automation platform. User requested reorganization to support multiple projects, demos, and customer-specific work.

**Decision:**
Reorganize the repository into a multi-purpose structure:

```
automations/
├── demos/           # Demo projects and examples
├── customers/       # Customer-specific automation work
│   └── nvision/
│       └── poc/     # The n8n POC
├── common/          # Shared utilities, libraries, helpers
├── .squad/          # Team state (remains at root)
├── .github/         # GitHub workflows (remains at root)
└── README.md        # Multi-project hub documentation
```

**Rationale:**
1. **Scalability:** Allows multiple customer projects without conflicts
2. **Organization:** Clear separation between demos, customer work, and shared code
3. **Discoverability:** Each project has its own README and can be navigated independently
4. **Git History:** Used `git mv` to preserve file history during reorganization
5. **Flexibility:** Easy to add new customers or demo projects in the future

**Implementation:**
- Moved n8n POC files into `customers/nvision/poc/`
- Created POC-specific README explaining the project
- Updated root README to describe the multi-project structure
- Added `.gitkeep` files to empty `demos/` and `common/` directories
- All changes committed with descriptive commit message

---

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

---

### Phase 1 Backend Architecture (2026-04-05) — Trinity

**Status:** Implemented & Tested

**Infrastructure:**
- PostgreSQL 15 with 9 normalized tables (patients, consultations, campaigns, campaign_recipients, campaign_content_variants, delivery_log, agent_activity_log, analytics_metrics, campaign_templates)
- 20+ indexes on foreign keys, filters, and query columns
- JSONB support for cadence configs and parsed parameters
- Cascade deletes and comprehensive constraints

**Data Seeding:**
- 50 patients with realistic American names, consultation notes (200-400 chars), engagement scores (20-95)
- 3 campaign templates (Year-End LASIK Promo, Cataract Education, Wellness Re-engagement)
- 2 active campaigns with 18 AI-generated tone variants per message
- Demo patients keyed by ID: Sarah Mitchell (1), David Thompson (2), Robert Chen (21), Maria Garcia (36)

**API Pattern:**
- n8n webhook workflow: Webhook Trigger → PostgreSQL Query (dynamic WHERE) → Format JSON → Respond
- Two endpoints: GET /webhook/patients?procedure_interest=LASIK&min_engagement_score=80 and GET /webhook/patients/:id
- Express.js API server (port 3001) replaces n8n's credential-dependent PostgreSQL node
- 3 endpoints: /api/patients, /api/patients/:id, /api/health

**Automation:**
- `setup-demo.ps1` orchestrates Docker Compose, health checks, database init, seed, workflow import
- Single command: `.\scripts\setup-demo.ps1` → fully working demo in ~90 seconds

**Key Decisions:**
1. **JSONB for configurations:** Blended email/SMS cadences vary by template; allows UI to render dynamic timelines without schema changes
2. **Content variants as table:** Supports 5-10 AI-generated tones per message with approval workflow (is_selected flag)
3. **Dollar-quoted strings:** Eliminates SQL injection risk and escaping nightmares in seed data
4. **Comprehensive indexing:** Targets <50ms query performance for patient lists, <100ms for campaigns, <200ms for analytics

**Success Criteria Met:**
- ✅ Schema created (0 errors), Data seeded (50 patients, 2 campaigns), Queries verified (<50ms)
- ✅ API endpoints tested with curl, all returning data correctly
- ✅ Setup automation works reliably (~90 seconds on local machine)

---

### Phase 1 Frontend Architecture (2026-04-05) — Tank

**Status:** Implemented & Tested

**Technology Stack:**
- React 18.2 + TypeScript 5.2 (strict mode)
- Vite 5.1 (bundler + dev server)
- Tailwind CSS 3.4 (dark theme: Slate 950 bg, Indigo 500 primary)
- React Router v6.22 (client-side multi-page routing)

**Component Architecture:**
- Sidebar navigation: Dashboard, Patients, Campaigns, Analytics, Delivery Log
- PatientList with search, filters (procedure, engagement, status), sorting (name, engagement)
- PatientModal showing full details: procedure type, engagement score, consultation notes, call summary
- Design system: Engagement colors (Green 70+, Yellow 40-69, Red <40), Procedure colors (Blue LASIK, Amber Cataract, Purple Premium Lens)

**API Layer (Mock-First Pattern):**
- `getPatients()` tries http://localhost:3001/api/patients, falls back to mockData on failure
- No hardcoded environment variables needed (auto-detects backend availability)
- Unblocks Tank from Trinity's backend schedule
- Frontend dev can build/iterate independently

**Directory Structure:**
```
ui/src/
├── components/  (Sidebar, PatientList, PatientModal)
├── pages/       (Dashboard, Patients, Campaigns, Analytics, DeliveryLog)
├── api/         (patients.ts with mock-first pattern, mockData.ts)
├── types/       (Patient, Campaign interfaces)
├── App.tsx      (Router)
└── main.tsx     (Entry)
```

**Design & Performance:**
- Dark theme aesthetic: executive-level demo ready (Linear/Vercel aesthetic)
- Build output: 182 kB gzipped (production-quality)
- Responsive layout with Tailwind utilities
- TypeScript for type safety across component tree

**Success Criteria Met:**
- ✅ `npm run dev` starts cleanly
- ✅ Patients page renders with mock data (demo-ready without backend)
- ✅ Search, filter, sort functionality working
- ✅ Patient modal shows full details
- ✅ Dark theme looks professional
- ✅ Ready for demo without backend running

---

### nVision Demo Strategy: Hybrid Mock/Real (2026-04-05) — Morpheus

**Status:** Approved & Implemented

**Hybrid Strategy:**

**REAL Components (High Demo Value):**
- AI content generation (real OpenAI GPT-4o API with campaign-specific prompts)
- Analytics dashboard (real Chart.js visualizations with live PostgreSQL queries)
- Workflow orchestration (real n8n workflows with actual state management)
- Approval workflow (real interactive state machine for George to click through)

**MOCK Components (Operational Simplicity):**
- Salesforce integration (mock REST API with realistic patient JSON from PostgreSQL)
- Email delivery (mock with visual confirmation UI, no real emails sent)
- SMS delivery (mock Twilio with visual confirmation, no real SMS sent)
- Campaign metrics (pre-seeded engagement data with simulated real-time updates)

**Rationale:**
- AI content is the core differentiator — must be real to impress George
- Mocking delivery endpoints eliminates credential complexity and spam risk
- Pre-seeded analytics avoid timing issues (can't generate real opens/clicks in demo timeframe)
- Mock Salesforce avoids compliance risk with real patient data
- Visual delivery log with tracking IDs feels real without operational overhead

**Risk Mitigation:**
- Primary risk: OpenAI timeout during live demo → Pre-generate all content during setup, cache in DB, optionally show 1 live call
- Secondary risk: Demo feels "too fake" → Focus narrative on "sandbox environment" framing, use tracking IDs for visual authenticity

**Success Criteria:**
1. AI content quality is genuinely personalized (not template mail-merge)
2. Demo flows smoothly without crashes
3. UI looks professional (real product, not prototype)
4. George can interact with approval workflow and see results
5. Analytics dashboard is visually compelling
6. End-to-end story is clear ("this saves hours per campaign")

---

### nVision Demo UX Shift: Prompt-Based Campaign Creation (2026-04-05) — Morpheus

**Status:** Approved, Planned for Phase 2

**Decision Summary:**

Shift from form-based Campaign Builder to natural language prompt interface for campaign creation.

**What Changed:**

**v1.0 (Form-Based):** Template selector dropdown, patient segment filters (multi-select), channel selector, preview, "Generate" button

**v2.0 (Prompt-Based):** Large text input with ChatGPT-like UX, user types campaign instructions, AI parses to extract parameters, shows what agent understood, agent activity panel shows 3 agents working

**Example Prompt:**  
> "Run a year-end LASIK promo for all consultation patients who haven't converted, running between now and August 31st, pricing $500 off per eye, flexible payment terms"

**Rationale:**

George explicitly said: "I give an order to an agent and they go and execute" (transcript evidence). His mental model is ChatGPT-style prompts, not form-based. The prompt interface:
- Matches George's actual vision (not our interpretation)
- Shows clearer "3 people replaced" narrative (one prompt → agents divide work)
- Handles flexible parameters (date ranges, custom pricing) naturally
- More impressive demo moment (type → agents work → done vs. click dropdowns)

**Implementation Impact:**

New components required:
1. **Prompt Parser Workflow (n8n):** Extract campaign type, target segment, date range, pricing/terms via regex + OpenAI fallback
2. **Agent Activity Panel (UI):** Live status feed showing Data Analyst, Copywriter, Campaign Manager working step-by-step
3. **Parsed Parameters Panel (UI):** Shows extracted campaign parameters for confirmation before execution
4. **Updated Schema:** campaigns.parsed_prompt_params (JSON), date_range_start/end, agent_activity_log table

Build time: +4 days (8-10 → 12-14 days total)

**Risk Mitigation:**

- Prompt parsing failures → Pre-script 3-4 guaranteed example prompts, use simple regex for known keywords, fallback message "I didn't understand that"
- Complexity vs. form-based → Start with regex patterns, only use LLM if needed, extensive QA
- User expectations → Handle George's specific examples perfectly, show intelligent parameter extraction

**Success Criteria:**

1. George types one of the example prompts → parameters parse correctly
2. Agent activity panel shows 3 agents working in sequence
3. Parsed parameters panel displays extracted data accurately
4. George says: "This feels like ChatGPT for marketing campaigns"
5. No parsing failures during demo (mitigated with pre-scripted prompts)

---

## Governance

- All meaningful changes require team consensus
- Document architectural decisions here
- Keep history focused on work, decisions focused on direction
