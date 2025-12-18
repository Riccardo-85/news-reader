import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import HeadlinesList from './components/HeadlinesList';
import type { Article } from './lib/newsapi';
import { fetchAllNews } from './lib/newsapi';

type Mode = { type: 'category'; value: string } | { type: 'search'; value: string };

const CATEGORIES = [
  'tech',
  'general',
  'science',
  'sports',
  'business',
  'health',
  'entertainment',
  'politics',
  'food',
  'travel'
] as const;

const FAVORITES_KEY = 'favorites_v1';

type Cache = Map<number, Article[]>;

export default function App() {
  const [showFilters, setShowFilters] = useState(false); // for mobile
  const [mode, setMode] = useState<Mode>({ type: 'category', value: 'tech' });
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [index, setIndex] = useState(0); // 0..2 within page
  const [cache, setCache] = useState<Cache>(new Map());
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [favoritesView, setFavoritesView] = useState(false);
  const [favorites, setFavorites] = useState<Record<string, Article>>({});
  const [favoritesIndex, setFavoritesIndex] = useState(0);

  const inflight = useRef<Set<string>>(new Set());
  const abortRef = useRef<AbortController | null>(null);
  const prevLiveState = useRef<{ mode: Mode; page: number; index: number; cache: Cache } | null>(null);

  // Load favorites from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(FAVORITES_KEY);
      if (raw) {
        setFavorites(JSON.parse(raw));
      }
    } catch {
      // ignore
    }
  }, []);

  // Persist favorites
  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch {
      // ignore
    }
  }, [favorites]);

  const isFavorite = useCallback(
    (a: Article) => !!favorites[a.url],
    [favorites]
  );

  const toggleFavorite = useCallback((a: Article) => {
    setFavorites((prev) => {
      const next = { ...prev };
      if (next[a.url]) {
        delete next[a.url];
      } else {
        next[a.url] = a;
      }
      return next;
    });
  }, []);

  const cacheKeyBase = useMemo(() => {
    return mode.type === 'search' ? `search:${mode.value.trim()}` : `cat:${mode.value}`;
  }, [mode]);

  const getCached = useCallback((p: number) => cache.get(p) || null, [cache]);

  const setCached = useCallback((p: number, items: Article[]) => {
    setCache((prev) => {
      const next = new Map(prev);
      next.set(p, items);
      return next;
    });
  }, []);

  const clearCache = useCallback(() => {
    setCache(new Map());
  }, []);

  const fetchPage = useCallback(
    async (p: number, { silent = false }: { silent?: boolean } = {}) => {
      const key = `${cacheKeyBase}|p:${p}`;
      if (inflight.current.has(key)) return;
      if (!silent) setPageLoading(true);
      setError(null);

      inflight.current.add(key);
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;

      try {
        const items =
          mode.type === 'search'
            ? await fetchAllNews({ page: p, search: mode.value.trim() }, ac.signal)
            : await fetchAllNews({ page: p, category: mode.value }, ac.signal);

        setCached(p, items);
      } catch (e: any) {
        if (e?.name !== 'AbortError') {
          setError(e?.message || 'Failed to fetch results.');
        }
      } finally {
        inflight.current.delete(key);
        if (!silent) setPageLoading(false);
      }
    },
    [cacheKeyBase, mode, setCached]
  );

  // Load initial (or on mode changes)
  useEffect(() => {
    setLoading(true);
    setError(null);
    setPage(1);
    setIndex(0);
    clearCache();

    fetchPage(1)
      .finally(() => setLoading(false));
  }, [cacheKeyBase]); // cacheKeyBase changes when mode changes

  const items = getCached(page);
  const currentArticle = items ? items[index] || null : null;

  // Prefetch next/prev page based on in-page index
  useEffect(() => {
    if (favoritesView) return;
    if (!items) return;

    // Prefetch next when at index 1 (2nd article)
    if (index === 1) {
      if (!getCached(page + 1)) {
        fetchPage(page + 1, { silent: true });
      }
    }
    // Prefetch prev when at index 0 and page > 1
    if (index === 0 && page > 1) {
      if (!getCached(page - 1)) {
        fetchPage(page - 1, { silent: true });
      }
    }
  }, [index, page, items, favoritesView, getCached, fetchPage]);

  const absoluteNumbers: [number, number, number] = useMemo(() => {
    if (favoritesView) {
      return [favoritesIndex + 1, favoritesIndex + 2, favoritesIndex + 3];
    }
    const start = (page - 1) * 3 + 1;
    return [start, start + 1, start + 2];
  }, [page, favoritesView, favoritesIndex]);

  // Navigation is handled via dots/clicks; previous arrow handlers removed.

  const onDotClick = useCallback((i: number) => {
    if (favoritesView) {
      setFavoritesIndex(i);
    } else {
      setIndex(i);
    }
  }, [favoritesView]);

  // Favorites view toggle should not break navigation.
  const enterFavorites = useCallback(() => {
    if (favoritesView) return;
    prevLiveState.current = { mode, page, index, cache };
    setFavoritesIndex(0); // reset to first favorite
    setFavoritesView(true);
    setLoading(false);
    setPageLoading(false);
    setError(null);
  }, [favoritesView, mode, page, index, cache]);

  const exitFavorites = useCallback(() => {
    if (!prevLiveState.current) {
      setFavoritesView(false);
      return;
    }
    const { mode: m, page: p, index: i, cache: c } = prevLiveState.current;
    setFavoritesView(false);
    setMode(m);
    setPage(p);
    setIndex(i);
    setCache(c);
    prevLiveState.current = null;
  }, []);

  const favoritesArray = useMemo(() => Object.values(favorites), [favorites]);
  const favoriteArticle = useMemo(() => favoritesArray[favoritesIndex] || null, [favoritesArray, favoritesIndex]);

  // Apply search-vs-category rule when submitting search
  const onSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const val = searchInput.trim();
      if (val) {
        setMode({ type: 'search', value: val });
      } else {
        // Revert to category mode (keep current category)
        if (mode.type === 'search') {
          setMode({ type: 'category', value: 'tech' });
        }
      }
    },
    [searchInput, mode.type]
  );

  const onCategorySelect = useCallback((cat: string) => {
    setSearchInput(''); // clear search input
    setMode({ type: 'category', value: cat });
  }, []);

  const currentArticleToShow = favoritesView ? favoriteArticle : currentArticle;
  const isLoading = loading || (!items && !favoritesView) || pageLoading;

  return (
    <div className="app">
      <aside className="sidebar" role="complementary" aria-label="Filters and favorites">
        <div className="sidebar-inner">
          <h1 className="brand">News Reader</h1>

          <form className="search" onSubmit={onSearchSubmit} role="search" aria-label="Search news">
            <input
              type="text"
              placeholder="Search articles..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              aria-label="Search input"
            />
            <button type="submit" className="btn">Search</button>
          </form>

          <div className="categories" role="navigation" aria-label="Categories">
            <h3>Categories</h3>
            <div className="category-list">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  className={`chip-btn ${!favoritesView && mode.type === 'category' && mode.value === c ? 'active' : ''}`}
                  onClick={() => onCategorySelect(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="spacer" />

          <button
            className={`fav-toggle ${favoritesView ? 'on' : ''}`}
            onClick={() => (favoritesView ? exitFavorites() : enterFavorites())}
          >
            {favoritesView ? 'Back to Live' : 'Favorites'}
          </button>

          <button
            className="filters-toggle"
            onClick={() => setShowFilters((s) => !s)}
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>
      </aside>

      <main className={`main ${showFilters ? 'filters-open' : ''}`} role="main">
        {error && (
          <div className="error" role="alert">
            {error}
          </div>
        )}
        <HeadlinesList
          article={currentArticleToShow}
          absoluteIndexNumbers={absoluteNumbers}
          currentIndex={favoritesView ? favoritesIndex : index}
          onDotClick={onDotClick}
          isFavorite={isFavorite}
          onToggleFavorite={toggleFavorite}
          isLoading={isLoading}
          isFavoritesView={favoritesView}
          totalFavorites={favoritesArray.length}
        />
        {!favoritesView && (
          <div className="debug">
            <small>
              Mode: {mode.type === 'search' ? `search "${mode.value}"` : `category "${mode.value}"`} · Page {page} · Index {index + 1}
            </small>
          </div>
        )}
      </main>
    </div>
  );
}
