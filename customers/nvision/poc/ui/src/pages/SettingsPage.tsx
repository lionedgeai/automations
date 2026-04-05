import { useEffect, useState } from 'react';
import { getAIStatus, testAIConnection, updateAIConfig } from '../api/settings';
import type { AIStatus } from '../api/settings';

export default function SettingsPage() {
  const [status, setStatus] = useState<AIStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [provider, setProvider] = useState('mock');
  const [anthropicKey, setAnthropicKey] = useState('');
  const [anthropicModel, setAnthropicModel] = useState('claude-sonnet-4-20250514');
  const [openaiKey, setOpenaiKey] = useState('');
  const [openaiModel, setOpenaiModel] = useState('gpt-4o');
  const [githubToken, setGithubToken] = useState('');
  const [githubModel, setGithubModel] = useState('openai/gpt-4o');

  useEffect(() => {
    async function load() {
      try {
        const s = await getAIStatus();
        setStatus(s);
        setProvider(s.active_provider);
        setAnthropicModel(s.models.anthropic);
        setOpenaiModel(s.models.openai);
        if (s.models.github) setGithubModel(s.models.github);
      } catch {
        console.log('Could not load AI status');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      const config: Record<string, string> = { provider };
      if (anthropicKey) config.anthropic_api_key = anthropicKey;
      if (anthropicModel) config.anthropic_model = anthropicModel;
      if (openaiKey) config.openai_api_key = openaiKey;
      if (openaiModel) config.openai_model = openaiModel;
      if (githubToken) config.github_token = githubToken;
      if (githubModel) config.github_model = githubModel;

      const updated = await updateAIConfig(config);
      setStatus(updated);
      setProvider(updated.active_provider);
      setMessage({ type: 'success', text: `Switched to ${updated.active_provider} provider` });
    } catch {
      setMessage({ type: 'error', text: 'Failed to update configuration' });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>
        <div className="animate-pulse card h-64 bg-slate-800" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>

      {/* Current Status */}
      {status && (
        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-white mb-3">Current AI Status</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${status.active_provider !== 'mock' ? 'bg-green-400' : 'bg-yellow-400'}`} />
              <span className="text-slate-300 text-sm">
                Active: <span className="text-white font-medium">{status.active_provider}</span>
              </span>
            </div>
            {status.configured.anthropic && (
              <span className="px-2 py-0.5 text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded">
                Anthropic ✓
              </span>
            )}
            {status.configured.openai && (
              <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-300 border border-green-500/30 rounded">
                OpenAI ✓
              </span>
            )}
            {status.configured.github && (
              <span className="px-2 py-0.5 text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded">
                GitHub ✓
              </span>
            )}
          </div>
        </div>
      )}

      {/* Provider Selection */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">AI Provider</h2>

        <div className="space-y-3 mb-6">
          {[
            { value: 'github', label: 'GitHub Copilot (Models API)', desc: 'Use your GitHub PAT — access GPT-4o, Claude, and more via models.github.ai' },
            { value: 'anthropic', label: 'Anthropic (Claude)', desc: 'Best quality for healthcare content generation' },
            { value: 'openai', label: 'OpenAI (ChatGPT)', desc: 'Fast, reliable content generation' },
            { value: 'mock', label: 'Mock (Templates)', desc: 'No API key needed — uses hardcoded templates' },
          ].map((opt) => (
            <label
              key={opt.value}
              className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                provider === opt.value
                  ? 'border-indigo-500 bg-indigo-500/10'
                  : 'border-slate-700 hover:border-slate-600'
              }`}
            >
              <input
                type="radio"
                name="provider"
                value={opt.value}
                checked={provider === opt.value}
                onChange={() => setProvider(opt.value)}
                className="mt-1 accent-indigo-500"
              />
              <div>
                <span className="text-white font-medium">{opt.label}</span>
                <p className="text-slate-400 text-sm mt-0.5">{opt.desc}</p>
              </div>
            </label>
          ))}
        </div>

        {/* Anthropic Config */}
        {provider === 'anthropic' && (
          <div className="space-y-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700 mb-4">
            <h3 className="text-sm font-medium text-slate-300">Anthropic Configuration</h3>
            <div>
              <label className="block text-xs text-slate-400 mb-1">API Key</label>
              <input
                type="password"
                value={anthropicKey}
                onChange={(e) => setAnthropicKey(e.target.value)}
                placeholder={status?.configured.anthropic ? '••••••••••• (already set)' : 'sk-ant-api03-...'}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Model</label>
              <select
                value={anthropicModel}
                onChange={(e) => setAnthropicModel(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="claude-sonnet-4-20250514">Claude Sonnet 4 (Recommended)</option>
                <option value="claude-haiku-4-5-20251001">Claude Haiku 4.5 (Faster/Cheaper)</option>
                <option value="claude-opus-4-20250514">Claude Opus 4 (Best Quality)</option>
              </select>
            </div>
          </div>
        )}

        {/* GitHub Models Config */}
        {provider === 'github' && (
          <div className="space-y-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700 mb-4">
            <h3 className="text-sm font-medium text-slate-300">GitHub Models Configuration</h3>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Personal Access Token (PAT)</label>
              <input
                type="password"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                placeholder={status?.configured.github ? '••••••••••• (already set)' : 'ghp_... or github_pat_...'}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-xs text-slate-500 mt-1">Needs <code className="bg-slate-800 px-1 rounded">models:read</code> scope. Get one at github.com/settings/tokens</p>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Model</label>
              <select
                value={githubModel}
                onChange={(e) => setGithubModel(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="openai/gpt-4o">GPT-4o (Recommended)</option>
                <option value="openai/gpt-4o-mini">GPT-4o Mini (Faster)</option>
                <option value="openai/gpt-4.1">GPT-4.1</option>
                <option value="openai/gpt-4.1-mini">GPT-4.1 Mini</option>
              </select>
            </div>
          </div>
        )}

        {/* OpenAI Config */}
        {provider === 'openai' && (
          <div className="space-y-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700 mb-4">
            <h3 className="text-sm font-medium text-slate-300">OpenAI Configuration</h3>
            <div>
              <label className="block text-xs text-slate-400 mb-1">API Key</label>
              <input
                type="password"
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder={status?.configured.openai ? '••••••••••• (already set)' : 'sk-...'}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Model</label>
              <select
                value={openaiModel}
                onChange={(e) => setOpenaiModel(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="gpt-4o">GPT-4o (Recommended)</option>
                <option value="gpt-4o-mini">GPT-4o Mini (Faster/Cheaper)</option>
                <option value="gpt-4-turbo">GPT-4 Turbo</option>
              </select>
            </div>
          </div>
        )}

        {/* Save */}
        <div className="flex items-center gap-4">
          <button
            onClick={async () => {
              setTesting(true);
              setMessage(null);
              try {
                const result = await testAIConnection();
                setMessage({
                  type: result.success ? 'success' : 'error',
                  text: result.message,
                });
              } catch {
                setMessage({ type: 'error', text: 'Could not reach API' });
              } finally {
                setTesting(false);
              }
            }}
            disabled={testing}
            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 text-white rounded-lg font-medium transition-colors"
          >
            {testing ? 'Testing...' : '🔌 Test Connection'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white rounded-lg font-medium transition-colors"
          >
            {saving ? 'Saving...' : 'Save & Apply'}
          </button>

          {message && (
            <span className={`text-sm ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
              {message.text}
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="card bg-slate-800/30 border-slate-700/50">
        <p className="text-sm text-slate-400">
          <strong className="text-slate-300">Note:</strong> API keys are stored in server memory only
          and reset when the container restarts. For persistent config, edit <code className="text-xs bg-slate-800 px-1 py-0.5 rounded">.env</code> and restart with{' '}
          <code className="text-xs bg-slate-800 px-1 py-0.5 rounded">docker compose up -d</code>.
        </p>
      </div>
    </div>
  );
}
