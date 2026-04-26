import { useState, useMemo, useCallback, useEffect } from "react";
import {
  listProposals,
  listSnoozedProposals,
  upsertProposals,
  rejectProposal,
  unsnoozeProposal,
  approveProposal,
} from "../../lib/proposalsStore.js";
import {
  runOpportunityScan,
  seasonalBoost,
} from "../../lib/opportunityEngine.js";
import { supabase } from "../../lib/supabase.js";
import { SkeletonCard, ErrorBanner, EmptyState } from "../shared/Polish.jsx";

// ── Constants ──────────────────────────────────────────────────────────────

const PHASES = [
  { id:1, label:"Phase 1  -  Foundation", weeks:"Weeks 1-3", color:"#0D9488", active:true },
  { id:2, label:"Phase 2  -  Content Expansion", weeks:"Weeks 4-7", color:"#2563EB", active:false },
  { id:3, label:"Phase 3  -  Authority & AI Visibility", weeks:"Weeks 8-12", color:"#7C3AED", active:false },
];

const STD_TASKS = [
  {id:"instant-answer",label:"Add instant-answer block (first 100 words)"},
  {id:"faq-schema",label:"Add FAQ schema (JSON-LD)"},
  {id:"comparison-table",label:"Add structured comparison table"},
  {id:"definition-format",label:"Definition-style formatting for key terms"},
  {id:"source-citations",label:"Add source citations (Medicare.gov, CMS.gov)"},
  {id:"authority-signals",label:"Author byline, updated date, NAP, license"},
  {id:"charts-visuals",label:"Add charts/visual data"},
  {id:"branded-graphics",label:"Add branded graphics (not stock)"},
  {id:"fb-promotion",label:"Facebook promotion"},
  {id:"gmb-post",label:"Google Business Profile post"},
];

const phase1Checklist = [
  {id:"author-page",label:"Create dedicated author page with credentials",category:"E-E-A-T"},
  {id:"about-nap",label:"Update About/Contact with full NAP + license",category:"E-E-A-T"},
  {id:"source-citations",label:"Add source citations to top 10 pages",category:"E-E-A-T"},
  {id:"reviews-embed",label:"Embed Google Business reviews on key pages",category:"E-E-A-T"},
  {id:"carrier-logos",label:"Add carrier logos to relevant pages",category:"E-E-A-T"},
  {id:"instant-answers",label:"Add instant-answer blocks to all pillar pages",category:"AEO"},
  {id:"faq-schema",label:"Add FAQ schema (JSON-LD) to all Q&A pages",category:"AEO"},
  {id:"definition-format",label:"Add definition-style formatting for key terms",category:"AEO"},
  {id:"comparison-tables",label:"Add structured comparison tables",category:"AEO"},
  {id:"ai-overview-audit",label:"Audit top 20 keywords for AI Overviews",category:"GEO"},
  {id:"direct-answers",label:"Ensure direct answers in first 100 words",category:"GEO"},
  {id:"howto-schema",label:"Add HowTo schema where appropriate",category:"GEO"},
  {id:"freshness-2026",label:"Update all pages with 2026 dates/premiums",category:"GEO"},
  {id:"charts-quotes",label:"Add charts/visuals to quotes & cost pages",category:"Content Gap"},
  {id:"images-branded",label:"Add branded graphics (not stock)",category:"Content Gap"},
  {id:"fb-promo",label:"Complete Facebook promotion for quotes/cost clusters",category:"Content Gap"},
  {id:"aeo-wikidata",label:"Create Wikidata entry for GenerationHealth.me",category:"AEO"},
  {id:"aeo-crunchbase",label:"Create Crunchbase profile",category:"AEO"},
  {id:"aeo-org-schema",label:"Add Organization schema to homepage (name, founder, sameAs)",category:"AEO"},
  {id:"calculator-tools",label:"Build + deploy Medicare cost & ACA subsidy calculators",category:"Content Gap"},
  {id:"aeo-entity-consistency",label:"Audit entity consistency across site, GBP, directories, socials",category:"AEO"},
  {id:"aeo-directory-listings",label:"Claim BBB, Chamber, NAIFA, health insurance directories",category:"AEO"},
  {id:"aeo-gbp-posts",label:"Publish 4+ GBP posts with service area + credential signals",category:"AEO"},
  {id:"aeo-citability-format",label:"Add quotable expert opinion sections to pillar pages",category:"AEO"},
  {id:"aeo-mobile-ux",label:"Audit mobile UX and page speed (AEO presence quality)",category:"AEO"},
];

const BRAND_BLUE = "#0071e3";

// ── Sub-components ─────────────────────────────────────────────────────────

function StatusDot({ status }) {
  const colors = { done:"#16A34A", inProgress:"#D97706", planned:"var(--gh-text-faint)" };
  return (
    <div style={{
      width:8,height:8,borderRadius:"50%",
      background:colors[status]||colors.planned,
      flexShrink:0,
    }}/>
  );
}

function ValueBadge({ label, value }) {
  const colors = {
    "Very High":{ bg:"#DCFCE7",color:"#15803D" },
    "High":{ bg:"#DBEAFE",color:"#1D4ED8" },
    "Medium-High":{ bg:"#F3E8FF",color:"#7E22CE" },
    "Medium":{ bg:"#FEF9C3",color:"#854D0E" },
  };
  const c = colors[value]||{ bg:"#F3F4F6",color:"var(--gh-text-muted)" };
  return (
    <span style={{
      fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:6,
      background:c.bg,color:c.color,
    }}>{label}: {value||"—"}</span>
  );
}

