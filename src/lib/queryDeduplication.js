const STOP_WORDS = new Set([
  'a','an','the','of','for','in','on','at','to','and','or','with','my','your',
  'me','i','is','are','do','does','can','how','what','when','where','which','who',
]);

const PLURAL_MAP = {
  'brokers':'broker','agents':'agent','plans':'plan','advisors':'advisor',
};

export function normalizeQuery(query) {
  if (!query) return '';
  let s = query.toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ').trim();
  const tokens = s.split(' ')
    .filter(t => t && !STOP_WORDS.has(t))
    .map(t => PLURAL_MAP[t] || t);
  return tokens.sort().join(' ');
}

function pickWinner(a, b) {
  const score = (q) => {
    let s = 0;
    if (q.source === 'seed_expansion') s += 100;
    else if (q.source === 'reddit') s += 80;
    else if (q.source === 'medicare_gov' || q.source === 'ehealth') s += 70;
    else s += 50;
    s += (q.intentScore || 0) * 5;
    s += Math.min((q.upvotes || 0), 50);
    return s;
  };
  return score(a) >= score(b) ? a : b;
}

function mergeMetadata(winner, loser) {
  const competitors = Array.from(new Set([...(winner.competitors||[]), ...(loser.competitors||[])]));
  const upvotes = (winner.upvotes || 0) + (loser.upvotes || 0);
  return { ...winner, competitors, ...(upvotes ? { upvotes } : {}) };
}

export function deduplicateQueries(queries) {
  const groups = new Map();
  const order = [];
  for (const q of queries) {
    const key = normalizeQuery(q.query);
    if (!key) continue;
    const existing = groups.get(key);
    if (!existing) { groups.set(key, q); order.push(key); }
    else {
      const winner = pickWinner(existing, q);
      const loser = winner === existing ? q : existing;
      groups.set(key, mergeMetadata(winner, loser));
    }
  }
  return order.map(k => groups.get(k));
}
