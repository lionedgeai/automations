# POC Frontend UI - Quick Start

## What It Is
A single-file web UI (`ui/index.html`) that lets clients trigger n8n workflows without touching n8n's interface.

## How to Use

### Option 1: Open Directly
Just double-click `ui/index.html` — it works with the file:// protocol.

### Option 2: Use a Static Server
```bash
# Python
python -m http.server 8080

# Node.js (if you have http-server installed)
npx http-server ui -p 8080

# Or any static file server
```

Then visit: http://localhost:8080

## Features
- **Workflow Trigger Form:** Input lead data (Name, Phone, Email, Company) and hit "Run Workflow"
- **Configurable Webhook URL:** Toggle between Test/Production endpoints at the top
- **Real-Time Results:** See HTTP status, response time, and full JSON response
- **Execution History:** Last 50 executions stored in browser localStorage

## Configuration
1. Update the webhook URL at the top (defaults to `http://localhost:5678/webhook/lead-to-sms`)
2. Save Test/Production presets by clicking the preset buttons

## Testing
1. Make sure n8n is running with the webhook endpoint configured
2. Fill in the lead form
3. Click "Run Workflow"
4. Watch the results panel update in real-time

## Tech Stack
- Pure HTML/CSS/JavaScript (no frameworks, no build tools)
- Browser localStorage for persistence
- Fetch API for n8n webhook calls
