// opportunityEngine.js — Architecture tab cluster proposal generator (§2.1).
//
// v2: Semantic cluster formation with pillar/spoke structure.
//
// score = gsc_opportunity*0.4 + aeo_gap*0.3 + moat_fit*0.2 + seasonal_boost*0.1
// All component scores normalized to 0..1. Final score surfaced as 0..100.

const GSC_DATA_URL = 'https://generationhealth.me/tools/gsc-data.json';

const NC_COUNTIES = [
  'mecklenburg','wake','durham','orange','guilford','forsyth','buncombe',
  'cabarrus','chatham','alamance','henderson','new hanover','catawba',
  'cumberland','union','gaston','davidson','iredell','rowan','johnston',
  'randolph','pitt','brunswick','onslow','robeson','harnett','nash',
];

const SEASONAL_WINDOWS = [
  { name: 'AEP',     start: [7, 15],  end: [11, 7]  },
  { name: 'OEP-MA',  start: [0, 1],   end: [2, 31]  },
  { name: 'ACA-OEP', start: [10, 1],  end: [0, 15]  },
];

const STOPWORDS = new Set([
  'the','a','an','and','or','but','is','are','was','were','be','been','in','on',
  'at','to','for','of','with','by','from','as','that','this','these','those',
  'it','its','my','your','our','their','what','how','when','where','why','who',
  'do','does','did','can','could','should','would','will','have','has','had',
  'nc','north','carolina','near','me','best','top','2025','2026','vs','and',
]);

const DOMAIN_GENERIC = new Set([
  'medicare','health','insurance','plan','plans','coverage','get','find',
  'good','need','looking','around','here','someone','recommend','help',
]);

// ── Intent synonyms ──────────────────────────────────────────────────────────
const SYNONYM_GROUPS = [
  { canonical: 'help',     terms: ['help','assistance','assist','support','guidance','guide'] },
  { canonical: 'advisor',  terms: ['advisor','advisors','agent','agents','broker','brokers','consultant','specialist'] },
  { canonical: 'find',     terms: ['find','finding','looking','search','searching','seek','seeking','recommend','recommendation','locate'] },
  { canonical: 'enroll',   terms: ['enroll','enrollment','signup','sign-up','register','registration','apply','application'] },
  { canonical: 'compare',  terms: ['compare','comparison','comparing','versus','differ','difference','differences'] },
  { canonical: 'cost',     terms: ['cost','costs','price','prices','pricing','premium','premiums','expense','expenses','afford','affordable'] },
  { canonical: 'choose',   terms: ['choose','choosing','pick','picking','select','selecting','decide','deciding','decision'] },
  { canonical: 'switch',   terms: ['switch','switching','change','changing','transfer'] },
  { canonical: 'turning65',terms: ['turning','turn','65','sixty-five'] },
  { canonical: 'advantage',terms: ['advantage','mapd','ma'] },
  { canonical: 'supplement',terms: ['supplement','supplemental','medigap'] },
  { canonical: 'partd',    terms: ['part-d','partd','prescription','drug','drugs','medication','medications','rx'] },
];

const SYNONYM_MAP = new Map();
for (const group of SYNONYM_GROUPS) {
  for (const term of group.terms) {
    SYNONYM_MAP.set(term, group.canonical);
  }
}

// ── Moat classifier ──────────────────────────────────────────────────────────
export function classifyMoat(queryText) {
  const q = queryText.toLowerCase();
  if (q.includes('veteran') || q.includes('va ')) return { tag: 'veteran', fit: 1.0 };
  if (q.includes('duke')) return { tag: 'duke-adjacent', fit: 1.0 };
  if (q.includes('under 65') || q.includes('under-65') || q.includes('disability') || q.includes('disabled')) return { tag: 'under-65', fit: 1.0 };
  for (const c of NC_COUNTIES) { if (q.includes(c)) return { tag: 'nc-local', fit: 1.0 }; }
  if (q.includes('broker') || q.includes('agent')) return { tag: 'broker-specialty', fit: 0.8 };
  return { tag: null, fit: 0.5 };
}

// ── Seasonal boost ───────────────────────────────────────────────────────────
export function seasonalBoost(now = new Date()) {
  const m = now.getMonth(), d = now.getDate();
  for (const w of SEASONAL_WINDOWS) {
    if (dateInWindow(m, d, w.start, w.end)) return { boost: 1.0, reason: `inside ${w.name} window` };
  }
  const daysUntil = SEASONAL_WINDOWS
    .map(w => daysUntilDate(now, w.start[0], w.start[1]))
    .sort((a, b) => a - b);
  if (daysUntil[0] <= 180) return { boost: 1.0, reason: `${daysUntil[0]}d to next seasonal window` };
  return { boost: 0.3, reason: 'off-season' };
}

