import { useState, useEffect, useRef } from "react";

// ─── Constants ───────────────────────────────────────────────
const PHASES = [
  { id:1, label:"Phase 1  -  Foundation", weeks:"Weeks 1-3", color:"#0D9488", active:true },
  { id:2, label:"Phase 2  -  Content Expansion", weeks:"Weeks 4-7", color:"#2563EB", active:false },
  { id:3, label:"Phase 3  -  Authority & AI Visibility", weeks:"Weeks 8-12", color:"#7C3AED", active:false },
];

const STATUS = {
  done:{ label:"Live", color:"#16A34A", bg:"#F0FDF4" },
  inProgress:{ label:"In Progress", color:"#D97706", bg:"#FFFBEB" },
  planned:{ label:"Planned", color:"#6B7B8D", bg:"#F3F5F7" }
};

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

const typeColors = {"E-E-A-T":{bg:"#FFC72C18",color:"#FFC72C",border:"#FFC72C30"},"AEO":{bg:"#60A5FA18",color:"#60A5FA",border:"#60A5FA30"},"GEO":{bg:"#A78BFA18",color:"#A78BFA",border:"#A78BFA30"},"Content":{bg:"#2DD4BF18",color:"#2DD4BF",border:"#2DD4BF30"},"SEO":{bg:"#34D39918",color:"#34D399",border:"#34D39930"},"Promo":{bg:"#FB923C18",color:"#FB923C",border:"#FB923C30"},"Local":{bg:"#F472B618",color:"#F472B6",border:"#F472B630"},"Links":{bg:"#818CF818",color:"#818CF8",border:"#818CF830"},"Entity":{bg:"#C084FC18",color:"#C084FC",border:"#C084FC30"},"County":{bg:"#22D3EE18",color:"#22D3EE",border:"#22D3EE30"},"Schema":{bg:"#FBBF2418",color:"#FBBF24",border:"#FBBF2430"},"Audit":{bg:"#F8717118",color:"#F87171",border:"#F8717130"},"Planning":{bg:"#E2E8F018",color:"#E2E8F0",border:"#E2E8F030"}};

const OPT_ITEMS = [
  {id:"opt-instant",label:"Instant answer block (first 100 words)",cat:"AEO"},
  {id:"opt-faq",label:"FAQ schema (JSON-LD)",cat:"AEO"},
  {id:"opt-citations",label:"Source citations (Medicare.gov, CMS.gov)",cat:"E-E-A-T"},
  {id:"opt-author",label:"Author byline + updated date",cat:"E-E-A-T"},
  {id:"opt-charts",label:"Charts/visuals added",cat:"Content"},
  {id:"opt-graphics",label:"Branded graphics (not stock)",cat:"Content"},
  {id:"opt-tables",label:"Comparison tables",cat:"AEO"},
  {id:"opt-fb",label:"Facebook promoted",cat:"Promo"},
  {id:"opt-gmb",label:"GMB post created",cat:"Promo"},
  {id:"opt-fresh",label:"2026 freshness update done",cat:"GEO"},
  {id:"opt-junk",label:"No orphaned content after footer",cat:"Clean"},
  {id:"opt-functional",label:"No CSS click-blocking issues",cat:"Functional"},
];

const PRIORITY_ORDER = ["Very High","High","Medium-High","Medium"];
function getPriorityScore(cluster) {
  const seo = PRIORITY_ORDER.indexOf(cluster.seoValue);
  const aeo = PRIORITY_ORDER.indexOf(cluster.aeoValue);
  const geo = PRIORITY_ORDER.indexOf(cluster.geoValue);
  return (seo===-1?4:seo)+(aeo===-1?4:aeo)+(geo===-1?4:geo);
}

const GH_BASE = "https://generationhealth.me/";

async function fetchWithTimeout(url, ms=20000) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(url, { signal: ctrl.signal });
    clearTimeout(id);
    return r;
  } catch(e) {
    clearTimeout(id);
    throw e;
  }
}

async function fetchPageHTML(slug) {
  const proxies = [
    `https://generationhealth.me/tools/scrape-proxy.php?url=${encodeURIComponent(GH_BASE + slug + "/")}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(GH_BASE + slug + "/")}`,
    `https://corsproxy.io/?${encodeURIComponent(GH_BASE + slug + "/")}`,
    `${GH_BASE}wp-json/wp/v2/posts?slug=${slug}&_fields=content`,
  ];
  for (const proxy of proxies) {
    try {
      const r = await fetchWithTimeout(proxy, 15000);
      if (!r.ok) continue;
      const text = await r.text();
      if (proxy.includes("wp-json")) {
        const j = JSON.parse(text);
        if (j && j[0] && j[0].content) return j[0].content.rendered;
      }
      if (text && text.length > 500) return text;
    } catch(e) {}
  }
  return null;
}

async function fetchAndScanPage(slug, clusterId, postIdx, setSavedHTML, setDone, setNotes, setLastScanResults, setHasChanges) {
  const html = await fetchPageHTML(slug);
  if (!html) return { success: false, error: "Could not fetch page" };
  const scanKey = `${clusterId}-${postIdx}`;
  const prefix = `op-${clusterId}-${postIdx}`;
  const results = scanHTML(html);
  setSavedHTML(prev => ({ ...prev, [scanKey]: html }));
  const scannable = ["opt-instant","opt-faq","opt-citations","opt-author","opt-charts","opt-graphics","opt-tables","opt-fresh","opt-junk","opt-functional"];
  setDone(prev => {
    const next = { ...prev };
    scannable.forEach(k => {
      const key = `${prefix}-${k}`;
      if (results[k]) next[key] = Date.now();
      else delete next[key];
    });
    return next;
  });
  setLastScanResults(prev => ({ ...prev, [scanKey]: results }));
  setNotes(prev => {
    const next = { ...prev };
    if (results["opt-citations-detail"]) next[`${prefix}-opt-citations`] = "Scan: " + results["opt-citations-detail"];
    if (results["opt-fresh-detail"]) next[`${prefix}-opt-fresh`] = "Scan: " + results["opt-fresh-detail"];
    if (results["opt-tables-detail"]) next[`${prefix}-opt-tables`] = "Scan: " + results["opt-tables-detail"];
    if (results["opt-junk-detail"]) next[`${prefix}-opt-junk`] = "Scan: " + results["opt-junk-detail"];
    if (results["opt-functional-detail"]) next[`${prefix}-opt-functional`] = "Scan: " + results["opt-functional-detail"];
    if (results["opt-graphics-detail"]) next[`${prefix}-opt-graphics`] = "Scan: " + results["opt-graphics-detail"];
    if (results["opt-charts-detail"]) next[`${prefix}-opt-charts`] = "Scan: " + results["opt-charts-detail"];
    if (results["opt-instant-detail"]) next[`${prefix}-opt-instant`] = "Scan: " + results["opt-instant-detail"];
    return next;
  });
  setHasChanges(true);
  return { success: true, size: html.length, results };
}

