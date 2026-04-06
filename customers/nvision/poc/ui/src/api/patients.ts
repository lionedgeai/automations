import { Patient, PatientsFilter } from '../types';
import { mockPatients } from './mockData';

const API_BASE = 'http://localhost:3001/api';

export interface AIFilterResult {
  patients: Patient[];
  explanation: string;
  count: number;
  query: string;
}

export async function getPatients(filters?: PatientsFilter): Promise<Patient[]> {
  try {
    // Build query params
    const params = new URLSearchParams();
    if (filters?.procedure_interest && filters.procedure_interest !== 'All') {
      params.append('procedure_interest', filters.procedure_interest);
    }
    if (filters?.min_engagement_score) {
      params.append('min_engagement_score', filters.min_engagement_score.toString());
    }
    if (filters?.preferred_channel && filters.preferred_channel !== 'All') {
      params.append('preferred_channel', filters.preferred_channel);
    }

    const url = `${API_BASE}/patients${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('API call failed, falling back to mock data:', error);
    
    // Apply client-side filters to mock data
    let filtered = [...mockPatients];
    
    if (filters?.procedure_interest && filters.procedure_interest !== 'All') {
      filtered = filtered.filter(p => p.procedure_interest === filters.procedure_interest);
    }
    
    if (filters?.min_engagement_score !== undefined) {
      filtered = filtered.filter(p => p.engagement_score >= filters.min_engagement_score!);
    }
    
    if (filters?.preferred_channel && filters.preferred_channel !== 'All') {
      filtered = filtered.filter(p => p.preferred_channel === filters.preferred_channel);
    }
    
    return filtered;
  }
}

export async function aiFilterPatients(query: string): Promise<AIFilterResult> {
  const response = await fetch(`${API_BASE}/patients/ai-filter`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: 'AI filter failed' }));
    throw new Error(err.message || 'AI filter failed');
  }

  return response.json();
}

export async function getPatient(id: number): Promise<Patient | null> {
  try {
    const response = await fetch(`${API_BASE}/patients/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('API call failed, falling back to mock data:', error);
    return mockPatients.find(p => p.id === id) || null;
  }
}