function dateInWindow(m, d, start, end) {
  const cur = m * 100 + d, s = start[0] * 100 + start[1], e = end[0] * 100 + end[1];
  return s <= e ? (cur >= s && cur <= e) : (cur >= s || cur <= e);
}

function daysUntilDate(now, targetMonth, targetDay) {
  const y = now.getFullYear();
  let target = new Date(y, targetMonth, targetDay);
  if (target < now) target = new Date(y + 1, targetMonth, targetDay);
  return Math.round((target - now) / 86400000);
}

// ── Data loaders ─────────────────────────────────────────────────────────────
export async function loadGscData(fetchFn = fetch) {
  try {
    const res = await fetchFn(GSC_DATA_URL + '?v=' + Date.now());
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

// ── Tokenization with synonym resolution ─────────────────────────────────────
function tokenize(text) {
  if (!text) return [];
  return text.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 1 && !STOPWORDS.has(t))
    .map(t => SYNONYM_MAP.get(t) || t);
}

function meaningfulTokens(text) {
  return tokenize(text).filter(t => !DOMAIN_GENERIC.has(t));
}

// ── Coverage index (cannibalization guard) ────────────────────────────────────
export function buildCoverageIndex(clusters) {
  const covered = new Set();
  for (const c of (clusters || [])) {
    for (const t of tokenize(c.name)) covered.add(t);
    for (const p of (c.posts || [])) {
      for (const t of tokenize(p.name)) covered.add(t);
      if (p.slug) for (const t of tokenize(p.slug.replace(/-/g, ' '))) covered.add(t);
    }
  }
  return covered;
}

function isAlreadyCovered(query, covered) {
  const toks = tokenize(query).filter(t => !DOMAIN_GENERIC.has(t));
  if (toks.length === 0) return true;
  const hits = toks.filter(t => covered.has(t)).length;
  return hits / toks.length >= 0.6;
}

// ── Semantic similarity (Jaccard on meaningful tokens) ───────────────────────
function querySimilarity(tokensA, tokensB) {
  if (tokensA.length === 0 && tokensB.length === 0) return 0;
  const setA = new Set(tokensA), setB = new Set(tokensB);
  let intersection = 0;
  for (const t of setA) if (setB.has(t)) intersection++;
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union;
}

// ── Cluster formation via union-find ─────────────────────────────────────────
const SIMILARITY_THRESHOLD = 0.30;

function formIntentClusters(scoredQueries) {
  const items = scoredQueries.map(q => ({ ...q, mTokens: meaningfulTokens(q.query) }));
  const parent = items.map((_, i) => i);
  const find = (i) => { while (parent[i] !== i) { parent[i] = parent[parent[i]]; i = parent[i]; } return i; };
  const unite = (a, b) => { const ra = find(a), rb = find(b); if (ra !== rb) parent[ra] = rb; };

  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      if (querySimilarity(items[i].mTokens, items[j].mTokens) >= SIMILARITY_THRESHOLD) unite(i, j);
    }
  }

  const clusters = new Map();
  for (let i = 0; i < items.length; i++) {
    const root = find(i);
    if (!clusters.has(root)) clusters.set(root, []);
    clusters.get(root).push(items[i]);
  }
  return Array.from(clusters.values());
}

// ── GSC scoring ──────────────────────────────────────────────────────────────
function scoreGsc(row, maxImp) {
  const imp = row.impressions || 0;
  const pos = Math.max(row.position || 30, 11);
  return Math.min(imp / Math.max(maxImp, 1), 1) * (1 / (pos - 10));
}

function scoreAeoGap(query, citationIndex) {
  const entry = citationIndex.get(normalizeQuery(query));
  if (!entry) return 0.5;
  return Math.max(0, Math.min(1, (4 - entry.enginesCiting) / 4));
}

function normalizeQuery(q) { return (q || '').toLowerCase().trim(); }

// ── Pillar selection ─────────────────────────────────────────────────────────
function selectPillar(queries) {
  if (queries.length === 0) return { pillar: null, spokes: [] };
  if (queries.length === 1) return { pillar: queries[0], spokes: [] };
  const scored = queries.map(q => ({
    ...q,
    pillarScore: meaningfulTokens(q.query).length * 2 + Math.log2((q.impressions || 1) + 1),
  })).sort((a, b) => b.pillarScore - a.pillarScore);
  return { pillar: scored[0], spokes: scored.slice(1) };
}

