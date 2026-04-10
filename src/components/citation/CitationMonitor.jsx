/**
 * CitationMonitor.jsx
 * Fully isolated component — its own state, its own render cycle.
 * No connection to PageBuilder whatsoever.
 */
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Icon from '../shared/Icon.jsx';
import { classifyIntent } from '../../lib/intentClassifier.js';
import { deduplicateQueries } from '../../lib/queryDeduplication.js';
import { expandSeedQueries, DEFAULT_SEEDS } from '../../lib/seedExpansion.js';
import { testSingleQuery, batchTestWithProgress } from '../../lib/citationTester.js';
import { renderTemplate } from '../../lib/templateEngine.js';
import { runAll, scrapeReddit, scrapeMedicareGov, scrapeEhealth, scrapeCompetitors } from '../../lib/scrapers.js';

// ── Storage ──────────────────────────────────────────────────────────────────
const LS_QUEUE = 'gh-cc-query-queue-v3';
const LS_KEYS  = 'gh-cc-cm-apikeys';

function loadQueueFromLS() {
  try {
    const raw = localStorage.getItem(LS_QUEUE);
    if (raw) { const p = JSON.parse(raw); if (Array.isArray(p)) return p; }
  } catch {}
  return [];
}

function saveQueueToLS(queue) {
  try { localStorage.setItem(LS_QUEUE, JSON.stringify(queue)); } catch (e) {
    console.error('[CitationMonitor] localStorage write failed:', e);
  }
}

function loadAllKeys() {
  try { const raw = localStorage.getItem(LS_KEYS); if (raw) return JSON.parse(raw) || {}; } catch {}
  return {};
}

function saveAllKeys(keys) {
  try { localStorage.setItem(LS_KEYS, JSON.stringify(keys)); } catch {}
}

// ── Shared button styles ──────────────────────────────────────────────────────
const primaryBtnStyle = {
  display: 'inline-flex', alignItems: 'center', padding: '8px 14px',
  borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
  background: 'var(--gh-blue)', color: '#fff', transition: 'opacity 150ms',
};

const secondaryBtnStyle = {
  display: 'inline-flex', alignItems: 'center', padding: '8px 12px',
  borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 500,
  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
  color: 'var(--gh-text-soft)', transition: 'background 150ms',
};

// ── Filter constants ──────────────────────────────────────────────────────────
const INTENT_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'high', label: 'High' },
  { id: 'medium', label: 'Medium' },
  { id: 'low', label: 'Low' },
];

const PIPELINE_FILTERS = [
  { id: 'all', label: 'All stages' },
  { id: 'not_built', label: 'Not Built' },
  { id: 'built', label: 'Built' },
  { id: 'promoted', label: 'Promoted' },
  { id: 'indexed', label: 'Indexed' },
];

const SOURCE_FILTERS = [
  { id: 'all', label: 'All sources' },
  { id: 'seed_expansion', label: 'Seed' },
  { id: 'reddit', label: 'Reddit' },
  { id: 'medicare_gov', label: 'Medicare.gov' },
  { id: 'ehealth', label: 'eHealth' },
  { id: 'competitor', label: 'Competitor' },
];

const CM_TABS = [
  { id: 'queue',    label: 'Queue',    icon: 'list'          },
  { id: 'generate', label: 'Generate', icon: 'sparkles'      },
  { id: 'scrape',   label: 'Scrape',   icon: 'download-cloud'},
  { id: 'settings', label: 'Settings', icon: 'settings'      },
];

// ── FilterPill ────────────────────────────────────────────────────────────────
function FilterPill({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
      cursor: 'pointer', border: 'none', transition: 'all 120ms',
      background: active ? 'rgba(0,113,227,0.2)' : 'rgba(255,255,255,0.04)',
      color: active ? '#60a5fa' : 'var(--gh-text-muted)',
      outline: active ? '1px solid rgba(0,113,227,0.4)' : 'none',
    }}>
      {children}
    </button>
  );
}

// ── Intent badge ──────────────────────────────────────────────────────────────
function IntentBadge({ intent }) {
  const colors = { high: '#f87171', medium: '#fbbf24', low: '#6b7280' };
  const color = colors[intent] || '#6b7280';
  return (
    <span style={{
      fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
      background: `${color}22`, color, letterSpacing: '0.06em', textTransform: 'uppercase',
    }}>
      {intent}
    </span>
  );
}

// ── Citation dots ─────────────────────────────────────────────────────────────
function CitationDots({ citationStatus }) {
  const providers = ['claude', 'chatgpt', 'perplexity', 'gemini'];
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      {providers.map(p => {
        const val = citationStatus?.[p];
        const color = val === true ? '#4ade80' : val === false ? '#f87171' : '#374151';
        return (
          <div key={p} title={`${p}: ${val === null ? 'untested' : val ? 'cited' : 'not cited'}`}
            style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
        );
      })}
    </div>
  );
}

// ── Pipeline status badge ────────────────────────────────────────────────────
function PipelineBadge({ status }) {
  const cfg = {
    built:    { label: 'BUILT',    color: '#c084fc', bg: 'rgba(192,132,252,0.12)' },
    promoted: { label: 'PROMOTED', color: '#60a5fa', bg: 'rgba(96,165,250,0.12)'  },
    indexed:  { label: 'INDEXED',  color: '#4ade80', bg: 'rgba(74,222,128,0.12)'  },
  };
  const c = cfg[status];
  if (!c) return (
    <span style={{ fontSize: 9, color: '#6b7280', fontWeight: 600, letterSpacing: '0.06em',
      textTransform: 'uppercase' }}>NOT BUILT</span>
  );
  return (
    <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
      background: c.bg, color: c.color, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
      {c.label}
    </span>
  );
}

