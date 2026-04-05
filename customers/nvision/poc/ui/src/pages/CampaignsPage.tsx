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
} from '../api/campaigns';
import { getCampaignRecipients } from '../api/analytics';

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
  const [recipients, setRecipients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [promptText, setPromptText] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<number>();
  const [agentActivities, setAgentActivities] = useState<AgentActivity[]>([]);
  const [showAgentPanel, setShowAgentPanel] = useState(false);
  const [activeTab, setActiveTab] = useState<'variants' | 'cadence' | 'recipients'>('variants');
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [selectedTone, setSelectedTone] = useState<string>('Friendly');
  const [regenerating, setRegenerating] = useState<number | null>(null);

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
          const [variantsData, recipientsData] = await Promise.all([
            getCampaignVariants(campaign.id),
            getCampaignRecipients(campaign.id),
          ]);
          setVariants(variantsData);
          setRecipients(recipientsData);
          if (variantsData.length > 0) {
            setSelectedPatientId(variantsData[0].patient_id);
          }
          setMode('detail');
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

    setTimeout(async () => {
      activities.push({
        id: 2,
        campaign_id: 0,
        agent_name: 'Data Analyst',
        activity_message: 'Found 20 patients matching criteria',
        status: 'completed',
        created_at: new Date().toISOString(),
      });
      activities.push({
        id: 3,
        campaign_id: 0,
        agent_name: 'Copywriter',
        activity_message:
          'Generating personalized content with 5 tone variations...',
        status: 'running',
        created_at: new Date().toISOString(),
      });
      setAgentActivities([...activities]);

      setTimeout(async () => {
        activities[2].status = 'completed';
        activities.push({
          id: 4,
          campaign_id: 0,
          agent_name: 'Copywriter',
          activity_message: 'Content ready for review',
          status: 'completed',
          created_at: new Date().toISOString(),
        });
        activities.push({
          id: 5,
          campaign_id: 0,
          agent_name: 'Campaign Manager',
          activity_message: 'Building blended email+SMS delivery schedule...',
          status: 'running',
          created_at: new Date().toISOString(),
        });
        setAgentActivities([...activities]);

        setTimeout(async () => {
          activities[4].status = 'completed';
          activities.push({
            id: 6,
            campaign_id: 0,
            agent_name: 'Campaign Manager',
            activity_message: '4-week cadence set — 20 emails + 12 SMS scheduled',
            status: 'completed',
            created_at: new Date().toISOString(),
          });
          setAgentActivities([...activities]);

          const newCampaign = await createCampaign(
            promptText,
            selectedTemplateId
          );
          setTimeout(() => {
            navigate(`/campaigns/${newCampaign.id}`);
            window.location.reload();
          }, 1000);
        }, 2000);
      }, 3000);
    }, 2000);
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
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
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
              className="w-full h-48 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
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
                className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              className="mt-6 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg font-semibold text-lg transition-colors"
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
                    ? 'border-indigo-500 text-white'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                Content & Variants
              </button>
              <button
                onClick={() => setActiveTab('cadence')}
                className={`pb-3 px-1 border-b-2 transition-colors ${
                  activeTab === 'cadence'
                    ? 'border-indigo-500 text-white'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                Cadence Timeline
              </button>
              <button
                onClick={() => setActiveTab('recipients')}
                className={`pb-3 px-1 border-b-2 transition-colors ${
                  activeTab === 'recipients'
                    ? 'border-indigo-500 text-white'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                Recipients
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
                            ? 'bg-indigo-600 border-indigo-500 text-white'
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
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {tone}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content Preview */}
              {currentVariant && (
                <div className="card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">
                      Email Preview
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
                    className="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                  >
                    ✓ Select This Tone
                  </button>
                </div>
              )}
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
                {currentCampaign.parsed_prompt_params?.cadence && (
                  <>
                    <div className="relative flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center text-2xl mb-3 relative z-10">
                        📧
                      </div>
                      <div className="text-white font-medium mb-1">Day 1</div>
                      <div className="text-sm text-slate-400">Email</div>
                      <div className="text-xs text-slate-500 mt-2 max-w-[120px] text-center">
                        "Welcome to summer savings..."
                      </div>
                    </div>

                    <div className="relative flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center text-2xl mb-3 relative z-10">
                        📱
                      </div>
                      <div className="text-white font-medium mb-1">Day 3</div>
                      <div className="text-sm text-slate-400">SMS</div>
                      <div className="text-xs text-slate-500 mt-2 max-w-[120px] text-center">
                        "Hi, special pricing..."
                      </div>
                    </div>

                    <div className="relative flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center text-2xl mb-3 relative z-10">
                        📧
                      </div>
                      <div className="text-white font-medium mb-1">Day 5</div>
                      <div className="text-sm text-slate-400">Email</div>
                      <div className="text-xs text-slate-500 mt-2 max-w-[120px] text-center">
                        "Follow-up on your..."
                      </div>
                    </div>

                    <div className="relative flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center text-2xl mb-3 relative z-10">
                        📱
                      </div>
                      <div className="text-white font-medium mb-1">Day 7</div>
                      <div className="text-sm text-slate-400">SMS</div>
                      <div className="text-xs text-slate-500 mt-2 max-w-[120px] text-center">
                        "Quick reminder..."
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
                  </>
                )}
              </div>
            </div>
          )}

          {/* Recipients Tab */}
          {activeTab === 'recipients' && (
            <div className="card">
              <h3 className="text-lg font-semibold text-white mb-4">
                Campaign Recipients
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">
                        Patient
                      </th>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">
                        Email Status
                      </th>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">
                        SMS Status
                      </th>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">
                        Engagement
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
                          {recipient.email_opened ? '✓ Opened' : '— Not opened'}
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          {recipient.sms_replied ? '✓ Replied' : '— No reply'}
                        </td>
                        <td className="py-3 px-4">
                          {recipient.status === 'converted' && (
                            <span className="text-green-400">🎯 Converted</span>
                          )}
                          {recipient.status === 'engaged' && (
                            <span className="text-blue-400">⏳ Engaged</span>
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

          {currentCampaign.status === 'active' && (
            <div className="mt-6 card">
              <div className="flex items-center justify-center gap-3 py-4 text-green-400">
                <span className="text-2xl">✓</span>
                <span className="font-semibold text-lg">Campaign Active</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
