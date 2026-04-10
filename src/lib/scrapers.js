/**
 * GH Scrapers — browser-safe, no imports needed from Node
 * Exposes: scrapeReddit, scrapeMedicareGov, scrapeEhealth, scrapeCompetitors, runAll
 */

const PROXY_URL = 'https://generationhealth.me/tools/scrape-proxy.php';
const REQUEST_DELAY_MS = 1000;

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

function emptyCitationStatus() {
  return { claude: null, chatgpt: null, perplexity: null, gemini: null };
}

function makeCandidate({ id, query, source, intent, intentScore, category, upvotes }) {
  return {
    id, query, source, intent, intentScore, category,
    dateAdded: new Date().toISOString(),
    ...(upvotes !== undefined ? { upvotes } : {}),
    citationStatus: emptyCitationStatus(),
    competitors: [],
  };
}

function cleanText(s) {
  if (!s) return '';
  return s.replace(/\s+/g, ' ').trim();
}

function isPlausibleQuery(text) {
  if (!text) return false;
  const t = text.trim();
  return t.length >= 10 && t.length <= 160;
}

export function dedupe(candidates) {
  const seen = new Set();
  const out = [];
  for (const c of candidates) {
    const key = c.query.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(c);
  }
  return out;
}

async function fetchViaProxy(targetUrl) {
  const proxied = `${PROXY_URL}?url=${encodeURIComponent(targetUrl)}`;
  try {
    const res = await fetch(proxied);
    if (!res.ok) throw new Error(`Proxy HTTP ${res.status}`);
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json'))
      throw new Error(`Proxy returned non-JSON`);
    const data = await res.json();
    if (!data.ok) throw new Error(`Proxy error: ${data.error || 'unknown'}`);
    if (typeof data.html !== 'string') throw new Error('Proxy returned invalid HTML');
    return data.html;
  } catch (err) {
    if (err.message.includes('Failed to fetch'))
      throw new Error(`Proxy unreachable. Check ${PROXY_URL}`);
    throw err;
  }
}

function parseHTML(html) {
  const parser = new DOMParser();
  return parser.parseFromString(html, 'text/html');
}

// ── Reddit ──────────────────────────────────────────────────────────────────
const REDDIT_SUBS = ['Medicare', 'HealthInsurance', 'personalfinance', 'NorthCarolina'];
const REDDIT_KEYWORDS = [
  'medicare','medicaid','health insurance','turning 65',
  'enrollment','part d','part b','medigap','advantage plan',
];

