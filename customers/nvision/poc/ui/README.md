# nVision Campaign AI — Frontend

Professional React-based UI for the nVision healthcare marketing automation platform.

## Tech Stack

- **React 18** + **TypeScript** — Modern, type-safe component architecture
- **Vite** — Lightning-fast build tool and dev server
- **Tailwind CSS** — Utility-first CSS for rapid, consistent styling
- **React Router v6** — Client-side routing for multi-page app

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
ui/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── Sidebar.tsx          # App navigation
│   │   └── PatientModal.tsx     # Patient detail modal
│   ├── pages/            # Route-level pages
│   │   ├── DashboardPage.tsx    # Campaign overview (placeholder)
│   │   ├── PatientsPage.tsx     # Patient table + filters
│   │   ├── CampaignsPage.tsx    # Campaign management (placeholder)
│   │   ├── AnalyticsPage.tsx    # Performance metrics (placeholder)
│   │   └── DeliveryLogPage.tsx  # Email/SMS logs (placeholder)
│   ├── api/              # API client layer
│   │   ├── patients.ts          # Patient data fetching
│   │   └── mockData.ts          # Mock patient records
│   ├── types/            # TypeScript interfaces
│   │   └── index.ts             # Patient, Campaign, etc.
│   ├── App.tsx           # Router + layout
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles + Tailwind
├── legacy/               # Old vanilla HTML UI (archived)
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── index.html
```

## Features (Phase 1)

### ✅ Patients View

- **Patient table** with sortable columns (Name, Email, Phone, Procedure, Last Visit, Engagement Score, Channel)
- **Search** — Filter by name, email, or phone
- **Filters** — Procedure Interest (LASIK/Cataract/Premium Lens), Preferred Channel (Email/SMS/Both)
- **Engagement scoring** — Color-coded badges (green > 70, yellow 40-70, red < 40)
- **Procedure badges** — LASIK (blue), Cataract (amber), Premium Lens (purple)
- **Patient detail modal** — Click any row to view full consultation notes and call summaries
- **Patient count** — "Showing X of Y patients"

### API Integration

- **Endpoint:** `GET http://localhost:5678/webhook/patients`
- **Query params:** `?procedure_interest=LASIK&min_engagement_score=70`
- **Fallback:** Uses mock data (10 realistic patient records) if backend is unavailable
- **Error handling:** Graceful loading states and error messages

### Design

- **Dark theme** — Professional SaaS aesthetic (slate backgrounds, white text)
- **Color palette:**
  - Primary: Indigo (`#6366f1`)
  - Background: Slate 950 (`#0f172a`)
  - Borders: Slate 800
  - Text: White / Slate 100
- **Responsive layout** — Sidebar navigation + scrollable content area
- **Smooth transitions** — Hover states, modal animations

## Future Pages (Phase 2+)

- **Dashboard** — Campaign overview, key metrics, quick actions
- **Campaigns** — Natural language prompt interface, AI agent activity panel, tone variations
- **Analytics** — Real-time charts, engagement metrics, ROI tracking
- **Delivery Log** — Email/SMS delivery status, timestamps, responses

## Backend Integration

The UI expects the following n8n webhook endpoints:

1. `GET /webhook/patients` — List all patients (supports filters)
2. `GET /webhook/patients/:id` — Get single patient details

If the backend is not running, the UI automatically falls back to mock data with no errors.

## Development Notes

- Uses **React Router** for navigation (not Next.js — keeping it lean for demo)
- **Tailwind** utility classes for styling (no CSS modules, no styled-components)
- **TypeScript strict mode** enabled for type safety
- **ESLint** configured for React best practices
- All patient data matches the PostgreSQL schema from `docs/demo-plan.md`

## Color-Coded Status Guide

### Engagement Scores
- 🟢 Green (70-100): High engagement, ready for campaign
- 🟡 Yellow (40-69): Moderate engagement, nurture needed
- 🔴 Red (0-39): Low engagement, requires re-engagement

### Procedure Interests
- 🔵 Blue: LASIK
- 🟠 Amber: Cataract
- 🟣 Purple: Premium Lens

---

**Built by Tank** — Frontend Dev  
**For:** George @ nVision Eye Centers Demo  
**Phase:** 1 of 3