// ── Proposal synthesis ───────────────────────────────────────────────────────
function cleanTitle(query) {
  return query.replace(/\bnc\b/gi, 'NC').replace(/\s+/g, ' ').trim()
    .split(' ').map(w => w === 'NC' ? 'NC' : w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function buildClusterProposal(intentCluster, now) {
  const { pillar, spokes } = selectPillar(intentCluster);
  if (!pillar) return null;

  const allQueries = [pillar, ...spokes];
  const totImp   = allQueries.reduce((s, q) => s + (q.impressions || 0), 0);
  const avgPos   = allQueries.reduce((s, q) => s + (q.position || 0), 0) / allQueries.length;
  const avgAeo   = allQueries.reduce((s, q) => s + q.aeoGap, 0) / allQueries.length;
  const gscScore = allQueries.reduce((s, q) => s + q.gsc, 0) / allQueries.length;

  const moatTags = {};
  for (const q of allQueries) { const m = classifyMoat(q.query); if (m.tag) moatTags[m.tag] = (moatTags[m.tag] || 0) + 1; }
  const dominantMoat = Object.entries(moatTags).sort((a, b) => b[1] - a[1])[0];
  const moat = dominantMoat ? { tag: dominantMoat[0], fit: 1.0 } : { tag: null, fit: 0.5 };
  const seasonal = seasonalBoost(now);

  const score = Math.round((gscScore * 0.4 + avgAeo * 0.3 + moat.fit * 0.2 + seasonal.boost * 0.1) * 100);
  const isPillar = allQueries.length >= 3 || totImp >= 500;
  const type = isPillar ? 'pillar' : 'expansion';

  const pillarTitle = cleanTitle(pillar.query);
  const spokeEntries = spokes.map(s => ({
    title: cleanTitle(s.query), query: s.query,
    impressions: s.impressions || 0, position: s.position || 0,
  }));

  const allTokens = allQueries.flatMap(q => meaningfulTokens(q.query))
    .filter((v, i, a) => a.indexOf(v) === i).sort().join('|');

  const description = synthDescription(allQueries, avgPos, totImp, moat, seasonal, spokes.length);

  return {
    title: pillarTitle.length > 70 ? pillarTitle.slice(0, 67) + '…' : pillarTitle,
    description,
    type,
    page_count: 1 + spokeEntries.length,
    score,
    signals_json: {
      gsc: { queries: allQueries.length, total_impressions: Math.round(totImp), avg_position: Number(avgPos.toFixed(1)), score: Number(gscScore.toFixed(3)), sample: allQueries.slice(0, 3).map(q => q.query) },
      aeo: { engines_gap_avg: Number(avgAeo.toFixed(3)), score: Number(avgAeo.toFixed(3)) },
      moat: { tag: moat.tag, fit: moat.fit },
      seasonal: { boost: seasonal.boost, reason: seasonal.reason },
    },
    cluster_structure: {
      pillar: { title: pillarTitle, query: pillar.query, impressions: pillar.impressions || 0, position: pillar.position || 0 },
      spokes: spokeEntries,
    },
    source_hash: `cluster::${allTokens}::${type}`,
  };
}

function synthDescription(queries, avgPos, totImp, moat, seasonal, spokeCount) {
  const parts = [];
  if (totImp > 0) parts.push(`${queries.length} ${queries.length === 1 ? 'query' : 'queries'} at avg pos ${avgPos.toFixed(1)}, ${Math.round(totImp).toLocaleString()} imp/mo`);
  else parts.push(`${queries.length} ${queries.length === 1 ? 'query' : 'queries'} from citation tracking`);
  if (spokeCount > 0) parts.push(`${spokeCount} ${spokeCount === 1 ? 'spoke' : 'spokes'}`);
  if (moat.tag) parts.push(`${moat.tag} moat`);
  if (seasonal.boost === 1.0) parts.push(seasonal.reason);
  return parts.join(' · ');
}

// ── Page title generator ─────────────────────────────────────────────────────
export function generatePageTitles(proposal) {
  const cs = proposal.cluster_structure;
  if (!cs) {
    const base = proposal.title;
    const titles = [base];
    const suffixes = proposal.type === 'pillar'
      ? ['— 2026 Enrollment Guide', '— Plan Comparison', '— Costs and Coverage']
      : ['— What You Need to Know'];
    for (const s of suffixes.slice(0, Math.max(0, proposal.page_count - 1))) titles.push(`${base} ${s}`);
    return titles.slice(0, proposal.page_count);
  }
  return [cs.pillar.title, ...cs.spokes.map(s => s.title)];
}

// ── Linking plan generator ───────────────────────────────────────────────────
export function generateLinkingPlan(proposal) {
  const cs = proposal.cluster_structure;
  if (!cs) return null;

  const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
  const pillarSlug = slugify(cs.pillar.title);

  return {
    pillar: {
      title: cs.pillar.title, slug: pillarSlug,
      linksTo: cs.spokes.map(s => ({ title: s.title, slug: slugify(s.title), relationship: 'spoke' })),
    },
    spokes: cs.spokes.map((spoke, i) => ({
      title: spoke.title, slug: slugify(spoke.title),
      linksTo: [
        { title: cs.pillar.title, slug: pillarSlug, relationship: 'pillar' },
        ...(i > 0 ? [{ title: cs.spokes[i - 1].title, slug: slugify(cs.spokes[i - 1].title), relationship: 'sibling' }] : []),
        ...(i < cs.spokes.length - 1 ? [{ title: cs.spokes[i + 1].title, slug: slugify(cs.spokes[i + 1].title), relationship: 'sibling' }] : []),
      ],
    })),
  };
}

// ── Public API ───────────────────────────────────────────────────────────────
export async function runOpportunityScan({ clusters, citationQueries = [], citationResults = [], now = new Date() } = {}) {
  const gscData = await loadGscData();
  const byQuery = gscData?.by_query || [];

  const diagnostics = {
    gsc_rows: byQuery.length, gsc_eligible: 0,
    citation_queries_tracked: citationQueries.length, citation_queries_used: 0,
    competitor_gaps: 0, covered_skipped: 0,
    clusters_formed: 0, clusters_merged: 0,
    generated_at: new Date().toISOString(),
  };

  const eligible = byQuery.filter(r => {
    const pos = r.position || 0, imp = r.impressions || 0;
    return pos >= 11 && pos <= 30 && imp > 100;
  });
  diagnostics.gsc_eligible = eligible.length;

  const covered = buildCoverageIndex(clusters);
  const maxImp = eligible.reduce((m, r) => Math.max(m, r.impressions || 0), 0);

  const citationIndex = new Map();
  const resultsByQueryId = new Map();
  for (const r of citationResults) {
    if (!resultsByQueryId.has(r.query_id)) resultsByQueryId.set(r.query_id, []);
    resultsByQueryId.get(r.query_id).push(r);
  }
  for (const q of citationQueries) {
    const rs = resultsByQueryId.get(q.id) || [];
    const engines = new Set(rs.filter(r => r.status === 'cited').map(r => r.engine));
    citationIndex.set(normalizeQuery(q.query_text), { enginesCiting: engines.size });
    if (engines.size < 2) diagnostics.competitor_gaps++;
  }

  const scoredQueries = [];
  const seenNormalized = new Set();

  for (const row of eligible) {
    const query = row.keys?.[0] || '';
    if (!query) continue;
    if (isAlreadyCovered(query, covered)) { diagnostics.covered_skipped++; continue; }
    seenNormalized.add(normalizeQuery(query));
    scoredQueries.push({
      query, impressions: row.impressions, position: row.position,
      gsc: scoreGsc(row, maxImp), aeoGap: scoreAeoGap(query, citationIndex),
    });
  }

  for (const cq of citationQueries) {
    const queryText = cq.query_text || '';
    if (!queryText) continue;
    const norm = normalizeQuery(queryText);
    if (seenNormalized.has(norm)) continue;
    if (isAlreadyCovered(queryText, covered)) { diagnostics.covered_skipped++; continue; }
    seenNormalized.add(norm);
    scoredQueries.push({ query: queryText, impressions: 0, position: 0, gsc: 0, aeoGap: scoreAeoGap(queryText, citationIndex) });
    diagnostics.citation_queries_used++;
  }

  const intentClusters = formIntentClusters(scoredQueries);
  diagnostics.clusters_formed = intentClusters.length;
  diagnostics.clusters_merged = scoredQueries.length - intentClusters.length;

  const proposals = intentClusters
    .map(cluster => buildClusterProposal(cluster, now))
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12);

  return { proposals, diagnostics };
}
