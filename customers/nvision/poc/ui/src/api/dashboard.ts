import type { DashboardStats, DailySummary, AgentActivity } from '../types';
import {
  mockDashboardStats,
  mockDailySummaries,
  mockAgentActivity,
} from './mockCampaignData';

const API_BASE = 'http://localhost:3001/api';

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const response = await fetch(`${API_BASE}/dashboard/stats`);
    if (!response.ok) throw new Error('API not ready');
    return await response.json();
  } catch {
    console.log('Using mock dashboard stats');
    return mockDashboardStats;
  }
}

export async function getDailySummaries(): Promise<DailySummary[]> {
  try {
    const response = await fetch(`${API_BASE}/summaries`);
    if (!response.ok) throw new Error('API not ready');
    return await response.json();
  } catch {
    console.log('Using mock daily summaries');
    return mockDailySummaries;
  }
}

export async function getAgentActivity(
  campaignId: number
): Promise<AgentActivity[]> {
  try {
    const response = await fetch(`${API_BASE}/agent-activity/${campaignId}`);
    if (!response.ok) throw new Error('API not ready');
    return await response.json();
  } catch {
    console.log(`Using mock agent activity for campaign ${campaignId}`);
    return mockAgentActivity.filter((a) => a.campaign_id === campaignId);
  }
}
