import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type {
  Campaign,
  CampaignTemplate,
  ContentVariant,
  AgentActivity,
} from '../types';
import {
  getCampaigns,
  getCampaign,
  getTemplates,
  createCampaign,
  getCampaignVariants,
  selectVariant,
  regenerateVariant,
  approveCampaign,
  deleteCampaign,
  sendCampaign,
  getCampaignDelivery,
  getCampaignRecipientsList,
  addCampaignRecipient,
  updateRecipientEmail,
  bulkOverrideEmails,
  removeCampaignRecipient,
  removeAllCampaignRecipients,
  searchPatients,
} from '../api/campaigns';
import type { DeliveryEntry, SendResult, CampaignRecipient } from '../api/campaigns';

type Mode = 'list' | 'new' | 'detail';

export default function CampaignsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>(id ? 'detail' : 'list');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [templates, setTemplates] = useState<CampaignTemplate[]>([]);
  const [currentCampaign, setCurrentCampaign] = useState<Campaign | null>(
    null
  );
  const [variants, setVariants] = useState<ContentVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [promptText, setPromptText] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<number>();
  const [agentActivities, setAgentActivities] = useState<AgentActivity[]>([]);
  const [showAgentPanel, setShowAgentPanel] = useState(false);
  const [activeTab, setActiveTab] = useState<'variants' | 'cadence' | 'recipients' | 'delivery'>('variants');
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [selectedTone, setSelectedTone] = useState<string>('Friendly');
  const [regenerating, setRegenerating] = useState<number | null>(null);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<SendResult | null>(null);
  const [deliveryLog, setDeliveryLog] = useState<DeliveryEntry[]>([]);
  const [managedRecipients, setManagedRecipients] = useState<CampaignRecipient[]>([]);
  const [editingEmail, setEditingEmail] = useState<Record<number, string>>({});
  const [showAddRecipient, setShowAddRecipient] = useState(false);
  const [patientSearch, setPatientSearch] = useState('');
  const [patientResults, setPatientResults] = useState<any[]>([]);
  const [searchingPatients, setSearchingPatients] = useState(false);
  const [bulkEmail, setBulkEmail] = useState('');

  async function handleDeleteCampaign(e: React.MouseEvent, campaignId: number) {
    e.stopPropagation();
    if (!confirm('Delete this campaign and all its data?')) return;
    await deleteCampaign(campaignId);
    setCampaigns(campaigns.filter(c => c.id !== campaignId));
  }

  useEffect(() => {
    async function loadData() {
      try {
        const [campaignsData, templatesData] = await Promise.all([
          getCampaigns(),
          getTemplates(),
        ]);
        setCampaigns(campaignsData);
        setTemplates(templatesData);

        if (id) {
          const campaign = await getCampaign(parseInt(id));
          setCurrentCampaign(campaign);
          const [variantsData, managedData] = await Promise.all([
            getCampaignVariants(campaign.id),
            getCampaignRecipientsList(campaign.id),
          ]);
          setVariants(variantsData);
          setManagedRecipients(managedData);
          if (variantsData.length > 0) {
            setSelectedPatientId(variantsData[0].patient_id);
          }
          setMode('detail');
        } else {
          setMode('list');
          setCurrentCampaign(null);
          setVariants([]);
          setManagedRecipients([]);
        }
      } catch (error) {
        console.error('Error loading campaigns:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handleCreateCampaign = async () => {
    if (!promptText.trim()) return;

    setShowAgentPanel(true);

    // Fire API call immediately (runs in background)
    const apiPromise = createCampaign(promptText, selectedTemplateId);

    // Animate agent activity in parallel
    const activities: AgentActivity[] = [
      {
        id: 1,
        campaign_id: 0,
        agent_name: 'Data Analyst',
        activity_message: 'Querying Salesforce for matching patients...',
        status: 'running',
        created_at: new Date().toISOString(),
      },
    ];
    setAgentActivities([...activities]);

    const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

    await delay(2000);
    activities[0].status = 'completed';
    activities[0].activity_message = 'Found matching patients';
    activities.push({
      id: 2,
      campaign_id: 0,
      agent_name: 'Copywriter',
      activity_message: 'Generating personalized content with 5 tone variations...',
      status: 'running',
      created_at: new Date().toISOString(),
    });
    setAgentActivities([...activities]);

    await delay(2000);
    activities.push({
      id: 3,
      campaign_id: 0,
      agent_name: 'Campaign Manager',
      activity_message: 'Building blended email+SMS delivery schedule...',
      status: 'running',
      created_at: new Date().toISOString(),
    });
    setAgentActivities([...activities]);

    // Wait for the real API call to finish
    try {
      const newCampaign = await apiPromise;

      // Mark all as completed
      for (const a of activities) a.status = 'completed';
      activities[1].activity_message = 'Content ready for review';
      activities[2].activity_message = `Cadence set — ${newCampaign.recipient_count || 0} recipients scheduled`;
      activities.push({
        id: 4,
        campaign_id: 0,
        agent_name: 'Campaign Manager',
        activity_message: '✅ Campaign ready for review',
        status: 'completed',
        created_at: new Date().toISOString(),
      });
      setAgentActivities([...activities]);

      await delay(1000);
      navigate(`/campaigns/${newCampaign.id}`);
    } catch (err) {
      activities.push({
        id: 99,
        campaign_id: 0,
        agent_name: 'System',
        activity_message: `❌ Campaign creation failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
        status: 'completed',
        created_at: new Date().toISOString(),
      });
      setAgentActivities([...activities]);
    }
  };

  const handleApprove = async () => {
    if (!currentCampaign) return;
    const confirmed = window.confirm(
      `This will schedule ${currentCampaign.recipient_count} messages for delivery starting ${currentCampaign.date_range_start}. Continue?`
    );
    if (!confirmed) return;

    await approveCampaign(currentCampaign.id);
    setCurrentCampaign({ ...currentCampaign, status: 'active' });
  };

  const handleRegenerateVariant = async (variantId: number) => {
    setRegenerating(variantId);
    try {
      const newVariant = await regenerateVariant(
        currentCampaign!.id,
        variantId,
        selectedTone
      );
      setVariants(
        variants.map((v) => (v.id === variantId ? newVariant : v))
      );
    } finally {
      setRegenerating(null);
    }
  };

  const getStatusColor = (status: Campaign['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-400 border-green-500/20 animate-pulse';
      case 'in_review':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'approved':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'generating':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20 animate-pulse';
      case 'completed':
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      default:
        return 'bg-slate-600/10 text-slate-400 border-slate-600/20';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white mb-6">Campaigns</h1>
        <div className="animate-pulse card h-64 bg-slate-800"></div>
      </div>
    );
  }

  const tones = [
    'Medical/Professional',
    'Informative',
    'Friendly',
    'Casual',
    'Empathetic',
  ];

  const patientVariants = variants.filter(
    (v) => v.patient_id === selectedPatientId
  );
  const currentVariant = patientVariants.find(
    (v) => v.tone_label === selectedTone
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Campaigns</h1>
        {mode === 'list' && (
          <button
            onClick={() => setMode('new')}
            className="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors"
          >
            + New Campaign
          </button>
        )}
        {mode === 'new' && (
          <button
            onClick={() => setMode('list')}
            className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
          >
            ← Back to List
          </button>
        )}
        {mode === 'detail' && (
          <button
            onClick={() => navigate('/campaigns')}
            className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
          >
            ← Back to List
          </button>
        )}
      </div>

      {/* MODE A: Campaign List */}
      {mode === 'list' && (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">
                    Name
                  </th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">
                    Template
                  </th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">
                    Recipients
                  </th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">
                    Date Range
                  </th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">
                    Created
                  </th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign) => (
                  <tr
                    key={campaign.id}
                    onClick={() => navigate(`/campaigns/${campaign.id}`)}
                    className="border-b border-slate-800 hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 text-white font-medium">
                      {campaign.name}
                    </td>
                    <td className="py-3 px-4">
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
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {campaign.template_name || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {campaign.recipient_count}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {campaign.date_range_start} — {campaign.date_range_end}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(campaign.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => handleDeleteCampaign(e, campaign.id)}
                        className="px-2 py-1 text-xs text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded transition-colors"
                        title="Delete campaign"
                      >
                        🗑 Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODE B: New Campaign (Prompt Interface) */}
      {mode === 'new' && (
        <div className="max-w-4xl mx-auto">
          <div className="card mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Describe Your Campaign
            </h2>
            <textarea
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="Describe the campaign you want to run... e.g., 'Run a year-end LASIK promotion for all consultation patients who haven't converted, with pricing starting at $500/eye, running through August 31st'"
              className="w-full h-48 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />

            <div className="mt-4">
              <label className="block text-sm text-slate-400 mb-2">
                Template (optional)
              </label>
              <select
                value={selectedTemplateId || ''}
                onChange={(e) =>
                  setSelectedTemplateId(
                    e.target.value ? parseInt(e.target.value) : undefined
                  )
                }
                className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Auto-select from prompt</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleCreateCampaign}
              disabled={!promptText.trim()}
              className="mt-6 px-8 py-3 bg-primary hover:bg-primary-dark disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg font-semibold text-lg transition-colors"
            >
              🚀 Launch Campaign
            </button>
          </div>

          {/* Agent Activity Panel */}
          {showAgentPanel && (
            <div className="card">
              <h2 className="text-xl font-semibold text-white mb-4">
                AI Agents Working...
              </h2>
              <div className="space-y-3">
                {agentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50"
                  >
                    {activity.status === 'running' ? (
                      <div className="text-blue-400 text-xl mt-0.5 animate-spin">
                        ⏳
                      </div>
                    ) : (
                      <div className="text-green-400 text-xl mt-0.5">✓</div>
                    )}
                    <div className="flex-1">
                      <div className="text-white font-medium">
                        {activity.agent_name}
                      </div>
                      <div className="text-slate-400 text-sm">
                        {activity.activity_message}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {agentActivities.length >= 6 && (
                <div className="mt-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                  <h3 className="font-semibold text-white mb-3">
                    Campaign: {currentCampaign?.name || 'Summer LASIK Promo'}
                  </h3>
                  <div className="space-y-1 text-sm text-slate-300">
                    <div>
                      <span className="text-slate-400">Target: </span>
                      LASIK patients, engagement &gt; 70
                    </div>
                    <div>
                      <span className="text-slate-400">Date Range: </span>
                      April 15 — August 31, 2026
                    </div>
                    <div>
                      <span className="text-slate-400">Recipients: </span>
                      20 patients
                    </div>
                    <div>
                      <span className="text-slate-400">Cadence: </span>
                      Email (Day 1) → SMS (Day 3) → Email (Day 5) → SMS (Day 7)
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* MODE C: Campaign Detail */}
      {mode === 'detail' && currentCampaign && (
        <div>
          {/* Campaign Header */}
          <div className="card mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {currentCampaign.name}
                </h2>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <span>
                    {currentCampaign.date_range_start} —{' '}
                    {currentCampaign.date_range_end}
                  </span>
                  <span>•</span>
                  <span>{currentCampaign.recipient_count} recipients</span>
                </div>
              </div>
              <span
                className={`px-3 py-1.5 rounded text-sm border ${getStatusColor(
                  currentCampaign.status
                )}`}
              >
                {currentCampaign.status === 'in_review'
                  ? 'In Review'
                  : currentCampaign.status.charAt(0).toUpperCase() +
                    currentCampaign.status.slice(1)}
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6 border-b border-slate-700">
            <div className="flex gap-6">
              <button
                onClick={() => setActiveTab('variants')}
                className={`pb-3 px-1 border-b-2 transition-colors ${
                  activeTab === 'variants'
                    ? 'border-primary text-white'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                Content & Variants
              </button>
              <button
                onClick={() => setActiveTab('cadence')}
                className={`pb-3 px-1 border-b-2 transition-colors ${
                  activeTab === 'cadence'
                    ? 'border-primary text-white'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                Cadence Timeline
              </button>
              <button
                onClick={async () => {
                  setActiveTab('recipients');
                  if (currentCampaign) {
                    const recs = await getCampaignRecipientsList(currentCampaign.id);
                    setManagedRecipients(recs);
                  }
                }}
                className={`pb-3 px-1 border-b-2 transition-colors ${
                  activeTab === 'recipients'
                    ? 'border-primary text-white'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                Recipients
              </button>
              <button
                onClick={async () => {
                  setActiveTab('delivery');
                  if (currentCampaign) {
                    const log = await getCampaignDelivery(currentCampaign.id);
                    setDeliveryLog(log);
                  }
                }}
                className={`pb-3 px-1 border-b-2 transition-colors ${
                  activeTab === 'delivery'
                    ? 'border-primary text-white'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                📧 Delivery {deliveryLog.length > 0 && <span className="ml-1 px-1.5 py-0.5 text-xs bg-emerald-500/20 text-emerald-300 rounded">{deliveryLog.length}</span>}
              </button>
            </div>
          </div>

          {/* Content & Variants Tab */}
          {activeTab === 'variants' && (
            <div>
              {/* Patient Selector */}
              <div className="card mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Select Patient
                </h3>
                <div className="flex gap-3 flex-wrap">
                  {Array.from(
                    new Set(variants.map((v) => v.patient_id))
                  ).map((patientId) => {
                    const variant = variants.find(
                      (v) => v.patient_id === patientId
                    );
                    return (
                      <button
                        key={patientId}
                        onClick={() => setSelectedPatientId(patientId)}
                        className={`px-4 py-2 rounded-lg border transition-colors ${
                          selectedPatientId === patientId
                            ? 'bg-primary border-primary text-white'
                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {variant?.patient_name || `Patient ${patientId}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tone Selector */}
              <div className="card mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Select Tone
                </h3>
                <div className="flex gap-3 flex-wrap">
                  {tones.map((tone) => (
                    <button
                      key={tone}
                      onClick={() => setSelectedTone(tone)}
                      className={`px-4 py-2 rounded-lg border transition-all ${
                        selectedTone === tone
                          ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {tone}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content Preview — Email */}
              {currentVariant && currentVariant.message_type !== 'sms' && (
                <div className="card mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">
                      📧 Email Preview
                    </h3>
                    <button
                      onClick={() => handleRegenerateVariant(currentVariant.id)}
                      disabled={regenerating === currentVariant.id}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 text-white rounded-lg text-sm transition-colors"
                    >
                      {regenerating === currentVariant.id
                        ? '🔄 Regenerating...'
                        : '🔄 Regenerate'}
                    </button>
                  </div>

                  <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                    <div className="mb-4">
                      <div className="text-xs text-slate-500 mb-1">Subject</div>
                      <div className="text-white font-medium">
                        {currentVariant.subject_line}
                      </div>
                    </div>
                    <div className="border-t border-slate-700 pt-4">
                      <div className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                        {currentVariant.content}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      selectVariant(currentCampaign.id, currentVariant.id)
                    }
                    className="mt-4 px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors"
                  >
                    ✓ Select This Tone
                  </button>
                </div>
              )}

              {/* Content Preview — SMS */}
              {(() => {
                const smsVariant = patientVariants.find(
                  (v) => v.message_type === 'sms' && v.tone_label === selectedTone
                );
                if (!smsVariant) return null;
                return (
                  <div className="card">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">
                        📱 SMS Preview
                      </h3>
                      <button
                        onClick={() => handleRegenerateVariant(smsVariant.id)}
                        disabled={regenerating === smsVariant.id}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 text-white rounded-lg text-sm transition-colors"
                      >
                        {regenerating === smsVariant.id
                          ? '🔄 Regenerating...'
                          : '🔄 Regenerate'}
                      </button>
                    </div>

                    <div className="bg-slate-800 rounded-lg p-4 border border-green-500/30 max-w-sm">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-sm shrink-0">📱</div>
                        <div>
                          <div className="bg-green-600/20 rounded-2xl rounded-tl-none px-4 py-3">
                            <div className="text-slate-200 text-sm">
                              {smsVariant.content}
                            </div>
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            {smsVariant.content?.length || 0}/160 characters
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Cadence Timeline Tab */}
          {activeTab === 'cadence' && (
            <div className="card">
              <h3 className="text-lg font-semibold text-white mb-6">
                Delivery Schedule
              </h3>
              <div className="flex justify-between items-start relative">
                <div className="absolute top-8 left-0 right-0 h-0.5 bg-slate-700"></div>
                    <div className="relative flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center text-2xl mb-3 relative z-10">
                        📧
                      </div>
                      <div className="text-white font-medium mb-1">Day 1</div>
                      <div className="text-sm text-slate-400">Email</div>
                      <div className="text-xs text-slate-500 mt-2 max-w-[120px] text-center">
                        Initial outreach with personalized offer
                      </div>
                    </div>

                    <div className="relative flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center text-2xl mb-3 relative z-10">
                        📱
                      </div>
                      <div className="text-white font-medium mb-1">Day 3</div>
                      <div className="text-sm text-slate-400">SMS</div>
                      <div className="text-xs text-slate-500 mt-2 max-w-[120px] text-center">
                        Quick follow-up reminder
                      </div>
                    </div>

                    <div className="relative flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center text-2xl mb-3 relative z-10">
                        📧
                      </div>
                      <div className="text-white font-medium mb-1">Day 5</div>
                      <div className="text-sm text-slate-400">Email</div>
                      <div className="text-xs text-slate-500 mt-2 max-w-[120px] text-center">
                        Educational content + social proof
                      </div>
                    </div>

                    <div className="relative flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center text-2xl mb-3 relative z-10">
                        📱
                      </div>
                      <div className="text-white font-medium mb-1">Day 7</div>
                      <div className="text-sm text-slate-400">SMS</div>
                      <div className="text-xs text-slate-500 mt-2 max-w-[120px] text-center">
                        Final nudge with urgency
                      </div>
                    </div>

                    <div className="relative flex flex-col items-center opacity-50">
                      <div className="w-16 h-16 rounded-full bg-slate-600/20 border-2 border-slate-600 border-dashed flex items-center justify-center text-2xl mb-3 relative z-10">
                        📞
                      </div>
                      <div className="text-white font-medium mb-1">Day 10</div>
                      <div className="text-sm text-slate-400">Voice</div>
                      <div className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-400 mt-2">
                        Coming Soon
                      </div>
                    </div>
              </div>
            </div>
          )}

          {/* Recipients Tab */}
          {activeTab === 'recipients' && (
            <div className="space-y-4">
              {/* Bulk email override */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Campaign Recipients</h3>
                  <div className="flex gap-2">
                    {managedRecipients.length > 0 && (
                      <button
                        onClick={async () => {
                          if (!currentCampaign || !confirm(`Remove ALL ${managedRecipients.length} recipients from this campaign?`)) return;
                          await removeAllCampaignRecipients(currentCampaign.id);
                          setManagedRecipients([]);
                        }}
                        className="px-4 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-600/30 rounded-lg text-sm font-medium transition-colors"
                      >
                        🗑 Clear All
                      </button>
                    )}
                    <button
                      onClick={() => setShowAddRecipient(!showAddRecipient)}
                      className="px-4 py-2 bg-primary hover:bg-primary text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      + Add Recipient
                    </button>
                  </div>
                </div>

                {/* Bulk override for demo */}
                <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-400 whitespace-nowrap">📧 Send all to:</span>
                    <input
                      type="email"
                      value={bulkEmail}
                      onChange={(e) => setBulkEmail(e.target.value)}
                      placeholder="e.g. elad@lionedgeai.com (demo override)"
                      className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                      onClick={async () => {
                        if (!currentCampaign) return;
                        await bulkOverrideEmails(currentCampaign.id, bulkEmail || null);
                        const updated = await getCampaignRecipientsList(currentCampaign.id);
                        setManagedRecipients(updated);
                      }}
                      className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-sm font-medium transition-colors whitespace-nowrap"
                    >
                      {bulkEmail ? 'Apply Override' : 'Clear Overrides'}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Override all recipient emails for demo — real emails will go to this address instead.</p>
                </div>

                {/* Add Recipient Panel */}
                {showAddRecipient && (
                  <div className="p-4 bg-slate-800/50 rounded-lg border border-primary/30 mb-4">
                    <h4 className="text-sm font-medium text-white mb-3">Search Patients</h4>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={patientSearch}
                        onChange={(e) => setPatientSearch(e.target.value)}
                        onKeyDown={async (e) => {
                          if (e.key === 'Enter' && patientSearch.trim()) {
                            setSearchingPatients(true);
                            try {
                              const results = await searchPatients(patientSearch);
                              setPatientResults(results);
                            } catch { /* ignore */ }
                            setSearchingPatients(false);
                          }
                        }}
                        placeholder="Search by name or email..."
                        className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <button
                        onClick={async () => {
                          if (!patientSearch.trim()) return;
                          setSearchingPatients(true);
                          try {
                            const results = await searchPatients(patientSearch);
                            setPatientResults(results);
                          } catch { /* ignore */ }
                          setSearchingPatients(false);
                        }}
                        disabled={searchingPatients}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors"
                      >
                        {searchingPatients ? '...' : 'Search'}
                      </button>
                    </div>
                    {patientResults.length > 0 && (
                      <div className="space-y-1 max-h-48 overflow-y-auto">
                        {patientResults.map((p) => {
                          const alreadyAdded = managedRecipients.some(r => r.patient_id === p.id);
                          return (
                            <div key={p.id} className="flex items-center justify-between p-2 rounded bg-slate-900/50 hover:bg-slate-900">
                              <div>
                                <span className="text-white text-sm">{p.first_name} {p.last_name}</span>
                                <span className="text-slate-500 text-xs ml-2">{p.email}</span>
                                <span className="text-slate-600 text-xs ml-2">{p.procedure_interest}</span>
                              </div>
                              <button
                                onClick={async () => {
                                  if (!currentCampaign || alreadyAdded) return;
                                  try {
                                    await addCampaignRecipient(currentCampaign.id, p.id, bulkEmail || undefined);
                                    const updated = await getCampaignRecipientsList(currentCampaign.id);
                                    setManagedRecipients(updated);
                                  } catch (err: any) {
                                    alert(err.message);
                                  }
                                }}
                                disabled={alreadyAdded}
                                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                                  alreadyAdded
                                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                    : 'bg-primary hover:bg-primary text-white'
                                }`}
                              >
                                {alreadyAdded ? 'Added' : '+ Add'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Recipients Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Patient</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Original Email</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Send To (Override)</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Procedure</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Score</th>
                        <th className="text-left py-3 px-3 text-slate-400 font-medium w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {managedRecipients.map((r) => (
                        <tr key={r.patient_id} className="border-b border-slate-800 group">
                          <td className="py-3 px-4 text-white">{r.patient_name}</td>
                          <td className="py-3 px-4 text-slate-400 text-sm">{r.original_email}</td>
                          <td className="py-2 px-4">
                            <input
                              type="email"
                              value={editingEmail[r.patient_id] ?? r.email_override ?? ''}
                              onChange={(e) => setEditingEmail({ ...editingEmail, [r.patient_id]: e.target.value })}
                              onBlur={async () => {
                                if (!currentCampaign) return;
                                const val = editingEmail[r.patient_id];
                                if (val === undefined) return;
                                await updateRecipientEmail(currentCampaign.id, r.patient_id, val || null);
                                const updated = await getCampaignRecipientsList(currentCampaign.id);
                                setManagedRecipients(updated);
                                setEditingEmail((prev) => { const copy = { ...prev }; delete copy[r.patient_id]; return copy; });
                              }}
                              placeholder="Use original"
                              className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                          </td>
                          <td className="py-3 px-4 text-slate-400 text-sm">{r.procedure_interest}</td>
                          <td className="py-3 px-4">
                            <span className={`text-sm font-medium ${(r.engagement_score || 0) >= 70 ? 'text-green-400' : (r.engagement_score || 0) >= 40 ? 'text-amber-400' : 'text-slate-400'}`}>
                              {r.engagement_score || 0}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <button
                              onClick={async () => {
                                if (!currentCampaign || !confirm(`Remove ${r.patient_name} from campaign?`)) return;
                                await removeCampaignRecipient(currentCampaign.id, r.patient_id);
                                const updated = await getCampaignRecipientsList(currentCampaign.id);
                                setManagedRecipients(updated);
                              }}
                              className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all text-sm"
                              title="Remove"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      ))}
                      {managedRecipients.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-500">
                            No recipients yet. Click "+ Add Recipient" to add patients.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="mt-3 text-sm text-slate-500">
                  {managedRecipients.length} recipient{managedRecipients.length !== 1 ? 's' : ''} •
                  {managedRecipients.filter(r => r.email_override).length > 0 && (
                    <span className="text-amber-400 ml-1">
                      {managedRecipients.filter(r => r.email_override).length} with email override
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Delivery Tab */}
          {activeTab === 'delivery' && (
            <div className="card">
              <h3 className="text-lg font-semibold text-white mb-4">
                Email Delivery Log
              </h3>
              {deliveryLog.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <div className="text-4xl mb-3">📭</div>
                  <p>No emails sent yet.</p>
                  <p className="text-sm mt-1">Approve the campaign and click "Send Campaign" to deliver emails.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Patient</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Email</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Status</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Sent At</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Tracking ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deliveryLog.map((entry) => (
                        <tr key={entry.id} className="border-b border-slate-800">
                          <td className="py-3 px-4 text-white">{entry.patient_name}</td>
                          <td className="py-3 px-4 text-slate-400 text-sm">{entry.email}</td>
                          <td className="py-3 px-4">
                            {entry.status === 'sent' && (
                              <span className="px-2 py-1 text-xs bg-green-500/20 text-green-300 border border-green-500/30 rounded">
                                ✓ Sent
                              </span>
                            )}
                            {entry.status === 'delivered' && (
                              <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded">
                                📬 Delivered
                              </span>
                            )}
                            {entry.status === 'failed' && (
                              <span className="px-2 py-1 text-xs bg-red-500/20 text-red-300 border border-red-500/30 rounded">
                                ✗ Failed
                              </span>
                            )}
                            {!['sent', 'delivered', 'failed'].includes(entry.status) && (
                              <span className="px-2 py-1 text-xs bg-slate-500/20 text-slate-300 border border-slate-500/30 rounded">
                                {entry.status}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-400 text-sm">
                            {entry.sent_at ? new Date(entry.sent_at).toLocaleString() : '—'}
                          </td>
                          <td className="py-3 px-4 text-slate-500 text-xs font-mono">
                            {entry.tracking_id || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Send result summary */}
              {sendResult && (
                <div className={`mt-4 p-4 rounded-lg border ${sendResult.failed > 0 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-green-500/10 border-green-500/30'}`}>
                  <div className="font-medium text-white mb-2">
                    {sendResult.sent > 0 ? '✅' : '❌'} Send Complete: {sendResult.sent} sent, {sendResult.failed} failed
                  </div>
                  <div className="space-y-1">
                    {sendResult.results.map((r, i) => (
                      <div key={i} className="text-sm text-slate-300">
                        {r.status === 'sent' ? '✓' : '✗'} {r.patient} ({r.email})
                        {r.error && <span className="text-red-400 ml-2">— {r.error}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Approve Button */}
          {currentCampaign.status === 'in_review' && (
            <div className="mt-6 card">
              <button
                onClick={handleApprove}
                className="w-full px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-lg transition-colors"
              >
                ✅ Approve & Schedule Campaign
              </button>
            </div>
          )}

          {/* Send Campaign Button — visible for approved/active campaigns */}
          {['approved', 'active'].includes(currentCampaign.status) && (
            <div className="mt-6 card">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-semibold">📧 Send Real Emails</h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Deliver the selected email variants to all recipients via Resend.
                  </p>
                </div>
                <button
                  onClick={async () => {
                    if (!confirm(`Send real emails to ${currentCampaign.recipient_count || 'all'} recipients? This will deliver to their actual inboxes.`)) return;
                    setSending(true);
                    setSendResult(null);
                    try {
                      const result = await sendCampaign(currentCampaign.id);
                      setSendResult(result);
                      setActiveTab('delivery');
                      const log = await getCampaignDelivery(currentCampaign.id);
                      setDeliveryLog(log);
                    } catch (err: any) {
                      setSendResult({ success: false, sent: 0, failed: 1, results: [{ patient: 'Error', email: '', status: 'failed', error: err.message }] });
                      setActiveTab('delivery');
                    } finally {
                      setSending(false);
                    }
                  }}
                  disabled={sending}
                  className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                >
                  {sending ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      Sending...
                    </>
                  ) : (
                    <>📧 Send Campaign</>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
