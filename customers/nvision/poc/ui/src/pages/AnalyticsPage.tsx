import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import type { AnalyticsMetric, Campaign, DailySummary } from '../types';
import {
  getAnalytics,
  getCampaignAnalytics,
  getCampaignRecipients,
} from '../api/analytics';
import { getCampaigns } from '../api/campaigns';
import { getDailySummaries } from '../api/dashboard';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function AnalyticsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(
    null
  );
  const [metrics, setMetrics] = useState<AnalyticsMetric[]>([]);
  const [recipients, setRecipients] = useState<any[]>([]);
  const [summaries, setSummaries] = useState<DailySummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [campaignsData, metricsData, summariesData] = await Promise.all([
          getCampaigns(),
          getAnalytics(),
          getDailySummaries(),
        ]);
        setCampaigns(campaignsData);
        setMetrics(metricsData);
        setSummaries(summariesData);
        if (campaignsData.length > 0) {
          setSelectedCampaignId(campaignsData[0].id);
        }
      } catch (error) {
        console.error('Error loading analytics:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    async function loadCampaignData() {
      if (!selectedCampaignId) return;
      try {
        const [campaignMetrics, recipientsData] = await Promise.all([
          getCampaignAnalytics(selectedCampaignId),
          getCampaignRecipients(selectedCampaignId),
        ]);
        setMetrics(campaignMetrics);
        setRecipients(recipientsData);
      } catch (error) {
        console.error('Error loading campaign analytics:', error);
      }
    }
    loadCampaignData();
  }, [selectedCampaignId]);

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white mb-6">Analytics</h1>
        <div className="animate-pulse space-y-6">
          <div className="card h-64 bg-slate-800"></div>
          <div className="grid grid-cols-2 gap-6">
            <div className="card h-96 bg-slate-800"></div>
            <div className="card h-96 bg-slate-800"></div>
          </div>
        </div>
      </div>
    );
  }

  const lineChartData = {
    labels: metrics.map((m) =>
      new Date(m.metric_date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    ),
    datasets: [
      {
        label: 'Opens',
        data: metrics.map((m) => m.emails_opened + m.sms_replied),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.3,
      },
      {
        label: 'Clicks',
        data: metrics.map((m) => m.emails_clicked),
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        tension: 0.3,
      },
    ],
  };

  const totalEmailsSent = metrics.reduce((sum, m) => sum + m.emails_sent, 0);
  const totalSmsSent = metrics.reduce((sum, m) => sum + m.sms_sent, 0);
  const totalEmailsOpened = metrics.reduce(
    (sum, m) => sum + m.emails_opened,
    0
  );
  const totalEmailsClicked = metrics.reduce(
    (sum, m) => sum + m.emails_clicked,
    0
  );
  const totalSmsReplied = metrics.reduce((sum, m) => sum + m.sms_replied, 0);
  const totalConversions = metrics.reduce((sum, m) => sum + m.conversions, 0);

  const barChartData = {
    labels: ['Sent', 'Opened/Replied', 'Clicked/Replied', 'Conversions'],
    datasets: [
      {
        label: 'Email',
        data: [
          totalEmailsSent,
          totalEmailsOpened,
          totalEmailsClicked,
          totalConversions,
        ],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
      },
      {
        label: 'SMS',
        data: [
          totalSmsSent,
          totalSmsReplied,
          totalSmsReplied,
          totalConversions,
        ],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
      },
    ],
  };

  const totalSent = totalEmailsSent + totalSmsSent;
  const totalOpened = totalEmailsOpened + totalSmsReplied;
  const totalClicked = totalEmailsClicked;
  const bounced = Math.floor(totalSent * 0.02);

  const doughnutData = {
    labels: ['Opened', 'Clicked', 'Sent (Not Opened)', 'Bounced'],
    datasets: [
      {
        data: [totalOpened, totalClicked, totalSent - totalOpened, bounced],
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(100, 116, 139, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: 'rgb(148, 163, 184)',
        },
      },
    },
    scales: {
      y: {
        ticks: { color: 'rgb(148, 163, 184)' },
        grid: { color: 'rgba(100, 116, 139, 0.2)' },
      },
      x: {
        ticks: { color: 'rgb(148, 163, 184)' },
        grid: { color: 'rgba(100, 116, 139, 0.2)' },
      },
    },
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Analytics</h1>

      {/* Campaign Selector */}
      <div className="card mb-6">
        <label className="block text-sm text-slate-400 mb-2">
          Select Campaign
        </label>
        <select
          value={selectedCampaignId || ''}
          onChange={(e) => setSelectedCampaignId(parseInt(e.target.value))}
          className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {campaigns.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Line Chart */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          Engagement Over Time
        </h2>
        <div className="h-80">
          <Line data={lineChartData} options={chartOptions} />
        </div>
      </div>

      {/* Bar Chart and Doughnut Chart */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4">
            Channel Performance
          </h2>
          <div className="h-96">
            <Bar data={barChartData} options={chartOptions} />
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4">
            Message Status Breakdown
          </h2>
          <div className="h-96 flex items-center justify-center">
            <Doughnut
              data={doughnutData}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: { color: 'rgb(148, 163, 184)' },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Per-Recipient Table */}
      {recipients.length > 0 && (
        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Per-Recipient Breakdown
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">
                    Recipient
                  </th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">
                    Email Opened
                  </th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">
                    Clicked
                  </th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">
                    SMS Replied
                  </th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {recipients.map((recipient) => (
                  <tr
                    key={recipient.id}
                    className="border-b border-slate-800"
                  >
                    <td className="py-3 px-4 text-white">
                      {recipient.patient_name}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {recipient.email_opened ? (
                        <span className="text-green-400">✓ Yes</span>
                      ) : (
                        'No'
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {recipient.clicked ? (
                        <span className="text-green-400">✓ Yes</span>
                      ) : (
                        'No'
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {recipient.sms_replied ? (
                        <span className="text-green-400">✓ Yes</span>
                      ) : (
                        'No'
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {recipient.status === 'converted' && (
                        <span className="text-green-400">🎯 Converted</span>
                      )}
                      {recipient.status === 'engaged' && (
                        <span className="text-blue-400">⏳ Engaged</span>
                      )}
                      {recipient.status === 'viewed' && (
                        <span className="text-purple-400">👁️ Viewed</span>
                      )}
                      {recipient.status === 'not_opened' && (
                        <span className="text-slate-500">📭 Not Opened</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Daily Summary */}
      {summaries.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-3">
            Latest Daily Summary
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
    </div>
  );
}
