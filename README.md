# News Reader

A modern, responsive news aggregation app built with React + Vite. Browse news articles by category or search, save favorites, and enjoy a clean, intuitive UI.

**Live Demo:** https://news-reader-henna.vercel.app

## Features

✨ **Core Functionality**
- Browse news articles by category (tech, general, science, sports, business, health, entertainment, politics, food, travel)
- Search for articles by keyword
- Paginate through results (3 articles per page)
- Smart prefetch: automatically loads next/previous pages for seamless browsing

💾 **Favorites System**
- Save unlimited articles to favorites (stored in browser localStorage)
- Browse saved articles separately
- Persistent across sessions

🎨 **UI/UX**
- Responsive design (mobile, tablet, desktop)
- Clean, dark theme with accent colors
- Keyboard accessible (Tab navigation, focus states)
- Snoopy favicon 🐕

🔒 **Security**
- API token stored server-side (never exposed to client)
- Server validates and enforces request parameters
- CORS enabled for cross-origin requests

⚡ **Performance**
- Client-side caching of fetched pages
- Optimized bundle with Vite
- Search results sorted by recency (last 7 days)

## Tech Stack

### Frontend
- **React** 18+ with TypeScript
- **Vite** for fast builds and dev experience
- **CSS3** (custom styling, no frameworks)

### Backend / Deployment
- **Vercel Functions** (serverless) for API proxy
- **Express.js** (local dev)
- **Node.js** 18+

### Data Source
- **TheNewsAPI** (https://www.thenewsapi.com)

## Project Structure

```
news-reader/
├── web/                          # Frontend (React + Vite)
│   ├── src/
│   │   ├── App.tsx              # Main app component
│   │   ├── components/
│   │   │   └── HeadlinesList.tsx # Article display & pager
│   │   ├── lib/
│   │   │   └── newsapi.ts       # API client
│   │   ├── styles.css           # App styling
│   │   └── env.d.ts             # Vite env types
│   ├── index.html               # HTML entry point
│   ├── public/                  # Static assets (favicon, etc)
│   ├── vite.config.ts           # Vite config
│   └── tsconfig.json            # TypeScript config
├── server/                       # Backend (Express)
│   ├── server.js                # Express proxy server
│   ├── .env.example             # Example env vars
│   └── package.json             # Dependencies
├── api/                         # Vercel Functions (production)
│   ├── health.js                # Health check endpoint
│   └── news.js                  # News proxy endpoint
├── vercel.json                  # Vercel deployment config
└── README.md                    # This file
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- TheNewsAPI token (get one free at https://www.thenewsapi.com)

### Local Development

1. **Clone the repo**
   ```bash
   git clone https://github.com/Riccardo-85/news-reader.git
   cd news-reader
   ```

2. **Setup backend**
   ```bash
   cd server
   cp .env.example .env
   # Edit .env and add your THENEWSAPI_TOKEN
   npm install
   npm run dev    # Starts on http://localhost:5177
   ```

3. **Setup frontend (in another terminal)**
   ```bash
   cd web
   npm install
   npm run dev    # Starts on http://localhost:5176
   ```

4. **Open browser**
   - Dev mode: http://localhost:5176
   - Proxy (production-like): http://localhost:5177

### Build for Production

```bash
npm --prefix web run build
# Output: web/dist/
```

## Environment Variables

### Server (.env)
```
THENEWSAPI_TOKEN=your_api_token_here
PORT=5000
```

### Frontend (Vercel)
No environment variables needed for production (API URLs are relative).

For custom API base URL in production:
```
VITE_API_BASE_URL=https://your-api-url.com
```

## API Endpoints

### Health Check
```
GET /api/health
Response: { "status": "ok" }
```

### News Articles
```
GET /api/news?page=1&categories=tech&limit=3
GET /api/news?page=1&search=AI&limit=3

Query Parameters:
- page: Pagination (default: 1)
- categories: Category filter (tech, general, science, sports, business, health, entertainment, politics, food, travel)
- search: Search by keyword (mutually exclusive with categories)
- limit: Results per page (enforced to 3)
- language: ISO language code (enforced to 'en')
- sort: Sorting (enforced to 'published_at')
- published_after: Date filter (enforced to last 7 days)
```

Response:
```json
{
  "meta": {
    "found": 1234,
    "returned": 3,
    "limit": 3,
    "page": 1
  },
  "data": [
    {
      "uuid": "...",
      "title": "Article Title",
      "description": "...",
      "url": "https://example.com/article",
      "image_url": "https://...",
      "source": "source-name",
      "published_at": "2025-12-18T...",
      "categories": ["tech"]
    },
    ...
  ]
}
```

## Deployment

### Vercel (Production)

The app is configured to deploy automatically from GitHub to Vercel.

1. **Ensure `THENEWSAPI_TOKEN` is set in Vercel Environment Variables**
   - Dashboard → Settings → Environment Variables
   - Add: `THENEWSAPI_TOKEN` = your token (Production scope)

2. **Push to GitHub**
   ```bash
   git push origin master
   ```

3. **Manual redeploy**
   ```bash
   vercel --prod
   ```

**Live URL:** https://news-reader-henna.vercel.app

## Usage Guide

### Browsing by Category
1. Click on a category chip (tech, general, science, etc.)
2. Articles load for that category
3. Click dots at the bottom to navigate pages
4. Use "Save to Favorites" to bookmark articles

### Searching
1. Type in the search box
2. Click "Search" button
3. Results show articles matching your keyword (from the last 7 days)
4. Category selection is disabled during search

### Managing Favorites
1. Click "Save to Favorites" on any article
2. Switch to "Favorites" view to browse saved articles
3. Articles are stored in browser localStorage
4. Favorites persist across sessions and devices (same browser)

### Keyboard Navigation
- **Tab**: Move through interactive elements
- **Enter/Space**: Click buttons
- **Focus outline**: Blue outline appears on focused elements

## Known Limitations

- **Favorites storage**: Limited to browser localStorage (not synced across devices)
- **Article limit**: 3 articles per page (enforced by server)
- **Search scope**: Only searches articles from the last 7 days
- **Category exclusivity**: Search and category filters are mutually exclusive (search takes priority)

## Future Enhancements

- [ ] User authentication (sync favorites across devices)
- [ ] Dark/Light theme toggle
- [ ] Save articles to file/PDF
- [ ] Share articles on social media
- [ ] Advanced filters (date range, source, etc.)
- [ ] Comment/note system on saved articles
- [ ] Mobile app (React Native)

## Troubleshooting

**API Token Invalid**
- Check that `THENEWSAPI_TOKEN` is correctly set in server `.env` or Vercel Environment Variables
- Verify token at https://www.thenewsapi.com

**No articles loading**
- Check browser console (F12) for error messages
- Verify API endpoint is reachable: `curl http://localhost:5177/api/health`
- Ensure API token is valid

**Favorites not persisting**
- Check browser localStorage is enabled
- Try incognito/private mode (different storage)
- Clear site data and reload

**Port already in use**
```bash
# Kill process on port 5177
lsof -ti :5177 | xargs kill -9

# Restart
npm run dev
```

## Contributing

Feel free to submit issues, fork the repo, and create pull requests for any improvements!

## License

MIT

---

Made with ❤️ by Riccardo