function AnimCheck({ checked, onToggle, sz = 18 }) {
  return (
    <div
      onClick={onToggle}
      style={{
        width:sz,height:sz,borderRadius:sz/3,flexShrink:0,cursor:"pointer",
        border:`2px solid ${checked?"#16A34A":"var(--gh-border-strong)"}`,
        background:checked?"#16A34A":"transparent",
        display:"flex",alignItems:"center",justifyContent:"center",
        transition:"all 0.2s",
      }}
    >
      {checked && (
        <svg width={sz*0.65} height={sz*0.65} viewBox="0 0 16 16" fill="none">
          <path d="M3 8.5L6.5 12L13 4" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </div>
  );
}

function NoteField({ value, onChange }) {
  return (
    <input
      value={value||""}
      onChange={e => onChange(e.target.value)}
      placeholder="Add note..."
      onClick={e => e.stopPropagation()}
      style={{
        display:"block",width:"100%",marginTop:4,fontSize:11,
        padding:"3px 8px",borderRadius:6,
        border:"1px solid var(--gh-border)",
        background:"var(--gh-input-bg)",color:"var(--gh-text-soft)",outline:"none",
      }}
    />
  );
}

// ── Opportunity Engine view ────────────────────────────────────────────────

function scoreColor(score) {
  if (score >= 85) return { bg:"#DCFCE7", text:"#15803D", border:"#16A34A" };
  if (score >= 70) return { bg:"#FEF3C7", text:"#92400E", border:"#D97706" };
  return { bg:"#F3F4F6", text:"#4B5563", border:"#9CA3AF" };
}

function ScoreBadge({ score }) {
  const c = scoreColor(score);
  return (
    <div style={{
      display:"inline-flex", alignItems:"center", justifyContent:"center",
      minWidth:48, height:48, borderRadius:12,
      background:c.bg, color:c.text, border:`1.5px solid ${c.border}`,
      fontSize:18, fontWeight:800, fontFamily:"'DM Sans',system-ui,sans-serif",
    }}>
      {score}
    </div>
  );
}

function TypeTag({ type }) {
  const isPillar = type === "pillar";
  const bg = isPillar ? "#EFF6FF" : "#F3E8FF";
  const color = isPillar ? "#1D4ED8" : "#7E22CE";
  return (
    <span style={{
      fontSize:10, fontWeight:800, padding:"3px 9px", borderRadius:6,
      background:bg, color, textTransform:"uppercase", letterSpacing:"0.08em",
    }}>{isPillar ? "Pillar" : "Expansion"}</span>
  );
}

function SignalCol({ label, value, sub }) {
  return (
    <div style={{ flex:1, minWidth:0 }}>
      <div style={{ fontSize:10, fontWeight:800, color:"var(--gh-text-muted)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:4 }}>
        {label}
      </div>
      <div style={{ fontSize:13, fontWeight:700, color:"var(--gh-text)" }}>{value}</div>
      {sub && <div style={{ fontSize:11, color:"var(--gh-text-faint)", marginTop:2 }}>{sub}</div>}
    </div>
  );
}

function ProposalCard({ proposal, onReject, onApprove, busy }) {
  const s = proposal.signals_json || {};
  const gsc = s.gsc || {};
  const aeo = s.aeo || {};
  const moat = s.moat || {};
  const seasonal = s.seasonal || {};
  const moatLabel = moat.tag ? moat.tag : (seasonal.boost === 1.0 ? "seasonal" : "general");
  const moatSub = seasonal.boost === 1.0 ? seasonal.reason : (moat.tag ? `fit ${(moat.fit*100).toFixed(0)}%` : "no moat tag");

  const cs = proposal.cluster_structure;
  const hasStructure = cs && cs.pillar && cs.spokes && cs.spokes.length > 0;

  return (
    <div style={{
      background:"var(--gh-panel)", borderRadius:16, padding:"18px 22px",
      border:"1px solid var(--gh-border)",
      boxShadow:"0 2px 8px rgba(0,0,0,0.04)",
    }}>
      {/* Header: score + title + type */}
      <div style={{ display:"flex", gap:16, alignItems:"flex-start", marginBottom:12 }}>
        <ScoreBadge score={proposal.score} />
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", marginBottom:4 }}>
            <TypeTag type={proposal.type} />
            <span style={{ fontSize:11, color:"var(--gh-text-muted)" }}>{proposal.page_count} {proposal.page_count === 1 ? "page" : "pages"}</span>
          </div>
          <h3 style={{ fontFamily:"Georgia,serif", fontSize:17, fontWeight:700, color:"var(--gh-text)", margin:"2px 0 4px", lineHeight:1.3 }}>
            {proposal.title}
          </h3>
          <div style={{ fontSize:12, color:"var(--gh-text-muted)", lineHeight:1.5 }}>{proposal.description}</div>
        </div>
      </div>

      {/* Cluster structure: pillar + spokes */}
      {hasStructure && (
        <div style={{
          margin:"0 0 14px", padding:"14px 16px",
          background:"var(--gh-input-bg)", borderRadius:10,
          border:"1px solid var(--gh-border)",
        }}>
          <div style={{ fontSize:10, fontWeight:800, color:"var(--gh-text-muted)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:10 }}>
            Cluster structure
          </div>
          {/* Pillar */}
          <div style={{
            display:"flex", alignItems:"center", gap:10, padding:"8px 12px",
            background: proposal.type === "pillar" ? "rgba(29,78,216,0.08)" : "rgba(126,34,206,0.08)",
            borderRadius:8, marginBottom:6,
            borderLeft:`3px solid ${proposal.type === "pillar" ? "#1D4ED8" : "#7E22CE"}`,
          }}>
            <span style={{
              fontSize:9, fontWeight:800, padding:"2px 7px", borderRadius:4,
              background: proposal.type === "pillar" ? "#EFF6FF" : "#F3E8FF",
              color: proposal.type === "pillar" ? "#1D4ED8" : "#7E22CE",
              textTransform:"uppercase", letterSpacing:"0.06em", flexShrink:0,
            }}>Pillar</span>
            <span style={{ fontSize:13, fontWeight:600, color:"var(--gh-text)", flex:1 }}>
              {cs.pillar.title}
            </span>
            {cs.pillar.impressions > 0 && (
              <span style={{ fontSize:10, color:"var(--gh-text-faint)", flexShrink:0 }}>
                {cs.pillar.impressions.toLocaleString()} imp
              </span>
            )}
          </div>
          {/* Spokes */}
          {cs.spokes.map((spoke, i) => (
            <div key={i} style={{
              display:"flex", alignItems:"center", gap:10, padding:"6px 12px 6px 24px",
              marginBottom: i < cs.spokes.length - 1 ? 3 : 0,
            }}>
              <span style={{
                width:6, height:6, borderRadius:"50%", flexShrink:0,
                background:"var(--gh-text-faint)", opacity:0.5,
              }} />
              <span style={{
                fontSize:9, fontWeight:700, padding:"1px 6px", borderRadius:3,
                background:"var(--gh-border)", color:"var(--gh-text-muted)",
                textTransform:"uppercase", letterSpacing:"0.04em", flexShrink:0,
              }}>Spoke</span>
              <span style={{ fontSize:12, color:"var(--gh-text-soft)", flex:1 }}>
                {spoke.title}
              </span>
              {spoke.impressions > 0 && (
                <span style={{ fontSize:10, color:"var(--gh-text-faint)", flexShrink:0 }}>
                  {spoke.impressions.toLocaleString()} imp
                </span>
              )}
            </div>
          ))}
          {/* Linking note */}
          <div style={{
            marginTop:10, padding:"6px 10px", borderRadius:6,
            background:"rgba(22,163,74,0.06)",
            fontSize:10, color:"#16A34A", fontWeight:600,
            display:"flex", alignItems:"center", gap:6,
          }}>
            <svg width={12} height={12} viewBox="0 0 16 16" fill="none" style={{ flexShrink:0 }}>
              <path d="M6.5 3.5L10 7L6.5 10.5" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 7H10" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Internal linking plan: spokes → pillar, pillar → all spokes, adjacent spokes cross-linked
          </div>
        </div>
      )}

      {/* Signal columns */}
      <div style={{ display:"flex", gap:16, padding:"14px 16px", background:"var(--gh-input-bg)", borderRadius:10, marginBottom:14 }}>
        <SignalCol
          label="GSC signal"
          value={`${gsc.queries || 0}q · pos ${gsc.avg_position || "—"}`}
          sub={gsc.total_impressions ? `${gsc.total_impressions.toLocaleString()} imp/mo` : "no data"}
        />
        <SignalCol
          label="AEO gap"
          value={aeo.engines_gap_avg != null ? `${(aeo.engines_gap_avg * 4).toFixed(1)}/4 engines` : "—"}
          sub={aeo.engines_gap_avg >= 0.75 ? "wide gap" : aeo.engines_gap_avg >= 0.5 ? "moderate gap" : "narrow"}
        />
        <SignalCol
          label="Moat"
          value={moatLabel}
          sub={moatSub}
        />
      </div>

      {/* Actions */}
      <div style={{ display:"flex", justifyContent:"flex-end", gap:8 }}>
        <button
          onClick={() => onReject(proposal)}
          disabled={busy}
          style={{
            padding:"8px 18px", borderRadius:8, border:"1px solid var(--gh-border-strong)",
            background:"var(--gh-panel)", color:"var(--gh-text-soft)", fontSize:13, fontWeight:600,
            cursor:busy?"not-allowed":"pointer", opacity:busy?0.5:1,
          }}
        >Reject</button>
        <button
          onClick={() => onApprove(proposal)}
          disabled={busy}
          style={{
            padding:"8px 22px", borderRadius:8, border:"none",
            background:BRAND_BLUE, color:"#FFF", fontSize:13, fontWeight:700,
            cursor:busy?"not-allowed":"pointer", opacity:busy?0.5:1,
          }}
        >Approve</button>
      </div>
    </div>
  );
}

function daysUntil(iso) {
  if (!iso) return 0;
  const diff = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
}

function SnoozedCard({ proposal, onUnsnooze, busy }) {
  const s = proposal.signals_json || {};
  const gsc = s.gsc || {};
  const days = daysUntil(proposal.rejected_until);
  return (
    <div style={{
      background:"var(--gh-panel)", borderRadius:12, padding:"12px 16px",
      border:"1px dashed var(--gh-border-strong)",
      display:"flex", alignItems:"center", gap:14, opacity:0.7,
    }}>
      <div style={{
        display:"inline-flex", alignItems:"center", justifyContent:"center",
        minWidth:40, height:40, borderRadius:10,
        background:"var(--gh-input-bg)", color:"var(--gh-text-muted)",
        fontSize:14, fontWeight:800,
      }}>
        {proposal.score}
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:14, fontWeight:700, color:"var(--gh-text-soft)", lineHeight:1.3, marginBottom:2 }}>
          {proposal.title}
        </div>
        <div style={{ fontSize:11, color:"var(--gh-text-muted)" }}>
          {proposal.type === "pillar" ? "Pillar" : "Expansion"} · {proposal.page_count} {proposal.page_count === 1 ? "page" : "pages"}
          {gsc.queries ? ` · ${gsc.queries}q GSC` : ""}
          {" · "}
          <span style={{ color:"var(--gh-amber)" }}>Resurfaces in {days} {days === 1 ? "day" : "days"}</span>
        </div>
      </div>
      <button
        onClick={() => onUnsnooze(proposal)}
        disabled={busy}
        style={{
          padding:"6px 14px", borderRadius:8,
          border:"1px solid var(--gh-border-strong)",
          background:"transparent", color:"var(--gh-text)",
          fontSize:12, fontWeight:600,
          cursor:busy?"not-allowed":"pointer", opacity:busy?0.5:1,
          flexShrink:0,
        }}
      >Unsnooze now</button>
    </div>
  );
}

function SnoozedSection({ snoozed, onUnsnooze, busyId, onRefresh }) {
  const [open, setOpen] = useState(false);
  if (!snoozed || snoozed.length === 0) return null;
  return (
    <div style={{ marginBottom:24 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width:"100%", textAlign:"left",
          padding:"10px 14px", borderRadius:10,
          border:"1px solid var(--gh-border)",
          background:"var(--gh-input-bg)",
          color:"var(--gh-text-soft)",
          fontSize:12, fontWeight:700, letterSpacing:"0.04em",
          display:"flex", alignItems:"center", gap:10, cursor:"pointer",
        }}
      >
        <span style={{
          display:"inline-block", width:0, height:0,
          borderLeft:"5px solid transparent",
          borderRight:"5px solid transparent",
          borderTop:"6px solid var(--gh-text-muted)",
          transform:`rotate(${open ? 0 : -90}deg)`,
          transition:"transform 150ms",
        }} />
        <span style={{ textTransform:"uppercase" }}>Snoozed</span>
        <span style={{
          background:"var(--gh-border)", color:"var(--gh-text-muted)",
          fontSize:10, fontWeight:800, padding:"2px 7px", borderRadius:10,
        }}>{snoozed.length}</span>
        <span style={{ marginLeft:"auto", fontSize:11, color:"var(--gh-text-muted)", fontWeight:500, letterSpacing:0 }}>
          Rejected within the last 30 days — kept here so the engine doesn't silently drop ideas.
        </span>
      </button>
      {open && (
        <div style={{ display:"flex", flexDirection:"column", gap:8, marginTop:8 }}>
          {snoozed.map(p => (
            <SnoozedCard
              key={p.id}
              proposal={p}
              onUnsnooze={(pr) => onUnsnooze(pr).then(onRefresh)}
              busy={busyId === p.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function OpportunityEngineView({
  proposals, loading, scanning, onRunScan, onReject, onApprove, diagnostics, busyId,
  metrics, error, snoozed, onUnsnooze, onRefresh,
}) {
  const seasonal = seasonalBoost();

  return (
    <div>
      {/* Metric cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(180px, 1fr))", gap:12, marginBottom:20 }}>
        {[
          { label:"Live clusters", value:metrics.liveClusters, color:"var(--gh-text)" },
          { label:"Pages live",    value:metrics.livePages,    color:"#16A34A" },
          { label:"Slots remaining", value:metrics.slotsRemaining, color:"#D97706" },
          { label:"Proposed",      value:proposals.length,     color:BRAND_BLUE },
        ].map(m => (
          <div key={m.label} style={{
            background:"var(--gh-panel)", borderRadius:12, padding:"16px 18px",
            border:"1px solid var(--gh-border)", boxShadow:"0 2px 8px rgba(0,0,0,0.03)",
          }}>
            <div style={{ fontSize:28, fontWeight:800, color:m.color, lineHeight:1 }}>{m.value}</div>
            <div style={{ fontSize:11, fontWeight:600, color:"var(--gh-text-muted)", marginTop:6, textTransform:"uppercase", letterSpacing:"0.06em" }}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* Proposal cards */}
      <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:24 }}>
        {loading && (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        )}
        {!loading && error && (
          <ErrorBanner
            title="Couldn't load proposals"
            message={error}
            hint="This usually means Supabase is unreachable or the cluster_proposals table schema drifted."
            onRetry={onRunScan}
            retryLabel="Retry scan"
          />
        )}
        {!loading && !error && proposals.length === 0 && (
          <EmptyState
            icon="sparkles"
            title="No proposals yet"
            body="The Opportunity Engine runs automatically every morning at 6am, scoring GSC, AEO, moat fit, and seasonality. You can run it now to generate proposals from the latest signals."
            cta={scanning ? "Scanning…" : "Run scan now"}
            onCta={scanning ? undefined : onRunScan}
          />
        )}
        {!loading && proposals.map(p => (
          <ProposalCard
            key={p.id}
            proposal={p}
            onReject={onReject}
            onApprove={onApprove}
            busy={busyId === p.id}
          />
        ))}
      </div>

      {/* Snoozed — visibility for auto-rejected proposals inside the 30-day window */}
      {!loading && (
        <SnoozedSection
          snoozed={snoozed}
          onUnsnooze={onUnsnooze}
          busyId={busyId}
          onRefresh={onRefresh}
        />
      )}

      {/* Signal sources summary */}
      <div style={{
        background:"var(--gh-panel)", borderRadius:14, padding:"18px 22px",
        border:"1px solid var(--gh-border)", boxShadow:"0 2px 8px rgba(0,0,0,0.03)",
      }}>
        <div style={{ fontSize:11, fontWeight:800, color:"var(--gh-text-muted)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:12 }}>
          Signal sources
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(160px, 1fr))", gap:20 }}>
          {[
            { label:"GSC queries analyzed", value:diagnostics.gsc_eligible ?? "—", sub:`${diagnostics.gsc_rows ?? 0} total rows` },
            { label:"Citation Monitor tracked", value:diagnostics.citation_queries_tracked ?? "—", sub:`${diagnostics.citation_queries_used ?? 0} fed into proposals · ${diagnostics.competitor_gaps ?? 0} with competitor gaps` },
            { label:"Clusters formed", value:diagnostics.clusters_formed ?? "—", sub:`${diagnostics.clusters_merged ?? 0} queries merged into clusters` },
            { label:"Seasonal triggers", value:seasonal.boost === 1.0 ? "Active" : "Off-season", sub:seasonal.reason },
            { label:"Covered (skipped)", value:diagnostics.covered_skipped ?? "—", sub:"already in a cluster" },
          ].map(m => (
            <div key={m.label}>
              <div style={{ fontSize:18, fontWeight:800, color:"var(--gh-text)" }}>{m.value}</div>
              <div style={{ fontSize:11, fontWeight:600, color:"var(--gh-text-muted)", marginTop:2, textTransform:"uppercase", letterSpacing:"0.06em" }}>{m.label}</div>
              {m.sub && <div style={{ fontSize:11, color:"var(--gh-text-faint)", marginTop:2 }}>{m.sub}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function Architecture({ clusters, done, setDone, notes, setNotes, focusClusterId, setFocusClusterId, setView }) {

  // phaseFilter: "opportunity" (default) | 0 (All) | 1 | 2 | 3
  const [phaseFilter, setPhaseFilter] = useState("opportunity");
  const [expandedCluster, setExpandedCluster] = useState(null);
  const [recentId, setRecentId] = useState(null);

  // Opportunity engine state
  const [proposals, setProposals] = useState([]);
  const [snoozed, setSnoozed] = useState([]);
  const [proposalsLoading, setProposalsLoading] = useState(true);
  const [proposalsError, setProposalsError] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [diagnostics, setDiagnostics] = useState({});

  // ── Helpers ──
  const isDone = useCallback((id) => !!done?.[id], [done]);

  const toggle = useCallback((id) => {
    setDone(prev => {
      const next = { ...prev };
      if (next[id]) { delete next[id]; }
      else { next[id] = Date.now(); }
      return next;
    });
    setRecentId(id);
    setTimeout(() => setRecentId(null), 1100);
  }, [setDone]);

  const getNote = useCallback((id) => notes?.[id] || "", [notes]);
  const setNote = useCallback((id, val) => {
    setNotes(prev => ({ ...prev, [id]: val }));
  }, [setNotes]);

  // ── Derived ──
  const filtered = useMemo(() =>
    phaseFilter === 0 || phaseFilter === "opportunity"
      ? clusters
      : clusters.filter(c => c.phase === phaseFilter),
    [phaseFilter, clusters]
  );

  const totalPages = clusters.reduce((s, c) => s + c.posts.length, 0);
  const livePages = clusters.reduce((s, c) => s + c.posts.filter(p => p.status === "done").length, 0);
  const liveClusters = clusters.filter(c => c.posts.some(p => p.status === "done")).length;
  const p1Done = phase1Checklist.filter(t => isDone(`p1-${t.id}`)).length;

  const metrics = {
    liveClusters,
    livePages,
    slotsRemaining: totalPages - livePages,
    totalPages,
  };

  // ── Opportunity engine: load + scan ──
  const loadProposals = useCallback(async () => {
    setProposalsLoading(true);
    setProposalsError(null);
    try {
      const [rows, snoozedRows] = await Promise.all([
        listProposals(),
        listSnoozedProposals().catch(() => []),
      ]);
      setProposals(rows);
      setSnoozed(snoozedRows);
    } catch (e) {
      setProposalsError(`Could not load proposals: ${e.message || e}`);
    } finally {
      setProposalsLoading(false);
    }
  }, []);

  const handleUnsnooze = useCallback(async (p) => {
    setBusyId(p.id);
    try {
      await unsnoozeProposal(p.id);
      setSnoozed(prev => prev.filter(x => x.id !== p.id));
    } catch (e) {
      setProposalsError(`Unsnooze failed: ${e.message || e}`);
    } finally {
      setBusyId(null);
    }
  }, []);

  const runScan = useCallback(async () => {
    if (scanning) return;
    setScanning(true);
    setProposalsError(null);
    try {
      const { data: cqRows } = await supabase
        .from("citation_queries").select("id, query_text");
      const { data: crRows } = await supabase
        .from("citation_results").select("query_id, engine, status");
      const result = await runOpportunityScan({
        clusters,
        citationQueries: cqRows || [],
        citationResults: crRows || [],
      });
      setDiagnostics(result.diagnostics);
      await upsertProposals(result.proposals);
      await loadProposals();
    } catch (e) {
      setProposalsError(`Scan failed: ${e.message || e}`);
    } finally {
      setScanning(false);
    }
  }, [clusters, scanning, loadProposals]);

  // On mount: load existing proposals; if none, kick a scan automatically.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      await loadProposals();
      if (cancelled) return;
      // Auto-scan on first load when nothing exists (ensures feature works on deploy)
      try {
        const { count, error } = await supabase
          .from("cluster_proposals")
          .select("*", { count: "exact", head: true });
        if (!error && (count ?? 0) === 0) runScan();
      } catch { /* silent */ }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleReject = useCallback(async (p) => {
    setBusyId(p.id);
    try {
      await rejectProposal(p.id);
      setProposals(prev => prev.filter(x => x.id !== p.id));
      // Surface the newly-rejected proposal in the Snoozed section so the
      // user can see the engine considered it (and can undo if needed).
      const rejectedUntil = new Date(Date.now() + 30 * 86400000).toISOString();
      setSnoozed(prev => [
        { ...p, status: 'rejected', rejected_until: rejectedUntil },
        ...prev,
      ]);
    } catch (e) {
      setProposalsError(`Reject failed: ${e.message || e}`);
    } finally {
      setBusyId(null);
    }
  }, []);

  const handleApprove = useCallback(async (p) => {
    setBusyId(p.id);
    try {
      await approveProposal(p);
      setProposals(prev => prev.filter(x => x.id !== p.id));
    } catch (e) {
      setProposalsError(`Approve failed: ${e.message || e}`);
    } finally {
      setBusyId(null);
    }
  }, []);

  const isOpportunity = phaseFilter === "opportunity";

  // ── Render ──
  return (
    <div style={{ fontFamily: "'DM Sans','Instrument Sans',system-ui,sans-serif", color:"var(--gh-text)" }}>

      {/* Header row: title + Run scan now (only when opportunity view is active) */}
      {isOpportunity && (
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16, flexWrap:"wrap", gap:12 }}>
          <div>
            <div style={{ fontSize:11, fontWeight:800, color:BRAND_BLUE, textTransform:"uppercase", letterSpacing:"0.1em" }}>
              Opportunity Engine
            </div>
            <div style={{ fontSize:13, color:"var(--gh-text-muted)", marginTop:2 }}>
              Cluster proposals scored from GSC signals, AEO gaps, and moat fit. Next auto-scan: daily at 6am.
            </div>
          </div>
          <button
            onClick={runScan}
            disabled={scanning}
            style={{
              padding:"9px 18px", borderRadius:10, border:"none",
              background:scanning ? "var(--gh-text-faint)" : BRAND_BLUE,
              color:"#FFF", fontSize:12, fontWeight:700,
              cursor:scanning ? "not-allowed" : "pointer",
              letterSpacing:"0.02em",
            }}
          >
            {scanning ? "Scanning…" : "Run scan now"}
          </button>
        </div>
      )}

      {/* Summary strip — cluster view only */}
      {!isOpportunity && (
        <div style={{ display:"flex", gap:12, marginBottom:20, flexWrap:"wrap" }}>
          {[
            { label:"Total Pages", value:totalPages, color:"var(--gh-text)" },
            { label:"Live", value:livePages, color:"#16A34A" },
            { label:"Planned", value:totalPages-livePages, color:"var(--gh-text-muted)" },
            { label:"Phase 1 Tasks", value:`${p1Done}/${phase1Checklist.length}`, color:"#0D9488" },
          ].map(s => (
            <div key={s.label} style={{ background:"var(--gh-input-bg)", borderRadius:10, padding:"10px 16px", border:"1px solid var(--gh-border)", minWidth:100 }}>
              <div style={{ fontSize:22, fontWeight:700, color:s.color }}>{s.value}</div>
              <div style={{ fontSize:11, color:"var(--gh-text-muted)", marginTop:2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Focus cluster banner — cluster view only */}
      {!isOpportunity && focusClusterId && (() => {
        const fc = clusters.find(c => c.id === focusClusterId);
        if (!fc) return null;
        const ph = PHASES.find(p => p.id === fc.phase);
        const fcLive = fc.posts.filter(p => p.status === "done").length;
        const fcStd = STD_TASKS.filter(t => isDone(`std-${fc.id}-${t.id}`)).length;
        return (
          <div style={{ background:`${ph?.color||"#0D9488"}10`, border:`1.5px solid ${ph?.color||"#0D9488"}40`, borderRadius:12, padding:"14px 18px", marginBottom:20 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
              <span style={{ fontSize:14 }}>🎯</span>
              <span style={{ fontSize:12, fontWeight:800, color:ph?.color||"#0D9488", textTransform:"uppercase", letterSpacing:"0.08em" }}>Focus Cluster</span>
            </div>
            <div style={{ fontSize:16, fontWeight:700, color:"var(--gh-text)", marginBottom:6 }}>{fc.name}</div>
            <div style={{ display:"flex", gap:16, fontSize:12, color:"var(--gh-text-muted)" }}>
              <span>Pages: <strong style={{ color:"var(--gh-text)" }}>{fcLive}/{fc.posts.length} live</strong></span>
              <span>Std tasks: <strong style={{ color:"var(--gh-text)" }}>{fcStd}/{STD_TASKS.length}</strong></span>
              {fc.gameplanPriority && <span>Priority: <strong style={{ color:"#D97706" }}>#{fc.gameplanPriority}</strong></span>}
            </div>
          </div>
        );
      })()}

      {/* Filter chips — Opportunity engine first */}
      <div style={{ display:"flex", gap:8, marginBottom:20, flexWrap:"wrap" }}>
        <button
          onClick={() => setPhaseFilter("opportunity")}
          style={{
            padding:"8px 18px", borderRadius:10, border:"none", cursor:"pointer",
            fontSize:12, fontWeight:700,
            background:isOpportunity ? `${BRAND_BLUE}22` : "var(--gh-input-bg)",
            color:isOpportunity ? BRAND_BLUE : "var(--gh-text-muted)",
            display:"inline-flex", alignItems:"center", gap:8,
          }}
        >
          <span>Opportunity engine</span>
          <span style={{
            background:isOpportunity ? BRAND_BLUE : "var(--gh-border-strong)",
            color:"#FFF", fontSize:10, fontWeight:800,
            padding:"2px 7px", borderRadius:10, minWidth:16, textAlign:"center",
          }}>{proposals.length}</span>
        </button>
        <button onClick={() => setPhaseFilter(0)} style={{ padding:"8px 18px", borderRadius:10, border:"none", cursor:"pointer", fontSize:12, fontWeight:700, background:phaseFilter===0?"var(--gh-border)":"var(--gh-input-bg)", color:phaseFilter===0?"var(--gh-text)":"var(--gh-text-muted)" }}>All</button>
        {PHASES.map(p => (
          <button key={p.id} onClick={() => setPhaseFilter(p.id)} style={{ padding:"8px 18px", borderRadius:10, border:"none", cursor:"pointer", fontSize:12, fontWeight:700, background:phaseFilter===p.id?`${p.color}33`:"var(--gh-input-bg)", color:phaseFilter===p.id?p.color:"var(--gh-text-muted)" }}>
            {p.active ? "● " : ""}{p.label}
          </button>
        ))}
      </div>

      {/* Opportunity Engine view */}
      {isOpportunity && (
        <OpportunityEngineView
          proposals={proposals}
          snoozed={snoozed}
          loading={proposalsLoading}
          scanning={scanning}
          onRunScan={runScan}
          onReject={handleReject}
          onApprove={handleApprove}
          onUnsnooze={handleUnsnooze}
          onRefresh={loadProposals}
          diagnostics={diagnostics}
          busyId={busyId}
          metrics={metrics}
          error={proposalsError}
        />
      )}

      {/* Cluster cards — hidden in opportunity view */}
      {!isOpportunity && (
        <div style={{ display:"grid", gap:14, marginBottom:32 }}>
          {filtered.map(cluster => {
            const ph = PHASES.find(p => p.id === cluster.phase);
            const isExp = expandedCluster === cluster.id;
            const livePosts = cluster.posts.filter((p, i) => p.status === "done" || isDone(`cr-${cluster.id}-${i}`)).length;
            return (
              <div key={cluster.id} style={{
                background:"var(--gh-panel)",
                border:isExp ? `2px solid ${ph?.color||"#0D9488"}` : "1px solid var(--gh-border)",
                borderRadius:16, overflow:"hidden",
                boxShadow:isExp ? `0 8px 32px ${ph?.color||"#0D9488"}18` : "0 2px 8px rgba(0,0,0,0.04)",
              }}>
                {/* Cluster header */}
                <div onClick={() => setExpandedCluster(isExp ? null : cluster.id)} style={{ padding:"20px 24px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"space-between", gap:16, background:isExp ? `${ph?.color||"#0D9488"}08` : "transparent" }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6, flexWrap:"wrap" }}>
                      <span style={{ fontSize:10, fontWeight:800, letterSpacing:"0.1em", color:ph?.color||"#0D9488", textTransform:"uppercase" }}>
                        {cluster.type === "county-system" ? "County System" : "Pillar Cluster"}
                      </span>
                      <StatusDot status={cluster.status} />
                      {cluster.gameplanPriority && (
                        <span style={{ fontSize:10, fontWeight:800, background:"#FEF3C7", color:"#92400E", padding:"2px 8px", borderRadius:6 }}>#{cluster.gameplanPriority}</span>
                      )}
                    </div>
                    <h3 style={{ fontFamily:"Georgia,serif", fontSize:18, fontWeight:700, color:"var(--gh-text)", margin:0 }}>{cluster.name}</h3>
                    <div style={{ display:"flex", gap:6, marginTop:8, flexWrap:"wrap" }}>
                      <ValueBadge label="SEO" value={cluster.seoValue} />
                      <ValueBadge label="AEO" value={cluster.aeoValue} />
                      <ValueBadge label="GEO" value={cluster.geoValue} />
                    </div>
                  </div>
                  <div style={{ textAlign:"right", flexShrink:0 }}>
                    <div style={{ fontSize:24, fontWeight:800, color:"var(--gh-text)" }}>{livePosts}/{cluster.posts.length}</div>
                    <div style={{ fontSize:11, color:"var(--gh-text-muted)" }}>pages</div>
                  </div>
                </div>

                {/* Expanded body */}
                {isExp && (
                  <div style={{ padding:"0 24px 24px", borderTop:"1px solid var(--gh-border)" }}>
                    <div style={{ display:"flex", gap:8, margin:"16px 0 8px" }}>
                      <button onClick={() => setFocusClusterId(focusClusterId === cluster.id ? null : cluster.id)} style={{ padding:"6px 16px", borderRadius:8, border:"1.5px solid rgba(255,199,44,0.5)", background:focusClusterId===cluster.id?"rgba(255,199,44,0.15)":"transparent", color:"#FFC72C", fontSize:12, fontWeight:700, cursor:"pointer" }}>
                        {focusClusterId === cluster.id ? "🎯 In Focus" : "🎯 Set as Focus Cluster"}
                      </button>
                    </div>

                    {cluster.gameplanNote && (
                      <div style={{ margin:"16px 0", padding:"12px 16px", background:"rgba(251,191,36,0.10)", borderLeft:"3px solid #D97706", borderRadius:"0 8px 8px 0", fontSize:13, color:"var(--gh-amber)" }}>
                        <strong>Note:</strong> {cluster.gameplanNote}
                      </div>
                    )}
                    {cluster.templateUsed && (
                      <div style={{ margin:"16px 0", padding:"12px 16px", background:"rgba(37,99,235,0.10)", borderLeft:"3px solid #2563EB", borderRadius:"0 8px 8px 0", fontSize:13, color:"var(--gh-blue-2)" }}>
                        <strong>Master Template v3.0</strong>
                      </div>
                    )}

                    <div style={{ marginTop:16 }}>
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                        <span style={{ fontSize:11, fontWeight:800, letterSpacing:"0.1em", color:ph?.color||"#0D9488", textTransform:"uppercase" }}>Pages ({livePosts}/{cluster.posts.length})</span>
                        <div style={{ display:"flex", gap:16, fontSize:10, fontWeight:700, color:"var(--gh-text-muted)", textTransform:"uppercase", letterSpacing:"0.06em" }}>
                          <span>Created</span><span>Indexed</span>
                        </div>
                      </div>
                      {cluster.posts.map((post, i) => {
                        const createdId = `cr-${cluster.id}-${i}`;
                        const indexedId = `ix-${cluster.id}-${i}`;
                        const isCreated = post.status === "done" || isDone(createdId);
                        const isIndexed = isDone(indexedId);
                        const isPillar = i === 0;
                        return (
                          <div key={i} style={{
                            display:"flex", alignItems:"center", gap:10,
                            padding:"10px 14px", margin:"4px 0",
                            background:isIndexed?"rgba(74,222,128,0.10)":isCreated?"rgba(251,191,36,0.10)":"var(--gh-input-bg)",
                            borderRadius:10, fontSize:13,
                            borderLeft:`3px solid ${isIndexed?"#16A34A":isCreated?"#D97706":"var(--gh-border-strong)"}`,
                          }}>
                            <div style={{ flex:1, minWidth:0 }}>
                              <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
                                {isPillar && (
                                  <span style={{ fontSize:9, fontWeight:800, background:`${ph?.color||"#0D9488"}20`, color:ph?.color||"#0D9488", padding:"1px 6px", borderRadius:4, textTransform:"uppercase" }}>Pillar</span>
                                )}
                                <span style={{ color:"var(--gh-text-soft)", fontWeight:isPillar?700:400 }}>{post.name}</span>
                                {post.hospital && <span style={{ color:"var(--gh-text-muted)" }}>  -  {post.hospital}</span>}
                              </div>
                              {post.slug && <div style={{ fontSize:11, color:"var(--gh-text-muted)", marginTop:2 }}>/{post.slug}</div>}
                              {post.publishDate && <div style={{ fontSize:10, fontWeight:700, color:"#2563EB", marginTop:3 }}>Publish: {post.publishDate}</div>}
                              {post.status === "planned" && post.slug && (
                                <button onClick={e => { e.stopPropagation(); setView("pageBuilder"); }} style={{ marginTop:6, padding:"4px 12px", borderRadius:7, border:"none", background:"linear-gradient(135deg,#0D9488,#14B8A6)", color:"#FFF", fontSize:11, fontWeight:700, cursor:"pointer" }}>📄 Build Page</button>
                              )}
                            </div>
                            <div style={{ display:"flex", gap:16, alignItems:"center", flexShrink:0 }}>
                              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
                                {post.status === "done"
                                  ? <div style={{ width:18, height:18, borderRadius:6, background:"#16A34A", display:"flex", alignItems:"center", justifyContent:"center" }}><svg width={12} height={12} viewBox="0 0 16 16" fill="none"><path d="M3 8.5L6.5 12L13 4" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
                                  : <AnimCheck checked={isDone(createdId)} onToggle={() => toggle(createdId)} sz={18} />
                                }
                              </div>
                              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
                                <AnimCheck checked={isIndexed} onToggle={() => toggle(indexedId)} sz={18} />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div style={{ marginTop:24 }}>
                      <div style={{ fontSize:11, fontWeight:800, letterSpacing:"0.1em", color:"#0D9488", textTransform:"uppercase", marginBottom:10 }}>
                        Optimization Checklist ({STD_TASKS.filter(t => isDone(`std-${cluster.id}-${t.id}`)).length}/{STD_TASKS.length})
                      </div>
                      <div style={{ background:"var(--gh-input-bg)", borderRadius:12, padding:"12px 16px", border:"1px solid var(--gh-border)" }}>
                        {STD_TASKS.map((task, i) => {
                          const tid = `std-${cluster.id}-${task.id}`;
                          const d = isDone(tid);
                          return (
                            <div key={task.id} style={{
                              display:"flex", alignItems:"flex-start", gap:8,
                              padding:"7px 0", fontSize:13,
                              borderBottom:i < STD_TASKS.length-1 ? "1px solid var(--gh-border)" : "none",
                              animation:recentId===tid?"donePulse 1s ease":"none",
                            }}>
                              <AnimCheck checked={d} onToggle={() => toggle(tid)} sz={18} />
                              <div style={{ flex:1 }}>
                                <span style={{ color:d?"#16A34A":"var(--gh-text-soft)", textDecoration:d?"line-through":"none", transition:"all 0.3s" }}>{task.label}</span>
                                {d && <NoteField value={getNote(tid)} onChange={v => setNote(tid, v)} />}
                              </div>
                              {d && done[tid] && <span style={{ fontSize:10, color:"var(--gh-text-faint)", flexShrink:0 }}>{new Date(done[tid]).toLocaleDateString()}</span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {cluster.phase1Tasks?.length > 0 && (
                      <div style={{ marginTop:20 }}>
                        <div style={{ fontSize:11, fontWeight:700, color:"#D97706", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:10 }}>
                          Cluster-Specific Tasks ({cluster.phase1Tasks.filter((_, i) => isDone(`cl-${cluster.id}-${i}`)).length}/{cluster.phase1Tasks.length})
                        </div>
                        {cluster.phase1Tasks.map((task, i) => {
                          const tid = `cl-${cluster.id}-${i}`;
                          const d = isDone(tid);
                          return (
                            <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:8, padding:"8px 0", fontSize:13, borderBottom:i<cluster.phase1Tasks.length-1?"1px solid var(--gh-border)":"none", animation:recentId===tid?"donePulse 1s ease":"none" }}>
                              <AnimCheck checked={d} onToggle={() => toggle(tid)} sz={18} />
                              <div style={{ flex:1 }}>
                                <span style={{ color:d?"#16A34A":"var(--gh-text-soft)", textDecoration:d?"line-through":"none" }}>{task}</span>
                                {d && <NoteField value={getNote(tid)} onChange={v => setNote(tid, v)} />}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Phase 1 Global Checklist — cluster view only */}
      {!isOpportunity && (
      <div style={{ background:"var(--gh-panel)", borderRadius:16, border:"1px solid var(--gh-border)", padding:"20px 24px", boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
        <div style={{ fontSize:14, fontWeight:800, color:"var(--gh-text)", marginBottom:4 }}>Phase 1 — Site-Wide Checklist</div>
        <div style={{ fontSize:12, color:"var(--gh-text-muted)", marginBottom:16 }}>{p1Done}/{phase1Checklist.length} tasks complete</div>
        <div style={{ height:6, background:"var(--gh-input-bg)", borderRadius:3, overflow:"hidden", marginBottom:20 }}>
          <div style={{ height:"100%", width:`${Math.round(p1Done/phase1Checklist.length*100)}%`, background:"linear-gradient(90deg,#0D9488,#14B8A6)", borderRadius:3, transition:"width 0.3s" }} />
        </div>
        {["E-E-A-T","AEO","GEO","Content Gap"].map(cat => {
          const catTasks = phase1Checklist.filter(t => t.category === cat);
          const catDone = catTasks.filter(t => isDone(`p1-${t.id}`)).length;
          const catColors = { "E-E-A-T":"#FFC72C","AEO":"#60A5FA","GEO":"#A78BFA","Content Gap":"#2DD4BF" };
          return (
            <div key={cat} style={{ marginBottom:16 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                <span style={{ fontSize:11, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.08em", color:catColors[cat]||"var(--gh-text-muted)" }}>{cat}</span>
                <span style={{ fontSize:11, fontWeight:700, color:catDone===catTasks.length?"#16A34A":"var(--gh-text-muted)" }}>{catDone}/{catTasks.length}</span>
              </div>
              {catTasks.map((task, i) => {
                const tid = `p1-${task.id}`;
                const d = isDone(tid);
                return (
                  <div key={task.id} style={{ display:"flex", alignItems:"flex-start", gap:8, padding:"6px 0", fontSize:13, borderBottom:i<catTasks.length-1?"1px solid var(--gh-border)":"none" }}>
                    <AnimCheck checked={d} onToggle={() => toggle(tid)} sz={18} />
                    <span style={{ color:d?"#16A34A":"var(--gh-text-soft)", textDecoration:d?"line-through":"none", flex:1 }}>{task.label}</span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      )}

      <style>{`
        @keyframes donePulse {
          0% { background-color: transparent; }
          30% { background-color: rgba(74,222,128,0.18); }
          100% { background-color: transparent; }
        }
      `}</style>
    </div>
  );
}
