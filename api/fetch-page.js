const handler = async (req, res) => {
  const { url, key } = req.query;
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (key !== 'ghcc_rob_2026_persist' && key !== 'ghcc_template') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  // Allow generationhealth.me AND raw.githubusercontent.com (for template fetching)
  if (!url || !(url.startsWith('https://generationhealth.me') || url.startsWith('https://raw.githubusercontent.com/robert9907/'))) {
    return res.status(400).json({ error: 'Invalid URL' });
  }
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Cache-Control': 'no-cache',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!response.ok) {
      return res.status(502).json({ error: 'Upstream returned HTTP ' + response.status });
    }
    const html = await response.text();
    if (!html || html.length < 500) {
      return res.status(502).json({ error: 'Empty response from upstream' });
    }
    if (html.length > 4000000) {
      return res.status(502).json({ error: 'Page too large (' + Math.round(html.length / 1024) + 'KB)' });
    }
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(200).json({ html });
  } catch (error) {
    const msg = error.name === 'AbortError'
      ? 'Request too slow (>8s) — try again'
      : (error.message || 'Fetch failed');
    return res.status(502).json({ error: msg });
  }
};
module.exports = handler;
module.exports.config = {
  maxDuration: 60,
};
