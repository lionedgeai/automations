import { useEffect, useState } from 'react';
import type { DeliveryEntry } from '../types';
import { getDeliveryLog, simulateDelivery } from '../api/delivery';

export default function DeliveryLogPage() {
  const [entries, setEntries] = useState<DeliveryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [channelFilter, setChannelFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    loadData();
  }, [channelFilter, statusFilter]);

  async function loadData() {
    setLoading(true);
    try {
      const filters: any = {};
      if (channelFilter) filters.channel = channelFilter;
      if (statusFilter) filters.status = statusFilter;
      const data = await getDeliveryLog(filters);
      setEntries(data);
    } catch (error) {
      console.error('Error loading delivery log:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSimulate() {
    setSimulating(true);
    try {
      const newEntry = await simulateDelivery();
      setEntries([newEntry, ...entries]);
    } catch (error) {
      console.error('Error simulating delivery:', error);
    } finally {
      setSimulating(false);
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'sent':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'delivered':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'opened':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'clicked':
        return 'bg-primary/10 text-primary-light border-primary/20';
      case 'failed':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'sent':
        return '✓';
      case 'delivered':
        return '✓';
      case 'opened':
        return '👁️';
      case 'clicked':
        return '🔗';
      case 'failed':
        return '✗';
      default:
        return '•';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white mb-6">Delivery Log</h1>
        <div className="animate-pulse card h-96 bg-slate-800"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Delivery Log</h1>
        <button
          onClick={handleSimulate}
          disabled={simulating}
          className="px-6 py-2 bg-primary hover:bg-primary-dark disabled:bg-slate-700 text-white rounded-lg font-medium transition-colors"
        >
          {simulating ? '🔄 Simulating...' : '🧪 Simulate Send'}
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Channel
            </label>
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Channels</option>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Statuses</option>
              <option value="sent">Sent</option>
              <option value="delivered">Delivered</option>
              <option value="opened">Opened</option>
              <option value="clicked">Clicked</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Delivery Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-slate-400 font-medium">
                  Timestamp
                </th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">
                  Recipient
                </th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">
                  Campaign
                </th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">
                  Channel
                </th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">
                  Content Preview
                </th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr
                  key={entry.id}
                  className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors"
                >
                  <td className="py-3 px-4 text-slate-400 text-sm">
                    {new Date(entry.sent_at).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="py-3 px-4 text-white">
                    {entry.patient_name}
                  </td>
                  <td className="py-3 px-4 text-slate-400 text-sm">
                    {entry.campaign_name}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded text-xs border ${
                        entry.channel === 'email'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          : 'bg-green-500/10 text-green-400 border-green-500/20'
                      }`}
                    >
                      {entry.channel === 'email' ? '📧 Email' : '📱 SMS'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded text-xs border ${getStatusBadge(
                        entry.status
                      )}`}
                    >
                      {getStatusIcon(entry.status)}{' '}
                      {entry.status.charAt(0).toUpperCase() +
                        entry.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400 text-sm max-w-md truncate">
                    {entry.content_preview}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {entries.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            No delivery records found
          </div>
        )}
      </div>
    </div>
  );
}
