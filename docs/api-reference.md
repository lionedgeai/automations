# n8n REST API Reference (POC)

**Base URL:** `http://localhost:5678/api/v1`

**Authentication:** None required for POC (default setup)

---

## Trigger Workflow via Webhook

**Method:** `POST`  
**Endpoint:** `http://localhost:5678/webhook/{webhook-path}`

**Headers:**
```
Content-Type: application/json
```

**Body (Example):**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "executionId": "12345",
  "status": "running"
}
```

---

## Get Execution Status

**Method:** `GET`  
**Endpoint:** `/api/v1/executions/{executionId}`

**Response (Running):**
```json
{
  "id": "12345",
  "finished": false,
  "mode": "webhook",
  "startedAt": "2026-04-04T10:30:00.000Z",
  "stoppedAt": null,
  "workflowId": "1"
}
```

**Response (Completed):**
```json
{
  "id": "12345",
  "finished": true,
  "mode": "webhook",
  "startedAt": "2026-04-04T10:30:00.000Z",
  "stoppedAt": "2026-04-04T10:30:05.000Z",
  "workflowId": "1",
  "data": {
    "resultData": {
      "runData": {
        "Webhook": [...],
        "Mock Salesforce": [...],
        "Mock SMS": [...],
        "Mock CRM": [...]
      }
    }
  }
}
```

---

## List All Executions

**Method:** `GET`  
**Endpoint:** `/api/v1/executions`

**Query Params:**
- `limit` (default: 20)
- `status` (optional: "success", "error", "waiting")

**Response:**
```json
{
  "data": [
    {
      "id": "12345",
      "finished": true,
      "mode": "webhook",
      "startedAt": "2026-04-04T10:30:00.000Z",
      "workflowId": "1"
    }
  ],
  "nextCursor": null
}
```

---

## Get Workflow Details

**Method:** `GET`  
**Endpoint:** `/api/v1/workflows/{workflowId}`

**Response:**
```json
{
  "id": "1",
  "name": "Salesforce Lead to CRM",
  "active": true,
  "nodes": [...],
  "connections": {...},
  "createdAt": "2026-04-04T09:00:00.000Z",
  "updatedAt": "2026-04-04T10:00:00.000Z"
}
```

---

## Notes for POC

- **No authentication** required (default n8n setup allows localhost)
- **Production:** Use API keys (set `N8N_API_KEY_AUTH=true` in docker/.env)
- **Webhook paths** are auto-generated or custom (set in Webhook node)
- **CORS:** Enabled by default for localhost origins

---

## Error Handling

| Status Code | Meaning |
|-------------|---------|
| 200 | Success |
| 404 | Execution/workflow not found |
| 500 | Workflow execution error |

**Example Error:**
```json
{
  "code": 404,
  "message": "Execution not found"
}
```

---

## Useful for UI Development

**Polling Pattern:**
```javascript
async function waitForExecution(executionId) {
  let status = 'running';
  while (status === 'running') {
    const res = await fetch(`http://localhost:5678/api/v1/executions/${executionId}`);
    const data = await res.json();
    status = data.finished ? 'completed' : 'running';
    if (status === 'running') await sleep(1000);
  }
  return data;
}
```

---

**Official Docs:** https://docs.n8n.io/api/
