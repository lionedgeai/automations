const comparisonRows = [
  ['Campaign scheduling', 'Custom cron code', 'Visual timer nodes'],
  ['Multi-step cadence', 'Hardcoded in API', 'Drag-and-drop flow builder'],
  ['CRM integration', 'Build from scratch', 'Pre-built Salesforce/HubSpot nodes'],
  ['Email delivery', 'SendGrid SDK integration', 'SendGrid node (no code)'],
  ['SMS delivery', 'Twilio SDK integration', 'Twilio node (no code)'],
  ['Error handling', 'Custom try/catch per step', 'Per-node retry + fallback branches'],
  ['Workflow changes', 'Code deploy required', 'Visual editor, instant apply'],
  ['Who can modify', 'Developers only', 'Marketing team + developers'],
  ['Monitoring', 'Custom logging', 'Built-in execution history'],
  ['Time to production', '8-12 weeks', '4-6 weeks'],
  ['Monthly hosting cost', '~$50-100', '~$80-150'],
];

export default function ArchitecturePage() {
  return (
    <div className="min-h-full bg-slate-900 p-6 pb-16">
      <section className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-3">Architecture</h1>
        <p className="text-slate-300 max-w-5xl">
          How should NVISION&apos;s AI Campaign Platform be built for production? Here are two architecture paths — both
          deliver the same user experience, but differ in flexibility and maintenance.
        </p>
      </section>

      <section className="mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6 bg-slate-800/50">
            <h2 className="text-xl font-semibold text-white mb-1">🔧 Option A: Full Custom (API-Driven)</h2>
            <p className="text-slate-400 mb-4">Everything built in-house</p>

            <div className="rounded-lg border border-slate-700 bg-slate-900/70 p-4 mb-5">
              <div className="rounded border border-slate-700 px-3 py-2 text-slate-200 text-sm text-center">
                React UI → Express API → PostgreSQL
              </div>
              <div className="text-slate-500 text-center py-1">↓</div>
              <div className="rounded border border-slate-700 px-3 py-2 text-slate-200 text-sm text-center">
                AI Providers (Claude/GPT)
              </div>
              <div className="text-slate-500 text-center py-1">↓</div>
              <div className="rounded border border-slate-700 px-3 py-2 text-slate-200 text-sm text-center">
                SendGrid + Twilio (direct)
              </div>
              <div className="text-slate-500 text-center py-1">↓</div>
              <div className="rounded border border-slate-700 px-3 py-2 text-slate-200 text-sm text-center">
                Cron scheduler (pg-boss/BullMQ)
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5">
              <div>
                <h3 className="text-white font-medium mb-2">Pros</h3>
                <ul className="space-y-2 text-slate-300 text-sm">
                  <li><span className="text-green-400 mr-2">✓</span>Full control over every feature</li>
                  <li><span className="text-green-400 mr-2">✓</span>No external workflow tool to manage</li>
                  <li><span className="text-green-400 mr-2">✓</span>Simpler infrastructure (fewer containers)</li>
                  <li><span className="text-green-400 mr-2">✓</span>Lower hosting cost</li>
                </ul>
              </div>
              <div>
                <h3 className="text-white font-medium mb-2">Cons</h3>
                <ul className="space-y-2 text-slate-300 text-sm">
                  <li><span className="text-red-400 mr-2">✗</span>All workflow changes require code deploys</li>
                  <li><span className="text-red-400 mr-2">✗</span>Building integrations from scratch (Salesforce, SendGrid, Twilio)</li>
                  <li><span className="text-red-400 mr-2">✗</span>Your dev team maintains all orchestration logic</li>
                  <li><span className="text-red-400 mr-2">✗</span>Harder for non-technical team to modify campaigns</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="card p-6 bg-slate-800/50 border-primary/60">
            <div className="flex items-start justify-between gap-3 mb-1">
              <h2 className="text-xl font-semibold text-white">🔄 Option B: Hybrid with n8n (Recommended)</h2>
              <span className="shrink-0 rounded-full border border-primary-light bg-primary px-3 py-1 text-xs font-bold text-white shadow-lg shadow-primary-dark/40">
                Recommended
              </span>
            </div>
            <p className="text-slate-400 mb-4">Custom UI + visual workflow engine</p>

            <div className="rounded-lg border border-slate-700 bg-slate-900/70 p-4 mb-5">
              <div className="rounded border border-slate-700 px-3 py-2 text-slate-200 text-sm text-center">
                React UI → Express API → PostgreSQL
              </div>
              <div className="text-slate-500 text-center py-1">↓</div>
              <div className="rounded border border-primary/50 bg-primary/10 px-3 py-2 text-primary-light text-sm text-center">
                n8n Workflow Engine
              </div>
              <div className="text-slate-500 text-center py-1">↙&nbsp;&nbsp;&nbsp;&nbsp;↓&nbsp;&nbsp;&nbsp;&nbsp;↘</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div className="rounded border border-slate-700 px-3 py-2 text-slate-200 text-sm text-center">
                  AI Providers
                </div>
                <div className="rounded border border-slate-700 px-3 py-2 text-slate-200 text-sm text-center">
                  SendGrid<br />Twilio
                </div>
                <div className="rounded border border-slate-700 px-3 py-2 text-slate-200 text-sm text-center">
                  Salesforce<br />HubSpot
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5">
              <div>
                <h3 className="text-white font-medium mb-2">Pros</h3>
                <ul className="space-y-2 text-slate-300 text-sm">
                  <li><span className="text-green-400 mr-2">✓</span>Your team can modify workflows visually (no deploys)</li>
                  <li><span className="text-green-400 mr-2">✓</span>400+ pre-built connectors (Salesforce, SendGrid, Twilio, HubSpot...)</li>
                  <li><span className="text-green-400 mr-2">✓</span>Built-in scheduling, retries, error handling</li>
                  <li><span className="text-green-400 mr-2">✓</span>Execution history and monitoring included</li>
                  <li><span className="text-green-400 mr-2">✓</span>Faster time-to-production for integrations</li>
                </ul>
              </div>
              <div>
                <h3 className="text-white font-medium mb-2">Cons</h3>
                <ul className="space-y-2 text-slate-300 text-sm">
                  <li><span className="text-red-400 mr-2">✗</span>Additional container to host and maintain</li>
                  <li><span className="text-red-400 mr-2">✗</span>Learning curve for n8n workflow editor</li>
                  <li><span className="text-red-400 mr-2">✗</span>Slightly more complex infrastructure</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-white mb-4">Feature Comparison Table</h2>
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-slate-800/80 border-b border-slate-700">
              <tr>
                <th className="p-4 text-left text-white">Feature</th>
                <th className="p-4 text-left text-white">Full Custom</th>
                <th className="p-4 text-left text-primary-light">Hybrid + n8n</th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map(([feature, fullCustom, hybrid]) => (
                <tr key={feature} className="border-b border-slate-800 last:border-b-0">
                  <td className="p-4 text-slate-300">{feature}</td>
                  <td className="p-4 text-slate-400">{fullCustom}</td>
                  <td className="p-4 text-slate-300">{hybrid}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-8">
        <div className="card p-6 border-primary bg-primary/5">
          <h2 className="text-xl font-semibold text-white mb-2">Our Recommendation: Hybrid with n8n</h2>
          <p className="text-slate-300">
            For NVISION&apos;s use case — multi-channel campaigns with evolving targeting rules and a growing marketing
            team — the hybrid approach gives you the best of both worlds: a polished custom UI for daily use, with n8n
            handling the complex orchestration behind the scenes. Your marketing team can adjust campaign flows without
            waiting for dev cycles.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-white mb-4">What&apos;s Already Built</h2>
        <div className="card p-6 bg-slate-800/50">
          <ul className="space-y-2 text-slate-300">
            <li>✅ React UI with campaign management</li>
            <li>✅ AI-powered content generation (4 providers)</li>
            <li>✅ Patient targeting and segmentation</li>
            <li>✅ Multi-channel cadence (email + SMS)</li>
            <li>✅ Analytics dashboard</li>
            <li>✅ Real-time AI operations console</li>
            <li className="text-slate-400">🔜 n8n workflow integration</li>
            <li className="text-slate-400">🔜 Real SendGrid/Twilio delivery</li>
            <li className="text-slate-400">🔜 Salesforce CRM sync</li>
            <li className="text-slate-400">🔜 Voice agent integration</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
