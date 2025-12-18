export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const TOKEN = process.env.THENEWSAPI_TOKEN;
    if (!TOKEN) {
      return res.status(500).json({ error: 'Server is not configured with THENEWSAPI_TOKEN.' });
    }

    const incoming = req.query || {};
    const THENEWSAPI_BASE = 'https://api.thenewsapi.com/v1/news/all';

    // Enforce required params
    const params = new URLSearchParams();
    params.set('language', 'en');
    params.set('limit', '3');
    params.set('sort', 'published_at');

    // Filter to articles from last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const publishedAfter = sevenDaysAgo.toISOString().split('T')[0]; // YYYY-MM-DD
    params.set('published_after', publishedAfter);

    // Pagination
    const page = Number(incoming.page || '1');
    if (Number.isFinite(page) && page > 0) {
      params.set('page', String(page));
    }

    // Search vs Category rule
    const search = (incoming.search || '').toString().trim();
    const categories = (incoming.categories || '').toString().trim();

    if (search) {
      params.set('search', search);
      params.delete('categories');
    } else {
      params.set('categories', categories || 'tech');
      params.delete('search');
    }

    // Append token
    const authParams = new URLSearchParams(params.toString());
    authParams.set('api_token', TOKEN);

    const upstreamUrl = `${THENEWSAPI_BASE}?${authParams.toString()}`;

    // Log only sanitized URL (no token)
    const sanitized = new URL(`${THENEWSAPI_BASE}?${params.toString()}`);
    console.log(`[proxy] GET ${sanitized.toString()}`);

    const upstreamRes = await fetch(upstreamUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    const raw = await upstreamRes.text();

    // Map known errors
    if (upstreamRes.status === 429) {
      return res.status(429).json({ error: 'Daily request limit reached. Please try again later.' });
    }
    if (upstreamRes.status === 401 || upstreamRes.status === 403) {
      return res.status(upstreamRes.status).json({ error: 'TheNewsApi authentication failed. Check your server configuration.' });
    }

    const contentType = upstreamRes.headers.get('content-type') || '';
    if (!upstreamRes.ok) {
      return res.status(upstreamRes.status).json({ error: `Upstream error: ${raw || upstreamRes.statusText}` });
    }

    // If JSON, parse and forward
    if (contentType.includes('application/json')) {
      let data;
      try {
        data = JSON.parse(raw || '{}');
      } catch (e) {
        return res.status(502).json({ error: 'Invalid JSON from upstream.' });
      }
      res.setHeader('Cache-Control', 'no-store');
      return res.json(data);
    }

    // Otherwise forward raw text/binary
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Type', contentType || 'application/octet-stream');
    return res.send(raw);
  } catch (err) {
    console.error('[proxy] Error:', err && err.message ? err.message : err);
    return res.status(500).json({ error: 'Unexpected server error.' });
  }
}
