# Quick Setup Guide

## Prerequisites

- Docker Desktop (Windows/Mac) or Docker Engine + Docker Compose (Linux)
- Node.js 18+ (for UI development)
- Git
- Modern web browser

## Step-by-Step Setup

### 1. Clone & Navigate

```bash
cd C:\projects\private\automations
```

### 2. Start n8n

```bash
cd docker
docker-compose up -d
```

Wait 30 seconds for n8n to initialize.

### 3. Access n8n

Open: http://localhost:5678

**First time:** Create an account (local only, not cloud)

### 4. Import Workflow

1. In n8n UI: Click **"+"** → **Import from File**
2. Select `workflows/salesforce-to-crm.json`
3. Click **Activate** (toggle in top-right)
4. Click on **Webhook** node → Copy the **Test URL** or **Production URL**

Example: `http://localhost:5678/webhook/abc123`

### 5. Test with UI

#### Option A: Simple HTML (No Install)

```bash
cd ../ui
# Open index.html in browser (double-click)
```

#### Option B: Local Server (Recommended)

```bash
cd ../ui
python -m http.server 3000
# Open: http://localhost:3000
```

### 6. Trigger Workflow

1. Paste the webhook URL from step 4
2. Fill in test lead data:
   - Name: John Doe
   - Email: john@example.com
   - Phone: +1234567890
3. Click **Trigger Workflow**
4. View response and execution status

### 7. Check Execution History

In n8n UI: Go to **Executions** → See your workflow run with all steps

---

## Troubleshooting

### n8n won't start

```bash
cd docker
docker-compose logs n8n
```

Check for port conflicts (5678 already in use?)

### Webhook returns 404

- Workflow must be **activated** (toggle on)
- Use the correct webhook URL from the Webhook node
- Check n8n logs: `docker-compose logs n8n`

### UI can't reach n8n

- Check n8n is running: `docker-compose ps`
- Verify http://localhost:5678 loads in browser
- CORS issue? n8n allows localhost by default

---

## Stopping Everything

```bash
cd docker
docker-compose down
```

**Keep data:** Volumes persist (workflows, executions saved)  
**Reset completely:** `docker-compose down -v` (deletes all data)

---

## Next Steps

See `docs/api-reference.md` for n8n REST API details.