function scanHTML(html) {
  const results = {};
  const lower = html.toLowerCase();
  const doc = new DOMParser().parseFromString(html, "text/html");
  const isPartial = !lower.includes("<!doctype") && !lower.includes("<html");

  // FAQ Schema
  let hasFAQ = false, hasArticle = false;
  if (!isPartial) {
    const scripts = doc.querySelectorAll('script[type="application/ld+json"]');
    scripts.forEach(s => {
      try {
        const j = JSON.parse(s.textContent);
        const check = (obj) => {
          if (!obj) return;
          if (obj["@type"] === "FAQPage") hasFAQ = true;
          if (["Article","NewsArticle","BlogPosting","WebPage","MedicalWebPage"].includes(obj["@type"])) hasArticle = true;
          if (Array.isArray(obj["@graph"])) obj["@graph"].forEach(check);
        };
        check(j);
      } catch(e) {}
    });
  }
  const faqItems = doc.querySelectorAll(".gh-faq-item, .gh-faq-list, .gh-faq");
  if (faqItems.length >= 1) hasFAQ = true;
  if (lower.includes("faqpage") || lower.includes('"faq"')) hasFAQ = true;
  if (!isPartial && (lower.includes("medicalwebpage") || lower.includes('"article"'))) hasArticle = true;
  if (isPartial && faqItems.length >= 1) hasArticle = true;
  results["opt-faq"] = hasFAQ;

  // .gov citations
  const links = doc.querySelectorAll("a[href]");
  let govLinks = 0;
  links.forEach(a => {
    const h = (a.getAttribute("href") || "").toLowerCase();
    if (h.includes("medicare.gov") || h.includes("cms.gov") || h.includes("ncdoi.gov") || h.includes("ssa.gov") || h.includes("shiip") || h.includes("healthcare.gov")) govLinks++;
  });
  const govTextMentions = (lower.match(/medicare\.gov|cms\.gov|ncdoi\.gov|ssa\.gov|healthcare\.gov/g) || []).length;
  const totalGovSignals = govLinks + govTextMentions;
  results["opt-citations"] = isPartial ? totalGovSignals >= 1 : totalGovSignals >= 2;
  results["opt-citations-detail"] = govLinks + " .gov links found";

  // Author
  const authorBlock = doc.querySelectorAll(".gh-author, .gh-author-header, .gh-author-body");
  const hasAuthorBlock = authorBlock.length > 0;
  const hasAuthorText = lower.includes("robert simm") || lower.includes("ahip certified") || lower.includes("#10447418");
  const hasPersonSchema = lower.includes("generationhealth.me/#author") || lower.includes('"person"');
  results["opt-author"] = hasAuthorBlock || hasAuthorText || hasPersonSchema;

  // Freshness
  const has2026 = lower.includes("2026");
  const hasDateModified = lower.includes("datemodified") || lower.includes("date_modified");
  const hasUpdatedText = lower.includes("last updated") || lower.includes("reviewed by") || lower.includes("updated:") || lower.includes("as of 2026");
  results["opt-fresh"] = has2026 && (hasDateModified || hasUpdatedText || isPartial);
  results["opt-fresh-detail"] = (has2026 ? "2026 ✓" : "No 2026 ref") + " | " + (hasDateModified ? "dateModified ✓" : hasUpdatedText ? "Updated text ✓" : "Partial");

  // Instant answer
  const answerBlock = doc.querySelectorAll(".gh-answer, .gh-answer-label");
  const hasAnswerBlock = answerBlock.length > 0;
  const hasQuickText = lower.includes("quick answer") || lower.includes("short answer") || lower.includes("the answer is");
  results["opt-instant"] = hasAnswerBlock || hasQuickText;
  results["opt-instant-detail"] = hasAnswerBlock ? ".gh-answer block ✓" : hasQuickText ? "Answer text pattern ✓" : "No .gh-answer block found";

  // Comparison tables
  const compCards = doc.querySelectorAll(".gh-comparison, .gh-comparison-card, .gh-comp-item");
  const htmlTables = doc.querySelectorAll("table");
  results["opt-tables"] = compCards.length > 0;
  results["opt-tables-detail"] = htmlTables.length + " <table> + " + compCards.length + " styled tables found";

  // Images
  const trustBadges = doc.querySelectorAll(".gh-trust-strip, .gh-trust-badge");
  const imgs = doc.querySelectorAll("img");
  let realImgs = 0;
  imgs.forEach(img => {
    const src = (img.getAttribute("src") || "").toLowerCase();
    if (src && !src.includes("data:") && !src.includes("pixel") && !src.includes("1x1") && src.length > 10) realImgs++;
  });
  results["opt-graphics"] = realImgs >= 1 || trustBadges.length > 0;
  results["opt-graphics-detail"] = realImgs + " images found";

  // Charts
  const chartEls = doc.querySelectorAll(".gh-chart, .gh-chart-header");
  const barEls = doc.querySelectorAll(".gh-bar, .gh-bar-fill");
  const svgEls = doc.querySelectorAll("svg:not([width='16']):not([width='14']):not([width='18']):not([width='12']):not([width='20']):not([width='24'])");
  const canvasEls = doc.querySelectorAll("canvas");
  results["opt-charts"] = chartEls.length > 0 || barEls.length > 0 || svgEls.length > 0 || canvasEls.length > 0;
  results["opt-charts-detail"] = chartEls.length + " chart elements + " + svgEls.length + " images";

  // Orphaned content
  var footerIdx = lower.lastIndexOf('class="gh-footer-trust"');
  if(footerIdx === -1) footerIdx = lower.lastIndexOf('</footer>');
  var hasOrphanedContent = false;
  if(footerIdx > -1){
    var afterFooter = lower.slice(footerIdx);
    var orphanPatterns = [/<ol[\s>]/,/<ul[\s>]/,/<div class="gh-/,/<p[^>]*>.*?medicare\.gov/,/<section[\s>]/];
    for(var op=0; op<orphanPatterns.length; op++){
      if(orphanPatterns[op].test(afterFooter)){ hasOrphanedContent = true; break; }
    }
  }
  results["opt-junk"] = !hasOrphanedContent;
  results["opt-junk-detail"] = hasOrphanedContent ? "⚠ Orphaned content found after footer" : "Clean ✓";

  // Functional CSS
  var cssIssues = [];
  var styleBlocks = html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) || [];
  var allCSS = styleBlocks.map(function(s){ return s.replace(/<\/?style[^>]*>/gi,""); }).join("\n");
  var pseudoRules = allCSS.match(/[^{}]+::(before|after)\s*\{[^}]+\}/gi) || [];
  pseudoRules.forEach(function(rule){
    var rLower = rule.toLowerCase();
    if(rLower.includes("position") && rLower.includes("absolute") && (rLower.includes("animation") || rLower.includes("transform")) && !rLower.includes("pointer-events")){
      var sel = rule.split("::")[0].trim().split(/\s+/).pop();
      cssIssues.push(sel + "::" + (rule.match(/::(before|after)/i)||["","after"])[1]);
    }
  });
  results["opt-functional"] = cssIssues.length === 0;
  results["opt-functional-detail"] = cssIssues.length === 0 ? "No click-blocking pseudo-elements found ✓" : cssIssues.length + " pseudo-element(s) missing pointer-events:none";

  results["opt-fb"] = false;
  results["opt-gmb"] = false;

  return results;
}

