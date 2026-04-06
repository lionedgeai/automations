import { useEffect, useRef, useState } from 'react';

interface AILogEntry {
  id: number;
  timestamp: string;
  provider: string;
  operation: string;
  status: 'start' | 'success' | 'error';
  detail?: string;
  duration_ms?: number;
  tokens_in?: number;
  tokens_out?: number;
  output?: Record<string, unknown>;
}

const OP_LABELS: Record<string, string> = {
  parsePrompt: 'Parse Prompt',
  generateEmail: 'Generate Email',
  generateSMS: 'Generate SMS',
  regenerateEmail: 'Regenerate Email',
  regenerateSMS: 'Regenerate SMS',
};

const STATUS_COLORS: Record<string, string> = {
  start: 'text-blue-400',
  success: 'text-green-400',
  error: 'text-red-400',
};

const STATUS_ICONS: Record<string, string> = {
  start: '▶',
  success: '✓',
  error: '✗',
};

export default function AIConsole() {
  const [logs, setLogs] = useState<AILogEntry[]>([]);
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);
  const openRef = useRef(open);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(() => {
    const es = new EventSource('http://localhost:3001/api/ai/console');

    es.onmessage = (event) => {
      const entry: AILogEntry = JSON.parse(event.data);
      setLogs((prev) => {
        const next = [...prev, entry];
        return next.length > 200 ? next.slice(-200) : next;
      });

      if (!openRef.current) {
        setUnread((count) => count + 1);
      }
    };

    es.onerror = () => {
      // EventSource reconnects automatically
    };

    return () => {
      es.close();
    };
  }, []);

  useEffect(() => {
    if (open) {
      setUnread(0);
    }
  }, [open]);

  useEffect(() => {
    if (scrollRef.current && open) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, open]);

  function formatTime(timestamp: string) {
    return new Date(timestamp).toLocaleTimeString('en-US', { hour12: false });
  }

  function formatDuration(ms?: number) {
    if (ms === undefined) {
      return '';
    }
    if (ms < 1000) {
      return `${ms}ms`;
    }
    return `${(ms / 1000).toFixed(1)}s`;
  }

  return (
    <div className="fixed bottom-0 right-0 z-50" style={{ maxWidth: '600px', width: '100%' }}>
      <button
        onClick={() => setOpen(!open)}
        className={`ml-auto flex items-center gap-2 px-4 py-2 rounded-tl-lg font-medium text-sm transition-colors ${
          open
            ? 'bg-slate-800 text-white border-t border-l border-slate-700'
            : 'bg-slate-900 text-slate-400 hover:text-white border-t border-l border-slate-700'
        }`}
      >
        <span>🤖 AI Console</span>
        {!open && unread > 0 && (
          <span className="px-1.5 py-0.5 text-xs bg-primary text-white rounded-full">{unread}</span>
        )}
        <span className="text-xs">{open ? '▼' : '▲'}</span>
      </button>

      {open && (
        <div className="bg-slate-900 border-t border-l border-slate-700 shadow-2xl">
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-800">
            <span className="text-xs text-slate-500 font-mono">{logs.length} events | Live stream</span>
            <button onClick={() => setLogs([])} className="text-xs text-slate-500 hover:text-slate-300">
              Clear
            </button>
          </div>

          <div
            ref={scrollRef}
            className="overflow-y-auto font-mono text-xs leading-relaxed p-2 space-y-0.5"
            style={{ maxHeight: '280px' }}
          >
            {logs.length === 0 && <div className="text-slate-600 text-center py-8">Waiting for AI operations...</div>}

            {logs.map((entry) => (
              <div key={entry.id}>
                <div
                  className={`flex items-start gap-2 py-0.5 ${entry.output ? 'cursor-pointer hover:bg-slate-800/50 rounded' : ''}`}
                  onClick={() => {
                    if (!entry.output) return;
                    setExpandedIds((prev) => {
                      const next = new Set(prev);
                      if (next.has(entry.id)) next.delete(entry.id);
                      else next.add(entry.id);
                      return next;
                    });
                  }}
                >
                  <span className="text-slate-600 shrink-0">{formatTime(entry.timestamp)}</span>
                  <span className={`shrink-0 ${STATUS_COLORS[entry.status]}`}>{STATUS_ICONS[entry.status]}</span>
                  <span className="text-yellow-300 shrink-0">[{entry.provider}]</span>
                  <span className="text-cyan-300 shrink-0">{OP_LABELS[entry.operation] || entry.operation}</span>
                  {entry.detail && <span className="text-slate-400 truncate">{entry.detail}</span>}
                  {entry.duration_ms !== undefined && (
                    <span className="text-slate-500 shrink-0 ml-auto">{formatDuration(entry.duration_ms)}</span>
                  )}
                  {entry.output && (
                    <span className="text-slate-600 shrink-0">{expandedIds.has(entry.id) ? '▾' : '▸'}</span>
                  )}
                </div>
                {entry.output && expandedIds.has(entry.id) && (
                  <div className="ml-6 pl-4 border-l border-slate-800 my-1 space-y-0.5">
                    {Object.entries(entry.output).map(([key, value]) => (
                      <div key={key} className="flex gap-2">
                        <span className="text-primary-light shrink-0">{key}:</span>
                        <span className="text-slate-300 whitespace-pre-wrap break-all">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
