const CLAUDE_MODEL = 'claude-sonnet-4-20250514';
const CLAUDE_ENDPOINT = 'https://api.anthropic.com/v1/messages';

function buildExpansionPrompt(seedQuery) {
  return `Given this Medicare query: "${seedQuery}"

Generate 5 natural language variations that real people might ask when searching for the same information. Use conversational language, not SEO keywords.

Requirements:
- Keep the core intent the same
- Vary the phrasing naturally  
- Include location variants if applicable (Durham, Wake County, Triangle, etc.)
- Use both question and statement formats
- No marketing jargon

Return only the query variations, one per line, numbered 1-5. No preamble, no commentary.`;
}

function parseVariations(text) {
  if (!text) return [];
  return text.split(/\r?\n/)
    .map(l => l.trim()).filter(Boolean)
    .map(l => l.replace(/^\d+\s*[.)\-:]\s*/, '').trim())
    .map(l => l.replace(/^["'`]+|["'`]+$/g, '').trim())
    .filter(l => l.length > 0 && l.length < 200);
}

async function generateVariations(seedQuery, apiKey) {
  try {
    const resp = await fetch(CLAUDE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 500,
        messages: [{ role: 'user', content: buildExpansionPrompt(seedQuery) }],
      }),
    });
    if (!resp.ok) return [];
    const data = await resp.json();
    if (data.error) return [];
    const text = data?.content?.[0]?.text || '';
    return parseVariations(text);
  } catch { return []; }
}

function makeQueryId(query, source) {
  const slug = query.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${source}-${slug}-${suffix}`;
}

export async function expandSeedQueries(seeds, apiKey, onProgress) {
  if (!apiKey) throw new Error('Claude API key is required');
  const out = [];
  const now = new Date().toISOString();
  for (let i = 0; i < seeds.length; i++) {
    const seed = seeds[i];
    const variations = await generateVariations(seed.query, apiKey);
    const queries = [seed.query, ...variations].slice(0, 6);
    for (const q of queries) {
      out.push({
        id: makeQueryId(q, 'seed_expansion'),
        query: q,
        source: 'seed_expansion',
        intent: 'medium',
        intentScore: 5,
        category: seed.category,
        dateAdded: now,
        citationStatus: { claude: null, chatgpt: null, perplexity: null, gemini: null },
        competitors: [],
      });
    }
    if (onProgress) onProgress(i + 1, seeds.length);
    if (i < seeds.length - 1) await new Promise(r => setTimeout(r, 1200));
  }
  return out;
}

// Default seeds — county-first strategy, no duplicate Durham broker intent
export const DEFAULT_SEEDS = [
  { query: 'Medicare broker Durham NC', category: 'county_city', priority: 5 },
  { query: 'turning 65 Medicare North Carolina', category: 'local_decisions', priority: 5 },
  { query: 'Medicare Advantage vs Medigap NC', category: 'authority_builders', priority: 4 },
  { query: 'best Medicare plans Wake County NC', category: 'county_city', priority: 5 },
  { query: 'Medicare enrollment deadlines 2026 North Carolina', category: 'local_decisions', priority: 5 },
  { query: 'ACA health insurance Durham NC', category: 'aca', priority: 4 },
  { query: 'Medicare Part D penalty calculator', category: 'local_decisions', priority: 4 },
  { query: 'Extra Help program North Carolina eligibility', category: 'savings_programs', priority: 4 },
  { query: 'Duke Health Medicare Advantage plans Durham', category: 'county_city', priority: 5 },
  { query: 'lost employer coverage Medicare Special Enrollment NC', category: 'local_decisions', priority: 5 },
];
