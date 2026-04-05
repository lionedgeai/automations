export interface Patient {
  id: number;
  salesforce_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  procedure_interest: 'LASIK' | 'Cataract' | 'Premium Lens';
  last_visit_date: string;
  consultation_notes: string;
  call_recording_summary: string;
  engagement_score: number;
  preferred_channel: 'email' | 'sms' | 'both';
  created_at: string;
}

export interface CampaignTemplate {
  id: number;
  name: string;
  type: string;
  target_procedure: string;
  base_prompt: string;
  email_subject_template: string;
  cadence_config: CadenceStep[];
  created_at: string;
}

export interface CadenceStep {
  day: number;
  channel: 'email' | 'sms' | 'voice';
}

export interface Campaign {
  id: number;
  template_id: number;
  name: string;
  status: 'draft' | 'generating' | 'in_review' | 'approved' | 'active' | 'completed';
  date_range_start: string;
  date_range_end: string;
  prompt_text: string;
  parsed_prompt_params: Record<string, any>;
  recipient_count: number;
  template_name?: string;
  created_at: string;
  updated_at: string;
}

export interface ContentVariant {
  id: number;
  campaign_id: number;
  patient_id: number;
  patient_name?: string;
  message_type: 'email' | 'sms';
  tone_label: string;
  subject_line: string;
  content: string;
  is_selected: boolean;
  created_at: string;
}

export interface DeliveryEntry {
  id: number;
  campaign_recipient_id: number;
  channel: 'email' | 'sms';
  sent_at: string;
  tracking_id: string;
  status: string;
  patient_name?: string;
  campaign_name?: string;
  content_preview?: string;
}

export interface AnalyticsMetric {
  id: number;
  campaign_id: number;
  metric_date: string;
  emails_sent: number;
  emails_opened: number;
  emails_clicked: number;
  sms_sent: number;
  sms_replied: number;
  conversions: number;
}

export interface AgentActivity {
  id: number;
  campaign_id: number;
  agent_name: string;
  activity_message: string;
  status: 'running' | 'completed' | 'error';
  created_at: string;
}

export interface DashboardStats {
  total_patients: number;
  active_campaigns: number;
  pending_review: number;
  total_sent: number;
  total_opened: number;
  total_clicked: number;
  total_conversions: number;
  open_rate: string;
  click_rate: string;
}

export interface DailySummary {
  id: number;
  campaign_id: number;
  report_date: string;
  summary_text: string;
  created_at: string;
}

export interface PatientsFilter {
  procedure_interest?: string;
  min_engagement_score?: number;
  preferred_channel?: string;
  search?: string;
}
