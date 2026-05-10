import { useSearch } from '../hooks/useSearch.js';
import SearchBar from '../components/SearchBar.jsx';
import ResultCard from '../components/ResultCard.jsx';

export default function SearchPage() {
  const {
    query,
    setQuery,
    results,
    total,
    page,
    setPage,
    loading,
    error,
    processingTime,
  } = useSearch(350);

  const totalPages = Math.ceil(total / 20);

  return (
    <div>
      {/* Hero section when no query */}
      {!query.trim() && (
        <div className="search-hero">
          <h2>Search Your Archive</h2>
          <p>
            Find anything across all your saved webpages with full-text search
          </p>
        </div>
      )}

      {/* Search bar */}
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Search by keyword, URL, or content…"
          autoFocus
        />
      </div>

      {/* Results area */}
      {query.trim() && (
        <>
          {/* Results header */}
          <div className="search-results-header">
            <span className="search-results-count">
              {loading ? (
                'Searching…'
              ) : (
                <>
                  <strong>{total}</strong> result{total !== 1 ? 's' : ''} found
                </>
              )}
            </span>
            {processingTime !== null && !loading && (
              <span className="search-time">{processingTime}ms</span>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="card" style={{ borderLeftColor: 'var(--color-error)', borderLeftWidth: '3px' }}>
              <p style={{ color: 'var(--color-error)' }}>⚠️ {error}</p>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
          )}

          {/* Results list */}
          {!loading && results.length > 0 && (
            <div className="results-list">
              {results.map((result) => (
                <ResultCard key={result.id} result={result} />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && results.length === 0 && query.trim() && (
            <div className="empty-state">
              <div className="empty-icon">🔎</div>
              <h3>No results found</h3>
              <p>
                Try different keywords or check if the page has been archived
                yet.
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && !loading && (
            <div className="pagination">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                aria-label="Previous page"
              >
                ‹
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const p = i + 1;
                return (
                  <button
                    key={p}
                    className={p === page ? 'active' : ''}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                aria-label="Next page"
              >
                ›
              </button>
            </div>
          )}
        </>
      )}

      {/* Hint when no query */}
      {!query.trim() && !loading && (
        <div className="empty-state">
          <div className="empty-icon">💡</div>
          <h3>Start typing to search</h3>
          <p>
            Press <kbd style={{ 
              padding: '2px 6px', 
              background: 'var(--color-bg-tertiary)', 
              borderRadius: '4px',
              border: '1px solid var(--color-border)',
              fontSize: 'var(--font-size-sm)'
            }}>/</kbd> to focus the search bar
          </p>
        </div>
      )}
    </div>
  );
}
