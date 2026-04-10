import { useState, useMemo, useCallback } from "react";

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

// ── Sub-components ─────────────────────────────────────────────────────────

function StatusDot({ status }) {
  const colors = { done:"#16A34A", inProgress:"#D97706", planned:"#C4CDD5" };
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
  const c = colors[value]||{ bg:"#F3F4F6",color:"#6B7B8D" };
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
        border:`2px solid ${checked?"#16A34A":"#C4CDD5"}`,
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
        border:"1px solid rgba(0,0,0,0.1)",
        background:"rgba(0,0,0,0.02)",color:"#3A4553",outline:"none",
      }}
    />
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function Architecture({ clusters, done, setDone, notes, setNotes, focusClusterId, setFocusClusterId, setView }) {

  const [phaseFilter, setPhaseFilter] = useState(0);
  const [expandedCluster, setExpandedCluster] = useState(null);
  const [recentId, setRecentId] = useState(null);

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
    phaseFilter === 0 ? clusters : clusters.filter(c => c.phase === phaseFilter),
    [phaseFilter, clusters]
  );

  const totalPages = clusters.reduce((s, c) => s + c.posts.length, 0);
  const livePages = clusters.reduce((s, c) => s + c.posts.filter(p => p.status === "done").length, 0);
  const p1Done = phase1Checklist.filter(t => isDone(`p1-${t.id}`)).length;

  // ── Render ──
  return (
    <div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", color:"#1A2332" }}>

      {/* Summary strip */}
      <div style={{ display:"flex", gap:12, marginBottom:20, flexWrap:"wrap" }}>
        {[
          { label:"Total Pages", value:totalPages, color:"#1A2332" },
          { label:"Live", value:livePages, color:"#16A34A" },
          { label:"Planned", value:totalPages-livePages, color:"#6B7B8D" },
          { label:"Phase 1 Tasks", value:`${p1Done}/${phase1Checklist.length}`, color:"#0D9488" },
        ].map(s => (
          <div key={s.label} style={{ background:"#F9FAFB", borderRadius:10, padding:"10px 16px", border:"1px solid rgba(0,0,0,0.06)", minWidth:100 }}>
            <div style={{ fontSize:22, fontWeight:700, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:11, color:"#6B7B8D", marginTop:2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Focus cluster banner */}
      {focusClusterId && (() => {
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
            <div style={{ fontSize:16, fontWeight:700, color:"#1A2332", marginBottom:6 }}>{fc.name}</div>
            <div style={{ display:"flex", gap:16, fontSize:12, color:"#6B7B8D" }}>
              <span>Pages: <strong style={{ color:"#1A2332" }}>{fcLive}/{fc.posts.length} live</strong></span>
              <span>Std tasks: <strong style={{ color:"#1A2332" }}>{fcStd}/{STD_TASKS.length}</strong></span>
              {fc.gameplanPriority && <span>Priority: <strong style={{ color:"#D97706" }}>#{fc.gameplanPriority}</strong></span>}
            </div>
          </div>
        );
      })()}

      {/* Phase filters */}
      <div style={{ display:"flex", gap:8, marginBottom:20, flexWrap:"wrap" }}>
        <button onClick={() => setPhaseFilter(0)} style={{ padding:"8px 18px", borderRadius:10, border:"none", cursor:"pointer", fontSize:12, fontWeight:700, background:phaseFilter===0?"rgba(0,0,0,0.1)":"rgba(0,0,0,0.04)", color:phaseFilter===0?"#1A2332":"#6B7B8D" }}>All</button>
        {PHASES.map(p => (
          <button key={p.id} onClick={() => setPhaseFilter(p.id)} style={{ padding:"8px 18px", borderRadius:10, border:"none", cursor:"pointer", fontSize:12, fontWeight:700, background:phaseFilter===p.id?`${p.color}30`:"rgba(0,0,0,0.04)", color:phaseFilter===p.id?p.color:"#6B7B8D" }}>
            {p.active ? "● " : ""}{p.label}
          </button>
        ))}
      </div>

      {/* Cluster cards */}
      <div style={{ display:"grid", gap:14, marginBottom:32 }}>
        {filtered.map(cluster => {
          const ph = PHASES.find(p => p.id === cluster.phase);
          const isExp = expandedCluster === cluster.id;
          const livePosts = cluster.posts.filter(p => p.status === "done").length;
          return (
            <div key={cluster.id} style={{
              background:"#FFF",
              border:isExp ? `2px solid ${ph?.color||"#0D9488"}` : "1px solid rgba(0,0,0,0.08)",
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
                  <h3 style={{ fontFamily:"Georgia,serif", fontSize:18, fontWeight:700, color:"#1A2332", margin:0 }}>{cluster.name}</h3>
                  <div style={{ display:"flex", gap:6, marginTop:8, flexWrap:"wrap" }}>
                    <ValueBadge label="SEO" value={cluster.seoValue} />
                    <ValueBadge label="AEO" value={cluster.aeoValue} />
                    <ValueBadge label="GEO" value={cluster.geoValue} />
                  </div>
                </div>
                <div style={{ textAlign:"right", flexShrink:0 }}>
                  <div style={{ fontSize:24, fontWeight:800, color:"#1A2332" }}>{livePosts}/{cluster.posts.length}</div>
                  <div style={{ fontSize:11, color:"#6B7B8D" }}>pages</div>
                </div>
              </div>

              {/* Expanded body */}
              {isExp && (
                <div style={{ padding:"0 24px 24px", borderTop:"1px solid rgba(0,0,0,0.06)" }}>
                  {/* Focus button */}
                  <div style={{ display:"flex", gap:8, margin:"16px 0 8px" }}>
                    <button onClick={() => setFocusClusterId(focusClusterId === cluster.id ? null : cluster.id)} style={{ padding:"6px 16px", borderRadius:8, border:"1.5px solid rgba(255,199,44,0.5)", background:focusClusterId===cluster.id?"rgba(255,199,44,0.15)":"transparent", color:"#FFC72C", fontSize:12, fontWeight:700, cursor:"pointer" }}>
                      {focusClusterId === cluster.id ? "🎯 In Focus" : "🎯 Set as Focus Cluster"}
                    </button>
                  </div>

                  {/* Gameplan note */}
                  {cluster.gameplanNote && (
                    <div style={{ margin:"16px 0", padding:"12px 16px", background:"#FFFBEB", borderLeft:"3px solid #D97706", borderRadius:"0 8px 8px 0", fontSize:13, color:"#92400E" }}>
                      <strong>Note:</strong> {cluster.gameplanNote}
                    </div>
                  )}
                  {cluster.templateUsed && (
                    <div style={{ margin:"16px 0", padding:"12px 16px", background:"#EFF6FF", borderLeft:"3px solid #2563EB", borderRadius:"0 8px 8px 0", fontSize:13, color:"#1E40AF" }}>
                      <strong>Master Template v3.0</strong>
                    </div>
                  )}

                  {/* Pages list */}
                  <div style={{ marginTop:16 }}>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                      <span style={{ fontSize:11, fontWeight:800, letterSpacing:"0.1em", color:ph?.color||"#0D9488", textTransform:"uppercase" }}>Pages ({livePosts}/{cluster.posts.length})</span>
                      <div style={{ display:"flex", gap:16, fontSize:10, fontWeight:700, color:"#6B7B8D", textTransform:"uppercase", letterSpacing:"0.06em" }}>
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
                          background:isIndexed?"#F0FDF4":isCreated?"#FEFCE8":"#F9FAFB",
                          borderRadius:10, fontSize:13,
                          borderLeft:`3px solid ${isIndexed?"#16A34A":isCreated?"#D97706":"#C4CDD5"}`,
                        }}>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
                              {isPillar && (
                                <span style={{ fontSize:9, fontWeight:800, background:`${ph?.color||"#0D9488"}20`, color:ph?.color||"#0D9488", padding:"1px 6px", borderRadius:4, textTransform:"uppercase" }}>Pillar</span>
                              )}
                              <span style={{ color:"#3A4553", fontWeight:isPillar?700:400 }}>{post.name}</span>
                              {post.hospital && <span style={{ color:"#6B7B8D" }}>  -  {post.hospital}</span>}
                            </div>
                            {post.slug && <div style={{ fontSize:11, color:"#6B7B8D", marginTop:2 }}>/{post.slug}</div>}
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

                  {/* Standard optimization tasks */}
                  <div style={{ marginTop:24 }}>
                    <div style={{ fontSize:11, fontWeight:800, letterSpacing:"0.1em", color:"#0D9488", textTransform:"uppercase", marginBottom:10 }}>
                      Optimization Checklist ({STD_TASKS.filter(t => isDone(`std-${cluster.id}-${t.id}`)).length}/{STD_TASKS.length})
                    </div>
                    <div style={{ background:"#F9FAFB", borderRadius:12, padding:"12px 16px", border:"1px solid rgba(0,0,0,0.04)" }}>
                      {STD_TASKS.map((task, i) => {
                        const tid = `std-${cluster.id}-${task.id}`;
                        const d = isDone(tid);
                        return (
                          <div key={task.id} style={{
                            display:"flex", alignItems:"flex-start", gap:8,
                            padding:"7px 0", fontSize:13,
                            borderBottom:i < STD_TASKS.length-1 ? "1px solid rgba(0,0,0,0.04)" : "none",
                            animation:recentId===tid?"donePulse 1s ease":"none",
                          }}>
                            <AnimCheck checked={d} onToggle={() => toggle(tid)} sz={18} />
                            <div style={{ flex:1 }}>
                              <span style={{ color:d?"#16A34A":"#3A4553", textDecoration:d?"line-through":"none", transition:"all 0.3s" }}>{task.label}</span>
                              {d && <NoteField value={getNote(tid)} onChange={v => setNote(tid, v)} />}
                            </div>
                            {d && done[tid] && <span style={{ fontSize:10, color:"#C4CDD5", flexShrink:0 }}>{new Date(done[tid]).toLocaleDateString()}</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Cluster-specific tasks */}
                  {cluster.phase1Tasks?.length > 0 && (
                    <div style={{ marginTop:20 }}>
                      <div style={{ fontSize:11, fontWeight:700, color:"#D97706", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:10 }}>
                        Cluster-Specific Tasks ({cluster.phase1Tasks.filter((_, i) => isDone(`cl-${cluster.id}-${i}`)).length}/{cluster.phase1Tasks.length})
                      </div>
                      {cluster.phase1Tasks.map((task, i) => {
                        const tid = `cl-${cluster.id}-${i}`;
                        const d = isDone(tid);
                        return (
                          <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:8, padding:"8px 0", fontSize:13, borderBottom:i<cluster.phase1Tasks.length-1?"1px solid rgba(0,0,0,0.04)":"none", animation:recentId===tid?"donePulse 1s ease":"none" }}>
                            <AnimCheck checked={d} onToggle={() => toggle(tid)} sz={18} />
                            <div style={{ flex:1 }}>
                              <span style={{ color:d?"#16A34A":"#3A4553", textDecoration:d?"line-through":"none" }}>{task}</span>
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

      {/* Phase 1 Global Checklist */}
      <div style={{ background:"#FFF", borderRadius:16, border:"1px solid rgba(0,0,0,0.08)", padding:"20px 24px", boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
        <div style={{ fontSize:14, fontWeight:800, color:"#1A2332", marginBottom:4 }}>Phase 1 — Site-Wide Checklist</div>
        <div style={{ fontSize:12, color:"#6B7B8D", marginBottom:16 }}>{p1Done}/{phase1Checklist.length} tasks complete</div>
        <div style={{ height:6, background:"#F3F5F7", borderRadius:3, overflow:"hidden", marginBottom:20 }}>
          <div style={{ height:"100%", width:`${Math.round(p1Done/phase1Checklist.length*100)}%`, background:"linear-gradient(90deg,#0D9488,#14B8A6)", borderRadius:3, transition:"width 0.3s" }} />
        </div>
        {["E-E-A-T","AEO","GEO","Content Gap"].map(cat => {
          const catTasks = phase1Checklist.filter(t => t.category === cat);
          const catDone = catTasks.filter(t => isDone(`p1-${t.id}`)).length;
          const catColors = { "E-E-A-T":"#FFC72C","AEO":"#60A5FA","GEO":"#A78BFA","Content Gap":"#2DD4BF" };
          return (
            <div key={cat} style={{ marginBottom:16 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                <span style={{ fontSize:11, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.08em", color:catColors[cat]||"#6B7B8D" }}>{cat}</span>
                <span style={{ fontSize:11, fontWeight:700, color:catDone===catTasks.length?"#16A34A":"#6B7B8D" }}>{catDone}/{catTasks.length}</span>
              </div>
              {catTasks.map((task, i) => {
                const tid = `p1-${task.id}`;
                const d = isDone(tid);
                return (
                  <div key={task.id} style={{ display:"flex", alignItems:"flex-start", gap:8, padding:"6px 0", fontSize:13, borderBottom:i<catTasks.length-1?"1px solid rgba(0,0,0,0.04)":"none" }}>
                    <AnimCheck checked={d} onToggle={() => toggle(tid)} sz={18} />
                    <span style={{ color:d?"#16A34A":"#3A4553", textDecoration:d?"line-through":"none", flex:1 }}>{task.label}</span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes donePulse {
          0% { background-color: transparent; }
          30% { background-color: #DCFCE7; }
          100% { background-color: transparent; }
        }
      `}</style>
    </div>
  );
}
