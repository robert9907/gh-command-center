import { useState, useCallback, lazy, Suspense } from 'react';
import Icon from './components/shared/Icon.jsx';

// Lazy load each major panel
const PageBuilder = lazy(() => import('./components/pagebuilder/PageBuilder.jsx'));
const CitationMonitor = lazy(() => import('./components/citation/CitationMonitor.jsx'));
const Architecture = lazy(() => import('./components/architecture/Architecture.jsx'));

const TABS = [
  { id: 'architecture',     label: 'Architecture',      icon: 'layout-grid' },
  { id: 'pageBuilder',      label: 'Page Builder',      icon: 'file-text'   },
  { id: 'citationMonitor',  label: 'Citation Monitor',  icon: 'activity'    },
];

function LoadingSpinner() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '60vh', flexDirection: 'column', gap: 16,
    }}>
      <Icon name="loader-2" size={32} className="gh-spin" style={{ color: 'var(--gh-blue)' }} />
      <span style={{ fontSize: 13, color: 'var(--gh-text-muted)' }}>Loading...</span>
    </div>
  );
}

// Load cluster data from baked window globals
const clusters = (typeof window !== 'undefined' && window.clusters) ? window.clusters : [];

function safeLSGet(key) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch { return null; }
}
function safeLSSet(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

export default function App() {
  const [activeTab, setActiveTab] = useState('pageBuilder');

  // Shared Architecture state
  const [done, setDoneRaw] = useState(() => {
    const baked = (typeof window !== 'undefined' && window.BAKED_DATA?.done) ? window.BAKED_DATA.done : {};
    const ls = safeLSGet('gh-cc-done') || {};
    return { ...baked, ...ls };
  });
  const [notes, setNotesRaw] = useState(() => {
    const baked = (typeof window !== 'undefined' && window.BAKED_DATA?.notes) ? window.BAKED_DATA.notes : {};
    const ls = safeLSGet('gh-cc-notes') || {};
    return { ...baked, ...ls };
  });
  const [focusClusterId, setFocusClusterIdRaw] = useState(() => safeLSGet('gh-cc-focus-cluster') || null);

  const setDone = useCallback((updater) => {
    setDoneRaw(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      safeLSSet('gh-cc-done', next);
      return next;
    });
  }, []);

  const setNotes = useCallback((updater) => {
    setNotesRaw(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      safeLSSet('gh-cc-notes', next);
      return next;
    });
  }, []);

  const setFocusClusterId = useCallback((val) => {
    setFocusClusterIdRaw(val);
    safeLSSet('gh-cc-focus-cluster', val);
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ── Nav ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(11,11,13,0.92)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--gh-border)',
        padding: '0 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, padding: '12px 0' }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--gh-blue)',
            letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            GenerationHealth.me
          </span>
          <span style={{ fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em',
            fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            Command Center
          </span>
          <span style={{ fontSize: 11, color: 'var(--gh-text-muted)' }}>
            SEO + AEO + GEO · v4.0 · Vite + React
          </span>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 2, height: '100%', alignItems: 'flex-end' }}>
          {TABS.map(tab => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '14px 18px',
                  border: 'none',
                  background: 'transparent',
                  color: active ? '#fff' : 'var(--gh-text-muted)',
                  fontSize: 13,
                  fontWeight: active ? 700 : 500,
                  cursor: 'pointer',
                  borderBottom: active ? '2px solid var(--gh-blue)' : '2px solid transparent',
                  transition: 'all 150ms',
                  whiteSpace: 'nowrap',
                }}
              >
                <Icon name={tab.icon} size={15} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Status badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 12px', borderRadius: 20,
          background: 'rgba(74,222,128,0.08)',
          border: '1px solid rgba(74,222,128,0.2)',
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: '#4ade80',
            boxShadow: '0 0 6px #4ade80',
          }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: '#4ade80' }}>Live</span>
        </div>
      </nav>

      {/* ── Content ── */}
      <main style={{ flex: 1, overflow: 'auto', padding: activeTab === 'architecture' ? '24px' : 0 }}>
        <Suspense fallback={<LoadingSpinner />}>
          {activeTab === 'architecture' && (
            <Architecture
              clusters={clusters}
              done={done}
              setDone={setDone}
              notes={notes}
              setNotes={setNotes}
              focusClusterId={focusClusterId}
              setFocusClusterId={setFocusClusterId}
              setView={setActiveTab}
            />
          )}
          {activeTab === 'pageBuilder'     && <PageBuilder />}
          {activeTab === 'citationMonitor' && <CitationMonitor />}
        </Suspense>
      </main>
    </div>
  );
}
