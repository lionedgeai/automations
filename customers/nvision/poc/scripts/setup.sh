#!/bin/bash

# n8n POC Setup Script
# Starts Docker Compose, waits for health, imports workflow, and activates it

set -e

ENV_FILE="${1:-.env}"

echo "🚀 Starting n8n POC Setup..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if .env exists
if [ ! -f "$ENV_FILE" ]; then
    if [ -f ".env.example" ]; then
        echo "⚠️  .env file not found. Copying from .env.example..."
        cp .env.example "$ENV_FILE"
        echo "✅ Created .env file. Please review and update the values."
        echo "   Especially: N8N_API_KEY, passwords"
    else
        echo "❌ No .env or .env.example found!"
        exit 1
    fi
fi

# Load environment variables
export $(grep -v '^#' "$ENV_FILE" | xargs)

echo "📦 Starting Docker Compose..."
docker-compose up -d

echo "⏳ Waiting for n8n to be healthy..."
MAX_ATTEMPTS=30
ATTEMPT=0

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    if curl -sf http://localhost:5678/healthz > /dev/null 2>&1; then
        break
    fi
    
    ATTEMPT=$((ATTEMPT + 1))
    echo "  Attempt $ATTEMPT/$MAX_ATTEMPTS..."
    sleep 2
done

if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
    echo "❌ n8n failed to start within timeout. Check logs with: docker-compose logs n8n"
    exit 1
fi

echo "✅ n8n is healthy!"

# Wait a bit more for full initialization
sleep 3

echo "📋 Importing workflow..."

WORKFLOW_FILE="workflows/lead-to-sms-flow.json"
if [ ! -f "$WORKFLOW_FILE" ]; then
    echo "❌ Workflow file not found: $WORKFLOW_FILE"
    exit 1
fi

WORKFLOW_JSON=$(cat "$WORKFLOW_FILE")

# Import workflow via API
RESPONSE=$(curl -s -X POST "http://localhost:5678/api/v1/workflows" \
    -H "X-N8N-API-KEY: $N8N_API_KEY" \
    -u "$N8N_BASIC_AUTH_USER:$N8N_BASIC_AUTH_PASSWORD" \
    -H "Content-Type: application/json" \
    -d "$WORKFLOW_JSON")

WORKFLOW_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -z "$WORKFLOW_ID" ]; then
    echo "❌ Failed to import workflow. Response: $RESPONSE"
    echo "You can manually import the workflow from: $WORKFLOW_FILE"
    exit 1
fi

echo "✅ Workflow imported with ID: $WORKFLOW_ID"

# Activate the workflow
echo "🔄 Activating workflow..."
curl -s -X PATCH "http://localhost:5678/api/v1/workflows/$WORKFLOW_ID" \
    -H "X-N8N-API-KEY: $N8N_API_KEY" \
    -u "$N8N_BASIC_AUTH_USER:$N8N_BASIC_AUTH_PASSWORD" \
    -H "Content-Type: application/json" \
    -d '{"active": true}' > /dev/null

echo "✅ Workflow activated!"

# Display summary
echo ""
echo "🎉 Setup Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "n8n UI:         http://localhost:5678"
echo "Username:       $N8N_BASIC_AUTH_USER"
echo "Password:       $N8N_BASIC_AUTH_PASSWORD"
echo ""
echo "Webhook URL:    http://localhost:5678/webhook/lead-to-sms"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Test the webhook with:"
echo "curl -X POST http://localhost:5678/webhook/lead-to-sms \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{"
echo "    \"name\": \"John Doe\","
echo "    \"phone\": \"+1234567890\","
echo "    \"email\": \"john@example.com\","
echo "    \"company\": \"Acme Corp\""
echo "  }'"