// ─── Sub-components ──────────────────────────────────────────
const AnimCheck = ({checked, onToggle, dark=true, sz=20}) => {
  const [pop, setPop] = useState(false);
  const go = (e) => { e.stopPropagation(); if(!checked){setPop(true);setTimeout(()=>setPop(false),600);} onToggle(); };
  return <div onClick={go} style={{width:sz,height:sz,borderRadius:6,flexShrink:0,cursor:"pointer",border:checked?"none":`2px solid ${dark?"rgba(255,255,255,0.2)":"#C4CDD5"}`,background:checked?"#16A34A":"transparent",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.25s cubic-bezier(0.34,1.56,0.64,1)",transform:pop?"scale(1.35)":"scale(1)",boxShadow:pop?"0 0 16px rgba(22,163,74,0.5)":"none"}}>
    {checked && <svg width={sz-6} height={sz-6} viewBox="0 0 16 16" fill="none"><path d="M3 8.5L6.5 12L13 4" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
  </div>;
};

const NoteField = ({value, onChange, dark=true}) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value||"");
  const ref = useRef(null);
  useEffect(()=>{if(editing&&ref.current)ref.current.focus();},[editing]);
  const save=()=>{onChange(draft);setEditing(false);};
  if(!editing&&!value) return <button onClick={()=>{setDraft("");setEditing(true);}} style={{background:"none",border:"none",cursor:"pointer",fontSize:11,color:dark?"rgba(255,255,255,0.3)":"#C4CDD5",padding:"2px 0",fontFamily:"inherit"}}>+ note</button>;
  if(!editing) return <div onClick={()=>{setDraft(value);setEditing(true);}} style={{fontSize:12,color:dark?"rgba(255,255,255,0.5)":"#6B7B8D",fontStyle:"italic",cursor:"pointer",padding:"2px 0"}}>{value}</div>;
  return <div style={{display:"flex",gap:5,alignItems:"center",marginTop:4}}>
    <input ref={ref} value={draft} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")save();if(e.key==="Escape")setEditing(false);}} style={{flex:1,background:dark?"rgba(255,255,255,0.06)":"#F3F5F7",border:`1px solid ${dark?"rgba(255,255,255,0.12)":"#E8ECF0"}`,borderRadius:6,padding:"5px 10px",fontSize:12,color:dark?"#E8ECF0":"#1A2332",fontFamily:"inherit",outline:"none"}} />
    <button onClick={save} style={{background:"#16A34A",border:"none",borderRadius:5,padding:"4px 10px",fontSize:11,fontWeight:700,color:"#FFF",cursor:"pointer"}}>✓</button>
    <button onClick={()=>setEditing(false)} style={{background:dark?"rgba(255,255,255,0.08)":"#E8ECF0",border:"none",borderRadius:5,padding:"4px 8px",fontSize:11,color:dark?"#6B7B8D":"#718096",cursor:"pointer"}}>✕</button>
  </div>;
};

const ValueBadge = ({label,value}) => {
  const c=({"Very High":{bg:"#DCFCE7",color:"#166534"},"High":{bg:"#DBEAFE",color:"#1E40AF"},"Medium-High":{bg:"#E0E7FF",color:"#3730A3"},"Medium":{bg:"#FEF3C7",color:"#92400E"}})[value]||{bg:"#FEF3C7",color:"#92400E"};
  return <span style={{fontSize:10,fontWeight:700,letterSpacing:"0.05em",color:c.color,background:c.bg,padding:"2px 8px",borderRadius:6,textTransform:"uppercase"}}>{label}: {value}</span>;
};

const ScanModal = ({ onScan, onClose, initialHTML="", saveOnly=false }) => {
  const [html, setHtml] = useState(initialHTML);
  const taRef = useRef(null);
  useEffect(() => { if (taRef.current) taRef.current.focus(); }, []);
  const hasSaved = initialHTML.length > 100;
  return <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.7)",backdropFilter:"blur(8px)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={onClose}>
    <div onClick={e=>e.stopPropagation()} style={{background:"#1A2840",border:"1px solid rgba(255,255,255,0.12)",borderRadius:20,padding:32,maxWidth:640,width:"100%",maxHeight:"80vh",display:"flex",flexDirection:"column"}}>
      <h3 style={{fontSize:18,fontWeight:700,color:"#FFF",margin:"0 0 4px",fontFamily:"Georgia,serif"}}>{saveOnly?"Save Page Source":"Scan Page Source"}</h3>
      <p style={{fontSize:13,color:"#6B7B8D",margin:"0 0 16px"}}>{hasSaved?"Saved HTML loaded — paste new source to update.":(saveOnly?"Right-click your page → View Page Source → Select All → Copy → Paste below":"Right-click your page → View Page Source → Select All → Copy → Paste below")}</p>
      <textarea ref={taRef} value={html} onChange={e=>setHtml(e.target.value)} placeholder="Paste HTML source here..." style={{flex:1,minHeight:200,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:12,padding:16,fontSize:13,color:"#E8ECF0",fontFamily:"monospace",resize:"vertical",outline:"none"}} />
      <div style={{display:"flex",gap:10,marginTop:16,justifyContent:"space-between",flexWrap:"wrap"}}>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {hasSaved&&<span style={{fontSize:11,color:"#2DD4BF"}}>✓ {Math.round(initialHTML.length/1024)}KB saved</span>}
        </div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={onClose} style={{padding:"10px 20px",borderRadius:10,border:"1px solid rgba(255,255,255,0.12)",background:"transparent",color:"#6B7B8D",fontSize:13,fontWeight:600,cursor:"pointer"}}>Cancel</button>
          <button onClick={()=>{if(html.trim().length>100)onScan(html);}} style={{padding:"10px 24px",borderRadius:10,border:"none",background:html.trim().length>100?(saveOnly?"#3B82F6":"#0D9488"):"#333",color:"#FFF",fontSize:13,fontWeight:700,cursor:html.trim().length>100?"pointer":"not-allowed"}}>
            {saveOnly?`Save (${Math.round(html.length/1024)}KB)`:`Scan (${Math.round(html.length/1024)}KB)`}
          </button>
        </div>
      </div>
    </div>
  </div>;
};

