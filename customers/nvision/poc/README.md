# nVision Eye Centers — AI Campaign Platform Demo

End-to-end demo of AI-powered healthcare marketing automation for NVISION Eye Centers.

## What It Shows

1. **Patient Extraction** — 50 mock patients from "Salesforce" with procedure interest, engagement scores, channel preferences
2. **Natural Language Campaign Creation** — Type a prompt and watch 3 AI agents work (Data Analyst → Copywriter → Campaign Manager)
3. **Multi-Tone Content Variants** — 5 email tones + 3 SMS tones per patient, selectable and regeneratable
4. **Review & Approval Workflow** — Approve or reject campaigns before delivery
5. **Blended Cadence Delivery** — Day 1: email → Day 3: SMS → Day 5: email → Day 7: SMS
6. **Analytics Dashboard** — Open rates, click-throughs, conversions, per-campaign breakdowns

---

## Prerequisites

| Tool | Version | Check |
|------|---------|-------|
| Docker Desktop | 4.x+ | `docker --version` |
| Node.js | 20+ | `node --version` |
| npm | 9+ | `npm --version` |
| Git | 2.x+ | `git --version` |

> **Docker must be running** before you start.

---

## Quick Start (5 minutes)

### Step 1: Start Backend Services

```powershell
cd customers/nvision/poc
docker compose up -d
```

This starts:
- **PostgreSQL** (port 5432) — database
- **n8n** (port 5678) — workflow engine
- **API** (port 3001) — Express backend

Wait for healthy status:
```powershell
docker compose ps
```

All 3 containers should show `running` / `healthy`.

### Step 2: Initialize the Database

```powershell
# Create tables
docker exec -i n8n_postgres psql -U n8n -d n8n < scripts/init-demo-db.sql

# Seed demo data (50 patients, templates, campaigns, analytics)
docker exec -i n8n_postgres psql -U n8n -d n8n < scripts/seed-demo-data.sql
```

### Step 3: Install & Start the UI

```powershell
cd ui
npm install
npm run dev
```

### Step 4: Open the Demo

- **UI:** http://localhost:3000
- **API:** http://localhost:3001/api/health
- **n8n:** http://localhost:5678 (admin@nvision-demo.com / Admin2026!)

---

## Demo Walkthrough (18 minutes)

### 1. Dashboard (2 min)
Open http://localhost:3000 — shows total patients, active campaigns, delivery stats, recent agent activity.

### 2. Patients (3 min)
Click **Patients** in sidebar. Shows 50 patients extracted from "Salesforce." Search, filter by procedure (LASIK, Cataract, Premium Lens), sort by engagement score. Click a patient to see details.

### 3. Create a Campaign (5 min)
Click **Campaigns** → **+ New Campaign**. Type a natural language prompt:

> *"Send a year-end LASIK special to patients aged 25-45 with high engagement, running from December 1 to December 31"*

Watch the 3 AI agents work in real-time:
- 🔍 **Data Analyst** — Queries Salesforce, finds matching patients
- ✍️ **Copywriter** — Generates 5 email tone variants + 3 SMS variants per patient
- 📋 **Campaign Manager** — Builds blended email+SMS delivery schedule

### 4. Review Content (4 min)
Click into the new campaign. Review tone variants side-by-side:
- Medical/Professional, Informative, Friendly, Casual, Empathetic
- Select preferred tone per patient, or regenerate any variant
- Preview both email and SMS content

### 5. Approve & Deliver (2 min)
Click **Approve Campaign** → delivery schedule populates automatically.
Go to **Delivery Log** to see the blended cadence timeline.
Click **Simulate Delivery** to show messages being "sent."

### 6. Analytics (2 min)
Click **Analytics** — view open rates, click-throughs, conversions.
Per-campaign breakdown shows which campaigns perform best.

---

## Configuring Different Campaign Types

The same workflow handles different campaign types — just change the prompt:

| Campaign Type | Example Prompt |
|---|---|
| LASIK Promo | *"Year-end LASIK special for patients 25-45, December 1-31"* |
| Cataract Education | *"Cataract awareness series for patients over 60, January through March"* |
| Premium Lens Upsell | *"Premium lens upgrade for cataract patients with high engagement, next 2 weeks"* |
| Re-engagement | *"Follow up with patients who haven't visited in 6 months"* |

No rebuilding needed — the AI agents adapt content and targeting to each prompt.

---

## Project Structure

```
customers/nvision/poc/
├── README.md                    # This file
├── docker-compose.yml           # Docker orchestration (postgres + n8n + api)
├── .env                         # Environment config
├── api/                         # Express API backend
│   ├── server.js               # All API endpoints (~1000 lines)
│   ├── package.json            # Node dependencies
│   └── Dockerfile              # Container build
├── ui/                          # React frontend (Vite + TS + Tailwind)
│   ├── src/pages/              # Dashboard, Patients, Campaigns, Analytics, Delivery
│   ├── src/api/                # API clients with mock fallback
│   └── src/components/         # Sidebar, PatientModal
├── scripts/                     # Database setup
│   ├── init-demo-db.sql        # 9 tables with indexes
│   └── seed-demo-data.sql      # 50 patients, templates, campaigns, analytics
├── workflows/                   # n8n workflow definitions
└── docs/                        # Demo planning docs
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/patients` | List patients (with search/filter) |
| GET | `/api/patients/:id` | Patient detail |
| GET | `/api/templates` | Campaign templates |
| GET | `/api/campaigns` | List campaigns |
| GET | `/api/campaigns/:id` | Campaign detail |
| POST | `/api/campaigns` | Create campaign from prompt |
| GET | `/api/campaigns/:id/variants` | Content variants |
| POST | `/api/campaigns/:id/variants/:vid/select` | Select variant |
| POST | `/api/campaigns/:id/variants/:vid/regenerate` | Regenerate variant |
| POST | `/api/campaigns/:id/approve` | Approve campaign |
| POST | `/api/campaigns/:id/reject` | Reject campaign |
| GET | `/api/delivery` | Delivery log |
| POST | `/api/delivery/simulate` | Simulate sending |
| GET | `/api/analytics` | Overall analytics |
| GET | `/api/analytics/:campaignId` | Per-campaign analytics |
| GET | `/api/dashboard/stats` | Dashboard statistics |
| GET | `/api/summaries` | Daily summary reports |
| GET | `/api/agent-activity/:campaignId` | Agent pipeline activity |

## Troubleshooting

| Problem | Solution |
|---|---|
| Port 3001 returns HTML | A stray Node process is on port 3001. Run `netstat -ano \| findstr :3001` and kill the non-Docker PID |
| Docker containers unhealthy | `docker compose down && docker compose up -d` |
| DB tables don't exist | Re-run `docker exec -i n8n_postgres psql -U n8n -d n8n < scripts/init-demo-db.sql` |
| UI won't start | Delete `ui/node_modules` and re-run `npm install` |
| API returns empty results | Re-run seed: `docker exec -i n8n_postgres psql -U n8n -d n8n < scripts/seed-demo-data.sql` |

## Teardown

```powershell
# Stop everything
docker compose down

# Stop and remove all data
docker compose down -v
```