// ── QueryRow ──────────────────────────────────────────────────────────────────
function QueryRow({ query, selected, isTesting, onSelect, onTest, onGeneratePage, onEdit, onDelete, onRefresh }) {
  const [hovered, setHovered] = useState(false);
  const cs = query.citationStatus || {};
  const anyCited = cs.claude === true || cs.chatgpt === true || cs.perplexity === true || cs.gemini === true;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 14px 10px 10px',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        background: selected
          ? 'rgba(0,113,227,0.07)'
          : hovered ? 'rgba(255,255,255,0.02)' : 'transparent',
        transition: 'background 100ms',
      }}
    >
      {/* Checkbox */}
      <input type="checkbox" checked={selected}
        onChange={(e) => onSelect(query.id, e.target.checked, e.nativeEvent.shiftKey)}
        style={{ width: 15, height: 15, accentColor: '#0071e3', cursor: 'pointer', flexShrink: 0 }} />

      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#e5e7eb',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 4 }}>
          {query.query}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <IntentBadge intent={query.intent} />
          {query.county && (
            <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 6px', borderRadius: 4,
              background: 'rgba(251,191,36,0.1)', color: '#fbbf24', textTransform: 'uppercase',
              letterSpacing: '0.06em' }}>{query.county}</span>
          )}
          <span style={{ fontSize: 10, color: 'var(--gh-text-faint)' }}>
            {query.source || 'unknown'}
          </span>
          {(query.competitors || []).slice(0, 3).map(c => (
            <span key={c} style={{ fontSize: 9, color: '#f87171',
              display: 'inline-flex', alignItems: 'center', gap: 2 }}>
              ✕ {c}
            </span>
          ))}
        </div>
      </div>

      {/* Citation dots */}
      <CitationDots citationStatus={query.citationStatus} />

      {/* Pipeline status */}
      <div style={{ minWidth: 70, textAlign: 'right' }}>
        <PipelineBadge status={query.pipelineStatus} />
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 4, opacity: hovered ? 1 : 0.3, transition: 'opacity 150ms' }}>
        <button title="Generate page" onClick={() => onGeneratePage(query)}
          style={{ ...secondaryBtnStyle, padding: '5px 7px', fontSize: 11 }}>
          <Icon name="file-text" size={12} />
        </button>
        <button title={isTesting ? 'Testing…' : 'Test citations'} onClick={() => !isTesting && onTest(query)}
          disabled={isTesting}
          style={{ ...secondaryBtnStyle, padding: '5px 7px', fontSize: 11,
            opacity: isTesting ? 0.5 : 1 }}>
          {isTesting
            ? <Icon name="loader-2" size={12} className="gh-spin" />
            : <Icon name="test-tube" size={12} />}
        </button>
        <button title="Edit" onClick={() => onEdit(query)}
          style={{ ...secondaryBtnStyle, padding: '5px 7px' }}>
          <Icon name="edit-2" size={12} />
        </button>
        <button title="Reset status" onClick={() => onRefresh(query.id)}
          style={{ ...secondaryBtnStyle, padding: '5px 7px' }}>
          <Icon name="refresh-cw" size={12} />
        </button>
        <button title="Delete" onClick={() => onDelete(query.id)}
          style={{ ...secondaryBtnStyle, padding: '5px 7px', color: '#fca5a5' }}>
          <Icon name="trash-2" size={12} />
        </button>
      </div>
    </div>
  );
}

// ── PageGenerationModal ───────────────────────────────────────────────────────
import { COUNTY_DATA } from '../../data/countyData.js';
import { AEO_PAGE_TEMPLATE } from '../../lib/aeoTemplate.js';

