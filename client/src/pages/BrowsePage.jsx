import { useState } from 'react';
import { useArchives } from '../hooks/useArchives.js';
import ResultCard from '../components/ResultCard.jsx';

export default function BrowsePage() {
  const {
    archives,
    total,
    page,
    setPage,
    loading,
    error,
    submitUrl,
    deleteArchive,
    refresh,
  } = useArchives();

  const [url, setUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState(null);

  const totalPages = Math.ceil(total / 20);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;

    setSubmitting(true);
    setSubmitMessage(null);

    try {
      const data = await submitUrl(url.trim());
      setSubmitMessage({
        type: data.duplicate ? 'info' : 'success',
        text: data.duplicate
          ? 'This page was already archived!'
          : 'Page queued for archiving!',
      });
      setUrl('');
      refresh();
    } catch (err) {
      setSubmitMessage({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
      // Clear message after 4s
      setTimeout(() => setSubmitMessage(null), 4000);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this archive? This cannot be undone.')) {
      try {
        await deleteArchive(id);
      } catch {
        // Error handled in hook
      }
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Browse Archive</h2>
        <p className="page-subtitle">
          {total} page{total !== 1 ? 's' : ''} archived
        </p>
      </div>

      {/* Archive URL input */}
      <form className="archive-input-bar" onSubmit={handleSubmit}>
        <input
          type="url"
          placeholder="Paste a URL to archive…"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          id="archive-url-input"
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={submitting || !url.trim()}
          id="archive-submit-btn"
        >
          {submitting ? '⏳ Archiving…' : '📥 Archive'}
        </button>
      </form>

      {/* Submit feedback */}
      {submitMessage && (
        <div
          className={`toast ${submitMessage.type}`}
          style={{
            position: 'relative',
            marginBottom: 'var(--space-6)',
            bottom: 'auto',
            right: 'auto',
          }}
        >
          {submitMessage.type === 'success' && '✅ '}
          {submitMessage.type === 'error' && '❌ '}
          {submitMessage.type === 'info' && 'ℹ️ '}
          {submitMessage.text}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="card" style={{ borderLeftColor: 'var(--color-error)', borderLeftWidth: '3px', marginBottom: 'var(--space-6)' }}>
          <p style={{ color: 'var(--color-error)' }}>⚠️ {error}</p>
          <button className="btn btn-ghost btn-sm" onClick={refresh} style={{ marginTop: 'var(--space-3)' }}>
            Retry
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      )}

      {/* Archive list */}
      {!loading && archives.length > 0 && (
        <div className="results-list">
          {archives.map((archive) => (
            <ResultCard
              key={archive.id}
              result={archive}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && archives.length === 0 && !error && (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No pages archived yet</h3>
          <p>
            Paste a URL above to archive your first webpage, or install the
            browser extension to capture pages automatically.
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
    </div>
  );
}
