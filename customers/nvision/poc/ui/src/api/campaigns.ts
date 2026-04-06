import type { CampaignTemplate, Campaign, ContentVariant } from '../types';
import {
  mockTemplates,
  mockCampaigns,
  mockVariants,
} from './mockCampaignData';

const API_BASE = 'http://localhost:3001/api';

export async function getTemplates(): Promise<CampaignTemplate[]> {
  try {
    const response = await fetch(`${API_BASE}/templates`);
    if (!response.ok) throw new Error('API not ready');
    return await response.json();
  } catch {
    console.log('Using mock templates');
    return mockTemplates;
  }
}

export async function getCampaigns(): Promise<Campaign[]> {
  try {
    const response = await fetch(`${API_BASE}/campaigns`);
    if (!response.ok) throw new Error('API not ready');
    return await response.json();
  } catch {
    console.log('Using mock campaigns');
    return mockCampaigns;
  }
}

export async function getCampaign(id: number): Promise<Campaign> {
  try {
    const response = await fetch(`${API_BASE}/campaigns/${id}`);
    if (!response.ok) throw new Error('API not ready');
    return await response.json();
  } catch {
    console.log(`Using mock campaign ${id}`);
    const campaign = mockCampaigns.find((c) => c.id === id);
    if (!campaign) throw new Error('Campaign not found');
    return campaign;
  }
}

export async function createCampaign(
  prompt_text: string,
  template_id?: number,
  patient_ids?: number[]
): Promise<Campaign> {
  try {
    const response = await fetch(`${API_BASE}/campaigns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt_text, template_id, patient_ids }),
    });
    if (!response.ok) throw new Error('API not ready');
    return await response.json();
  } catch {
    console.log('Creating mock campaign');
    const newCampaign: Campaign = {
      id: Date.now(),
      template_id: template_id || 1,
      name: 'New Campaign',
      status: 'generating',
      date_range_start: new Date().toISOString().split('T')[0],
      date_range_end: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      prompt_text,
      parsed_prompt_params: {
        campaign_name: 'New Campaign',
        target: 'All eligible patients',
        date_range: 'Next 90 days',
        recipients: 15,
        cadence: 'Email (Day 1) → SMS (Day 3) → Email (Day 5)',
      },
      recipient_count: 15,
      template_name: mockTemplates.find((t) => t.id === template_id)?.name,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return newCampaign;
  }
}

export async function getCampaignVariants(
  campaignId: number
): Promise<ContentVariant[]> {
  try {
    const response = await fetch(
      `${API_BASE}/campaigns/${campaignId}/variants`
    );
    if (!response.ok) throw new Error('API not ready');
    return await response.json();
  } catch {
    console.log(`Using mock variants for campaign ${campaignId}`);
    return mockVariants.filter((v) => v.campaign_id === campaignId);
  }
}

export async function selectVariant(
  campaignId: number,
  variantId: number
): Promise<void> {
  try {
    const response = await fetch(
      `${API_BASE}/campaigns/${campaignId}/variants/${variantId}/select`,
      { method: 'POST' }
    );
    if (!response.ok) throw new Error('API not ready');
  } catch {
    console.log(`Mock: Selected variant ${variantId} for campaign ${campaignId}`);
  }
}

export async function regenerateVariant(
  campaignId: number,
  variantId: number,
  tone?: string
): Promise<ContentVariant> {
  try {
    const response = await fetch(
      `${API_BASE}/campaigns/${campaignId}/variants/${variantId}/regenerate`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tone }),
      }
    );
    if (!response.ok) throw new Error('API not ready');
    return await response.json();
  } catch {
    console.log(`Mock: Regenerated variant ${variantId}`);
    const variant = mockVariants.find((v) => v.id === variantId);
    if (!variant) throw new Error('Variant not found');
    return {
      ...variant,
      content: variant.content + '\n\n[Regenerated with new AI model pass]',
    };
  }
}

export async function deleteCampaign(id: number): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/campaigns/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('API not ready');
  } catch {
    console.log(`Mock: Deleted campaign ${id}`);
  }
}

// ============ Recipient Management ============

export interface CampaignRecipient {
  id: number;
  patient_id: number;
  email_override: string | null;
  cadence_step: number;
  channel: string;
  status: string;
  patient_name: string;
  original_email: string;
  phone: string;
  procedure_interest: string;
  engagement_score: number;
}

export async function getCampaignRecipientsList(campaignId: number): Promise<CampaignRecipient[]> {
  const response = await fetch(`${API_BASE}/campaigns/${campaignId}/recipients`);
  if (!response.ok) throw new Error('Failed to fetch recipients');
  return await response.json();
}

export async function addCampaignRecipient(campaignId: number, patientId: number, emailOverride?: string): Promise<void> {
  const response = await fetch(`${API_BASE}/campaigns/${campaignId}/recipients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ patient_id: patientId, email_override: emailOverride }),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Failed to add recipient');
  }
}

export async function updateRecipientEmail(campaignId: number, patientId: number, emailOverride: string | null): Promise<void> {
  const response = await fetch(`${API_BASE}/campaigns/${campaignId}/recipients/${patientId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email_override: emailOverride }),
  });
  if (!response.ok) throw new Error('Failed to update recipient');
}

export async function bulkOverrideEmails(campaignId: number, emailOverride: string | null): Promise<void> {
  const response = await fetch(`${API_BASE}/campaigns/${campaignId}/recipients-override`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email_override: emailOverride }),
  });
  if (!response.ok) throw new Error('Failed to bulk override');
}

export async function removeCampaignRecipient(campaignId: number, patientId: number): Promise<void> {
  const response = await fetch(`${API_BASE}/campaigns/${campaignId}/recipients/${patientId}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to remove recipient');
}

export async function removeAllCampaignRecipients(campaignId: number): Promise<{ deleted: number }> {
  const response = await fetch(`${API_BASE}/campaigns/${campaignId}/recipients`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to remove all recipients');
  return await response.json();
}

export async function searchPatients(query: string): Promise<Array<{
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  procedure_interest: string;
  engagement_score: number;
}>> {
  const response = await fetch(`${API_BASE}/patients?search=${encodeURIComponent(query)}`);
  if (!response.ok) throw new Error('Failed to search patients');
  return await response.json();
}

export async function approveCampaign(
  id: number,
  dateRange?: { start: string; end: string }
): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/campaigns/${id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dateRange),
    });
    if (!response.ok) throw new Error('API not ready');
  } catch {
    console.log(`Mock: Approved campaign ${id}`);
  }
}

export interface DeliveryEntry {
  id: number;
  channel: string;
  status: string;
  sent_at: string;
  tracking_id: string | null;
  patient_name: string;
  email: string;
  cadence_step: number;
}

export interface SendResult {
  success: boolean;
  sent: number;
  failed: number;
  results: Array<{
    patient: string;
    email: string;
    status: string;
    emailId?: string;
    error?: string;
  }>;
}

export async function sendCampaign(id: number): Promise<SendResult> {
  const response = await fetch(`${API_BASE}/campaigns/${id}/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Failed to send campaign');
  }
  return await response.json();
}

export async function getCampaignDelivery(id: number): Promise<DeliveryEntry[]> {
  try {
    const response = await fetch(`${API_BASE}/campaigns/${id}/delivery`);
    if (!response.ok) throw new Error('API not ready');
    return await response.json();
  } catch {
    return [];
  }
}
