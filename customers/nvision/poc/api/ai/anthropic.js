/**
 * Anthropic/Claude AI Client
 */

const { SYSTEM_PROMPTS } = require('./provider');

class AnthropicAIClient {
  constructor(config) {
    this.name = 'anthropic';
    this.model = config.model || 'claude-sonnet-4-20250514';
    this.apiKey = config.apiKey;
    // Lazy-load SDK to avoid requiring it when not used
    const Anthropic = require('@anthropic-ai/sdk');
    this.client = new Anthropic({ apiKey: this.apiKey });
  }

  async _complete(systemPrompt, userMessage, maxTokens = 1024) {
    const start = Date.now();
    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      });
      const text = response.content[0].text;
      const elapsed = Date.now() - start;
      const usage = response.usage;
      console.log(`[AI:anthropic] ${elapsed}ms | in=${usage.input_tokens} out=${usage.output_tokens}`);
      return text;
    } catch (error) {
      console.error(`[AI:anthropic] Error: ${error.message}`);
      throw error;
    }
  }

  _parseJSON(text) {
    // Strip markdown code fences if present
    const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    return JSON.parse(cleaned);
  }

  async parsePrompt(promptText) {
    const today = new Date().toISOString().split('T')[0];
    const userMsg = `Today's date: ${today}\n\nCampaign request:\n"${promptText}"`;
    const raw = await this._complete(SYSTEM_PROMPTS.parsePrompt, userMsg, 512);
    const parsed = this._parseJSON(raw);

    return {
      campaignName: parsed.campaignName || 'AI Generated Campaign',
      procedure: parsed.procedure || null,
      minEngagement: parsed.minEngagement || 0,
      dateStart: parsed.dateStart ? new Date(parsed.dateStart) : new Date(),
      dateEnd: parsed.dateEnd ? new Date(parsed.dateEnd) : new Date(Date.now() + 90 * 86400000),
      segment: parsed.segment || 'all',
    };
  }

  async generateEmail(patient, params, tone) {
    const procedure = params.procedure || patient.procedure_interest;
    const userMsg = [
      `Patient: ${patient.first_name} ${patient.last_name}`,
      `Procedure Interest: ${procedure}`,
      `Engagement Score: ${patient.engagement_score}/100`,
      patient.consultation_notes ? `Consultation Notes: ${patient.consultation_notes}` : null,
      patient.preferred_channel ? `Preferred Channel: ${patient.preferred_channel}` : null,
      `Campaign: ${params.campaignName}`,
      `Tone: ${tone}`,
    ].filter(Boolean).join('\n');

    const raw = await this._complete(SYSTEM_PROMPTS.generateEmail, userMsg, 1024);
    return this._parseJSON(raw);
  }

  async generateSMS(patient, params, tone) {
    const procedure = params.procedure || patient.procedure_interest;
    const userMsg = [
      `Patient: ${patient.first_name}`,
      `Procedure: ${procedure}`,
      `Tone: ${tone}`,
      `Campaign: ${params.campaignName}`,
    ].join('\n');

    const raw = await this._complete(SYSTEM_PROMPTS.generateSMS, userMsg, 256);
    // SMS is returned as plain text
    return raw.replace(/^["']|["']$/g, '').trim();
  }

  async regenerateEmail(patient, params, tone, originalContent) {
    const userMsg = [
      `Original subject: ${originalContent.subject}`,
      `Original body:\n${originalContent.body}`,
      `\nTone: ${tone}`,
      `Patient: ${patient.first_name} ${patient.last_name}`,
      `Procedure: ${params.procedure || patient.procedure_interest}`,
    ].join('\n');

    const raw = await this._complete(SYSTEM_PROMPTS.regenerateEmail, userMsg, 1024);
    return this._parseJSON(raw);
  }

  async regenerateSMS(patient, params, tone, originalContent) {
    const userMsg = [
      `Original SMS: ${originalContent}`,
      `Tone: ${tone}`,
      `Patient: ${patient.first_name}`,
      `Procedure: ${params.procedure || patient.procedure_interest}`,
    ].join('\n');

    const raw = await this._complete(SYSTEM_PROMPTS.regenerateSMS, userMsg, 256);
    return raw.replace(/^["']|["']$/g, '').trim();
  }
}

module.exports = { AnthropicAIClient };
