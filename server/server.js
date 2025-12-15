/* eslint-disable no-console */
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 5177;
const THENEWSAPI_BASE = 'https://api.thenewsapi.com/v1/news/all';
const TOKEN = process.env.THENEWSAPI_TOKEN;

app.disable('x-powered-by');
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Proxy: /api/news/all
app.get('/api/news/all', async (req, res) => {
  try {
    if (!TOKEN) {
      return res.status(500).json({ error: 'Server is not configured with THENEWSAPI_TOKEN.' });
    }

    const incoming = req.query || {};

    // Enforce required params
    const params = new URLSearchParams();
    params.set('language', 'en');
    params.set('limit', '3');

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
      // Ensure no categories when search is present
      params.delete('categories');
    } else {
      // Default category = tech
      params.set('categories', categories || 'tech');
      // Ensure no search when categories is used
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

    // Map known errors
    if (upstreamRes.status === 429) {
      return res.status(429).json({ error: 'Daily request limit reached. Please try again later.' });
    }
    if (upstreamRes.status === 401 || upstreamRes.status === 403) {
      return res.status(upstreamRes.status).json({ error: 'TheNewsApi authentication failed. Check your server configuration.' });
    }

    const contentType = upstreamRes.headers.get('content-type') || '';
    if (!upstreamRes.ok) {
      const text = await upstreamRes.text();
      return res.status(upstreamRes.status).json({ error: `Upstream error: ${text || upstreamRes.statusText}` });
    }

    if (contentType.includes('application/json')) {
      const data = await upstreamRes.json();
      // Avoid caching on proxy, client manages cache
      res.set('Cache-Control', 'no-store');
      return res.json(data);
    } else {
      // Unexpected content type
      const buf = await upstreamRes.buffer();
      res.set('Cache-Control', 'no-store');
      res.set('Content-Type', contentType || 'application/octet-stream');
      return res.send(buf);
    }
  } catch (err) {
    console.error('[proxy] Error:', err && err.message ? err.message : err);
    return res.status(500).json({ error: 'Unexpected server error.' });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server listening on http://localhost:${PORT}`);
});
