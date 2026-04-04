# nVision n8n Automation POC

Self-hosted n8n workflow automation platform with custom UI for triggering workflows via API.

## Quick Start

### Prerequisites
- Docker Desktop installed and running
- PowerShell (Windows) or Bash (Linux/Mac)

### Setup

1. **Copy environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Generate secure API key (optional but recommended):**
   ```bash
   # On Linux/Mac:
   openssl rand -hex 32
   
   # On Windows (PowerShell):
   -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
   ```
   
   Update `N8N_API_KEY` in `.env` with the generated key.

3. **Run setup script:**
   
   **Windows (PowerShell):**
   ```powershell
   .\scripts\setup.ps1
   ```
   
   **Linux/Mac:**
   ```bash
   chmod +x scripts/setup.sh
   ./scripts/setup.sh
   ```

4. **Access n8n UI:**
   - URL: http://localhost:5678
   - Default credentials: admin / admin (change in `.env`)

## Testing the POC

### Test via Webhook

The setup script automatically imports and activates the "Lead to SMS Flow" workflow.

**Test with curl:**
```bash
curl -X POST http://localhost:5678/webhook/lead-to-sms \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "phone": "+1234567890",
    "email": "jane@example.com",
    "company": "Tech Startup Inc"
  }'
```

**Expected Response:**
```json
{
  "status": "success",
  "leadId": "LEAD-ABC123",
  "message": "Lead processed and SMS sent successfully",
  "sms_message": "Hi Jane Smith, thanks for your interest! We'll reach out soon. - Tech Startup Inc",
  "phone": "+1234567890",
  "execution_time": "2024-04-04T12:34:56.789Z"
}
```

### Workflow Details

The POC workflow (`lead-to-sms-flow.json`) demonstrates:

1. **Webhook Trigger** - Receives POST requests with lead data
2. **Process Lead** - Validates and enriches incoming data
3. **Get Lead from CRM** - Mock API call to CRM (uses webhook.site)
4. **Prepare SMS** - Formats SMS message
5. **Send SMS** - Mock SMS provider call (uses httpbin.org)
6. **Update CRM** - Mock CRM update with SMS status
7. **Return Response** - Sends success response with execution details

All external integrations use mock endpoints (httpbin.org, webhook.site) for POC purposes.

## API Integration

### Direct Webhook Calls

Custom UI can directly call n8n webhooks:

```javascript
const response = await fetch('http://localhost:5678/webhook/lead-to-sms', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    phone: '+1234567890',
    email: 'john@example.com',
    company: 'Acme Corp'
  })
});

const result = await response.json();
console.log(result);
```

### n8n REST API

For advanced operations (create/update workflows, check executions):

```bash
curl -X GET http://localhost:5678/api/v1/workflows \
  -H "X-N8N-API-KEY: your-api-key" \
  -u admin:admin
```

See [n8n API docs](https://docs.n8n.io/api/) for full reference.

## Project Structure

```
customers/nvision/poc/
├── docker-compose.yml          # Docker orchestration
├── .env.example               # Environment template
├── workflows/                 # n8n workflow JSON files
│   └── lead-to-sms-flow.json # Sample workflow
├── scripts/                   # Setup automation
│   ├── setup.ps1             # Windows setup
│   └── setup.sh              # Linux/Mac setup
├── ui/                        # Custom trigger UI
│   └── index.html            # Workflow trigger page
├── docker/                    # Docker configurations
└── README.md                 # This file
```

## Management

### Start/Stop Services

```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# View logs
docker-compose logs -f n8n

# Restart
docker-compose restart
```

### Import Additional Workflows

Via UI:
1. Open http://localhost:5678
2. Click "Import from File"
3. Select workflow JSON file

Via API:
```bash
curl -X POST http://localhost:5678/api/v1/workflows \
  -H "X-N8N-API-KEY: your-api-key" \
  -u admin:admin \
  -H "Content-Type: application/json" \
  -d @workflows/your-workflow.json
```

## Next Steps

1. **Replace Mock APIs**: Update workflow nodes to use real Salesforce, Twilio, etc.
2. **Add Authentication**: Implement webhook authentication/API keys
3. **Build Custom UI**: Create React/Vue app to trigger workflows
4. **Production Config**: Update `.env` with secure credentials
5. **Monitoring**: Add logging, alerting, and execution tracking

## Troubleshooting

**n8n won't start:**
```bash
docker-compose logs n8n
docker-compose logs postgres
```

**Webhook not responding:**
- Check workflow is active in n8n UI
- Verify webhook path matches URL
- Check execution history in n8n

**API calls failing:**
- Verify `N8N_API_KEY` matches `.env`
- Check basic auth credentials
- Ensure n8n is fully started (wait 30s after `docker-compose up`)

## Documentation

- [n8n Documentation](https://docs.n8n.io/)
- [n8n API Reference](https://docs.n8n.io/api/)
- [Docker Compose Reference](https://docs.docker.com/compose/)
