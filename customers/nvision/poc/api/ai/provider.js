/**
 * AI Provider Factory
 * Returns the configured AI client (anthropic, openai, or mock).
 */

const { MockAIClient } = require('./mock');

let _provider = null;

function getProviderConfig() {
  return {
    provider: process.env.AI_PROVIDER || 'mock',
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || 'gpt-4o',
    },
    github: {
      apiKey: process.env.GITHUB_TOKEN,
      model: process.env.GITHUB_MODEL || 'openai/gpt-4o',
    },
  };
}

function createProvider() {
  const config = getProviderConfig();
  const name = config.provider.toLowerCase();

  if (name === 'anthropic' && config.anthropic.apiKey) {
    const { AnthropicAIClient } = require('./anthropic');
    console.log(`[AI] Using Anthropic (${config.anthropic.model})`);
    return new AnthropicAIClient(config.anthropic);
  }

  if (name === 'openai' && config.openai.apiKey) {
    const { OpenAIClient } = require('./openai');
    console.log(`[AI] Using OpenAI (${config.openai.model})`);
    return new OpenAIClient(config.openai);
  }

  if (name === 'github' && config.github.apiKey) {
    const { GitHubModelsClient } = require('./github');
    console.log(`[AI] Using GitHub Models (${config.github.model})`);
    return new GitHubModelsClient(config.github);
  }

  if (name !== 'mock') {
    console.warn(`[AI] Provider "${name}" requested but no API key found — falling back to mock`);
  } else {
    console.log('[AI] Using mock provider (template-based)');
  }
  return new MockAIClient();
}

function getAIProvider() {
  if (!_provider) {
    _provider = createProvider();
  }
  return _provider;
}

// Reset provider (useful when env changes at runtime)
function resetProvider() {
  _provider = null;
}

// ============================================================
// Shared system prompts for all providers
// ============================================================

const SYSTEM_PROMPTS = {
  parsePrompt: `You are an AI assistant for nVision Eye Centers, a healthcare marketing platform.
Your job is to parse a natural language campaign request and extract structured parameters.

Return ONLY valid JSON with these fields:
{
  "campaignName": "descriptive campaign name",
  "procedure": "LASIK" | "Cataract Surgery" | "Premium Lens Upgrade" | null,
  "minEngagement": 0-100 (0 if not specified),
  "dateStart": "YYYY-MM-DD",
  "dateEnd": "YYYY-MM-DD",
  "segment": "all" | "unconverted" | "high-value" | "re-engagement",
  "targetAgeMin": null or number,
  "targetAgeMax": null or number,
  "additionalCriteria": "any other targeting notes"
}

If dates are relative (e.g. "next month"), resolve them based on today's date which will be provided.
If no procedure is mentioned, set to null (target all procedures).
If engagement level is vague like "high engagement", use 70. "Medium" = 50.`,

  generateEmail: `You are a healthcare marketing copywriter for nVision Eye Centers.
Write a personalized marketing email for a patient considering an eye procedure.

Rules:
- Address the patient by name
- Reference their specific procedure interest
- If consultation notes are provided, subtly reference them
- Keep the email professional and HIPAA-conscious (no specific medical details)
- Include a clear call-to-action
- Sign off as "nVision Eye Centers"
- Match the requested tone exactly

Return ONLY valid JSON:
{
  "subject": "email subject line",
  "body": "full email body with newlines"
}`,

  generateSMS: `You are a healthcare marketing copywriter for nVision Eye Centers.
Write a personalized SMS message for a patient considering an eye procedure.

Rules:
- Keep under 160 characters
- Address the patient by first name
- Reference their procedure interest
- Include a call-to-action (reply, call, etc.)
- Match the requested tone
- Be concise — every character counts

Return ONLY the SMS text (no JSON wrapping, no quotes).`,

  regenerateEmail: `You are a healthcare marketing copywriter for nVision Eye Centers.
Generate a FRESH VARIATION of the email below. Same tone and intent, but different wording, structure, and approach. Do not just swap words — write something genuinely new.

Return ONLY valid JSON:
{
  "subject": "new subject line",
  "body": "new email body"
}`,

  regenerateSMS: `You are a healthcare marketing copywriter for nVision Eye Centers.
Generate a FRESH VARIATION of the SMS below. Same tone and intent, but different wording.
Keep under 160 characters. Return ONLY the SMS text.`,
};

module.exports = { getAIProvider, resetProvider, getProviderConfig, SYSTEM_PROMPTS };
