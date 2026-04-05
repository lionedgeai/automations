import type { AnalyticsMetric } from '../types';
import { mockAnalytics, mockRecipients } from './mockCampaignData';

const API_BASE = 'http://localhost:3001/api';

export async function getAnalytics(): Promise<AnalyticsMetric[]> {
  try {
    const response = await fetch(`${API_BASE}/analytics`);
    if (!response.ok) throw new Error('API not ready');
    return await response.json();
  } catch {
    console.log('Using mock analytics');
    return mockAnalytics;
  }
}

export async function getCampaignAnalytics(
  campaignId: number
): Promise<AnalyticsMetric[]> {
  try {
    const response = await fetch(`${API_BASE}/analytics/${campaignId}`);
    if (!response.ok) throw new Error('API not ready');
    return await response.json();
  } catch {
    console.log(`Using mock analytics for campaign ${campaignId}`);
    return mockAnalytics.filter((a) => a.campaign_id === campaignId);
  }
}

export async function getCampaignRecipients(campaignId: number): Promise<
  Array<{
    id: number;
    patient_id: number;
    patient_name: string;
    email_opened: boolean;
    clicked: boolean;
    sms_replied: boolean;
    status: string;
  }>
> {
  try {
    const response = await fetch(
      `${API_BASE}/analytics/${campaignId}/recipients`
    );
    if (!response.ok) throw new Error('API not ready');
    return await response.json();
  } catch {
    console.log(`Using mock recipients for campaign ${campaignId}`);
    return mockRecipients;
  }
}