// ─── Main Optimize Component ─────────────────────────────────
export default function Optimize({
  clusters,
  done,
  setDone,
  notes,
  setNotes,
  savedHTML,
  setSavedHTML,
  setHasChanges,
  setView,
  setPbMode,
  setPbPage,
  setPbNepqContent,
  setPbScanResults,
  calendarWeeks,
  isDark = true,
}) {
  const [expandedOptCluster, setExpandedOptCluster] = useState(null);
  const [optSearch, setOptSearch] = useState("");
  const [optSearchResult, setOptSearchResult] = useState(null);
  const [optSearchHighlight, setOptSearchHighlight] = useState(null);
  const [scanTarget, setScanTarget] = useState(null);
  const [saveTarget, setSaveTarget] = useState(null);
  const [lastScanResults, setLastScanResults] = useState({});
  const [fetchingPages, setFetchingPages] = useState({});
  const [fetchAllProgress, setFetchAllProgress] = useState(null);
  const [recentId, setRecentId] = useState(null);

  const isDone = (tid) => !!done[tid];
  const getNote = (tid) => notes[tid] || "";
  const setNote = (tid, v) => { setNotes(prev => ({...prev, [tid]: v})); setHasChanges(true); };

  const toggle = (tid) => {
    setDone(prev => {
      const next = {...prev};
      if (next[tid]) delete next[tid];
      else next[tid] = Date.now();
      return next;
    });
    setRecentId(tid);
    setTimeout(() => setRecentId(null), 1000);
    setHasChanges(true);
  };

  // Scan modal handler
  useEffect(() => {
    if (!scanTarget) return;
    const scanKey = `${scanTarget.clusterId}-${scanTarget.postIdx}`;
    const html = savedHTML[scanKey] || "";
    if (!html || html.length < 100) { setScanTarget(null); return; }
    const results = scanHTML(html);
    const prefix = `op-${scanTarget.clusterId}-${scanTarget.postIdx}`;
    const scannable = ["opt-instant","opt-faq","opt-citations","opt-author","opt-charts","opt-graphics","opt-tables","opt-fresh","opt-junk","opt-functional"];
    setDone(prev => {
      const next = {...prev};
      scannable.forEach(k => {
        const key = `${prefix}-${k}`;
        if (results[k]) next[key] = Date.now();
        else delete next[key];
      });
      return next;
    });
    setLastScanResults(prev => ({...prev, [scanKey]: results}));
    setNotes(prev => {
      const next = {...prev};
      if (results["opt-citations-detail"]) next[`${prefix}-opt-citations`] = "Scan: " + results["opt-citations-detail"];
      if (results["opt-fresh-detail"]) next[`${prefix}-opt-fresh`] = "Scan: " + results["opt-fresh-detail"];
      if (results["opt-tables-detail"]) next[`${prefix}-opt-tables`] = "Scan: " + results["opt-tables-detail"];
      if (results["opt-charts-detail"]) next[`${prefix}-opt-charts`] = "Scan: " + results["opt-charts-detail"];
      if (results["opt-instant-detail"]) next[`${prefix}-opt-instant`] = "Scan: " + results["opt-instant-detail"];
      return next;
    });
    setHasChanges(true);
    setScanTarget(null);
  }, [scanTarget]);

  // Save modal handler
  useEffect(() => {
    if (!saveTarget) return;
    setSaveTarget(null);
  }, [saveTarget]);

  // Computed values
  const liveClust = clusters.filter(c => c.posts.some(p => p.status === "done"));
  const sortedClust = [...liveClust].sort((a,b) => getPriorityScore(a) - getPriorityScore(b));
  const allLivePages = sortedClust.reduce((a,c) => a + c.posts.filter(p => p.status === "done").length, 0);
  const allOptDone = sortedClust.reduce((acc,c) => {
    c.posts.filter(p => p.status === "done").forEach((_,i) => {
      OPT_ITEMS.forEach(oi => { if(isDone(`op-${c.id}-${i}-${oi.id}`)) acc++; });
    });
    return acc;
  }, 0);
  const allOptTotal = allLivePages * OPT_ITEMS.length;
  const pct = allOptTotal > 0 ? Math.round(allOptDone / allOptTotal * 100) : 0;

  const totalCalTasks = (calendarWeeks||[]).reduce((a,w) => a + w.tasks.length, 0);
  const calDone = (calendarWeeks||[]).reduce((a,w) => a + w.tasks.filter((_,i) => isDone(`cal-${w.week}-${i}`)).length, 0);
  const opsDone = 0;
  const opsTotalTasks = 52;

  const doSearch = () => {
    const raw = optSearch.trim();
    const slug = raw.replace(/^https?:\/\/[^/]+\//,"").replace(/\/$/,"").trim();
    let found = null;
    for (const c of sortedClust) {
      for (const p of c.posts) {
        if (p.slug && (p.slug === slug || p.slug.toLowerCase() === slug.toLowerCase())) {
          found = {clusterId:c.id, clusterName:c.name, pageName:p.name, slug:p.slug};
          break;
        }
      }
      if (found) break;
    }
    if (found) {
      setOptSearchResult({found:true,...found});
      setExpandedOptCluster(found.clusterId);
      setOptSearchHighlight(found.slug);
      setTimeout(() => {
        const el = document.getElementById("opt-page-" + found.slug);
        if (el) el.scrollIntoView({behavior:"smooth",block:"center"});
      }, 150);
    } else {
      setOptSearchResult({found:false,slug});
      setOptSearchHighlight(null);
    }
  };

  return (
    <div>
      {/* Scan Modal */}
      {scanTarget && (
        <ScanModal
          initialHTML={savedHTML[`${scanTarget.clusterId}-${scanTarget.postIdx}`] || ""}
          onScan={(html) => {
            const scanKey = `${scanTarget.clusterId}-${scanTarget.postIdx}`;
            setSavedHTML(prev => ({...prev, [scanKey]: html}));
            setScanTarget(prev => ({...prev})); // trigger useEffect
          }}
          onClose={() => setScanTarget(null)}
        />
      )}
      {saveTarget && (
        <ScanModal
          saveOnly
          initialHTML={savedHTML[`${saveTarget.clusterId}-${saveTarget.postIdx}`] || ""}
          onScan={(html) => {
            const saveKey = `${saveTarget.clusterId}-${saveTarget.postIdx}`;
            setSavedHTML(prev => ({...prev, [saveKey]: html}));
            setHasChanges(true);
            setSaveTarget(null);
          }}
          onClose={() => setSaveTarget(null)}
        />
      )}

      {/* Overall progress */}
      <div style={{background:"linear-gradient(135deg, rgba(13,148,136,0.08), rgba(37,99,235,0.08))",border:"1px solid rgba(13,148,136,0.2)",borderRadius:16,padding:28,marginBottom:28}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8,flexWrap:"wrap",gap:8}}>
          <div>
            <h2 style={{fontSize:20,fontWeight:700,color:"#FFF",margin:0,fontFamily:"Georgia,serif"}}>Optimize Existing Pages</h2>
            <p style={{fontSize:13,color:"#6B7B8D",margin:"4px 0 0"}}>Harden what's live before building new content. {allLivePages} pages × {OPT_ITEMS.length} items each.</p>
            <button onClick={async() => {
              const allPages = [];
              sortedClust.forEach(c => {
                c.posts.map((p,i) => ({...p,idx:i})).forEach(p => { if(p.status==="done"&&p.slug) allPages.push({...p,clusterId:c.id}); });
              });
              if(allPages.length===0){alert("No live pages to fetch.");return;}
              if(!confirm(`Fetch & scan ALL ${allPages.length} live pages from generationhealth.me?\n\nThis will take about ${Math.round(allPages.length*1.5/60)} minutes.`))return;
              setFetchAllProgress({total:allPages.length,done:0,current:"Starting...",errors:[]});
              let errList = [];
              for(let i=0;i<allPages.length;i++){
                const p = allPages[i];
                setFetchAllProgress({total:allPages.length,done:i,current:`${p.name} (${i+1}/${allPages.length})`,errors:errList});
                const res = await fetchAndScanPage(p.slug,p.clusterId,p.idx,setSavedHTML,setDone,setNotes,setLastScanResults,setHasChanges);
                if(!res.success) errList.push(p.slug);
                await new Promise(r=>setTimeout(r,800));
              }
              setFetchAllProgress({total:allPages.length,done:allPages.length,current:`Done! ${allPages.length-errList.length} fetched, ${errList.length} errors`,errors:errList});
              setTimeout(()=>setFetchAllProgress(null),15000);
            }} style={{marginTop:10,padding:"8px 20px",borderRadius:10,border:"1.5px solid rgba(255,199,44,0.5)",background:"rgba(255,199,44,0.08)",color:"#FFC72C",fontSize:13,fontWeight:700,cursor:"pointer"}}>⚡ Fetch & Scan All {allLivePages} Pages</button>
            {fetchAllProgress && <div style={{marginTop:8,fontSize:12,color:"#6B7B8D"}}>
              <div style={{width:"100%",maxWidth:400,height:6,background:"rgba(255,255,255,0.06)",borderRadius:100,overflow:"hidden",marginBottom:4}}>
                <div style={{width:`${fetchAllProgress.total>0?Math.round(fetchAllProgress.done/fetchAllProgress.total*100):0}%`,height:"100%",background:"linear-gradient(90deg,#FFC72C,#FFD54F)",borderRadius:100,transition:"width 0.3s"}}/>
              </div>
              {fetchAllProgress.current}
            </div>}
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:28,fontWeight:800,color:pct===100?"#4ADE80":"#FFF"}}>{pct}%</div>
            <div style={{fontSize:12,color:"#6B7B8D"}}>{allOptDone}/{allOptTotal} items</div>
          </div>
        </div>
        <div style={{width:"100%",height:10,background:"rgba(255,255,255,0.06)",borderRadius:100,overflow:"hidden"}}>
          <div style={{width:`${pct}%`,height:"100%",background:"linear-gradient(90deg,#0D9488,#2DD4BF)",borderRadius:100,transition:"width 0.5s"}}/>
        </div>
      </div>

      {/* URL Search */}
      <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,199,44,0.2)",borderRadius:14,padding:"16px 20px",marginBottom:24}}>
        <div style={{fontSize:11,fontWeight:800,letterSpacing:"0.1em",color:"#FFC72C",textTransform:"uppercase",marginBottom:10}}>🔍 Find a Page by URL</div>
        <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
          <input type="text" value={optSearch} onChange={e=>{setOptSearch(e.target.value);setOptSearchResult(null);setOptSearchHighlight(null);}} onKeyDown={e=>{if(e.key==="Enter")doSearch();}} placeholder="Paste full URL or slug, then press Enter" style={{flex:1,minWidth:280,padding:"9px 14px",borderRadius:10,border:"1px solid rgba(255,255,255,0.12)",background:"rgba(255,255,255,0.05)",color:"#FFF",fontSize:13,outline:"none"}}/>
          <button onClick={doSearch} style={{padding:"9px 20px",borderRadius:10,border:"1.5px solid rgba(255,199,44,0.5)",background:"rgba(255,199,44,0.1)",color:"#FFC72C",fontSize:13,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>Find Page</button>
          {optSearch&&<button onClick={()=>{setOptSearch("");setOptSearchResult(null);setOptSearchHighlight(null);}} style={{padding:"9px 14px",borderRadius:10,border:"1px solid rgba(255,255,255,0.1)",background:"transparent",color:"#6B7B8D",fontSize:12,cursor:"pointer"}}>✕ Clear</button>}
        </div>
        {optSearchResult&&optSearchResult.found&&<div style={{marginTop:10,padding:"10px 14px",background:"rgba(74,222,128,0.08)",border:"1px solid rgba(74,222,128,0.25)",borderRadius:10,fontSize:13}}><span style={{color:"#4ADE80",fontWeight:700}}>✓ Found:</span> <span style={{color:"#FFF"}}>{optSearchResult.pageName}</span> <span style={{color:"#6B7B8D"}}>in</span> <span style={{color:"#FFC72C",fontWeight:600}}>{optSearchResult.clusterName}</span></div>}
        {optSearchResult&&!optSearchResult.found&&<div style={{marginTop:10,padding:"10px 14px",background:"rgba(251,146,60,0.08)",border:"1px solid rgba(251,146,60,0.25)",borderRadius:10,fontSize:13}}><span style={{color:"#FB923C",fontWeight:700}}>✗ Not found:</span> <span style={{color:"#6B7B8D"}}>"{optSearchResult.slug}" is not in any cluster.</span></div>}
      </div>

      <div style={{fontSize:11,fontWeight:800,letterSpacing:"0.12em",color:"#FFC72C",textTransform:"uppercase",marginBottom:16}}>Clusters ranked by SEO + AEO + GEO impact — highest priority first</div>

      {/* Cluster cards */}
      {sortedClust.map(cluster => {
        const ph = PHASES.find(p => p.id === cluster.phase);
        const isExp = expandedOptCluster === cluster.id;
        const allPosts = cluster.posts.map((p,i) => ({...p,idx:i}));
        const livePosts = allPosts.filter(p => p.status === "done");
        const clusterOptDone = allPosts.reduce((acc,p) => {
          OPT_ITEMS.forEach(oi => { if(isDone(`op-${cluster.id}-${p.idx}-${oi.id}`)) acc++; });
          return acc;
        }, 0);
        const clusterOptTotal = allPosts.length * OPT_ITEMS.length;
        const clusterPct = clusterOptTotal > 0 ? Math.round(clusterOptDone / clusterOptTotal * 100) : 0;

        return <div key={cluster.id} style={{background:isExp?"rgba(255,255,255,0.06)":"rgba(255,255,255,0.03)",border:isExp?`2px solid ${ph.color}`:"1px solid rgba(255,255,255,0.06)",borderRadius:16,marginBottom:12,overflow:"hidden"}}>
          <div onClick={()=>setExpandedOptCluster(isExp?null:cluster.id)} style={{padding:"18px 24px",cursor:"pointer",display:"flex",alignItems:"center",gap:16}}>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}}>
                <span style={{fontSize:15,fontWeight:700,color:"#FFF"}}>{cluster.name}</span>
                <span style={{fontSize:10,fontWeight:700,background:"rgba(255,255,255,0.06)",color:"#6B7B8D",padding:"2px 8px",borderRadius:6}}>{livePosts.length} live{allPosts.length>livePosts.length?` · ${allPosts.length-livePosts.length} planned`:""}</span>
                <ValueBadge label="SEO" value={cluster.seoValue}/><ValueBadge label="AEO" value={cluster.aeoValue}/>
              </div>
              <div style={{width:"100%",maxWidth:300,height:6,background:"rgba(255,255,255,0.06)",borderRadius:100,overflow:"hidden",marginTop:6}}>
                <div style={{width:`${clusterPct}%`,height:"100%",background:clusterPct===100?"#4ADE80":"linear-gradient(90deg,#22C55E,#4ADE80)",borderRadius:100,transition:"width 0.5s"}}/>
              </div>
            </div>
            <div style={{textAlign:"right",flexShrink:0}}>
              <div style={{fontSize:20,fontWeight:800,color:clusterPct===100?"#4ADE80":"#FFF"}}>{clusterPct}%</div>
              <div style={{fontSize:11,color:"#6B7B8D"}}>{clusterOptDone}/{clusterOptTotal}</div>
            </div>
          </div>

          {isExp && <div style={{padding:"0 24px 24px",borderTop:"1px solid rgba(255,255,255,0.08)"}}>
            <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",marginBottom:8,borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
              <button onClick={async()=>{
                const posts=allPosts.filter(p=>p.status==="done"&&p.slug);
                if(posts.length===0){alert("No live pages to fetch.");return;}
                if(!confirm(`Fetch & scan ${posts.length} live pages?`))return;
                setFetchAllProgress({total:posts.length,done:0,current:"",errors:[]});
                let errList=[];
                for(let i=0;i<posts.length;i++){
                  const p=posts[i];
                  setFetchAllProgress(prev=>({...prev,done:i,current:p.name}));
                  const res=await fetchAndScanPage(p.slug,cluster.id,p.idx,setSavedHTML,setDone,setNotes,setLastScanResults,setHasChanges);
                  if(!res.success)errList.push(p.name);
                  await new Promise(r=>setTimeout(r,500));
                }
                setFetchAllProgress(prev=>({...prev,done:posts.length,current:"Done!",errors:errList}));
                setTimeout(()=>setFetchAllProgress(null),5000);
              }} style={{padding:"6px 16px",borderRadius:8,border:"1px solid rgba(255,199,44,0.4)",background:"rgba(255,199,44,0.08)",color:"#FFC72C",fontSize:12,fontWeight:700,cursor:"pointer"}}>⚡ Fetch All Pages ({allPosts.filter(p=>p.status==="done"&&p.slug).length})</button>
              {fetchAllProgress&&fetchAllProgress.current&&<span style={{fontSize:11,color:"#6B7B8D"}}>{fetchAllProgress.done}/{fetchAllProgress.total} — {fetchAllProgress.current}</span>}
            </div>

            {allPosts.map(post => {
              const isLive = post.status === "done";
              const pgDone = OPT_ITEMS.filter(oi => isDone(`op-${cluster.id}-${post.idx}-${oi.id}`)).length;
              const pgPct = Math.round(pgDone / OPT_ITEMS.length * 100);
              const isPillar = post.idx === 0;
              const scanKey = `${cluster.id}-${post.idx}`;
              const wasScan = !!lastScanResults[scanKey];
              const hasSavedHTML = !!(savedHTML[scanKey] && savedHTML[scanKey].length > 100);

              return <div key={post.idx} id={post.slug?"opt-page-"+post.slug:undefined} style={{marginTop:16,opacity:isLive?1:0.6,transition:"box-shadow 0.4s",boxShadow:optSearchHighlight&&post.slug===optSearchHighlight?"0 0 0 2px #FFC72C, 0 0 24px rgba(255,199,44,0.3)":"none",borderRadius:optSearchHighlight&&post.slug===optSearchHighlight?10:0}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10,flexWrap:"wrap",gap:8}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,flex:1,minWidth:0}}>
                    {isPillar&&<span style={{fontSize:9,fontWeight:800,background:`${ph.color}30`,color:ph.color,padding:"2px 6px",borderRadius:4,textTransform:"uppercase",flexShrink:0}}>Pillar</span>}
                    {!isLive&&<span style={{fontSize:9,fontWeight:800,background:"rgba(255,255,255,0.06)",color:"#6B7B8D",padding:"2px 6px",borderRadius:4,textTransform:"uppercase",flexShrink:0}}>Planned</span>}
                    <span style={{fontSize:14,fontWeight:600,color:isLive?"#FFF":"#6B7B8D"}}>{post.name}</span>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
                    {post.slug&&isLive&&<button onClick={async()=>{
                      const fk=`${cluster.id}-${post.idx}`;
                      setFetchingPages(p=>({...p,[fk]:true}));
                      const res=await fetchAndScanPage(post.slug,cluster.id,post.idx,setSavedHTML,setDone,setNotes,setLastScanResults,setHasChanges);
                      setFetchingPages(p=>{const n={...p};delete n[fk];return n;});
                      if(!res.success){const inSandbox=window.self!==window.top;alert(inSandbox?"Fetch blocked — open as local file to use auto-fetch":"Could not fetch: /"+post.slug);}
                    }} disabled={!!fetchingPages[`${cluster.id}-${post.idx}`]} style={{padding:"4px 10px",borderRadius:8,border:"1px solid rgba(255,199,44,0.2)",background:fetchingPages[`${cluster.id}-${post.idx}`]?"rgba(255,199,44,0.15)":"transparent",color:"#FFC72C",fontSize:11,fontWeight:700,cursor:fetchingPages[`${cluster.id}-${post.idx}`]?"wait":"pointer"}}>{fetchingPages[`${cluster.id}-${post.idx}`]?"Fetching...":"⚡ Fetch"}</button>}
                    {hasSavedHTML&&<button onClick={()=>{const r=scanHTML(savedHTML[scanKey]);const prefix=`op-${cluster.id}-${post.idx}`;const scannable=["opt-instant","opt-faq","opt-citations","opt-author","opt-charts","opt-graphics","opt-tables","opt-fresh"];setDone(prev=>{const next={...prev};scannable.forEach(k=>{const key=`${prefix}-${k}`;if(r[k])next[key]=Date.now();else delete next[key];});return next;});setLastScanResults(prev=>({...prev,[scanKey]:r}));setNotes(prev=>{const next={...prev};if(r["opt-citations-detail"])next[`${prefix}-opt-citations`]="Scan: "+r["opt-citations-detail"];if(r["opt-fresh-detail"])next[`${prefix}-opt-fresh`]="Scan: "+r["opt-fresh-detail"];if(r["opt-tables-detail"])next[`${prefix}-opt-tables`]="Scan: "+r["opt-tables-detail"];if(r["opt-charts-detail"])next[`${prefix}-opt-charts`]="Scan: "+r["opt-charts-detail"];if(r["opt-instant-detail"])next[`${prefix}-opt-instant`]="Scan: "+r["opt-instant-detail"];return next;});setHasChanges(true);}} style={{padding:"4px 10px",borderRadius:8,border:"1px solid rgba(96,165,250,0.3)",background:"rgba(96,165,250,0.1)",color:"#60A5FA",fontSize:11,fontWeight:700,cursor:"pointer"}}>⟳ Re-scan</button>}
                    <button onClick={()=>setSaveTarget({clusterId:cluster.id,postIdx:post.idx})} style={{padding:"4px 12px",borderRadius:8,border:"1px solid rgba(59,130,246,0.3)",background:hasSavedHTML?"rgba(59,130,246,0.1)":"transparent",color:hasSavedHTML?"#60A5FA":"#3B82F6",fontSize:11,fontWeight:700,cursor:"pointer"}}>{hasSavedHTML?"✓ HTML Saved":"Save HTML"}</button>
                    <button onClick={()=>setScanTarget({clusterId:cluster.id,postIdx:post.idx})} style={{padding:"4px 12px",borderRadius:8,border:"1px solid rgba(13,148,136,0.3)",background:wasScan?"rgba(13,148,136,0.1)":"transparent",color:wasScan?"#2DD4BF":"#0D9488",fontSize:11,fontWeight:700,cursor:"pointer"}}>{wasScan?"✓ Scanned":"Scan HTML"}</button>
                    <span style={{fontSize:12,fontWeight:700,color:pgPct===100?"#4ADE80":"#6B7B8D"}}>{pgDone}/{OPT_ITEMS.length}</span>
                  </div>
                </div>
                {post.slug&&<div style={{fontSize:11,color:"#4B5C6E",marginBottom:8,marginTop:-6}}>/{post.slug}&nbsp;
                  <button onClick={e=>{e.stopPropagation();setPbMode("fix");setPbPage({name:post.name,slug:post.slug,status:post.status,clusterId:cluster.id,clusterName:cluster.name,idx:post.idx,key:cluster.id+"-"+post.idx,html:savedHTML[cluster.id+"-"+post.idx]||null});setPbNepqContent({});setPbScanResults(null);setView("pageBuilder");}} style={{padding:"2px 8px",borderRadius:5,border:"1px solid rgba(13,148,136,0.4)",background:"rgba(13,148,136,0.08)",color:"#0D9488",fontSize:9,fontWeight:700,cursor:"pointer",verticalAlign:"middle"}}>📂 Load</button>
                </div>}

                <div style={{background:"rgba(255,255,255,0.03)",borderRadius:12,padding:"8px 14px",border:"1px solid rgba(255,255,255,0.04)"}}>
                  {OPT_ITEMS.map((oi,oIdx) => {
                    const tid = `op-${cluster.id}-${post.idx}-${oi.id}`;
                    const d = isDone(tid);
                    const catColor = oi.cat==="AEO"?"#60A5FA":oi.cat==="E-E-A-T"?"#FFC72C":oi.cat==="Content"?"#2DD4BF":oi.cat==="GEO"?"#A78BFA":"#FB923C";
                    return <div key={oi.id} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"7px 0",fontSize:13,borderBottom:oIdx<OPT_ITEMS.length-1?"1px solid rgba(255,255,255,0.03)":"none",animation:recentId===tid?"donePulse 1s ease":"none"}}>
                      <AnimCheck checked={d} onToggle={()=>toggle(tid)} sz={18}/>
                      <div style={{flex:1}}>
                        <span style={{color:d?"#4ADE80":"#C4CDD5",textDecoration:d?"line-through":"none",transition:"all 0.3s"}}>{oi.label}</span>
                        {d&&<NoteField value={getNote(tid)} onChange={v=>setNote(tid,v)} dark={isDark}/>}
                      </div>
                      <span style={{fontSize:9,fontWeight:700,color:catColor,background:`${catColor}15`,padding:"2px 6px",borderRadius:4,textTransform:"uppercase",flexShrink:0}}>{oi.cat}</span>
                    </div>;
                  })}
                </div>
              </div>;
            })}
          </div>}
        </div>;
      })}

      {/* Weekly Schedule */}
      <div style={{marginBottom:32}}>
        <div style={{fontSize:11,fontWeight:800,letterSpacing:"0.12em",color:"#2DD4BF",textTransform:"uppercase",marginBottom:16}}>Weekly Content Schedule</div>
        <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:14,padding:"18px 24px",marginBottom:12}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
            <span style={{fontSize:13,fontWeight:700,color:"#FFF"}}>Overall Progress</span>
            <span style={{fontSize:13,fontWeight:800,color:"#4ADE80"}}>{calDone+opsDone}/{totalCalTasks+opsTotalTasks} ({totalCalTasks+opsTotalTasks>0?Math.round((calDone+opsDone)/(totalCalTasks+opsTotalTasks)*100):0}%)</span>
          </div>
          <div style={{width:"100%",height:8,background:"rgba(255,255,255,0.06)",borderRadius:100,overflow:"hidden"}}>
            <div style={{width:`${totalCalTasks+opsTotalTasks>0?((calDone+opsDone)/(totalCalTasks+opsTotalTasks))*100:0}%`,height:"100%",background:"linear-gradient(90deg,#16A34A,#4ADE80)",borderRadius:100,transition:"width 0.5s"}}/>
          </div>
        </div>
        {(calendarWeeks||[]).map(w => {
          const ph = PHASES.find(p => p.id === w.phase);
          const isCur = w.week === 1;
          const wkDone = w.tasks.filter((_,i) => isDone(`cal-${w.week}-${i}`)).length;
          const allDone = wkDone === w.tasks.length;
          return <div key={w.week} style={{background:allDone?"rgba(22,163,74,0.06)":isCur?"rgba(13,148,136,0.06)":"rgba(255,255,255,0.03)",border:allDone?"2px solid rgba(22,163,74,0.25)":isCur?"2px solid rgba(13,148,136,0.3)":"1px solid rgba(255,255,255,0.08)",borderRadius:16,marginBottom:14,overflow:"hidden"}}>
            <div style={{padding:"18px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12,borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
              <div style={{display:"flex",alignItems:"center",gap:14}}>
                <div style={{width:44,height:44,borderRadius:12,background:allDone?"#16A34A":isCur?ph.color:`${ph.color}25`,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column"}}>
                  {allDone?<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#FFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>:<><span style={{fontSize:9,fontWeight:700,color:isCur?"#FFF":ph.color}}>WK</span><span style={{fontSize:17,fontWeight:800,color:isCur?"#FFF":ph.color}}>{w.week}</span></>}
                </div>
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                    <h4 style={{fontSize:16,fontWeight:700,color:"#FFF",margin:0}}>{w.focus}</h4>
                    {isCur&&!allDone&&<span style={{fontSize:10,fontWeight:800,background:`${ph.color}30`,color:ph.color,padding:"2px 10px",borderRadius:20}}>THIS WEEK</span>}
                    {allDone&&<span style={{fontSize:10,fontWeight:800,background:"rgba(22,163,74,0.2)",color:"#4ADE80",padding:"2px 10px",borderRadius:20}}>COMPLETE</span>}
                  </div>
                  <div style={{fontSize:12,color:"#6B7B8D",marginTop:2}}>{w.dates} · Phase {w.phase}</div>
                </div>
              </div>
              <div style={{fontSize:13,fontWeight:700,color:allDone?"#4ADE80":"#6B7B8D"}}>{wkDone}/{w.tasks.length}</div>
            </div>
            <div style={{padding:"12px 24px 8px"}}>
              {[...w.tasks.map((t,i)=>({...t,idx:i}))].sort((a,b)=>{const ad=isDone(`cal-${w.week}-${a.idx}`),bd=isDone(`cal-${w.week}-${b.idx}`);if(ad===bd)return a.idx-b.idx;return ad?1:-1;}).map(t => {
                const tid = `cal-${w.week}-${t.idx}`;
                const d = isDone(tid);
                const tc = typeColors[t.type] || typeColors["Content"] || {bg:"#2DD4BF18",color:"#2DD4BF",border:"#2DD4BF30"};
                return <div key={t.idx} style={{display:"flex",alignItems:"flex-start",gap:12,padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,0.04)",opacity:d?0.55:1,transition:"opacity 0.4s"}}>
                  <AnimCheck checked={d} onToggle={()=>toggle(tid)}/>
                  <div style={{flex:1,minWidth:0}}><span style={{fontSize:13,color:d?"#4ADE80":"#C4CDD5",textDecoration:d?"line-through":"none",transition:"all 0.3s"}}>{t.task}</span>{d&&<NoteField value={getNote(tid)} onChange={v=>setNote(tid,v)} dark={isDark}/>}</div>
                  <span style={{fontSize:10,fontWeight:700,color:tc.color,background:tc.bg,padding:"2px 8px",borderRadius:5,border:`1px solid ${tc.border}`,textTransform:"uppercase",flexShrink:0,whiteSpace:"nowrap"}}>{t.type}</span>
                  <span style={{fontSize:11,color:"#4B5C6E",flexShrink:0,minWidth:45,textAlign:"right"}}>{t.effort}</span>
                </div>;
              })}
            </div>
            <div style={{padding:"12px 24px 16px",background:"rgba(0,0,0,0.15)",borderTop:"1px solid rgba(255,255,255,0.04)"}}>
              <div style={{fontSize:10,fontWeight:800,color:"#FFC72C",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>Deliverables</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>{w.deliverables.map((d,i)=><span key={i} style={{fontSize:12,fontWeight:600,color:"#FFF",background:"rgba(255,199,44,0.08)",border:"1px solid rgba(255,199,44,0.2)",padding:"4px 12px",borderRadius:8}}>{d}</span>)}</div>
            </div>
          </div>;
        })}
      </div>

      {/* Site-wide tasks */}
      <div style={{marginTop:32}}>
        <div style={{fontSize:11,fontWeight:800,letterSpacing:"0.12em",color:"#A78BFA",textTransform:"uppercase",marginBottom:16}}>Site-Wide Foundation (One-Time Tasks)</div>
        <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:16,padding:"16px 20px"}}>
          {phase1Checklist.map(task => {
            const tid = `p1-${task.id}`;
            const d = isDone(tid);
            return <div key={task.id} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"10px 0",fontSize:13,borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
              <AnimCheck checked={d} onToggle={()=>toggle(tid)}/>
              <div style={{flex:1}}><span style={{textDecoration:d?"line-through":"none",color:d?"#4ADE80":"#C4CDD5"}}>{task.label}</span>{d&&<NoteField value={getNote(tid)} onChange={v=>setNote(tid,v)} dark={isDark}/>}</div>
              <span style={{fontSize:9,fontWeight:700,color:task.category==="E-E-A-T"?"#FFC72C":task.category==="AEO"?"#60A5FA":task.category==="GEO"?"#A78BFA":"#2DD4BF",background:task.category==="E-E-A-T"?"#FFC72C15":task.category==="AEO"?"#60A5FA15":task.category==="GEO"?"#A78BFA15":"#2DD4BF15",padding:"2px 6px",borderRadius:4,textTransform:"uppercase",flexShrink:0}}>{task.category}</span>
              {d&&done[tid]&&<span style={{fontSize:10,color:"rgba(255,255,255,0.2)",flexShrink:0}}>{new Date(done[tid]).toLocaleDateString()}</span>}
            </div>;
          })}
        </div>
      </div>
    </div>
  );
}
