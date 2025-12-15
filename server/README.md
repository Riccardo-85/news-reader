# News Reader Proxy

Express proxy that securely calls TheNewsApi `/v1/news/all` endpoint without exposing tokens to the browser.

## Endpoints
- `GET /api/health` → `{ status: 'ok' }`
- `GET /api/news/all` → Proxies to `https://api.thenewsapi.com/v1/news/all` with enforced defaults:
  - `language=en`
  - `limit=3`
  - one of: `categories` or `search`
  - supports `page`

Errors are mapped:
- `429` → "Daily request limit reached…"
- `401/403` → "TheNewsApi authentication failed…"
- Other 5xx → generic message

Server logs never print the raw token. It logs a sanitized upstream URL without `api_token`.

## Env
Create `server/.env`:

THENEWSAPI_TOKEN=YOUR_TOKEN
PORT=5177
