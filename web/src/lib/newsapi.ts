export type Article = {
  id: string;
  title: string;
  description: string | null;
  url: string;
  image_url: string | null;
  source: string | null;
  published_at: string | null;
};

export type NewsResponse = {
  data: Article[];
  meta?: unknown;
};

export type FetchParams =
  | { page: number; search: string; category?: never }
  | { page: number; category: string; search?: never };

const toArticle = (raw: any): Article => {
  const id =
    (raw && (raw.uuid || raw.id || raw.url)) ||
    `${raw?.source || 'news'}-${raw?.title || Math.random()}`;
  return {
    id: String(id),
    title: String(raw?.title || 'Untitled'),
    description: raw?.description ?? null,
    url: String(raw?.url || '#'),
    image_url: raw?.image_url ?? null,
    source: raw?.source ?? null,
    published_at: raw?.published_at ?? null
  };
};

// Client logs proxied URL (no token)
export async function fetchAllNews(params: FetchParams, signal?: AbortSignal): Promise<Article[]> {
  const q = new URLSearchParams();
  q.set('language', 'en');
  q.set('limit', '3');
  q.set('page', String(params.page));

  if ('search' in params && params.search !== undefined && params.search.trim()) {
    q.set('search', params.search.trim());
  } else if ('category' in params && params.category) {
    q.set('categories', params.category);
  }

  const url = `/api/news/all?${q.toString()}`;
  console.debug('[client] GET', url);

  const res = await fetch(url, { signal });
  if (res.status === 429) {
    throw new Error('Daily request limit reached. Please try again later.');
  }
  if (res.status === 401 || res.status === 403) {
    throw new Error('TheNewsApi authentication failed. Check your server token.');
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Failed to fetch news.');
  }
  const json = (await res.json()) as NewsResponse;
  const items = Array.isArray(json.data) ? json.data.map(toArticle) : [];
  return items;
}
