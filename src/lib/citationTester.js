const GH_SIGNALS = {
  domains: ['generationhealth.me'],
  brands: ['generationhealth.me','generation health','generationhealth'],
  people: ['rob simm','robert simm'],
  phoneDigits: '8287613326',
};

export const COMPETITORS = [
  { name:'eHealth', patterns:['ehealth','ehealthinsurance'] },
  { name:'Medicare.gov', patterns:['medicare.gov'] },
  { name:'SHIP', patterns:['ship program','state health insurance assistance'] },
  { name:'GoHealth', patterns:['gohealth'] },
  { name:'SelectQuote', patterns:['selectquote','select quote'] },
  { name:'Boomer Benefits', patterns:['boomer benefits'] },
  { name:'AARP', patterns:['aarp'] },
  { name:'NerdWallet', patterns:['nerdwallet'] },
  { name:'Humana', patterns:['humana.com'] },
  { name:'UnitedHealthcare', patterns:['uhc.com','unitedhealthcare.com'] },
];

export function detectCitation(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  for (const d of GH_SIGNALS.domains) if (lower.includes(d)) return true;
  for (const b of GH_SIGNALS.brands) if (lower.includes(b)) return true;
  for (const p of GH_SIGNALS.people) if (lower.includes(p)) return true;
  if (text.replace(/\D/g,'').includes(GH_SIGNALS.phoneDigits)) return true;
  return false;
}

export function detectCompetitors(text) {
  if (!text) return [];
  const lower = text.toLowerCase();
  const found = new Set();
  for (const c of COMPETITORS)
    for (const p of c.patterns)
      if (lower.includes(p)) { found.add(c.name); break; }
  return Array.from(found);
}

const SYSTEM_PROMPT =
  'You are a helpful assistant answering a Medicare-related question for a consumer. ' +
  'Provide a clear, useful answer. When you reference specific sources, brokers, websites, ' +
  'or organizations, name them explicitly so the user can follow up.';

async function callClaude(query, apiKey) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: query }],
    }),
  });
  if (!res.ok) throw new Error('Claude API ' + res.status);
  const data = await res.json();
  return Array.isArray(data.content)
    ? data.content.filter(b => b.type === 'text').map(b => b.text).join('\n') : '';
}

async function callChatGPT(query, apiKey) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
    body: JSON.stringify({
      model: 'gpt-4o', max_tokens: 1024,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: query },
      ],
    }),
  });
  if (!res.ok) throw new Error('OpenAI API ' + res.status);
  const data = await res.json();
  return data?.choices?.[0]?.message?.content || '';
}

async function callPerplexity(query, apiKey) {
  const res = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
    body: JSON.stringify({
      model: 'llama-3.1-sonar-large-128k-online', max_tokens: 1024,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: query },
      ],
    }),
  });
  if (!res.ok) throw new Error('Perplexity API ' + res.status);
  const data = await res.json();
  const message = data?.choices?.[0]?.message?.content || '';
  const citations = Array.isArray(data.citations) ? data.citations : [];
  return citations.length ? message + '\n\nCitations:\n' + citations.join('\n') : message;
}

async function callGemini(query, apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ role: 'user', parts: [{ text: query }] }],
      generationConfig: { maxOutputTokens: 1024 },
    }),
  });
  if (!res.ok) throw new Error('Gemini API ' + res.status);
  const data = await res.json();
  const parts = data?.candidates?.[0]?.content?.parts || [];
  return parts.map(p => p.text || '').join('\n');
}

export async function testSingleQuery(query, apiKeys) {
  const mk = (provider, call) =>
    apiKeys[provider]
      ? call(query, apiKeys[provider])
          .then(text => ({ provider, text }))
          .catch(e => ({ provider, text: null, error: String(e) }))
      : Promise.resolve({ provider, text: null, error: 'no api key' });

  const results = await Promise.all([
    mk('claude', callClaude),
    mk('chatgpt', callChatGPT),
    mk('perplexity', callPerplexity),
    mk('gemini', callGemini),
  ]);

  const status = { claude: null, chatgpt: null, perplexity: null, gemini: null };
  const compSet = new Set();

  for (const r of results) {
    if (r.text === null) continue;
    status[r.provider] = detectCitation(r.text);
    for (const c of detectCompetitors(r.text)) compSet.add(c);
  }

  return { status, competitors: Array.from(compSet) };
}

const DELAY_BETWEEN_QUERIES_MS = 1500;

export async function batchTestWithProgress(queries, apiKeys, onProgress) {
  const updated = [];
  for (let i = 0; i < queries.length; i++) {
    const candidate = queries[i];
    let next;
    try {
      const { status, competitors } = await testSingleQuery(candidate.query, apiKeys);
      const merged = Array.from(new Set([...(candidate.competitors||[]), ...competitors]));
      next = { ...candidate, citationStatus: status, competitors: merged, lastTested: new Date().toISOString() };
    } catch (err) {
      console.error('[citationTester]', err);
      next = { ...candidate, citationStatus: { claude:null, chatgpt:null, perplexity:null, gemini:null }, lastTested: new Date().toISOString() };
    }
    updated.push(next);
    try { onProgress && onProgress(i + 1, queries.length, candidate.query); } catch {}
    if (i < queries.length - 1)
      await new Promise(r => setTimeout(r, DELAY_BETWEEN_QUERIES_MS));
  }
  return updated;
}