function PageGenerationModal({ query, onClose, onGenerated }) {
  const [step, setStep] = useState('confirm');
  const [detectedCounty, setDetectedCounty] = useState(null);
  const [manualCounty, setManualCounty] = useState('');
  const [countyData, setCountyData] = useState(null);
  const [generatedHtml, setGeneratedHtml] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    const detected = extractCounty(query.query);
    setDetectedCounty(detected);
    if (detected) {
      const slug = detected.toLowerCase().replace(/\s+/g, '-');
      const data = COUNTY_DATA[slug];
      if (data) { setCountyData(data); setStep('confirm'); }
      else setStep('confirm');
    } else {
      setStep('confirm');
    }
  }, [query.query]);

  const handleGenerate = useCallback(async () => {
    const slug = (detectedCounty || manualCounty).toLowerCase().replace(/\s+/g, '-');
    const data = COUNTY_DATA[slug];
    if (!data) { setErrorMsg(`No county data found for "${slug}"`); setStep('error'); return; }
    setCountyData(data);
    setStep('generate');
    try {
      const html = renderTemplate(AEO_PAGE_TEMPLATE, data);
      setGeneratedHtml(html);
      setStep('done');
      onGenerated({ ...query, pipelineStatus: 'built', lastBuilt: new Date().toISOString() });
    } catch (err) {
      setErrorMsg(String(err?.message || err));
      setStep('error');
    }
  }, [detectedCounty, manualCounty, query, onGenerated]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedHtml).then(() => {
      setToast('Copied!');
      setTimeout(() => setToast(''), 2000);
    });
  };

  const handleDownload = () => {
    const slug = countyData?.county?.toLowerCase().replace(/\s+/g, '-') || 'page';
    const blob = new Blob([generatedHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `medicare-agents-in-${slug}-county-nc.html`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const countyList = Object.keys(COUNTY_DATA).sort();

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 200, padding: 20,
    }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: '#1a2030', borderRadius: 16, width: '100%', maxWidth: 540,
        border: '1px solid rgba(255,255,255,0.1)', padding: 24,
        maxHeight: '90vh', overflow: 'auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#fff' }}>
            Generate County Page
          </h3>
          <button onClick={onClose} style={{ ...secondaryBtnStyle, padding: '6px 8px' }}>
            <Icon name="x" size={14} />
          </button>
        </div>

        <div style={{ fontSize: 12, color: 'var(--gh-text-muted)', marginBottom: 16,
          padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
          {query.query}
        </div>

        {step === 'detect' && (
          <div style={{ textAlign: 'center', padding: 20 }}>
            <Icon name="loader-2" size={24} className="gh-spin" style={{ color: 'var(--gh-blue)' }} />
            <div style={{ fontSize: 12, color: 'var(--gh-text-muted)', marginTop: 8 }}>Detecting county…</div>
          </div>
        )}

        {step === 'confirm' && (
          <div>
            {detectedCounty ? (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, color: 'var(--gh-text-muted)', marginBottom: 6 }}>
                  Detected county:
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#4ade80' }}>
                  {detectedCounty}
                </div>
              </div>
            ) : (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, color: '#fbbf24', marginBottom: 8 }}>
                  No county detected — select manually:
                </div>
                <select value={manualCounty} onChange={(e) => setManualCounty(e.target.value)}
                  style={{ width: '100%' }}>
                  <option value="">— Select county —</option>
                  {countyList.map(slug => (
                    <option key={slug} value={slug}>
                      {COUNTY_DATA[slug].county}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <button onClick={handleGenerate}
              disabled={!detectedCounty && !manualCounty}
              style={{ ...primaryBtnStyle, width: '100%', justifyContent: 'center',
                opacity: (!detectedCounty && !manualCounty) ? 0.5 : 1 }}>
              <Icon name="sparkles" size={14} style={{ marginRight: 8 }} />
              Generate Page
            </button>
          </div>
        )}

        {step === 'generate' && (
          <div style={{ textAlign: 'center', padding: 24 }}>
            <Icon name="loader-2" size={28} className="gh-spin" style={{ color: 'var(--gh-blue)' }} />
            <div style={{ fontSize: 13, color: 'var(--gh-text-soft)', marginTop: 12 }}>
              Generating {countyData?.county} page…
            </div>
          </div>
        )}

        {step === 'done' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14,
              padding: '10px 14px', borderRadius: 8, background: 'rgba(74,222,128,0.08)',
              border: '1px solid rgba(74,222,128,0.2)' }}>
              <Icon name="check-circle" size={16} style={{ color: '#4ade80' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#4ade80' }}>
                {countyData?.county} page generated
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleCopy} style={{ ...primaryBtnStyle, flex: 1, justifyContent: 'center' }}>
                <Icon name="copy" size={13} style={{ marginRight: 6 }} />
                Copy HTML
              </button>
              <button onClick={handleDownload} style={{ ...secondaryBtnStyle, flex: 1, justifyContent: 'center' }}>
                <Icon name="download" size={13} style={{ marginRight: 6 }} />
                Download
              </button>
            </div>
            {toast && (
              <div style={{ marginTop: 10, fontSize: 12, color: '#4ade80', textAlign: 'center' }}>
                {toast}
              </div>
            )}
          </div>
        )}

        {step === 'error' && (
          <div style={{ padding: 14, borderRadius: 8, background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.3)' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#fca5a5', marginBottom: 4 }}>
              Generation failed
            </div>
            <div style={{ fontSize: 11, color: 'var(--gh-text-muted)' }}>{errorMsg}</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── QueueManagerPanel ─────────────────────────────────────────────────────────
function QueueManagerPanel({ onQueriesGenerated }) {
  const [apiKey, setApiKey] = useState(() => {
    try { const r = localStorage.getItem(LS_KEYS); if (r) { const p = JSON.parse(r); return p.claude || ''; } } catch {}
    return '';
  });
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [error, setError] = useState(null);
  const [lastResult, setLastResult] = useState(null);

  const handleGenerate = async () => {
    if (!apiKey) { setError('Claude API key required. Add it in Settings.'); return; }
    setGenerating(true); setError(null); setProgress(0); setStatus('Starting…');
    try {
      const classified = classifyIntent(DEFAULT_SEEDS.map(s => ({
        id: `seed-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        query: s.query, source: 'seed', intent: 'medium', intentScore: 5,
        category: s.category, dateAdded: new Date().toISOString(),
        citationStatus: { claude: null, chatgpt: null, perplexity: null, gemini: null },
        competitors: [],
      })));
      const expanded = await expandSeedQueries(classified, apiKey, (current, total) => {
        setProgress(Math.round((current / total) * 100));
        setStatus(`Expanding seed ${current} of ${total}…`);
      });
      const deduped = deduplicateQueries(classifyIntent(expanded));
      setLastResult({ count: deduped.length });
      onQueriesGenerated(deduped);
      setStatus('Done');
    } catch (err) {
      setError(String(err?.message || err));
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="card p-4">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        marginBottom: 16, gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#fff' }}>
              Queue Manager
            </h3>
            <span style={{ fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 4,
              background: 'rgba(20,184,166,0.15)', color: '#2dd4bf', letterSpacing: '0.1em' }}>
              AEO 4.0
            </span>
          </div>
          <p style={{ fontSize: 11, color: 'var(--gh-text-muted)', marginTop: 4 }}>
            Expand {DEFAULT_SEEDS.length} seeds into ~{DEFAULT_SEEDS.length * 6} classified queries via Claude. Takes ~2–4 minutes.
          </p>
        </div>
        <button onClick={handleGenerate} disabled={generating}
          style={{ ...primaryBtnStyle, padding: '10px 16px', whiteSpace: 'nowrap',
            opacity: generating ? 0.6 : 1, cursor: generating ? 'not-allowed' : 'pointer' }}>
          {generating
            ? <><Icon name="loader-2" size={13} className="gh-spin" style={{ marginRight: 6 }} />Generating…</>
            : <><Icon name="sparkles" size={13} style={{ marginRight: 6 }} />Generate {DEFAULT_SEEDS.length * 6} Queries</>}
        </button>
      </div>

      {/* Seeds list */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--gh-text-muted)',
          letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Seeds:</div>
        {DEFAULT_SEEDS.map((s, i) => (
          <div key={i} style={{ fontSize: 11, color: 'var(--gh-text-soft)', padding: '2px 0' }}>
            {i + 1}. {s.query}
          </div>
        ))}
      </div>

      {/* Progress */}
      {generating && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11,
            color: 'var(--gh-text-muted)', marginBottom: 6 }}>
            <span>{status}</span>
            <span style={{ color: 'var(--gh-blue)', fontWeight: 700 }}>{progress}%</span>
          </div>
          <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.08)',
            borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'var(--gh-blue)',
              width: `${progress}%`, transition: 'width 300ms', borderRadius: 999 }} />
          </div>
        </div>
      )}

      {error && (
        <div style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.25)', fontSize: 11, color: '#fca5a5' }}>
          {error}
        </div>
      )}

      {lastResult && !generating && (
        <div style={{ fontSize: 11, color: '#4ade80' }}>
          ✓ Generated {lastResult.count} unique queries — merged into queue.
        </div>
      )}
    </div>
  );
}

// ── QueueTab ──────────────────────────────────────────────────────────────────
function QueueTab({ queue, setQueue, apiKeys }) {
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [search, setSearch] = useState('');
  const [intentFilter, setIntentFilter] = useState('all');
  const [pipelineFilter, setPipelineFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('intentScore');
  const [testingIds, setTestingIds] = useState(new Set());
  const [batchProgress, setBatchProgress] = useState(null);
  const [modalQuery, setModalQuery] = useState(null);
  const lastClickedRef = useRef(null);

  const filtered = useMemo(() => {
    let out = queue.slice();
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      out = out.filter(q =>
        q.query.toLowerCase().includes(s) ||
        (q.county || '').toLowerCase().includes(s) ||
        (q.category || '').toLowerCase().includes(s)
      );
    }
    if (intentFilter !== 'all')   out = out.filter(q => q.intent === intentFilter);
    if (pipelineFilter !== 'all') out = out.filter(q => (q.pipelineStatus || 'not_built') === pipelineFilter);
    if (sourceFilter !== 'all')   out = out.filter(q => q.source === sourceFilter);
    out.sort((a, b) => {
      if (sortBy === 'intentScore') return (b.intentScore || 0) - (a.intentScore || 0);
      if (sortBy === 'dateAdded')   return (b.dateAdded || '').localeCompare(a.dateAdded || '');
      return a.query.localeCompare(b.query);
    });
    return out;
  }, [queue, search, intentFilter, pipelineFilter, sourceFilter, sortBy]);

  const stats = useMemo(() => {
    const total   = queue.length;
    const tested  = queue.filter(q => { const s = q.citationStatus || {}; return s.claude !== null || s.chatgpt !== null || s.perplexity !== null || s.gemini !== null; }).length;
    const cited   = queue.filter(q => { const s = q.citationStatus || {}; return s.claude === true || s.chatgpt === true || s.perplexity === true || s.gemini === true; }).length;
    const high    = queue.filter(q => q.intent === 'high').length;
    const built   = queue.filter(q => ['built','promoted','indexed'].includes(q.pipelineStatus)).length;
    return { total, tested, cited, high, built };
  }, [queue]);

  const allSelected = filtered.length > 0 && filtered.every(q => selectedIds.has(q.id));

  const handleSelect = (id, selected, shiftKey) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (shiftKey && lastClickedRef.current) {
        const ids = filtered.map(q => q.id);
        const from = ids.indexOf(lastClickedRef.current);
        const to = ids.indexOf(id);
        if (from !== -1 && to !== -1) {
          const [lo, hi] = from < to ? [from, to] : [to, from];
          for (let i = lo; i <= hi; i++) next.add(ids[i]);
        }
      } else {
        if (selected) next.add(id); else next.delete(id);
      }
      lastClickedRef.current = id;
      return next;
    });
  };

  const handleTestOne = async (query) => {
    const hasKey = apiKeys.claude || apiKeys.chatgpt || apiKeys.perplexity || apiKeys.gemini;
    if (!hasKey) { alert('Add at least one LLM API key in Settings.'); return; }
    setTestingIds(prev => new Set(prev).add(query.id));
    try {
      const { status, competitors } = await testSingleQuery(query.query, apiKeys);
      const merged = Array.from(new Set([...(query.competitors||[]), ...competitors]));
      setQueue(q => q.map(x => x.id === query.id
        ? { ...x, citationStatus: status, competitors: merged, lastTested: new Date().toISOString() }
        : x));
    } catch (err) {
      alert('Test failed: ' + (err?.message || err));
    } finally {
      setTestingIds(prev => { const n = new Set(prev); n.delete(query.id); return n; });
    }
  };

  const handleTestSelected = async () => {
    const hasKey = apiKeys.claude || apiKeys.chatgpt || apiKeys.perplexity || apiKeys.gemini;
    if (!hasKey) { alert('Add at least one LLM API key in Settings.'); return; }
    if (selectedIds.size === 0) { alert('No queries selected.'); return; }
    const targets = queue.filter(q => selectedIds.has(q.id));
    setTestingIds(new Set(targets.map(q => q.id)));
    setBatchProgress({ current: 0, total: targets.length, queryText: '' });
    try {
      const updated = await batchTestWithProgress(targets, apiKeys, (current, total, queryText) => {
        setBatchProgress({ current, total, queryText });
      });
      const byId = new Map(updated.map(u => [u.id, u]));
      setQueue(q => q.map(x => byId.get(x.id) || x));
    } catch (err) {
      alert('Batch test failed: ' + (err?.message || err));
    } finally {
      setTestingIds(new Set());
      setBatchProgress(null);
    }
  };

  const handleDelete   = (id) => { setQueue(q => q.filter(x => x.id !== id)); setSelectedIds(prev => { const n = new Set(prev); n.delete(id); return n; }); };
  const handleRefresh  = (id) => setQueue(q => q.map(x => x.id === id ? { ...x, pipelineStatus: 'not_built', lastBuilt: null } : x));
  const handleBulkDelete = () => { if (!selectedIds.size || !confirm(`Delete ${selectedIds.size} queries?`)) return; setQueue(q => q.filter(x => !selectedIds.has(x.id))); setSelectedIds(new Set()); };
  const handleClear    = () => { if (!queue.length || !confirm(`Clear all ${queue.length} queries?`)) return; setQueue([]); setSelectedIds(new Set()); };
  const handleEdit     = (query) => { const next = prompt('Edit query:', query.query); if (!next?.trim() || next === query.query) return; setQueue(q => q.map(x => x.id === query.id ? classifyIntent([{ ...x, query: next.trim() }])[0] : x)); };
  const handleExport   = () => { const blob = new Blob([JSON.stringify(queue, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `gh-queue-${new Date().toISOString().slice(0,10)}.json`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
        {[
          { label: 'Total',  value: stats.total,  color: '#fff'    },
          { label: 'Tested', value: stats.tested, color: '#60a5fa' },
          { label: 'Cited',  value: stats.cited,  color: '#4ade80' },
          { label: 'High',   value: stats.high,   color: '#f87171' },
          { label: 'Built',  value: stats.built,  color: '#c084fc' },
        ].map((s, i) => (
          <div key={i} style={{ background: 'var(--gh-panel)', border: '1px solid var(--gh-border)',
            borderRadius: 10, padding: '12px 10px', textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.color, fontVariantNumeric: 'tabular-nums' }}>
              {s.value}
            </div>
            <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--gh-text-muted)',
              letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 2 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Search + controls */}
      <div style={{ background: 'var(--gh-panel)', border: '1px solid var(--gh-border)',
        borderRadius: 10, padding: 12, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 260px', minWidth: 200 }}>
          <Icon name="search" size={13} style={{ position: 'absolute', left: 10, top: '50%',
            transform: 'translateY(-50%)', color: '#6b7280', pointerEvents: 'none' }} />
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search queries, counties, categories…"
            style={{ paddingLeft: 30 }} />
        </div>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ width: 'auto' }}>
          <option value="intentScore">Sort: Intent Score</option>
          <option value="dateAdded">Sort: Date Added</option>
          <option value="query">Sort: A–Z</option>
        </select>
        <button onClick={handleExport} style={secondaryBtnStyle}>
          <Icon name="download" size={13} style={{ marginRight: 5 }} />Export
        </button>
        <button onClick={handleClear} style={{ ...secondaryBtnStyle, color: '#fca5a5' }}>
          <Icon name="trash-2" size={13} style={{ marginRight: 5 }} />Clear All
        </button>
      </div>

      {/* Filters */}
      <div style={{ background: 'var(--gh-panel)', border: '1px solid var(--gh-border)',
        borderRadius: 10, padding: 10, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--gh-text-muted)',
            letterSpacing: '0.08em', textTransform: 'uppercase' }}>Intent:</span>
          {INTENT_FILTERS.map(f => (
            <FilterPill key={f.id} active={intentFilter === f.id} onClick={() => setIntentFilter(f.id)}>
              {f.label}
            </FilterPill>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--gh-text-muted)',
            letterSpacing: '0.08em', textTransform: 'uppercase' }}>Stage:</span>
          <select value={pipelineFilter} onChange={(e) => setPipelineFilter(e.target.value)} style={{ width: 'auto' }}>
            {PIPELINE_FILTERS.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--gh-text-muted)',
            letterSpacing: '0.08em', textTransform: 'uppercase' }}>Source:</span>
          <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} style={{ width: 'auto' }}>
            {SOURCE_FILTERS.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
          </select>
        </div>
      </div>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div style={{ background: 'rgba(0,113,227,0.06)', border: '1px solid rgba(0,113,227,0.3)',
          borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#60a5fa' }}>
            {selectedIds.size} selected
          </span>
          <div style={{ flex: 1 }} />
          <button onClick={handleTestSelected} style={primaryBtnStyle}>
            Test Citations
          </button>
          <button onClick={handleBulkDelete} style={{ ...secondaryBtnStyle, color: '#fca5a5' }}>
            Delete
          </button>
          <button onClick={() => setSelectedIds(new Set())} style={secondaryBtnStyle}>
            Clear
          </button>
        </div>
      )}

      {/* Batch progress */}
      {batchProgress && (
        <div style={{ background: 'var(--gh-panel)', border: '1px solid rgba(0,113,227,0.3)',
          borderRadius: 10, padding: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11,
            color: 'var(--gh-text-soft)', marginBottom: 6 }}>
            <span>Testing: <em style={{ color: '#cbd5e1' }}>{batchProgress.queryText || '…'}</em></span>
            <span style={{ color: '#60a5fa', fontWeight: 700 }}>
              {batchProgress.current} / {batchProgress.total}
            </span>
          </div>
          <div style={{ width: '100%', height: 5, background: 'rgba(255,255,255,0.06)',
            borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'linear-gradient(90deg,#0071e3,#60a5fa)',
              width: `${(batchProgress.current / batchProgress.total) * 100}%`,
              transition: 'width 300ms', borderRadius: 999 }} />
          </div>
        </div>
      )}

      {/* Query list */}
      <div style={{ background: 'var(--gh-panel)', border: '1px solid var(--gh-border)',
        borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12,
          padding: '10px 14px 10px 10px', borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(255,255,255,0.02)' }}>
          <input type="checkbox" checked={allSelected} onChange={() => {
            if (allSelected) setSelectedIds(new Set());
            else setSelectedIds(new Set(filtered.map(q => q.id)));
          }} style={{ width: 15, height: 15, accentColor: '#0071e3', cursor: 'pointer' }} />
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--gh-text-muted)',
            letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {filtered.length} {filtered.length === 1 ? 'query' : 'queries'}
            {filtered.length !== queue.length && ` (of ${queue.length})`}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--gh-text-faint)' }}>
            {queue.length === 0
              ? <div>
                  <Icon name="inbox" size={32} style={{ opacity: 0.3, marginBottom: 10 }} />
                  <div style={{ fontSize: 13 }}>Queue is empty.</div>
                  <div style={{ fontSize: 11, marginTop: 6, color: 'var(--gh-text-muted)' }}>
                    Go to <strong>Generate</strong> to expand seeds, or <strong>Scrape</strong> to pull from the web.
                  </div>
                </div>
              : <div style={{ fontSize: 13 }}>No queries match the current filters.</div>}
          </div>
        ) : (
          filtered.map(q => (
            <QueryRow key={q.id} query={q}
              selected={selectedIds.has(q.id)}
              isTesting={testingIds.has(q.id)}
              onSelect={handleSelect}
              onTest={handleTestOne}
              onGeneratePage={(query) => setModalQuery(query)}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onRefresh={handleRefresh} />
          ))
        )}
      </div>

      {modalQuery && (
        <PageGenerationModal query={modalQuery}
          onClose={() => setModalQuery(null)}
          onGenerated={(updated) => {
            setQueue(q => q.map(x => x.id === updated.id ? updated : x));
            setModalQuery(null);
          }} />
      )}
    </div>
  );
}

// ── GenerateTab ───────────────────────────────────────────────────────────────
function GenerateTab({ queue, setQueue }) {
  const [lastMerge, setLastMerge] = useState(null);

  const handleGenerated = (newQueries) => {
    const combined = [...queue, ...newQueries];
    const deduped = deduplicateQueries(combined);
    setQueue(deduped);
    setLastMerge({
      generated: newQueries.length,
      addedAfterDedup: deduped.length - queue.length,
      totalNow: deduped.length,
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <QueueManagerPanel onQueriesGenerated={handleGenerated} />
      {lastMerge && (
        <div style={{ background: 'var(--gh-panel)', border: '1px solid rgba(74,222,128,0.22)',
          borderRadius: 10, padding: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Icon name="check-circle" size={15} style={{ color: '#4ade80' }} />
            <strong style={{ fontSize: 13, color: '#fff' }}>Merged into queue</strong>
          </div>
          <div style={{ fontSize: 12, color: 'var(--gh-text-soft)' }}>
            Generated <strong>{lastMerge.generated}</strong> queries ·
            Added <strong>{lastMerge.addedAfterDedup}</strong> after dedup ·
            Queue now <strong>{lastMerge.totalNow}</strong> total.
          </div>
        </div>
      )}
    </div>
  );
}

// ── ScrapeTab ─────────────────────────────────────────────────────────────────
const SCRAPE_SOURCES = [
  { id: 'reddit',      label: 'Reddit',      icon: 'message-square', desc: 'Scrapes r/Medicare and related subs for real-person questions.',       fn: scrapeReddit      },
  { id: 'medicare',    label: 'Medicare.gov', icon: 'globe',          desc: 'Pulls FAQ/Help topics via the PHP scrape proxy.',                       fn: scrapeMedicareGov },
  { id: 'ehealth',     label: 'eHealth',      icon: 'inbox',          desc: 'Scrapes eHealthInsurance Medicare pages via proxy.',                    fn: scrapeEhealth     },
  { id: 'competitors', label: 'Competitors',  icon: 'target',         desc: 'Scrapes competitor landing pages (configurable URLs).',                 fn: scrapeCompetitors, needsUrls: true },
];

function ScrapeTab({ queue, setQueue }) {
  const [running, setRunning] = useState(null);
  const [log, setLog] = useState([]);
  const [competitorUrls, setCompetitorUrls] = useState(
    'https://www.boomerbenefits.com/medicare/\nhttps://www.ehealthinsurance.com/medicare/'
  );

  const appendLog = (entry) => setLog(l => [entry, ...l].slice(0, 20));

  const runScraper = async (source) => {
    setRunning(source.id);
    try {
      const args = source.needsUrls
        ? [competitorUrls.split(/\r?\n/).map(s => s.trim()).filter(Boolean)]
        : [];
      const results = await source.fn(...args);
      const arr = Array.isArray(results) ? results : [];
      const classified = classifyIntent(arr);
      const combined = [...queue, ...classified];
      const deduped = deduplicateQueries(combined);
      const added = deduped.length - queue.length;
      setQueue(deduped);
      appendLog({ source: source.label, count: arr.length, added, ts: new Date().toISOString() });
    } catch (err) {
      appendLog({ source: source.label, error: String(err?.message || err), ts: new Date().toISOString() });
    } finally {
      setRunning(null);
    }
  };

  const runAllScrapers = async () => {
    for (const source of SCRAPE_SOURCES) await runScraper(source);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ background: 'var(--gh-panel)', border: '1px solid var(--gh-border)',
        borderRadius: 10, padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#fff' }}>Scrape Sources</h3>
            <p style={{ fontSize: 11, color: 'var(--gh-text-muted)', marginTop: 2 }}>
              Results are classified, deduped, and merged into the queue automatically.
            </p>
          </div>
          <button onClick={runAllScrapers} disabled={!!running}
            style={{ ...primaryBtnStyle, opacity: running ? 0.5 : 1 }}>
            <Icon name="play" size={13} style={{ marginRight: 6 }} />
            Run All
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 10 }}>
          {SCRAPE_SOURCES.map(source => (
            <div key={source.id} style={{ padding: 14, borderRadius: 10,
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <Icon name={source.icon} size={14} style={{ color: '#60a5fa' }} />
                <strong style={{ fontSize: 13, color: '#fff' }}>{source.label}</strong>
              </div>
              <p style={{ fontSize: 11, color: 'var(--gh-text-muted)', marginBottom: 10, minHeight: 28 }}>
                {source.desc}
              </p>
              {source.needsUrls && (
                <textarea value={competitorUrls} onChange={(e) => setCompetitorUrls(e.target.value)}
                  rows={3} style={{ marginBottom: 8, fontSize: 11 }} placeholder="One URL per line" />
              )}
              <button onClick={() => runScraper(source)} disabled={!!running}
                style={{ ...secondaryBtnStyle, width: '100%', justifyContent: 'center',
                  opacity: running ? 0.5 : 1 }}>
                {running === source.id
                  ? <><Icon name="loader-2" size={12} className="gh-spin" style={{ marginRight: 6 }} />Running…</>
                  : <><Icon name="download" size={12} style={{ marginRight: 6 }} />Run {source.label}</>}
              </button>
            </div>
          ))}
        </div>
      </div>

      {log.length > 0 && (
        <div style={{ background: 'var(--gh-panel)', border: '1px solid var(--gh-border)',
          borderRadius: 10, padding: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--gh-text-muted)',
            letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
            Recent Runs
          </div>
          <div style={{ fontFamily: 'ui-monospace,monospace', fontSize: 11 }}>
            {log.map((e, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, padding: '4px 0',
                borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ color: '#6b7280', minWidth: 60 }}>{e.ts.slice(11, 19)}</span>
                <span style={{ color: '#60a5fa', minWidth: 80 }}>{e.source}</span>
                {e.error
                  ? <span style={{ color: '#fca5a5' }}>✗ {e.error}</span>
                  : <span style={{ color: '#4ade80' }}>✓ {e.count} queries (+{e.added} after dedup)</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── SettingsTab ───────────────────────────────────────────────────────────────
function SettingsTab({ apiKeys, setApiKeys }) {
  const [local, setLocal] = useState(apiKeys);
  const [saved, setSaved] = useState(false);
  const [revealed, setRevealed] = useState({});

  useEffect(() => { setLocal(apiKeys); }, [apiKeys]);

  const PROVIDERS = [
    { key: 'claude',     label: 'Claude (Anthropic)',  placeholder: 'sk-ant-…',   docs: 'https://console.anthropic.com/'              },
    { key: 'chatgpt',    label: 'ChatGPT (OpenAI)',    placeholder: 'sk-…',       docs: 'https://platform.openai.com/api-keys'        },
    { key: 'perplexity', label: 'Perplexity',          placeholder: 'pplx-…',    docs: 'https://www.perplexity.ai/settings/api'      },
    { key: 'gemini',     label: 'Gemini (Google)',     placeholder: 'AIza…',      docs: 'https://aistudio.google.com/apikey'          },
  ];

  const handleSave = () => {
    saveAllKeys(local);
    setApiKeys(local);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ background: 'var(--gh-panel)', border: '1px solid var(--gh-border)',
        borderRadius: 10, padding: 16 }}>
        <h3 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700, color: '#fff' }}>LLM API Keys</h3>
        <p style={{ fontSize: 11, color: 'var(--gh-text-muted)', marginBottom: 16 }}>
          Stored in <code style={{ fontSize: 10, background: 'rgba(255,255,255,0.06)',
            padding: '1px 5px', borderRadius: 3 }}>gh-cc-cm-apikeys</code>. Never leave the browser except as outbound API calls.
        </p>

        <div style={{ display: 'grid', gap: 14 }}>
          {PROVIDERS.map(p => {
            const value = local[p.key] || '';
            const hasKey = !!value;
            const show = !!revealed[p.key];
            return (
              <div key={p.key}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#e5e7eb' }}>
                    {p.label}
                    {hasKey && <span style={{ fontSize: 9, marginLeft: 6, padding: '1px 5px',
                      borderRadius: 3, background: 'rgba(74,222,128,0.15)', color: '#4ade80',
                      fontWeight: 700 }}>SET</span>}
                  </label>
                  <a href={p.docs} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: 10, color: '#60a5fa', textDecoration: 'none' }}>
                    Get key ↗
                  </a>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input type={show ? 'text' : 'password'} value={value}
                    onChange={(e) => setLocal({ ...local, [p.key]: e.target.value })}
                    placeholder={p.placeholder}
                    style={{ flex: 1, fontFamily: 'ui-monospace,monospace' }} />
                  <button onClick={() => setRevealed(r => ({ ...r, [p.key]: !r[p.key] }))}
                    style={{ ...secondaryBtnStyle, padding: '8px 10px' }}>
                    <Icon name={show ? 'eye-off' : 'eye'} size={14} />
                  </button>
                  {hasKey && (
                    <button onClick={() => setLocal({ ...local, [p.key]: '' })}
                      style={{ ...secondaryBtnStyle, padding: '8px 10px', color: '#fca5a5' }}>
                      <Icon name="x" size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 18,
          paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button onClick={handleSave} style={primaryBtnStyle}>
            <Icon name="save" size={13} style={{ marginRight: 6 }} />
            Save Keys
          </button>
          {saved && (
            <span style={{ fontSize: 12, color: '#4ade80', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Icon name="check" size={13} /> Saved
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── CitationMonitor (root) ────────────────────────────────────────────────────
export default function CitationMonitor() {
  const [activeTab, setActiveTab] = useState('queue');
  const [queue, setQueueState] = useState(() => loadQueueFromLS());
  const [apiKeys, setApiKeys] = useState(() => loadAllKeys());

  // Persist on every mutation
  const setQueue = useCallback((updater) => {
    setQueueState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveQueueToLS(next);
      return next;
    });
  }, []);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px 60px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg,#0071e3,#2563eb)',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="activity" size={18} style={{ color: '#fff' }} />
            </div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#fff' }}>
              Citation Monitor
            </h2>
            <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 4,
              background: 'rgba(20,184,166,0.15)', color: '#2dd4bf', letterSpacing: '0.1em' }}>
              AEO 4.0
            </span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--gh-text-muted)', marginTop: 5 }}>
            Track GenerationHealth.me citations across Claude, ChatGPT, Perplexity, and Gemini.
          </p>
        </div>
        <div style={{ padding: '8px 14px', borderRadius: 10,
          background: 'rgba(255,255,255,0.03)', border: '1px solid var(--gh-border)' }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--gh-text-muted)',
            letterSpacing: '0.08em', textTransform: 'uppercase' }}>Queue</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>
            {queue.length}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 20,
        borderBottom: '1px solid var(--gh-border)' }}>
        {CM_TABS.map(tab => {
          const active = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                padding: '10px 16px', border: 'none', background: 'transparent',
                color: active ? '#fff' : 'var(--gh-text-muted)',
                fontSize: 13, fontWeight: active ? 700 : 500, cursor: 'pointer',
                borderBottom: active ? '2px solid #0071e3' : '2px solid transparent',
                marginBottom: -1, transition: 'all 150ms',
              }}>
              <Icon name={tab.icon} size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'queue'    && <QueueTab queue={queue} setQueue={setQueue} apiKeys={apiKeys} />}
      {activeTab === 'generate' && <GenerateTab queue={queue} setQueue={setQueue} />}
      {activeTab === 'scrape'   && <ScrapeTab queue={queue} setQueue={setQueue} />}
      {activeTab === 'settings' && <SettingsTab apiKeys={apiKeys} setApiKeys={setApiKeys} />}
    </div>
  );
}
