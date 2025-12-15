import type { Article } from '@/lib/newsapi';

type Props = {
  article: Article | null;
  absoluteIndexNumbers: [number, number, number];
  currentIndex: number; // 0..2 within current page
  onPrev: () => void;
  onNext: () => void;
  onFirstPage: () => void;
  onDotClick: (i: number) => void;
  isFavorite: (a: Article) => boolean;
  onToggleFavorite: (a: Article) => void;
  isLoading: boolean;
  isFavoritesView: boolean;
};

export default function HeadlinesList({
  article,
  absoluteIndexNumbers,
  currentIndex,
  onPrev,
  onNext,
  onFirstPage,
  onDotClick,
  isFavorite,
  onToggleFavorite,
  isLoading,
  isFavoritesView
}: Props) {
  return (
    <div className="content-area">
      {isLoading ? (
        <div className="card skeleton" role="status" aria-busy="true" aria-live="polite">
          <div className="image shimmer" />
          <div className="overlay">
            <div className="lines">
              <div className="line shimmer" />
              <div className="line shimmer" />
              <div className="line shimmer" />
            </div>
          </div>
        </div>
      ) : !article ? (
        <div className="card empty">
          <div className="overlay">
            <h2>{isFavoritesView ? 'No favorites yet' : 'No results'}</h2>
            {!isFavoritesView && <p>Try a different category or search.</p>}
          </div>
        </div>
      ) : (
        <article className="card" aria-label={article.title}>
          <img
            className="image"
            src={article.image_url || '/placeholder.png'}
            alt={article.title || 'News image'}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/placeholder.png';
            }}
          />
          <div className="overlay">
            <div className="meta">
              {article.source && <span className="chip">{article.source}</span>}
              {article.published_at && (
                <time className="chip" dateTime={article.published_at}>
                  {new Date(article.published_at).toLocaleString()}
                </time>
              )}
            </div>
            <h2 className="title">{article.title}</h2>
            {article.description && <p className="desc">{article.description}</p>}
            <div className="actions">
              <a
                className="cta"
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Full Article
              </a>
              <button
                className={`fav ${isFavorite(article) ? 'on' : ''}`}
                onClick={() => onToggleFavorite(article)}
                aria-pressed={isFavorite(article)}
              >
                {isFavorite(article) ? 'Saved' : 'Save to Favorites'}
              </button>
            </div>
          </div>
          <nav className="pager" aria-label="Article pagination">
            <button className="pager-btn" onClick={onFirstPage} title="First page">
              «
            </button>
            <button className="pager-btn" onClick={onPrev} title="Previous">
              ‹
            </button>
            <div className="dots">
              {absoluteIndexNumbers.map((num, i) => (
                <button
                  key={num}
                  className={`dot ${i === currentIndex ? 'active' : ''}`}
                  onClick={() => onDotClick(i)}
                  aria-current={i === currentIndex ? 'true' : 'false'}
                  title={`Article ${num}`}
                >
                  {num}
                </button>
              ))}
            </div>
            <button className="pager-btn" onClick={onNext} title="Next">
              ›
            </button>
          </nav>
        </article>
      )}
    </div>
  );
}
