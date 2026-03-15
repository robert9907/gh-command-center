module.exports = async (req, res) => {
  const { url, key } = req.query;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (key !== 'ghcc_rob_2026_persist') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!url || !url.startsWith('https://generationhealth.me')) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Cache-Control': 'no-cache',
      },
      signal: AbortSignal.timeout(25000),
    });

    if (!response.ok) {
      return res.status(502).json({ error: `HTTP ${response.status}` });
    }

    const html = await response.text();

    if (!html || html.length < 500) {
      return res.status(502).json({ error: 'Empty response' });
    }

    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ html });
  } catch (error) {
    return res.status(502).json({ error: error.message || 'Fetch failed' });
  }
};
