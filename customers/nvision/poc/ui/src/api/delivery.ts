import type { DeliveryEntry } from '../types';
import { mockDeliveryLog } from './mockCampaignData';

const API_BASE = 'http://localhost:3001/api';

export async function getDeliveryLog(filters?: {
  campaign_id?: number;
  channel?: string;
  status?: string;
}): Promise<DeliveryEntry[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.campaign_id)
      params.append('campaign_id', filters.campaign_id.toString());
    if (filters?.channel) params.append('channel', filters.channel);
    if (filters?.status) params.append('status', filters.status);

    const response = await fetch(
      `${API_BASE}/delivery?${params.toString()}`
    );
    if (!response.ok) throw new Error('API not ready');
    return await response.json();
  } catch {
    console.log('Using mock delivery log');
    let filtered = [...mockDeliveryLog];

    if (filters?.channel) {
      filtered = filtered.filter((d) => d.channel === filters.channel);
    }
    if (filters?.status) {
      filtered = filtered.filter((d) => d.status === filters.status);
    }

    return filtered.sort(
      (a, b) =>
        new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime()
    );
  }
}

export async function simulateDelivery(): Promise<DeliveryEntry> {
  try {
    const response = await fetch(`${API_BASE}/delivery/simulate`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('API not ready');
    return await response.json();
  } catch {
    console.log('Mock: Simulating delivery');
    const newEntry: DeliveryEntry = {
      id: Date.now(),
      campaign_recipient_id: Math.floor(Math.random() * 100),
      channel: Math.random() > 0.5 ? 'email' : 'sms',
      sent_at: new Date().toISOString(),
      tracking_id: `trk_${Date.now()}`,
      status: 'sent',
      patient_name: 'Test Patient',
      campaign_name: 'Test Campaign',
      content_preview: 'This is a simulated delivery test...',
    };
    return newEntry;
  }
}
