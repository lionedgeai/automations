const API_BASE = 'http://localhost:3001/api';

export interface AIStatus {
  active_provider: string;
  configured: {
    anthropic: boolean;
    openai: boolean;
    github: boolean;
    mock: boolean;
    resend: boolean;
  };
  models: {
    anthropic: string;
    openai: string;
    github: string;
  };
  resend_from: string;
}

export async function getAIStatus(): Promise<AIStatus> {
  const response = await fetch(`${API_BASE}/ai/status`);
  if (!response.ok) throw new Error('API not ready');
  return await response.json();
}

export async function updateAIConfig(config: {
  provider?: string;
  anthropic_api_key?: string;
  anthropic_model?: string;
  openai_api_key?: string;
  openai_model?: string;
  resend_api_key?: string;
  resend_from?: string;
}): Promise<AIStatus> {
  const response = await fetch(`${API_BASE}/ai/config`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  if (!response.ok) throw new Error('Failed to update config');
  return await response.json();
}

export async function testAIConnection(): Promise<{ success: boolean; provider: string; message: string }> {
  const response = await fetch(`${API_BASE}/ai/test`, { method: 'POST' });
  if (!response.ok) throw new Error('API not ready');
  return await response.json();
}

export async function testResendConnection(): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE}/email/test`, { method: 'POST' });
  if (!response.ok) throw new Error('API not ready');
  return await response.json();
}
