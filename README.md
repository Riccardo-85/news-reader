# News Reader

A modern, responsive news reader application built with React, TypeScript, and Express. Browse news articles by category, search for specific topics, and save your favorite articles for later reading.

## Features

- 📰 **Browse by Category** - Access news from 10 different categories including tech, science, business, sports, and more
- 🔍 **Search Functionality** - Search for articles on any topic
- ⭐ **Favorites System** - Save articles to your favorites list (persisted in browser localStorage)
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices
- 🚀 **Optimized Performance** - Intelligent pagination with prefetching for smooth navigation
- 🔒 **Secure API Handling** - Express proxy server keeps API tokens secure and never exposes them to the browser

## Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **CSS** - Custom styling with responsive design

### Backend
- **Express.js** - Proxy server for secure API access
- **Node Fetch** - HTTP client for external API calls
- **CORS** - Cross-origin resource sharing support
- **dotenv** - Environment variable management

### API
- **TheNewsApi** - News data provider

## Project Structure

```
news-reader/
├── web/                    # Frontend React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── lib/           # Utility libraries
│   │   └── App.tsx        # Main application component
│   ├── public/            # Static assets
│   └── package.json
├── server/                # Backend Express proxy
│   ├── server.js         # Express server implementation
│   ├── README.md         # Server-specific documentation
│   └── package.json
└── package.json          # Root package with dev scripts
```

## Getting Started

### Prerequisites

- Node.js >= 16
- npm or yarn
- TheNewsApi API key ([Get one here](https://www.thenewsapi.com/))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Riccardo-85/news-reader.git
   cd news-reader
   ```

2. **Install dependencies**
   ```bash
   npm install
   npm run server:install
   cd web && npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the `server/` directory:
   ```bash
   cd server
   touch .env
   ```
   
   Add your TheNewsApi token:
   ```env
   THENEWSAPI_TOKEN=your_api_token_here
   PORT=5177
   ```

### Running the Application

**Development mode** (recommended):
```bash
npm run dev
```

This starts both the server and web app concurrently:
- Server runs on `http://localhost:5177`
- Web app runs on `http://localhost:5176`

**Run individually**:
```bash
# Start server only
npm run server:dev

# Start web app only (in another terminal)
npm run web:dev
```

### Building for Production

1. **Build the web application**
   ```bash
   cd web
   npm run build
   ```

2. **Start the server**
   ```bash
   cd server
   node server.js
   ```

The server will automatically serve the built frontend from `web/dist/` if it exists.

## API Documentation

The Express server provides a secure proxy to TheNewsApi:

### Endpoints

#### Health Check
```
GET /api/health
```
Returns: `{ status: 'ok' }`

#### Fetch News
```
GET /api/news/all?categories=tech&page=1
GET /api/news/all?search=artificial%20intelligence&page=1
```

**Query Parameters:**
- `categories` - News category (tech, general, science, sports, business, health, entertainment, politics, food, travel)
- `search` - Search query (mutually exclusive with categories)
- `page` - Page number for pagination (default: 1)

**Enforced Defaults:**
- `language=en` - English articles only
- `limit=3` - 3 articles per page
- `published_after` - Last 7 days only

**Error Responses:**
- `429` - Daily request limit reached
- `401/403` - Authentication failed
- `500` - Server error

See [server/README.md](server/README.md) for detailed server documentation.

## Usage

### Browsing News
1. Select a category from the sidebar
2. Navigate through articles using the numbered dots
3. Click "View Full Article" to read the complete story

### Searching
1. Enter a search term in the search box
2. Click "Search" or press Enter
3. Browse through search results

### Managing Favorites
1. Click "Save to Favorites" on any article
2. Access your favorites by clicking the "Favorites" button
3. Remove from favorites by clicking "Saved" on a favorited article

## Configuration

### Server Configuration
Environment variables in `server/.env`:
- `THENEWSAPI_TOKEN` - Your TheNewsApi API token (required)
- `PORT` - Server port (default: 5177)

### Web Configuration
The web app automatically connects to the server at `http://localhost:5177` in development mode. For production, ensure the server URL is correctly configured.

## Development

### Available Scripts

**Root level:**
- `npm run dev` - Start both server and web app concurrently
- `npm run server:dev` - Start server in development mode
- `npm run web:dev` - Start web app in development mode
- `npm run server:install` - Install server dependencies

**Web app (in `web/` directory):**
- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

**Server (in `server/` directory):**
- `npm run dev` - Start Express server

## Security

- API tokens are never exposed to the browser
- All API calls are proxied through the Express server
- Environment variables are used for sensitive configuration
- Logging sanitizes URLs to prevent token leakage

## License

This project is private and proprietary.

## Contributing

Contributions are welcome! Please ensure all changes are well-tested and documented.

## Troubleshooting

### "Server is not configured with THENEWSAPI_TOKEN"
- Ensure you've created `server/.env` with a valid `THENEWSAPI_TOKEN`

### "Daily request limit reached"
- TheNewsApi has daily rate limits on free tiers
- Consider upgrading your API plan or wait for the limit to reset

### CORS errors
- Ensure the server is running on port 5177
- Check that CORS is properly configured in `server/server.js`

### Articles not loading
- Check browser console for errors
- Verify server is running: `http://localhost:5177/api/health`
- Ensure your API token is valid

## Acknowledgments

- News data provided by [TheNewsApi](https://www.thenewsapi.com/)
- Built with React, Vite, and Express
