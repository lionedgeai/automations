import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { DashboardStats, DailySummary, Campaign } from '../types';
import { getDashboardStats, getDailySummaries } from '../api/dashboard';
import { getCampaigns } from '../api/campaigns';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [summaries, setSummaries] = useState<DailySummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, campaignsData, summariesData] = await Promise.all([
          getDashboardStats(),
          getCampaigns(),
          getDailySummaries(),
        ]);
        setStats(statsData);
        setCampaigns(campaignsData);
        setSummaries(summariesData);
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>
        <div className="animate-pulse">
          <div className="grid grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card h-32 bg-slate-800"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const getStatusColor = (status: Campaign['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'in_review':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'approved':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'generating':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'completed':
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="p-6">
      {/* Header with NVISION branding */}
      <div className="flex items-center gap-4 mb-6">
        <img
          src="https://www.nvisioncenters.com/wp-content/uploads/Nvision-Circle-Logo.png"
          alt="NVISION"
          className="w-10 h-10 rounded-full bg-white p-0.5"
        />
        <div>
          <h1 className="text-2xl font-bold text-white">Campaign Dashboard</h1>
          <p className="text-xs text-slate-400">NVISION Eye Centers — AI-Powered Marketing Automation</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        <div className="card bg-primary/5 border-primary/20">
          <div className="text-primary-light text-3xl mb-2">👥</div>
          <div className="text-3xl font-bold text-white mb-1">
            {stats.total_patients}
          </div>
          <div className="text-slate-400 text-sm">Total Patients</div>
        </div>

        <div className="card bg-green-500/5 border-green-500/20">
          <div className="text-green-400 text-3xl mb-2">🚀</div>
          <div className="text-3xl font-bold text-white mb-1">
            {stats.active_campaigns}
          </div>
          <div className="text-slate-400 text-sm">Active Campaigns</div>
        </div>

        <div className="card bg-amber-500/5 border-amber-500/20">
          <div className="text-amber-400 text-3xl mb-2">⏳</div>
          <div className="text-3xl font-bold text-white mb-1">
            {stats.pending_review}
          </div>
          <div className="text-slate-400 text-sm">Pending Review</div>
        </div>

        <div className="card bg-blue-500/5 border-blue-500/20">
          <div className="text-blue-400 text-3xl mb-2">📬</div>
          <div className="text-3xl font-bold text-white mb-1">
            {stats.total_sent}
          </div>
          <div className="text-slate-400 text-sm">Messages Sent</div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Campaign Performance */}
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4">
            Campaign Performance
          </h2>
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <Link
                key={campaign.id}
                to={`/campaigns/${campaign.id}`}
                className="block p-4 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors border border-slate-700"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-white">{campaign.name}</h3>
                  <span
                    className={`px-2 py-1 rounded text-xs border ${getStatusColor(
                      campaign.status
                    )}`}
                  >
                    {campaign.status === 'in_review'
                      ? 'In Review'
                      : campaign.status.charAt(0).toUpperCase() +
                        campaign.status.slice(1)}
                  </span>
                </div>
                <div className="flex gap-6 text-sm">
                  <div>
                    <span className="text-slate-400">Open Rate: </span>
                    <span className="text-white font-medium">
                      {stats.open_rate}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Click Rate: </span>
                    <span className="text-white font-medium">
                      {stats.click_rate}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Recipients: </span>
                    <span className="text-white font-medium">
                      {campaign.recipient_count}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Agent Activity */}
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4">
            Recent Agent Activity
          </h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50">
              <div className="text-green-400 text-xl mt-0.5">✓</div>
              <div className="flex-1">
                <div className="text-white font-medium">Data Analyst</div>
                <div className="text-slate-400 text-sm">
                  Found 20 patients matching criteria
                </div>
                <div className="text-slate-500 text-xs mt-1">2 hours ago</div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50">
              <div className="text-green-400 text-xl mt-0.5">✓</div>
              <div className="flex-1">
                <div className="text-white font-medium">Copywriter</div>
                <div className="text-slate-400 text-sm">
                  Generated 5 tone variations for each patient
                </div>
                <div className="text-slate-500 text-xs mt-1">2 hours ago</div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50">
              <div className="text-green-400 text-xl mt-0.5">✓</div>
              <div className="flex-1">
                <div className="text-white font-medium">Campaign Manager</div>
                <div className="text-slate-400 text-sm">
                  Scheduled 20 emails + 12 SMS messages
                </div>
                <div className="text-slate-500 text-xs mt-1">2 hours ago</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Summary */}
      {summaries.length > 0 && (
        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-white mb-3">
            Daily Summary
          </h2>
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">
                {new Date(summaries[0].report_date).toLocaleDateString(
                  'en-US',
                  {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }
                )}
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              {summaries[0].summary_text}
            </p>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-4">
          Quick Actions
        </h2>
        <div className="flex gap-4">
          <Link
            to="/campaigns"
            className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors"
          >
            + New Campaign
          </Link>
          <Link
            to="/patients"
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
          >
            View Patients
          </Link>
          <Link
            to="/analytics"
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
          >
            View Analytics
          </Link>
        </div>
      </div>
    </div>
  );
}