async function fetchSubredditPosts(subreddit) {
  const url = `https://www.reddit.com/r/${subreddit}/top.json?t=month&limit=100`;
  try {
    const res = await fetch(url, {
      headers: { 'Accept': 'application/json', 'User-Agent': 'GHCommandCenter/1.0' },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data?.data?.children || []).map((c) => ({
      id: c.data.id,
      title: c.data.title,
      upvotes: c.data.ups,
      subreddit: c.data.subreddit,
    }));
  } catch { return []; }
}

function cleanRedditTitle(title) {
  return (title || '')
    .replace(/^(ELI5|TIL|PSA|Question|Help|Advice needed|Update|Rant)\s*[:\-]\s*/i, '')
    .replace(/\s+/g, ' ').trim();
}

export async function scrapeReddit() {
  const allPosts = [];
  for (const sub of REDDIT_SUBS) {
    const posts = await fetchSubredditPosts(sub);
    allPosts.push(...posts);
    await delay(REQUEST_DELAY_MS);
  }
  const filtered = allPosts.filter((p) =>
    REDDIT_KEYWORDS.some((kw) => p.title.toLowerCase().includes(kw))
  );
  const candidates = filtered
    .map((p) => makeCandidate({
      id: `reddit-${p.id}`,
      query: cleanRedditTitle(p.title),
      source: 'reddit', intent: 'medium', intentScore: 5,
      category: 'local_decisions', upvotes: p.upvotes,
    }))
    .filter((c) => isPlausibleQuery(c.query));
  return dedupe(candidates);
}

// ── Medicare.gov ─────────────────────────────────────────────────────────────
const MEDICARE_GOV_PAGES = [
  'https://www.medicare.gov/basics/get-started-with-medicare',
  'https://www.medicare.gov/basics/costs/medicare-costs',
  'https://www.medicare.gov/health-drug-plans/health-plans/your-coverage-options',
  'https://www.medicare.gov/health-drug-plans/part-d',
];

async function extractMedicareGovQueries(pageUrl) {
  const html = await fetchViaProxy(pageUrl);
  const doc = parseHTML(html);
  const out = [];
  const slug = pageUrl.replace(/\W+/g, '-').slice(0, 60);
  doc.querySelectorAll('h1, h2, h3').forEach((h, idx) => {
    const text = cleanText(h.textContent);
    if (text.includes('?') && isPlausibleQuery(text)) {
      out.push(makeCandidate({
        id: `medicare-gov-${slug}-h-${idx}`,
        query: text, source: 'medicare_gov',
        intent: 'low', intentScore: 3, category: 'authority_builders',
      }));
    }
  });
  return out;
}

export async function scrapeMedicareGov() {
  const all = [];
  for (const url of MEDICARE_GOV_PAGES) {
    try { all.push(...await extractMedicareGovQueries(url)); } catch (err) {
      console.warn(`[medicare.gov] ${url}:`, err.message);
    }
    await delay(REQUEST_DELAY_MS);
  }
  return dedupe(all);
}

// ── eHealth ───────────────────────────────────────────────────────────────────
const EHEALTH_PAGES = [
  'https://www.ehealthinsurance.com/medicare',
  'https://www.ehealthinsurance.com/medicare/medicare-advantage',
  'https://www.ehealthinsurance.com/medicare/supplement-insurance',
];

async function extractEhealthQueries(pageUrl) {
  const html = await fetchViaProxy(pageUrl);
  const doc = parseHTML(html);
  const out = [];
  const slug = pageUrl.replace(/\W+/g, '-').slice(0, 60);
  doc.querySelectorAll('h1, h2').forEach((h, idx) => {
    const text = cleanText(h.textContent);
    if (isPlausibleQuery(text)) {
      out.push(makeCandidate({
        id: `ehealth-${slug}-h-${idx}`,
        query: text, source: 'ehealth',
        intent: 'medium', intentScore: 5, category: 'authority_builders',
      }));
    }
  });
  return out;
}

export async function scrapeEhealth() {
  const all = [];
  for (const url of EHEALTH_PAGES) {
    try { all.push(...await extractEhealthQueries(url)); } catch (err) {
      console.warn(`[ehealth] ${url}:`, err.message);
    }
    await delay(REQUEST_DELAY_MS);
  }
  return dedupe(all);
}

// ── Competitors ───────────────────────────────────────────────────────────────
async function extractCompetitorQueries(pageUrl) {
  const html = await fetchViaProxy(pageUrl);
  const doc = parseHTML(html);
  const out = [];
  const slug = pageUrl.replace(/\W+/g, '-').slice(0, 60);
  const h1 = cleanText(doc.querySelector('h1')?.textContent);
  if (isPlausibleQuery(h1)) {
    out.push(makeCandidate({
      id: `competitor-${slug}-h1`,
      query: h1, source: 'competitor',
      intent: 'high', intentScore: 7, category: 'county_city',
    }));
  }
  doc.querySelectorAll('h2').forEach((h, idx) => {
    const text = cleanText(h.textContent);
    if (isPlausibleQuery(text)) {
      out.push(makeCandidate({
        id: `competitor-${slug}-h2-${idx}`,
        query: text, source: 'competitor',
        intent: 'medium', intentScore: 6, category: 'authority_builders',
      }));
    }
  });
  return out;
}

export async function scrapeCompetitors(competitorUrls = []) {
  if (!competitorUrls.length) return [];
  const all = [];
  for (const url of competitorUrls) {
    try { all.push(...await extractCompetitorQueries(url)); } catch (err) {
      console.warn(`[competitors] ${url}:`, err.message);
    }
    await delay(REQUEST_DELAY_MS);
  }
  return dedupe(all);
}

export async function runAll(options = {}) {
  const { competitorUrls = [] } = options;
  const results = await Promise.allSettled([
    scrapeReddit(),
    scrapeMedicareGov(),
    scrapeEhealth(),
    scrapeCompetitors(competitorUrls),
  ]);
  const all = [];
  results.forEach((r) => {
    if (r.status === 'fulfilled') all.push(...r.value);
  });
  return dedupe(all);
}
