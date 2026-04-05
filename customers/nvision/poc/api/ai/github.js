/**
 * GitHub Models AI Client
 * Uses the OpenAI SDK pointed at https://models.github.ai/inference
 * Auth: GitHub Personal Access Token (PAT)
 */

const { SYSTEM_PROMPTS } = require('./provider');

class GitHubModelsClient {
  constructor(config) {
    this.name = 'github';
    this.model = config.model || 'openai/gpt-4o';
    this.apiKey = config.apiKey;
    const OpenAI = require('openai');
    this.client = new OpenAI({
      apiKey: this.apiKey,
      baseURL: 'https://models.github.ai/inference',
    });
  }

  async _complete(systemPrompt, userMessage, maxTokens = 1024) {
    const start = Date.now();
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        max_tokens: maxTokens,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
      });
      const text = response.choices[0].message.content;
      const elapsed = Date.now() - start;
      const usage = response.usage;
      console.log(`[AI:github] ${elapsed}ms | in=${usage.prompt_tokens} out=${usage.completion_tokens}`);
      return text;
    } catch (error) {
      console.error(`[AI:github] Error: ${error.message}`);
      throw error;
    }
  }

  _parseJSON(text) {
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

module.exports = { GitHubModelsClient };
